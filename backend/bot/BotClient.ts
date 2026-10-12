import { Client, Collection, GatewayIntentBits, Partials, version } from "discord.js"
import { Button, ClientEvent, SlashCommand } from "#bot/Structures/Interfaces/interfaces"
import ComponentsHandler from "#bot/Structures/Handlers/components"
import cfg from "#cfg"
import ClientEventsHandler from "#bot/Structures/Handlers/events"
import logger from "#lib/logger"
import SlashCommandsHandler from "#bot/Structures/Handlers/slashCommands"

// template buat extends constructor discord js
const { Guilds, GuildMembers, GuildMessages, GuildPresences, GuildMessageReactions, DirectMessages, MessageContent } = GatewayIntentBits

// template buat extends constructor discord js
const { User, Message, GuildMember, ThreadMember, Channel, Reaction } = Partials

export class BotClient extends Client {
  // sekali jalan, setelah state bot selesai
  private appFunc?: () => void

  // semua components simpen di memory
  slashCommands: Collection<string, SlashCommand>
  clientEvents: Collection<string, ClientEvent>
  buttons: Collection<string, Button>

  // cooldown ala-ala, sebenernya berat, tapi semoga ga kebanyakan yg pake commands barengan
  cooldowns: Collection<string, string>

  // offline/online n: koneksi server ke bot + registrar module
  currentStatus: number

  constructor() {
    super({
      intents: [Guilds, GuildMembers, GuildMessages, GuildPresences, GuildMessageReactions, MessageContent, DirectMessages],
      partials: [User, Message, GuildMember, ThreadMember, Channel, Reaction]
    })

    // collections kosongin dulu semua pas startup
    this.slashCommands = new Collection()
    this.clientEvents = new Collection()
    this.buttons = new Collection()
    this.cooldowns = new Collection()

    // startup jelas masih offline
    this.currentStatus = 0
  }

  async start(appFunc?: () => void) {
    // gausah dilanjut kalo mode dev
    if (!cfg.APP_PRODUCTION) {
      return appFunc?.()
    }

    // simpen next func buat dijalanin kalo bot berhasil online
    if (appFunc) {
      this.appFunc = appFunc
    }

    // selesaikan semua components dan commands registration
    await this.registerModules()

    // setelah terdaftar, coba login pake bot
    await this.login(cfg.DISCORD_BOT_TOKEN)
  }

  async registerModules(): Promise<void> {
    // sementara baru ada 3 modules
    const { loadButtons } = new ComponentsHandler()
    const { loadEvents } = new ClientEventsHandler()
    const { loadSlashCommands } = new SlashCommandsHandler()

    // sebelumnya dihandle pake send text message dan log di console
    // const { handleErrors } = new ClientErrorHandler()

    // paksa load semua!!!
    // kalo error, langsung process.exit(n)
    await loadEvents(this, false, this.appFunc)
    await loadButtons(this)
    await loadSlashCommands(this)
  }

  checkStatus(): void {
    // registrar module minimal 5, maka dianggap udah online
    if (this.currentStatus > 4) {
      console.log("---")
      logger.success(`Client • ready to use (v.${version})\n---`)
    }
  }
}
