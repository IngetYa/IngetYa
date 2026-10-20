import express, { type Request, type Response, type NextFunction } from "express"
import expressWs from "express-ws"
import { WebSocket } from "ws"
import mongoose from "mongoose"
import session from "express-session"
import MongoStore from "connect-mongo"
import cfg from "#cfg"
import { sessionUserBinder } from "#core/binder"
import { IAny } from "#types/LibTypes"
import { startSocketApp } from "#routes/SocketRouter"
import authRouter from "#routes/AuthRouter"
import { webhook } from "#main/webhook/webhook"
import { isProd } from "#lib/gen"

// express server ambil dari express websocket
// yang diambil dari express server itu sendiri
const server = expressWs(express())

// ini hasil servernya (app), sama tiap-tiap koneksi socket.
const { app, getWss } = server

// koneksi mongodb, buat dipake setelah ini
const storePromise = mongoose.connection.asPromise().then((conn) => conn.getClient())

app.use(
  session({
    name: "ingetya",
    secret: cfg.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 28, // expire setelah 28 hari
      sameSite: "strict"
    },
    store: MongoStore.create({
      clientPromise: storePromise, // append dari koneksi mongodb yang udah ada
      dbName: cfg.DB_NAME,
      collectionName: "sessions",
      stringify: false, // biar bisa dibaca sebagai BSON
      autoRemove: "native"
    })
  })
)

// biar bisa pake `req.user`
app.use(sessionUserBinder)

// rencana diubah ke "static"
app.use(express.static("public"), express.static("static"))

// view engine, tadinya html biasa
app.set("view engine", "ejs")

// endpoint buat websocket
app.ws("/socket", (wsClient, req: Request) => {
  const ws = wsClient

  // start websocket hanlder
  startSocketApp(ws, req)
})

// ini cara satu-satunya buat cek ping user, asu cok cok :)
const interval = setInterval(() => {
  getWss().clients.forEach((client) => {
    const ws = client as WebSocket
    if (ws.isAlive === false) {
      return ws.terminate()
    }

    ws.isAlive = false
    ws.ping()
  })
}, 10000)

getWss().on("close", () => {
  clearInterval(interval)
  // [!TODO] end process and send webhook
})

getWss().on("error", () => {
  clearInterval(interval)
  // [!TODO] end process and send webhook
})

// set auth router, endpoint /auth
app.use("/x/auth", authRouter)

app.get("/build", (req: Request, res: Response, next: NextFunction) => {
  if (isProd) return next()

  return res.render("built")
})

app.get("/portal", (req: Request, res: Response) => {
  res.render("portal")
})

app.get("/", (req: Request, res: Response) => {
  res.render("home")
})

// endpoint ga ketemu
app.use("/", (req: Request, res: Response) => {
  const isJsonRequest = req.headers.accept?.includes("application/json") || req.headers["x-requested-with"] === "XMLHttpRequest"
  // kalo accept type-nya json, ya kasih json
  if (isJsonRequest) {
    return res.status(404).json({ ok: false, status: 404, code: "not_found", error: "Not Found" })
  }

  // kalo engga, kirim aja html aowkwk
  return res.status(404).json({
    ok: false,
    status: 404,
    code: "not_found",
    error: "Not Found"
  })

  // ini ntar pake EJS
  // return res.render("error", {
  //   status: 404,
  //   title: "Sorry, this page isn't available.",
  //   text: "Looks like this page is missing."
  // })
})

// server express error
app.use((err: IAny, req: Request, res: Response, next: NextFunction) => {
  // khawatir server ngang-ngong, kadang jadi goblok.
  // kalo error-nya modelan exception, sering header client
  // kekirim duluan. terpaksa lempar terus ke endpoint selanjutnya
  // padahal gada endpoint selanjutnya. kek anjing kan? but it works!
  if (res.headersSent) return next(err)

  console.error(err)

  // kalo errornya berhasil disanitasi, coba kirim webhook
  webhook("errors", {
    author: { name: "Oops!" },
    description: err,
    timestamp: new Date().toISOString()
  })

  const isJsonRequest = req.headers.accept?.includes("application/json") || req.headers["x-requested-with"] === "XMLHttpRequest"

  // kalo accept type-nya json, ya kasih json
  if (isJsonRequest) {
    if (err.type === "entity.too.large" || err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        ok: false,
        status: 413,
        code: "entity_too_large"
      })
    }

    return res.status(500).json({
      ok: false,
      status: 500,
      code: "internal_server_error"
    })
  }

  // kalo engga, kirim aja html aowkwk

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      ok: false,
      status: 413,
      code: "entity_too_large"
    })

    // return res.render("error", {
    //   status: 413,
    //   title: "Your data exceeded the request size limit.",
    //   text: "We're sorry, but we are unable to process your request at this time."
    // })
  }

  return res.status(500).json({
    ok: false,
    status: 500,
    code: "internal_server_error"
  })

  // return res.render("error", {
  //   code: 500,
  //   title: "Internal Server Error.",
  //   text: "Our server is currently experiencing an unexpected issue."
  // })
})

export { app }
