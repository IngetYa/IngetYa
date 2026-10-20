import type { SSKelement } from "@/types/LibTypes"
import { kel } from "@/core/kel"

// bungkus child ke dalam iform
export function iform(childs?: string | SSKelement): HTMLFormElement {
  const formId = Date.now().toString(36)
  const el = kel("form", `iform form-${formId}`, { a: { action: "/wkwk", method: "post" } })
  if (typeof childs === "string") el.innerHTML = childs
  if (childs instanceof Node) el.append(childs)

  return el
}
