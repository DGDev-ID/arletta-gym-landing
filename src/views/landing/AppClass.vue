<script setup lang="ts">
import { ref, onMounted } from 'vue'
interface ClassItem {
  id: number
  name: string
  description?: string
  duration?: string
  level?: string
  trainer?: string
  image?: string
  category?: string
  benefits?: string[]
  spotsLeft?: number
  totalSpots?: number
  location?: string
}
interface ScheduleItem {
  class: string
  trainer?: string
  time: string
  spotsLeft?: number
  totalSpots?: number
}
import { getSchedules, getClasses, getClassCategories } from '@/services/scheduleService'
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

const classes = ref<ClassItem[]>([])

const schedule = ref<Record<string, ScheduleItem[]>>({})

onMounted(async () => {
  try {
    const classesData = await getClasses()
    // map to expected UI shape (keep fields the UI expects)
    classes.value = Array.isArray(classesData)
      ? classesData.map((c) => ({
          id: Number((c && (c.id ?? 0)) ?? 0),
          name: String((c && (c.name ?? '')) ?? ''),
          description: String((c && (c.description ?? '')) ?? ''),
          duration: String((c && (c.duration ?? '45 min')) ?? '45 min'),
          level: String((c && (c.level ?? 'All Levels')) ?? 'All Levels'),
          trainer: String((c && (c.trainer ?? c.trainer_name)) ?? ''),
          image: String((c && (c.image ?? c.avatar)) ?? '/placeholder-class.jpg'),
          category: String((c && (c.category ?? 'General')) ?? 'General'),
          benefits: Array.isArray(c?.benefits) ? c.benefits : [],
          spotsLeft: Number((c && (c.spots_left ?? c.spotsLeft ?? 10)) ?? 10),
          totalSpots: Number((c && (c.total_spots ?? c.totalSpots ?? 20)) ?? 20),
          location: String((c && (c.location ?? 'Studio A')) ?? 'Studio A'),
        }))
      : []

    const schedulesData = await getSchedules()
    // Expect schedulesData to be an object or array; normalize to Record<string, ScheduleItem[]>
    if (schedulesData && typeof schedulesData === 'object') {
      // If API returns an array of schedule entries, transform them
      if (Array.isArray(schedulesData)) {
        // group by day name
        const grouped: Record<string, ScheduleItem[]> = {}
        for (const item of schedulesData as Array<Record<string, unknown>>) {
          const day = String(item['day'] ?? item['weekday'] ?? 'monday').toLowerCase()
          if (!grouped[day]) grouped[day] = []
          grouped[day].push({
            time: String(item['time'] ?? item['start_time'] ?? '06:00'),
            class: String(item['class_name'] ?? item['name'] ?? ''),
            trainer: String(item['trainer_name'] ?? item['trainer'] ?? ''),
            spotsLeft: Number(item['spots_left'] ?? item['spotsLeft'] ?? 10),
            totalSpots: Number(item['total_spots'] ?? item['totalSpots'] ?? 20),
          })
        }
        schedule.value = grouped
      } else {
        // If already a map, cast directly
        schedule.value = schedulesData as Record<string, ScheduleItem[]>
      }
    }
  } catch (err) {
    // swallow: keep fallback UI data empty
    console.warn('Failed to load classes/schedules', err)
  }

  // Fetch class categories from API, fallback to static list
  try {
    const rawCats = await getClassCategories()
    const list = Array.isArray(rawCats) ? rawCats : []
    if (list.length > 0) {
      const names = list.map((c) => {
        const obj = (c as unknown) as Record<string, unknown>
        return String(obj['name'] ?? obj['label'] ?? c)
      })
      // Ensure 'All' is always first
      categories.value = ['All', ...names.filter((n) => n !== 'All')]
    }
  } catch {
    // silently keep static fallback already set
  }
})

const categories = ref<string[]>(['All', 'Cardio', 'Strength', 'Mind & Body', 'Combat'])
const activeCategory = ref('All')

const filteredClasses = ref<ClassItem[]>([])
const filterByCategory = (category: string) => {
  activeCategory.value = category
  if (category === 'All') {
    filteredClasses.value = classes.value
  } else {
    filteredClasses.value = classes.value.filter((c) => c.category === category)
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
