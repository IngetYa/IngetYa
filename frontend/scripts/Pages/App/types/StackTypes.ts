import { type IStackHierarchy } from "@/core/hierarchy"
import { StateManager } from "@/Pages/App/core/StateManager"
import { StackPrimary } from "@/Pages/App/main/StackPrimary"

export interface IPrimary {
  destroy(anim?: string): Promise<void> | void
  html: HTMLDivElement
  handleHistory(hierarchy: IStackHierarchy): Promise<void>
}

export interface IPrimaryConfig {
  anim?: string
  king: StackPrimary
  manager: StateManager
}
