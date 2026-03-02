<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useCountUp } from '@/composables/useCountUp'

const router = useRouter()

const goToSignUp = () => router.push('/signup')
const goToMembership = () => router.push('/membership')
const scrollToPrograms = () => {
  document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' })
}

const { count: membersCount, observe: observeMembers } = useCountUp(500)
const { count: trainersCount, observe: observeTrainers } = useCountUp(15)
const { count: programsCount, observe: observePrograms } = useCountUp(20)

const membersRef = ref<HTMLElement | null>(null)
const trainersRef = ref<HTMLElement | null>(null)
const programsRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (membersRef.value) observeMembers(membersRef.value)
  if (trainersRef.value) observeTrainers(trainersRef.value)
  if (programsRef.value) observePrograms(programsRef.value)
})
</script>

<template>
  <section id="hero" class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 z-0">
      <img
        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop"
        alt="Gym Interior"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-(--bg-dark)"></div>
    </div>

    <div class="container-custom relative z-10 text-center px-4 pt-20">
      <h1
        v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }"
        class="heading-xl text-white mb-6"
      >
        Transform Your Body.<br />
        <span class="text-gradient">Elevate Your Life.</span>
      </h1>
      <p
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="text-lg md:text-xl text-(--text-secondary) max-w-2xl mx-auto mb-10"
      >
        Join the ultimate fitness experience. World-class equipment, expert trainers, and a
        community that pushes you to be your best self.
      </p>

      <div
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          label="Join Now"
          icon="pi pi-arrow-right"
          iconPos="right"
          class="btn px-8 py-3.5 text-base font-semibold"
          @click="goToSignUp"
        />
        <Button
          label="View Programs"
          icon="pi pi-play"
          outlined
          class="px-8 py-3.5 text-base font-semibold border-white/20 text-white hover:bg-white/10"
          @click="scrollToPrograms"
        />
        <div class="relative inline-block">
          <Button
            label="Presale"
            icon="pi pi-ticket"
            class="px-8 py-3.5 text-base font-semibold bg-white/5 hover:bg-white/10"
            @click="goToMembership"
          />
          <!-- badge -->
          <div class="absolute -top-4 -right-3 w-8 h-8 rounded-full flex items-center justify-center gift-badge">
            <i class="pi pi-gift text-white text-xs"></i>
          </div>
        </div>
      </div>

      <div
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto"
      >
        <div class="text-center" ref="membersRef">
          <div class="text-3xl md:text-4xl font-bold text-white mb-1">{{ membersCount }}+</div>
          <div class="text-sm text-(--text-muted)">Active Members</div>
        </div>
        <div class="text-center" ref="trainersRef">
          <div class="text-3xl md:text-4xl font-bold text-white mb-1">{{ trainersCount }}+</div>
          <div class="text-sm text-(--text-muted)">Expert Trainers</div>
        </div>
        <div class="text-center" ref="programsRef">
          <div class="text-3xl md:text-4xl font-bold text-white mb-1">{{ programsCount }}+</div>
          <div class="text-sm text-(--text-muted)">Class Programs</div>
        </div>
      </div>
    </div>

    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
      <i class="pi pi-chevron-down text-white/50 text-2xl"></i>
    </div>
  </section>
</template>

<style scoped>
.gift-badge {
  background-color: rgba(230, 33, 41, 1);
  box-shadow: 0 0 14px rgba(230, 33, 41, 0.55);
  animation: giftGlow 1s ease-in-out infinite;
}

@keyframes giftGlow {
  0%, 100% { background-color: rgb(230, 33, 41); }
  50%       { background-color: rgb(120, 15, 20); }
}
</style>