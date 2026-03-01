<script setup lang="ts">
import { ref } from 'vue'
import PTProfileCard from '@/components/pt/profile/PTProfileCard.vue'
import TodayScheduleCard from '@/components/pt/profile/TodayScheduleCard.vue'
import ClientsCard from '@/components/pt/profile/ClientsCard.vue'

// Mock PT data
const trainer = ref({
  name: 'Alex Johnson',
  email: 'alex@arlettagym.com',
  phone: '+62 812 9876 5432',
  joinedAt: '2023-06-01',
  specialty: 'Strength & Conditioning',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  rating: 4.9,
  totalClients: 48,
  completedSessions: 520,
  memberId: 'MBR-2023-00012',
  membershipType: 'Premium',
})

const todaySchedule = ref([
  {
    id: 1,
    clientName: 'Sarah M.',
    time: '08:00 - 09:00',
    name: 'Strength Training',
    status: 'completed',
    type: 'pt-session',
    date: '2026-01-28',
    location: 'Weight Room',
  },
  {
    id: 2,
    clientName: 'David K.',
    time: '10:00 - 11:00',
    name: 'HIIT',
    status: 'ongoing',
    type: 'pt-session',
    date: '2026-01-28',
    location: 'Studio A',
  },
  {
    id: 3,
    clientName: 'Lisa W.',
    time: '14:00 - 15:00',
    name: 'Functional Training',
    status: 'upcoming',
    type: 'pt-session',
    date: '2026-01-28',
    location: 'Studio B',
  },
  {
    id: 4,
    clientName: 'Mike R.',
    time: '16:00 - 17:00',
    name: 'Strength Training',
    status: 'upcoming',
    type: 'pt-session',
    date: '2026-01-28',
    location: 'Weight Room',
  },
])

const recentClients = ref([
  {
    name: 'Sarah Mitchell',
    sessions: 24,
    progress: 85,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    name: 'David Kim',
    sessions: 18,
    progress: 70,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
  },
  {
    name: 'Lisa Wong',
    sessions: 12,
    progress: 55,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
  },
])
</script>

<template>
  <div class="pt-24 pb-12">
    <div class="container-custom">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="heading-md text-white mb-2">Trainer Dashboard</h1>
        <p class="text-(--text-secondary)">Manage your clients and schedule</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <PTProfileCard :trainer="trainer" />

        <!-- Today's Schedule -->
        <TodayScheduleCard :today-schedule="todaySchedule" />

        <!-- My Clients (spans remaining space) -->
        <ClientsCard :recent-clients="recentClients" />
      </div>
    </div>
  </div>
</template>
