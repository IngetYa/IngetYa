import bot from "#core/bot"
import waittime from "#core/waittime"
import { isProd } from "#lib/gen"
import logger from "#lib/logger"
import shared from "#lib/shared"
import { APIEmbed } from "#types/DiscordTypes"
import { IAny } from "#types/LibTypes"
import { ChannelType, Message, MessageCreateOptions } from "discord.js"
import { createEmbeds } from "./embeds"

type IChannelID = keyof typeof shared.webhookChannel | ({} & string)
type OnSent = (message?: Message<true>) => void

interface QueueItem {
  channelKey: IChannelID
  message: APIEmbed
  onSent?: OnSent
}

const queue: QueueItem[] = []
let isProcessing: boolean = false

async function processWebhook({ channelKey, message, onSent }: QueueItem): Promise<void> {
  try {
    // in case mode dev atau bot offline
    if (bot.ws.status !== 0) {
      logger.info("[WEBHOOK]: discord bot (app) is not started")
      return onSent?.()
    }

    const channel = isProd ? channelKey : "dev"

    // message supressor, pecah kalo text kepanjangan
    const embeds: APIEmbed[] = createEmbeds(message)

    const messageData: MessageCreateOptions = { embeds }

    const textChannel = bot.channels.cache.get(shared.webhookChannel[channel as keyof typeof shared.webhookChannel] || channel)

    if (textChannel && textChannel.type === ChannelType.GuildText) {
      const msg = await textChannel.send(messageData)

      return onSent?.(msg)
    }

    return onSent?.()
  } catch (err) {
    logger.error(err)
    return onSent?.()
  }
}

async function processQueue(): Promise<void> {
  if (isProcessing) return

  isProcessing = true

  while (queue.length > 0) {
    const nextJob = queue.shift()

    if (nextJob) {
      await processWebhook(nextJob)
      await waittime(150)
    }
  }

  isProcessing = false
}

export async function webhook(channelKey: IChannelID, message: APIEmbed, onSent?: OnSent): Promise<IAny> {
  queue.push({ channelKey, message, onSent })

  processQueue()
}
