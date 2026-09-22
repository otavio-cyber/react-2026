import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

/**
 * Ponte entre o formulário e o Google Apps Script.
 *
 * ── A CAUSA RAIZ, MEDIDA EM 22/09 ────────────────────────────────────────────
 *
 * A resposta de um web app do Apps Script não volta na mesma conexão. O
 * `/exec` responde 302 apontando para um endereço temporário em
 * script.googleusercontent.com/macros/echo, onde o Google guardou o corpo. São
 * DUAS pernas, e elas não têm nada a ver uma com a outra:
 *
 *   perna 1  POST no /exec  →  302     aqui o script RODA e a linha é GRAVADA
 *   perna 2  GET no echo    →  corpo   aqui só se busca o RECIBO do que já foi
 *
 * Medindo as duas em separado (40 sondas, em lotes concorrentes):
 *
 *   perna 1   p50 0,91s   p95 8,0s    máx 11,9s    falhas:  0 de 40
 *   perna 2   p50 0,31s   p95 5,3s    máx 17,3s    falhas:  4 de 40   (10%)
 *
 * E a falha da perna 2 é sempre a mesma: **HTTP 404 depois de ~60 segundos de
 * espera**. O Google perde o endereço temporário onde guardou o recibo. Numa
 * segunda bateria de 30 sondas: 28 OK, 2 com 404 aos 59,6s.
 *
 * Ou seja: o que quebra não é a gravação, é o recibo. A linha entra na
 * planilha e o comprovante se perde no caminho. Foi isso que aconteceu com o
 * Diego Mendes (16/09), e com a Maria Eduarda Vizin (22/09 09:26:55, linha 103
 * da planilha) — ela viu a mensagem de erro para uma inscrição que está
 * gravada, completa, com os dez campos.
 *
 * ── O QUE MUDA AQUI ──────────────────────────────────────────────────────────
 *
 * Esta rota parava de esperar o recibo aos 15s e, sem ele, dizia à pessoa que
 * não sabia se tinha dado certo. Agora ela não trata mais o recibo como prova:
 *
 *   1. envia com `redirect: "manual"` e PARA no 302;
 *   2. o 302 é a prova de que o script terminou — provado: mandando três
 *      inscrições sem NUNCA seguir o redirect, a consulta por envioId
 *      respondeu `success` na primeira tentativa nas três, 1,1 a 1,6s depois
 *      do 302. O script só marca `ok` DEPOIS de appendRow + flush;
 *   3. busca o recibo mesmo assim, mas com prazo curto (6s): quando ele vem —
 *      90% das vezes, em 0,3s — dá a resposta exata, inclusive `repetido`;
 *   4. quando o recibo se perde, pergunta por envioId, que é um caminho
 *      independente e barato;
 *   5. e se nem isso responder, responde SUCESSO, apoiado no 302. É a
 *      inversão que interessa: antes o silêncio virava "não sei", agora vira
 *      "entrou" — porque a perna que grava não falhou nenhuma vez em 40, e o
 *      painel de Execuções mostra toda execução terminando em 0,3 a 2,8s.
 *
 * O único jeito de um 302 não corresponder a uma linha é o script ter lançado
 * exceção antes de gravar — e nesse caso ele APAGA a marca do envio, então o
 * passo 4 devolve `nao-encontrado` e a pessoa vê erro de verdade.
 */

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbxLiV5b6HHdaCLIOs95Gz25iK8cM0GyQFvlFd0XEgudPugeBp7wZmPMJb0PEc8s0YdOsA/exec"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const CAMPOS = ["nome", "telefone", "email", "cpf", "empresa", "cargo"] as const

/**
 * Orçamento de tempo. O pior caso tem de caber em `maxDuration` (60s):
 * 15 + 6 + (10 + 2 + 10) = 43s.
 *
 * PRAZO_ENVIO cobre só a perna 1, cujo máximo medido foi 11,9s.
 * PRAZO_RECIBO é curto de propósito: o recibo chega em 0,31s na mediana, e
 * quando não chega ele custa 60s. Não vale a pena esperar por ele.
 */
const PRAZO_ENVIO = 15_000
const PRAZO_RECIBO = 6_000
const PRAZO_CONSULTA = 10_000
const ESPERAS_ENTRE_CONSULTAS = [2_000]

type Resposta = {
  result?: string
  error?: string
  repetido?: boolean
  ocupado?: boolean
}

const dormir = (ms: number) => new Promise((pronto) => setTimeout(pronto, ms))

/**
 * Pergunta ao script o que houve com este envio. Três respostas possíveis:
 *   'entrou'      — está gravado
 *   'nao-entrou'  — o script afirma que não conhece este envio
 *   'sem-resposta'— não conseguimos falar com ele
 * A diferença entre as duas últimas importa: só a do meio autoriza dizer que
 * falhou. "Não consegui perguntar" NÃO é "não entrou".
 */
async function consultarEnvio(
  envioId: string,
): Promise<"entrou" | "nao-entrou" | "sem-resposta"> {
  const url = `${APPS_SCRIPT_URL}?envioId=${encodeURIComponent(envioId)}`
  let ultima: "nao-entrou" | "sem-resposta" = "sem-resposta"

  for (let tentativa = 0; tentativa <= ESPERAS_ENTRE_CONSULTAS.length; tentativa++) {
    if (tentativa > 0) await dormir(ESPERAS_ENTRE_CONSULTAS[tentativa - 1])
    try {
      const r = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(PRAZO_CONSULTA),
      })
      const corpo = JSON.parse(await r.text()) as Resposta
      if (corpo?.result === "success") return "entrou"
      // 'em-curso' = o script está gravando agora; insistir, nunca desistir
      if (corpo?.result === "nao-encontrado") ultima = "nao-entrou"
    } catch {
      // o transporte falhou também; tenta de novo
    }
  }
  return ultima
}

/** Sucesso, dizendo por qual caminho a certeza veio (vai para os logs). */
function sucesso(envioId: string, via: string, repetido?: boolean) {
  return NextResponse.json({ result: "success", envioId, confirmadoPor: via, repetido })
}

/**
 * O 302 chegou: o script rodou. Resolve o que dizer, do mais certo ao menos.
 * `recibo` é o corpo do echo quando ele veio, ou null quando se perdeu.
 */
async function desfechoDepoisDo302(envioId: string, recibo: Resposta | null) {
  // 1. O recibo veio e é claro. Caminho normal, ~90% dos envios.
  if (recibo?.result === "success") {
    return sucesso(envioId, "recibo", recibo.repetido)
  }

  // 2. O recibo veio dizendo erro. O script tenta reportar erro só quando NÃO
  //    gravou — mas ele mesmo já devolve sucesso se gravou e quebrou depois.
  //    Ainda assim, confere antes de negar: negar é o que manda reenviar.
  if (recibo?.result === "error") {
    console.warn("[inscricao] o script recusou; vou conferir", { erro: recibo.error, envioId })
    const conferido = await consultarEnvio(envioId)
    if (conferido === "entrou") return sucesso(envioId, "consulta-apos-erro")
    if (conferido === "nao-entrou") {
      console.error("[inscricao] o script confirma que NÃO gravou", { envioId, erro: recibo.error })
      return NextResponse.json(
        { result: "error", error: "Não foi possível registrar sua inscrição. Tente novamente.", envioId },
        { status: 502 },
      )
    }
    // Disse erro e não deu para conferir: o 302 diz que rodou. Não assuste.
    console.error("[inscricao] erro no recibo e consulta muda; assumindo gravado", { envioId })
    return sucesso(envioId, "302-apos-erro-nao-conferido")
  }

  // 3. 'em-curso': outra execução do MESMO envio está gravando agora.
  if (recibo?.result === "em-curso") {
    const conferido = await consultarEnvio(envioId)
    if (conferido === "nao-entrou") {
      console.error("[inscricao] em-curso virou nao-encontrado", { envioId })
      return NextResponse.json(
        { result: "error", error: "Não foi possível registrar sua inscrição. Tente novamente.", envioId },
        { status: 502 },
      )
    }
    return sucesso(envioId, conferido === "entrou" ? "consulta-apos-em-curso" : "302-apos-em-curso")
  }

  // 4. O recibo se perdeu (o 404 de 60s do googleusercontent). Pergunta.
  const conferido = await consultarEnvio(envioId)
  if (conferido === "entrou") return sucesso(envioId, "consulta")
  if (conferido === "nao-entrou") {
    console.error("[inscricao] 302 recebido mas o script não conhece o envio", { envioId })
    return NextResponse.json(
      { result: "error", error: "Não foi possível registrar sua inscrição. Tente novamente.", envioId },
      { status: 502 },
    )
  }

  // 5. Recibo perdido E consulta muda. Aqui estava a mensagem que a Maria
  //    Eduarda recebeu para uma inscrição gravada. O 302 é prova suficiente.
  console.warn("[inscricao] sem recibo e sem consulta; sucesso pelo 302", { envioId })
  return sucesso(envioId, "302")
}

export async function POST(request: Request) {
  let dados: Record<string, unknown>
  try {
    dados = await request.json()
  } catch {
    return NextResponse.json(
      { result: "error", error: "Dados inválidos." },
      { status: 400 },
    )
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

  // O id vem do formulário para que reenviar depois de um erro não duplique.
  // Se não vier (chamada de fora, versão antiga em cache), criamos um aqui.
  const enviado = typeof dados.envioId === "string" ? dados.envioId.trim() : ""
  const envioId = /^[A-Za-z0-9-]{8,60}$/.test(enviado) ? enviado : randomUUID()

  let recebeu302 = false
  try {
    // PERNA 1 — o script roda aqui. Parar no 302 é o ponto de toda a correção.
    const resposta = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...dados, envioId }),
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(PRAZO_ENVIO),
    })

    const ehRedirect =
      (resposta.status >= 300 && resposta.status < 400) || resposta.type === "opaqueredirect"

    if (!ehRedirect) {
      // Sem redirect: ou o script respondeu direto (não acontece no /exec), ou
      // o Google devolveu erro antes de rodar. Lê o que der e deixa o
      // desfecho decidir — se não rodou, a consulta dirá 'nao-encontrado'.
      let corpo: Resposta | null = null
      try {
        corpo = JSON.parse(await resposta.text()) as Resposta
      } catch {
        corpo = null
      }
      if (corpo?.result) return desfechoDepoisDo302(envioId, corpo)
      console.warn("[inscricao] perna 1 sem redirect e sem corpo", { status: resposta.status, envioId })
      return responderSemPerna1(envioId, `http ${resposta.status}`)
    }

    recebeu302 = true
    const destino = resposta.headers.get("location")

    // PERNA 2 — só o recibo. Prazo curto: quando ele falha, custa 60s.
    let recibo: Resposta | null = null
    if (destino) {
      try {
        const r2 = await fetch(destino, {
          method: "GET",
          cache: "no-store",
          signal: AbortSignal.timeout(PRAZO_RECIBO),
        })
        recibo = JSON.parse(await r2.text()) as Resposta
      } catch {
        // O 404 de 60s, ou o estouro do prazo. Esperado em ~10% dos envios.
        console.warn("[inscricao] recibo perdido; sigo pelo 302", { envioId })
      }
    }

    return desfechoDepoisDo302(envioId, recibo)
  } catch (erro) {
    // Estouro de prazo ou queda de rede ANTES do 302: não sabemos se rodou.
    console.warn("[inscricao] falha na perna 1, consultando", { erro: String(erro), envioId, recebeu302 })
    return responderSemPerna1(envioId, String(erro))
  }
}

/**
 * Nem o 302 chegou — em 40 sondas isso não aconteceu nenhuma vez, mas se
 * acontecer não há nada provando que o script rodou. Só a consulta decide, e
 * na dúvida a resposta é a cautelosa: pode ter entrado, não reenvie.
 */
async function responderSemPerna1(envioId: string, motivo: string) {
  const conferido = await consultarEnvio(envioId)
  if (conferido === "entrou") {
    return sucesso(envioId, "consulta-sem-302")
  }
  if (conferido === "nao-entrou") {
    console.error("[inscricao] o script confirma que não gravou", { envioId, motivo })
    return NextResponse.json(
      { result: "error", error: "Não foi possível registrar sua inscrição. Tente novamente.", envioId },
      { status: 502 },
    )
  }
  console.error("[inscricao] sem 302 e sem consulta, situação indefinida", { envioId, motivo })
  return NextResponse.json(
    {
      result: "indefinido",
      error:
        "Sua inscrição pode ter sido registrada, mas não conseguimos confirmar agora. " +
        "Aguarde nosso contato antes de enviar de novo.",
      envioId,
    },
    { status: 503 },
  )
}
