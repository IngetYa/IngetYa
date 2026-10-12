import { type APIEmbed as DiscordAPIEmbed } from "discord.js"

export interface IDiscordConfig {
  prefix: string
  guild: string
  owners: string[]
  devs: string[]
  staff: string[]
}

export interface IWebhookChannels {
  clients: string
  traffics: string
  accounts: string
}

export interface APIEmbed extends DiscordAPIEmbed {
  ts?: boolean
  inspect?: boolean
}
