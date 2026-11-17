type SizeType = "wide" | "narrow"

type ResizeCallback = (sizeType: SizeType) => unknown

class ResizeHandler {
  private _listenerData: Record<string, () => void> = {}
  private _latestSizeData: Record<string, SizeType> = {}

  start(id: string, lowLimit: number, resizeCallback: ResizeCallback): void {
    const decideSize = () => {
      const windowSize: SizeType = window.innerWidth < lowLimit ? "narrow" : "wide"

      const oldData = this._latestSizeData[id]

      if (windowSize === oldData) return

      this._latestSizeData[id] = windowSize
      resizeCallback(windowSize)
    }

    const initialSize = window.innerWidth < lowLimit ? "narrow" : "wide"

    this._latestSizeData[id] = initialSize
    this._listenerData[id] = decideSize

    resizeCallback(initialSize)
    window.addEventListener("resize", this._listenerData[id])
  }

  stop(id: string): void {
    window.removeEventListener("resize", this._listenerData[id])
  }
}

export const resizeHandler = new ResizeHandler()
