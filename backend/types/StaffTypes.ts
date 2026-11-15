type BalanceType = "income" | "expense" | "none"

export interface IBalance {
  amount: number
  type: BalanceType
  isRoot?: boolean
  isOrg?: boolean
  createdAt: Date
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
