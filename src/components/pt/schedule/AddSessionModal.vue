<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'

interface Member {
  id: number
  name: string
  avatar: string
}

interface NewSession {
  clientId: number | null
  date: Date | null
  startTime: string
  endTime: string
  location: string
  notes: string
}

interface Props {
  visible: boolean
  members: Member[]
  newSession: NewSession
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'update:newSession', value: NewSession): void
  (e: 'add'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Typed update handlers to avoid implicit 'any' in template inline lambdas
const updateClient = (val: number | null | undefined) =>
  emit('update:newSession', { ...props.newSession, clientId: val ?? null })
const updateDate = (val: Date | null | undefined) =>
  emit('update:newSession', { ...props.newSession, date: val ?? null })
const updateStartTime = (val: string | undefined) =>
  emit('update:newSession', { ...props.newSession, startTime: val || '' })
const updateEndTime = (val: string | undefined) =>
  emit('update:newSession', { ...props.newSession, endTime: val || '' })
const updateLocation = (val: string | undefined) =>
  emit('update:newSession', { ...props.newSession, location: val || '' })
const updateNotes = (val: string | undefined) =>
  emit('update:newSession', { ...props.newSession, notes: val || '' })
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Add PT Session"
    :style="{ width: '90vw', maxWidth: '500px' }"
    :pt="{
      root: { class: 'glass-modal' },
      header: { class: 'border-b border-white/10 pb-4' },
      content: { class: 'pt-6' },
    }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="space-y-4">
      <!-- Member Selection -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">Client</label>
        <Dropdown
          :model-value="props.newSession.clientId"
          :options="props.members"
          option-label="name"
          option-value="id"
          placeholder="Select a client"
          class="w-full glass-input"
          :pt="{
            root: { class: 'w-full' },
            input: { class: 'glass-input w-full' },
            panel: { class: 'glass-modal' },
          }"
          @update:model-value="updateClient"
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2">
              <img :src="slotProps.option.avatar" class="w-6 h-6 rounded-full" />
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
        </Dropdown>
      </div>

      <!-- Date Selection -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">Date</label>
        <Calendar
          :model-value="props.newSession.date"
          show-icon
          placeholder="Select date"
          class="w-full"
          :pt="{
            root: { class: 'w-full' },
            input: { class: 'glass-input w-full' },
            panel: { class: 'glass-modal' },
          }"
          @update:model-value="updateDate"
        />
      </div>

      <!-- Time Selection -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">Time</label>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-(--text-muted) mb-1">Start Time</label>
            <InputText
              :model-value="props.newSession.startTime"
              type="time"
              class="glass-input w-full"
              @update:model-value="updateStartTime"
            />
          </div>
          <div>
            <label class="block text-xs text-(--text-muted) mb-1">End Time</label>
            <InputText
              :model-value="props.newSession.endTime"
              type="time"
              class="glass-input w-full"
              @update:model-value="updateEndTime"
            />
          </div>
        </div>
      </div>

      <!-- Location -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">Location</label>
        <InputText
          :model-value="props.newSession.location"
          placeholder="e.g., Weight Room, Studio A"
          class="glass-input w-full"
          @update:model-value="updateLocation"
        />
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">Session Notes</label>
        <Textarea
          :model-value="props.newSession.notes"
          placeholder="Add any notes for this session..."
          rows="3"
          class="glass-input w-full"
          @update:model-value="updateNotes"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3 justify-end pt-5">
        <Button
          label="Cancel"
          text
          class="text-(--text-secondary) hover:text-white"
          @click="emit('update:visible', false)"
        />
        <Button label="Add Session" class="btn" @click="emit('add')" />
      </div>
    </template>
  </Dialog>
</template>
