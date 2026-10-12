import { SlashCommandOptionsOnlyBuilder } from "discord.js"
import { IAny } from "#types/LibTypes"

interface CommandOptions {
  cooldown?: number
  description?: string
}

export interface SlashCommand {
  data: SlashCommandOptionsOnlyBuilder
  options?: CommandOptions
  execute: (...args: IAny[]) => IAny
}
