import cfg from "#cfg"
import feeData from "#data/FeeData.json"
import priceDetail from "#data/PriceDetail.json"
import { rNumber } from "#lib/gen"
import logger from "#lib/logger"
import xhr from "#lib/xhr"
import BillModel from "#models/BillModel"
import OrderModel from "#models/OrderModel"
import ProductModel from "#models/ProductModel"
import { IMidtransTransferAccept, IPaymentOptions } from "#types/BillTypes"
import { IAny, IResTemp } from "#types/LibTypes"
import { FeeType, IBankFee, IOrderData, IPriceDetail } from "#types/PaymentTypes"
import { IBill, IOrder } from "#types/ServiceTypes"

interface IMidtransRequest {
  url: string
  authorization: string
}

function encodeMidtrans(): IMidtransRequest {
  const isProd = cfg.MIDTRANS_PRODUCTION

  const api = isProd ? "api.midtrans.com" : "api.sandbox.midtrans.com"
  const SECRET_KEY = cfg[`${isProd ? "PR" : "SB"}_MIDTRANS_SERVER_KEY`]
  const authorization = Buffer.from(`${SECRET_KEY}:`).toString("base64")

  const url = `https://${api}/v2`

  return { url, authorization }
}

export async function hasOrderLimit(uid: string): Promise<boolean> {
  const unpaidBillSize = await BillModel.countDocuments({
    transaction_status: { $in: ["pending", "deny"] },
    userId: uid
  })

  return unpaidBillSize >= 5
}

// hitung biaya layanan (flat & percent)
function getFeeCharge(price: number, fee: number, type: FeeType): number {
  // kalo flat, langsung kasih nominal utuh
  if (type === "flat") return fee

  /**
   * rumus biar kalo fee percent, kita tetep dapet pembayaran bulatnya
   * [[ TAGIHAN = HARGA / (1 - RATE) ]]
   *
   * HARGA   = 10000
   * RATE    = 2% = 2 / 100 = 0.02
   * TAGIHAN = 10000 / (1 - 0.02)
   *         = 10000 / 0.98
   *         = 10204.0816
   *         = 10205
   */

  // rate persen >> n / 100
  const rate = fee / 100

  // rate ditambah kekurangan provider >> n / (1 - rate)
  const finalRate = price / (1 - rate)

  // buletin ke atas
  const finalPrice = Math.ceil(finalRate)

  // hasil full fee dikurangin harga bersih
  return finalPrice - price
}

export function getTotalPrice(fee: IBankFee, itemPrices: number[]): number {
  const subTotal = itemPrices.reduce((a, b) => a + b, 0)

  const feeAmount = fee.fee.charge
  const feeType = fee.fee.type

  const feeCharge = getFeeCharge(subTotal, feeAmount, feeType)

  const amountTotal = subTotal + feeCharge

  return amountTotal
}

export async function createOrder(uid: string, s: IOrderData): Promise<IResTemp> {
  if (!s) return { status: 404 }

  if (typeof s.paymentId !== "string") return { status: 404 }
  if (typeof s.orderProduct !== "string") return { status: 404 }
  if (typeof s.orderPackage !== "string") return { status: 404 }
  if (typeof s.orderGuest !== "string") return { status: 404 }
  if (s.orderBook && typeof s.orderBook !== "string") return { status: 404 }
  if (s.orderName && typeof s.orderName !== "string") return { status: 404 }

  const isLimited = await hasOrderLimit(uid)
  if (isLimited) return { status: 400, code: "bill_limit" }

  const product = await ProductModel.findOne({ id: s.orderProduct }).lean()
  if (!product) {
    return { status: 404 }
  }

  const fees = feeData as IBankFee[]

  const payment = fees.find((validPay) => validPay.id === s.paymentId)
  if (!payment) {
    return { status: 404 }
  }

  const paymentId = s.paymentId

  const pricing = priceDetail as IPriceDetail

  const itemPackage = pricing[`price_${s.orderPackage}`]
  if (typeof itemPackage !== "number") return { status: 404 }

  const itemGuest = pricing[`price_${s.orderGuest}`]
  if (typeof itemGuest !== "number") return { status: 404 }

  let itemBook: number = 0

  if (s.orderBook) {
    const bookPrice = pricing[`price_${s.orderBook}`]
    if (typeof bookPrice !== "number") return { status: 404 }
    itemBook = bookPrice
  }

  const orderSize = await OrderModel.countDocuments()

  const orderId = `${rNumber(3)}${orderSize}`

  const now = new Date()

  const hour12 = 12 * 60 * 60 * 1000
  const expiry = new Date(Date.now() + hour12)

  const orderName = s.orderName

  const orderData: IOrder = {
    name: !orderName || orderName.length > 100 ? `Order ${orderId}` : orderName.trim(),
    userId: uid,
    id: orderId,
    paymentId: payment.id,
    productId: product.id,
    package: s.orderPackage,
    guests: s.orderGuest,
    addOns: s.orderBook ? ["book-1"] : undefined,
    status: "unpaid",
    createdAt: now,
    expiresAt: expiry
  }

  const totalCharge = getTotalPrice(payment, [product.price, itemPackage, itemGuest, itemBook])

  const chargeOptions: Partial<IPaymentOptions> = {
    transaction_details: {
      gross_amount: totalCharge,
      order_id: orderId
    },
    item_details: [
      {
        name: `Tema ${product.name} - Spec ${orderId}`,
        price: totalCharge,
        quantity: 1
      }
    ],
    customer_details: { userId: uid },
    custom_expiry: {
      expiry_duration: 720
    }
  }

  const bankTransfersIds: IMidtransTransferAccept[] = ["bca", "bni", "bri", "permata", "cimb", "other_va"]

  if (bankTransfersIds.some((id) => id === paymentId)) {
    chargeOptions.payment_type = "bank_transfer"
    chargeOptions.bank_transfer = {
      bank: paymentId === "other_va" ? "bri" : paymentId
    }

    // if (paymentId !== "permata") {
    //   chargeOptions.bank_transfer.va_number = BankMethods[paymentId]()
    // }
  }

  if (paymentId === "mandiri") {
    chargeOptions.payment_type = "echannel"
    chargeOptions.echannel = {
      bill_info1: "Payment",
      bill_info2: "IngetYa Digital"
      // bill_key: BankMethods[paymentId]()
    }
  }

  if (paymentId === "qris") {
    chargeOptions.payment_type = "qris"
    chargeOptions.qris = { acquirer: "gopay" }
  }

  const midtrans = encodeMidtrans()

  const charge: IBill & IAny = await xhr.post(`${midtrans.url}/charge`, `Basic ${midtrans.authorization}`, chargeOptions)

  if (charge.error || charge.errors) {
    logger.error(charge)
    return { status: 500, code: "internal_server_error" }
  }

  const requiredKeys = ["order_id", "transaction_status"]
  const isChargeValid = requiredKeys.every((itm) => Object.keys(charge).some((k) => itm === k))

  if (!isChargeValid) {
    return { status: 500, code: "internal_server_error" }
  }

  const billData: IBill = Object.assign({}, charge)
  billData.expiresAt = expiry
  billData.price = totalCharge
  billData.userId = uid
  billData.orderId = orderId

  await OrderModel.create(orderData)
  await BillModel.create(billData)

  return { status: 200, data: { order: orderData, bill: billData } }
}
