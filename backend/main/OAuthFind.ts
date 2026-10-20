import cfg from "#cfg"
import { isProd, toBase64 } from "#lib/gen"
import { IAny } from "#types/LibTypes"
import { UserProvider } from "#types/UserTypes"

const HOST: string = isProd ? `https://${cfg.APP_HOST}` : `http://localhost:${cfg.APP_PORT}`
const PROV_HOST = "https://devanka.id"

// redirect to endpoint > AuthRouter
const CallBackURL: Record<string, IAny> = {
  luna(queryString: string) {
    return `${PROV_HOST}/luna/authorize?${queryString}`
  },
  google(queryString: string) {
    return `${PROV_HOST}/luna/google?${queryString}`
  },
  github(queryString: string) {
    return `${PROV_HOST}/luna/github?${queryString}`
  },
  discord(queryString: string) {
    return `${PROV_HOST}/luna/discord?${queryString}`
  },
  facebook(queryString: string) {
    return `${PROV_HOST}/luna/facebook?${queryString}`
  }
}

export function isProviderValid(provider: string): boolean {
  const valid_provider: UserProvider[] = ["google", "github", "discord", "facebook", "luna"]

  // pake Array.find karna string full, jangan pake Array.includes
  if (valid_provider.find((k) => k === provider)) return true
  return false
}

export function getOAuthUrl(provider: UserProvider, query: IAny) {
  // copy ke variable baru, biar ga ke-assign ke object lama
  const states = JSON.parse(JSON.stringify(query || {}))

  const stateData = {
    ...states,
    client_id: cfg.LUNA_CLIENT_ID,
    redirect_uri: `${HOST}/x/auth/redirect`,
    lang: typeof states.lang === "string" && states.lang === "id" ? "id" : "en"
  }

  // state "state" masuk url, jadiin string base64 dulu
  if (states.state) stateData.state = toBase64(states.state)

  // jadiin query ({url}?client_id={string}&redirect_uri={string})
  const queryString = new URLSearchParams(stateData).toString()

  // cari & lempar redirect url
  const redirectUrl = CallBackURL[provider](queryString)
  return redirectUrl
}

export async function getOAuthUser(code: string): Promise<IAny> {
  // API Luna (https://devanka.id/luna, https://devanka.id/luunna)
  // standard OAuth2 API lewat HTTP Request - JSON
  const getAccess = await fetch(`${PROV_HOST}/luna/api/v1/token`, {
    method: "POST",
    // harusnya tambahin "Accept": "application/json", tapi males update di Luna
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: cfg.LUNA_CLIENT_ID,
      client_secret: cfg.LUNA_CLIENT_SECRET,
      code: code,
      redirect_uri: `${HOST}/x/auth/redirect`,
      grant_type: "authorization_code"
    })
  })
    .then((res) => res.json())
    .then((res) => res)
    .catch((err) => {
      return { ok: false, errors: err, error: true }
    })

  // kalo gagal, jangan paksa ke bawah, buang-buang bandwidth anjing
  if (!getAccess.access_token) return getAccess

  // standard read-only access to Profile/User
  const userInfo = await fetch(`${PROV_HOST}/luna/api/v1/user`, {
    method: "GET",
    // standard OAuth2 disuruh wajib pake "Bearer" kocak.. tadinya mo pake cipher
    headers: { Authorization: `Bearer ${getAccess.access_token}` }
  })
    .then((res) => res.json())
    .then((res) => res)
    .catch((err) => {
      return { ok: false, errors: err, error: true }
    })
  return userInfo
}
