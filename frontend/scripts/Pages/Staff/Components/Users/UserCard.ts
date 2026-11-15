import { kel } from "@/core/kel"
import { Users } from "../../Tabs/Users"
import type { IUserStaff } from "../../types/EmbededAPITypes"
import { toText } from "@/lib/gen"
import { type IRippleReturn } from "@/lib/Ripple"
import sdate from "@/lib/sdate"
import { lang } from "@/core/languages"

function getUserIcon(access?: string[]): string {
  if (!access || access.length < 1) return "fajdr fa-user"

  if (access.some((k) => k === "staff")) return "fadr fa-user-secret"

  if (access.some((k) => k === "reseller")) return "fajdr fa-shop"

  return "fajdr fa-user"
}

export interface IUserCardConfig {
  users: Users
  item: IUserStaff
}

export class UserCard {
  private users: Users
  private item: IUserStaff

  private el!: HTMLDivElement

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: IUserCardConfig) {
    this.users = config.users
    this.item = config.item

    this.createElement()
  }

  get id(): string {
    return this.item.id
  }

  private createElement(): void {
    this.el = kel("div", "user-card-staff")
    this.el.innerHTML = `
    <div class="user-card-head">
      <div class="avatar-circle"><i class="${getUserIcon(this.item.access)}"></i></div>
      <div class="user-core">
        <p class="user-name">${toText(this.item.name)}</p>
        <p class="user-id">ID ${this.item.id}</p>
      </div>
      <span class="badge-user-status online"></span>
    </div>
    <div class="user-card-body">
      <div class="meta-line"><i class="fajdr fa-envelope fa-fw"></i> <span>${this.item.email}</span></div>
      <div class="meta-line"><i class="fajdr fa-phone fa-fw"></i> <span>-</span></div>
      <div class="meta-line"><i class="fajdr fa-calendar fa-fw"></i> <span>${lang("user_joined_text")}: ${sdate.dateOrTime(this.item.createdAt)}</span></div>
      <div class="meta-line"><i class="fadr fa-bag-shopping fa-fw"></i> <span>${lang("user_order_total")}: <b>${this.item.orderSize}</b></span></div>
    </div>
    <div class="user-card-footer">
      <button class="btn btn-sm btn-moderation">
        <i class="fadr fa-gavel"></i> Moderasi
      </button>
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
