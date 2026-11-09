import type { IPrimary, IPrimaryConfig } from "@/Pages/App/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import waittime from "@/lib/waittime"
import { formAbort } from "@/lib/modal"
import { type IStackHierarchy } from "@/core/hierarchy"
import { eroot, futor, kel } from "@/core/kel"
import db from "../data/db"
import { NoDataOrderCard, OrderCard } from "../Components/Orders/OrderCard"
import { lang } from "@/core/languages"
import { genStringId, genUniq } from "@/lib/gen"
import { Bill } from "../Components/Bills/Bill"
import { OrderContext } from "../Components/Orders/OrderContext"
import { debounce, searchOrders } from "@/core/Search"
import type { IOrder } from "@/types/ServiceTypes"
import { SetRipple, type IRippleReturn } from "@/lib/Ripple"
import { Colors } from "@/core/Colors"

export class Orders implements IPrimary {
  private el!: HTMLDivElement

  locked: boolean = false

  private isDestroyed: boolean = false

  private anim?: string

  private king: StackPrimary
  manager: StateManager

  private loaders: HTMLDivElement[] = []

  private list: (OrderCard | NoDataOrderCard)[] = []

  private efield!: HTMLDivElement

  private bill?: Bill

  private contexts: OrderContext[] = []

  private _rippleCaches: IRippleReturn[] = []

  private inp!: HTMLInputElement

  constructor(config: IPrimaryConfig) {
    this.king = config?.king
    this.manager = config.manager
    this.anim = config?.anim

    this.createElement()
    this.writeData()
    this.searchListener()
    this.btnCreateListener()
  }

  // bikin element utama
  private createElement(): void {
    this.el = kel("div", "AppMain Orders")
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
          <h1><i class="fadr fa-bag-shopping"></i> ${lang("tab_orders")}</h1>
        </div>
      </div>

      <div class="Search">
        <div class="inp">
          <div class="icon">
            <i class="fajdr fa-magnifying-glass"></i>
          </div>
          <input type="text" autocomplete="off" name="Search" id="search-${genUniq()}" placeholder="${lang("order_search_text")}" />
          <div class="btn">${lang("search")}</div>
        </div>
      </div>

    </div>


    <div class="FlatList">

      <div class="AddOrder">
        <div class="icon">
          <span class="fa-stack">
            <i class="fajdr fa-circle fa-stack-2x"></i>
            <i class="fajdr fa-plus fa-stack-1x fa-inverse"></i>
          </span>
        </div>

        <div class="text">${lang("order_create_new")}</div>
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

    this.writeNoData(orders)
  }

  private writeNoData(orders: IOrder[]): void {
    const oldCard = this.list.find((k) => k.id === "nodata")

    if (orders.length < 1) {
      if (oldCard) return

      const nodataCard = new NoDataOrderCard({ orders: this })

      this.list.push(nodataCard)

      return this.efield.prepend(nodataCard.html)
    }

    if (oldCard) oldCard.destroy()
  }

  private btnCreateListener(): void {
    const btnCreate = futor(".AddOrder", this.el)

    this._rippleCaches.push(
      SetRipple(btnCreate, {
        color: Colors.white,
        run: async () => {
          if (this.manager.busy) return
          if (this.locked) return

          this.locked = true

          await waittime(120)

          history.back()

          this.locked = false
        }
      })
    )
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
      this.hide(false)
      this.king.tabs.hide(false)
      await this.bill.destroy()
    }

    // kalo gada path section, stop
    if (!section) return

    // kalo section-nya adalah buy
    if (section === "pay") {
      // tapi gada sub-nya, stop
      if (!sub) return

      // jalanin pembuatan cart
      this.hide()
      this.king.tabs.hide()
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

  private searchListener(): void {
    this.inp = futor('input[name="Search"]', this.el, "input")
    this.inp.onfocus = () => this.contextsDestroy()

    const handleSearch = debounce((text) => {
      const orderMinData = this.list.map((itm) => ({ id: itm.id, name: itm.name }))

      const orderIds = searchOrders(text, orderMinData)

      this.filterOrders(orderIds)
    }, 500)

    this.inp.oninput = () => handleSearch(this.inp.value)
  }

  private filterOrders(ids?: string[]): void {
    for (const orderCard of this.list) {
      orderCard.activate(!ids || ids.some((id) => id === orderCard.id))
    }

    if (!ids) return

    this.showEmpty(ids.length < 1)
  }

  private showEmpty(status: boolean = true): void {
    const oldEmpty = futor(".item-empty-search")

    if (!status) {
      if (oldEmpty) oldEmpty.remove()
      return
    }

    if (oldEmpty) return

    const emptyCard = kel("div", "item-empty item-empty-search")
    emptyCard.innerHTML = `
    <div class="empty-icon"><i class="fajdr fa-magnifying-glass"></i></div>
    <div class="empty-title">${lang("order_find_404_title")}</div>
    <div class="btn empty-reset">${lang("order_find_404_reset")}</div>`

    const btnEmpty = futor(".empty-reset", emptyCard)
    btnEmpty.onclick = () => {
      this.inp.value = ""
      this.filterOrders()
      btnEmpty.onclick = null
      emptyCard.remove()
    }

    this.efield.append(emptyCard)
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

    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    if (anim) {
      this.el.classList.add(anim)
      await waittime()
    }

    this.isDestroyed = true

    this.list.forEach((card) => card.destroy())
    this.list.splice(0, this.list.length)

    this.el.remove()
  }
}
