import type { IOrder, IProduct } from "@/types/ServiceTypes"
import { Orders } from "../../Tabs/Orders"
import { SetRipple, type IRippleReturn } from "@/lib/Ripple"
import { kel } from "@/core/kel"
import { toText } from "@/lib/gen"
import db from "../../data/db"
import { lang } from "@/core/languages"
import { Colors } from "@/core/Colors"

export interface OrderCardConfig {
  orders: Orders
  order: IOrder
}

export class OrderCard {
  private el!: HTMLDivElement

  private orders: Orders
  private order: IOrder

  private product: IProduct

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: OrderCardConfig) {
    this.orders = config.orders
    this.order = config.order

    const productId = this.order.productId
    this.product = db.products.find(productId)!

    // this.product = db.products.find(or)

    // this.order.productId;

    this.createElement()
    // this.writeCategories()
    this.contextListener()
  }

  // bikin element utama
  private createElement(): void {
    this.el = kel("div", "item")

    const productName = this.product.name
    const productImg = this.product.image

    // one line biar ga menuhin editor wkwk
    // format aja atau pake beautifier biar rapi
    this.el.innerHTML = `
    <div class="sources">
      <div class="source-name">${toText(productName)}</div>
      <div class="source-thumbnail">
        <img src="${productImg}" alt="${productName} Thumbnail" />
      </div>
    </div>
    <div class="meta">
      <div class="id">#${this.order.id}</div>
      <div class="name">${toText(this.order.name)}</div>
      <div class="status ${this.order.status}">${lang("status_" + this.order.status)}</div>
    </div>`
  }

  get id(): string {
    return this.order.id
  }

  get name(): string {
    return this.order.name
  }

  private contextListener(): void {
    const ripple = SetRipple(this.el, {
      color: Colors.primaryDark,
      run: (e) => {
        if (this.orders.manager.busy) return
        if (this.orders.locked) return
        this.orders.startContext(this.order.id, e)
      }
    })
    this._rippleCaches.push(ripple)
  }

  destroy(): void {
    // hapus ripplenya dari cache
    this._rippleCaches.forEach((btn) => btn.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    // hapus element
    this.el.remove()
  }

  hide(status: boolean = true): void {
    this.el.classList[status ? "add" : "remove"]("hide")
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
