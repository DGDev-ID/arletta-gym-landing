<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'

const props = defineProps<{
  visible: boolean
  memberName?: string
  membershipPlan?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirmed', signatureData?: string): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const hasSignature = ref(false)
const acceptedTerms = ref(false)
const isDrawing = ref(false)

let ctx: CanvasRenderingContext2D | null = null

const initCanvas = () => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  // Set canvas size
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
    return {
      x: (touch?.clientX ?? 0) - rect.left,
      y: (touch?.clientY ?? 0) - rect.top,
    }
  }

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

const clearSignature = () => {
  if (!ctx || !canvasRef.value) return
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  hasSignature.value = false
}

const isValid = computed(() => hasSignature.value && acceptedTerms.value)

const handleConfirm = () => {
  if (!isValid.value || !canvasRef.value) return
  // extract signature as data URL
  const dataUrl = canvasRef.value.toDataURL('image/png')
  emit('confirmed', dataUrl)
  emit('update:visible', false)
}

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      hasSignature.value = false
      acceptedTerms.value = false
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
          <label class="text-sm font-medium text-white"
            >Tanda Tangan <span class="text-red-400">*</span></label
          >
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
          :disabled="!isValid"
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
