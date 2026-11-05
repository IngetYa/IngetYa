export interface IMidtransTransactionDetail {
  order_id: string
  gross_amount: number
}

export interface IMidtransItem {
  name: string
  quantity: number
  price: number
}

export type IMidtransPaymentType = "bank_transfer" | "qris" | "echannel" | (string & {})

export type IMidtransTransferAccept = "bca" | "bni" | "bri" | "permata" | "cimb" | "other_va" | (string & {})

export interface IPaymentOptions {
  payment_type: IMidtransPaymentType
  transaction_details: IMidtransTransactionDetail
  item_details: IMidtransItem[]
  customer_details: { userId: string }
  custom_expiry?: {
    expiry_duration?: number
  }
  bank_transfer?: {
    bank?: IMidtransTransferAccept
    va_number?: string
  }
  echannel?: {
    bill_info1?: string // "Payment For:"
    bill_info2?: string // "IngetYa Digital"
    bill_key?: string
  }
  qris?: { acquirer: "gopay" }
}
