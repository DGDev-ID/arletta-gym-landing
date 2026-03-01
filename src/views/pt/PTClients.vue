<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import ClientsStatsSection from '@/components/pt/clients/ClientsStatsSection.vue'
import ClientsListSection from '@/components/pt/clients/ClientsListSection.vue'

const router = useRouter()

// Search query
const searchQuery = ref('')

// Active tab: 'my-clients' or 'all-members'
const activeClientTab = ref<'my-clients' | 'all-members'>('my-clients')

// Mock clients data (PT's own clients)
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
  const source = activeClientTab.value === 'my-clients' ? clients.value : allMembers.value
  if (!searchQuery.value) return source
  const query = searchQuery.value.toLowerCase()
  return source.filter(
    (client) =>
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.currentGoal.toLowerCase().includes(query),
  )
})

// All gym members (not tied to this PT's class/program)
const allMembers = ref([
  {
    id: 101,
    name: 'Amanda Putri',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda',
    email: 'amanda.putri@email.com',
    phone: '+62 818 1234 5678',
    membershipType: 'Premium',
    joinDate: '2025-04-10',
    lastSession: '2026-02-20',
    totalSessions: 0,
    currentGoal: 'Weight Loss',
    progress: 0,
    status: 'active',
    nextSession: null,
  },
  {
    id: 102,
    name: 'Budi Santoso',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
    email: 'budi.s@email.com',
    phone: '+62 819 2345 6789',
    membershipType: 'Standard',
    joinDate: '2025-07-15',
    lastSession: '2026-02-18',
    totalSessions: 0,
    currentGoal: 'General Fitness',
    progress: 0,
    status: 'active',
    nextSession: null,
  },
  {
    id: 103,
    name: 'Citra Dewi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Citra',
    email: 'citra.dewi@email.com',
    phone: '+62 820 3456 7890',
    membershipType: 'Premium',
    joinDate: '2025-09-01',
    lastSession: '2026-02-22',
    totalSessions: 0,
    currentGoal: 'Muscle Toning',
    progress: 0,
    status: 'active',
    nextSession: null,
  },
  {
    id: 104,
    name: 'Dimas Pratama',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dimas',
    email: 'dimas.p@email.com',
    phone: '+62 821 4567 8901',
    membershipType: 'Standard',
    joinDate: '2026-01-05',
    lastSession: '2026-02-15',
    totalSessions: 0,
    currentGoal: 'Bodybuilding',
    progress: 0,
    status: 'active',
    nextSession: null,
  },
  {
    id: 105,
    name: 'Ella Rahayu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ella',
    email: 'ella.r@email.com',
    phone: '+62 822 5678 9012',
    membershipType: 'Premium',
    joinDate: '2025-11-20',
    lastSession: '2026-01-10',
    totalSessions: 0,
    currentGoal: 'Cardio Endurance',
    progress: 0,
    status: 'inactive',
    nextSession: null,
  },
  {
    id: 106,
    name: 'Fajar Hidayat',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fajar',
    email: 'fajar.h@email.com',
    phone: '+62 823 6789 0123',
    membershipType: 'Premium',
    joinDate: '2025-06-12',
    lastSession: '2026-02-25',
    totalSessions: 0,
    currentGoal: 'Flexibility',
    progress: 0,
    status: 'active',
    nextSession: null,
  },
  {
    id: 107,
    name: 'Gita Puspita',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gita',
    email: 'gita.p@email.com',
    phone: '+62 824 7890 1234',
    membershipType: 'Standard',
    joinDate: '2026-02-01',
    lastSession: null,
    totalSessions: 0,
    currentGoal: 'New Member',
    progress: 0,
    status: 'active',
    nextSession: null,
  },
])

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

      <!-- Tab Navigation: My Clients / All Members -->
      <div class="flex gap-1 mb-6 border-b border-white/10 pb-1">
        <button
          :class="['flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all',
            activeClientTab === 'my-clients' ? 'bg-white/10 text-white border-b-2 border-(--primary)' : 'text-(--text-muted) hover:text-white hover:bg-white/5']"
          @click="activeClientTab = 'my-clients'"
        >
          <i class="pi pi-users"></i>
          <span>My Clients</span>
          <span class="px-2 py-0.5 bg-(--primary) text-white text-xs rounded-full">{{ clients.length }}</span>
        </button>
        <button
          :class="['flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all',
            activeClientTab === 'all-members' ? 'bg-white/10 text-white border-b-2 border-(--primary)' : 'text-(--text-muted) hover:text-white hover:bg-white/5']"
          @click="activeClientTab = 'all-members'"
        >
          <i class="pi pi-globe"></i>
          <span>Semua Member</span>
          <span class="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">{{ allMembers.length }}</span>
        </button>
      </div>

      <!-- Info banner for All Members tab -->
      <div v-if="activeClientTab === 'all-members'" class="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <i class="pi pi-info-circle text-blue-400 mt-0.5 shrink-0"></i>
          <p class="text-sm text-blue-200">
            Daftar semua member gym yang <strong class="text-white">tidak terikat</strong> dengan program class Anda. Anda dapat menghubungi mereka untuk menawarkan sesi personal training.
          </p>
        </div>
      </div>

      <!-- Search -->
      <div class="mb-6">
        <div class="relative max-w-md">
          <i
            class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
          ></i>
          <InputText
            v-model="searchQuery"
            :placeholder="activeClientTab === 'my-clients' ? 'Search clients...' : 'Search all members...'"
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
