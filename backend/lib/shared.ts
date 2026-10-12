import fs from "fs"
import { IDiscordConfig, IWebhookChannels } from "#types/DiscordTypes"

const discord = JSON.parse(fs.readFileSync("./config/discord.json", "utf-8")) as IDiscordConfig

const webhookChannel = JSON.parse(fs.readFileSync("./config/webhook.json", "utf-8")) as IWebhookChannels

// biar bisa dibaca sebagai types
export default { discord, webhookChannel }
