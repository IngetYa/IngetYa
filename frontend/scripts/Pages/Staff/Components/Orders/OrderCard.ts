import { futor, kel } from "@/core/kel"
import { Orders } from "../../Tabs/Orders"
import type { IOrderStaff } from "../../types/EmbededAPITypes"
import { toCurrency, toText } from "@/lib/gen"
import { type IRippleReturn } from "@/lib/Ripple"
import sdate from "@/lib/sdate"
import { lang } from "@/core/languages"
import type { IProduct } from "@/types/ServiceTypes"
import db from "../../data/db"

export interface IOrderCardConfig {
  orders: Orders
  item: IOrderStaff
}

export class OrderCard {
  private orders: Orders
  private item: IOrderStaff

  private el!: HTMLDivElement

  private _rippleCaches: IRippleReturn[] = []

  private product: IProduct

  constructor(config: IOrderCardConfig) {
    this.orders = config.orders
    this.item = config.item

    this.product = db.products.find(config.item.productId)!

    this.createElement()
    this.writeData()
  }

  get id(): string {
    return this.item.id
  }

  private createElement(): void {
    this.el = kel("div", "order-card-staff")
    this.el.innerHTML = `
    <div class="order-card-header">
      <span class="order-id">#${this.item.id}</span>
      <span class="status-badge ${this.item.status}">${lang("status_" + this.item.status)}</span>
    </div>
    <div class="order-card-body">
      <h3 class="order-title">${toText(this.item.name)}</h3>
      <div class="order-meta-list">
        <div class="item">
          <div class="item-label">User</div>
          <div class="item-name">ID ${this.item.userId}</div>
        </div>
        <div class="item">
          <div class="item-label">${lang("label_theme")}</div>
          <div class="item-name">${toText(this.product.name)}</div>
        </div>
        <div class="item">
          <div class="item-label">${lang("label_package")}</div>
          <div class="item-name">${lang("label_" + this.item.package)}</div>
        </div>
        <div class="item">
          <div class="item-label">${lang("label_guests")}</div>
          <div class="item-name">${lang("label_" + this.item.guests)}</div>
        </div>
        <div class="item">
          <div class="item-label">${lang("label_addon")}</div>
          <div class="item-name item-addons-name"></div>
        </div>
        <div class="item">
          <div class="item-label">${lang("label_created_at")}</div>
          <div class="item-name">${sdate.parseTime(this.item.createdAt)}</div>
        </div>
      </div>
    </div>
    <div class="order-card-footer">
      <div class="price-box">
        <span class="price-val">Rp${toCurrency(this.item.price)}</span>
      </div>
      <div class="card-action-btns">
        <div class="btn btn-detail">${lang("overview_see_detail")} <i class="fas fa-arrow-right"></i></div>
      </div>
    </div>`
  }

  private writeData(): void {
    const addons = this.item.addOns
    const eaddon = futor(".item-addons-name", this.el)

    if (addons && addons.length > 0) {
      const addonString = addons.map((addonId) => lang("label_" + addonId)).join(", ")
      eaddon.innerText = addonString
    } else {
      eaddon.innerText = "-"
    }
  }

  get html(): HTMLDivElement {
    return this.el
  }

  destroy(): void {
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    this.el.remove()
  }
}

export class NoDataOrderCard {
  private orders: Orders

  private el!: HTMLDivElement

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: Partial<IOrderCardConfig>) {
    this.orders = config.orders!

    this.createElement()
  }

  get id(): string {
    return "nodata"
  }

  private createElement(): void {
    this.el = kel("div", "order-card-staff")
    this.el.innerHTML = `
    <div class="order-card-body">
      <h3 class="order-title"><i class="fadr fa-folder-open"></i> ${lang("orders_no_data")}</h3>
    </div>`
  }

  get html(): HTMLDivElement {
    return this.el
  }

  destroy(): void {
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    this.el.remove()
  }
}
