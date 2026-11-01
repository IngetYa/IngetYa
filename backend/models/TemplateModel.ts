import { model, Model, Schema } from "mongoose"
import type { ITemplate } from "#types/ServiceTypes"

export type ITemplateModel = Model<ITemplate>

const schema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, required: true, default: new Date() },
    data: { type: Schema.Types.Mixed }
  },
  {
    versionKey: false
  }
)

const TemplateModel: ITemplateModel = model<ITemplate>("Template", schema)

export default TemplateModel
