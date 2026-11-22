import type { IPrimary, IPrimaryConfig } from "@/Pages/Staff/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { futor, kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { lang } from "@/core/languages"
import { type IRippleReturn } from "@/lib/Ripple"
import { NoDataOrderCard, OrderCard } from "../Components/Orders/OrderCard"
import { PageBar } from "@/lib/PageBar"
import db from "../data/db"
import xhr from "@/lib/xhr"
import type { IOrderStaff, PaginatedResult } from "../types/EmbededAPITypes"
import { formAbort } from "@/lib/modal"

export class Orders implements IPrimary {
  private el!: HTMLDivElement
  locked: boolean = false
  private anim?: string
  private king: StackPrimary
  manager: StateManager
  private _rippleCaches: IRippleReturn[] = []

  private isDestroyed: boolean = false

  private isLoaded: boolean = false

  private onLoaded?: () => void

  private efield!: HTMLDivElement

  private list: (OrderCard | NoDataOrderCard)[] = []

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
    this.el = kel("div", "AppMain StaffPage StaffOrders")
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `
    <div class="Header">
      <div class="HeaderMain">
        <div class="Title">
          <h1><i class="fadr fa-bag-shopping"></i> ${lang("tab_orders")}</h1>
        </div>
      </div>
      <div class="Search">
        <div class="inp">
          <div class="icon"><i class="fajdr fa-magnifying-glass"></i></div>
          <input type="text" name="order-search-query" id="order-search-query-${Date.now()}" class="input-search-orders" placeholder="Cari ID pesanan, nama klien, atau judul" readonly />
          <div class="btn btn-search-orders">${lang("search")}</div>
        </div>
      </div>
    </div>

    <div class="FlatList">

      <div class="pagination-container">
      </div>


      <div class="orders-grid">

        <div class="order-card-staff">
          <div class="order-card-header">
            <div class="skeleton"></div>
          </div>
          <div class="order-card-body">
            <div class="order-title"><div class="skeleton"></div></div>
            <div class="order-meta-list">
              <div class="skeleton"></div>
            </div>
          </div>
          <div class="order-card-footer">
            <div class="skeleton"></div>
          </div>
        </div>
        <div class="order-card-staff">
          <div class="order-card-header">
            <div class="skeleton"></div>
          </div>
          <div class="order-card-body">
            <div class="order-title"><div class="skeleton"></div></div>
            <div class="order-meta-list">
              <div class="skeleton"></div>
            </div>
          </div>
          <div class="order-card-footer">
            <div class="skeleton"></div>
          </div>
        </div>

      </div>

    </div>`

    this.efield = futor(".orders-grid", this.el, "div")
  }

  private async writeData(): Promise<void> {
    if (!db.orders.isLoaded) {
      await waittime(1000)
      await this.changePage(1)

      db.orders.isLoaded = true
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

    this.pageBar.setMeta(db.orders.Meta!)

    this.pageBar.onPageChange(async (pageNum) => {
      await this.changePage(pageNum)
    })

    parent.append(this.pageBar.html)
  }

  private async changePage(n: number): Promise<void> {
    await waittime(1000)
    const res = await xhr.forceGet(`/x/staff/data/orders/${n}`)

    const data = res.data as PaginatedResult<IOrderStaff>

    db.orders.Meta = data.meta
    db.orders.set(...data.data)

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
    const items = db.orders.getAll()

    for (const item of items) {
      const card = new OrderCard({ orders: this, item, manager: this.manager })

      this.list.push(card)

      this.efield.append(card.html)
    }

    this.writeNoData(items)
  }

  private writeNoData(orders: IOrderStaff[]): void {
    const oldCard = this.list.find((k) => k.id === "nodata")

    if (orders.length < 1) {
      if (oldCard) return

      const nodataCard = new NoDataOrderCard({ orders: this })

      this.list.push(nodataCard)

      return this.efield.prepend(nodataCard.html)
    }

    if (oldCard) oldCard.destroy()
  }

  private async runHistoryQueue(hierarchy: IStackHierarchy): Promise<void> {
    formAbort()
  }

  async handleHistory(hierarchy: IStackHierarchy): Promise<void> {
    if (this.isLoaded) return await this.runHistoryQueue(hierarchy)

    return new Promise((resolve) => {
      this.onLoaded = async () => {
        await this.runHistoryQueue(hierarchy)
        resolve()
      }
    })
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
