import type { IAny } from "@/types/LibTypes"
import type localeLang from "@/locales/StaffLocale.json"

export interface IPortalClass {
  locked: boolean
  destroy(): IAny
  id: string
}

export type ILocaleKey = /* keyof typeof lunaLang */ keyof typeof localeLang | ({} & string)
