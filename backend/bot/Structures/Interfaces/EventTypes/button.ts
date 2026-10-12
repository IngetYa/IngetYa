import { PermissionsString } from "discord.js"
import { IAny } from "#types/LibTypes"

export interface Button {
  customId: string
  checkIfCustomIdIncludes?: boolean
  cooldown?: number
  permissions?: Array<PermissionsString> | PermissionsString
  allowInteractionAuthorOnly?: boolean
  execute: (...args: IAny[]) => IAny
}
