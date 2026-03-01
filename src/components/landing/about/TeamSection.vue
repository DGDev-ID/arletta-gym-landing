<script setup lang="ts">
const props = defineProps<{ team: { name: string; role: string; image: string }[] }>()
</script>

<template>
  <section class="py-20">
    <div class="container-custom">
      <h2
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="text-3xl font-bold text-white text-center mb-12"
      >
        Leadership Team
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
        <div
          v-for="member in props.team"
          :key="member.name"
          class="text-center"
          v-animateonscroll="{ enterClass: 'animate-scalein', leaveClass: 'animate-fadeout' }"
        >
          <img
            :src="member.image"
            :alt="member.name"
            class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-(--primary)/30"
          />
          <h3 class="text-lg font-semibold text-white">{{ member.name }}</h3>
          <p class="text-(--text-muted) text-sm">{{ member.role }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
