import { model, Model, Schema } from "mongoose"
import type { IRoom } from "#types/ServiceTypes"

export type IRoomModel = Model<IRoom>

const schema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    channelId: { type: String, required: true },
    type: { type: String, enum: ["support", "order"], required: true },
    latestChatId: { type: String, required: true },
    updatedAt: { type: Date, required: true },
    expiresAt: { type: Date, expires: 0 }
  },
  {
    versionKey: false
  }
)

const RoomModel: IRoomModel = model<IRoom>("Room", schema)

export default RoomModel
