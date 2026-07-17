"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { INSCRICAO_MODAL_EVENT } from "@/lib/inscricao-modal"

const CONTATO_EMAIL = "renata.abrahao@triunfae.com.br"
const CONTATO_ASSUNTO = "Quero Participar do React Brasil 2026"

export function Inscricao() {
  const [open, setOpen] = useState(false)

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
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl px-6 py-10 sm:px-2 sm:pt-10"
          >
            <button
              onClick={handleClose}
              aria-label="Fechar"
              className="absolute top-5 right-5 z-10 text-foreground/40 hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6 px-4 sm:px-8">
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

            <div className="px-4 sm:px-8 pb-2">
              <p className="text-foreground/90 text-base leading-relaxed text-center">
                O seu convite para o React Brasil é pessoal e intransferível, por favor envie
                email para{" "}
                <a
                  href={`mailto:${CONTATO_EMAIL}?subject=${encodeURIComponent(CONTATO_ASSUNTO)}`}
                  className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/70 transition-colors"
                >
                  {CONTATO_EMAIL}
                </a>{" "}
                com o assunto: <span className="font-medium text-foreground">"{CONTATO_ASSUNTO}"</span>{" "}
                que faremos a sua inscrição.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}