import { type IPrimary } from "@/Pages/Staff/types/StackTypes"
import { StateManager } from "../core/StateManager"
import { StackPrimary } from "../main/StackPrimary"
import { kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { PagesRoot } from "../data/_PageList"
import { Overview } from "../Tabs/Overview"
import { Balance } from "../Tabs/Balance"
import { Chats } from "../Tabs/Chats"
import { Orders } from "../Tabs/Orders"
import { Bills } from "../Tabs/Bills"
import { Users } from "../Tabs/Users"
import { Account } from "../Tabs/Account"
import { Products } from "../Tabs/Products"

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

    const rootName = rootPage?.id || "overview"
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

    if (rootName === "overview") {
      this.sectNum = 1
      this.sectName = "overview"
      await this.addSect(new Overview({ king: this.king, anim, manager: this.manager }), anim, hierarchy)
    } else if (rootName === "balance") {
      this.sectNum = 2
      this.sectName = "balance"
      await this.addSect(new Balance({ king: this.king, anim, manager: this.manager }), anim, hierarchy)
    } else if (rootName === "products") {
      this.sectNum = 3
      this.sectName = "products"
      await this.addSect(new Products({ king: this.king, anim, manager: this.manager }), anim, hierarchy)
    } else if (rootName === "chats") {
      this.sectNum = 4
      this.sectName = "chats"
      await this.addSect(new Chats({ king: this.king, anim, manager: this.manager }), anim, hierarchy)
    } else if (rootName === "orders") {
      this.sectNum = 5
      this.sectName = "orders"
      await this.addSect(new Orders({ king: this.king, anim, manager: this.manager }), anim, hierarchy)
    } else if (rootName === "bills") {
      this.sectNum = 6
      this.sectName = "bills"
      await this.addSect(new Bills({ king: this.king, anim, manager: this.manager }), anim, hierarchy)
    } else if (rootName === "users") {
      this.sectNum = 7
      this.sectName = "users"
      await this.addSect(new Users({ king: this.king, anim, manager: this.manager }), anim, hierarchy)
    } else if (rootName === "me") {
      this.sectNum = 8
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
