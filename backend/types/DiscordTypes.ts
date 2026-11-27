import { type APIEmbed as DiscordAPIEmbed } from "discord.js"

export interface IDiscordConfig {
  prefix: string
  guild: string
  owners: string[]
  devs: string[]
  staff: string[]
}

export interface IWebhookChannels {
  core_gitwebhook: string
  core_error: string
  core_transcripts: string
  service_clients: string
  service_products: string
  service_orders: string
  service_bills: string
  service_balance: string
  service_accounts: string
  gate_visitors: string
  messaging_category: string
  help_category: string
}

export interface APIEmbed extends DiscordAPIEmbed {
  ts?: boolean
  inspect?: boolean
}

export interface IWhatsAppConfig {
  phone_number: string
  username: string
  command: string
}
