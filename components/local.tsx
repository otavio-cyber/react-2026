"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"

export function Local() {
  return (
    <section id="local" className="py-24 md:py-32 bg-background">
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
              Local e Data
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl font-light text-foreground mb-8"
            >
              Tivoli Mofarrej
            </motion.h2>

            <div className="space-y-6 text-muted-foreground leading-relaxed mb-10">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                O Tivoli Mofarrej foi novamente escolhido como sede do II REACT Brasil, reforçando o posicionamento do evento em um ambiente que combina excelência, tradição e infraestrutura de alto padrão.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Para esta edição, o REACT evolui também em sua experiência: o encontro será realizado em um auditório ainda mais amplo, proporcionando maior conforto e melhor dinâmica para os debates, sem perder o caráter reservado e qualificado que marca o evento.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <p className="text-2xl font-light text-foreground mb-1">02 de novembro de 2026</p>
              <p className="text-muted-foreground mb-1">16h às 22h</p>
              <p className="text-muted-foreground">São Paulo — SP</p>
            </motion.div>

            <motion.a
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              href="https://maps.google.com/?q=Tivoli+Mofarrej+São+Paulo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-foreground/20 text-foreground px-6 py-3 text-sm tracking-wide hover:bg-foreground hover:text-background transition-colors"
            >
              <MapPin className="w-6 h-6" />
              Como chegar
            </motion.a>
          </div>

         {/* Gallery */}
<div className="flex flex-col gap-4">
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay: 0.2 }}
    className="overflow-hidden rounded-lg flex-1"
  >
    <Image
      src="/highlight/local_img-above.webp"
      alt="REACT Brasil 2025"
      width={600}
      height={400}
      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
    />
  </motion.div>
  <div className="grid grid-cols-2 gap-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 }}
      className="overflow-hidden rounded-lg"
    >
      <Image
        src="/highlight/local-image-under-left.webp"
        alt="REACT Brasil 2025"
        width={300}
        height={200}
        className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500"
      />
    </motion.div>
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.4 }}
      className="overflow-hidden rounded-lg"
    >
      <Image
        src="/highlight/local_image_under_right.webp"
        alt="REACT Brasil 2025"
        width={300}
        height={200}
        className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500"
      />
    </motion.div>
  </div>
</div>
        </div>
      </div>
    </section>
  )
}
