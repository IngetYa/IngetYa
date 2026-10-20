export type UserProvider = "google" | "discord" | "github" | "tiktok" | "facebook" | "luna"

export interface IExternalUser {
  ok: true
  id: string
  name: string
  email?: string
}

export interface IUserSession {
  id: string
  createdAt: number
}

export interface IUserAuth {
  id: string
  email?: string
  nickname?: string
}

export type UserAccess = "ADMIN" | "DEV"

export interface IUser {
  id: string
  luna: string
  email: string
  name: string
  createdAt: number
  updatedAt: number
  access?: UserAccess[]
}

export type IUserTemp = Partial<IUser>
