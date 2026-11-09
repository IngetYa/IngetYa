import type { IProduct } from "@/types/ServiceTypes"
import { Explore } from "../../Tabs/Explore"
import { SetRipple, type IRippleReturn } from "@/lib/Ripple"
import { futor, kel } from "@/core/kel"
import { toCurrency, toText } from "@/lib/gen"
import { lang } from "@/core/languages"
import waittime from "@/lib/waittime"
import { StateManager } from "../../core/StateManager"
import db from "../../data/db"
import { Colors } from "@/core/Colors"

export interface ProductContextConfig {
  product: IProduct
  explore: Explore
  manager: StateManager
  id: string
  x: number
  y: number
}

export class ProductContext {
  private el!: HTMLDivElement

  locked: boolean = false

  private _rippleCaches: IRippleReturn[] = []

  private product: IProduct
  private explore: Explore

  private manager: StateManager

  private x: number
  private y: number

  private _id: string

  constructor(config: ProductContextConfig) {
    this.product = config.product
    this.explore = config.explore
    this.manager = config.manager
    this._id = config.id

    this.x = config.x
    this.y = config.y

    this.createElement()
    this.btnCloseListener()
    this.btnPreviewListener()
    this.btnBuyListener()
  }

  get id(): string {
    return this._id
  }

  // bikin element utama
  private createElement(): void {
    this.el = kel("div", "ContextExplore")

    // one line biar ga menuhin editor wkwk
    // format aja atau pake beautifier biar rapi
    this.el.innerHTML = `<div class="btn btn-close"> ${lang("close")} <i class="fajdr fa-xmark fa-fw"></i> </div> <div class="thumbnail"> <img src="${this.product.image}" alt="${this.product.name} Thumbnail" /> </div> <div class="menu meta"> <div class="name">${toText(this.product.name)}</div> <div class="price">Rp${toCurrency(this.product.price + db.price["price_month-1"])}</div> </div> <div class="btn menu btn-preview"> <i class="fal fa-earth-asia fa-fw"></i> ${lang("explore_context_see")} </div> <div class="btn menu btn-chat"> <i class="fal fa-comment-dots fa-fw"></i> ${lang("order_chat_admin")} </div> <div class="btn menu btn-buy"> <i class="fal fa-cart-circle-plus fa-fw"></i> ${lang("explore_context_buy")} </div>`
  }

  // posisi atas
  private setVertical(pos: number, offset: number): void {
    const windowHeight = window.innerHeight

    if (offset >= windowHeight) {
      this.el.style.top = "10px"
      return
    }

    const centerY = (windowHeight - offset) / 2

    // kasih jarak dari atas/bawah biar  agak ke tengah
    const margin = Math.max(24, centerY * 0.5)
    const minTop = margin
    const maxTop = windowHeight - offset - margin

    let top = pos - offset / 2

    // kalo dah terlalu ujung, buat agak ke tengah
    if (top < minTop) {
      top = minTop
    } else if (top > maxTop) {
      top = maxTop
    }

    this.el.style.top = `${top.toString()}px`
  }

  // posisi kiri
  private setHorizontal(pos: number, offset: number): void {
    const windowWidth = window.innerWidth
    const gap = 12
    const edgeMargin = 16

    // default di kanan cursor (pointer)
    let left = pos + gap

    // cek element ngelebihin ujung kanan
    if (left + offset > windowWidth - edgeMargin) {
      // jadikan ada di kiri
      left = pos - offset - gap
    }

    // paksa biar ga nembus kiri
    if (left < edgeMargin) {
      left = edgeMargin
    }

    this.el.style.left = `${left.toString()}px`
  }

  updatePosition(): void {
    const offsetX = this.el.offsetWidth || this.el.clientWidth
    const offsetY = this.el.offsetHeight || this.el.clientHeight

    this.setHorizontal(this.x, offsetX)
    this.setVertical(this.y, offsetY)
  }

  // listener tombol close
  private btnCloseListener(): void {
    const btnClose = futor(".btn-close", this.el)

    const ripple = SetRipple(btnClose, {
      color: Colors.white,
      run: async () => {
        if (this.manager.busy) return
        if (this.locked) return
        if (this.explore.locked) return
        await this.close()
        this.explore.delContext(this._id)
      }
    })

    this._rippleCaches.push(ripple)
  }

  // listener tombol preview
  private btnPreviewListener(): void {
    const btnPreview = futor(".btn-preview", this.el)

    const ripple = SetRipple(btnPreview, {
      run: async () => {
        if (this.manager.busy) return
        if (this.locked) return
        if (this.explore.locked) return
        await this.close()
        this.explore.delContext(this._id)

        window.open(this.product.previewUrl, "_blank")
      }
    })

    this._rippleCaches.push(ripple)
  }

  // listener tombol buy
  private btnBuyListener(): void {
    const btnBuy = futor(".btn-buy", this.el)

    const ripple = SetRipple(btnBuy, {
      run: async () => {
        if (this.manager.busy) return
        if (this.locked) return
        if (this.explore.locked) return
        await this.close()
        this.explore.delContext(this._id)

        this.manager.next({ path: `#explore/buy/${this.product.id}` })
      }
    })

    this._rippleCaches.push(ripple)
  }

  async close(): Promise<void> {
    if (this.locked) return
    if (this.explore.locked) return

    await waittime(120)

    this.explore.lock()

    await this.destroy()

    this.explore.lock(false)
  }

  async destroy(): Promise<void> {
    // hapus ripple dari cache
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    this.el.classList.add("out")
    await waittime()
    // hapus element
    this.el.remove()
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
