<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { logout } from '@/stores/auth'
import Menu from 'primevue/menu'

interface User {
  name: string
  avatar?: string
}

defineProps<{
  user: User
}>()

const router = useRouter()
const menu = ref()
const toast = useToast()

const menuItems = ref([
  {
    label: 'Profil Saya',
    icon: 'pi pi-user',
    command: () => router.push('/member/profile'),
  },
  {
    label: 'Jadwal Saya',
    icon: 'pi pi-calendar',
    command: () => router.push('/member/schedule'),
  },
  {
    separator: true,
  },
  {
    label: 'Keluar',
    icon: 'pi pi-sign-out',
    command: () => handleLogout(),
  },
])

const toggleMenu = (event: Event) => {
  menu.value.toggle(event)
}

const handleLogout = () => {
  // Show toast for sign out
  toast.add({
    severity: 'success',
    summary: 'Berhasil keluar',
    detail: 'Anda telah berhasil keluar.',
    life: 3000,
  })
  // Perform logout and redirect
  logout()
  router.push('/')
}
</script>

<template>
  <div class="relative">
    <button
      class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
      @click="toggleMenu"
      aria-label="User menu"
    >
      <img
        :src="user.avatar"
        :alt="user.name"
        class="w-9 h-9 rounded-full border-2 border-(--primary) object-cover"
      />
      <span class="hidden md:block text-sm font-medium text-white">{{ user.name }}</span>
      <i class="pi pi-chevron-down text-xs text-(--text-secondary)"></i>
    </button>

    <Menu
      ref="menu"
      :model="menuItems"
      :popup="true"
      class="mt-2"
      :pt="{
        root: { class: 'glass-card border-0 min-w-[200px] p-2' },
        item: { class: 'rounded-lg' },
        itemContent: {
          class:
            'px-4 py-2.5 text-(--text-secondary) hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer',
        },
        itemIcon: { class: 'mr-3 text-(--primary)' },
        itemLabel: { class: 'text-sm' },
        separator: { class: 'border-t border-white/10 my-2' },
      }"
    />
  </div>
</template>
