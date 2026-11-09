import type { IPrimary, IPrimaryConfig } from "@/Pages/Staff/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { lang } from "@/core/languages"
import { type IRippleReturn } from "@/lib/Ripple"

export class Balance implements IPrimary {
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
    this.el = kel("div", "AppMain StaffPage StaffBalance")
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `
    <div class="Header">
      <div class="HeaderMain">
        <div class="Title">
          <h1><i class="fadr fa-wallet"></i> ${lang("tab_balance")}</h1>
        </div>
      </div>
    </div>

    <div class="FlatList">
      <div class="hero-balance-card">
        <div class="hero-main">
          <span class="hero-label">Saldo Org</span>
          <div class="hero-amount">Rp84.350.000</div>
        </div>
        <div class="hero-stats stat-month">
          <div class="stat-box income">
            <span class="stat-label">Income Bulan Ini</span>
            <span class="stat-value">+Rp32.500.000</span>
          </div>
          <div class="stat-box expense">
            <span class="stat-label">Expense Bulan Ini</span>
            <span class="stat-value">-Rp20.000.000</span>
          </div>
        </div>
        <div class="hero-stats stat-lifetime">
          <div class="stat-box income">
            <span class="stat-label">Total Income</span>
            <span class="stat-value">+Rp220.000.000</span>
          </div>
          <div class="stat-box expense">
            <span class="stat-label">Total Expense</span>
            <span class="stat-value">-Rp143.230.000</span>
          </div>
        </div>
        <div class="hero-actions">
          <button class="btn btn-balance-action btn-recap"><i class="fas fa-download"></i> Download Laporan</button>
        </div>
      </div>

      <div class="section-title">
        <h3><i class="fadr fa-chart-simple"></i> Audit</h3>
      </div>

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

      <div class="records-container">


        <div class="record-card">
          <div class="record-content">
            <div class="record-header">
              <div class="record-title">Order XX99YY</div>
              <div class="record-amount income">
                + Rp600.000
              </div>
            </div>
            <div class="record-meta">
              <p class="record-note">Paket 10 Bulan</p>
              <p class="record-date">11 Des 2026, 09:00 AM</p>
            </div>
          </div>
        </div>

        <div class="record-card">
          <div class="record-content">
            <div class="record-header">
              <div class="record-title">Biaya Server</div>
              <div class="record-amount expense">
                - Rp90.000
              </div>
            </div>
            <div class="record-meta">
              <p class="record-note">Tagihan hosting bulanan VPS & MongoDB</p>
              <p class="record-date">11 Des 2026, 08:00 AM</p>
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
