<script setup lang="ts">
defineProps({
  title: { type: String, default: 'Keanggotaan Premium' },
  subtitle: { type: String, default: '' },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=900&fit=crop',
  },
})
</script>

<template>
  <section class="pt-32 pb-16 relative overflow-hidden">
    <div class="absolute inset-0 bg-linear-to-b from-(--primary)/10 to-transparent"></div>
    <div class="container-custom relative z-10">
      <div
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="max-w-3xl mx-auto text-center"
      >
        <h1 class="heading-xl text-white mb-4">{{ title }}</h1>
        <p class="text-lg text-(--text-secondary)" v-if="subtitle">{{ subtitle }}</p>
      </div>
    </div>
  </section>
</template>
