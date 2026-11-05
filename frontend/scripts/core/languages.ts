import type { IAny, ILanguage, ILocale, ILocaleData } from "@/types/LibTypes"
import { findQuery, setQueries } from "@/core/queries"
import type { ILocaleKey } from "@/types/PortalTypes"
import { formSelect } from "@/lib/modal"

const langKey = "locale"

// selalu fallback ke 'en'
let currentLanguage: ILanguage = "en"

// memory
const locales: ILocaleData = {}

// sementara hard coded
export const LangName: ILocale = {
  id: "Bahasa Indonesia (Acak Kadut)",
  en: "English"
}

// baca locale browser
export function browserLocale(): ILanguage {
  // cari pake 'navigator'
  const browserLocales = !navigator.languages ? [navigator.language] : navigator.languages

  // kalo gada, kirim 'en'
  if (!browserLocales) return "en"

  // pisahin '{code}-{CODE}'
  // 'id-ID' >> 'id', 'en-US' >> 'en'
  const primaryLocale = browserLocales[0].trim().split(/-|_/)[0]

  return primaryLocale === "id" ? "id" : "en"
}

// baca di storage tersimpan
export function getSavedLocale(): string | null {
  // kalo gada, jangan paksa
  if (!window.localStorage) return null
  const file = window.localStorage.getItem(langKey)

  try {
    return file || null
  } catch {
    return null
  }
}

// tentuin hasil akhir bahasa
export function loadLocale(callback?: (s: IAny) => IAny): void {
  // dari localstorage
  const file = getSavedLocale()

  // dari query param
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

// save ke localstorage
export function saveLocale(): void {
  window.localStorage.setItem(langKey, currentLanguage)
}

// assign data locale ke memory
export function addLocaleData(...localeData: ILocaleData[]): void {
  localeData.forEach((data) => Object.assign(locales, data))
}

// ambil kode locale
export function getLanguage(): ILanguage {
  return currentLanguage
}

// set locale
export function setLanguage(newLanguage: ILanguage): void {
  // set juga di memory query param
  setQueries({ lang: newLanguage })

  // kalo sama, jangan lanjut
  if (currentLanguage === newLanguage) return

  // ganti atribut lang '<html lang="{code}"></html>'
  document.documentElement.setAttribute("lang", newLanguage)
  document.documentElement.lang = newLanguage

  // ganti kode memory
  currentLanguage = newLanguage

  saveLocale()
}

// ambil string berdasarkan locale
// tadinya pake 'lang.{code}'
export function lang(key: ILocaleKey): string {
  const langString = locales[key.toLowerCase()]?.[currentLanguage]
  if (!langString) {
    console.info(`[AOWKWK] Missing locale string: '${key}'. If you see this, please tell Devanka about the missing string. Thanks :)`)
  }

  return langString || key
}

// modal switch lang
export async function changeLang(): Promise<ILanguage | undefined> {
  const langResult = await formSelect({
    header: '<i class="fa-jelly-fill fa-regular fa-language"></i> Language',
    msg: "Pilih Bahasa | Choose Language",
    items: [
      { id: "luna-lang-id", label: LangName.id, checked: currentLanguage === "id" },
      { id: "luna-lang-en", label: LangName.en, checked: currentLanguage === "en" }
    ]
  })

  if (!langResult) return currentLanguage

  const newLanguage: ILanguage = langResult === "luna-lang-id" ? "id" : "en"

  setLanguage(newLanguage)

  return newLanguage
}
