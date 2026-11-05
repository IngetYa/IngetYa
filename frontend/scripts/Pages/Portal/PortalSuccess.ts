import type { IPortalClass } from "@/types/PortalTypes"
import { eroot, futor, kel } from "@/core/kel"
import { lang } from "@/core/languages"
import { delQuery } from "@/core/queries"

export class PortalSuccess implements IPortalClass {
  readonly id: string = "portal-success"
  locked: boolean = false

  private el!: HTMLDivElement

  // next function setelah user klik kembali
  private onUserNext?: () => void

  private createElement(): void {
    this.el = kel("div", "PortalFinal")

    // one line biar ga menuhin editor wkwk
    // format aja atau pake beautifier biar rapi
    this.el.innerHTML = `<div class="box"> <div class="text"> <div class="title">IngetYa</div> <div class="desc"> <p class="reason">${lang("auth_success_1")}</p> <div class="divider"><span>Nice :)</span></div> <p class="failed-p">${lang("auth_success_2")}</p> </div> </div> <div class="action"> <div class="btn btn-back"><i class="fa-solid fa-face-kiss-wink-heart"></i> </div> </div> </div>`

    eroot().append(this.el)
  }

  private backListener(): void {
    const btnBack = futor(".btn-back", this.el)
    btnBack.append(lang("next"))

    btnBack.onclick = () => this.destroy()
  }

  onAcknowledge(callback?: () => void): void {
    this.onUserNext = callback
  }

  destroy(): void {
    delQuery("error")
    this.el.remove()
    if (this.onUserNext) {
      this.onUserNext()
      this.onUserNext = undefined
    }
  }

  init(): this {
    this.createElement()
    this.backListener()
    return this
  }
}
