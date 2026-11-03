import type { IProduct, IProductCategories } from "@/types/ServiceTypes"

export class ProductsAPI {
  private _data: IProduct[] = []

  // ambil product pake id
  find(id: string): IProduct | null {
    const product = this._data.find((k) => k.id === id)

    return product || null
  }

  // ambil semua
  getAll(): IProduct[] {
    return this._data
  }

  // tambah products
  add(...products: IProduct[]): void {
    for (const product of products) {
      this._data.push(product)
    }
  }

  // ambil semua kategori
  getCategories(): IProductCategories[] {
    const rawCategories = this._data.map((itm) => itm.categories || [])

    const counts = new Map<string, number>()

    for (const group of rawCategories) {
      for (const key of group) {
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }

    // buat nama kategori plus jumlah item yg kategorinya sama
    const result = [...counts].map(([text, count]) => ({ text, count }))

    return result
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
