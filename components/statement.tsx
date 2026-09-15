"use client"

import { motion } from "framer-motion"

export function Statement() {
  return (
    <section className="py-24 md:py-32 bg-gray-950">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          whileInView={{ opacity: 1, letterSpacing: "0em" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-serif text-2xl md:text-4xl font-light text-white leading-relaxed"
        >
          Participar do REACT é estar inserido onde as discussões acontecem com profundidade e as conexões geram oportunidades.
        </motion.p>
      </div>
    </section>
  )
}