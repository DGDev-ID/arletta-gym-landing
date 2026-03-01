<script setup lang="ts">
import Card from 'primevue/card'

interface Props {
  totalSessionsThisWeek: number
  upcomingCount: number
  completedThisMonth: number
  totalClients: number
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
          <div class="text-3xl font-bold text-(--primary)">{{ totalSessionsThisWeek }}</div>
          <div class="text-sm text-(--text-muted)">This Week</div>
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
          <div class="text-3xl font-bold text-white">{{ upcomingCount }}</div>
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
          <div class="text-3xl font-bold text-green-400">{{ completedThisMonth }}</div>
          <div class="text-sm text-(--text-muted)">Completed</div>
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
          <div class="text-3xl font-bold text-white">{{ totalClients }}</div>
          <div class="text-sm text-(--text-muted)">Active Clients</div>
        </div>
      </template>
    </Card>
  </div>
</template>
