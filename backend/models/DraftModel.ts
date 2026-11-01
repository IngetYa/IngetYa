import { model, Model, Schema } from "mongoose"
import type { IDraft } from "#types/ServiceTypes"

export type IDraftModel = Model<IDraft>

const schema = new Schema(
  {
    id: { type: String, required: true },
    orderId: { type: String, required: true },
    templateId: { type: String, required: true },
    updatedAt: { type: Date, required: true, default: new Date() },
    data: { type: Schema.Types.Mixed }
  },
  {
    versionKey: false
  }
)

const DraftModel: IDraftModel = model<IDraft>("Draft", schema)

export default DraftModel
