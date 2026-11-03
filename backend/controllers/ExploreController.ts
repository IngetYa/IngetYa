import priceDetail from "#data/PriceDetail.json"
import feeData from "#data/FeeData.json"
import ProductModel from "#models/ProductModel"
import { IExploreDetail } from "#types/ExploreTypes"
import { IResTemp } from "#types/LibTypes"
import { IBankFee, IPriceDetail } from "#types/PaymentTypes"
import { IUserTemp } from "#types/UserTypes"
import UserModel from "#models/UserModel"

export async function getMe(uid?: string): Promise<IUserTemp | undefined> {
  if (!uid) return undefined

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

export async function getExploreDetail(uid?: string): Promise<IResTemp> {
  const products = await ProductModel.find({ isActive: true }).lean()

  const price = priceDetail as IPriceDetail
  const fee = feeData as IBankFee[]

  const me = await getMe(uid)

  const data: Partial<IExploreDetail> = {
    products,
    price: price,
    me,
    fee: fee
  }

  return { status: 200, data }
}
