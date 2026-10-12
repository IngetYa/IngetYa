import { WebSocket } from "ws"
import { IAny } from "./LibTypes"

export interface ISocketClient {
  id: string
  userId: string
  socket: WebSocket
}

export interface ISocketUser {
  id: string
  clientId: string
}

export type SocketMessage = Record<string, IAny>

export type SocketReturn = (uid: string, data: SocketMessage) => IAny

export type SocketHandler = Record<string, SocketReturn>

export interface IZender {
  key: string
  type: string
  [key: string]: IAny
}

export interface ISocketConfig {
  id: string
  host: string
}
