import "webfont-awesome-pro/css/fontawesome.css"
import "webfont-awesome-pro/css/solid.css"
import "webfont-awesome-pro/css/light.css"
import "webfont-awesome-pro/css/jelly-duo-regular.css"
import "@/scss/lib/_iform.scss"
import "@/scss/app.scss"
import { StateManager } from "./Pages/App/core/StateManager"
import { addLocaleData, loadLocale, setLanguage } from "./core/languages"
import appLocaleData from "@/locales/AppLocale.json"

function startApp(): void {
  // load kode 'locale'
  loadLocale((newLang) => setLanguage(newLang))

  // tambahin ke data locale
  addLocaleData(appLocaleData)

  // langsung cek history state
  const stateManager = new StateManager()
  stateManager.init()
}

window.addEventListener("DOMContentLoaded", () => startApp())
