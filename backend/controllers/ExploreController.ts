import ProductModel from "#models/ProductModel"
import { IResTemp } from "#types/LibTypes"
import { IUserTemp } from "#types/UserTypes"
import UserModel from "#models/UserModel"

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

export async function getExploreDetail(): Promise<IResTemp> {
  const products = await ProductModel.find({ isActive: true }).lean()

  return { status: 200, data: products }
}
