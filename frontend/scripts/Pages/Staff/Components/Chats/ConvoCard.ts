import { futor, kel, qutor } from "@/core/kel"
import { Chats } from "../../Tabs/Chats"
import type { IConvo } from "@/types/ServiceTypes"
import { toText } from "@/lib/gen"
import { SetRipple, type IRippleReturn } from "@/lib/Ripple"
import sdate from "@/lib/sdate"
import { lang } from "@/core/languages"
import { StateManager } from "../../core/StateManager"
import { getConvoAvatar, getConvoLastMessage, getConvoName } from "./chatCommon"
import waittime from "@/lib/waittime"

export interface IConvoCardConfig {
  convo: Chats
  item: IConvo
  manager: StateManager
}

export class ConvoCard {
  private convo: Chats
  private item: IConvo
  private manager: StateManager

  private el!: HTMLDivElement

  private _rippleCaches: IRippleReturn[] = []

  private unreads: number = 0

  private _onClick?: () => void

  constructor(config: IConvoCardConfig) {
    this.convo = config.convo
    this.item = config.item
    this.manager = config.manager

    this.unreads = this.item.unreads

    this.createElement()
    this.updateData()
    this.clickListener()
  }

  get id(): string {
    return this.item.id
  }

  private createElement(): void {
    const avatarIcon = getConvoAvatar(this.item.roomType)
    const chatName = getConvoName(this.item)

    this.el = kel("div", "UserCard")
    this.el.innerHTML = `
    <div class="UserProfile">
      <div class="avatar">
        <div class="initial-name"><i class="${avatarIcon}"></i></div>
        <div class="dot"></div>
      </div>
      <div class="info">
        <div class="name">${toText(chatName)}</div>
        <div class="snippet"></div>
      </div>
    </div>
    <div class="UserStatus">
      <div class="time"></div>
      <div class="unread">${this.item.unreads}</div>
    </div>`
  }

  private updateData(): void {
    const esinppet = futor(".snippet", this.el)

    const lastMessage = getConvoLastMessage(this.item.lastMessage)
    esinppet.innerHTML = lastMessage

    const etime = futor(".time", this.el)
    etime.innerHTML = sdate.dateOrTime(this.item.lastMessage.createdAt || Date.now())

    const eStatus = futor(".UserStatus", this.el)

    const oldUnreads = qutor(".unread", eStatus)

    if (this.unreads < 1) {
      if (oldUnreads) oldUnreads.remove()
    } else {
      const eUnreads = oldUnreads ?? kel("div", "unread")

      const unreadNumber = this.unreads > 99 ? 99 : this.unreads

      eUnreads.innerHTML = unreadNumber.toString()

      eStatus.append(eUnreads)
    }
  }

  private clickListener(): void {
    this._rippleCaches.push(
      SetRipple(this.el, {
        run: async () => {
          await waittime(120)
          if (this._onClick) this._onClick()
        }
      })
    )
  }

  onClick(newFunc: () => void): void {
    this._onClick = newFunc
  }

  get html(): HTMLDivElement {
    return this.el
  }

  destroy(): void {
    this.el.onclick = null

    if (this._onClick) {
      this._onClick = undefined
    }

    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    this.el.remove()
  }
}

export class NoDataConvoCard {
  private convo: Chats

  private el!: HTMLDivElement

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: Partial<IConvoCardConfig>) {
    this.convo = config.convo!

    this.createElement()
  }

  get id(): string {
    return "nodata"
  }

  private createElement(): void {
    this.el = kel("div", "UserCard")
    this.el.innerHTML = `
    <div class="UserProfile">
      <div class="info">
        <div class="name">${lang("chat_no_data")}</div>
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
