<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

interface ClassInfo {
  id: number
  name: string
  trainer?: string
  date?: string
  time: string
  location: string
  spotsLeft?: number
  isFull?: boolean
}

const props = defineProps<{
  visible: boolean
  classInfo: ClassInfo | null
  hasTimeConflict?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
  (e: 'join-waitlist'): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const formattedDate = computed(() => {
  if (!props.classInfo?.date) return ''
  const date = new Date(props.classInfo.date)
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const isClassFull = computed(() => props.classInfo?.isFull || props.classInfo?.spotsLeft === 0)

const handleConfirm = () => {
  if (isClassFull.value) {
    emit('join-waitlist')
  } else {
    emit('confirm')
  }
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :header="isClassFull ? 'Join Waiting List' : 'Confirm Booking'"
    :style="{ width: '450px' }"
    :breakpoints="{ '640px': '90vw' }"
    class="booking-confirm-modal"
  >
    <div v-if="classInfo" class="space-y-4">
      <!-- Time Conflict Warning -->
      <div
        v-if="hasTimeConflict"
        class="bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg p-4"
      >
        <div class="flex items-start gap-2">
          <i class="pi pi-exclamation-triangle text-lg text-red-400 mt-0.5 shrink-0"></i>
          <div>
            <span class="font-semibold block mb-1">Time Conflict!</span>
            <p class="text-sm text-red-300">
              You already have a class or session booked at this time. Please choose a different
              time slot.
            </p>
          </div>
        </div>
      </div>

      <!-- Class Full Warning -->
      <div
        v-else-if="isClassFull"
        class="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-lg p-4"
      >
        <div class="flex items-start gap-2">
          <i class="pi pi-clock text-lg text-amber-400 mt-0.5 shrink-0"></i>
          <div>
            <span class="font-semibold block mb-1">Class is Full</span>
            <p class="text-sm text-amber-300">
              This class is currently full. You can join the waiting list and will be automatically
              promoted if a spot opens up.
            </p>
          </div>
        </div>
      </div>

      <!-- Class Details -->
      <div class="bg-white/5 rounded-lg p-4 space-y-3">
        <h3 class="font-semibold text-lg text-white">{{ classInfo.name }}</h3>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="flex items-center gap-2 text-gray-300">
            <i class="pi pi-user text-(--primary)"></i>
            <span>{{ classInfo.trainer }}</span>
          </div>
          <div class="flex items-center gap-2 text-gray-300">
            <i class="pi pi-map-marker text-(--primary)"></i>
            <span>{{ classInfo.location }}</span>
          </div>
          <div class="flex items-center gap-2 text-gray-300">
            <i class="pi pi-calendar text-(--primary)"></i>
            <span>{{ formattedDate }}</span>
          </div>
          <div class="flex items-center gap-2 text-gray-300">
            <i class="pi pi-clock text-(--primary)"></i>
            <span>{{ classInfo.time }}</span>
          </div>
        </div>

        <div
          v-if="classInfo.spotsLeft !== undefined && !isClassFull"
          class="pt-2 border-t border-white/10"
        >
          <span class="text-sm text-gray-400">
            <i class="pi pi-users mr-1"></i>
            {{ classInfo.spotsLeft }} spots left
          </span>
        </div>
      </div>

      <!-- Cancel Policy -->
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div class="flex items-start gap-2">
          <i class="pi pi-info-circle text-blue-400 mt-0.5 shrink-0"></i>
          <div>
            <p class="font-medium text-blue-300">Cancellation Policy</p>
            <p class="text-sm text-blue-200 mt-1">
              You can cancel this booking up to <strong>24 hours (H-1)</strong> before the class
              starts. Late cancellations may affect your booking privileges.
            </p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" outlined @click="dialogVisible = false" />
        <Button
          v-if="!hasTimeConflict"
          :label="isClassFull ? 'Join Waiting List' : 'Confirm Booking'"
          :icon="isClassFull ? 'pi pi-clock' : 'pi pi-check'"
          @click="handleConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.booking-confirm-modal :deep(.p-dialog-header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
}

.booking-confirm-modal :deep(.p-dialog-content) {
  padding-top: 16px;
}
</style>
