import type { IPrimary, IPrimaryConfig } from "@/Pages/Staff/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { lang } from "@/core/languages"
import { type IRippleReturn } from "@/lib/Ripple"

export class Overview implements IPrimary {
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
    this.el = kel("div", "StaffPage StaffOverview")
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `
    <div class="Header">
      <div class="HeaderMain">
        <div class="Title">
          <h1><i class="fadr fa-icons"></i> ${lang("tab_overview")}</h1>
        </div>
      </div>
    </div>

    <div class="FlatList">
      <div class="staff-hero-banner">
        <h2>IngetYa Staff Panel</h2>
        <p>Welcome, @dvnkz!</p>
      </div>

      <div class="section-title">
        <h3><i class="fadr fa-chart-simple"></i> Ringkasan</h3>
      </div>
      <div class="item-grid">


        <div class="item-card">
          <div class="item-head">
            <span class="item-title">Income Bulan Ini</span>
            <div class="item-icon">
              <i class="fadr fa-wallet"></i>
            </div>
          </div>
          <div class="item-value">Rp48.250.000</div>
          <div class="item-footer">
            <div class="item-open">See Detail <i class="fas fa-arrow-right"></i></div>
          </div>
        </div>

        <div class="item-card">
          <div class="item-head">
            <span class="item-title">Produk Aktif</span>
            <div class="item-icon">
              <i class="fajdr fa-map"></i>
            </div>
          </div>
          <div class="item-value">140 Produk</div>
          <div class="item-footer">
            <div class="item-open">See Detail <i class="fas fa-arrow-right"></i></div>
          </div>
        </div>

        <div class="item-card">
          <div class="item-head">
            <span class="item-title">Order Dalam Proses</span>
            <div class="item-icon">
              <i class="fadr fa-bag-shopping"></i>
            </div>
          </div>
          <div class="item-value">2 Orderan</div>
          <div class="item-footer">
            <div class="item-open">See Detail <i class="fas fa-arrow-right"></i></div>
          </div>
        </div>

        <div class="item-card">
          <div class="item-head">
            <span class="item-title">Tagihan Belum Lunas</span>
            <div class="item-icon">
              <i class="fajdr fa-credit-card"></i>
            </div>
          </div>
          <div class="item-value">1 Tagihan</div>
          <div class="item-footer">
            <div class="item-open">See Detail <i class="fas fa-arrow-right"></i></div>
          </div>
        </div>

        <div class="item-card">
          <div class="item-head">
            <span class="item-title">Live Chat Menunggu</span>
            <div class="item-icon">
              <i class="fajdr fa-comments"></i>
            </div>
          </div>
          <div class="item-value">3 Chat</div>
          <div class="item-footer">
            <div class="item-open">See Detail <i class="fas fa-arrow-right"></i></div>
          </div>
        </div>

        <div class="item-card">
          <div class="item-head">
            <span class="item-title">User Terdaftar</span>
            <div class="item-icon">
              <i class="fajdr fa-users"></i>
            </div>
          </div>
          <div class="item-value">3.200 User</div>
          <div class="item-footer">
            <div class="item-open">See Detail <i class="fas fa-arrow-right"></i></div>
          </div>
        </div>
      </div>
    </div>`
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
