import type { IPrimary, IPrimaryConfig } from "@/Pages/Staff/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { lang } from "@/core/languages"
import { type IRippleReturn } from "@/lib/Ripple"

export class Bills implements IPrimary {
  private el!: HTMLDivElement
  locked: boolean = false
  private anim?: string
  private king: StackPrimary
  manager: StateManager
  private _rippleCaches: IRippleReturn[] = []

  constructor(config: IPrimaryConfig) {
    this.king = config.king
    this.manager = config.manager
    this.anim = config.anim

    this.createElement()
  }

  private createElement(): void {
    this.el = kel("div", "AppMain StaffPage StaffBills")
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `
      <div class="Header">
        <div class="HeaderMain">
          <div class="Title">
            <h1><i class="fajdr fa-credit-card"></i> ${lang("tab_bills")}</h1>
          </div>
        </div>
        <div class="Search">
          <div class="inp">
            <div class="icon"><i class="fajdr fa-magnifying-glass"></i></div>
            <input type="text" class="input-search-bills" placeholder="Cari ID tagihan, nama pemesan, atau metode bayar..." />
            <div class="btn btn-search-bills">${lang("search")}</div>
          </div>
        </div>
      </div>

      <div class="FlatList">

      
        <div class="page-bar">

          <div class="page-meta">
            <div class="page-group page-month">
              <div class="page-arrow arrow-left"><i class="fajdr fa-arrow-left"></i></div>
              <div class="item">Januari</div>
              <div class="item">Februari</div>
              <div class="item">Maret</div>
              <div class="item">April</div>
              <div class="item">Mei</div>
              <div class="item">Juni</div>
              <div class="item">Juli</div>
              <div class="item">Agustus</div>
              <div class="item">September</div>
              <div class="item">Oktober</div>
              <div class="item active">November</div>
              <div class="item">Desember</div>
              <div class="page-arrow arrow-right"><i class="fajdr fa-arrow-right"></i></div>
            </div>
            <div class="page-group page-year">
              <div class="page-arrow arrow-left"><i class="fajdr fa-arrow-left"></i></div>
              <div class="item">2024</div>
              <div class="item">2025</div>
              <div class="item active">2026</div>
              <div class="page-arrow arrow-right"><i class="fajdr fa-arrow-right"></i></div>
            </div>
          </div>

        </div>


        <div class="table-container">
          <table class="table">
            <thead class="thead">
              <tr>
                <th>Bill ID</th>
                <th>User</th>
                <th>Nama Pesanan</th>
                <th>Metode</th>
                <th>Nominal</th>
                <th>Batas Pembayaran</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody class="tbody">
              <tr>
                <td colspan="8" style="text-align: center; padding: 24px;">Tidak ada tagihan yang cocok dengan pencarian.</td>
              </tr>

              <tr>
                <td>#8123XA</td>
                <td>@stephanieflo</td>
                <td>Wedding Stephanie</td>
                <td class="payment-provider"><img src="/assets/payments/qris-icon.svg" alt="QRIS Logo" /></td>
                <td class="bold text-price">Rp420.000</td>
                <td><span class="text-muted">11 Des 2017, 17.30</span></td>
                <td><span class="status settlement">Berhasil</span></td>
              </tr>
              <tr>
                <td>#8123XA</td>
                <td>@stephanieflo</td>
                <td>Wedding Stephanie</td>
                <td class="payment-provider"><img src="/assets/payments/bca-icon.svg" alt="BCA Logo" /></td>
                <td class="bold text-price">Rp420.000</td>
                <td><span class="text-muted">11 Des 2017, 17.30</span></td>
                <td><span class="status pending">Menunggu Pembayaran</span></td>
              </tr>


            </tbody>
          </table>
        </div>
      </div>
    `
  }

  async handleHistory(_hierarchy: IStackHierarchy): Promise<void> {}

  async destroy(anim?: string): Promise<void> {
    this._rippleCaches.forEach((r) => r.stopListener())
    this._rippleCaches.length = 0

    if (anim) {
      this.el.classList.add(anim)
      await waittime()
    }
    this.el.remove()
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
