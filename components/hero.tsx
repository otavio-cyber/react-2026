"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { openInscricaoModal } from "@/lib/inscricao-modal"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export function Hero() {
  return (
    // py-28 reserva o espaço da barra de menu, que é fixa e tem h-20 (80px).
    // Sem isso, em tela baixa (1366x640, 1280x600) o conteúdo centralizado
    // subia e a pílula "2ª Edição · 2026" entrava por baixo de "Sobre",
    // "Programação" e "Palestrantes". Como o padding é simétrico, ele NÃO
    // desloca nada em tela alta — só impede que o miolo suba demais, deixando
    // a seção crescer além da janela quando não couber.
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden py-28">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/bg_hero.webp')" }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/50 to-black/30" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.2, duration: 0.6 }}
          /* Em janela baixa os vãos encolhem, para o botão de inscrição não
             cair abaixo da dobra depois que o py-28 reservou a barra. */
          className="mb-8 [@media(max-height:700px)]:mb-4"
        >
          <span className="inline-block border border-white/40 text-white text-xs uppercase tracking-widest px-4 py-2 rounded-full">
            2ª Edição · 2026
          </span>
        </motion.div>

        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-6"
        >
          <div className="w-100 mx-auto">
            <Image
              src="/logo_aprovado_branco.png"
              alt="REACT Brasil"
              width={400}
              height={160}
              className="w-full h-auto"
              priority
            />
          </div>
        </motion.div>

        <motion.p
          {...fadeInUp}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="text-white/60 max-w-xl mx-auto mb-8 leading-relaxed"
        >
          Um encontro reservado para os principais agentes do ecossistema de reestruturação empresarial no Brasil.
        </motion.p>

        {/* Data e local — o traço vertical some no celular, onde as duas
            informações passam a ocupar uma linha cada. */}
        <motion.div
          {...fadeInUp}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mb-10 [@media(max-height:700px)]:mb-5 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 text-white/85"
        >
          <span className="text-sm sm:text-base tracking-wide">
            02 de novembro de 2026
          </span>
          <span aria-hidden="true" className="hidden sm:block h-4 w-px bg-white/30" />
          <span className="text-sm sm:text-base tracking-wide">
            Hotel Tivoli Mofarrej · São Paulo
          </span>
        </motion.div>

        <motion.button
          {...fadeInUp}
          transition={{ delay: 1.3, duration: 0.6 }}
          onClick={openInscricaoModal} whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="border border-white text-white bg-transparent px-8 py-4 text-sm tracking-wider uppercase hover:bg-white hover:text-black transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Solicitar participação
        </motion.button>

        <motion.p
          {...fadeInUp}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="text-white/40 text-xs tracking-widest uppercase mt-8"
        >
          Evento fechado · Participação sujeita à aprovação
        </motion.p>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border border-white/30 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}