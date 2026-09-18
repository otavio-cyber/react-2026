import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

/**
 * Ponte entre o formulário e o Google Apps Script.
 *
 * POR QUE ISSO EXISTE: antes o navegador falava direto com o script.google.com.
 * Dentro do iframe do triunfae.com.br isso deixava o botão girando para sempre,
 * e o site nunca conferia se a inscrição tinha sido gravada.
 *
 * O PROBLEMA DE TRANSPORTE: a resposta de um web app do Apps Script não volta
 * direto — vem por um redirecionamento para script.googleusercontent.com. Esse
 * segundo passo falha ou demora MESMO com a linha já gravada. Medido em 18/09,
 * do lado de fora: mediana 1,9s, p95 9,5s, e uma chamada em vinte que pendura
 * por 40s. Do lado de DENTRO, o painel de Execuções do Apps Script mostra que
 * toda execução termina em 0,3 a 2,8s — ou seja, a lentidão é 100% transporte.
 *
 * O CASO QUE MOTIVOU A v3 DESTA ROTA: o Diego Mendes viu "erro" numa inscrição
 * que ENTROU (planilha, 16/09 21:27:44, linha única, sem ninguém enviando junto).
 * Duas coisas daqui podiam produzir isso, e as duas foram corrigidas:
 *
 *   1. o prazo de consulta era 8s, ABAIXO do p95 de 9,5s do próprio endereço
 *      consultado: o socorro falhava junto com o que ele deveria socorrer;
 *   2. quando o script respondia result:'error', esta rota devolvia 502 SEM
 *      consultar. Se o script quebrasse depois de gravar, era erro na tela com
 *      linha na planilha — e sem marca, então o reenvio duplicaria.
 *
 * Agora o script (v4) marca o envio como `pend` ANTES de gravar e `ok` depois,
 * então a consulta distingue "em curso" de "não existe" e esta rota sabe
 * esperar em vez de concluir fracasso.
 */

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbxLiV5b6HHdaCLIOs95Gz25iK8cM0GyQFvlFd0XEgudPugeBp7wZmPMJb0PEc8s0YdOsA/exec"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const CAMPOS = ["nome", "telefone", "email", "cpf", "empresa", "cargo"] as const

/**
 * Orçamento de tempo. A soma do pior caso tem de caber em `maxDuration`:
 * 15 + (12+2) + (12+3) + 12 = 56s.
 * PRAZO_CONSULTA ficou acima do p95 medido (9,5s) de propósito — era ele, em
 * 8s, que fazia a consulta de socorro falhar justamente quando era necessária.
 */
const PRAZO_ENVIO = 15_000
const PRAZO_CONSULTA = 12_000
const ESPERAS_ENTRE_CONSULTAS = [2_000, 3_000]

type Resposta = {
  result?: string
  error?: string
  repetido?: boolean
  ocupado?: boolean
}

const dormir = (ms: number) => new Promise((pronto) => setTimeout(pronto, ms))

/**
 * Pergunta ao script o que houve com este envio. Três respostas possíveis:
 *   'entrou'      — está gravado, pode dizer sucesso
 *   'nao-entrou'  — o script afirma que não conhece este envio
 *   'sem-resposta'— não conseguimos falar com ele (o transporte falhou de novo)
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

/** Traduz o desfecho da consulta na resposta ao navegador. */
function responderPorConsulta(
  desfecho: "entrou" | "nao-entrou" | "sem-resposta",
  envioId: string,
  motivo: string,
) {
  if (desfecho === "entrou") {
    return NextResponse.json({ result: "success", envioId, confirmadoPorConsulta: true })
  }
  if (desfecho === "nao-entrou") {
    console.error("[inscricao] o script confirma que não gravou", { envioId, motivo })
    return NextResponse.json(
      { result: "error", error: "Não foi possível registrar sua inscrição. Tente novamente.", envioId },
      { status: 502 },
    )
  }
  // Não conseguimos nem perguntar. Pode ter entrado. Não mande a pessoa
  // reenviar como se tivesse falhado — e o envioId é o mesmo se ela reenviar.
  console.error("[inscricao] sem resposta do script, situação indefinida", { envioId, motivo })
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

  try {
    const resposta = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...dados, envioId }),
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(PRAZO_ENVIO),
    })

    let corpo: Resposta | null = null
    try {
      corpo = JSON.parse(await resposta.text())
    } catch {
      // o Google devolveu HTML (página de erro do redirecionamento)
    }

    if (resposta.ok && corpo?.result === "success") {
      return NextResponse.json({ result: "success", envioId })
    }

    // 'em-curso': outra execução do MESMO envio está gravando. Espera e confirma.
    if (corpo?.result === "em-curso") {
      return responderPorConsulta(await consultarEnvio(envioId), envioId, "em-curso")
    }

    // O script disse que deu erro. ANTES da v4 isto virava 502 direto — e era
    // um dos jeitos de mostrar erro para uma linha que entrou. Agora pergunta.
    if (corpo?.result === "error") {
      console.warn("[inscricao] o script recusou; vou conferir", { erro: corpo.error, envioId })
      return responderPorConsulta(await consultarEnvio(envioId), envioId, corpo.error || "erro do script")
    }

    // Resposta ilegível: a linha PODE ter sido gravada. Pergunta, não chuta.
    console.warn("[inscricao] resposta ilegível, consultando", { status: resposta.status, envioId })
    return responderPorConsulta(await consultarEnvio(envioId), envioId, `http ${resposta.status}`)
  } catch (erro) {
    // Estouro de prazo ou queda de rede: idem, a linha pode ter entrado.
    console.warn("[inscricao] falha no envio, consultando", { erro: String(erro), envioId })
    return responderPorConsulta(await consultarEnvio(envioId), envioId, String(erro))
  }
}
