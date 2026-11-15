import type { IAny } from "@/types/LibTypes"
import waittime from "@/lib/waittime"

type SocketMessageMethod = (msg?: IAny) => void
type SocketDisconnectMethod = () => void

function socketError(_err: Event) {
  // console.error(_err)
}

export class Socket {
  private ws?: WebSocket
  private isExited: number = 0
  private _id!: string

  private messageMethods: SocketMessageMethod[] = []
  private disconnectMethods: SocketDisconnectMethod[] = []

  private messageListener?: (ev: MessageEvent) => void

  start(): void {
    this.messageListener = (data) => {
      try {
        const msg = JSON.parse(data.data.toString())

        this.messageMethods.forEach((msgHandler) => msgHandler(msg))
      } catch (_err) {
        // console.error(err)
      }
    }

    const socketProtocol = `ws${window.location.protocol === "https:" ? "s" : ""}`
    this.ws = new WebSocket(`${socketProtocol}://${window.location.host}/socket?id=${this._id}`)

    this.ws.addEventListener("error", socketError)
    this.ws.addEventListener("message", this.messageListener!)
    this.ws.addEventListener("close", () => this.onClosed(), { once: true })
  }
  destroy(): void {
    this.ws?.removeEventListener("error", socketError)
    this.ws?.removeEventListener("message", this.messageListener!)
  }
  private async reconnect(): Promise<void> {
    this.ws?.removeEventListener("error", socketError)
    this.ws?.removeEventListener("message", this.messageListener!)

    this.disconnectMethods.forEach((dcHandler) => dcHandler())
  }
  private async onClosed(): Promise<void> {
    this.ws = undefined
    await waittime()
    if (this.isExited >= 1) return
    this.reconnect()
  }

  onMessage(newFunc?: SocketMessageMethod): void {
    if (newFunc) this.messageMethods.push(newFunc)
  }

  onDisconnect(newFunc?: SocketDisconnectMethod): void {
    if (newFunc) this.disconnectMethods.push(newFunc)
  }

  setExit(newExit: number): void {
    this.isExited = newExit
  }
  close(): void {
    if (this.ws) this.ws.close()
  }
  send(type: string, obj: IAny = {}): void {
    const data = { ...obj, type }
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  get id(): string {
    return this._id
  }

  updateData(socketId: IAny): void {
    if (!socketId) {
      throw new Error("Please provide web socket id")
    }

    this._id = socketId

    this.start()
  }
}

export const socket = new Socket()
