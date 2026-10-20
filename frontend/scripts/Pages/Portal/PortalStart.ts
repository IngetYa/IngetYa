import portalLocaleData from "@/locales/PortalLocale.json"
import { addLocaleData, loadLocale, setLanguage } from "@/core/languages"
import { PortalSignIn } from "./PortalSignIn"
import { findQuery, findWininp } from "@/core/queries"
import { PortalCheck } from "./PortalCheck"
import { PortalError } from "./PortalError"

// bikin portal
export async function createSignInForm() {
  // base form
  const signInForm = new PortalSignIn()

  // next function kalo login berhasil
  signInForm.onSuccessLogin(() => startAppContent())

  // render formnya
  signInForm.init()
}

export async function startAppContent(): Promise<void> {
  // base user check
  const userCheck = new PortalCheck()

  // ambil info user
  const user = await userCheck.getUser()

  // kalo user ga ketemu (belum login), kasih portal
  if (user.status !== 200) return createSignInForm()

  // kalo udah, redirect ke '/app'
  window.location.href = "/app"
}

// awal dari segala awal
export async function startPortalApp(): Promise<void> {
  // load kode 'locale'
  loadLocale((newLang) => setLanguage(newLang))

  // tambahin ke data locale
  addLocaleData(portalLocaleData)

  const errMsg = findQuery("errorMsg")

  if (findQuery("error")) {
    // base error portal
    const lunaErr = new PortalError(errMsg)
    // next function
    lunaErr.onAcknowledge(() => startAppContent())
    // render error
    lunaErr.init()

    return
  }

  if (findWininp("error")) {
    // base error portal
    const lunaErr = new PortalError(findWininp("msg"), true)
    // next function
    lunaErr.onAcknowledge(() => startAppContent())
    // render error
    lunaErr.init()
    return
  }

  startAppContent()
}
