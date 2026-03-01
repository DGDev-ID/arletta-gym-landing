<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'

interface SessionCardProps {
  session: {
    id: number
    type?: string
    name?: string
    className?: string
    clientName?: string
    clientAvatar?: string
    trainer?: string
    trainerAvatar?: string
    date: string
    time: string
    location?: string
    status: string
    notes?: string
    participants?: number
    maxParticipants?: number
    rating?: number
  }
  variant?: 'default' | 'compact' | 'upcoming' | 'history'
  showActions?: boolean
  userRole?: 'member' | 'pt'
}

const props = withDefaults(defineProps<SessionCardProps>(), {
  variant: 'default',
  showActions: true,
  userRole: 'member',
})

const emit = defineEmits<{
  cancel: [id: number]
  confirm: [id: number]
  click: [id: number]
}>()

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-500/20 text-green-400'
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400'
    case 'completed':
    case 'attended':
      return 'bg-blue-500/20 text-blue-400'
    case 'cancelled':
    case 'missed':
      return 'bg-red-500/20 text-red-400'
    case 'waitlist':
      return 'bg-yellow-500/20 text-yellow-400'
    case 'ongoing':
      return 'bg-blue-500/20 text-blue-400'
    case 'upcoming':
      return 'bg-yellow-500/20 text-yellow-400'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

const sessionName = computed(() => {
  if (props.session.name) return props.session.name
  if (props.session.type === 'pt-session') {
    return props.userRole === 'pt' ? 'Personal Training' : 'Personal Training'
  }
  return props.session.className || 'Class'
})

const sessionSubtitle = computed(() => {
  if (props.session.type === 'pt-session') {
    return props.userRole === 'pt' ? props.session.clientName : props.session.trainer
  }
  if (props.session.participants !== undefined) {
    return `${props.session.participants} / ${props.session.maxParticipants} participants`
  }
  return props.session.trainer || props.session.type || 'Class'
})

const avatarUrl = computed(() => {
  if (props.session.type === 'pt-session') {
    return props.userRole === 'pt' ? props.session.clientAvatar : props.session.trainerAvatar
  }
  return props.session.trainerAvatar
})

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

const iconClass = computed(() => {
  return props.session.type === 'pt-session' ? 'pi-user' : 'pi-users'
})

const iconBgClass = computed(() => {
  return props.session.type === 'pt-session' ? 'bg-(--primary)/20' : 'bg-blue-500/20'
})

const iconColorClass = computed(() => {
  return props.session.type === 'pt-session' ? 'text-(--primary)' : 'text-blue-400'
})
</script>

<template>
  <!-- Compact Variant (for profile cards) -->
  <div
    v-if="variant === 'compact'"
    class="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
    @click="emit('click', session.id)"
  >
    <div class="flex justify-between items-start mb-2">
      <h4 class="font-medium text-white">{{ sessionName }}</h4>
      <span class="text-xs text-(--primary)">{{ formatDate(session.date) }}</span>
    </div>
    <div class="flex items-center gap-4 text-sm text-(--text-muted)">
      <span class="flex items-center gap-1">
        <i class="pi pi-clock text-xs"></i>
        {{ session.time }}
      </span>
      <span class="flex items-center gap-1">
        <i class="pi pi-user text-xs"></i>
        {{ session.trainer }}
      </span>
    </div>
  </div>

  <!-- History Variant (condensed) -->
  <div
    v-else-if="variant === 'history'"
    class="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
  >
    <div class="flex items-center gap-4">
      <div
        :class="[
          'w-10 h-10 rounded-lg flex items-center justify-center',
          session.status === 'completed' || session.status === 'attended'
            ? 'bg-green-500/20'
            : 'bg-red-500/20',
        ]"
      >
        <i
          :class="[
            'pi text-sm',
            session.status === 'completed' || session.status === 'attended'
              ? 'pi-check text-green-400'
              : 'pi-times text-red-400',
          ]"
        ></i>
      </div>
      <div>
        <div class="font-medium text-white">{{ sessionName }}</div>
        <div class="text-sm text-(--text-muted)">{{ sessionSubtitle }} · {{ session.time }}</div>
      </div>
    </div>
    <div class="text-right">
      <div class="text-sm text-(--text-secondary) mb-1">
        {{
          new Date(session.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        }}
      </div>
      <div class="flex items-center gap-2 justify-end">
        <span
          :class="['text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(session.status)]"
        >
          {{ session.status }}
        </span>
        <span v-if="session.rating" class="text-yellow-400 text-xs">
          <i class="pi pi-star-fill mr-0.5"></i>{{ session.rating }}
        </span>
      </div>
    </div>
  </div>

  <!-- Default/Upcoming Variant (full details with actions) -->
  <div v-else class="glass-card p-4 rounded-xl">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <!-- Left: Session Info -->
      <div class="flex items-start gap-4">
        <div
          :class="['w-14 h-14 rounded-xl flex items-center justify-center shrink-0', iconBgClass]"
        >
          <i :class="['pi text-xl', iconClass, iconColorClass]"></i>
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-semibold text-white">{{ sessionName }}</h3>
            <span :class="['text-xs px-2 py-0.5 rounded-full', getStatusColor(session.status)]">
              {{ session.status }}
            </span>
          </div>

          <!-- Client/Trainer info with avatar -->
          <div
            v-if="session.type === 'pt-session' || avatarUrl"
            class="flex items-center gap-2 text-sm text-(--text-muted) mb-2"
          >
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="sessionSubtitle"
              class="w-5 h-5 rounded-full"
            />
            <span>{{ sessionSubtitle }}</span>
          </div>

          <!-- Participants for class (no avatar) -->
          <div
            v-else-if="session.participants !== undefined"
            class="text-sm text-(--text-muted) mb-2"
          >
            <i class="pi pi-users text-xs mr-1"></i>
            {{ session.participants }} / {{ session.maxParticipants }} participants
          </div>

          <!-- Generic subtitle if no special case -->
          <div v-else class="text-sm text-(--text-muted) mb-2">
            {{ sessionSubtitle }}
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
            <span v-if="session.location" class="flex items-center gap-1">
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

      <!-- Right: Actions -->
      <div v-if="showActions" class="flex items-center gap-2 ml-auto">
        <Button
          icon="pi pi-times"
          severity="danger"
          text
          rounded
          v-tooltip.top="'Cancel'"
          @click.stop="emit('cancel', session.id)"
        />
      </div>
    </div>
  </div>
</template>
