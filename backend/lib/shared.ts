import fs from "fs"
import { IDiscordConfig, IWebhookChannels, IWhatsAppConfig } from "#types/DiscordTypes"

const discord = JSON.parse(fs.readFileSync("./config/discord.json", "utf-8")) as IDiscordConfig

const webhookChannel = JSON.parse(fs.readFileSync("./config/webhook.json", "utf-8")) as IWebhookChannels

const waConfig = JSON.parse(fs.readFileSync("./config/whatsapp.json", "utf-8")) as IWhatsAppConfig

// biar bisa dibaca sebagai types
export default { discord, webhookChannel, waConfig }
