import cfg from "#cfg"
import { verifyFileExists } from "#core/s3"
import { rUid } from "#lib/gen"
import { PaginatedMessagesResult, PaginatedRoomsResult, paginateMessages, paginateRooms } from "#main/PaginateDoc"
import MessageModel from "#models/MessageModel"
import OrderModel from "#models/OrderModel"
import RoomModel from "#models/RoomModel"
import UserModel from "#models/UserModel"
import { IResTemp } from "#types/LibTypes"
import { IConvo, IMessage } from "#types/ServiceTypes"

interface IMessageRaw {
  text?: string
  tempId: string
  fileKey?: string
}

export async function sendUserChatMessage(uid: string, roomId: string, s: IMessageRaw): Promise<IResTemp> {
  if (!s) return { status: 400 }
  if (!s.tempId || (!s.text && !s.fileKey)) return { status: 400 }
  if (s.text && typeof s.text !== "string") return { status: 400 }
  if (s.fileKey && typeof s.fileKey !== "string") return { status: 400 }
  if (s.tempId && typeof s.tempId !== "string") return { status: 400 }

  const text = s.text

  if (text && text.length > 3000) {
    return { status: 400, code: "message_too_long" }
  }

  const file = s.fileKey

  let filename: undefined | string = undefined

  if (file) {
    const fileExists = await verifyFileExists(file)

    if (!fileExists) {
      return { status: 400, code: "message_file_not_found" }
    }

    filename = fileExists
  }

  if ((!text || text.length < 1) && !file) {
    return { status: 400 }
  }

  const chatId = rUid()

  const chatData: Partial<IMessage> = {
    id: chatId,
    text,
    userId: uid,
    roomId,
    readers: [],
    createdAt: new Date()
  }

  if (s.fileKey) {
    chatData.fileUrl = `${cfg.PUBLIC_BUCKET}/${s.fileKey}`
    chatData.fileKey = s.fileKey
    chatData.fileName = filename
  }

  await RoomModel.updateOne({ id: roomId }, { latestChatId: chatId, updatedAt: new Date() })

  await MessageModel.create(chatData)

  return { status: 200 }
}

export async function getUserConvo(uid: string, cursor?: string): Promise<IResTemp> {
  const rooms = await paginateRooms(RoomModel, { userId: uid }, { cursor: cursor, limit: 100 })

  const orderIds = rooms.data.filter((k) => k.type === "order").map((k) => k.id)

  const messageIds = rooms.data.map((k) => k.latestChatId)

  const orders = await OrderModel.find({ id: { $in: orderIds } }, { _id: 0, id: 1, name: 1 }).lean()

  const messages = await MessageModel.find({ id: { $in: messageIds } }, { _id: 1, __v: 0 }).lean()

  const convos: IConvo[] = rooms.data.map((k) => {
    const message = messages.find((snap) => snap.roomId === k.id)!

    return {
      _id: k._id,
      id: k.id,
      userId: k.userId,
      roomType: k.type,
      roomName: orders.find((order) => order.id === k.id)?.name || `Support-${k.id}`,
      userName: `User ${k.userId}`,
      unreads: 0,
      lastMessage: message
    }
  })

  const convoStaff: PaginatedRoomsResult<IConvo> = {
    data: convos,
    meta: rooms.meta
  }

  return { status: 200, data: convoStaff }
}

export interface IMessageUser extends IMessage {
  userName: string
}

export async function getUserMessage(_uid: string, roomId: string, cursor?: string): Promise<IResTemp> {
  const chats = await paginateMessages(MessageModel, { roomId }, { cursor, limit: 16 })

  const userIds = chats.data.map((k) => k.userId)

  const users = await UserModel.find({ id: { $in: userIds } }, { _id: 1, id: 1, name: 1 }).lean()

  const messages: PaginatedMessagesResult<IMessageUser> = {
    meta: chats.meta,
    data: chats.data.map((k) => {
      const user = users.find((usr) => usr.id === k.userId)!

      return {
        ...k,
        userName: user.name
      }
    })
  }

  return { status: 200, data: messages }
}
