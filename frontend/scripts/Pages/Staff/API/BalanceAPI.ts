import type { IBalance } from "../types/EmbededAPITypes"

export class BalanceAPI {
  private _data: IBalance[] = []

  private _loaded: boolean = false

  get isLoaded(): boolean {
    return this._loaded
  }

  set isLoaded(status: boolean) {
    this._loaded = status
  }

  findIncome(type: "last" | "first" = "first"): IBalance {
    return this._data.filter((k) => k.type === "income").sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[type === "first" ? 0 : 1]
  }

  findExpense(type: "last" | "first" = "first"): IBalance {
    return this._data.filter((k) => k.type === "expense").sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[type === "first" ? 0 : 1]
  }

  get currentBalance(): number {
    const balance = this._data.find((k) => k.type === "none" && k.group === "first")
    return balance?.amount || 0
  }

  // ambil semua
  getAll(): IBalance[] {
    return this._data
  }

  // tambah balances
  add(...balances: IBalance[]): void {
    for (const balance of balances) {
      this._data.push(balance)
    }
  }

  update(...balances: IBalance[]): void {
    for (const balance of balances) {
      const idx = this._data.findIndex((data) => data.group === balance.group && data.type === balance.type)

      if (idx === -1) {
        this.add(balance)
      } else {
        this._data[idx].amount = balance.amount
      }
    }
  }

  // jumlah balances
  get size(): number {
    return this._data.length
  }

  // hapus array
  reset(): void {
    this._data.splice(0, this._data.length)
  }
}
