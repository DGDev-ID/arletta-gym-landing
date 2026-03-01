<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import type { AvailableClass } from '@/stores/booking'

interface Props {
  availableClasses: AvailableClass[]
}

interface Emits {
  (e: 'book', classItem: AvailableClass): void
  (e: 'view-zoom', classItem: AvailableClass): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div>
    <div v-if="availableClasses.length === 0" class="text-center py-12">
      <i class="pi pi-search text-6xl text-(--text-muted) mb-4"></i>
      <p class="text-(--text-secondary)">No classes available</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="classItem in availableClasses"
        :key="classItem.id"
        class="glass-card hover:scale-101 transition-transform"
        :pt="{
          root: { class: 'bg-transparent border-0 h-full' },
          body: { class: 'p-6' },
          content: { class: 'p-0' },
        }"
      >
        <template #content>
          <div class="space-y-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-white mb-1">{{ classItem.name }}</h3>
                <div class="flex items-center gap-2 text-(--text-secondary) text-sm">
                  <img
                    v-if="classItem.trainerAvatar"
                    :src="classItem.trainerAvatar"
                    :alt="classItem.trainer"
                    class="w-5 h-5 rounded-full"
                  />
                  <i v-else class="pi pi-user"></i>
                  <span>{{ classItem.trainer }}</span>
                </div>
              </div>
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  classItem.isFull
                    ? 'bg-red-500/20 text-red-400'
                    : (classItem.spotsLeft ?? 0) <= 3
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400',
                ]"
              >
                {{ classItem.isFull ? 'Full' : `${classItem.spotsLeft} spots` }}
              </span>
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2 text-(--text-secondary)">
                <i class="pi pi-calendar text-(--primary)"></i>
                <span>{{ formatDate(classItem.date) }}</span>
              </div>
              <div class="flex items-center gap-2 text-(--text-secondary)">
                <i class="pi pi-clock text-(--primary)"></i>
                <span>{{ classItem.time }}</span>
              </div>
              <div class="flex items-center gap-2 text-(--text-secondary)">
                <i class="pi pi-map-marker text-(--primary)"></i>
                <span>{{ classItem.location }}</span>
              </div>
            </div>

            <!-- Online class available badge for full classes -->
            <div v-if="classItem.isFull || classItem.spotsLeft === 0" class="mt-1 flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <i class="pi pi-video text-blue-400 text-xs"></i>
              <span class="text-xs text-blue-300">Online via Zoom available</span>
            </div>

            <Button
              :label="(classItem.zoomLink && (new Date(`${classItem.date}T${(classItem.time.split(' - ')[0])}:00`) <= new Date())) ? 'View Zoom' : (classItem.isFull || classItem.spotsLeft === 0 ? 'Join Waitlist' : 'Book Now')"
              :icon="(classItem.zoomLink && (new Date(`${classItem.date}T${(classItem.time.split(' - ')[0])}:00`) <= new Date())) ? 'pi pi-video' : (classItem.isFull || classItem.spotsLeft === 0 ? 'pi pi-external-link' : 'pi pi-check')"
              :class="(classItem.zoomLink && (new Date(`${classItem.date}T${(classItem.time.split(' - ')[0])}:00`) <= new Date())) ? 'btn' : (classItem.isFull || classItem.spotsLeft === 0 ? 'btn-outline' : 'btn')"
              class="w-full mt-4 py-2"
              @click="(classItem.zoomLink && (new Date(`${classItem.date}T${(classItem.time.split(' - ')[0])}:00`) <= new Date())) ? emit('view-zoom', classItem) : emit('book', classItem)"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
