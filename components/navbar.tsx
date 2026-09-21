"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"

const navLinks = [
  { href: "#sobre", label: "Sobre" },
  { href: "#programacao", label: "Programação" },
  { href: "#palestrantes", label: "Palestrantes" },
  { href: "#apoio", label: "Patrocinadores" },
  { href: "#local", label: "Local" },
  // Antes levava para fora (evento2025.reactbrasil.com.br); agora desce até a
  // galeria da edição passada, que já vive nesta página.
  { href: "#galeria", label: "React 2025" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("inicio")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      const sections = navLinks
        .filter((link) => link.href.startsWith("#"))
        .map((link) => link.href.slice(1))

      for (const section of sections.reverse()) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [mobileMenuOpen])

  // Bloqueia scroll do body quando menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  const handleInternalClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    setTimeout(() => {
      const element = document.getElementById(href.slice(1))
      if (element) element.scrollIntoView({ behavior: "smooth" })
    }, 150)
  }

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
        }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          {/* Logo — lado esquerdo, mantém espaço sempre.
              A arte é deitada (5,05:1), então a ALTURA vem da largura da caixa,
              e a largura é o que dá ou tira legibilidade da tagline.
              Três faixas, porque o espaço disponível muda muito:
                celular  — não há menu, só o botão sanduíche: cabe bem largo;
                md a lg  — é a faixa apertada. Medido em 820px: sobram 45px
                           entre o logo e o primeiro item do menu, então aqui
                           alargar empurraria o menu para cima dele;
                lg+      — sobram 233px, dá para dar presença ao logo. */}
          <div className="w-[200px] md:w-[126px] lg:w-[260px] flex-shrink-0">
            <AnimatePresence mode="wait">
              {scrolled ? (
                <motion.a
                  key="logo-visible"
                  href="#inicio"
                  onClick={(e) => handleInternalClick(e, "#inicio")}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src="/logo-deitado.png"
                    alt="REACT Brasil"
                    width={3092}
                    height={612}
                    className="w-full h-auto"
                    priority
                  />
                </motion.a>
              ) : (
                <motion.div
                  key="logo-hidden"
                  aria-hidden="true"
                  className="opacity-0 pointer-events-none"
                >
                  <Image
                    src="/logo-deitado.png"
                    alt=""
                    width={3092}
                    height={612}
                    className="w-full h-auto"
                    priority
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 flex-nowrap">
            {navLinks.map((link) => {
              const isExternal = link.href.startsWith("http")
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={isExternal ? undefined : (e) => handleInternalClick(e, link.href)}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className={`relative text-sm tracking-wide transition-colors whitespace-nowrap ${scrolled
                      ? "text-gray-600 hover:text-gray-900"
                      : "text-white/80 hover:text-white"
                    }`}
                >
                  {link.label}
                  {!isExternal && activeSection === link.href.slice(1) && (
                    <motion.div
                      layoutId="activeSection"
                      className={`absolute -bottom-1 left-0 right-0 h-px ${scrolled ? "bg-gray-900" : "bg-white"
                        }`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`md:hidden p-2 rounded-md transition-colors ${scrolled || mobileMenuOpen
                ? "text-gray-900 hover:bg-gray-100"
                : "text-white hover:bg-white/10"
              }`}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  <X size={24} />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  <Menu size={24} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 top-20 bg-black/40 z-40"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Menu panel */}
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden relative z-50 bg-white border-t border-gray-100 shadow-lg"
            >
              <div className="px-6 py-4 flex flex-col">
                {navLinks.map((link, index) => {
                  const isExternal = link.href.startsWith("http")
                  return (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.2 }}
                      onClick={
                        isExternal
                          ? () => setMobileMenuOpen(false)
                          : (e) => handleInternalClick(e, link.href)
                      }
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className={`flex items-center justify-between text-sm tracking-wide py-3.5 border-b border-gray-50 last:border-0 transition-colors ${!isExternal && activeSection === link.href.slice(1)
                          ? "text-gray-900 font-medium"
                          : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                      {link.label}
                      {isExternal && (
                        <span className="text-xs text-gray-400 ml-2">↗</span>
                      )}
                    </motion.a>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
