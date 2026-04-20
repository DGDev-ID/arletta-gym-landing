<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Skeleton from 'primevue/skeleton'
import { getClasses } from '@/services/scheduleService'

const programs = ref<Array<{ title: string; description: string; icon?: string; image?: string }>>(
  [],
)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const list = await getClasses()
    // map API shape to UI shape with sensible fallbacks
    programs.value = (list || []).map((c: Record<string, unknown>) => ({
      title: String(c.name ?? c.title ?? 'Program'),
      description: String(c.description ?? c.summary ?? ''),
      icon: String(c.icon ?? 'pi-dumbbell'),
      image: String(
        (Array.isArray(c.images) && c.images.length && c.images[0]) ??
          c.image ??
          c.avatar ??
          '/placeholder-class.jpg',
      ),
    }))
  } catch (err) {
    console.error('Failed to load class programs', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section id="programs" class="section-padding bg-(--bg-darker)">
    <div class="container-custom">
      <div
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="text-center mb-12"
      >
        <h2 class="heading-lg text-white mb-4">
          Program <span class="text-gradient">Kelas Kami</span>
        </h2>
        <p class="text-(--text-secondary) max-w-xl mx-auto">
          Dari latihan intensitas tinggi hingga gerakan yang penuh kesadaran, kami memiliki program
          yang dirancang untuk membantu Anda mencapai tujuan kebugaran.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="dark-card rounded-2xl overflow-hidden">
            <Skeleton width="100%" height="12rem" borderRadius="0" />
            <div class="p-5 space-y-3">
              <Skeleton width="65%" height="1.125rem" />
              <Skeleton width="90%" height="0.75rem" />
              <Skeleton width="75%" height="0.75rem" />
            </div>
          </div>
        </template>
        <div
          v-for="program in programs"
          :key="program.title"
          v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
          class="dark-card overflow-hidden group cursor-pointer"
        >
          <div class="relative h-48 overflow-hidden">
            <img
              :src="program.image"
              :alt="program.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-linear-to-t from-(--bg-card) to-transparent"></div>
            <div
              class="absolute top-4 left-4 w-10 h-10 rounded-lg bg-(--primary) flex items-center justify-center"
            >
              <i :class="['pi', program.icon, 'text-white']"></i>
            </div>
          </div>

          <div class="p-5">
            <h3 class="text-lg font-semibold text-white mb-2">{{ program.title }}</h3>
            <p class="text-sm text-(--text-muted)">{{ program.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
