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
}

const props = defineProps<{
  visible: boolean
  classInfo: ClassInfo | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'join-online'): void
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
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    header="Kelas Penuh - Opsi Alternatif"
    :style="{ width: '500px' }"
    :breakpoints="{ '640px': '90vw' }"
    class="online-class-modal"
  >
    <div v-if="classInfo" class="space-y-5">
      <!-- Class Full Notice -->
      <div class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <i class="pi pi-exclamation-triangle text-lg text-amber-400 mt-0.5 shrink-0"></i>
          <div>
            <p class="font-medium text-amber-300 mb-1">Kelas Sudah Penuh</p>
            <p class="text-sm text-amber-200">
              Kelas <strong class="text-white">{{ classInfo.name }}</strong> untuk jadwal ini sudah tidak tersedia slot. Namun Anda memiliki opsi berikut:
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

      <!-- Option 1: Online Class -->
      <div
        class="p-4 rounded-lg border border-blue-500/30 bg-blue-500/10 cursor-pointer hover:bg-blue-500/15 transition-colors"
        @click="emit('join-online')"
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <i class="pi pi-video text-blue-400 text-xl"></i>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-white mb-1">Ikut Kelas Online via Zoom</h4>
            <p class="text-sm text-blue-200 mb-2">
              Bergabung melalui Zoom meeting. Anda tetap bisa mengikuti kelas secara real-time dengan instruksi dari trainer.
            </p>
            <div class="flex items-center gap-2 text-xs text-blue-300">
              <i class="pi pi-check-circle"></i>
              <span>Interaksi langsung dengan trainer</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-blue-300 mt-1">
              <i class="pi pi-check-circle"></i>
              <span>Akses link Zoom akan dikirim via email</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-blue-300 mt-1">
              <i class="pi pi-check-circle"></i>
              <span>Recording tersedia 24 jam setelah kelas</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Option 2: Waitlist -->
      <div
        class="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 cursor-pointer hover:bg-amber-500/15 transition-colors"
        @click="emit('join-waitlist')"
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <i class="pi pi-clock text-amber-400 text-xl"></i>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-white mb-1">Masuk Waiting List</h4>
            <p class="text-sm text-amber-200 mb-2">
              Daftar di waiting list dan Anda akan otomatis dipromosikan jika ada member yang membatalkan.
            </p>
            <div class="flex items-center gap-2 text-xs text-amber-300">
              <i class="pi pi-info-circle"></i>
              <span>Notifikasi otomatis jika slot terbuka</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        label="Tutup"
        severity="secondary"
        outlined
        @click="dialogVisible = false"
      />
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
