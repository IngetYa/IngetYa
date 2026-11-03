import { IBankFee, IPriceDetail } from "./PaymentTypes"
import { IProduct } from "./ServiceTypes"
import { IUserTemp } from "./UserTypes"

export interface IExploreDetail {
  me?: IUserTemp
  products: IProduct[]
  price: IPriceDetail
  fee: IBankFee[]
}
