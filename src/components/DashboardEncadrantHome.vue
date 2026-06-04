<template>
  <div ref="dashboardRoot">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
      <div>
        <h1 class="vld-page-title">Bonjour, {{ currentUser.prenom }} 👋</h1>
        <p class="vld-page-sub">{{ isHome ? "Vue d'ensemble — Indicateurs globaux" : "Tableau de bord — Pilotage de votre activité d'encadrement" }}</p>
      </div>
      <div class="d-flex gap-2 align-items-center flex-wrap">
        <span style="font-size:12px;color:var(--vld-text-muted)">Actualisé à {{ heureActualisation }}</span>
        <button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                @click="charger" :disabled="loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5" :class="{'spin-anim':loading}">
            <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Actualiser
        </button>

        <!-- PDF — tableau de bord uniquement -->
        <button v-if="!isHome"
                class="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                @click="telechargerPDF" :disabled="downloading||loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {{ downloading ? 'Export...' : 'PDF' }}
        </button>

        <!-- CTA → tableau de bord complet (accueil uniquement) -->
        <button v-if="isHome"
                class="btn btn-primary btn-sm d-flex align-items-center gap-2"
                @click="$emit('navigate', 'tableau-de-bord')">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Tableau de bord complet
        </button>
      </div>
    </div>

    <div v-if="loading" class="vld-state">
      <div class="vld-spinner mx-auto mb-3"></div><p>Chargement...</p>
    </div>
    <div v-else-if="erreur" class="alert alert-danger">
      {{ erreur }}<br>
      <button class="btn btn-danger btn-sm mt-2" @click="charger">Réessayer</button>
    </div>

    <!-- ════════════════════════════════════
         ENCADRANT
    ════════════════════════════════════ -->
    <template v-else>
      <div class="vld-section-label">Indicateurs clés</div>
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-2">
          <div class="vld-kpi">
            <div class="vld-kpi__icon vld-kpi__icon--blue"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
            <div><div class="vld-kpi__value">{{ kpi.nbEtudiants }}</div><div class="vld-kpi__label">Étudiants encadrés</div></div>
          </div>
        </div>
        <div class="col-6 col-lg-2">
          <div class="vld-kpi">
            <div class="vld-kpi__icon vld-kpi__icon--green"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
            <div><div class="vld-kpi__value">{{ kpi.tauxValidation }}%</div><div class="vld-kpi__label">Taux de validation</div></div>
          </div>
        </div>
        <div class="col-6 col-lg-2">
          <div class="vld-kpi">
            <div class="vld-kpi__icon vld-kpi__icon--gold"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
            <div><div class="vld-kpi__value">{{ kpi.avancementMoyen }}%</div><div class="vld-kpi__label">Avancement moyen</div></div>
          </div>
        </div>
        <div class="col-6 col-lg-2">
          <div class="vld-kpi">
            <div class="vld-kpi__icon vld-kpi__icon--slate"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></div>
            <div><div class="vld-kpi__value">{{ kpi.tauxReussite }}%</div><div class="vld-kpi__label">Taux de réussite</div></div>
          </div>
        </div>
        <div class="col-6 col-lg-2">
          <div class="vld-kpi">
            <div class="vld-kpi__icon vld-kpi__icon--blue"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
            <div><div class="vld-kpi__value">{{ kpi.reunionsMoyennes }}</div><div class="vld-kpi__label">Réunions / étudiant</div></div>
          </div>
        </div>
        <div class="col-6 col-lg-2">
          <div class="vld-kpi">
            <div class="vld-kpi__icon" :style="kpi.tauxRetard > 0 ? 'background:rgba(231,76,60,.15)' : 'background:rgba(39,174,96,.15)'"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="kpi.tauxRetard > 0 ? '#e74c3c' : '#27ae60'" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
            <div><div class="vld-kpi__value" :style="kpi.tauxRetard > 0 ? 'color:#e74c3c' : ''">{{ kpi.tauxRetard }}%</div><div class="vld-kpi__label">PFE en retard</div></div>
          </div>
        </div>
      </div>

      <!-- ACCUEIL : bannière CTA + raccourcis -->
      <template v-if="isHome">
        <div class="vld-section-label">Accès rapide</div>
        <div class="row g-3">
          <div class="col-12 col-sm-6 col-lg-4" v-for="s in encShortcuts" :key="s.page">
            <div class="card h-100" style="cursor:pointer;transition:box-shadow .15s"
                 @click="$emit('navigate', s.page)"
                 @mouseenter="e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.12)'"
                 @mouseleave="e => e.currentTarget.style.boxShadow=''">
              <div class="card-body d-flex align-items-center gap-3">
                <div class="vld-kpi__icon flex-shrink-0" :class="s.icon"><span v-html="s.svg"></span></div>
                <div>
                  <div class="fw-semibold" style="font-size:14px;color:var(--vld-text-strong)">{{ s.label }}</div>
                  <div style="font-size:12px;color:var(--vld-text-muted)">{{ s.desc }}</div>
                </div>
                <svg class="ms-auto flex-shrink-0" xmlns="http://www.w3.org/2000/svg"
                     width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2.5" style="opacity:.4">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- TABLEAU DE BORD : graphiques encadrant -->
      <template v-else>
        <div class="row g-4 mb-4">
          <div class="col-12 col-md-4">
            <div class="card h-100">
              <div class="card-header">Validation des sujets</div>
              <div class="card-body d-flex align-items-center justify-content-center"
                   style="height:180px;position:relative">
                <canvas ref="sujetsCanvas"></canvas>
                <div style="position:absolute;text-align:center;pointer-events:none">
                  <div style="font-family:var(--vld-font-display);font-size:22px;font-weight:700;color:var(--vld-text-strong)">{{ kpi.tauxValidation }}%</div>
                  <div style="font-size:11px;color:var(--vld-text-muted)">Validés</div>
                </div>
              </div>
              <div class="card-footer bg-transparent d-flex gap-3" style="font-size:12.5px">
                <span><span class="badge bg-success me-1">●</span>{{ kpi.sujetsValides }} validés</span>
                <span><span class="badge bg-warning me-1">●</span>{{ kpi.sujetsTotal - kpi.sujetsValides }} en attente</span>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-8">
            <div class="card h-100">
              <div class="card-header">Charge de suivi par étudiant</div>
              <div class="card-body" style="height:180px"><canvas ref="reunionsCanvas"></canvas></div>
            </div>
          </div>
        </div>
        <div class="row g-4 mb-4">
          <div class="col-12 col-md-4">
            <div class="card h-100">
              <div class="card-header">Validation des rapports</div>
              <div class="card-body d-flex align-items-center justify-content-center"
                   style="height:180px;position:relative">
                <canvas ref="rapportsCanvas"></canvas>
                <div style="position:absolute;text-align:center;pointer-events:none">
                  <div style="font-family:var(--vld-font-display);font-size:22px;font-weight:700;color:var(--vld-text-strong)">{{ charts.rapports?.taux ?? 0 }}%</div>
                  <div style="font-size:11px;color:var(--vld-text-muted)">Validés</div>
                </div>
              </div>
              <div class="card-footer bg-transparent d-flex gap-3 flex-wrap" style="font-size:12.5px">
                <span><span class="badge bg-success me-1">●</span>{{ charts.rapports?.values?.[0] ?? 0 }} validés</span>
                <span><span class="badge bg-warning me-1">●</span>{{ charts.rapports?.values?.[1] ?? 0 }} en attente</span>
                <span><span class="badge bg-danger me-1">●</span>{{ charts.rapports?.values?.[2] ?? 0 }} rejetés</span>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="card h-100">
              <div class="card-header">Avancement moyen</div>
              <div class="card-body d-flex align-items-center justify-content-center"
                   style="height:180px;position:relative">
                <canvas ref="avancGaugeCanvas"></canvas>
                <div style="position:absolute;text-align:center;pointer-events:none">
                  <div style="font-family:var(--vld-font-display);font-size:22px;font-weight:700;color:var(--vld-text-strong)">{{ kpi.avancementMoyen }}%</div>
                  <div style="font-size:11px;color:var(--vld-text-muted)">Moyen</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="card h-100">
              <div class="card-header">PFE en retard</div>
              <div class="card-body" style="height:180px"><canvas ref="retardCanvas"></canvas></div>
            </div>
          </div>
        </div>
        <div class="row g-4 mb-4">
          <div class="col-12 col-md-4">
            <div class="card">
              <div class="card-header">Taux de réussite</div>
              <div class="card-body d-flex align-items-center justify-content-center"
                   style="height:180px;position:relative">
                <canvas ref="reussiteCanvas"></canvas>
                <div style="position:absolute;text-align:center;pointer-events:none">
                  <div style="font-family:var(--vld-font-display);font-size:24px;font-weight:700;color:var(--vld-text-strong)">{{ kpi.tauxReussite }}%</div>
                  <div style="font-size:11px;color:var(--vld-text-muted)">Réussite</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-8">
            <div class="card h-100">
              <div class="card-header">Avancement par étudiant</div>
              <div class="card-body" style="height:180px"><canvas ref="avancementCanvas"></canvas></div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- jury tab removed -->
    <template v-if="false">
      <div class="vld-section-label">Indicateurs clés — Jury</div>
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
          <div class="vld-kpi">
            <div class="vld-kpi__icon vld-kpi__icon--blue"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div>
            <div><div class="vld-kpi__value">{{ juryData.totalProjets }}</div><div class="vld-kpi__label">Projets assignés</div></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="vld-kpi">
            <div class="vld-kpi__icon vld-kpi__icon--green"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
            <div><div class="vld-kpi__value">{{ juryData.evalues }}</div><div class="vld-kpi__label">Évalués</div></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="vld-kpi">
            <div class="vld-kpi__icon vld-kpi__icon--gold"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
            <div><div class="vld-kpi__value">{{ juryData.nonEvalues }}</div><div class="vld-kpi__label">En attente</div></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="vld-kpi">
            <div class="vld-kpi__icon vld-kpi__icon--slate"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></div>
            <div><div class="vld-kpi__value">{{ juryData.noteMoyenne }}</div><div class="vld-kpi__label">Note moyenne</div></div>
          </div>
        </div>
      </div>

      <!-- ACCUEIL : bannière CTA + raccourcis -->
      <template v-if="isHome">
        <div class="card mb-4" style="border:1.5px dashed var(--vld-border);background:transparent">
          <div class="card-body d-flex align-items-center justify-content-between gap-3 flex-wrap py-3">
            <div>
              <div class="fw-semibold" style="color:var(--vld-text-strong)">Accéder au tableau de bord complet</div>
              <div style="font-size:13px;color:var(--vld-text-muted)">État des évaluations et notes par projet…</div>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 flex-shrink-0"
                    @click="$emit('navigate', 'tableau-de-bord')">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              Ouvrir le tableau de bord
            </button>
          </div>
        </div>
        <div class="vld-section-label">Accès rapide</div>
        <div class="row g-3">
          <div class="col-12 col-sm-6 col-lg-4" v-for="s in juryShortcuts" :key="s.page">
            <div class="card h-100" style="cursor:pointer;transition:box-shadow .15s"
                 @click="$emit('navigate', s.page)"
                 @mouseenter="e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.12)'"
                 @mouseleave="e => e.currentTarget.style.boxShadow=''">
              <div class="card-body d-flex align-items-center gap-3">
                <div class="vld-kpi__icon flex-shrink-0" :class="s.icon"><span v-html="s.svg"></span></div>
                <div>
                  <div class="fw-semibold" style="font-size:14px;color:var(--vld-text-strong)">{{ s.label }}</div>
                  <div style="font-size:12px;color:var(--vld-text-muted)">{{ s.desc }}</div>
                </div>
                <svg class="ms-auto flex-shrink-0" xmlns="http://www.w3.org/2000/svg"
                     width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2.5" style="opacity:.4">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!juryData.totalProjets" class="vld-state mt-4">
          <p class="vld-state__title">Aucun projet de jury assigné</p>
        </div>
      </template>

      <!-- TABLEAU DE BORD : graphiques jury -->
      <template v-else>
        <!-- Row 1: État évaluations + Notes par projet -->
        <div class="row g-4 mb-4">
          <div class="col-12 col-md-5">
            <div class="card h-100">
              <div class="card-header">État des évaluations</div>
              <div class="card-body" style="height:200px"><canvas ref="juryEtatCanvas"></canvas></div>
              <div class="card-footer bg-transparent d-flex gap-3" style="font-size:12.5px">
                <span><span class="badge bg-success me-1">●</span>{{ juryData.evalues }} soumises</span>
                <span><span class="badge bg-warning me-1">●</span>{{ juryData.nonEvalues }} en attente</span>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-7">
            <div class="card h-100">
              <div class="card-header">Notes par projet</div>
              <div class="card-body" style="height:200px"><canvas ref="juryNotesCanvas"></canvas></div>
            </div>
          </div>
        </div>

        <!-- Row 2: Soutenances — Planification & Calendrier -->
        <div class="vld-section-label">Soutenances — Planification et respect du calendrier</div>
        <div class="row g-4 mb-4">
          <!-- Taux de planification gauge -->
          <div class="col-12 col-md-5">
            <div class="card h-100">
              <div class="card-header d-flex align-items-center justify-content-between">
                <span>Taux de planification</span>
                <span class="badge" style="background:var(--vld-blue);font-size:11px">Jauge</span>
              </div>
              <div class="card-body d-flex align-items-center justify-content-center"
                   style="height:200px;position:relative">
                <canvas ref="juryPlanifCanvas"></canvas>
                <div style="position:absolute;text-align:center;pointer-events:none">
                  <div style="font-family:var(--vld-font-display);font-size:26px;font-weight:700;color:var(--vld-text-strong)">
                    {{ juryData.soutenances.total > 0 ? Math.round(juryData.soutenances.planifiees / juryData.soutenances.total * 100) : 0 }}%
                  </div>
                  <div style="font-size:11px;color:var(--vld-text-muted)">Planifiées</div>
                </div>
              </div>
              <div class="card-footer bg-transparent d-flex gap-3" style="font-size:12.5px">
                <span><span class="badge bg-success me-1">●</span>{{ juryData.soutenances.planifiees }} planifiées</span>
                <span><span class="badge" style="background:#666;font-size:10px">●</span> {{ juryData.soutenances.total - juryData.soutenances.planifiees }} restantes</span>
              </div>
            </div>
          </div>
          <!-- Respect du calendrier par mois -->
          <div class="col-12 col-md-7">
            <div class="card h-100">
              <div class="card-header d-flex align-items-center justify-content-between">
                <span>Respect du calendrier par mois</span>
                <span class="badge" style="background:var(--vld-teal);font-size:11px">Ligne</span>
              </div>
              <div class="card-body" style="height:200px"><canvas ref="juryCalendrierCanvas"></canvas></div>
            </div>
          </div>
        </div>

        <div v-if="!juryData.totalProjets" class="vld-state mt-4">
          <p class="vld-state__title">Aucun projet de jury assigné</p>
        </div>
      </template>
    </template>

  </div>
</template>

<script>
import api from '@/services/api.js'
import { Chart, BarController, LineController, DoughnutController, BarElement, LineElement, PointElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, Filler } from 'chart.js'
Chart.register(BarController, LineController, DoughnutController, BarElement, LineElement, PointElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

function hex(h, a) {
  const r=parseInt(h.slice(1,3),16), g=parseInt(h.slice(3,5),16), b=parseInt(h.slice(5,7),16)
  return `rgba(${r},${g},${b},${a})`
}
const C = { teal:'#27ae60', gold:'#f5a623', blue:'#3d6080', red:'#e74c3c', purple:'#8e44ad', slate:'#7f8c8d' }

export default {
  name: 'DashboardEncadrantHome',

  props: {
    currentUser: { type: Object, default: () => ({}) },
    // 'home'      → page d'accueil : KPIs + raccourcis, sans graphiques
    // 'dashboard' → tableau de bord : KPIs + tous les graphiques
    pageMode: { type: String, default: 'dashboard' },
  },

  emits: ['navigate'],

  data() {
    return {
      activeRole: 'encadrant',
      loading: false, downloading: false,
      heureActualisation: '--:--',
      instances: {}, erreur: null,
      loaded: { encadrant: false },


      kpi: { nbEtudiants:0, tauxValidation:0, avancementMoyen:0, reunionsMoyennes:0, tauxReussite:0, sujetsValides:0, sujetsTotal:0, tauxRetard:0 },
      charts: { sujets:null, reunions:null, rapports:null, avancement:null, retard:null, reussite:null },
      juryData: { totalProjets:0, evalues:0, nonEvalues:0, noteMoyenne:'—', projets:[], notes:[], soutenances:{ total:0, planifiees:0, calendrier:{ labels:[], total:[], aTemps:[] } } },

      encShortcuts: [
        { page:'demandes',  label:'Gérer les demandes',  desc:'Traiter les demandes en attente',  icon:'vld-kpi__icon--blue',  svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
        { page:'affectes',  label:'Étudiants affectés',  desc:'Voir vos étudiants encadrés',      icon:'vld-kpi__icon--green', svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
        { page:'suivi',     label:'Suivi & livrables',   desc:'Valider les livrables étudiants',  icon:'vld-kpi__icon--gold',  svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
        { page:'reunions',  label:'Réunions',            desc:'Planifier vos réunions de suivi',  icon:'vld-kpi__icon--slate', svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
        { page:'calendrier-soutenance', label:'Calendrier soutenance', desc:'Consulter le calendrier prévu',   icon:'vld-kpi__icon--blue',  svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
        { page:'proposer-plan',         label:'Proposer un plan',     desc:'Soumettre un plan de soutenance', icon:'vld-kpi__icon--green', svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
      ],

      juryShortcuts: [
        { page:'projets-a-evaluer', label:'Projets à évaluer', desc:'Accéder aux projets de soutenance', icon:'vld-kpi__icon--blue',  svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
        { page:'mes-evaluations',   label:'Notes finales',     desc:'Saisir et consulter vos notes',    icon:'vld-kpi__icon--green', svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>' },
      ],
    }
  },

  computed: {
    isHome() { return this.pageMode === 'home' },
  },

  async mounted() { await this.charger() },
  beforeUnmount() { this.destroyAll() },

  methods: {
    async switchRole(role) {
      this.destroyAll(); this.activeRole = role
      if (!this.loaded[role]) { await this.charger() }
      else { await this.$nextTick(); this.buildCharts() }
    },

    async charger() {
      this.loading = true; this.erreur = null
      try {
        const r = await api.get('/dashboard/encadrant')
        this.kpi = r.data.kpi
        this.charts = {
          sujets:    r.data.charts.validationSujets,
          reunions:  r.data.charts.chargeSuiviEtudiants,
          rapports:  r.data.charts.validationRapports,
          avancement:r.data.charts.avancementMoyen,
          retard:    r.data.charts.pfeEnRetard,
          reussite:  r.data.charts.tauxReussite,
        }
        this.loaded.encadrant = true
        this.heureActualisation = new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
      } catch(e) {
        const s = e?.response?.status
        const m = e?.response?.data?.message || e?.message || 'Erreur'
        this.erreur = `Erreur ${s ? s+' — ' : ''}${m}`
      } finally {
        this.loading = false
        await this.$nextTick()
        this.buildCharts()
      }
    },

    // En mode 'home' les canvas ne sont pas dans le DOM
    buildCharts() {
      if (this.isHome) return
      this.buildEncCharts()
    },
    destroyAll() { Object.values(this.instances).forEach(c=>c?.destroy()); this.instances={} },
    d(key) { this.instances[key]?.destroy(); delete this.instances[key] },

    // ── Encadrant charts ─────────────────────────────────────
    buildEncCharts() { this.buildSujets(); this.buildReunions(); this.buildRapports(); this.buildAvancement(); this.buildAvancGauge(); this.buildRetard(); this.buildReussite() },
    buildSujets()    { this.d('sujets');    const ctx=this.$refs.sujetsCanvas;    if(!ctx||!this.charts.sujets?.values?.length) return;    this.instances.sujets=new Chart(ctx,{type:'doughnut',data:{labels:this.charts.sujets.labels,datasets:[{data:this.charts.sujets.values,backgroundColor:[hex(C.teal,.8),hex(C.gold,.75)],borderColor:[C.teal,C.gold],borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${ctx.raw}`}}}}}) },
    buildReunions()  { this.d('reunions');  const ctx=this.$refs.reunionsCanvas;  if(!ctx||!this.charts.reunions?.labels?.length) return;  this.instances.reunions=new Chart(ctx,{type:'bar',data:{labels:this.charts.reunions.labels,datasets:[{label:'Réunions',data:this.charts.reunions.values,backgroundColor:this.charts.reunions.values.map((_,i)=>hex(Object.values(C)[i%6],.72)),borderRadius:6,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1,color:'#8a9aaa'},grid:{color:'rgba(200,196,188,0.1)'}},x:{ticks:{color:'#8a9aaa',maxRotation:30},grid:{display:false}}}}}) },
    buildRapports()  { this.d('rapports');  const ctx=this.$refs.rapportsCanvas;  if(!ctx||!this.charts.rapports?.values?.length||this.charts.rapports.values.reduce((a,b)=>a+b,0)===0) return;  this.instances.rapports=new Chart(ctx,{type:'doughnut',data:{labels:this.charts.rapports.labels,datasets:[{data:this.charts.rapports.values,backgroundColor:[hex(C.teal,.8),hex(C.gold,.75),hex(C.red,.7)],borderColor:[C.teal,C.gold,C.red],borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${ctx.raw}`}}}}}) },
    buildAvancement(){ this.d('avancement');const ctx=this.$refs.avancementCanvas;if(!ctx||!this.charts.avancement?.labels?.length) return; this.instances.avancement=new Chart(ctx,{type:'bar',data:{labels:this.charts.avancement.labels,datasets:[{label:'Avancement (%)',data:this.charts.avancement.values,backgroundColor:this.charts.avancement.values.map(v=>v>=70?hex(C.teal,.75):v>=40?hex(C.gold,.75):hex(C.red,.7)),borderRadius:5,borderSkipped:false}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{min:0,max:100,ticks:{callback:v=>v+'%',color:'#8a9aaa'},grid:{color:'rgba(200,196,188,0.1)'}},y:{ticks:{color:'#8a9aaa'},grid:{display:false}}}}}) },
    buildAvancGauge(){ this.d('avancGauge');const ctx=this.$refs.avancGaugeCanvas;if(!ctx) return; const v=this.kpi.avancementMoyen; const c=v>=70?C.teal:v>=40?C.gold:C.red; this.instances.avancGauge=new Chart(ctx,{type:'doughnut',data:{datasets:[{data:[v,100-v],backgroundColor:[hex(c,.85),hex(C.slate,.15)],borderColor:[c,'transparent'],borderWidth:2,circumference:270,rotation:-135}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{display:false}}}}) },
    buildRetard() {
      this.d('retard')
      const ctx = this.$refs.retardCanvas
      if (!ctx || !this.charts.retard?.labels?.length) return
      const values = this.charts.retard.values
      const allZero = values.every(v => v === 0)
      if (allZero) {
        ctx.style.display = 'none'
        if (!ctx.parentElement.querySelector('.retard-ok-msg')) {
          const div = document.createElement('div')
          div.className = 'retard-ok-msg d-flex flex-column align-items-center justify-content-center h-100 gap-1'
          div.style.cssText = 'color:#27ae60;font-size:13px;text-align:center'
          div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>Aucun retard — tous les étudiants sont à jour</span>'
          ctx.parentElement.appendChild(div)
        }
        return
      }
      const old = ctx.parentElement.querySelector('.retard-ok-msg')
      if (old) old.remove()
      ctx.style.display = ''
      const maxVal = Math.max(...values)
      this.instances.retard = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.charts.retard.labels,
          datasets: [{ label: 'Phases en retard', data: values, backgroundColor: values.map(v => v > 0 ? hex(C.red, .75) : hex(C.teal, .65)), borderRadius: 6, borderSkipped: false }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, max: maxVal + 1, ticks: { stepSize: 1, precision: 0, color: '#8a9aaa' }, grid: { color: 'rgba(200,196,188,0.1)' }, title: { display: true, text: 'Phases en retard', color: '#8a9aaa', font: { size: 11 } } },
            x: { ticks: { color: '#8a9aaa', maxRotation: 30 }, grid: { display: false } },
          },
        },
      })
    },
    buildReussite()  { this.d('reussite');  const ctx=this.$refs.reussiteCanvas;  if(!ctx) return; const v=this.kpi.tauxReussite; const c=v>=70?C.teal:C.red; this.instances.reussite=new Chart(ctx,{type:'doughnut',data:{datasets:[{data:[v,100-v],backgroundColor:[hex(c,.85),hex(C.slate,.15)],borderColor:[c,'transparent'],borderWidth:2,circumference:270,rotation:-135}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{display:false}}}}) },

    // ── Jury charts ──────────────────────────────────────────
    buildJuryCharts(){ this.buildJuryEtat(); this.buildJuryNotes(); this.buildJuryPlanif(); this.buildJuryCalendrier() },
    buildJuryPlanif() {
      this.d('juryPlanif')
      const ctx = this.$refs.juryPlanifCanvas
      if (!ctx) return
      const s = this.juryData.soutenances
      const pct = s.total > 0 ? Math.round(s.planifiees / s.total * 100) : 0
      const c = pct >= 70 ? C.teal : pct >= 40 ? C.gold : C.red
      this.instances.juryPlanif = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: [pct, 100 - pct], backgroundColor: [hex(c, .85), hex(C.slate, .15)], borderColor: [c, 'transparent'], borderWidth: 2, circumference: 270, rotation: -135 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { display: false } } }
      })
    },
    buildJuryCalendrier() {
      this.d('juryCalendrier')
      const ctx = this.$refs.juryCalendrierCanvas
      const cal = this.juryData.soutenances.calendrier
      if (!ctx || !cal || !Array.isArray(cal.labels) || !cal.labels.length) return
      const aTemps = Array.isArray(cal.aTemps) && cal.aTemps.length ? cal.aTemps : []
      const chartType = cal.labels.length === 1 ? 'bar' : 'line'
      this.instances.juryCalendrier = new Chart(ctx, {
        type: chartType,
        data: {
          labels: cal.labels,
          datasets: [
            { label: 'Total prévues', data: cal.total, borderColor: C.blue, backgroundColor: hex(C.blue, 0.08), tension: 0.4, fill: true, pointRadius: 4 },
            { label: 'À temps',       data: aTemps,    borderColor: C.teal, backgroundColor: hex(C.teal, 0.08), tension: 0.4, fill: true, pointRadius: 4 },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#8a9aaa', boxWidth: 12 } } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, color: '#8a9aaa' }, grid: { color: 'rgba(200,196,188,0.1)' } },
            x: { ticks: { color: '#8a9aaa' }, grid: { display: false } }
          }
        }
      })
    },
    buildJuryEtat()  { this.d('juryEtat');  const ctx=this.$refs.juryEtatCanvas;  if(!ctx) return; this.instances.juryEtat=new Chart(ctx,{type:'doughnut',data:{labels:['Soumises','En attente'],datasets:[{data:[this.juryData.evalues,this.juryData.nonEvalues],backgroundColor:[hex(C.teal,.8),hex(C.gold,.75)],borderColor:[C.teal,C.gold],borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{display:false}}}}) },
    buildJuryNotes() { this.d('juryNotes'); const ctx=this.$refs.juryNotesCanvas; if(!ctx||!this.juryData.projets?.length) return; this.instances.juryNotes=new Chart(ctx,{type:'bar',data:{labels:this.juryData.projets,datasets:[{label:'Note /20',data:this.juryData.notes,backgroundColor:this.juryData.notes.map(n=>n>=10?hex(C.teal,.75):hex(C.red,.7)),borderRadius:6,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:20,ticks:{stepSize:4,color:'#8a9aaa'},grid:{color:'rgba(200,196,188,0.1)'}},x:{ticks:{color:'#8a9aaa',maxRotation:30},grid:{display:false}}}}}) },

    // ── PDF ──────────────────────────────────────────────────
    async telechargerPDF() {
      this.downloading = true
      try {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js','html2canvas')
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','jspdf')
        const el     = this.$refs.dashboardRoot
        const canvas = await window.html2canvas(el,{scale:1.5,useCORS:true,backgroundColor:'#c8c4bc',logging:false})
        const imgData = canvas.toDataURL('image/png')
        const { jsPDF } = window.jspdf
        const pdf  = new jsPDF({orientation:'landscape',unit:'mm',format:'a3'})
        const pdfW = pdf.internal.pageSize.getWidth()
        const ratio = canvas.width / canvas.height
        pdf.addImage(imgData,'PNG',0,0,pdfW,pdfW/ratio)
        const role = this.activeRole==='encadrant' ? 'Encadrant' : 'Jury'
        const date = new Date().toLocaleDateString('fr-FR').replace(/\//g,'-')
        pdf.save(`Dashboard_${role}_${date}.pdf`)
      } catch(e) { console.error(e) }
      finally { this.downloading = false }
    },
    loadScript(src,key) {
      if (window[key]) return Promise.resolve()
      return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s) })
    },
  },
}
</script>

<style scoped>
.spin-anim { animation: spin-anim .8s linear infinite; }
@keyframes spin-anim { to { transform: rotate(360deg); } }
</style>