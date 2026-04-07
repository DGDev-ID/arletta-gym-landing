<script setup lang="ts">
const props = defineProps<{ values: { icon: string; title: string; description: string }[] }>()
</script>

<template>
  <section class="py-20 bg-(--bg-darker)">
    <div class="container-custom">
      <h2
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="text-3xl font-bold text-white text-center mb-12"
      >
        Nilai-Nilai Kami
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="val in props.values"
          :key="val.title"
          class="glass-card p-6 rounded-xl text-center"
          v-animateonscroll="{ enterClass: 'animate-scalein', leaveClass: 'animate-fadeout' }"
        >
          <div
            class="w-14 h-14 rounded-full bg-(--primary)/20 flex items-center justify-center mx-auto mb-4"
          >
            <i :class="['pi', val.icon, 'text-(--primary) text-xl']"></i>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">{{ val.title }}</h3>
          <p class="text-(--text-muted) text-sm">{{ val.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
