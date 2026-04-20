<script setup lang="ts">
import Button from 'primevue/button'

type Trainer = {
  id: number
  name: string
  role: string
  specializations: string[]
  experience: string
  certifications: string[]
  bio: string
  image: string
  images?: string[]
  instagram?: string
  rating?: number
  clients?: number
  phone_number?: string
  gender?: string
}
const props = defineProps<{ trainer?: Trainer | null }>()
defineEmits(['close'])

// Use trainer's real phone number for WhatsApp; fallback to placeholder
const handleBookSession = () => {
  const rawPhone = props.trainer?.phone_number ?? ''
  // Normalize phone: strip non-digits, ensure starts with country code
  const digits = rawPhone.replace(/\D/g, '')
  const whatsappNumber = digits.startsWith('0') ? '62' + digits.slice(1) : digits || '628123456789'
  const message = encodeURIComponent(
    `Hi ${props.trainer?.name ?? 'Trainer'}, I would like to book a personal training session with you.`,
  )
  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="props.trainer"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <div class="glass-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div class="relative">
            <img
              :src="props.trainer.image"
              :alt="props.trainer.name"
              class="w-full h-64 object-cover"
            />
            <button
              class="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
              @click="$emit('close')"
            >
              <i class="pi pi-times"></i>
            </button>
            <div
              class="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/90 to-transparent"
            >
              <h2 class="text-2xl font-bold text-white">{{ props.trainer.name }}</h2>
              <p class="text-(--primary)">{{ props.trainer.role }}</p>
            </div>
          </div>

          <div class="p-6">
            <div class="flex flex-wrap gap-6 mb-6">
              <div class="flex items-center gap-2">
                <i class="pi pi-star-fill text-yellow-500"></i
                ><span class="text-white">{{ props.trainer.rating }} Rating</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="pi pi-users text-(--primary)"></i
                ><span class="text-white">{{ props.trainer.clients }}+ Clients</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="pi pi-clock text-(--primary)"></i
                ><span class="text-white">{{ props.trainer.experience }} Experience</span>
              </div>
              <div v-if="props.trainer.gender" class="flex items-center gap-2">
                <i class="pi pi-user text-(--primary)"></i
                ><span class="text-white capitalize">{{ props.trainer.gender }}</span>
              </div>
            </div>

            <p class="text-(--text-secondary) mb-6">{{ props.trainer.bio }}</p>

            <div class="mb-6">
              <h4 class="text-white font-semibold mb-3">Specializations</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="spec in props.trainer.specializations"
                  :key="spec"
                  class="bg-(--primary)/20 text-(--primary) text-sm px-4 py-2 rounded-full"
                  >{{ spec }}</span
                >
              </div>
            </div>

            <div class="mb-6">
              <h4 class="text-white font-semibold mb-3">Certifications</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="cert in props.trainer.certifications"
                  :key="cert"
                  class="bg-white/10 text-(--text-secondary) text-sm px-4 py-2 rounded-full"
                  >{{ cert }}</span
                >
              </div>
            </div>

            <div class="flex gap-4">
              <Button
                label="Book Session"
                icon="pi pi-whatsapp"
                class="btn btn-red flex-1 py-3"
                @click="handleBookSession"
              />
              <Button
                :label="props.trainer.instagram"
                icon="pi pi-instagram"
                outlined
                class="py-3 border-white/20 text-white hover:bg-white/10"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
