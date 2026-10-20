import type { IPortalClass } from "@/types/PortalTypes"
import { eroot, kel } from "@/core/kel"
import { lang } from "@/core/languages"
import waittime from "@/lib/waittime"
import xhr from "@/lib/xhr"
import type { IResponse } from "@/types/LibTypes"
import type { IUser } from "@/types/UserTypes"

async function checkUser(useAuth?: string): Promise<IResponse> {
  const authStr = useAuth === "1" ? `?apps=${useAuth}` : ""

  // cek kalo user udah login
  const user = await xhr.get(`/x/auth/get-user${authStr}`)

  // kalo too many request, ulangi setelah semenit. aowkwk
  if (user.status === 429) {
    await waittime(1000)
    return await checkUser(useAuth)
  }

  // kalo gagal, kirim apa adanya
  if (!user.ok) return user

  return user
}

export class PortalCheck implements IPortalClass {
  readonly id: string = "portal-check"

  private user?: IUser
  private el!: HTMLDivElement

  locked: boolean = false
  constructor(private text?: string) {}

  private createElement(): void {
    this.el = kel("div", "PortalCheck")
    this.el.innerHTML = `
    <div class="box"><p><i class="fa-solid fa-circle-notch fa-spin"></i> ${this.text || lang("connecting")}</p></div>`

    eroot().append(this.el)
  }

  destroy(): void {
    this.el.remove()
  }

  async getUser(useAuth?: string): Promise<IResponse> {
    this.createElement()

    // kirim info user
    const userData = await checkUser(useAuth)

    await waittime(1000)

    this.destroy()

    return userData
  }
}
