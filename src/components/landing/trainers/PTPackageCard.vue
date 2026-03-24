<script setup lang="ts">
import Button from 'primevue/button'
import authState from '@/stores/auth'

defineProps({
  pkg: { type: Object, required: true },
})

defineEmits(['book'])

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
</script>

<template>
  <div
    class="relative flex flex-col rounded-2xl overflow-hidden h-full"
    v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
    style="
      background: linear-gradient(145deg, #1a1a1a 0%, #111 100%);
      box-shadow: 0 0 24px rgba(0, 0, 0, 0.5);
    "
  >
    <!-- Badge jika shareable -->
    <div
      v-if="pkg.shareable || (pkg.maxPerson && pkg.maxPerson > 1)"
      class="absolute top-4 right-4 text-xs font-semibold px-2 py-1 rounded-full"
      style="
        background: rgba(var(--primary-rgb, 239, 68, 68), 0.15);
        color: var(--primary);
        border: 1px solid var(--primary);
      "
    >
      {{ pkg.maxPerson ? `Max ${pkg.maxPerson} Orang` : 'Couple' }}
    </div>

    <div class="flex flex-col flex-1 p-6 gap-5">
      <!-- Header -->
      <div class="text-center">
        <div class="text-xs uppercase tracking-widest mb-1" style="color: var(--primary)">
          Private Training
        </div>
        <h4 class="text-2xl font-black text-white">{{ pkg.name }}</h4>
        <p class="text-sm mt-1" style="color: var(--text-muted)">{{ pkg.sessions }} sessions</p>
        <p v-if="pkg.gymName" class="text-xs mt-1" style="color: var(--text-muted)">
          <i class="pi pi-map-marker mr-1" style="font-size: 0.65rem" />{{ pkg.gymName }}
        </p>
      </div>

      <!-- Promo badge -->
      <div
        v-if="pkg.promos && pkg.promos.length"
        class="flex justify-center"
      >
        <span
          class="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
          style="
            background: rgba(34, 197, 94, 0.12);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.2);
          "
        >
          <i class="pi pi-tag" style="font-size: 0.6rem" />
          {{ pkg.promos[0].type === 'percent' ? `${pkg.promos[0].value}% off` : pkg.promos[0].type === 'fixed' ? `Diskon ${formatPrice(pkg.promos[0].value ?? 0)}` : `Promo ${pkg.promos[0].value ?? ''}` }}
        </span>
      </div>

      <!-- Divider -->
      <div class="w-12 mx-auto h-px" style="background: var(--primary); opacity: 0.4" />

      <!-- Price -->
      <div class="text-center">
        <div class="text-3xl font-black text-white">{{ formatPrice(pkg.price) }}</div>
        <div class="text-xs mt-1" style="color: var(--text-muted)">
          ~{{ formatPrice(pkg.perSession) }} / session
        </div>
      </div>

      <!-- Features -->
      <ul class="flex flex-col gap-2 flex-1">
        <li
          v-for="item in pkg.features"
          :key="item"
          class="flex items-start gap-2 text-sm"
          style="color: var(--text-secondary)"
        >
          <i class="pi pi-check-circle mt-0.5 shrink-0" style="color: var(--primary)" />
          <span>{{ item }}</span>
        </li>
      </ul>

      <!-- CTA -->
      <Button
        label="Book Now"
        :disabled="authState.user?.role === 'pt'"
        :class="[authState.user?.role === 'pt' ? 'opacity-50 cursor-not-allowed' : '']"
        class="w-full py-3 font-semibold text-base"
        style="margin-top: auto"
        @click="
          () => {
            if (authState.user?.role !== 'pt') $emit('book', pkg)
          }
        "
      />
    </div>
  </div>
</template>
