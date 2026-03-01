<script setup lang="ts">
import { ref, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'accepted'): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const acceptedHealth = ref(false)
const acceptedTerms = ref(false)
const acceptedRisk = ref(false)

const allAccepted = computed(() => acceptedHealth.value && acceptedTerms.value && acceptedRisk.value)

const handleAccept = () => {
  if (allAccepted.value) {
    emit('accepted')
    emit('update:visible', false)
  }
}

const healthQuestions = [
  'Apakah Anda pernah didiagnosis memiliki penyakit jantung, tekanan darah tinggi, atau gangguan kardiovaskular lainnya?',
  'Apakah Anda pernah mengalami cedera serius pada tulang, otot, atau sendi dalam 12 bulan terakhir?',
  'Apakah Anda sedang dalam masa pemulihan pasca operasi?',
  'Apakah Anda memiliki riwayat asma atau gangguan pernapasan?',
  'Apakah Anda sedang mengonsumsi obat-obatan yang dapat mempengaruhi kemampuan fisik Anda?',
  'Apakah Anda memiliki alergi terhadap bahan latex, karet, atau bahan gym lainnya?',
  'Apakah Anda sedang hamil atau menyusui?',
  'Apakah Anda pernah mengalami pingsan atau pusing saat berolahraga?',
]

const healthAnswers = ref<boolean[]>(Array.from({ length: healthQuestions.length }, () => false))
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    header="Syarat & Ketentuan Kesehatan"
    :style="{ width: '650px' }"
    :breakpoints="{ '768px': '95vw' }"
    class="health-policy-modal"
    :closable="true"
  >
    <div class="space-y-6">
      <!-- Introduction -->
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <i class="pi pi-info-circle text-blue-400 mt-0.5 shrink-0 text-lg"></i>
          <div>
            <p class="font-medium text-blue-300 mb-1">Penting untuk Kesehatan Anda</p>
            <p class="text-sm text-blue-200">
              Demi keselamatan Anda, harap isi formulir riwayat kesehatan berikut dengan jujur. Data ini bersifat rahasia dan hanya digunakan untuk memastikan program latihan yang aman dan sesuai.
            </p>
          </div>
        </div>
      </div>

      <!-- Health History Questions -->
      <div class="space-y-1">
        <h4 class="text-white font-semibold mb-3">Riwayat Kesehatan</h4>
        <div
          v-for="(question, index) in healthQuestions"
          :key="index"
          class="p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors"
        >
          <div class="flex items-start gap-3">
            <span class="text-xs font-bold text-(--primary) mt-1 shrink-0">{{ index + 1 }}.</span>
            <div class="flex-1">
              <p class="text-sm text-(--text-secondary) mb-2">{{ question }}</p>
              <div class="flex items-center gap-6">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    :name="'health-' + index"
                    :value="true"
                    v-model="healthAnswers[index]"
                    class="accent-red-500"
                  />
                  <span class="text-sm text-white">Ya</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    :name="'health-' + index"
                    :value="false"
                    v-model="healthAnswers[index]"
                    class="accent-green-500"
                  />
                  <span class="text-sm text-white">Tidak</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Warning for positive answers -->
      <div
        v-if="healthAnswers.some((a) => a === true)"
        class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4"
      >
        <div class="flex items-start gap-2">
          <i class="pi pi-exclamation-triangle text-amber-400 mt-0.5 shrink-0"></i>
          <p class="text-sm text-amber-200">
            Anda menjawab "Ya" pada satu atau lebih pertanyaan. Kami menyarankan Anda untuk berkonsultasi dengan dokter sebelum memulai program latihan. Staf kami akan membantu menyesuaikan program latihan Anda.
          </p>
        </div>
      </div>

      <!-- Terms & Conditions Text -->
      <div class="space-y-3">
        <h4 class="text-white font-semibold">Persetujuan</h4>

        <div class="max-h-40 overflow-y-auto p-4 rounded-lg bg-white/5 border border-white/10 text-sm text-(--text-secondary) leading-relaxed">
          <p class="mb-2"><strong class="text-white">1. Tanggung Jawab Kesehatan</strong></p>
          <p class="mb-3">Saya menyatakan bahwa informasi kesehatan yang saya berikan di atas adalah benar dan akurat. Saya memahami bahwa Arletta Gym tidak bertanggung jawab atas cedera atau kondisi kesehatan yang timbul akibat informasi yang tidak akurat.</p>

          <p class="mb-2"><strong class="text-white">2. Asumsi Risiko</strong></p>
          <p class="mb-3">Saya memahami bahwa aktivitas fisik dan olahraga mengandung risiko cedera. Saya secara sukarela memilih untuk berpartisipasi dan menerima semua risiko yang terkait.</p>

          <p class="mb-2"><strong class="text-white">3. Peraturan Gym</strong></p>
          <p class="mb-3">Saya setuju untuk mematuhi seluruh peraturan dan kebijakan Arletta Gym, termasuk penggunaan peralatan dengan benar, menjaga kebersihan, dan menghormati sesama member.</p>

          <p class="mb-2"><strong class="text-white">4. Privasi Data</strong></p>
          <p>Data kesehatan dan pribadi saya akan dijaga kerahasiaannya dan hanya digunakan untuk keperluan manajemen keanggotaan dan keselamatan latihan.</p>
        </div>
      </div>

      <!-- Checkboxes -->
      <div class="space-y-3">
        <label class="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
          <Checkbox v-model="acceptedHealth" :binary="true" class="mt-0.5" />
          <span class="text-sm text-(--text-secondary)">
            Saya menyatakan bahwa informasi riwayat kesehatan di atas <strong class="text-white">benar dan akurat</strong>.
          </span>
        </label>

        <label class="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
          <Checkbox v-model="acceptedTerms" :binary="true" class="mt-0.5" />
          <span class="text-sm text-(--text-secondary)">
            Saya telah membaca dan <strong class="text-white">menyetujui syarat & ketentuan</strong> keanggotaan Arletta Gym.
          </span>
        </label>

        <label class="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
          <Checkbox v-model="acceptedRisk" :binary="true" class="mt-0.5" />
          <span class="text-sm text-(--text-secondary)">
            Saya memahami dan <strong class="text-white">menerima risiko</strong> yang terkait dengan aktivitas fisik di gym.
          </span>
        </label>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3 pt-5">
        <Button
          label="Batal"
          severity="secondary"
          outlined
          @click="dialogVisible = false"
        />
        <Button
          label="Setuju & Lanjutkan Pendaftaran"
          icon="pi pi-check"
          :disabled="!allAccepted"
          class="btn"
          @click="handleAccept"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.health-policy-modal :deep(.p-dialog-header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.health-policy-modal :deep(.p-dialog-content) {
  padding-top: 1rem;
  max-height: 70vh;
  overflow-y: auto;
}
</style>
