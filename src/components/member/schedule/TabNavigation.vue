<script setup lang="ts">
interface Tab {
  key: string
  label: string
  icon: string
  badge?: number
}

interface Props {
  tabs: Tab[]
  activeTab: string
}

interface Emits {
  (e: 'update:activeTab', value: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="flex gap-1 mb-6 border-b border-white/10 pb-1 overflow-x-auto">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="[
        'flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap',
        activeTab === tab.key
          ? 'bg-white/10 text-white border-b-2 border-(--primary)'
          : 'text-(--text-muted) hover:text-white hover:bg-white/5',
      ]"
      @click="emit('update:activeTab', tab.key)"
    >
      <i :class="['pi', tab.icon]"></i>
      <span>{{ tab.label }}</span>
      <span
        v-if="tab.badge !== undefined && tab.badge > 0"
        class="px-2 py-0.5 bg-(--primary) text-white text-xs rounded-full"
      >
        {{ tab.badge }}
      </span>
    </button>
  </div>
</template>
