import { Colors } from "@/core/Colors"
import { kel } from "@/core/kel"
import { lang } from "@/core/languages"
import { type IRippleReturn, SetRipple } from "@/lib/Ripple"

export interface ITabButtonConfig {
  id: string
  name: string
  icon: string
}

export class TabButton {
  private el!: HTMLAnchorElement

  private eName!: HTMLDivElement

  private ripple: IRippleReturn

  private setClick?: () => void

  private clickListener?: () => void

  constructor(private config: ITabButtonConfig) {
    this.createElement()

    // ripple effect kek ala-ala android
    this.ripple = SetRipple(this.el, { color: Colors.primaryDark })

    // listener onclick
    this._onBtnClick()
  }

  get id(): string {
    return this.config.id
  }

  // bikin elemen utama pake anchor
  private createElement(): void {
    this.el = kel("a", `btn btn-${this.config.id}`)

    const icon = kel("div", "icon")
    icon.innerHTML = `<i class="${this.config.icon}"></i>`

    this.eName = kel("div", "name")
    this.eName.innerText = lang(`tab_${this.config.name}`)

    this.el.append(icon, this.eName)
  }

  private _onBtnClick(): void {
    // properti clickListener
    this.clickListener = () => {
      // kalo ada setClick, jalanin
      if (this.setClick) this.setClick()
    }

    // clickListener sesungguhnya
    this.el.addEventListener("click", this.clickListener)
  }

  // sisipkan ke properti setClick
  onClick(newFunc?: () => void): void {
    this.setClick = newFunc
  }

  // true/false
  get isActive(): boolean {
    return this.el.classList.contains("active")
  }

  // ganti status 'isActive'
  activate(status: boolean = true): void {
    // update warna button
    this.el.classList[status ? "add" : "remove"]("active")
  }

  updateString(): void {
    this.eName.innerText = lang(`tab_${this.config.name}`)
  }

  destroy(): void {
    // stop listener ripple (biar ga loop onclick)
    this.ripple.stopListener()

    // stop listener utama (biar ga loop onclick)
    this.el.removeEventListener("click", this.clickListener!)

    // hapus element utama
    this.el.remove()
  }

  // ambil elementnya
  get html(): HTMLAnchorElement {
    return this.el
  }
}
