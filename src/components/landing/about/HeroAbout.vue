<script setup lang="ts">
defineProps<{ title?: string; subtitle?: string; image?: string }>()
</script>

<template>
  <section class="pt-32 pb-16 relative overflow-hidden">
    <div class="absolute inset-0">
      <img
        :src="
          image ||
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=600&fit=crop'
        "
        alt="About"
        class="w-full h-full object-cover opacity-20"
      />
      <div
        class="absolute inset-0 bg-linear-to-b from-(--bg-dark) via-(--bg-dark)/80 to-(--bg-dark)"
      ></div>
    </div>
    <div class="container-custom relative z-10">
      <div class="max-w-3xl mx-auto text-center">
        <h1
          v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
          class="heading-xl text-white mb-4"
        >
          {{ title || 'About Arletta Gym' }}
        </h1>
        <p
          v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
          class="text-lg text-(--text-secondary)"
        >
          {{
            subtitle ||
            "More than a gym. We're a community dedicated to helping you become the strongest version of yourself."
          }}
        </p>
      </div>
    </div>
  </section>
</template>
