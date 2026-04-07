<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Skeleton from 'primevue/skeleton'
import { getTrainers } from '@/services/trainerService'

const router = useRouter()

type Trainer = {
  id: number
  name: string
  image: string
  role: string
  rating: number
  clients: number
  specializations: string[]
  bio: string
  experience: string
}

const trainers = ref<Trainer[]>([])
const loading = ref(false)

const onImgError = (e: Event) => {
  ;(e.target as HTMLImageElement).src = '/placeholder-trainer.jpg'
}

onMounted(async () => {
  loading.value = true
  try {
    const list = await getTrainers()
    trainers.value = ((list || []) as Record<string, unknown>[]).slice(0, 3).map((t) => ({
      id: Number(t?.id ?? 0),
      name: String(t?.name ?? t?.full_name ?? 'Trainer'),
      image: String(
        (Array.isArray(t?.images) && (t['images'] as unknown[]).length
          ? (t['images'] as unknown[])[0]
          : null) ??
          t?.avatar ??
          t?.image ??
          '/placeholder-trainer.jpg',
      ),
      role: String(t?.role ?? t?.position ?? t?.specialty ?? ''),
      rating: Number(t?.rating ?? 4.8),
      clients: Number(t?.clients ?? t?.clients_count ?? 0),
      specializations: Array.isArray(t?.specializations)
        ? (t.specializations as string[])
        : Array.isArray(t?.expertise)
          ? (t.expertise as string[])
          : [],
      bio: String(t?.bio ?? t?.description ?? ''),
      experience: String(t?.experience ?? t?.years ?? ''),
    }))
  } catch (err) {
    console.error('Failed to load trainers', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section id="trainers" class="section-padding bg-(--bg-dark)">
    <div class="container-custom">
      <!-- Header -->
      <div
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="text-center mb-12"
      >
        <h2 class="heading-lg text-white mb-4">
          Kenali <span class="text-gradient">Trainer Ahli Kami</span>
        </h2>
        <p class="text-(--text-secondary) max-w-xl mx-auto">
          Trainer personal bersertifikat kami siap membimbing Anda dalam perjalanan kebugaran dengan program yang dipersonalisasi dan pengetahuan ahli.
        </p>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Skeleton loading -->
        <template v-if="loading">
          <div v-for="i in 3" :key="i" class="glass-card rounded-2xl overflow-hidden">
            <Skeleton width="100%" height="16rem" borderRadius="0" />
            <div class="p-6 space-y-3">
              <Skeleton width="60%" height="1.25rem" />
              <Skeleton width="40%" height="0.875rem" />
              <div class="flex gap-4">
                <Skeleton width="3.5rem" height="0.875rem" />
                <Skeleton width="4.5rem" height="0.875rem" />
              </div>
              <div class="flex gap-2">
                <Skeleton width="4.5rem" height="1.5rem" borderRadius="9999px" />
                <Skeleton width="5rem" height="1.5rem" borderRadius="9999px" />
              </div>
              <Skeleton width="100%" height="2.5rem" borderRadius="8px" />
            </div>
          </div>
        </template>

        <!-- Trainer cards -->
        <div
          v-else
          v-for="trainer in trainers"
          :key="trainer.id"
          v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
          class="glass-card rounded-2xl overflow-hidden group cursor-pointer hover:border-(--primary)/50 transition-all duration-300"
          @click="router.push('/trainers')"
        >
          <!-- Photo -->
          <div class="relative h-64 overflow-hidden">
            <img
              :src="trainer.image"
              :alt="trainer.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              @error="onImgError"
            />
            <div class="absolute inset-0 bg-linear-to-t from-black/80 to-transparent"></div>
            <!-- Name overlay -->
            <div class="absolute bottom-4 left-4 right-4">
              <h3 class="text-xl font-bold text-white leading-tight">{{ trainer.name }}</h3>
              <p class="text-(--primary) text-sm mt-0.5">{{ trainer.role }}</p>
            </div>
            <!-- Gender badge -->
          </div>

          <!-- Card body -->
          <div class="p-5">
            <!-- Stats row -->
            <div class="flex items-center gap-4 mb-4 text-sm">
              <div class="flex items-center gap-1.5">
                <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                <span class="text-white font-medium">{{ trainer.rating }}</span>
              </div>
              <div v-if="trainer.clients" class="flex items-center gap-1.5">
                <i class="pi pi-users text-(--text-muted) text-sm"></i>
                <span class="text-(--text-muted)">{{ trainer.clients }}+ klien</span>
              </div>
              <div v-if="trainer.experience" class="flex items-center gap-1.5">
                <i class="pi pi-clock text-(--text-muted) text-sm"></i>
                <span class="text-(--text-muted)">{{ trainer.experience }}</span>
              </div>
            </div>

            <!-- Specialization tags -->
            <div v-if="trainer.specializations.length" class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="spec in trainer.specializations.slice(0, 2)"
                :key="spec"
                class="bg-white/10 text-(--text-secondary) text-xs px-3 py-1 rounded-full"
              >{{ spec }}</span>
              <span
                v-if="trainer.specializations.length > 2"
                class="bg-white/10 text-(--text-muted) text-xs px-3 py-1 rounded-full"
              >+{{ trainer.specializations.length - 2 }}</span>
            </div>

            <!-- Bio -->
            <p
              v-if="trainer.bio"
              class="text-(--text-muted) text-sm line-clamp-2"
            >{{ trainer.bio }}</p>
          </div>
        </div>
      </div>

      <!-- View All CTA -->
      <div
        v-if="!loading"
        class="text-center mt-10"
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
      >
        <Button
          label="Lihat Semua Trainer"
          icon="pi pi-arrow-right"
          iconPos="right"
          class="btn px-8 py-3"
          @click="router.push('/trainers')"
        />
      </div>
    </div>
  </section>
</template>
