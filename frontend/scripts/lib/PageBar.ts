import "@/scss/lib/_PageBar.scss"
import type { IPaginatedMeta } from "@/Pages/Staff/types/EmbededAPITypes"
import { futor, kel } from "@/core/kel"
import { toText } from "./gen"
import { SetRipple, type IRippleReturn } from "./Ripple"
import { StateManager } from "@/Pages/Staff/core/StateManager"

interface PageBarConfig {
  title: string
  manager: StateManager
}

export class PageBar {
  private el!: HTMLDivElement
  locked: boolean = false

  private manager: StateManager

  private title: string

  private meta?: IPaginatedMeta

  private _rippleCaches: IRippleReturn[] = []

  private list: HTMLDivElement[] = []

  private arrowLeft!: HTMLDivElement
  private arrowRight!: HTMLDivElement

  private _onPageChanged?: (pageNum: number) => Promise<void>

  constructor(config: PageBarConfig) {
    this.title = config.title
    this.manager = config.manager

    this.createElement()
    this.arrowListener()
  }

  private createElement(): void {
    this.el = kel("div", "page-bar")
    this.el.innerHTML = `
    <div class="page-label">${toText(this.title)}</div>
    <div class="page-meta">
      <div class="page-group page-pages">
        <div class="page-arrow arrow-left"><i class="fajdr fa-arrow-left"></i></div>
        <div class="page-items">
        </div>
        <div class="page-arrow arrow-right"><i class="fajdr fa-arrow-right"></i></div>
      </div>
    </div>`

    this.arrowLeft = futor(".arrow-left", this.el, "div")
    this.arrowRight = futor(".arrow-right", this.el, "div")
  }

  setMeta(meta: IPaginatedMeta): void {
    this.meta = meta
    this.resetElement()
    this.writeData()
  }

  private resetElement(): void {
    this.list.forEach((k) => k.remove())
    this.list.splice(0, this.list.length)
  }

  private writeData(): void {
    if (!this.meta) throw new Error("Please insert meta object data first")
    const efield = futor(".page-items", this.el)

    for (let i = 1; i <= this.meta.totalPages; i++) {
      const eitem = kel("div", "item")

      eitem.innerText = i.toString()

      eitem.onclick = () => this.changePage(i)

      this.list.push(eitem)

      efield.append(eitem)

      if (i === this.meta.currentPage) {
        eitem.classList.add("active")
        setTimeout(() => {
          eitem.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
        }, 300)
      }
    }

    const elabel = futor(".page-label", this.el)
    elabel.innerText = `${toText(this.title)}: ${this.meta.currentPage}/${this.meta.totalPages}`

    this.arrowLeft.classList[this.meta.hasPrevPage ? "remove" : "add"]("disabled")

    this.arrowRight.classList[this.meta.hasNextPage ? "remove" : "add"]("disabled")
  }

  private arrowListener(): void {
    this._rippleCaches.push(
      SetRipple(this.arrowLeft, {
        run: () => this.previousPageListener()
      }),
      SetRipple(this.arrowRight, {
        run: () => this.nextPageListener()
      })
    )
  }

  private async previousPageListener(): Promise<void> {
    if (this.manager.busy) return
    if (this.locked) return
    if (!this.meta?.hasPrevPage) return

    const nextPage = this.meta.currentPage - 1

    await this.changePage(nextPage)
  }

  private async nextPageListener(): Promise<void> {
    if (this.manager.busy) return
    if (this.locked) return
    if (!this.meta?.hasNextPage) return

    const nextPage = this.meta.currentPage + 1

    await this.changePage(nextPage)
  }

  private async changePage(pageNum: number): Promise<void> {
    if (this.meta?.currentPage === pageNum) return

    this.lock()

    if (this._onPageChanged) {
      await this._onPageChanged(pageNum)
    }

    this.lock(false)
  }

  onPageChange(newFunc: (pageNum: number) => Promise<void>): void {
    this._onPageChanged = newFunc
  }

  lock(status: boolean = true): void {
    this.locked = status

    this.el.classList[status ? "add" : "remove"]("disabled")
  }

  get html(): HTMLDivElement {
    return this.el
  }

  destroy(): void {
    if (this._onPageChanged) {
      this._onPageChanged = undefined
    }

    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)

    this.resetElement()
    this.el.remove()
  }
}
