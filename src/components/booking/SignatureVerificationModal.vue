<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import DatePicker from 'primevue/datepicker'
import { checkPossibleSchedule } from '@/services/membershipService'

const props = defineProps<{
  visible: boolean
  memberName?: string
  membershipPlan?: string
  membershipId?: number | string | null
  membershipDurationDays?: number | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirmed', signatureData?: string, startAt?: string): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

// --- Schedule check state ---
const scheduleLoading = ref(false)
const scheduleStatus = ref<boolean | null>(null) // null = belum di-check
const membershipEndAt = ref<string | null>(null) // jika status false
const startDate = ref<Date | null>(null) // jika status true, input dari user

const endDateDisplay = computed(() => {
  if (scheduleStatus.value !== true || !startDate.value || !props.membershipDurationDays)
    return null
  const end = new Date(startDate.value)
  end.setDate(end.getDate() + props.membershipDurationDays)
  return end.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
})

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

// --- Canvas ---
const canvasRef = ref<HTMLCanvasElement | null>(null)
const hasSignature = ref(false)
const acceptedTerms = ref(false)
const isDrawing = ref(false)
let ctx: CanvasRenderingContext2D | null = null

const initCanvas = () => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  const rect = canvasRef.value.parentElement?.getBoundingClientRect()
  if (rect) {
    canvasRef.value.width = rect.width
    canvasRef.value.height = 200
  }
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

const startDrawing = (e: MouseEvent | TouchEvent) => {
  if (!ctx || !canvasRef.value) return
  isDrawing.value = true
  hasSignature.value = true
  const { x, y } = getPosition(e)
  ctx.beginPath()
  ctx.moveTo(x, y)
}

const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !ctx) return
  e.preventDefault()
  const { x, y } = getPosition(e)
  ctx.lineTo(x, y)
  ctx.stroke()
}

const stopDrawing = () => {
  isDrawing.value = false
}

const getPosition = (e: MouseEvent | TouchEvent) => {
  if (!canvasRef.value) return { x: 0, y: 0 }
  const rect = canvasRef.value.getBoundingClientRect()
  if (e instanceof TouchEvent) {
    const touch = e.touches[0] || e.changedTouches[0]
    return { x: (touch?.clientX ?? 0) - rect.left, y: (touch?.clientY ?? 0) - rect.top }
  }
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

const clearSignature = () => {
  if (!ctx || !canvasRef.value) return
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  hasSignature.value = false
}

// Validasi: jika status true, startDate wajib diisi
const isValid = computed(() => {
  if (!hasSignature.value || !acceptedTerms.value) return false
  if (scheduleStatus.value === true && !startDate.value) return false
  return true
})

const handleConfirm = () => {
  if (!isValid.value || !canvasRef.value) return
  const dataUrl = canvasRef.value.toDataURL('image/png')
  // Kirim startAt hanya jika status true
  let startAt: string | undefined
  if (scheduleStatus.value === true && startDate.value) {
    startAt = startDate.value.toISOString().split('T')[0] // format YYYY-MM-DD
  }
  emit('confirmed', dataUrl, startAt)
  emit('update:visible', false)
}

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      // Reset semua state
      hasSignature.value = false
      acceptedTerms.value = false
      scheduleStatus.value = null
      membershipEndAt.value = null
      startDate.value = null

      // Hit API check schedule
      if (props.membershipId) {
        scheduleLoading.value = true
        try {
          const result = await checkPossibleSchedule(props.membershipId)
          scheduleStatus.value = result.status
          if (!result.status && result.membership_end_at) {
            membershipEndAt.value = result.membership_end_at
          }
        } catch (err) {
          console.warn('Failed to check schedule', err)
          scheduleStatus.value = true // fallback: tampilkan input tanggal
        } finally {
          scheduleLoading.value = false
        }
      } else {
        scheduleStatus.value = true // tidak ada id, default ke input tanggal
      }

      await nextTick()
      initCanvas()
    }
  },
)
</script>

<template>
  <Dialog
    :visible="dialogVisible"
    @update:visible="(v) => (dialogVisible = v)"
    modal
    header="Verifikasi Tanda Tangan"
    :style="{ width: '550px' }"
    :breakpoints="{ '640px': '95vw' }"
    class="signature-modal"
  >
    <div class="space-y-5">
      <!-- Info -->
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <i class="pi pi-shield text-blue-400 mt-0.5 shrink-0 text-lg"></i>
          <div>
            <p class="font-medium text-blue-300 mb-1">Verifikasi Diperlukan</p>
            <p class="text-sm text-blue-200">
              Untuk melindungi keamanan transaksi Anda, silakan tanda tangani persetujuan pembelian
              membership di bawah ini.
            </p>
          </div>
        </div>
      </div>

      <!-- Purchase Details -->
      <div class="bg-white/5 rounded-lg p-4 space-y-2">
        <h4 class="text-white font-semibold text-sm mb-2">Detail Pembelian</h4>
        <div class="flex justify-between text-sm">
          <span class="text-(--text-muted)">Nama</span>
          <span class="text-white">{{ memberName || 'Member' }}</span>
        </div>
        <div v-if="membershipPlan" class="flex justify-between text-sm">
          <span class="text-(--text-muted)">Paket Membership</span>
          <span class="text-white">{{ membershipPlan }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-(--text-muted)">Tanggal</span>
          <span class="text-white">{{
            new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          }}</span>
        </div>

        <!-- Loading check schedule -->
        <template v-if="scheduleLoading">
          <div class="flex justify-between text-sm animate-pulse">
            <span class="text-(--text-muted)">Memeriksa jadwal...</span>
            <span class="bg-white/10 rounded w-32 h-4"></span>
          </div>
        </template>

        <!-- Status false: tampilkan membership_end_at sebagai teks biasa -->
        <template v-else-if="scheduleStatus === false && membershipEndAt">
          <div class="flex justify-between text-sm">
            <span class="text-(--text-muted)">Membership sampai dengan</span>
            <span class="text-white">{{ formatDate(membershipEndAt) }}</span>
          </div>
        </template>

        <!-- Status true: tampilkan input Tanggal mulai + End date (teks) -->
        <template v-else-if="scheduleStatus === true">
          <div class="flex justify-between items-center text-sm gap-4">
            <span class="text-(--text-muted) shrink-0">Tanggal Mulai</span>
            <DatePicker
              v-model="startDate"
              :min-date="new Date()"
              date-format="dd MM yy"
              placeholder="Pilih tanggal"
              show-icon
              class="!text-sm flex-1 min-w-0"
            />
          </div>
          <div v-if="endDateDisplay" class="flex justify-between text-sm">
            <span class="text-(--text-muted)">Tanggal Berakhir</span>
            <span class="text-white">{{ endDateDisplay }}</span>
          </div>
        </template>
      </div>

      <!-- Agreement Text -->
      <div
        class="p-4 rounded-lg bg-white/5 border border-white/10 text-sm text-(--text-secondary) leading-relaxed max-h-32 overflow-y-auto"
      >
        <p>Dengan menandatangani dokumen ini, saya menyatakan bahwa:</p>
        <ol class="list-decimal list-inside mt-2 space-y-1">
          <li>Saya membeli membership ini atas kemauan sendiri dan tanpa paksaan.</li>
          <li>
            Saya memahami bahwa biaya membership yang telah dibayar
            <strong class="text-white">tidak dapat dikembalikan (non-refundable)</strong>.
          </li>
          <li>Saya setuju untuk mematuhi seluruh peraturan dan kebijakan Arletta Gym.</li>
          <li>Saya telah membaca dan memahami syarat & ketentuan keanggotaan.</li>
        </ol>
      </div>

      <!-- Signature Pad -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-white">
            Tanda Tangan <span class="text-red-400">*</span>
          </label>
          <Button
            v-if="hasSignature"
            label="Hapus"
            icon="pi pi-eraser"
            text
            size="small"
            class="text-(--text-muted) hover:text-white"
            @click="clearSignature"
          />
        </div>
        <div class="rounded-lg border border-white/20 bg-white/5 overflow-hidden relative">
          <canvas
            ref="canvasRef"
            class="w-full cursor-crosshair touch-none"
            style="height: 200px"
            @mousedown="startDrawing"
            @mousemove="draw"
            @mouseup="stopDrawing"
            @mouseleave="stopDrawing"
            @touchstart="startDrawing"
            @touchmove="draw"
            @touchend="stopDrawing"
          />
          <div
            v-if="!hasSignature"
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span class="text-(--text-muted) text-sm">Tanda tangani di sini</span>
          </div>
        </div>
      </div>

      <!-- Checkbox -->
      <label
        class="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors"
      >
        <Checkbox v-model="acceptedTerms" :binary="true" class="mt-0.5" />
        <span class="text-sm text-(--text-secondary)">
          Saya menyatakan bahwa tanda tangan di atas
          <strong class="text-white">sah dan benar</strong> milik saya, dan saya menyetujui
          pembelian membership ini.
        </span>
      </label>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3 pt-5">
        <Button label="Batal" severity="secondary" outlined @click="dialogVisible = false" />
        <Button
          label="Konfirmasi & Bayar"
          icon="pi pi-check"
          class="btn"
          :disabled="!isValid || scheduleLoading"
          @click="handleConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.signature-modal :deep(.p-dialog-header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}
.signature-modal :deep(.p-dialog-content) {
  padding-top: 1rem;
}
</style>
