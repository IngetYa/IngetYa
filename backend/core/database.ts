import mongoose from "mongoose"

import logger from "#lib/logger"

export default class MongoConnection {
  // sekali jalan, setelah state database selesai
  private onConnectedCallback?: () => void

  // ngehindarin double connection
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
    logger.info("Closing the MongoDB conection")

    // paksa tutup database
    mongoose.connection.close()
  }

  connect(onConnectedCallback?: () => Promise<void> | void) {
    // simpen next func buat dijalanin kalo bot berhasil online
    if (onConnectedCallback) this.onConnectedCallback = onConnectedCallback

    // coba login
    mongoose.connect(this.mongoUrl, { dbName: this.dbName }).catch((err) => {
      console.error("error ges")

      // kalo error, process.exit(n)
      throw new Error(err)
    })

    // kasih mode json
    mongoose.set("toJSON", { versionKey: false, virtuals: true })

    // kasih mode bson/javascript's object (aslinya gatau sebutannya wkwk, pokonya biar bisa gunain banyak propertinya)
    mongoose.set("toObject", { versionKey: false, virtuals: true })
  }

  private onConnected = () => {
    logger.success(`MongoDB: Logged in as ${this.dbName}`)
    this.isConnectedBefore = true
    if (this.onConnectedCallback) {
      // jalananin next func
      this.onConnectedCallback()
      this.onConnectedCallback = () => logger.info("Server already listen")
    }
  }

  private onReconnected = () => {
    logger.info("Reconnected to MongoDB")
  }

  private onError = () => {
    console.error(`Could not connect to MongoDB at ${this.mongoUrl}`)
  }

  private onDisconnected = () => {
    // auto reconnect
    if (!this.isConnectedBefore) {
      logger.info("Retrying MongoDB connection")
      setTimeout(() => this.connect(), 2000)
    }
  }
}
