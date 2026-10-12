import logger from "#lib/logger"
import { webhook } from "#main/webhook/webhook"
import { processSocketMessages } from "#controllers/SocketController"
import { sockets } from "#main/Sockets"
import { Request } from "express"
import { WebSocket } from "ws"
import { Colors } from "discord.js"

export function startSocketApp(ws: WebSocket, req: Request) {
  // jangan kasih lewat kalo belum login
  if (!req.user || !req.user.id) {
    logger.info("❌ Connection rejected: no user ID")
    ws.close()
    return
  }

  const userId = req.user.id
  const clientId = req.query.id?.toString()

  // kalo gada client id, jangan kasih lewat juga
  if (!clientId) {
    logger.info(`❌ Connection rejected: client ${clientId} is not found`)
    ws.close()
    return
  }

  // daftarin user baru
  const registered = sockets.create(userId, clientId, ws)

  // kalo gagal, jangan kasih lewat
  if (!registered) {
    logger.info(`❌ Connection rejected: socket client ${clientId} is not valid`)
    ws.close()
    return
  }

  logger.info(`Online   ${userId} ${clientId}`)

  // kirim webhook kalo user berhasil online
  webhook("clients", {
    description: `Id ${userId} Online`,
    color: Colors.Green
  })
  // kasih status isAlive
  ws.isAlive = true

  // kalo user kirim pesan socket
  ws.on("message", (data) => {
    try {
      // cek valid enggaknya
      const msg = JSON.parse(data.toString())

      // coba kirim ke penanganan pesan socket
      processSocketMessages({ ...msg, clientId, userId })
    } catch (err) {
      console.error("Failed to parse JSON.", err)
    }
  })

  ws.on("close", () => {
    // kalo socketnya putus, hapus dari daftar tersimpan
    sockets.delete(clientId)

    logger.info(`Offline  ${userId} ${clientId}`)

    // kirim webhook kalo user sudah offline
    webhook("clients", {
      description: `Id ${userId} Offline`,
      color: Colors.Red
    })
  })

  ws.on("error", (err: Error) => {
    // kalo socketnya error, matiin isAlive-nya
    ws.isAlive = false
    console.error(err)
  })

  ws.on("pong", () => {
    // selama heartbeat berhasil dibalas, isAlive harus nyala terus
    ws.isAlive = true
  })
}
