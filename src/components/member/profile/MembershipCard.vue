<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import QrcodeVue from 'qrcode.vue'

interface Props {
  member: {
    memberId: string
    membershipType: string
  }
  membershipStatus: {
    status: string
    expiresAt: string
    daysRemaining: number
    startDate?: string
    duration?: string
  }
}

defineProps<Props>()
const emit = defineEmits<{ (e: 'renew'): void }>()
</script>

<template>
  <Card
    class="glass-card"
    :pt="{
      root: { class: 'bg-transparent border-0' },
      body: { class: 'p-6' },
      content: { class: 'p-0' },
    }"
  >
    <template #content>
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-white">Membership</h3>
        <span class="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full">
          {{ membershipStatus.status }}
        </span>
      </div>

      <div class="space-y-4">
        <div class="p-4 rounded-lg bg-white/5">
          <div class="text-sm text-(--text-muted) mb-1">Expires On</div>
          <div class="text-white font-semibold">
            {{
              new Date(membershipStatus.expiresAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            }}
          </div>
        </div>

        <div class="p-4 rounded-lg bg-(--primary)/10 border border-(--primary)/20">
          <div class="text-sm text-(--text-muted) mb-1">Days Remaining</div>
          <div class="text-2xl font-bold text-(--primary)">
            {{ membershipStatus.daysRemaining }} days
          </div>
        </div>

        <!-- QR Code Section -->
        <div class="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
          <div class="text-sm text-(--text-muted) mb-3">Member QR Code</div>
          <div class="bg-white p-3 rounded-lg inline-block">
            <QrcodeVue
              v-if="member.memberId"
              :value="member.memberId"
              :size="150"
              level="H"
              render-as="svg"
            />
          </div>
          <div class="mt-3 text-xs text-(--text-muted)">ID: {{ member.memberId }}</div>

          <!-- Start Duration Info -->
          <div
            v-if="membershipStatus.startDate || membershipStatus.duration"
            class="mt-3 pt-3 border-t border-white/10"
          >
            <div
              v-if="membershipStatus.startDate"
              class="flex items-center justify-center gap-2 text-xs text-(--text-secondary) mb-1"
            >
              <i class="pi pi-calendar text-(--primary)"></i>
              <span
                >Mulai:
                {{
                  new Date(membershipStatus.startDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                }}</span
              >
            </div>
            <div
              v-if="membershipStatus.duration"
              class="flex items-center justify-center gap-2 text-xs text-(--text-secondary)"
            >
              <i class="pi pi-clock text-(--primary)"></i>
              <span>Durasi: {{ membershipStatus.duration }}</span>
            </div>
          </div>

          <p class="text-xs text-(--text-secondary) mt-2">Scan at gym entrance for check-in</p>
        </div>
      </div>

      <Button
        label="Renew Membership"
        icon="pi pi-refresh"
        class="btn btn-red mt-6 w-full py-2.5"
        @click="emit('renew')"
      />
    </template>
  </Card>
</template>
