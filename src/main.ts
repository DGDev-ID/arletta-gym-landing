import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { setUser } from '@/stores/auth'
import { me as apiMe } from '@/services/authService'

import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import AnimateOnScroll from 'primevue/animateonscroll'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import './assets/main.css'

const app = createApp(App)

document.documentElement.classList.add('dark')

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark', // ← ini yang paling penting
    },
  },
})
app.directive('animateonscroll', AnimateOnScroll)
app.use(ToastService)
app.use(createPinia())
app.use(router)

;(async () => {
  // attempt to hydrate user from persisted token before mounting
  try {
    const data = await apiMe()
    // data can be a wrapped object (member/trainer) — attempt to extract basic fields
    const obj = data && typeof data === 'object' ? (data as Record<string, unknown>) : null
    const u = obj
      ? 'member' in obj
        ? obj['member']
        : 'trainer' in obj
          ? obj['trainer']
          : obj
      : null
    if (u && typeof u === 'object') {
      const uObj = u as Record<string, unknown>
      setUser({
        id: Number(
          uObj['id'] ?? (uObj['user'] && (uObj['user'] as Record<string, unknown>)['id']) ?? 0,
        ),
        name: String(
          uObj['name'] ?? (uObj['user'] && (uObj['user'] as Record<string, unknown>)['name']) ?? '',
        ),
        email: String(
          uObj['email'] ??
            (uObj['user'] && (uObj['user'] as Record<string, unknown>)['email']) ??
            '',
        ),
        role: String(
          (uObj['role'] as string | undefined) ?? (uObj['roles'] as string | undefined) ?? '',
        )
          .toLowerCase()
          .includes('pt')
          ? 'pt'
          : 'member',
      })
    }
  } catch {
    // ignore
  }
  app.mount('#app')
})()
