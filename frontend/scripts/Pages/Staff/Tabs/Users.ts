import type { IPrimary, IPrimaryConfig } from "@/Pages/Staff/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { lang } from "@/core/languages"
import { type IRippleReturn } from "@/lib/Ripple"

export class Users implements IPrimary {
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
    this.el = kel("div", "AppMain StaffPage StaffUsers")
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `
    <div class="Header">
      <div class="HeaderMain">
        <div class="Title">
          <h1><i class="fadr fa-address-book"></i> ${lang("tab_users")}</h1>
        </div>
      </div>
      <div class="Search">
        <div class="inp">
          <div class="icon"><i class="fajdr fa-magnifying-glass"></i></div>
          <input type="text" class="input-search-users" placeholder="Cari nama, email, no HP, atau ID user..." />
          <div class="btn btn-search-users">${lang("search")}</div>
        </div>
      </div>
    </div>

    <div class="FlatList">

      <div class="users-grid">


        <div class="user-card-staff">
          <div class="user-card-head">
            <div class="avatar-circle">SF</div>
            <div class="user-core">
              <p class="user-name">Stephanie Floriska</p>
              <p class="user-id">ID 761761</p>
            </div>
            <span class="badge-user-status online">Online</span>
          </div>
          <div class="user-card-body">
            <div class="meta-line"><i class="fajdr fa-envelope fa-fw"></i> <span>stephaniefloriska@gmail.com</span></div>
            <div class="meta-line"><i class="fajdr fa-phone fa-fw"></i> <span>+62 812 3139 2630</span></div>
            <div class="meta-line"><i class="fajdr fa-calendar fa-fw"></i> <span>Bergabung: 11 Des 2017</span></div>
            <div class="meta-line"><i class="fadr fa-bag-shopping fa-fw"></i> <span>Total Pesanan: <b>69 Orderan</b></span></div>
          </div>
          <div class="user-card-footer">
            <button class="btn btn-sm btn-chat-user">
              <i class="fas fa-comment-dots"></i> Kirim Chat
            </button>
            <button class="btn btn-sm btn-moderation">
              <i class="fas fa-user-secret"></i> Moderasi
            </button>
          </div>
        </div>

        <div class="user-card-staff">
          <div class="user-card-head">
            <div class="avatar-circle">SA</div>
            <div class="user-core">
              <p class="user-name">Santoso Aji</p>
              <p class="user-id">ID 761761</p>
            </div>
            <span class="badge-user-status">Offline</span>
          </div>
          <div class="user-card-body">
            <div class="meta-line"><i class="fajdr fa-envelope fa-fw"></i> <span>santosoaji@outlook.com</span></div>
            <div class="meta-line"><i class="fajdr fa-phone fa-fw"></i> <span>+62 812 3139 2630</span></div>
            <div class="meta-line"><i class="fajdr fa-calendar fa-fw"></i> <span>Bergabung: 11 Des 2017</span></div>
            <div class="meta-line"><i class="fadr fa-bag-shopping fa-fw"></i> <span>Total Pesanan: <b>69 Orderan</b></span></div>
          </div>
          <div class="user-card-footer">
            <button class="btn btn-sm btn-chat-user">
              <i class="fas fa-comment-dots"></i> Kirim Chat
            </button>
            <button class="btn btn-sm btn-moderation">
              <i class="fas fa-user-secret"></i> Moderasi
            </button>
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
