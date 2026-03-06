<script setup lang="ts">
import HeroSection from '@/components/landing/home/HeroSection.vue'
import MembershipSection from '@/components/landing/home/MembershipSection.vue'
import ProgramsSection from '@/components/landing/home/ProgramsSection.vue'
import TrainersSection from '@/components/landing/home/TrainersSection.vue'
import CTASection from '@/components/landing/home/CTASection.vue'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Dialog from 'primevue/dialog'

const showSplash = ref(false)
let splashTimer: ReturnType<typeof setTimeout> | null = null
const SPLASH_SHOWN_KEY = 'arletta_splash_shown'

onMounted(() => {
  // Only show the splash when the site is opened fresh in this browser session.
  // If the key exists in sessionStorage (user already visited during this session), don't show again.
  try {
    const shown = sessionStorage.getItem(SPLASH_SHOWN_KEY)
    if (!shown) {
      showSplash.value = true
      // Mark as shown for this session so navigating back won't re-open it
      sessionStorage.setItem(SPLASH_SHOWN_KEY, '1')
      splashTimer = setTimeout(() => {
        showSplash.value = false
      }, 20000)
    }
  } catch {
    // If sessionStorage is unavailable for any reason, fall back to showing once per mount.
    showSplash.value = true
    splashTimer = setTimeout(() => {
      showSplash.value = false
    }, 20000)
  }
})

// Clear the timer if the dialog is closed manually or component unmounts
watch(showSplash, (val) => {
  if (!val && splashTimer) {
    clearTimeout(splashTimer)
    splashTimer = null
  }
})

onUnmounted(() => {
  if (splashTimer) clearTimeout(splashTimer)
})
</script>

<template>
  <div>
    <Dialog
  v-model:visible="showSplash"
  modal
  :closable="false"
  :show-header="false"
  :pt="{
    root: { class: 'p-0 overflow-hidden rounded-xl shadow-2xl' },
    content: { class: 'p-0' },
    mask: { class: 'backdrop-blur-sm' },
  }"
  style="width: fit-content; max-width: 88vw;"
>
  <div class="relative flex flex-col">
    <div class="flex justify-end pt-2 pb-1">
      <button
        @click="showSplash = false"
        class="bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
      >
        ✕
      </button>
    </div>
    <img
      src="/popup-promo.jpeg"
      alt="Arletta Promo"
      class="block"
      style="max-height: 78vh; max-width: 88vw; width: auto; height: auto;"
    />
  </div>
</Dialog>

    <HeroSection />
    <MembershipSection />
    <ProgramsSection />
    <TrainersSection />
    <CTASection />
  </div>
</template>

<style scoped>
section[id] {
  scroll-margin-top: 80px;
}
</style>