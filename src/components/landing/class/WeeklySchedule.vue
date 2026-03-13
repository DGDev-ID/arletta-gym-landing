<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import authState from '@/stores/auth'
import BookingConfirmModal from '@/components/booking/BookingConfirmModal.vue'

type ScheduleItem = {
  class: string
  trainer?: string
  time: string
  spotsLeft?: number
  totalSpots?: number
}
const props = defineProps<{
  days?: string[]
  schedule?: Record<string, ScheduleItem[]>
  activeDay?: string
}>()
defineEmits(['update-day', 'book'])

const router = useRouter()
const toast = useToast()
const showBookingModal = ref(false)
const selectedSchedule = ref<ScheduleItem | null>(null)

// Transform schedule data to match BookingConfirmModal format
const selectedClassForBooking = computed(() => {
  if (!selectedSchedule.value) return null

  // Calculate the next occurrence of the selected day
  const today = new Date()
  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  }

  const targetDay = dayMap[(props.activeDay ?? 'monday').toLowerCase()]
  const currentDay = today.getDay()
  let daysUntilTarget = (targetDay ?? 0) - currentDay

  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7 // Next week
  }

  const targetDate = new Date(today)
  targetDate.setDate(today.getDate() + daysUntilTarget)
  const dateStr = targetDate.toISOString().split('T')[0]

  // Calculate end time (assume 45 minutes duration)
  const startTime = selectedSchedule.value.time
  const [hours, minutes] = startTime.split(':').map(Number)
  const durationMinutes = 45
  const endHours = Math.floor(((hours ?? 0) * 60 + (minutes ?? 0) + durationMinutes) / 60)
  const endMinutes = ((minutes ?? 0) + durationMinutes) % 60
  const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`

  return {
    id: Math.floor(Math.random() * 1000),
    name: selectedSchedule.value.class,
    trainer: selectedSchedule.value.trainer,
    date: dateStr,
    time: `${startTime} - ${endTime}`,
    location: 'Studio A',
    spotsLeft: selectedSchedule.value.spotsLeft ?? 10,
    isFull: selectedSchedule.value.spotsLeft === 0,
    trainerAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedSchedule.value.trainer}`,
    totalSpots: selectedSchedule.value.totalSpots ?? 20,
  }
})

const handleBookSchedule = (item: ScheduleItem) => {
  if (!authState.isLoggedIn) {
    router.push('/signup')
    return
  }

  // PT users can't book classes; button is disabled in the template. Safety early-return:
  if (authState.user?.role === 'pt') return

  selectedSchedule.value = item
  showBookingModal.value = true
}

const confirmBooking = () => {
  toast.add({
    severity: 'success',
    summary: 'Class Booked!',
    detail: `You have successfully booked ${selectedSchedule.value?.class} on ${props.activeDay}.`,
    life: 3000,
  })
  showBookingModal.value = false
  router.push('/member/schedule')
}

const joinWaitingList = () => {
  toast.add({
    severity: 'success',
    summary: 'Joined Waitlist',
    detail: `You've been added to the waitlist for ${selectedSchedule.value?.class}.`,
    life: 3000,
  })
  showBookingModal.value = false
  router.push('/member/schedule')
}
</script>

<template>
  <section class="py-20 bg-(--bg-darker)">
    <div class="container-custom">
      <div
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="text-center mb-4"
      >
        <h2 class="text-3xl font-bold text-white mb-4">Weekly Schedule</h2>
        <p class="text-(--text-secondary) mb-12 max-w-2xl mx-auto">
          Plan your week ahead. All classes are included with Pro and Elite memberships.
        </p>
      </div>

      <div
        v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }"
        class="flex flex-wrap justify-center gap-2 mb-8"
      >
        <button
          v-for="day in props.days"
          :key="day"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
            props.activeDay === day
              ? 'bg-(--primary) text-white'
              : 'bg-white/5 text-(--text-secondary) hover:bg-white/10',
          ]"
          @click="$emit('update-day', day)"
        >
          {{ day }}
        </button>
      </div>

      <div class="glass-card rounded-xl overflow-hidden max-w-3xl mx-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-white/10">
              <th class="text-left py-4 px-6 text-(--text-secondary) font-medium">Time</th>
              <th class="text-left py-4 px-6 text-(--text-secondary) font-medium">Class</th>
              <th class="text-left py-4 px-6 text-(--text-secondary) font-medium">Trainer</th>
              <th class="py-4 px-6"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in props.schedule?.[props.activeDay ?? 'monday'] ?? []"
              :key="index"
              v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }"
              class="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td class="py-4 px-6 text-white font-medium">{{ item.time }}</td>
              <td class="py-4 px-6 text-white">{{ item.class }}</td>
              <td class="py-4 px-6 text-(--text-muted)">{{ item.trainer }}</td>
              <td class="py-4 px-6">
                <!-- <Button
                  class="btn btn-red px-4 py-1 text-xs"
                  :disabled="authState.user?.role === 'pt'"
                  :class="[authState.user?.role === 'pt' ? 'opacity-50 cursor-not-allowed' : '']"
                  @click="handleBookSchedule(item)"
                  label="Book"
                /> -->
                <Button
                  class="btn btn-red px-4 py-1 text-xs"
                  disabled
                  :class="[authState.user?.role === 'pt' ? 'opacity-50 cursor-not-allowed' : '']"
                  @click="handleBookSchedule(item)"
                  label="Coming Soon"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Booking Confirmation Modal -->
    <BookingConfirmModal
      :visible="showBookingModal"
      @update:visible="(v) => (showBookingModal = v)"
      :classInfo="selectedClassForBooking"
      :hasTimeConflict="false"
      @confirm="confirmBooking"
      @join-waitlist="joinWaitingList"
    />
  </section>
</template>
