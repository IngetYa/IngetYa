import { model, Model, Schema } from "mongoose"
import { IUser } from "#types/UserTypes"

export type IUserModel = Model<IUser>

const schema = new Schema(
  {
    id: { type: String, required: true },
    luna: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number },
    access: { type: [String], enum: ["ADMIN", "DEV"] }
  },
  {
    versionKey: false
  }
)

const UserModel: IUserModel = model<IUser>("User", schema)

export default UserModel
