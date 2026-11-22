import { PermissionsString } from "discord.js"
import { IAny } from "#types/LibTypes"

interface CommandArgs {
  name: string
  type: "user" | "role" | "channel" | "string" | "number" | "boolean" | string | number | boolean
  required?: boolean
}

export interface PrefixCommand {
  name: string
  description?: string
  aliases?: Array<string>
  permissions?: Array<PermissionsString> | PermissionsString
  cooldown?: number
  isDevCommand?: boolean
  options?: Array<CommandArgs>
  execute: (...args: IAny[]) => IAny
}
