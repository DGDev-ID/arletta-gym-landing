<script setup lang="ts">
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import authState from '@/stores/auth'

defineProps<{ title?: string; subtitle?: string; image?: string }>()
const router = useRouter()

const handleCTA = () => {
  if (authState.isLoggedIn) {
    // If logged in as PT, go to PT clients; if member, go to member schedule
    if (authState.user?.role === 'pt') {
      router.push('/pt/clients')
    } else {
      router.push('/member/schedule')
    }
  } else {
    emit('signup')
  }
}

const emit = defineEmits<{ signup: [] }>()
</script>

<template>
  <section class="relative py-20">
    <div class="absolute inset-0 overflow-hidden">
      <img
        :src="
          image ||
          'https://images.unsplash.com/photo-1571388208497-71bedc66e932?w=1600&h=900&fit=crop'
        "
        alt="Gym background"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-(--primary)/80"></div>
      <div class="absolute inset-0 bg-linear-to-b from-transparent to-(--bg-dark)/60"></div>
    </div>

    <div
      v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
      class="container-custom relative z-10 text-center text-white"
    >
      <h2 class="text-3xl font-bold text-white mb-4">
        {{ title || 'Berlatih Bersama yang Terbaik' }}
      </h2>
      <p class="text-white/80 mb-8 max-w-xl mx-auto">
        {{
          subtitle ||
          'Dapatkan perhatian personal dan bimbingan ahli. Pesan sesi pertama Anda hari ini dan mulailah perjalanan transformasi Anda.'
        }}
      </p>
      <Button
        label="Kenali Trainer Kami"
        icon="pi pi-arrow-right"
        iconPos="right"
        class="bg-white text-(--primary) px-8 py-3 font-semibold hover:bg-white/90"
        @click="handleCTA"
      ></Button>
    </div>
  </section>
</template>
