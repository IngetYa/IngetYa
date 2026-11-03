import { model, Model, Schema } from "mongoose"
import type { IProduct } from "#types/ServiceTypes"

export type IProductModel = Model<IProduct>

const schema = new Schema(
  {
    id: { type: String, required: true },
    templateId: { type: String, required: true },
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    categories: { type: [String], required: true },
    previewUrl: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: false },
    updatedAt: { type: Date, required: true, default: new Date() }
    // access: { type: [String], enum: ["ADMIN", "DEV"] }
  },
  {
    versionKey: false
  }
)

const ProductModel: IProductModel = model<IProduct>("Product", schema)

export default ProductModel
