import { kel } from "@/core/kel"
import { TabButton } from "../Components/TabButton"
import { StateManager } from "../core/StateManager"
import { StackPrimary } from "../main/StackPrimary"
import { TabList } from "../data/_TabList"
import waittime from "@/lib/waittime"

export interface ITabsConfig {
  king: StackPrimary
  manager: StateManager
}

export class Tabs {
  private el!: HTMLDivElement

  private king: StackPrimary

  private manager: StateManager

  private buttons: TabButton[] = []

  private moreBtn?: TabButton
  private moreContainer?: HTMLDivElement
  private moreLocked: boolean = false

  private onDocumentClick = (e: MouseEvent): void => {
    if (this.el.classList.contains("more-opened") && !this.el.contains(e.target as Node)) {
      this.closeMore()
    }
  }

  constructor(config: ITabsConfig) {
    this.king = config.king
    this.manager = config.manager

    this.createElement()
    this.writeButton()

    document.addEventListener("click", this.onDocumentClick)
  }

  private createElement(): void {
    this.el = kel("div", "Nav")
  }

  private writeButton(): void {
    const hasMoreOptions = TabList.some((tab) => "isMoreOption" in tab && tab.isMoreOption)
    if (hasMoreOptions) {
      this.moreContainer = kel("div", "nav-more")
    }

    for (const tab of TabList) {
      const btn = new TabButton(tab)

      btn.onClick(() => {
        this.closeMore()
        if (btn.isActive) return

        this.manager.next({ path: tab.id }, tab.id === "explore")
      })
      this.buttons.push(btn)

      if ("isMoreOption" in tab && tab.isMoreOption && this.moreContainer) {
        this.moreContainer.append(btn.html)
      } else {
        this.el.append(btn.html)
      }
    }

    if (this.moreContainer) {
      this.moreBtn = new TabButton({
        id: "more",
        icon: "fajdr fa-ellipsis fa-fw",
        name: "more"
      })
      this.moreBtn.onClick(() => this.toggleMore())
      this.el.append(this.moreBtn.html, this.moreContainer)
    }
  }

  private async toggleMore(): Promise<void> {
    if (window.innerWidth >= 666 || this.moreLocked) return

    if (this.el.classList.contains("more-opened")) {
      await this.closeMore()
    } else {
      this.el.classList.remove("more-out")
      this.el.classList.add("more-opened")
    }
  }

  private async closeMore(): Promise<void> {
    if (!this.el.classList.contains("more-opened") || this.moreLocked) return

    this.moreLocked = true
    this.el.classList.add("more-out")
    await waittime(200)
    this.el.classList.remove("more-out", "more-opened")
    this.moreLocked = false
  }

  updateMainTo(id: string): void {
    let isMoreActive = false
    for (const btn of this.buttons) {
      const active = btn.id === id
      btn.activate(active)
      if (active && btn.isMoreOption) {
        isMoreActive = true
      }
    }
    this.moreBtn?.activate(isMoreActive)
  }

  updateString(): void {
    this.buttons.forEach((btn) => btn.updateString())
    this.moreBtn?.updateString()
  }

  async hide(status: boolean = true): Promise<void> {
    if (status) {
      this.el.classList.add("navOut1")
      await waittime()
      this.el.classList.add("hide")
      this.el.classList.remove("navOut1")
      return
    }

    this.el.classList.add("navIn1")
    this.el.classList.remove("hide")
    await waittime()
    this.el.classList.remove("navIn1")
  }

  async destroy(): Promise<void> {
    document.removeEventListener("click", this.onDocumentClick)
    this.buttons.forEach((btn) => btn.destroy())
    this.moreBtn?.destroy()
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
