<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Toast from 'primevue/toast'
import { getProfile } from '@/services/userService'
import { setUser } from '@/stores/auth'
import authState from '@/stores/auth'

// Rehydrate auth state from stored token on app mount
onMounted(async () => {
  if (authState.token && !authState.user) {
    try {
      const profile = await getProfile()
      const role: 'member' | 'pt' = profile.role === 'pt' ? 'pt' : 'member'
      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name)}`,
      })
    } catch {
      // token expired / invalid — clear it
      localStorage.removeItem('arletta_token')
      authState.token = null
    }
  }
})
</script>

<template>
  <Toast position="top-right" />
  <RouterView />
</template>

<style scoped></style>
