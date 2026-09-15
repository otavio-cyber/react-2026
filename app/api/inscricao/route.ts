import { NextResponse } from "next/server"

/**
 * Ponte entre o formulário e o Google Apps Script.
 *
 * POR QUE ISSO EXISTE: antes o navegador falava direto com o script.google.com.
 * Quando a página é aberta dentro do iframe do triunfae.com.br, o navegador
 * está num contexto de terceiros; a resposta do Apps Script vem por um
 * redirecionamento para script.googleusercontent.com que, nesse contexto,
 * devolve 404 ou nunca chega — e o botão fica girando para sempre.
 *
 * Agora o navegador fala só com o PRÓPRIO site (mesma origem, sem CORS e sem
 * contexto de terceiros) e quem conversa com o Google é o servidor. Além de
 * consertar o iframe, isso deixa o site SABER se a inscrição gravou mesmo.
 */

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbxLiV5b6HHdaCLIOs95Gz25iK8cM0GyQFvlFd0XEgudPugeBp7wZmPMJb0PEc8s0YdOsA/exec"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const CAMPOS = ["nome", "telefone", "email", "cpf", "empresa", "cargo"] as const

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

  const controlador = new AbortController()
  const relogio = setTimeout(() => controlador.abort(), 25_000)

  try {
    const resposta = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(dados),
      redirect: "follow",
      cache: "no-store",
      signal: controlador.signal,
    })

    const texto = await resposta.text()
    let corpo: { result?: string; error?: string } | null = null
    try {
      corpo = JSON.parse(texto)
    } catch {
      // o Google devolveu HTML (página de erro), não JSON
    }

    if (resposta.ok && corpo?.result === "success") {
      return NextResponse.json({ result: "success" })
    }

    console.error("[inscricao] resposta inesperada do Apps Script", {
      status: resposta.status,
      corpo: corpo ?? texto.slice(0, 300),
    })
    return NextResponse.json(
      {
        result: "error",
        error:
          corpo?.error ??
          `O sistema de inscrições não confirmou o registro (HTTP ${resposta.status}).`,
      },
      { status: 502 },
    )
  } catch (erro) {
    const abortou = (erro as Error)?.name === "AbortError"
    console.error("[inscricao] falha ao falar com o Apps Script", erro)
    return NextResponse.json(
      {
        result: "error",
        error: abortou
          ? "O sistema de inscrições demorou demais para responder."
          : "Não foi possível falar com o sistema de inscrições.",
      },
      { status: 504 },
    )
  } finally {
    clearTimeout(relogio)
  }
}
