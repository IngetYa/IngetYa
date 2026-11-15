import { model, Model, Schema } from "mongoose"
import type { IBalance } from "#types/StaffTypes"

export type IBalanceModel = Model<IBalance>

const schema = new Schema(
  {
    amount: { type: Number, required: true },
    type: { type: String, enum: ["income", "expense", "none"], required: true },
    isRoot: { type: Boolean },
    createdAt: { type: Date, required: true }
  },
  {
    versionKey: false
  }
)

const BalanceModel: IBalanceModel = model<IBalance>("Balance", schema)

export default BalanceModel
