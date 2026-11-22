import type { IProduct } from "@/types/ServiceTypes"
import { Products } from "../../Tabs/Products"
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
  products: Products
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
  private products: Products

  private manager: StateManager

  private x: number
  private y: number

  private _id: string

  constructor(config: ProductContextConfig) {
    this.product = config.product
    this.products = config.products
    this.manager = config.manager
    this._id = config.id

    this.x = config.x
    this.y = config.y

    this.createElement()
    this.btnCloseListener()
    this.btnPreviewListener()
    this.btnEditListener()
  }

  get id(): string {
    return this._id
  }

  private createElement(): void {
    this.el = kel("div", "ContextExplore")

    this.el.innerHTML = `<div class="btn btn-close"> ${lang("close")} <i class="fajdr fa-xmark fa-fw"></i> </div> <div class="thumbnail"> <img src="${this.product.image}" alt="${this.product.name} Thumbnail" /> </div> <div class="menu meta"> <div class="name">${toText(this.product.name)}</div> <div class="price">Rp${toCurrency(this.product.price + db.price["price_month-1"])}</div> </div> <div class="btn menu btn-preview"> <i class="fal fa-earth-asia fa-fw"></i> ${lang("explore_context_see")} </div> <div class="btn menu btn-edit"> <i class="fal fa-pencil fa-fw"></i> ${lang("explore_context_edit")} </div>`
  }

  private setVertical(pos: number, offset: number): void {
    const windowHeight = window.innerHeight

    if (offset >= windowHeight) {
      this.el.style.top = "10px"
      return
    }

    const centerY = (windowHeight - offset) / 2

    const margin = Math.max(24, centerY * 0.5)
    const minTop = margin
    const maxTop = windowHeight - offset - margin

    let top = pos - offset / 2

    if (top < minTop) {
      top = minTop
    } else if (top > maxTop) {
      top = maxTop
    }

    this.el.style.top = `${top.toString()}px`
  }

  private setHorizontal(pos: number, offset: number): void {
    const windowWidth = window.innerWidth
    const gap = 12
    const edgeMargin = 16

    let left = pos + gap

    if (left + offset > windowWidth - edgeMargin) {
      left = pos - offset - gap
    }

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

  private btnCloseListener(): void {
    const btnClose = futor(".btn-close", this.el)

    const ripple = SetRipple(btnClose, {
      color: Colors.white,
      run: async () => {
        if (this.manager.busy) return
        if (this.locked) return
        if (this.products.locked) return
        await this.close()
        this.products.delContext(this._id)
      }
    })

    this._rippleCaches.push(ripple)
  }

  private btnPreviewListener(): void {
    const btnPreview = futor(".btn-preview", this.el)

    const ripple = SetRipple(btnPreview, {
      run: async () => {
        if (this.manager.busy) return
        if (this.locked) return
        if (this.products.locked) return
        await this.close()
        this.products.delContext(this._id)

        window.open(this.product.previewUrl, "_blank")
      }
    })

    this._rippleCaches.push(ripple)
  }

  private btnEditListener(): void {
    const btnEdit = futor(".btn-edit", this.el)

    const ripple = SetRipple(btnEdit, {
      run: async () => {
        if (this.manager.busy) return
        if (this.locked) return
        if (this.products.locked) return
        await this.close()
        this.products.delContext(this._id)

        this.manager.next({ path: `#products/edit/${this.product.id}` })
      }
    })

    this._rippleCaches.push(ripple)
  }

  async close(): Promise<void> {
    if (this.locked) return
    if (this.products.locked) return

    await waittime(120)

    this.products.lock()

    await this.destroy()

    this.products.lock(false)
  }

  async destroy(): Promise<void> {
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    this.el.classList.add("out")
    await waittime()
    this.el.remove()
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
