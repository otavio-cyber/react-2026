import { createSign } from "crypto"

/**
 * Escrita direta na planilha pela API do Google Sheets.
 *
 * POR QUE ISSO EXISTE: o Apps Script não responde na mesma conexão. O `/exec`
 * devolve 302 para um endereço descartável em script.googleusercontent.com, e
 * esse segundo passo some — medido em 22/09: HTTP 404 depois de ~60 segundos,
 * em 10% das chamadas em repouso e até 40% sob concorrência. A linha entrava
 * na planilha e o comprovante se perdia; foi o que o Diego Mendes e a Maria
 * Eduarda Vizin viram.
 *
 * A API do Sheets não tem esse desenho. É uma chamada HTTPS comum, resposta na
 * mesma conexão, código de status de verdade. Medido com a mesma conta de
 * serviço que esta rota usa: token em 270ms, leitura em 210ms.
 *
 * SEM BIBLIOTECA: o JWT é assinado com o `crypto` do Node e trocado por um
 * token no endpoint padrão do Google. Não vale a pena arrastar a googleapis
 * inteira para fazer dois fetch.
 *
 * PRIVILÉGIO: a conta de serviço não tem papel nenhum no projeto do Google
 * Cloud. O acesso vem de a planilha ter sido compartilhada com o e-mail dela.
 * Se a chave vazar, o estrago se limita a esta planilha.
 */

const PLANILHA_ID =
  process.env.PLANILHA_ID ?? "1qTVslmVQAUxcnmuAvqpikifO9ykHebhz4dVcjN5uod8"
const ABA = process.env.PLANILHA_ABA ?? "Página1"
const ESCOPO = "https://www.googleapis.com/auth/spreadsheets"

/** Colunas A..J são as originais; K guarda o código do envio. */
const COLUNAS = "A:K"

export type Credencial = {
  client_email: string
  private_key: string
  token_uri: string
}

/** A chave vem inteira numa variável de ambiente, como o JSON que o Google dá. */
export function credencial(): Credencial | null {
  const cru = process.env.GOOGLE_SERVICE_ACCOUNT
  if (!cru || !cru.trim()) return null
  try {
    const d = JSON.parse(cru) as Credencial
    if (!d.client_email || !d.private_key) return null
    // Quem cola o JSON num painel costuma acabar com \n literais no lugar das
    // quebras de linha. Sem isto a assinatura falha com um erro obscuro.
    return { ...d, private_key: d.private_key.replace(/\\n/g, "\n") }
  } catch {
    return null
  }
}

const base64url = (b: Buffer | string) =>
  Buffer.from(b).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

/**
 * Token de acesso, guardado entre chamadas da mesma instância. Vale uma hora;
 * renovo com cinco minutos de folga para nunca usar um que expira no caminho.
 */
let tokenGuardado: { valor: string; expiraEm: number } | null = null

async function tokenDeAcesso(cred: Credencial, prazoMs: number): Promise<string> {
  const agora = Date.now()
  if (tokenGuardado && tokenGuardado.expiraEm > agora + 5 * 60_000) {
    return tokenGuardado.valor
  }

  const segundos = Math.floor(agora / 1000)
  const cabecalho = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const corpo = base64url(
    JSON.stringify({
      iss: cred.client_email,
      scope: ESCOPO,
      aud: cred.token_uri,
      iat: segundos,
      exp: segundos + 3600,
    }),
  )
  const assinador = createSign("RSA-SHA256")
  assinador.update(`${cabecalho}.${corpo}`)
  const jwt = `${cabecalho}.${corpo}.${base64url(assinador.sign(cred.private_key))}`

  const r = await fetch(cred.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(prazoMs),
  })
  const d = (await r.json()) as { access_token?: string; error_description?: string }
  if (!r.ok || !d.access_token) {
    throw new Error(`token ${r.status}: ${d.error_description ?? "sem access_token"}`)
  }
  tokenGuardado = { valor: d.access_token, expiraEm: agora + 3600_000 }
  return d.access_token
}

/**
 * O carimbo tem de sair no fuso de São Paulo e no formato que as outras 113
 * linhas usam. A Vercel roda em UTC: sem dizer o fuso, toda inscrição entraria
 * três horas adiantada.
 */
export function carimbo(quando = new Date()): string {
  const f = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
  const p: Record<string, string> = {}
  for (const parte of f.formatToParts(quando)) p[parte.type] = parte.value
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}:${p.second}`
}

async function chamar(
  caminho: string,
  token: string,
  prazoMs: number,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`https://sheets.googleapis.com/v4/spreadsheets/${PLANILHA_ID}${caminho}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(prazoMs),
  })
}

/**
 * Este envio já está na planilha? É a coluna K que responde — ela guarda o
 * código do envio. Sem esta checagem, um reenvio depois de falha duplicaria a
 * pessoa, que é exatamente o problema que passamos o dia consertando.
 *
 * Devolve null quando não conseguimos perguntar: "não sei" não é "não está".
 */
export async function jaGravado(
  cred: Credencial,
  envioId: string,
  prazoMs: number,
): Promise<boolean | null> {
  try {
    const token = await tokenDeAcesso(cred, prazoMs)
    const faixa = encodeURIComponent(`${ABA}!K:K`)
    const r = await chamar(`/values/${faixa}`, token, prazoMs)
    if (!r.ok) return null
    const d = (await r.json()) as { values?: string[][] }
    return (d.values ?? []).some((linha) => (linha[0] ?? "").trim() === envioId)
  } catch {
    return null
  }
}

export type Inscricao = {
  nome: string
  telefone: string
  email: string
  cpf: string
  empresa: string
  cargo: string
  consentimentoDados?: boolean
  autorizacaoImagem?: boolean
  autorizacaoComunicacao?: boolean
}

const sn = (v: unknown) => (v ? "Sim" : "Não")

/** Acrescenta a linha. Lança se não conseguir — quem chama decide o que dizer. */
export async function gravar(
  cred: Credencial,
  dados: Inscricao,
  envioId: string,
  prazoMs: number,
): Promise<void> {
  const token = await tokenDeAcesso(cred, prazoMs)
  const linha = [
    carimbo(),
    dados.nome,
    dados.telefone,
    dados.email,
    dados.cpf,
    dados.empresa,
    dados.cargo,
    sn(dados.consentimentoDados),
    sn(dados.autorizacaoImagem),
    sn(dados.autorizacaoComunicacao),
    envioId,
  ]
  const faixa = encodeURIComponent(`${ABA}!${COLUNAS}`)
  const r = await chamar(
    `/values/${faixa}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    token,
    prazoMs,
    { method: "POST", body: JSON.stringify({ values: [linha] }) },
  )
  if (!r.ok) {
    const t = await r.text()
    throw new Error(`append ${r.status}: ${t.slice(0, 200)}`)
  }
}
