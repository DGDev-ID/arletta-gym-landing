declare module '@/services/scheduleService' {
  export function getSchedules(params?: Record<string, unknown>): Promise<unknown>
  export function getClasses(params?: Record<string, unknown>): Promise<unknown[]>
  export function getClassCategories(): Promise<unknown[]>

  const _default: {
    getSchedules: typeof getSchedules
    getClasses: typeof getClasses
    getClassCategories: typeof getClassCategories
  }
  export default _default
}
