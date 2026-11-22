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

  constructor(config: ITabsConfig) {
    this.king = config.king
    this.manager = config.manager

    this.createElement()
    this.writeButton()
  }

  private createElement(): void {
    this.el = kel("div", "Nav")
  }

  private writeButton(): void {
    for (const tab of TabList) {
      const btn = new TabButton(tab)

      btn.onClick(() => {
        if (btn.isActive) return

        this.manager.next({ path: tab.id }, tab.id === "explore")
      })
      this.buttons.push(btn)

      this.el.append(btn.html)
    }
  }

  updateMainTo(id: string): void {
    for (const btn of this.buttons) {
      btn.activate(btn.id === id)
    }
  }

  updateString(): void {
    this.buttons.forEach((btn) => btn.updateString())
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
    this.buttons.forEach((btn) => btn.destroy())
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
