import cfg from "#cfg"
import { isProd, toBase64 } from "#lib/gen"
import { IAny } from "#types/LibTypes"
import { UserProvider } from "#types/UserTypes"

const HOST: string = isProd ? `https://${cfg.APP_HOST}` : `http://localhost:${cfg.APP_PORT}`
const PROV_HOST = "https://devanka.id"

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

  if (valid_provider.find((k) => k === provider)) return true
  return false
}

export function getOAuthUrl(provider: UserProvider, query: IAny) {
  const states = JSON.parse(JSON.stringify(query || {}))

  const stateData: IAny = {
    client_id: cfg.LUNA_CLIENT_ID,
    redirect_uri: `${HOST}/x/auth/redirect`,
    lang: typeof states.lang === "string" && states.lang === "id" ? "id" : "en"
  }

  stateData.state = toBase64(states)

  const queryString = new URLSearchParams(stateData).toString()

  const redirectUrl = CallBackURL[provider](queryString)
  return redirectUrl
}

export async function getOAuthUser(code: string): Promise<IAny> {
  const getAccess = await fetch(`${PROV_HOST}/luna/api/v1/token`, {
    method: "POST",
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

  if (!getAccess.access_token) return getAccess

  const userInfo = await fetch(`${PROV_HOST}/luna/api/v1/user`, {
    method: "GET",
    headers: { Authorization: `Bearer ${getAccess.access_token}` }
  })
    .then((res) => res.json())
    .then((res) => res)
    .catch((err) => {
      return { ok: false, errors: err, error: true }
    })
  return userInfo
}
