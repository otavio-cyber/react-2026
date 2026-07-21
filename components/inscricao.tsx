"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, X } from "lucide-react"
import { INSCRICAO_MODAL_EVENT } from "@/lib/inscricao-modal"

// URL do Google Forms (abre em nova aba, fora do domínio do site)
const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe7NQJCzUQBMFzLPqCziuNaRjzm8BI2nTULVW4FaQg7ojODIg/viewform"

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

            <div className="px-4 sm:px-8 pb-2 flex flex-col items-center gap-4">
              <p className="text-foreground/80 text-sm text-center leading-relaxed">
                Preencha o formulário de pré-cadastro. Ele será aberto em uma
                nova aba, diretamente no Google Forms.
              </p>
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-foreground text-background text-sm font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
              >
                Preencher formulário
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}