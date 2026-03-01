<script setup lang="ts">
import { useRouter } from 'vue-router'
import SignUpForm from '../../components/auth/SignUpForm.vue'

const router = useRouter()
const goHome = () => router.push('/')
</script>

<template>
  <div class="h-screen bg-(--bg-dark) flex overflow-hidden">
    <!-- Left Side - Image -->
    <div class="hidden lg:flex lg:w-1/2 relative">
      <img
        src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=1600&fit=crop"
        alt="Gym"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-linear-to-r from-transparent to-(--bg-dark)"></div>
      <div class="absolute inset-0 bg-black/40"></div>

      <!-- Branding overlay -->
      <div class="absolute bottom-12 left-12 z-10">
        <h2 class="text-4xl font-black text-white mb-2">
          <span>ARLETTA</span>
          <span class="text-(--primary)">GYM</span>
        </h2>
        <p class="text-(--text-secondary) text-lg">Start your transformation today.</p>
      </div>
    </div>

    <!-- Right Side - Sign Up Form -->
    <div class="w-full lg:w-1/2 flex items-start justify-center p-8 overflow-y-auto">
      <div class="w-full max-w-md pt-8">
        <!-- Back to home -->
        <button
          class="flex items-center gap-2 text-(--text-secondary) hover:text-white mb-8 transition-colors"
          @click="goHome"
        >
          <i class="pi pi-arrow-left"></i>
          <span>Back to Home</span>
        </button>

        <!-- Mobile Logo -->
        <div class="lg:hidden mb-8">
          <h2 class="text-3xl font-black">
            <span class="text-white">ARLETTA</span>
            <span class="text-(--primary)">GYM</span>
          </h2>
        </div>

        <!-- Welcome Text -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p class="text-(--text-secondary)">Join our fitness community today</p>
        </div>

        <!-- Sign Up Form component -->
        <SignUpForm />
      </div>
    </div>
  </div>
</template>

<!-- styles moved into SignUpForm.vue -->
