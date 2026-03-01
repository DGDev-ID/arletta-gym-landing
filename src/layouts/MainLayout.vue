<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ScrollTop from 'primevue/scrolltop'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-(--bg-dark)">
    <AppNavbar />
    <main class="flex-1">
      <!-- Render child routes here -->
      <RouterView />
    </main>
    <AppFooter />
    <ScrollTop
      :threshold="300"
      icon="pi pi-arrow-up"
      class="bg-(--primary) hover:bg-(--primary-dark) border-0"
    />
  </div>
</template>
