<script setup lang="ts">
import Button from 'primevue/button'

interface Session {
  id: number
  name: string
  trainer: string
  date: string
  time: string
  location: string
  type: string
  status: string
  trainerAvatar?: string
}

interface Props {
  sessions: Session[]
}

interface Emits {
  (e: 'cancel', session: Session): void
  (e: 'confirm-pt', session: Session): void
  (e: 'check-in', session: Session): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-500/20 text-green-400'
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400'
    case 'completed':
      return 'bg-blue-500/20 text-blue-400'
    case 'cancelled':
      return 'bg-red-500/20 text-red-400'
    case 'waitlist':
      return 'bg-yellow-500/20 text-yellow-400'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

const getTypeIcon = (type: string) => {
  return type === 'pt-session' ? 'pi-user' : 'pi-users'
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }
}

const isCheckInAvailable = (session: Session) => {
  const today = new Date()
  const sessionDate = new Date(session.date)
  if (sessionDate.toDateString() !== today.toDateString()) return false
  const parts = session.time.split(' - ')
  if (!parts || parts.length < 2) return false
  const start = String(parts[0] ?? '')
  const end = String(parts[1] ?? '')
  const [sh, sm] = start.split(':').map((v) => Number(v || 0))
  const [eh, em] = end.split(':').map((v) => Number(v || 0))
  const startDt = new Date(
    session.date + 'T' + `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}:00`,
  )
  const endDt = new Date(
    session.date + 'T' + `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00`,
  )

  // Allow check-in from start..end + 15 minutes
  const windowStart = startDt.getTime()
  const windowEnd = endDt.getTime() + 15 * 60 * 1000
  const now = Date.now()
  return now >= windowStart && now <= windowEnd
}
</script>

<template>
  <div>
    <div v-if="sessions.length === 0" class="text-center py-12">
      <i class="pi pi-calendar text-6xl text-(--text-muted) mb-4"></i>
      <p class="text-(--text-secondary)">No upcoming sessions</p>
      <p class="text-(--text-muted) text-sm mt-2">Book a class to get started!</p>
    </div>
    <div v-else class="space-y-4">
      <div v-for="session in sessions" :key="session.id" class="glass-card p-4 rounded-xl">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Left: Session Info -->
          <div class="flex items-start gap-4">
            <div
              :class="[
                'w-14 h-14 rounded-xl flex items-center justify-center shrink-0',
                session.type === 'pt-session' ? 'bg-(--primary)/20' : 'bg-blue-500/20',
              ]"
            >
              <i
                :class="[
                  'pi text-xl',
                  getTypeIcon(session.type),
                  session.type === 'pt-session' ? 'text-(--primary)' : 'text-blue-400',
                ]"
              ></i>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-white">{{ session.name }}</h3>
                <span :class="['text-xs px-2 py-0.5 rounded-full', getStatusColor(session.status)]">
                  {{ session.status }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-sm text-(--text-muted) mb-2">
                <img
                  :src="session.trainerAvatar"
                  :alt="session.trainer"
                  class="w-5 h-5 rounded-full"
                />
                <span>{{ session.trainer }}</span>
              </div>
              <div class="flex flex-wrap items-center gap-4 text-sm text-(--text-secondary)">
                <span class="flex items-center gap-1">
                  <i class="pi pi-calendar text-xs"></i>
                  {{ formatDate(session.date) }}
                </span>
                <span class="flex items-center gap-1">
                  <i class="pi pi-clock text-xs"></i>
                  {{ session.time }}
                </span>
                <span class="flex items-center gap-1">
                  <i class="pi pi-map-marker text-xs"></i>
                  {{ session.location }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-2 ml-auto">
            <template v-if="session.type === 'pt-session' && session.status === 'pending'">
              <Button
                label="Accept"
                icon="pi pi-check"
                class="btn"
                @click="emit('confirm-pt', session)"
              />
              <Button
                label="Decline"
                icon="pi pi-times"
                severity="danger"
                text
                rounded
                @click="emit('cancel', session)"
              />
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <Button
                  icon="pi pi-times"
                  severity="danger"
                  text
                  rounded
                  v-tooltip.top="'Cancel'"
                  @click="emit('cancel', session)"
                />
                <Button
                  v-if="session.type === 'pt-session' && session.status === 'confirmed' && isCheckInAvailable(session)"
                  label="Scan QR"
                  icon="pi pi-qrcode"
                  class="btn"
                  @click="emit('check-in', session)"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
