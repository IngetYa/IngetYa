import { kel } from "@/core/kel"
import { getLanguage, lang } from "@/core/languages"
import paymentDetail from "@/data/PaymentDetail.json"
import { toCurrency, toObject } from "@/lib/gen"
import type { ILanguage } from "@/types/LibTypes"
import type { FeeType, IBankFee, IBundlePrice, IPayment, IPaymentGuide } from "@/types/PaymentTypes"
import { Cart } from "./Explore/Cart"
import { formAlert, formLoading } from "@/lib/modal"
import { type IRippleReturn, SetRipple } from "@/lib/Ripple"
import { Colors } from "@/core/Colors"
import waittime from "@/lib/waittime"
import xhr from "@/lib/xhr"

export function createGuides(guides: IPaymentGuide): HTMLDivElement {
  const el = kel("div", "PaymentHelp")

  const ename = kel("div", "step-name")
  const eguide = kel("div", "step-guide")

  el.append(ename, eguide)

  ename.innerText = guides.name

  const ul = kel("ul")
  eguide.append(ul)

  const steps: HTMLLIElement[] = guides.steps.map((step) => {
    const estep = kel("li")
    estep.innerText = step
    return estep
  })

  ul.append(...steps)

  return el
}

function getFeeCharge(price: number, fee: number, type: FeeType): number {
  if (type === "flat") return fee

  /**
   * rumus biar kalo fee percent, kita tetep dapet pembayaran bulatnya
   * [[ TAGIHAN = HARGA / (1 - RATE) ]]
   *
   * HARGA   = 10000
   * RATE    = 2% = 2 / 100 = 0.02
   * TAGIHAN = 10000 / (1 - 0.02)
   *         = 10000 / 0.98
   *         = 10204.0816
   *         = 10205
   */

  const rate = fee / 100

  const finalRate = price / (1 - rate)

  const finalPrice = Math.ceil(finalRate)

  return finalPrice - price
}

function createSummary(pricing: IBundlePrice): HTMLDivElement {
  const el = kel("div", "item")

  const elabel = kel("div", "fee-label")

  const eprice = kel("div", "fee-price")

  el.append(elabel, eprice)

  const itemTitle = kel("span", "item-title")
  itemTitle.innerText = pricing.bundle
  elabel.append(itemTitle)

  if (pricing.name) {
    const itemName = kel("span", "item-name")
    itemName.innerText = pricing.name
    elabel.append(itemName)
  }

  eprice.innerText = pricing.price < 1 ? lang("free") : `Rp${toCurrency(pricing.price)}`

  return el
}

export class PaymentSummary {
  private el!: HTMLDivElement

  private _isActive: boolean = false

  private payment: IPayment

  private ename!: HTMLDivElement
  private edetail!: HTMLDivElement

  private efee!: HTMLDivElement
  private btnBuy!: HTMLDivElement

  private currLang: ILanguage

  private _rippleCaches: IRippleReturn[] = []

  constructor(
    private cart: Cart,
    private fee: IBankFee
  ) {
    this.currLang = getLanguage()

    const paymentData = paymentDetail.find((payment) => payment.id === this.fee.id)
    if (!paymentData) throw new Error("Payment Data is invalid")

    this.payment = paymentData

    this.createElement()
    this.updateName()
    this.updateGuides()
    this.paymentNameClickListener()
    this.btnBuyListener()
  }

  private createElement(): void {
    this.el = kel("div", "Payment")

    this.ename = kel("div", "PaymentName")
    this.edetail = kel("div", "PaymentDetail")
    this.el.append(this.ename, this.edetail)

    this.efee = kel("div", "fee")
    this.btnBuy = kel("div", "btn btn-buy")
    this.btnBuy.innerHTML = `<i class="far fa-chevrons-right"></i> ${lang("label_cart_pay_with")} ${this.payment.name[this.currLang]}`

    this.edetail.append(this.efee, this.btnBuy)
  }

  private updateName(): void {
    this.ename.innerHTML = `<span class="arrow-openclose"><i class="fas fa-chevron-right"></i></span><img src="/assets/payments/${this.payment.id}-icon.svg" alt="${this.payment.name[this.currLang]} Logo" height="24" /><span class="title-text">${this.payment.name[this.currLang]}</span>`
  }

  private updateGuides(): void {
    const guides = this.payment.guides[this.currLang]

    for (const guide of guides) {
      const eguide = createGuides(guide)

      this.edetail.append(eguide)
    }
  }

  private paymentNameClickListener(): void {
    const nameRipple = SetRipple(this.ename, {
      color: Colors.textMuted,
      run: () => {
        const nextStatus = !this._isActive

        this.activate(nextStatus)
      }
    })

    this._rippleCaches.push(nameRipple)
  }

  updatePrice(pricing: IBundlePrice[], subTotal: number): void {
    const feeAmount = this.fee.fee.charge
    const feeType = this.fee.fee.type

    const feeName = this.fee.fee.type === "flat" ? `Rp${toCurrency(feeAmount)}` : `${feeAmount}%`

    const feeCharge = getFeeCharge(subTotal, feeAmount, feeType)

    const newPricing = toObject(pricing) as IBundlePrice[]

    newPricing.push({
      bundle: lang("label_cart_fee"),
      price: feeCharge,
      name: feeName
    })

    const amountTotal = subTotal + feeCharge

    newPricing.push({
      bundle: lang("label_cart_total"),
      price: amountTotal
    })

    this.writePriceData(newPricing)
  }

  private writePriceData(bundleData: IBundlePrice[]): void {
    while (this.efee.firstChild) {
      this.efee.firstChild.remove()
    }

    for (const data of bundleData) {
      const item = createSummary(data)

      this.efee.append(item)
    }
  }

  private async onBuy(): Promise<void> {
    if (this.cart.locked) return
    if (this.cart.manager.busy) return

    this.cart.lock()

    await waittime(140)

    const bundle = this.cart.getOrderData()

    if (!bundle.orderName || bundle.orderName.length > 100) {
      await formAlert(lang("alert_order_name_length"))
      this.cart.lock(false)
      this.cart.scrollToOrderName()
      return
    }

    bundle.paymentId = this.payment.id

    const order = await formLoading(xhr.post("/x/orders/create", bundle), lang("processing"))

    if (!order.ok) {
      await formAlert(lang(order.code || "error"))
      this.cart.lock(false)
      return
    }

    await formAlert("Under Development LOL XD")

    this.cart.lock(false)
  }

  private btnBuyListener(): void {
    const ripple = SetRipple(this.btnBuy, {
      color: Colors.yellow,
      run: () => this.onBuy()
    })

    this._rippleCaches.push(ripple)
  }

  activate(status: boolean = true): void {
    this.el.classList[status ? "add" : "remove"]("show")
    this._isActive = status
  }

  destroy(): void {
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)
  }

  get id(): string {
    return this.payment.id
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
