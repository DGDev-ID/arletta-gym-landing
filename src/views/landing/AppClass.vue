<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HeroClass from '@/components/landing/class/HeroClass.vue'
import ClassCategories from '@/components/landing/class/ClassCategories.vue'
import ClassCards from '@/components/landing/class/ClassCards.vue'
import WeeklySchedule from '@/components/landing/class/WeeklySchedule.vue'
import ClassCTA from '@/components/landing/class/ClassCTA.vue'

const router = useRouter()
const goToSignUp = () => router.push('/signup')

const activeDay = ref('monday')

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const classes = [
  {
    id: 1,
    name: 'Zumba',
    description:
      'Dance-based cardio class with easy-to-follow choreography set to upbeat music. Great for all fitness levels and fun to attend.',
    duration: '50 min',
    level: 'All Levels',
    trainer: 'Ana Putri',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    category: 'Cardio',
    benefits: ['Cardio endurance', 'Coordination', 'Fun group atmosphere'],
    spotsLeft: 12,
    totalSpots: 25,
    location: 'Studio A',
  },
  {
    id: 2,
    name: 'Aerobik',
    description:
      'Classic aerobics session combining low and high impact moves to boost stamina and burn calories.',
    duration: '45 min',
    level: 'Intermediate',
    trainer: 'Budi Santoso',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop',
    category: 'Cardio',
    benefits: ['Fat burn', 'Improves coordination', 'Heart health'],
    spotsLeft: 10,
    totalSpots: 20,
    location: 'Studio A',
  },
  {
    id: 3,
    name: 'Pilates',
    description:
      'A controlled movement practice focusing on core strength, alignment, and flexibility. Suitable for all levels.',
    duration: '50 min',
    level: 'All Levels',
    trainer: 'Sari Wijaya',
    image: 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=600&h=400&fit=crop',
    category: 'Mind & Body',
    benefits: ['Core strength', 'Flexibility', 'Posture improvement'],
    spotsLeft: 8,
    totalSpots: 18,
    location: 'Studio B',
  },
  {
    id: 4,
    name: 'Yoga',
    description:
      'Mindful yoga practice blending breath, mobility, and strength to help you recover and improve mobility.',
    duration: '60 min',
    level: 'All Levels',
    trainer: 'Maya Chen',
    image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&h=400&fit=crop',
    category: 'Mind & Body',
    benefits: ['Flexibility', 'Stress relief', 'Balance'],
    spotsLeft: 14,
    totalSpots: 20,
    location: 'Yoga Studio',
  },
  {
    id: 5,
    name: 'Muay Thai',
    description:
      'Traditional Muay Thai training focusing on striking, conditioning, and technique. Suitable for those seeking high-intensity combat training.',
    duration: '60 min',
    level: 'Intermediate',
    trainer: 'Rachmat H.',
    image: 'https://images.unsplash.com/photo-1615117972428-28de67cda58e?w=600&h=400&fit=crop',
    category: 'Combat',
    benefits: ['Power', 'Conditioning', 'Self-defense skills'],
    spotsLeft: 12,
    totalSpots: 20,
    location: 'Ring',
  },
  {
    id: 6,
    name: 'Boxing',
    description:
      'Technique-driven boxing class focusing on pad work, footwork, and conditioning. Great for fitness and skill development.',
    duration: '60 min',
    level: 'All Levels',
    trainer: 'Carlos Rodriguez',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&h=400&fit=crop',
    category: 'Combat',
    benefits: ['Cardio', 'Coordination', 'Power'],
    spotsLeft: 16,
    totalSpots: 20,
    location: 'Boxing Ring',
  },
]

const schedule: Record<
  string,
  { time: string; class: string; trainer: string; spotsLeft: number; totalSpots: number }[]
> = {
  monday: [
    { time: '06:00', class: 'Zumba', trainer: 'Ana Putri', spotsLeft: 12, totalSpots: 25 },
    { time: '08:00', class: 'Yoga', trainer: 'Maya Chen', spotsLeft: 14, totalSpots: 20 },
    { time: '12:00', class: 'Pilates', trainer: 'Sari Wijaya', spotsLeft: 8, totalSpots: 18 },
    { time: '17:00', class: 'Aerobik', trainer: 'Budi Santoso', spotsLeft: 10, totalSpots: 20 },
    { time: '19:00', class: 'Boxing', trainer: 'Carlos Rodriguez', spotsLeft: 16, totalSpots: 20 },
  ],
  tuesday: [
    { time: '06:00', class: 'Aerobik', trainer: 'Budi Santoso', spotsLeft: 10, totalSpots: 20 },
    { time: '09:00', class: 'Boxing', trainer: 'Carlos Rodriguez', spotsLeft: 14, totalSpots: 20 },
    { time: '12:00', class: 'Yoga', trainer: 'Maya Chen', spotsLeft: 6, totalSpots: 20 },
  { time: '18:00', class: 'Muay Thai', trainer: 'Rachmat H.', spotsLeft: 9, totalSpots: 20 },
  ],
  wednesday: [
    { time: '06:00', class: 'Zumba', trainer: 'Ana Putri', spotsLeft: 15, totalSpots: 25 },
    { time: '08:00', class: 'Pilates', trainer: 'Sari Wijaya', spotsLeft: 7, totalSpots: 18 },
    { time: '12:00', class: 'Aerobik', trainer: 'Budi Santoso', spotsLeft: 9, totalSpots: 20 },
    { time: '17:00', class: 'Yoga', trainer: 'Maya Chen', spotsLeft: 0, totalSpots: 20 },
    { time: '19:00', class: 'Boxing', trainer: 'Carlos Rodriguez', spotsLeft: 15, totalSpots: 20 },
  ],
  thursday: [
    { time: '06:00', class: 'Aerobik', trainer: 'Budi Santoso', spotsLeft: 8, totalSpots: 20 },
    { time: '09:00', class: 'Yoga', trainer: 'Maya Chen', spotsLeft: 5, totalSpots: 20 },
    { time: '12:00', class: 'Zumba', trainer: 'Ana Putri', spotsLeft: 12, totalSpots: 25 },
    { time: '18:00', class: 'Pilates', trainer: 'Sari Wijaya', spotsLeft: 6, totalSpots: 18 },
  ],
  friday: [
    { time: '06:00', class: 'Zumba', trainer: 'Ana Putri', spotsLeft: 6, totalSpots: 25 },
    { time: '08:00', class: 'Boxing', trainer: 'Carlos Rodriguez', spotsLeft: 10, totalSpots: 20 },
    { time: '12:00', class: 'Pilates', trainer: 'Sari Wijaya', spotsLeft: 1, totalSpots: 18 },
    { time: '17:00', class: 'Aerobik', trainer: 'Budi Santoso', spotsLeft: 13, totalSpots: 20 },
  ],
  saturday: [
    { time: '08:00', class: 'Yoga', trainer: 'Maya Chen', spotsLeft: 8, totalSpots: 20 },
    { time: '10:00', class: 'Zumba', trainer: 'Ana Putri', spotsLeft: 15, totalSpots: 25 },
    { time: '12:00', class: 'Pilates', trainer: 'Sari Wijaya', spotsLeft: 4, totalSpots: 18 },
  ],
  sunday: [
    { time: '09:00', class: 'Yoga', trainer: 'Maya Chen', spotsLeft: 10, totalSpots: 20 },
    { time: '11:00', class: 'Pilates', trainer: 'Sari Wijaya', spotsLeft: 0, totalSpots: 18 },
  ],
}

const categories = ['All', 'Cardio', 'Strength', 'Mind & Body', 'Combat']
const activeCategory = ref('All')

const filteredClasses = ref(classes)
const filterByCategory = (category: string) => {
  activeCategory.value = category
  if (category === 'All') {
    filteredClasses.value = classes
  } else {
    filteredClasses.value = classes.filter((c) => c.category === category)
  }
}
</script>

<template>
  <div class="min-h-screen bg-(--bg-dark)">
    <!-- Hero Section -->
    <HeroClass
      title="Class Programs"
      subtitle="From high-energy cardio to mindful yoga, find the perfect class to match your fitness goals. Expert instructors, motivating atmosphere, results guaranteed."
    />

    <!-- Class Categories -->
    <ClassCategories
      :categories="categories"
      :activeCategory="activeCategory"
      @select="filterByCategory"
    />

    <!-- Class Cards -->
    <ClassCards :classes="filteredClasses" @book="goToSignUp" />

    <!-- Weekly Schedule -->
    <WeeklySchedule
      :days="days"
      :schedule="schedule"
      :activeDay="activeDay"
      @update-day="(d) => (activeDay = d)"
      @book="goToSignUp"
    />

    <!-- CTA Section -->
    <ClassCTA @signup="goToSignUp" @view-membership="() => router.push('/membership')" />
  </div>
</template>
