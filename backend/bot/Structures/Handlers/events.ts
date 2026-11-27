import logger from "#lib/logger"
import { BotClient } from "#bot/BotClient"
import buttonInteraction from "#bot/Events/Client/buttonInteraction"
import clientReady from "#bot/Events/Client/clientReady"
import slashCmdInteraction from "#bot/Events/Client/slashCmdInteraction"

export default class ClientEventsHandler {
  public async loadEvents(client: BotClient, reloading?: boolean, appFunc?: () => void) {
    client.on("clientReady", (bot) => clientReady(bot, appFunc))

    client.on("interactionCreate", (interaction) => {
      if (interaction.isButton()) {
        buttonInteraction(interaction, client)
      }
      if (interaction.isChatInputCommand()) {
        slashCmdInteraction(interaction, client)
      }
    })

    if (!reloading) {
      setTimeout(() => {
        logger.info("[BOT] Client Events >> loaded")
        client.currentStatus++
        client.checkStatus()
      }, 1000)
    }
  }
}
