<script setup lang="ts">
import Button from 'primevue/button'
import authState from '@/stores/auth'

const props = defineProps({ plan: { type: Object, required: true } })
const emit = defineEmits(['signup'])

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)

const onSignup = () => {
  if (authState.user?.role === 'pt') return
  // only emit signup when not PT
  emit('signup')
}
</script>

<template>
  <section class="py-8 md:py-12 relative overflow-hidden">
    <!-- Content (ParticleBackground moved to parent) -->
    <div class="container-custom relative z-10 h-full">
      <div class="w-full h-full">
        <div
          v-animateonscroll="{ enterClass: 'animate-scalein', leaveClass: 'animate-fadeout' }"
          class="glass-card p-6 md:p-8 rounded-2xl border-2 border-(--primary) relative flex flex-col h-full"
        >
          <div class="text-center mb-8">
            <h3 class="text-2xl md:text-3xl font-bold text-white mb-2">{{ props.plan.name }}</h3>
            <p class="text-(--text-muted) text-sm mb-6">{{ props.plan.description }}</p>

            <!-- Promo badge -->
            <div
              v-if="props.plan.promo"
              class="inline-block bg-(--primary) text-white text-xs font-semibold px-3 py-1 rounded-full mb-4"
            >
              {{ props.plan.promo }}
            </div>

            <div class="flex items-baseline justify-center gap-2 whitespace-nowrap">
              <span class="text-2xl md:text-3xl lg:text-4xl font-black text-white">{{
                formatPrice(props.plan.price)
              }}</span>
              <span class="text-(--text-muted) text-sm">/{{ props.plan.period }}</span>
            </div>
          </div>

          <div class="space-y-3 mb-8">
            <div
              v-for="feature in props.plan.features"
              :key="feature"
              v-animateonscroll="{
                enterClass: 'animate-fadeinleft',
                leaveClass: 'animate-fadeout',
              }"
              class="flex items-start gap-3"
            >
              <i class="pi pi-check-circle text-(--primary) mt-0.5 shrink-0"></i>
              <span class="text-(--text-secondary) text-sm">{{ feature }}</span>
            </div>
          </div>

          <div class="mt-auto">
            <Button
              label="Sign Up Now"
              :disabled="authState.user?.role === 'pt'"
              :class="[authState.user?.role === 'pt' ? 'opacity-50 cursor-not-allowed' : '']"
              class="w-full py-3.5 text-base font-semibold"
              @click="onSignup"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
