<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import authState from '@/stores/auth'
import BookingConfirmModal from '@/components/booking/BookingConfirmModal.vue'

type ClassItem = {
  id: number
  image?: string
  name: string
  category?: string
  duration?: string
  spotsLeft?: number
  totalSpots?: number
  trainer?: string
  location?: string
  level?: string
  description?: string
  benefits?: string[]
}
const props = defineProps<{ classes?: ClassItem[] }>()
defineEmits(['book'])

const router = useRouter()
const toast = useToast()
const showBookingModal = ref(false)
const selectedClass = ref<ClassItem | null>(null)

// Transform class data to match BookingConfirmModal format
const selectedClassForBooking = computed(() => {
  if (!selectedClass.value) return null

  // Generate a near future date for demo (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateStr = tomorrow.toISOString().split('T')[0]

  // Parse duration to get end time
  const durationMinutes = parseInt(selectedClass.value.duration ?? '45') || 45
  const startTime = '09:00'
  const [hours = 0, minutes = 0] = startTime.split(':').map(Number)
  const endHours = Math.floor((hours * 60 + minutes + durationMinutes) / 60)
  const endMinutes = (minutes + durationMinutes) % 60
  const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`

  return {
  id: selectedClass.value.id,
  name: selectedClass.value.name,
  date: dateStr,
    time: `${startTime} - ${endTime}`,
    location: selectedClass.value.location ?? 'Studio A',
    spotsLeft: selectedClass.value.spotsLeft ?? 10,
    isFull: (selectedClass.value.spotsLeft ?? 10) === 0,
    trainerAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedClass.value.trainer ?? 'Trainer'}`,
    trainer: selectedClass.value.trainer ?? 'TBA',
    totalSpots: selectedClass.value.totalSpots || 20,
  }
})

const handleBookClass = (classItem: ClassItem) => {
  if (!authState.isLoggedIn) {
    // Not logged in, redirect to signup
    router.push('/signup')
    return
  }

  if (authState.user?.role === 'pt') {
    // PT cannot book classes
    toast.add({
      severity: 'warn',
      summary: 'Cannot Book',
      detail:
        'Personal trainers cannot book classes. You are assigned as a trainer by the receptionist.',
      life: 4000,
    })
    return
  }

  // Member logged in, show booking modal
  selectedClass.value = classItem
  showBookingModal.value = true
}

const confirmBooking = () => {
  toast.add({
    severity: 'success',
    summary: 'Class Booked!',
    detail: `You have successfully booked ${selectedClass.value?.name}. Check your schedule for details.`,
    life: 3000,
  })
  showBookingModal.value = false
  // In real app, would call API to book the class
  router.push('/member/schedule')
}

const joinWaitingList = () => {
  toast.add({
    severity: 'success',
    summary: 'Joined Waitlist',
    detail: `You've been added to the waitlist for ${selectedClass.value?.name}.`,
    life: 3000,
  })
  showBookingModal.value = false
  router.push('/member/schedule')
}
</script>

<template>
  <section class="py-16">
    <div class="container-custom">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="classItem in props.classes"
          :key="classItem.id"
          v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
          class="glass-card rounded-2xl overflow-hidden group hover:border-(--primary)/50 transition-all"
        >
          <div class="relative h-48 overflow-hidden">
            <img
              :src="classItem.image"
              :alt="classItem.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div class="absolute top-4 left-4">
              <span class="bg-(--primary) text-white text-xs font-bold px-3 py-1 rounded-full">
                {{ classItem.category }}
              </span>
            </div>
            <div class="absolute top-4 right-4">
              <span class="bg-black/60 text-white text-xs px-3 py-1 rounded-full">{{
                classItem.duration
              }}</span>
            </div>
          </div>

          <div class="p-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xl font-bold text-white">{{ classItem.name }}</h3>
              <span
                :class="[
                  'text-xs px-2 py-1 rounded',
                  classItem.level === 'Beginner'
                    ? 'bg-green-500/20 text-green-400'
                    : classItem.level === 'Intermediate'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-blue-500/20 text-blue-400',
                ]"
              >
                {{ classItem.level }}
              </span>
            </div>

            <p class="text-(--text-muted) text-sm mb-4 line-clamp-2">{{ classItem.description }}</p>

            <div class="flex items-center gap-2 mb-4">
              <i class="pi pi-user text-(--primary) text-sm"></i>
              <span class="text-(--text-secondary) text-sm">{{ classItem.trainer }}</span>
            </div>

            <div class="space-y-2 mb-4">
              <div
                v-for="benefit in classItem.benefits"
                :key="benefit"
                class="flex items-center gap-2"
              >
                <i class="pi pi-check-circle text-green-500 text-xs"></i>
                <span class="text-(--text-muted) text-xs">{{ benefit }}</span>
              </div>
            </div>

            <Button
              label="Book Class"
              outlined
              class="w-full py-2 border-white/20 text-white hover:bg-white/10"
              @click="handleBookClass(classItem)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Confirmation Modal -->
    <BookingConfirmModal
      v-model:visible="showBookingModal"
      :classInfo="selectedClassForBooking"
      :hasTimeConflict="false"
      @confirm="confirmBooking"
      @join-waitlist="joinWaitingList"
    />
  </section>
</template>
