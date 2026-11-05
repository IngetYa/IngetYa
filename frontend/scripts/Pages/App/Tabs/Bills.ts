import type { IPrimary, IPrimaryConfig } from "@/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { eroot, futor, kel } from "@/core/kel"
import { formAbort } from "@/lib/modal"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import db from "../data/db"
import { CellRow } from "../Components/Bills/CellRow"
import { genUniq } from "@/lib/gen"
import { lang } from "@/core/languages"
import { Bill } from "../Components/Bills/Bill"

export class Bills implements IPrimary {
  private el!: HTMLDivElement

  locked: boolean = false

  private isDestroyed: boolean = false

  private anim?: string

  private king: StackPrimary
  manager: StateManager

  private list: CellRow[] = []

  private efield!: HTMLDivElement

  private bill?: Bill

  // private contexts: ProductContext[] = []

  constructor(config: IPrimaryConfig) {
    this.king = config?.king
    this.manager = config.manager
    this.anim = config?.anim

    this.createElement()
    this.writeData()
  }

  // bikin element utama
  private createElement(): void {
    this.el = kel("div", "AppMain Bills")
    if (this.anim) this.el.classList.add(this.anim)

    // one line biar ga menuhin editor wkwk
    // format aja atau pake beautifier biar rapi
    this.el.innerHTML = `
    <div class="Title">
      <h1><i class="fajdr fa-credit-card"></i> ${lang("tab_bills")}</h1>
    </div>


    <div class="FlatList">

      <div class="Search">
        <div class="inp">
          <div class="icon">
            <i class="fajdr fa-magnifying-glass"></i>
          </div>
          <input type="text" name="Search" id="search-${genUniq()}" placeholder="Cari di sini..." />
          <div class="btn">Cari</div>
        </div>
      </div>

      <div class="table-container">
        <table class="table">
          <thead class="thead">
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Name</th>
              <th>Time</th>
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
  }

  private async runHistoryQueue(hierarchy: IStackHierarchy): Promise<void> {
    // hapus dulu kalo ada modal
    formAbort()

    // cek path hierarchy
    const { section, sub } = hierarchy

    // kalo lagi buka cart
    if (this.bill) {
      // hapus dulu cart-nya
      await this.bill.destroy()
    }

    // kalo gada path section, stop
    if (!section) return

    // kalo section-nya adalah buy
    if (section === "peek") {
      // tapi gada sub-nya, stop
      if (!sub) return

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

  lock(status: boolean = true): void {
    this.locked = status
  }
  get html(): HTMLDivElement {
    return this.el
  }

  async destroy(anim?: string): Promise<void> {
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
