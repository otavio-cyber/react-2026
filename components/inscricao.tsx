"use client"

import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, CheckCircle2 } from "lucide-react"
import { INSCRICAO_MODAL_EVENT } from "@/lib/inscricao-modal"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// O endereço do Apps Script agora vive no servidor, em app/api/inscricao/route.ts
// (e pode ser trocado sem novo build pela variável de ambiente APPS_SCRIPT_URL
// na Vercel). O navegador não fala mais direto com o Google.

type FormData = {
  nome: string
  telefone: string
  email: string
  cpf: string
  empresa: string
  cargo: string
}

const EMPTY_FORM: FormData = {
  nome: "",
  telefone: "",
  email: "",
  cpf: "",
  empresa: "",
  cargo: "",
}

export function Inscricao() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  // Consentimentos (Seção 1)
  const [consentimentoDados, setConsentimentoDados] = useState(false)
  const [autorizacaoImagem, setAutorizacaoImagem] = useState(false)
  const [autorizacaoComunicacao, setAutorizacaoComunicacao] = useState(false)

  // Dados pessoais (Seção 2)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Identificador desta inscrição. Nasce no primeiro envio e SOBREVIVE ao erro,
  // para que "tentar de novo" mande o mesmo id e o Apps Script não grave duas
  // vezes a mesma pessoa. Só zera quando o formulário é reiniciado.
  // Vai TAMBÉM para o sessionStorage: quem vê erro costuma recarregar a página,
  // e sem isso o reenvio nasceria com id novo e duplicaria a inscrição.
  const envioIdRef = useRef<string>("")
  const CHAVE_ENVIO = "react2026:envioId"

  const resetAll = () => {
    setStep(1)
    setConsentimentoDados(false)
    setAutorizacaoImagem(false)
    setAutorizacaoComunicacao(false)
    setFormData(EMPTY_FORM)
    setSubmitting(false)
    setSubmitted(false)
    setError(null)
    envioIdRef.current = ""
    try { sessionStorage.removeItem(CHAVE_ENVIO) } catch { /* modo anônimo */ }
  }

  /** uuid do navegador, com alternativa para quem não tem crypto.randomUUID. */
  const novoEnvioId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }
    return `envio-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  }

  /** O id deste envio: o da memória, o que sobreviveu a um recarregamento, ou um novo. */
  const obterEnvioId = () => {
    if (envioIdRef.current) return envioIdRef.current
    let id = ""
    try { id = sessionStorage.getItem(CHAVE_ENVIO) || "" } catch { /* modo anônimo */ }
    if (!/^[A-Za-z0-9-]{8,60}$/.test(id)) id = novoEnvioId()
    envioIdRef.current = id
    try { sessionStorage.setItem(CHAVE_ENVIO, id) } catch { /* modo anônimo */ }
    return id
  }

  // Abre o modal quando qualquer botão de "Inscrição" dispara o evento global
  useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener(INSCRICAO_MODAL_EVENT, handleOpen)
    return () => window.removeEventListener(INSCRICAO_MODAL_EVENT, handleOpen)
  }, [])

  // Bloqueia o scroll do body enquanto o modal está aberto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  // Fecha com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open])

  const handleClose = () => {
    setOpen(false)
    // Reseta o formulário após a animação de saída
    setTimeout(resetAll, 300)
  }

  const podeAvancar =
    consentimentoDados && autorizacaoImagem && autorizacaoComunicacao

  const camposPreenchidos = Object.values(formData).every(
    (v) => v.trim().length > 0,
  )

  const updateField = (field: keyof FormData) => (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!camposPreenchidos) return

    setSubmitting(true)
    setError(null)

    const envioId = obterEnvioId()

    try {
      // Fala com a NOSSA rota (mesma origem). Ela repassa ao Apps Script pelo
      // servidor. Antes o navegador chamava o script.google.com direto e, dentro
      // do iframe do triunfae.com.br, a resposta demorava ou nunca voltava: o
      // botão ficava girando.
      const resposta = await fetch("/api/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          consentimentoDados,
          autorizacaoImagem,
          autorizacaoComunicacao,
          envioId,
        }),
      })

      const dados = (await resposta.json().catch(() => null)) as
        | { result?: string; error?: string }
        | null

      // Só mostra sucesso se a inscrição foi REALMENTE gravada na planilha.
      if (resposta.ok && dados?.result === "success") {
        setSubmitted(true)
        return
      }

      // 'indefinido': o servidor não conseguiu nem confirmar nem desmentir. A
      // inscrição pode ter entrado — mandar "tente de novo" aqui foi o que fez
      // gente reenviar uma inscrição que já estava gravada.
      if (dados?.result === "indefinido") {
        setError(
          dados.error ||
            "Sua inscrição pode ter sido registrada, mas não conseguimos confirmar agora. " +
              "Aguarde nosso contato antes de enviar de novo.",
        )
        return
      }

      throw new Error(dados?.error || "resposta inesperada do servidor")
    } catch (err) {
      console.error("[inscricao] falha no envio", err)
      setError(
        "Não foi possível enviar sua inscrição agora. Tente novamente em instantes.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-4 py-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl px-6 py-10 sm:px-8"
          >
            <button
              onClick={handleClose}
              aria-label="Fechar"
              className="absolute top-5 right-5 z-10 text-foreground/40 hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                Pré Cadastro
              </p>
              <h2 className="font-serif text-3xl font-light text-foreground mb-4">
                React Brasil
              </h2>
              <p className="text-muted-foreground text-sm">
                Evento fechado. As inscrições passam por análise e aprovação.
              </p>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center text-center gap-3 py-6">
                <CheckCircle2 className="w-10 h-10 text-foreground" />
                <p className="text-foreground font-medium">
                  Pré-cadastro enviado com sucesso!
                </p>
                <p className="text-muted-foreground text-sm">
                  Sua inscrição será analisada e você receberá um retorno em
                  breve.
                </p>
              </div>
            ) : (
              <>
                {/* Indicador de etapas */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span
                    className={`h-1.5 w-8 rounded-full transition-colors ${
                      step === 1 ? "bg-foreground" : "bg-foreground/20"
                    }`}
                  />
                  <span
                    className={`h-1.5 w-8 rounded-full transition-colors ${
                      step === 2 ? "bg-foreground" : "bg-foreground/20"
                    }`}
                  />
                </div>

                {step === 1 && (
                  <div className="space-y-5">
                    <div className="text-sm text-muted-foreground leading-relaxed max-h-56 overflow-y-auto pr-1 border rounded-lg p-4 space-y-3">
                      <p className="font-medium text-foreground">
                        Política de Privacidade e Tratamento de Dados Pessoais
                      </p>
                      <p>
                        O REACT Brasil realizará a coleta dos dados pessoais
                        informados neste formulário exclusivamente para fins
                        relacionados à organização e realização do evento.
                      </p>
                      <p>Os dados poderão ser utilizados para:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>processamento e confirmação da inscrição;</li>
                        <li>emissão de credenciais e crachás;</li>
                        <li>controle de acesso ao evento;</li>
                        <li>
                          comunicação com os participantes antes, durante e
                          após o evento;
                        </li>
                        <li>
                          envio de informações relativas à programação,
                          alterações e orientações operacionais;
                        </li>
                        <li>registro da participação no evento.</li>
                      </ul>
                      <p>
                        Os dados poderão ser compartilhados, exclusivamente
                        para essas finalidades, com empresas responsáveis pela
                        operação do evento, incluindo plataformas de
                        inscrição, credenciamento, impressão de crachás,
                        organização, recepção e suporte tecnológico, sempre
                        observando os princípios da Lei Geral de Proteção de
                        Dados (Lei nº 13.709/2018).
                      </p>
                      <p>
                        Os dados não serão comercializados nem utilizados para
                        finalidade diversa daquela informada neste
                        formulário. As informações serão armazenadas pelo
                        prazo necessário ao cumprimento das finalidades acima
                        e das obrigações legais aplicáveis, sendo
                        posteriormente eliminadas ou anonimizadas quando não
                        houver mais necessidade de sua manutenção.
                      </p>
                      <p>Ao prosseguir com a inscrição, o participante declara que:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          leu e compreendeu esta Política de Tratamento de
                          Dados;
                        </li>
                        <li>
                          concorda com a coleta e utilização de seus dados
                          pessoais para as finalidades acima descritas;
                        </li>
                        <li>
                          autoriza o envio de comunicações relacionadas ao
                          REACT Brasil.
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                          checked={consentimentoDados}
                          onCheckedChange={(v) =>
                            setConsentimentoDados(v === true)
                          }
                          className="mt-0.5"
                        />
                        <span className="text-sm text-foreground/90 leading-relaxed">
                          Li a Política de Tratamento de Dados Pessoais do
                          REACT Brasil e autorizo a coleta e o tratamento dos
                          meus dados para as finalidades informadas.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                          checked={autorizacaoImagem}
                          onCheckedChange={(v) =>
                            setAutorizacaoImagem(v === true)
                          }
                          className="mt-0.5"
                        />
                        <span className="text-sm text-foreground/90 leading-relaxed">
                          Autorizo a utilização de minha imagem captada
                          durante o evento para divulgação institucional do
                          REACT Brasil, em seus canais de comunicação, sem
                          qualquer ônus.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                          checked={autorizacaoComunicacao}
                          onCheckedChange={(v) =>
                            setAutorizacaoComunicacao(v === true)
                          }
                          className="mt-0.5"
                        />
                        <span className="text-sm text-foreground/90 leading-relaxed">
                          Autorizo o envio de comunicações sobre futuras
                          edições do REACT Brasil e eventos relacionados.
                        </span>
                      </label>
                    </div>

                    <button
                      type="button"
                      disabled={!podeAvancar}
                      onClick={() => setStep(2)}
                      className="w-full bg-foreground text-background text-sm font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Avançar
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        required
                        value={formData.nome}
                        onChange={updateField("nome")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        required
                        type="tel"
                        value={formData.telefone}
                        onChange={updateField("telefone")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        required
                        type="email"
                        value={formData.email}
                        onChange={updateField("email")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        required
                        value={formData.cpf}
                        onChange={updateField("cpf")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="empresa">Empresa *</Label>
                      <Input
                        id="empresa"
                        required
                        value={formData.empresa}
                        onChange={updateField("empresa")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cargo">Cargo *</Label>
                      <Input
                        id="cargo"
                        required
                        value={formData.cargo}
                        onChange={updateField("cargo")}
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-destructive text-center">
                        {error}
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 border border-input text-sm font-medium px-6 py-3 rounded-full hover:bg-accent transition-colors"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !camposPreenchidos}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-foreground text-background text-sm font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {submitting && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        Enviar inscrição
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}