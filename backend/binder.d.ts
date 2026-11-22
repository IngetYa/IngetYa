import { IUserSession } from "#types/UserTypes"

declare module "ws" {
  interface WebSocket {
    isAlive: boolean
  }
}

declare module "express-session" {
  interface SessionData {
    user?: IUserSession
  }
}

declare module "express" {
  interface Request {
    user?: IUserSession
  }
}
