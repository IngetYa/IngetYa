import type { IMessageStaff, IHistoryPaginatedMeta } from "../types/EmbededAPITypes"

export class MessageAPI {
  private _data: IMessageStaff[] = []
  private _meta?: IHistoryPaginatedMeta

  private _loaded: boolean = false

  get isLoaded(): boolean {
    return this._loaded
  }

  set isLoaded(status: boolean) {
    this._loaded = status
  }

  find(id: string): IMessageStaff | null {
    const message = this._data.find((k) => k.id === id)

    return message || null
  }

  set Meta(meta: IHistoryPaginatedMeta) {
    this._meta = meta
  }

  get Meta(): IHistoryPaginatedMeta | null {
    return this._meta || null
  }

  private sortData(data: IMessageStaff[]): IMessageStaff[] {
    return data.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return timeB - timeA
    })
  }

  getAll(): IMessageStaff[] {
    return this.sortData(this._data)
  }

  update(...rawRooms: IMessageStaff[]): string[] {
    const rooms = this.sortData(rawRooms)

    for (const room of rooms) {
      const roomIdx = this._data.findIndex((r) => r.id === room.id)

      if (roomIdx === -1) {
        this._data.push(room)
      } else {
        Object.assign(this._data[roomIdx], room)
      }
    }

    return rooms.map((k) => k.id)
  }

  set(...rooms: IMessageStaff[]): void {
    this.reset()

    for (const room of rooms) {
      this._data.push(room)
    }
  }

  get size(): number {
    return this._data.length
  }

  reset(): void {
    this._data.splice(0, this._data.length)
    this._loaded = false
  }
}
