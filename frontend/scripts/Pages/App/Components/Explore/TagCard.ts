import { Colors } from "@/core/Colors"
import { kel } from "@/core/kel"
import { type IRippleReturn, SetRipple } from "@/lib/Ripple"

export interface TagCardConfig {
  text: string
  count?: number
}

export class TagCard {
  private el!: HTMLDivElement

  private text: string
  private count?: number

  private isActive?: boolean = false

  private rippleCache!: IRippleReturn

  private _onSelected?: (returnText: string) => void

  constructor(config: TagCardConfig) {
    this.text = config.text
    this.count = config.count
    this.createElement()
    this.onClick()
  }
  // bikin element utama
  private createElement(): void {
    this.el = kel("div", "cat")
    const text = kel("span")
    text.innerText = this.text
    this.el.append(text)
    if (this.count) {
      const amount = kel("i")
      amount.innerText = this.count.toString()
      this.el.append(amount)
    }
  }

  // listener click buat element
  private onClick(): void {
    const btnRipple = SetRipple(this.el, {
      color: Colors.yellow,
      run: () => {
        if (this._onSelected) this._onSelected(this.text)
      }
    })

    this.rippleCache = btnRipple
  }
  get category(): string {
    return this.text
  }
  activate(status: boolean = true, scroll?: boolean): void {
    if (this.isActive === status) return

    this.el.classList[status ? "add" : "remove"]("active")
    this.isActive = status

    if (scroll) this.el.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  // setup callback method, buat onclick
  onSelected(newFunc: (text: string) => void): void {
    this._onSelected = newFunc
  }

  destroy(): void {
    this.rippleCache.stopListener()
    this.el.onclick = null
    this.el.remove()
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
