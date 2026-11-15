import { IBankFee, IPriceDetail } from "./PaymentTypes"
import { IBill, IOrder, IProduct } from "./ServiceTypes"
import { IUserTemp } from "./UserTypes"

export interface IProfileDetail {
  me?: IUserTemp
  price: IPriceDetail
  fee: IBankFee[]
}

export interface IUserData {
  me?: IUserTemp
  price: IPriceDetail
  fee: IBankFee[]
  orders: IOrder[]
  bills: IBill[]
  products: IProduct[]
  socket: string
}
