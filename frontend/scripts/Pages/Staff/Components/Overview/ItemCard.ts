import { futor, kel } from "@/core/kel"
import { Overview } from "../../Tabs/Overview"
import type { IOverview } from "../../types/EmbededAPITypes"
import { getLanguage, lang } from "@/core/languages"
import { toCurrency } from "@/lib/gen"
import { type IRippleReturn, SetRipple } from "@/lib/Ripple"
import { Colors } from "@/core/Colors"
import waittime from "@/lib/waittime"

export interface IOverviewItemCardConfig {
  overview: Overview
  item: IOverview
}

type ItemCardIcon = Record<string, string>

const itemIcon: ItemCardIcon = {
  balance: "fadr fa-wallet",
  products: "fajdr fa-map",
  orders: "fadr fa-bag-shopping",
  bills: "fajdr fa-credit-card",
  chats: "fajdr fa-comments",
  users: "fajdr fa-users"
}

export class OverviewItemCard {
  private overview: Overview
  private item: IOverview

  private el!: HTMLDivElement

  private _rippleCaches: IRippleReturn[] = []

  constructor(config: IOverviewItemCardConfig) {
    this.overview = config.overview
    this.item = config.item

    this.createElement()
    this.updateString()
    this.clickListener()
  }

  get id(): string {
    return this.item.id
  }

  private createElement(): void {
    this.el = kel("div", "item-card")
    this.el.innerHTML = `
    <div class="item-head">
      <span class="item-title"></span>
      <div class="item-icon">
        <i class="${itemIcon[this.item.id]}"></i>
      </div>
    </div>
    <div class="item-value">Rp48.250.000</div>
    <div class="item-footer">
      <div class="item-open">${lang("overview_see_detail")} <i class="fas fa-chevrons-right"></i></div>
    </div>`
  }

  private updateString(): void {
    const etitle = futor(".item-title", this.el)
    const rawTitle = lang(`overview_${this.item.id}_text`)

    if (this.item.id === "balance") {
      const month = new Date(this.item.timestamp!).toLocaleString(getLanguage(), { month: "long" })
      const titleString = rawTitle.replace(/{mo}/, month)
      etitle.innerText = titleString
    } else {
      etitle.innerText = rawTitle
    }

    const evalue = futor(".item-value", this.el)

    const rawValue = lang(`overview_${this.item.id}_value`)

    const priceValue = this.item.value < 1 ? "0" : toCurrency(this.item.value)

    const valueString = rawValue.replace(/{val}/, priceValue)

    evalue.innerHTML = valueString
  }

  private clickListener(): void {
    const btnOpen = futor(".item-open", this.el)
    this._rippleCaches.push(
      SetRipple(btnOpen, {
        color: Colors.white,
        run: async () => {
          if (this.overview.manager.busy) return
          if (this.overview.locked) return

          await waittime(120)

          this.overview.manager.next({ path: `#${this.item.id}` })
        }
      })
    )
  }

  get html(): HTMLDivElement {
    return this.el
  }

  destroy(): void {
    this._rippleCaches.forEach((ripple) => ripple.stopListener())
    this._rippleCaches.splice(0, this._rippleCaches.length)
  }
}
