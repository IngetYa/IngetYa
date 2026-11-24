import { kel } from "@/core/kel"

type PickMultiple = "single" | "multiple" | "1"
type FileToReturn = File | File[]

export function selectFile(contentType: string, multiple: PickMultiple, callback: (file?: FileToReturn) => void): void {
  const inp = kel("input")
  inp.type = "file"

  const isMultiple = multiple === "multiple"

  inp.multiple = isMultiple
  inp.accept = contentType

  inp.onchange = () => {
    const files = inp.files

    if (isMultiple && files) return callback(Array.from(files))
    if (files) return callback(files[0])
    return callback()
  }

  inp.click()
}
