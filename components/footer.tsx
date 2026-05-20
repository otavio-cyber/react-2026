import Image from "next/image"

export function Footer() {
  return (
    <footer className="py-16 bg-gray-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <Image
          src="/logo-white.png"
          alt="REACT Brasil"
          width={105}
          height={34}
          className="h-8.5 w-auto mx-auto opacity-40 mb-6"
          style={{ width: "auto" }}
        />

        <p className="text-white/30 text-sm mb-2">
          &copy; {new Date().getFullYear()} REACT Brasil - Todos os direitos reservados
        </p>

        <p className="text-white/20 text-xs">
          Realização: Triunfae - Bento Muniz Advogados
        </p>
      </div>
    </footer>
  )
}
