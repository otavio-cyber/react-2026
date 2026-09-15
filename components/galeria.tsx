"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

const images = [
  { src: "/webp/064_reactbrasil001.webp",          alt: "REACT Brasil 2025 - 1" },
  { src: "/webp/090_reactbrasil001.webp",          alt: "REACT Brasil 2025 - 2" },
  { src: "/webp/072_reactbrasil001.webp",          alt: "REACT Brasil 2025 - 3" },
  { src: "/webp/103_reactbrasil001.webp",          alt: "REACT Brasil 2025 - 4" },
  { src: "/webp/124_reactbrasil001.webp",          alt: "REACT Brasil 2025 - 5" },
  { src: "/webp/236_reactbrasil001.webp",          alt: "REACT Brasil 2025 - 6" },
  { src: "/webp/258_reactbrasil001.webp",          alt: "REACT Brasil 2025 - 7" },
  { src: "/webp/jantar01_reactbrasil1.jpg.webp",   alt: "REACT Brasil 2025 - 8" },
  { src: "/webp/jantar02_reactbrasil222.jpg.webp", alt: "REACT Brasil 2025 - 9" },
]

const row1 = [0, 2]
const row2 = [1, 3, 4]
const row3 = [5, 6, 7, 8]

function GaleriaItem({
  image,
  index,
  className,
  onClick,
}: {
  image: { src: string; alt: string }
  index: number
  className: string
  onClick: (i: number) => void
}) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
      className={`relative overflow-hidden rounded-lg cursor-pointer group ${className}`}
      onClick={() => onClick(index)}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        loading="lazy"
        className="object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
    </motion.div>
  )
}

export function Galeria() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setSelectedIndex(index)
  const closeLightbox = () => setSelectedIndex(null)

  const goToPrevious = useCallback(() => {
    if (selectedIndex !== null)
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
  }, [selectedIndex])

  const goToNext = useCallback(() => {
    if (selectedIndex !== null)
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex! + 1)
  }, [selectedIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") goToPrevious()
      if (e.key === "ArrowRight") goToNext()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, goToPrevious, goToNext])

  return (
    <section id="galeria" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Galeria</p>
          <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground">
            REACT Brasil 2025
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
          }}
          className="space-y-4"
        >
          {/* Linha 1: 2 paisagens */}
          <div className="grid grid-cols-2 gap-4">
            {row1.map((i) => (
              <GaleriaItem key={images[i].src} image={images[i]} index={i} className="h-56" onClick={openLightbox} />
            ))}
          </div>

          {/* Linha 2: 2 retratos + 1 paisagem */}
          <div className="grid grid-cols-3 gap-4">
            {row2.map((i) => (
              <GaleriaItem key={images[i].src} image={images[i]} index={i} className="h-72" onClick={openLightbox} />
            ))}
          </div>

          {/* Linha 3: 2 retratos + 2 paisagens */}
          <div className="grid grid-cols-4 gap-4">
            {row3.map((i) => (
              <GaleriaItem key={images[i].src} image={images[i]} index={i} className="h-56" onClick={openLightbox} />
            ))}
          </div>
        </motion.div>

        {/* Acervo da edição de 2025. Os dois destinos são os mesmos que o site
            de 2025 usava: o álbum no Drive e o vídeo no YouTube. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="https://drive.google.com/drive/folders/1-AgqXWOdSR3JQaS0uq-XdmiRcMOP-ceE?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-center border border-foreground/20 text-foreground px-8 py-4 text-sm tracking-wider uppercase hover:bg-foreground hover:text-background transition-colors duration-300"
          >
            Veja as Fotos
          </a>
          <a
            href="https://www.youtube.com/watch?v=_U1OS09fVv4"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-center border border-foreground/20 text-foreground px-8 py-4 text-sm tracking-wider uppercase hover:bg-foreground hover:text-background transition-colors duration-300"
          >
            Confira o Vídeo
          </a>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X size={32} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious() }}
              className="absolute left-6 text-white/60 hover:text-white transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={48} />
            </button>

            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl max-h-[80vh] relative"
            >
              <Image
                src={images[selectedIndex!].src}
                alt={images[selectedIndex!].alt}
                width={1200}
                height={800}
                className="max-h-[80vh] w-auto object-contain"
              />
            </motion.div>

            <button
              onClick={(e) => { e.stopPropagation(); goToNext() }}
              className="absolute right-6 text-white/60 hover:text-white transition-colors"
              aria-label="Proximo"
            >
              <ChevronRight size={48} />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {selectedIndex! + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}