import portalLocaleData from "@/locales/PortalLocale.json"
import { addLocaleData, loadLocale, setLanguage } from "@/core/languages"
import { PortalSignIn } from "./PortalSignIn"
import { findQuery, findWininp } from "@/core/queries"
import { PortalCheck } from "./PortalCheck"
import { PortalError } from "./PortalError"
import { PortalSuccess } from "./PortalSuccess"
import waittime from "@/lib/waittime"

export async function createSignInForm() {
  const signInForm = new PortalSignIn()

  signInForm.onSuccessLogin(() => startAppContent())

  signInForm.init()
}

export async function startAppContent(): Promise<void> {
  const userCheck = new PortalCheck()

  const user = await userCheck.getUser()

  if (user.status !== 200) return createSignInForm()

  const lunaSuccess = new PortalSuccess()
  lunaSuccess.onAcknowledge(() => startAppContent())

  window.location.href = `${findQuery("redirect") || "/app"}`

  await waittime(1000)

  lunaSuccess.init()
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
