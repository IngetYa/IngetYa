import waittime from "@/lib/waittime"
import { StateManager } from "../../core/StateManager"
import { Explore } from "../../Tabs/Explore"
import { futor, kel } from "@/core/kel"
import { lang } from "@/core/languages"
import { toCurrency, toText } from "@/lib/gen"
import type { IProduct } from "@/types/ServiceTypes"
import db from "../../data/db"
import type { IBundlePrice } from "@/types/PaymentTypes"
import { PaymentSummary } from "../PaymentSummary"

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

  // element utama
  private createElement(): void {
    this.el = kel("div", "AppMain Cart")

    // one line biar ga menuhin editor wkwk
    // format aja atau pake beautifier biar rapi
    this.el.innerHTML = `<div class="cart-box"> <div class="Title"> <div class="header-left"> <div class="btn btn-back"> <i class="far fa-arrow-left fa-fw"></i> </div> <h1><i class="fajdr fa-flower"></i> ${lang("header_cart")}</h1> </div> </div> <div class="FlatList"> <div class="iform inlined relative no-bg no-pad"> <div class="box"> <div class="f total"> <div class="total-meta"> <div class="total-title">${lang("label_cart_sub_total")}</div> <div class="total-price"></div> </div> </div> <div class="f"> <div class="i"> <label for="order-name">${lang("label_cart_order_name")}</label> <div class="inp"> <input type="text" name="order-name" id="order-name" placeholder="${lang("placeholder_cart_order_name")}" maxlength="120" /> </div> </div> </div> <div class="f"> <div class="order-meta"> <div class="order-item-thumbnail"> <img src="${this.product.image}" alt="${this.product.name} Thumbnail" /> </div> <div class="order-item-name">${toText(this.product.name)}</div> <div class="order-item-price">Rp${toCurrency(this.product.price)}</div> </div> </div> <div class="f"> <div class="i"> <p class="tx">${lang("label_cart_package")}</p> <div class="f p"> <div class="i"> <div class="radio"> <label for="month-1"> <input type="radio" name="month" id="month-1" value="month-1" checked /> <span><b>${lang("label_cart_month-1")}</b><br />Rp${toCurrency(db.price["price_month-1"])}</span> </label> </div> </div> <div class="i"> <div class="radio"> <label for="month-2"> <input type="radio" name="month" id="month-2" value="month-2" /> <span><b>${lang("label_cart_month-2")}</b><br />Rp${toCurrency(db.price["price_month-2"])}</span> </label> </div> </div> </div> </div> </div> <div class="group"> <div class="f"> <div class="i"> <div class="tx">${lang("label_cart_guests")}</div> <div class="f p"> <div class="i"> <div class="radio"> <label for="guest-1"> <input type="radio" name="guest" id="guest-1" value="guest-1" checked /> <span><b>${lang("label_cart_guest-1")}</b><br />${lang("free")}</span> </label> </div> <div class="check addon-book"> <label for="book-1"> <input id="book-1" name="book" type="checkbox" value="book-1" /> <span><b>${lang("label_cart_book-1")}</b> Rp${toCurrency(db.price["price_book-1"])}</span> </label> </div> </div> </div> <div class="f p"> <div class="i"> <div class="radio"> <label for="guest-2"> <input type="radio" name="guest" id="guest-2" value="guest-2" /> <span><b>${lang("label_cart_guest-2")}</b><br />Rp${toCurrency(db.price["price_guest-2"])} (${lang("label_cart_free_guest_book")})</span> </label> </div> </div> </div> <div class="f p"> <div class="i"> <div class="radio"> <label for="guest-3"> <input type="radio" name="guest" id="guest-3" value="guest-3" /> <span><b>${lang("label_cart_guest-3")}</b><br />Rp${toCurrency(db.price["price_guest-3"])} (${lang("label_cart_free_guest_book")})</span> </label> </div> </div> </div> <div class="f p"> <div class="i"> <div class="radio"> <label for="guest-4"> <input type="radio" name="guest" id="guest-4" value="guest-4" /> <span><b>${lang("label_cart_guest-4")}</b><br />Rp${toCurrency(db.price["price_guest-4"])} (${lang("label_cart_free_guest_book")})</span> </label> </div> </div> </div> </div> </div> </div> <div class="f"> <div class="i"> <div class="tx">${lang("label_cart_payment_method")}</div> <div class="payments"></div> </div> </div> <div class="f"> <div class="s"> <div class="btn btn-cancel">${lang("cancel")}</div> </div> </div> </div> </div> </div> </div>`

    this.etotal = futor(".total-price", this.el, "div")
  }

  // render semua payment
  private writePayments(): void {
    const epayments = futor(".payments", this.el)

    // loop pake fee, karna pake payment yg memang udah ketemu fee-nya
    for (const fee of db.fee) {
      // bikin constructor
      const payment = new PaymentSummary(this, fee)

      // sisipkan ke array
      this.payments.push(payment)

      // render element
      epayments.append(payment.html)
    }
  }

  get html(): HTMLDivElement {
    return this.el
  }

  // perbarui keseluruhan price
  updatePrice(): void {
    const pricing: IBundlePrice[] = []

    // sisipkan harga tema + masa aktif
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

    // kalo pake addon buku tamu, sisipkan juga
    if (this.bookId) {
      pricing.push({
        bundle: lang("label_cart_addon"),
        name: lang(`label_cart_${this.bookId}`),
        price: db.price[`price_${this.bookId}`]
      })
    }

    // sisipkan harga jumlah tamu
    pricing.push({
      bundle: lang("label_cart_guests"),
      name: lang(`label_cart_${this.guestId}`),
      price: db.price[`price_${this.guestId}`]
    })

    // totalin
    this.countSubTotal(pricing)
  }

  private countSubTotal(pricing: IBundlePrice[]): void {
    // total harga bersih
    const subTotal = pricing.map((k) => k.price).reduce((a, b) => a + b, 0)

    // sisipkan harga bersih
    pricing.push({
      bundle: lang("label_cart_sub_total"),
      price: subTotal
    })

    // buat teks info
    const textPrice = `Rp${toCurrency(subTotal)}`

    // render text info ke subtotal element
    this.etotal.innerText = textPrice

    // kasih tau ke semua payment yg udah dirender
    for (const payment of this.payments) {
      payment.updatePrice(pricing, subTotal)
    }
  }

  // listener setiap input paket
  private packageListener(): void {
    const radios = this.el.querySelectorAll('input[name="month"]') as NodeListOf<HTMLInputElement>

    radios.forEach((inp) => {
      inp.onchange = () => {
        // perbarui id saat ini
        this.packageId = inp.value
        this.updatePrice()
      }
    })
  }

  // listener setiap input tamu
  private guestListener(): void {
    const radios = this.el.querySelectorAll('input[name="guest"]') as NodeListOf<HTMLInputElement>

    radios.forEach((inp) => {
      inp.onchange = () => {
        // perbarui id saat ini
        this.guestId = inp.value
        this.setBookAddon()
        this.updatePrice()
      }
    })
  }

  // tentukan addon gratis
  private setBookAddon(): void {
    // seleksi pilihan tamu
    const cleanType = this.guestId.replace("guest-", "")
    // ambil angka belakang
    const typeNum = Number(cleanType)

    const inpField = futor(".addon-book", this.el)

    // kalo 1 ke bawah, tampilkan input, terus stop
    if (typeNum <= 1) {
      inpField.classList.remove("hide")
      return
    }

    // hide input
    inpField.classList.add("hide")

    // kalo input udah dichecklist, matiin, hapus id saat ini
    const bookAddon = futor('input[name="book"]', this.el, "input")
    if (bookAddon.checked) {
      bookAddon.checked = false
      this.bookId = undefined
    }
  }

  // listener setiap input addon
  private addonListener(): void {
    // listener buku tamu
    const bookAddon = futor('input[name="book"]', this.el, "input")
    bookAddon.onchange = () => {
      // perbarui id saat ini
      this.bookId = bookAddon.checked ? bookAddon.value : undefined
      this.setBookAddon()
      this.updatePrice()
    }
  }

  private goHistoryBack(): void {
    // batalin kalo history lagi frustasi
    if (this.locked) return
    if (this.manager.busy) return

    // mundur 1 state
    history.back()
  }

  // listener tombol kembali
  private btnBackListener(): void {
    const btnBack = futor(".btn-back", this.el)
    btnBack.onclick = () => this.goHistoryBack()

    const btnCancel = futor(".btn-cancel", this.el)
    btnCancel.onclick = () => this.goHistoryBack()

    const box = futor(".cart-box", this.el)

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
    this.el.classList.add("out")
    this.el.onclick = null

    await waittime()

    this.el.remove()

    this.explore.setCart()
  }
}
