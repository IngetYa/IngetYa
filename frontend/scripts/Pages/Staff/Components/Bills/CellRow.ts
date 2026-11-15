import paymentDetail from "@/data/PaymentDetail.json"
import { Bills } from "../../Tabs/Bills"
import { type IRippleReturn } from "@/lib/Ripple"
import { kel } from "@/core/kel"
import { toCurrency, toText } from "@/lib/gen"
import { getLanguage, lang } from "@/core/languages"
import sdate from "@/lib/sdate"
import type { IBillStaff } from "../../types/EmbededAPITypes"

export interface CellRowConfig {
  bills: Bills
  item: IBillStaff
}

export class CellRow {
  private el!: HTMLDivElement

  private bills: Bills
  private item: IBillStaff

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: CellRowConfig) {
    this.bills = config.bills
    this.item = config.item

    this.createElement()
    this.clickListener()
    // this.writeCategories()
    // this.contextListener()
  }

  // bikin element utama
  private createElement(): void {
    this.el = kel("tr")

    // transaction_status
    const status = this.item.transaction_status

    const payment = paymentDetail.find((k) => k.id === this.item.paymentId)
    if (!payment) throw new Error("Payment Data is invalid")

    // one line biar ga menuhin editor wkwk
    // format aja atau pake beautifier biar rapi
    this.el.innerHTML = `
    <td>#${this.item.orderId}</td>
    <td>ID ${this.item.userId}</td>
    <td class="text-price">Rp${toCurrency(this.item.price)}</td>
    <td class="payment-provider"><img src="/assets/payments/${payment.id}-icon.svg" alt="${payment.name[getLanguage()]}" height="24" /></td>
    <td>${toText(this.item.name)}</td>
    <td><span class="text-muted">${sdate.parseTime(this.item.expiry_time)}</span></td>
    <td><span class="status ${status}">${lang("status_" + status)}</span></td>`
  }

  private clickListener(): void {
    this.el.onclick = () => {
      if (this.bills.manager.busy) return
      if (this.bills.locked) return

      this.bills.manager.next({ path: `#bills/peek/${this.item.orderId}` })
    }
  }

  get orderId(): string {
    return this.item.orderId
  }

  get orderName(): string {
    return this.item.name
  }

  activate(status: boolean = true): void {
    this.el.classList[status ? "remove" : "add"]("hide")
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

export class NoDataCellRow {
  private el!: HTMLDivElement

  private bills: Bills

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: Partial<CellRowConfig>) {
    this.bills = config.bills!

    this.createElement()
  }

  // bikin element utama
  private createElement(): void {
    this.el = kel("tr", "cell-empty")

    // transaction_status

    // one line biar ga menuhin editor wkwk
    // format aja atau pake beautifier biar rapi
    this.el.innerHTML = `<td colspan="4">${lang("bill_no_data")}</td>`
  }

  get orderId(): string {
    return "nodata"
  }

  get orderName(): string {
    return "nodata"
  }

  activate(status: boolean = true): void {
    this.el.classList[status ? "remove" : "add"]("hide")
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
