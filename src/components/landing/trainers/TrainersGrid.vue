<script setup lang="ts">
import Button from 'primevue/button'
type Trainer = {
  id: number
  name: string
  image: string
  role: string
  rating: number
  clients: number
  specializations: string[]
  bio: string
}
const props = defineProps<{ trainers?: Trainer[] }>()
defineEmits(['open'])
</script>

<template>
  <section class="py-20">
    <div class="container-custom">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="trainer in props.trainers"
          :key="trainer.id"
          v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
          class="glass-card rounded-2xl overflow-hidden group cursor-pointer hover:border-(--primary)/50 transition-all"
          @click="$emit('open', trainer)"
        >
          <div class="relative h-64 overflow-hidden">
            <img
              :src="trainer.image"
              :alt="trainer.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-linear-to-t from-black/80 to-transparent"></div>
            <div class="absolute bottom-4 left-4 right-4">
              <h3 class="text-xl font-bold text-white">{{ trainer.name }}</h3>
              <p class="text-(--primary) text-sm">{{ trainer.role }}</p>
            </div>
          </div>

          <div class="p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex items-center gap-1">
                <i class="pi pi-star-fill text-yellow-500 text-sm"></i>
                <span class="text-white text-sm">{{ trainer.rating }}</span>
              </div>
              <div class="flex items-center gap-1">
                <i class="pi pi-users text-(--text-muted) text-sm"></i>
                <span class="text-(--text-muted) text-sm">{{ trainer.clients }}+ clients</span>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="spec in trainer.specializations.slice(0, 2)"
                :key="spec"
                class="bg-white/10 text-(--text-secondary) text-xs px-3 py-1 rounded-full"
                >{{ spec }}</span
              >
              <span
                v-if="trainer.specializations.length > 2"
                class="bg-white/10 text-(--text-muted) text-xs px-3 py-1 rounded-full"
                >+{{ trainer.specializations.length - 2 }}</span
              >
            </div>

            <p class="text-(--text-muted) text-sm line-clamp-2 mb-4">{{ trainer.bio }}</p>

            <Button
              label="View Profile"
              outlined
              class="w-full py-2 border-white/20 text-white hover:bg-white/10"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
