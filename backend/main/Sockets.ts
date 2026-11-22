import { WebSocket } from "ws"
import { genhex } from "#lib/gen"
import { ISocketClient, ISocketUser, IZender } from "#types/SocketClientTypes"

export class Sockets {
  private clients: ISocketClient[] = []
  private users: ISocketUser[] = []

  save(uid: string): string {
    const clientId = genhex(4)

    this.users.push({ id: uid, clientId })

    return clientId
  }

  get(clientId: string): ISocketClient | undefined {
    const client = this.clients.find((k) => k.id === clientId)

    return client
  }

  getByUser(uid: string): ISocketClient[] | undefined {
    const clients = this.clients.filter((k) => k.userId === uid)

    if (clients.length < 1) return undefined

    return clients
  }

  send(uid: string, msg: IZender): void {
    const clients = this.getByUser(uid)

    if (!clients) return

    clients.forEach((k) => k.socket.send(JSON.stringify(msg)))
  }

  create(uid: string, clientId: string, socket: WebSocket): ISocketClient | undefined {
    const user = this.users.findIndex((usr) => usr.id === uid && usr.clientId === clientId)

    if (user === -1) return undefined

    this.users.splice(user, 1)

    const client: ISocketClient = {
      id: clientId,
      userId: uid,
      socket
    }

    this.clients.push(client)

    return client
  }

  delete(clientId: string): boolean {
    const client = this.clients.findIndex((usr) => usr.id === clientId)

    if (client === -1) return false

    this.clients.splice(client, 1)

    return true
  }
}

export const sockets = new Sockets()
