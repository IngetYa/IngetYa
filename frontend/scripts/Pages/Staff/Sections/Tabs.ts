import { kel } from "@/core/kel"
import { TabButton } from "../Components/TabButton"
import { StateManager } from "../core/StateManager"
import { StackPrimary } from "../main/StackPrimary"
import { TabList } from "../data/_TabList"
import waittime from "@/lib/waittime"
import { SetRipple, type IRippleReturn } from "@/lib/Ripple"

export interface ITabsConfig {
  king: StackPrimary
  manager: StateManager
}

export class Tabs {
  menuLocked: boolean = false

  private el!: HTMLDivElement

  private king: StackPrimary

  private manager: StateManager

  private menu!: HTMLDivElement
  private elist!: HTMLDivElement

  _rippleCaches: IRippleReturn[] = []

  // list button kosongan
  private buttons: TabButton[] = []

  constructor(config: ITabsConfig) {
    this.king = config.king
    this.manager = config.manager

    this.createElement()
    this.writeButton()

    this.menuClickListener()
    this.menuUpdateString(true)
  }

  // bikin element pembungkus
  private createElement(): void {
    this.el = kel("div", "Nav")

    const menuWrapper = kel("div", "nav-menu")
    this.elist = kel("div", "nav-items")

    this.menu = kel("div", "btn btn-menu")
    menuWrapper.append(this.menu)

    this.el.append(menuWrapper, this.elist)
  }

  private menuClickListener(): void {
    this._rippleCaches.push(
      SetRipple(this.menu, {
        run: async () => {
          if (this.menuLocked) return

          this.menuLocked = true

          const winWidth = window.innerWidth >= 666
          const isOpened = this.el.classList.contains("opened")

          if (!isOpened && winWidth) {
            this.menuLocked = false
            return
          }

          if (isOpened) {
            this.el.classList.add("out")
          } else {
            this.el.classList.add("opened")
          }

          this.menuUpdateString(isOpened)

          await waittime(200)

          if (isOpened) {
            this.el.classList.remove("out", "opened")
          }

          this.menuLocked = false
        }
      })
    )
  }

  private menuUpdateString(isOpened: boolean): void {
    const iconClassName = `fa-regular fa-${isOpened ? "bars" : "xmark"} fa-fw`

    this.menu.innerHTML = `<i class="${iconClassName}"></i> MENU`
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
        this.manager.next({ path: tab.id }, tab.id === "overview")
      })
      // sisipkan ke list
      this.buttons.push(btn)

      // render button ke pembungkus
      this.elist.append(btn.html)
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
