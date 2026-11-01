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

export interface ITemplate<TData = Record<string, unknown>> {
  id: string
  name: string
  content: HtmlUrl
  data: TData
  createdAt: Date
}

export interface IDraft<TData = Record<string, unknown>> {
  id: string
  orderId: string
  templateId: string
  data: TData
  updatedAt: Date
}

export interface IContent {
  id: string
  orderId: string
  slug: string
  url: HtmlUrl
}

export type IGuests = "free" | "plus" | "pro" | "ultra"

export type OrderStatus = "unpaid" | "draft" | "published" | "paused" | "expired"

export interface IOrder {
  id: string
  userId: string
  productId: string
  paymentId: string
  contentId?: string | null
  name: string
  package: "month-1" | "month-2"
  guests: IGuests[]
  status: OrderStatus
  expiresAt: Date
  createdAt: Date
  deleteAt: Date
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

export interface IInvoice {
  orderId: string
  price: number
  expiresAt: Date
  userId: string
  order_id: string
  gross_amount: string
  transaction_status: string
  permata_va_number: string
  va_numbers: IVirtualAccount
  bill_key: string
  biller_code: string
  actions: IPayAction
  qr_string: string
  expiry_time: string
  settlement_time: string
}
