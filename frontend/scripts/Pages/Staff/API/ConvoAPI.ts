import type { IPaginatedMeta } from "../types/EmbededAPITypes"
import type { IConvo } from "@/types/ServiceTypes"

export class ConvoAPI {
  private _data: IConvo[] = []
  private _meta?: IPaginatedMeta

  private _loaded: boolean = false

  get isLoaded(): boolean {
    return this._loaded
  }

  set isLoaded(status: boolean) {
    this._loaded = status
  }

  // ambil convo pake id
  find(id: string): IConvo | null {
    const convo = this._data.find((k) => k.id === id)

    return convo || null
  }

  set Meta(meta: IPaginatedMeta) {
    this._meta = meta
  }

  get Meta(): IPaginatedMeta | null {
    return this._meta || null
  }

  private sortData(data: IConvo[]): IConvo[] {
    return data.sort((a, b) => {
      const timeA = new Date(a.lastMessage.createdAt).getTime()
      const timeB = new Date(b.lastMessage.createdAt).getTime()
      return timeB - timeA
    })
  }

  // ambil semua
  getAll(): IConvo[] {
    return this.sortData(this._data)
  }

  update(...rawRooms: IConvo[]): string[] {
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

  set(...rooms: IConvo[]): void {
    this.reset()

    for (const room of rooms) {
      this._data.push(room)
    }
  }

  // jumlah rooms
  get size(): number {
    return this._data.length
  }

  // hapus array
  reset(): void {
    this._data.splice(0, this._data.length)
  }
}
