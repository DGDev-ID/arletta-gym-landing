<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import ClientsStatsSection from '@/components/pt/clients/ClientsStatsSection.vue'
import ClientsListSection from '@/components/pt/clients/ClientsListSection.vue'

const router = useRouter()

// Search query
const searchQuery = ref('')

// Mock clients data
const clients = ref([
  {
    id: 1,
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    email: 'john.doe@email.com',
    phone: '+62 812 3456 7890',
    membershipType: 'Premium',
    joinDate: '2025-06-15',
    lastSession: '2026-01-25',
    totalSessions: 48,
    currentGoal: 'Muscle Building',
    progress: 75,
    status: 'active',
    nextSession: '2026-01-28 09:00',
  },
  {
    id: 2,
    name: 'Sarah Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    email: 'sarah.smith@email.com',
    phone: '+62 813 4567 8901',
    membershipType: 'Premium',
    joinDate: '2025-09-01',
    lastSession: '2026-01-24',
    totalSessions: 32,
    currentGoal: 'Post-injury Rehabilitation',
    progress: 60,
    status: 'active',
    nextSession: '2026-01-28 14:00',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MikeJ',
    email: 'mike.j@email.com',
    phone: '+62 814 5678 9012',
    membershipType: 'Standard',
    joinDate: '2026-01-10',
    lastSession: '2026-01-23',
    totalSessions: 4,
    currentGoal: 'Weight Loss',
    progress: 15,
    status: 'active',
    nextSession: '2026-01-29 16:00',
  },
  {
    id: 4,
    name: 'Emily Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    email: 'emily.b@email.com',
    phone: '+62 815 6789 0123',
    membershipType: 'Premium',
    joinDate: '2025-11-20',
    lastSession: '2026-01-22',
    totalSessions: 24,
    currentGoal: 'Weight Loss Program',
    progress: 45,
    status: 'active',
    nextSession: '2026-01-30 09:00',
  },
  {
    id: 5,
    name: 'David Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    email: 'david.chen@email.com',
    phone: '+62 816 7890 1234',
    membershipType: 'Premium',
    joinDate: '2025-03-10',
    lastSession: '2026-01-20',
    totalSessions: 86,
    currentGoal: 'Athletic Performance',
    progress: 90,
    status: 'active',
    nextSession: null,
  },
  {
    id: 6,
    name: 'Lisa Park',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LisaP',
    email: 'lisa.park@email.com',
    phone: '+62 817 8901 2345',
    membershipType: 'Standard',
    joinDate: '2025-08-05',
    lastSession: '2025-12-15',
    totalSessions: 16,
    currentGoal: 'General Fitness',
    progress: 30,
    status: 'inactive',
    nextSession: null,
  },
])

const filteredClients = computed(() => {
  if (!searchQuery.value) return clients.value
  const query = searchQuery.value.toLowerCase()
  return clients.value.filter(
    (client) =>
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.currentGoal.toLowerCase().includes(query),
  )
})

const activeClients = computed(() => clients.value.filter((c) => c.status === 'active').length)
const inactiveClients = computed(() => clients.value.filter((c) => c.status === 'inactive').length)
const totalSessions = computed(() => clients.value.reduce((sum, c) => sum + c.totalSessions, 0))

const avgProgress = computed(() => {
  if (clients.value.length === 0) return 0
  const total = clients.value.reduce((sum, c) => sum + c.progress, 0)
  return Math.round(total / clients.value.length)
})

const newClientsThisMonth = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  return clients.value.filter((c) => {
    const joinDate = new Date(c.joinDate)
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear
  }).length
})

const viewClientDetails = (clientId: number) => {
  // In real app, navigate to client detail page
  router.push(`/pt/clients/${clientId}`)
}
</script>

<template>
  <div class="pt-24 pb-12 min-h-screen">
    <div class="container-custom">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 class="heading-md text-white mb-2">My Clients</h1>
          <p class="text-(--text-secondary)">Manage your personal training clients</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <ClientsStatsSection
        :active-clients="activeClients"
        :total-sessions="totalSessions"
        :avg-progress="avgProgress"
        :new-clients-this-month="newClientsThisMonth"
      />

      <!-- Search -->
      <div class="mb-6">
        <div class="relative max-w-md">
          <i
            class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
          ></i>
          <InputText
            v-model="searchQuery"
            placeholder="Search clients..."
            class="w-full bg-white/5 border border-white/10 text-white rounded-lg py-2.5 pr-4 focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
            :style="{ paddingLeft: '2.5rem' }"
          />
        </div>
      </div>

      <!-- Clients List -->
      <ClientsListSection :clients="filteredClients" @view-profile="viewClientDetails" />
    </div>
  </div>
</template>
