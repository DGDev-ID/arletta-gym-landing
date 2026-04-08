<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import ClientsStatsSection from '@/components/pt/clients/ClientsStatsSection.vue'
import ClientsListSection from '@/components/pt/clients/ClientsListSection.vue'
import { getTrainerMe, getTrainerClients, getTrainerClientsAll } from '@/services/trainerService'

interface ClientLocal {
  id: number
  name: string
  avatar: string
  email: string
  phone: string
  membershipType: string
  joinDate: string
  lastSession: string
  totalSessions: number
  currentGoal: string
  progress: number
  status: string
  nextSession: string | null
}

const router = useRouter()

// Search query
const searchQuery = ref('')

// Active tab: 'my-clients' or 'all-members'
const activeClientTab = ref<'my-clients' | 'all-members'>('my-clients')

// PT's clients (fetched from API)
const clients = ref<ClientLocal[]>([])
const clientsLoading = ref(false)

const filteredClients = computed(() => {
  if (activeClientTab.value === 'my-clients') {
    const source = clients.value
    if (!searchQuery.value) return source
    const query = searchQuery.value.toLowerCase()
    return source.filter((client) =>
      String(client.name).toLowerCase().includes(query) ||
      String(client.email).toLowerCase().includes(query) ||
      String(client.currentGoal).toLowerCase().includes(query),
    )
  }

  // all-members tab: map mock members into ClientLocal shape
  const mapped = allMembers.value.map((m: Record<string, unknown>) => ({
    id: Number(m.id ?? 0),
    name: String(m.name ?? 'Unknown'),
    avatar: String(m.avatar ?? ''),
    email: String(m.email ?? ''),
    phone: String(m.phone ?? ''),
    membershipType: String(m.membershipType ?? ''),
    joinDate: String(m.joinDate ?? ''),
    lastSession: String(m.lastSession ?? ''),
    totalSessions: Number(m.totalSessions ?? 0),
    currentGoal: String(m.currentGoal ?? ''),
    progress: Number(m.progress ?? 0),
    status: String(m.status ?? 'active'),
  nextSession: (m['nextSession'] as string) ?? null,
  })) as ClientLocal[]

  if (!searchQuery.value) return mapped
  const query = searchQuery.value.toLowerCase()
  return mapped.filter((client) =>
    String(client.name).toLowerCase().includes(query) ||
    String(client.email).toLowerCase().includes(query) ||
    String(client.currentGoal).toLowerCase().includes(query),
  )
})

// All gym members (not tied to this PT's class/program) - fetched from server
const allMembers = ref<ClientLocal[]>([])
const allMembersLoading = ref(false)

const activeClients = computed(() => clients.value.filter((c) => c.status === 'active').length)
// inactiveClients count is not used in the UI; remove to avoid unused-variable errors
const totalSessions = computed(() => clients.value.reduce((sum, c) => sum + (c.totalSessions || 0), 0))

const avgProgress = computed(() => {
  if (clients.value.length === 0) return 0
  const total = clients.value.reduce((sum, c) => sum + (c.progress || 0), 0)
  return Math.round(total / clients.value.length)
})

const newClientsThisMonth = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  return clients.value.filter((c) => {
    const joinDate = new Date(String(c.joinDate))
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear
  }).length
})

const viewClientDetails = (clientId: number) => {
  // In real app, navigate to client detail page
  router.push(`/pt/clients/${clientId}`)
}

onMounted(async () => {
  // Fetch trainer id (current PT) and their clients; also fetch all members
  try {
    clientsLoading.value = true
    allMembersLoading.value = true

    const trainerData = await getTrainerMe() as unknown as Record<string, unknown>
    const trainerObj = (trainerData?.['trainer'] ?? trainerData) as Record<string, unknown>
    const idVal = (trainerObj?.['id'] ?? trainerData?.['id'] ?? trainerData?.['trainer_id']) as string | number | undefined
    if (idVal !== undefined && idVal !== null) {
      const list = await getTrainerClients(idVal)
      clients.value = (list || []).map((c: Record<string, unknown>) => ({
        id: Number(c.id ?? c.client_id ?? 0),
        name: String(c.name ?? c.full_name ?? 'Unknown'),
        avatar: String(c.avatar ?? c.photo ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(c.name ?? 'client'))}`),
        email: String(c.email ?? c.contact_email ?? ''),
        phone: String(c.phone ?? c.contact_phone ?? ''),
        membershipType: String(c.membership_type ?? c.membershipType ?? 'Standard'),
        joinDate: String(c.join_date ?? c.joined_at ?? ''),
        lastSession: String(c.last_session ?? c.last_session_at ?? ''),
        totalSessions: Number(c.total_sessions ?? c.sessions_count ?? 0),
        currentGoal: String(c.current_goal ?? c.goal ?? ''),
        progress: Number(c.progress ?? c.completion ?? 0),
        status: String(c.status ?? ((c.active as unknown) ? 'active' : 'inactive')),
        nextSession: (c.next_session ?? c.upcoming_session ?? null) as string | null,
      }))
    }

    // Fetch the 'all members' list from server endpoint
    try {
      const all = await getTrainerClientsAll()
      allMembers.value = (all || []).map((c: Record<string, unknown>) => ({
        id: Number(c.id ?? c.member_id ?? 0),
        name: String(c.name ?? c.full_name ?? 'Unknown'),
        avatar: String(c.avatar ?? c.photo ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(c.name ?? 'member'))}`),
        email: String(c.email ?? c.contact_email ?? ''),
        phone: String(c.phone_number ?? c.phone ?? c.contact_phone ?? ''),
        membershipType: String(c.membership_type ?? c.membershipType ?? 'Standard'),
        joinDate: String(c.join_date ?? c.joined_at ?? ''),
        lastSession: String(c.last_session ?? c.last_session_at ?? ''),
        totalSessions: Number(c.total_sessions ?? c.sessions_count ?? 0),
        currentGoal: String(c.current_goal ?? c.goal ?? ''),
        progress: Number(c.progress ?? c.completion ?? 0),
        status: String(c.status ?? ((c.active as unknown) ? 'active' : 'inactive')),
        nextSession: (c.next_session ?? c.upcoming_session ?? null) as string | null,
      }))
    } catch (err) {
      console.error('Failed to load all members', err)
    }
  } catch (err) {
    // swallow for now; UI will show empty state. Could add toast later.
    console.error('Failed to load PT clients', err)
  } finally {
    clientsLoading.value = false
    allMembersLoading.value = false
  }
})
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
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all',
            activeClientTab === 'my-clients'
              ? 'bg-white/10 text-white border-b-2 border-(--primary)'
              : 'text-(--text-muted) hover:text-white hover:bg-white/5',
          ]"
          @click="activeClientTab = 'my-clients'"
        >
          <i class="pi pi-users"></i>
          <span>My Clients</span>
          <span class="px-2 py-0.5 bg-(--primary) text-white text-xs rounded-full">{{
            clients.length
          }}</span>
        </button>
        <button
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all',
            activeClientTab === 'all-members'
              ? 'bg-white/10 text-white border-b-2 border-(--primary)'
              : 'text-(--text-muted) hover:text-white hover:bg-white/5',
          ]"
          @click="activeClientTab = 'all-members'"
        >
          <i class="pi pi-globe"></i>
          <span>Semua Member</span>
          <span class="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">{{
            allMembers.length
          }}</span>
        </button>
      </div>

      <!-- Info banner for All Members tab -->
      <div
        v-if="activeClientTab === 'all-members'"
        class="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
      >
        <div class="flex items-start gap-3">
          <i class="pi pi-info-circle text-blue-400 mt-0.5 shrink-0"></i>
          <p class="text-sm text-blue-200">
            Daftar semua member gym yang <strong class="text-white">tidak terikat</strong> dengan
            program class Anda. Anda dapat menghubungi mereka untuk menawarkan sesi personal
            training.
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
            :placeholder="
              activeClientTab === 'my-clients' ? 'Search clients...' : 'Search all members...'
            "
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
