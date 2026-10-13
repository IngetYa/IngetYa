import "@/scss/lib/_tell.scss"

import { eroot, kel } from "@/core/kel"

let currentTell: HTMLDivElement | undefined = undefined

let tellTimeout: ReturnType<typeof setTimeout> | undefined = undefined

function stopTell(): void {
  if (tellTimeout) {
    clearTimeout(tellTimeout)
    tellTimeout = undefined
  }

  if (!currentTell) return

  currentTell.remove()
  currentTell = undefined
}

export function doTell(text: string, className: string = "solid circle-check fw"): void {
  stopTell()

  const el = kel("div", "tell")
  const icParent = kel("div", "ic")

  const icons = className
    .split(" ")
    .map((str) => `fa-${str}`)
    .join(" ")

  const ic = kel("i", icons)
  icParent.append(ic)
  const msg = kel("div", "text")
  msg.innerHTML = text

  el.append(icParent, msg)

  eroot().appendChild(el)

  currentTell = el

  tellTimeout = setTimeout(() => stopTell(), 3000)
}
