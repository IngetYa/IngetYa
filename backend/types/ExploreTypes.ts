import { IBankFee, IPriceDetail } from "./PaymentTypes"
import { IBill, IOrder, IProduct } from "./ServiceTypes"
import { IUserTemp } from "./UserTypes"

export interface IExploreDetail {
  me?: IUserTemp
  products: IProduct[]
  orders: IOrder[]
  bills: IBill[]
  price: IPriceDetail
  fee: IBankFee[]
}
