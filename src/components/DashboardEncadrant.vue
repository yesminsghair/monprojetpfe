<template>
  <AppShell
    :nav-items="navItems"
    role-label="Encadrant"
    breadcrumb-root="Espace Encadrant"
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

      <!-- ACCUEIL — KPIs + raccourcis (sans graphiques) -->
      <DashboardEncadrantHome
        v-if="currentPage === 'home'"
        key="home"
        page-mode="home"
        :current-user="currentUser"
        @navigate="navigate"
      />

      <!-- TABLEAU DE BORD — graphiques & analyses complètes -->
      <DashboardEncadrantHome
        v-else-if="currentPage === 'tableau-de-bord'"
        key="tableau-de-bord"
        page-mode="dashboard"
        :current-user="currentUser"
        @navigate="navigate"
      />

      <VoeuxEncadrant
        v-else-if="currentPage === 'voeux'"
        key="voeux"
        :formulaire-actif="formulaireActif"
        :voeux-soumis="voeuxSoumis"
        :voeux-data="voeuxData"
        :date-soumission="dateSoumission"
        @voeux-soumis="onVoeuxSoumis"
        @toast="onToastEvent"
      />

      <DemandesEncadrement
        v-else-if="currentPage === 'demandes'"
        key="demandes"
        @nb-en-attente="nb => nbEnAttente = nb"
        @toast="onToastEvent"
      />

      <EtudiantsAffectes
        v-else-if="currentPage === 'affectes'"
        key="affectes"
        :etudiants="etudiantsAffectes"
        @toast="onToastEvent"
      />

      <SuiviEncadrant
        v-else-if="currentPage === 'suivi'"
        key="suivi"
        @toast="onToastEvent"
      />

      <ReunionEncadrant
        v-else-if="currentPage === 'reunions'"
        key="reunions"
        @toast="onToastEvent"
      />

      <CalendrierSoutenance
        v-else-if="currentPage === 'calendrier-soutenance'"
        key="calendrier-soutenance"
        :current-user="currentUser"
        @toast="onToastEvent"
      />

      <ProposerPlan
        v-else-if="currentPage === 'proposer-plan'"
        key="proposer-plan"
        :current-user="currentUser"
        :etudiants-affectes="etudiantsAffectes"
        @toast="onToastEvent"
      />

      <ProjetsJury
        v-else-if="currentPage === 'projets-a-evaluer'"
        key="projets-a-evaluer"
        :current-user="currentUser"
        @toast="onToastEvent"
      />

      <MesEvaluations
        v-else-if="currentPage === 'mes-evaluations'"
        key="mes-evaluations"
        :current-user="currentUser"
      />

      <Messagerie
        v-else-if="currentPage === 'messagerie'"
        key="messagerie"
      />

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
import api from '@/services/api.js'
import { useToast } from '@/composables/useToast'
import { useAuth  } from '@/composables/useAuth'

// Shell
import AppShell              from './AppShell.vue'
import NotificationsDropdown from './GestionArchivageCommunication/Notifications.vue'

// Existing components — untouched
import DashboardEncadrantHome from './DashboardEncadrantHome.vue'
import DemandesEncadrement    from './GestionDemandes/DemandesEncadrement.vue'
import SuiviEncadrant         from './Suiviencadrant.vue'
import ReunionEncadrant       from './Reunionencadrant.vue'
import Messagerie             from './GestionArchivageCommunication/Messagerie.vue'
import ConsulterProfil        from './ConsulterProfil.vue'
import ModifierProfil         from './ModifierProfil.vue'

// New extracted SFCs
import VoeuxEncadrant         from './encadrant/VoeuxEncadrant.vue'
import EtudiantsAffectes      from './encadrant/EtudiantsAffectes.vue'
import CalendrierSoutenance   from './encadrant/CalendrierSoutenance.vue'
import ProposerPlan           from './encadrant/ProposerPlan.vue'
import ProjetsJury            from './jury/ProjetsJury.vue'
import MesEvaluations         from './jury/MesEvaluations.vue'

const BREADCRUMBS = {
  'voeux':                   "Mes vœux d'encadrement",
  'demandes':                'Gérer les demandes',
  'affectes':                'Étudiants affectés',
  'suivi':                   'Suivi & livrables',
  'reunions':                'Réunions',
  'calendrier-soutenance':   'Calendrier de soutenance',
  'proposer-plan':           'Proposer un plan',
  'projets-a-evaluer':       'Projets à évaluer',
  'mes-evaluations':         'Notes finales',
  'messagerie':              'Messagerie',
  'profil':                  'Mon profil',
  'profil-edit':             'Modifier le profil',
  'tableau-de-bord':         'Tableau de bord',
}

export default {
  name: 'DashboardEncadrant',

  components: {
    AppShell, NotificationsDropdown,
    DashboardEncadrantHome, DemandesEncadrement,
    SuiviEncadrant, ReunionEncadrant,
    Messagerie, ConsulterProfil, ModifierProfil,
    VoeuxEncadrant, EtudiantsAffectes,
    CalendrierSoutenance, ProposerPlan,
    ProjetsJury, MesEvaluations,
  },

  setup () {
    const { toast, showToast, onToastEvent } = useToast()
    const { currentUser, logout }            = useAuth()
    return { toast, showToast, onToastEvent, currentUser, logout }
  },

  data () {
    return {
      currentPage:       'home',
      nbEnAttente:       0,
      etudiantsAffectes: [],
      formulaireActif:   null,
      voeuxSoumis:       false,
      voeuxData:         null,
      dateSoumission:    '',
    }
  },

  computed: {
    breadcrumb () { return BREADCRUMBS[this.currentPage] || '' },

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
        { type: 'category', label: "Vœux d'encadrement" },
        {
          page: 'voeux',
          label: this.voeuxSoumis ? 'Ma fiche' : 'Remplir le formulaire',
          badge: !this.voeuxSoumis && this.formulaireActif ? '!' : null,
          badgeCheck: this.voeuxSoumis,
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
        },
        { type: 'category', label: 'Mon encadrement' },
        {
          page: 'demandes', label: 'Gérer les demandes',
          badge: this.nbEnAttente > 0 ? this.nbEnAttente : null,
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        },
        {
          page: 'affectes', label: 'Étudiants affectés',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        },
        { type: 'category', label: 'Suivi de projet' },
        {
          page: 'suivi', label: 'Suivi & livrables',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
        },
        {
          page: 'reunions', label: 'Réunions',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
        },
        { type: 'category', label: 'Soutenance' },
        {
          type: 'group', key: 'sout', label: 'Plan de soutenance',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
          children: [
            { page: 'calendrier-soutenance', label: 'Calendrier'       },
            { page: 'proposer-plan',         label: 'Proposer un plan' },
          ],
        },
        { type: 'category', label: 'Évaluation' },
        {
          type: 'group', key: 'eval', label: 'Évaluation PFE',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
          children: [
            { page: 'projets-a-evaluer', label: 'Projets à évaluer' },
            { page: 'mes-evaluations',   label: 'Notes finales'   },
          ],
        },
        { type: 'category', label: 'Communication' },
        {
          page: 'messagerie', label: 'Messagerie',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        },
      ]
    },
  },

  async mounted () {
    await Promise.all([
      this.chargerDonnees(),
      this.chargerFormulaireActif(),
    ])
  },

  methods: {
    navigate (page) { if (page) this.currentPage = page },

    async chargerFormulaireActif () {
      try {
        const res    = await api.get('/formulaires-voeux')
        const publie = (res.data || []).find(f => f.statut === 'publie' || f.statut === 'verrouille')
        if (!publie) return
        this.formulaireActif = publie
        const vRes = await api.get('/voeux-encadrement?formulaire_id=' + publie.id)
        if (vRes.data?.statut === 'soumis') {
          this.voeuxSoumis    = true
          this.voeuxData      = vRes.data
          this.dateSoumission = vRes.data.soumis_at
            ? new Date(vRes.data.soumis_at).toLocaleDateString('fr-FR') : ''
        }
      } catch (e) { console.error('formulaire:', e) }
    },

    async chargerDonnees () {
      try {
        const [affRes, demRes] = await Promise.all([
          api.get('/affectations/mes-affectations'),
          api.get('/demandes-encadrement'),
        ])
        const raw = affRes.data
        const arr = Array.isArray(raw) ? raw : (raw?.id ? [raw] : [])
        this.etudiantsAffectes = arr.map(a => ({
          id:             a.etudiant_id,
          // Use dedicated fields when available (avoids splitting on spaces,
          // which breaks compound first/last names like "Jean-Marie Dupont").
          prenom:         a.prenom         ?? a.etudiant?.split(' ')[0]                ?? '',
          nom:            a.nom            ?? a.etudiant?.split(' ').slice(1).join(' ') ?? '',
          matricule:      a.matricule      ?? '',
          specialite:     a.specialite     ?? '',
          email:          a.email          ?? '',
          telephone:      a.telephone      ?? '',
          date_naissance: a.date_naissance ?? '',
          adresse:        a.adresse        ?? '',
        }))
        this.nbEnAttente = (demRes.data || []).filter(d => d.statut === 'en_attente').length
      } catch (e) { console.error('données encadrant:', e) }
    },

    onVoeuxSoumis (voeux) {
      this.voeuxSoumis    = true
      this.voeuxData      = voeux
      this.dateSoumission = new Date().toLocaleDateString('fr-FR')
      this.showToast('Vos vœux ont été soumis avec succès !', 'ok')
    },
  },
}
</script>
<!-- Zero <style> block — all styles from design-tokens.css + Bootstrap -->