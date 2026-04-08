<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Skeleton from 'primevue/skeleton'
import Select from 'primevue/select'
import HeroTrainers from '@/components/landing/trainers/HeroTrainers.vue'
import StatsBlock from '@/components/landing/trainers/StatsBlock.vue'
import TrainersGrid from '@/components/landing/trainers/TrainersGrid.vue'
import TrainerModal from '@/components/landing/trainers/TrainerModal.vue'
import PTPackageCard from '@/components/landing/trainers/PTPackageCard.vue'
import TrainersCTA from '@/components/landing/trainers/TrainersCTA.vue'
import ParticleBackground from '@/components/common/ParticleBackground.vue'
import DPPaymentModal from '@/components/booking/DPPaymentModal.vue'
import authState from '@/stores/auth'
import { getTrainers, getTrainerStats } from '@/services/trainerService'
import { getPtPackages } from '@/services/ptPackageService'
import { createPayment } from '@/services/paymentService'
import { getGyms, type Gym } from '@/services/gymService'

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
  maxPerson?: number
  promos?: Array<{ type?: string; value?: number; unique_code?: string }>
}

const ptPackages = ref<PtPackageUI[]>([])
const ptPackagesLoading = ref(false)

// ── Gym filter for PT Packages ─────────────────────────────
const gyms = ref<Gym[]>([])
const selectedGymId = ref<number | null>(null)
const gymsLoading = ref(false)

const loadPtPackages = async () => {
  ptPackagesLoading.value = true
  try {
    const params: Record<string, unknown> = {}
    if (selectedGymId.value) params.gym_id = selectedGymId.value
    const raw = await getPtPackages(params)
    const list = Array.isArray(raw) ? raw : []
    ptPackages.value = list.map((p) => {
      const pr = (p as unknown) as Record<string, unknown>
      const sessions = Number(pr['duration_in_sessions'] ?? pr['sessions'] ?? 0)
      const price = Number(pr['price'] ?? 0)
      const perSession = sessions > 0 ? Math.round(price / sessions) : 0
      const maxPerson = Number(pr['max_person'] ?? 1)

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
}

// ── Trainer Stats (from API) ───────────────────────────────
type StatItem = { value: string; label: string }
const stats = ref<StatItem[]>([])
const statsLoading = ref(false)

onMounted(async () => {
  // Load gyms for filter
  gymsLoading.value = true
  try {
    const gymList = await getGyms()
    gyms.value = gymList
    if (gymList.length) selectedGymId.value = gymList[0]?.id ?? null
  } catch (err) {
    console.warn('Failed to load gyms', err)
  } finally {
    gymsLoading.value = false
  }

  // Load PT packages (filtered by selected gym)
  await loadPtPackages()

  // Fetch trainer stats
  statsLoading.value = true
  try {
    const raw = await getTrainerStats()
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

watch(selectedGymId, () => {
  loadPtPackages()
})

// TrainerModal state (Meet Our Trainers grid)
const trainerModalTarget = ref<Trainer | null>(null)
const openTrainerModal = (trainer: Trainer) => {
  trainerModalTarget.value = trainer
}
const closeModal = () => {
  trainerModalTarget.value = null
}

// Book Now → go straight to DPPaymentModal (no trainer selector)
const showDPModal = ref(false)
const selectedPackage = ref<PtPackageUI | null>(null)
const selectedTrainer = ref<Trainer | null>(null)

const openBooking = (pkg: PtPackageUI) => {
  if (!authState.isLoggedIn) {
    router.push('/signup')
    return
  }
  selectedPackage.value = pkg
  showDPModal.value = true
}

type PaymentConfirm = {
  paymentType: 'dp' | 'full' | string
  dpPercent?: number
  paymentMethod?: 'va' | 'qris' | string
  pkg?: { name?: string } | null
}

const paymentLoading = ref(false)

const confirmDPPayment = async (data: PaymentConfirm) => {
  if (!selectedPackage.value || !selectedPackage.value.id) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No package selected', life: 4000 })
    return
  }
  if (!selectedGymId.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please select a gym branch first', life: 4000 })
    return
  }

  const method = data.paymentMethod ?? 'va'
  const ptPaymentType = data.paymentType === 'dp' ? 'dp_payment' : 'full_payment'

  paymentLoading.value = true
  try {
    toast.add({ severity: 'info', summary: 'Creating payment', detail: 'Processing your payment...', life: 3000 })

    const payload: Record<string, unknown> = {
      gym_id: Number(selectedGymId.value),
      transaction_type: 'pt',
      type_id: Number(selectedPackage.value.id),
      payment_method: method,
      payment_type: ptPaymentType,
      trainer_id: selectedTrainer.value?.id ?? undefined,
    }

    if (ptPaymentType === 'dp_payment' && data.dpPercent) {
      payload.dp_percent = data.dpPercent
    }

    // Include promo code if package has one
    if (selectedPackage.value.promos && selectedPackage.value.promos.length > 0 && selectedPackage.value.promos[0]?.unique_code) {
      payload.promo_code = selectedPackage.value.promos[0].unique_code
    }

    const resp = await createPayment(payload)

    if (resp.payment_url) {
      window.open(resp.payment_url, '_blank')
    } else if ((resp as Record<string, unknown>).snap_token) {
      // Midtrans snap token — open Midtrans Snap checkout page
      const snapToken = (resp as Record<string, unknown>).snap_token as string
      window.open(`https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`, '_blank')
    } else if (resp.token) {
      window.open(`https://app.sandbox.midtrans.com/snap/v2/vtweb/${resp.token}`, '_blank')
    } else {
      toast.add({ severity: 'success', summary: 'Payment created', detail: 'Transaction has been created successfully.', life: 3000 })
    }

    showDPModal.value = false
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    toast.add({ severity: 'error', summary: 'Payment failed', detail: message, life: 5000 })
  } finally {
    paymentLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-(--bg-dark)">
    <!-- Hero Section -->
    <HeroTrainers
      title="Trainer & Paket Personal"
      subtitle="Jelajahi paket latihan privat kami atau pesan sesi one-on-one bersama trainer bersertifikat — rencana fleksibel sesuai tujuan dan jadwal Anda."
    />

    <!-- Stats Section -->
    <template v-if="statsLoading">
      <section class="py-12 border-y border-white/10">
        <div class="container-custom">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div v-for="i in 4" :key="i" class="text-center space-y-2">
              <Skeleton width="4rem" height="2.25rem" class="mx-auto" />
              <Skeleton width="6rem" height="0.875rem" class="mx-auto" />
            </div>
          </div>
        </div>
      </section>
    </template>
    <StatsBlock v-else :stats="stats" />

    <!-- Private Training Packages -->
    <section class="relative overflow-hidden" style="margin-top: -1px">
      <ParticleBackground class="absolute inset-0 -z-10 pointer-events-none" />
      <div class="container-custom relative z-10">
        <div
          class="text-center mb-6 py-12"
          v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        >
          <h2 class="text-3xl font-bold text-white mb-4">Paket Latihan Privat</h2>
          <p class="text-(--text-secondary)">
            Pilih paket yang sesuai tujuan Anda — 1-on-1 atau bersama partner.
          </p>
        </div>

        <!-- Gym Branch Filter -->
        <div class="flex justify-center mb-8">
          <div class="w-full max-w-xs">
            <Select
              v-model="selectedGymId"
              :options="gyms"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Gym Branch"
              :loading="gymsLoading"
              class="w-full"
            />
            <p class="text-xs text-(--text-muted) mt-2 text-center">Pastikan pilih cabang yang diinginkan sebelum membeli</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-12">
          <!-- Skeleton packages -->
          <template v-if="ptPackagesLoading">
            <div v-for="i in 3" :key="i" class="rounded-2xl p-6 flex flex-col gap-5" style="background: linear-gradient(145deg, #1a1a1a 0%, #111 100%)">
              <div class="text-center space-y-2">
                <Skeleton width="5rem" height="0.75rem" class="mx-auto" />
                <Skeleton width="70%" height="1.5rem" class="mx-auto" />
                <Skeleton width="40%" height="0.875rem" class="mx-auto" />
              </div>
              <Skeleton width="3rem" height="1px" class="mx-auto" />
              <div class="text-center space-y-1">
                <Skeleton width="60%" height="2rem" class="mx-auto" />
                <Skeleton width="40%" height="0.75rem" class="mx-auto" />
              </div>
              <div class="space-y-2">
                <div v-for="j in 3" :key="j" class="flex items-center gap-2">
                  <Skeleton shape="circle" size="1rem" />
                  <Skeleton width="75%" height="0.875rem" />
                </div>
              </div>
              <Skeleton width="100%" height="2.75rem" borderRadius="8px" class="mt-auto" />
            </div>
          </template>
          <PTPackageCard
            v-else
            v-for="pkg in ptPackages"
            :key="pkg.name"
            :pkg="pkg"
            @book="openBooking"
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
        <h2 class="text-3xl font-bold text-white mb-4">Kenali Trainer Kami</h2>
        <p class="text-(--text-secondary)">
          Trainer kami berspesialisasi dalam kekuatan, daya tahan, mobilitas, dan kesehatan — pilih
          pelatih yang sesuai tujuan Anda dan pesan sesi atau paket.
        </p>
      </div>
      <!-- Trainers grid skeleton -->
      <template v-if="loadingTrainers">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-10">
          <div v-for="i in 6" :key="i" class="glass-card rounded-2xl overflow-hidden">
            <Skeleton width="100%" height="16rem" borderRadius="0" />
            <div class="p-6 space-y-3">
              <Skeleton width="60%" height="1.25rem" />
              <Skeleton width="40%" height="0.875rem" />
              <div class="flex gap-2">
                <Skeleton width="4rem" height="1.5rem" borderRadius="9999px" />
                <Skeleton width="5rem" height="1.5rem" borderRadius="9999px" />
              </div>
              <Skeleton width="100%" height="2rem" />
              <Skeleton width="100%" height="2.5rem" borderRadius="8px" />
            </div>
          </div>
        </div>
      </template>
      <TrainersGrid v-else :trainers="trainers" @open="openTrainerModal" />
    </section>

    <!-- Trainer detail modal (Meet Our Trainers grid) -->
    <TrainerModal :trainer="trainerModalTarget" @close="closeModal" />

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
