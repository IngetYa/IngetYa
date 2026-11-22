import type { IPaginatedMeta, IBillStaff } from "../types/EmbededAPITypes"

export class BillAPI {
  private _data: IBillStaff[] = []
  private _meta?: IPaginatedMeta

  private _loaded: boolean = false

  get isLoaded(): boolean {
    return this._loaded
  }

  set isLoaded(status: boolean) {
    this._loaded = status
  }

  find(orderId: string): IBillStaff | null {
    const bill = this._data.find((k) => k.orderId === orderId)

    return bill || null
  }

  set Meta(meta: IPaginatedMeta) {
    this._meta = meta
  }

  get Meta(): IPaginatedMeta | null {
    return this._meta || null
  }

  getAll(): IBillStaff[] {
    return this._data
  }

  set(...bills: IBillStaff[]): void {
    this.reset()

    for (const bill of bills) {
      this._data.push(bill)
    }
  }

  get size(): number {
    return this._data.length
  }

  reset(): void {
    this._data.splice(0, this._data.length)
  }
}
