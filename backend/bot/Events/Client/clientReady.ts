import { ActivityType, Client } from "discord.js"
import logger from "#lib/logger"

let aliveNumber: number = 0

export default async function clientReady(client: Client, appFunc?: () => void) {
  aliveNumber++

  logger.success(`[BOT] Logged in as ${client.user!.username} ( ${client.user!.tag} )`)

  client.user!.setPresence({
    activities: [
      {
        name: `💌 | https://IngetYa.net | [${aliveNumber}]`,
        state: `💌 | https://IngetYa.net | [${aliveNumber}]`,
        type: ActivityType.Custom,
        url: "https://IngetYa.net"
      }
    ],
    status: "idle"
  })

  if (appFunc) appFunc()
}
