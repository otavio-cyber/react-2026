"use client"

import { motion } from "framer-motion"

// Substituir os placeholders pelos logos reais em /public/sponsors/
const sponsors = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  name: `Patrocinador ${i + 1}`,
}))

export function Apoio() {
  return (
    <section id="apoio" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Patrocinadores e parceiros da 2a edicao
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground">
            Apoio Institucional
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="flex flex-wrap justify-center gap-6"
        >
          {sponsors.map((sponsor) => (
            <motion.div
              key={sponsor.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="w-48 h-28 bg-card border border-border rounded-xl shadow-sm flex items-center justify-center hover:grayscale transition-all duration-300"
            >
              <span className="text-muted-foreground/30 text-sm">Em breve</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
