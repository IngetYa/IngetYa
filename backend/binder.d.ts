import { IUserSession } from "#types/UserTypes"

declare module "ws" {
  // tambah properti baru buat cek ping live connection
  interface WebSocket {
    isAlive: boolean
  }
}

declare module "express-session" {
  // tambah properti baru buat singkatin properti session user
  // `req.session.user` jadi `req.user`
  interface SessionData {
    user?: IUserSession
  }
}

declare module "express" {
  // tambah properti baru buat singkatin properti session user
  // `req.session.user` jadi `req.user`
  interface Request {
    user?: IUserSession
  }
}
