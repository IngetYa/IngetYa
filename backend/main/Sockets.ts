import { WebSocket } from "ws"
import { genhex } from "#lib/gen"
import { ISocketClient, ISocketUser, IZender } from "#types/SocketClientTypes"

export class Sockets {
  private clients: ISocketClient[] = []
  private users: ISocketUser[] = []

  save(uid: string): string {
    // bikin unique client id baru
    const clientId = genhex(4)

    // simpen id user yang terhubung dengan client id tersebut.
    this.users.push({ id: uid, clientId })

    // kirim client id tersebut in case dibutuhin.
    return clientId
  }

  get(clientId: string): ISocketClient | undefined {
    // cari client dengan client id yg sesuai
    const client = this.clients.find((k) => k.id === clientId)

    // kirim clientnya
    return client
  }

  getByUser(uid: string): ISocketClient[] | undefined {
    // cari dari daftar clients dengan id user terkait
    const clients = this.clients.filter((k) => k.userId === uid)

    // kalo arraynya kurang dari satu, anggap ga ada, maka kirim undefined
    if (clients.length < 1) return undefined

    // kirim semua client tadi
    return clients
  }

  send(uid: string, msg: IZender): void {
    // cari daftar client
    const clients = this.getByUser(uid)

    // kalo gada, yaudah biarin aja
    if (!clients) return

    // kirim pesan ke semua client terkait
    clients.forEach((k) => k.socket.send(JSON.stringify(msg)))
  }

  create(uid: string, clientId: string, socket: WebSocket): ISocketClient | undefined {
    // cari index user tersimpan berdasarkan user id dan client id
    const user = this.users.findIndex((usr) => usr.id === uid && usr.clientId === clientId)

    // kalo gaada, jangan dilanjut
    if (user === -1) return undefined

    // kalo ada, hapus dari array `users`
    this.users.splice(user, 1)

    // bikin client baru
    const client: ISocketClient = {
      id: clientId,
      userId: uid,
      socket
    }

    // sisipin ke daftar client
    this.clients.push(client)

    return client
  }

  delete(clientId: string): boolean {
    // cari index client tersimpan berdasarkan client id
    const client = this.clients.findIndex((usr) => usr.id === clientId)

    // kalo ga ketemu, kirim false, in case diolah lagi
    if (client === -1) return false

    // hapus dari array `clients`
    this.clients.splice(client, 1)

    // kirim true, in case diolah lagi
    return true
  }
}

export const sockets = new Sockets()
