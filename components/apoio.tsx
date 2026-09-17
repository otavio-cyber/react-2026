"use client"

import Image from "next/image"
import { motion } from "framer-motion"

type Sponsor = {
  name: string
  src: string
}

/**
 * Os arquivos em /sponsors/norm/ são versões normalizadas dos originais.
 * O desalinhamento da parede de logos não vinha do CSS: vinha da arte. Cada
 * arquivo trazia uma quantidade diferente de margem vazia (o Campana Pacca
 * tinha 208px de nada em cima e embaixo; o Lotus, 870px) e uma proporção
 * diferente, então a mesma caixa CSS rendia tamanhos aparentes muito
 * diferentes — e a gente compensava com um `scale` chutado por logo.
 *
 * Agora cada arte é recortada na tinta e reescalada para que a ÁREA do desenho
 * seja a mesma em todos, centralizada numa tela única de 1200x600. É a área, e
 * não a altura nem a largura, que faz um wordmark comprido e um emblema
 * quadrado pesarem igual ao olho. Por isso aqui não há mais fator por logo:
 * é só object-contain. Receita em scratchpad/logos_normalizar.py.
 */

// Patrocínio Institucional (cota 30k). A ORDEM é definida pelo cliente e a
// grade tem 5 colunas, então esta lista é lida como duas fileiras de cinco.
const institucional: Sponsor[] = [
  // 1ª fileira
  { name: "Ártico Capital", src: "/sponsors/norm/artico-capital.webp" },
  { name: "Okno Capital", src: "/sponsors/norm/okno-capital.webp" },
  { name: "Mazzotini Advogados Associados", src: "/sponsors/norm/mazzotini.webp" },
  { name: "Strategi Capital", src: "/sponsors/norm/strategi-capital.webp" },
  { name: "Grupo ADGM Soluções Financeiras", src: "/sponsors/norm/adgm.webp" },
  // 2ª fileira
  { name: "Keppler Advogados Associados", src: "/sponsors/norm/keppler.webp" },
  { name: "Campana Pacca Advogados", src: "/sponsors/norm/campana-pacca.webp" },
  { name: "Bismarchi Pires Sociedade de Advogados", src: "/sponsors/norm/bismarchi-pires.webp" },
  { name: "Luiz Trindade Advogados Special Sits", src: "/sponsors/norm/luiz-trindade.webp" },
  { name: "BBMOV Sociedade de Advogados", src: "/sponsors/norm/bbmov.webp" },
]

// Apoio
const apoio: Sponsor[] = [
  { name: "Anfac", src: "/sponsors/norm/anfac.webp" },
  { name: "Multiplica", src: "/sponsors/norm/multiplica.webp" },
  { name: "STG Advogados", src: "/sponsors/norm/stg-advogados.webp" },
  { name: "Daniele Banco", src: "/sponsors/norm/daniele-banco.webp" },
  { name: "Lotus", src: "/sponsors/norm/lotus.webp" },
]

function SponsorLogo({ sponsor, size = "default" }: { sponsor: Sponsor; size?: "default" | "small" }) {
  // A caixa tem a mesma proporção 2:1 da tela normalizada, então cada logo
  // ocupa a célula inteira e todos caem no mesmo eixo, sem sobra de um lado só.
  const largura = size === "small" ? "max-w-[11rem]" : "max-w-[15rem]"

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      /* No celular a grade tem 2 colunas, então numa lista ímpar o último logo
         fica sozinho na fileira, encostado na esquerda. `last:odd` pega
         exatamente esse caso (é o último E está em posição ímpar): a célula
         passa a ocupar as duas colunas e o conteúdo centraliza. O `max-w`
         devolve a largura de UMA coluna — metade do vão, menos metade do gap
         de 2rem — senão o órfão sairia maior que os vizinhos, que é o oposto
         do alinhamento que se quer. Acima de `sm` nada disso se aplica. */
      className="w-full flex justify-center
                 last:odd:col-span-2 last:odd:max-w-[calc(50%-1rem)]
                 sm:last:odd:col-span-1 sm:last:odd:max-w-none"
    >
      <div className={`w-full aspect-2/1 ${largura}`}>
        <Image
          src={sponsor.src}
          alt={sponsor.name}
          width={1200}
          height={600}
          className="w-full h-full object-contain"
        />
      </div>
    </motion.div>
  )
}

export function Apoio() {
  return (
    <section id="apoio" className="py-24 md:py-32 bg-secondary">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground">
            Patrocínio Institucional
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
          {/* Grade, não flex-wrap: com 10 logos dão 2 fileiras cheias de 5, na
              ordem pedida, e cada logo cai numa coluna. No flex-wrap a última
              fileira ficava centralizada e desencontrada da de cima. */}
          <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-8 place-items-center">
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
          {/* 5 logos: uma fileira só a partir do desktop. */}
          <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-6 place-items-center">
            {apoio.map((sponsor) => (
              <SponsorLogo key={sponsor.name} sponsor={sponsor} size="small" />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
