import type { IPrimary, IPrimaryConfig } from "@/Pages/Staff/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { lang } from "@/core/languages"
import { type IRippleReturn } from "@/lib/Ripple"

export class Products implements IPrimary {
  private el!: HTMLDivElement
  locked: boolean = false
  private anim?: string
  private king: StackPrimary
  manager: StateManager
  private _rippleCaches: IRippleReturn[] = []

  constructor(config: IPrimaryConfig) {
    this.king = config.king
    this.manager = config.manager
    this.anim = config.anim

    this.createElement()
  }

  private createElement(): void {
    this.el = kel("div", "AppMain StaffPage StaffProducts")
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `
    <div class="Header">
      <div class="HeaderMain">
        <div class="Title">
          <h1><i class="fajdr fa-map"></i> ${lang("tab_products")}</h1>
        </div>
      </div>
      <div class="Categories">
        <div class="cat active">
          <span>Semua</span>
          <i>140</i>
        </div>
        <div class="cat">
          <span>Fancy</span>
          <i>32</i>
        </div>
        <div class="cat">
          <span>Vintage</span>
          <i>16</i>
        </div>
      </div>
    </div>
    <div class="FlatList">
      <div class="List">
        <div class="item">
          <div class="thumbnail">
            <img src="/assets/example/olive.png" alt="Olive Thumbnail" />
          </div>
          <div class="tags">
            <div class="tag">Fancy</div>
            <div class="tag">Vintage</div>
          </div>
          <div class="name">Olive</div>
          <div class="price">Rp20.000</div>
        </div>
        <div class="item">
          <div class="thumbnail">
            <img src="/assets/example/reverie.png" alt="Reverie Thumbnail" />
          </div>
          <div class="tags">
            <div class="tag">Modern</div>
            <div class="tag">Minimalist</div>
          </div>
          <div class="name">Reverie</div>
          <div class="price">Rp22.500</div>
        </div>
      </div>
    </div>`
  }

  async handleHistory(_hierarchy: IStackHierarchy): Promise<void> {}

  async destroy(anim?: string): Promise<void> {
    this._rippleCaches.forEach((r) => r.stopListener())
    this._rippleCaches.length = 0

    if (anim) {
      this.el.classList.add(anim)
      await waittime()
    }
    this.el.remove()
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
