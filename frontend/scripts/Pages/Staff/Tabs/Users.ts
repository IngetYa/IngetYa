import type { IPrimary, IPrimaryConfig } from "@/Pages/Staff/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { futor, kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { lang } from "@/core/languages"
import { type IRippleReturn } from "@/lib/Ripple"
import { NoDataUserCard, UserCard } from "../Components/Users/UserCard"
import { PageBar } from "@/lib/PageBar"
import db from "../data/db"
import xhr from "@/lib/xhr"
import type { IUserStaff, PaginatedResult } from "../types/EmbededAPITypes"
import { formAbort } from "@/lib/modal"

export class Users implements IPrimary {
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

  private list: (UserCard | NoDataUserCard)[] = []

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
    this.el = kel("div", "AppMain StaffPage StaffUsers")
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `
    <div class="Header">
      <div class="HeaderMain">
        <div class="Title">
          <h1><i class="fadr fa-address-book"></i> ${lang("tab_users")}</h1>
        </div>
      </div>
      <div class="Search">
        <div class="inp">
          <div class="icon"><i class="fajdr fa-magnifying-glass"></i></div>
          <input type="text" name="user-search-query" id="user-search-query-${Date.now()}" class="input-search-users" placeholder="Cari nama, email, atau ID user" readonly />
          <div class="btn btn-search-users">${lang("search")}</div>
        </div>
      </div>
    </div>

    <div class="FlatList">
      <div class="pagination-container">
      </div>

      <div class="users-grid">


        <div class="user-card-staff">
          <div class="user-card-head">
            <div class="skeleton avatar-circle"></div>
            <div class="user-core">
              <div class="user-name"><div class="skeleton"></div></div>
              <div class="user-id"><div class="skeleton"></div></div>
            </div>
          </div>
          <div class="user-card-body"><div class="skeleton"></div></div>
          <div class="user-card-footer"><div class="skeleton"></div></div>
        </div>
        <div class="user-card-staff">
          <div class="user-card-head">
            <div class="skeleton avatar-circle"></div>
            <div class="user-core">
              <div class="user-name"><div class="skeleton"></div></div>
              <div class="user-id"><div class="skeleton"></div></div>
            </div>
          </div>
          <div class="user-card-body"><div class="skeleton"></div></div>
          <div class="user-card-footer"><div class="skeleton"></div></div>
        </div>
      </div>
    </div>`

    this.efield = futor(".users-grid", this.el, "div")
  }

  private async writeData(): Promise<void> {
    if (!db.users.isLoaded) {
      await waittime(1000)
      await this.changePage(1)

      db.users.isLoaded = true
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

    this.pageBar.setMeta(db.users.Meta!)

    this.pageBar.onPageChange(async (pageNum) => {
      await this.changePage(pageNum)
    })

    parent.append(this.pageBar.html)
  }

  private async changePage(n: number): Promise<void> {
    await waittime(1000)
    const res = await xhr.forceGet(`/x/staff/data/users/${n}`)

    const data = res.data as PaginatedResult<IUserStaff>

    db.users.Meta = data.meta
    db.users.set(...data.data)

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
    const items = db.users.getAll()

    for (const item of items) {
      const card = new UserCard({ users: this, item, manager: this.manager })

      this.list.push(card)

      this.efield.append(card.html)
    }

    this.writeNoData(items)
  }

  private writeNoData(users: IUserStaff[]): void {
    const oldCard = this.list.find((k) => k.id === "nodata")

    if (users.length < 1) {
      if (oldCard) return

      const nodataCard = new NoDataUserCard({ users: this })

      this.list.push(nodataCard)

      return this.efield.prepend(nodataCard.html)
    }

    if (oldCard) oldCard.destroy()
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

    this.deleteList()

    this.pageBar.destroy()

    this.el.remove()
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
