<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import Skeleton from 'primevue/skeleton'
import { useToast } from 'primevue/usetoast'
import authState from '@/stores/auth'
import ParticleBackground from '@/components/common/ParticleBackground.vue'
import PricingCard from '@/components/landing/membership/PricingCard.vue'
import SignatureVerificationModal from '@/components/booking/SignatureVerificationModal.vue'
import { getMemberships } from '@/services/membershipService'
import { getGyms, type Gym } from '@/services/gymService'
import { createSignature, createPayment } from '@/services/paymentService'

interface ProcessedPlan {
  id: number | string | undefined
  name: string
  price: number | string | undefined
  period: string | null
  description: string
  promo: string
  promos: unknown[]
  features: string[]
}

const membershipPlans = ref<ProcessedPlan[]>([])
const membershipLoading = ref(true)

// Gym filter
const gyms = ref<Gym[]>([])
const selectedGymId = ref<number | null>(null)
const gymsLoading = ref(false)

const defaultFeatures = [
  'Unlimited gym access',
  'All fitness classes included',
  'Private locker',
  'Towel service',
  'Air-conditioned workout rooms',
  'Professional personal trainers',
  'Free WiFi',
  'Hot water / water heaters',
]

// Static pre-sale overlays for certain plans (months-based, with period-string fallback)
const staticPresaleByMonths: Record<number, { promo?: string; description?: string }> = {
  24: {
    promo: 'Free 5 months (pre-sale)',
    description: 'Twenty-four month payment — equivalent to 200k/month.',
  },
  18: {
    promo: 'Free 4 months (pre-sale)',
    description: 'Eighteen-month payment — equivalent to 220k/month.',
  },
  12: {
    promo: 'Free 3 months (pre-sale)',
    description: 'Annual payment — equivalent to 240k/month.',
  },
  6: {
    promo: 'Free 2 months (pre-sale)',
    description: 'Six-month payment — equivalent to 260k/month.',
  },
  3: {
    promo: 'Free 1 month (pre-sale)',
    description: 'Three-month payment — equivalent to 280k/month.',
  },
  1: { promo: '', description: 'One month membership. Full access to facilities and all classes.' },
}

const staticPresale: Record<string, { promo?: string; description?: string } | undefined> = {
  '24 months': staticPresaleByMonths[24],
  '18 months': staticPresaleByMonths[18],
  '12 months': staticPresaleByMonths[12],
  '6 months': staticPresaleByMonths[6],
  '3 months': staticPresaleByMonths[3],
  '1 month': staticPresaleByMonths[1],
}

const loadMemberships = async () => {
  try {
    membershipLoading.value = true
    membershipPlans.value = []
    const params: Record<string, unknown> = {}
    if (selectedGymId.value) params.gym_id = selectedGymId.value
    const plans = await getMemberships(params)
    membershipPlans.value = plans.map((p: unknown) => {
      const planRaw = p as Record<string, unknown>
      const rawPromos =
        (planRaw['active_promos'] as unknown) ||
        (planRaw['membershipPromos'] as unknown) ||
        (planRaw['membership_promos'] as unknown) ||
        (planRaw['promos'] as unknown) ||
        []
      const promos = (Array.isArray(rawPromos) ? rawPromos : []).map((pr: unknown) => {
        const promoObj = pr as Record<string, unknown>
        const pivot = (promoObj['pivot'] as Record<string, unknown> | undefined) ?? undefined
        const type =
          (promoObj['type'] as string | undefined) ?? (pivot && (pivot['type'] as string)) ?? null
        const value =
          (promoObj['value'] as unknown) ?? (pivot && pivot['value']) ?? promoObj['amount'] ?? null
        let label = ''
        if (type === 'percent') label = `${value}% off`
        else if (type === 'fixed')
          label = `Rp ${new Intl.NumberFormat('id-ID').format(value as number)}`
        else label = String(value ?? '')
        return { ...(promoObj as object), type, value, label }
      })

      if (!promos.length && rawPromos && Object.keys(rawPromos).length) {
        console.debug(
          'Unexpected promos shape for plan',
          (planRaw as Record<string, unknown>)['id'],
          rawPromos,
        )
      }

      const promoLabel = promos.length
        ? ((promos[0] as Record<string, unknown>)['label'] ?? '')
        : ''

      const period = (planRaw['duration_in_days'] as number | undefined)
        ? (planRaw['duration_in_days'] as number) % 30 === 0
          ? `${(planRaw['duration_in_days'] as number) / 30} month${(planRaw['duration_in_days'] as number) / 30 > 1 ? 's' : ''}`
          : `${planRaw['duration_in_days']} days`
        : null

      const durationDays = planRaw['duration_in_days'] as number | undefined
      const months = typeof durationDays === 'number' ? Math.round(durationDays / 30) : null
      const overlay =
        months && staticPresaleByMonths[months]
          ? staticPresaleByMonths[months]
          : typeof period === 'string'
            ? staticPresale[period]
            : undefined

      return {
        id: planRaw['id'] as number | string | undefined,
        name: String(planRaw['name'] ?? ''),
        price: planRaw['price'] as number | string | undefined,
        period: period,
        description: String(
          planRaw['description'] ?? overlay?.description ?? 'Paket keanggotaan premium',
        ),
        promo: String(overlay?.promo ?? promoLabel ?? ''),
        promos: promos as unknown[],
        features: defaultFeatures,
      }
    })
  } catch (err) {
    console.warn('Failed to load memberships', err)
  } finally {
    membershipLoading.value = false
  }
}

onMounted(async () => {
  // Load gyms for dropdown filter
  gymsLoading.value = true
  try {
    gyms.value = await getGyms()
    // Auto-select first gym
    if (gyms.value.length > 0) {
      selectedGymId.value = gyms.value[0]?.id ?? null
    }
  } catch (err) {
    console.warn('Failed to load gyms', err)
  } finally {
    gymsLoading.value = false
  }
  // Load memberships for the selected gym (or all if no gym selected)
  await loadMemberships()
})

// Reload memberships when gym changes
watch(selectedGymId, () => {
  loadMemberships()
})

const router = useRouter()
const toast = useToast()
const showPaymentModal = ref(false)
const showSignatureModal = ref(false)
const selectedPlan = ref<ProcessedPlan | null>(null)
let createdSignatureId: number | null = null

const goToSignUp = (plan?: ProcessedPlan) => {
  if (plan) selectedPlan.value = plan
  if (authState.isLoggedIn) {
    showSignatureModal.value = true
    return
  }
  router.push('/signup')
}

const onSignatureConfirmed = async (signatureData?: string) => {
  try {
    if (!signatureData) throw new Error('Signature missing')
    const payloadSig: { signature_data: string; membership_plan_id?: number | string } = {
      signature_data: signatureData,
    }
    if (selectedPlan.value && selectedPlan.value.id)
      payloadSig.membership_plan_id = selectedPlan.value.id as number | string
    const resp = await createSignature(
      payloadSig as unknown as { signature_data: string; membership_plan_id?: number },
    )
    createdSignatureId = resp?.id ?? null
    toast.add({
      severity: 'success',
      summary: 'Signature saved',
      detail: 'Signature verified successfully.',
      life: 3000,
    })
    showSignatureModal.value = false
    showPaymentModal.value = true
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    toast.add({ severity: 'error', summary: 'Signature failed', detail: message, life: 5000 })
  }
}

const proceedToPayment = async (method: 'va' | 'qris') => {
  try {
    if (!selectedPlan.value || !selectedPlan.value.id) {
      throw new Error('No membership plan selected')
    }
    if (!selectedGymId.value) {
      throw new Error('Please select a gym branch first')
    }

    toast.add({
      severity: 'info',
      summary: 'Creating payment',
      detail: 'Processing your payment...',
      life: 3000,
    })

    const payloadPayment: Record<string, unknown> = {
      gym_id: Number(selectedGymId.value),
      transaction_type: 'membership',
      type_id: Number(selectedPlan.value.id),
      payment_method: method,
    }
    if (createdSignatureId) payloadPayment.signature_data = undefined
    const resp = await createPayment(
      payloadPayment as unknown as {
        membership_plan_id?: number
        method?: string
        amount?: number
        signature_id?: number
      },
    )
    if (resp.payment_url) {
      window.open(resp.payment_url, '_blank')
    } else if ((resp as Record<string, unknown>).snap_token) {
      const snapToken = (resp as Record<string, unknown>).snap_token as string
      window.open(`https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`, '_blank')
    } else if (resp.token) {
      window.open(`https://app.sandbox.midtrans.com/snap/v2/vtweb/${resp.token}`, '_blank')
    } else {
      toast.add({
        severity: 'success',
        summary: 'Payment created',
        detail: 'Transaction has been created successfully.',
        life: 3000,
      })
    }
    showPaymentModal.value = false
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    toast.add({
      severity: 'error',
      summary: 'Payment creation failed',
      detail: message,
      life: 5000,
    })
  }
}
</script>

<template>
  <section id="membership" class="section-padding bg-(--bg-dark) relative overflow-hidden">
    <ParticleBackground />

    <div class="container-custom relative z-10">
      <div
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="text-center mb-12"
      >
        <h2 class="heading-lg text-white mb-4">
          Jadilah <span class="text-gradient">Member</span>
        </h2>
        <p class="text-(--text-secondary) max-w-xl mx-auto">
          Satu keanggotaan, kemungkinan tak terbatas. Dapatkan akses penuh ke semua yang kami
          tawarkan.
        </p>
      </div>

      <!-- Gym Branch Filter -->
      <div class="flex justify-center mb-8">
        <div class="w-full max-w-xs">
          <Select
            v-model="selectedGymId"
            :options="gyms"
            optionLabel="name"
            optionValue="id"
            placeholder="Select Gym Branch"
            :loading="gymsLoading"
            class="w-full"
          />
          <p class="text-xs text-(--text-muted) mt-2 text-center">
            Pastikan pilih cabang yang diinginkan sebelum membeli
          </p>
        </div>
      </div>

      <!-- On mobile: stretch to section edges. On md+: normal grid -->
      <div class="-mx-10 sm:mx-0 px-4 sm:px-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <!-- Skeleton loading -->
        <template v-if="membershipLoading">
          <div
            v-for="i in 3"
            :key="i"
            class="glass-card p-6 md:p-8 rounded-2xl border-2 border-white/10 flex flex-col gap-6"
          >
            <div class="text-center space-y-3">
              <Skeleton width="60%" height="1.75rem" class="mx-auto" />
              <Skeleton width="80%" height="0.875rem" class="mx-auto" />
              <Skeleton width="50%" height="2.25rem" class="mx-auto mt-4" />
            </div>
            <div class="space-y-3">
              <div v-for="j in 5" :key="j" class="flex items-center gap-3">
                <Skeleton shape="circle" size="1.25rem" />
                <Skeleton width="75%" height="0.875rem" />
              </div>
            </div>
            <Skeleton width="100%" height="2.75rem" borderRadius="8px" class="mt-auto" />
          </div>
        </template>
        <PricingCard
          v-else
          v-for="plan in membershipPlans"
          :key="plan.name"
          :plan="plan"
          :show-cta="false"
          @signup="goToSignUp"
        />
      </div>
    </div>

    <!-- Payment modal -->
    <Dialog
      :visible="showPaymentModal"
      @update:visible="(v) => (showPaymentModal = v)"
      header="Pilih Metode Pembayaran"
      :modal="true"
      class="w-full max-w-md"
    >
      <div class="space-y-4 p-4">
        <p class="text-(--text-secondary)">
          Pilih metode pembayaran untuk menyelesaikan pembelian keanggotaan Anda.
        </p>
        <div class="grid grid-cols-1 gap-3">
          <Button
            label="Virtual Account (Transfer Bank)"
            icon="pi pi-building"
            class="btn"
            @click="proceedToPayment('va')"
          />
          <Button label="QRIS" icon="pi pi-qrcode" class="btn" @click="proceedToPayment('qris')" />
          <Button
            label="Batal"
            class="p-button-text text-(--text-secondary)"
            @click="showPaymentModal = false"
          />
        </div>
      </div>
    </Dialog>

    <!-- Signature Verification Modal -->
    <SignatureVerificationModal
      :visible="showSignatureModal"
      @update:visible="(v) => (showSignatureModal = v)"
      :member-name="authState.user?.name"
      :membership-plan="selectedPlan ? selectedPlan.name : 'Premium Membership'"
      @confirmed="onSignatureConfirmed"
    />
  </section>
</template>
