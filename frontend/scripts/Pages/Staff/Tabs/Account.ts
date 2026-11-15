import type { IPrimary, IPrimaryConfig } from "@/Pages/Staff/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { futor, kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { changeLang, lang } from "@/core/languages"
import { SetRipple, type IRippleReturn } from "@/lib/Ripple"
import { Colors } from "@/core/Colors"

export class Account implements IPrimary {
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
    this.changeLangListener()
  }

  private createElement(): void {
    this.el = kel("div", "AppMain StaffPage StaffAccount")
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `
    <div class="Header">
      <div class="HeaderMain">
        <div class="Title">
          <h1><i class="fajdr fa-user"></i> ${lang("tab_me")}</h1>
        </div>
      </div>
    </div>

    <div class="FlatList">
      <div class="staff-profile-card">
        <div class="profile-avatar-wrap">
          <div class="profile-avatar"><i class="fas fa-user-tie"></i></div>
          <span class="badge-staff-role">Staff #123XX</span>
        </div>
        <div class="profile-info">
          <p class="profile-name">dvnkz</p>
          <p class="profile-roles">
            <span>IngetYa Staff</span>
            <span>Balance</span>
            <span>Live Chats</span>
            <span>Products</span>
            <span>Orders</span>
            <span>Bills</span>
            <span>Users</span>
          </p>
        </div>
      </div>

      <div class="iform inlined relative no-bg no-pad">
        <div class="box">
          <div class="f">
            <div class="i">
              <label for="account-lang">Bahasa/Language</label>
              <div class="inp inp-lang">
                <div class="inp-ic">
                  <span><i class="fajdr fa-language"></i></span>
                  <input type="text" name="account-lang" id="account-lang" readonly />
                  <div class="btn btn-switch">Switch <i class="far fa-chevron-down"></i></div>
                </div>
              </div>
            </div>
          </div>


          <div class="f">
            <div class="s">
              <div class="btn btn-delete-object btn-logout-staff">
                <i class="fas fa-right-from-bracket"></i> Keluar dari Staff Panel
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`
  }

  updateString(): void {
    const title = futor(".Title", this.el)
    title.innerHTML = `<h1><i class="fajdr fa-user"></i> ${lang("tab_me")}</h1>`

    this.king.tabs.updateString()
  }

  private changeLangListener(): void {
    const inp = futor(".inp-lang", this.el)

    const ripple = SetRipple(inp, {
      color: Colors.primary,
      run: async () => {
        if (this.locked) return
        if (this.manager.busy) return
        this.locked = true

        // bikin form ganti locale
        const changedLang = await changeLang()
        this.locked = false

        if (!changedLang) return

        // ulangi rendernya
        this.updateString()
      }
    })

    this._rippleCaches.push(ripple)
  }

  async handleHistory(_hierarchy: IStackHierarchy): Promise<void> {}

  async destroy(anim?: string): Promise<void> {
    this._rippleCaches.forEach((r) => r.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

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
