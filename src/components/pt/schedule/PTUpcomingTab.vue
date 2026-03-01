<script setup lang="ts">
import Button from 'primevue/button'

interface Session {
  id: number
  type: string
  clientName?: string
  className?: string
  clientAvatar?: string
  date: string
  time: string
  location: string
  status: string
  notes?: string
  participants?: number
  maxParticipants?: number
}

interface Props {
  sessions: Session[]
}

interface Emits {
  (e: 'cancel', session: Session): void
  (e: 'reschedule', session: Session): void
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
    case 'ongoing':
      return 'bg-blue-500/20 text-blue-400'
    case 'upcoming':
      return 'bg-yellow-500/20 text-yellow-400'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
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
</script>

<template>
  <div>
    <div v-if="sessions.length === 0" class="text-center py-12">
      <i class="pi pi-calendar text-6xl text-(--text-muted) mb-4"></i>
      <p class="text-(--text-secondary)">No upcoming sessions</p>
      <p class="text-(--text-muted) text-sm mt-2">Add a PT session to get started!</p>
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
                  session.type === 'pt-session'
                    ? 'pi-user text-(--primary)'
                    : 'pi-users text-blue-400',
                ]"
              ></i>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-white">
                  {{ session.type === 'pt-session' ? 'Personal Training' : session.className }}
                </h3>
                <span :class="['text-xs px-2 py-0.5 rounded-full', getStatusColor(session.status)]">
                  {{ session.status }}
                </span>
              </div>

              <!-- Client info for PT session -->
              <div
                v-if="session.type === 'pt-session'"
                class="flex items-center gap-2 text-sm text-(--text-muted) mb-2"
              >
                <img
                  :src="session.clientAvatar"
                  :alt="session.clientName"
                  class="w-5 h-5 rounded-full"
                />
                <span>{{ session.clientName }}</span>
              </div>

              <!-- Participants for class -->
              <div v-else class="text-sm text-(--text-muted) mb-2">
                <i class="pi pi-users text-xs mr-1"></i>
                {{ session.participants }} / {{ session.maxParticipants }} participants
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

              <!-- Notes -->
              <div v-if="session.notes" class="mt-2 text-xs text-(--text-muted) italic">
                <i class="pi pi-info-circle mr-1"></i>
                {{ session.notes }}
              </div>
            </div>
          </div>

          <!-- Right: Actions (only PT sessions are cancellable/reschedulable by PT) -->
          <div class="flex items-center gap-2 ml-auto">
            <Button
              v-if="session.type === 'pt-session'"
              icon="pi pi-calendar-plus"
              severity="info"
              text
              rounded
              v-tooltip.top="'Reschedule'"
              @click="emit('reschedule', session)"
            />
            <Button
              v-if="session.type === 'pt-session'"
              icon="pi pi-times"
              severity="danger"
              text
              rounded
              v-tooltip.top="'Cancel'"
              @click="emit('cancel', session)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
