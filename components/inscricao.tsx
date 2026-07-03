"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, X } from "lucide-react"
import { INSCRICAO_MODAL_EVENT } from "@/lib/inscricao-modal"

interface FormData {
  nome: string
  sobrenome: string
  celular: string
  email: string
  cpf: string
  empresa: string
  cargo: string
}

const initialFormData: FormData = {
  nome: "",
  sobrenome: "",
  celular: "",
  email: "",
  cpf: "",
  empresa: "",
  cargo: "",
}

const fieldLabels: Record<keyof FormData, string> = {
  nome: "Nome",
  sobrenome: "Sobrenome",
  celular: "Celular",
  email: "E-mail",
  cpf: "CPF",
  empresa: "Empresa",
  cargo: "Cargo",
}

const fieldTypes: Record<keyof FormData, string> = {
  nome: "text",
  sobrenome: "text",
  celular: "tel",
  email: "email",
  cpf: "text",
  empresa: "text",
  cargo: "text",
}

export function Inscricao() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

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
    // Reseta o estado após a animação de saída
    setTimeout(() => {
      setSuccess(false)
      setError(null)
      setFormData(initialFormData)
    }, 300)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("https://formspree.io/f/xvznrlpr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Erro ao enviar solicitação")
      }

      setSuccess(true)
    } catch (err) {
      setError("Ocorreu um erro. Por favor, tente novamente.")
      console.error(err)
    } finally {
      setLoading(false)
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
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl px-6 py-10 sm:px-10"
          >
            <button
              onClick={handleClose}
              aria-label="Fechar"
              className="absolute top-5 right-5 text-foreground/40 hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                Solicitar Participação
              </p>
              <h2 className="font-serif text-3xl font-light text-foreground mb-4">
                Solicite sua participação
              </h2>
              <p className="text-muted-foreground text-sm">
                Evento fechado. As inscrições passam por análise e aprovação.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-8 h-8 text-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl font-light text-foreground mb-2">
                    Solicitação recebida
                  </h3>
                  <p className="text-muted-foreground mb-8">
                    Entraremos em contato em breve.
                  </p>
                  <button
                    onClick={handleClose}
                    className="border border-foreground/20 text-foreground px-6 py-3 text-sm tracking-wide hover:bg-foreground hover:text-background transition-colors"
                  >
                    Fechar
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  {(["nome", "sobrenome", "celular", "email", "cpf", "empresa", "cargo"] as const).map((field) => (
                    <div key={field} className="relative">
                      <label
                        htmlFor={field}
                        className={`absolute left-0 transition-all duration-200 pointer-events-none ${focusedField === field || formData[field]
                            ? "-top-5 text-xs text-muted-foreground"
                            : "top-2 text-foreground/40"
                          }`}
                      >
                        {fieldLabels[field]}
                      </label>
                      <input
                        type={fieldTypes[field]}
                        id={field}
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        onFocus={() => setFocusedField(field)}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full bg-transparent border-b border-border py-2 text-foreground focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                  ))}

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-destructive text-sm"
                    >
                      {error}
                    </motion.p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.99 }}
                    className="w-full bg-foreground text-background py-4 text-sm tracking-wider uppercase hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Solicitar participação"
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}