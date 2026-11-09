import type { IPrimary, IPrimaryConfig } from "@/Pages/App/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { futor, kel } from "@/core/kel"
import { formAbort, formAlert, formConfirm, formLoading } from "@/lib/modal"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import db from "../data/db"
import { changeLang, getLanguage, lang, LangName } from "@/core/languages"
import { type IRippleReturn, SetRipple } from "@/lib/Ripple"
import { Colors } from "@/core/Colors"
import { copyToClipboard } from "@/core/navigators"
import { doTell } from "@/lib/tell"
import xhr from "@/lib/xhr"

export class Account implements IPrimary {
  private el!: HTMLDivElement

  locked: boolean = false

  private isDestroyed: boolean = false

  private anim?: string

  private king: StackPrimary
  manager: StateManager

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: IPrimaryConfig) {
    this.king = config?.king
    this.manager = config.manager
    this.anim = config?.anim

    this.createElement()
    this.writeData()
    this.changeLangListener()
    this.copyIdListener()
    this.copyLunaListener()
    this.editNameListener()
    this.logoutListener()
  }

  // bikin element utama
  private createElement(): void {
    this.el = kel("div", "AppMain Account")

    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    // one line biar ga menuhin editor wkwk
    // format aja atau pake beautifier biar rapi
    this.el.innerHTML = `
    <div class="Header">
      <div class="HeaderMain">
        <div class="Title">
          <h1><i class="fajdr fa-user"></i> ${lang("tab_me")}</h1>
        </div>
      </div>
    </div>

    <div class="FlatList">
      <div class="iform inlined relative no-bg">
        <div class="box">

          <div class="f">
            <div class="i">
              <div class="cus-img">
                <img src="/assets/icons/ingetya-text.svg" alt="Luna" width="200" />
              </div>
            </div>
          </div>

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
            <div class="i">
              <label for="account-id" class="label-account-id">User ID</label>
              <div class="inp inp-id">
                <div class="inp-ic">
                  <input type="text" name="account-id" id="account-id" readonly />
                  <div class="btn btn-copy-id"><i class="fas fa-copy"></i></div>
                </div>
              </div>
            </div>
            <div class="i">
              <label for="account-luna" class="label-account-luna">Luna ID</label>
              <div class="inp inp-luna">
                <div class="inp-ic">
                  <input type="text" name="account-luna" id="account-luna" readonly />
                  <div class="btn btn-copy-luna"><i class="fas fa-copy"></i></div>
                </div>
              </div>
            </div>
          </div>

          <div class="f">
            <div class="i">
              <label for="account-name" class="label-account-name">Display Name</label>
              <div class="inp inp-name">
                <div class="inp-ic">
                  <input type="text" name="account-name" id="account-name" readonly />
                  <div class="btn btn-name"><i class="fajdr fa-pencil"></i></div>
                </div>
              </div>
            </div>
          </div>

          <div class="f">
            <div class="s">
              <div class="btn btn-delete-object btn-logout">LOGOUT</div>
            </div>
            <div class="s">
              <a href="https://devanka.id/luna/me" target="_blank" class="btn btn-prim"><i class="fajdr fa-arrow-up-right-from-square"></i> LUNA</a>
            </div>
          </div>

        </div>
      </div>
    </div>`
  }

  private writeData(): void {
    this.updateUser()
    this.updateString()
  }

  updateUser(): void {
    const inpLang = futor("#account-lang", this.el, "input")
    inpLang.value = LangName[getLanguage()]

    const inpId = futor("#account-id", this.el, "input")
    inpId.value = db.me.id

    const inpLuna = futor("#account-luna", this.el, "input")
    inpLuna.value = db.me.luna

    const inpName = futor("#account-name", this.el, "input")
    inpName.value = db.me.name
  }

  updateString(): void {
    const title = futor(".Title", this.el)
    title.innerHTML = `<h1><i class="fajdr fa-user"></i> ${lang("tab_me")}</h1>`

    const labelId = futor(".label-account-id", this.el)
    labelId.innerHTML = lang("label_me_id")

    const labelLuna = futor(".label-account-luna", this.el)
    labelLuna.innerHTML = lang("label_me_luna")

    const labelName = futor(".label-account-name", this.el)
    labelName.innerHTML = lang("label_me_name")

    const btnLogout = futor(".btn-logout", this.el)
    btnLogout.innerHTML = `<i class="fadr fa-right-from-bracket"></i> ${lang("btn_me_logout")}`

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
        this.updateUser()
        this.updateString()
      }
    })

    this._rippleCaches.push(ripple)
  }
  private copyIdListener(): void {
    const inp = futor(".inp-id", this.el)
    const ripple = SetRipple(inp, {
      color: Colors.primary,
      run: async () => {
        if (this.locked) return
        if (this.manager.busy) return
        this.locked = true
        const copied = await copyToClipboard(db.me.id)
        if (copied) doTell(db.me.id, "jelly-duo regular clipboard")
        this.locked = false
      }
    })

    this._rippleCaches.push(ripple)
  }
  private copyLunaListener(): void {
    const inp = futor(".inp-luna", this.el)
    const ripple = SetRipple(inp, {
      color: Colors.primary,
      run: async () => {
        if (this.locked) return
        if (this.manager.busy) return
        this.locked = true

        const copied = await copyToClipboard(db.me.luna)
        if (copied) doTell(db.me.luna, "jelly-duo regular clipboard")

        this.locked = false
      }
    })

    this._rippleCaches.push(ripple)
  }
  private editNameListener(): void {
    const inp = futor(".inp-name", this.el)
    const ripple = SetRipple(inp, {
      color: Colors.primary,
      run: async () => {
        if (this.locked) return
        if (this.manager.busy) return
        this.locked = true

        await formAlert("Under Development LOL XD")

        this.locked = false
      }
    })

    this._rippleCaches.push(ripple)
  }

  private logoutListener(): void {
    const btnLogout = futor(".btn-logout", this.el)

    const ripple = SetRipple(btnLogout, {
      color: Colors.sred,
      run: async () => {
        if (this.locked) return
        if (this.manager.busy) return

        this.locked = true

        const confLogout = await formConfirm({
          header: lang("btn_me_logout"),
          msg: lang("confirm_logout_text"),
          xok: lang("confirm_logout_btn")
        })

        if (!confLogout) {
          this.locked = false
          return
        }

        const redirectUrl = encodeURIComponent("/")

        const signOut = await formLoading(xhr.get("/x/auth/logout?redirect=" + redirectUrl))

        if (!signOut.ok) {
          await formAlert(lang(signOut.code || "error"))
          this.locked = false
          return
        }

        this.locked = false

        window.location.replace("/")
      }
    })

    this._rippleCaches.push(ripple)
  }

  private async runHistoryQueue(hierarchy: IStackHierarchy): Promise<void> {
    // hapus dulu kalo ada modal
    formAbort()
  }

  async handleHistory(hierarchy: IStackHierarchy): Promise<void> {
    await this.runHistoryQueue(hierarchy)
  }

  lock(status: boolean = true): void {
    this.locked = status
  }
  get html(): HTMLDivElement {
    return this.el
  }

  async destroy(anim?: string): Promise<void> {
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    if (anim) {
      this.el.classList.add(anim)
      await waittime()
    }

    this.isDestroyed = true

    // this.list.forEach((card) => card.destroy())
    // this.list.splice(0, this.list.length)

    this.el.remove()
  }
}
