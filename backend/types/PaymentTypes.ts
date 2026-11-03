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

export type FeeType = "flat" | "percent"

export interface IFeeDetail {
  charge: number
  type: FeeType
}

export interface IBankFee {
  id: string
  fee: IFeeDetail
}
