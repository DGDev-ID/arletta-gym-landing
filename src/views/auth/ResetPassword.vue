<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// The reset password flow is now handled entirely in ForgotPassword.vue
// Redirect any visitors to the forgot-password page
onMounted(() => {
  router.replace('/forgot-password')
})
</script>

<template>
  <div class="h-screen bg-(--bg-dark) flex items-center justify-center">
    <p class="text-(--text-secondary)">Mengalihkan...</p>
  </div>
</template>
