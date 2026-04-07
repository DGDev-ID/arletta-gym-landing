export interface MembershipRaw {
  id?: number | string
  name?: string
  price?: number
  duration_in_days?: number
  gym_id?: number | string
  gym?: { id?: number; name?: string } | null
  active_promos?: unknown
  membershipPromos?: unknown
  membership_promos?: unknown
  promos?: unknown
}

export function getMemberships(params?: Record<string, unknown>): Promise<MembershipRaw[]>
export function getMembership(id: string | number): Promise<MembershipRaw>

export default { getMemberships, getMembership }
