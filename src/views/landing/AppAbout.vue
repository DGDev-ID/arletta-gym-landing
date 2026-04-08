<script setup lang="ts">
import { useRouter } from 'vue-router'
import HeroAbout from '@/components/landing/about/HeroAbout.vue'
import StorySection from '@/components/landing/about/StorySection.vue'
import ValuesSection from '@/components/landing/about/ValuesSection.vue'
import TimelineSection from '@/components/landing/about/TimelineSection.vue'
import TeamSection from '@/components/landing/about/TeamSection.vue'
import LocationSection from '@/components/landing/about/LocationSection.vue'
import AboutCTA from '@/components/landing/about/AboutCTA.vue'

const router = useRouter()
const goToSignUp = () => router.push('/signup')

const story = {
  title: 'Cerita Kami',
  content: `Didirikan pada tahun 2026, Arletta Gym lahir dari sebuah visi sederhana: menciptakan ruang kebugaran di mana setiap orang merasa diterima, didukung, dan berdaya untuk mencapai tujuan mereka. Apa yang bermula sebagai gym kecil di lingkungan sekitar kini telah berkembang menjadi komunitas kebugaran yang penuh semangat.

Pendiri kami, James Arletta, seorang mantan atlet profesional, ingin menghadirkan standar pelatihan terbaik yang pernah ia rasakan kepada masyarakat umum. Ia percaya bahwa dengan lingkungan, peralatan, dan bimbingan yang tepat, siapa pun bisa mengubah hidupnya melalui kebugaran.

Hari ini, kami terus menjalankan misi tersebut dengan fasilitas berteknologi mutakhir, trainer kelas dunia, dan komunitas yang merayakan setiap pencapaian — sekecil apa pun.`,
}

const values = [
  {
    icon: 'pi-heart',
    title: 'Komunitas Utama',
    description:
      'Kami percaya kebugaran lebih bermakna bersama. Gym kami adalah tempat di mana persahabatan terjalin dan semua orang saling mendukung.',
  },
  {
    icon: 'pi-star',
    title: 'Keunggulan',
    description:
      'Dari peralatan hingga trainer kami, kami menjaga standar tertinggi untuk memberikan hasil yang luar biasa.',
  },
  {
    icon: 'pi-users',
    title: 'Inklusivitas',
    description:
      'Semua orang disambut di sini. Kami menerima semua level kebugaran, tipe tubuh, dan latar belakang.',
  },
  {
    icon: 'pi-chart-line',
    title: 'Berorientasi Hasil',
    description: 'Kami mengukur keberhasilan kami dari kemajuan Anda. Tujuan Anda adalah tujuan kami.',
  },
]

const timeline = [{ year: '2026', event: 'Grand Opening bulan April' }]

const team = [
  {
    name: 'James Arletta',
    role: 'Founder & CEO',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
  },
  {
    name: 'Emily Chen',
    role: 'Operations Director',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
  },
  {
    name: 'Marcus Johnson',
    role: 'Head of Training',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  },
]

const storyParagraphs = story.content.split('\n\n')
// Toggle to hide/show the leadership/team section without removing code
const showTeam = false
</script>

<template>
  <div class="min-h-screen bg-(--bg-dark)">
    <!-- Hero Section (component) -->
    <HeroAbout
      :title="'Tentang Arletta Gym'"
      :subtitle="'Lebih dari sekadar gym. Kami adalah komunitas yang berdedikasi untuk membantu Anda menjadi versi terkuat dari diri sendiri.'"
    />

    <!-- Story Section (component) -->
    <StorySection :title="story.title" :paragraphs="storyParagraphs" />

    <!-- Values Section (component) -->
    <ValuesSection :values="values" />

    <!-- Timeline Section (component) -->
    <TimelineSection :timeline="timeline" />

    <!-- Team Section (component) - hidden via `showTeam` flag -->
    <TeamSection v-if="showTeam" :team="team" />

    <!-- Location Section (component) -->
    <LocationSection />

    <!-- CTA Section (component) -->
    <AboutCTA @signup="goToSignUp" />
  </div>
</template>
