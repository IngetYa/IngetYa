import type { IBill } from "@/types/ServiceTypes"

export class BillsAPI {
  private _data: IBill[] = []

  private _loaded: boolean = false

  get isLoaded(): boolean {
    return this._loaded
  }

  set isLoaded(status: boolean) {
    this._loaded = status
  }

  find(id: string): IBill | null {
    const product = this._data.find((k) => k.orderId === id)

    return product || null
  }

  getAll(): IBill[] {
    return this._data
  }

  add(...bills: IBill[]): void {
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
