import { model, Model, Schema } from "mongoose"
import type { IContent } from "#types/ServiceTypes"

export type IContentModel = Model<IContent>

const schema = new Schema(
  {
    id: { type: String, required: true },
    orderId: { type: String, required: true },
    slug: { type: String, required: true },
    url: { type: String, required: true }
  },
  {
    versionKey: false
  }
)

const ContentModel: IContentModel = model<IContent>("Content", schema)

export default ContentModel
