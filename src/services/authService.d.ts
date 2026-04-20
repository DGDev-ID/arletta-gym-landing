export interface AuthUser {
  id: number | string
  name: string
  email?: string
  role?: string
}

export function login(email: string, password: string): Promise<{ user: AuthUser; token: string }>
export function logout(): Promise<void>
export function register(
  payload: Record<string, unknown>,
): Promise<{ user: AuthUser; token: string }>
export function forgotPasswordSendOtp(email: string): Promise<unknown>
export function forgotPasswordSubmitToken(email: string, token: string): Promise<unknown>
export function forgotPasswordChangePassword(payload: {
  email: string
  token: string
  password: string
  password_confirmation: string
}): Promise<unknown>
export function emergencyContact(payload: Record<string, unknown>): Promise<unknown>
export function me(): Promise<unknown>
export function memberMe(): Promise<unknown>
export function updateUserMe(payload: Record<string, unknown>): Promise<unknown>
export function persistToken(token: string | null): void
export function loginAndPersist(
  email: string,
  password: string,
): Promise<{ user: AuthUser; token: string }>
export function registerAndPersist(
  payload: Record<string, unknown>,
): Promise<{ user: AuthUser; token: string }>

export default {
  login,
  logout,
  register,
  forgotPasswordSendOtp,
  forgotPasswordSubmitToken,
  forgotPasswordChangePassword,
  emergencyContact,
  me,
  memberMe,
  updateUserMe,
  persistToken,
  loginAndPersist,
  registerAndPersist,
}

export default { login, logout }
