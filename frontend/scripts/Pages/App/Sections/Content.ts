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

  // bikin pembungkusnya
  private createElement(): void {
    this.el = kel("div", "Stack-Content")
  }

  // hapus content sebelumnya
  private async destroyRoot(id: string, num: number): Promise<boolean> {
    // kalo ada, id-nya beda
    if (this.sect && id !== this.sectName) {
      // tentukan animasi (swipe kiri - kanan)
      const anim = (this.sectNum || 0) > num ? "rootOut2" : "rootOut1"

      // destroy pake animasi anjayyyy
      this.sect.destroy(anim)

      // kasih nilai 'true'
      return true
    }

    // kalo selain dari itu semua, kasih nilai 'false'
    return false
  }

  async update(id: string, hierarchy: IStackHierarchy): Promise<void> {
    // cari root-nya
    const rootPage = PagesRoot.find((k) => k.id === id)

    // cek nama root
    const rootName = rootPage?.id || "explore"
    // cek urutan root
    const rootNum = rootPage?.n || 1

    // tentukan animasi
    let anim: string | undefined

    // kalo root baru sama kek root lama, cukup tangani state-nya
    if (rootName === this.sectName) {
      return await this.sect?.handleHistory(hierarchy)
    }

    // tangani state-nya
    await this.sect?.handleHistory(hierarchy)

    // hapus root sebelumnya
    const hasRoot = await this.destroyRoot(rootName, rootNum)

    // tentukan animasi root
    if (hasRoot && this.sectNum) {
      anim = this.sectNum > rootNum ? "rootIn1" : "rootIn2"
    }

    // update main content
    // this.king.header.updateMainTo(rootName)
    this.king.tabs.updateMainTo(rootName)

    // update berdasarkan id root-nya
    // TODO: bikin 'Record<unknown, unknown>' biar ga pake 'else if'
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

  // sisipkan section
  private async addSect(sect: IPrimary, anim?: string, hierarchy?: IStackHierarchy): Promise<void> {
    // render section
    this.el.append(sect.html)

    // define properti local sect pake sect
    this.sect = sect

    // kalo pake animasi, tunggu animasi sebelumnya selesai
    if (anim) await waittime()

    // kalo ada state, tunggu penanganan state-nya
    // Why: karna method external manggil await update di constructor ini, return ke method addSect, maka penanganan statenya wajib await
    if (hierarchy) await sect.handleHistory(hierarchy)
  }

  async destroy(): Promise<void> {}
  get html(): HTMLDivElement {
    return this.el
  }
}
