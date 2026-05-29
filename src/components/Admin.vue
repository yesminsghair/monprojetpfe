<template>
  <AppShell
    :nav-items="navItems"
    role-label="Administrateur"
    breadcrumb-root="Administration"
    :breadcrumb="breadcrumbLabel"
    :current-page="currentPage"
    :current-user="currentUser"
    @navigate="navigate"
    @logout="logout"
  >
    <!-- Topbar actions: Notifications + Messagerie -->
    <template #topbar-actions>
      <!-- Messagerie button -->
      <button
        class="topbar-action-btn"
        :class="{ 'topbar-action-btn--active': currentPage === 'messagerie' }"
        @click="navigate('messagerie')"
        title="Messagerie"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>

      <!-- Notifications dropdown -->
      <NotificationsDropdown />
    </template>

    <!-- Page content -->
    <transition name="page-fade" mode="out-in">

      <!-- HOME -->
      <div v-if="currentPage === 'home'" key="home">
        <div class="page-title-block">
          <h1 class="page-title">Tableau de bord Admin 👋</h1>
          <p class="page-subtitle">Vue d'ensemble de la plateforme Vers le Diplôme.</p>
        </div>

        <div class="kpi-grid kpi-grid-4">
          <div class="kpi-card kpi-gold">
            <div class="kpi-icon">⏳</div>
            <div class="kpi-body">
              <div class="kpi-value">{{ pendingCount }}</div>
              <div class="kpi-label">Demandes en attente</div>
            </div>
          </div>
          <div class="kpi-card kpi-blue">
            <div class="kpi-icon">✅</div>
            <div class="kpi-body">
              <div class="kpi-value">{{ activeCount }}</div>
              <div class="kpi-label">Comptes actifs</div>
            </div>
          </div>
          <div class="kpi-card kpi-slate">
            <div class="kpi-icon">🔒</div>
            <div class="kpi-body">
              <div class="kpi-value">{{ inactiveCount }}</div>
              <div class="kpi-label">Comptes désactivés</div>
            </div>
          </div>
          <div class="kpi-card kpi-green">
            <div class="kpi-icon">👥</div>
            <div class="kpi-body">
              <div class="kpi-value">{{ users.length }}</div>
              <div class="kpi-label">Total utilisateurs</div>
            </div>
          </div>
        </div>

        <div class="section-title">Actions rapides</div>
        <div class="quick-actions">
          <button class="qa-card" @click="navigate('comptes-demandes')">
            <div class="qa-icon qa-gold">📋</div>
            <div class="qa-text">
              <div class="qa-title">Demandes de création</div>
              <div class="qa-sub">Vérifier et accepter les demandes en attente</div>
            </div>
            <span class="qa-arrow">›</span>
          </button>
          <button class="qa-card" @click="navigate('comptes-liste')">
            <div class="qa-icon qa-blue">👁</div>
            <div class="qa-text">
              <div class="qa-title">Comptes utilisateurs</div>
              <div class="qa-sub">Activer, désactiver ou supprimer des comptes</div>
            </div>
            <span class="qa-arrow">›</span>
          </button>
          <button class="qa-card" @click="navigate('messagerie')">
            <div class="qa-icon qa-green">💬</div>
            <div class="qa-text">
              <div class="qa-title">Messagerie</div>
              <div class="qa-sub">Consulter et envoyer des messages</div>
            </div>
            <span class="qa-arrow">›</span>
          </button>
        </div>
      </div>

      <!-- GÉRER DEMANDES DE CRÉATION -->
      <div v-else-if="currentPage === 'comptes-demandes'" key="demandes">
        <GererDemandesCreation
          :users="users"
          @update:users="users = $event"
        />
      </div>

      <!-- CONSULTER COMPTES UTILISATEURS -->
      <div v-else-if="currentPage === 'comptes-liste'" key="liste">
        <ConsulterComptes
          :users="users"
          @update:users="users = $event"
        />
      </div>

      <!-- MESSAGERIE -->
      <div v-else-if="currentPage === 'messagerie'" key="messagerie">
        <Messagerie />
      </div>

      <!-- PROFIL : CONSULTER -->
      <ConsulterProfil
        v-else-if="currentPage === 'profil'"
        key="profil"
        :user="currentUser"
        @modifier="currentPage = 'profil-edit'"
      />

      <!-- PROFIL : MODIFIER -->
      <ModifierProfil
        v-else-if="currentPage === 'profil-edit'"
        key="profil-edit"
        :user="currentUser"
        @annuler="currentPage = 'profil'"
        @sauvegarde="onProfilSauvegarde"
      />

    </transition>
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import AppShell                from '@/components/AppShell.vue'
import GererDemandesCreation   from './GestionComptes/GererDemandesCreation.vue'
import ConsulterComptes        from './GestionComptes/ConsulterComptes.vue'
import Messagerie              from './GestionArchivageCommunication/Messagerie.vue'
import NotificationsDropdown   from './GestionArchivageCommunication/Notifications.vue'
import ConsulterProfil         from './ConsulterProfil.vue'
import ModifierProfil          from './ModifierProfil.vue'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})
api.interceptors.request.use(config => {
  const u = localStorage.getItem('user')
  if (u) {
    const token = JSON.parse(u).token
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const router = useRouter()

const currentPage = ref('home')

const currentUser = ref((() => {
  const stored = localStorage.getItem('user')
  const base = stored ? JSON.parse(stored) : {}
  return Object.assign({
    prenom: 'Super', nom: 'Admin',
    email: 'admin@gmail.com', role: 'admin',
    matricule: 'ADM-001', telephone: '0555000000',
    adresse: 'Alger, Algérie', dateNaissance: '1980-01-01',
    sexe: 'Masculin', specialite: '', domaineExpertise: 'Administration',
    dateInscription: '01/01/2022',
  }, base)
})())

/* ── Nav items passed to AppShell ─────────────────────── */
const navItems = computed(() => [
  {
    page: 'home',
    label: 'Tableau de bord',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>`,
  },
  {
    type: 'group',
    key: 'comptes',
    label: 'Gestion des comptes',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,
    badge: pendingCount.value > 0 ? pendingCount.value : null,
    children: [
      { page: 'comptes-demandes', label: 'Demandes de création', badge: pendingCount.value > 0 ? pendingCount.value : null },
      { page: 'comptes-liste',    label: 'Comptes utilisateurs' },
    ],
  },
  {
    page: 'messagerie',
    label: 'Messagerie',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`,
  },
])

/* ── Navigation ───────────────────────────────────────── */
const navigate = (page) => { currentPage.value = page }

const onProfilSauvegarde = (updated) => {
  currentUser.value = updated
  localStorage.setItem('user', JSON.stringify(updated))
  currentPage.value = 'profil'
}

/* ── Breadcrumb label for AppShell ───────────────────── */
const breadcrumbLabel = computed(() => {
  const map = {
    'home':              '',
    'comptes-demandes':  'Demandes de création',
    'comptes-liste':     'Comptes utilisateurs',
    'messagerie':        'Messagerie',
    'profil':            'Mon profil',
    'profil-edit':       'Modifier le profil',
  }
  return map[currentPage.value] ?? ''
})

/* ── Users data ───────────────────────────────────────── */
const users = ref([])

const loadUsers = async () => {
  try {
    const res = await api.get('/utilisateurs')
    users.value = res.data.map(u => ({
      ...u,
      inBD: null,
      createdAt:   u.created_at,
      activatedAt: u.updated_at,
    }))
  } catch (e) {
    console.error('Erreur chargement utilisateurs:', e)
  }
}

onMounted(() => loadUsers())

const pendingCount  = computed(() => users.value.filter(u => u.status === 'pending').length)
const activeCount   = computed(() => users.value.filter(u => u.status === 'active').length)
const inactiveCount = computed(() => users.value.filter(u => u.status === 'inactive').length)

const logout = () => { localStorage.removeItem('user'); router.push('/login') }
</script>

<style scoped>
/* Topbar action buttons (messagerie + notifications) */
.topbar-action-btn {
  position: relative;
  background: var(--vld-surface-raised);
  border: 1.5px solid var(--vld-border);
  border-radius: var(--vld-r-md);
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  color: var(--vld-text-muted);
  cursor: pointer;
  transition: all var(--vld-t-base);
}
.topbar-action-btn:hover,
.topbar-action-btn--active {
  border-color: var(--vld-primary);
  color: var(--vld-primary);
  background: var(--vld-primary-ghost, rgba(99,179,237,0.08));
}

/* Page transition */
.page-fade-enter-active { transition: opacity .25s ease, transform .25s var(--vld-ease); }
.page-fade-leave-active { transition: opacity .15s ease; }
.page-fade-enter-from   { opacity: 0; transform: translateY(8px); }
.page-fade-leave-to     { opacity: 0; }
</style>