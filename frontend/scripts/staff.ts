import "webfont-awesome-pro/css/fontawesome.css"
import "webfont-awesome-pro/css/solid.css"
import "webfont-awesome-pro/css/light.css"
import "webfont-awesome-pro/css/duotone-regular.css"
import "webfont-awesome-pro/css/jelly-duo-regular.css"
import "@/scss/lib/_iform.scss"
import "@/scss/staff.scss"
import { addLocaleData, loadLocale, setLanguage } from "./core/languages"
import dateLocaleData from "@/locales/DateLocale.json"
import staffLocaleData from "@/locales/StaffLocale.json"
import { Splash } from "./Pages/Staff/Splash"
import { eroot } from "@/core/kel"
import { StateManager } from "./Pages/Staff/core/StateManager"

function startApp(): void {
  // load kode 'locale'
  loadLocale((newLang) => setLanguage(newLang))

  // tambahin ke data locale
  addLocaleData(staffLocaleData, dateLocaleData)

  const splash = new Splash()
  eroot().append(splash.html)

  splash.onComplete(() => {
    // langsung cek history state
    const stateManager = new StateManager()
    stateManager.init()
  })

  // langsung load data app
  splash.loadData()
}

window.addEventListener("DOMContentLoaded", () => startApp())
