import type { IContent } from "@/types/ServiceTypes"

export class ContentsAPI {
  private _data: IContent[] = []

  private _loaded: boolean = false

  get isLoaded(): boolean {
    return this._loaded
  }

  set isLoaded(status: boolean) {
    this._loaded = status
  }

  find(id: string): IContent | null {
    const product = this._data.find((k) => k.id === id)

    return product || null
  }

  getAll(): IContent[] {
    return this._data
  }

  add(...contents: IContent[]): void {
    for (const content of contents) {
      this._data.push(content)
    }
  }

  get size(): number {
    return this._data.length
  }

  reset(): void {
    this._data.splice(0, this._data.length)
  }
}
