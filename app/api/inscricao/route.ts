import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { credencial, gravar, jaGravado, type Inscricao } from "@/lib/planilha"

/**
 * Recebimento das inscrições.
 *
 * ── DOIS MOTORES, UM DE CADA VEZ ─────────────────────────────────────────────
 *
 * `MOTOR_PLANILHA` escolhe por onde a linha é gravada:
 *
 *   "api"          (padrão) API do Google Sheets, com conta de serviço
 *   "apps-script"            o caminho antigo, que continua aqui inteiro
 *
 * Nunca os dois na mesma requisição: duas escritas para a mesma planilha é
 * exatamente como se fabrica duplicata. A variável existe para poder voltar
 * atrás em um minuto, sem mexer em código, se a API der problema.
 *
 * ── POR QUE TROCAR ───────────────────────────────────────────────────────────
 *
 * A resposta do Apps Script não volta na mesma conexão: o `/exec` devolve 302
 * para um endereço descartável em script.googleusercontent.com, e esse segundo
 * passo some. Medido em 22/09, em duas baterias: HTTP 404 depois de ~60
 * segundos, em 4 de 40 chamadas espaçadas e 5 de 12 sob concorrência. A linha
 * entrava na planilha e o comprovante se perdia — foi o que o Diego Mendes
 * (16/09) e a Maria Eduarda Vizin (22/09, linha 103) viram.
 *
 * Os remendos dos PRs #15 e #16 reduziram muito o estrago, mas o desenho
 * continuava frágil: na última medição limpa, 1 envio em 8 ainda terminava sem
 * confirmação.
 *
 * A API do Sheets não tem esse desenho. Medido com a mesma conta de serviço:
 * token em 270ms, leitura em 210ms, resposta na mesma conexão e código de
 * status de verdade.
 *
 * ── IDEMPOTÊNCIA ─────────────────────────────────────────────────────────────
 *
 * O `envioId` vai para a coluna K. Antes de gravar, a rota pergunta se aquele
 * código já está lá. É isso que faz "tentar de novo" ser seguro — e é o mesmo
 * código que a pessoa manda no WhatsApp quando não recebe confirmação, então
 * dá para achar a linha dela sem perguntar nada.
 */

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbxLiV5b6HHdaCLIOs95Gz25iK8cM0GyQFvlFd0XEgudPugeBp7wZmPMJb0PEc8s0YdOsA/exec"

const MOTOR = (process.env.MOTOR_PLANILHA ?? "api").toLowerCase()

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const CAMPOS = ["nome", "telefone", "email", "cpf", "empresa", "cargo"] as const

/** Mensagens. Uma só definição, para as duas rotas não divergirem. */
const RECADO_SEM_CONFIRMACAO =
  "O envio das suas informações demorou mais do que o esperado. " +
  "Por favor confirme sua inscrição no número (16) 99419-3437."
const RECADO_FALHOU = "Não foi possível registrar sua inscrição. Tente novamente."

/** Orçamento do caminho novo: 8 + 10 + 8 + 10 + 8 = 42s, dentro dos 60. */
const PRAZO_CONSULTA_API = 8_000
const PRAZO_GRAVACAO_API = 10_000

/** Orçamento do caminho antigo, inalterado desde o PR #16. */
const PRAZO_ENVIO = 12_000
const PRAZO_RECIBO = 5_000
const PRAZO_CONSULTA = 8_000
const ESPERAS_ENTRE_CONSULTAS = [2_000]
const TENTATIVAS_DE_ENVIO = 2

type Resposta = {
  result?: string
  error?: string
  repetido?: boolean
  ocupado?: boolean
}

const dormir = (ms: number) => new Promise((pronto) => setTimeout(pronto, ms))

const sucesso = (envioId: string, via: string, repetido?: boolean) =>
  NextResponse.json({ result: "success", envioId, confirmadoPor: via, repetido })

const falhou = (envioId: string) =>
  NextResponse.json({ result: "error", error: RECADO_FALHOU, envioId }, { status: 502 })

const indefinido = (envioId: string) =>
  NextResponse.json(
    { result: "indefinido", error: RECADO_SEM_CONFIRMACAO, envioId },
    { status: 503 },
  )

// ─────────────────────────────────────────────────────────────────────────────
// MOTOR NOVO: API do Google Sheets
// ─────────────────────────────────────────────────────────────────────────────

async function caminhoApi(dados: Inscricao, envioId: string) {
  const cred = credencial()
  if (!cred) {
    // Sem chave configurada não dá para usar este motor. Cai no antigo, em vez
    // de recusar a inscrição de alguém por causa de configuração nossa.
    console.error("[inscricao] GOOGLE_SERVICE_ACCOUNT ausente ou inválida; uso o Apps Script")
    return caminhoAppsScript(dados as unknown as Record<string, unknown>, envioId)
  }

  for (let tentativa = 1; tentativa <= 2; tentativa++) {
    // 1. Já está lá? Só `true` impede de gravar — "não consegui perguntar"
    //    (null) não é motivo para desistir da inscrição de alguém.
    const existe = await jaGravado(cred, envioId, PRAZO_CONSULTA_API)
    if (existe === true) {
      return sucesso(envioId, tentativa === 1 ? "ja-estava" : "ja-estava-apos-erro", true)
    }

    try {
      await gravar(cred, dados, envioId, PRAZO_GRAVACAO_API)
      return sucesso(envioId, tentativa === 1 ? "api" : "api-2a-tentativa")
    } catch (erro) {
      console.error("[inscricao] falha ao gravar pela API", {
        envioId,
        tentativa,
        erro: String(erro),
      })
    }
  }

  // Duas tentativas falharam. Uma última pergunta: pode ter entrado na
  // primeira e só a resposta ter se perdido.
  const ultima = await jaGravado(cred, envioId, PRAZO_CONSULTA_API)
  if (ultima === true) return sucesso(envioId, "consulta-apos-falha", true)

  console.error("[inscricao] a API do Sheets não gravou", { envioId, confirmado: ultima })
  return ultima === false ? falhou(envioId) : indefinido(envioId)
}

// ─────────────────────────────────────────────────────────────────────────────
// MOTOR ANTIGO: Apps Script. Mantido inteiro, para poder voltar atrás.
// ─────────────────────────────────────────────────────────────────────────────

async function consultarEnvio(
  envioId: string,
  insistir = true,
): Promise<"entrou" | "nao-entrou" | "sem-resposta"> {
  const url = `${APPS_SCRIPT_URL}?envioId=${encodeURIComponent(envioId)}`
  const esperas = insistir ? ESPERAS_ENTRE_CONSULTAS : []
  let ultima: "nao-entrou" | "sem-resposta" = "sem-resposta"

  for (let tentativa = 0; tentativa <= esperas.length; tentativa++) {
    if (tentativa > 0) await dormir(esperas[tentativa - 1])
    try {
      const r = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(PRAZO_CONSULTA),
      })
      const corpo = JSON.parse(await r.text()) as Resposta
      if (corpo?.result === "success") return "entrou"
      if (corpo?.result === "nao-encontrado") ultima = "nao-entrou"
    } catch {
      // o transporte falhou também; tenta de novo
    }
  }
  return ultima
}

/** O 302 chegou: o script rodou. Resolve o que dizer, do mais certo ao menos. */
async function desfechoDepoisDo302(envioId: string, recibo: Resposta | null) {
  if (recibo?.result === "success") return sucesso(envioId, "recibo", recibo.repetido)

  if (recibo?.result === "error") {
    console.warn("[inscricao] o script recusou; vou conferir", { erro: recibo.error, envioId })
    const conferido = await consultarEnvio(envioId)
    if (conferido === "entrou") return sucesso(envioId, "consulta-apos-erro")
    if (conferido === "nao-entrou") return falhou(envioId)
    return sucesso(envioId, "302-apos-erro-nao-conferido")
  }

  if (recibo?.result === "em-curso") {
    const conferido = await consultarEnvio(envioId)
    if (conferido === "nao-entrou") return falhou(envioId)
    return sucesso(envioId, conferido === "entrou" ? "consulta-apos-em-curso" : "302-apos-em-curso")
  }

  const conferido = await consultarEnvio(envioId)
  if (conferido === "entrou") return sucesso(envioId, "consulta")
  if (conferido === "nao-entrou") return falhou(envioId)

  console.warn("[inscricao] sem recibo e sem consulta; sucesso pelo 302", { envioId })
  return sucesso(envioId, "302")
}

type Tentativa =
  | { tipo: "rodou"; recibo: Resposta | null }
  | { tipo: "nao-rodou"; motivo: string }

async function enviarUmaVez(
  dados: Record<string, unknown>,
  envioId: string,
): Promise<Tentativa> {
  let resposta: Response
  try {
    resposta = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...dados, envioId }),
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(PRAZO_ENVIO),
    })
  } catch (erro) {
    return { tipo: "nao-rodou", motivo: String(erro) }
  }

  const ehRedirect =
    (resposta.status >= 300 && resposta.status < 400) || resposta.type === "opaqueredirect"

  if (!ehRedirect) {
    try {
      const corpo = JSON.parse(await resposta.text()) as Resposta
      if (corpo?.result) return { tipo: "rodou", recibo: corpo }
    } catch {
      // corpo ilegível
    }
    return { tipo: "nao-rodou", motivo: `http ${resposta.status}` }
  }

  const destino = resposta.headers.get("location")
  if (destino) {
    try {
      const r2 = await fetch(destino, {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(PRAZO_RECIBO),
      })
      return { tipo: "rodou", recibo: JSON.parse(await r2.text()) as Resposta }
    } catch {
      console.warn("[inscricao] recibo perdido; sigo pelo 302", { envioId })
    }
  }
  return { tipo: "rodou", recibo: null }
}

async function caminhoAppsScript(dados: Record<string, unknown>, envioId: string) {
  let ultimoMotivo = ""
  for (let n = 1; n <= TENTATIVAS_DE_ENVIO; n++) {
    const tentativa = await enviarUmaVez(dados, envioId)
    if (tentativa.tipo === "rodou") return desfechoDepoisDo302(envioId, tentativa.recibo)

    ultimoMotivo = tentativa.motivo
    console.warn("[inscricao] perna 1 falhou", { envioId, tentativa: n, motivo: ultimoMotivo })
    const conferido = await consultarEnvio(envioId, false)
    if (conferido === "entrou") return sucesso(envioId, `consulta-sem-302-${n}`)
    if (conferido === "nao-entrou" && n === TENTATIVAS_DE_ENVIO) return falhou(envioId)
  }
  console.error("[inscricao] duas tentativas sem 302 e sem consulta", {
    envioId,
    motivo: ultimoMotivo,
  })
  return indefinido(envioId)
}

// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let dados: Record<string, unknown>
  try {
    dados = await request.json()
  } catch {
    return NextResponse.json({ result: "error", error: "Dados inválidos." }, { status: 400 })
  }

  const faltando = CAMPOS.filter(
    (c) => typeof dados[c] !== "string" || !(dados[c] as string).trim(),
  )
  if (faltando.length) {
    return NextResponse.json(
      { result: "error", error: `Preencha: ${faltando.join(", ")}.` },
      { status: 400 },
    )
  }

  const enviado = typeof dados.envioId === "string" ? dados.envioId.trim() : ""
  const envioId = /^[A-Za-z0-9-]{8,60}$/.test(enviado) ? enviado : randomUUID()

  if (MOTOR === "apps-script") return caminhoAppsScript(dados, envioId)
  return caminhoApi(dados as unknown as Inscricao, envioId)
}
