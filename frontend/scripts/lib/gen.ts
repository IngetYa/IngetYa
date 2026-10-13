import { IAny, IQueries } from "@/types/LibTypes"

export function genStringId(radix: number = 36): string {
  return Date.now().toString(radix) + Math.random().toString(radix).substring(2, 9)
}

export function rStr(radix: number = 36): string {
  return Date.now().toString(radix)
}

export function toText(rawText: string): string {
  const div = document.createElement("div")
  div.innerText = rawText

  const newText = div.innerHTML.toString()
  div.remove()

  return newText
}

export function toNumber(text: string | number): number {
  if (typeof text === "number") return text

  return Number(text.replace(/\D/g, ""))
}

export function toCurrency(num: string | number, locales?: Intl.LocalesArgument): string {
  const number = toNumber(num)

  return number < 1 ? "" : new Intl.NumberFormat(locales ?? "id-ID").format(number)
}

export function parseBase64(query: IAny): IQueries {
  try {
    const data = JSON.parse(atob(query))
    return data
  } catch (err) {
    console.error(err)
    return { errorParse: true }
  }
}

export function toBase64(query: IAny): string {
  try {
    const data = btoa(JSON.stringify(query))
    return data
  } catch (err) {
    console.error(err)
    const data = btoa(JSON.stringify({ errorParse: true }))
    return data
  }
}

export function toObject(rawObject: IAny): IAny {
  const newObject = JSON.parse(JSON.stringify(rawObject))
  return newObject
}

export function sanitizeName(filename: string): string {
  const noExtension = filename.replace(/\.[^/.]+$|[^a-z0-9_-]/gi, "")
  return noExtension
}
