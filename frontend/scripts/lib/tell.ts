import "@/scss/lib/_tell.scss"

import { eroot, kel } from "@/core/kel"

let currentTell: HTMLDivElement | undefined = undefined

let tellTimeout: ReturnType<typeof setTimeout> | undefined = undefined

function stopTell(): void {
  // kalo timeout masih ada, hapus methodnya dari memory
  if (tellTimeout) {
    clearTimeout(tellTimeout)
    tellTimeout = undefined
  }

  // kalo gada elementnya, yaudah
  if (!currentTell) return

  // kalo ada, ya hapus
  currentTell.remove()
  currentTell = undefined
}

export function doTell(text: string, className: string = "solid circle-check fw"): void {
  // force destroy toast terakhir
  stopTell()

  // bikin parent
  const el = kel("div", "tell")
  const icParent = kel("div", "ic")

  // bikin icon dari classname font awesome pro plus
  const icons = className
    .split(" ")
    .map((str) => `fa-${str}`)
    .join(" ")

  const ic = kel("i", icons)
  // render di parent
  icParent.append(ic)

  // text toast
  const msg = kel("div", "text")
  msg.innerHTML = text

  // render di parent
  el.append(icParent, msg)

  // render di root
  eroot().appendChild(el)

  // perbarui element terbaru
  currentTell = el

  // set timeout
  tellTimeout = setTimeout(() => stopTell(), 3000)
}
