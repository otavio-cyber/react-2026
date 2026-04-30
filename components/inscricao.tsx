"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

interface FormData {
  nome: string
  email: string
  empresa: string
}

export function Inscricao() {
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    empresa: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

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
      const response = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Erro ao enviar solicitacao")
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
    <section id="inscricao" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-lg px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Solicitar Participacao
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-4">
            Solicite sua participacao
          </h2>
          <p className="text-muted-foreground">
            Evento fechado. As inscricoes passam por analise e aprovacao.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
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
                Solicitacao recebida
              </h3>
              <p className="text-muted-foreground">
                Entraremos em contato em breve.
              </p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {(["nome", "email", "empresa"] as const).map((field) => (
                <div key={field} className="relative">
                  <label
                    htmlFor={field}
                    className={`absolute left-0 transition-all duration-200 pointer-events-none ${
                      focusedField === field || formData[field]
                        ? "-top-5 text-xs text-muted-foreground"
                        : "top-2 text-foreground/40"
                    }`}
                  >
                    {field === "nome" ? "Nome completo" : field === "email" ? "E-mail" : "Empresa"}
                  </label>
                  <input
                    type={field === "email" ? "email" : "text"}
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
                  "Solicitar participacao"
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
