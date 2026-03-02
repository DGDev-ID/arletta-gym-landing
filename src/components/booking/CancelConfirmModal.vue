<script setup lang="ts">
import { computed, watch } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

interface BookingInfo {
  id: number
  name: string
  trainer: string
  date: string
  time: string
  location: string
  type: 'class' | 'pt-session' | 'waitlist'
  canCancel: boolean
}

const props = defineProps<{
  visible: boolean
  bookingInfo: BookingInfo | null
  userRole?: 'member' | 'pt'
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const formattedDate = computed(() => {
  if (!props.bookingInfo?.date) return ''
  const date = new Date(props.bookingInfo.date)
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const isPTSession = computed(() => props.bookingInfo?.type === 'pt-session')
const isWaitlist = computed(() => props.bookingInfo?.type === 'waitlist')

// Different messaging based on type and role
const headerText = computed(() => {
  if (isWaitlist.value) return 'Cancel Waiting List'
  if (isPTSession.value) return 'Cancel PT Session'
  return 'Cancel Class Booking'
})

const confirmMessage = computed(() => {
  if (isWaitlist.value) {
    return 'Are you sure you want to remove yourself from the waiting list?'
  }
  if (isPTSession.value && props.userRole === 'pt') {
    return 'Are you sure you want to cancel this PT session? The member will be notified about this cancellation.'
  }
  return 'Are you sure you want to cancel this class booking?'
})

const cannotCancelReason = computed(() => {
  if (!props.bookingInfo?.canCancel && !isWaitlist.value) {
    if (isPTSession.value && props.userRole === 'member') {
      return 'PT sessions can only be cancelled by your Personal Trainer. Please contact your trainer to reschedule.'
    }
    return 'This booking cannot be cancelled as it is less than 24 hours (H-1) before the class. Late cancellations are not allowed.'
  }
  return null
})

// Reset when modal opens/closes
watch(
  () => props.visible,
  (val) => {
    if (val) {
      // no-op: modal opens, nothing to reset for single-step confirm
    }
  },
)

const handleConfirm = () => {
  emit('confirm')
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :header="headerText"
    :style="{ width: '450px' }"
    :breakpoints="{ '640px': '90vw' }"
    class="cancel-confirm-modal"
  >
    <div v-if="bookingInfo" class="space-y-4">
      <!-- Cannot Cancel Warning -->
      <div
        v-if="cannotCancelReason"
        class="bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg p-4"
      >
        <div class="flex items-start gap-2">
          <i class="pi pi-ban text-lg text-red-400 mt-0.5"></i>
          <div>
            <span class="font-semibold block mb-1">Cannot Cancel</span>
            <p class="text-sm text-red-300">
              {{ cannotCancelReason }}
            </p>
          </div>
        </div>
      </div>

      <!-- Confirmation Message -->
      <div v-else class="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <i class="pi pi-exclamation-triangle text-lg text-amber-400 mt-0.5 shrink-0"></i>
          <span class="font-medium">{{ confirmMessage }}</span>
        </div>
      </div>

      <!-- Booking Details -->
      <div class="bg-white/5 rounded-lg p-4 space-y-3">
        <div class="flex items-center gap-2">
          <span
            class="px-2 py-1 text-xs font-medium rounded"
            :class="{
              'bg-purple-500/20 text-purple-300': isPTSession,
              'bg-blue-500/20 text-blue-300': !isPTSession && !isWaitlist,
              'bg-amber-500/20 text-amber-300': isWaitlist,
            }"
          >
            {{ isPTSession ? 'PT Session' : isWaitlist ? 'Waiting List' : 'Class' }}
          </span>
          <h3 class="font-semibold text-white">{{ bookingInfo.name }}</h3>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="flex items-center gap-2 text-gray-300">
            <i class="pi pi-user text-(--primary)"></i>
            <span>{{ bookingInfo.trainer }}</span>
          </div>
          <div class="flex items-center gap-2 text-gray-300">
            <i class="pi pi-map-marker text-(--primary)"></i>
            <span>{{ bookingInfo.location }}</span>
          </div>
          <div class="flex items-center gap-2 text-gray-300">
            <i class="pi pi-calendar text-(--primary)"></i>
            <span>{{ formattedDate }}</span>
          </div>
          <div class="flex items-center gap-2 text-gray-300">
            <i class="pi pi-clock text-(--primary)"></i>
            <span>{{ bookingInfo.time }}</span>
          </div>
        </div>
      </div>

      <!-- Waitlist Info -->
      <div v-if="isWaitlist" class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div class="flex items-start gap-2">
          <i class="pi pi-info-circle text-blue-400 mt-0.5 shrink-0"></i>
          <div>
            <p class="text-sm text-blue-200">
              Cancelling your spot on the waiting list will allow others to move up. If a spot
              becomes available, you won't be automatically added.
            </p>
          </div>
        </div>
      </div>

      <!-- Regular Class Cancel Info -->
      <div
        v-else-if="bookingInfo.canCancel && !isPTSession"
        class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
      >
        <div class="flex items-start gap-2">
          <i class="pi pi-info-circle text-blue-400 mt-0.5 shrink-0"></i>
          <div>
            <p class="text-sm text-blue-200">
              Your spot will be released and may be filled by someone on the waiting list.
            </p>
          </div>
        </div>
      </div>

      <!-- removed double-verification block (single-step confirm now) -->
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Keep Booking" severity="secondary" outlined @click="dialogVisible = false" />

        <Button
          v-if="!cannotCancelReason"
          label="Yes, Cancel"
          severity="danger"
          icon="pi pi-times"
          @click="handleConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.cancel-confirm-modal :deep(.p-dialog-header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.cancel-confirm-modal :deep(.p-dialog-content) {
  padding-top: 1rem;
}
</style>
