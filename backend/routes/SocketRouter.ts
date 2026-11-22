import logger from "#lib/logger"
import { webhook } from "#main/webhook/webhook"
import { processSocketMessages } from "#controllers/SocketController"
import { sockets } from "#main/Sockets"
import { Request } from "express"
import { WebSocket } from "ws"
import { Colors } from "discord.js"

export function startSocketApp(ws: WebSocket, req: Request) {
  if (!req.user || !req.user.id) {
    logger.info("❌ Connection rejected: no user ID")
    ws.close()
    return
  }

  const userId = req.user.id
  const clientId = req.query.id?.toString()

  if (!clientId) {
    logger.info(`❌ Connection rejected: client ${clientId} is not found`)
    ws.close()
    return
  }

  const registered = sockets.create(userId, clientId, ws)

  if (!registered) {
    logger.info(`❌ Connection rejected: socket client ${clientId} is not valid`)
    ws.close()
    return
  }

  logger.info(`Online   ${userId} ${clientId}`)

  webhook("clients", {
    description: `Id ${userId} Online`,
    color: Colors.Green
  })
  ws.isAlive = true

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString())

      processSocketMessages({ ...msg, clientId, userId })
    } catch (err) {
      logger.error("Failed to parse JSON.")
      logger.error(err)
    }
  })

  ws.on("close", () => {
    sockets.delete(clientId)

    logger.info(`Offline  ${userId} ${clientId}`)

    webhook("clients", {
      description: `Id ${userId} Offline`,
      color: Colors.Red
    })
  })

  ws.on("error", (err: Error) => {
    ws.isAlive = false
    logger.error(err)
  })

  ws.on("pong", () => {
    ws.isAlive = true
  })
}
