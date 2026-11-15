import type { IPrimary, IPrimaryConfig } from "@/Pages/Staff/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { futor, kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { lang } from "@/core/languages"
import { type IRippleReturn } from "@/lib/Ripple"
import { PageBar } from "@/lib/PageBar"
import { CellRow, NoDataCellRow } from "../Components/Bills/CellRow"
import db from "../data/db"
import xhr from "@/lib/xhr"
import type { IBillStaff, PaginatedResult } from "../types/EmbededAPITypes"

export class Bills implements IPrimary {
  private el!: HTMLDivElement
  locked: boolean = false
  private anim?: string
  private king: StackPrimary
  manager: StateManager
  private _rippleCaches: IRippleReturn[] = []

  private isDestroyed: boolean = false

  private isLoaded: boolean = false

  private onLoaded?: () => void

  private efield!: HTMLTableSectionElement

  private list: (CellRow | NoDataCellRow)[] = []

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
    this.el = kel("div", "AppMain StaffPage StaffBills")
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `
    <div class="Header">
      <div class="HeaderMain">
        <div class="Title">
          <h1><i class="fajdr fa-credit-card"></i> ${lang("tab_bills")}</h1>
        </div>
      </div>
      <div class="Search">
        <div class="inp">
          <div class="icon"><i class="fajdr fa-magnifying-glass"></i></div>
          <input type="text" name="bill-search-query" id="bill-search-query-${Date.now()}" class="input-search-bills" placeholder="Cari ID tagihan atau nama pemesan" readonly />
          <div class="btn btn-search-bills">${lang("search")}</div>
        </div>
      </div>
    </div>

    <div class="FlatList">

      <div class="pagination-container"></div>

      <div class="table-container">
        <table class="table">
          <thead class="thead">
            <tr>
              <th>${lang("bill_cell_id")}</th>
              <th>${lang("bill_cell_user")}</th>
              <th>${lang("bill_cell_amount")}</th>
              <th>${lang("bill_cell_payment")}</th>
              <th>${lang("bill_cell_name")}</th>
              <th>${lang("bill_cell_expiry")}</th>
              <th>${lang("bill_cell_status")}</th>
            </tr>
          </thead>
          <tbody class="tbody">
            <tr>
              <td><div class="skeleton"></div></td>
              <td><div class="skeleton"></div></td>
              <td><div class="skeleton"></div></td>
              <td><div class="skeleton"></div></td>
              <td><div class="skeleton"></div></td>
              <td><div class="skeleton"></div></td>
              <td><div class="skeleton"></div></td>
            </tr>
            <tr>
              <td><div class="skeleton"></div></td>
              <td><div class="skeleton"></div></td>
              <td><div class="skeleton"></div></td>
              <td><div class="skeleton"></div></td>
              <td><div class="skeleton"></div></td>
              <td><div class="skeleton"></div></td>
              <td><div class="skeleton"></div></td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>`

    this.efield = futor(".tbody", this.el, "tbody")
  }

  private async writeData(): Promise<void> {
    if (!db.bills.isLoaded) {
      await waittime(1000)
      await this.changePage(1)

      db.bills.isLoaded = true
    } else {
      this.deleteList()

      while (this.efield.firstChild) {
        this.efield.firstChild.remove()
      }

      this.renderPageBar()
      this.renderItems()
    }

    this.isLoaded = true

    if (this.onLoaded) {
      this.onLoaded()
      this.onLoaded = undefined
    }
  }

  private renderPageBar(): void {
    const parent = futor(".pagination-container", this.el)

    this.pageBar.setMeta(db.bills.Meta!)

    this.pageBar.onPageChange(async (pageNum) => {
      await this.changePage(pageNum)
    })

    parent.append(this.pageBar.html)
  }

  private async changePage(n: number): Promise<void> {
    await waittime(1000)
    const res = await xhr.forceGet(`/x/staff/data/bills/${n}`)

    const data = res.data as PaginatedResult<IBillStaff>

    db.bills.Meta = data.meta
    db.bills.set(...data.data)

    if (!this.isLoaded) this.renderPageBar()

    this.pageBar.setMeta(data.meta)

    this.deleteList()

    while (this.efield.firstChild) {
      this.efield.firstChild.remove()
    }

    this.renderItems()
  }

  private deleteList(): void {
    this.list.forEach((card) => card.destroy())
    this.list.splice(0, this.list.length)
  }

  private renderItems(): void {
    const items = db.bills.getAll()

    for (const item of items) {
      const card = new CellRow({ bills: this, item })

      this.list.push(card)

      this.efield.append(card.html)
    }

    this.writeNoData(items)
  }

  private writeNoData(bills: IBillStaff[]): void {
    const oldCard = this.list.find((k) => k.orderId === "nodata")

    if (bills.length < 1) {
      if (oldCard) return

      const nodataCard = new NoDataCellRow({ bills: this })

      this.list.push(nodataCard)

      return this.efield.prepend(nodataCard.html)
    }

    if (oldCard) oldCard.destroy()
  }

  async handleHistory(_hierarchy: IStackHierarchy): Promise<void> {}

  async destroy(anim?: string): Promise<void> {
    this._rippleCaches.forEach((r) => r.stopListener())
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
