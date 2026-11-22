import type { IOverview } from "../types/EmbededAPITypes"

export class OverviewAPI {
  private _data: IOverview[] = []

  private _loaded: boolean = false

  get isLoaded(): boolean {
    return this._loaded
  }

  set isLoaded(status: boolean) {
    this._loaded = status
  }

  find(id: string): IOverview | null {
    const overview = this._data.find((k) => k.id === id)

    return overview || null
  }

  getAll(): IOverview[] {
    return this._data
  }

  add(...overviews: IOverview[]): void {
    for (const overview of overviews) {
      this._data.push(overview)
    }
  }

  update(...overviews: IOverview[]): void {
    for (const overview of overviews) {
      const idx = this._data.findIndex((data) => data.id === overview.id)

      if (idx === -1) {
        this.add(overview)
      } else {
        this._data[idx].value = overview.value
      }
    }
  }

  get size(): number {
    return this._data.length
  }

  reset(): void {
    this._data.splice(0, this._data.length)
  }
}
