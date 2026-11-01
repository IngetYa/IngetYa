import ProductModel from "#models/ProductModel"
import { IResTemp } from "#types/LibTypes"

export async function getExploreProducts(): Promise<IResTemp> {
  const products = await ProductModel.find({ isActive: true }).lean()

  return { status: 200, data: products }
}
