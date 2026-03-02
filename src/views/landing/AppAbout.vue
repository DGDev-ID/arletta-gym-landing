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
  title: 'Our Story',
  content: `Founded in 2026, Arletta Gym began with a simple vision: to create a fitness space where everyone feels welcome, supported, and empowered to achieve their goals. What started as a small neighborhood gym has grown into a thriving fitness community.

Our founder, James Arletta, a former professional athlete, wanted to bring the same level of training excellence he experienced to everyday people. He believed that with the right environment, equipment, and guidance, anyone could transform their life through fitness.

Today, we continue that mission with state-of-the-art facilities, world-class trainers, and a community that celebrates every victory—big or small.`,
}

const values = [
  {
    icon: 'pi-heart',
    title: 'Community First',
    description:
      'We believe fitness is better together. Our gym is a place where friendships are forged and everyone supports each other.',
  },
  {
    icon: 'pi-star',
    title: 'Excellence',
    description:
      'From our equipment to our trainers, we maintain the highest standards to deliver exceptional results.',
  },
  {
    icon: 'pi-users',
    title: 'Inclusivity',
    description:
      'Everyone belongs here. We welcome all fitness levels, body types, and backgrounds.',
  },
  {
    icon: 'pi-chart-line',
    title: 'Results-Driven',
    description: 'We measure our success by your progress. Your goals become our goals.',
  },
]

const timeline = [
  { year: '2026', event: 'Grand Opening on April' },
]

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
      :title="'About Arletta Gym'"
      :subtitle="'More than a gym. We\'re a community dedicated to helping you become the strongest version of yourself.'"
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
