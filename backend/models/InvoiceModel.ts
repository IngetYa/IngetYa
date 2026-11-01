import { model, Model, Schema } from "mongoose"
import type { IInvoice } from "#types/ServiceTypes"

export type IInvoiceModel = Model<IInvoice>

const schema = new Schema(
  {
    orderId: { type: String, required: true },
    price: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
    deleteAt: { type: Date, expires: 0 },
    userId: { type: String, required: true },
    order_id: { type: String },
    gross_amount: { type: String },
    transaction_status: { type: String },
    permata_va_number: { type: String },
    va_numbers: {
      type: {
        bank: { type: String },
        va_number: { type: String }
      },
      _id: false
    },
    bill_key: { type: String },
    biller_code: { type: String },
    actions: {
      type: {
        name: { type: String },
        method: { type: String },
        url: { type: String }
      },
      _id: false
    },
    qr_string: { type: String },
    expiry_time: { type: String },
    settlement_time: { type: String }
  },
  {
    versionKey: false
  }
)

const InvoiceModel: IInvoiceModel = model<IInvoice>("Invoice", schema)

export default InvoiceModel
