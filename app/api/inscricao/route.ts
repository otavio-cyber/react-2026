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
 * direto — ela vem por um redirecionamento para script.googleusercontent.com.
 * Esse segundo passo falha com alguma frequência (404, ou demora demais) MESMO
 * com a linha já gravada na planilha. Medido daqui: de 3 envios, 2 não
 * conseguiram ler a resposta e os 3 gravaram. Confiar só na resposta faria o
 * site dizer "erro" para inscrição que entrou, e a pessoa reenviaria: duplicata.
 *
 * A SOLUÇÃO, nas duas pontas: cada envio leva um `envioId`. O script ignora id
 * repetido (não grava duas vezes) e responde em `doGet?envioId=` se aquele
 * envio foi registrado. Quando a resposta se perde, nós PERGUNTAMOS em vez de
 * chutar. E o formulário reenvia com o MESMO id, então nem a tentativa manual
 * da pessoa duplica.
 */

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbxLiV5b6HHdaCLIOs95Gz25iK8cM0GyQFvlFd0XEgudPugeBp7wZmPMJb0PEc8s0YdOsA/exec"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const CAMPOS = ["nome", "telefone", "email", "cpf", "empresa", "cargo"] as const

/** Orçamento de tempo. A soma do pior caso tem de caber em `maxDuration`. */
const PRAZO_ENVIO = 20_000
const PRAZO_CONSULTA = 8_000
const ESPERAS_ENTRE_CONSULTAS = [2_000, 4_000] // 20 + 8+2 + 8+4 + 8 = 50s

type Resposta = { result?: string; error?: string }

const dormir = (ms: number) => new Promise((pronto) => setTimeout(pronto, ms))

/**
 * Pergunta ao script se o envio foi registrado. Tenta algumas vezes porque a
 * consulta viaja pelo mesmo caminho que pode ter falhado no envio.
 * `false` só depois de esgotar as tentativas.
 */
async function foiRegistrado(envioId: string): Promise<boolean> {
  const url = `${APPS_SCRIPT_URL}?envioId=${encodeURIComponent(envioId)}`
  for (let tentativa = 0; tentativa <= ESPERAS_ENTRE_CONSULTAS.length; tentativa++) {
    if (tentativa > 0) await dormir(ESPERAS_ENTRE_CONSULTAS[tentativa - 1])
    try {
      const r = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(PRAZO_CONSULTA),
      })
      const corpo = JSON.parse(await r.text()) as Resposta
      if (corpo?.result === "success") return true
      // "nao-encontrado" ainda pode virar "success": a gravação pode estar em
      // curso, presa na fila do LockService. Só desiste no fim das tentativas.
    } catch {
      // a consulta também pode falhar no transporte: tenta de novo
    }
  }
  return false
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

    // O script recusou por um motivo dele (ex.: planilha ocupada).
    if (corpo?.result === "error") {
      console.error("[inscricao] o script recusou", { erro: corpo.error, envioId })
      return NextResponse.json(
        { result: "error", error: "Não foi possível registrar agora. Tente novamente." },
        { status: 502 },
      )
    }

    // Resposta ilegível: a linha PODE ter sido gravada. Pergunta, não chuta.
    console.warn("[inscricao] resposta ilegível, consultando o envio", {
      status: resposta.status,
      envioId,
    })
    if (await foiRegistrado(envioId)) {
      return NextResponse.json({ result: "success", envioId, confirmadoPorConsulta: true })
    }
    return NextResponse.json(
      { result: "error", error: "Não foi possível enviar sua inscrição agora.", envioId },
      { status: 502 },
    )
  } catch (erro) {
    // Estouro de prazo ou queda de rede: idem, a linha pode ter entrado.
    console.error("[inscricao] falha no envio, consultando", { erro: String(erro), envioId })
    if (await foiRegistrado(envioId)) {
      return NextResponse.json({ result: "success", envioId, confirmadoPorConsulta: true })
    }
    return NextResponse.json(
      { result: "error", error: "O sistema de inscrições não respondeu. Tente novamente.", envioId },
      { status: 504 },
    )
  }
}
