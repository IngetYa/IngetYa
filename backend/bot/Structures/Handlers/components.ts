import logger from "#lib/logger"
import { BotClient } from "#bot/BotClient"
import Buttons from "#bot/Components/Buttons"

export default class ComponentsHandler {
  async loadButtons(client: BotClient, reloading?: boolean): Promise<void> {
    Buttons.forEach((buttonInteraction) => {
      client.buttons.set(buttonInteraction.customId, buttonInteraction)
    })

    if (!reloading) {
      client.currentStatus++
      client.checkStatus()
    }

    setTimeout(() => logger.info("[BOT] Buttons >> loaded"), 500)
  }
}
