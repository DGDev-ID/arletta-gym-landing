<script setup lang="ts">
import SessionCard from '@/components/common/SessionCard.vue'

interface HistorySession {
  id: number
  name: string
  trainer: string
  date: string
  time: string
  type: string
  status: string
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
        :session="session"
        variant="history"
        :show-actions="false"
        user-role="member"
      />
    </div>
  </div>
</template>
