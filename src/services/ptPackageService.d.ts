declare module '@/services/ptPackageService' {
  export interface PtPackage {
    id?: number | string
    name: string
    sessions: number
    price: number
    per_session?: number
    perSession?: number
    shareable?: boolean
    features?: string[]
    promo?: string
    description?: string
  }

  export function getPtPackages(params?: Record<string, unknown>): Promise<PtPackage[]>
  export function getPtPackage(id: number | string): Promise<PtPackage>

  const _default: {
    getPtPackages: typeof getPtPackages
    getPtPackage: typeof getPtPackage
  }
  export default _default
}
