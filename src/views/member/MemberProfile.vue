<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProfileCard from '@/components/member/profile/ProfileCard.vue'
import MembershipCard from '@/components/member/profile/MembershipCard.vue'
import ScheduleCard from '@/components/member/profile/ScheduleCard.vue'
import { getProfile, getBookings } from '@/services/userService'

const isLoading = ref(true)
const error = ref<string | null>(null)

const member = ref({
  name: '',
  email: '',
  phone: '',
  memberSince: '',
  membershipType: '-',
  avatar: '',
  memberId: '',
})

const membershipStatus = ref({
  status: 'Inactive',
  expiresAt: '',
  daysRemaining: 0,
  startDate: '',
  duration: '',
})

const upcomingClasses = ref<any[]>([])

onMounted(async () => {
  try {
    const [profile, bookings] = await Promise.all([
      getProfile(),
      getBookings('confirmed'),
    ])

    // --- Member info ---
    member.value = {
      name: profile.name ?? '',
      email: profile.email ?? '',
      phone: profile.phone_number ?? '-',
      memberSince: profile.created_at ?? '',
      membershipType: profile.membership?.is_active ? 'Aktif' : 'Tidak Aktif',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name)}`,
      memberId: profile.unique_id ?? profile.id,
    }

    // --- Membership status ---
    const mem = profile.membership
    if (mem) {
      const endDate = mem.membership_end_at ? new Date(mem.membership_end_at) : null
      const daysLeft = endDate ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000)) : 0

      membershipStatus.value = {
        status: mem.is_active ? 'Active' : 'Expired',
        expiresAt: mem.membership_end_at ?? '',
        daysRemaining: daysLeft,
        startDate: profile.qr_data?.start_date ?? '',
        duration: profile.qr_data?.duration ?? '',
      }
    }

    // --- Upcoming classes ---
    upcomingClasses.value = bookings.map((b: any) => ({
      id: b.id,
      name: b.schedule?.class_name ?? 'Kelas',
      time: b.schedule?.start_time ?? '',
      trainer: b.schedule?.trainer_name ?? '-',
      date: b.schedule?.date ?? '',
      status: b.status,
      type: b.booking_type ?? 'class',
    }))
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? 'Gagal memuat data profil.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="pt-24 pb-12">
    <div class="container-custom">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="heading-md text-white mb-2">My Profile</h1>
        <p class="text-(--text-secondary)">Manage your account and view your fitness journey</p>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <i class="pi pi-spin pi-spinner text-(--primary) text-4xl"></i>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="glass-card p-6 text-center text-red-400"
      >
        <i class="pi pi-exclamation-triangle text-2xl mb-2 block"></i>
        <p>{{ error }}</p>
      </div>

      <!-- Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <ProfileCard :member="member" />

        <!-- Membership Status -->
        <MembershipCard :member="member" :membership-status="membershipStatus" />

        <!-- Upcoming Classes -->
        <ScheduleCard :upcoming-classes="upcomingClasses" />
      </div>
    </div>
  </div>
</template>
