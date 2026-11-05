import type { ILocale } from "./LibTypes"

export interface IPaymentGuide {
  name: string
  steps: string[]
}

export interface IGuideLocale {
  id: IPaymentGuide[]
  en: IPaymentGuide[]
}

export interface IPayment {
  id: string
  name: ILocale
  guides: IGuideLocale
}

export interface IPriceDetail {
  "price_month-1": number
  "price_month-2": number
  "price_guest-1": number
  "price_guest-2": number
  "price_guest-3": number
  "price_guest-4": number
  "price_book-1": number
  [key: string]: number
}

export interface IBundlePrice {
  bundle: string
  name?: string
  price: number
}

export type PaymentType = "qris" | "bca" | "mandiri" | "bni" | "bri" | "permata" | "cimb" | "other_va" | ({} & string)

export interface IOrderData {
  orderName?: string
  orderProduct: string
  orderPackage: "month-1" | "month-2" | ({} & string)
  orderGuest: "guest-1" | "guest-2" | "guest-3" | "guest-4" | ({} & string)
  orderBook?: "book-1" | ({} & string)
  paymentId?: PaymentType
}

export type FeeType = "flat" | "percent"

export interface IFeeDetail {
  charge: number
  type: FeeType
}

export interface IBankFee {
  id: string
  fee: IFeeDetail
}
