<script setup lang="ts">
import Card from 'primevue/card'

interface Props {
  activeClients: number
  totalSessions: number
  avgProgress: number
  newClientsThisMonth: number
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
          <div class="text-3xl font-bold text-(--primary)">{{ activeClients }}</div>
          <div class="text-sm text-(--text-muted)">Active Clients</div>
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
          <div class="text-3xl font-bold text-white">{{ totalSessions }}</div>
          <div class="text-sm text-(--text-muted)">Total Sessions</div>
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
          <div class="text-3xl font-bold text-green-400">{{ avgProgress }}%</div>
          <div class="text-sm text-(--text-muted)">Avg Progress</div>
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
          <div class="text-3xl font-bold text-white">+{{ newClientsThisMonth }}</div>
          <div class="text-sm text-(--text-muted)">New This Month</div>
        </div>
      </template>
    </Card>
  </div>
</template>
