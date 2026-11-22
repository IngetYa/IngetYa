import type { IProduct } from "@/types/ServiceTypes"
import { Products } from "../../Tabs/Products"
import { SetRipple, type IRippleReturn } from "@/lib/Ripple"
import { futor, kel } from "@/core/kel"
import { toCurrency, toText } from "@/lib/gen"
import { Colors } from "@/core/Colors"
import db from "../../data/db"
import { lang } from "@/core/languages"

export interface ProductCardConfig {
  products: Products
  product: IProduct
}

export class ProductCard {
  private el!: HTMLDivElement

  private products: Products
  private product: IProduct

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: ProductCardConfig) {
    this.products = config.products
    this.product = config.product

    this.createElement()
    this.writeCategories()
    this.contextListener()
  }

  private createElement(): void {
    this.el = kel("div", "item")

    this.el.innerHTML = `<div class="thumbnail"> <div class="status public">${lang("product_status_" + (this.product.isActive ? "public" : "draft"))}</div> <img src="${this.product.image}" alt="${this.product.name} Thumbnail" /> </div> <div class="tags"></div> <div class="name">${toText(this.product.name)}</div> <div class="price">Rp${toCurrency(this.product.price + db.price["price_month-1"])}</div>`
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
        if (this.products.manager.busy) return
        if (this.products.locked) return
        this.products.startContext(this.product.id, e)
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
