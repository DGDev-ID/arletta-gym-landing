<script setup lang="ts">
import Card from 'primevue/card'

interface Client {
  id: number
  name: string
  avatar: string
  email: string
  phone: string
  membershipType: string
  totalSessions: number
  currentGoal: string
  status: string
  nextSession: string | null
}

interface Props {
  clients: Client[]
}

interface Emits {
  (e: 'view-profile', clientId: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400'
    case 'inactive':
      return 'bg-yellow-500/20 text-yellow-400'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}
</script>

<template>
  <div>
    <div v-if="clients.length === 0" class="text-center py-12">
      <i class="pi pi-users text-6xl text-(--text-muted) mb-4"></i>
      <p class="text-(--text-secondary)">No clients found</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="client in clients"
        :key="client.id"
        class="glass-card hover:scale-101 transition-transform cursor-pointer"
        :pt="{
          root: { class: 'bg-transparent border-0 h-full' },
          body: { class: 'p-6' },
          content: { class: 'p-0' },
        }"
        @click="emit('view-profile', client.id)"
      >
        <template #content>
          <div class="flex items-start gap-4 mb-4">
            <img :src="client.avatar" :alt="client.name" class="w-16 h-16 rounded-full" />
            <div class="flex-1">
              <h3 class="font-semibold text-white mb-1">{{ client.name }}</h3>
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    getStatusColor(client.status),
                  ]"
                >
                  {{ client.status }}
                </span>
                <span class="text-xs text-(--text-muted)">{{ client.membershipType }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-2 mb-4 text-sm">
            <div class="flex items-center gap-2 text-(--text-secondary)">
              <i class="pi pi-envelope text-(--primary) text-xs"></i>
              <span>{{ client.email }}</span>
            </div>
            <div class="flex items-center gap-2 text-(--text-secondary)">
              <i class="pi pi-phone text-(--primary) text-xs"></i>
              <span>{{ client.phone }}</span>
            </div>
            <div class="flex items-center gap-2 text-(--text-secondary)">
              <i class="pi pi-calendar text-(--primary) text-xs"></i>
              <span>{{ client.totalSessions }} sessions completed</span>
            </div>
          </div>

          <div class="border-t border-white/10 pt-4">
            <div class="text-xs text-(--text-muted) mb-1">Current Goal</div>
            <div class="text-sm text-white font-medium mb-3">{{ client.currentGoal }}</div>

            <div v-if="client.nextSession" class="flex items-center gap-2 text-sm">
              <i class="pi pi-clock text-(--primary)"></i>
              <span class="text-(--text-secondary)">Next: {{ client.nextSession }}</span>
            </div>
            <div v-else class="text-sm text-(--text-muted) italic">No upcoming sessions</div>
          </div>

          <!-- 'View Profile' button removed as requested -->
        </template>
      </Card>
    </div>
  </div>
</template>
