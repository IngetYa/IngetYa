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

  getAll(): IUserStaff[] {
    return this._data
  }

  set(...users: IUserStaff[]): void {
    this.reset()

    for (const user of users) {
      this._data.push(user)
    }
  }

  get size(): number {
    return this._data.length
  }

  reset(): void {
    this._data.splice(0, this._data.length)
  }
}
