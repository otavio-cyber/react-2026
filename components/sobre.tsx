"use client"

import { motion } from "framer-motion"
import { Users, Target, Building2, Sparkles } from "lucide-react"

const cards = [
  {
    icon: Users,
    title: "Dois paineis tematicos",
    subtitle: "Discussoes tecnicas e diretas",
  },
  {
    icon: Target,
    title: "Foco em execucao",
    subtitle: "Tomada de decisao",
  },
  {
    icon: Building2,
    title: "Especialistas e investidores",
    subtitle: "Autoridades do setor",
  },
  {
    icon: Sparkles,
    title: "Formato enxuto",
    subtitle: "Alta curadoria",
  },
]

export function Sobre() {
  return (
    <section id="sobre" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Text Content */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs uppercase tracking-widest text-muted-foreground mb-4"
            >
              Sobre o Evento
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl font-light text-foreground mb-8 leading-tight text-balance"
            >
              O encontro que antecede o principal congresso da America Latina
            </motion.h2>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                O REACT Brasil nasce como um forum tecnico dedicado a reestruturacao e transformacao empresarial, reunindo profissionais que atuam diretamente nas decisoes mais relevantes do setor.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Apos uma primeira edicao que conectou especialistas de diferentes regioes do pais, investidores, advogados, gestores e representantes do setor publico, o evento evolui em 2026 como um ambiente ainda mais estruturado, focado em profundidade e execucao.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                Mais do que um encontro preparatorio para o TMA Brasil, o REACT se consolida como um espaco estrategico, reservado e altamente qualificado.
              </motion.p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            {cards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-card border border-border rounded-lg p-6 hover:border-foreground/20 transition-colors"
              >
                <card.icon className="w-6 h-6 text-foreground/60 mb-4" />
                <h3 className="font-medium text-foreground text-sm mb-1">{card.title}</h3>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
