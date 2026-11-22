import { type IPrimary } from "@/Pages/App/types/StackTypes"
import { StateManager } from "../core/StateManager"
import { StackPrimary } from "../main/StackPrimary"
import { kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { PagesRoot } from "../data/_PageList"
import { Explore } from "../Tabs/Explore"
import { Orders } from "../Tabs/Orders"
import { Bills } from "../Tabs/Bills"
import { Account } from "../Tabs/Account"

export interface IContentConfig {
  king: StackPrimary
  manager: StateManager
}

export class Content {
  private el!: HTMLDivElement

  private sect?: IPrimary

  private sectNum?: number
  private sectName?: string

  private king: StackPrimary
  private manager: StateManager

  constructor(config: IContentConfig) {
    this.king = config.king
    this.manager = config.manager

    this.createElement()
  }

  private createElement(): void {
    this.el = kel("div", "Stack-Content")
  }

  private async destroyRoot(id: string, num: number): Promise<boolean> {
    if (this.sect && id !== this.sectName) {
      const anim = (this.sectNum || 0) > num ? "rootOut2" : "rootOut1"

      this.sect.destroy(anim)

      return true
    }

    return false
  }

  async update(id: string, hierarchy: IStackHierarchy): Promise<void> {
    const rootPage = PagesRoot.find((k) => k.id === id)

    const rootName = rootPage?.id || "explore"
    const rootNum = rootPage?.n || 1

    let anim: string | undefined

    if (rootName === this.sectName) {
      return await this.sect?.handleHistory(hierarchy)
    }

    await this.sect?.handleHistory(hierarchy)

    const hasRoot = await this.destroyRoot(rootName, rootNum)

    if (hasRoot && this.sectNum) {
      anim = this.sectNum > rootNum ? "rootIn1" : "rootIn2"
    }

    this.king.tabs.updateMainTo(rootName)

    if (rootName === "explore") {
      this.sectNum = 1
      this.sectName = "explore"
      await this.addSect(new Explore({ king: this.king, anim, manager: this.manager }), anim, hierarchy)
    } else if (rootName === "orders") {
      this.sectNum = 2
      this.sectName = "orders"
      await this.addSect(new Orders({ king: this.king, anim, manager: this.manager }), anim, hierarchy)
    } else if (rootName === "bills") {
      this.sectNum = 3
      this.sectName = "bills"
      await this.addSect(new Bills({ king: this.king, anim, manager: this.manager }), anim, hierarchy)
    } else if (rootName === "me") {
      this.sectNum = 4
      this.sectName = "me"
      await this.addSect(new Account({ king: this.king, anim, manager: this.manager }), anim, hierarchy)
    }
  }

  private async addSect(sect: IPrimary, anim?: string, hierarchy?: IStackHierarchy): Promise<void> {
    this.el.append(sect.html)

    this.sect = sect

    if (anim) await waittime()

    if (hierarchy) await sect.handleHistory(hierarchy)
  }

  async destroy(): Promise<void> {}
  get html(): HTMLDivElement {
    return this.el
  }
}
