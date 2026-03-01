<script setup lang="ts">
import Card from 'primevue/card'

interface Props {
  upcomingCount: number
  totalClassesThisMonth: number
  ptSessionsThisMonth: number
  attendedCount: number
}

defineProps<Props>()
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <Card
      class="glass-card"
      :pt="{
        root: { class: 'bg-transparent border-0' },
        body: { class: 'p-4' },
        content: { class: 'p-0' },
      }"
    >
      <template #content>
        <div class="text-center">
          <div class="text-3xl font-bold text-(--primary)">{{ upcomingCount }}</div>
          <div class="text-sm text-(--text-muted)">Upcoming</div>
        </div>
      </template>
    </Card>
    <Card
      class="glass-card"
      :pt="{
        root: { class: 'bg-transparent border-0' },
        body: { class: 'p-4' },
        content: { class: 'p-0' },
      }"
    >
      <template #content>
        <div class="text-center">
          <div class="text-3xl font-bold text-white">{{ totalClassesThisMonth }}</div>
          <div class="text-sm text-(--text-muted)">This Month</div>
        </div>
      </template>
    </Card>
    <Card
      class="glass-card"
      :pt="{
        root: { class: 'bg-transparent border-0' },
        body: { class: 'p-4' },
        content: { class: 'p-0' },
      }"
    >
      <template #content>
        <div class="text-center">
          <div class="text-3xl font-bold text-white">{{ ptSessionsThisMonth }}</div>
          <div class="text-sm text-(--text-muted)">PT Sessions</div>
        </div>
      </template>
    </Card>
    <Card
      class="glass-card"
      :pt="{
        root: { class: 'bg-transparent border-0' },
        body: { class: 'p-4' },
        content: { class: 'p-0' },
      }"
    >
      <template #content>
        <div class="text-center">
          <div class="text-3xl font-bold text-green-400">{{ attendedCount }}</div>
          <div class="text-sm text-(--text-muted)">Attended</div>
        </div>
      </template>
    </Card>
  </div>
</template>
