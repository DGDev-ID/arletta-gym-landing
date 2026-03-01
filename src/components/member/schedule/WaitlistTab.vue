<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'

interface WaitlistClass {
  id: number
  name: string
  trainer: string
  date: string
  time: string
  location: string
  status: string
  trainerAvatar?: string
}

interface Props {
  waitlistClasses: WaitlistClass[]
}

interface Emits {
  (e: 'cancel', session: WaitlistClass & { type: string; status: string }): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div>
    <div v-if="waitlistClasses.length === 0" class="text-center py-12">
      <i class="pi pi-clock text-6xl text-(--text-muted) mb-4"></i>
      <p class="text-(--text-secondary)">No classes on waiting list</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="classItem in waitlistClasses"
        :key="classItem.id"
        class="glass-card hover:scale-101 transition-transform"
        :pt="{
          root: { class: 'bg-transparent border-0 h-full' },
          body: { class: 'p-6' },
          content: { class: 'p-0' },
        }"
      >
        <template #content>
          <div class="space-y-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-white mb-1">{{ classItem.name }}</h3>
                <div class="flex items-center gap-2 text-(--text-secondary) text-sm">
                  <img
                    v-if="classItem.trainerAvatar"
                    :src="classItem.trainerAvatar"
                    :alt="classItem.trainer"
                    class="w-5 h-5 rounded-full"
                  />
                  <i v-else class="pi pi-user"></i>
                  <span>{{ classItem.trainer }}</span>
                </div>
              </div>
              <span
                class="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full"
              >
                Waitlist
              </span>
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2 text-(--text-secondary)">
                <i class="pi pi-calendar text-(--primary)"></i>
                <span>{{ formatDate(classItem.date) }}</span>
              </div>
              <div class="flex items-center gap-2 text-(--text-secondary)">
                <i class="pi pi-clock text-(--primary)"></i>
                <span>{{ classItem.time }}</span>
              </div>
              <div class="flex items-center gap-2 text-(--text-secondary)">
                <i class="pi pi-map-marker text-(--primary)"></i>
                <span>{{ classItem.location }}</span>
              </div>
            </div>

            <Button
              label="Leave Waitlist"
              icon="pi pi-times"
              outlined
              severity="danger"
              class="w-full mt-4 py-2 border-red-400/30 text-red-400 hover:bg-red-500/10"
              @click="emit('cancel', { ...classItem, type: 'class', status: 'waitlist' })"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
