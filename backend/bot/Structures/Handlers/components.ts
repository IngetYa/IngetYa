import logger from "#lib/logger"
import { BotClient } from "#bot/BotClient"
import Buttons from "#bot/Components/Buttons"

export default class ComponentsHandler {
  async loadButtons(client: BotClient, reloading?: boolean): Promise<void> {
    // simpen ke collections
    Buttons.forEach((buttonInteraction) => {
      client.buttons.set(buttonInteraction.customId, buttonInteraction)
    })

    // kalo bukan reload (rerun), maka bot status ditambah 1
    if (!reloading) {
      client.currentStatus++
      client.checkStatus()
    }

    setTimeout(() => logger.info("Buttons • loaded"), 500)
  }
}
