<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'

interface Props {
  trainer: {
    name: string
    email: string
    phone: string
    specialty: string
    avatar: string
    rating: number
    totalClients: number
    completedSessions: number
  }
}

defineProps<Props>()
const emit = defineEmits<{ (e: 'edit'): void }>()
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
      <div class="text-center">
        <div class="relative inline-block">
          <img
            v-if="trainer.avatar"
            :src="trainer.avatar"
            :alt="trainer.name"
            class="w-24 h-24 rounded-full mx-auto mb-2 border-4 border-(--primary) object-cover"
          />
          <div
            v-else
            class="w-24 h-24 rounded-full mx-auto mb-2 border-4 border-(--primary) bg-(--primary)/20 flex items-center justify-center"
          >
            <span class="text-3xl font-bold text-(--primary)">{{ trainer.name?.charAt(0).toUpperCase() }}</span>
          </div>
          <span
            class="absolute -bottom-1 right-0 bg-(--primary) text-white text-xs font-bold px-2 py-1 rounded"
          >
            PT
          </span>
        </div>
        <h2 class="text-xl font-semibold text-white mt-4 mb-1">{{ trainer.name }}</h2>
        <p class="text-(--primary) text-sm mb-4">{{ trainer.specialty }}</p>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 my-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-white">{{ trainer.rating }}</div>
            <div class="text-xs text-(--text-muted)">Rating</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-white">{{ trainer.totalClients }}</div>
            <div class="text-xs text-(--text-muted)">Clients</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-white">{{ trainer.completedSessions }}</div>
            <div class="text-xs text-(--text-muted)">Sessions</div>
          </div>
        </div>

        <div class="space-y-3 text-left border-t border-white/10 pt-4">
          <div class="flex items-center gap-3 text-(--text-secondary)">
            <i class="pi pi-envelope text-(--primary)"></i>
            <span class="text-sm">{{ trainer.email }}</span>
          </div>
          <div class="flex items-center gap-3 text-(--text-secondary)">
            <i class="pi pi-phone text-(--primary)"></i>
            <span class="text-sm">{{ trainer.phone }}</span>
          </div>
        </div>

        <Button
          label="Edit Profile"
          icon="pi pi-pencil"
          outlined
          class="mt-6 w-full py-2.5 border-white/20 text-white hover:bg-white/10"
          @click="emit('edit')"
        />
      </div>
    </template>
  </Card>
</template>
