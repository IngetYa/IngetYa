import type { IPrimary, IPrimaryConfig } from "@/Pages/Staff/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { eroot, futor, kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { lang } from "@/core/languages"
import { type IRippleReturn } from "@/lib/Ripple"
import db from "../data/db"
import { ProductCard } from "../Components/Products/ProductCard"
import { TagCard } from "../Components/Products/TagCard"
import { ProductContext } from "../Components/Products/ProductContext"
import { genStringId } from "@/lib/gen"
import { formAbort } from "@/lib/modal"

export class Products implements IPrimary {
  private el!: HTMLDivElement
  locked: boolean = false
  private anim?: string
  private king: StackPrimary
  manager: StateManager

  private list: ProductCard[] = []
  private tags: TagCard[] = []

  private efield!: HTMLDivElement
  private ecats!: HTMLDivElement

  private contexts: ProductContext[] = []

  private _rippleCaches: IRippleReturn[] = []

  private isDestroyed: boolean = false

  constructor(config: IPrimaryConfig) {
    this.king = config.king
    this.manager = config.manager
    this.anim = config.anim

    this.createElement()
    this.writeData()
  }

  private createElement(): void {
    this.el = kel("div", "AppMain StaffPage StaffProducts")
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `
    <div class="Header">
      <div class="HeaderMain">
        <div class="Title">
          <h1><i class="fajdr fa-map"></i> ${lang("tab_products")}</h1>
        </div>
      </div>
      <div class="Categories">
      </div>
    </div>
    <div class="FlatList">
      <div class="List">
      </div>
    </div>`

    this.efield = futor(".FlatList .List", this.el, "div")
    this.ecats = futor(".Categories", this.el, "div")
  }

  private async writeData(): Promise<void> {
    // ambil data product
    const products = db.products.getAll()

    // render semua kategori
    this.writeCategories()

    // loop sampai semua products dirender
    for (const product of products) {
      const card = new ProductCard({ products: this, product })

      // masukin ke array
      this.list.push(card)

      // render element
      this.efield.append(card.html)
    }
  }

  private writeCategories(): void {
    // ambil semua kategori
    const tags = db.products.getCategories()

    // loop kategori sampai dirender semua
    for (const tag of tags) {
      const card = new TagCard(tag)

      // sisipin method buat pemilihan kategori
      card.onSelected((text) => this.selectFilter(text))

      // masukin ke array
      this.tags.push(card)

      // render element
      this.ecats.append(card.html)
    }

    // sama, tapi bikin kategori baru buat render unhide semua (all) kategori
    const defaultTag = new TagCard({ text: lang("explore_category_all"), count: db.products.size })
    this.tags.push(defaultTag)
    defaultTag.onSelected(() => this.selectFilter())
    defaultTag.activate()
    this.ecats.prepend(defaultTag.html)
  }

  // setCart(cart?: Cart) {
  //   this.cart = cart
  // }

  async startContext(sub: string, e: PointerEvent): Promise<void> {
    if (this.manager.busy) return
    if (this.locked) return
    this.locked = true

    const x = e.clientX
    const y = e.clientY

    await this.contextsDestroy()

    const product = db.products.find(sub)

    if (!product) {
      this.locked = false
      return
    }

    if (this.isDestroyed) return

    const context = new ProductContext({
      products: this,
      product,
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

  private selectFilter(category?: string): void {
    // hapus dulu kalo ada product context
    this.contextsDestroy()
    // if (this.context) {
    //   this.context.close()
    //   this.setContext()
    // }

    // jalankan filter
    this.filterProducts(category)

    // aktifkan tombol filter
    this.activateFilter(category)
  }

  filterProducts(category?: string): void {
    const products = this.list

    // loop semua product
    for (const product of products) {
      if (category) {
        // kalo ngebawa kategori, hide yang bukan kategori terpilih
        product.hide(!product.categories.some((itm) => itm === category))
      } else {
        // kalo engga, hide semua la
        product.hide(false)
      }
    }
  }

  private activateFilter(category?: string, scroll?: boolean): void {
    // text kategori
    const text = category || lang("explore_category_all") || "All"

    // semua constructor kategori (TagsCard)
    const cards = this.tags

    // loop semua kategori
    for (const card of cards) {
      // hanya aktifkan yang sesuai
      card.activate(card.category === text, scroll)
    }
  }

  addContext(context: ProductContext): void {
    this.contexts.push(context)
  }
  delContext(contextId: string): void {
    const contextIdx = this.contexts.findIndex((context) => context.id === contextId)
    if (contextIdx !== -1) this.contexts.splice(contextIdx, 1)
  }

  async contextsDestroy(): Promise<void> {
    while (this.contexts.length > 0) {
      const context = this.contexts.shift()
      if (context) await context.destroy()
    }
  }

  private async runHistoryQueue(hierarchy: IStackHierarchy): Promise<void> {
    // hapus dulu kalo ada modal
    formAbort()

    // hapus dulu kalo ada product context
    await this.contextsDestroy()
    // if (this.context) {
    //   await this.context.destroy()
    //   this.setContext()
    // }

    // cek path hierarchy
    const { section, sub } = hierarchy

    // kalo lagi buka cart
    // if (this.cart) {
    //   // hapus dulu cart-nya
    //   this.king.tabs.hide(false)
    //   this.hide(false)
    //   await this.cart.destroy()
    // }

    // kalo gada path section, stop
    if (!section) return

    // kalo section-nya adalah buy
    // if (section === "edit") {
    //   // tapi gada sub-nya, stop
    //   if (!sub) return

    //   // jalanin pembuatan cart
    //   this.hide()
    //   this.king.tabs.hide()

    //   await this.startCart(sub)
    // }
  }

  async handleHistory(hierarchy: IStackHierarchy): Promise<void> {
    return await this.runHistoryQueue(hierarchy)
  }

  lock(status: boolean = true): void {
    this.locked = status
  }

  async destroy(anim?: string): Promise<void> {
    this._rippleCaches.forEach((r) => r.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    if (anim) {
      this.el.classList.add(anim)
      await waittime()
    }

    this.isDestroyed = true

    this.el.remove()
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
