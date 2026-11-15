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

  // ambil overview pake id
  find(id: string): IOverview | null {
    const overview = this._data.find((k) => k.id === id)

    return overview || null
  }

  // ambil semua
  getAll(): IOverview[] {
    return this._data
  }

  // tambah overviews
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

  // jumlah overviews
  get size(): number {
    return this._data.length
  }

  // hapus array
  reset(): void {
    this._data.splice(0, this._data.length)
  }
}
