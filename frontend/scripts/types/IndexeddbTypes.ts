import type { IAny } from "@/types/LibTypes"

export type FileDataType = "audio" | "image" | "json" | "script" | "style" | "type_definition"

export interface FileMetadata {
  path: string
  projectId: string
  folder: string
  fileName: string
  type: FileDataType
  updatedAt: number
}

export interface FileContent {
  path: string
  content: Blob | string | Record<string, IAny>
}
