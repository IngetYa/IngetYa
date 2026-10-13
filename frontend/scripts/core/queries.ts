import type { IAny, IQueries, IURLQueries } from "@/types/LibTypes"
import { qutor } from "@/core/kel"

const queries: IURLQueries = {}

const wininp: IQueries = {}

const inpGlobal = qutor("#xxx", document.documentElement, "input")
try {
  const inpGlobalJSON = JSON.parse(inpGlobal?.value || "{}")
  setWininp(inpGlobalJSON)
} catch {
  console.error("Parse global input failed")
}

const urlParams = new URLSearchParams(window.location.search)
urlParams.forEach((val, key) => (queries[key] = val))

export function setQueries(s: IURLQueries): void {
  Object.keys(s).forEach((k) => (queries[k] = s[k]))
}

export function setWininp(s: IQueries): void {
  Object.keys(s).forEach((k) => (wininp[k] = s[k]))
}

export function getQueries(): IURLQueries {
  return queries
}

export function getStringQueries(s?: IURLQueries): string {
  const obj = s ?? queries
  return new URLSearchParams(obj).toString()
}

export function findQuery(key: string): IAny {
  return queries[key]
}

export function findWininp(key: string): IAny {
  return wininp[key]
}

export function delQuery(...args: string[]): void {
  args.forEach((key) => {
    delete queries[key]
  })
}
