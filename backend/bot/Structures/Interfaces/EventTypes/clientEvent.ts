import { ClientEvents } from "discord.js"
import { IAny } from "#types/LibTypes"

interface EventOptions {
  ONCE?: boolean
  REST?: boolean
}

export interface ClientEvent {
  name: keyof ClientEvents
  options?: EventOptions
  execute: (...args: IAny[]) => IAny
}
