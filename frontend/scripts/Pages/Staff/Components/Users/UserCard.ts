import { futor, kel } from "@/core/kel"
import { Users } from "../../Tabs/Users"
import type { IUserStaff } from "../../types/EmbededAPITypes"
import { toText } from "@/lib/gen"
import { SetRipple, type IRippleReturn } from "@/lib/Ripple"
import sdate from "@/lib/sdate"
import { lang } from "@/core/languages"
import { StateManager } from "../../core/StateManager"
import { Colors } from "@/core/Colors"
import { formAlert } from "@/lib/modal"

function getUserIcon(access?: string[]): [string, string] {
  if (!access || access.length < 1) return ["fajdr fa-user", lang("user_type_user")]

  if (access.some((k) => k === "staff")) return ["fadr fa-headset", lang("user_type_staff")]

  if (access.some((k) => k === "reseller")) return ["fajdr fa-shop", lang("user_type_reseller")]

  return ["fajdr fa-user", lang("user_type_user")]
}

export interface IUserCardConfig {
  users: Users
  item: IUserStaff
  manager: StateManager
}

export class UserCard {
  private users: Users
  private item: IUserStaff
  private manager: StateManager

  private el!: HTMLDivElement

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: IUserCardConfig) {
    this.users = config.users
    this.item = config.item
    this.manager = config.manager

    this.createElement()
    this.btnManageListener()
  }

  get id(): string {
    return this.item.id
  }

  private createElement(): void {
    const userString = getUserIcon(this.item.access)

    this.el = kel("div", "user-card-staff")
    this.el.innerHTML = `
    <div class="user-card-head">
      <div class="avatar-circle"><i class="${userString[0]}"></i></div>
      <div class="user-core">
        <p class="user-name">${toText(this.item.name)}</p>
        <p class="user-id">ID ${this.item.id}</p>
      </div>
      <span class="badge-user-status">${userString[1]}</span>
    </div>
    <div class="user-card-body">
      <div class="meta-line"><i class="fajdr fa-envelope fa-fw"></i> <span>${this.item.email}</span></div>
      <div class="meta-line"><i class="fajdr fa-phone fa-fw"></i> <span>-</span></div>
      <div class="meta-line"><i class="fajdr fa-calendar fa-fw"></i> <span>${lang("user_joined_text")}: ${sdate.dateOrTime(this.item.createdAt)}</span></div>
      <div class="meta-line"><i class="fadr fa-bag-shopping fa-fw"></i> <span>${lang("user_order_total")}: <b>${this.item.orderSize}</b></span></div>
    </div>
    <div class="user-card-footer">
      <button class="btn btn-sm btn-manage">
        <i class="fajdr fa-gear"></i> ${lang("user_manage")}
      </button>
    </div>`
  }

  private btnManageListener(): void {
    const btnManage = futor(".btn-manage", this.el)
    this._rippleCaches.push(
      SetRipple(btnManage, {
        color: Colors.white,
        run: async () => {
          if (this.manager.busy) return

          await formAlert("Under Development LOL XD")
        }
      })
    )
  }

  get html(): HTMLDivElement {
    return this.el
  }

  destroy(): void {
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    this.el.remove()
  }
}

export class NoDataUserCard {
  private users: Users

  private el!: HTMLDivElement

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: Partial<IUserCardConfig>) {
    this.users = config.users!

    this.createElement()
  }

  get id(): string {
    return "nodata"
  }

  private createElement(): void {
    this.el = kel("div", "user-card-staff")
    this.el.innerHTML = `
    <div class="user-card-head">
      <div class="user-core">
        <p class="user-name">${lang("user_no_data")}</p>
      </div>
    </div>`
  }

  get html(): HTMLDivElement {
    return this.el
  }

  destroy(): void {
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    this.el.remove()
  }
}
