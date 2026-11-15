import { model, Model, Schema } from "mongoose"
import type { ITransaction } from "#types/StaffTypes"

export type ITransactionModel = Model<ITransaction>

const schema = new Schema(
  {
    amount: { type: Number, required: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
    desc: { type: String },
    type: { type: String, enum: ["income", "expense", "none"], required: true },
    author: { type: String, required: true },
    timestamp: { type: Date, required: true }
  },
  {
    versionKey: false
  }
)

const TransactionModel: ITransactionModel = model<ITransaction>("Transaction", schema)

export default TransactionModel
