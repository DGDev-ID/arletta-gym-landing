export interface AuthUser {
  id: number | string
  name: string
  email?: string
  role?: string
}

export function login(email: string, password: string): Promise<{ user: AuthUser; token: string }>
export function logout(): Promise<void>

export default { login, logout }
