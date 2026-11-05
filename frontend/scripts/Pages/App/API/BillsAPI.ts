import type { IBill } from "@/types/ServiceTypes"

export class BillsAPI {
  private _data: IBill[] = []

  // ambil product pake id
  find(id: string): IBill | null {
    const product = this._data.find((k) => k.orderId === id)

    return product || null
  }

  // ambil semua
  getAll(): IBill[] {
    return this._data
  }

  // tambah products
  add(...bills: IBill[]): void {
    for (const bill of bills) {
      this._data.push(bill)
    }
  }

  // jumlah products
  get size(): number {
    return this._data.length
  }

  // hapus array
  reset(): void {
    this._data.splice(0, this._data.length)
  }
}
