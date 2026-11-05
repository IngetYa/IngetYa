import type { IOrder } from "@/types/ServiceTypes"

export class OrdersAPI {
  private _data: IOrder[] = []

  // ambil order pake id
  find(id: string): IOrder | null {
    const order = this._data.find((k) => k.id === id)

    return order || null
  }

  getPaymentId(id: string): string | null {
    const data = this._data.find((k) => k.id === id)

    return data?.paymentId || null
  }

  // ambil semua
  getAll(): IOrder[] {
    return this._data
  }

  // tambah orders
  add(...orders: IOrder[]): void {
    for (const order of orders) {
      this._data.push(order)
    }
  }

  // jumlah orders
  get size(): number {
    return this._data.length
  }

  // hapus array
  reset(): void {
    this._data.splice(0, this._data.length)
  }
}
