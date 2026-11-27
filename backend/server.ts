import { app } from "./app"
import cfg from "#cfg"
import logger from "#lib/logger"
import MongoConnection from "#core/database"
import bot from "#core/bot"
import shared from "#lib/shared"
import { WhatsAppHandler } from "./whatsapp/wa"

const PORT = cfg.APP_PORT

async function startServer(): Promise<void> {
  const wa = new WhatsAppHandler({
    phoneNumber: shared.waConfig.phone_number,
    sessionDir: "./waweb/.wwebjs_auth",
    cacheDir: "./waweb/.wwebjs_cache",
    clientId: cfg.WHATSAPP_CLIENT_ID
  })

  const isPuppeteerDetachError = (err: unknown): boolean => {
    if (!(err instanceof Error)) return false
    const msg = err.message || ""
    return msg.includes("Attempted to use detached Frame") || msg.includes("Execution context was destroyed") || msg.includes("Target closed") || msg.includes("Session closed")
  }

  process.on("unhandledRejection", async (reason) => {
    if (isPuppeteerDetachError(reason)) {
      await wa.handleDetachedFrameError()
      return
    }
    logger.error("[Process] Unhandled Rejection")
    console.error(reason)
  })

  process.on("uncaughtException", async (err) => {
    if (isPuppeteerDetachError(err)) {
      await wa.handleDetachedFrameError()
      return
    }
    logger.error("[Process] Uncaught Exception")
    console.error(err)
    process.exit(1)
  })

  await wa.initialize().catch((err) => {
    logger.error("[WA] Fatal error running handler")
    console.error(err)
    process.exit(1)
  })

  app.listen(PORT, () => {
    logger.success(`[APP] HOME >> http://localhost:${PORT}`)
    logger.success(`[APP] PORTAL >> http://localhost:${PORT}/portal`)
    logger.success(`[APP] APP >> http://localhost:${PORT}/app`)
    logger.success(`[APP] STAFF >> http://localhost:${PORT}/staff`)
    logger.success("[APP] Running ✔✔✔")
  })
}

const mongoConnection = new MongoConnection(cfg.DB_URI, cfg.DB_NAME)

mongoConnection.connect(() => bot.start(startServer))
