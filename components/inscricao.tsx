"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, X } from "lucide-react"
import { INSCRICAO_MODAL_EVENT } from "@/lib/inscricao-modal"

// URL do Google Forms em modo embutido (iframe)
const GOOGLE_FORM_EMBED_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe7NQJCzUQBMFzLPqCziuNaRjzm8BI2nTULVW4FaQg7ojODIg/viewform?embedded=true"

export function Inscricao() {
  const [open, setOpen] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)

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
    // Reseta o estado do iframe após a animação de saída
    setTimeout(() => {
      setIframeLoading(true)
    }, 300)
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

            <div className="relative w-full" style={{ minHeight: iframeLoading ? "400px" : "auto" }}>
              {iframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-foreground/40" />
                </div>
              )}
              <iframe
                title="Formulário de inscrição"
                src={GOOGLE_FORM_EMBED_URL}
                onLoad={() => setIframeLoading(false)}
                className="w-full"
                style={{ height: 900, opacity: iframeLoading ? 0 : 1, transition: "opacity 0.3s ease" }}
                frameBorder={0}
                marginHeight={0}
                marginWidth={0}
              >
                Carregando…
              </iframe>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}