import { Colors } from "@/core/Colors"
import { kel } from "@/core/kel"
import { lang } from "@/core/languages"
import { type IRippleReturn, SetRipple } from "@/lib/Ripple"

export interface ITabButtonConfig {
  id: string
  name: string
  icon: string
  isMoreOption?: boolean
}

export class TabButton {
  private el!: HTMLAnchorElement

  private eName!: HTMLDivElement

  private ripple: IRippleReturn

  private setClick?: () => void

  private clickListener?: () => void

  constructor(private config: ITabButtonConfig) {
    this.createElement()

    this.ripple = SetRipple(this.el, { color: Colors.primaryDark })

    this._onBtnClick()
  }

  get id(): string {
    return this.config.id
  }

  get isMoreOption(): boolean {
    return Boolean(this.config.isMoreOption)
  }

  private createElement(): void {
    this.el = kel("a", `btn btn-${this.config.id}`)

    const icon = kel("div", "icon")
    icon.innerHTML = `<i class="${this.config.icon}"></i>`

    this.eName = kel("div", "name")
    this.eName.innerText = lang(`tab_${this.config.name}`)

    this.el.append(icon, this.eName)
  }

  private _onBtnClick(): void {
    this.clickListener = () => {
      if (this.setClick) this.setClick()
    }

    this.el.addEventListener("click", this.clickListener)
  }

  onClick(newFunc?: () => void): void {
    this.setClick = newFunc
  }

  get isActive(): boolean {
    return this.el.classList.contains("active")
  }

  activate(status: boolean = true): void {
    this.el.classList[status ? "add" : "remove"]("active")
  }

  updateString(): void {
    this.eName.innerText = lang(`tab_${this.config.name}`)
  }

  destroy(): void {
    this.ripple.stopListener()

    this.el.removeEventListener("click", this.clickListener!)

    this.el.remove()
  }

  get html(): HTMLAnchorElement {
    return this.el
  }
}
