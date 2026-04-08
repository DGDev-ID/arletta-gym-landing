<script setup lang="ts">
import { RouterLink } from 'vue-router'

const currentYear = new Date().getFullYear()

const quickLinks = [
  { name: 'Home', to: '/' },
  { name: 'Membership', to: '/#membership' },
  { name: 'Programs', to: '/#programs' },
  { name: 'Trainers', to: '/#trainers' },
]

const socialLinks = [
  { icon: 'pi-instagram', url: 'https://instagram.com/arletta.gym', label: 'Instagram' },
  { icon: 'pi-facebook', url: 'https://facebook.com', label: 'Facebook' },
  { icon: 'pi-twitter', url: 'https://twitter.com', label: 'Twitter' },
  { icon: 'pi-youtube', url: 'https://youtube.com', label: 'YouTube' },
]
</script>

<template>
  <!-- Add top margin and padding so footer content isn't cramped against the border -->
  <footer class="bg-(--bg-darker) border-t border-white/5 pt-12">
    <div class="container-custom section-padding pb-8">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <!-- Brand Column -->
        <div class="lg:col-span-2">
          <RouterLink to="/" class="inline-block mb-4">
            <img src="/logo-gym-wtext.svg" alt="Arletta Gym" class="h-10 w-auto" />
          </RouterLink>
          <p class="text-(--text-secondary) max-w-md mb-6 leading-relaxed">
            Transformasikan tubuh Anda dan tingkatkan kualitas hidup di Arletta Gym. Kami menyediakan fasilitas kelas dunia,
            trainer ahli, dan komunitas yang suportif untuk membantu Anda mencapai tujuan kebugaran.
          </p>
          <!-- Social Links -->
          <div class="flex gap-3">
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 rounded-lg bg-white/5 hover:bg-(--primary) flex items-center justify-center text-(--text-secondary) hover:text-white transition-all duration-300"
              :aria-label="social.label"
            >
              <i :class="['pi', social.icon]"></i>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-white font-semibold mb-4">Tautan Cepat</h4>
          <ul class="space-y-3">
            <li v-for="link in quickLinks" :key="link.name">
              <RouterLink
                :to="link.to"
                class="text-(--text-secondary) hover:text-white transition-colors"
              >
                {{ link.name }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h4 class="text-white font-semibold mb-4">Hubungi Kami</h4>
          <ul class="space-y-3 text-(--text-secondary)">
            <li class="flex items-start gap-3">
              <i class="pi pi-map-marker text-(--primary) mt-1"></i>
              <span
                >Gang Kelapa Gading RT 02 / RW 01, Kel. Wates, Kec. Ngaliyan<br />Semarang Barat,
                Jawa Tengah</span
              >
            </li>
            <li class="flex items-center gap-3">
              <i class="pi pi-phone text-(--primary)"></i>
              <span>0851-6860-2728</span>
            </li>
            <li class="flex items-center gap-3">
              <i class="pi pi-envelope text-(--primary)"></i>
              <span>gym@arlettaluxury.com</span>
            </li>
            <li class="flex items-center gap-3">
              <i class="pi pi-instagram text-(--primary)"></i>
              <a
                href="https://instagram.com/arletta.gym"
                target="_blank"
                rel="noopener noreferrer"
                class="text-(--text-secondary) hover:text-white"
                >@arletta.gym</a
              >
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div
        class="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <p class="text-(--text-muted) text-sm">
          &copy; {{ currentYear }} Arletta Gym. Hak cipta dilindungi.
        </p>
        <div class="flex gap-6 text-sm text-(--text-muted)">
          <a href="#" class="hover:text-white transition-colors">Kebijakan Privasi</a>
          <a href="#" class="hover:text-white transition-colors">Syarat & Ketentuan</a>
        </div>
      </div>
    </div>
  </footer>
</template>
