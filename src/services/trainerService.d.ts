declare module '@/services/trainerService' {
  export interface TrainerData {
    id: number
    name: string
    avatar?: string
    image?: string
    images?: string[]
    role?: string
    position?: string
    description?: string
    bio?: string
    rating?: number
    clients?: number
    clients_count?: number
    specializations?: string[]
    expertise?: string[]
    experience?: string
    years?: string
    certifications?: string[]
    instagram?: string
    trainer_id?: number
    today_schedule?: unknown[]
    recent_clients?: unknown[]
    [key: string]: unknown
  }

  export interface TrainerStats {
    expert_trainers_count?: number
    years_combined_experience?: number
    happy_clients_count?: number
    average_rating?: number
    total_sessions_completed?: number
    member_retention_rate?: number
    [key: string]: unknown
  }

  export interface SessionPayload {
    client_id: number
    date: string
    start_time: string
    end_time: string
    location?: string
    notes?: string
  }

  export interface SessionUpdatePayload {
    date?: string
    start_time?: string
    end_time?: string
    location?: string
    notes?: string
  }

  export function getTrainers(params?: Record<string, unknown>): Promise<TrainerData[]>
  export function getTrainer(id: number | string): Promise<TrainerData>
  export function getTrainerMe(): Promise<TrainerData>
  export function getTrainerClients(id: number | string): Promise<unknown[]>
  export function getTrainerClientsAll(): Promise<unknown[]>
  export function getTrainerSchedules(id: number | string): Promise<unknown[]>
  export function getTrainerStats(): Promise<TrainerStats>
  export function createSession(
    trainerId: number | string,
    payload: SessionPayload,
  ): Promise<unknown>
  export function updateSession(
    sessionId: number | string,
    payload: SessionUpdatePayload,
  ): Promise<unknown>
  export function cancelSession(
    sessionId: number | string,
    payload?: { reason?: string },
  ): Promise<unknown>
  export function deleteSession(sessionId: number | string): Promise<unknown>

  const _default: {
    getTrainers: typeof getTrainers
    getTrainer: typeof getTrainer
    getTrainerMe: typeof getTrainerMe
    getTrainerClients: typeof getTrainerClients
    getTrainerClientsAll: typeof getTrainerClientsAll
    getTrainerSchedules: typeof getTrainerSchedules
    getTrainerStats: typeof getTrainerStats
    createSession: typeof createSession
    updateSession: typeof updateSession
    cancelSession: typeof cancelSession
    deleteSession: typeof deleteSession
  }
  export default _default
}
