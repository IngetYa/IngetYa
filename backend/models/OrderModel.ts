import { model, Model, Schema } from "mongoose"
import type { IOrder } from "#types/ServiceTypes"

export type IOrderModel = Model<IOrder>

const schema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    paymentId: { type: String, required: true },
    contentId: { type: String },
    name: { type: String, required: true },
    package: { type: String, enum: ["month-1", "month-2"], required: true },
    guests: { type: [String], enum: ["free", "plus", "pro", "ultra"], required: true },
    status: { type: String, enum: ["unpaid", "draft", "published", "paused", "expired"], required: true },
    createdAt: { type: Date, required: true, default: new Date() },
    expiresAt: { type: Date, required: true },
    deleteAt: { type: Date, expires: 0 }
  },
  {
    versionKey: false
  }
)

const OrderModel: IOrderModel = model<IOrder>("Order", schema)

export default OrderModel
