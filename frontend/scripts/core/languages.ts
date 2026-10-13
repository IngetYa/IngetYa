import { eroot, futor } from "@/core/kel"
import type { IAny, ILanguage, ILocaleData } from "@/types/LibTypes"
import { findQuery, setQueries } from "@/core/queries"
import { iform } from "@/lib/iform"
import type { ILocaleKey } from "@/types/PortalTypes"

const langKey = "locale"

let currentLanguage: ILanguage = "en"

const locales: ILocaleData = {}

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

export function addLocaleData(localeData: ILocaleData): void {
  Object.keys(localeData).forEach((k) => (locales[k] = localeData[k]))
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

    const btnClose = futor(".btn-close", langForm)
    btnClose.onclick = () => {
      langForm.remove()
      resolve(currentLanguage)
    }

    const btnCancel = futor(".btn-cancel", langForm)
    btnCancel.onclick = () => {
      langForm.remove()
      resolve(currentLanguage)
    }

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
