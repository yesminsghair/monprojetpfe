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

      <!-- ══ GRILLES EN ATTENTE ══ -->
      <div v-else-if="currentPage === 'grilles-validation'" key="grilles-validation">
        <div class="mb-4">
          <h2 class="vld-page-title">Grilles en attente</h2>
          <p class="vld-page-sub">Grilles soumises par les chefs de spécialité</p>
        </div>

        <div v-if="loadingGrilles" class="vld-state">
          <div class="vld-spinner mx-auto mb-3"></div>
          <p>Chargement...</p>
        </div>

        <div v-else-if="!grillesAttente.length" class="vld-state">
          <div class="vld-state__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p class="vld-state__title">Aucune grille en attente</p>
          <p class="vld-state__sub">Toutes les grilles ont été traitées.</p>
        </div>

        <div v-else class="d-flex flex-column gap-3">
          <div
            v-for="g in grillesAttente" :key="g.id"
            class="card"
            style="border-left: 4px solid var(--vld-accent)"
          >
            <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <div class="fw-bold mb-1" style="font-size:15px;color:var(--vld-text-strong)">{{ g.nom }}</div>
                <div style="font-size:13px;color:var(--vld-text-muted)">
                  Chef : <strong>{{ g.chef_nom || '—' }}</strong>
                  <span v-if="g.chef_specialite"> · Spécialité : <strong>{{ g.chef_specialite }}</strong></span>
                  · {{ totalCriteres(g) }} critère(s) · Total : {{ totalBareme(g) }}/20 pts
                </div>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" @click="voirGrille(g)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  Consulter
                </button>
                <button class="btn btn-success btn-sm d-flex align-items-center gap-1" @click="validerGrille(g)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Valider
                </button>
                <button class="btn btn-danger btn-sm d-flex align-items-center gap-1" @click="rejeterGrille(g)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ GRILLES VALIDÉES ══ -->
      <div v-else-if="currentPage === 'grilles-validees'" key="grilles-validees">
        <div class="mb-4">
          <h2 class="vld-page-title">Grilles validées</h2>
          <p class="vld-page-sub">Liste des grilles approuvées et verrouillées</p>
        </div>

        <div v-if="loadingGrilles" class="vld-state">
          <div class="vld-spinner mx-auto mb-3"></div>
          <p>Chargement...</p>
        </div>

        <div v-else-if="!grillesValidesList.length" class="vld-state">
          <div class="vld-state__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
          </div>
          <p class="vld-state__title">Aucune grille validée</p>
        </div>

        <div v-else class="d-flex flex-column gap-3">
          <div
            v-for="g in grillesValidesList" :key="g.id"
            class="card"
            style="border-left: 4px solid #27ae60; opacity:.9"
          >
            <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <div class="fw-bold mb-1" style="font-size:15px;color:var(--vld-text-strong)">{{ g.nom }}</div>
                <div style="font-size:13px;color:var(--vld-text-muted)">
                  Chef : <strong>{{ g.chef_nom || '—' }}</strong>
                  · {{ totalCriteres(g) }} critère(s) · Total : {{ totalBareme(g) }}/20 pts
                  · <span style="color:#27ae60">Validée le {{ formatDate(g.verrouille_le) }}</span>
                </div>
              </div>
              <div class="d-flex gap-2 align-items-center">
                <button class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" @click="voirGrille(g)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  Consulter
                </button>
                <span class="badge bg-success">✓ Validée</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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

    <!-- ══ MODAL GRILLE ══ -->
    <Transition name="modal-fade">
      <div v-if="showGrilleModal" class="modal-overlay" @click.self="showGrilleModal = false">
        <div class="modal-card-grille">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3 class="vld-page-title mb-1">{{ grilleDetail?.nom }}</h3>
              <p class="vld-page-sub">Chef : {{ grilleDetail?.chef_nom || '—' }}</p>
            </div>
            <button class="btn-close" @click="showGrilleModal = false"></button>
          </div>

          <div class="grille-detail-body">
            <div v-for="cat in (grilleDetail?.categories || [])" :key="cat.id" class="mb-3">
              <div class="d-flex justify-content-between align-items-center p-2 rounded mb-2"
                style="background:var(--vld-surface-alt)">
                <span class="fw-semibold" style="font-size:13.5px;color:var(--vld-text-strong)">{{ cat.nom }}</span>
                <span class="badge bg-primary">{{ cat.bareme_max }} pts</span>
              </div>
              <div v-for="cr in (cat.criteres || [])" :key="cr.id"
                class="d-flex justify-content-between align-items-center px-3 py-2 border-bottom"
                style="font-size:13px">
                <span style="color:var(--vld-text)">{{ cr.nom }}</span>
                <span style="color:var(--vld-text-muted)">{{ cr.bareme }} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </AppShell>
</template>

<script>
import api from '@/services/api.js'
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
import Archives from './GestionArchivageCommunication/Archives.vue'
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
    Archives,                                      // ← new
  },

  setup () {
    const { toast, showToast, onToastEvent } = useToast()
    const { currentUser, logout }            = useAuth()
    return { toast, showToast, onToastEvent, currentUser, logout }
  },

  data () {
    return {
      currentPage:      'home',
      grilles:          [],
      loadingGrilles:   false,
      showGrilleModal:  false,
      grilleDetail:     null,
      pendingSpecToast: null,
    }
  },

  computed: {
    breadcrumb ()        { return BREADCRUMBS[this.currentPage] || '' },
    grillesAttente ()    { return this.grilles.filter(g => g.statut === 'publie') },
    grillesValidesList () { return this.grilles.filter(g => g.statut === 'verrouille') },
    grillesEnAttente ()  { return this.grillesAttente.length },

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

  async mounted () {
    await this.chargerGrilles()
  },

  methods: {
    navigate (page) {
      this.currentPage = page
      if (['grilles-validation', 'grilles-validees'].includes(page)) {
        this.chargerGrilles()
      }
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

    async chargerGrilles () {
      this.loadingGrilles = true
      try {
        const res = await api.get('/grilles')
        this.grilles = await Promise.all((res.data || []).map(async g => {
          try {
            const detail = await api.get(`/grilles/${g.id}`)
            const chef   = detail.data.chef
            return {
              ...detail.data,
              chef_nom:        chef ? `${chef.prenom} ${chef.nom}` : '—',
              chef_specialite: chef?.specialite?.nom || null,
            }
          } catch {
            return { ...g, chef_nom: '—', chef_specialite: null }
          }
        }))
      } catch (e) {
        this.grilles = []
      } finally {
        this.loadingGrilles = false
      }
    },

    voirGrille (g) {
      this.grilleDetail    = g
      this.showGrilleModal = true
    },

    async validerGrille (g) {
      try {
        await api.post(`/grilles/${g.id}/verrouiller`)
        const idx = this.grilles.findIndex(gr => gr.id === g.id)
        if (idx !== -1) this.grilles[idx] = { ...this.grilles[idx], statut: 'verrouille', verrouille_le: new Date().toISOString() }
        this.showToast(`Grille "${g.nom}" validée et verrouillée.`, 'ok')
      } catch (e) {
        this.showToast('Erreur lors de la validation.', 'err')
      }
    },

    async rejeterGrille (g) {
      if (!confirm(`Rejeter la grille "${g.nom}" ? Le chef pourra la corriger et la resoumettre.`)) return
      try {
        await api.post(`/grilles/${g.id}/rejeter`)
        this.grilles = this.grilles.filter(gr => gr.id !== g.id)
        this.showToast(`Grille "${g.nom}" rejetée — le chef peut la corriger.`, 'ok')
      } catch {
        this.showToast('Erreur lors du rejet.', 'err')
      }
    },

    totalCriteres (g) {
      return (g?.categories || []).reduce((s, c) => s + (c.criteres?.length || 0), 0)
    },

    totalBareme (g) {
      return (g?.categories || []).reduce((s, c) => s + parseFloat(c.bareme_max || 0), 0).toFixed(2)
    },

    formatDate (d) {
      if (!d) return '—'
      try { return new Date(d).toLocaleDateString('fr-FR') } catch { return d }
    },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.4);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.modal-card-grille {
  background:    var(--vld-surface);
  border-radius: var(--vld-r-2xl);
  padding:       28px;
  width:         100%;
  max-width:     640px;
  max-height:    88vh;
  overflow-y:    auto;
  box-shadow:    var(--vld-shadow-modal);
}
.grille-detail-body { max-height: 50vh; overflow-y: auto; padding-right: 4px; }
</style>