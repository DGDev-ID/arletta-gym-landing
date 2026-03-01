declare module '@/services/mockAuth' {
  export interface DemoUser {
    id: number
    name: string
    email: string
    role: 'member' | 'pt'
  }

  export function login(email: string, password: string): Promise<DemoUser>
  export function getDummyAccounts(): Array<{
    email: string
    password: string
    role: string
    name: string
  }>
}

declare module '*/mockAuth.js'
