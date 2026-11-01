import type { IAny } from "@/types/LibTypes"
import type appLang from "@/locales/AppLocale.json"

export interface IPortalClass {
  locked: boolean
  destroy(): IAny
  id: string
}

export type ILocaleKey = /* keyof typeof lunaLang */ keyof typeof appLang | ({} & string)
