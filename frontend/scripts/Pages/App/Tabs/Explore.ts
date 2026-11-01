import type { IPrimary, IPrimaryConfig } from "@/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { eroot, futor, kel } from "@/core/kel"
import waittime from "@/lib/waittime"
import { formAbort } from "@/lib/modal"
import { type IStackHierarchy } from "@/core/hierarchy"
import { lang } from "@/core/languages"
import xhr from "@/lib/xhr"
import type { IProduct } from "@/types/ServiceTypes"
import { ProductCard } from "../Components/Explore/ProductCard"
import db from "../data/db"
import { TagCard } from "../Components/Explore/TagCard"
import { ProductContext } from "../Components/Explore/ProductContext"

function loadingCard(): HTMLDivElement {
  const item = kel("div", "item")
  item.innerHTML = `
  <div class="thumbnail thumbnail-empty">
    <i class="fas fa-circle-notch fa-spin"></i>
  </div>
  <div class="tags">
    <div class="tag">-</div>
  </div>
  <div class="name">Loading</div>
  <div class="price">Rp-</div>`

  return item
}

export class Explore implements IPrimary {
  private el!: HTMLDivElement

  locked: boolean = false

  private isDestroyed: boolean = false

  private anim?: string

  private king: StackPrimary
  private manager: StateManager

  private loaders: HTMLDivElement[] = []

  private list: ProductCard[] = []
  private tags: TagCard[] = []

  private efield!: HTMLDivElement
  private ecats!: HTMLDivElement

  private context?: ProductContext

  constructor(config: IPrimaryConfig) {
    this.king = config?.king
    this.manager = config.manager
    this.anim = config?.anim

    this.createElement()
    this.writeLoading()
    this.writeData()
  }

  // bikin element utama
  private createElement(): void {
    this.el = kel("div", "AppMain Explore")
    if (this.anim) this.el.classList.add(this.anim)

    this.el.innerHTML = `
    <div class="Title">
      <h1><i class="fajdr fa-house"></i> ${lang("tab_explore")}</h1>
    </div>
    <div class="Categories"></div>
    <div class="FlatList">
      <div class="List">
      </div>
    </div>`

    this.efield = futor(".FlatList .List", this.el, "div")
    this.ecats = futor(".Categories", this.el, "div")
  }

  // bikin dummy loading
  private writeLoading(): void {
    // kalo di db udah ada, jangan lanjut
    if (db.products.size > 0) return

    // loop sampe 6 kali
    for (let i = 0; i < 7; i++) {
      const eloader = loadingCard()
      this.loaders.push(eloader)

      this.efield.prepend(eloader)
    }
  }

  private deleteLoading(): void {
    this.loaders.forEach((eloader) => eloader.remove())
  }

  private async writeData(): Promise<void> {
    if (db.products.size < 1) {
      // await waittime(2000)
      const res = await xhr.forceGet("/x/explore/products")

      const products = res.data as IProduct[]

      db.products.add(...products)
    }

    if (!this.isDestroyed) this.deleteLoading()

    const products = db.products.getAll()

    this.writeCategories()

    for (const product of products) {
      const card = new ProductCard({ explore: this, product, manager: this.manager })

      this.list.push(card)

      this.efield.append(card.html)
    }
  }

  private writeCategories(): void {
    const tags = db.products.getCategories()

    for (const tag of tags) {
      const card = new TagCard(tag)

      card.onSelected((text) => this.selectFilter(text))
      this.tags.push(card)

      this.ecats.append(card.html)
    }

    const defaultTag = new TagCard({ text: lang("explore_category_all"), count: db.products.size })
    this.tags.push(defaultTag)
    defaultTag.onSelected(() => this.selectFilter())
    defaultTag.activate()
    this.ecats.prepend(defaultTag.html)
  }

  private selectFilter(category?: string): void {
    this.filterProducts(category)

    this.activateFilter(category)
  }

  filterProducts(category?: string): void {
    const products = this.list
    for (const product of products) {
      if (category) {
        product.hide(!product.categories.some((itm) => itm === category))
      } else {
        product.hide(false)
      }
    }
  }

  private activateFilter(category?: string, scroll?: boolean): void {
    const text = category || "Semua"

    const cards = this.tags

    for (const card of cards) {
      card.activate(card.category === text, scroll)
    }
  }

  async handleHistory(hierarchy: IStackHierarchy): Promise<void> {
    formAbort()
    // const { section, sub } = hierarchy

    // if (this.cart) {
    //   await this.cart.destroy()
    //   if (!section) return

    //   if (section === "peek") {
    //     if (!sub) return

    //     await this.startCart(sub)
    //   }
    // } else {
    //   if (!section) return

    //   if (section === "peek") {
    //     if (!sub) return

    //     await this.startCart(sub)
    //   }
    // }
  }

  async startContext(sub: string, e: PointerEvent): Promise<void> {
    if (this.locked) return
    this.locked = true

    const x = e.clientX
    const y = e.clientY

    if (this.context) {
      await this.context.destroy()
      this.context = undefined
    }

    const product = db.products.find(sub)

    if (!product) {
      this.locked = false
      return
    }

    const context = new ProductContext({
      explore: this,
      product,
      x,
      y
    })

    this.context = context
    eroot().append(context.html)

    context.updatePosition()

    await waittime()
    this.locked = false
  }

  setContext(context?: ProductContext): void {
    this.context = context
  }

  lock(status: boolean = true): void {
    this.locked = status
  }

  get html(): HTMLDivElement {
    return this.el
  }

  async destroy(anim?: string): Promise<void> {
    if (this.context) await this.context.destroy()

    if (anim) {
      this.el.classList.add(anim)
      await waittime()
    }

    this.isDestroyed = true

    this.tags.forEach((btn) => btn.destroy())
    this.tags.splice(0, this.tags.length)

    this.list.forEach((card) => card.destroy())
    this.list.splice(0, this.list.length)

    this.el.remove()
  }
}
