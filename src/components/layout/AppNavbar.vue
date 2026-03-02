<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Button from 'primevue/button'
import UserDropdown from '@/components/user/UserDropdown.vue'
import PTDropdown from '@/components/user/PTDropdown.vue'
import authState, { logout } from '@/stores/auth'
import { logout as apiLogout } from '@/services/authService'

const router = useRouter()
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const navLinks = [
  { name: 'Home', to: '/', icon: 'pi-home' },
  { name: 'Membership', to: '/membership', icon: 'pi-id-card' },
  { name: 'Class Programs', to: '/programs', icon: 'pi-calendar' },
  { name: 'Trainers', to: '/trainers', icon: 'pi-users' },
  { name: 'About Us', to: '/about', icon: 'pi-info-circle' },
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))

const navbarClass = computed(() => (isScrolled.value ? 'navbar-glass' : 'navbar-transparent'))

const goToLogin = () => router.push('/login')
const goToSignUp = () => router.push('/signup')
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const memberMenuItems = [
  { label: 'Profile', icon: 'pi-user', route: '/member/profile' },
  { label: 'My Schedule', icon: 'pi-calendar', route: '/member/schedule' },
]

const ptMenuItems = [
  { label: 'Profile', icon: 'pi-user', route: '/pt/profile' },
  { label: 'My Clients', icon: 'pi-users', route: '/pt/clients' },
  { label: 'My Schedule', icon: 'pi-calendar', route: '/pt/schedule' },
]

const menuItems = computed(() => (authState.user?.role === 'pt' ? ptMenuItems : memberMenuItems))

const handleLogout = async () => {
  await apiLogout()
  logout()
  isMobileMenuOpen.value = false
  router.push('/')
}
</script>

<template>
  <nav :class="['fixed top-0 left-0 right-0 z-50 transition-all duration-300', navbarClass]">
    <div class="container-custom">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
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
              >{{ link.name }}</a
            >
          </RouterLink>
        </div>

        <!-- Desktop Right Side -->
        <div class="hidden lg:flex items-center gap-4">
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
          <template v-else>
            <UserDropdown v-if="authState.user?.role === 'member'" :user="authState.user" />
            <PTDropdown v-else-if="authState.user?.role === 'pt'" :user="authState.user" />
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <button class="lg:hidden p-2 text-white" @click="toggleMobileMenu" aria-label="Toggle menu">
          <i
            :class="[
              'pi text-xl transition-transform duration-200',
              isMobileMenuOpen ? 'pi-times rotate-90' : 'pi-bars',
            ]"
          ></i>
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
        <div
          v-if="isMobileMenuOpen"
          class="lg:hidden glass-card mt-2 rounded-2xl overflow-hidden max-h-[80vh] overflow-y-auto"
        >
          <!-- ===== NOT LOGGED IN ===== -->
          <template v-if="!authState.isLoggedIn">
            <div class="flex flex-col gap-1 p-3">
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
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm',
                    isExactActive
                      ? 'text-white bg-white/8'
                      : 'text-(--text-secondary) hover:text-white hover:bg-white/5',
                  ]"
                >
                  <i
                    :class="[
                      'pi text-base w-5 text-center',
                      link.icon,
                      isExactActive ? 'text-(--primary)' : 'text-white/30',
                    ]"
                  ></i>
                  {{ link.name }}
                </a>
              </RouterLink>
            </div>
            <div class="px-3 pb-3 flex flex-col gap-2 border-t border-white/[0.07] pt-3">
              <Button
                label="Login"
                class="btn w-full py-3 text-sm font-semibold"
                @click="goToLogin"
              />
              <Button
                label="Sign Up"
                outlined
                class="w-full py-3 text-sm font-semibold border-white/20 text-white hover:bg-white/10"
                @click="goToSignUp"
              />
            </div>
          </template>

          <!-- ===== LOGGED IN ===== -->
          <template v-else>
            <!-- User identity banner -->
            <div class="relative px-4 pt-5 pb-4 overflow-hidden">
              <!-- Red glow accent -->
              <div
                class="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse,rgba(230,33,41,0.15)_0%,transparent_70%)] pointer-events-none"
              ></div>

              <div class="relative flex items-center gap-3.5">
                <!-- Avatar with ring -->
                <div class="relative flex-shrink-0">
                  <div
                    class="w-14 h-14 rounded-full bg-(--primary)/20 border-2 border-(--primary)/40 flex items-center justify-center overflow-hidden"
                  >
                    <img
                      v-if="authState.user?.avatar"
                      :src="authState.user.avatar"
                      alt="avatar"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-xl font-bold text-(--primary)">
                      {{ authState.user?.name?.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <!-- Online dot -->
                  <span
                    class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black/60"
                  ></span>
                </div>

                <!-- Name & role -->
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-white text-base truncate">
                    {{ authState.user?.name }}
                  </div>
                  <div class="text-xs text-white/45 truncate">{{ authState.user?.email }}</div>
                  <div
                    class="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase"
                    :class="
                      authState.user?.role === 'pt'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                        : 'bg-(--primary)/15 text-(--primary) border border-(--primary)/25'
                    "
                  >
                    <i
                      :class="[
                        'pi text-[9px]',
                        authState.user?.role === 'pt' ? 'pi-star-fill' : 'pi-user',
                      ]"
                    ></i>
                    {{ authState.user?.role === 'pt' ? 'Personal Trainer' : 'Member' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Nav links -->
            <div class="flex flex-col gap-0.5 p-3">
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
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm',
                    isExactActive
                      ? 'text-white bg-white/8'
                      : 'text-(--text-secondary) hover:text-white hover:bg-white/5',
                  ]"
                >
                  <i
                    :class="[
                      'pi text-sm w-5 text-center',
                      link.icon,
                      isExactActive ? 'text-(--primary)' : 'text-white/30',
                    ]"
                  ></i>
                  {{ link.name }}
                </a>
              </RouterLink>
            </div>

            <!-- Divider -->
            <div class="h-px bg-white/[0.07] mx-4"></div>

            <!-- Menu items -->
            <div class="flex flex-col gap-0.5 p-3">
              <a
                v-for="item in menuItems"
                :key="item.label"
                @click="
                  () => {
                    router.push(item.route)
                    isMobileMenuOpen = false
                  }
                "
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-(--text-secondary) hover:text-white hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div
                  class="w-8 h-8 rounded-lg bg-white/5 border border-white/[0.07] flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-(--primary)/15 group-hover:border-(--primary)/25"
                >
                  <i
                    :class="[
                      'pi text-sm text-white/40 group-hover:text-(--primary) transition-colors',
                      item.icon,
                    ]"
                  ></i>
                </div>
                <span class="font-medium">{{ item.label }}</span>
                <i
                  class="pi pi-chevron-right text-[10px] text-white/20 ml-auto group-hover:text-white/40 transition-colors"
                ></i>
              </a>
            </div>

            <!-- Divider -->
            <div class="h-px bg-white/[0.07] mx-4"></div>

            <!-- Logout -->
            <div class="p-3">
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all group cursor-pointer"
              >
                <div
                  class="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0"
                >
                  <i class="pi pi-sign-out text-sm text-red-400"></i>
                </div>
                <span>Logout</span>
                <i
                  class="pi pi-arrow-right text-[10px] text-red-400/40 ml-auto group-hover:text-red-400/70 transition-colors"
                ></i>
              </button>
            </div>
          </template>
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
