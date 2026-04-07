<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Card from 'primevue/card'
import authService from '@/services/authService'

const props = defineProps<{
  initialName?: string
  initialPhone?: string
  initialRelation?: string
}>()

const toast = useToast()

const emergency_name = ref(props.initialName ?? '')
const emergency_phone = ref(props.initialPhone ?? '')
const emergency_relation = ref(props.initialRelation ?? '')
const submittingEmergency = ref(false)

// Allow parent to set values after async load
const setValues = (name: string, phone: string, relation: string) => {
  emergency_name.value = name
  emergency_phone.value = phone
  emergency_relation.value = relation
}

defineExpose({ setValues })

const submitEmergency = async () => {
  submittingEmergency.value = true
  try {
    await authService.emergencyContact({
      emergency_name: emergency_name.value,
      emergency_phone: emergency_phone.value,
      emergency_relation: emergency_relation.value,
    })
    toast.add({ severity: 'success', summary: 'Saved', detail: 'Emergency contact saved.', life: 3000 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    toast.add({ severity: 'error', summary: 'Failed', detail: msg, life: 6000 })
  } finally {
    submittingEmergency.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-white font-bold text-lg mb-5 flex items-center gap-2">
      <i class="pi pi-heart-fill text-(--primary)" />
      Emergency Contact
    </h2>

    <Card
      class="glass-card"
      :pt="{
        root: { class: 'bg-transparent border-0' },
        body: { class: 'p-0' },
        content: { class: 'p-0' },
      }"
    >
      <template #content>
        <div class="p-6">
          <!-- Info hint -->
          <div class="flex items-start gap-3 mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <i class="pi pi-info-circle text-amber-400 mt-0.5 shrink-0" />
            <p class="text-sm text-amber-200">
              Kontak darurat akan dihubungi jika terjadi situasi yang tidak diinginkan selama sesi latihan.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <!-- Name -->
            <div class="space-y-2">
              <label class="text-xs text-(--text-muted) font-semibold uppercase tracking-widest flex items-center gap-1.5">
                <i class="pi pi-user text-(--primary) text-xs" />
                Name
              </label>
              <InputText
                v-model="emergency_name"
                placeholder="Contact name"
                class="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-(--primary) focus:ring-1 focus:ring-(--primary)/50"
              />
            </div>

            <!-- Phone -->
            <div class="space-y-2">
              <label class="text-xs text-(--text-muted) font-semibold uppercase tracking-widest flex items-center gap-1.5">
                <i class="pi pi-phone text-(--primary) text-xs" />
                Phone
              </label>
              <InputText
                v-model="emergency_phone"
                placeholder="+62 8xx xxxx xxxx"
                class="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-(--primary) focus:ring-1 focus:ring-(--primary)/50"
              />
            </div>

            <!-- Relation -->
            <div class="space-y-2">
              <label class="text-xs text-(--text-muted) font-semibold uppercase tracking-widest flex items-center gap-1.5">
                <i class="pi pi-users text-(--primary) text-xs" />
                Relation
              </label>
              <InputText
                v-model="emergency_relation"
                placeholder="e.g. Parent, Sibling"
                class="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-(--primary) focus:ring-1 focus:ring-(--primary)/50"
              />
            </div>
          </div>

          <!-- Saved preview -->
          <div
            v-if="emergency_name || emergency_phone || emergency_relation"
            class="mt-5 p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3"
          >
            <div class="w-9 h-9 rounded-full bg-(--primary)/20 flex items-center justify-center shrink-0">
              <i class="pi pi-user text-(--primary) text-sm" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm font-medium truncate">{{ emergency_name || '—' }}</p>
              <p class="text-(--text-muted) text-xs truncate">
                {{ emergency_phone || '—' }}
                <span v-if="emergency_relation" class="mx-1">·</span>
                {{ emergency_relation }}
              </p>
            </div>
            <span class="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full shrink-0">Saved</span>
          </div>

          <div class="mt-5 flex justify-end border-t border-white/10 pt-5">
            <Button
              :label="submittingEmergency ? 'Saving…' : 'Save Emergency Contact'"
              icon="pi pi-save"
              :loading="submittingEmergency"
              :disabled="submittingEmergency"
              class="px-5"
              @click="submitEmergency"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
