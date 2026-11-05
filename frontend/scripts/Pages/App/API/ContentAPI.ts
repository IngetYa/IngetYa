import type { IContent } from "@/types/ServiceTypes"

export class ContentsAPI {
  private _data: IContent[] = []

  // ambil product pake id
  find(id: string): IContent | null {
    const product = this._data.find((k) => k.id === id)

    return product || null
  }

  // ambil semua
  getAll(): IContent[] {
    return this._data
  }

  // tambah products
  add(...contents: IContent[]): void {
    for (const content of contents) {
      this._data.push(content)
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
