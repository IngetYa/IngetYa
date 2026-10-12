/* eslint-disable @typescript-eslint/no-explicit-any */

export type IValidateObject = {
  [key: string]: "string" | "number" | "boolean"
}

export type IValidateArray = string[]

export type IAny = any

export type IRequestType = "POST" | "GET"

export interface IResTemp {
  ok?: boolean
  code: number
  msg?: string
  data?: IAny
  error?: IAny
  errors?: IAny
  [key: string]: IAny
}

export interface IResponse extends IResTemp {
  ok: boolean
  msg: string
}

export type IReplacerType = Record<string, string>

export type IQueryParam = Record<string, string | number | boolean | null>
