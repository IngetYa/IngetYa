import { PermissionsString } from "discord.js"
import { IAny } from "#types/LibTypes"

export interface SelectMenu {
  customId: string
  cooldown?: number
  allowInteractionAuthorOnly?: boolean
  permissions?: Array<PermissionsString> | PermissionsString
  checkIfCIDIncludes?: boolean
  execute: (...args: IAny[]) => IAny
}
