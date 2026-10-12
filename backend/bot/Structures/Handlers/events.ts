import logger from "#lib/logger"
import { BotClient } from "#bot/BotClient"
import buttonInteraction from "#bot/Events/Client/buttonInteraction"
import clientReady from "#bot/Events/Client/clientReady"
import slashCmdInteraction from "#bot/Events/Client/slashCmdInteraction"

export default class ClientEventsHandler {
  public async loadEvents(client: BotClient, reloading?: boolean, appFunc?: () => void) {
    // cek berulang, barangkali botnya sempet macet/mati/reauthentication
    // sebelumnya pake .once, tapi sekarang butuh tiap kali re-login
    client.on("clientReady", (bot) => clientReady(bot, appFunc))

    // deteksi interaction (buttons, slash commands)
    client.on("interactionCreate", (interaction) => {
      if (interaction.isButton()) {
        buttonInteraction(interaction, client)
      }
      if (interaction.isChatInputCommand()) {
        slashCmdInteraction(interaction, client)
      }
    })

    // kalo bukan reload (rerun), maka bot status ditambah 1
    if (!reloading) {
      setTimeout(() => {
        logger.info("Client Events • loaded")
        client.currentStatus++
        client.checkStatus()
      }, 1000)
    }
  }
}
