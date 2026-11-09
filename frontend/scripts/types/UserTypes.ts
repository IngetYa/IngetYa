export type UserAccess = "staff" | "support" | "products" | "orders" | "bills" | "accounts" | "balance"

export interface IUser {
  id: string
  luna: string
  email: string
  name: string
  createdAt: number
  access?: UserAccess[]
}
