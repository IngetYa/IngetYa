import "webfont-awesome-pro/css/fontawesome.css"
import "webfont-awesome-pro/css/solid.css"
import "webfont-awesome-pro/css/light.css"
import "webfont-awesome-pro/css/duotone-regular.css"
import "webfont-awesome-pro/css/jelly-duo-regular.css"
import "@/scss/lib/_iform.scss"
import "@/scss/app.scss"
import { StateManager } from "./Pages/App/core/StateManager"
import { addLocaleData, loadLocale, setLanguage } from "./core/languages"
import appLocaleData from "@/locales/AppLocale.json"
import dateLocaleData from "@/locales/DateLocale.json"
import { Splash } from "./Pages/App/Splash"
import { eroot } from "./core/kel"

function startApp(): void {
  loadLocale((newLang) => setLanguage(newLang))

  addLocaleData(appLocaleData, dateLocaleData)

  const splash = new Splash()
  eroot().append(splash.html)

  splash.onComplete(() => {
    const stateManager = new StateManager()
    stateManager.init()
  })

  splash.loadData()
}

window.addEventListener("DOMContentLoaded", () => startApp())
