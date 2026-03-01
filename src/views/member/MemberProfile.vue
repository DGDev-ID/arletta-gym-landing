<script setup lang="ts">
import { ref } from 'vue'
import ProfileCard from '@/components/member/profile/ProfileCard.vue'
import MembershipCard from '@/components/member/profile/MembershipCard.vue'
import ScheduleCard from '@/components/member/profile/ScheduleCard.vue'

// Mock member data
const member = ref({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+62 812 3456 7890',
  memberSince: '2024-01-15',
  membershipType: 'Premium',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  memberId: 'MBR-2024-00001',
})

const membershipStatus = ref({
  status: 'Active',
  expiresAt: '2026-02-15',
  daysRemaining: 20,
  startDate: '2025-02-15',
  duration: '12 Bulan',
})

const upcomingClasses = ref([
  {
    id: 1,
    name: 'Strength Training',
    time: '09:00 AM',
    trainer: 'Alex Johnson',
    date: '2026-01-29',
    status: 'confirmed',
    type: 'class',
  },
  {
    id: 2,
    name: 'Yoga Flow',
    time: '06:00 PM',
    trainer: 'Sarah Williams',
    date: '2026-01-29',
    status: 'confirmed',
    type: 'class',
  },
  {
    id: 3,
    name: 'CrossFit',
    time: '10:00 AM',
    trainer: 'Mike Chen',
    date: '2026-01-30',
    status: 'confirmed',
    type: 'class',
  },
])
</script>

<template>
  <div class="pt-24 pb-12">
    <div class="container-custom">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="heading-md text-white mb-2">My Profile</h1>
        <p class="text-(--text-secondary)">Manage your account and view your fitness journey</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
