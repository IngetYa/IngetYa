import priceDetail from "#data/PriceDetail.json"
import feeData from "#data/FeeData.json"
import UserModel from "#models/UserModel"
import { IResTemp } from "#types/LibTypes"
import { IUserTemp } from "#types/UserTypes"
import { IBankFee, IPriceDetail } from "#types/PaymentTypes"
import { IUserData } from "#types/ProfileTypes"
import OrderModel from "#models/OrderModel"
import BillModel from "#models/BillModel"
import ProductModel from "#models/ProductModel"
import { sockets } from "#main/Sockets"

export async function getMe(uid: string): Promise<IUserTemp | undefined> {
  const user = await UserModel.findOne({ id: uid }).lean()

  if (!user) return undefined

  return {
    id: user.id,
    luna: user.luna,
    name: user.name,
    email: user.email,
    access: user.access,
    createdAt: user.createdAt
  }
}

export async function getProfileDetail(uid: string): Promise<IResTemp> {
  return { status: 200, data: await getMe(uid) }
}

export async function getUserData(uid: string): Promise<IResTemp> {
  const price = priceDetail as IPriceDetail
  const fee = feeData as IBankFee[]

  const me = await getMe(uid)

  const products = await ProductModel.find({ isActive: true }).lean()

  const orders = await OrderModel.find({ userId: uid }).lean()

  const bills = await BillModel.find({ userId: uid }).lean()

  const socket = sockets.save(uid)

  const data: Partial<IUserData> = {
    me,
    price: price,
    fee: fee,
    orders,
    bills,
    products,
    socket
  }

  return { status: 200, data }
}
