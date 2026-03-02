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
    :closable="false"
    :style="{ width: '820px' }"
    :breakpoints="{ '640px': '90vw' }"
    :pt="{
      root: {
        class:
          'rounded-[20px] overflow-hidden border border-white/[0.08] shadow-[0_0_0_1px_rgba(230,33,41,0.15),0_40px_80px_rgba(0,0,0,0.7),0_0_60px_rgba(230,33,41,0.06)] bg-gradient-to-br from-[#1a1a1f] via-[#111114] to-[#0e0e11] flex flex-col max-h-[90vh]',
      },
      mask: { class: 'backdrop-blur-md !bg-black/75' },
      header: {
        class:
          '!flex items-center gap-3 !px-7 !pt-5 !pb-4 border-b border-white/[0.07] bg-black/30 flex-shrink-0 !rounded-none',
      },
      content: { class: '!p-0 bg-transparent overflow-y-auto flex-1' },
      footer: {
        class:
          '!flex justify-end gap-3 !px-7 !pt-1.5 !pb-[18px] border-t border-white/[0.07] bg-black/30 flex-shrink-0 !rounded-none !m-0',
      },
    }"
  >
    <template #header>
      <div class="flex-1">
        <div
          class="flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] uppercase text-(--primary) mb-1.5"
        >
          <span
            class="inline-block w-1.5 h-1.5 rounded-full bg-(--primary) shadow-[0_0_6px_var(--primary)]"
          ></span>
          Langkah 2 dari 2
        </div>
        <h2 class="text-2xl font-extrabold text-white leading-tight tracking-tight mb-1">
          Pilih Metode <span class="text-(--primary)">Pembayaran</span>
        </h2>
        <p class="text-xs text-white/40 m-0">
          Pilih cara pembayaran yang sesuai dengan kenyamanan Anda
        </p>
      </div>

      <div
        v-if="pkg"
        class="flex items-center gap-1.5 mr-2 px-3 py-1.5 bg-[rgba(230,33,41,0.12)] border border-[rgba(230,33,41,0.3)] rounded-full text-xs text-white/80 whitespace-nowrap flex-shrink-0"
      >
        <i class="pi pi-box text-(--primary) text-[0.7rem]"></i>
        <span>{{ pkg.name }}</span>
      </div>

      <button
        class="w-8 h-8 rounded-full border border-white/10 bg-white/5 text-white/50 flex items-center justify-center cursor-pointer transition-all flex-shrink-0 hover:bg-white/10 hover:text-white hover:border-white/25"
        @click="dialogVisible = false"
      >
        <i class="pi pi-times text-xs"></i>
      </button>
    </template>

    <div v-if="pkg" class="flex flex-col gap-4 p-7">
      <div class="bg-white/5 rounded-xl p-4">
        <h4 class="text-white font-semibold mb-2 text-sm">{{ pkg.name }}</h4>
        <div class="flex justify-between text-sm">
          <span class="text-(--text-muted)">{{ pkg.sessions }} sessions</span>
          <span class="text-white font-bold">{{ formatPrice(pkg.price) }}</span>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <h4 class="text-white font-semibold text-sm">Tipe Pembayaran</h4>

        <label
          class="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all"
          :class="
            paymentType === 'full'
              ? 'bg-(--primary)/10 border-(--primary)/40'
              : 'bg-white/5 border-white/10 hover:bg-white/8'
          "
        >
          <input type="radio" v-model="paymentType" value="full" class="accent-red-500" />
          <div class="flex-1">
            <div class="font-medium text-white text-sm">Bayar Penuh</div>
            <div class="text-xs text-(--text-muted)">Bayar langsung seluruh biaya paket</div>
          </div>
          <div class="text-white font-bold text-sm">{{ formatPrice(pkg.price) }}</div>
        </label>

        <label
          class="flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all"
          :class="
            paymentType === 'dp'
              ? 'bg-(--primary)/10 border-(--primary)/40'
              : 'bg-white/5 border-white/10 hover:bg-white/8'
          "
        >
          <input type="radio" v-model="paymentType" value="dp" class="accent-red-500 mt-1" />
          <div class="flex-1">
            <div class="font-medium text-white text-sm">Down Payment (DP)</div>
            <div class="text-xs text-(--text-muted) mb-3">
              Bayar sebagian di awal, sisanya sebelum sesi dimulai
            </div>
            <div v-if="paymentType === 'dp'" class="flex gap-2 mt-2">
              <button
                class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                :class="
                  dpPercentage === 30
                    ? 'bg-(--primary) text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                "
                @click.prevent="dpPercentage = 30"
              >
                30%
              </button>
              <button
                class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                :class="
                  dpPercentage === 50
                    ? 'bg-(--primary) text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                "
                @click.prevent="dpPercentage = 50"
              >
                50%
              </button>
            </div>
          </div>
        </label>
      </div>

      <div
        v-if="paymentType === 'dp'"
        class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col gap-2"
      >
        <div class="flex justify-between text-sm">
          <span class="text-amber-200">DP ({{ dpPercentage }}%)</span>
          <span class="text-white font-bold">{{ formatPrice(dpAmount) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-amber-200">Sisa Pembayaran</span>
          <span class="text-white font-bold">{{ formatPrice(remainingAmount) }}</span>
        </div>
        <div class="pt-2 border-t border-amber-500/20">
          <p class="text-xs text-amber-200 m-0">
            <i class="pi pi-info-circle mr-1"></i>
            Sisa pembayaran harus dilunasi sebelum sesi pertama dimulai.
          </p>
        </div>
      </div>

      <div class="bg-(--primary)/10 border border-(--primary)/20 rounded-xl p-4">
        <div class="flex justify-between items-center">
          <span class="text-white font-medium text-sm">Bayar Sekarang</span>
          <span class="text-2xl font-bold text-(--primary)">
            {{ formatPrice(paymentType === 'dp' ? dpAmount : pkg.price) }}
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3 pt-3">
        <Button label="Batal" severity="secondary" outlined @click="dialogVisible = false" />
        <Button
          :label="
            paymentType === 'dp'
              ? `Bayar DP ${formatPrice(dpAmount)}`
              : `Bayar ${formatPrice(pkg?.price ?? 0)}`
          "
          icon="pi pi-credit-card"
          class="btn"
          @click="handleConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>
