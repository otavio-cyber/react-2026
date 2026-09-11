"use client"

import Image from "next/image"
import { motion } from "framer-motion"

type Sponsor = {
  name: string
  src: string
  width: number
  height: number
  // Fator de escala visual (1 = tamanho padrão). Usado para equilibrar
  // logos que "pesam" mais que os outros por conta da própria arte.
  scale?: number
}

// Institucional (cota 30k)
const institucional: Sponsor[] = [
  { name: "Ártico Capital", src: "/sponsors/artico-capital.webp", width: 900, height: 103 },
  { name: "Okno Capital", src: "/sponsors/okno-capital.webp", width: 900, height: 432, scale: 0.9 },
  { name: "Strategi Capital", src: "/sponsors/strategi-capital.webp", width: 197, height: 128, scale: 0.9 },
  { name: "Mazzotini Advogados Associados", src: "/sponsors/mazzotini.webp", width: 900, height: 135 },
  { name: "Keppler Advogados Associados", src: "/sponsors/keppler.webp", width: 900, height: 334, scale: 0.9 },
  { name: "Bismarchi Pires Sociedade de Advogados", src: "/sponsors/bismarchi-pires.webp", width: 900, height: 549 },
  { name: "Luiz Trindade Advogados Special Sits", src: "/sponsors/luiz-trindade.webp", width: 900, height: 372, scale: 0.9 },
  { name: "Campana Pacca Advogados", src: "/sponsors/campana-pacca.webp", width: 900, height: 540, scale: 1.23 },
  { name: "BBMOV Sociedade de Advogados", src: "/sponsors/bbmov.webp", width: 900, height: 260, scale: 0.9 },
]

// Apoio Acadêmico
const apoioAcademico: Sponsor[] = [
  { name: "Anfac", src: "/sponsors/anfac.webp", width: 250, height: 67 },
  { name: "Multiplica", src: "/sponsors/multiplica.webp", width: 900, height: 177 },
  { name: "STG Advogados", src: "/sponsors/stg-advogados.webp", width: 900, height: 209 },
]

function SponsorLogo({ sponsor, size = "default" }: { sponsor: Sponsor; size?: "default" | "small" }) {
  const sizeClasses =
    size === "small"
      ? "h-8 w-24 sm:h-10 sm:w-28"
      : "h-20 w-40 sm:h-24 sm:w-48"

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={`flex items-center justify-center ${sizeClasses}`}
    >
      <Image
        src={sponsor.src}
        alt={sponsor.name}
        width={sponsor.width}
        height={sponsor.height}
        style={sponsor.scale ? { transform: `scale(${sponsor.scale})` } : undefined}
        className="max-h-full max-w-full w-auto h-auto object-contain"
      />
    </motion.div>
  )
}

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
          
          <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground">
            Apoio Institucional
          </h2>
        </motion.div>

        {/* Institucional */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          className="mb-24 md:mb-28"
        >
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
            {institucional.map((sponsor) => (
              <SponsorLogo key={sponsor.name} sponsor={sponsor} />
            ))}
          </div>
        </motion.div>

        {/* Apoio */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
        >
          <p className="text-base sm:text-lg uppercase tracking-widest text-muted-foreground mb-8 text-center">
            Apoio
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
            {apoioAcademico.map((sponsor) => (
              <SponsorLogo key={sponsor.name} sponsor={sponsor} size="small" />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}