<template>
  <div class="admin-shell">

    <!-- ══ SIDEBAR ══ -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sb-brand">
        <div v-if="!sidebarCollapsed" class="brand-full">
          <span class="logo-white">Vers le</span><span class="logo-gold">Diplôme</span>
          <span class="brand-tag">Admin</span>
        </div>
        <div v-else class="brand-icon">VD</div>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <nav class="sb-nav">
        <!-- Tableau de bord -->
        <button class="nav-item" :class="{ active: currentPage === 'home' }" @click="navigate('home')" :title="sidebarCollapsed ? 'Tableau de bord' : ''">
          <span class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </span>
          <span class="nav-label" v-if="!sidebarCollapsed">Tableau de bord</span>
        </button>

        <!-- Gestion des comptes utilisateur -->
        <div class="nav-section">
          <button class="nav-item nav-group-toggle"
            :class="{ 'group-open': openGroup === 'comptes' }"
            @click="toggleGroup('comptes')"
            :title="sidebarCollapsed ? 'Gestion des comptes utilisateur' : ''">
            <span class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            <span class="nav-label" v-if="!sidebarCollapsed">Gestion des comptes utilisateur</span>
            <span class="chevron" v-if="!sidebarCollapsed" :class="{ 'chevron-open': openGroup === 'comptes' }">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </button>
          <transition name="submenu">
            <div v-if="openGroup === 'comptes' && !sidebarCollapsed" class="sub-menu">
              <!-- Nouvelle étiquette : Gérer les demandes de création -->
              <button class="sub-item" :class="{ active: currentPage === 'comptes-demandes' }" @click="navigate('comptes-demandes')">
                <span class="sub-dot"></span>Gérer les demandes de création
              </button>
              <!-- Nouvelle étiquette : Consulter les comptes utilisateurs -->
              <button class="sub-item" :class="{ active: currentPage === 'comptes-liste' }" @click="navigate('comptes-liste')">
                <span class="sub-dot"></span>Consulter les comptes utilisateurs
              </button>
            </div>
          </transition>
        </div>
      </nav>

      <div class="sb-user" v-if="!sidebarCollapsed">
        <button class="user-avatar user-avatar-btn" @click="navigate('profil')" title="Mon profil">
          {{ (currentUser.prenom[0]||'') + (currentUser.nom[0]||'') }}
        </button>
        <div class="user-info">
          <div class="user-name">{{ currentUser.prenom }} {{ currentUser.nom }}</div>
          <div class="user-role">Administrateur</div>
        </div>
        <button class="logout-btn" title="Se déconnecter" @click="logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
      <div class="sb-user-collapsed" v-else>
        <button class="user-avatar-sm user-avatar-btn" @click="navigate('profil')" title="Mon profil">
          {{ (currentUser.prenom[0]||'') + (currentUser.nom[0]||'') }}
        </button>
      </div>
    </aside>

    <!-- ══ MAIN ══ -->
    <div class="main-wrap">

      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left">
          <div class="breadcrumb">
            <span class="bc-home">Administration</span>
            <template v-for="(b,i) in breadcrumb" :key="i">
              <span class="bc-sep">›</span>
              <span :class="i === breadcrumb.length-1 ? 'bc-last' : 'bc-item'">{{ b }}</span>
            </template>
          </div>
        </div>
        <div class="topbar-right">
          <button class="topbar-profil-btn" @click="navigate('profil')" title="Mon profil">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>{{ currentUser.prenom }}</span>
          </button>
          <span class="topbar-date">{{ dateNow }}</span>
          <button class="notif-btn" @click="navigate('comptes-demandes')" title="Demandes en attente">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span v-if="pendingCount > 0" class="notif-dot">{{ pendingCount }}</span>
          </button>
        </div>
      </header>

      <!-- Content -->
      <main class="content-area">
        <transition name="page-fade" mode="out-in">

          <!-- HOME -->
          <div v-if="currentPage === 'home'" key="home">
            <div class="page-title-block">
              <h1 class="page-title">Tableau de bord Admin 👋</h1>
              <p class="page-subtitle">Vue d'ensemble de la plateforme Vers le Diplôme.</p>
            </div>

            <div class="kpi-grid">
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
                  <div class="qa-title">Gérer les demandes de création</div>
                  <div class="qa-sub">Vérifier et accepter les demandes en attente</div>
                </div>
                <span class="qa-arrow">›</span>
              </button>
              <button class="qa-card" @click="navigate('comptes-liste')">
                <div class="qa-icon qa-blue">👁</div>
                <div class="qa-text">
                  <div class="qa-title">Consulter les comptes utilisateurs</div>
                  <div class="qa-sub">Activer, désactiver ou supprimer des comptes</div>
                </div>
                <span class="qa-arrow">›</span>
              </button>
            </div>
          </div>

          <!-- GÉRER DEMANDES DE CRÉATION -->
          <div v-else-if="currentPage === 'comptes-demandes'" key="demandes">
            <GererDemandesCreation
              :users="users"
              :bdEtablissement="BD_ETABLISSEMENT"
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
      </main>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import GererDemandesCreation from './GestionComptes/GererDemandesCreation.vue'
import ConsulterComptes      from './GestionComptes/ConsulterComptes.vue'
import ConsulterProfil       from './ConsulterProfil.vue'
import ModifierProfil        from './ModifierProfil.vue'

const router = useRouter()

const sidebarCollapsed = ref(false)
const openGroup        = ref('comptes')
const currentPage      = ref('home')
const profilPage       = ref('consulter')

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

const toggleGroup = (g) => { openGroup.value = openGroup.value === g ? null : g }
const navigate = (page) => {
  currentPage.value = page
  if (page.startsWith('comptes')) openGroup.value = 'comptes'
  else openGroup.value = null
}
const onProfilSauvegarde = (updated) => {
  currentUser.value = updated
  localStorage.setItem('user', JSON.stringify(updated))
  currentPage.value = 'profil'
}

const breadcrumb = computed(() => {
  const map = {
    home:              [],
    'comptes-demandes':['Gestion des comptes utilisateur', 'Gérer les demandes de création'],
    'comptes-liste':   ['Gestion des comptes utilisateur', 'Consulter les comptes utilisateurs'],
    'profil':          ['Mon profil', 'Consultation'],
    'profil-edit':     ['Mon profil', 'Modifier'],
  }
  return map[currentPage.value] || []
})

const dateNow = computed(() =>
  new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
)

const BD_ETABLISSEMENT = [
  { matricule: 'ETU-2024-001', email: 'ali.benali@univ.dz',    nom:'Benali',  prenom:'Ali',    role:'etudiant'   },
  { matricule: 'ETU-2024-002', email: 'sara.hadj@univ.dz',     nom:'Hadj',    prenom:'Sara',   role:'etudiant'   },
  { matricule: 'ENS-2023-010', email: 'k.meziane@univ.dz',     nom:'Meziane', prenom:'Karim',  role:'enseignant' },
  { matricule: 'ENS-2023-011', email: 'n.boudali@univ.dz',     nom:'Boudali', prenom:'Nadia',  role:'enseignant' },
  { matricule: 'DIR-2022-001', email: 'a.cherif@univ.dz',      nom:'Cherif',  prenom:'Ahmed',  role:'directeur'  },
  { matricule: 'ETU-2024-003', email: 'youcef.amara@univ.dz',  nom:'Amara',   prenom:'Youcef', role:'etudiant'   },
  { matricule: 'ENC-2023-005', email: 'f.belhadj@univ.dz',     nom:'Belhadj', prenom:'Fatima', role:'encadrant'  },
]

const users = ref([
  { id:1, nom:'Benali',  prenom:'Ali',    email:'ali.benali@univ.dz',   matricule:'ETU-2024-001', role:'etudiant',   etablissement:'Université Alger 1', status:'pending',  inBD:null,  createdAt:'2024-03-01', activatedAt:null },
  { id:2, nom:'Hadj',    prenom:'Sara',   email:'sara.hadj@univ.dz',    matricule:'ETU-2024-002', role:'etudiant',   etablissement:'Université Alger 1', status:'pending',  inBD:null,  createdAt:'2024-03-02', activatedAt:null },
  { id:3, nom:'Meziane', prenom:'Karim',  email:'k.meziane@univ.dz',    matricule:'ENS-2023-010', role:'enseignant', etablissement:'Université Alger 1', status:'pending',  inBD:null,  createdAt:'2024-03-03', activatedAt:null },
  { id:4, nom:'Amara',   prenom:'Youcef', email:'youcef.amara@univ.dz', matricule:'ETU-2024-003', role:'etudiant',   etablissement:'Université Alger 1', status:'pending',  inBD:null,  createdAt:'2024-03-04', activatedAt:null },
  { id:5, nom:'Boudali', prenom:'Nadia',  email:'n.boudali@univ.dz',    matricule:'ENS-2023-011', role:'enseignant', etablissement:'Université Alger 1', status:'active',   inBD:true,  createdAt:'2024-02-10', activatedAt:'2024-02-12' },
  { id:6, nom:'Cherif',  prenom:'Ahmed',  email:'a.cherif@univ.dz',     matricule:'DIR-2022-001', role:'directeur',  etablissement:'Université Alger 1', status:'active',   inBD:true,  createdAt:'2024-01-05', activatedAt:'2024-01-06' },
  { id:7, nom:'Belhadj', prenom:'Fatima', email:'f.belhadj@univ.dz',    matricule:'ENC-2023-005', role:'encadrant',  etablissement:'Université Alger 1', status:'active',   inBD:true,  createdAt:'2024-02-20', activatedAt:'2024-02-21' },
  { id:8, nom:'Ouali',   prenom:'Rachid', email:'r.ouali@gmail.com',     matricule:'ETU-9999-999', role:'etudiant',   etablissement:'Autre établissement', status:'pending', inBD:null,  createdAt:'2024-03-05', activatedAt:null },
  { id:9, nom:'Saadi',   prenom:'Leila',  email:'l.saadi@hotmail.com',   matricule:'',             role:'etudiant',   etablissement:'Université Alger 1', status:'inactive', inBD:false, createdAt:'2024-02-01', activatedAt:null },
])

const pendingCount  = computed(() => users.value.filter(u => u.status === 'pending').length)
const activeCount   = computed(() => users.value.filter(u => u.status === 'active').length)
const inactiveCount = computed(() => users.value.filter(u => u.status === 'inactive').length)

const logout = () => { localStorage.removeItem('user'); router.push('/login') }
</script>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.admin-shell { display:flex; min-height:100vh; background:#c8c4bc; font-family:'Source Sans 3',sans-serif; }

/* SIDEBAR */
.sidebar { width:260px; min-height:100vh; background: linear-gradient(160deg,#4a7090 0%,#3d6080 30%,#2f4f6a 65%,#243d52 100%); display:flex; flex-direction:column; flex-shrink:0; transition:width 0.3s cubic-bezier(0.22,1,0.36,1); position:sticky; top:0; height:100vh; overflow:hidden; }
.sidebar.collapsed { width:68px; }
.sb-brand { display:flex; align-items:center; justify-content:space-between; padding:20px 16px 16px; border-bottom:1px solid rgba(255,255,255,0.08); flex-shrink:0; }
.brand-full { font-family:'Merriweather',serif; font-size:15px; font-weight:700; white-space:nowrap; display:flex; align-items:center; gap:5px; flex-wrap:wrap; }
.brand-tag  { font-size:10px; background:rgba(245,166,35,0.25); color:#f5a623; border-radius:4px; padding:1px 6px; font-family:'Source Sans 3',sans-serif; font-weight:600; letter-spacing:0.5px; }
.brand-icon { font-family:'Merriweather',serif; font-size:14px; font-weight:700; color:#f5a623; }
.logo-white { color:#fff; }
.logo-gold  { color:#f5a623; }
.collapse-btn { background:rgba(255,255,255,0.08); border:none; border-radius:7px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.6); cursor:pointer; flex-shrink:0; transition:all 0.18s; }
.collapse-btn:hover { background:rgba(255,255,255,0.15); color:#fff; }
.sb-nav { flex:1; padding:12px 8px; overflow-y:auto; overflow-x:hidden; }
.sb-nav::-webkit-scrollbar { width:3px; }
.sb-nav::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:4px; }
.nav-section { margin-bottom:2px; }
.nav-item { display:flex; align-items:center; gap:10px; width:100%; padding:10px; border:none; border-radius:10px; background:transparent; color:rgba(255,255,255,0.62); font-size:13.5px; font-family:'Source Sans 3',sans-serif; font-weight:500; cursor:pointer; text-align:left; transition:all 0.18s; white-space:nowrap; overflow:hidden; margin-bottom:2px; }
.nav-item:hover { background:rgba(255,255,255,0.09); color:#fff; }
.nav-item.active { background:rgba(245,166,35,0.2); color:#f5a623; }
.nav-item.group-open { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.92); }
.nav-icon  { display:flex; align-items:center; flex-shrink:0; }
.nav-label { flex:1; overflow:hidden; text-overflow:ellipsis; }
.chevron   { flex-shrink:0; display:flex; align-items:center; color:rgba(255,255,255,0.35); transition:transform 0.25s; }
.chevron-open { transform:rotate(180deg); }
.sub-menu { margin:2px 0 4px 14px; border-left:1.5px solid rgba(255,255,255,0.10); padding-left:10px; }
.sub-item { display:flex; align-items:center; gap:9px; width:100%; padding:8px 10px; border:none; border-radius:8px; background:transparent; color:rgba(255,255,255,0.52); font-size:12.5px; font-family:'Source Sans 3',sans-serif; cursor:pointer; text-align:left; transition:all 0.18s; white-space:nowrap; margin-bottom:1px; }
.sub-item:hover { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.88); }
.sub-item.active { background:rgba(245,166,35,0.14); color:#f5a623; font-weight:600; }
.sub-dot { width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; opacity:0.55; }
.sub-item.active .sub-dot { opacity:1; }
.submenu-enter-active { transition:max-height 0.28s cubic-bezier(0.22,1,0.36,1),opacity 0.22s; overflow:hidden; }
.submenu-leave-active { transition:max-height 0.2s ease,opacity 0.15s; overflow:hidden; }
.submenu-enter-from  { max-height:0; opacity:0; }
.submenu-enter-to    { max-height:140px; opacity:1; }
.submenu-leave-from  { max-height:140px; opacity:1; }
.submenu-leave-to    { max-height:0; opacity:0; }
.sb-user { display:flex; align-items:center; gap:10px; padding:14px 14px 18px; border-top:1px solid rgba(255,255,255,0.08); flex-shrink:0; }
.user-avatar { width:36px; height:36px; border-radius:10px; background:#f5a623; color:#1e2a35; font-weight:700; font-size:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.user-info   { flex:1; overflow:hidden; }
.user-name   { font-size:13px; font-weight:600; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.user-role   { font-size:11.5px; color:rgba(255,255,255,0.42); }
.logout-btn  { background:none; border:none; color:rgba(255,255,255,0.38); cursor:pointer; display:flex; align-items:center; padding:5px; border-radius:6px; transition:all 0.15s; }
.logout-btn:hover { color:#f5a623; background:rgba(255,255,255,0.07); }
.sb-user-collapsed { padding:14px 10px 18px; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:center; }
.user-avatar-btn { cursor:pointer; border:none; font-size:inherit; font-weight:inherit; font-family:inherit; transition:transform 0.18s, box-shadow 0.18s; }
.user-avatar-btn:hover { transform:scale(1.08); box-shadow:0 0 0 3px rgba(245,166,35,0.35); }
.topbar-profil-btn { display:flex; align-items:center; gap:7px; padding:7px 14px; background:#e8e4dc; border:1.5px solid #c8c4bc; border-radius:9px; color:#4a5a6a; font-size:13px; font-weight:600; font-family:'Source Sans 3',sans-serif; cursor:pointer; transition:all 0.18s; }
.topbar-profil-btn:hover { border-color:#3d6080; color:#3d6080; background:#ddd9d1; }
.user-avatar-sm { width:36px; height:36px; border-radius:10px; background:#f5a623; color:#1e2a35; font-weight:700; font-size:11px; display:flex; align-items:center; justify-content:center; }

/* MAIN */
.main-wrap { flex:1; display:flex; flex-direction:column; min-width:0; }
.topbar { background:#ddd9d1; border-bottom:1px solid #c8c4bc; padding:0 28px; height:58px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; position:sticky; top:0; z-index:10; }
.breadcrumb { display:flex; align-items:center; gap:6px; font-size:13.5px; }
.bc-home { color:#3d6080; font-weight:600; }
.bc-sep  { color:#c8c4bc; font-size:16px; }
.bc-item { color:#8a9aaa; }
.bc-last { color:#1e2a35; font-weight:600; }
.topbar-right { display:flex; align-items:center; gap:14px; }
.topbar-date  { font-size:12px; color:#8a9aaa; text-transform:capitalize; white-space:nowrap; }
.notif-btn { position:relative; background:#e8e4dc; border:1.5px solid #c8c4bc; border-radius:9px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; color:#4a5a6a; cursor:pointer; transition:all 0.18s; }
.notif-btn:hover { border-color:#3d6080; color:#3d6080; }
.notif-dot { position:absolute; top:-6px; right:-6px; background:#f5a623; color:#1e2a35; font-size:10px; font-weight:700; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; border:2px solid #ddd9d1; }
.content-area { flex:1; padding:28px; overflow-y:auto; }

/* HOME KPI */
@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
.kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:32px; }
.kpi-card { background:#ddd9d1; border-radius:14px; padding:20px; display:flex; align-items:center; gap:14px; box-shadow:0 2px 10px rgba(0,0,0,0.06); border:1.5px solid #c8c4bc; animation:fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
.kpi-card:nth-child(1){animation-delay:.04s} .kpi-card:nth-child(2){animation-delay:.09s} .kpi-card:nth-child(3){animation-delay:.14s} .kpi-card:nth-child(4){animation-delay:.19s}
.kpi-icon  { font-size:26px; flex-shrink:0; }
.kpi-value { font-family:'Merriweather',serif; font-size:26px; font-weight:700; color:#1e2a35; line-height:1; }
.kpi-label { font-size:12px; color:#8a9aaa; margin-top:3px; }
.kpi-gold  .kpi-value { color:#d98e1a; }
.kpi-blue  .kpi-value { color:#3d6080; }
.kpi-green .kpi-value { color:#27ae60; }
.section-title { font-size:12px; font-weight:700; color:#8a9aaa; text-transform:uppercase; letter-spacing:0.09em; margin-bottom:12px; }
.quick-actions { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.qa-card { display:flex; align-items:center; gap:14px; background:#ddd9d1; border:1.5px solid #c8c4bc; border-radius:14px; padding:18px 20px; cursor:pointer; text-align:left; transition:all 0.2s; box-shadow:0 2px 8px rgba(0,0,0,0.05); }
.qa-card:hover { border-color:#3d6080; box-shadow:0 4px 16px rgba(61,96,128,0.12); transform:translateY(-2px); }
.qa-icon  { font-size:24px; flex-shrink:0; }
.qa-text  { flex:1; }
.qa-title { font-size:14px; font-weight:600; color:#1e2a35; margin-bottom:2px; }
.qa-sub   { font-size:12px; color:#8a9aaa; }
.qa-arrow { color:#c8c4bc; font-size:20px; transition:all 0.18s; }
.qa-card:hover .qa-arrow { transform:translateX(3px); color:#3d6080; }

/* PAGE TRANSITION */
.page-fade-enter-active { transition:opacity 0.25s ease,transform 0.25s cubic-bezier(0.22,1,0.36,1); }
.page-fade-leave-active { transition:opacity 0.15s ease; }
.page-fade-enter-from   { opacity:0; transform:translateY(8px); }
.page-fade-leave-to     { opacity:0; }

@media (max-width:1100px) { .kpi-grid { grid-template-columns:repeat(2,1fr); } }
@media (max-width:768px) { .quick-actions { grid-template-columns:1fr; } .content-area { padding:16px; } .topbar { padding:0 16px; } .topbar-date { display:none; } .kpi-grid { grid-template-columns:1fr 1fr; } }
</style>