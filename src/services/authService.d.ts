export interface AuthUser {
  id: number | string
  name: string
  email?: string
  role?: string
}

export function login(email: string, password: string): Promise<{ user: AuthUser; token: string }>
export function logout(): Promise<void>
export function register(payload: Record<string, unknown>): Promise<{ user: AuthUser; token: string }>
export function forgotPassword(email: string): Promise<unknown>
export function resetPassword(payload: Record<string, unknown>): Promise<unknown>
export function emergencyContact(payload: Record<string, unknown>): Promise<unknown>
export function me(): Promise<unknown>
export function memberMe(): Promise<unknown>
export function updateUserMe(payload: Record<string, unknown>): Promise<unknown>
export function persistToken(token: string | null): void
export function loginAndPersist(email: string, password: string): Promise<{ user: AuthUser; token: string }>
export function registerAndPersist(payload: Record<string, unknown>): Promise<{ user: AuthUser; token: string }>

export default {
  login,
  logout,
  register,
  forgotPassword,
  resetPassword,
  emergencyContact,
  me,
  memberMe,
  updateUserMe,
  persistToken,
  loginAndPersist,
  registerAndPersist,
}

export default { login, logout }
