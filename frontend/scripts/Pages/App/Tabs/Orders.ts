import type { IPrimary, IPrimaryConfig } from "@/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import waittime from "@/lib/waittime"
import { formAbort } from "@/lib/modal"
import { type IStackHierarchy } from "@/core/hierarchy"
import { eroot, futor, kel } from "@/core/kel"
import db from "../data/db"
import { OrderCard } from "../Components/Orders/OrderCard"
import { lang } from "@/core/languages"
import { genStringId, genUniq } from "@/lib/gen"
import { Bill } from "../Components/Bills/Bill"
import { OrderContext } from "../Components/Orders/OrderContext"

export class Orders implements IPrimary {
  private el!: HTMLDivElement

  locked: boolean = false

  private isDestroyed: boolean = false

  private anim?: string

  private king: StackPrimary
  manager: StateManager

  private loaders: HTMLDivElement[] = []

  private list: OrderCard[] = []

  private efield!: HTMLDivElement

  private bill?: Bill

  private contexts: OrderContext[] = []

  constructor(config: IPrimaryConfig) {
    this.king = config?.king
    this.manager = config.manager
    this.anim = config?.anim

    this.createElement()
    this.writeData()
  }

  // bikin element utama
  private createElement(): void {
    this.el = kel("div", "AppMain Orders")
    if (this.anim) this.el.classList.add(this.anim)

    // one line biar ga menuhin editor wkwk
    // format aja atau pake beautifier biar rapi
    this.el.innerHTML = `
    <div class="Title">
      <h1><i class="fadr fa-bag-shopping"></i> ${lang("tab_orders")}</h1>
    </div>


    <div class="FlatList">

      <div class="Search">
        <div class="inp">
          <div class="icon">
            <i class="fajdr fa-magnifying-glass"></i>
          </div>
          <input type="text" autocomplete="off" name="Search" id="search-${genUniq()}" placeholder="Cari di sini..." />
          <div class="btn">Cari</div>
        </div>
      </div>

      <div class="AddOrder">
        <div class="icon">
          <span class="fa-stack">
            <i class="fajdr fa-circle fa-stack-2x"></i>
            <i class="fajdr fa-plus fa-stack-1x fa-inverse"></i>
          </span>
        </div>

        <div class="text">Add New Order</div>
      </div>

      <div class="List"></div>
    </div>`

    this.efield = futor(".FlatList .List", this.el, "div")
  }

  private writeData(): void {
    // ambil data order
    const orders = db.orders.getAll()

    // loop sampai semua orders dirender
    for (const order of orders) {
      const card = new OrderCard({ orders: this, order })

      // masukin ke array
      this.list.push(card)

      // render element
      this.efield.prepend(card.html)
    }
  }

  private async runHistoryQueue(hierarchy: IStackHierarchy): Promise<void> {
    // hapus dulu kalo ada modal
    formAbort()

    await this.contextsDestroy()

    // cek path hierarchy
    const { section, sub } = hierarchy

    // kalo lagi buka bill
    if (this.bill) {
      // hapus dulu cart-nya
      await this.bill.destroy()
    }

    // kalo gada path section, stop
    if (!section) return

    // kalo section-nya adalah buy
    if (section === "pay") {
      // tapi gada sub-nya, stop
      if (!sub) return

      // jalanin pembuatan cart
      await this.startBill(sub)
    }
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

  async startContext(sub: string, e: PointerEvent): Promise<void> {
    if (this.manager.busy) return
    if (this.locked) return
    this.locked = true

    const x = e.clientX
    const y = e.clientY

    await this.contextsDestroy()

    // if (this.contexts) {
    //   this.context.destroy()
    //   this.setContext()
    // }

    const order = db.orders.find(sub)

    if (!order) {
      this.locked = false
      return
    }

    if (this.isDestroyed) return

    const context = new OrderContext({
      orders: this,
      order,
      manager: this.manager,
      id: genStringId(),
      x,
      y
    })

    this.addContext(context)
    eroot().append(context.html)

    context.updatePosition()

    await waittime()
    this.locked = false
  }

  addContext(context: OrderContext): void {
    this.contexts.push(context)
  }
  delContext(contextId: string): void {
    const contextIdx = this.contexts.findIndex((context) => context.id === contextId)
    if (contextIdx !== -1) this.contexts.splice(contextIdx, 1)
  }

  async handleHistory(hierarchy: IStackHierarchy): Promise<void> {
    await this.runHistoryQueue(hierarchy)
  }

  lock(status: boolean = true): void {
    this.locked = status
  }

  async contextsDestroy(): Promise<void> {
    while (this.contexts.length > 0) {
      const context = this.contexts.shift()
      if (context) await context.destroy()
    }
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
