import { Client, Collection, GatewayIntentBits, Partials, version } from "discord.js"
import { Button, ClientEvent, SlashCommand } from "#bot/Structures/Interfaces/interfaces"
import ComponentsHandler from "#bot/Structures/Handlers/components"
import cfg from "#cfg"
import ClientEventsHandler from "#bot/Structures/Handlers/events"
import logger from "#lib/logger"
import SlashCommandsHandler from "#bot/Structures/Handlers/slashCommands"

const { Guilds, GuildMembers, GuildMessages, GuildPresences, GuildMessageReactions, DirectMessages, MessageContent } = GatewayIntentBits

const { User, Message, GuildMember, ThreadMember, Channel, Reaction } = Partials

export class BotClient extends Client {
  private appFunc?: () => void

  slashCommands: Collection<string, SlashCommand>
  clientEvents: Collection<string, ClientEvent>
  buttons: Collection<string, Button>

  cooldowns: Collection<string, string>

  currentStatus: number

  constructor() {
    super({
      intents: [Guilds, GuildMembers, GuildMessages, GuildPresences, GuildMessageReactions, MessageContent, DirectMessages],
      partials: [User, Message, GuildMember, ThreadMember, Channel, Reaction]
    })

    this.slashCommands = new Collection()
    this.clientEvents = new Collection()
    this.buttons = new Collection()
    this.cooldowns = new Collection()

    this.currentStatus = 0
  }

  async start(appFunc?: () => void) {
    if (!cfg.APP_PRODUCTION) {
      return appFunc?.()
    }

    if (appFunc) {
      this.appFunc = appFunc
    }

    await this.registerModules()

    await this.login(cfg.DISCORD_BOT_TOKEN)
  }

  async registerModules(): Promise<void> {
    const { loadButtons } = new ComponentsHandler()
    const { loadEvents } = new ClientEventsHandler()
    const { loadSlashCommands } = new SlashCommandsHandler()

    await loadEvents(this, false, this.appFunc)
    await loadButtons(this)
    await loadSlashCommands(this)
  }

  checkStatus(): void {
    if (this.currentStatus > 4) {
      console.log("---")
      logger.success(`[BOT] Client • ready to use (v.${version})\n---`)
    }
  }
}
