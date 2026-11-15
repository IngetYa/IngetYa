import { kel } from "@/core/kel"
import { Balance } from "../../Tabs/Balance"
import type { ITransaction } from "../../types/EmbededAPITypes"
import { toCurrency, toText } from "@/lib/gen"
import { type IRippleReturn } from "@/lib/Ripple"
import sdate from "@/lib/sdate"
import { lang } from "@/core/languages"

export interface ITransactionCardConfig {
  balance: Balance
  item: ITransaction
}

export class TransactionCard {
  private balance: Balance
  private item: ITransaction

  private el!: HTMLDivElement

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: ITransactionCardConfig) {
    this.balance = config.balance
    this.item = config.item

    this.createElement()
  }

  get id(): string {
    return this.item.id
  }

  private createElement(): void {
    this.el = kel("div", "record-card")
    this.el.innerHTML = `
    <div class="record-content">
      <div class="record-header">
        <div class="record-title">${toText(this.item.name)}</div>
        <div class="record-amount ${this.item.type}">
          ${this.item.type === "expense" ? "-" : "+"} Rp${toCurrency(this.item.amount)}
        </div>
      </div>
      <div class="record-meta">
        <p class="record-note">${toText(this.item.desc || "-")}</p>
        <p class="record-date">${sdate.parseTime(this.item.timestamp)}</p>
      </div>
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

export class NoDataTransactionCard {
  private balance: Balance

  private el!: HTMLDivElement

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: Partial<ITransactionCardConfig>) {
    this.balance = config.balance!

    this.createElement()
  }

  get id(): string {
    return "nodata"
  }

  private createElement(): void {
    this.el = kel("div", "record-card")
    this.el.innerHTML = `
    <div class="record-content">
      <div class="record-header">
        <div class="record-title"><i class="fadr fa-folder-open"></i> ${lang("balance_no_data")}</div>
      </div>
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
