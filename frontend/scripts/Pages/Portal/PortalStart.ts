import portalLocaleData from "@/locales/PortalLocale.json"
import { addLocaleData, loadLocale, setLanguage } from "@/core/languages"
import { PortalSignIn } from "./PortalSignIn"
import { findQuery, findWininp } from "@/core/queries"
import { PortalCheck } from "./PortalCheck"
import { PortalError } from "./PortalError"

export async function createSignInForm() {
  const signInForm = new PortalSignIn()

  signInForm.onSuccessLogin(() => startAppContent())

  signInForm.init()
}

export async function startAppContent(): Promise<void> {
  const userCheck = new PortalCheck()

  const user = await userCheck.getUser()

  if (user.code !== 200) return createSignInForm()

  window.location.href = "/app"
}

export async function startPortalApp(): Promise<void> {
  loadLocale((newLang) => setLanguage(newLang))

  addLocaleData(portalLocaleData)

  const errMsg = findQuery("errorMsg")

  if (findQuery("error")) {
    const lunaErr = new PortalError(errMsg)
    lunaErr.onAcknowledge(() => startAppContent())
    lunaErr.init()
    return
  }

  if (findWininp("error")) {
    const lunaErr = new PortalError(findWininp("msg"), true)
    lunaErr.onAcknowledge(() => startAppContent())
    lunaErr.init()
    return
  }

  startAppContent()
}
