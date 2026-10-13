import { Colors } from "@/core/Colors"
import { kel } from "@/core/kel"

export interface IRipplesOptions {
  color?: string
  run?: () => void
}

export interface IRippleReturn {
  stopListener: () => void
  changeColor: (color: string) => void
}

export function SetRipples(btn: HTMLElement, options?: IRipplesOptions): IRippleReturn {
  let rippleColor = options?.color || Colors.sgray
  const rippleRun = options?.run

  const rippleListener = (e: PointerEvent) => {
    e.preventDefault()

    if (rippleRun) rippleRun()

    const target = e.target
    if (target instanceof HTMLElement === false) return

    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripples = kel("span", "ripples")
    ripples.style.backgroundColor = rippleColor

    const width = rect.width
    const height = rect.height
    const square = width > height ? width : height

    ripples.style.width = `${square}px`
    ripples.style.height = `${square}px`

    ripples.style.left = `${x}px`
    ripples.style.top = `${y}px`
    btn.appendChild(ripples)

    setTimeout(() => ripples.remove(), 500)
  }

  btn.addEventListener("click", rippleListener)

  const stopListener = () => btn.removeEventListener("click", rippleListener)

  const changeColor = (color: string) => (rippleColor = color)

  return { stopListener, changeColor }
}
