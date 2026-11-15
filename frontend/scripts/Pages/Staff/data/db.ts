import { ProductsAPI } from "@/Pages/Staff/API/ProductsAPI"
import type { IBankFee, IPriceDetail } from "@/types/PaymentTypes"
import type { IUser } from "@/types/UserTypes"
import { OverviewAPI } from "../API/OverviewAPI"
import { BalanceAPI } from "../API/BalanceAPI"
import { TransactionAPI } from "../API/TransactionAPI"
import { OrderAPI } from "../API/OrderAPI"
import { BillAPI } from "../API/BillAPI"
import { UserAPI } from "../API/UserAPI"

type LocalDBType = {
  products: ProductsAPI
  me: IUser
  price: IPriceDetail
  fee: IBankFee[]
  overview: OverviewAPI
  balance: BalanceAPI
  transaction: TransactionAPI
  orders: OrderAPI
  bills: BillAPI
  users: UserAPI
}

// kasih nilai default
const db: LocalDBType = {
  products: new ProductsAPI(),
  me: { name: "unknown", createdAt: Date.now(), email: "unknown", id: "unknown", luna: "unknown" },
  price: {
    "price_book-1": 7610000,
    "price_guest-1": 7610000,
    "price_guest-2": 7610000,
    "price_guest-3": 7610000,
    "price_guest-4": 7610000,
    "price_month-1": 7610000,
    "price_month-2": 7610000
  },
  fee: [],
  overview: new OverviewAPI(),
  balance: new BalanceAPI(),
  transaction: new TransactionAPI(),
  orders: new OrderAPI(),
  bills: new BillAPI(),
  users: new UserAPI()
}

export default db
