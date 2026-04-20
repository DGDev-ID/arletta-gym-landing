<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Skeleton from 'primevue/skeleton'
import { getMemberPtPackages, plotTrainer } from '@/services/ptPackageService'
import { getTrainers } from '@/services/trainerService'

const toast = useToast()

// ── PT Packages State ──────────────────────────────────────
interface MemberPtPkg {
  id: number
  ptPackageName: string
  totalSessions: number
  remainingSessions: number
  status: string
  gymId: number | null
  gymName: string
  trainerName: string | null
  trainerId: number | null
  trainerImage: string | null
}

const packages = ref<MemberPtPkg[]>([])
const packagesLoading = ref(true)

const loadPackages = async () => {
  packagesLoading.value = true
  try {
    const raw = await getMemberPtPackages()
    const list = Array.isArray(raw) ? raw : []
    packages.value = list.map((p) => {
      const r = p as Record<string, unknown>
      const ptPkg = (r['pt_package'] ?? r['ptPackage'] ?? {}) as Record<string, unknown>
      const gym = (ptPkg['gym'] ?? {}) as Record<string, unknown>
      const trainer = (r['trainer'] ?? r['pt'] ?? null) as Record<string, unknown> | null
      return {
        id: Number(r['id']),
        ptPackageName: String(ptPkg['name'] ?? 'PT Package'),
        totalSessions: Number(ptPkg['duration_in_sessions'] ?? r['total_sessions'] ?? 0),
        remainingSessions: Number(r['remaining_sessions'] ?? 0),
        status: String(r['status'] ?? 'active'),
        gymId: gym['id'] ? Number(gym['id']) : null,
        gymName: String(gym['name'] ?? ''),
        trainerName: trainer ? String(trainer['name'] ?? '') : null,
        trainerId: trainer ? Number(trainer['id']) : null,
        trainerImage: trainer ? String(trainer['image'] ?? trainer['avatar'] ?? '') : null,
      }
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    toast.add({ severity: 'error', summary: 'Failed to load PT packages', detail: msg, life: 5000 })
  } finally {
    packagesLoading.value = false
  }
}

onMounted(() => {
  loadPackages()
})

// ── Trainer Assignment ─────────────────────────────────────
interface TrainerOption {
  id: number
  name: string
  image: string
  specializations: string[]
}

const trainers = ref<TrainerOption[]>([])
const trainersLoading = ref(false)
const selectedTrainerId = ref<number | null>(null)

const assigningPackageId = ref<number | null>(null)
const assigningGymId = ref<number | null>(null)
const showTrainerPicker = ref(false)

const loadTrainers = async (gymId: number) => {
  trainersLoading.value = true
  try {
    const raw = await getTrainers({ gym_id: gymId })
    const list = Array.isArray(raw) ? raw : []
    trainers.value = list.map((t) => ({
      id: Number(t.id ?? 0),
      name: String(t.name ?? ''),
      image: String(t.image ?? t.avatar ?? ''),
      specializations: Array.isArray(t.specializations) ? (t.specializations as string[]) : [],
    }))
  } catch {
    trainers.value = []
  } finally {
    trainersLoading.value = false
  }
}

const openTrainerPicker = async (pkg: MemberPtPkg) => {
  assigningPackageId.value = pkg.id
  assigningGymId.value = pkg.gymId
  selectedTrainerId.value = null
  showTrainerPicker.value = true
  if (pkg.gymId) await loadTrainers(pkg.gymId)
}

// ── Confirmation modal ─────────────────────────────────────
const showConfirmModal = ref(false)
const confirmTrainerName = ref('')
const confirmLoading = ref(false)

const askConfirmation = () => {
  if (!selectedTrainerId.value) {
    toast.add({
      severity: 'warn',
      summary: 'Select trainer',
      detail: 'Please choose a trainer first.',
      life: 3000,
    })
    return
  }
  const t = trainers.value.find((tr) => tr.id === selectedTrainerId.value)
  confirmTrainerName.value = t?.name ?? ''
  showConfirmModal.value = true
}

const confirmAssignment = async () => {
  if (!selectedTrainerId.value || !assigningPackageId.value) return
  confirmLoading.value = true
  try {
    await plotTrainer({
      pt_id: selectedTrainerId.value,
      user_pt_package_id: assigningPackageId.value,
    })
    toast.add({
      severity: 'success',
      summary: 'Trainer assigned',
      detail: `${confirmTrainerName.value} has been assigned as your personal trainer.`,
      life: 4000,
    })
    showConfirmModal.value = false
    showTrainerPicker.value = false
    // Reload to reflect changes
    await loadPackages()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    toast.add({ severity: 'error', summary: 'Failed', detail: msg, life: 5000 })
  } finally {
    confirmLoading.value = false
  }
}

// Percentage for progress bar
const sessionPercent = (remaining: number, total: number) =>
  total > 0 ? Math.round((remaining / total) * 100) : 0
</script>

<template>
  <div>
    <h2 class="text-white font-bold text-lg mb-5 flex items-center gap-2">
      <i class="pi pi-bolt text-(--primary)" />
      Paket PT Saya
    </h2>

    <!-- Skeleton loading -->
    <template v-if="packagesLoading">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          v-for="i in 2"
          :key="i"
          class="glass-card"
          :pt="{
            root: { class: 'bg-transparent border-0' },
            body: { class: 'p-5' },
            content: { class: 'p-0' },
          }"
        >
          <template #content>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <Skeleton width="55%" height="1.25rem" />
                <Skeleton width="3.5rem" height="1.5rem" borderRadius="9999px" />
              </div>
              <Skeleton width="100%" height="0.5rem" borderRadius="4px" />
              <div class="flex justify-between">
                <Skeleton width="30%" height="0.875rem" />
                <Skeleton width="25%" height="0.875rem" />
              </div>
              <Skeleton width="100%" height="2.5rem" borderRadius="8px" />
            </div>
          </template>
        </Card>
      </div>
    </template>

    <!-- Empty state -->
    <Card
      v-else-if="packages.length === 0"
      class="glass-card"
      :pt="{
        root: { class: 'bg-transparent border-0' },
        body: { class: 'p-6' },
        content: { class: 'p-0' },
      }"
    >
      <template #content>
        <div class="text-center py-8">
          <i class="pi pi-inbox text-4xl text-(--text-muted) mb-3 block" />
          <p class="text-(--text-muted)">Anda belum membeli paket PT apa pun.</p>
          <p class="text-(--text-muted) text-sm mt-1">
            Kunjungi halaman
            <router-link to="/personal-trainers" class="text-(--primary) hover:underline"
              >Personal Trainer</router-link
            >
            untuk melihat paket yang tersedia.
          </p>
        </div>
      </template>
    </Card>

    <!-- Package cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card
        v-for="pkg in packages"
        :key="pkg.id"
        class="glass-card"
        :pt="{
          root: { class: 'bg-transparent border-0' },
          body: { class: 'p-5' },
          content: { class: 'p-0' },
        }"
      >
        <template #content>
          <div class="space-y-4">
            <!-- Header -->
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-white font-semibold">{{ pkg.ptPackageName }}</h4>
                <p class="text-(--text-muted) text-xs mt-0.5">{{ pkg.gymName }}</p>
              </div>
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="
                  pkg.status === 'done_payment'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                "
              >
                {{ pkg.status === 'done_payment' ? 'Paid' : 'Installment (DP)' }}
              </span>
            </div>

            <!-- Sessions progress -->
            <div>
              <div class="flex justify-between text-xs mb-1.5">
                <span class="text-(--text-muted)">Sisa sesi</span>
                <span class="text-white font-semibold"
                  >{{ pkg.remainingSessions }} / {{ pkg.totalSessions }}</span
                >
              </div>
              <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="
                    sessionPercent(pkg.remainingSessions, pkg.totalSessions) > 30
                      ? 'bg-(--primary)'
                      : 'bg-red-500'
                  "
                  :style="{ width: `${sessionPercent(pkg.remainingSessions, pkg.totalSessions)}%` }"
                />
              </div>
            </div>

            <!-- Trainer info -->
            <div
              v-if="pkg.trainerName"
              class="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <img
                :src="
                  pkg.trainerImage ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(pkg.trainerName)}`
                "
                :alt="pkg.trainerName"
                class="w-10 h-10 rounded-full object-cover border border-white/20"
              />
              <div class="flex-1 min-w-0">
                <p class="text-white text-sm font-medium truncate">{{ pkg.trainerName }}</p>
                <p class="text-(--text-muted) text-xs">Personal Trainer</p>
              </div>
              <i
                class="pi pi-lock text-(--text-muted) text-xs"
                title="Trainer tidak dapat diubah"
              />
            </div>

            <!-- Assign trainer button (only if no trainer assigned & fully paid) -->
            <Button
              v-if="!pkg.trainerName && pkg.status === 'done_payment'"
              label="Pilih Trainer"
              icon="pi pi-user-plus"
              class="w-full"
              severity="secondary"
              outlined
              @click="openTrainerPicker(pkg)"
            />

            <!-- Installment notice (cannot choose trainer yet) -->
            <div
              v-if="!pkg.trainerName && pkg.status !== 'done_payment'"
              class="flex items-center gap-2.5 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
            >
              <i class="pi pi-info-circle text-yellow-400 shrink-0" />
              <p class="text-yellow-200 text-xs">
                Selesaikan pembayaran terlebih dahulu sebelum memilih personal trainer.
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- ── Trainer Picker Dialog ──────────────────────────────── -->
    <Dialog
      :visible="showTrainerPicker"
      @update:visible="(v) => (showTrainerPicker = v)"
      header="Pilih Personal Trainer Anda"
      modal
      :style="{ width: '540px' }"
      :breakpoints="{ '640px': '92vw' }"
      :pt="{
        root: { class: 'rounded-2xl overflow-hidden border border-white/[0.08] bg-[#111114]' },
        mask: { class: 'backdrop-blur-md !bg-black/70' },
        header: {
          class: '!px-6 !pt-5 !pb-3 border-b border-white/[0.07] bg-black/30 !rounded-none',
        },
        content: { class: '!p-5 bg-transparent' },
      }"
    >
      <div class="space-y-5">
        <!-- Trainer list -->
        <div class="space-y-2">
          <label class="text-xs text-(--text-muted) font-semibold uppercase tracking-widest"
            >Pilih Trainer</label
          >

          <div v-if="trainersLoading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <Skeleton shape="circle" size="2.5rem" />
              <div class="flex-1 space-y-1">
                <Skeleton width="50%" height="0.875rem" />
                <Skeleton width="70%" height="0.625rem" />
              </div>
            </div>
          </div>

          <div v-else-if="trainers.length === 0" class="text-center py-6 text-(--text-muted)">
            <i class="pi pi-users text-3xl mb-2 block" />
            <p class="text-sm">Tidak ada trainer yang tersedia untuk cabang ini.</p>
          </div>

          <div v-else class="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            <div
              v-for="t in trainers"
              :key="t.id"
              class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
              :class="
                selectedTrainerId === t.id
                  ? 'border-(--primary) bg-(--primary)/10'
                  : 'border-white/10 bg-white/3 hover:bg-white/6 hover:border-white/20'
              "
              @click="selectedTrainerId = t.id"
            >
              <img
                :src="
                  t.image ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(t.name)}`
                "
                :alt="t.name"
                class="w-10 h-10 rounded-full object-cover border border-white/20"
              />
              <div class="flex-1 min-w-0">
                <p class="text-white text-sm font-medium truncate">{{ t.name }}</p>
                <p class="text-(--text-muted) text-xs truncate">
                  {{ t.specializations.slice(0, 3).join(', ') || 'Personal Trainer' }}
                </p>
              </div>
              <i v-if="selectedTrainerId === t.id" class="pi pi-check-circle text-(--primary)" />
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-3 border-t border-white/10 pt-4">
          <Button
            label="Batal"
            severity="secondary"
            outlined
            class="flex-1"
            @click="showTrainerPicker = false"
          />
          <Button
            label="Konfirmasi Trainer"
            icon="pi pi-check"
            class="flex-1"
            :disabled="!selectedTrainerId"
            @click="askConfirmation"
          />
        </div>
      </div>
    </Dialog>

    <!-- ── Confirmation Modal ─────────────────────────────────── -->
    <Dialog
      :visible="showConfirmModal"
      @update:visible="(v) => (showConfirmModal = v)"
      header="Konfirmasi Pilihan Trainer"
      modal
      :style="{ width: '420px' }"
      :breakpoints="{ '640px': '92vw' }"
      :pt="{
        root: { class: 'rounded-2xl overflow-hidden border border-white/[0.08] bg-[#111114]' },
        mask: { class: 'backdrop-blur-md !bg-black/70' },
        header: {
          class: '!px-6 !pt-5 !pb-3 border-b border-white/[0.07] bg-black/30 !rounded-none',
        },
        content: { class: '!p-5 bg-transparent' },
      }"
    >
      <div class="space-y-5">
        <div
          class="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20"
        >
          <i class="pi pi-exclamation-triangle text-amber-400 text-xl mt-0.5 shrink-0" />
          <div>
            <p class="text-white font-semibold text-sm">Apakah Anda yakin?</p>
            <p class="text-amber-200 text-sm mt-1">
              Anda akan memilih
              <span class="font-bold text-white">{{ confirmTrainerName }}</span> sebagai personal
              trainer Anda. <strong>Pilihan ini tidak dapat diubah</strong> setelah dikonfirmasi.
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <Button
            label="Batal"
            severity="secondary"
            outlined
            class="flex-1"
            :disabled="confirmLoading"
            @click="showConfirmModal = false"
          />
          <Button
            label="Ya, Pilih Trainer"
            icon="pi pi-check"
            class="flex-1"
            :loading="confirmLoading"
            @click="confirmAssignment"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
