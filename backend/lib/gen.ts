import fs from "fs"
import crypto from "crypto"
import cfg from "#cfg"
import { IAny, IReplacerType, IResponse, IResTemp, IQueryParam } from "#types/LibTypes"
import waittime from "#core/waittime"

export const isProd: boolean = cfg.APP_PRODUCTION
export const isMidtransProd: boolean = cfg.MIDTRANS_PRODUCTION

// random unique string tipe 1
export function genhex(n: number = 8, radix: number = 36): string {
  return crypto.randomBytes(n).toString("hex") + Date.now().toString(radix)
}

// random unique string tipe 2
export function rString(n: number = 8): string {
  return crypto.randomBytes(n).toString("hex")
}

// random number
export function rNumber(n: number = 6): number {
  let a: string = ""
  for (let i: number = 1; i < n; i++) {
    a += "0"
  }
  return Math.floor(Math.random() * Number("9" + a)) + Number("1" + a)
}

// random patterned id (RIP ENGLISH aowkwkwk)
export function rUid(): string {
  const rstring = rNumber(1).toString() + (Date.now() + rNumber(6)).toString(36).substring(1)
  return rstring + Date.now().toString(36)
}

// transpile cepet response.status sama response.json
export function rep(options: IResTemp): IResponse {
  const repData: IResponse = {
    ok: options.code === 200 || options.ok || false,
    code: options.code,
    data: options.data,
    msg: options.msg || "not_found",
    errors: options.errors,
    error: options.error
  }

  if (options.code === 200 && !options.msg) repData.msg = "Ok"

  return repData
}

// ngilangin karakter khusus query mongodb, sanitasi kotor (tadinya buat filter database)
export function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// loop mkdir biar ga error kalo path ga ketemu
export async function addDir(dirpath: string): Promise<void> {
  let curpath = "."
  const dirs: string[] = dirpath.split("/")

  for (const dir of dirs) {
    curpath += `/${dir}`
    if (!fs.existsSync(curpath)) {
      fs.mkdirSync(curpath)
      await waittime(100)
    }
  }
}

// loop mkdir biar ga error kalo path ga ketemu, dan terakhir writefile
export async function createFile(filePath: string, fileData: string): Promise<void> {
  let curpath = "."
  const dirs: string[] = filePath.split("/")

  const total = dirs.length

  for (let i = 0; i < total - 1; i++) {
    curpath += `/${dirs[i]}`
    if (!fs.existsSync(curpath)) {
      fs.mkdirSync(curpath)
      await waittime(100)
    }
  }

  fs.writeFileSync(filePath, fileData, "utf-8")
}

// loop mkdir biar ga error kalo path ga ketemu, dan terakhir readfile
export function checkFile(filePath: string): boolean {
  let curpath = "."
  const dirs: string[] = filePath.split("/")

  const total = dirs.length
  let currentNull = false

  for (let i = 0; i < total; i++) {
    curpath += `/${dirs[i]}`
    if (currentNull === true) return false
    if (!fs.existsSync(curpath)) {
      currentNull = true
    }
  }

  if (currentNull === true) return false

  return true
}

// loop mkdir biar ga error kalo path ga ketemu, dan terakhir exists
export function getFile(filePath: string, fileEncoding: BufferEncoding = "utf-8"): string | null {
  let curpath = "."
  const dirs: string[] = filePath.split("/")

  const total = dirs.length
  let currentNull = false

  for (let i = 0; i < total; i++) {
    curpath += `/${dirs[i]}`
    if (currentNull === true) return null
    if (!fs.existsSync(curpath)) {
      currentNull = true
    }
  }

  if (currentNull === true) return null

  const file = fs.readFileSync(filePath, fileEncoding).toString()

  return file
}

// cek tipe url
export function isValidURL(url: string): boolean {
  try {
    const urlString = new URL(url)
    if (urlString.origin) return true
    return false
  } catch {
    return false
  }
}

// cek state object properti dari base64
export function parseBase64(query: IAny): IQueryParam {
  try {
    const data = JSON.parse(Buffer.from(query.toString(), "base64").toString()) as IQueryParam
    return data
  } catch (err) {
    console.error(err)
    return { errorParse: "1" }
  }
}

// buat object jadi string base64
export function toBase64(query: IAny): string {
  try {
    const data = Buffer.from(JSON.stringify(query)).toString("base64")
    return data
  } catch (err) {
    console.error(err)
    const data = Buffer.from(JSON.stringify({ errorParse: true })).toString("base64")
    return data
  }
}

// pisahin string pake batas tertentu
export function chunkString(str: string, size: number = 500): string[] {
  const chunk: string[] = []
  let i = 0
  while (i < str.length) {
    chunk.push(str.slice(i, i + size))
    i += size
  }

  return chunk
}

// ganti text tertentu jadi text tertentu aowkwk
export function replaceStr(text: string, replacements: IReplacerType): string {
  const regex = new RegExp(Object.keys(replacements).join("|"), "g")

  const result = text.replace(regex, (matched) => replacements[matched]!)

  return result
}
