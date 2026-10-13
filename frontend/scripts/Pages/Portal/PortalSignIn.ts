import { formAlert, formConfirm } from "@/lib/modal"
import { toBase64 } from "@/lib/gen"
import { eroot, futor, kel, qutor } from "@/core/kel"
import { changeLang, lang } from "@/core/languages"
import { getQueries, getStringQueries } from "@/core/queries"
import waittime from "@/lib/waittime"
import xhr from "@/lib/xhr"
import { IAny } from "@/types/LibTypes"
import { IPortalClass } from "@/types/PortalTypes"

const strings: Record<string, () => string> = {
  redirecting: () => `<i class="fa-jelly-fill fa-regular fa-check"></i> <span>${lang("redirecting")}</span>`,
  processing: () => `<i class="fa-solid fa-circle-notch fa-spin"></i>`,
  login: () => `<i class="fa-solid fa-arrow-right-to-arc"></i> <span>${lang("auth_login")}</span>`,
  verify: () => `<i class="fa-solid fa-arrow-right-to-arc"></i> <span>${lang("auth_verify")}</span>`,
  google: () => `<img src="/assets/providers/google.svg" class="provider-icon" /> <span>Google</span>`,
  discord: () => `<img src="/assets/providers/discord.svg" class="provider-icon" /> <span>Discord</span>`,
  github: () => `<img src="/assets/providers/github_white.svg" class="provider-icon" /> <span>GitHub</span>`,
  tiktok: () => `<img src="/assets/providers/tiktok.svg" class="provider-icon" /> <span>TikTok</span>`,
  facebook: () => `<img src="/assets/providers/facebook.svg" class="provider-icon" /> <span>Facebook</span>`
}

const emailRegex: RegExp = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g

const IN_DEVELOPMENTS = ["tiktok", "facebook"]

export class PortalSignIn implements IPortalClass {
  readonly id: string = "portal-sign-in"
  locked: boolean = false
  private el!: HTMLDivElement

  private lastUsedEmail: string = ""

  private numStep: number = 1

  private btnLogin!: HTMLButtonElement
  private inpEmail!: HTMLInputElement

  private onSucessFunc?: (s?: IAny) => IAny

  private createElement(): void {
    this.el = kel("div", "PortalLogin")
    this.el.innerHTML = `
    <div class="PortalForms">
      <form action="/x/login" class="PortalEmail" id="login-form">
        <div class="f">
          <div class="title-icons">
            <img src="/assets/icons/ingetya.svg" alt="[IngetYa Logo]" />
          </div>
          <div class="title-title"></div>
          <div class="title-desc form-title"><i class="fa-solid fa-circle-notch fa-spin"></i></div>
        </div>
        <div class="f">
          <div class="btn btn-language">
            <i class="fa-jelly-fill fa-regular fa-language fa-fw"></i>
            <span>Bahasa/Language</span>
            <i class="fa-solid fa-chevron-down fa-fw"></i>
          </div>
        </div>
        <div class="f">
          <label for="login-email" class="label-email"><i class="fa-solid fa-circle-notch fa-spin"></i></label>
          <div class="inp">
            <div class="inp-icon">
              <i class="fa-jelly-fill fa-regular fa-envelope"></i>
            </div>
            <input type="email" name="login-email" id="login-email" placeholder="yourmail@email.com" autocomplete="email" maxlength="1000" required />
          </div>
        </div>
        <div class="group group-code">
        </div>
        <div class="f form-btn-actions">
          <div class="btn btn-restart hide"><i class="fa-jelly-fill fa-regular fa-pencil"></i> <span><i class="fa-solid fa-circle-notch fa-spin"></i></span></div>
          <button class="btn btn-login"><i class="fa-solid fa-arrow-right-to-arc"></i> <span><i class="fa-solid fa-circle-notch fa-spin"></i></span></button>
        </div>
      </form>
      <div class="PortalOthers">
        <div class="portal-other-divider">
          <span><i class="fa-solid fa-circle-notch fa-spin"></i></span>
        </div>
        <div class="login-providers">
          <a href="/luna/google" class="btn btn-google" id="google-login">
            <img src="/assets/providers/google.svg" class="provider-icon" />
            <span>Google</span>
          </a>
          <a href="/luna/github" class="btn btn-github" id="github-login">
            <img src="/assets/providers/github_white.svg" class="provider-icon" />
            <span>GitHub</span>
          </a>
          <a href="/luna/discord" class="btn btn-discord" id="discord-login">
            <img src="/assets/providers/discord.svg" class="provider-icon" />
            <span>Discord</span>
          </a>
          <a href="/luna/tiktok" class="btn btn-tiktok" id="tiktok-login">
            <img src="/assets/providers/tiktok.svg" class="provider-icon" />
            <span>TikTok</span>
          </a>
          <a href="/luna/facebook" class="btn btn-facebook" id="facebook-login">
            <img src="/assets/providers/facebook.svg" class="provider-icon" />
            <span>Facebook</span>
          </a>
        </div>
      </div>
    </div>
    <div class="PortalAcceptTerms">
      <p>By registering, you agree and accept the <a href="/legal/terms" target="_blank">Terms of Serivce</a> and <a href="/legal/privacy" target="_blank">Privacy Policy</a>.</p>
    </div>`

    this.btnLogin = futor(".btn-login", this.el, "button")
    this.inpEmail = futor("#login-email", this.el, "input")

    eroot().append(this.el)
  }

  private renderCodeField(): void {
    this.inpEmail.readOnly = true

    const fieldGroup = futor(".group-code")

    const field = kel("div", "f f-code-field")
    field.innerHTML = `
    <label for="login-code" class="label-code"><i class="fa-solid fa-circle-notch fa-spin"></i></label>
    <div class="inp">
      <div class="inp-icon">
        <i class="fa-jelly-fill fa-regular fa-lock"></i>
      </div>
      <input type="number" id="login-code" name="login-code" placeholder="------" autocomplete="off" maxlength="200" class="otp" max="999999" min="0" required />
    </div>
    <div class="sm code-notice">
      <p>We have sent you an email for your 6-digit verification code. Check the spam folder if it does not appear in your inbox.</p>
    </div>`

    fieldGroup.append(field)

    const btnRestart = futor(".btn-restart", this.el)
    btnRestart.classList.remove("hide")
  }

  private removeCodeField(): void {
    const codeField = futor(".f-code-field")
    if (codeField) codeField.remove()

    const btnRestart = futor(".btn-restart", this.el)
    btnRestart.classList.add("hide")

    this.inpEmail.readOnly = false
  }

  private updateString(): void {
    const formTitle = futor(".form-title", this.el)
    formTitle.innerHTML = "testing 1"

    const emailLabel = futor(".label-email", this.el)
    emailLabel.innerHTML = lang("auth_email")

    const restartText = futor(".btn-restart span", this.el)
    restartText.innerHTML = lang("auth_headback_btn")

    if (this.numStep === 1) {
      this.btnLogin.innerHTML = strings.login()
    } else if (this.numStep === 2) {
      this.btnLogin.innerHTML = strings.verify()
    }

    const dividerText = futor(".portal-other-divider span", this.el)
    dividerText.innerHTML = lang("auth_with_provider")

    const termText = futor(".PortalAcceptTerms p", this.el)
    termText.innerHTML = lang("auth_notice")

    this.updateCodeString()
  }

  private updateCodeString(): void {
    const codeLabel = qutor(".label-code", this.el)
    if (codeLabel) codeLabel.innerHTML = lang("auth_otp_code")

    const codeNotice = qutor(".code-notice", this.el)
    if (codeNotice) codeNotice.innerHTML = lang("auth_verification_otp")
  }

  private languageListener(): void {
    const btnLang = futor(".btn-language", this.el)
    btnLang.onclick = async () => {
      if (this.locked) return
      this.locked = true

      const changedLang = await changeLang()
      this.locked = false

      if (!changedLang) return

      this.updateString()
    }
  }

  private async formHandleEmail(form: HTMLFormElement): Promise<void> {
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

    const getCode = await xhr.post(`/luna/sign-in?i=${queryParams}`, {
      email
    })

    await waittime(1000)

    this.lastUsedEmail = email?.toString() || ""

    if (!getCode.ok) {
      this.btnLogin.innerHTML = strings.login()
      await formAlert(lang(getCode.msg))
      this.inpEmail.readOnly = false
      this.locked = false
      return
    }

    this.numStep = 2

    this.btnLogin.innerHTML = strings.verify()

    this.renderCodeField()

    this.updateCodeString()

    this.locked = false
  }
  private async formHandleCode(form: HTMLFormElement): Promise<void> {
    this.locked = true

    const formData = new FormData(form)

    const email = this.lastUsedEmail
    const code = formData.get("login-code")?.toString() || ""

    if (code.length !== 6) {
      await formAlert(lang("auth_otp_notfound"))
      this.locked = false
      return
    }

    this.btnLogin.innerHTML = strings.processing()

    const queryParams = toBase64(getQueries())

    const getVerified = await xhr.post(`/luna/verify?i=${queryParams}`, {
      email,
      code: Number(code)
    })

    await waittime(1000)

    if (!getVerified.ok) {
      this.btnLogin.innerHTML = strings.verify()
      await formAlert(lang(getVerified.msg))
      this.locked = false
      return
    }

    this.numStep = 3

    this.btnLogin.innerHTML = strings.redirecting()

    this.lastUsedEmail = ""

    this.locked = false

    this.destroy()
    this.goToUserArea()
  }

  private onFormSubmit(form: HTMLFormElement): void | Promise<void> {
    if (this.locked) return

    if (this.numStep === 1) return this.formHandleEmail(form)
    if (this.numStep === 2) return this.formHandleCode(form)
  }

  private formListener(): void {
    const form = futor("#login-form", this.el, "form")

    form.onsubmit = (e) => {
      e.preventDefault()
      this.onFormSubmit(form)
    }
  }

  private providerListener(): void {
    const loginButtons = document.querySelectorAll(".login-providers .btn") as NodeListOf<HTMLAnchorElement>

    loginButtons.forEach((btn) => {
      const currHref = btn.getAttribute("href") as string
      const btnId = btn.getAttribute("id")!.toString().replace("-login", "")

      btn.href = IN_DEVELOPMENTS.find((k) => k === btnId) ? window.location.href : `${currHref}?${getStringQueries()}`

      btn.onclick = async (e) => {
        e.preventDefault()
        if (this.locked) return
        this.locked = true

        if (IN_DEVELOPMENTS.find((k) => k === btnId)) {
          await formAlert(lang("auth_login_provider_maintenance").replace(/{PROVIDER}/, btnId))
          this.locked = false
          return
        }

        btn.style.width = `${btn.offsetWidth}px`
        btn.style.height = `${btn.offsetHeight}px`
        btn.innerHTML = strings.processing()
        await waittime(1000)
        window.location.href = btn.getAttribute("href") as string
        await waittime(3000)
        btn.removeAttribute("style")
        btn.innerHTML = strings[btnId]()
        this.locked = false
      }
    })
  }

  private btnChangeListener(): void {
    const btnRestart = futor(".btn-restart", this.el)
    btnRestart.onclick = async () => {
      if (this.locked || this.numStep !== 2) return
      this.locked = true

      const confRestart = await formConfirm({
        header: lang("auth_headback_btn"),
        msg: lang("auth_headback_msg")
      })

      this.locked = false

      if (!confRestart) return

      this.numStep = 1

      this.removeCodeField()
    }
  }

  onSuccessLogin(newFunc: (s?: IAny) => IAny): void {
    this.onSucessFunc = newFunc
  }

  private goToUserArea(): void {
    if (this.onSucessFunc) {
      this.onSucessFunc()
      this.onSucessFunc = undefined
    }
  }

  destroy() {
    this.lastUsedEmail = ""
    this.numStep = 1
    this.el.remove()
  }

  init(): this {
    this.createElement()
    this.updateString()
    this.languageListener()
    this.formListener()
    this.providerListener()
    this.btnChangeListener()
    return this
  }
}
