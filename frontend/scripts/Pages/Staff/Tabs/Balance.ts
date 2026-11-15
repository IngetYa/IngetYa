import type { IPrimary, IPrimaryConfig } from "@/Pages/Staff/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { futor, kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { getLanguage, lang } from "@/core/languages"
import { type IRippleReturn } from "@/lib/Ripple"
import { formAbort } from "@/lib/modal"
import xhr from "@/lib/xhr"
import db from "../data/db"
import type { IBalanceReturn, ITransaction, PaginatedResult } from "../types/EmbededAPITypes"
import { toCurrency } from "@/lib/gen"
import { PageBar } from "@/lib/PageBar"
import { NoDataTransactionCard, TransactionCard } from "../Components/Balance/TransactionCard"

export class Balance implements IPrimary {
  private el!: HTMLDivElement
  locked: boolean = false
  private anim?: string
  private king: StackPrimary
  manager: StateManager
  private _rippleCaches: IRippleReturn[] = []

  private isDestroyed: boolean = false

  private isLoaded: boolean = false

  private onLoaded?: () => void

  private transactionLoaded: boolean = false

  private efield!: HTMLDivElement

  private list: (TransactionCard | NoDataTransactionCard)[] = []

  private pageBar: PageBar

  constructor(config: IPrimaryConfig) {
    this.king = config.king
    this.manager = config.manager
    this.anim = config.anim

    this.pageBar = new PageBar({ manager: this.manager, title: lang("page_info") })

    this.createElement()
    this.writeData()
  }

  private createElement(): void {
    this.el = kel("div", "AppMain StaffPage StaffBalance")
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `
    <div class="Header">
      <div class="HeaderMain">
        <div class="Title">
          <h1><i class="fadr fa-wallet"></i> ${lang("tab_balance")}</h1>
        </div>
      </div>
    </div>

    <div class="FlatList">
      <div class="hero-balance-card">
        <div class="hero-main">
          <div class="hero-label">${lang("balance_current")}</div>
          <div class="hero-amount"><div class="skeleton light"></div></div>
        </div>
        <div class="hero-stats stat-month">
          <div class="stat-box income">
            <div class="stat-label"><div class="skeleton light"></div></div>
            <div class="stat-value"><div class="skeleton light"></div></div>
          </div>
          <div class="stat-box expense">
            <div class="stat-label"><div class="skeleton light"></div></div>
            <div class="stat-value"><div class="skeleton light"></div></div>
          </div>
        </div>
        <div class="hero-stats stat-lifetime">
          <div class="stat-box income">
            <div class="stat-label"><div class="skeleton light"></div></div>
            <div class="stat-value"><div class="skeleton light"></div></div>
          </div>
          <div class="stat-box expense">
            <div class="stat-label"><div class="skeleton light"></div></div>
            <div class="stat-value"><div class="skeleton light"></div></div>
          </div>
        </div>
        <div class="hero-actions">
          <button class="btn btn-balance-action btn-recap"><i class="fas fa-download"></i> ${lang("balance_report_download")}</button>
        </div>
      </div>

      <div class="section-title">
        <h3><i class="fadr fa-chart-simple"></i> Audit</h3>
      </div>

      <div class="pagination-container">
      </div>

      <div class="records-container">
        <div class="record-card">
          <div class="record-content">
            <div class="record-header">
              <div class="record-title"><div class="skeleton"></div></div>
              <div class="record-amount">
                <div class="skeleton"></div>
              </div>
            </div>
            <div class="record-meta">
              <div class="record-note"><div class="skeleton"></div></div>
              <div class="record-date"><div class="skeleton"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>`

    this.efield = futor(".records-container", this.el, "div")
  }

  private async writeData(): Promise<void> {
    if (!db.balance.isLoaded) {
      await waittime(1000)
      const res = await xhr.forceGet("/x/staff/data/balance", 2000)

      const data = res.data as IBalanceReturn

      db.balance.add(...data.balance)
      db.balance.isLoaded = true

      db.transaction.set(...data.transactions.data)
      db.transaction.Meta = data.transactions.meta
    }

    while (this.efield.firstChild) {
      this.efield.firstChild.remove()
    }

    this.transactionLoaded = true
    this.isLoaded = true

    this.updateString()
    this.updateValue()
    this.renderPageBar()
    this.renderItems()

    if (this.onLoaded) {
      this.onLoaded()
      this.onLoaded = undefined
    }
  }

  private renderPageBar(): void {
    const parent = futor(".pagination-container", this.el)

    this.pageBar.setMeta(db.transaction.Meta!)

    this.pageBar.onPageChange(async (pageNum) => {
      await this.changePage(pageNum)
    })

    parent.append(this.pageBar.html)
  }

  private async changePage(n: number): Promise<void> {
    await waittime(1000)
    const res = await xhr.forceGet(`/x/staff/data/transaction/${n}`)

    const data = res.data as PaginatedResult<ITransaction>

    db.transaction.Meta = data.meta
    db.transaction.set(...data.data)

    this.pageBar.setMeta(data.meta)

    this.deleteList()

    this.renderItems()
  }

  private renderItems(): void {
    const items = db.transaction.getAll()

    for (const item of items) {
      const card = new TransactionCard({ balance: this, item })

      this.list.push(card)

      this.efield.append(card.html)
    }

    this.writeNoData(items)
  }

  private writeNoData(orders: ITransaction[]): void {
    const oldCard = this.list.find((k) => k.id === "nodata")

    if (orders.length < 1) {
      if (oldCard) return

      const nodataCard = new NoDataTransactionCard({ balance: this })

      this.list.push(nodataCard)

      return this.efield.prepend(nodataCard.html)
    }

    if (oldCard) oldCard.destroy()
  }

  private updateString(): void {
    const eMoIncLabel = futor(".stat-month .stat-box.income .stat-label", this.el)

    const monthIncome = db.balance.findIncome("last")
    const monthIncLabel = new Date(monthIncome.createdAt).toLocaleString(getLanguage(), { month: "long" })

    const rawMonthIncString = lang("balance_income_month_text")
    const monthIncString = rawMonthIncString.replace(/{mo}/, monthIncLabel)

    eMoIncLabel.innerText = monthIncString

    const eMoExpLabel = futor(".stat-month .stat-box.expense .stat-label", this.el)

    const monthExpense = db.balance.findIncome("last")
    const monthExpLabel = new Date(monthExpense.createdAt).toLocaleString(getLanguage(), { month: "long" })

    const rawMonthExpString = lang("balance_expense_month_text")
    const monthExpString = rawMonthExpString.replace(/{mo}/, monthExpLabel)

    eMoExpLabel.innerText = monthExpString

    const eTotIncLabel = futor(".stat-lifetime .stat-box.income .stat-label", this.el)

    const totalIncString = lang("balance_income_total_text")

    eTotIncLabel.innerText = totalIncString

    const eTotExpLabel = futor(".stat-lifetime .stat-box.expense .stat-label", this.el)

    const totalExpString = lang("balance_expense_total_text")

    eTotExpLabel.innerText = totalExpString
  }

  private updateValue(): void {
    const ecurrentAmount = futor(".hero-amount", this.el)
    const curBalance = db.balance.currentBalance
    ecurrentAmount.innerHTML = `Rp${curBalance < 1 ? "0" : toCurrency(db.balance.currentBalance)}`

    const eMoInc = futor(".stat-month .stat-box.income .stat-value", this.el)
    const lastInc = db.balance.findIncome("last").amount
    eMoInc.innerHTML = `Rp${lastInc < 1 ? "0" : toCurrency(lastInc)}`

    const eMoExp = futor(".stat-month .stat-box.expense .stat-value", this.el)
    const lastExp = db.balance.findExpense("last").amount
    eMoExp.innerHTML = `Rp${lastExp < 1 ? "0" : toCurrency(lastExp)}`

    const eTotInc = futor(".stat-lifetime .stat-box.income .stat-value", this.el)
    const firstInc = db.balance.findIncome("first").amount
    eTotInc.innerHTML = `Rp${firstInc < 1 ? "0" : toCurrency(firstInc)}`

    const eTotExp = futor(".stat-lifetime .stat-box.expense .stat-value", this.el)
    const firstExp = db.balance.findExpense("first").amount
    eTotExp.innerHTML = `Rp${firstExp < 1 ? "0" : toCurrency(firstExp)}`
  }

  private async runHistoryQueue(hierarchy: IStackHierarchy): Promise<void> {
    // hapus dulu kalo ada modal
    formAbort()

    // // hapus dulu kalo ada product context
    // await this.contextsDestroy()
    // // if (this.context) {
    // //   await this.context.destroy()
    // //   this.setContext()
    // // }

    // // cek path hierarchy
    // const { section, sub } = hierarchy

    // // kalo lagi buka cart
    // if (this.cart) {
    //   // hapus dulu cart-nya
    //   this.king.tabs.hide(false)
    //   this.hide(false)
    //   await this.cart.destroy()
    // }

    // // kalo gada path section, stop
    // if (!section) return

    // // kalo section-nya adalah buy
    // if (section === "buy") {
    //   // tapi gada sub-nya, stop
    //   if (!sub) return

    //   // jalanin pembuatan cart
    //   this.hide()
    //   this.king.tabs.hide()

    //   await this.startCart(sub)
    // }
  }

  async handleHistory(hierarchy: IStackHierarchy): Promise<void> {
    if (this.isLoaded && this.transactionLoaded) return await this.runHistoryQueue(hierarchy)

    return new Promise((resolve) => {
      this.onLoaded = async () => {
        await this.runHistoryQueue(hierarchy)
        resolve()
      }
    })
  }

  private deleteList(): void {
    this.list.forEach((card) => card.destroy())
    this.list.splice(0, this.list.length)
  }

  async destroy(anim?: string): Promise<void> {
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    if (anim) {
      this.el.classList.add(anim)
      await waittime()
    }

    this.deleteList()

    this.pageBar.destroy()

    this.el.remove()
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
