import type { IAny } from "@/types/LibTypes"
import { Stack } from "@/Pages/Staff/Stack"
import { getHierarchy } from "@/core/hierarchy"
import { getState } from "./HashState"
import waittime from "@/lib/waittime"
import { isValidHash } from "../data/_HashList"

export type HistoryStateData = Record<string, IAny>

export interface IHistoryState {
  path: string
  data?: HistoryStateData
}

export class StateManager {
  private queue: IHistoryState[] = []
  private isProcessing: boolean = false

  private stack!: Stack

  constructor() {
    window.onpopstate = this.handlePopState.bind(this)
  }

  private async handlePopState(event: PopStateEvent): Promise<void> {
    const state: IHistoryState | undefined = event.state

    if (state) return this.next({ path: state.path, data: { ...state.data, force: true } })

    const hash = window.location.hash
    const path = hash.length >= 1 ? hash : "#overview"

    this.next({ path, data: { force: true } })
  }

  private async addState(rawPath: string, data?: HistoryStateData): Promise<void> {
    const path = rawPath.replace("#", "")

    const curState: IHistoryState | null = history.state

    const curHierarchy = getHierarchy(curState?.path || window.location.hash)
    const nexHierarchy = getHierarchy(path)

    const usePush = getState(curHierarchy, nexHierarchy)

    const url = `#${path}`

    if (usePush === 0) {
      history.back()
    } else if (usePush === 1) {
      history.replaceState({ path: url, data }, "", url)
    } else {
      history.pushState({ path: url, data }, "", url)
    }
  }

  private async runState({ path, data }: IHistoryState): Promise<void> {
    await this.stack.update(path, data)
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true

    while (this.queue.length > 0) {
      const nextJob = this.queue.shift()

      if (nextJob) {
        await this.runState(nextJob)
        await waittime(50)
      }
    }

    this.isProcessing = false
  }

  next(state: IHistoryState, isBack?: boolean): void {
    if (isBack) {
      if (history.state?.data?.first) return

      return history.back()
    }

    if (!isValidHash(state.path)) return

    this.queue.push(state)

    if (!state.data?.force) this.addState(state.path, state.data)

    this.processQueue()
  }

  get busy(): boolean {
    return this.isProcessing
  }

  init(): void {
    const stack = new Stack(this)
    this.stack = stack

    const hash = window.location.hash
    const rawPath = hash.length >= 1 ? hash : "#overview"
    const path = isValidHash(rawPath) ? rawPath : "#overview"

    const hierarchy = getHierarchy(path)
    const { root, section } = hierarchy

    if (root === "overview" && !section) {
      history.replaceState({ path: "#overview", data: { first: true } }, "", "#overview")
      this.next({ path: "#overview", data: { first: true, force: true } })
    } else if (root !== "overview" && section) {
      history.replaceState({ path: "#overview", data: { first: true } }, "", "#overview")
      history.pushState({ path: `#${root}`, data: { first: false } }, "", `#${root}`)
      this.next({ path, data: { first: false } })
    } else {
      history.replaceState({ path: "#overview", data: { first: true } }, "", "#overview")
      this.next({ path, data: { first: false } })
    }
  }
}
