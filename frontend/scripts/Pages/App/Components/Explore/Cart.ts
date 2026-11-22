import waittime from "@/lib/waittime"
import { StateManager } from "../../core/StateManager"
import { Explore } from "../../Tabs/Explore"
import { futor, kel } from "@/core/kel"
import { lang } from "@/core/languages"
import { toCurrency, toText } from "@/lib/gen"
import type { IProduct } from "@/types/ServiceTypes"
import db from "../../data/db"
import type { IBundlePrice, IOrderData } from "@/types/PaymentTypes"
import { PaymentSummary } from "../PaymentSummary"
import { type IRippleReturn, SetRipple } from "@/lib/Ripple"
import { Colors } from "@/core/Colors"

export interface CartConfig {
  manager: StateManager
  explore: Explore
  product: IProduct
}

export class Cart {
  private el!: HTMLDivElement

  locked: boolean = false

  manager: StateManager
  private explore: Explore
  private product: IProduct

  private etotal!: HTMLDivElement

  private packageId: string = "month-1"
  private guestId: string = "guest-1"
  private bookId?: string

  private _rippleCaches: IRippleReturn[] = []

  private payments: PaymentSummary[] = []

  constructor(config: CartConfig) {
    this.manager = config.manager
    this.explore = config.explore
    this.product = config.product

    this.createElement()
    this.writePayments()
    this.updatePrice()
    this.packageListener()
    this.guestListener()
    this.addonListener()
    this.btnBackListener()
  }

  private createElement(): void {
    this.el = kel("div", "AppSec Cart")

    this.el.innerHTML = `
    <div class="AppMain-Box">
      <div class="Header">
        <div class="HeaderMain">
          <div class="btn btn-back HistoryBack">
            <i class="far fa-arrow-left fa-fw"></i>
          </div>
          <div class="Title">
            <h1><i class="fajdr fa-flower"></i> ${lang("header_cart")}</h1>
          </div>
        </div>

        <div class="FormTotal">
          <div class="total-meta">
            <div class="total-title">${lang("label_cart_sub_total")}</div>
            <div class="total-price"></div>
          </div>
        </div>

      </div>

      <div class="FlatList">
        <div class="iform inlined relative no-bg no-pad">
          <div class="box">
            <div class="f">
              <div class="i">
                <label for="order-name">${lang("label_cart_order_name")}</label>
                <div class="inp">
                  <input type="text" name="order-name" id="order-name" placeholder="${lang("placeholder_cart_order_name")}" maxlength="120" autocomplete="off" required />
                </div>
              </div>
            </div>
            <div class="f">
              <div class="order-meta">
                <div class="order-item-thumbnail">
                  <img src="${this.product.image}" alt="${this.product.name} Thumbnail" />
                </div>
                <div class="order-item-name">${toText(this.product.name)}</div>
                <div class="order-item-price">Rp${toCurrency(this.product.price)}</div>
              </div>
            </div>
            <div class="f">
              <div class="i">
                <p class="tx">${lang("label_cart_package")}</p>
                <div class="f p">
                  <div class="i">
                    <div class="radio">
                      <label for="month-1">
                        <input type="radio" name="month" id="month-1" value="month-1" checked />
                        <span>
                          <b>${lang("label_cart_month-1")}</b>
                          <br />Rp${toCurrency(db.price["price_month-1"])} </span>
                      </label>
                    </div>
                  </div>
                  <div class="i">
                    <div class="radio">
                      <label for="month-2">
                        <input type="radio" name="month" id="month-2" value="month-2" />
                        <span>
                          <b>${lang("label_cart_month-2")}</b>
                          <br />Rp${toCurrency(db.price["price_month-2"])} </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="groups">
              <div class="f">
                <div class="i">
                  <div class="tx">${lang("label_cart_guests")}</div>
                  <div class="f p">
                    <div class="i">
                      <div class="radio">
                        <label for="guest-1">
                          <input type="radio" name="guest" id="guest-1" value="guest-1" checked />
                          <span>
                            <b>${lang("label_cart_guest-1")}</b>
                            <br />${lang("free")} </span>
                        </label>
                      </div>
                      <div class="check addon-book">
                        <label for="book-1">
                          <input id="book-1" name="book" type="checkbox" value="book-1" />
                          <span>
                            <b>${lang("label_cart_book-1")}</b> Rp${toCurrency(db.price["price_book-1"])} </span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div class="f p">
                    <div class="i">
                      <div class="radio">
                        <label for="guest-2">
                          <input type="radio" name="guest" id="guest-2" value="guest-2" />
                          <span>
                            <b>${lang("label_cart_guest-2")}</b>
                            <br />Rp${toCurrency(db.price["price_guest-2"])} (${lang("label_cart_free_guest_book")}) </span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div class="f p">
                    <div class="i">
                      <div class="radio">
                        <label for="guest-3">
                          <input type="radio" name="guest" id="guest-3" value="guest-3" />
                          <span>
                            <b>${lang("label_cart_guest-3")}</b>
                            <br />Rp${toCurrency(db.price["price_guest-3"])} (${lang("label_cart_free_guest_book")}) </span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div class="f p">
                    <div class="i">
                      <div class="radio">
                        <label for="guest-4">
                          <input type="radio" name="guest" id="guest-4" value="guest-4" />
                          <span>
                            <b>${lang("label_cart_guest-4")}</b>
                            <br />Rp${toCurrency(db.price["price_guest-4"])} (${lang("label_cart_free_guest_book")}) </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="f">
              <div class="i">
                <div class="tx">${lang("label_cart_payment_method")}</div>
                <div class="payments"></div>
              </div>
            </div>
            <div class="f">
              <div class="s">
                <div class="btn btn-cancel">${lang("cancel")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

    this.etotal = futor(".total-price", this.el, "div")
  }

  private writePayments(): void {
    const epayments = futor(".payments", this.el)

    for (const fee of db.fee) {
      const payment = new PaymentSummary(this, fee)

      this.payments.push(payment)

      epayments.append(payment.html)
    }
  }

  get html(): HTMLDivElement {
    return this.el
  }

  getOrderData(): IOrderData {
    const inpName = futor("#order-name", this.el, "input")

    const orderData: IOrderData = {
      orderName: inpName.value,
      orderProduct: this.product.id,
      orderPackage: this.packageId,
      orderGuest: this.guestId,
      orderBook: this.bookId
    }

    return orderData
  }

  async scrollToOrderName(): Promise<void> {
    const inpName = futor("#order-name", this.el, "input")
    inpName.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })

    await waittime(1000)

    inpName.focus()
  }

  updatePrice(): void {
    const pricing: IBundlePrice[] = []

    pricing.push(
      {
        bundle: lang("label_cart_theme"),
        name: this.product.name,
        price: this.product.price
      },
      {
        bundle: lang("label_cart_package"),
        name: lang(`label_cart_${this.packageId}`),
        price: db.price[`price_${this.packageId}`]
      }
    )

    if (this.bookId) {
      pricing.push({
        bundle: lang("label_cart_addon"),
        name: lang(`label_cart_${this.bookId}`),
        price: db.price[`price_${this.bookId}`]
      })
    }

    pricing.push({
      bundle: lang("label_cart_guests"),
      name: lang(`label_cart_${this.guestId}`),
      price: db.price[`price_${this.guestId}`]
    })

    this.countSubTotal(pricing)
  }

  private countSubTotal(pricing: IBundlePrice[]): void {
    const subTotal = pricing.map((k) => k.price).reduce((a, b) => a + b, 0)

    pricing.push({
      bundle: lang("label_cart_sub_total"),
      price: subTotal
    })

    const textPrice = `Rp${toCurrency(subTotal)}`

    this.etotal.innerText = textPrice

    for (const payment of this.payments) {
      payment.updatePrice(pricing, subTotal)
    }
  }

  private packageListener(): void {
    const radios = this.el.querySelectorAll('input[name="month"]') as NodeListOf<HTMLInputElement>

    radios.forEach((inp) => {
      inp.onchange = () => {
        this.packageId = inp.value
        this.updatePrice()
      }
    })
  }

  private guestListener(): void {
    const radios = this.el.querySelectorAll('input[name="guest"]') as NodeListOf<HTMLInputElement>

    radios.forEach((inp) => {
      inp.onchange = () => {
        this.guestId = inp.value
        this.setBookAddon()
        this.updatePrice()
      }
    })
  }

  private setBookAddon(): void {
    const cleanType = this.guestId.replace("guest-", "")
    const typeNum = Number(cleanType)

    const inpField = futor(".addon-book", this.el)

    if (typeNum <= 1) {
      inpField.classList.remove("hide")
      return
    }

    inpField.classList.add("hide")

    const bookAddon = futor('input[name="book"]', this.el, "input")
    if (bookAddon.checked) {
      bookAddon.checked = false
      this.bookId = undefined
    }
  }

  private addonListener(): void {
    const bookAddon = futor('input[name="book"]', this.el, "input")
    bookAddon.onchange = () => {
      this.bookId = bookAddon.checked ? bookAddon.value : undefined
      this.setBookAddon()
      this.updatePrice()
    }
  }

  private goHistoryBack(): void {
    if (this.locked) return
    if (this.manager.busy) return

    history.back()
  }

  private btnBackListener(): void {
    const btnBack = futor(".btn-back", this.el)
    const rippleBack = SetRipple(btnBack, {
      run: async () => {
        await waittime(120)
        this.goHistoryBack()
      }
    })

    const btnCancel = futor(".btn-cancel", this.el)
    const rippleCancel = SetRipple(btnCancel, {
      color: Colors.yellow,
      run: async () => {
        await waittime(200)
        this.goHistoryBack()
      }
    })

    this._rippleCaches.push(rippleBack, rippleCancel)

    const box = futor(".AppMain-Box", this.el)

    this.el.onclick = (e) => {
      const target = e.target

      const isElement = target instanceof Node
      if (!isElement) return
      if (box.contains(target)) return

      this.goHistoryBack()
    }
  }

  lock(status: boolean = true): void {
    this.locked = status
  }

  async destroy(): Promise<void> {
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    this.el.classList.add("out")
    this.el.onclick = null

    this.payments.forEach((payment) => payment.destroy())

    await waittime()

    this.el.remove()

    this.explore.setCart()
  }
}
