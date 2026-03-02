<script setup lang="ts">
import { ref } from 'vue'
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

const router = useRouter()
const toast = useToast()
const goToSignUp = () => router.push('/signup')

const trainers = [
  {
    id: 1,
    name: 'Sandy Wibowo',
    role: 'Senior Personal Trainer',
    specializations: [
      'Prepare for body contest',
      'Fat loss',
      'Muscle gain',
      'Weight gain',
      'Functional Training',
      'Female Fitness',
      'HIIT',
      'Sport performance',
      'Endurance',
      'Body shaping',
    ],
    experience: '7 years',
    certifications: [
      'Personal Trainer Foundation',
      'First Aid Training Level 1',
      'Female Fitness Specialist',
      'Equalizer Specialist',
      'Assisted Stretching',
    ],
    bio: 'Sandy specializes in competition preparation, body shaping, and performance training with a focus on safe progressive programming.',
    image: '/sandy.svg',
    instagram: '@sandy_pt',
    rating: 4.9,
    clients: 220,
  },
  {
    id: 2,
    name: 'Rita Lestari',
    role: 'Personal Trainer',
    specializations: ['Weight loss', 'Fat loss', 'Body shaping'],
    experience: '5 years',
    certifications: ['Max Fitness Academy'],
    bio: 'Rita focuses on evidence-based weight loss and body shaping programs tailored for lasting results.',
    image: '/rita.svg',
    instagram: '@rita_fit',
    rating: 4.8,
    clients: 140,
  },
]

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
const trainerModalTarget = ref<(typeof trainers)[0] | null>(null)
const openTrainerModal = (trainer: (typeof trainers)[0]) => {
  trainerModalTarget.value = trainer
}
const closeModal = () => {
  trainerModalTarget.value = null
}

// TrainerSelectorDialog state (PT Package booking flow)
const showTrainerSelector = ref(false)
const selectedTrainer = ref<(typeof trainers)[0] | null>(null)
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
        <div class="text-center mb-6 py-12">
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
      <div class="text-center mb-6 pt-12">
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
      v-model:visible="showTrainerSelector"
      v-model:selectedTrainer="selectedTrainer"
      :trainers="trainers"
      :tempPackage="tempPackage"
      @proceed="proceedWithTrainer"
    />

    <!-- CTA Section -->
    <TrainersCTA @signup="goToSignUp" />

    <!-- DP Payment Modal -->
    <DPPaymentModal
      v-model:visible="showDPModal"
      :pkg="selectedPackage"
      @confirm="confirmDPPayment"
    />
  </div>
</template>
