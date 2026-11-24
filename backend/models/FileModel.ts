import { model, Model, Schema } from "mongoose"
import { IFile } from "#types/FileTypes"

export type IFileModel = Model<IFile>

const schema = new Schema(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    userId: { type: String, required: true },
    roomId: { type: String, required: true },
    size: { type: Number, required: true },
    expiresAt: { type: Date, expires: 0 }
  },
  {
    versionKey: false
  }
)

const FileModel: IFileModel = model<IFile>("File", schema)

export default FileModel
