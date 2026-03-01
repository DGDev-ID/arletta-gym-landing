<script setup lang="ts">
import { ref, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

interface PackageInfo {
  name: string
  sessions: number
  price: number
  perSession: number
  shareable: boolean
}

const props = defineProps<{
  visible: boolean
  pkg: PackageInfo | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', data: { pkg: PackageInfo; paymentType: 'full' | 'dp'; dpAmount: number }): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const paymentType = ref<'full' | 'dp'>('full')

// DP options: 30% or 50%
const dpPercentage = ref(50)

const dpAmount = computed(() => {
  if (!props.pkg) return 0
  return Math.round(props.pkg.price * (dpPercentage.value / 100))
})

const remainingAmount = computed(() => {
  if (!props.pkg) return 0
  return props.pkg.price - dpAmount.value
})

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)

const handleConfirm = () => {
  if (!props.pkg) return
  emit('confirm', {
    pkg: props.pkg,
    paymentType: paymentType.value,
    dpAmount: paymentType.value === 'dp' ? dpAmount.value : props.pkg.price,
  })
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    header="Pilih Metode Pembayaran"
    :style="{ width: '500px' }"
    :breakpoints="{ '640px': '90vw' }"
    class="dp-payment-modal"
  >
    <div v-if="pkg" class="space-y-5">
      <!-- Package Summary -->
      <div class="bg-white/5 rounded-lg p-4">
        <h4 class="text-white font-semibold mb-2">{{ pkg.name }}</h4>
        <div class="flex justify-between text-sm">
          <span class="text-(--text-muted)">{{ pkg.sessions }} sessions</span>
          <span class="text-white font-bold">{{ formatPrice(pkg.price) }}</span>
        </div>
      </div>

      <!-- Payment Type Selection -->
      <div class="space-y-3">
        <h4 class="text-white font-semibold text-sm">Tipe Pembayaran</h4>

        <!-- Full Payment -->
        <label
          :class="['flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all',
            paymentType === 'full'
              ? 'bg-(--primary)/10 border-(--primary)/40'
              : 'bg-white/5 border-white/10 hover:bg-white/8']"
        >
          <input type="radio" v-model="paymentType" value="full" class="accent-red-500" />
          <div class="flex-1">
            <div class="font-medium text-white">Bayar Penuh</div>
            <div class="text-sm text-(--text-muted)">Bayar langsung seluruh biaya paket</div>
          </div>
          <div class="text-white font-bold">{{ formatPrice(pkg.price) }}</div>
        </label>

        <!-- DP Payment -->
        <label
          :class="['flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all',
            paymentType === 'dp'
              ? 'bg-(--primary)/10 border-(--primary)/40'
              : 'bg-white/5 border-white/10 hover:bg-white/8']"
        >
          <input type="radio" v-model="paymentType" value="dp" class="accent-red-500 mt-1" />
          <div class="flex-1">
            <div class="font-medium text-white">Down Payment (DP)</div>
            <div class="text-sm text-(--text-muted) mb-3">Bayar sebagian di awal, sisanya sebelum sesi dimulai</div>

            <!-- DP Percentage options -->
            <div v-if="paymentType === 'dp'" class="flex gap-3 mt-2">
              <button
                :class="['px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  dpPercentage === 30 ? 'bg-(--primary) text-white' : 'bg-white/10 text-white/70 hover:bg-white/20']"
                @click.prevent="dpPercentage = 30"
              >
                30%
              </button>
              <button
                :class="['px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  dpPercentage === 50 ? 'bg-(--primary) text-white' : 'bg-white/10 text-white/70 hover:bg-white/20']"
                @click.prevent="dpPercentage = 50"
              >
                50%
              </button>
            </div>
          </div>
        </label>
      </div>

      <!-- DP Breakdown -->
      <div v-if="paymentType === 'dp'" class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-amber-200">DP ({{ dpPercentage }}%)</span>
          <span class="text-white font-bold">{{ formatPrice(dpAmount) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-amber-200">Sisa Pembayaran</span>
          <span class="text-white font-bold">{{ formatPrice(remainingAmount) }}</span>
        </div>
        <div class="pt-2 border-t border-amber-500/20">
          <p class="text-xs text-amber-200">
            <i class="pi pi-info-circle mr-1"></i>
            Sisa pembayaran harus dilunasi sebelum sesi pertama dimulai. Sesi tidak dapat dijadwalkan sampai pembayaran lunas atau DP sudah dibayar.
          </p>
        </div>
      </div>

      <!-- Total to Pay Now -->
      <div class="bg-(--primary)/10 border border-(--primary)/20 rounded-lg p-4">
        <div class="flex justify-between items-center">
          <span class="text-white font-medium">Bayar Sekarang</span>
          <span class="text-2xl font-bold text-(--primary)">
            {{ formatPrice(paymentType === 'dp' ? dpAmount : pkg.price) }}
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button
          label="Batal"
          severity="secondary"
          outlined
          @click="dialogVisible = false"
        />
        <Button
          :label="paymentType === 'dp' ? `Bayar DP ${formatPrice(dpAmount)}` : `Bayar ${formatPrice(pkg?.price ?? 0)}`"
          icon="pi pi-credit-card"
          class="btn"
          @click="handleConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.dp-payment-modal :deep(.p-dialog-header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.dp-payment-modal :deep(.p-dialog-content) {
  padding-top: 1rem;
}
</style>
