export interface MembershipRaw {
  id?: number | string
  name?: string
  price?: number
  duration_in_days?: number
  gym?: { name?: string } | null
  active_promos?: unknown
  membershipPromos?: unknown
  membership_promos?: unknown
  promos?: unknown
}

export function getMemberships(): Promise<MembershipRaw[]>
export function getMembership(id: string | number): Promise<MembershipRaw>

export default { getMemberships, getMembership }
