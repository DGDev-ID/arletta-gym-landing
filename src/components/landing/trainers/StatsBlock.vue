<script setup lang="ts">
import { onMounted } from 'vue'
import { useCountUp } from '@/composables/useCountUp'

const props = defineProps<{ stats: { value: string; label: string }[] }>()

// refs for stat DOM elements - use unknown[] to accept Element or component instance from template ref
const statRefs: unknown[] = []

// create countup instances for each numeric stat
const countInstances = props.stats.map((s) => {
  const raw = String(s.value)
  const target = parseFloat(raw.replace(/[^\d.]/g, '')) || 0
  return useCountUp(target, 1400)
})

onMounted(() => {
  statRefs.forEach((el, idx) => {
    if (el && countInstances[idx]) {
      // cast to HTMLElement for the composable observe function
      countInstances[idx].observe(el as HTMLElement)
    }
  })
})
</script>

<template>
  <section class="py-12 border-y border-white/10">
    <div class="container-custom">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div
          v-for="(stat, idx) in props.stats"
          :key="stat.label"
          class="text-center"
          :ref="(el) => (statRefs[idx] = el)"
        >
          <div class="text-3xl md:text-4xl font-bold text-(--primary) mb-1">
            {{ countInstances[idx]?.count }}<span v-if="String(stat.value).includes('+')">+</span>
          </div>
          <div class="text-(--text-muted) text-sm">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
