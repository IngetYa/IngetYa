import type { IUser } from "@/types/UserTypes"
import { ProductsAPI } from "../API/ProductsAPI"
import type { IBankFee, IPriceDetail } from "@/types/PaymentTypes"

type LocalDBType = {
  products: ProductsAPI
  me: IUser
  price: IPriceDetail
  fee: IBankFee[]
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
  fee: []
}

export default db
