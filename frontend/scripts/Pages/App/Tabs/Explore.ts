import type { IPrimary, IPrimaryConfig } from "@/Pages/App/types/StackTypes"
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
import { Cart } from "../Components/Explore/Cart"
import { genStringId } from "@/lib/gen"

function loadingCard(): HTMLDivElement {
  const item = kel("div", "item")

  // one line biar ga menuhin editor wkwk
  // format aja atau pake beautifier biar rapi
  item.innerHTML = `<div class="thumbnail thumbnail-empty"> <i class="fas fa-circle-notch fa-spin"></i> </div> <div class="tags"> <div class="tag">-</div> </div> <div class="name">${lang("loading")}</div> <div class="price">Rp-</div>`

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

  private isLoaded: boolean = false

  private onLoaded?: () => void

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
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    // one line biar ga menuhin editor wkwk
    // format aja atau pake beautifier biar rapi
    this.el.innerHTML = `<div class="Header"><div class="HeaderMain"><div class="Title"><h1><i class="fajdr fa-house"></i> ${lang("header_explore")}</h1></div></div><div class="Categories"></div></div> <div class="FlatList"> <div class="List"> </div> </div>`

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

  // incase ada loading (setelah reload), hapus semua placeholdernya
  private deleteLoading(): void {
    this.loaders.forEach((eloader) => eloader.remove())
  }

  private async writeData(): Promise<void> {
    // kalo gada di local db, req lagi ke server
    // harusnya ini ga bakal kejadian, udah dihandle pas Splash
    if (db.products.size < 1) {
      const res = await xhr.forceGet("/x/explore/detail")

      const products = res.data.products as IProduct[]

      db.products.add(...products)
    }

    // kasih tanda, tadinya gada splash, so ngeceknya pake isLoaded
    this.isLoaded = true

    // kalo misal elementnya udah dihapus, tapi loadingnya baru selesai, cek dulu sebelum hapus loader
    if (!this.isDestroyed) this.deleteLoading()

    // ambil data product
    const products = db.products.getAll()

    // render semua kategori
    this.writeCategories()

    // loop sampai semua products dirender
    for (const product of products) {
      const card = new ProductCard({ explore: this, product })

      // masukin ke array
      this.list.push(card)

      // render element
      this.efield.append(card.html)
    }

    // kalo ada callback method yang disisipin, jalanin sekarang, terus hapus
    if (this.onLoaded) {
      this.onLoaded()
      this.onLoaded = undefined
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
    if (this.cart) {
      // hapus dulu cart-nya
      this.king.tabs.hide(false)
      this.hide(false)
      await this.cart.destroy()
    }

    // kalo gada path section, stop
    if (!section) return

    // kalo section-nya adalah buy
    if (section === "buy") {
      // tapi gada sub-nya, stop
      if (!sub) return

      // jalanin pembuatan cart
      this.hide()
      this.king.tabs.hide()

      await this.startCart(sub)
    }
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

  private async startCart(sub: string): Promise<void> {
    const product = db.products.find(sub)

    if (!product) return

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

    // if (this.contexts) {
    //   this.context.destroy()
    //   this.setContext()
    // }

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
