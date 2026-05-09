<!--
  DashboardEncadrantHome.vue — Dashboard home for Encadrant
  ──────────────────────────────────────────────────────────
  • Two role tabs: Encadrant | Jury
  • Encadrant tab: hits /dashboard/encadrant (real DB data from EncadrantDashboardController)
  • Jury tab: derived from /jurys-pfe filtered by current user
  • Download PDF via html2canvas + jsPDF (loaded from CDN)
-->
<template>
  <div class="home-wrap" ref="dashboardRoot">

    <!-- ══ HEADER ══ -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Bonjour, {{ currentUser.prenom }} 👋</h1>
        <p class="page-sub">Tableau de bord GIMSI — Pilotage de vos étudiants encadrés</p>
      </div>
      <div class="header-actions">
        <span class="last-refresh">Actualisé à {{ heureActualisation }}</span>
        <button class="btn-refresh" @click="charger" :disabled="loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :class="{spinning: loading}">
            <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Actualiser
        </button>
        <button class="btn-download" @click="telechargerPDF" :disabled="downloading || loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {{ downloading ? 'Export en cours…' : 'Télécharger PDF' }}
        </button>
      </div>
    </div>

    <!-- ══ ROLE TAB SWITCHER ══ -->
    <div class="role-tabs">
      <button
        v-for="tab in roleTabs"
        :key="tab.key"
        class="role-tab"
        :class="{ active: activeRole === tab.key }"
        @click="switchRole(tab.key)"
      >
        <span class="tab-icon" v-html="tab.icon"></span>
        <span class="tab-label">{{ tab.label }}</span>
        <span class="tab-desc" v-if="activeRole === tab.key">{{ tab.desc }}</span>
      </button>
    </div>

    <!-- ══ LOADING ══ -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement des indicateurs…</p>
    </div>

    <!-- ══ ERROR STATE ══ -->
    <div v-else-if="erreur" class="error-state">
      <div class="error-icon">⚠️</div>
      <div class="error-title">Impossible de charger les données</div>
      <div class="error-msg">{{ erreur }}</div>
      <div class="error-hint">Vérifiez que le serveur Laravel tourne et que le token d'authentification est valide. Consultez la console (F12) pour plus de détails.</div>
      <button class="btn-refresh" style="margin-top:16px" @click="charger">Réessayer</button>
    </div>

    <!-- ══════════════════════════════════════════════
         TAB: ENCADRANT  (real data from /dashboard/encadrant)
    ══════════════════════════════════════════════ -->
    <template v-else-if="activeRole === 'encadrant' && !erreur">

      <div class="section-label">Indicateurs clés — Rôle Encadrant</div>
      <div class="kpi-row kpi-5">
        <div class="kpi-card kpi-blue">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ kpi.nbEtudiants }}</div><div class="kpi-label">Étudiants encadrés</div></div>
        </div>
        <div class="kpi-card kpi-teal">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div class="kpi-body">
            <div class="kpi-value">{{ kpi.tauxValidation }}%</div>
            <div class="kpi-label">Taux validation sujets</div>
            <div class="kpi-sub">{{ kpi.sujetsValides }}/{{ kpi.sujetsTotal }} sujets</div>
          </div>
        </div>
        <div class="kpi-card kpi-gold">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ kpi.avancementMoyen }}%</div><div class="kpi-label">Avancement moyen</div></div>
        </div>
        <div class="kpi-card kpi-purple">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ kpi.reunionsMoyennes }}</div><div class="kpi-label">Réunions moy./étudiant</div></div>
        </div>
        <div class="kpi-card" :class="kpi.tauxReussite >= 70 ? 'kpi-green' : 'kpi-red'">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ kpi.tauxReussite }}%</div><div class="kpi-label">Taux de réussite</div></div>
        </div>
      </div>

      <div class="section-label">Validation et suivi des étudiants</div>
      <div class="chart-row two-cols">
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">Validation des sujets PFE</div><div class="chart-badge chart-badge-teal">Camembert</div></div>
          <div class="pie-wrap">
            <div class="chart-area pie-canvas"><canvas ref="sujetsCanvas"></canvas></div>
            <div class="pie-legend">
              <div class="pie-leg-item"><span class="dot dot-teal"></span><span>Validés — <strong>{{ charts.sujets?.values?.[0] || 0 }}</strong></span></div>
              <div class="pie-leg-item"><span class="dot dot-gold"></span><span>En attente — <strong>{{ charts.sujets?.values?.[1] || 0 }}</strong></span></div>
              <div class="pie-rate">{{ kpi.tauxValidation }}% validés</div>
            </div>
          </div>
        </div>
        <div class="chart-card chart-wide">
          <div class="chart-header"><div class="chart-title">Réunions confirmées par étudiant</div><div class="chart-badge">Histogramme</div></div>
          <div class="chart-area"><canvas ref="reunionsCanvas"></canvas></div>
        </div>
      </div>

      <div class="section-label">Livrables et avancement</div>
      <div class="chart-row two-cols">
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">Validation des rapports / livrables</div><div class="chart-badge chart-badge-teal">Camembert</div></div>
          <div class="pie-wrap">
            <div class="chart-area pie-canvas"><canvas ref="rapportsCanvas"></canvas></div>
            <div class="pie-legend">
              <div class="pie-leg-item"><span class="dot dot-teal"></span><span>Validés — <strong>{{ charts.rapports?.values?.[0] || 0 }}</strong></span></div>
              <div class="pie-leg-item"><span class="dot dot-gold"></span><span>En attente — <strong>{{ charts.rapports?.values?.[1] || 0 }}</strong></span></div>
              <div class="pie-leg-item"><span class="dot dot-red"></span><span>Rejetés — <strong>{{ charts.rapports?.values?.[2] || 0 }}</strong></span></div>
              <div class="pie-rate">{{ charts.rapports?.taux || 0 }}% validés</div>
            </div>
          </div>
        </div>
        <div class="chart-card chart-wide">
          <div class="chart-header"><div class="chart-title">Avancement par étudiant (%)</div><div class="chart-badge chart-badge-purple">Barres</div></div>
          <div class="chart-area"><canvas ref="avancementCanvas"></canvas></div>
        </div>
      </div>

      <div class="section-label">Alertes retards et réussite</div>
      <div class="chart-row three-cols">
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">Avancement moyen global</div><div class="chart-badge chart-badge-gold">Jauge</div></div>
          <div class="gauge-wrap">
            <canvas ref="avancGaugeCanvas" height="170"></canvas>
            <div class="gauge-center">
              <div class="gauge-pct">{{ kpi.avancementMoyen }}%</div>
              <div class="gauge-lbl">Progression</div>
            </div>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">PFE en retard sous supervision</div><div class="chart-badge chart-badge-orange">Barres</div></div>
          <div class="retard-summary">
            <div class="retard-big" :class="charts.retard?.taux > 40 ? 'text-red' : charts.retard?.taux > 20 ? 'text-gold' : 'text-teal'">
              {{ charts.retard?.taux || 0 }}%
            </div>
            <div class="retard-sub">des PFE présentent un retard</div>
          </div>
          <div class="chart-area-sm"><canvas ref="retardCanvas"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">Taux de réussite de vos étudiants</div><div class="chart-badge chart-badge-green">Jauge</div></div>
          <div class="gauge-wrap">
            <canvas ref="reussiteCanvas" height="170"></canvas>
            <div class="gauge-center">
              <div class="gauge-pct" :class="kpi.tauxReussite >= 70 ? 'text-teal' : 'text-red'">{{ kpi.tauxReussite }}%</div>
              <div class="gauge-lbl">Admis</div>
            </div>
          </div>
          <div class="planif-details">
            <span class="pd-item"><span class="dot dot-teal"></span>{{ charts.reussite?.admis || 0 }} admis</span>
            <span class="pd-item"><span class="dot dot-red"></span>{{ charts.reussite?.ajournes || 0 }} ajournés</span>
          </div>
        </div>
      </div>

      <div class="section-label">Actions rapides</div>
      <div class="qa-grid">
        <button class="qa-card" @click="$emit('navigate','affectes')">
          <div class="qa-icon qa-blue"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Mes étudiants</div><div class="qa-s">Suivre la progression de chacun</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="qa-card" @click="$emit('navigate','suivi')">
          <div class="qa-icon qa-teal"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Suivi & livrables</div><div class="qa-s">Valider ou rejeter les dépôts</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="qa-card" @click="$emit('navigate','reunions')">
          <div class="qa-icon qa-gold"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Réunions</div><div class="qa-s">Planifier, confirmer, archiver</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="qa-card" @click="$emit('navigate','voeux')">
          <div class="qa-icon qa-purple"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Valider les sujets</div><div class="qa-s">{{ kpi.sujetsTotal - kpi.sujetsValides }} sujets en attente</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         TAB: JURY  (from /jurys-pfe filtered to current user)
    ══════════════════════════════════════════════ -->
    <template v-else-if="activeRole === 'jury' && !erreur">
      <div class="section-label">Indicateurs clés — Rôle Jury</div>
      <div class="kpi-row kpi-4">
        <div class="kpi-card kpi-blue">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ juryData.totalProjets }}</div><div class="kpi-label">Projets à évaluer</div></div>
        </div>
        <div class="kpi-card" :class="juryData.nonEvalues > 0 ? 'kpi-red' : 'kpi-green'">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ juryData.nonEvalues }}</div><div class="kpi-label">Évaluations en attente</div></div>
        </div>
        <div class="kpi-card kpi-teal">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ juryData.evalues }}</div><div class="kpi-label">Évaluations soumises</div></div>
        </div>
        <div class="kpi-card kpi-purple">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ juryData.noteMoyenne }}</div><div class="kpi-label">Note moyenne /20</div></div>
        </div>
      </div>

      <div class="section-label">État des évaluations</div>
      <div class="chart-row two-cols">
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">Avancement des évaluations</div><div class="chart-badge chart-badge-teal">Camembert</div></div>
          <div class="pie-wrap">
            <div class="chart-area pie-canvas"><canvas ref="juryEtatCanvas"></canvas></div>
            <div class="pie-legend">
              <div class="pie-leg-item"><span class="dot dot-teal"></span><span>Soumises — <strong>{{ juryData.evalues }}</strong></span></div>
              <div class="pie-leg-item"><span class="dot dot-gold"></span><span>En attente — <strong>{{ juryData.nonEvalues }}</strong></span></div>
              <div class="pie-rate">{{ juryData.totalProjets > 0 ? Math.round(juryData.evalues / juryData.totalProjets * 100) : 0 }}% complétées</div>
            </div>
          </div>
        </div>
        <div class="chart-card chart-wide">
          <div class="chart-header"><div class="chart-title">Notes attribuées par projet</div><div class="chart-badge">Histogramme</div></div>
          <div class="chart-area"><canvas ref="juryNotesCanvas"></canvas></div>
        </div>
      </div>

      <div class="section-label">Actions rapides</div>
      <div class="qa-grid">
        <button class="qa-card" @click="$emit('navigate','projets-a-evaluer')">
          <div class="qa-icon qa-blue"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Projets à évaluer</div><div class="qa-s">{{ juryData.nonEvalues }} en attente</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="qa-card" @click="$emit('navigate','mes-evaluations')">
          <div class="qa-icon qa-teal"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Mes évaluations</div><div class="qa-s">Historique des notes soumises</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="qa-card" @click="$emit('navigate','calendrier-soutenance')">
          <div class="qa-icon qa-gold"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Calendrier soutenance</div><div class="qa-s">Sessions planifiées</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="qa-card" @click="$emit('navigate','proposer-plan')">
          <div class="qa-icon qa-purple"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Proposer un plan</div><div class="qa-s">Soumettre des créneaux</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </template>

  </div>
</template>

<script>
import api from '@/services/api.js'
import {
  Chart, BarController, LineController, DoughnutController,
  BarElement, LineElement, PointElement, ArcElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler
} from 'chart.js'

Chart.register(
  BarController, LineController, DoughnutController,
  BarElement, LineElement, PointElement, ArcElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler
)

function hex(h, a) {
  const r = parseInt(h.slice(1, 3), 16)
  const g = parseInt(h.slice(3, 5), 16)
  const b = parseInt(h.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

const C = { teal: '#27ae60', gold: '#f5a623', blue: '#3d6080', red: '#e74c3c', purple: '#8e44ad', slate: '#7f8c8d' }

export default {
  name: 'DashboardEncadrantHome',

  props: {
    currentUser: { type: Object, default: () => ({}) },
  },

  emits: ['navigate'],

  data() {
    return {
      activeRole: 'encadrant',
      loading: false,
      downloading: false,
      heureActualisation: '--:--',
      instances: {},

      roleTabs: [
        {
          key: 'encadrant',
          label: 'Encadrant',
          desc: 'Suivi de vos étudiants encadrés',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/><polyline points="16 11 18 13 22 9"/></svg>',
        },
        {
          key: 'jury',
          label: 'Jury',
          desc: 'Vos évaluations de soutenance',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        },
      ],

      // Encadrant KPIs — from /dashboard/encadrant (EncadrantDashboardController)
      kpi: { nbEtudiants: 0, tauxValidation: 0, avancementMoyen: 0, reunionsMoyennes: 0, tauxReussite: 0, sujetsValides: 0, sujetsTotal: 0 },
      charts: { sujets: null, reunions: null, rapports: null, avancement: null, retard: null, reussite: null },

      // Jury data — derived from /jurys-pfe
      juryData: { totalProjets: 0, evalues: 0, nonEvalues: 0, noteMoyenne: '—', projets: [], notes: [] },

      erreur: null,
      loaded: { encadrant: false, jury: false },
    }
  },

  async mounted() {
    await this.charger()
  },

  beforeUnmount() {
    this.destroyAll()
  },

  methods: {
    async switchRole(role) {
      this.destroyAll()
      this.activeRole = role
      if (!this.loaded[role]) {
        await this.charger()
      } else {
        await this.$nextTick()
        this.buildCharts()
      }
    },

    async charger() {
      this.loading = true
      this.erreur = null
      try {
        if (this.activeRole === 'encadrant') {
          // ── REAL DB CALL ── hits EncadrantDashboardController@index
          const res = await api.get('/dashboard/encadrant')
          this.kpi = res.data.kpi
          this.charts = {
            sujets:     res.data.charts.validationSujets,
            reunions:   res.data.charts.chargeSuiviEtudiants,
            rapports:   res.data.charts.validationRapports,
            avancement: res.data.charts.avancementMoyen,
            retard:     res.data.charts.pfeEnRetard,
            reussite:   res.data.charts.tauxReussite,
          }
        } else {
          // ── JURY — derived from /jurys-pfe ──
          const userId = this.currentUser.id
          const res = await api.get('/jurys-pfe')
          const mesProjets = (res.data || []).filter(j =>
            (j.membres || []).some(m => m.enseignant_id === userId)
          )
          const evalues = mesProjets.filter(j => {
            const m = (j.membres || []).find(m => m.enseignant_id === userId)
            return m && m.note !== null
          })
          const notesData = evalues.map(j => {
            const m = (j.membres || []).find(m => m.enseignant_id === userId)
            return { titre: j.projet_titre || ('Projet #' + j.id), note: m?.note || 0 }
          })
          const noteMoyenne = notesData.length > 0
            ? (notesData.reduce((s, n) => s + n.note, 0) / notesData.length).toFixed(1)
            : '—'
          this.juryData = {
            totalProjets: mesProjets.length,
            evalues: evalues.length,
            nonEvalues: mesProjets.length - evalues.length,
            noteMoyenne,
            projets: notesData.map(n => n.titre),
            notes: notesData.map(n => n.note),
          }
        }
        this.loaded[this.activeRole] = true
        this.heureActualisation = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      } catch (e) {
        const status = e?.response?.status
        const msg    = e?.response?.data?.message || e?.message || 'Erreur inconnue'
        console.error(`[Dashboard Encadrant] Erreur ${status || ''}:`, msg, e)
        this.erreur = `Erreur ${status ? status + ' — ' : ''}${msg}`
      } finally {
        this.loading = false
        await this.$nextTick()
        this.buildCharts()
      }
    },

    // ── CHART ROUTER ───────────────────────────────────────────────
    buildCharts() {
      if (this.activeRole === 'encadrant') this.buildEncCharts()
      else                                  this.buildJuryCharts()
    },

    destroyAll() { Object.values(this.instances).forEach(c => c?.destroy()); this.instances = {} },
    d(key)       { this.instances[key]?.destroy(); delete this.instances[key] },

    // ── ENCADRANT CHARTS ───────────────────────────────────────────
    buildEncCharts() {
      this.buildSujets(); this.buildReunions(); this.buildRapports()
      this.buildAvancement(); this.buildAvancGauge(); this.buildRetard(); this.buildReussite()
    },

    buildSujets() {
      this.d('sujets'); const ctx = this.$refs.sujetsCanvas
      if (!ctx || !this.charts.sujets?.values?.length) return
      this.instances.sujets = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: this.charts.sujets.labels, datasets: [{ data: this.charts.sujets.values, backgroundColor: [hex(C.teal,.8), hex(C.gold,.75)], borderColor: [C.teal,C.gold], borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw} sujet(s)` } } } },
      })
    },

    buildReunions() {
      this.d('reunions'); const ctx = this.$refs.reunionsCanvas
      if (!ctx || !this.charts.reunions?.labels?.length) return
      this.instances.reunions = new Chart(ctx, {
        type: 'bar',
        data: { labels: this.charts.reunions.labels, datasets: [{ label: 'Réunions', data: this.charts.reunions.values, backgroundColor: this.charts.reunions.values.map((_,i)=>hex(Object.values(C)[i%6],.72)), borderRadius: 6, borderSkipped: false }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw} réunion(s)` } } }, scales: { y: { beginAtZero: true, ticks: { stepSize:1, color:'#8a9aaa' }, grid: { color:'rgba(200,196,188,0.1)' } }, x: { ticks: { color:'#8a9aaa', maxRotation:30 }, grid: { display:false } } } },
      })
    },

    buildRapports() {
      this.d('rapports'); const ctx = this.$refs.rapportsCanvas
      if (!ctx || !this.charts.rapports?.values?.length) return
      this.instances.rapports = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: this.charts.rapports.labels, datasets: [{ data: this.charts.rapports.values, backgroundColor: [hex(C.teal,.8), hex(C.gold,.75), hex(C.red,.7)], borderColor: [C.teal,C.gold,C.red], borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw} livrable(s)` } } } },
      })
    },

    buildAvancement() {
      this.d('avancement'); const ctx = this.$refs.avancementCanvas
      if (!ctx || !this.charts.avancement?.labels?.length) return
      this.instances.avancement = new Chart(ctx, {
        type: 'bar',
        data: { labels: this.charts.avancement.labels, datasets: [{ label: 'Avancement (%)', data: this.charts.avancement.values, backgroundColor: this.charts.avancement.values.map(v => v>=70?hex(C.teal,.75):v>=40?hex(C.gold,.75):hex(C.red,.7)), borderRadius: 5, borderSkipped: false }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display:false }, tooltip: { callbacks: { label: c => ` ${c.raw}% avancement` } } }, scales: { x: { min:0, max:100, ticks: { callback: v=>v+'%', color:'#8a9aaa' }, grid: { color:'rgba(200,196,188,0.1)' } }, y: { ticks: { color:'#8a9aaa' }, grid: { display:false } } } },
      })
    },

    buildAvancGauge() {
      this.d('avancGauge'); const ctx = this.$refs.avancGaugeCanvas; if (!ctx) return
      const v = this.kpi.avancementMoyen; const color = v>=70?C.teal:v>=40?C.gold:C.red
      this.instances.avancGauge = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: [v,100-v], backgroundColor: [hex(color,.85), hex(C.slate,.15)], borderColor: [color,'transparent'], borderWidth:2, circumference:270, rotation:-135 }] },
        options: { responsive:true, maintainAspectRatio:false, cutout:'72%', plugins: { legend:{display:false}, tooltip:{callbacks:{label:c=>` ${c.raw}%`}} } },
      })
    },

    buildRetard() {
      this.d('retard'); const ctx = this.$refs.retardCanvas
      if (!ctx || !this.charts.retard?.labels?.length) return
      this.instances.retard = new Chart(ctx, {
        type: 'bar',
        data: { labels: this.charts.retard.labels, datasets: [{ label:'En retard', data:this.charts.retard.values, backgroundColor:this.charts.retard.values.map(v=>v?hex(C.red,.75):hex(C.teal,.65)), borderRadius:6, borderSkipped:false }] },
        options: { responsive:true, maintainAspectRatio:false, plugins: { legend:{display:false}, tooltip:{callbacks:{label:c=>c.raw?'⚠ En retard':'✓ À jour'}} }, scales: { y:{min:0,max:1,ticks:{stepSize:1,callback:v=>v===1?'Retard':'OK',color:'#8a9aaa'},grid:{color:'rgba(200,196,188,0.1)'}}, x:{ticks:{color:'#8a9aaa',maxRotation:30},grid:{display:false}} } },
      })
    },

    buildReussite() {
      this.d('reussite'); const ctx = this.$refs.reussiteCanvas; if (!ctx) return
      const v = this.kpi.tauxReussite; const color = v>=70?C.teal:C.red
      this.instances.reussite = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data:[v,100-v], backgroundColor:[hex(color,.85),hex(C.slate,.15)], borderColor:[color,'transparent'], borderWidth:2, circumference:270, rotation:-135 }] },
        options: { responsive:true, maintainAspectRatio:false, cutout:'72%', plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw}%`}}} },
      })
    },

    // ── JURY CHARTS ────────────────────────────────────────────────
    buildJuryCharts() { this.buildJuryEtat(); this.buildJuryNotes() },

    buildJuryEtat() {
      this.d('juryEtat'); const ctx = this.$refs.juryEtatCanvas; if (!ctx) return
      this.instances.juryEtat = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Soumises','En attente'], datasets: [{ data:[this.juryData.evalues,this.juryData.nonEvalues], backgroundColor:[hex(C.teal,.8),hex(C.gold,.75)], borderColor:[C.teal,C.gold], borderWidth:2 }] },
        options: { responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw} évaluation(s)`}}} },
      })
    },

    buildJuryNotes() {
      this.d('juryNotes'); const ctx = this.$refs.juryNotesCanvas
      if (!ctx || !this.juryData.projets?.length) return
      this.instances.juryNotes = new Chart(ctx, {
        type: 'bar',
        data: { labels: this.juryData.projets, datasets: [{ label:'Note /20', data:this.juryData.notes, backgroundColor:this.juryData.notes.map(n=>n>=10?hex(C.teal,.75):hex(C.red,.7)), borderRadius:6, borderSkipped:false }] },
        options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw}/20`}}}, scales: { y:{min:0,max:20,ticks:{stepSize:4,color:'#8a9aaa'},grid:{color:'rgba(200,196,188,0.1)'}}, x:{ticks:{color:'#8a9aaa',maxRotation:30},grid:{display:false}} } },
      })
    },

    // ── PDF EXPORT ─────────────────────────────────────────────────
    async telechargerPDF() {
      this.downloading = true
      try {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'html2canvas')
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf')
        const el = this.$refs.dashboardRoot
        const canvas = await window.html2canvas(el, { scale: 1.5, useCORS: true, backgroundColor: '#c8c4bc', logging: false })
        const imgData = canvas.toDataURL('image/png')
        const { jsPDF } = window.jspdf
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' })
        const pdfW = pdf.internal.pageSize.getWidth()
        const ratio = canvas.width / canvas.height
        const imgH = pdfW / ratio
        pdf.addImage(imgData, 'PNG', 0, 0, pdfW, imgH)
        const role = this.activeRole === 'encadrant' ? 'Encadrant' : 'Jury'
        const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')
        pdf.save(`Dashboard_${role}_${date}.pdf`)
      } catch (e) {
        console.error('Erreur export PDF:', e)
        alert('Erreur lors de la génération du PDF.')
      } finally {
        this.downloading = false
      }
    },

    loadScript(src, globalKey) {
      if (window[globalKey]) return Promise.resolve()
      return new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = src; s.onload = resolve; s.onerror = reject
        document.head.appendChild(s)
      })
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600&display=swap');
.home-wrap { padding: 0; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title  { font-family: 'Merriweather', serif; font-size: 22px; font-weight: 700; color: #1e2a35; margin-bottom: 4px; }
.page-sub    { font-size: 13.5px; color: #7A8FA6; }
.header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.last-refresh { font-size: 12px; color: #aaa; }

.btn-refresh, .btn-download { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1.5px solid #c8c4bc; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: all .18s; }
.btn-refresh  { background: #e8e4dc; color: #4a5a6a; }
.btn-download { background: #3d6080; color: #fff; border-color: #3d6080; }
.btn-refresh:hover:not(:disabled)  { border-color: #3d6080; color: #3d6080; }
.btn-download:hover:not(:disabled) { background: #2f4f6a; }
.btn-refresh:disabled, .btn-download:disabled { opacity: .5; cursor: not-allowed; }
.spinning { animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.role-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 14px; padding: 6px; }
.role-tab { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border: none; border-radius: 10px; background: transparent; color: #7A8FA6; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: all .2s; }
.role-tab:hover { background: rgba(61,96,128,0.08); color: #3d6080; }
.role-tab.active { background: #fff; color: #3d6080; box-shadow: 0 2px 8px rgba(61,96,128,0.15); border: 1.5px solid #c8c4bc; }
.tab-icon { display: flex; align-items: center; }
.tab-desc { font-size: 11px; font-weight: 400; color: #8a9aaa; border-left: 1px solid #c8c4bc; margin-left: 4px; padding-left: 8px; }

.section-label { font-size: 11px; font-weight: 700; color: #8a9aaa; text-transform: uppercase; letter-spacing: .1em; margin: 24px 0 12px; }

.kpi-row { display: grid; gap: 14px; margin-bottom: 8px; }
.kpi-5 { grid-template-columns: repeat(5,1fr); }
.kpi-4 { grid-template-columns: repeat(4,1fr); }
.kpi-card { background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 14px; padding: 18px 16px; display: flex; align-items: center; gap: 13px; box-shadow: 0 2px 10px rgba(0,0,0,.05); }
.kpi-icon-wrap { width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-blue .kpi-icon-wrap   { background: rgba(61,96,128,.12);  color: #3d6080; }
.kpi-teal .kpi-icon-wrap   { background: rgba(39,174,96,.12);  color: #27ae60; }
.kpi-gold .kpi-icon-wrap   { background: rgba(245,166,35,.12); color: #d98e1a; }
.kpi-red .kpi-icon-wrap    { background: rgba(231,76,60,.12);  color: #e74c3c; }
.kpi-green .kpi-icon-wrap  { background: rgba(39,174,96,.12);  color: #27ae60; }
.kpi-purple .kpi-icon-wrap { background: rgba(142,68,173,.12); color: #8e44ad; }
.kpi-value { font-family: 'Merriweather', serif; font-size: 22px; font-weight: 700; color: #1e2a35; line-height: 1; }
.kpi-label { font-size: 11.5px; color: #8a9aaa; margin-top: 3px; }
.kpi-sub   { font-size: 11px; color: #aab; margin-top: 2px; }

.chart-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 8px; }
.two-cols    { grid-template-columns: 1fr 2fr; }
.three-cols  { grid-template-columns: repeat(3,1fr); }
.chart-card  { background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 16px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,.05); }
.chart-header{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.chart-title { font-size: 13px; font-weight: 700; color: #1e2a35; }
.chart-badge { font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: rgba(61,96,128,.12); color: #3d6080; }
.chart-badge-teal   { background: rgba(39,174,96,.12);  color: #27ae60; }
.chart-badge-gold   { background: rgba(245,166,35,.12); color: #d98e1a; }
.chart-badge-orange { background: rgba(245,166,35,.12); color: #d98e1a; }
.chart-badge-purple { background: rgba(142,68,173,.12); color: #8e44ad; }
.chart-badge-green  { background: rgba(39,174,96,.12);  color: #27ae60; }
.chart-area    { height: 200px; position: relative; }
.chart-area-sm { height: 130px; position: relative; }

.pie-wrap   { display: flex; align-items: center; gap: 20px; min-height: 180px; }
.pie-canvas { flex-shrink: 0; width: 160px !important; height: 160px !important; }
.pie-legend { display: flex; flex-direction: column; gap: 8px; }
.pie-leg-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1e2a35; }
.pie-rate { margin-top: 6px; font-family: 'Merriweather', serif; font-size: 18px; font-weight: 700; color: #1e2a35; }

.gauge-wrap   { position: relative; height: 170px; display: flex; align-items: center; justify-content: center; }
.gauge-center { position: absolute; text-align: center; top: 54%; transform: translateY(-50%); }
.gauge-pct    { font-family: 'Merriweather', serif; font-size: 24px; font-weight: 700; color: #1e2a35; }
.gauge-lbl    { font-size: 12px; color: #8a9aaa; margin-top: 2px; }

.retard-summary { text-align: center; margin-bottom: 10px; }
.retard-big     { font-family: 'Merriweather', serif; font-size: 32px; font-weight: 700; }
.retard-sub     { font-size: 12px; color: #7A8FA6; margin-top: 2px; }
.text-teal { color: #27ae60; }.text-gold { color: #d98e1a; }.text-red { color: #e74c3c; }

.dot       { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
.dot-teal  { background: #27ae60; }.dot-gold { background: #f5a623; }.dot-red { background: #e74c3c; }

.planif-details { display: flex; justify-content: center; gap: 20px; margin-top: 8px; }
.pd-item { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #7A8FA6; }

.qa-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-top: 8px; }
.qa-card { display: flex; align-items: center; gap: 12px; background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 14px; padding: 16px; cursor: pointer; text-align: left; transition: all .2s; }
.qa-card:hover { border-color: #3d6080; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(61,96,128,.12); }
.qa-icon   { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.qa-blue   { background: rgba(61,96,128,.12);  color: #3d6080; }
.qa-teal   { background: rgba(39,174,96,.12);  color: #27ae60; }
.qa-gold   { background: rgba(245,166,35,.12); color: #d98e1a; }
.qa-purple { background: rgba(142,68,173,.12); color: #8e44ad; }
.qa-txt { flex: 1; }
.qa-t { font-size: 13px; font-weight: 600; color: #1e2a35; margin-bottom: 2px; }
.qa-s { font-size: 12px; color: #8a9aaa; }
.qa-arr { color: #c8c4bc; flex-shrink: 0; transition: transform .18s, color .18s; }
.qa-card:hover .qa-arr { transform: translateX(3px); color: #3d6080; }

.loading-state { text-align: center; padding: 60px; color: #7A8FA6; }
.spinner { width: 32px; height: 32px; border: 3px solid #c8c4bc; border-top-color: #3d6080; border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 12px; }

.error-state { background: #fff5f5; border: 1.5px solid #f5c6cb; border-radius: 14px; padding: 36px; text-align: center; margin-top: 12px; }
.error-icon  { font-size: 40px; margin-bottom: 12px; }
.error-title { font-family: 'Merriweather', serif; font-size: 16px; font-weight: 700; color: #c0392b; margin-bottom: 8px; }
.error-msg   { font-size: 13.5px; color: #e74c3c; font-weight: 600; margin-bottom: 10px; background: #fde8e8; padding: 8px 14px; border-radius: 8px; display: inline-block; }
.error-hint  { font-size: 12.5px; color: #888; max-width: 520px; margin: 0 auto; line-height: 1.6; }

@media(max-width:1200px) {
  .kpi-5, .kpi-4 { grid-template-columns: repeat(2,1fr); }
  .chart-row, .two-cols, .three-cols { grid-template-columns: 1fr; }
  .qa-grid { grid-template-columns: repeat(2,1fr); }
  .role-tab .tab-desc { display: none; }
}
@media(max-width:768px) {
  .kpi-5, .kpi-4 { grid-template-columns: repeat(2,1fr); }
  .qa-grid { grid-template-columns: 1fr; }
  .pie-canvas { width: 120px !important; height: 120px !important; }
}
</style>