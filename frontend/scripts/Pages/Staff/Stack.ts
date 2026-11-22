import { getHierarchy, type IStackHierarchy } from "@/core/hierarchy"
import { type HistoryStateData, StateManager } from "./core/StateManager"
import { StackPrimary } from "./main/StackPrimary"
import { eroot } from "@/core/kel"
import { PagesRoot } from "./data/_PageList"

export class Stack {
  private king?: StackPrimary

  private kingType?: string

  constructor(public manager: StateManager) {}

  private async destroyKing(type: string): Promise<boolean> {
    if (this.king && this.kingType !== type) {
      await this.king.destroy()
      return true
    }

    if (!this.king) return false

    return false
  }

  private async startPrimary(hierarchy: IStackHierarchy, _data?: HistoryStateData): Promise<void> {
    const hasSec = await this.destroyKing("primary")

    const { root } = hierarchy

    const kingStack = hasSec || !this.king ? new StackPrimary({ stack: this, anim: hasSec ? "stackIn2" : "stackIn1" }) : this.king!
    this.kingType = "primary"

    if (hasSec || !this.king) eroot().append(kingStack.html)

    await kingStack.setContent(root, hierarchy)

    this.king = kingStack
  }

  private async startSecondary(_hierarchy: IStackHierarchy, _data?: HistoryStateData): Promise<void> {
    await this.destroyKing("secondary")
  }

  async update(path: string, data?: HistoryStateData): Promise<void> {
    const hierarchy = getHierarchy(path)
    const { root } = hierarchy

    const rootPage = PagesRoot.find((k) => k.id === root)

    const isPrimary = rootPage?.group === "primary"

    if (isPrimary) return await this.startPrimary(hierarchy, data)
    return await this.startSecondary(hierarchy, data)
  }
}
