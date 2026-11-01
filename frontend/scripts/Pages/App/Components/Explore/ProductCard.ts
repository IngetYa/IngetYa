import type { IProduct } from "@/types/ServiceTypes"
import { Explore } from "../../Tabs/Explore"
import { SetRipple, type IRippleReturn } from "@/lib/Ripple"
import { futor, kel } from "@/core/kel"
import { parsePrice, toText } from "@/lib/gen"
import { Colors } from "@/core/Colors"
import { StateManager } from "../../core/StateManager"

export interface ProductCardConfig {
  explore: Explore
  product: IProduct
  manager: StateManager
}

export class ProductCard {
  private el!: HTMLDivElement

  private explore: Explore
  private product: IProduct

  private manager: StateManager

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: ProductCardConfig) {
    this.explore = config.explore
    this.product = config.product

    this.manager = config.manager

    this.createElement()
    this.writeCategories()
    this.contextListener()
  }

  private createElement(): void {
    this.el = kel("div", "item")
    this.el.innerHTML = `
    <div class="thumbnail">
      <img src="${this.product.image}" alt="${this.product.name} Thumbnail" />
    </div>
    <div class="tags"></div>
    <div class="name">${toText(this.product.name)}</div>
    <div class="price">Rp${parsePrice(this.product.price)}</div>`
  }

  private writeCategories(): void {
    const etags = futor(".tags", this.el)

    for (const tag of this.product.categories) {
      const etag = kel("div", "tag")
      etag.innerText = tag

      etags.append(etag)
    }
  }

  private contextListener(): void {
    const ripple = SetRipple(this.el, {
      color: Colors.primaryDark,
      run: (e) => {
        if (this.explore.locked) return
        this.explore.startContext(this.product.id, e)
      }
    })
    this._rippleCaches.push(ripple)
  }

  get id(): string {
    return this.product.id
  }

  get name(): string {
    return this.product.name
  }

  get categories(): string[] {
    return this.product.categories || []
  }

  destroy(): void {
    this._rippleCaches.forEach((btn) => btn.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)
    this.el.remove()
  }

  hide(status: boolean = true): void {
    this.el.classList[status ? "add" : "remove"]("hide")
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
