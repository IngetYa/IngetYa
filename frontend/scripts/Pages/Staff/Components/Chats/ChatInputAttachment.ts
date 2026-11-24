import { toText } from "@/lib/gen"
import { futor, kel } from "@/core/kel"
import getFileType from "@/core/FileCommon"
import waittime from "@/lib/waittime"

export class ChatInputAttachment {
  private el!: HTMLDivElement
  private fileField!: HTMLDivElement

  private _onCanceled?: () => void

  private objURL: string

  constructor(private _file: File) {
    this.objURL = URL.createObjectURL(_file)

    this.createElement()
    this.writeMedia()
    this.cancelClick()
  }

  private createElement(): void {
    this.el = kel("div", "attach")
    this.el.innerHTML = `
    <div class="attach-file">
      <div class="file-meta">
        <div class="file-title">Attachment</div>
        <div class="file-name">${toText(this._file.name)}</div>
      </div>
    </div>
    <div class="btn btn-attach-cancel">
      <i class="fajdr fa-circle-xmark"></i>
    </div>`

    this.fileField = futor(".attach-file", this.el, "div")
  }

  private writeMedia(): void {
    const fileName = this._file.name

    const mediaType = getFileType(fileName)

    if (mediaType === "video") return this.writeVideo()
    if (mediaType === "image") return this.writeImage()
    return this.writeDoc()
  }

  private writeImage(): void {
    const img = new Image()

    img.onerror = () => {
      img.remove()
      this.writeDoc()
    }

    img.alt = this._file.name

    img.src = this.objURL

    this.fileField.prepend(img)
  }
  private writeVideo(): void {
    const vid = kel("video")

    vid.onerror = () => {
      vid.remove()
      this.writeDoc()
    }

    vid.volume = 0

    vid.controls = false

    vid.src = this.objURL

    this.fileField.prepend(vid)
  }
  private writeDoc(): void {
    const icon = kel("div", "icon")
    icon.innerHTML = '<i class="fajdr fa-file fa-fw"></i>'

    this.fileField.prepend(icon)
  }

  onCancel(newFunc: () => void): void {
    this._onCanceled = newFunc
  }

  private cancelClick(): void {
    const btnCancel = futor(".btn-attach-cancel", this.el)
    btnCancel.onclick = () => this.destroy()
  }

  async destroy(): Promise<void> {
    this.el.classList.add("hide")

    URL.revokeObjectURL(this.objURL)

    if (this._onCanceled) {
      this._onCanceled()
      this._onCanceled = undefined
    }

    await waittime(30)
    this.el.remove()
  }

  get file(): File {
    return this._file
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
