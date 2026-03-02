<script setup lang="ts">
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

interface ClassInfo {
  id: number
  name: string
  trainer?: string
  date?: string
  time: string
  location: string
  zoomLink?: string
}

const props = defineProps<{
  visible: boolean
  classInfo: ClassInfo | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
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

const isStarted = computed(() => {
  if (!props.classInfo?.date || !props.classInfo?.time) return false
  const [startTime] = props.classInfo.time.split(' - ')
  const classDateTime = new Date(`${props.classInfo.date}T${startTime}:00`)
  return new Date() >= classDateTime
})

const openZoom = () => {
  if (props.classInfo?.zoomLink) {
    window.open(props.classInfo.zoomLink, '_blank')
  }
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    header="Join Waiting List"
    :style="{ width: '500px' }"
    :breakpoints="{ '640px': '90vw' }"
    class="online-class-modal"
  >
    <div v-if="classInfo" class="space-y-5">
      <!-- If class started and zoom available, show started notice -->
      <div
        v-if="isStarted && classInfo.zoomLink"
        class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
      >
        <div class="flex items-start gap-3">
          <i class="pi pi-info-circle text-lg text-blue-400 mt-0.5 shrink-0"></i>
          <div>
            <p class="font-medium text-blue-300 mb-1">Kelas Sedang Berlangsung</p>
            <p class="text-sm text-blue-200">
              Kelas <strong class="text-white">{{ classInfo.name }}</strong> sudah dimulai. Tekan
              tombol "Open Zoom" di bawah untuk bergabung ke meeting.
            </p>
          </div>
        </div>
      </div>

      <!-- Class Details -->
      <div class="bg-white/5 rounded-lg p-4 space-y-2">
        <h4 class="font-semibold text-white text-sm">{{ classInfo.name }}</h4>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="flex items-center gap-2 text-(--text-secondary)">
            <i class="pi pi-user text-(--primary) text-xs"></i>
            <span>{{ classInfo.trainer }}</span>
          </div>
          <div class="flex items-center gap-2 text-(--text-secondary)">
            <i class="pi pi-calendar text-(--primary) text-xs"></i>
            <span>{{ formattedDate }}</span>
          </div>
          <div class="flex items-center gap-2 text-(--text-secondary)">
            <i class="pi pi-clock text-(--primary) text-xs"></i>
            <span>{{ classInfo.time }}</span>
          </div>
          <div class="flex items-center gap-2 text-(--text-secondary)">
            <i class="pi pi-map-marker text-(--primary) text-xs"></i>
            <span>{{ classInfo.location }}</span>
          </div>
        </div>
      </div>

      <!-- Info: Zoom link will be available at class start (only show before class starts) -->
      <div v-if="!isStarted" class="p-4 rounded-lg border border-blue-500/30 bg-blue-500/10">
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0"
          >
            <i class="pi pi-info-circle text-blue-400 text-xl"></i>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-white mb-1">Zoom Link Availability</h4>
            <p class="text-sm text-blue-200 mb-2">
              If the class is full you can join the waiting list. If you remain on the waiting list
              and are not promoted before the class starts, the Zoom link will still be made
              available at class start and will be sent via email to registered attendees.
            </p>
            <div class="flex items-center gap-2 text-xs text-blue-300">
              <i class="pi pi-check-circle"></i>
              <span>Zoom link appears at class start for all (including waitlist)</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-blue-300 mt-1">
              <i class="pi pi-check-circle"></i>
              <span>Recording available 24 hours after class</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Info about waitlist; confirmation button moved to footer -->
      <div
        v-if="!isStarted || !classInfo?.zoomLink"
        class="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10"
      >
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0"
          >
            <i class="pi pi-clock text-amber-400 text-xl"></i>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-white mb-1">Waiting List</h4>
            <p class="text-sm text-amber-200 mb-2">
              Join the waiting list and you'll be automatically promoted if another member cancels.
              If you remain on the waiting list when the class starts, the Zoom link will still be
              made available at class start.
            </p>
            <div class="flex items-center gap-2 text-xs text-amber-300">
              <i class="pi pi-info-circle"></i>
              <span>Automatic notification if a slot opens</span>
            </div>
          </div>
        </div>
      </div>

      <!-- If class already started and zoom link available, show direct access -->
      <div
        v-if="isStarted && classInfo?.zoomLink"
        class="mt-4 p-4 rounded-lg border border-blue-500/20 bg-blue-500/10"
      >
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0"
          >
            <i class="pi pi-video text-blue-400 text-xl"></i>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-white mb-1">Zoom Link</h4>
            <p class="text-sm text-blue-200 mb-2">
              The class has started. Click the button below to open the Zoom meeting. The link is
              also sent via email to registered attendees.
            </p>
            <Button label="Open Zoom" icon="pi pi-external-link" class="btn" @click="openZoom" />
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2 pt-5">
        <Button label="Close" severity="secondary" outlined @click="dialogVisible = false" />
        <template v-if="isStarted && classInfo?.zoomLink">
          <Button label="Open Zoom" class="btn" @click="openZoom" />
        </template>
        <template v-else>
          <Button
            label="Join Waitlist"
            class="btn"
            @click="
              () => {
                emit('join-waitlist')
                dialogVisible = false
              }
            "
          />
        </template>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.online-class-modal :deep(.p-dialog-header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.online-class-modal :deep(.p-dialog-content) {
  padding-top: 1rem;
}
</style>
