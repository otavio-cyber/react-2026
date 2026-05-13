"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export function Experiencia() {
  return (
    <section className="py-24 md:py-32 bg-secondary">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Experiência
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-6">
              Jantar de Confraternização
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao final da programação, o jantar de confraternização segue como parte essencial do REACT — um momento dedicado à interação, conexão e aprofundamento das relações entre os participantes.
            </p>
          </motion.div>

          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden rounded-lg group"
            >
              <Image
                src="/highlight/experiencia-left.webp"
                alt="Jantar REACT Brasil"
                width={300}
                height={400}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  className="text-white text-sm tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0"
                >
                  Networking exclusivo
                </motion.p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden rounded-lg group"
            >
              <Image
                src="/highlight/experiencia-right.webp"
                alt="Jantar REACT Brasil"
                width={300}
                height={400}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  className="text-white text-sm tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0"
                >
                  Conexões de alto nível
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}