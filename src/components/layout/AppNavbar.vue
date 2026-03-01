<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Button from 'primevue/button'
import UserDropdown from '@/components/user/UserDropdown.vue'
import PTDropdown from '@/components/user/PTDropdown.vue'
import authState from '@/stores/auth'

// Use shared auth state

const router = useRouter()
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const navLinks = [
  { name: 'Home', to: '/' },
  { name: 'Membership', to: '/membership' },
  { name: 'Class Programs', to: '/programs' },
  { name: 'Trainers', to: '/trainers' },
  { name: 'About Us', to: '/about' },
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const navbarClass = computed(() => {
  return isScrolled.value ? 'navbar-glass' : 'navbar-transparent'
})

const goToLogin = () => {
  router.push('/login')
}

const goToSignUp = () => {
  router.push('/signup')
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <nav :class="['fixed top-0 left-0 right-0 z-50 transition-all duration-300', navbarClass]">
    <div class="container-custom">
      <div class="flex items-center justify-between h-20">
        <!-- Logo (use public asset) -->
        <RouterLink to="/" class="flex items-center gap-2">
          <img src="/logo-gym.svg" alt="Arletta Gym" class="h-10 w-auto" />
        </RouterLink>

        <!-- Desktop Navigation -->
        <div class="hidden lg:flex items-center gap-8">
          <RouterLink
            v-for="link in navLinks"
            :key="link.name"
            :to="link.to"
            v-slot="{ navigate, isExactActive }"
          >
            <a
              @click="navigate"
              :class="[
                'text-sm font-medium transition-colors duration-200',
                isExactActive ? 'text-white' : 'text-(--text-secondary)',
              ]"
            >
              {{ link.name }}
            </a>
          </RouterLink>
        </div>

        <!-- Right Side -->
        <div class="hidden lg:flex items-center gap-4">
          <!-- Not logged in -->
          <template v-if="!authState.isLoggedIn">
            <Button
              label="Login"
              class="btn px-6 py-2.5 text-sm font-semibold"
              @click="goToLogin"
            />
            <Button
              label="Sign Up"
              outlined
              class="px-5 py-2.5 text-sm font-semibold border-white/20 text-white hover:bg-white/10"
              @click="goToSignUp"
            />
          </template>

          <!-- Logged in - Show appropriate dropdown based on role -->
          <template v-else>
            <UserDropdown
              v-if="authState.user && authState.user.role === 'member'"
              :user="authState.user"
            />
            <PTDropdown
              v-else-if="authState.user && authState.user.role === 'pt'"
              :user="authState.user"
            />
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <button class="lg:hidden p-2 text-white" @click="toggleMobileMenu" aria-label="Toggle menu">
          <i :class="['pi text-xl', isMobileMenuOpen ? 'pi-times' : 'pi-bars']"></i>
        </button>
      </div>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="isMobileMenuOpen" class="lg:hidden glass-card mt-2 p-4 rounded-xl">
          <div class="flex flex-col gap-2">
            <RouterLink
              v-for="link in navLinks"
              :key="link.name"
              :to="link.to"
              v-slot="{ navigate, isExactActive }"
            >
              <a
                @click="
                  () => {
                    navigate()
                    isMobileMenuOpen = false
                  }
                "
                :class="[
                  'px-4 py-3 rounded-lg transition-all',
                  isExactActive
                    ? 'text-white bg-white/5'
                    : 'text-(--text-secondary) hover:text-white hover:bg-white/5',
                ]"
              >
                {{ link.name }}
              </a>
            </RouterLink>

            <div class="border-t border-white/10 my-2"></div>

            <template v-if="!authState.isLoggedIn">
              <Button
                label="Login"
                class="btn btn-red w-full py-3 text-sm font-semibold"
                @click="goToLogin"
              />
              <Button
                label="Sign Up"
                outlined
                class="w-full mt-2 py-3 text-sm font-semibold border-white/20 text-white hover:bg-white/10"
                @click="goToSignUp"
              />
            </template>
          </div>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<style scoped>
.router-link-active {
  color: white;
}
</style>
