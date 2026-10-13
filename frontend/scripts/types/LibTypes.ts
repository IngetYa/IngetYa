export type SSKelement = HTMLElementTagNameMap[keyof HTMLElementTagNameMap]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IAny = any

export type IURLQueries = Record<string, string>
export type IQueries = Record<string, string | number | boolean | null>

export type IRequestType = "POST" | "GET"

export interface IResponseRaw {
  ok: boolean
  code: number
  msg: string
  data?: IAny
  errors?: IAny
}

export type IResponse = IResponseRaw & Record<string, IAny>

export interface ILocale {
  id: string
  en: string
}

export interface KelementAttr {
  c?: string
  class?: string
  "."?: string
  id?: string
  "#"?: string
  a?: {
    [key: string]: string | number | boolean
  }
  attr?: {
    [key: string]: string | number | boolean
  }
  child?: SSKelement | string | (SSKelement | string)[]
  e?: SSKelement | string | (SSKelement | string)[]
}
export interface ILocale {
  id: string
  en: string
}
export type ILocaleData = Record<string, ILocale>

export type ILanguage = "id" | "en"
