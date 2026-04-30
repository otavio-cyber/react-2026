import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Sobre } from "@/components/sobre"
import { Statement } from "@/components/statement"
import { Local } from "@/components/local"
import { Experiencia } from "@/components/experiencia"
import { Galeria } from "@/components/galeria"
import { Apoio } from "@/components/apoio"
import { CotaDiamond } from "@/components/cota-diamond"
import { Inscricao } from "@/components/inscricao"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Sobre />
      <Statement />
      <Local />
      <Experiencia />
      <Galeria />
      <Apoio />
      <CotaDiamond />
      <Inscricao />
      <Footer />
    </main>
  )
}
