import type { IPaginatedMeta, ITransaction } from "../types/EmbededAPITypes"

export class TransactionAPI {
  private _data: ITransaction[] = []
  private _meta?: IPaginatedMeta

  // ambil transaction pake id
  find(id: string): ITransaction | null {
    const transaction = this._data.find((k) => k.id === id)

    return transaction || null
  }

  set Meta(meta: IPaginatedMeta) {
    this._meta = meta
  }

  get Meta(): IPaginatedMeta | null {
    return this._meta || null
  }

  // ambil semua
  getAll(): ITransaction[] {
    return this._data
  }

  set(...transactions: ITransaction[]): void {
    this.reset()

    for (const transaction of transactions) {
      this._data.push(transaction)
    }
  }

  // jumlah transactions
  get size(): number {
    return this._data.length
  }

  // hapus array
  reset(): void {
    this._data.splice(0, this._data.length)
  }
}
