import { REST } from "@discordjs/rest"
import { RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js"
import { BotClient } from "#bot/BotClient"
import SlashCommands from "#bot/Commands/Slash/SlashCommands"
import cfg from "#cfg"
import shared from "#lib/shared"
import logger from "#lib/logger"

const { discord: config } = shared

export default class SlashCommandsHandler {
  async loadSlashCommands(client: BotClient, reloading?: boolean) {
    // kelompok-in dulu
    const CmdArray: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []

    // masukin ke kelompok
    SlashCommands.forEach((command) => {
      CmdArray.push(command.data.toJSON())
      client.slashCommands.set(command.data.name, command)
    })

    client.application?.commands.set(CmdArray)

    // lanjut daftarin command
    setREST(client, CmdArray, reloading)
  }
}

async function setREST(client: BotClient, CmdArray: RESTPostAPIChatInputApplicationCommandsJSONBody[], reloading?: boolean) {
  // auth buat daftarin command
  const rest = new REST({ version: "10" }).setToken(cfg.DISCORD_BOT_TOKEN)

  try {
    if (cfg.APP_PRODUCTION) {
      // mode prod, daftarin command discord global
      await rest.put(Routes.applicationCommands(cfg.DISCORD_CLIENT_ID), {
        body: CmdArray
      })
      logger.info(`Production mode • Slash Commands registered globally`)
    } else {
      // mode dev, daftarin command khusus guild
      await rest.put(Routes.applicationGuildCommands(cfg.DISCORD_CLIENT_ID, config.guild), {
        body: [...CmdArray]
      })
      logger.info(`Dev mode • Slash Commands registered for guild "${config.guild}"`)
    }

    // kalo bukan reload (rerun), maka bot status ditambah 1
    if (!reloading) {
      logger.info("Slash Commands • loaded")
      client.currentStatus++
      client.checkStatus()
    } else {
      return "loaded"
    }
  } catch (error) {
    console.log(error)
  }
}
