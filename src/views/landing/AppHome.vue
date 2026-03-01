<script setup lang="ts">
import HeroSection from '@/components/landing/home/HeroSection.vue'
import MembershipSection from '@/components/landing/home/MembershipSection.vue'
import ProgramsSection from '@/components/landing/home/ProgramsSection.vue'
import TrainersSection from '@/components/landing/home/TrainersSection.vue'
import CTASection from '@/components/landing/home/CTASection.vue'
</script>

<template>
  <div>
    <HeroSection />
    <MembershipSection />
    <ProgramsSection />
    <TrainersSection />
    <CTASection />
  </div>
</template>

<style scoped>
/* Smooth scroll offset for fixed navbar */
section[id] {
  scroll-margin-top: 80px;
}
</style>
