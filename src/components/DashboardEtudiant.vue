<template>
  <AppShell
    :nav-items="navItems"
    role-label="Étudiant"
    breadcrumb-root="Espace Étudiant"
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

      <!-- ══ HOME ══ -->
      <div v-if="currentPage === 'home'" key="home">
        <div class="vld-page-hero">
          <h1 class="vld-page-title">Bonjour, {{ currentUser.prenom }}</h1>
          <p class="vld-page-sub">Soumettez et suivez votre demande d'encadrement PFE.</p>
        </div>

        <div v-if="monAffectation && monAffectation.statut === 'diffusee'" class="vld-banner vld-banner--success mb-4">
          <div class="vld-banner__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="vld-banner__body">
            <div class="vld-banner__title">Votre affectation a été publiée !</div>
            <div class="vld-banner__sub">Encadrant : <strong>{{ monAffectation.encadrant || '—' }}</strong><span v-if="monAffectation.specialite"> · {{ monAffectation.specialite }}</span></div>
          </div>
          <span class="badge bg-success">✓ Officiel</span>
        </div>

        <div v-if="!accordMutuelActif && !monAffectation" class="vld-banner vld-banner--info mb-4">
          <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
          <div>Le chef de département gère les affectations automatiquement. Les demandes directes ne sont pas disponibles.</div>
        </div>

        <!-- Demande status card -->
        <div v-if="maDemande && accordMutuelActif" class="card mb-4">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="vld-av vld-av--md" :style="{ background: maDemande.statut==='acceptee' ? '#27ae60' : maDemande.statut==='rejetee' ? '#e74c3c' : 'var(--vld-accent)' }">
              <svg v-if="maDemande.statut==='acceptee'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else-if="maDemande.statut==='rejetee'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="flex-grow-1 overflow-hidden">
              <div class="fw-bold text-truncate" style="color:var(--vld-text-strong)">{{ maDemande.sujet || maDemande.titre }}</div>
              <div class="text-truncate" style="font-size:12.5px;color:var(--vld-text-muted)">{{ maDemande.encadrant }} · {{ maDemande.specialite }}</div>
              <span class="badge mt-1" :class="maDemande.statut==='acceptee' ? 'bg-success' : maDemande.statut==='rejetee' ? 'bg-danger' : 'bg-warning text-dark'">{{ labelStatut(maDemande.statut) }}</span>
            </div>
            <div class="d-flex gap-2 flex-shrink-0">
              <button class="vld-icon-btn vld-icon-btn--view" @click="navigate('consulter-demande')" title="Consulter">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button v-if="maDemande.statut==='en_attente'" class="vld-icon-btn vld-icon-btn--edit" @click="navigate('modifier-demande')" title="Modifier">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button v-if="maDemande.statut==='en_attente'" class="vld-icon-btn vld-icon-btn--del" @click="navigate('annuler-demande')" title="Annuler">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- KPIs -->
        <div class="row g-3 mb-4">
          <div class="col-4"><div class="vld-kpi"><div class="vld-kpi__icon vld-kpi__icon--gold"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div><div><div class="vld-kpi__value">{{ maDemande ? '✓' : '—' }}</div><div class="vld-kpi__label">Demande</div></div></div></div>
          <div class="col-4"><div class="vld-kpi"><div class="vld-kpi__icon" :class="monAffectation ? 'vld-kpi__icon--green' : 'vld-kpi__icon--slate'"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="vld-kpi__value">{{ monAffectation ? '✓' : '—' }}</div><div class="vld-kpi__label">Affectation</div></div></div></div>
          <div class="col-4"><div class="vld-kpi"><div class="vld-kpi__icon vld-kpi__icon--blue"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div><div class="vld-kpi__value">{{ encadrants.filter(e=>e.disponible).length }}</div><div class="vld-kpi__label">Encadrants dispo</div></div></div></div>
        </div>

        <!-- Quick actions -->
        <div class="vld-section-label">Actions</div>
        <div class="row g-3">
          <div v-if="accordMutuelActif" class="col-12 col-md-6">
            <button class="vld-qa" @click="navigate('ma-demande')">
              <div class="vld-qa__icon vld-qa__icon--gold"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
              <div><div class="vld-qa__title">{{ maDemande ? 'Gérer ma demande' : 'Soumettre une demande' }}</div><div class="vld-qa__sub">Titre, description, encadrant, document</div></div>
              <svg class="vld-qa__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div class="col-12 col-md-6">
            <button class="vld-qa" @click="navigate('encadrants')">
              <div class="vld-qa__icon vld-qa__icon--blue"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
              <div><div class="vld-qa__title">Parcourir les encadrants</div><div class="vld-qa__sub">Spécialités et disponibilités</div></div>
              <svg class="vld-qa__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div class="col-12 col-md-6">
            <button class="vld-qa" @click="navigate('livrables')">
              <div class="vld-qa__icon vld-qa__icon--gold"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
              <div><div class="vld-qa__title">Mes livrables</div><div class="vld-qa__sub">Déposer et suivre mes livrables</div></div>
              <svg class="vld-qa__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div class="col-12 col-md-6">
            <button class="vld-qa" @click="navigate('reunions')">
              <div class="vld-qa__icon vld-qa__icon--teal"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
              <div><div class="vld-qa__title">Réunions</div><div class="vld-qa__sub">Planifier des créneaux avec mon encadrant</div></div>
              <svg class="vld-qa__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <!-- ── Résultat final quick action ── -->
          <div class="col-12 col-md-6">
            <button class="vld-qa" @click="navigate('resultats')">
              <div class="vld-qa__icon vld-qa__icon--green"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
              <div><div class="vld-qa__title">Mon résultat final</div><div class="vld-qa__sub">Note, mention et décision de délibération</div></div>
              <svg class="vld-qa__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <!-- ── Bibliothèque PFE quick action ── -->
          <div class="col-12 col-md-6">
            <button class="vld-qa" @click="navigate('bibliotheque')">
              <div class="vld-qa__icon vld-qa__icon--blue"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
              <div><div class="vld-qa__title">Bibliothèque PFE</div><div class="vld-qa__sub">Meilleurs projets et étudiants primés</div></div>
              <svg class="vld-qa__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- ══ MA DEMANDE ══ -->
      <MaDemande
        v-else-if="['ma-demande','consulter-demande','modifier-demande','annuler-demande'].includes(currentPage)"
        :key="currentPage"
        :current-page="currentPage"
        :ma-demande="maDemande"
        :encadrants="encadrants"
        :accord-mutuel-actif="accordMutuelActif"
        @demande-updated="d => maDemande = d"
        @toast="onToastEvent"
        @navigate="navigate"
      />

      <!-- ══ ENCADRANTS ══ -->
      <EncadrantsDisponibles
        v-else-if="currentPage === 'encadrants'"
        key="encadrants"
        :encadrants="encadrants"
        :ma-demande="maDemande"
        :accord-mutuel-actif="accordMutuelActif"
        @choisir="onChoisirEncadrant"
        @navigate="navigate"
      />

      <!-- ══ LIVRABLES ══ -->
      <LivrableEtudiant v-else-if="currentPage === 'livrables'" key="livrables" @toast="onToastEvent" />

      <!-- ══ RÉUNIONS ══ -->
      <ReunionEtudiant v-else-if="currentPage === 'reunions'" key="reunions" @toast="onToastEvent" />

      <!-- ══ MON RÉSULTAT FINAL ══ -->
      <MonResultat v-else-if="currentPage === 'resultats'" key="resultats" :current-user="currentUser" />

      <!-- ══ BIBLIOTHÈQUE PFE ══ -->
      <BiblioPFE v-else-if="currentPage === 'bibliotheque'" key="bibliotheque" />

      <!-- ══ MESSAGERIE ══ -->
      <Messagerie v-else-if="currentPage === 'messagerie'" key="messagerie" />

      <!-- ══ PROFIL ══ -->
      <ConsulterProfil v-else-if="currentPage === 'profil'" key="profil" @modifier="navigate('profil-edit')" />
      <ModifierProfil  v-else-if="currentPage === 'profil-edit'" key="profil-edit" @annuler="navigate('profil')" @sauvegarde="navigate('profil')" />

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
import LivrableEtudiant      from './Livrablesetudiant.vue'
import ReunionEtudiant       from './Reunionetudiant.vue'
import ConsulterProfil       from './ConsulterProfil.vue'
import ModifierProfil        from './ModifierProfil.vue'
import MaDemande             from './etudiant/MaDemande.vue'
import EncadrantsDisponibles from './etudiant/EncadrantsDisponibles.vue'
// ── NEW ──────────────────────────────────────────────────────────────────────
import MonResultat from './etudiant/MonResultat.vue'
import BiblioPFE   from './GestionArchivageCommunication/Bibliopfe.vue'
// ─────────────────────────────────────────────────────────────────────────────

const BREADCRUMBS = {
  'ma-demande':       'Ma demande',
  'consulter-demande':'Consulter ma demande',
  'modifier-demande': 'Modifier ma demande',
  'annuler-demande':  'Annuler ma demande',
  'encadrants':       'Encadrants disponibles',
  'livrables':        'Mes livrables',
  'reunions':         'Réunions',
  'messagerie':       'Messagerie',
  'resultats':        'Mon résultat final',       // ← new
  'bibliotheque':     'Bibliothèque PFE',         // ← new
  'profil':           'Mon profil',
  'profil-edit':      'Modifier le profil',
}

export default {
  name: 'DashboardEtudiant',
  components: {
    AppShell, NotificationsDropdown, Messagerie,
    LivrableEtudiant, ReunionEtudiant, ConsulterProfil, ModifierProfil,
    MaDemande, EncadrantsDisponibles,
    MonResultat, BiblioPFE,                        // ← new
  },
  setup () {
    const { toast, showToast, onToastEvent } = useToast()
    const { currentUser, logout }            = useAuth()
    return { toast, showToast, onToastEvent, currentUser, logout }
  },
  data () {
    return {
      currentPage: 'home', maDemande: null, encadrants: [],
      accordMutuelActif: false, monAffectation: null,
      monResultat: null, loadingResultat: false,
    }
  },
  computed: {
    breadcrumb () { return BREADCRUMBS[this.currentPage] || '' },
    navItems () {
      return [
        { page:'home', label:'Tableau de bord', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
        { type:'category', label:"Demande d'encadrement" },
        { page:'ma-demande', label: this.maDemande ? 'Ma demande' : 'Soumettre une demande', badge: this.accordMutuelActif && !this.maDemande ? '!' : null, icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>` },
        { page:'encadrants', label:'Encadrants disponibles', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
        { type:'category', label:'Mon projet PFE' },
        { page:'livrables', label:'Mes livrables', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>` },
        { page:'reunions', label:'Réunions', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
        { page:'resultats', label:'Mon résultat final', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>` },
        // ── NEW ──────────────────────────────────────────────────────────────
        { page:'bibliotheque', label:'Bibliothèque PFE', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>` },
        // ─────────────────────────────────────────────────────────────────────
        { type:'category', label:'Communication' },
        { page:'messagerie', label:'Messagerie', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>` },
      ]
    },
  },
  async mounted () {
    await this.chargerDonnees()
  },
  methods: {
    async navigate (page) {
      if (page) this.currentPage = page
      if (page === 'encadrants') await this.chargerEncadrants()
    },
    async chargerEncadrants () {
      try {
        const r = await api.get('/affectations/encadrants-disponibles')
        // Guard: backend must return an array — if it returns an object (e.g.
        // a debug payload or an unexpected shape) treat it as empty.
        this.encadrants = Array.isArray(r.data) ? r.data : []
      } catch (e) {
        console.error('chargerEncadrants:', e)
        this.encadrants = []
      }
    },
    onChoisirEncadrant (enc) { this.showToast(`${enc.prenom} ${enc.nom} sélectionné(e).`, 'ok'); this.navigate('ma-demande') },
    labelStatut (s) { return { en_attente:'En attente', acceptee:'Acceptée', rejetee:'Rejetée' }[s] || s },
    mention (n) { if (n>=16) return 'Très bien'; if (n>=14) return 'Bien'; if (n>=12) return 'Assez bien'; if (n>=10) return 'Passable'; return 'Insuffisant' },
    async chargerDonnees () {
      try {
        // encadrants-disponibles est isolé : son éventuel échec (ex. backend)
        // ne doit pas bloquer le chargement du mode ni de la demande.
        const [demRes, modeRes, affRes] = await Promise.all([
          api.get('/demandes-encadrement'),
          api.get('/affectations/mode'),
          api.get('/affectations/mon-affectation').catch(() => ({ data: null })),
        ])
        const demData = demRes.data
        this.maDemande = Array.isArray(demData) ? (demData[0] || null) : (demData?.id ? demData : null)
        this.accordMutuelActif = modeRes.data?.mode === 'manuel'
        const affData = affRes.data
        this.monAffectation = affData?.id ? affData : (Array.isArray(affData) ? affData.find(a=>a.statut==='diffusee')||null : null)
      } catch (e) { this.accordMutuelActif = false }

      // Chargement des encadrants séparé pour ne pas bloquer le reste
      await this.chargerEncadrants()
    },
  },
}
</script>
<!-- Zero <style> block — all styles from design-tokens.css + Bootstrap -->