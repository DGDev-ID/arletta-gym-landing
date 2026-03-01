<script setup lang="ts">
import SessionCard from '@/components/common/SessionCard.vue'

interface HistorySession {
  id: number
  type: string
  clientName?: string
  className?: string
  date: string
  time: string
  status: string
  rating?: number
  participants?: number
}

interface Props {
  sessionHistory: HistorySession[]
}

defineProps<Props>()
</script>

<template>
  <div>
    <div v-if="sessionHistory.length === 0" class="text-center py-12">
      <i class="pi pi-history text-6xl text-(--text-muted) mb-4"></i>
      <p class="text-(--text-secondary)">No session history</p>
    </div>
    <div v-else class="space-y-3">
      <SessionCard
        v-for="session in sessionHistory"
        :key="session.id"
        :session="{
          id: session.id,
          name: session.type === 'pt-session' ? `PT Session` : session.className || 'Class',
          trainer: session.clientName || '',
          date: session.date,
          time: session.time,
          type: session.type,
          status: session.status,
          location: '',
        }"
        variant="history"
        :show-actions="false"
        user-role="pt"
      />
    </div>
  </div>
</template>
