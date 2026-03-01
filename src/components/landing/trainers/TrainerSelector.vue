<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

interface Trainer {
  id: number
  name: string
  role: string
  specializations: string[]
  experience: string
  certifications: string[]
  bio: string
  image: string
  instagram: string
  rating: number
  clients: number
}

interface PackageInfo {
  name: string
  sessions: number
  price: number
  perSession: number
  shareable: boolean
  features: string[]
}

defineProps<{
  visible: boolean
  trainers: Trainer[]
  selectedTrainer: Trainer | null
  tempPackage: PackageInfo | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'update:selectedTrainer', value: Trainer | null): void
  (e: 'proceed'): void
}>()
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    :modal="true"
    :closable="false"
    :pt="{
      root: { class: 'w-full max-w-[820px] mx-4 rounded-[20px] overflow-hidden border border-white/[0.08] shadow-[0_0_0_1px_rgba(230,33,41,0.15),0_40px_80px_rgba(0,0,0,0.7),0_0_60px_rgba(230,33,41,0.06)] bg-gradient-to-br from-[#1a1a1f] via-[#111114] to-[#0e0e11] flex flex-col max-h-[90vh]' },
      mask: { class: 'backdrop-blur-md !bg-black/75' },
      header: { class: '!flex items-center gap-3 !px-6 !pt-5 !pb-4 border-b border-white/[0.07] bg-black/30 flex-shrink-0 !rounded-none' },
      content: { class: '!p-0 bg-transparent overflow-y-auto flex-1' },
      footer: { class: '!flex items-center gap-3 !px-5 !pt-1.5 !pb-[18px] border-t border-white/[0.07] bg-black/30 flex-shrink-0 !rounded-none !m-0' },
    }"
  >
    <template #header>
      <div class="flex-1">
        <div class="flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] uppercase text-(--primary) mb-1.5">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-(--primary) shadow-[0_0_6px_var(--primary)]"></span>
          Langkah 1 dari 2
        </div>
        <h2 class="text-2xl font-extrabold text-white leading-tight tracking-tight mb-1">
          Pilih Trainer <span class="text-(--primary)">Anda</span>
        </h2>
        <p class="text-xs text-white/40 m-0">Temukan trainer yang cocok dengan target latihan Anda</p>
      </div>

      <div v-if="tempPackage" class="flex items-center gap-1.5 mr-3 px-3 py-1.5 bg-[rgba(230,33,41,0.12)] border border-[rgba(230,33,41,0.3)] rounded-full text-xs text-white/80 whitespace-nowrap flex-shrink-0">
        <i class="pi pi-box text-(--primary) text-[0.7rem]"></i>
        <span>{{ tempPackage.name }}</span>
        <span class="text-(--primary) font-bold ml-0.5">Rp {{ (tempPackage.price / 1000).toFixed(0) }}k</span>
      </div>

      <button
        class="w-8 h-8 rounded-full border border-white/10 bg-white/5 text-white/50 flex items-center justify-center cursor-pointer transition-all flex-shrink-0 hover:bg-white/10 hover:text-white hover:border-white/25"
        @click="emit('update:visible', false)"
      >
        <i class="pi pi-times text-xs"></i>
      </button>
    </template>

    <!-- Trainers grid -->
    <div class="grid grid-cols-2 gap-3 p-5 max-sm:grid-cols-1">
      <div
        v-for="t in trainers"
        :key="t.id"
        @click="emit('update:selectedTrainer', t)"
        class="relative rounded-xl border-[1.5px] border-white/[0.07] bg-white/[0.03] p-4 cursor-pointer flex flex-col gap-3 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/5"
        :class="{ 'border-(--primary)! bg-[rgba(230,33,41,0.06)]! -translate-y-0.5': selectedTrainer?.id === t.id }"
      >
        <div
          class="absolute top-3 right-3 w-6 h-6 rounded-full border-[1.5px] border-white/15 bg-white/5 flex items-center justify-center transition-all duration-300 z-10"
          :class="{ 'bg-(--primary)! border-(--primary)! shadow-[0_0_10px_rgba(230,33,41,0.5)]': selectedTrainer?.id === t.id }"
        >
          <i class="pi pi-check text-[10px] transition-all duration-200" :class="selectedTrainer?.id === t.id ? 'text-white' : 'text-transparent'"></i>
        </div>

        <div
          class="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-400 bg-[radial-gradient(ellipse_at_50%_0%,rgba(230,33,41,0.18)_0%,transparent_65%)]"
          :class="selectedTrainer?.id === t.id ? 'opacity-100' : 'opacity-0'"
        ></div>

        <div class="relative w-fit">
          <img
            :src="t.image" :alt="t.name"
            class="w-14 h-14 rounded-full object-cover border-2 transition-colors duration-300"
            :class="selectedTrainer?.id === t.id ? 'border-(--primary)' : 'border-white/10'"
          />
          <div class="absolute -inset-1 rounded-full border-2 transition-colors duration-300" :class="selectedTrainer?.id === t.id ? 'border-[rgba(230,33,41,0.35)]' : 'border-transparent'"></div>
          <div class="absolute -bottom-1 -right-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-black/90 border border-white/10 rounded-full text-[10px] font-bold text-amber-400">
            <i class="pi pi-star-fill text-[8px]"></i>
            {{ t.rating }}
          </div>
        </div>

        <div class="flex flex-col gap-1.5 flex-1">
          <h3 class="text-sm font-bold text-white m-0 tracking-tight">{{ t.name }}</h3>
          <p class="text-[0.7rem] font-medium uppercase tracking-[0.06em] text-(--primary) m-0">{{ t.role }}</p>
          <div class="flex gap-3 mt-0.5">
            <div class="flex items-center gap-1 text-[0.7rem] text-white/45">
              <i class="pi pi-users text-[0.65rem] text-white/30"></i>
              <span>{{ t.clients }} clients</span>
            </div>
            <div class="flex items-center gap-1 text-[0.7rem] text-white/45">
              <i class="pi pi-clock text-[0.65rem] text-white/30"></i>
              <span>{{ t.experience }}</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-1 mt-0.5">
            <span
              v-for="spec in t.specializations.slice(0, 3)" :key="spec"
              class="px-1.5 py-0.5 rounded-full text-[0.65rem] transition-all duration-200"
              :class="selectedTrainer?.id === t.id
                ? 'bg-[rgba(230,33,41,0.1)] border border-[rgba(230,33,41,0.25)] text-[rgba(255,200,200,0.8)]'
                : 'bg-white/5 border border-white/[0.08] text-white/50'"
            >{{ spec }}</span>
            <span v-if="t.specializations.length > 3" class="px-1.5 py-0.5 text-[0.65rem] text-white/30 italic">+{{ t.specializations.length - 3 }} more</span>
          </div>
          <p class="text-[0.72rem] text-white/35 m-0 leading-relaxed line-clamp-2">{{ t.bio }}</p>
        </div>

        <div class="pt-2 border-t transition-colors duration-300" :class="selectedTrainer?.id === t.id ? 'border-[rgba(230,33,41,0.2)]' : 'border-white/[0.06]'">
          <span class="text-[0.72rem] font-semibold transition-colors duration-300" :class="selectedTrainer?.id === t.id ? 'text-(--primary)' : 'text-white/35'">
            {{ selectedTrainer?.id === t.id ? '✓ Dipilih' : 'Pilih Trainer Ini' }}
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <div v-if="selectedTrainer" class="flex items-center gap-2 flex-1 pt-3 min-w-0 animate-[fadeSlideIn_0.3s_ease]">
        <img :src="selectedTrainer.image" :alt="selectedTrainer.name" class="w-8 h-8 rounded-full object-cover border-2 border-(--primary) flex-shrink-0" />
        <div>
          <div class="text-xs font-bold text-white">{{ selectedTrainer.name }}</div>
          <div class="text-[0.68rem] text-white/40">{{ selectedTrainer.role }}</div>
        </div>
        <i class="pi pi-arrow-right text-[0.7rem] text-white/20 flex-shrink-0"></i>
        <div v-if="tempPackage" class="min-w-0">
          <div class="text-xs font-bold text-white">{{ tempPackage.name }}</div>
          <div class="text-[0.68rem] font-semibold text-(--primary)">Rp {{ tempPackage.price.toLocaleString('id-ID') }}</div>
        </div>
      </div>
      <div v-else class="flex items-center gap-1.5 text-xs text-white/25 flex-1">
        <i class="pi pi-info-circle text-[0.7rem]"></i>
        Silakan pilih salah satu trainer untuk melanjutkan
      </div>
      <div class="flex gap-2 flex-shrink-0 pt-3">
        <Button label="Batal" severity="secondary" outlined @click="emit('update:visible', false)" />
        <Button label="Lanjut ke Pembayaran" icon="pi pi-arrow-right" iconPos="right" class="btn" :disabled="!selectedTrainer" @click="emit('proceed')" />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>