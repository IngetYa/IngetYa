import type { IMessage } from "@/types/ServiceTypes"

export interface IMessageUser extends IMessage {
  userName: string
  isSent?: boolean
}

export interface IMessagePaginatedMeta {
  nextCursor: string | null
  hasOlderMessages: boolean
}

export interface IMessagePaginatedResult<T> {
  data: T[]
  meta: IMessagePaginatedMeta
}

export class MessageAPI {
  private _data: IMessageUser[] = []
  private _meta?: IMessagePaginatedMeta

  private _loaded: boolean = false

  get isLoaded(): boolean {
    return this._loaded
  }

  set isLoaded(status: boolean) {
    this._loaded = status
  }

  find(id: string): IMessageUser | null {
    const message = this._data.find((k) => k.id === id)

    return message || null
  }

  set Meta(meta: IMessagePaginatedMeta) {
    this._meta = meta
  }

  get Meta(): IMessagePaginatedMeta | null {
    return this._meta || null
  }

  private sortData(data: IMessageUser[]): IMessageUser[] {
    return data.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return timeA - timeB
    })
  }

  getAll(): IMessageUser[] {
    return this.sortData(this._data)
  }

  update(...rawMessages: IMessageUser[]): string[] {
    const messages = this.sortData(rawMessages)

    for (const msg of messages) {
      const msgIdx = this._data.findIndex((r) => r.id === msg.id)

      if (msgIdx === -1) {
        this._data.push(msg)
      } else {
        Object.assign(this._data[msgIdx], msg)
      }
    }

    return messages.map((k) => k.id)
  }

  set(...messages: IMessageUser[]): void {
    this.reset()

    for (const msg of messages) {
      this._data.push(msg)
    }
  }

  get size(): number {
    return this._data.length
  }

  reset(): void {
    this._loaded = false
    this._data.splice(0, this._data.length)
  }
}
