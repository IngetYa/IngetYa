import { eroot, futor } from "@/core/kel"
import type { IAny, ILanguage, ILocaleData } from "@/types/LibTypes"
import { findQuery, setQueries } from "@/core/queries"
import { iform } from "@/lib/iform"
import type { ILocaleKey } from "@/types/PortalTypes"

const langKey = "locale"

// selalu fallback ke 'en'
let currentLanguage: ILanguage = "en"

// memory
const locales: ILocaleData = {}

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
export function addLocaleData(localeData: ILocaleData): void {
  Object.keys(localeData).forEach((k) => (locales[k] = localeData[k]))
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
  return new Promise((resolve) => {
    const langId = currentLanguage === "id"
    const langEn = currentLanguage === "en"

    const langForm = iform(`
    <div class="box">
      <div class="f">
        <div class="title">
          <p class="tx center"><i class="fa-jelly-fill fa-regular fa-language"></i> Language</p>
        </div>
        <div class="btn btn-close"><i class="fa-jelly-fill fa-regular fa-circle-xmark"></i></div>
      </div>
      <div class="f tp">
        <div class="i">
          <div class="tx center">Pilih Bahasa | Choose Language</div>
        </div>
      </div>
      <div class="f bp">
        <div class="i">
          <div class="f p">
            <div class="radio">
              <label for="luna-lang-id">
                <input type="radio" name="luna-lang" id="luna-lang-id" value="luna-lang-id"${langId ? " checked" : ""} />
                <span>Bahasa Indonesia (Simplified)</span>
              </label>
            </div>
          </div>
          <div class="f p">
            <div class="radio">
              <label for="luna-lang-en">
                <input type="radio" name="luna-lang" id="luna-lang-en" value="luna-lang-en"${langEn ? " checked" : ""} />
                <span>English</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="f">
        <div class="s">
          <div class="btn btn-cancel">${lang("cancel")}</div>
        </div>
        <div class="s">
          <button class="btn btn-ok">${lang("ok")}</button>
        </div>
      </div>
    </div>`)

    // batalin
    const btnClose = futor(".btn-close", langForm)
    btnClose.onclick = () => {
      langForm.remove()
      resolve(currentLanguage)
    }

    // batalin
    const btnCancel = futor(".btn-cancel", langForm)
    btnCancel.onclick = () => {
      langForm.remove()
      resolve(currentLanguage)
    }

    // kirim ke localstorage
    langForm.onsubmit = (e) => {
      e.preventDefault()

      const formData = new FormData(langForm)

      const submittedLang = formData.get("luna-lang")?.toString()

      const newLanguage: ILanguage = submittedLang === "luna-lang-id" ? "id" : "en"

      setLanguage(newLanguage)

      langForm.remove()

      return resolve(newLanguage)
    }

    eroot().append(langForm)
  })
}
