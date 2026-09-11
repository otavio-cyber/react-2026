"use client"

import { motion } from "framer-motion"
import { Users, Target, Building2, Sparkles } from "lucide-react"

const cards = [
  { icon: Users, title: "Dois painéis temáticos", subtitle: "Discussões técnicas e diretas" },
  { icon: Target, title: "Foco em execução", subtitle: "Tomada de decisão" },
  { icon: Building2, title: "Especialistas e investidores", subtitle: "Autoridades do setor" },
  { icon: Sparkles, title: "Formato enxuto", subtitle: "Alta curadoria" },
]

export function Sobre() {
  return (
    <section id="sobre" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">

        {/* Texto em duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Coluna esquerda: tagline + título + 1º parágrafo */}
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
              className="font-serif text-2xl md:text-3xl font-light text-foreground mb-8 leading-tight text-balance"
            >
              REACT Brasil — Reestruturação, Ativos, Crédito e Transação Tributária
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground leading-relaxed"
            >
              O REACT Brasil – Reestruturação, Ativos, Crédito e Transação Tributária é um
              encontro reservado e altamente qualificado, criado para reunir os principais
              agentes do ecossistema de reestruturação empresarial, crédito, investimentos em
              situações especiais e regularização fiscal.
            </motion.p>
          </div>

          {/* Coluna direita: parágrafos 2 a 5 */}
          <div className="flex flex-col justify-center space-y-6 text-muted-foreground leading-relaxed">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              O evento reúne gestores, investidores, bancos, empresários, advogados, consultores
              e representantes do setor público para discutir, de forma técnica e prática, os
              principais desafios e oportunidades envolvendo turnaround, crédito, special
              situations, ativos, recuperação judicial e transação tributária.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Em 2025, a primeira edição reuniu cerca de 150 participantes de diversos estados.
              Para 2026, esperamos mais de 200 participantes, mantendo um público selecionado e
              número limitado de inscrições.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              A programação será composta por 1 keynote speech, 2 painéis técnicos e jantar de
              confraternização, combinando conteúdo de alto nível com relacionamento e networking
              qualificado.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              A 2ª edição será no dia 2 de novembro de 2026, no Hotel Tivoli Mofarrej, em São
              Paulo.
            </motion.p>
          </div>
        </div>

        {/* Cards em linha única */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="group bg-card border border-border rounded-xl p-5 flex flex-col gap-4
                         hover:border-foreground/30 hover:bg-muted/40 hover:-translate-y-0.5
                         transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center
                              group-hover:bg-background transition-colors duration-200">
                <card.icon className="w-5 h-5 text-foreground/70" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground leading-snug mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}