import type { KelementAttr, SSKelement } from "@/types/LibTypes"

// lib buat cepet 'document.querySelector', base: element parent
// kirim tag element-nya, kirim 'null' kalo gada
export function qutor<KelementTag extends keyof HTMLElementTagNameMap>(classnames: string, parent?: HTMLElement, _tagName?: KelementTag): HTMLElementTagNameMap[KelementTag] | null {
  const el = parent ?? document.body
  return el.querySelector(classnames)
}

// sama kek di atas, tapi nganggep tag element-nya pasti ada
export function futor<KelementTag extends keyof HTMLElementTagNameMap>(classnames: string, parent?: HTMLElement, _tagName?: KelementTag): HTMLElementTagNameMap[KelementTag] {
  const el = parent ?? document.body
  return el.querySelector(classnames) as HTMLElementTagNameMap[KelementTag]
}

// biar cepet, ambil tag parent root di bawah body
export function eroot(): HTMLDivElement {
  return document.querySelector(".app") as HTMLDivElement
}

const idAliases = ["id", "#"] as const
const childAliases = ["child", "e"] as const
const attrAliases = ["a", "attr"] as const

// buat kirim id alias dari element
function getIdValue(cla: KelementAttr): string | undefined {
  for (const key of idAliases) {
    if (key in cla) return cla[key]
  }
  return undefined
}

// buat kirim alias atribut lain dari element
function getAttrValue(cla: KelementAttr): string | number | boolean | undefined {
  for (const key of attrAliases) {
    if (key in cla) return cla[key] as string | number | boolean | undefined
  }
  return undefined
}

// kirim element child atau string
function getChildValue(cla: KelementAttr): (keyof SSKelement | string)[] | undefined {
  for (const key of childAliases) {
    const k = key as string
    if (key in cla) return Array.isArray(cla[k as keyof KelementAttr]) ? (cla[k as keyof KelementAttr] as (keyof SSKelement | string)[]) : [cla[k as keyof KelementAttr] as keyof SSKelement | string]
  }
  return undefined
}

// lib bikin element baru, 'document.createElement', kirim balik element-nya
export function kel<KelementTag extends keyof HTMLElementTagNameMap>(tagName: KelementTag, className?: string | null, prop?: KelementAttr): HTMLElementTagNameMap[KelementTag] {
  const el = document.createElement(tagName)
  idAliases.forEach((alias) => {
    if (prop?.[alias]) {
      const idVal = getIdValue({ [alias]: prop[alias] })
      if (idVal) el.id = idVal
    }
  })
  if (className) el.className = className
  attrAliases.forEach((alias) => {
    if (prop?.[alias]) {
      const attrVal = getAttrValue({ [alias]: prop[alias] })
      if (attrVal) {
        if (typeof attrVal === "object" && attrVal !== null) {
          Object.keys(attrVal).forEach((attribute) => {
            if (attrVal?.[attribute] && typeof attrVal[attribute] === "string") {
              el.setAttribute(attribute, attrVal[attribute])
            }
          })
        }
      }
    }
  })
  childAliases.forEach((alias) => {
    if (prop?.[alias]) {
      const childVal = getChildValue({ [alias]: prop[alias] })
      if (childVal) {
        childVal.forEach((childElement) => {
          if (typeof childElement === "string") {
            el.innerHTML += childElement
          } else {
            el.append(childElement)
          }
        })
      }
    }
  })
  return el
}
