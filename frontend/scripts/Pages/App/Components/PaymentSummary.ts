import { kel } from "@/core/kel"
import { getLanguage, lang } from "@/core/languages"
import paymentDetail from "@/data/PaymentDetail.json"
import { toCurrency, toObject } from "@/lib/gen"
import type { ILanguage } from "@/types/LibTypes"
import type { FeeType, IBankFee, IBundlePrice, IPayment, IPaymentGuide } from "@/types/PaymentTypes"
import { Cart } from "./Explore/Cart"
import { formAlert } from "@/lib/modal"

// reusable bikin elemen guides
function createGuides(guides: IPaymentGuide): HTMLDivElement {
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

// hitung biaya layanan (flat & percent)
function getFeeCharge(price: number, fee: number, type: FeeType): number {
  // kalo flat, langsung kasih nominal utuh
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

  // rate persen >> n / 100
  const rate = fee / 100

  // rate ditambah kekurangan provider >> n / (1 - rate)
  const finalRate = price / (1 - rate)

  // buletin ke atas
  const finalPrice = Math.ceil(finalRate)

  // hasil full fee dikurangin harga bersih
  return finalPrice - price
}

// reusable bikin item summary
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

  constructor(
    private cart: Cart,
    private fee: IBankFee
  ) {
    this.currLang = getLanguage()

    // fetch local dari paymentDetail
    const paymentData = paymentDetail.find((payment) => payment.id === this.fee.id)
    if (!paymentData) throw new Error("Payment Data is invalid")

    this.payment = paymentData

    this.createElement()
    this.updateName()
    this.updateGuides()
    this.paymentNameClickListener()
    this.btnBuyListener()
  }

  // bikin element utama
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

  // icon + nama metode pembayaran pake bahasa lokal
  private updateName(): void {
    this.ename.innerHTML = `<span class="arrow-openclose"><i class="fas fa-chevron-right"></i></span><img src="/assets/payments/${this.payment.id}-icon.svg" alt="${this.payment.name[this.currLang]} Logo" height="24" /><span class="title-text">${this.payment.name[this.currLang]}</span>`
  }

  private updateGuides(): void {
    // guide pake bahasa lokal
    const guides = this.payment.guides[this.currLang]

    // render semua guide pake loop
    for (const guide of guides) {
      // bikin element guide-nya
      const eguide = createGuides(guide)

      // render element
      this.edetail.append(eguide)
    }
  }

  private paymentNameClickListener(): void {
    this.ename.onclick = () => {
      // next status pasti kebalikan kondisi saat ini
      const nextStatus = !this._isActive

      this.activate(nextStatus)
    }
  }

  // update detail harga
  updatePrice(pricing: IBundlePrice[], subTotal: number): void {
    const feeAmount = this.fee.fee.charge
    const feeType = this.fee.fee.type

    const feeName = this.fee.fee.type === "flat" ? `Rp${toCurrency(feeAmount)}` : `${feeAmount}%`

    // hitung fee-nya
    const feeCharge = getFeeCharge(subTotal, feeAmount, feeType)

    // buat object serupa baru biar ga ngeoverwrite variable lama
    const newPricing = toObject(pricing) as IBundlePrice[]

    // sisipkan fee
    newPricing.push({
      bundle: lang("label_cart_fee"),
      price: feeCharge,
      name: feeName
    })

    // total plus fee
    const amountTotal = subTotal + feeCharge

    // sisipkan total
    newPricing.push({
      bundle: lang("label_cart_total"),
      price: amountTotal
    })

    // jalanin render
    this.writePriceData(newPricing)
  }

  // render detail harga
  private writePriceData(bundleData: IBundlePrice[]): void {
    // hapus semua element lama
    while (this.efee.firstChild) {
      this.efee.firstChild.remove()
    }

    // loop semua data array harga
    for (const data of bundleData) {
      // bikin element
      const item = createSummary(data)

      // render element
      this.efee.append(item)
    }
  }
  private btnBuyListener(): void {
    this.btnBuy.onclick = async () => {
      // kalo history-nya lagi frustasi, stop dulu
      if (this.cart.locked) return
      if (this.cart.manager.busy) return

      // lock cart biar dapet kondisi true
      this.cart.lock()

      // hehe sabar ges
      await formAlert("Under Development LOL XD")

      // unlock cart
      this.cart.lock(false)
    }
  }

  activate(status: boolean = true): void {
    // tampilkan detail
    this.el.classList[status ? "add" : "remove"]("show")
    this._isActive = status
  }

  get id(): string {
    return this.payment.id
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
