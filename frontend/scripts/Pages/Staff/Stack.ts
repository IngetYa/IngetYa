import { getHierarchy, type IStackHierarchy } from "@/core/hierarchy"
import { type HistoryStateData, StateManager } from "./core/StateManager"
import { StackPrimary } from "./main/StackPrimary"
import { eroot } from "@/core/kel"
import { PagesRoot } from "./data/_PageList"

export class Stack {
  // stack saat ini (StackPrimary / StackSecondary)
  private king?: StackPrimary

  // primary / secondary
  private kingType?: string

  constructor(public manager: StateManager) {}

  // hapus king saat ini
  private async destroyKing(type: string): Promise<boolean> {
    // asalkan king tipenya beda, hapus.
    if (this.king && this.kingType !== type) {
      // tunggu sampe bersih
      await this.king.destroy()
      // kasih nilai 'true'
      return true
    }

    // kalo gaada, kasih nilai 'false'
    if (!this.king) return false

    // kalo ada, tapi sama, tetap kasih nilai 'false'
    return false
  }

  private async startPrimary(hierarchy: IStackHierarchy, _data?: HistoryStateData): Promise<void> {
    // hapus king selain 'primary'
    const hasSec = await this.destroyKing("primary")

    // cek root-nya
    const { root } = hierarchy

    // tentuin king-nya
    const kingStack = hasSec || !this.king ? new StackPrimary({ stack: this, anim: hasSec ? "stackIn2" : "stackIn1" }) : this.king!
    this.kingType = "primary"

    // render king ke html
    if (hasSec || !this.king) eroot().append(kingStack.html)

    // render data children lewat king
    await kingStack.setContent(root, hierarchy)

    // overwrite properti local king
    this.king = kingStack
  }

  // TODO: menunggu secondary siap
  private async startSecondary(_hierarchy: IStackHierarchy, _data?: HistoryStateData): Promise<void> {
    await this.destroyKing("secondary")
  }

  // update dengan kondisi state saat ini
  async update(path: string, data?: HistoryStateData): Promise<void> {
    const hierarchy = getHierarchy(path)
    const { root } = hierarchy

    // cek memory
    const rootPage = PagesRoot.find((k) => k.id === root)

    // cek apakah primary
    const isPrimary = rootPage?.group === "primary"

    // jalankan jika salah satu oke
    if (isPrimary) return await this.startPrimary(hierarchy, data)
    return await this.startSecondary(hierarchy, data)
  }
}
