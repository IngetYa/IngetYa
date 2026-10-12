import { SocketHandler, SocketMessage } from "#types/SocketClientTypes"

const socketMethods: SocketHandler = {}

export function processSocketMessages(data: SocketMessage): void {
  if (!data.type || !data.clientId || !data.userId) return

  if (!socketMethods[data.type]) return

  socketMethods[data.type]?.(data.userId, data)
}
