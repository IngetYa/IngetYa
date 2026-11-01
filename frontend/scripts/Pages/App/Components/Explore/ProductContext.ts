import type { IProduct } from "@/types/ServiceTypes"
import { Explore } from "../../Tabs/Explore"
import { type IRippleReturn } from "@/lib/Ripple"
import { kel } from "@/core/kel"
import { parsePrice, toText } from "@/lib/gen"
import { lang } from "@/core/languages"
import waittime from "@/lib/waittime"

export interface ProductContextConfig {
  product: IProduct
  explore: Explore
  x: number
  y: number
}

export class ProductContext {
  private el!: HTMLDivElement

  locked: boolean = false

  private _rippleCaches: IRippleReturn[] = []

  private product: IProduct
  private explore: Explore

  private x: number
  private y: number

  constructor(config: ProductContextConfig) {
    this.product = config.product
    this.explore = config.explore

    this.x = config.x
    this.y = config.y

    this.createElement()
  }

  private createElement(): void {
    this.el = kel("div", "ContextExplore")
    this.el.innerHTML = `
    <div class="thumbnail">
      <img src="${this.product.image}" alt="${this.product.name} Thumbnail" />
    </div>
    <div class="menu meta">
      <div class="name">${toText(this.product.name)}</div>
      <div class="price">Rp${parsePrice(this.product.price)}</div>
    </div>
    <div class="btn menu btn-preview">
      <i class="fal fa-earth-asia fa-fw"></i> ${lang("explore_context_see")}
    </div>
    <div class="btn menu btn-buy">
      <i class="fal fa-cart-circle-plus fa-fw"></i> ${lang("explore_context_buy")}
    </div>`
  }

  private setVertical(pos: number, offset: number): void {
    const windowHeight = window.innerHeight

    if (offset >= windowHeight) {
      this.el.style.top = "10px"
      return
    }

    const centerY = (windowHeight - offset) / 2

    // kasih jarak dari atas/bawah biar  agak ke tengah
    const margin = Math.max(24, centerY * 0.5)
    const minTop = margin
    const maxTop = windowHeight - offset - margin

    let top = pos - offset / 2

    // kalo dah terlalu ujung, buat agak ke tengah
    if (top < minTop) {
      top = minTop
    } else if (top > maxTop) {
      top = maxTop
    }

    this.el.style.top = `${top.toString()}px`
  }

  private setHorizontal(pos: number, offset: number): void {
    const windowWidth = window.innerWidth
    const gap = 12
    const edgeMargin = 16

    // default di kanan cursor (pointer)
    let left = pos + gap

    // cek element ngelebihin ujung kanan
    if (left + offset > windowWidth - edgeMargin) {
      // jadikan ada di kiri
      left = pos - offset - gap
    }

    // paksa biar ga nembus kiri
    if (left < edgeMargin) {
      left = edgeMargin
    }

    this.el.style.left = `${left.toString()}px`
  }

  updatePosition(): void {
    const offsetX = this.el.offsetWidth || this.el.clientWidth
    const offsetY = this.el.offsetHeight || this.el.clientHeight

    this.setHorizontal(this.x, offsetX)
    this.setVertical(this.y, offsetY)
  }

  async destroy(): Promise<void> {
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    this.el.classList.add("out")
    await waittime()
    this.el.remove()
    this.explore.setContext()
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
