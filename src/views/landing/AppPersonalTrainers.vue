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
import { getTrainers } from '@/services/trainerService'

const router = useRouter()
const toast = useToast()
const goToSignUp = () => router.push('/signup')

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
  certifications: string[]
  instagram: string
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
      role: String((t && (t.role ?? t.position ?? t.description)) ?? ''),
      rating: Number((t && (t.rating ?? 4.8)) ?? 4.8),
      clients: Number((t && (t.clients ?? t.clients_count ?? 0)) ?? 0),
      specializations: Array.isArray(t?.specializations) ? t.specializations : (Array.isArray(t?.expertise) ? t.expertise : []),
      bio: String((t && (t.bio ?? t.description)) ?? ''),
      experience: String((t && (t.experience ?? t.years ?? '')) ?? ''),
      certifications: Array.isArray(t?.certifications) ? t.certifications : [],
      instagram: String((t && (t.instagram ?? '')) ?? ''),
    }))
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    trainersError.value = msg
    toast.add({ severity: 'error', summary: 'Failed to load trainers', detail: msg, life: 4000 })
  } finally {
    loadingTrainers.value = false
  }
})

const ptPackages = [
  {
    name: '5 Sessions',
    sessions: 5,
    price: 1125000,
    perSession: 225000,
    shareable: false,
    features: ['Personalized program', 'Flexible schedule', '1-on-1 coaching'],
  },
  {
    name: '10 Sessions',
    sessions: 10,
    price: 2000000,
    perSession: 200000,
    shareable: false,
    features: ['Personalized program', 'Flexible schedule', '1-on-1 coaching'],
  },
  {
    name: '20 Sessions',
    sessions: 20,
    price: 3500000,
    perSession: 175000,
    shareable: false,
    features: ['Personalized program', 'Flexible schedule', 'Progress assessments'],
  },
  {
    name: '50 Sessions',
    sessions: 50,
    price: 6500000,
    perSession: 130000,
    shareable: true,
    features: ['Personalized program', 'Couple/shared option', 'Priority booking'],
  },
  {
    name: '80 Sessions',
    sessions: 80,
    price: 10240000,
    perSession: 128000,
    shareable: true,
    features: ['Personalized program', 'Couple/shared option', 'Progress tracking'],
  },
  {
    name: '100 Sessions',
    sessions: 100,
    price: 12500000,
    perSession: 125000,
    shareable: true,
    features: ['Personalized program', 'Couple/shared option', 'Dedicated trainer allocation'],
  },
]

const stats = [
  { value: '15+', label: 'Expert Trainers' },
  { value: '50+', label: 'Years Combined Experience' },
  { value: '1000+', label: 'Happy Clients' },
  { value: '4.8', label: 'Average Rating' },
]

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
const tempPackage = ref<(typeof ptPackages)[0] | null>(null)

const openTrainerSelector = (pkg: (typeof ptPackages)[0]) => {
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
const selectedPackage = ref<(typeof ptPackages)[0] | null>(null)

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
