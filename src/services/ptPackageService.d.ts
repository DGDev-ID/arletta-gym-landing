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

  export interface MemberPtPackage {
    id: number
    pt_package_id?: number
    user_id?: number
    pt_id?: number | null
    remaining_sessions?: number
    total_sessions?: number
    status?: string
    pt_package?: {
      id?: number
      name?: string
      duration_in_sessions?: number
      price?: string | number
      gym?: { id?: number; name?: string } | null
    }
    trainer?: {
      id?: number
      name?: string
      image?: string
    } | null
    [key: string]: unknown
  }

  export function getPtPackages(params?: Record<string, unknown>): Promise<PtPackage[]>
  export function getPtPackage(id: number | string): Promise<PtPackage>
  export function getMemberPtPackages(): Promise<MemberPtPackage[]>
  export function plotTrainer(payload: {
    pt_id: number
    user_pt_package_id: number
  }): Promise<unknown>

  const _default: {
    getPtPackages: typeof getPtPackages
    getPtPackage: typeof getPtPackage
    getMemberPtPackages: typeof getMemberPtPackages
    plotTrainer: typeof plotTrainer
  }
  export default _default
}
