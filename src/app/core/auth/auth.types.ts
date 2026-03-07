export type Role = 'USER' | 'ADMIN'

export type UserInfo = {
  id?: number
  email: string
  role: Role
  firstName?: string
  lastName?: string
  username?: string
}

export type AuthResponse = { token: string }
