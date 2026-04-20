<script setup lang="ts">
import HeroSection from '@/components/landing/home/HeroSection.vue'
import MembershipSection from '@/components/landing/home/MembershipSection.vue'
import ProgramsSection from '@/components/landing/home/ProgramsSection.vue'
import TrainersSection from '@/components/landing/home/TrainersSection.vue'
import CTASection from '@/components/landing/home/CTASection.vue'

</script>

<template>
  <div>
    <!-- Splash popup removed: no longer shown on site load -->

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
