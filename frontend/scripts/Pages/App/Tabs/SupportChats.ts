import { eroot, futor, kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import { type IRippleReturn } from "@/lib/Ripple"
import { formAbort } from "@/lib/modal"
import db from "../data/db"
import xhr from "@/lib/xhr"
import type { IConvoPaginatedResult } from "../API/ConvoAPI"
import type { IConvo } from "@/types/ServiceTypes"
import { ConvoCard, NoDataConvoCard } from "../Components/Chats/ConvoCard"
import { StateManager } from "../core/StateManager"
import waittime from "@/lib/waittime"
import { StackPrimary } from "../main/StackPrimary"
import type { IPrimaryConfig } from "../types/StackTypes"
import { lang } from "@/core/languages"
import { ChatPanel } from "../Components/Chats/ChatPanel"

export class Chats {
  private el!: HTMLDivElement
  locked: boolean = false
  private anim?: string
  private king: StackPrimary
  manager: StateManager

  private _rippleCaches: IRippleReturn[] = []

  private isDestroyed: boolean = false

  private list: (ConvoCard | NoDataConvoCard)[] = []

  private isLoaded: boolean = false
  private onLoaded?: () => void

  private efield!: HTMLDivElement

  private ChatPanel?: ChatPanel

  constructor(config: IPrimaryConfig) {
    this.king = config.king
    this.manager = config.manager
    this.anim = config.anim

    this.createElement()
    this.writeData()
  }

  private createElement(): void {
    this.el = kel("div", "AppMain SupportChats")

    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `
    <div class="Header">
      <div class="HeaderMain">
        <div class="Title">
          <h1><i class="fajdr fa-comment-dots"></i> ${lang("tab_chats")}</h1>
        </div>
      </div>
      <div class="Search">
        <div class="inp">
          <div class="icon"><i class="fajdr fa-magnifying-glass"></i></div>
          <input type="text" class="input-search-orders" placeholder="Cari room atau ID" readonly />
          <div class="btn btn-search-orders">${lang("search")}</div>
        </div>
      </div>
    </div>

    <div class="FlatList">
      <div class="List">


        <div class="UserCard">
          <div class="UserProfile">
            <div class="avatar skeleton"></div>
            <div class="info">
              <div class="name"><div class="skeleton"></div></div>
              <div class="snippet"><div class="skeleton"></div></div>
            </div>
          </div>
          <div class="UserStatus">
            <div class="time"><div class="skeleton"></div></div>
          </div>
        </div>

        <div class="UserCard">
          <div class="UserProfile">
            <div class="avatar skeleton"></div>
            <div class="info">
              <div class="name"><div class="skeleton"></div></div>
              <div class="snippet"><div class="skeleton"></div></div>
            </div>
          </div>
          <div class="UserStatus">
            <div class="time"><div class="skeleton"></div></div>
          </div>
        </div>


      </div>
    </div>`

    this.efield = futor(".FlatList .List", this.el, "div")
  }

  private async writeData(): Promise<void> {
    if (!db.convo.isLoaded) {
      await waittime(1000)

      const res = await xhr.forceGet(`/x/message/data/convo`)

      if (res.ok && res.data) {
        const data = res.data as IConvoPaginatedResult<IConvo>

        db.convo.Meta = data.meta
        db.convo.update(...data.data)
        db.convo.isLoaded = true
      }
    }

    if (this.isDestroyed) return

    this.isLoaded = true

    while (this.efield.firstChild) {
      this.efield.firstChild.remove()
    }

    this.renderItems()

    if (this.onLoaded) {
      this.onLoaded()
      this.onLoaded = undefined
    }
  }

  private renderItems(): void {
    const items = db.convo.getAll().filter((item) => item.userId === db.me.id)

    for (const item of items) {
      const card = new ConvoCard({ convo: this, item, manager: this.manager })
      card.onClick(() => {
        this.onCardClick(item)
      })

      this.list.push(card)

      this.efield.append(card.html)
    }

    this.writeNoData(items)
  }

  private onCardClick(item: IConvo): void {
    if (this.locked || this.manager.busy) return

    this.manager.next({ path: `#chats/room/${item.id}` })
  }

  private writeNoData(rooms: IConvo[]): void {
    const oldCard = this.list.find((k) => k.id === "nodata")

    if (rooms.length < 1) {
      if (oldCard) return

      const nodataCard = new NoDataConvoCard({ convo: this })

      this.list.push(nodataCard)

      return this.efield.prepend(nodataCard.html)
    }

    if (oldCard) oldCard.destroy()
  }

  private async startChatPanel(sub: string): Promise<void> {
    const convoData = db.convo.find(sub)

    if (!convoData || convoData.userId !== db.me.id) return

    this.hide()
    this.king.tabs.hide()

    const roomName = convoData.roomName || convoData.userName || convoData.id

    const chatPanel = new ChatPanel({ roomId: sub, parent: this, manager: this.manager, roomName })

    this.setChatPanel(chatPanel)

    eroot().append(chatPanel.html)

    await waittime()
  }

  setChatPanel(chatPanel?: ChatPanel) {
    this.ChatPanel = chatPanel
  }

  private async runHistoryQueue(hierarchy: IStackHierarchy): Promise<void> {
    formAbort()

    const { section, sub } = hierarchy

    if (this.ChatPanel) {
      this.king.tabs.hide(false)
      this.hide(false)
      await this.ChatPanel.destroy()
    }

    if (!section) return

    if (section === "room") {
      if (!sub) return

      await this.startChatPanel(sub)
    }
  }

  async handleHistory(hierarchy: IStackHierarchy): Promise<void> {
    if (this.isLoaded) return await this.runHistoryQueue(hierarchy)

    return new Promise((resolve) => {
      this.onLoaded = async () => {
        await this.runHistoryQueue(hierarchy)
        resolve()
      }
    })
  }

  private async hide(status: boolean = true): Promise<void> {
    if (status) {
      this.el.classList.add("stackOut2")
      await waittime()
      this.el.classList.add("hide")
      this.el.classList.remove("stackOut2")
      return
    }

    this.el.classList.add("stackIn2")
    this.el.classList.remove("hide")
    await waittime()
    this.el.classList.remove("stackIn2")
  }

  get html(): HTMLDivElement {
    return this.el
  }

  private deleteList(): void {
    this.list.forEach((card) => card.destroy())
    this.list.splice(0, this.list.length)
  }

  async destroy(anim?: string): Promise<void> {
    this.isDestroyed = true
    this._rippleCaches.forEach((r) => r.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    if (this.ChatPanel) {
      await this.ChatPanel.destroy()
    }

    if (anim) {
      this.el.classList.add(anim)
      await waittime()
    }

    this.deleteList()

    this.el.remove()
  }
}
