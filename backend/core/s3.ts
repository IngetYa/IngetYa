import cfg from "#cfg"
import { rUid, getFileExtension, isTooLarge } from "#lib/gen"
import FileModel from "#models/FileModel"
import { IAny, IResTemp } from "#types/LibTypes"
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export const s3 = new S3Client({
  region: "auto",
  endpoint: cfg.S3_ENDPOINT,
  credentials: {
    accessKeyId: cfg.S3_ACCESS_KEY_ID,
    secretAccessKey: cfg.S3_SECRET_ACCESS_KEY
  }
})

interface IUploadURL {
  uploadUrl: string
  fileKey: string
}

export async function generateUploadUrl(folder: string, filename: string, fileType: string, fileSize: number): Promise<IUploadURL> {
  const extension = getFileExtension(filename)

  const upFileName = `${rUid()}${extension}`

  const fileKey = `${folder}/${upFileName}`

  const command = new PutObjectCommand({
    Bucket: cfg.S3_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
    ContentLength: fileSize
  })

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })

  return { uploadUrl, fileKey }
}

export async function verifyFileExists(fileKey: string): Promise<string | null> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: cfg.S3_BUCKET_NAME, Key: fileKey }))

    const fileExists = await FileModel.findOne({ key: fileKey })

    if (fileExists) {
      fileExists.expiresAt = undefined
      delete fileExists.expiresAt
      await fileExists.save()
    }

    return fileExists?.name || null
  } catch (err: unknown) {
    const error = err as IAny
    console.error(error)
    if (typeof error.name === "string" && error.name === "NotFound") return null
    return null
  }
}

interface IPresignReq {
  filename: string
  fileType: string
  fileSize: number
}

export async function getPresignURL(folder: string, uid: string, roomId: string, s: IPresignReq): Promise<IResTemp> {
  if (typeof s.filename !== "string") return { status: 400 }
  if (typeof s.fileType !== "string") return { status: 400 }
  if (typeof s.fileSize !== "number") return { status: 400 }

  if (isTooLarge(s.fileSize, 2000000)) return { status: 413, code: "entity_too_large" }

  const urlData = await generateUploadUrl(folder, s.filename, s.fileType, s.fileSize)

  await FileModel.create({
    key: urlData.fileKey,
    name: s.filename,
    userId: uid,
    roomId: roomId,
    size: s.fileSize,
    expiresAt: new Date(Date.now() + 1000 * 60 * 300)
  })

  return { status: 200, data: urlData }
}
