<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Skeleton from 'primevue/skeleton'
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
const classesLoading = ref(true)

const schedule = ref<Record<string, ScheduleItem[]>>({})

onMounted(async () => {
  try {
    classesLoading.value = true
    const classesData = await getClasses()
    // map to expected UI shape (keep fields the UI expects)
    classes.value = Array.isArray(classesData)
      ? classesData.map((c) => ({
          id: Number((c && (c.id ?? 0)) ?? 0),
          name: String((c && (c.name ?? '')) ?? ''),
          description: String((c && (c.description ?? '')) ?? ''),
          duration: c?.duration
            ? String(c.duration)
            : c?.duration_minutes
              ? `${c.duration_minutes} min`
              : undefined,
          level: c?.level ? String(c.level) : undefined,
          trainer: c?.trainer ? String(c.trainer) : undefined,
          image: String((c && (c.image ?? c.image_url ?? c.avatar)) ?? '/placeholder-class.jpg'),
          category: String((c && (c.category ?? 'General')) ?? 'General'),
          benefits: Array.isArray(c?.benefits) ? c.benefits : [],
          spotsLeft:
            c?.spotsLeft != null
              ? Number(c.spotsLeft)
              : c?.spots_left != null
                ? Number(c.spots_left)
                : undefined,
          totalSpots:
            c?.totalSpots != null
              ? Number(c.totalSpots)
              : c?.total_spots != null
                ? Number(c.total_spots)
                : undefined,
          location: c?.location ? String(c.location) : undefined,
        }))
      : []

    // Initialize filteredClasses so cards are visible on load
    filteredClasses.value = classes.value

    const schedulesData = await getSchedules()
    // Expect schedulesData to be an array; group by day-of-week derived from date
    if (schedulesData && typeof schedulesData === 'object') {
      if (Array.isArray(schedulesData)) {
        const dayNames = [
          'sunday',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ]
        const grouped: Record<string, ScheduleItem[]> = {}
        for (const item of schedulesData as Array<Record<string, unknown>>) {
          // BE returns { date, start_time, class: { name }, trainer: { name } }
          const dateStr = String(item['date'] ?? '')
          const cls = (item['class'] ?? {}) as Record<string, unknown>
          const trainer = (item['trainer'] ?? {}) as Record<string, unknown>
          // Derive day-of-week from date string; fallback to legacy 'day'/'weekday' field
          let day = ''
          if (dateStr) {
            const dt = new Date(dateStr + 'T00:00:00')
            if (!isNaN(dt.getTime())) {
              day = dayNames[dt.getDay()] ?? 'monday'
            }
          }
          if (!day) {
            day = String(item['day'] ?? item['weekday'] ?? 'monday').toLowerCase()
          }
          if (!grouped[day]) grouped[day] = []
          const startTime = String(item['start_time'] ?? item['time'] ?? '06:00')
          const endTime = String(item['end_time'] ?? '')
          const arr = grouped[day]!
          arr.push({
            time: endTime ? `${startTime} - ${endTime}` : startTime,
            class: String(cls['name'] ?? item['class_name'] ?? item['name'] ?? ''),
            trainer: String(trainer['name'] ?? item['trainer_name'] ?? item['trainer'] ?? ''),
            spotsLeft: Number(
              item['available_slots'] ?? item['spots_left'] ?? item['spotsLeft'] ?? 0,
            ),
            totalSpots: Number(item['capacity'] ?? item['total_spots'] ?? item['totalSpots'] ?? 20),
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

  // Fetch class categories from API
  try {
    const rawCats = await getClassCategories()
    const list = Array.isArray(rawCats) ? rawCats : []
    if (list.length > 0) {
      const names = list.map((c) => {
        const obj = c as unknown as Record<string, unknown>
        return String(obj['name'] ?? obj['label'] ?? c)
      })
      // Ensure 'All' is always first
      categories.value = ['All', ...names.filter((n) => n !== 'All')]
    }
  } catch {
    // categories stays empty; ClassCategories component handles empty gracefully
  } finally {
    classesLoading.value = false
  }
})

const categories = ref<string[]>([])
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
      title="Program Kelas"
      subtitle="Dari kardio berenergi tinggi hingga yoga yang menenangkan, temukan kelas yang sempurna sesuai tujuan kebugaran Anda. Instruktur ahli, suasana memotivasi, hasil terjamin."
    />

    <!-- Class Categories -->
    <ClassCategories
      :categories="categories"
      :activeCategory="activeCategory"
      @select="filterByCategory"
    />

    <!-- Class Cards -->
    <section v-if="classesLoading" class="section-padding">
      <div class="container-custom">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="dark-card rounded-2xl overflow-hidden">
            <Skeleton width="100%" height="12rem" borderRadius="0" />
            <div class="p-5 space-y-3">
              <Skeleton width="70%" height="1.25rem" />
              <Skeleton width="50%" height="0.875rem" />
              <Skeleton width="90%" height="0.75rem" />
              <Skeleton width="100%" height="2.5rem" borderRadius="8px" class="mt-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
    <ClassCards v-else :classes="filteredClasses" @book="goToSignUp" />

    <!-- Weekly Schedule -->
    <section v-if="classesLoading" class="section-padding">
      <div class="container-custom">
        <div class="flex gap-3 mb-6 overflow-x-auto">
          <Skeleton v-for="i in 7" :key="i" width="6rem" height="2.25rem" borderRadius="9999px" />
        </div>
        <div class="space-y-3">
          <div v-for="i in 4" :key="i" class="flex items-center gap-4 p-4 rounded-xl bg-white/5">
            <Skeleton width="5rem" height="1rem" />
            <Skeleton width="40%" height="1rem" />
            <Skeleton width="20%" height="1rem" class="ml-auto" />
          </div>
        </div>
      </div>
    </section>
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
