import { PaginatedResult, paginateQuery } from "#main/PaginateDoc"
import BalanceModel from "#models/BalanceModel"
import BillModel from "#models/BillModel"
import MessageModel from "#models/MessageModel"
import OrderModel from "#models/OrderModel"
import ProductModel from "#models/ProductModel"
import RoomModel from "#models/RoomModel"
import TransactionModel from "#models/TransactionModel"
import UserModel from "#models/UserModel"
import { IResTemp } from "#types/LibTypes"
import { IBill, IConvo, IMessage, IOrder } from "#types/ServiceTypes"
import { IBalance, ITransaction } from "#types/StaffTypes"
import { IUser } from "#types/UserTypes"

export interface IOverviewReturn {
  id: string
  value: number | string
  timestamp?: Date
}

export async function getDataOverview(_uid: string): Promise<IResTemp> {
  const overviewData: IOverviewReturn[] = []

  const balance = await BalanceModel.findOne({ type: "income" }, {}, { srot: { createdAt: -1 } }).lean()

  const products = await ProductModel.countDocuments({ isActive: true })

  const orders = await OrderModel.countDocuments({ status: "bundling" })

  const bills = await BillModel.countDocuments({ transaction_status: { $ne: "settlement" } })

  const users = await UserModel.countDocuments()

  if (!balance || products < 1 || users < 1) {
    throw new Error("Please setup your database before starting the service. Run 'npm run init-service' to initialize setup.")
  }

  overviewData.push({ id: "balance", timestamp: balance.createdAt, value: balance.amount })
  overviewData.push({ id: "products", value: products })
  overviewData.push({ id: "orders", value: orders })
  overviewData.push({ id: "bills", value: bills })
  overviewData.push({ id: "users", value: users })

  return { status: 200, data: overviewData }
}

interface IBalanceData extends IBalance {
  group: "last" | "first"
}

export interface IBalanceReturn {
  balance: IBalanceData[]
  transactions: PaginatedResult<ITransaction>
}

export async function getDataBalance(_uid: string): Promise<IResTemp> {
  const balanceRaw = await BalanceModel.aggregate([
    {
      $sort: { createdAt: 1 }
    },
    {
      $group: {
        _id: "$type",
        first: { $first: "$$ROOT" },
        last: { $last: "$$ROOT" }
      }
    },
    {
      $match: {
        _id: { $in: ["income", "expense", "none"] }
      }
    }
  ])

  const balance: IBalanceData[] = []

  const balanceIncome = balanceRaw.find((k) => k._id === "income")
  balance.push({ ...balanceIncome.first, group: "first" })
  balance.push({ ...balanceIncome.last, group: "last" })

  const balanceExpense = balanceRaw.find((k) => k._id === "expense")
  balance.push({ ...balanceExpense.first, group: "first" })
  balance.push({ ...balanceExpense.last, group: "last" })

  const balanceCurrent = balanceRaw.find((k) => k._id === "none")
  balance.push({ ...balanceCurrent.first, group: "first" })
  balance.push({ ...balanceCurrent.last, group: "last" })

  const transactions = await paginateQuery(TransactionModel, {}, { page: 1, limit: 30 })

  const data: IBalanceReturn = {
    balance,
    transactions
  }

  return { status: 200, data }
}

export async function getDataTransactions(_uid: string, pageNum: string): Promise<IResTemp> {
  const page = Number(pageNum)

  if (isNaN(page) || page < 1 || page > 100) {
    return { status: 404 }
  }

  const transactions = await paginateQuery(TransactionModel, {}, { page: Number(page), limit: 30 })

  return { status: 200, data: transactions }
}

export interface IOrderStaff extends IOrder {
  price: number
}

export async function getDataOrders(_uid: string, pageNum: string): Promise<IResTemp> {
  const page = Number(pageNum)

  if (isNaN(page) || page < 1 || page > 100) {
    return { status: 404 }
  }

  const orders = await paginateQuery(OrderModel, {}, { page: Number(page), limit: 30 })

  const orderIds = orders.data.map((k) => k.id)

  const orderBills = await BillModel.find({ orderId: { $in: orderIds } }, { _id: 0, orderId: 1, price: 1 }).lean()

  const orderStaff: PaginatedResult<IOrderStaff> = {
    data: orders.data.map((k) => {
      const bill = orderBills.find((itm) => itm.orderId === k.id)
      return {
        ...k,
        price: bill?.price || 0
      }
    }),
    meta: orders.meta
  }

  return { status: 200, data: orderStaff }
}

export interface IBillStaff extends IBill {
  name: string
  paymentId: string
}

export async function getDataBills(_uid: string, pageNum: string): Promise<IResTemp> {
  const page = Number(pageNum)

  if (isNaN(page) || page < 1 || page > 100) {
    return { status: 404 }
  }

  const bills = await paginateQuery(BillModel, {}, { page: Number(page), limit: 30 })

  const billIds = bills.data.map((k) => k.orderId)

  const billOrders = await OrderModel.find({ id: { $in: billIds } }, { _id: 0, name: 1, paymentId: 1, id: 1 }).lean()

  const billStaff: PaginatedResult<IBillStaff> = {
    data: bills.data.map((k) => {
      const order = billOrders.find((itm) => itm.id === k.orderId)
      return {
        ...k,
        name: order?.name || `Order ${k.orderId}`,
        paymentId: order?.paymentId || "other_va"
      }
    }),
    meta: bills.meta
  }

  return { status: 200, data: billStaff }
}

export interface IUserStaff extends IUser {
  orderSize: number
}

export async function getDataUsers(_uid: string, pageNum: string): Promise<IResTemp> {
  const page = Number(pageNum)

  if (isNaN(page) || page < 1 || page > 100) {
    return { status: 404 }
  }

  const users = await paginateQuery(UserModel, {}, { page: Number(page), limit: 30 })

  const userIds = users.data.map((k) => k.id)

  const userOrders = await OrderModel.find({ userId: { $in: userIds } }, { _id: 0, userId: 1 }).lean()

  // const orderCounts = await OrderModel.find({ id: { $in: billIds } }, { _id: 0, name: 1, paymentId: 1, id: 1 }).lean()

  const userStaff: PaginatedResult<IUserStaff> = {
    data: users.data.map((k) => {
      const order = userOrders.filter((itm) => itm.userId === k.id)

      return {
        ...k,
        hex: "nodata",
        orderSize: order.length
      }
    }),
    meta: users.meta
  }

  return { status: 200, data: userStaff }
}

export async function getDataConvo(_uid: string, pageNum: string): Promise<IResTemp> {
  const page = Number(pageNum)

  if (isNaN(page) || page < 1 || page > 100) {
    return { status: 404 }
  }

  const rooms = await paginateQuery(RoomModel, {}, { page: Number(page), limit: 50 })

  const userIds = rooms.data.map((k) => k.userId)
  const orderIds = rooms.data.filter((k) => k.type === "order").map((k) => k.id)
  const messageIds = rooms.data.map((k) => k.latestChatId)

  const users = await UserModel.find({ id: { $in: userIds } }, { _id: 0, id: 1, name: 1 }).lean()

  const orders = await OrderModel.find({ id: { $in: orderIds } }, { _id: 0, id: 1, name: 1 }).lean()

  const messages = await MessageModel.find({ id: { $in: messageIds } }, { _id: 0, __v: 0 }).lean()

  const convos: IConvo[] = rooms.data.map((k) => {
    const message = messages.find((snap) => snap.roomId === k.id)!

    return {
      id: k.id,
      roomType: k.type,
      roomName: orders.find((order) => order.id === k.id)?.name || `Order ${k.id}`,
      userName: users.find((user) => user.id === k.userId)?.name || `User ${k.userId}`,
      unreads: 0,
      lastMessage: message
    }
  })

  const convoStaff: PaginatedResult<IConvo> = {
    data: convos,
    meta: rooms.meta
  }

  return { status: 200, data: convoStaff }
}

export interface IMessageStaff extends IMessage {
  userName: string
}

export async function getDataMessage(_uid: string, roomId: string, pageNum: string): Promise<IResTemp> {
  const page = Number(pageNum)

  if (isNaN(page) || page < 1 || page > 100) {
    return { status: 404 }
  }

  const chats = await paginateQuery(MessageModel, { roomId }, { page: 1, limit: 100 })

  const userIds = chats.data.map((k) => k.userId)

  const users = await UserModel.find({ id: { $in: userIds } }, { _id: 0, id: 1, name: 1 }).lean()

  const messages: PaginatedResult<IMessageStaff> = {
    meta: chats.meta,
    data: chats.data.map((k) => {
      const user = users.find((usr) => usr.id === k.userId)!

      return {
        ...k,
        userName: user.name
      }
    })
  }

  return { status: 200, data: messages }
}
