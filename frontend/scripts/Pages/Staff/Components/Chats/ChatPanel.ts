import { type IStackHierarchy } from "@/core/hierarchy"
import { futor, kel } from "@/core/kel"
import { lang } from "@/core/languages"
import { formAbort } from "@/lib/modal"
import { SetRipple, type IRippleReturn } from "@/lib/Ripple"
import { Chats } from "../../Tabs/Chats"
import { StateManager } from "../../core/StateManager"
import db from "../../data/db"
import waittime from "@/lib/waittime"
import xhr from "@/lib/xhr"
import { BubbleCard } from "./MessageCard"
import { Colors } from "@/core/Colors"
import type { IMessageStaff, PaginatedResult } from "../../types/EmbededAPITypes"
import type { IConvo } from "@/types/ServiceTypes"

export interface IChatPanelConfig {
  chats: Chats
  roomId: string
  manager: StateManager
}

export class ChatPanel {
  locked: boolean = false

  private el!: HTMLDivElement

  private chats: Chats
  private manager: StateManager

  private item: IConvo

  private _rippleCaches: IRippleReturn[] = []

  private isDestroyed: boolean = false

  private isLoaded: boolean = false
  private onLoaded?: () => void

  private roomId?: string

  private efield!: HTMLDivElement

  private list: BubbleCard[] = []

  constructor(config: IChatPanelConfig) {
    const roomId = config.roomId

    this.roomId = roomId
    this.chats = config.chats
    this.manager = config.manager

    const itemData = db.convo.find(roomId)

    if (!itemData) {
      throw new Error("Room ga ketemu")
    }

    this.item = itemData

    this.createElement()
    this.writeData()
    this.btnBackListener()
  }

  private createElement(): void {
    this.el = kel("div", "StaffPage ChatPanel")

    this.el.innerHTML = `
    <div class="StaffPage-Box">
      <div class="Header">
        <div class="HeaderMain">
          <div class="btn btn-back HistoryBack">
            <i class="fas fa-arrow-left"></i>
          </div>
          <div class="Title">
            <h1>${this.item.roomName || this.item.userName}</h1>
          </div>
          <div class="Actions">
            <div class="btn btn-close-ticket">
              <i class="fadr fa-door-open"></i>
            </div>
          </div>
        </div>
      </div>


      <div class="ChatMessages">


        <div class="card card-loading">
          <div class="card-name"><div class="skeleton"></div></div>
          <div class="card-text"><div class="skeleton"></div></div>
          <div class="card-meta"><div class="skeleton"></div></div>
        </div>


      </div>

      <div class="ChatActions">
        <div class="ChatEmbed">
          <div class="attach">
            <div class="attach-file">
              <div class="icon">
                <i class="fas fa-file"></i>
              </div>
              <div class="file-meta">
                <div class="file-title">File</div>
                <div class="file-name">file-laporan.csv</div>
              </div>
            </div>
            <div class="btn btn-attach-cancel">
              <i class="fadr fa-circle-xmark"></i>
            </div>
          </div>
        </div>

        <div class="ChatForm">
          <div class="btn btn-attach">
            <i class="fajdr fa-paperclip"></i>
          </div>

          <textarea name="chat-text" id="chat-text" placeholder="Type Something" maxlength="300"></textarea>

          <div class="btn btn-send">
            <i class="fajdr fa-paper-plane"></i>
          </div>

        </div>
      </div>
    </div>`

    this.efield = futor(".ChatMessages", this.el, "div")
  }

  async openChat(): Promise<void> {}

  private async writeData(): Promise<void> {
    if (!db.messages.isLoaded) {
      await waittime(1000)

      const res = await xhr.forceGet(`/x/staff/data/messages/${this.roomId}/1`)

      if (this.isDestroyed) return

      const rawData = res.data as PaginatedResult<IMessageStaff>

      const data: PaginatedResult<IMessageStaff> = {
        meta: rawData.meta,
        data: rawData.data.map((k) => ({
          ...k,
          isSent: true
        }))
      }

      db.messages.Meta = data.meta
      db.messages.update(...data.data)
      db.messages.isLoaded = true
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
    const items = db.messages.getAll()

    for (const item of items) {
      const card = new BubbleCard({ item: item, manager: this.manager, panel: this })

      this.list.push(card)

      this.efield.append(card.html)
    }
  }

  hide(status: boolean = true): void {
    if (status) {
      this.el.classList.add("hide")
    } else {
      this.el.classList.remove("hide")
    }
  }

  private startRoomChat(roomId: string): void {
    this.roomId = roomId
  }

  private goHistoryBack(): void {
    // batalin kalo history lagi frustasi
    if (this.locked) return
    if (this.manager.busy) return

    // mundur 1 state
    history.back()
  }

  // listener tombol kembali
  private btnBackListener(): void {
    const btnBack = futor(".btn-back", this.el)
    const rippleBack = SetRipple(btnBack, {
      run: async () => {
        await waittime(120)
        this.goHistoryBack()
      }
    })
    // btnBack.onclick = () => this.goHistoryBack()

    this._rippleCaches.push(rippleBack)

    const box = futor(".StaffPage-Box", this.el)

    this.el.onclick = (e) => {
      const target = e.target

      const isElement = target instanceof Node
      if (!isElement) return
      if (box.contains(target)) return

      this.goHistoryBack()
    }
  }

  get html(): HTMLDivElement {
    return this.el
  }

  async destroy(): Promise<void> {
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    this.el.classList.add("out")
    this.el.onclick = null

    await waittime()

    db.messages.reset()
    this.isDestroyed = true

    this.el.remove()

    this.chats.setChatPanel()
  }
}
