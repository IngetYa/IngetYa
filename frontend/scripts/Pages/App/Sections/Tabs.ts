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

  // list button kosongan
  private buttons: TabButton[] = []

  constructor(config: ITabsConfig) {
    this.king = config.king
    this.manager = config.manager

    this.createElement()
    this.writeButton()
  }

  // bikin element pembungkus
  private createElement(): void {
    this.el = kel("div", "Nav")
  }

  // render button
  private writeButton(): void {
    // ambil dair memory
    for (const tab of TabList) {
      // bikin constructor button
      const btn = new TabButton(tab)

      // click listener
      btn.onClick(() => {
        // kalo udah aktif, ya jangan dilajut
        if (btn.isActive) return

        // masukin ke queue
        this.manager.next({ path: tab.id }, tab.id === "explore")
      })
      // sisipkan ke list
      this.buttons.push(btn)

      // render button ke pembungkus
      this.el.append(btn.html)
    }
  }

  updateMainTo(id: string): void {
    // cek semua button
    for (const btn of this.buttons) {
      // aktifkan hanya kalo id-nya sama
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
    // unset semua button
    this.buttons.forEach((btn) => btn.destroy())
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
