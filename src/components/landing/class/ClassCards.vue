<script setup lang="ts">
// no runtime Vue imports needed in this component
// Booking removed from class cards: booking is handled via WeeklySchedule only

type ClassItem = {
  id: number
  image?: string
  name: string
  category?: string
  duration?: string
  spotsLeft?: number
  totalSpots?: number
  trainer?: string
  location?: string
  level?: string
  description?: string
  benefits?: string[]
}
const props = defineProps<{ classes?: ClassItem[] }>()
defineEmits(['book'])

// Class cards are informational only on the landing page; booking is handled via WeeklySchedule
</script>

<template>
  <section class="py-16">
    <div class="container-custom">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="classItem in props.classes"
          :key="classItem.id"
          v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
          class="glass-card rounded-2xl overflow-hidden group hover:border-(--primary)/50 transition-all"
        >
          <div class="relative h-48 overflow-hidden">
            <img
              :src="classItem.image"
              :alt="classItem.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div class="absolute top-4 left-4">
              <span class="bg-(--primary) text-white text-xs font-bold px-3 py-1 rounded-full">
                {{ classItem.category }}
              </span>
            </div>
            <div class="absolute top-4 right-4">
              <span class="bg-black/60 text-white text-xs px-3 py-1 rounded-full">{{
                classItem.duration
              }}</span>
            </div>
          </div>

          <div class="p-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xl font-bold text-white">{{ classItem.name }}</h3>
              <span
                :class="[
                  'text-xs px-2 py-1 rounded',
                  classItem.level === 'Beginner'
                    ? 'bg-green-500/20 text-green-400'
                    : classItem.level === 'Intermediate'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-blue-500/20 text-blue-400',
                ]"
              >
                {{ classItem.level }}
              </span>
            </div>

            <p class="text-(--text-muted) text-sm mb-4 line-clamp-2">{{ classItem.description }}</p>

            <div class="flex items-center gap-2 mb-4">
              <i class="pi pi-user text-(--primary) text-sm"></i>
              <span class="text-(--text-secondary) text-sm">{{ classItem.trainer }}</span>
            </div>

            <div class="space-y-2 mb-4">
              <div
                v-for="benefit in classItem.benefits"
                :key="benefit"
                class="flex items-center gap-2"
              >
                <i class="pi pi-check-circle text-green-500 text-xs"></i>
                <span class="text-(--text-muted) text-xs">{{ benefit }}</span>
              </div>
            </div>

            <!-- Booking removed: classes are booked via WeeklySchedule -->
          </div>
        </div>
      </div>
    </div>

    <!-- Booking modal removed from class cards; booking is available in WeeklySchedule -->
  </section>
</template>
