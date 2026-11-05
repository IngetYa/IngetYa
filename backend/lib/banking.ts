import { formatDigit, rNumber } from "./gen"

export type BankVA = () => string

export type BankTransferHandler = Record<string, BankVA>

const vaTime: Record<string, number> = {}

export const BankMethods: BankTransferHandler = {
  bca: () => {
    // (6 - 18) 16 digit
    const todayTransactionNumber = vaTime.bca++
    const formatted = formatDigit(todayTransactionNumber, 4)
    return `6969${rNumber(4)}${formatted}${rNumber(4)}`
  },
  bni: () => {
    // (8 or 12) 12 digit
    const todayTransactionNumber = vaTime.bni++
    const formatted = formatDigit(todayTransactionNumber, 4)
    return `6969${formatted}${rNumber(4)}`
  },
  bri: () => {
    // 18 digit
    const todayTransactionNumber = vaTime.bri++
    const formatted = formatDigit(todayTransactionNumber, 4)
    return `6969${rNumber(8)}${formatted}${rNumber(2)}`
  },
  cimb: () => {
    // 12 digit
    const todayTransactionNumber = vaTime.cimb++
    const formatted = formatDigit(todayTransactionNumber, 4)
    return `6969${formatted}${rNumber(4)}`
  },
  other_va: () => {
    return BankMethods.bri()
  },
  mandiri: () => {
    // (6 - 12) 10 digit
    const todayTransactionNumber = vaTime.mandiri++
    const formatted = formatDigit(todayTransactionNumber, 4)
    return `6969${formatted}${rNumber(2)}`
  }
}
