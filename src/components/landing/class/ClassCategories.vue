<script setup lang="ts">
const props = defineProps<{ categories?: string[]; activeCategory?: string }>()
defineEmits(['select'])
</script>

<template>
  <section
    class="py-8 border-b border-white/10 sticky top-20 bg-(--bg-dark)/95 backdrop-blur-sm z-40"
  >
    <div class="container-custom">
      <div
        v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }"
        class="flex flex-wrap justify-center gap-3"
      >
        <button
          v-for="category in props.categories"
          :key="category"
          :class="[
            'px-6 py-2 rounded-full text-sm font-medium transition-all',
            props.activeCategory === category
              ? 'bg-(--primary) text-white'
              : 'bg-white/5 text-(--text-secondary) hover:bg-white/10',
          ]"
          @click="$emit('select', category)"
        >
          {{ category }}
        </button>
      </div>
    </div>
  </section>
</template>
