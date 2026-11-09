import type { IPrimary, IPrimaryConfig } from "@/Pages/Staff/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { lang } from "@/core/languages"
import { type IRippleReturn } from "@/lib/Ripple"

export class Orders implements IPrimary {
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
    this.el = kel("div", "AppMain StaffPage StaffOrders")
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `
    <div class="Header">
      <div class="HeaderMain">
        <div class="Title">
          <h1><i class="fadr fa-bag-shopping"></i> ${lang("tab_orders")}</h1>
        </div>
      </div>
      <div class="Search">
        <div class="inp">
          <div class="icon"><i class="fajdr fa-magnifying-glass"></i></div>
          <input type="text" class="input-search-orders" placeholder="Cari ID pesanan, nama klien, atau judul..." />
          <div class="btn btn-search-orders">${lang("search")}</div>
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


      <div class="orders-grid">

        <div class="order-card-staff">
          <div class="order-card-header">
            <span class="order-id">#882XA</span>
            <span class="status-badge unpaid">Belum Bayar</span>
          </div>
          <div class="order-card-body">
            <h3 class="order-title">The Wedding of Stephanie</h3>
            <div class="order-meta-list">
              <div class="item">
                <div class="item-label">User</div>
                <div class="item-name">ID 761761 (@stephanieeeflooo)</div>
              </div>
              <div class="item">
                <div class="item-label">Theme</div>
                <div class="item-name">Olive</div>
              </div>
              <div class="item">
                <div class="item-label">Package</div>
                <div class="item-name">1 Month</div>
              </div>
              <div class="item">
                <div class="item-label">Guests</div>
                <div class="item-name">128 Guests</div>
              </div>
              <div class="item">
                <div class="item-label">Add-ons</div>
                <div class="item-name">Guest Book</div>
              </div>
              <div class="item">
                <div class="item-label">Created At</div>
                <div class="item-name">11 Nov 2026</div>
              </div>
            </div>
          </div>
          <div class="order-card-footer">
            <div class="price-box">
              <span class="price-val">Rp420.000</span>
            </div>
            <div class="card-action-btns">
              <div class="btn btn-detail">Detail <i class="fas fa-arrow-right"></i></div>
            </div>
          </div>
        </div>

        <div class="order-card-staff">
          <div class="order-card-header">
            <span class="order-id">#882XB</span>
            <span class="status-badge draft">Draft</span>
          </div>
          <div class="order-card-body">
            <h3 class="order-title">Nikahan Dalia & Aji</h3>
            <div class="order-meta-list">
              <div class="item">
                <div class="item-label">User</div>
                <div class="item-name">ID 761761 (@stephanieeeflooo)</div>
              </div>
              <div class="item">
                <div class="item-label">Theme</div>
                <div class="item-name">Olive</div>
              </div>
              <div class="item">
                <div class="item-label">Package</div>
                <div class="item-name">1 Month</div>
              </div>
              <div class="item">
                <div class="item-label">Guests</div>
                <div class="item-name">128 Guests</div>
              </div>
              <div class="item">
                <div class="item-label">Add-ons</div>
                <div class="item-name">Guest Book</div>
              </div>
              <div class="item">
                <div class="item-label">Created At</div>
                <div class="item-name">11 Nov 2026</div>
              </div>
            </div>
          </div>
          <div class="order-card-footer">
            <div class="price-box">
              <span class="price-val">Rp420.000</span>
            </div>
            <div class="card-action-btns">
              <div class="btn btn-detail">Detail <i class="fas fa-arrow-right"></i></div>
            </div>
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
