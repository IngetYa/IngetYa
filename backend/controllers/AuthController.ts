import cfg from "#cfg"
import { isProd, parseBase64, rNumber, toBase64 } from "#lib/gen"
import { webhook } from "#main/webhook/webhook"
import UserModel from "#models/UserModel"
import { IAny, IResTemp } from "#types/LibTypes"
import { IExternalUser, IUser, IUserTemp } from "#types/UserTypes"
import { Colors } from "discord.js"

const HOST: string = isProd ? `https://${cfg.APP_HOST}` : `http://localhost:${cfg.APP_PORT}`

const PROV_HOST = "https://devanka.id/luna"

export async function getMe(uid: string): Promise<IResTemp> {
  // cari user berdasarkan id
  const user = await UserModel.findOne({ id: uid }).lean()
  // kalo ga ketemu, berarti belum login
  if (!user) return { status: 401, code: "unauthorized", error: "Unauthorized" }

  // siapin return data
  const userData: IUserTemp = {
    id: user.id,
    luna: user.luna,
    email: user.email,
    access: user.access
  }

  // kirim data
  return { status: 200, code: "ok", data: userData }
}

export async function authLogin(s: IAny, query: IAny): Promise<IResTemp> {
  // pastiin email itu string
  if (typeof s?.email !== "string") return { status: 400, code: "auth_err_01" }

  // jadiin kecil semua, biar konsisten
  const email = s.email.toString().toLowerCase() as string

  // regex format email
  const mailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g
  if (!email.match(mailValid)) return { status: 400, code: "auth_err_02" }

  // parse dari base64 jadi object biasa
  const q = parseBase64(query.i)

  const stateData = {
    client_id: cfg.LUNA_CLIENT_ID,
    redirect_uri: `${HOST}/x/auth/redirect`,
    initialEmail: s.email,
    lang: typeof q.lang === "string" && q.lang === "id" ? "id" : "en",
    // jadiin base64 kembali
    state: toBase64(q)
  }

  // jadiin query ({url}?client_id={string}&redirect_uri={string})
  const queryString = new URLSearchParams(stateData).toString()

  const url = `${PROV_HOST}/authorize?${queryString}`

  return { status: 200, code: "ok", data: { url } }
}

export async function processThirdParty(usr: IExternalUser): Promise<IResTemp> {
  // cari user
  const existingAccount = await UserModel.findOne({ luna: usr.id }).lean()

  // kalo ada, pake data yg udah ada
  if (existingAccount) {
    return { status: 200, data: { user: existingAccount } }
  }

  // bikin Id baru
  const userId = "7" + rNumber(5).toString() + UserModel.countDocuments()

  // bikin doc user baru
  const newUser: IUser = {
    id: userId,
    luna: usr.id,
    email: usr.email ? usr.email : `usr${usr.id}@luna.devanka.id`,
    name: usr.name,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  await UserModel.create(newUser)

  // kirim webhook
  webhook("accounts", {
    title: "Registered",
    description: `**ID** ${userId}\n**Luna** ${usr.id}`,
    color: Colors.Green,
    ts: true
  })

  return { status: 200, data: { user: newUser } }
}
