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
import type { HistoryPaginatedResult, IMessageStaff } from "../../types/EmbededAPITypes"
import type { IConvo } from "@/types/ServiceTypes"
import { genUniq } from "@/lib/gen"
import { ChatInputAttachment } from "./ChatInputAttachment"
import { selectFile } from "@/core/FilePicker"
import { sendChatMessage } from "@/lib/ChatSender"

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
  private eembed!: HTMLDivElement
  private eactions!: HTMLDivElement
  private eheader!: HTMLDivElement

  private list: BubbleCard[] = []

  private textarea!: HTMLTextAreaElement

  private attachment?: ChatInputAttachment

  private downed: Set<string> = new Set()

  private panelId: string

  private resizeObserver?: ResizeObserver
  private onWindowResize = () => this.updateMinHeight()

  constructor(config: IChatPanelConfig) {
    const roomId = config.roomId

    this.roomId = roomId
    this.chats = config.chats
    this.manager = config.manager

    this.panelId = genUniq("string") as string

    const itemData = db.convo.find(roomId)

    if (!itemData) {
      throw new Error("Room ga ketemu")
    }

    this.item = itemData

    this.createElement()
    this.writeData()
    this.btnBackListener()
    this.textAreaGrowListener()
    this.sendListener()
    this.fileListener()
    this.setupMinHeight()
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
        </div>

        <div class="ChatForm">
          <div class="btn btn-attach">
            <i class="fajdr fa-paperclip"></i>
          </div>

          <textarea name="chat-text-${this.panelId}" id="chat-text-${this.panelId}" placeholder="Type Something" maxlength="300"></textarea>

          <div class="btn btn-send">
            <i class="fajdr fa-paper-plane"></i>
          </div>

        </div>
      </div>
    </div>`

    this.eheader = futor(".Header", this.el, "div")
    this.efield = futor(".ChatMessages", this.el, "div")
    this.eembed = futor(".ChatEmbed", this.el, "div")
    this.eactions = futor(".ChatActions", this.el, "div")
    this.textarea = futor(`#chat-text-${this.panelId}`, this.el, "textarea")
  }

  private updateMinHeight(): void {
    if (this.isDestroyed || !this.eheader || !this.eactions) return

    const headerHeight = this.eheader.offsetHeight || 0
    const actionsHeight = this.eactions.offsetHeight || 0

    if (headerHeight > 0) {
      this.el.style.setProperty("--header-height", `${headerHeight}px`)
    }
    if (actionsHeight > 0) {
      this.el.style.setProperty("--actions-height", `${actionsHeight}px`)
    }
  }

  private setupMinHeight(): void {
    this.updateMinHeight()
    requestAnimationFrame(() => this.updateMinHeight())

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.updateMinHeight())
      if (this.eheader) this.resizeObserver.observe(this.eheader)
      if (this.eactions) this.resizeObserver.observe(this.eactions)
    }

    window.addEventListener("resize", this.onWindowResize)
  }

  async openChat(): Promise<void> {}

  private async writeData(): Promise<void> {
    if (!db.messages.isLoaded) {
      await waittime(1000)

      const res = await xhr.forceGet(`/x/staff/data/messages/${this.roomId}`)

      if (this.isDestroyed) return

      const rawData = res.data as HistoryPaginatedResult<IMessageStaff>

      const data: HistoryPaginatedResult<IMessageStaff> = {
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

  private async renderItems(): Promise<void> {
    const items = db.messages.getAll()

    for (const item of items) {
      this.updateChat(item)
    }

    await waittime()

    this.toBottomContent()
  }

  private updateChat(item: IMessageStaff, tempId?: string): void {
    const oldCard = this.list.find((k) => k.id === item.id || k.id === tempId)

    if (oldCard) {
      oldCard.updateData(item)

      return
    }

    const card = new BubbleCard({ item: item, manager: this.manager, panel: this })

    this.list.push(card)

    this.efield.append(card.html)

    if (this.attachment) {
      this.efield.append(this.attachment.html)
    }
  }

  private keyDown(e: KeyboardEvent): void {
    const key = e.key.toLowerCase()
    if (key === "shift") this.downed.add(key)
    if (key === "enter" && this.downed.has("shift")) {
      e.preventDefault()
      this.sendMessage()
    }
  }

  private keyUp(e: KeyboardEvent): void {
    const key = e.key.toLowerCase()
    if (key === "shift" && this.downed.has(key)) this.downed.delete(key)
  }

  private textAreaGrowListener(): void {
    this.textarea.oninput = () => {
      this.textarea.style.height = "calc(1rem + (5px * 5))"
      this.textarea.style.height = `${this.textarea.scrollHeight}px`
    }

    this.textarea.onkeydown = (e) => this.keyDown(e)
    this.textarea.onkeyup = (e) => this.keyUp(e)
  }

  private sendListener(): void {
    const btnSend = futor(".btn-send", this.el)
    btnSend.onclick = () => this.sendMessage()
  }

  private fileListener(): void {
    const btnFile = futor(".btn-attach", this.el)

    this._rippleCaches.push(
      SetRipple(btnFile, {
        run: () => {
          if (this.locked) return
          selectFile("*/*", "single", (file) => this.onFileChosen(file))
        }
      })
    )
  }

  private onFileChosen(rawFile?: File | File[]): void {
    if (!rawFile) return

    const file = Array.isArray(rawFile) ? rawFile[0] : rawFile

    this.updateAttachment(file)
  }

  updateAttachment(file: File): void {
    if (this.attachment) this.attachment.destroy()

    const attach = new ChatInputAttachment(file)
    attach.onCancel(() => (this.attachment = undefined))

    this.attachment = attach

    this.eembed.append(this.attachment.html)
  }

  private sendMessage(): void {
    if (this.locked) return
    const file = this.attachment?.file

    const val = this.textarea.value.trim()

    if (val.length < 1 && !file) return

    if (val.length > 3000) return

    this.textarea.value = ""
    this.focusUserInp()
    this.textarea.style.height = "41px"

    if (this.attachment) {
      this.attachment.destroy()
      this.attachment = undefined
    }

    const tempChatId = Date.now().toString(36)

    const objURL = file ? URL.createObjectURL(file) : undefined

    const msgData: IMessageStaff = {
      createdAt: new Date(),
      id: tempChatId,
      readers: [],
      roomId: this.item.id,
      userId: db.me.id,
      userName: db.me.name,
      text: val,
      fileName: file?.name,
      fileUrl: objURL
    }

    this.updateChat(msgData)

    const url = "/x/message/staff-send"

    sendChatMessage({ text: val, tempId: tempChatId, file, url, roomId: this.roomId! })

    this.toBottomContent()
  }

  private focusUserInp(): void {
    this.textarea.readOnly = true
    this.textarea.focus()

    setTimeout(() => (this.textarea.readOnly = false), 100)
  }

  toBottomContent(): void {
    const field = futor(".StaffPage-Box", this.el)
    field.scrollTop = field.scrollHeight
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
    if (this.locked) return
    if (this.manager.busy) return

    history.back()
  }

  private btnBackListener(): void {
    const btnBack = futor(".btn-back", this.el)
    const rippleBack = SetRipple(btnBack, {
      run: async () => {
        await waittime(120)
        this.goHistoryBack()
      }
    })

    this._rippleCaches.push(rippleBack)

    const box = futor(".StaffPage-Box", this.el)

    this.el.onclick = (e) => {
      const target = e.target

      if (target instanceof HTMLElement && target.classList.contains("ChatPanel")) {
        this.goHistoryBack()
      } else if (target === box) {
        this.goHistoryBack()
      }
    }
  }

  private textAreaRemoveListener(): void {
    this.textarea.onkeydown = null
    this.textarea.onkeyup = null
    this.textarea.oninput = null
  }

  get html(): HTMLDivElement {
    return this.el
  }

  async destroy(): Promise<void> {
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    this.textAreaRemoveListener()

    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = undefined
    }
    window.removeEventListener("resize", this.onWindowResize)

    this.el.classList.add("out")
    this.el.onclick = null

    await waittime()

    db.messages.reset()
    this.isDestroyed = true

    this.el.remove()

    this.chats.setChatPanel()
  }
}
