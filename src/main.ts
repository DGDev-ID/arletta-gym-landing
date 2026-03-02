import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import AnimateOnScroll from 'primevue/animateonscroll'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import './assets/main.css'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})
app.directive('animateonscroll', AnimateOnScroll)
app.use(ToastService)
app.use(createPinia())
app.use(router)

// Force dark class on document root so any class-based dark styles and
// third-party components render consistently in dark mode regardless of
// the user's OS/browser color-scheme preference.
try {
  document.documentElement.classList.add('dark')
  document.documentElement.setAttribute('data-theme', 'dark')
} catch (e) {
  /* ignore server-side or restricted environments */
}

app.mount('#app')
