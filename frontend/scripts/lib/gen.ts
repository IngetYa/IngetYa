import type { IAny, IQueries } from "@/types/LibTypes"

// random unique string tipe 1
export function genStringId(radix: number = 36): string {
  return Date.now().toString(radix) + Math.random().toString(radix).substring(2, 9)
}

// random unique string tipe 2
export function rStr(radix: number = 36): string {
  return Date.now().toString(radix)
}

// sanitasi kasar, element to text
export function toText(rawText: string): string {
  const div = document.createElement("div")
  div.innerText = rawText

  const newText = div.innerHTML.toString()
  div.remove()

  return newText
}

// buang selain angka, jadiin tipe 'number'
export function toNumber(text: string | number): number {
  if (typeof text === "number") return text

  return Number(text.replace(/\D/g, ""))
}

// jadiin format kurensi berdasarkan locale, (1000 > 1.000)
export function toCurrency(num: string | number, locales?: Intl.LocalesArgument): string {
  const number = toNumber(num)

  return number < 1 ? "" : new Intl.NumberFormat(locales ?? "id-ID").format(number)
}

// base64 to object
export function parseBase64(query: IAny): IQueries {
  try {
    const data = JSON.parse(atob(query))
    return data
  } catch (err) {
    console.error(err)
    return { errorParse: true }
  }
}

// object to base64
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

// copy to new object
export function toObject(rawObject: IAny): IAny {
  const newObject = JSON.parse(JSON.stringify(rawObject))
  return newObject
}

// hilangin extension (my_file.3gp > my_file)
export function sanitizeName(filename: string): string {
  const noExtension = filename.replace(/\.[^/.]+$|[^a-z0-9_-]/gi, "")
  return noExtension
}
