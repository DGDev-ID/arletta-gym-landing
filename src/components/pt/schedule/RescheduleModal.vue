<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'

interface SessionInfo {
  id: number
  clientName?: string
  className?: string
  date: string
  time: string
  location: string
  type: string
}

const props = defineProps<{
  visible: boolean
  session: SessionInfo | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (
    e: 'confirm',
    data: {
      id: number
      newDate: string
      newStartTime: string
      newEndTime: string
      newLocation: string
      reason: string
    },
  ): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const newDate = ref<Date | null>(null)
const newStartTime = ref('')
const newEndTime = ref('')
const newLocation = ref('')
const reason = ref('')

// Prefill with current session data when opened
watch(
  () => props.visible,
  (val) => {
    if (val && props.session) {
      const parts = props.session.time.split(' - ')
      newStartTime.value = parts[0]?.trim() ?? ''
      newEndTime.value = parts[1]?.trim() ?? ''
      newLocation.value = props.session.location
      newDate.value = new Date(props.session.date)
      reason.value = ''
    }
  },
)

const sessionName = computed(() => {
  if (!props.session) return ''
  if (props.session.type === 'pt-session') return `PT Session with ${props.session.clientName}`
  return props.session.className || 'Class'
})

const isValid = computed(() => {
  return (
    newDate.value &&
    newStartTime.value &&
    newEndTime.value &&
    newLocation.value &&
    reason.value.trim().length > 0
  )
})

const handleConfirm = () => {
  if (!isValid.value || !props.session || !newDate.value) return

  const dateStr = newDate.value.toISOString().split('T')[0] ?? ''
  emit('confirm', {
    id: props.session.id,
    newDate: dateStr,
    newStartTime: newStartTime.value,
    newEndTime: newEndTime.value,
    newLocation: newLocation.value,
    reason: reason.value,
  })
  emit('update:visible', false)
}

const formattedOriginalDate = computed(() => {
  if (!props.session?.date) return ''
  return new Date(props.session.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    header="Reschedule Session"
    :style="{ width: '90vw', maxWidth: '520px' }"
    class="reschedule-modal"
  >
    <div v-if="session" class="space-y-5">
      <!-- Current Schedule Info -->
      <div class="bg-white/5 rounded-lg p-4 space-y-2">
        <h4 class="font-semibold text-white text-sm mb-2">Jadwal Saat Ini</h4>
        <div class="flex items-center gap-2 text-sm text-(--text-secondary)">
          <i class="pi pi-bookmark text-(--primary) text-xs"></i>
          <span>{{ sessionName }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-(--text-secondary)">
          <i class="pi pi-calendar text-(--primary) text-xs"></i>
          <span>{{ formattedOriginalDate }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-(--text-secondary)">
          <i class="pi pi-clock text-(--primary) text-xs"></i>
          <span>{{ session.time }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-(--text-secondary)">
          <i class="pi pi-map-marker text-(--primary) text-xs"></i>
          <span>{{ session.location }}</span>
        </div>
      </div>

      <div class="border-t border-white/10"></div>

      <!-- New Schedule -->
      <h4 class="font-semibold text-white text-sm">Jadwal Baru</h4>

      <!-- New Date -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">Tanggal Baru</label>
        <Calendar
          v-model="newDate"
          show-icon
          placeholder="Pilih tanggal baru"
          class="w-full"
          :pt="{
            root: { class: 'w-full' },
            input: { class: 'glass-input w-full' },
            panel: { class: 'glass-modal' },
          }"
        />
      </div>

      <!-- New Time -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">Waktu Baru</label>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-(--text-muted) mb-1">Mulai</label>
            <InputText v-model="newStartTime" type="time" class="glass-input w-full" />
          </div>
          <div>
            <label class="block text-xs text-(--text-muted) mb-1">Selesai</label>
            <InputText v-model="newEndTime" type="time" class="glass-input w-full" />
          </div>
        </div>
      </div>

      <!-- New Location -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">Lokasi</label>
        <InputText
          v-model="newLocation"
          placeholder="e.g., Weight Room, Studio A"
          class="glass-input w-full"
        />
      </div>

      <!-- Reason -->
      <div>
        <label class="block text-sm font-medium text-white mb-2"
          >Alasan Reschedule <span class="text-red-400">*</span></label
        >
        <Textarea
          v-model="reason"
          placeholder="Jelaskan alasan reschedule kepada member..."
          rows="3"
          class="glass-input w-full"
        />
      </div>

      <!-- Info -->
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <div class="flex items-start gap-2">
          <i class="pi pi-info-circle text-blue-400 mt-0.5 shrink-0"></i>
          <p class="text-xs text-blue-200">
            Member akan menerima notifikasi tentang perubahan jadwal ini. Pastikan jadwal baru tidak
            bentrok dengan sesi lain.
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3 justify-end">
        <Button
          label="Batal"
          text
          class="text-(--text-secondary) hover:text-white"
          @click="dialogVisible = false"
        />
        <Button
          label="Reschedule"
          icon="pi pi-calendar-plus"
          class="btn"
          :disabled="!isValid"
          @click="handleConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.reschedule-modal :deep(.p-dialog-header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.reschedule-modal :deep(.p-dialog-content) {
  padding-top: 1rem;
}
</style>
