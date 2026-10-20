import type { IPortalClass } from "@/types/PortalTypes"
import { eroot, futor, kel } from "@/core/kel"
import { lang } from "@/core/languages"

export class PortalError implements IPortalClass {
  readonly id: string = "portal-error"
  locked: boolean = false

  private el!: HTMLDivElement

  // next function setelah user klik kembali
  private onUserBack?: () => void

  private msg: string
  private noTurnBack: boolean

  constructor(msg?: string, noTurnBack?: boolean) {
    this.msg = msg || "error"
    this.noTurnBack = noTurnBack || false
  }

  private createElement(): void {
    this.el = kel("div", "PortalError")
    this.el.innerHTML = `
    <div class="box">
      <div class="text">
        <div class="title">Oops!</div>
        <div class="desc">
          <p class="reason">${lang(this.msg)}</p>
          <div class="divider"><span>Sorry :(</span></div>
          <p class="failed-p">${lang("auth_failed")}</p>
        </div>
      </div>
      <div class="action">
        <div class="btn btn-back"><i class="fa-solid fa-face-disappointed"></i> </div>
      </div>
    </div>`

    eroot().append(this.el)
  }

  private backListener(): void {
    const btnBack = futor(".btn-back", this.el)
    btnBack.append(lang("label_error_back"))

    btnBack.onclick = () => this.destroy()

    if (this.noTurnBack) {
      btnBack.remove()

      const failedMsg = futor(".failed-p", this.el)
      failedMsg.remove()
    }
  }

  onAcknowledge(callback?: () => void): void {
    this.onUserBack = callback
  }

  destroy(): void {
    this.el.remove()
    if (this.onUserBack) {
      this.onUserBack()
      this.onUserBack = undefined
    }
  }

  init(): this {
    this.createElement()
    this.backListener()
    return this
  }
}
