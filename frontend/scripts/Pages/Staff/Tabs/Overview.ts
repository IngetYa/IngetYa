import type { IPrimary, IPrimaryConfig } from "@/Pages/Staff/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { futor, kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { lang } from "@/core/languages"
import { type IRippleReturn } from "@/lib/Ripple"
import { formAbort } from "@/lib/modal"
import db from "../data/db"
import xhr from "@/lib/xhr"
import type { IOverview } from "../types/EmbededAPITypes"
import { toText } from "@/lib/gen"
import { OverviewItemCard } from "../Components/Overview/ItemCard"

function loadingCard(): HTMLDivElement {
  const item = kel("div", "item-card")

  // one line biar ga menuhin editor wkwk
  // format aja atau pake beautifier biar rapi
  item.innerHTML = `
  <div class="item-head">
    <div class="skeleton"></div>
  </div>
  <div class="item-value"><div class="skeleton"></div></div>
  <div class="item-footer">
    <div class="skeleton"></div>
  </div>`

  return item
}

export class Overview implements IPrimary {
  private el!: HTMLDivElement
  locked: boolean = false
  private anim?: string

  private king: StackPrimary

  manager: StateManager

  private list: OverviewItemCard[] = []

  private _rippleCaches: IRippleReturn[] = []

  private isDestroyed: boolean = false

  private isLoaded: boolean = false

  private onLoaded?: () => void

  private loaders: HTMLDivElement[] = []
  private efield!: HTMLDivElement

  constructor(config: IPrimaryConfig) {
    this.king = config.king
    this.manager = config.manager
    this.anim = config.anim

    this.createElement()
    this.writeLoading()
    this.writeData()
  }

  private createElement(): void {
    this.el = kel("div", "StaffPage StaffOverview")
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `
    <div class="Header">
      <div class="HeaderMain">
        <div class="Title">
          <h1><i class="fadr fa-icons"></i> ${lang("tab_overview")}</h1>
        </div>
      </div>
    </div>

    <div class="FlatList">
      <div class="staff-hero-banner">
        <h2>${lang("overview_panel_title")}</h2>
        <div class="greeting">${toText(db.me.name)}#${db.me.id}</div>
      </div>

      <div class="section-title">
        <h3><i class="fadr fa-chart-simple"></i> ${lang("tab_overview")}</h3>
      </div>
      <div class="item-grid">
      </div>
    </div>`

    this.efield = futor(".FlatList .item-grid", this.el, "div")
  }

  private writeLoading(): void {
    // kalo di db udah ada, jangan lanjut
    if (db.overview.isLoaded) return

    // loop sampe 6 kali
    for (let i = 0; i < 6; i++) {
      const eloader = loadingCard()
      this.loaders.push(eloader)

      this.efield.prepend(eloader)
    }
  }

  private deleteLoading(): void {
    this.loaders.forEach((eloader) => eloader.remove())
  }

  private async writeData(): Promise<void> {
    if (!db.overview.isLoaded) {
      await waittime(1000)
      const res = await xhr.forceGet("/x/staff/data/overview")

      const data = res.data as IOverview[]

      db.overview.add(...data)
      db.overview.isLoaded = true
    }

    this.isLoaded = true

    if (!this.isDestroyed) this.deleteLoading()

    const overviewData = db.overview.getAll()

    for (const item of overviewData) {
      const card = new OverviewItemCard({ overview: this, item })

      // masukin ke array
      this.list.push(card)

      // render element
      this.efield.append(card.html)
    }

    if (this.onLoaded) {
      this.onLoaded()
      this.onLoaded = undefined
    }
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
    if (this.isLoaded) return await this.runHistoryQueue(hierarchy)

    return new Promise((resolve) => {
      this.onLoaded = async () => {
        await this.runHistoryQueue(hierarchy)
        resolve()
      }
    })
  }

  async destroy(anim?: string): Promise<void> {
    this._rippleCaches.forEach((r) => r.stopListener())
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

  get html(): HTMLDivElement {
    return this.el
  }
}
