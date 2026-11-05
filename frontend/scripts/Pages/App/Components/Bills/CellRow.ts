import type { IBill, IOrder } from "@/types/ServiceTypes"
import { Bills } from "../../Tabs/Bills"
import { type IRippleReturn } from "@/lib/Ripple"
import { kel } from "@/core/kel"
import { toText } from "@/lib/gen"
import db from "../../data/db"
import { lang } from "@/core/languages"
import sdate from "@/lib/sdate"

export interface CellRowConfig {
  bills: Bills
  bill: IBill
}

export class CellRow {
  private el!: HTMLDivElement

  private bills: Bills
  private bill: IBill

  private order: IOrder
  // private product: IProduct

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: CellRowConfig) {
    this.bills = config.bills
    this.bill = config.bill

    this.order = db.orders.find(this.bill.orderId)!

    this.createElement()
    this.clickListener()
    // this.writeCategories()
    // this.contextListener()
  }

  // bikin element utama
  private createElement(): void {
    this.el = kel("tr")

    // transaction_status
    const status = this.bill.transaction_status

    // one line biar ga menuhin editor wkwk
    // format aja atau pake beautifier biar rapi
    this.el.innerHTML = `
    <td>#${this.bill.orderId}</td>
    <td><span class="status ${status}">${lang("status_" + status)}</span></td>
    <td class="name">${toText(this.order.name)}</td>
    <td>${sdate.datetime(this.order.createdAt)}</td>`
  }

  private clickListener(): void {
    this.el.onclick = () => {
      if (this.bills.manager.busy) return
      if (this.bills.locked) return

      this.bills.manager.next({ path: `#bills/peek/${this.bill.orderId}` })
    }
  }

  get orderId(): string {
    return this.bill.orderId
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
