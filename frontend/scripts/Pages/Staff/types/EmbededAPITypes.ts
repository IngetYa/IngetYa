import type { IBill, IMessage, IOrder } from "@/types/ServiceTypes"
import type { IUser } from "@/types/UserTypes"

export interface IOverview {
  id: string
  value: number
  timestamp?: Date
}
type BalanceType = "income" | "expense" | "none"

export interface IBalance {
  amount: number
  type: BalanceType
  isRoot?: boolean
  isOrg?: boolean
  createdAt: Date
  group: "last" | "first"
}

export interface ITransaction {
  amount: number
  id: string
  name: string
  desc?: string
  type: BalanceType
  author: string
  timestamp: Date
}

export interface IPaginatedMeta {
  totalDocs: number
  totalPages: number
  currentPage: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  meta: IPaginatedMeta
}

export interface IBalanceReturn {
  balance: IBalance[]
  transactions: PaginatedResult<ITransaction>
}

export interface IOrderStaff extends IOrder {
  price: number
}

export interface IBillStaff extends IBill {
  name: string
  paymentId: string
}

export interface IUserStaff extends IUser {
  orderSize: number
}

export interface IMessageStaff extends IMessage {
  userName: string
  isSent?: boolean
}
