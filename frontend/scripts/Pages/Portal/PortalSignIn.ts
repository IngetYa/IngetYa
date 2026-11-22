import { formAlert, formLoading, formPrompt } from "@/lib/modal"
import { toBase64 } from "@/lib/gen"
import { eroot, futor, kel } from "@/core/kel"
import { changeLang, lang } from "@/core/languages"
import { getQueries, getStringQueries } from "@/core/queries"
import waittime from "@/lib/waittime"
import xhr from "@/lib/xhr"
import type { IAny } from "@/types/LibTypes"
import type { IPortalClass } from "@/types/PortalTypes"
import { type IRippleReturn, SetRipple } from "@/lib/Ripple"
import { Colors } from "@/core/Colors"

const strings: Record<string, () => string> = {
  redirecting: () => `<i class="fa-jelly-fill fa-regular fa-check"></i> <span>${lang("redirecting")}</span>`,
  processing: () => `<i class="fa-solid fa-circle-notch fa-spin"></i>`,
  login: () => `<i class="fa-solid fa-arrow-right-to-arc"></i> <span>${lang("auth_login")}</span>`,
  luna: () => `<img src="/assets/providers/luna.svg" class="provider-icon" /> <span>Luna</span>`,
  google: () => `<img src="/assets/providers/google.svg" class="provider-icon" /> <span>Google</span>`,
  hex: () => `<i class="fas fa-key"></i> <span>${lang("auth_label_guest")}</span>`
}

const emailRegex: RegExp = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g

const IN_DEVELOPMENTS = ["tiktok", "facebook"]

export class PortalSignIn implements IPortalClass {
  readonly id: string = "portal-sign-in"
  locked: boolean = false
  private el!: HTMLDivElement

  private btnLogin!: HTMLButtonElement
  private inpEmail!: HTMLInputElement

  private ripples: IRippleReturn[] = []

  private onSucessFunc?: (s?: IAny) => IAny

  private createElement(): void {
    this.el = kel("div", "PortalLogin")

    this.el.innerHTML = `<div class="PortalForms"> <form action="/x/auth/login" class="PortalEmail" id="login-form"> <div class="f"> <div class="title-icons"> <img src="/assets/icons/ingetya-text.svg" alt="[IngetYa Logo]" /> </div> <div class="title-title"></div> <div class="title-desc form-title"><i class="fa-solid fa-circle-notch fa-spin"></i></div> </div> <div class="f"> <div class="btn btn-language"> <i class="fa-jelly-fill fa-regular fa-language fa-fw"></i> <span>Bahasa/Language</span> <i class="fa-solid fa-chevron-down fa-fw"></i> </div> </div> <div class="f"> <label for="login-email" class="label-email"><i class="fa-solid fa-circle-notch fa-spin"></i></label> <div class="inp"> <div class="inp-icon"> <i class="fa-jelly-fill fa-regular fa-envelope"></i> </div> <input type="email" name="login-email" id="login-email" placeholder="yourmail@email.com" autocomplete="email" maxlength="1000" required /> </div> </div> <div class="group group-code"> </div> <div class="f form-btn-actions"> <button class="btn btn-login"><i class="fa-solid fa-arrow-right-to-arc"></i> <span><i class="fa-solid fa-circle-notch fa-spin"></i></span></button> </div> </form> <div class="PortalOthers"> <div class="portal-other-divider"> <span><i class="fa-solid fa-circle-notch fa-spin"></i></span> </div> <div class="login-providers"> <a href="/x/auth/google" class="btn btn-google" id="google-login"> <img src="/assets/providers/google.svg" class="provider-icon" /> <span>Google</span> </a> <a href="/x/auth/luna" class="btn btn-luna" id="luna-login"> <img src="/assets/providers/luna.svg" class="provider-icon" /> <span>Luna</span> </a> <a href="/x/auth/hex" class="btn btn-hex" id="hex-login"> <i class="fas fa-key"></i> <span>${lang("auth_label_guest")}</span> </a> </div> </div> </div> <div class="PortalAcceptTerms"> <p>By registering, you agree and accept the <a href="/legal/terms" target="_blank">Terms of Serivce</a> and <a href="/legal/privacy" target="_blank">Privacy Policy</a>.</p> </div>`

    this.btnLogin = futor(".btn-login", this.el, "button")
    this.inpEmail = futor("#login-email", this.el, "input")

    eroot().append(this.el)
  }

  private updateString(): void {
    this.inpEmail.placeholder = lang("email_placeholder")

    const formTitle = futor(".form-title", this.el)
    formTitle.innerHTML = lang("use_luna")

    const emailLabel = futor(".label-email", this.el)
    emailLabel.innerHTML = lang("auth_email")

    this.btnLogin.innerHTML = strings.login()

    const dividerText = futor(".portal-other-divider span", this.el)
    dividerText.innerHTML = lang("auth_with_provider")

    const termText = futor(".PortalAcceptTerms p", this.el)
    termText.innerHTML = lang("auth_notice")

    const btnHex = futor(".btn-hex", this.el)
    btnHex.innerHTML = strings.hex()
  }

  private languageListener(): void {
    const btnLang = futor(".btn-language", this.el)
    btnLang.onclick = async () => {
      if (this.locked) return
      this.locked = true

      const changedLang = await changeLang()
      this.locked = false

      if (!changedLang) return

      this.stopRipples()

      this.updateString()
      this.providerListener()
    }
  }

  private async formHandleEmail(form: HTMLFormElement): Promise<void> {
    if (this.locked) return

    this.locked = true

    this.inpEmail.readOnly = true

    const formData = new FormData(form)

    const email = formData.get("login-email")?.toString() || ""
    if (!email.match(emailRegex)) {
      await formAlert(lang("email_not_valid"))
      this.inpEmail.readOnly = false
      this.locked = false
      return
    }

    this.btnLogin.innerHTML = strings.processing()

    const queryParams = toBase64(getQueries())

    const getUrl = await xhr.post(`/x/auth/sign-in?i=${queryParams}`, {
      email
    })

    await waittime(1000)

    if (!getUrl.ok) {
      this.btnLogin.innerHTML = strings.login()
      await formAlert(lang(getUrl.code))
      this.inpEmail.readOnly = false
      this.locked = false
      return
    }

    this.goToUserArea(getUrl.data.url)

    this.btnLogin.innerHTML = strings.login()

    this.locked = false
    this.inpEmail.readOnly = false
  }

  private formListener(): void {
    const form = futor("#login-form", this.el, "form")
    form.onsubmit = (e) => {
      e.preventDefault()
      this.formHandleEmail(form)
    }
  }

  private goToUserArea(url: string): void {
    if (this.onSucessFunc) {
      this.onSucessFunc()
      this.onSucessFunc = undefined
    }

    window.location.href = url
  }

  private providerListener(): void {
    const loginButtons = document.querySelectorAll(".login-providers .btn") as NodeListOf<HTMLAnchorElement>

    loginButtons.forEach((btn) => {
      const currHref = btn.getAttribute("href") as string
      const btnId = btn.getAttribute("id")!.toString().replace("-login", "")

      const fullHref = `${currHref}?${getStringQueries()}`

      const toRipple = SetRipple(btn, {
        color: Colors.primaryDark,
        run: async () => {
          if (this.locked) return
          this.locked = true

          if (btnId === "hex") {
            return await this.hexLogin()
          }

          if (IN_DEVELOPMENTS.find((k) => k === btnId)) {
            await formAlert(lang("auth_login_provider_maintenance").replace(/{PROVIDER}/, btnId))
            this.locked = false
            return
          }

          btn.style.width = `${btn.offsetWidth}px`
          btn.style.height = `${btn.offsetHeight}px`
          btn.innerHTML = strings.processing()
          await waittime(1000)
          window.location.href = fullHref
          await waittime(3000)
          btn.removeAttribute("style")
          btn.innerHTML = strings[btnId]()

          this.locked = false
        }
      })

      this.ripples.push(toRipple)
    })
  }

  async hexLogin(): Promise<void> {
    const hexCode = await formPrompt({
      msg: lang("auth_label_hex"),
      header: lang("auth_label_guest")
    })

    if (!hexCode) {
      this.locked = false
      return
    }

    const userLogin = await formLoading(xhr.post("/x/auth/user-hex", { hex: hexCode }))
    if (!userLogin.ok) {
      await formAlert(lang(userLogin.code || "error"))
      return await this.hexLogin()
    }

    window.location.reload()

    this.locked = false
  }

  onSuccessLogin(newFunc: (s?: IAny) => IAny): void {
    this.onSucessFunc = newFunc
  }

  private stopRipples(): void {
    this.ripples.forEach((ripple) => ripple.stopListener())
    this.ripples.splice(0, this.ripples.length)
  }

  destroy() {
    this.stopRipples()

    this.el.remove()
  }

  init(): this {
    this.createElement()
    this.updateString()
    this.languageListener()
    this.formListener()
    this.providerListener()
    return this
  }
}
