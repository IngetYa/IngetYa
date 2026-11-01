import type { IAny } from "@/types/LibTypes"
import { Stack } from "@/Pages/App/Stack"
import { getHierarchy } from "@/core/hierarchy"
import { getState } from "./HashState"
import waittime from "@/lib/waittime"

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
    // init listener buat history state
    window.onpopstate = this.handlePopState.bind(this)
  }

  private async handlePopState(event: PopStateEvent): Promise<void> {
    const state: IHistoryState | undefined = event.state

    // kalo state-nya ga kosongan, langsung jalanin
    if (state) return this.next({ path: state.path, data: { ...state.data, force: true } })

    // ambil dari hash url
    const hash = window.location.hash
    const path = hash.length >= 1 ? hash : "#explore"

    this.next({ path, data: { force: true } })
  }

  private async addState(rawPath: string, data?: HistoryStateData): Promise<void> {
    // bersihin dari karakter hash (#)
    const path = rawPath.replace("#", "")

    // cari state yg udah ada
    const curState: IHistoryState | null = history.state

    // kelompokkan > ["root", "section", "sub"]
    const curHierarchy = getHierarchy(curState?.path || window.location.hash)
    const nexHierarchy = getHierarchy(path)

    // tentuin forward / back / replace
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
    // langsung update stack-nya
    await this.stack.update(path, data)
  }

  private async processQueue(): Promise<void> {
    // kalo proses berjalan, berarti gausah dilanjut
    if (this.isProcessing) return

    // bikin state proses kebaca lagi berjalan
    this.isProcessing = true

    // loop queue sampai 0
    while (this.queue.length > 0) {
      // kalo masih ada, ambil dan buang yang pertama dari queue
      const nextJob = this.queue.shift()

      // kalo yg diambil oke, jalanin jobnya
      if (nextJob) {
        await this.runState(nextJob)
        await waittime(50)
      }
    }

    // setelah 0, buat state proses-nya kebaca lagi diem
    this.isProcessing = false
  }

  next(state: IHistoryState, isBack?: boolean): void {
    // kalo dipaksa kembali, cek kondisi saat ini
    if (isBack) {
      // kalo kondisi saat ini adalah root history, jangan mundur lagi
      if (history.state?.data?.first) return

      // mundur 1 history state
      return history.back()
    }

    // masukin jobnya ke queue
    this.queue.push(state)

    // kalo ga ada properti 'force', masukin ke history state
    if (!state.data?.force) this.addState(state.path, state.data)

    // jalankan pemrosesan queue
    this.processQueue()
  }

  init(): void {
    // bikin stack baru
    const stack = new Stack(this)
    this.stack = stack

    // ambil hash di url
    const hash = window.location.hash
    const path = hash.length >= 1 ? hash : "#explore"

    // BUAT EXPLORE JADI ROOT HISTORY STATE

    // kalo bukan explore, berarti bikin jadi explore
    if (hash !== "#explore") {
      // jadiin hash-nya jadi nomor 2
      history.replaceState({ path: "#explore", data: { first: true } }, "", "#explore")
      this.next({ path, data: { first: false } })
    } else {
      // paksa jalanin handlernya (biar function ditrigger)
      history.replaceState({ path: "#explore", data: { first: true } }, "", "#explore")
      this.next({ path, data: { first: true, force: true } })
    }
  }
}
