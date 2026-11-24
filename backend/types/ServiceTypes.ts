import { Types } from "mongoose"

export type ImageUrl = string
export type HtmlUrl = string

export interface IProduct {
  id: string
  name: string
  price: number
  image: ImageUrl
  previewUrl: string
  categories: string[]
  templateId: string
  ownerId: string
  isActive: boolean
  updatedAt: Date
}

export interface IContent {
  id: string
  orderId: string
  slug: string
  url: HtmlUrl
}

export type IGuests = "guest-1" | "guest-2" | "guest-3" | "guest-4"

export type OrderStatus = "unpaid" | "draft" | "published" | "paused" | "expired" | "bundling"

export type AddOnIds = "book-1"

export interface IOrder {
  id: string
  userId: string
  productId: string
  paymentId: string
  contentId?: string | null
  slug?: string
  name: string
  package: "month-1" | "month-2"
  guests: IGuests
  addOns?: AddOnIds[]
  status: OrderStatus
  expiresAt: Date
  createdAt: Date
  deleteAt?: Date
}

export interface IVirtualAccount {
  bank: string
  va_number: string
}

export interface IPayAction {
  name: string
  method: string
  url: string
}

export type ITransactionStatus = "authorize" | "capture" | "settlement" | "deny" | "pending" | "cancel" | "refund" | "partial_refund" | "chargeback" | "partial_chargeback" | "expire" | "failure" | ({} & string)

export interface IBill {
  orderId: string
  price: number
  expiresAt: Date
  userId: string
  order_id: string
  gross_amount: string
  transaction_status: ITransactionStatus
  permata_va_number: string
  va_numbers: IVirtualAccount[]
  bill_key: string
  biller_code: string
  actions: IPayAction[]
  qr_string: string
  expiry_time: string
  settlement_time: string
}

export type ChatMessageType = "file" | "text"

export interface IMessage {
  _id: Types.ObjectId
  id: string
  userId: string
  roomId: string
  fileUrl?: string
  fileKey?: string
  fileName?: string
  text?: string
  readers: string[]
  createdAt: Date
  expiresAt?: Date
}

export type ChatRoomType = "support" | "order"

export interface IRoom {
  _id: Types.ObjectId
  id: string
  userId: string
  type: ChatRoomType
  latestChatId: string
  expiresAt?: Date
}

export interface IConvo {
  _id: Types.ObjectId
  id: string // roomId di message
  roomType: ChatRoomType
  userName: string
  roomName: string
  unreads: number
  lastMessage: IMessage
}
