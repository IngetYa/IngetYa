import whatsapp from "../../../../config/whatsapp.json"
import { formAlert, formConfirm, formLoading, formPrompt } from "@/lib/modal"
import { toBase64 } from "@/lib/gen"
import { eroot, futor, kel, qutor } from "@/core/kel"
import { changeLang, lang } from "@/core/languages"
import { findQuery, getQueries, getStringQueries } from "@/core/queries"
import waittime from "@/lib/waittime"
import xhr from "@/lib/xhr"
import type { IAny } from "@/types/LibTypes"
import type { IPortalClass } from "@/types/PortalTypes"
import { type IRippleReturn, SetRipple } from "@/lib/Ripple"
import { Colors } from "@/core/Colors"

type AuthMethod = "email" | "whatsapp"

const strings: Record<string, () => string> = {
  redirecting: () => `<i class="fajdr fa-regular fa-check"></i> <span>${lang("redirecting")}</span>`,
  processing: () => `<i class="fa-solid fa-circle-notch fa-spin"></i>`,
  login: () => `<i class="fas fa-arrow-right-to-arc"></i> <span>${lang("auth_login")}</span>`,
  verify: () => `<i class="fas fa-arrow-right-to-arc"></i> <span>${lang("auth_verify")}</span>`,
  back: () => `<i class="fas fa-arrow-left"></i> <span>${lang("label_error_back")}</span>`,
  luna: () => `<img src="/assets/providers/luna.svg" class="provider-icon" /> <span>Luna</span>`,
  google: () => `<img src="/assets/providers/google.svg" class="provider-icon" /> <span>Google</span>`,
  whatsapp: () => `<img src="/assets/providers/whatsapp.svg" class="provider-icon" /> <span>WhatsApp</span>`,
  email: () => `<i class="fajdr fa-envelope"></i> <span>${lang("auth_email")}</span>`,
  hex: () => `<i class="fajdr fa-key"></i> <span>${lang("auth_label_guest")}</span>`
}

const emailRegex: RegExp = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/
const whatsappRegex: RegExp = /^\+?[0-9]{9,15}$/

const IN_DEVELOPMENTS = ["tiktok", "facebook"]

export class PortalSignIn implements IPortalClass {
  readonly id: string = "portal-sign-in"
  locked: boolean = false
  private el!: HTMLDivElement

  private btnLogin!: HTMLButtonElement
  private inpPrimary!: HTMLInputElement
  private groupPrimary!: HTMLDivElement
  private groupCode!: HTMLDivElement
  private formActions!: HTMLDivElement
  private btnBack?: HTMLDivElement
  private inpOtp?: HTMLInputElement

  private authMethod: AuthMethod = "email"
  private isOtpStep: boolean = false
  private submittedTarget: string = ""

  private ripples: IRippleReturn[] = []

  private onSucessFunc?: (s?: IAny) => IAny

  private createElement(): void {
    this.el = kel("div", "PortalLogin")

    this.el.innerHTML = `<div class="PortalForms"> <form action="/x/auth/login" class="PortalEmail" id="login-form"> <div class="f"> <div class="title-icons"> <img src="/assets/icons/ingetya-text.svg" alt="[IngetYa Logo]" /> </div> <div class="title-title"></div> <div class="title-desc form-title"><i class="fa-solid fa-circle-notch fa-spin"></i></div> </div> <div class="f"> <div class="btn btn-language"> <i class="fajdr fa-regular fa-language fa-fw"></i> <span>Bahasa/Language</span> <i class="fa-solid fa-chevron-down fa-fw"></i> </div> </div> <div class="f group-primary"></div> <div class="group group-code"></div> <div class="f form-btn-actions"> <button class="btn btn-login"><i class="fa-solid fa-arrow-right-to-arc"></i> <span><i class="fa-solid fa-circle-notch fa-spin"></i></span></button> </div> </form> <div class="PortalOthers"> <div class="portal-other-divider"> <span><i class="fa-solid fa-circle-notch fa-spin"></i></span> </div> <div class="login-providers"> <a href="https://wa.me/6292323768559?text=%2FLoginIngetYa" class="btn btn-whatsapp" id="whatsapp-login"> <img src="/assets/providers/whatsapp.svg" class="provider-icon" /> <span>WhatsApp</span> </a> <a href="/x/auth/google" class="btn btn-google" id="google-login"> <img src="/assets/providers/google.svg" class="provider-icon" /> <span>Google</span> </a> <a href="/x/auth/luna" class="btn btn-luna" id="luna-login"> <img src="/assets/providers/luna.svg" class="provider-icon" /> <span>Luna</span> </a> <a href="/x/auth/hex" class="btn btn-hex" id="hex-login"> <i class="fajdr fa-key"></i> <span>${lang("auth_label_guest")}</span> </a> </div> </div> </div> <div class="PortalAcceptTerms"> <p>By registering, you agree and accept the <a href="/legal/terms" target="_blank">Terms of Serivce</a> and <a href="/legal/privacy" target="_blank">Privacy Policy</a>.</p> </div>`

    this.btnLogin = futor(".btn-login", this.el, "button")
    this.groupPrimary = futor(".group-primary", this.el, "div")
    this.groupCode = futor(".group-code", this.el, "div")
    this.formActions = futor(".form-btn-actions", this.el, "div")

    this.renderPrimaryField()

    eroot().append(this.el)
  }

  private renderPrimaryField(): void {
    const isWa = this.authMethod === "whatsapp"
    const inputId = isWa ? "login-whatsapp" : "login-email"
    const inputType = isWa ? "tel" : "email"
    const autoComplete = isWa ? "tel" : "email"
    const iconHtml = isWa ? `<img src="/assets/providers/whatsapp.svg" class="provider-icon" width="18" height="18" />` : `<i class="fajdr fa-envelope"></i>`

    this.groupPrimary.innerHTML = `<label for="${inputId}" class="label-primary">${lang(isWa ? "auth_whatsapp" : "auth_email")}</label> <div class="inp"> <div class="inp-icon">${iconHtml}</div> <input type="${inputType}" name="${inputId}" id="${inputId}" placeholder="${lang(isWa ? "whatsapp_placeholder" : "email_placeholder")}" autocomplete="${autoComplete}" maxlength="1000" required /> </div>`

    this.inpPrimary = futor(`#${inputId}`, this.groupPrimary, "input")
  }

  private renderOtpField(): void {
    this.groupCode.innerHTML = `<div class="f"> <label for="login-otp" class="label-otp">${lang("auth_otp_code")}</label> <div class="inp"> <div class="inp-icon"><i class="fajdr fa-lock"></i></div> <input type="text" class="otp" name="login-otp" id="login-otp" placeholder="${lang("otp_placeholder")}" autocomplete="one-time-code" inputmode="numeric" maxlength="12" required /> </div> <div class="sm code-notice">${lang("auth_verification_otp")}</div> </div>`
    this.inpOtp = futor("#login-otp", this.groupCode, "input")

    if (!this.btnBack) {
      this.btnBack = kel("div", "btn btn-back")
      this.btnBack.innerHTML = strings.back()
      this.btnBack.onclick = () => this.handleBackToTarget()
      this.formActions.prepend(this.btnBack)
    }

    this.isOtpStep = true
    this.btnLogin.innerHTML = strings.verify()
    this.inpOtp.focus()
  }

  private clearOtpStep(): void {
    this.groupCode.innerHTML = ""
    this.inpOtp = undefined

    if (this.btnBack) {
      this.btnBack.remove()
      this.btnBack = undefined
    }

    this.isOtpStep = false
    this.submittedTarget = ""
    this.inpPrimary.readOnly = false
    this.btnLogin.innerHTML = strings.login()
    this.inpPrimary.focus()
  }

  private async handleBackToTarget(): Promise<void> {
    if (this.locked) return
    this.locked = true

    const confirmed = await formConfirm({
      header: lang("label_error_back"),
      msg: lang("auth_otp_back_confirm")
    })

    this.locked = false

    if (!confirmed) return

    this.clearOtpStep()
  }

  private async switchAuthMethod(): Promise<void> {
    if (this.isOtpStep) {
      const confirmed = await formConfirm({
        header: lang("label_error_back"),
        msg: lang("auth_otp_back_confirm")
      })
      if (!confirmed) {
        this.locked = false
        return
      }
      this.clearOtpStep()
    }

    this.authMethod = this.authMethod === "email" ? "whatsapp" : "email"
    this.renderPrimaryField()
    // this.updateMethodToggleButton()
    this.inpPrimary.focus()
    this.locked = false
  }

  private updateMethodToggleButton(): void {
    const btnToggle = futor("#whatsapp-login", this.el, "a")
    btnToggle.innerHTML = this.authMethod === "email" ? strings.whatsapp() : strings.email()
    btnToggle.href = this.authMethod === "email" ? "/x/auth/whatsapp" : "/x/auth/email"
  }

  private updateString(): void {
    const isWa = this.authMethod === "whatsapp"
    this.inpPrimary.placeholder = lang(isWa ? "whatsapp_placeholder" : "email_placeholder")

    const formTitle = futor(".form-title", this.el)
    formTitle.innerHTML = lang("use_luna")

    const primaryLabel = futor(".label-primary", this.el)
    primaryLabel.innerHTML = lang(isWa ? "auth_whatsapp" : "auth_email")

    if (this.isOtpStep) {
      const otpLabel = futor(".label-otp", this.el)
      otpLabel.innerHTML = lang("auth_otp_code")
      if (this.inpOtp) this.inpOtp.placeholder = lang("otp_placeholder")
      if (this.btnBack) this.btnBack.innerHTML = strings.back()
      this.btnLogin.innerHTML = strings.verify()
    } else {
      this.btnLogin.innerHTML = strings.login()
    }

    const otpNotice = qutor(".code-notice", this.el)
    if (otpNotice) otpNotice.innerHTML = lang("auth_verification_otp")

    const dividerText = futor(".portal-other-divider span", this.el)
    dividerText.innerHTML = lang("auth_with_provider")

    const termText = futor(".PortalAcceptTerms p", this.el)
    termText.innerHTML = lang("auth_notice")

    // this.updateMethodToggleButton()

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

  private async formHandlePrimary(form: HTMLFormElement): Promise<void> {
    if (this.locked) return

    this.locked = true

    if (this.isOtpStep) {
      return await this.formHandleOtp()
    }

    this.inpPrimary.readOnly = true

    const formData = new FormData(form)
    const isWa = this.authMethod === "whatsapp"
    const fieldName = isWa ? "login-whatsapp" : "login-email"
    const rawVal = (formData.get(fieldName)?.toString() || "").trim()
    const isValid = isWa ? whatsappRegex.test(rawVal.replace(/[\s-]/g, "")) : emailRegex.test(rawVal)

    if (!isValid) {
      await formAlert(lang(isWa ? "whatsapp_not_valid" : "email_not_valid"))
      this.inpPrimary.readOnly = false
      this.locked = false
      return
    }

    const targetValue = isWa ? rawVal.replace(/[\s-]/g, "") : rawVal

    this.btnLogin.innerHTML = strings.processing()

    const queryParams = toBase64(getQueries())
    const payload = isWa ? { whatsapp: targetValue } : { email: targetValue }

    const res = await xhr.post(`/x/auth/sign-in?i=${queryParams}`, payload)

    await waittime(1000)

    if (!res.ok) {
      this.btnLogin.innerHTML = strings.login()
      await formAlert(lang(res.code))
      this.inpPrimary.readOnly = false
      this.locked = false
      return
    }

    this.submittedTarget = targetValue
    this.renderOtpField()

    this.locked = false
  }

  private async formHandleOtp(): Promise<void> {
    if (!this.inpOtp) {
      this.locked = false
      return
    }

    const otp = this.inpOtp.value.trim()
    if (!otp || otp.length < 4) {
      await formAlert(lang("auth_otp_not_valid"))
      this.locked = false
      return
    }

    this.inpOtp.readOnly = true
    this.btnLogin.innerHTML = strings.processing()

    const queryParams = toBase64(getQueries())
    const payload = this.authMethod === "whatsapp" ? { whatsapp: this.submittedTarget, otp } : { email: this.submittedTarget, otp }

    const res = await xhr.post(`/x/auth/verify?i=${queryParams}`, payload)

    await waittime(1000)

    if (!res.ok) {
      this.btnLogin.innerHTML = strings.verify()
      await formAlert(lang(res.code || "auth_otp_notfound"))
      this.inpOtp.readOnly = false
      this.locked = false
      return
    }

    this.goToUserArea(res.data?.url || "/app")

    this.btnLogin.innerHTML = strings.verify()
    this.inpOtp.readOnly = false
    this.locked = false
  }

  private formListener(): void {
    const form = futor("#login-form", this.el, "form")
    form.onsubmit = (e) => {
      e.preventDefault()
      this.formHandlePrimary(form)
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

      let fullHref: string = ""

      if (btn.classList.contains("btn-whatsapp")) {
        const curRedirect = findQuery("redirect")
        const uriText = whatsapp.command + (curRedirect ? ` ${curRedirect}` : "")
        const waText = encodeURIComponent(uriText.toString())
        fullHref = `https://wa.me/${whatsapp.phone_number}?text=${waText}`
      } else {
        fullHref = `${currHref}?${getStringQueries()}`
      }

      const toRipple = SetRipple(btn, {
        color: Colors.primaryDark,
        run: async () => {
          if (this.locked) return
          this.locked = true

          // if (btnId === "whatsapp") {
          //   return await this.switchAuthMethod()
          // }

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
