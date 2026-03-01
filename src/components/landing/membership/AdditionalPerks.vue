<script setup lang="ts">
type Perk = { title: string; icon: string; description: string }
const props = defineProps<{ perks?: Perk[] }>()
</script>

<template>
  <section class="py-20 bg-(--bg-darker)">
    <div class="container-custom">
      <h2
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="text-2xl md:text-3xl font-bold text-white text-center mb-12"
      >
        Member Benefits
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        <div
          v-for="perk in props.perks"
          :key="perk.title"
          v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }"
          class="glass-card p-6 rounded-xl text-center"
        >
          <div
            class="w-14 h-14 rounded-full bg-(--primary)/20 flex items-center justify-center mx-auto mb-4"
          >
            <i :class="['pi', perk.icon, 'text-(--primary) text-xl']"></i>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">{{ perk.title }}</h3>
          <p class="text-(--text-muted) text-sm">{{ perk.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
