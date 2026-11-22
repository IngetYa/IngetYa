import type { IAny, ILanguage, ILocale, ILocaleData } from "@/types/LibTypes"
import { findQuery, setQueries } from "@/core/queries"
import type { ILocaleKey } from "@/types/PortalTypes"
import { formSelect } from "@/lib/modal"

const langKey = "locale"

let currentLanguage: ILanguage = "en"

const locales: ILocaleData = {}

export const LangName: ILocale = {
  id: "Bahasa Indonesia (Acak Kadut)",
  en: "English"
}

export function browserLocale(): ILanguage {
  const browserLocales = !navigator.languages ? [navigator.language] : navigator.languages

  if (!browserLocales) return "en"

  const primaryLocale = browserLocales[0].trim().split(/-|_/)[0]

  return primaryLocale === "id" ? "id" : "en"
}

export function getSavedLocale(): string | null {
  if (!window.localStorage) return null
  const file = window.localStorage.getItem(langKey)

  try {
    return file || null
  } catch {
    return null
  }
}

export function loadLocale(callback?: (s: IAny) => IAny): void {
  const file = getSavedLocale()

  const queryLang = findQuery("lang")

  if (queryLang) {
    callback?.(queryLang === "id" ? "id" : "en")
  } else if (file) {
    callback?.(file === "id" ? "id" : "en")
  } else {
    callback?.(browserLocale())
    saveLocale()
  }
}

export function saveLocale(): void {
  window.localStorage.setItem(langKey, currentLanguage)
}

export function addLocaleData(...localeData: ILocaleData[]): void {
  localeData.forEach((data) => Object.assign(locales, data))
}

export function getLanguage(): ILanguage {
  return currentLanguage
}

export function setLanguage(newLanguage: ILanguage): void {
  setQueries({ lang: newLanguage })

  if (currentLanguage === newLanguage) return

  document.documentElement.setAttribute("lang", newLanguage)
  document.documentElement.lang = newLanguage

  currentLanguage = newLanguage

  saveLocale()
}

export function lang(key: ILocaleKey): string {
  const langString = locales[key.toLowerCase()]?.[currentLanguage]
  if (!langString) {
    console.info(`[AOWKWK] Missing locale string: '${key}'. If you see this, please tell Devanka about the missing string. Thanks :)`)
  }

  return langString || key
}

export async function changeLang(): Promise<ILanguage | undefined> {
  const langResult = await formSelect({
    header: '<i class="fa-jelly-fill fa-regular fa-language"></i> Language',
    msg: "Pilih Bahasa | Choose Language",
    items: [
      { id: "luna-lang-id", label: LangName.id, checked: currentLanguage === "id" },
      { id: "luna-lang-en", label: LangName.en, checked: currentLanguage === "en" }
    ]
  })

  if (!langResult) return undefined

  const newLanguage: ILanguage = langResult === "luna-lang-id" ? "id" : "en"

  setLanguage(newLanguage)

  return newLanguage
}
