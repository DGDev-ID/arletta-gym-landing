<script setup lang="ts">
defineProps({
  title: { type: String, default: 'Class Programs' },
  subtitle: { type: String, default: '' },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1920&h=600&fit=crop',
  },
})
</script>

<template>
  <section class="pt-32 pb-16 relative overflow-hidden">
    <div class="absolute inset-0">
      <img :src="image" alt="" class="w-full h-full object-cover opacity-30" />
      <div
        class="absolute inset-0 bg-linear-to-b from-(--bg-dark) via-(--bg-dark)/80 to-(--bg-dark)"
      ></div>
    </div>
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
