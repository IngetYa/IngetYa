import cfg from "#cfg"
import { isProd, rUid, toBase64 } from "#lib/gen"
import logger from "#lib/logger"
import shared from "#lib/shared"
import { IAny } from "#types/LibTypes"
import fs from "fs"
import path from "path"
import { inspect } from "util"
import { Buttons, Client, LocalAuth, Message } from "whatsapp-web.js"

export interface WhatsAppHandlerConfig {
  phoneNumber: string
  clientId?: string
  sessionDir?: string
  cacheDir?: string
}

// const HOST: string = isProd ? `https://${cfg.APP_HOST}` : `http://localhost:${cfg.APP_PORT}`
const HOST: string = `https://${cfg.APP_HOST}`

export class WhatsAppHandler {
  private client: Client | null = null
  private readonly phoneNumber: string
  private readonly clientId: string
  private readonly sessionDir: string
  private readonly cacheDir: string
  private isRestarting: boolean = false
  private pairingRequested: boolean = false

  private _qrString?: string

  constructor(config: WhatsAppHandlerConfig) {
    this.phoneNumber = config.phoneNumber.replace(/[^0-9]/g, "")
    this.clientId = config.clientId || "bot-session"
    this.sessionDir = path.resolve(config.sessionDir || ".wwebjs_auth")
    this.cacheDir = path.resolve(config.cacheDir || ".wwebjs_cache")
  }

  get qrString(): string | undefined {
    return this._qrString
  }

  public async initialize(): Promise<void> {
    if (this.client) {
      await this.destroyClient()
    }

    this.pairingRequested = false

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: this.clientId,
        dataPath: this.sessionDir
      }),
      webVersionCache: {
        type: "local",
        path: this.cacheDir
      },
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-accelerated-2d-canvas", "--no-first-run", "--no-zygote", "--disable-gpu"]
      }
    })

    this.registerEvents()

    logger.info("[WA] Initializing client..")
    await this.client.initialize()
  }

  private registerEvents(): void {
    if (!this.client) return

    this.client.on("qr", async (qr) => {
      this._qrString = qr

      logger.success(`[WA] QR String received`)
      console.log(qr)

      // if (this.pairingRequested || !this.client) return
      //   this.pairingRequested = true

      // try {
      //   logger.info(`[WA] Requesting pairing code for ${this.phoneNumber}`)
      //   // const code = await this.client.requestPairingCode(this.phoneNumber)
      //   // logger.success(`[WA] PAIRING CODE: ${code}`)
      // } catch (err) {
      //   logger.error("[WA] Failed requesting pairing code")
      //   console.error(err)
      //   await this.cleanAndRestart("PAIRING_ERROR")
      // }
    })

    this.client.on("code", (code: string) => {
      logger.success(`[WA] Event code received: ${code}`)
    })

    this.client.on("authenticated", () => {
      logger.success("[WA] Authenticated")
      this.pairingRequested = false
    })

    this.client.on("ready", () => {
      logger.success(`[WA] Logged in as ${this.phoneNumber}`)
    })

    this.client.on("message_create", async (msg: Message) => {
      const content = msg.body

      const args = content.split(" ")

      const command = args[0].toLowerCase()
      const authCommand = shared.waConfig.command.toLowerCase()

      if (command === authCommand) {
        await msg.react("💕")

        const contact = await msg.getContact()

        const redirect = args[1]

        const state = redirect ? toBase64(redirect) : null

        const stateText = state ? `&state=${state}` : ""

        const name = contact.pushname

        const password = rUid()

        const target = `${HOST}?code=${password}${stateText}`

        const text = `Woke *${name}*, login lagi dibikin 😎 Buka link-nya buat lanjutin ya 😉\n---\n${target}\n---\nKalo kamu ga ngerasa lagi login di *IngetYa*, jangan klik link itu ya 🤫`

        msg.reply(text)
      }

      logger.info(`[WA] > ${msg.from}: ${msg.body}`)
    })

    this.client.on("auth_failure", async (message: string) => {
      logger.error(`[WA] Auth failed: ${message}`)
      await this.cleanAndRestart("AUTH_FAILURE")
    })

    this.client.on("disconnected", async (reason: string) => {
      logger.error(`[WA] Client disconnected: ${reason}`)
      await this.cleanAndRestart(`DISCONNECTED (${reason})`)
    })
  }

  public async handleDetachedFrameError(): Promise<void> {
    logger.error("[WA] Detached frame detected. Triggering reset process..")
    await this.cleanAndRestart("DETACHED_FRAME")
  }

  private async destroyClient(): Promise<void> {
    if (!this.client) return

    const browser = this.client.pupBrowser

    try {
      this.client.removeAllListeners()
      await this.client.destroy()
    } catch {
      // biarin kalo udah keduluan ditutup
    }

    if (browser) {
      try {
        await browser.close()
      } catch {
        // biarin kalo udah keduluan ditutup
      }
      const proc = browser.process()
      if (proc && !proc.killed) {
        proc.kill("SIGKILL")
      }
    }

    this.client = null
  }

  private async clearSessionAndCache(): Promise<void> {
    const targets = [this.sessionDir, this.cacheDir]

    for (const dirPath of targets) {
      if (!fs.existsSync(dirPath)) continue

      // Retry max 5x, interval 0.5s, biar ga kena error EBUSY/EPERM
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          fs.rmSync(dirPath, { recursive: true, force: true })
          logger.info(`[WA] Dir deleted: ${dirPath}`)
          break
        } catch (err: IAny) {
          if (attempt === 5) {
            logger.error(`[WA] Failed deleting dir ${dirPath} after 5 tries`)
            console.error(err)
          } else {
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
        }
      }
    }
  }

  private async cleanAndRestart(triggerReason: string): Promise<void> {
    if (this.isRestarting) return
    this.isRestarting = true
    this._qrString = undefined

    logger.info(`[WA] Starting 'reset process': ${triggerReason}`)

    try {
      await this.destroyClient()
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await this.clearSessionAndCache()

      logger.info("[WA] Restarting initialization..")
      await this.initialize()
    } catch (err) {
      logger.error("[WA] Failed restarting client")
      console.error(err)
    } finally {
      this.isRestarting = false
    }
  }
}
