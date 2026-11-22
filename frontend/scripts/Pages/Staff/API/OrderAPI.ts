import type { IPaginatedMeta, IOrderStaff } from "../types/EmbededAPITypes"

export class OrderAPI {
  private _data: IOrderStaff[] = []
  private _meta?: IPaginatedMeta

  private _loaded: boolean = false

  get isLoaded(): boolean {
    return this._loaded
  }

  set isLoaded(status: boolean) {
    this._loaded = status
  }

  find(id: string): IOrderStaff | null {
    const order = this._data.find((k) => k.id === id)

    return order || null
  }

  set Meta(meta: IPaginatedMeta) {
    this._meta = meta
  }

  get Meta(): IPaginatedMeta | null {
    return this._meta || null
  }

  getAll(): IOrderStaff[] {
    return this._data
  }

  set(...orders: IOrderStaff[]): void {
    this.reset()

    for (const order of orders) {
      this._data.push(order)
    }
  }

  get size(): number {
    return this._data.length
  }

  reset(): void {
    this._data.splice(0, this._data.length)
  }
}
