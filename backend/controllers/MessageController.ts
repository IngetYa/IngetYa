import cfg from "#cfg"
import { verifyFileExists } from "#core/s3"
import { rUid } from "#lib/gen"
import MessageModel from "#models/MessageModel"
import { IResTemp } from "#types/LibTypes"
import { IMessage } from "#types/ServiceTypes"

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
    fileUrl: `${cfg.PUBLIC_BUCKET}/${s.fileKey}`,
    fileKey: s.fileKey,
    fileName: filename,
    userId: uid,
    roomId,
    readers: [],
    createdAt: new Date()
  }

  await MessageModel.create(chatData)

  return { status: 200 }
}
