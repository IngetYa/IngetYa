import mongoose from "mongoose"

import logger from "#lib/logger"

export default class MongoConnection {
  private onConnectedCallback?: () => void

  private isConnectedBefore = false

  constructor(
    private mongoUrl: string,
    private dbName: string
  ) {
    mongoose.connection.on("error", this.onError)
    mongoose.connection.on("disconnected", this.onDisconnected)
    mongoose.connection.on("connected", this.onConnected)
    mongoose.connection.on("reconnected", this.onReconnected)
  }

  close() {
    logger.info("[DB] Closing the MongoDB conection")

    mongoose.connection.close()
  }

  connect(onConnectedCallback?: () => Promise<void> | void) {
    if (onConnectedCallback) this.onConnectedCallback = onConnectedCallback

    mongoose.connect(this.mongoUrl, { dbName: this.dbName }).catch((err) => {
      logger.error("[DB] error connecting to MongoDB")

      throw new Error(err)
    })

    mongoose.set("toJSON", { versionKey: false, virtuals: true })

    mongoose.set("toObject", { versionKey: false, virtuals: true })
  }

  private onConnected = () => {
    logger.success(`[DB] Logged in as ${this.dbName}`)
    this.isConnectedBefore = true
    if (this.onConnectedCallback) {
      this.onConnectedCallback()
      this.onConnectedCallback = () => logger.info("[DB] Server already listen")
    }
  }

  private onReconnected = () => {
    logger.info("[DB] Reconnected")
  }

  private onError = () => {
    logger.error(`[DB] Could not connect to ${this.mongoUrl}`)
  }

  private onDisconnected = () => {
    if (!this.isConnectedBefore) {
      logger.info("[DB] Retrying connection")
      setTimeout(() => this.connect(), 2000)
    }
  }
}
