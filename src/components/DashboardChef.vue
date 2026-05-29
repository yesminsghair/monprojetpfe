<template>
  <AppShell
    :nav-items="navItems"
    role-label="Chef de département"
    :breadcrumb-root="breadcrumbRoot"
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
      <DashboardChefHome
        v-if="currentPage === 'home'"
        key="home"
        page-mode="home"
        :current-user="currentUser"
        @navigate="navigate"
      />

      <!-- TABLEAU DE BORD — graphiques & analyses complètes -->
      <DashboardChefHome
        v-else-if="currentPage === 'tableau-de-bord'"
        key="tableau-de-bord"
        page-mode="dashboard"
        :current-user="currentUser"
        @navigate="navigate"
      />

      <!-- ══════════════ CHEF PAGES ══════════════ -->

      <CreerFormulaire
        v-else-if="currentPage === 'voeux-creer'"
        key="voeux-creer"
        :enseignants="enseignants"
        :formulaire-a-modifier="formulaireAModifier"
        @form-cree="onFormulaireCree"
        @navigate="navigate"
      />

      <ListeFormulaires
        v-else-if="currentPage === 'voeux-liste'"
        key="voeux-liste"
        @modifier="onModifierFormulaire"
        @navigate="navigate"
      />

      <GestionAffectations
        v-else-if="currentPage === 'affectation'"
        key="affectation"
        @toast="onToastEvent"
      />

      <!-- Mon département -->
      <MonDepartement
        v-else-if="currentPage === 'mon-departement'"
        key="mon-departement"
        :etudiants="etudiants"
        :enseignants="enseignants"
        :encadrants="encadrants"
        :loading-etudiants="loadingEtudiants"
        :loading-encadrants="loadingEncadrants"
      />

      <GestionPhases
        v-else-if="currentPage === 'phases'"
        key="phases"
        @toast="onToastEvent"
      />

      <GestionGrille
        v-else-if="currentPage === 'grille'"
        key="grille"
        @toast="onToastEvent"
      />

      <GestionJury
        v-else-if="currentPage === 'jury'"
        key="jury"
        @toast="onToastEvent"
      />

      <GestionSoutenance
        v-else-if="currentPage === 'soutenance'"
        key="soutenance"
        @toast="onToastEvent"
      />

      <FichesEvaluation
        v-else-if="currentPage === 'fiches-evaluation'"
        key="fiches-evaluation"
        @toast="onToastEvent"
      />

      <!-- ✅ Replaced DeliberationResultats with ConsulterResultatFinal -->
      <ConsulterResultatFinal
        v-else-if="currentPage === 'deliberation-resultats'"
        key="deliberation-resultats"
        @toast="onToastEvent"
      />

      <!-- ── Archivage ── -->
      <ArchivesPfe
        v-else-if="currentPage === 'archivage-archives'"
        key="archivage-archives"
        role="chef"
        @toast="onToastEvent"
      />

      <BiblioPfe
        v-else-if="currentPage === 'archivage-bibliotheque'"
        key="archivage-bibliotheque"
        @toast="onToastEvent"
      />

      <!-- ══════════════ ENCADRANT PAGES ══════════════ -->

      <VoeuxEncadrant
        v-else-if="currentPage === 'enc-voeux'"
        key="enc-voeux"
        :formulaire-actif="formulaireActif"
        :voeux-soumis="voeuxSoumis"
        :voeux-data="voeuxData"
        :date-soumission="dateSoumission"
        @voeux-soumis="onVoeuxSoumis"
        @toast="onToastEvent"
      />

      <DemandesEncadrement
        v-else-if="currentPage === 'enc-demandes'"
        key="enc-demandes"
        @nb-en-attente="nb => nbEnAttente = nb"
        @toast="onToastEvent"
      />

      <EtudiantsAffectes
        v-else-if="currentPage === 'enc-affectes'"
        key="enc-affectes"
        :etudiants="etudiantsAffectes"
        @toast="onToastEvent"
      />

      <SuiviEncadrant
        v-else-if="currentPage === 'enc-suivi'"
        key="enc-suivi"
        @toast="onToastEvent"
      />

      <ReunionEncadrant
        v-else-if="currentPage === 'enc-reunions'"
        key="enc-reunions"
        @toast="onToastEvent"
      />

      <CalendrierSoutenance
        v-else-if="currentPage === 'enc-calendrier'"
        key="enc-calendrier"
        :current-user="currentUser"
        @toast="onToastEvent"
      />

      <ProposerPlan
        v-else-if="currentPage === 'enc-proposer-plan'"
        key="enc-proposer-plan"
        :current-user="currentUser"
        :etudiants-affectes="etudiantsAffectes"
        @toast="onToastEvent"
      />

      <!-- ══════════════ JURY PAGES ══════════════ -->

      <ProjetsJury
        v-else-if="currentPage === 'jury-projets'"
        key="jury-projets"
        :current-user="currentUser"
        @toast="onToastEvent"
      />

      <MesEvaluations
        v-else-if="currentPage === 'jury-evaluations'"
        key="jury-evaluations"
        :current-user="currentUser"
      />

      <!-- ══════════════ SHARED ══════════════ -->

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

// Chef pages
import DashboardChefHome    from './DashboardChefHome.vue'
import CreerFormulaire      from './GestionFormulaires/CreerFormulaire.vue'
import ListeFormulaires     from './GestionFormulaires/ListeFormulaires.vue'
import GestionAffectations  from './GestionAffectations/GestionAffectations.vue'
import GestionPhases        from './Gestionphases.vue'
import GestionGrille        from './Gestiongrille.vue'
import GestionJury          from './Gestionjury.vue'
import GestionSoutenance    from './Gestionsoutenance.vue'
import FichesEvaluation     from './FichesEvaluation.vue'
import ConsulterResultatFinal from './GestionArchivageCommunication/Consulterresultatfinal.vue'
import ArchivesPfe            from './GestionArchivageCommunication/Archives.vue'
import BiblioPfe              from './GestionArchivageCommunication/Bibliopfe.vue'

// Encadrant pages
import DemandesEncadrement  from './GestionDemandes/DemandesEncadrement.vue'
import SuiviEncadrant       from './Suiviencadrant.vue'
import ReunionEncadrant     from './Reunionencadrant.vue'

// New extracted SFCs
import MonDepartement       from './chef/MonDepartement.vue'
import VoeuxEncadrant       from './encadrant/VoeuxEncadrant.vue'
import EtudiantsAffectes    from './encadrant/EtudiantsAffectes.vue'
import CalendrierSoutenance from './encadrant/CalendrierSoutenance.vue'
import ProposerPlan         from './encadrant/ProposerPlan.vue'
import ProjetsJury          from './jury/ProjetsJury.vue'
import MesEvaluations       from './jury/MesEvaluations.vue'

// Shared
import Messagerie           from './GestionArchivageCommunication/Messagerie.vue'
import ConsulterProfil      from './ConsulterProfil.vue'
import ModifierProfil       from './ModifierProfil.vue'

// ── Breadcrumb map ─────────────────────────────────────────────
const BREADCRUMBS = {
  'voeux-creer':            'Créer un formulaire',
  'voeux-liste':            'Suivi & réponses',
  'affectation':            'Gérer les affectations',
  'mon-departement':        'Mon département',
  'phases':                 "Phases d'évaluation",
  'grille':                 "Grille d'évaluation",
  'jury':                   'Composition des jurys',
  'soutenance':             'Planifier les soutenances',
  'fiches-evaluation':      "Fiches d'évaluation",
  'deliberation-resultats': 'Délibération & Résultats',
  'archivage-archives':     'Archives du département',
  'archivage-bibliotheque': 'Bibliothèque PFE',
  'enc-voeux':              "Mes vœux d'encadrement",
  'enc-demandes':           'Gérer les demandes',
  'enc-affectes':           'Étudiants affectés',
  'enc-suivi':              'Suivi & livrables',
  'enc-reunions':           'Réunions',
  'enc-calendrier':         'Calendrier de soutenance',
  'enc-proposer-plan':      'Proposer un plan',
  'jury-projets':           'Projets à évaluer',
  'jury-evaluations':       'Notes finales',
  'messagerie':             'Messagerie',
  'profil':                 'Mon profil',
  'profil-edit':            'Modifier le profil',
  'tableau-de-bord':        'Tableau de bord',
}

const ENC_PAGES  = ['enc-voeux','enc-demandes','enc-affectes','enc-suivi','enc-reunions','enc-calendrier','enc-proposer-plan']
const JURY_PAGES = ['jury-projets','jury-evaluations']

export default {
  name: 'DashboardChef',

  components: {
    AppShell, NotificationsDropdown,
    DashboardChefHome, CreerFormulaire, ListeFormulaires,
    GestionAffectations, GestionPhases, GestionGrille,
    GestionJury, GestionSoutenance, FichesEvaluation,
    // ✅ Registered under new name
    ConsulterResultatFinal, ArchivesPfe, BiblioPfe,
    DemandesEncadrement, SuiviEncadrant, ReunionEncadrant,
    MonDepartement, VoeuxEncadrant, EtudiantsAffectes,
    CalendrierSoutenance, ProposerPlan,
    ProjetsJury, MesEvaluations, Messagerie,
    ConsulterProfil, ModifierProfil,
  },

  setup () {
    const { toast, showToast, onToastEvent } = useToast()
    const { currentUser, logout }            = useAuth()
    return { toast, showToast, onToastEvent, currentUser, logout }
  },

  data () {
    return {
      currentPage:        'home',

      // Chef
      enseignants:        [],
      etudiants:          [],
      encadrants:         [],
      loadingEtudiants:   false,
      loadingEncadrants:  false,
      formulaireAModifier: null,

      // Encadrant
      nbEnAttente:        0,
      etudiantsAffectes:  [],
      formulaireActif:    null,
      voeuxSoumis:        false,
      voeuxData:          null,
      dateSoumission:     '',
    }
  },

  computed: {
    breadcrumbRoot () {
      if (ENC_PAGES.includes(this.currentPage))  return 'Espace Encadrant'
      if (JURY_PAGES.includes(this.currentPage)) return 'Espace Jury'
      return 'Chef de Département'
    },
    breadcrumb () { return BREADCRUMBS[this.currentPage] || '' },

    projetsNonEvalues () {
      return 0
    },

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
        // ── Chef section ──────────────────────────────────────
        {
          type: 'section', label: 'Chef de Département',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        },
        {
          page: 'mon-departement', label: 'Mon département',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
        },
        {
          type: 'group', key: 'voeux', label: "Vœux d'encadrement",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
          children: [
            { page: 'voeux-creer', label: 'Créer un formulaire' },
            { page: 'voeux-liste', label: 'Suivi & réponses'    },
          ],
        },
        {
          type: 'group', key: 'aff', label: 'Affectation',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
          children: [
            { page: 'affectation', label: 'Gérer les affectations' },
          ],
        },
        {
          type: 'group', key: 'eval', label: 'Évaluation PFE',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
          children: [
            { page: 'phases', label: "Phases d'évaluation" },
            { page: 'grille', label: "Grille d'évaluation"  },
          ],
        },
        {
          type: 'group', key: 'sout', label: 'Soutenances',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
          children: [
            { page: 'jury',       label: 'Composition des jurys'     },
            { page: 'soutenance', label: 'Planifier les soutenances' },
          ],
        },
        {
          type: 'group', key: 'rd', label: 'Résultats & Délibération',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
          children: [
            { page: 'fiches-evaluation',      label: "Fiches d'évaluation"      },
            { page: 'deliberation-resultats', label: 'Délibération & Résultats' },
          ],
        },
        {
          type: 'group', key: 'archivage', label: 'Archivage',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
          children: [
            { page: 'archivage-archives',     label: 'Archives'       },
            { page: 'archivage-bibliotheque', label: 'Bibliothèque'   },
          ],
        },
        // ── Encadrant section ─────────────────────────────────
        {
          type: 'section', label: 'Encadrant',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/><polyline points="16 11 18 13 22 9"/></svg>`,
        },
        {
          page: 'enc-voeux',
          label: this.voeuxSoumis ? 'Ma fiche' : 'Remplir le formulaire',
          badge: !this.voeuxSoumis && this.formulaireActif ? '!' : null,
          badgeCheck: this.voeuxSoumis,
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
        },
        {
          page: 'enc-demandes', label: 'Gérer les demandes',
          badge: this.nbEnAttente > 0 ? this.nbEnAttente : null,
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        },
        {
          page: 'enc-affectes', label: 'Étudiants affectés',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        },
        {
          page: 'enc-suivi', label: 'Suivi & livrables',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
        },
        {
          page: 'enc-reunions', label: 'Réunions',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
        },
        {
          type: 'group', key: 'enc-sout', label: 'Plan de soutenance',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
          children: [
            { page: 'enc-calendrier',    label: 'Calendrier'       },
            { page: 'enc-proposer-plan', label: 'Proposer un plan' },
          ],
        },
        // ── Jury section ──────────────────────────────────────
        {
          type: 'section', label: 'Jury',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        },
        {
          type: 'group', key: 'jury-eval', label: 'Évaluation PFE',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
          children: [
            { page: 'jury-projets',     label: 'Projets à évaluer' },
            { page: 'jury-evaluations', label: 'Notes finales'   },
          ],
        },
        // ── Communication ─────────────────────────────────────
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
      this.chargerEnseignants(),
      this.chargerEtudiants(),
      this.chargerEncadrants(),
      this.chargerDonneesEncadrant(),
      this.chargerFormulaireActif(),
    ])
  },

  methods: {
    navigate (page, payload) {
      if (!page) return
      if (page === 'voeux-creer') {
        // payload is the formulaire to edit, or null/undefined for a new one
        this.formulaireAModifier = payload || null
      }
      this.currentPage = page
    },

    // ── Chef ──────────────────────────────────────────────────
    async chargerEnseignants () {
      try {
        const res = await api.get('/formulaires-voeux/enseignants-de-ma-specialite')
        this.enseignants = res.data || []
      } catch (e) { console.error('enseignants:', e) }
    },

    async chargerEtudiants () {
      this.loadingEtudiants = true
      try {
        const [etuRes, affRes] = await Promise.all([
          api.get('/affectations/etudiants-de-ma-specialite'),
          api.get('/affectations'),
        ])
        const affMap = {}
        ;(affRes.data || []).forEach(a => { if (a.etudiant_id) affMap[a.etudiant_id] = a.encadrant })
        this.etudiants = (etuRes.data || []).map(e => ({ ...e, encadrant: affMap[e.id] || null }))
      } catch (e) { console.error('etudiants:', e) }
      finally { this.loadingEtudiants = false }
    },

    async chargerEncadrants () {
      this.loadingEncadrants = true
      try {
        const res = await api.get('/affectations/encadrants-disponibles')
        this.encadrants = (res.data || []).map(e => ({
          ...e,
          nb_affectes:   e.nb_affectes   || 0,
          capacite:      e.capacite      ?? 5,
          disponibilite: e.disponibilite ?? 'oui',
          themes:        e.themes        ?? null,
          encadrement:   e.encadrement   ?? null,
          cotutelle:     e.cotutelle     ?? false,
          commentaire:   e.commentaire   ?? null,
        }))
      } catch (e) { console.error('encadrants:', e) }
      finally { this.loadingEncadrants = false }
    },

    onModifierFormulaire (f) {
      this.navigate('voeux-creer', f)
    },

    async onFormulaireCree () {
      this.formulaireAModifier = null
      this.navigate('voeux-liste')
    },

    // ── Encadrant ─────────────────────────────────────────────
    async chargerFormulaireActif () {
      try {
        const res = await api.get('/formulaires-voeux')
        const liste = res.data || []

        // Sort descending by created_at so we always pick the most recent
        // active formulaire, not just whichever happens to be first in the array.
        const actifs = liste
          .filter(f => f.statut === 'publie' || f.statut === 'verrouille')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

        const publie = actifs[0]
        if (!publie) return

        this.formulaireActif = publie
        const vRes = await api.get('/voeux-encadrement?formulaire_id=' + publie.id)
        if (vRes.data?.statut === 'soumis') {
          this.voeuxSoumis    = true
          this.voeuxData      = vRes.data
          this.dateSoumission = vRes.data.soumis_at
            ? new Date(vRes.data.soumis_at).toLocaleDateString('fr-FR') : ''
        }
      } catch (e) { console.error('formulaire actif:', e) }
    },

    async chargerDonneesEncadrant () {
      try {
        const [affRes, demRes] = await Promise.all([
          api.get('/affectations/mes-affectations'),
          api.get('/demandes-encadrement'),
        ])
        const raw = affRes.data
        const arr = Array.isArray(raw) ? raw : (raw?.id ? [raw] : [])
        this.etudiantsAffectes = arr.map(a => ({
  id:             a.etudiant_id,
  prenom:         a.etudiant?.split(' ')[0]                ?? '',
  nom:            a.etudiant?.split(' ').slice(1).join(' ') ?? '',
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