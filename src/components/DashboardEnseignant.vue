<template>
  <AppShell
    :nav-items="navItems"
    :role-label="roleLabel"
    :breadcrumb-root="'Espace ' + roleLabel"
    :breadcrumb="breadcrumb"
    :current-page="currentPage"
    :current-user="currentUser"
    :toast="toast"
    @navigate="navigate"
    @logout="logout"
  >
    <template #topbar-actions><NotificationsDropdown /></template>
    <Transition name="page" mode="out-in">

      <!-- ── Home ───────────────────────────────────────────── -->
      <div v-if="currentPage === 'home'" key="home">
        <div class="vld-page-hero">
          <h1 class="vld-page-title">Bonjour, {{ currentUser.prenom }}</h1>
          <p class="vld-page-sub">Exprimez vos vœux d'encadrement pour les PFE.</p>
        </div>
        <div v-if="formulaireActif && !voeuxSoumis" class="vld-banner vld-banner--warning mb-4">
          <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
          <div class="vld-banner__body"><div class="vld-banner__title">Formulaire de vœux disponible</div><div class="vld-banner__sub">Date limite : <strong>{{ formatDate(formulaireActif.date_limite) }}</strong></div></div>
          <button class="btn btn-primary btn-sm" @click="navigate('voeux')">Remplir maintenant →</button>
        </div>
        <div v-if="voeuxSoumis" class="vld-banner vld-banner--success mb-4">
          <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div class="vld-banner__body">
            <div class="vld-banner__title">Fiche de vœux soumise</div>
            <div class="vld-banner__sub">{{ dateSoumission }}<template v-if="voeuxData?.disponibilite"> · {{ labelDisponibilite(voeuxData.disponibilite) }}</template><template v-if="voeuxData?.nbre_etudiants"> · {{ voeuxData.nbre_etudiants }} étudiant(s) max</template></div>
          </div>
          <button class="btn btn-outline-success btn-sm" @click="navigate('voeux')">Consulter →</button>
        </div>
        <div class="row g-3 mb-4">
          <div class="col-4"><div class="vld-kpi"><div class="vld-kpi__icon vld-kpi__icon--gold"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div><div class="vld-kpi__value">{{ voeuxSoumis ? '✓' : '—' }}</div><div class="vld-kpi__label">Fiche vœux</div></div></div></div>
          <div class="col-4"><div class="vld-kpi"><div class="vld-kpi__icon vld-kpi__icon--blue"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="vld-kpi__value">{{ voeuxData?.nbre_etudiants ?? '—' }}</div><div class="vld-kpi__label">Capacité déclarée</div></div></div></div>
          <div class="col-4"><div class="vld-kpi"><div class="vld-kpi__icon vld-kpi__icon--green"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div><div class="vld-kpi__value">{{ formulaireActif ? formatDateCourt(formulaireActif.date_limite) : '—' }}</div><div class="vld-kpi__label">Date limite</div></div></div></div>
        </div>
        <div class="vld-section-label">Actions rapides</div>
        <div class="row g-3" style="max-width:520px">
          <div class="col-12"><button class="vld-qa" @click="navigate('voeux')"><div class="vld-qa__icon vld-qa__icon--gold"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div><div><div class="vld-qa__title">{{ voeuxSoumis ? 'Consulter ma fiche' : 'Remplir le formulaire' }}</div><div class="vld-qa__sub">{{ voeuxSoumis ? 'Voir vos préférences soumises' : 'Disponibilité, spécialités, capacité' }}</div></div><svg class="vld-qa__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button></div>
          <div class="col-12"><button class="vld-qa" @click="navigate('messagerie')"><div class="vld-qa__icon vld-qa__icon--teal"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div><div class="vld-qa__title">Messagerie</div><div class="vld-qa__sub">Communiquer avec les autres utilisateurs</div></div><svg class="vld-qa__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button></div>
          <div class="col-12"><button class="vld-qa" @click="navigate('biblio-pfe')"><div class="vld-qa__icon vld-qa__icon--blue"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div><div><div class="vld-qa__title">Bibliothèque PFE</div><div class="vld-qa__sub">Consulter les meilleurs projets</div></div><svg class="vld-qa__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button></div>
        </div>
      </div>

      <!-- ── Voeux (replaces both 'remplir' and 'ma-fiche') ── -->
      <VoeuxEncadrant
        v-else-if="currentPage === 'voeux'"
        key="voeux"
        :formulaire-actif="formulaireActif"
        :voeux-soumis="voeuxSoumis"
        :voeux-data="voeuxData"
        :date-soumission="dateSoumission"
        @voeux-soumis="onVoeuxSoumis"
        @role-changed="onRoleChanged"
        @toast="onToastEvent"
      />

      <Messagerie        v-else-if="currentPage === 'messagerie'"  key="messagerie" />
      <ConsulterResultat v-else-if="currentPage === 'resultats'"   key="resultats" />
      <Archives          v-else-if="currentPage === 'archives'"    key="archives" />
      <BiblioPFE         v-else-if="currentPage === 'biblio-pfe'"  key="biblio-pfe" />
      <ConsulterProfil   v-else-if="currentPage === 'profil'"      key="profil" @modifier="navigate('profil-edit')" />
      <ModifierProfil    v-else-if="currentPage === 'profil-edit'" key="profil-edit" @annuler="navigate('profil')" @sauvegarde="navigate('profil')" />

    </Transition>
  </AppShell>
</template>

<script>
import api from '@/services/api.js'
import { useToast } from '@/composables/useToast'
import { useAuth  } from '@/composables/useAuth'
import AppShell              from './AppShell.vue'
import NotificationsDropdown from './GestionArchivageCommunication/Notifications.vue'
import Messagerie            from './GestionArchivageCommunication/Messagerie.vue'
import ConsulterResultat     from './GestionArchivageCommunication/Consulterresultatfinal.vue'
import Archives              from './GestionArchivageCommunication/Archives.vue'
import BiblioPFE             from './GestionArchivageCommunication/Bibliopfe.vue'
import VoeuxEncadrant        from './encadrant/VoeuxEncadrant.vue'
import ConsulterProfil       from './ConsulterProfil.vue'
import ModifierProfil        from './ModifierProfil.vue'

const BREADCRUMBS = {
  'voeux':       "Mes vœux d'encadrement",
  'messagerie':  'Messagerie',
  'resultats':   'Résultats des soutenances',
  'archives':    'Archives',
  'biblio-pfe':  'Bibliothèque PFE',
  'profil':      'Mon profil',
  'profil-edit': 'Modifier le profil',
}

export default {
  name: 'DashboardEnseignant',
  components: { AppShell, NotificationsDropdown, Messagerie, ConsulterResultat, Archives, BiblioPFE, VoeuxEncadrant, ConsulterProfil, ModifierProfil },

  setup () {
    const { toast, showToast, onToastEvent } = useToast()
    const { currentUser, logout }            = useAuth()
    return { toast, showToast, onToastEvent, currentUser, logout }
  },

  data () {
    return { currentPage: 'home', formulaireActif: null, voeuxSoumis: false, voeuxData: null, dateSoumission: '' }
  },

  computed: {
    breadcrumb () { return BREADCRUMBS[this.currentPage] || '' },
    roleLabel ()  { return this.currentUser.role === 'encadrant' ? 'Encadrant' : 'Enseignant' },
    navItems () {
      return [
        { page:'home', label:'Tableau de bord', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
        { type:'category', label:"Vœux d'encadrement" },
        { page:'voeux', label: this.voeuxSoumis ? 'Ma fiche' : 'Remplir le formulaire', badge: !this.voeuxSoumis && this.formulaireActif ? '!' : null, badgeCheck: this.voeuxSoumis, icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>` },
        { type:'category', label:'Communication' },
        { page:'messagerie', label:'Messagerie', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>` },
        { type:'category', label:'Archives & Résultats' },
        { page:'resultats', label:'Résultats soutenances', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>` },
        { page:'archives', label:'Archives', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>` },
        { page:'biblio-pfe', label:'Bibliothèque PFE', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>` },
        { type:'category', label:'Mon compte' },
        { page:'profil', label:'Mon profil', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
      ]
    },
  },

  async mounted () { await this.chargerFormulaireActif() },

  methods: {
    navigate (page) { this.currentPage = page },

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
          this.dateSoumission = vRes.data.soumis_at ? new Date(vRes.data.soumis_at).toLocaleDateString('fr-FR') : ''
          this.currentPage    = 'voeux'
        }
      } catch (e) { console.error(e) }
    },

    onVoeuxSoumis (voeux) {
      this.voeuxSoumis    = true
      this.voeuxData      = voeux
      this.dateSoumission = new Date().toLocaleDateString('fr-FR')
      this.showToast('Vos vœux ont été soumis avec succès !', 'ok')
    },

    onRoleChanged (newRole) {
      if (!newRole) return
      const u = { ...this.currentUser, role: newRole }
      localStorage.setItem('user', JSON.stringify(u))
      this.showToast('Votre rôle est maintenant : Encadrant !', 'ok')
    },

    formatDate (d)      { if (!d) return '—'; try { return new Date(d).toLocaleDateString('fr-FR') } catch { return d } },
    formatDateCourt (d) { if (!d) return '—'; try { return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' }) } catch { return d } },
    labelDisponibilite (d) { return { oui:'Disponible', partielle:'Partiellement disponible', non:'Non disponible' }[d] || d || '—' },
  },
}
</script>