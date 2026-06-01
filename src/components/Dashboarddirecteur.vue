<template>
  <AppShell
    :nav-items="navItems"
    role-label="Directeur de stage"
    breadcrumb-root="Directeur"
    :breadcrumb="breadcrumb"
    :current-page="currentPage"
    :current-user="currentUser"
    :toast="toast"
    @navigate="navigate"
    @logout="logout"
  >
    <template #topbar-actions>
      <NotificationsDropdown />
    </template>

    <Transition name="page" mode="out-in">

      <!-- HOME -->
      <DashboardDirecteurHome
        v-if="currentPage === 'home'"
        key="home"
        page-mode="home"
        :current-user="currentUser"
        :grilles-en-attente="grillesEnAttente"
        @navigate="navigate"
      />

      <!-- TABLEAU DE BORD (charts) -->
      <DashboardDirecteurHome
        v-else-if="currentPage === 'tableau-de-bord'"
        key="tableau-de-bord"
        page-mode="dashboard"
        :current-user="currentUser"
      />

      <!-- ══ SPÉCIALITÉS ══ -->
      <Creerspecialite
        v-else-if="currentPage === 'spec-create'"
        key="spec-create"
        @toast="onToastEvent"
        @creee="onSpecCreee"
      />

      <Listespecialites
        v-else-if="currentPage === 'spec-list'"
        key="spec-list"
        :pending-toast="pendingSpecToast"
        @toast="onToastEvent"
        @create="navigate('spec-create')"
      />

      <!-- ══ CHEFS ══ -->
      <AjouterChef
        v-else-if="currentPage === 'chef-create'"
        key="chef-create"
        @chef-ajoute="onChefAjoute"
      />

      <ListeChefs
        v-else-if="currentPage === 'chef-list'"
        key="chef-list"
        @toast="onToastEvent"
        @create="navigate('chef-create')"
      />

      <!-- GRILLES (en attente + validees) -->
      <ValidationGrilles
        v-else-if="currentPage === 'grilles-validation' || currentPage === 'grilles-validees'"
        :key="currentPage"
        :current-page="currentPage"
        @toast="onToastEvent"
        @grilles-count="grillesEnAttenteCount = $event"
      />

      <!-- ══ ARCHIVES PFE ══ (NEW) -->
      <Archives
        v-else-if="currentPage === 'archives'"
        key="archives"
        role="directeur"
      />

      <!-- ══ MESSAGERIE ══ -->
      <Messagerie v-else-if="currentPage === 'messagerie'" key="messagerie" />

      <!-- ══ PROFIL ══ -->
      <ConsulterProfil
        v-else-if="currentPage === 'profil'"
        key="profil"
        @modifier="navigate('profil-edit')"
      />
      <ModifierProfil
        v-else-if="currentPage === 'profil-edit'"
        key="profil-edit"
        @annuler="navigate('profil')"
        @sauvegarde="navigate('profil')"
      />

    </Transition>

  </AppShell>
</template>

<script>
import { useToast, schedulePendingToast } from '@/composables/useToast'
import { useAuth  } from '@/composables/useAuth'

import AppShell              from './AppShell.vue'
import NotificationsDropdown from './GestionArchivageCommunication/Notifications.vue'
import DashboardDirecteurHome   from './DashboardDirecteurHome.vue'
import Messagerie            from './GestionArchivageCommunication/Messagerie.vue'
import ConsulterProfil       from './ConsulterProfil.vue'
import ModifierProfil        from './ModifierProfil.vue'

// Existing folders — untouched
import Creerspecialite  from './gestionSpecialite/Creerspecialite.vue'
import Listespecialites from './gestionSpecialite/Listespecialites.vue'
import AjouterChef      from './gestionChefs/Ajouterchef.vue'
import ListeChefs       from './gestionChefs/ListeChefs.vue'

// ── NEW ──────────────────────────────────────────────────────────────────────
import Archives          from './GestionArchivageCommunication/Archives.vue'
import ValidationGrilles from './directeur/ValidationGrilles.vue'
// ─────────────────────────────────────────────────────────────────────────────

const BREADCRUMBS = {
  'spec-create':        'Créer une spécialité',
  'spec-list':          'Liste des spécialités',
  'chef-create':        'Ajouter un chef',
  'chef-list':          'Liste des chefs',
  'grilles-validation': 'Validation des grilles',
  'grilles-validees':   'Grilles validées',
  'archives':           'Archives PFE',
  'tableau-de-bord':    'Tableau de bord',
  'messagerie':         'Messagerie',
  'profil':             'Mon profil',
  'profil-edit':        'Modifier le profil',
}

export default {
  name: 'DashboardDirecteur',

  components: {
    AppShell, NotificationsDropdown, DashboardDirecteurHome,
    Messagerie, ConsulterProfil, ModifierProfil,
    Creerspecialite, Listespecialites, AjouterChef, ListeChefs,
    Archives, ValidationGrilles,
  },

  setup () {
    const { toast, showToast, onToastEvent } = useToast()
    const { currentUser, logout }            = useAuth()
    return { toast, showToast, onToastEvent, currentUser, logout }
  },

  data () {
    return {
      currentPage:         'home',
      grillesEnAttenteCount: 0,
      pendingSpecToast:    null,
    }
  },

  computed: {
    breadcrumb ()       { return BREADCRUMBS[this.currentPage] || '' },
    grillesEnAttente () { return this.grillesEnAttenteCount },

    navItems () {
      return [
        {
          page: 'home', label: 'Accueil',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
        },
        {
          page: 'tableau-de-bord', label: 'Tableau de bord',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
        },
        {
          type: 'group', key: 'specialites', label: 'Gestion des spécialités',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
          children: [
            { page: 'spec-create', label: 'Nouvelle spécialité' },
            { page: 'spec-list',   label: 'Liste des spécialités' },
          ],
        },
        {
          type: 'group', key: 'chefs', label: 'Gestion des chefs',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
          children: [
            { page: 'chef-create', label: 'Nouveau chef' },
            { page: 'chef-list',   label: 'Liste des chefs'  },
          ],
        },
        {
          type: 'group', key: 'grilles', label: "Grilles d'évaluation",
          badge: this.grillesEnAttente > 0 ? this.grillesEnAttente : null,
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
          children: [
            { page: 'grilles-validation', label: 'Grilles en attente', badge: this.grillesEnAttente > 0 ? this.grillesEnAttente : null },
            { page: 'grilles-validees',   label: 'Grilles validées' },
          ],
        },
        // ── NEW ──────────────────────────────────────────────────────────────
        {
          page: 'archives', label: 'Archives PFE',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
        },
        // ─────────────────────────────────────────────────────────────────────
        { type: 'category', label: 'Communication' },
        {
          page: 'messagerie', label: 'Messagerie',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        },
      ]
    },
  },

  async mounted () {},

  methods: {
    navigate (page) {
      this.currentPage = page
    },

    onSpecCreee ({ toastMessage }) {
      this.pendingSpecToast = toastMessage
      this.navigate('spec-list')
      // Clear after toast duration so re-navigating doesn't re-show it
      setTimeout(() => { this.pendingSpecToast = null }, 4000)
    },

    onChefAjoute (chef) {
      schedulePendingToast(`${chef.prenom} ${chef.nom} promu(e) chef de département ✓`, 'ok')
      this.navigate('chef-list')
    },

  },
}
</script>

<style scoped>
</style>