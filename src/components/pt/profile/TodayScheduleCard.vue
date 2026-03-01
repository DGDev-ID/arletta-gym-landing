<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import SessionCard from '@/components/common/SessionCard.vue'

interface Session {
  id: number
  clientName: string
  time: string
  name: string
  status: string
  type: string
  date: string
  location: string
}

interface Props {
  todaySchedule: Session[]
}

defineProps<Props>()
</script>

<template>
  <Card
    class="glass-card"
    :pt="{
      root: { class: 'bg-transparent border-0' },
      body: { class: 'p-6' },
      content: { class: 'p-0' },
    }"
  >
    <template #content>
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-white">Today's Schedule</h3>
        <Button label="View Full Calendar" text class="text-(--primary) text-sm" />
      </div>

      <div class="space-y-3">
        <SessionCard
          v-for="session in todaySchedule"
          :key="session.id"
          :session="session"
          variant="compact"
          :show-actions="false"
          user-role="pt"
        />
      </div>
    </template>
  </Card>
</template>
