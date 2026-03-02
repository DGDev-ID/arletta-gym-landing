<script setup lang="ts">
type Benefit = { title: string; icon: string; description: string }
const props = defineProps<{ benefits?: Benefit[] }>()
</script>

<template>
  <section class="py-8 border-y border-white/10">
    <div class="container-custom">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="benefit in props.benefits"
          :key="benefit.title"
          v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }"
          class="flex items-center gap-3"
        >
          <div
            class="w-10 h-10 rounded-full bg-(--primary)/20 flex items-center justify-center flex-shrink-0"
          >
            <i :class="['pi', benefit.icon, 'text-(--primary)']"></i>
          </div>
          <div>
            <div class="text-white font-medium text-sm">{{ benefit.title }}</div>
            <div class="text-(--text-muted) text-xs">{{ benefit.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
