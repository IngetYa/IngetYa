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

// send webhook
async function processWebhook({ channelKey, message, onSent }: QueueItem): Promise<void> {
  try {
    // in case mode dev atau bot offline
    if (bot.ws.status !== 0) {
      logger.info("[WEBHOOK]: discord bot (app) is not started")
      return onSent?.()
    }

    // lempar ke dev kalo lagi dev :v
    const channel = isProd ? channelKey : "dev"

    // message supressor, pecah kalo text kepanjangan
    const embeds: APIEmbed[] = createEmbeds(message)

    const messageData: MessageCreateOptions = { embeds }

    // cari text channel terkait
    const textChannel = bot.channels.cache.get(shared.webhookChannel[channel as keyof typeof shared.webhookChannel] || channel)

    // pastiin tipenya "text", terus kirim.
    if (textChannel && textChannel.type === ChannelType.GuildText) {
      const msg = await textChannel.send(messageData)

      // callback object messagenya kalo bebrhasil terkirim
      return onSent?.(msg)
    }

    // callback kosongan kalo pesan ga terkirim ke discord
    return onSent?.()
  } catch (err) {
    console.error(err)
    return onSent?.()
  }
}

async function processQueue(): Promise<void> {
  // kalo sebelumnya ada proses, berhenti.
  if (isProcessing) return

  // buat prosesnya jadi true
  isProcessing = true

  // selama "queue" masih ada isinya, jalanin terus.
  while (queue.length > 0) {
    // ambil job di array pertama (index 0), terus hapus dari "queue"
    const nextJob = queue.shift()

    // kalo job ketemu, lanjut kirim webhook
    if (nextJob) {
      await processWebhook(nextJob)
      await waittime(150)
    }
  }

  // kalo udah gada, buat prosesnya jadi false
  isProcessing = false
}

export async function webhook(channelKey: IChannelID, message: APIEmbed, onSent?: OnSent): Promise<IAny> {
  // masukin ke array "queue" sebagai job baru
  queue.push({ channelKey, message, onSent })

  processQueue()
}
