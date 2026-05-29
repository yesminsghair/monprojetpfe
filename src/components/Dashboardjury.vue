<template>
  <AppShell
    :nav-items="navItems"
    role-label="Jury"
    breadcrumb-root="Espace Jury"
    :breadcrumb="breadcrumb"
    :current-page="currentPage"
    :current-user="currentUser"
    :toast="toast"
    @navigate="navigate"
    @logout="logout"
  >
    <template #topbar-actions><NotificationsDropdown /></template>

    <Transition name="page" mode="out-in">

      <!-- HOME -->
      <div v-if="currentPage === 'home'" key="home">
        <div class="vld-page-hero">
          <h1 class="vld-page-title">Bonjour, {{ currentUser.prenom }}</h1>
          <p class="vld-page-sub">Consultez vos projets à évaluer et soumettez vos fiches d'évaluation.</p>
        </div>

        <div v-if="projetsNonEvalues > 0" class="vld-banner vld-banner--warning mb-4">
          <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
          <div class="vld-banner__body">
            <div class="vld-banner__title">{{ projetsNonEvalues }} projet(s) en attente d'évaluation</div>
            <div class="vld-banner__sub">La délibération ne peut avoir lieu qu'après toutes les évaluations.</div>
          </div>
          <button class="btn btn-primary btn-sm" @click="navigate('mes-projets')">Évaluer maintenant →</button>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-6 col-lg-3"><div class="vld-kpi"><div class="vld-kpi__icon vld-kpi__icon--blue"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div><div><div class="vld-kpi__value">{{ mesProjets.length }}</div><div class="vld-kpi__label">Projets assignés</div></div></div></div>
          <div class="col-6 col-lg-3"><div class="vld-kpi"><div class="vld-kpi__icon vld-kpi__icon--gold"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div><div class="vld-kpi__value">{{ projetsNonEvalues }}</div><div class="vld-kpi__label">À évaluer</div></div></div></div>
          <div class="col-6 col-lg-3"><div class="vld-kpi"><div class="vld-kpi__icon vld-kpi__icon--green"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div><div><div class="vld-kpi__value">{{ mesEvaluations.length }}</div><div class="vld-kpi__label">Évaluations soumises</div></div></div></div>
          <div class="col-6 col-lg-3"><div class="vld-kpi"><div class="vld-kpi__icon vld-kpi__icon--slate"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div><div class="vld-kpi__value">{{ mesSessions.length }}</div><div class="vld-kpi__label">Sessions planifiées</div></div></div></div>
        </div>

        <div class="vld-section-label">Actions rapides</div>
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <button class="vld-qa" @click="navigate('mes-projets')">
              <div class="vld-qa__icon vld-qa__icon--gold"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div>
              <div><div class="vld-qa__title">Évaluer un projet</div><div class="vld-qa__sub">Consulter le livrable et remplir la grille</div></div>
              <svg class="vld-qa__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div class="col-12 col-md-4">
            <button class="vld-qa" @click="navigate('suivi')">
              <div class="vld-qa__icon vld-qa__icon--blue"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
              <div><div class="vld-qa__title">Suivi des étudiants</div><div class="vld-qa__sub">Consulter l'avancement des projets</div></div>
              <svg class="vld-qa__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div class="col-12 col-md-4">
            <button class="vld-qa" @click="navigate('calendrier')">
              <div class="vld-qa__icon vld-qa__icon--teal"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
              <div><div class="vld-qa__title">Calendrier soutenances</div><div class="vld-qa__sub">Voir mes sessions planifiées</div></div>
              <svg class="vld-qa__arrow" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- PROJETS À ÉVALUER -->
      <ProjetsJury v-else-if="currentPage === 'mes-projets'" key="mes-projets" :current-user="currentUser" @toast="onToastEvent" />

      <!-- MES ÉVALUATIONS -->
      <MesEvaluations v-else-if="currentPage === 'mes-evaluations'" key="mes-evaluations" :current-user="currentUser" />

      <!-- CALENDRIER -->
      <CalendrierSoutenance v-else-if="currentPage === 'calendrier'" key="calendrier" :current-user="currentUser" @toast="onToastEvent" />

      <!-- SUIVI -->
      <div v-else-if="currentPage === 'suivi'" key="suivi">
        <div class="mb-4"><h2 class="vld-page-title">Suivi des étudiants</h2><p class="vld-page-sub">Consultez l'avancement des projets assignés à votre jury</p></div>
        <div v-if="loadingSuivi" class="vld-state"><div class="vld-spinner mx-auto mb-3"></div><p>Chargement...</p></div>
        <div v-else-if="!mesSuivis.length" class="vld-state">
          <div class="vld-state__icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
          <p class="vld-state__title">Aucun étudiant assigné</p>
        </div>
        <div v-else class="row g-3">
          <div v-for="e in mesSuivis" :key="e.id" class="col-12 col-md-6">
            <div class="card h-100"><div class="card-body">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="vld-av vld-av--md" :style="{ background: e.color }">{{ initiales(e.nom) }}</div>
                <div class="flex-grow-1"><div class="fw-bold" style="color:var(--vld-text-strong)">{{ e.nom }}</div><div style="font-size:12.5px;color:var(--vld-text-muted)">{{ e.sujet || '—' }}</div></div>
                <div style="font-family:var(--vld-font-display);font-size:20px;font-weight:700;color:var(--vld-accent)">{{ e.progress }}%</div>
              </div>
              <div class="progress mb-3" style="height:6px"><div class="progress-bar" :style="{ width: e.progress + '%', background: e.color }"></div></div>
              <div class="d-flex align-items-center gap-2" style="font-size:13px">
                <span style="color:var(--vld-text-muted);font-weight:600">Phase :</span>
                <span style="color:var(--vld-text-strong)">{{ e.phaseActuelle || '—' }}</span>
                <span class="badge ms-auto" :class="e.phaseActive ? 'bg-warning text-dark' : 'bg-secondary'">{{ e.phaseActive ? 'En cours' : 'En attente' }}</span>
              </div>
            </div></div>
          </div>
        </div>
      </div>

      <!-- RÉUNIONS -->
      <div v-else-if="currentPage === 'reunions'" key="reunions">
        <div class="mb-4"><h2 class="vld-page-title">Réunions</h2><p class="vld-page-sub">Consultez les réunions liées aux projets de votre jury</p></div>
        <div v-if="loadingReunions" class="vld-state"><div class="vld-spinner mx-auto mb-3"></div><p>Chargement...</p></div>
        <div v-else-if="!mesReunions.length" class="vld-state">
          <div class="vld-state__icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/></svg></div>
          <p class="vld-state__title">Aucune réunion trouvée</p>
        </div>
        <div v-else class="d-flex flex-column gap-3">
          <div v-for="r in mesReunions" :key="r.id" class="card"><div class="card-body d-flex align-items-center gap-4">
            <div class="text-center" style="min-width:52px">
              <div style="font-family:var(--vld-font-display);font-size:26px;font-weight:800;color:var(--vld-primary);line-height:1">{{ formatDay(r.date_reunion) }}</div>
              <div style="font-size:11px;color:var(--vld-text-muted);font-weight:600;text-transform:uppercase">{{ formatMonth(r.date_reunion) }}</div>
            </div>
            <div class="flex-grow-1">
              <div class="fw-bold mb-1" style="color:var(--vld-text-strong)">{{ r.etudiant_nom }}</div>
              <div style="font-size:13px;color:var(--vld-text-muted)">{{ formatTime(r.date_reunion) }} · {{ r.encadrant_nom }}</div>
            </div>
            <span class="badge" :class="r.statut==='confirmee' ? 'bg-success' : r.statut==='annulee' ? 'bg-danger' : 'bg-warning text-dark'">
              {{ { confirmee:'Confirmée', planifiee:'Planifiée', annulee:'Annulée' }[r.statut] || r.statut }}
            </span>
          </div></div>
        </div>
      </div>

      <!-- PROPOSER UN PLAN -->
      <ProposerPlan v-else-if="currentPage === 'proposer-plan'" key="proposer-plan" :current-user="currentUser" :etudiants-affectes="projetsCommeEtudiants" @toast="onToastEvent" />

      <!-- MESSAGERIE -->
      <Messagerie v-else-if="currentPage === 'messagerie'" key="messagerie" />

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

import AppShell              from './AppShell.vue'
import NotificationsDropdown from './GestionArchivageCommunication/Notifications.vue'
import Messagerie            from './GestionArchivageCommunication/Messagerie.vue'
import ConsulterProfil       from './ConsulterProfil.vue'
import ModifierProfil        from './ModifierProfil.vue'
import ProjetsJury           from './jury/ProjetsJury.vue'
import MesEvaluations        from './jury/MesEvaluations.vue'
import CalendrierSoutenance  from './encadrant/CalendrierSoutenance.vue'
import ProposerPlan          from './encadrant/ProposerPlan.vue'

const BREADCRUMBS = {
  'mes-projets':   'Projets à évaluer',
  'mes-evaluations':'Notes finales',
  'calendrier':    'Calendrier',
  'suivi':         'Suivi des étudiants',
  'reunions':      'Réunions',
  'proposer-plan': 'Proposer un plan',
  'messagerie':    'Messagerie',
  'profil':        'Mon profil',
  'profil-edit':   'Modifier le profil',
}
const COLORS = ['#3d6080','#27ae60','#d35400','#8e44ad','#2980b9','#c0392b']

export default {
  name: 'DashboardJury',

  components: {
    AppShell, NotificationsDropdown, Messagerie,
    ProjetsJury, MesEvaluations, CalendrierSoutenance, ProposerPlan,
    ConsulterProfil, ModifierProfil,
  },

  setup () {
    const { toast, showToast, onToastEvent } = useToast()
    const { currentUser, logout }            = useAuth()
    return { toast, showToast, onToastEvent, currentUser, logout }
  },

  data () {
    return {
      currentPage:     'home',
      mesProjets:      [],
      mesEvaluations:  [],
      mesSessions:     [],
      mesSuivis:       [],
      mesReunions:     [],
      loadingSuivi:    false,
      loadingReunions: false,
    }
  },

  computed: {
    breadcrumb ()          { return BREADCRUMBS[this.currentPage] || '' },
    projetsNonEvalues ()   { return this.mesProjets.filter(p => !p.evalue).length },
    projetsCommeEtudiants () {
      return this.mesProjets.map(p => ({
        id:     p.id,
        prenom: p.etudiant_nom?.split(' ')[0] || '',
        nom:    p.etudiant_nom?.split(' ').slice(1).join(' ') || '',
      }))
    },
    navItems () {
      return [
        { page:'home', label:'Tableau de bord', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
        { type:'category', label:'Mes soutenances' },
        { page:'mes-projets', label:'Projets à évaluer', badge:this.projetsNonEvalues>0?this.projetsNonEvalues:null, icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>` },
        { page:'mes-evaluations', label:'Notes finales', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>` },
        { page:'calendrier', label:'Calendrier', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
        { type:'category', label:'Suivi académique' },
        { page:'suivi', label:'Suivi des étudiants', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>` },
        { page:'reunions', label:'Réunions', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
        { type:'category', label:'Planification' },
        { page:'proposer-plan', label:'Proposer un plan', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>` },
        { type:'category', label:'Communication' },
        { page:'messagerie', label:'Messagerie', icon:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>` },
      ]
    },
  },

  async mounted () {
    await Promise.all([this.chargerProjets(), this.chargerSuivi(), this.chargerReunions()])
  },

  methods: {
    navigate (page) { if (page) this.currentPage = page },
    initiales (n)   { return (n||'?').split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2) },
    formatDay (d)   { try { return new Date(d).toLocaleDateString('fr-FR',{day:'numeric'}) } catch { return d } },
    formatMonth (d) { try { return new Date(d).toLocaleDateString('fr-FR',{month:'short',year:'numeric'}).toUpperCase() } catch { return '' } },
    formatTime (d)  { try { return new Date(d).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) } catch { return '' } },

    async chargerProjets () {
      try {
        const userId = this.currentUser.id
        const [juryRes, evalRes, sessRes] = await Promise.allSettled([
          api.get('/jurys'), api.get('/notes-jury'), api.get('/soutenances'),
        ])
        const jurys = juryRes.status==='fulfilled' ? juryRes.value.data : []
        this.mesProjets = jurys
          .filter(j=>(j.membres||[]).some(m=>m.enseignant_id===userId||m.id===userId))
          .map(j=>({ id:j.id, affectation_id:j.affectation_id, titre:j.projet_titre||'Projet #'+j.id, etudiant_nom:j.etudiant_nom||'—', encadrant:j.encadrant_nom||'—', evalue:false }))
        const evals = evalRes.status==='fulfilled' ? evalRes.value.data : []
        this.mesEvaluations = evals.map(e=>({ id:e.id, projet_titre:e.projet_titre||'—', etudiant_nom:e.etudiant_nom||'—', date:e.date?new Date(e.date).toLocaleDateString('fr-FR'):'—', note_totale:e.note_totale||0, criteres:e.criteres||[], commentaire:e.commentaire }))
        this.mesEvaluations.forEach(ev=>{ const p=this.mesProjets.find(pr=>pr.titre===ev.projet_titre); if(p) p.evalue=true })
        const seances = sessRes.status==='fulfilled' ? sessRes.value.data : []
        this.mesSessions = seances.filter(s=>this.mesProjets.some(p=>p.id===s.jury_id)&&s.statut!=='annulee').map(s=>({ id:s.id, jury_id:s.jury_id, date:s.date||s.date_seance?.split('T')[0], projet:s.projet_titre||'—', etudiant:s.etudiant_nom||'—' }))
      } catch (e) { console.error(e) }
    },

    async chargerSuivi () {
      this.loadingSuivi = true
      try {
        const res = await api.get('/suivi/encadrant')
        this.mesSuivis = (res.data||[]).map((e,i)=>({ id:e.id, nom:e.nom, sujet:e.sujet, progress:e.progress||0, phaseActuelle:e.phaseActuelle||'—', phaseActive:e.phaseActive||false, color:COLORS[i%COLORS.length] }))
      } catch { this.mesSuivis=[] }
      finally { this.loadingSuivi=false }
    },

    async chargerReunions () {
      this.loadingReunions = true
      try {
        const res = await api.get('/reunions')
        this.mesReunions = (res.data||[]).filter(r=>r.statut!=='annulee').map(r=>({ id:r.id, etudiant_nom:r.etudiant_nom||'—', encadrant_nom:r.encadrant_nom||'—', date_reunion:r.date_reunion, statut:r.statut }))
      } catch { this.mesReunions=[] }
      finally { this.loadingReunions=false }
    },
  },
}
</script>
<!-- Zero <style> block — all styles from design-tokens.css + Bootstrap -->