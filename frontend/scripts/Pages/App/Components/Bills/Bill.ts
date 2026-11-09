import qrcode from "qrcode"
import paymentDetail from "@/data/PaymentDetail.json"
import type { IBill } from "@/types/ServiceTypes"
import { StateManager } from "../../core/StateManager"
import { Bills } from "../../Tabs/Bills"
import { Orders } from "../../Tabs/Orders"
import { SetRipple, type IRippleReturn } from "@/lib/Ripple"
import type { IPrimary } from "@/Pages/App/types/StackTypes"
import { futor, kel } from "@/core/kel"
import { Colors } from "@/core/Colors"
import waittime from "@/lib/waittime"
import { getLanguage, lang } from "@/core/languages"
import { chunkString, toCurrency } from "@/lib/gen"
import sdate from "@/lib/sdate"
import type { IPayment } from "@/types/PaymentTypes"
import db from "../../data/db"
import type { ILanguage } from "@/types/LibTypes"
import { createGuides } from "../PaymentSummary"
import { doTell } from "@/lib/tell"
import { copyToClipboard } from "@/core/navigators"

export interface BillConfig {
  manager: StateManager

  parent: Bills | Orders

  bill: IBill
}

export class Bill {
  private el!: HTMLDivElement

  locked: boolean = false

  manager: StateManager

  private parent: Bills | Orders

  private bill: IBill

  private payment: IPayment

  private _rippleCaches: IRippleReturn[] = []

  private curLang: ILanguage

  constructor(config: BillConfig) {
    this.manager = config.manager
    this.bill = config.bill
    this.parent = config.parent

    this.curLang = getLanguage()

    const paymentId = db.orders.getPaymentId(config.bill.orderId)

    const payment = paymentDetail.find((payment) => payment.id === paymentId)
    if (!payment) throw new Error("Payment Data is invalid")

    this.payment = payment

    this.createElement()
    this.btnBackListener()
    this.writePaymentMeta()
    this.writePaymentGuides()
  }

  get orderId(): string {
    return this.bill.orderId
  }

  // bikin element utama
  private createElement(): void {
    this.el = kel("div", "AppSec Bill")

    this.el.innerHTML = `
    <div class="AppMain-Box">

      <div class="Header">
        <div class="HeaderMain">
          <div class="btn btn-back HistoryBack">
            <i class="far fa-arrow-left fa-fw"></i>
          </div>
          <div class="Title">
            <h1><i class="fadr fa-file-invoice"></i> ${lang("tab_bills")}</h1>
          </div>
        </div>

      </div>

      <div class="FlatList">

        <div class="iform inlined relative no-bg no-pad">

          <div class="box">

            <div class="f">
              <div class="i">
                <div class="due">
                  <div class="due-id">${lang("label_order_id")} #${this.bill.orderId}</div>
                  <div class="due-price">
                    <div class="due-amount">Rp${toCurrency(this.bill.price)}</div>
                  </div>
                  <div class="due-expiry">${lang("bill_expire_at")} ${sdate.parseTime(this.bill.expiresAt)}</div>
                </div>
              </div>
            </div>

            <div class="f">
              <div class="i">
                <div class="bank-meta">
                  <img src="/assets/payments/${this.payment.id}-icon.svg" alt="${this.payment.name[this.curLang]}" height="24" />
                  <span class="bank-name">${this.payment.name[this.curLang]}</span>
                </div>
              </div>
            </div>

            <div class="groups group-pay-meta">
            </div>

            <div class="f">
              <div class="i">
                <div class="payments">
                  <div class="Payment show">
                    <div class="PaymentDetail"></div>
                  </div>

                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>`
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
    const rippleBack = SetRipple(btnBack, {
      run: async () => {
        await waittime(120)
        this.goHistoryBack()
      }
    })
    // btnBack.onclick = () => this.goHistoryBack()

    this._rippleCaches.push(rippleBack)

    const box = futor(".AppMain-Box", this.el)

    this.el.onclick = (e) => {
      const target = e.target

      const isElement = target instanceof Node
      if (!isElement) return
      if (box.contains(target)) return

      this.goHistoryBack()
    }
  }

  private writePaymentMeta(): void {
    const egroup = futor(".group-pay-meta", this.el, "div")

    if (this.payment.id === "qris") this.writeQRISDetail(egroup)
    if (this.bill.bill_key) this.writeBillingDetail(egroup)
    if (this.bill.permata_va_number) this.writePermataDetail(egroup)
    if (this.bill.va_numbers.length > 0) this.writeVADetail(egroup, this.payment.id === "other_va")
  }

  private writePermataDetail(parent: HTMLDivElement): void {
    const field = kel("div", "f")
    field.innerHTML = `
    <div class="i">
      <label for="bank-account-permata">${lang("bill_label_va_number")}</label>
      <div class="inp">
        <div class="inp-ic">
          <span><i class="fajdr fa-credit-card"></i></span>
          <input type="text" name="bank-account-permata" id="bank-account-permata" value="${chunkString(this.bill.permata_va_number, 4)}" class="bank-number" readonly />
          <div class="btn btn-copy"><i class="fas fa-copy"></i></div>
        </div>
      </div>
    </div>`

    const btnCopy = futor(".btn-copy", field)
    btnCopy.onclick = async () => {
      if (this.locked) return
      if (this.manager.busy) return

      const copyTarget = this.bill.permata_va_number
      const copied = await copyToClipboard(copyTarget)
      if (copied) doTell(copyTarget, "jelly-duo regular clipboard")
    }

    parent.append(field)
  }

  private writeVADetail(parent: HTMLDivElement, isOther?: boolean): void {
    const bankId = isOther ? "bri" : this.payment.id

    const vaNumbers = this.bill.va_numbers!.filter((bank) => bank.bank === bankId)

    for (const vaData of vaNumbers) {
      const field = kel("div", "f")
      field.innerHTML = `
      <div class="i">
        <label for="bank-account-${vaData.bank}">${lang("bill_label_va_number")}</label>
        <div class="inp">
          <div class="inp-ic">
            <span><i class="fajdr fa-credit-card"></i></span>
            <input type="text" name="bank-account-${vaData.bank}" id="bank-account-${vaData.bank}" value="${chunkString(vaData.va_number, 4)}" class="bank-number" readonly />
            <div class="btn btn-copy"><i class="fas fa-copy"></i></div>
          </div>
        </div>
      </div>`

      const btnCopy = futor(".btn-copy", field)
      btnCopy.onclick = async () => {
        if (this.locked) return
        if (this.manager.busy) return

        const copyTarget = vaData.va_number
        const copied = await copyToClipboard(copyTarget)
        if (copied) doTell(copyTarget, "jelly-duo regular clipboard")
      }

      parent.append(field)
    }

    if (isOther) this.writeOtherVADetail(parent)
  }

  private writeOtherVADetail(parent: HTMLDivElement): void {
    const field = kel("div", "f")
    field.innerHTML = `
    <div class="i">
      <label for="bank-code">${lang("bill_label_send_to_bank")}</label>
      <div class="inp">
        <div class="inp-ic">
          <span><i class="fadr fa-building-columns"></i></span>
          <input type="text" name="bank-code" id="bank-code" value="BRI (002)" readonly />
        </div>
      </div>
    </div>`

    parent.prepend(field)
  }

  private writeBillingDetail(parent: HTMLDivElement): void {
    const fieldBillKey = kel("div", "f")
    fieldBillKey.innerHTML = `
    <div class="i">
      <label for="bank-account-mandiri">${lang("bill_label_va_number")}</label>
      <div class="inp">
        <div class="inp-ic">
          <span><i class="fajdr fa-credit-card"></i></span>
          <input type="text" name="bank-account-mandiri" id="bank-account-mandiri" value="${chunkString(this.bill.bill_key, 4)}" class="bank-number" readonly />
          <div class="btn btn-copy"><i class="fas fa-copy"></i></div>
        </div>
      </div>
    </div>`

    const btnCopyKey = futor(".btn-copy", fieldBillKey)
    btnCopyKey.onclick = async () => {
      if (this.locked) return
      if (this.manager.busy) return

      const copyTarget = this.bill.bill_key
      const copied = await copyToClipboard(copyTarget)
      if (copied) doTell(copyTarget, "jelly-duo regular clipboard")
    }

    parent.append(fieldBillKey)

    if (!this.bill.biller_code) return

    const fieldBillerCode = kel("div", "f")
    fieldBillerCode.innerHTML = `
    <div class="i">
      <label for="bank-code-mandiri">${lang("bill_label_biller")}</label>
      <div class="inp">
        <div class="inp-ic">
          <span><i class="fajdr fa-credit-card"></i></span>
          <input type="text" name="bank-code-mandiri" id="bank-code-mandiri" value="${this.bill.biller_code}" class="bank-number" readonly />
          <div class="btn btn-copy"><i class="fas fa-copy"></i></div>
        </div>
      </div>
    </div>`

    const btnCopyCode = futor(".btn-copy", fieldBillerCode)
    btnCopyCode.onclick = async () => {
      if (this.locked) return
      if (this.manager.busy) return

      const copyTarget = this.bill.biller_code
      const copied = await copyToClipboard(copyTarget)
      if (copied) doTell(copyTarget, "jelly-duo regular clipboard")
    }

    parent.prepend(fieldBillerCode)
  }
  private async writeQRISDetail(parent: HTMLDivElement): Promise<void> {
    const field = kel("div", "f")

    field.innerHTML = `
    <div class="i">
      <div class="qr-pay">
        <div class="qr-desc">${lang("bill_label_qr_desc")}</div>
        <div class="qr-code">
          <canvas class="qr-canvas" width="200" height="200">${lang("loading")}</canvas>
        </div>
        <div class="btn btn-qr-download"><i class="fadr fa-download"></i> ${lang("bill_label_qr_save")}</div>
      </div>
    </div>`

    const qrCanvas = futor(".qr-canvas", field, "canvas")

    const qrString = this.bill.qr_string || this.bill.actions[0].url

    await qrcode.toCanvas(qrCanvas, qrString, {
      width: 300,
      color: {
        light: Colors.cardBg,
        dark: Colors.primary
      }
    })

    qrCanvas.innerHTML = ""

    const btnSave = futor(".btn-qr-download", field)
    btnSave.onclick = () => {
      const a = kel("a")

      const dataURL = qrCanvas.toDataURL()

      a.href = dataURL
      a.download = `IngetYa_QRIS_${this.orderId}`

      a.click()
    }

    parent.append(field)
  }

  private writePaymentGuides(): void {
    const epayment = futor(".PaymentDetail", this.el)

    const guides = this.payment.guides[this.curLang]

    guides.forEach((guide) => {
      const ehelp = createGuides(guide)
      epayment.append(ehelp)
    })
  }

  lock(status: boolean = true): void {
    this.locked = status
  }

  get html(): HTMLDivElement {
    return this.el
  }

  async destroy(): Promise<void> {
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    this.el.classList.add("out")
    this.el.onclick = null

    await waittime()

    this.el.remove()

    this.parent.setBill()
  }
}
