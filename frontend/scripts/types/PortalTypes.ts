import { IAny } from "@/types/LibTypes"
import type portalLang from "@/locales/PortalLocale.json"

export interface IPortalClass {
  locked: boolean
  destroy(): IAny
  id: string
}

export type ILocaleKey = /* keyof typeof lunaLang */ keyof typeof portalLang | ({} & string)
