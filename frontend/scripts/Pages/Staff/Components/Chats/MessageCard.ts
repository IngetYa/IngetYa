import { futor, kel } from "@/core/kel"
import { toText } from "@/lib/gen"
import { SetRipple, type IRippleReturn } from "@/lib/Ripple"
import sdate from "@/lib/sdate"
import { StateManager } from "../../core/StateManager"
import { ChatPanel } from "./ChatPanel"
import type { IMessageStaff } from "../../types/EmbededAPITypes"
import getFileType from "@/core/FileCommon"
import db from "../../data/db"

export interface IBubbleConfig {
  panel: ChatPanel
  item: IMessageStaff
  manager: StateManager
}

export class BubbleCard {
  private panel: ChatPanel
  private item: IMessageStaff
  private manager: StateManager

  private el!: HTMLDivElement

  private _rippleCaches: IRippleReturn[] = []

  private _isSent: boolean

  constructor(config: IBubbleConfig) {
    this.panel = config.panel
    this.item = config.item
    this.manager = config.manager

    this._isSent = config.item.isSent ?? false

    this.createElement()
    this.writeName()
    this.writeFile()
    this.writeText()
    this.writeMeta()
  }

  get id(): string {
    return this.item.id
  }

  private createElement(): void {
    this.el = kel("div", "card")

    if (this.item.userId === db.me.id) this.el.classList.add("me")
  }

  private writeName(): void {
    const eName = kel("div", "card-name")
    eName.innerText = this.item.userName

    this.el.append(eName)
  }

  private writeFile(): void {
    if (!this.item.fileUrl || !this.item.fileName) return

    const fileName = this.item.fileName
    const fileType = getFileType(fileName)
    const fileSrc = this.item.fileUrl

    const eMedia = kel("div", "card-media")

    this.el.append(eMedia)

    if (fileType === "video") return this.renderVideo(eMedia, fileSrc, fileName)
    if (fileType === "image") return this.renderImage(eMedia, fileSrc, fileName)
    return this.renderDocument(eMedia, fileSrc, fileName)
  }

  private writeText(): void {
    if (!this.item.text) return

    const eText = kel("div", "card-text")

    eText.innerText = this.item.text

    this.el.append(eText)
  }

  private writeMeta(): void {
    const eMeta = kel("div", "card-meta")

    const eTime = kel("span", "card-time")

    eTime.innerHTML = sdate.parseTime(this.item.createdAt)

    const eStatus = kel("span", "card-status")

    eMeta.append(eTime, eStatus)

    this.el.append(eMeta)

    this.statusUpdate()
  }

  set isSent(status: boolean) {
    if (!status || status === status) return

    this._isSent = status

    this.statusUpdate()
  }

  private statusUpdate(): void {
    const icon = this._isSent ? "check" : "clock"

    const eStatus = futor(".card-status", this.el)

    const statusStr = this.item.userId === db.me.id ? `<i class="fa-jelly-fill fa-regular fa-${icon}"></i>` : ""

    eStatus.innerHTML = statusStr
  }

  private renderVideo(eMedia: HTMLDivElement, src: string, fileName: string): void {
    const vid = kel("video")

    vid.onerror = () => {
      this.renderDocument(eMedia, src, fileName)
      vid.remove()
    }

    vid.setAttribute("controlsList", "nodownload")

    vid.controls = true

    vid.src = src

    eMedia.append(vid)
  }

  private renderImage(eMedia: HTMLDivElement, src: string, fileName: string): void {
    const a = kel("a")
    a.target = "_blank"
    a.href = src

    const img = new Image()
    img.onerror = () => {
      a.remove()
      this.renderDocument(eMedia, src, fileName)
      img.remove()
    }

    img.alt = fileName

    img.src = src

    a.append(img)

    eMedia.append(a)
  }

  private renderDocument(eMedia: HTMLDivElement, src: string, fileName: string): void {
    const a = kel("a")
    a.innerHTML = `<div class="ofile"><div class="ofile-meta"><div class="ofile-title">File</div><div class="ofile-name">${toText(fileName)}</div></div></div>`

    a.target = "_blank"

    a.href = src

    eMedia.append(a)
  }

  updateData(data: IMessageStaff): void {
    this.item = data

    if (data.isSent) this._isSent = data.isSent

    this.statusUpdate()
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

export class NoDataBubbleCard {
  private panel: ChatPanel

  private el!: HTMLDivElement

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: Partial<IBubbleConfig>) {
    this.panel = config.panel!

    this.createElement()
  }

  get id(): string {
    return "nodata"
  }

  private createElement(): void {
    this.el = kel("div", "UserCard")
    this.el.innerHTML = `
    <div class="card">
      <div class="card-name">NoData</div>
      <div class="card-text">NoData</div>
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
