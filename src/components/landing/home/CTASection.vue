<script setup lang="ts">
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import authState from '@/stores/auth'

const router = useRouter()
const goToSignUp = () => {
  if (authState.isLoggedIn) {
    // If logged in, go to member schedule
    router.push('/member/schedule')
  } else {
    router.push('/signup')
  }
}
</script>

<template>
  <section id="about" class="section-padding relative overflow-hidden">
    <div class="absolute inset-0 z-0">
      <img
        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&h=800&fit=crop"
        alt="Fitness motivation"
        class="w-full h-full object-cover"
      />
      <div
        class="absolute inset-0 bg-linear-to-r from-(--bg-dark) via-black/80 to-(--bg-dark)"
      ></div>
    </div>

    <div class="container-custom relative z-10 text-center">
      <h2
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="heading-lg text-white mb-6"
      >
        Start Your Fitness Journey <span class="text-gradient">Today</span>
      </h2>
      <p
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="text-lg text-(--text-secondary) max-w-2xl mx-auto mb-10"
      >
        Don't wait for tomorrow. Take the first step towards a stronger, healthier you. Join our
        community of fitness enthusiasts now.
      </p>
      <div v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }">
        <Button
          label="Register Now"
          icon="pi pi-arrow-right"
          iconPos="right"
          class="btn px-10 py-4 text-lg font-semibold"
          @click="goToSignUp"
        />
      </div>
    </div>
  </section>
</template>
