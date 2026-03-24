<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import HeroTrainers from '@/components/landing/trainers/HeroTrainers.vue'
import StatsBlock from '@/components/landing/trainers/StatsBlock.vue'
import TrainersGrid from '@/components/landing/trainers/TrainersGrid.vue'
import TrainerModal from '@/components/landing/trainers/TrainerModal.vue'
import PTPackageCard from '@/components/landing/trainers/PTPackageCard.vue'
import TrainersCTA from '@/components/landing/trainers/TrainersCTA.vue'
import ParticleBackground from '@/components/common/ParticleBackground.vue'
import DPPaymentModal from '@/components/booking/DPPaymentModal.vue'
import TrainerSelectorDialog from '@/components/landing/trainers/TrainerSelector.vue'
import authState from '@/stores/auth'
import { getTrainers, getTrainerStats } from '@/services/trainerService'
import { getPtPackages } from '@/services/ptPackageService'

const router = useRouter()
const toast = useToast()
const goToSignUp = () => router.push('/signup')

type Trainer = {
  id: number
  name: string
  image: string
  images: string[]
  role: string
  rating: number
  clients: number
  specializations: string[]
  bio: string
  experience: string
  certifications: string[]
  instagram: string
  phone_number: string
  gender: string
}

const trainers = ref<Trainer[]>([])
const loadingTrainers = ref(false)
const trainersError = ref<string | null>(null)

onMounted(async () => {
  loadingTrainers.value = true
  try {
    const data = await getTrainers()
    const list = Array.isArray(data) ? data : []
    // map server trainer shape to UI Trainer shape with sensible defaults
    trainers.value = list.map((t) => ({
      id: Number((t && (t.id ?? 0)) ?? 0),
      name: String((t && t.name) ?? 'Unknown'),
      image: Array.isArray(t?.images) && t.images.length ? String(t.images[0]) : String((t && (t.avatar ?? t.image)) ?? '/placeholder-trainer.jpg'),
      images: Array.isArray(t?.images) ? (t.images as string[]) : (t?.image ? [String(t.image)] : []),
      role: String((t && (t.role ?? t.position ?? t.description)) ?? ''),
      rating: Number((t && (t.rating ?? 4.8)) ?? 4.8),
      clients: Number((t && (t.clients ?? t.clients_count ?? 0)) ?? 0),
      specializations: Array.isArray(t?.specializations) ? t.specializations as string[] : (Array.isArray(t?.expertise) ? t.expertise as string[] : []),
      bio: String((t && (t.bio ?? t.description)) ?? ''),
      experience: String((t && (t.experience ?? t.years ?? '')) ?? ''),
      certifications: Array.isArray(t?.certifications) ? t.certifications as string[] : [],
      instagram: String((t && (t.instagram ?? '')) ?? ''),
      phone_number: String((t && (t.phone_number ?? '')) ?? ''),
      gender: String((t && (t.gender ?? '')) ?? ''),
    }))
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    trainersError.value = msg
    toast.add({ severity: 'error', summary: 'Failed to load trainers', detail: msg, life: 4000 })
  } finally {
    loadingTrainers.value = false
  }
})

// ── PT Packages (from API) ─────────────────────────────────
type PtPackageUI = {
  id?: number | string
  name: string
  sessions: number
  price: number
  perSession: number
  shareable: boolean
  features: string[]
  promo?: string
  gymName?: string
  maxPerson?: number
  promos?: Array<{ type?: string; value?: number; unique_code?: string }>
}

const ptPackages = ref<PtPackageUI[]>([])
const ptPackagesLoading = ref(false)

// ── Trainer Stats (from API) ───────────────────────────────
type StatItem = { value: string; label: string }
const stats = ref<StatItem[]>([])
const statsLoading = ref(false)

onMounted(async () => {
  // Fetch PT packages
  ptPackagesLoading.value = true
  try {
    const raw = await getPtPackages()
    const list = Array.isArray(raw) ? raw : []
    ptPackages.value = list.map((p) => {
      const pr = (p as unknown) as Record<string, unknown>
      // Backend uses duration_in_sessions (not sessions)
      const sessions = Number(pr['duration_in_sessions'] ?? pr['sessions'] ?? 0)
      const price = Number(pr['price'] ?? 0)
      const perSession = sessions > 0 ? Math.round(price / sessions) : 0
      const maxPerson = Number(pr['max_person'] ?? 1)

      // Gym metadata
      const gym = pr['gym'] as Record<string, unknown> | null | undefined
      const gymName = gym ? String(gym['name'] ?? '') : undefined

      // Promos from active_promos
      const rawPromos = (pr['active_promos'] ?? pr['promos'] ?? []) as unknown[]
      const promos = Array.isArray(rawPromos)
        ? rawPromos.map((x) => {
            const po = (x as Record<string, unknown>) ?? {}
            return { type: po['type'] as string | undefined, value: po['value'] as number | undefined, unique_code: po['unique_code'] as string | undefined }
          })
        : []

      return {
        id: pr['id'] as number | string | undefined,
        name: String(pr['name'] ?? ''),
        sessions,
        price,
        perSession,
        shareable: maxPerson > 1,
        features: Array.isArray(pr['features']) ? (pr['features'] as string[]) : [],
        promo: promos.length > 0 && promos[0] ? `${promos[0].type ?? 'Promo'} ${promos[0].value ?? ''}`.trim() : undefined,
        gymName: gymName || undefined,
        maxPerson: maxPerson > 1 ? maxPerson : undefined,
        promos,
      }
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    toast.add({ severity: 'error', summary: 'Failed to load packages', detail: msg, life: 4000 })
  } finally {
    ptPackagesLoading.value = false
  }

  // Fetch trainer stats
  statsLoading.value = true
  try {
    const raw = await getTrainerStats()
    // Backend returns an array of { value, label } objects
    if (Array.isArray(raw) && raw.length > 0) {
      stats.value = raw.map((item: unknown) => {
        const s = (item ?? {}) as Record<string, unknown>
        return { value: String(s['value'] ?? ''), label: String(s['label'] ?? '') }
      })
    }
  } catch {
    // stats stays empty; StatsBlock handles empty array gracefully
  } finally {
    statsLoading.value = false
  }
})

// TrainerModal state (Meet Our Trainers grid)
const trainerModalTarget = ref<Trainer | null>(null)
const openTrainerModal = (trainer: Trainer) => {
  trainerModalTarget.value = trainer
}
const closeModal = () => {
  trainerModalTarget.value = null
}

// TrainerSelectorDialog state (PT Package booking flow)
const showTrainerSelector = ref(false)
const selectedTrainer = ref<Trainer | null>(null)
const tempPackage = ref<PtPackageUI | null>(null)

const openTrainerSelector = (pkg: PtPackageUI) => {
  if (!authState.isLoggedIn) {
    router.push('/signup')
    return
  }
  tempPackage.value = pkg
  selectedTrainer.value = null
  showTrainerSelector.value = true
}

// DPPaymentModal state
const showDPModal = ref(false)
const selectedPackage = ref<PtPackageUI | null>(null)

const proceedWithTrainer = () => {
  if (!selectedTrainer.value || !tempPackage.value) return
  selectedPackage.value = tempPackage.value
  showTrainerSelector.value = false
  showDPModal.value = true
}

type PaymentConfirm = { paymentType: 'dp' | 'full' | string; pkg?: { name?: string } | null }

const confirmDPPayment = (data: PaymentConfirm) => {
  const typeLabel = data.paymentType === 'dp' ? 'DP' : 'Full Payment'
  toast.add({
    severity: 'info',
    summary: 'Proceeding to payment',
    detail: `Opening ${typeLabel} checkout for ${data.pkg?.name ?? 'selected package'} with ${selectedTrainer.value?.name ?? 'selected trainer'}...`,
    life: 3000,
  })
  window.open('about:blank', '_blank')
  showDPModal.value = false
}
</script>

<template>
  <div class="min-h-screen bg-(--bg-dark)">
    <!-- Hero Section -->
    <HeroTrainers
      title="Personal Trainers & Packages"
      subtitle="Explore our private training packages or book one-on-one sessions with our certified trainers — flexible plans to fit your goals and schedule."
    />

    <!-- Stats Section -->
    <StatsBlock :stats="stats" />

    <!-- Private Training Packages -->
    <section class="relative overflow-hidden" style="margin-top: -1px">
      <ParticleBackground class="absolute inset-0 -z-10 pointer-events-none" />
      <div class="container-custom relative z-10">
        <div
          class="text-center mb-6 py-12"
          v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        >
          <h2 class="text-3xl font-bold text-white mb-4">Private Training Packages</h2>
          <p class="text-(--text-secondary)">
            Choose a package that fits your goals — 1-on-1 or share with a partner.
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-12">
          <PTPackageCard
            v-for="pkg in ptPackages"
            :key="pkg.name"
            :pkg="pkg"
            @book="openTrainerSelector"
          />
        </div>
      </div>
    </section>

    <!-- Meet Our Trainers -->
    <section class="container-custom my-10">
      <div
        class="text-center mb-6 pt-12"
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
      >
        <h2 class="text-3xl font-bold text-white mb-4">Meet Our Trainers</h2>
        <p class="text-(--text-secondary)">
          Our trainers specialize across strength, endurance, mobility, and wellness — choose the
          coach that matches your goals and book a session or package.
        </p>
      </div>
      <TrainersGrid :trainers="trainers" @open="openTrainerModal" />
    </section>

    <!-- Trainer detail modal (Meet Our Trainers grid) -->
    <TrainerModal :trainer="trainerModalTarget" @close="closeModal" />

    <!-- Trainer Selector Dialog (PT Package booking flow) -->
    <TrainerSelectorDialog
      :visible="showTrainerSelector"
      @update:visible="val => (showTrainerSelector = val)"
      :selectedTrainer="selectedTrainer"
      @update:selectedTrainer="val => (selectedTrainer = val)"
      :trainers="trainers"
      :tempPackage="tempPackage"
      @proceed="proceedWithTrainer"
    />

    <!-- CTA Section -->
    <TrainersCTA @signup="goToSignUp" />

    <!-- DP Payment Modal -->
    <DPPaymentModal
      :visible="showDPModal"
      @update:visible="val => (showDPModal = val)"
      :pkg="selectedPackage"
      @confirm="confirmDPPayment"
    />
  </div>
</template>
