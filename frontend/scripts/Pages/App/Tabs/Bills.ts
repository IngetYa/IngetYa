import type { IPrimary, IPrimaryConfig } from "@/Pages/App/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { eroot, futor, kel } from "@/core/kel"
import { formAbort } from "@/lib/modal"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import db from "../data/db"
import { CellRow, NoDataCellRow } from "../Components/Bills/CellRow"
import { genUniq } from "@/lib/gen"
import { lang } from "@/core/languages"
import { Bill } from "../Components/Bills/Bill"
import { debounce, searchOrders } from "@/core/Search"
import type { IBill } from "@/types/ServiceTypes"

export class Bills implements IPrimary {
  private el!: HTMLDivElement

  locked: boolean = false

  private isDestroyed: boolean = false

  private anim?: string

  private king: StackPrimary
  manager: StateManager

  private list: (CellRow | NoDataCellRow)[] = []

  private efield!: HTMLDivElement

  private bill?: Bill

  private inp!: HTMLInputElement
  // private contexts: ProductContext[] = []

  constructor(config: IPrimaryConfig) {
    this.king = config?.king
    this.manager = config.manager
    this.anim = config?.anim

    this.createElement()
    this.writeData()
    this.searchListener()
  }

  // bikin element utama
  private createElement(): void {
    this.el = kel("div", "AppMain Bills")

    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    // one line biar ga menuhin editor wkwk
    // format aja atau pake beautifier biar rapi
    this.el.innerHTML = `
    <div class="Header">
      <div class="HeaderMain">
        <div class="Title">
          <h1><i class="fajdr fa-credit-card"></i> ${lang("tab_bills")}</h1>
        </div>
      </div>

      <div class="Search">
        <div class="inp">
          <div class="icon">
            <i class="fajdr fa-magnifying-glass"></i>
          </div>
          <input type="text" name="Search" id="search-${genUniq()}" placeholder="${lang("bill_search_text")}" />
          <div class="btn">${lang("search")}</div>
        </div>
      </div>
    </div>


    <div class="FlatList">


      <div class="table-container">
        <table class="table">
          <thead class="thead">
            <tr>
              <th>${lang("bill_cell_id")}</th>
              <th>${lang("bill_cell_status")}</th>
              <th>${lang("bill_cell_name")}</th>
              <th>${lang("bill_cell_time")}</th>
            </tr>
          </thead>
          <tbody class="tbody">
          </tbody>

        </table>
      </div>

    </div>`

    this.efield = futor(".FlatList .table-container .table .tbody", this.el, "tbody")
  }

  private writeData(): void {
    // ambil data product
    const bills = db.bills.getAll()
    // loop sampai semua orders dirender
    for (const bill of bills) {
      const tr = new CellRow({ bills: this, bill })
      // masukin ke array
      this.list.push(tr)
      // render element
      this.efield.prepend(tr.html)
    }

    this.writeNoData(bills)
  }

  private writeNoData(bills: IBill[]): void {
    const oldCard = this.list.find((k) => k.orderId === "nodata")

    if (bills.length < 1) {
      if (oldCard) return

      const nodataCard = new NoDataCellRow({ bills: this })

      this.list.push(nodataCard)

      return this.efield.prepend(nodataCard.html)
    }

    if (oldCard) oldCard.destroy()
  }

  private async runHistoryQueue(hierarchy: IStackHierarchy): Promise<void> {
    // hapus dulu kalo ada modal
    formAbort()

    // cek path hierarchy
    const { section, sub } = hierarchy

    // kalo lagi buka cart
    if (this.bill) {
      // hapus dulu cart-nya
      this.hide(false)
      this.king.tabs.hide(false)
      await this.bill.destroy()
    }

    // kalo gada path section, stop
    if (!section) return

    // kalo section-nya adalah buy
    if (section === "peek") {
      // tapi gada sub-nya, stop
      if (!sub) return

      this.hide()
      this.king.tabs.hide()
      // jalanin pembuatan cart
      await this.startBill(sub)
    }
  }

  async handleHistory(hierarchy: IStackHierarchy): Promise<void> {
    await this.runHistoryQueue(hierarchy)
  }

  private async startBill(sub: string): Promise<void> {
    const billData = db.bills.find(sub)

    if (!billData) return

    const bill = new Bill({ parent: this, manager: this.manager, bill: billData })

    this.setBill(bill)

    eroot().append(bill.html)

    await waittime()
  }

  setBill(bill?: Bill) {
    this.bill = bill
  }

  private searchListener(): void {
    this.inp = futor('input[name="Search"]', this.el, "input")

    const handleSearch = debounce((text) => {
      const orderMinData = this.list.map((itm) => ({ id: itm.orderId, name: itm.orderName }))

      const orderIds = searchOrders(text, orderMinData)

      this.filterOrders(orderIds)
    }, 500)

    this.inp.oninput = () => handleSearch(this.inp.value)
  }

  private filterOrders(ids?: string[]): void {
    for (const cellRow of this.list) {
      cellRow.activate(!ids || ids.some((id) => id === cellRow.orderId))
    }

    if (!ids) return

    this.showEmpty(ids.length < 1)
  }

  private showEmpty(status: boolean = true): void {
    const oldEmpty = futor(".cell-empty-search")

    if (!status) {
      if (oldEmpty) oldEmpty.remove()
      return
    }

    if (oldEmpty) return

    const emptyCard = kel("tr", "cell-empty cell-empty-search")
    emptyCard.innerHTML = `<td colspan="4">${lang("bill_find_404_title")}</td>`

    this.efield.append(emptyCard)
  }

  lock(status: boolean = true): void {
    this.locked = status
  }
  get html(): HTMLDivElement {
    return this.el
  }

  async hide(status: boolean = true): Promise<void> {
    if (status) {
      this.el.classList.add("stackOut2")
      await waittime()
      this.el.classList.add("hide")
      this.el.classList.remove("stackOut2")
      return
    }

    this.el.classList.add("stackIn2")
    this.el.classList.remove("hide")
    await waittime()
    this.el.classList.remove("stackIn2")
  }

  async destroy(anim?: string): Promise<void> {
    this.inp.oninput = null

    if (anim) {
      this.el.classList.add(anim)
      await waittime()
    }

    this.isDestroyed = true

    // this.list.forEach((card) => card.destroy())
    // this.list.splice(0, this.list.length)

    this.el.remove()
  }
}
