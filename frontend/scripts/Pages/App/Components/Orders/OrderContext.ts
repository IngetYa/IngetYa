import paymentDetail from "@/data/PaymentDetail.json"
import type { IBill, IContent, IOrder, IProduct } from "@/types/ServiceTypes"
import { Explore } from "../../Tabs/Explore"
import { SetRipple, type IRippleReturn } from "@/lib/Ripple"
import { futor, kel } from "@/core/kel"
import { toCurrency, toText } from "@/lib/gen"
import { getLanguage, lang } from "@/core/languages"
import waittime from "@/lib/waittime"
import { StateManager } from "../../core/StateManager"
import db from "../../data/db"
import { Orders } from "../../Tabs/Orders"
import { formAlert } from "@/lib/modal"
import { openLink } from "@/core/navigators"

export interface OrderContextConfig {
  order: IOrder
  orders: Orders
  manager: StateManager
  id: string
  x: number
  y: number
}

export class OrderContext {
  private el!: HTMLDivElement

  locked: boolean = false

  private _rippleCaches: IRippleReturn[] = []

  private _actionCaches: IRippleReturn[] = []

  private order: IOrder
  private orders: Orders

  private bill: IBill

  product: IProduct

  private content?: IContent | null

  private manager: StateManager

  private x: number
  private y: number

  private _id: string

  private isDetailShown: boolean = false

  constructor(config: OrderContextConfig) {
    this.order = config.order
    this.orders = config.orders
    this.manager = config.manager
    this._id = config.id

    this.product = db.products.find(config.order.productId)!
    this.bill = db.bills.find(config.order.id)!
    this.content = db.contents.find(config.order.id)

    this.x = config.x
    this.y = config.y

    this.createElement()
    this.writeData()
    this.btnCloseListener()
    this.detailListener()
    this.updateActionButtons()
  }

  get id(): string {
    return this._id
  }

  // bikin element utama
  private createElement(): void {
    this.el = kel("div", "ContextExplore")

    // one line biar ga menuhin editor wkwk
    // format aja atau pake beautifier biar rapi
    this.el.innerHTML = `
    <div class="btn btn-close"> ${lang("close")} <i class="fajdr fa-xmark fa-fw"></i> </div>
    <div class="order-name">${toText(this.order.name)}</div>
    <div class="order-status ${this.order.status}">${lang("status_" + this.order.status)}</div>
    <div class="order-items">
      <div class="order-label">
        <span class="arrow-openclose"><i class="fas fa-chevron-right"></i></span> <span class="order-label-text">${lang("order_see_detail")}</span>
      </div>
      <div class="order-list">
        <div class="item">
          <div class="item-label">${lang("label_order_id")}</div>
          <div class="item-name">#${this.order.id}</div>
        </div>
        <div class="item">
          <div class="item-label">${lang("label_cart_theme")}</div>
          <div class="item-name">${toText(this.product.name)}</div>
        </div>
        <div class="item">
          <div class="item-label">${lang("label_cart_package")}</div>
          <div class="item-name">${lang("label_cart_" + this.order.package)}</div>
        </div>
        <div class="item">
          <div class="item-label">${lang("label_cart_guests")}</div>
          <div class="item-name">${lang("label_cart_" + this.order.guests)}</div>
        </div>
        <div class="item">
          <div class="item-label">${lang("label_cart_addon")}</div>
          <div class="item-name item-addons-name"></div>
        </div>
      </div>
    </div>
    <div class="thumbnail">
      <img src="${this.product.image}" alt="${this.product.name} Thumbnail" />
    </div>
    <div class="menu pricing">
      <div class="name"></div>
      <div class="price"></div>
    </div>
    <div class="action-group"></div>`
  }

  private writeData(): void {
    const addons = this.order.addOns
    const eaddon = futor(".item-addons-name", this.el)

    if (addons && addons.length > 0) {
      const addonString = addons.map((addonId) => lang("label_cart_" + addonId)).join(", ")
      eaddon.innerText = addonString
    } else {
      eaddon.innerText = "-"
    }

    const paymentData = paymentDetail.find((payment) => payment.id === this.order.paymentId)
    if (!paymentData) throw new Error("Payment Data is invalid")

    const paymentName = futor(".pricing .name", this.el)
    paymentName.innerText = paymentData.name[getLanguage()]

    const paymentAmount = futor(".pricing .price", this.el)
    paymentAmount.innerText = `Rp${toCurrency(this.bill.price)}`
  }

  // update action buttons
  private updateActionButtons(): void {
    const actionGroup = futor(".action-group", this.el, "div")

    this.deleteActionCache()

    while (actionGroup.firstChild) {
      const btn = actionGroup.firstChild as HTMLElement
      btn.remove()
    }

    const status = this.order.status

    if (status === "expired") return

    if (status === "unpaid") this.writeBtnPay(actionGroup)

    if (status === "draft") this.writeBtnModify(actionGroup)

    if (status === "published") {
      this.writeBtnLink(actionGroup)
      this.writeBtnModify(actionGroup)
    }

    this.writeBtnChat(actionGroup)
  }

  private writeBtnChat(field: HTMLDivElement): void {
    const btn = kel("div", "btn menu btn-chat")
    btn.innerHTML = `<i class="fal fa-comment-dots fa-fw"></i> ${lang("order_chat_admin")}`

    this._actionCaches.push(
      SetRipple(btn, {
        run: async () => {
          await formAlert("Under Development LOLXD")
        }
      })
    )

    field.append(btn)
  }

  private writeBtnLink(field: HTMLDivElement): void {
    const btn = kel("a", "btn menu btn-link")

    const link = this.content?.url || window.location.href

    btn.href = link
    btn.innerHTML = `<i class="fal fa-link fa-fw"></i> ${lang("order_open_link")}`

    this._actionCaches.push(
      SetRipple(btn, {
        run: async () => {
          if (this.manager.busy) return
          if (this.locked) return
          if (this.orders.locked) return
          await this.close()
          this.orders.delContext(this._id)
          openLink(link)
        }
      })
    )

    field.append(btn)
  }

  private writeBtnModify(field: HTMLDivElement): void {
    const btn = kel("div", "btn menu btn-modify")
    btn.innerHTML = `<i class="fal fa-pen-to-square fa-fw"></i> ${lang("order_your_order")}`

    this._actionCaches.push(SetRipple(btn))

    field.append(btn)
  }

  private writeBtnPay(field: HTMLDivElement): void {
    const btn = kel("div", "btn menu btn-pay")
    btn.innerHTML = `<i class="fal fa-file-invoice fa-fw"></i> ${lang("order_pay_now")}`

    this._actionCaches.push(
      SetRipple(btn, {
        run: () => {
          if (this.manager.busy) return
          if (this.orders.locked) return

          this.manager.next({ path: `#orders/pay/${this.order.id}` })
        }
      })
    )

    field.append(btn)
  }

  private detailListener(): void {
    const itemList = futor(".order-items", this.el)
    const btnDetail = futor(".order-label", this.el)
    const textDetail = futor(".order-label-text", this.el)

    this._rippleCaches.push(
      SetRipple(btnDetail, {
        run: () => {
          this.isDetailShown = !this.isDetailShown

          itemList.classList[this.isDetailShown ? "add" : "remove"]("show")

          textDetail.innerText = lang(`order_${this.isDetailShown ? "un" : ""}see_detail`)
        }
      })
    )
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
      run: async () => {
        if (this.manager.busy) return
        if (this.locked) return
        if (this.orders.locked) return
        await this.close()
        this.orders.delContext(this._id)
      }
    })

    this._rippleCaches.push(ripple)
  }

  async close(): Promise<void> {
    if (this.locked) return
    if (this.orders.locked) return

    await waittime(120)

    this.orders.lock()

    await this.destroy()

    this.orders.lock(false)
  }

  private deleteActionCache(): void {
    this._actionCaches.forEach((ripple) => ripple.stopListener())
    this._actionCaches.splice(0, this._actionCaches.length)
  }

  async destroy(): Promise<void> {
    // hapus ripple dari cache
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)
    this.deleteActionCache()

    this.el.classList.add("out")
    await waittime()
    // hapus element
    this.el.remove()
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
