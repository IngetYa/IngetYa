import { futor, kel } from "@/core/kel"
import db from "./data/db"
import xhr from "@/lib/xhr"
import type { IBill, IOrder, IProduct } from "@/types/ServiceTypes"
import waittime from "@/lib/waittime"
import type { IUser } from "@/types/UserTypes"
import type { IPriceDetail } from "@/types/PaymentTypes"
import { lang } from "@/core/languages"
import { createRedirect } from "@/lib/gen"

export class Splash {
  private el!: HTMLDivElement

  private _onCompleted?: () => void

  constructor() {
    this.createElement()
  }

  private createElement(): void {
    this.el = kel("div", "Splash")
    this.el.innerHTML = `<img src="/assets/icons/ingetya-text.svg" alt="IngetYa Logo" /><div class="loader"><i class="fas fa-circle-notch fa-spin"></i> ${lang("initializing")}</div>`
  }

  private renderSignButton(url: string): void {
    const loader = futor(".loader", this.el)

    while (loader.firstChild) {
      loader.firstChild.remove()
    }

    const p = kel("p", "text-signin")
    p.innerHTML = lang("splash_text_login")

    const a = kel("a", "btn-signin")
    a.href = `/portal?redirect=${url}`
    a.innerHTML = lang("splash_btn_login")

    loader.append(p, a)
  }

  async loadData(): Promise<void> {
    const res = await xhr.forceGet("/x/explore/detail")

    if (res.status === 401) {
      await waittime(1000)
      const redirectUrl = createRedirect()
      this.renderSignButton(redirectUrl)
      window.location.replace(`/portal?redirect=${redirectUrl}`)
      return
    }

    const products = res.data.products as IProduct[]
    const orders = res.data.orders as IOrder[]
    const bills = res.data.bills as IBill[]
    const me = res.data.me as IUser
    const price = res.data.price as IPriceDetail
    const fee = res.data.fee

    db.products.add(...products)
    db.orders.add(...orders)
    db.bills.add(...bills)
    Object.assign(db.me, me)
    Object.assign(db.price, price)
    db.fee.splice(0, db.fee.length)
    db.fee.push(...fee)

    await waittime(1000)
    await this.destroy()
    if (this._onCompleted) {
      this._onCompleted()
      this._onCompleted = undefined
    }
  }

  onComplete(newFunc: () => void): void {
    this._onCompleted = newFunc
  }

  private async destroy(): Promise<void> {
    this.el.classList.add("out")
    await waittime()
    this.el.remove()
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
