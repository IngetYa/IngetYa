import { futor, kel } from "@/core/kel"
import { SetRipple, type IRippleReturn } from "@/lib/Ripple"
import { Chats } from "../../Tabs/SupportChats"
import { StateManager } from "../../core/StateManager"
import db from "../../data/db"
import waittime from "@/lib/waittime"
import xhr from "@/lib/xhr"
import { BubbleCard } from "./MessageCard"
import type { IMessagePaginatedResult, IMessageUser } from "../../API/MessagesAPI"
import type { IConvo } from "@/types/ServiceTypes"
import { genUniq, toText } from "@/lib/gen"
import { ChatInputAttachment } from "./ChatInputAttachment"
import { selectFile } from "@/core/FilePicker"
import { sendChatMessage } from "@/lib/ChatSender"
import { Orders } from "../../Tabs/Orders"

export interface IChatPanelConfig {
  parent: Chats | Orders
  roomId: string
  roomName: string
  manager: StateManager
}

export class ChatPanel {
  locked: boolean = false

  private el!: HTMLDivElement

  private parent: Chats | Orders
  private manager: StateManager

  private roomName: string

  private _rippleCaches: IRippleReturn[] = []

  private isDestroyed: boolean = false

  private isLoaded: boolean = false
  private onLoaded?: () => void

  private roomId: string

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
    this.roomId = config.roomId
    this.roomName = config.roomName
    this.parent = config.parent
    this.manager = config.manager

    this.panelId = genUniq("string") as string

    this.createElement()
    this.writeData()
    this.btnBackListener()
    this.textAreaGrowListener()
    this.sendListener()
    this.fileListener()
    this.setupMinHeight()
  }

  private createElement(): void {
    this.el = kel("div", "AppSec ChatPanel")

    this.el.innerHTML = `
    <div class="AppMain-Box">
      <div class="Header">
        <div class="HeaderMain">
          <div class="btn btn-back HistoryBack">
            <i class="fas fa-arrow-left"></i>
          </div>
          <div class="Title">
            <h1>${toText(this.roomName)}</h1>
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

          <textarea name="chat-text-${this.panelId}" id="chat-text-${this.panelId}" placeholder="Type Something" maxlength="3000"></textarea>

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

  private async writeData(): Promise<void> {
    if (!db.messages.isLoaded) {
      await waittime(1000)

      const res = await xhr.forceGet(`/x/message/data/messages/${this.roomId}`)

      if (this.isDestroyed) return

      if (res.ok && res.data) {
        const rawData = res.data as IMessagePaginatedResult<IMessageUser>

        const data: IMessagePaginatedResult<IMessageUser> = {
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

  private updateChat(item: IMessageUser, tempId?: string): void {
    const oldCard = this.list.find((k) => k.id === item.id || k.id === tempId)

    if (oldCard) {
      oldCard.updateData(item)

      return
    }

    const card = new BubbleCard({ item: item, manager: this.manager, panel: this })

    this.list.push(card)

    this.efield.append(card.html)
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

    const msgData: IMessageUser = {
      createdAt: new Date(),
      id: tempChatId,
      readers: [],
      roomId: this.roomId,
      userId: db.me.id,
      userName: db.me.name,
      text: val,
      fileName: file?.name,
      fileUrl: objURL
    }

    this.updateChat(msgData)

    const url = "/x/message/send"

    sendChatMessage({ text: val, tempId: tempChatId, file, url, roomId: this.roomId! })

    this.toBottomContent()
  }

  private focusUserInp(): void {
    this.textarea.readOnly = true
    this.textarea.focus()

    setTimeout(() => (this.textarea.readOnly = false), 100)
  }

  toBottomContent(): void {
    const field = futor(".AppMain-Box", this.el)
    field.scrollTop = field.scrollHeight
  }

  hide(status: boolean = true): void {
    if (status) {
      this.el.classList.add("hide")
    } else {
      this.el.classList.remove("hide")
    }
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

    const box = futor(".AppMain-Box", this.el)

    this.el.onclick = (e) => {
      const target = e.target

      if (target instanceof HTMLElement && target.classList.contains("AppSec")) {
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

    this.parent.setChatPanel()
  }
}
