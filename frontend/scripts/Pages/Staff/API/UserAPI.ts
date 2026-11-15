import type { IPaginatedMeta, IUserStaff } from "../types/EmbededAPITypes"

export class UserAPI {
  private _data: IUserStaff[] = []
  private _meta?: IPaginatedMeta

  private _loaded: boolean = false

  get isLoaded(): boolean {
    return this._loaded
  }

  set isLoaded(status: boolean) {
    this._loaded = status
  }

  // ambil user pake id
  find(id: string): IUserStaff | null {
    const user = this._data.find((k) => k.id === id)

    return user || null
  }

  set Meta(meta: IPaginatedMeta) {
    this._meta = meta
  }

  get Meta(): IPaginatedMeta | null {
    return this._meta || null
  }

  // ambil semua
  getAll(): IUserStaff[] {
    return this._data
  }

  set(...users: IUserStaff[]): void {
    this.reset()

    for (const user of users) {
      this._data.push(user)
    }
  }

  // jumlah users
  get size(): number {
    return this._data.length
  }

  // hapus array
  reset(): void {
    this._data.splice(0, this._data.length)
  }
}
