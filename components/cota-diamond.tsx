"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { openInscricaoModal } from "@/lib/inscricao-modal"

const benefits = [
  "Palestrante em painel do evento",
  "+5 convites exclusivos para clientes e parceiros",
  "Ativacao de marca (brinde oficial do evento)",
  "Presenca em fundo de palco e backdrop",
  "Paineis de LED e banners institucionais",
  "Midias oficiais e mencoes durante o evento",
]

export function CotaDiamond() {
  return (
    <section className="py-24 md:py-32 bg-gray-950 relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Text Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block border border-white/20 text-white/60 text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-6"
            >
              Patrocinio
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl font-light text-white mb-6"
            >
              Cota Diamond
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/60 leading-relaxed mb-10"
            >
              A cota Diamond posiciona sua empresa no mais alto nivel de exposicao e relacionamento do evento, com participacao ativa na agenda e presenca institucional ao longo de toda a experiencia.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mb-10"
            >
              <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Investimento</p>
              <p className="text-4xl font-light text-white">R$ 30.000</p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              onClick={openInscricaoModal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="border border-white text-white bg-transparent px-8 py-4 text-sm tracking-wider uppercase hover:bg-white hover:text-black transition-all duration-300"
            >
              Quero ser patrocinador
            </motion.button>
          </div>

          {/* Benefits Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="bg-white/5 ring-1 ring-white/10 rounded-2xl p-8 relative overflow-hidden">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

              <h3 className="text-white text-lg font-medium mb-6">Beneficios inclusos</h3>

              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-3 text-white/70"
                  >
                    <Check className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
