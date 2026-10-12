import { ActivityType, Client } from "discord.js"
import logger from "#lib/logger"

let aliveNumber: number = 0

export default async function clientReady(client: Client, appFunc?: () => void) {
  // simpen ke memory berapa kali re-login
  aliveNumber++

  logger.success(`Bot: Logged in as ${client.user!.username} ( ${client.user!.tag} )`)

  // update profile presence dikit aowkwk
  client.user!.setPresence({
    activities: [
      {
        name: `💌 | https://IngetYa.net | [${aliveNumber}]`,
        state: `💌 | https://IngetYa.net | [${aliveNumber}]`,
        type: ActivityType.Custom,
        url: "https://IngetYa.net"
      }
    ],
    // tadinya "online", bosen, jadilah "idle"
    status: "idle"
  })

  // appfunc yang di parent
  if (appFunc) appFunc()
}
