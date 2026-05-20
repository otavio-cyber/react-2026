"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"

const navLinks = [
  { href: "#inicio", label: "Início" },
  { href: "#sobre", label: "Sobre" },
  { href: "https://reactbrasil.com.br", label: "Evento 2025" },
  { href: "#local", label: "Local e Data" },
  { href: "#apoio", label: "Apoio Institucional" },
  { href: "#inscricao", label: "Inscrição" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("inicio")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault()

    const element = document.getElementById(href.slice(1))

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      })
    }

    setMobileMenuOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
        }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <a
            href="#inicio"
            onClick={(e) => handleClick(e, "#inicio")}
          >
            <Image
              src="/logo-light.png"
              alt="REACT Brasil"
              width={126}
              height={42}
              className="h-15.25 w-auto"
              style={{ width: "auto" }}
              priority
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isExternal = link.href.startsWith("http")

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={
                    isExternal
                      ? undefined
                      : (e) => handleClick(e, link.href)
                  }
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className={`relative text-sm tracking-wide transition-colors ${scrolled
                      ? "text-gray-600 hover:text-gray-900"
                      : "text-white/80 hover:text-white"
                    }`}
                >
                  {link.label}

                  {!isExternal &&
                    activeSection === link.href.slice(1) && (
                      <motion.div
                        layoutId="activeSection"
                        className={`absolute -bottom-1 left-0 right-0 h-px ${scrolled
                            ? "bg-gray-900"
                            : "bg-white"
                          }`}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                </a>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() =>
              setMobileMenuOpen(!mobileMenuOpen)
            }
            className={`md:hidden p-2 ${scrolled
                ? "text-gray-900"
                : "text-white"
              }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => {
                const isExternal = link.href.startsWith("http")

                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={
                      isExternal
                        ? () => setMobileMenuOpen(false)
                        : (e) => handleClick(e, link.href)
                    }
                    target={
                      isExternal ? "_blank" : undefined
                    }
                    rel={
                      isExternal
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="text-gray-900 text-sm tracking-wide py-2"
                  >
                    {link.label}
                  </a>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}