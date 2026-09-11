"use client"

import { motion } from "framer-motion"
import { Clock, Mic, MessagesSquare, Wine } from "lucide-react"

type ItemProgramacao = {
  horario: string
  titulo: string
  icon: typeof Clock
}

const itens: ItemProgramacao[] = [
  { horario: "16h30 – 17h00", titulo: "Check-in", icon: Clock },
  { horario: "17h00 – 17h30", titulo: "Keynote Speech", icon: Mic },
  { horario: "17h30 – 18h45", titulo: "Painel 1", icon: MessagesSquare },
  { horario: "18h45 – 20h00", titulo: "Painel 2", icon: MessagesSquare },
  { horario: "20h00 – 22h30", titulo: "Coquetel e Jantar", icon: Wine },
]

export function Programacao() {
  return (
    <section id="programacao" className="py-24 md:py-32 bg-secondary">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            O dia do evento
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground">
            Programação
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
        >
          {itens.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.horario + item.titulo}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                className={`flex items-center justify-between gap-4 py-5 ${
                  index !== itens.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.75} />
                  <span className="text-foreground/80 text-sm sm:text-base">{item.horario}</span>
                </div>
                <span className="text-foreground font-medium text-sm sm:text-base text-right">
                  {item.titulo}
                </span>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-muted-foreground text-sm mt-10"
        >
          Conteúdo em breve
        </motion.p>
      </div>
    </section>
  )
}
