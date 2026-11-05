import { app } from "./app"
import cfg from "#cfg"
import logger from "#lib/logger"
import MongoConnection from "#core/database"
import bot from "#core/bot"

const PORT = cfg.APP_PORT

async function startServer(): Promise<void> {
  // start server
  app.listen(PORT, () => {
    logger.success(`HOME (wip) >> http://localhost:${PORT}`)
    logger.success(`PORTAL (works) >> http://localhost:${PORT}/portal`)
    logger.success(`APP (partial works) >> http://localhost:${PORT}/app`)
    logger.success("Running ✔✔✔")
  })
}

// init mongodb
const mongoConnection = new MongoConnection(cfg.DB_URI, cfg.DB_NAME)

// start mongodb, start bot, hell nested function yeahhhhhh brrrr [emot api]
mongoConnection.connect(() => bot.start(startServer))
