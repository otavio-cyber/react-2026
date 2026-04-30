import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'REACT Brasil 2026 | Reestruturação, Ativos, Crédito e Transação Tributária',
  description: 'Um encontro reservado para os principais agentes do ecossistema de reestruturação empresarial no Brasil. 02 de novembro de 2026 - Tivoli Mofarrej, São Paulo.',
  generator: 'v0.app',
  keywords: ['REACT Brasil', 'reestruturação empresarial', 'TMA Brasil', 'transação tributária', 'crédito', 'ativos'],
  authors: [{ name: 'Triunfae' }, { name: 'Bento Muniz Advogados' }],
  openGraph: {
    title: 'REACT Brasil 2026',
    description: 'O encontro que antecede o principal congresso da América Latina',
    type: 'website',
    locale: 'pt_BR',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
