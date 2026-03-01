<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import SessionCard from '@/components/common/SessionCard.vue'

interface Session {
  id: number
  name: string
  time: string
  trainer: string
  date: string
  status: string
  type: string
}

interface Props {
  upcomingClasses: Session[]
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
        <h3 class="text-lg font-semibold text-white">My Schedule</h3>
        <Button icon="pi pi-plus" text rounded class="text-(--primary) hover:bg-white/5" />
      </div>

      <div class="space-y-4">
        <SessionCard
          v-for="cls in upcomingClasses"
          :key="cls.id"
          :session="cls"
          variant="compact"
          :show-actions="false"
          user-role="member"
        />
      </div>

      <Button
        label="View All Classes"
        text
        class="mt-4 w-full text-(--text-secondary) hover:text-white"
      />
    </template>
  </Card>
</template>
