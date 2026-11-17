import { model, Model, Schema } from "mongoose"
import type { IMessage } from "#types/ServiceTypes"

export type IMessageModel = Model<IMessage>

const schema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    roomId: { type: String, required: true },
    fileUrl: { type: String },
    fileName: { type: String },
    text: { type: String },
    readers: { type: [String], default: [] },
    createdAt: { type: Date, default: new Date() },
    expiresAt: { type: Date, expires: 0 }
  },
  {
    versionKey: false
  }
)

const MessageModel: IMessageModel = model<IMessage>("Message", schema)

export default MessageModel
