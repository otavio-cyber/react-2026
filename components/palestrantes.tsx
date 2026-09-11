"use client"

import Image from "next/image"
import { motion } from "framer-motion"

type Palestrante = {
  nome: string
  empresa: string
  src: string
}

// Ordem alfabética por nome
const palestrantes: Palestrante[] = [
  { nome: "André Rocha", empresa: "Triunfae", src: "/palestrantes/andre-rocha.webp" },
  { nome: "Arthur Dias", empresa: "Mazzotini Advogados", src: "/palestrantes/arthur-dias.webp" },
  { nome: "Carlos Occaso", empresa: "BBMOV", src: "/palestrantes/carlos-occaso.webp" },
  { nome: "Christian Lara", empresa: "Strategi Capital", src: "/palestrantes/christian-lara.webp" },
  { nome: "Daniel Bitman Garcia", empresa: "ADGM", src: "/palestrantes/daniel-bitman-garcia.webp" },
  { nome: "Gustavo Bismarchi", empresa: "Bismarchi Pires Advogados", src: "/palestrantes/gustavo-bismarchi.webp" },
  { nome: "João Pacca", empresa: "Campana Pacca", src: "/palestrantes/joao-pacca.webp" },
  { nome: "Luiz Trindade", empresa: "Luiz Trindade Advogados", src: "/palestrantes/luiz-trindade.webp" },
  { nome: "Renan Silveira", empresa: "Okno Capital", src: "/palestrantes/renan-silveira.webp" },
  { nome: "Roberto Keppler", empresa: "Keppler", src: "/palestrantes/roberto-keppler.webp" },
  { nome: "Victor Pinelli", empresa: "Ártico Capital", src: "/palestrantes/victor-pinelli.webp" },
]

export function Palestrantes() {
  return (
    <section id="palestrantes" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Quem participa
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground">
            Palestrantes
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
          }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12"
        >
          {palestrantes.map((p) => (
            <motion.div
              key={p.nome}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-background mb-4">
                <Image
                  src={p.src}
                  alt={p.nome}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-foreground font-medium text-sm">{p.nome}</p>
              <p className="text-muted-foreground text-xs mt-0.5">({p.empresa})</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
