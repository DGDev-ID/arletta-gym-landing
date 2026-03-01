<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'

interface Client {
  name: string
  sessions: number
  progress: number
  avatar: string
}

interface Props {
  recentClients: Client[]
}

defineProps<Props>()
</script>

<template>
  <Card
    class="glass-card lg:col-span-3"
    :pt="{
      root: { class: 'bg-transparent border-0' },
      body: { class: 'p-6' },
      content: { class: 'p-0' },
    }"
  >
    <template #content>
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-white">My Clients</h3>
        <Button label="View All Clients" text class="text-(--primary) text-sm" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="client in recentClients" :key="client.name" class="p-4 rounded-lg bg-white/5 transition-colors">
          <div class="flex items-center gap-4 mb-4">
            <img :src="client.avatar" :alt="client.name" class="w-12 h-12 rounded-full" />
            <div>
              <div class="font-medium text-white">{{ client.name }}</div>
              <div class="text-sm text-(--text-muted)">{{ client.sessions }} sessions</div>
            </div>
          </div>

          <!-- Progress bar removed per request -->
        </div>
      </div>
    </template>
  </Card>
</template>
