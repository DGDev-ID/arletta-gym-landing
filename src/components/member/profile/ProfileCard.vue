<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'

interface Props {
  member: {
    name: string
    email: string
    phone: string
    memberSince: string
    membershipType: string
    avatar: string
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
        <img
          :src="member.avatar"
          :alt="member.name"
          class="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-(--primary)"
        />
        <h2 class="text-xl font-semibold text-white mb-1">{{ member.name }}</h2>
        <p class="text-(--text-muted) text-sm mb-4">
          Member since
          {{
            new Date(member.memberSince).toLocaleDateString('id-ID', {
              month: 'long',
              year: 'numeric',
            })
          }}
        </p>

        <div class="space-y-3 text-left mt-6">
          <div class="flex items-center gap-3 text-(--text-secondary)">
            <i class="pi pi-envelope text-(--primary)"></i>
            <span class="text-sm">{{ member.email }}</span>
          </div>
          <div class="flex items-center gap-3 text-(--text-secondary)">
            <i class="pi pi-phone text-(--primary)"></i>
            <span class="text-sm">{{ member.phone }}</span>
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
