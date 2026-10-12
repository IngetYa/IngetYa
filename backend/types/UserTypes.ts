export type UserProvider = "luna"

export interface IExternalUserData {
  externalId: string
  email: string
  provider: UserProvider
  name?: string
}

export interface IExternalUser {
  id: string
  data: IExternalUserData[]
  created: number
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

export type UserAccess = "ADMIN" | "LUNA_DEV"

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
