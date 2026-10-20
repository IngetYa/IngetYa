import "@/scss/lib/_RippleButton.scss"
import { Colors } from "@/core/Colors"
import { kel } from "@/core/kel"
import type { IAny } from "@/types/LibTypes"

// ANDROID RIPPLE ALA-ALA

export interface IRipplesOptions {
  color?: string
  run?: (e: IAny) => void
}

export interface IRippleReturn {
  stopListener: () => void
  changeColor: (color: string) => void
}

// main function
export function SetRipple(btn: HTMLElement, options?: IRipplesOptions): IRippleReturn {
  // warna ripple
  let rippleColor = options?.color || Colors.sgray

  // next function
  const rippleRun = options?.run

  // listener adder
  const rippleListener = (e: PointerEvent) => {
    e.preventDefault()

    // kalo ada next function, langsung jalanin
    if (rippleRun) rippleRun(e)

    const target = e.target
    // kalo yang diklik bukan html element, jangan lanjut
    if (target instanceof HTMLElement === false) return

    // cari ukuran berdasarkan element
    const rect = btn.getBoundingClientRect()
    // titik lebar
    const x = e.clientX - rect.left
    // titik ketinggian
    const y = e.clientY - rect.top

    // bikin element ripples (tadinya ripple, tapi biar ga campur aduk)
    const ripples = kel("span", "ripples")
    ripples.style.backgroundColor = rippleColor

    const width = rect.width
    const height = rect.height

    // pake ukuran yg paling maksimal
    const square = width > height ? width : height

    // css width height
    ripples.style.width = `${square}px`
    ripples.style.height = `${square}px`

    // css (absolute) top left
    ripples.style.left = `${x}px`
    ripples.style.top = `${y}px`
    btn.appendChild(ripples)

    setTimeout(() => ripples.remove(), 500)
  }

  // bind listener ke next function saat click
  btn.addEventListener("click", rippleListener)

  // stop listenernya
  const stopListener = () => btn.removeEventListener("click", rippleListener)

  // live color changer
  // rencana buat light/dark mode
  const changeColor = (color: string) => (rippleColor = color)

  return { stopListener, changeColor }
}
