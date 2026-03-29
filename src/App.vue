<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Toast from 'primevue/toast'
import { fetchMe } from '@/stores/auth'

onMounted(() => {
  // Restore auth state from token in localStorage on every page load/refresh
  fetchMe()
})
</script>

<template>
  <Toast position="top-right" />
  <RouterView />
</template>

<style scoped></style>
