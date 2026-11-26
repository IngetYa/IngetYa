import type { IPrimary, IPrimaryConfig } from "@/Pages/App/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { eroot, futor, kel } from "@/core/kel"
import waittime from "@/lib/waittime"
import { formAbort } from "@/lib/modal"
import { type IStackHierarchy } from "@/core/hierarchy"
import { lang } from "@/core/languages"
import { ProductCard } from "../Components/Explore/ProductCard"
import db from "../data/db"
import { TagCard } from "../Components/Explore/TagCard"
import { ProductContext } from "../Components/Explore/ProductContext"
import { Cart } from "../Components/Explore/Cart"
import { genStringId } from "@/lib/gen"

function loadingCard(): HTMLDivElement {
  const item = kel("div", "item")

  item.innerHTML = `<div class="thumbnail"><div class="skeleton"></div></div> <div class="tags"><div class="skeleton"></div></div> <div class="name"><div class="skeleton"></div></div> <div class="price"><div class="skeleton"></div></div>`

  return item
}

export class Explore implements IPrimary {
  private el!: HTMLDivElement

  locked: boolean = false

  private isDestroyed: boolean = false

  private anim?: string

  private king: StackPrimary
  manager: StateManager

  private loaders: HTMLDivElement[] = []

  private list: ProductCard[] = []
  private tags: TagCard[] = []

  private efield!: HTMLDivElement
  private ecats!: HTMLDivElement

  private contexts: ProductContext[] = []

  private cart?: Cart

  constructor(config: IPrimaryConfig) {
    this.king = config?.king
    this.manager = config.manager
    this.anim = config?.anim

    this.createElement()
    this.writeLoading()
    this.writeData()
  }

  private createElement(): void {
    this.el = kel("div", "AppMain Explore")
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `<div class="Header"><div class="HeaderMain"><div class="Title"><h1><i class="fajdr fa-house"></i> ${lang("header_explore")}</h1></div></div><div class="Categories"></div></div> <div class="FlatList"> <div class="List"> </div> </div>`

    this.efield = futor(".FlatList .List", this.el, "div")
    this.ecats = futor(".Categories", this.el, "div")
  }

  private writeLoading(): void {
    if (db.products.size > 0) return

    for (let i = 0; i < 9; i++) {
      const eloader = loadingCard()
      this.loaders.push(eloader)

      this.efield.prepend(eloader)
    }
  }

  private async writeData(): Promise<void> {
    const products = db.products.getAll()

    this.writeCategories()

    for (const product of products) {
      const card = new ProductCard({ explore: this, product })

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
    this.contextsDestroy()

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
    const text = category || lang("explore_category_all") || "All"

    const cards = this.tags

    for (const card of cards) {
      card.activate(card.category === text, scroll)
    }
  }

  private async runHistoryQueue(hierarchy: IStackHierarchy): Promise<void> {
    formAbort()

    await this.contextsDestroy()

    const { section, sub } = hierarchy

    if (this.cart) {
      this.king.tabs.hide(false)
      this.hide(false)
      await this.cart.destroy()
    }

    if (!section) return

    if (section === "buy") {
      if (!sub) return

      await this.startCart(sub)
    }
  }

  async handleHistory(hierarchy: IStackHierarchy): Promise<void> {
    return await this.runHistoryQueue(hierarchy)
  }

  private async startCart(sub: string): Promise<void> {
    const product = db.products.find(sub)

    if (!product) return

    this.hide()
    this.king.tabs.hide()

    const cart = new Cart({ explore: this, manager: this.manager, product })

    this.setCart(cart)
    eroot().append(cart.html)

    await waittime()
  }

  setCart(cart?: Cart) {
    this.cart = cart
  }

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
      explore: this,
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

  addContext(context: ProductContext): void {
    this.contexts.push(context)
  }
  delContext(contextId: string): void {
    const contextIdx = this.contexts.findIndex((context) => context.id === contextId)
    if (contextIdx !== -1) this.contexts.splice(contextIdx, 1)
  }

  lock(status: boolean = true): void {
    this.locked = status
  }

  get html(): HTMLDivElement {
    return this.el
  }

  async contextsDestroy(): Promise<void> {
    while (this.contexts.length > 0) {
      const context = this.contexts.shift()
      if (context) await context.destroy()
    }
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
