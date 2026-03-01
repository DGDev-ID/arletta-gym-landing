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
    name: 'HIIT Burn',
    description:
      'High-intensity interval training designed to maximize calorie burn and boost metabolism. Perfect for those looking to lose weight and build endurance.',
    duration: '45 min',
    level: 'Intermediate',
    trainer: 'Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&h=400&fit=crop',
    category: 'Cardio',
    benefits: [
      'Burns 500+ calories',
      'Improves cardiovascular health',
      'Boosts metabolism for 24hrs',
    ],
    spotsLeft: 8,
    totalSpots: 20,
    location: 'Studio A',
  },
  {
    id: 2,
    name: 'Power Yoga',
    description:
      'A dynamic yoga practice that builds strength, flexibility, and mental focus. Suitable for all levels with modifications available.',
    duration: '60 min',
    level: 'All Levels',
    trainer: 'Maya Chen',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
    category: 'Mind & Body',
    benefits: ['Increases flexibility', 'Reduces stress', 'Builds core strength'],
    spotsLeft: 12,
    totalSpots: 15,
    location: 'Yoga Studio',
  },
  {
    id: 3,
    name: 'Strength Foundation',
    description:
      'Learn proper weightlifting techniques and build a solid strength base. Focus on compound movements for maximum results.',
    duration: '50 min',
    level: 'Beginner',
    trainer: 'Mike Torres',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=600&h=400&fit=crop',
    category: 'Strength',
    benefits: ['Builds lean muscle', 'Improves posture', 'Increases bone density'],
    spotsLeft: 5,
    totalSpots: 16,
    location: 'Weight Room',
  },
  {
    id: 4,
    name: 'Spin Cycle',
    description:
      'Indoor cycling class set to energizing music. Adjust resistance to match your fitness level while riding to the beat.',
    duration: '45 min',
    level: 'All Levels',
    trainer: 'David Kim',
    image: 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600&h=400&fit=crop',
    category: 'Cardio',
    benefits: ['Low impact cardio', 'Strengthens legs', 'Great for beginners'],
    spotsLeft: 0,
    totalSpots: 20,
    location: 'Cycling Studio',
  },
  {
    id: 5,
    name: 'Boxing Fundamentals',
    description:
      'Learn boxing techniques while getting an incredible full-body workout. No sparring, just pure fitness and skill building.',
    duration: '60 min',
    level: 'Beginner',
    trainer: 'Carlos Rodriguez',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&h=400&fit=crop',
    category: 'Combat',
    benefits: ['Full body workout', 'Stress relief', 'Improves coordination'],
    spotsLeft: 14,
    totalSpots: 16,
    location: 'Boxing Ring',
  },
  {
    id: 6,
    name: 'Core Crusher',
    description:
      'Intensive core-focused workout targeting abs, obliques, and lower back. Build a strong foundation for all your other activities.',
    duration: '30 min',
    level: 'Intermediate',
    trainer: 'Lisa Park',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop',
    category: 'Strength',
    benefits: ['Six-pack abs', 'Better posture', 'Reduced back pain'],
    spotsLeft: 3,
    totalSpots: 12,
    location: 'Studio B',
  },
]

const schedule: Record<
  string,
  { time: string; class: string; trainer: string; spotsLeft: number; totalSpots: number }[]
> = {
  monday: [
    { time: '06:00', class: 'HIIT Burn', trainer: 'Sarah Johnson', spotsLeft: 8, totalSpots: 20 },
    { time: '08:00', class: 'Power Yoga', trainer: 'Maya Chen', spotsLeft: 12, totalSpots: 15 },
    { time: '12:00', class: 'Core Crusher', trainer: 'Lisa Park', spotsLeft: 3, totalSpots: 12 },
    {
      time: '17:00',
      class: 'Strength Foundation',
      trainer: 'Mike Torres',
      spotsLeft: 5,
      totalSpots: 16,
    },
    { time: '19:00', class: 'Spin Cycle', trainer: 'David Kim', spotsLeft: 0, totalSpots: 20 },
  ],
  tuesday: [
    { time: '06:00', class: 'Spin Cycle', trainer: 'David Kim', spotsLeft: 10, totalSpots: 20 },
    {
      time: '09:00',
      class: 'Boxing Fundamentals',
      trainer: 'Carlos Rodriguez',
      spotsLeft: 14,
      totalSpots: 16,
    },
    { time: '12:00', class: 'Power Yoga', trainer: 'Maya Chen', spotsLeft: 6, totalSpots: 15 },
    { time: '18:00', class: 'HIIT Burn', trainer: 'Sarah Johnson', spotsLeft: 4, totalSpots: 20 },
  ],
  wednesday: [
    { time: '06:00', class: 'HIIT Burn', trainer: 'Sarah Johnson', spotsLeft: 11, totalSpots: 20 },
    { time: '08:00', class: 'Core Crusher', trainer: 'Lisa Park', spotsLeft: 7, totalSpots: 12 },
    {
      time: '12:00',
      class: 'Strength Foundation',
      trainer: 'Mike Torres',
      spotsLeft: 9,
      totalSpots: 16,
    },
    { time: '17:00', class: 'Power Yoga', trainer: 'Maya Chen', spotsLeft: 0, totalSpots: 15 },
    {
      time: '19:00',
      class: 'Boxing Fundamentals',
      trainer: 'Carlos Rodriguez',
      spotsLeft: 15,
      totalSpots: 16,
    },
  ],
  thursday: [
    { time: '06:00', class: 'Spin Cycle', trainer: 'David Kim', spotsLeft: 8, totalSpots: 20 },
    { time: '09:00', class: 'Power Yoga', trainer: 'Maya Chen', spotsLeft: 5, totalSpots: 15 },
    { time: '12:00', class: 'HIIT Burn', trainer: 'Sarah Johnson', spotsLeft: 12, totalSpots: 20 },
    {
      time: '18:00',
      class: 'Strength Foundation',
      trainer: 'Mike Torres',
      spotsLeft: 3,
      totalSpots: 16,
    },
  ],
  friday: [
    { time: '06:00', class: 'HIIT Burn', trainer: 'Sarah Johnson', spotsLeft: 6, totalSpots: 20 },
    {
      time: '08:00',
      class: 'Boxing Fundamentals',
      trainer: 'Carlos Rodriguez',
      spotsLeft: 10,
      totalSpots: 16,
    },
    { time: '12:00', class: 'Core Crusher', trainer: 'Lisa Park', spotsLeft: 1, totalSpots: 12 },
    { time: '17:00', class: 'Spin Cycle', trainer: 'David Kim', spotsLeft: 13, totalSpots: 20 },
  ],
  saturday: [
    { time: '08:00', class: 'Power Yoga', trainer: 'Maya Chen', spotsLeft: 8, totalSpots: 15 },
    { time: '10:00', class: 'HIIT Burn', trainer: 'Sarah Johnson', spotsLeft: 15, totalSpots: 20 },
    {
      time: '12:00',
      class: 'Strength Foundation',
      trainer: 'Mike Torres',
      spotsLeft: 4,
      totalSpots: 16,
    },
  ],
  sunday: [
    { time: '09:00', class: 'Power Yoga', trainer: 'Maya Chen', spotsLeft: 10, totalSpots: 15 },
    { time: '11:00', class: 'Core Crusher', trainer: 'Lisa Park', spotsLeft: 0, totalSpots: 12 },
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
