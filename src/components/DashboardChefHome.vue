<template>
  <div ref="dashboardRoot">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
      <div>
        <h1 class="vld-page-title">Bonjour, {{ currentUser.prenom }} 👋</h1>
        <p class="vld-page-sub">{{ isHome ? "Vue d'ensemble — Indicateurs globaux" : "Tableau de bord — Pilotage multi-rôles" }}</p>
      </div>
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <span style="font-size:12px;color:var(--vld-text-muted)">Actualisé à {{ heureActualisation }}</span>

        <button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                @click="charger" :disabled="loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5"
               :class="{ 'spin-anim': loading }">
            <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Actualiser
        </button>

        <!-- PDF — tableau de bord uniquement -->
        <button v-if="!isHome"
                class="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                @click="telechargerPDF" :disabled="downloading || loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {{ downloading ? 'Export...' : 'PDF' }}
        </button>

        <!-- CTA vers tableau de bord — accueil uniquement -->
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

    <!-- ── Role tabs ─────────────────────────────────────────── -->
    <div class="d-flex gap-2 mb-4 flex-wrap">
      <button v-for="tab in roleTabs" :key="tab.key"
              class="btn d-flex align-items-center gap-2"
              :class="activeRole===tab.key ? 'btn-primary' : 'btn-outline-secondary'"
              @click="switchRole(tab.key)">
        <span v-html="tab.icon"></span>
        <span>{{ tab.label }}</span>
        <span v-if="activeRole===tab.key"
              class="badge bg-light text-primary ms-1"
              style="font-size:10px;font-weight:400">{{ tab.desc }}</span>
      </button>
    </div>

    <!-- ── Loading ───────────────────────────────────────────── -->
    <div v-if="loading" class="vld-state">
      <div class="vld-spinner mx-auto mb-3"></div>
      <p>Chargement des indicateurs {{ activeRoleLabel }}…</p>
    </div>

    <!-- ── Error ─────────────────────────────────────────────── -->
    <div v-else-if="erreur" class="alert alert-danger">
      <div class="fw-bold mb-1">Impossible de charger les données</div>
      <div style="font-size:13px">{{ erreur }}</div>
      <button class="btn btn-danger btn-sm mt-2" @click="charger">Réessayer</button>
    </div>

    <!-- ════════════════════════════════════
         CHEF TAB
    ════════════════════════════════════ -->
    <template v-else-if="activeRole==='chef'">
      <div class="vld-section-label">Indicateurs clés — Chef de Département</div>
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-2" v-for="kpi in chefKpis" :key="kpi.label">
          <div class="vld-kpi">
            <div class="vld-kpi__icon" :class="kpi.icon"><span v-html="kpi.svg"></span></div>
            <div>
              <div class="vld-kpi__value">{{ kpi.val }}</div>
              <div class="vld-kpi__label">{{ kpi.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ACCUEIL : bannière + raccourcis -->
      <template v-if="isHome">
        <div class="card mb-4"
             style="border:1.5px dashed var(--vld-border);background:transparent">
          <div class="card-body d-flex align-items-center justify-content-between gap-3 flex-wrap py-3">
            <div>
              <div class="fw-semibold" style="color:var(--vld-text-strong)">Accéder au tableau de bord complet</div>
              <div style="font-size:13px;color:var(--vld-text-muted)">
                Charge encadrants, respect des phases, planification des soutenances…
              </div>
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
          <div class="col-12 col-sm-6 col-lg-4" v-for="s in activeShortcuts" :key="s.page">
            <div class="card h-100"
                 style="cursor:pointer;transition:box-shadow .15s"
                 @click="$emit('navigate', s.page)"
                 @mouseenter="e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.12)'"
                 @mouseleave="e => e.currentTarget.style.boxShadow=''">
              <div class="card-body d-flex align-items-center gap-3">
                <div class="vld-kpi__icon flex-shrink-0" :class="s.icon">
                  <span v-html="s.svg"></span>
                </div>
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

      <!-- TABLEAU DE BORD : graphiques chef -->
      <template v-else>
        <div class="vld-section-label">Répartition et surcharge des encadrants</div>
        <div class="row g-4 mb-4">
          <div class="col-12 col-lg-8">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span>Charge par encadrant</span>
                <span class="badge bg-primary bg-opacity-10 text-primary">Histogramme</span>
              </div>
              <div class="card-body" style="height:220px"><canvas ref="chargeCanvas"></canvas></div>
            </div>
          </div>
          <div class="col-12 col-lg-4">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span>Surcharge <small class="text-muted">seuil: {{ chefData.charts.surcharge?.seuil }}</small></span>
                <span class="badge bg-warning bg-opacity-10 text-warning">Barres</span>
              </div>
              <div class="card-body" style="height:180px"><canvas ref="surchargeCanvas"></canvas></div>
              <div class="card-footer bg-transparent" style="font-size:13px">
                Taux global : <strong>{{ chefData.charts.surcharge?.tauxSurcharge }}%</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="vld-section-label">Soutenances — planification et respect du calendrier</div>
        <div class="row g-4 mb-4">
          <div class="col-12 col-md-4">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span>Taux de planification</span>
                <span class="badge bg-success bg-opacity-10 text-success">Jauge</span>
              </div>
              <div class="card-body d-flex align-items-center justify-content-center"
                   style="height:200px;position:relative">
                <canvas ref="planifCanvas"></canvas>
                <div style="position:absolute;text-align:center;pointer-events:none">
                  <div style="font-family:var(--vld-font-display);font-size:22px;font-weight:700;color:var(--vld-text-strong)">
                    {{ chefData.kpi.tauxPlanification }}%
                  </div>
                  <div style="font-size:11px;color:var(--vld-text-muted)">Planifiées</div>
                </div>
              </div>
              <div class="card-footer bg-transparent d-flex gap-3" style="font-size:12.5px">
                <span><span class="badge bg-success me-1">●</span>{{ chefData.charts.planif?.planifiees || 0 }} planifiées</span>
                <span><span class="badge bg-secondary me-1">●</span>{{ chefData.charts.planif?.restantes || 0 }} restantes</span>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-8">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span>Respect du calendrier par mois</span>
                <span class="badge bg-primary bg-opacity-10 text-primary">Courbe</span>
              </div>
              <div class="card-body" style="height:200px"><canvas ref="calendrierCanvas"></canvas></div>
            </div>
          </div>
        </div>

        <div class="vld-section-label">Phases PFE et retards par encadrant</div>
        <div class="row g-4 mb-4">
          <div class="col-12 col-md-6">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span>Respect des phases</span>
                <span class="badge bg-primary bg-opacity-10 text-primary">Courbe</span>
              </div>
              <div class="card-body" style="height:200px"><canvas ref="phasesCanvas"></canvas></div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span>Taux de retard par encadrant</span>
                <span class="badge bg-danger bg-opacity-10 text-danger">Barres</span>
              </div>
              <div class="card-body" style="height:200px"><canvas ref="retardCanvas"></canvas></div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- ════════════════════════════════════
         ENCADRANT TAB
    ════════════════════════════════════ -->
    <template v-else-if="activeRole==='encadrant'">
      <div class="vld-section-label">Indicateurs clés — Encadrant</div>
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3" v-for="kpi in encKpis" :key="kpi.label">
          <div class="vld-kpi">
            <div class="vld-kpi__icon" :class="kpi.icon"><span v-html="kpi.svg"></span></div>
            <div>
              <div class="vld-kpi__value">{{ kpi.val }}</div>
              <div class="vld-kpi__label">{{ kpi.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ACCUEIL : bannière + raccourcis -->
      <template v-if="isHome">
        <div class="card mb-4"
             style="border:1.5px dashed var(--vld-border);background:transparent">
          <div class="card-body d-flex align-items-center justify-content-between gap-3 flex-wrap py-3">
            <div>
              <div class="fw-semibold" style="color:var(--vld-text-strong)">Accéder au tableau de bord complet</div>
              <div style="font-size:13px;color:var(--vld-text-muted)">
                Avancement étudiants, validation des rapports, taux de réussite…
              </div>
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
          <div class="col-12 col-sm-6 col-lg-4" v-for="s in activeShortcuts" :key="s.page">
            <div class="card h-100"
                 style="cursor:pointer;transition:box-shadow .15s"
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
        <div class="vld-section-label">Validation des sujets et suivi des étudiants</div>
        <div class="row g-4 mb-4">
          <div class="col-12 col-md-4">
            <div class="card h-100">
              <div class="card-header">Validation des sujets</div>
              <div class="card-body" style="height:180px"><canvas ref="encSujetsCanvas"></canvas></div>
              <div class="card-footer bg-transparent d-flex gap-3" style="font-size:12.5px">
                <span><span class="badge bg-success me-1">●</span>{{ encData.kpi.sujetsValides }} validés</span>
                <span><span class="badge bg-warning me-1">●</span>{{ encData.kpi.sujetsTotal - encData.kpi.sujetsValides }} en attente</span>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-8">
            <div class="card h-100">
              <div class="card-header">Charge de suivi par étudiant</div>
              <div class="card-body" style="height:180px"><canvas ref="encReunionsCanvas"></canvas></div>
            </div>
          </div>
        </div>

        <div class="vld-section-label">Avancement et livrables</div>
        <div class="row g-4 mb-4">
          <div class="col-12 col-md-4">
            <div class="card h-100">
              <div class="card-header">Validation des rapports</div>
              <div class="card-body" style="height:180px"><canvas ref="encRapportsCanvas"></canvas></div>
              <div class="card-footer bg-transparent d-flex gap-3" style="font-size:12.5px">
                <span><span class="badge bg-success me-1">●</span>validés</span>
                <span><span class="badge bg-warning me-1">●</span>en révision</span>
                <span><span class="badge bg-danger me-1">●</span>non soumis</span>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="card h-100">
              <div class="card-header">Avancement moyen</div>
              <div class="card-body" style="height:180px;position:relative;display:flex;align-items:center;justify-content:center">
                <canvas ref="encAvancGaugeCanvas"></canvas>
                <div style="position:absolute;text-align:center;pointer-events:none">
                  <div style="font-family:var(--vld-font-display);font-size:22px;font-weight:700;color:var(--vld-text-strong)">{{ encData.kpi.avancementMoyen }}%</div>
                  <div style="font-size:11px;color:var(--vld-text-muted)">Moyen</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="card h-100">
              <div class="card-header">PFE en retard</div>
              <div class="card-body" style="height:180px"><canvas ref="encRetardCanvas"></canvas></div>
            </div>
          </div>
        </div>

        <div class="vld-section-label">Taux de réussite global</div>
        <div class="row g-4 mb-4">
          <div class="col-12 col-md-4">
            <div class="card">
              <div class="card-header">Taux de réussite</div>
              <div class="card-body" style="height:180px;position:relative;display:flex;align-items:center;justify-content:center">
                <canvas ref="encReussiteCanvas"></canvas>
                <div style="position:absolute;text-align:center;pointer-events:none">
                  <div style="font-family:var(--vld-font-display);font-size:24px;font-weight:700;color:var(--vld-text-strong)">{{ encData.kpi.tauxReussite }}%</div>
                  <div style="font-size:11px;color:var(--vld-text-muted)">Réussite</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-8">
            <div class="card h-100">
              <div class="card-header">Avancement par étudiant</div>
              <div class="card-body" style="height:180px"><canvas ref="encAvancCanvas"></canvas></div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- ════════════════════════════════════
         JURY TAB
    ════════════════════════════════════ -->
    <template v-else-if="activeRole==='jury'">
      <div class="vld-section-label">Indicateurs clés — Jury</div>
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
          <div class="vld-kpi">
            <div class="vld-kpi__icon vld-kpi__icon--blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
            </div>
            <div><div class="vld-kpi__value">{{ juryData.totalProjets }}</div><div class="vld-kpi__label">Projets assignés</div></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="vld-kpi">
            <div class="vld-kpi__icon vld-kpi__icon--green">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div><div class="vld-kpi__value">{{ juryData.evalues }}</div><div class="vld-kpi__label">Évalués</div></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="vld-kpi">
            <div class="vld-kpi__icon vld-kpi__icon--gold">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div><div class="vld-kpi__value">{{ juryData.nonEvalues }}</div><div class="vld-kpi__label">En attente</div></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="vld-kpi">
            <div class="vld-kpi__icon vld-kpi__icon--slate">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <div><div class="vld-kpi__value">{{ juryData.noteMoyenne }}</div><div class="vld-kpi__label">Note moyenne</div></div>
          </div>
        </div>
      </div>

      <!-- ACCUEIL : bannière + raccourcis -->
      <template v-if="isHome">
        <div class="card mb-4"
             style="border:1.5px dashed var(--vld-border);background:transparent">
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
          <div class="col-12 col-sm-6 col-lg-4" v-for="s in activeShortcuts" :key="s.page">
            <div class="card h-100"
                 style="cursor:pointer;transition:box-shadow .15s"
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
          <p class="vld-state__sub">Les projets apparaissent après la composition des jurys par le chef de département.</p>
        </div>
      </template>

      <!-- TABLEAU DE BORD : graphiques jury -->
      <template v-else>
        <div class="row g-4">
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
        <div v-if="!juryData.totalProjets" class="vld-state mt-4">
          <p class="vld-state__title">Aucun projet de jury assigné</p>
          <p class="vld-state__sub">Les projets apparaissent après la composition des jurys par le chef de département.</p>
        </div>
      </template>
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

const P = { blue:'#3d6080', teal:'#27ae60', gold:'#f5a623', red:'#e74c3c', purple:'#8e44ad', slate:'#7f8c8d' }
function hex(h, a) {
  const r=parseInt(h.slice(1,3),16), g=parseInt(h.slice(3,5),16), b=parseInt(h.slice(5,7),16)
  return `rgba(${r},${g},${b},${a})`
}
const scaleY = (pct=false) => ({ beginAtZero:true, ticks:{ color:'#8a9aaa', callback: pct ? v=>v+'%' : undefined }, grid:{ color:'rgba(200,196,188,0.1)' }, ...(pct?{min:0,max:100}:{}) })
const scaleX = () => ({ ticks:{ color:'#8a9aaa' }, grid:{ display:false } })

export default {
  name: 'DashboardChefHome',

  props: {
    currentUser: { type: Object, default: () => ({}) },
    // 'home'      → page d'accueil  : KPIs + raccourcis, pas de graphiques
    // 'dashboard' → tableau de bord : KPIs + tous les graphiques
    pageMode: { type: String, default: 'dashboard' },
  },

  emits: ['navigate'],

  data() {
    return {
      activeRole: 'chef',
      loading: false, downloading: false,
      heureActualisation: '--:--',
      instances: {}, erreur: null,
      loaded: { chef: false, encadrant: false, jury: false },

      roleTabs: [
        { key:'chef',      label:'Chef de Département', desc:'Pilotage de votre spécialité',    icon:'<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
        { key:'encadrant', label:'Encadrant',            desc:'Suivi de vos étudiants encadrés', icon:'<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/><polyline points="16 11 18 13 22 9"/></svg>' },
        { key:'jury',      label:'Jury',                 desc:'Vos évaluations de soutenance',  icon:'<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
      ],

      chefData: {
        kpi: { totalSoutenances:0, totalEncadrants:0, chargeMoyenne:0, tauxRetard:0, tauxPlanification:0, totalEtudiants:0 },
        charts: { charge:null, surcharge:null, planif:null, calendrier:null, phases:null, retard:null },
      },
      encData: {
        kpi: { nbEtudiants:0, tauxValidation:0, avancementMoyen:0, reunionsMoyennes:0, tauxReussite:0, sujetsValides:0, sujetsTotal:0 },
        charts: { sujets:null, reunions:null, rapports:null, avancement:null, retard:null, reussite:null },
      },
      juryData: { totalProjets:0, evalues:0, nonEvalues:0, noteMoyenne:'—', projets:[], notes:[] },
    }
  },

  computed: {
    isHome() { return this.pageMode === 'home' },
    activeRoleLabel() { return this.roleTabs.find(t => t.key === this.activeRole)?.label || '' },

    chefKpis() {
      const k = this.chefData.kpi
      return [
        { label:'Soutenances totales',   val:k.totalSoutenances,      icon:'vld-kpi__icon--blue',  svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
        { label:'Encadrants actifs',     val:k.totalEncadrants,       icon:'vld-kpi__icon--green', svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
        { label:'Charge moy. / enc.',    val:k.chargeMoyenne,         icon:'vld-kpi__icon--gold',  svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
        { label:'Taux de retard',        val:k.tauxRetard+'%',        icon:k.tauxRetard>30?'vld-kpi__icon--slate':'vld-kpi__icon--green', svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
        { label:'Taux de planification', val:k.tauxPlanification+'%', icon:'vld-kpi__icon--blue',  svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' },
        { label:'Étudiants totaux',      val:k.totalEtudiants,        icon:'vld-kpi__icon--slate', svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' },
      ]
    },

    encKpis() {
      const k = this.encData.kpi
      return [
        { label:'Étudiants encadrés', val:k.nbEtudiants,         icon:'vld-kpi__icon--blue',  svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' },
        { label:'Taux de validation', val:k.tauxValidation+'%',  icon:'vld-kpi__icon--green', svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' },
        { label:'Avancement moyen',   val:k.avancementMoyen+'%', icon:'vld-kpi__icon--gold',  svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
        { label:'Taux de réussite',   val:k.tauxReussite+'%',    icon:'vld-kpi__icon--slate', svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>' },
      ]
    },

    activeShortcuts() {
      const chef = [
        { page:'mon-departement',       label:'Mon département',           desc:'Étudiants & encadrants de votre spécialité', icon:'vld-kpi__icon--blue',  svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
        { page:'affectation',            label:'Gérer les affectations',    desc:'Assigner des encadrants aux étudiants',       icon:'vld-kpi__icon--green', svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>' },
        { page:'phases',                 label:"Phases d'évaluation",       desc:'Gérer les phases et jalons PFE',             icon:'vld-kpi__icon--gold',  svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
        { page:'soutenance',             label:'Planifier les soutenances', desc:'Organiser le calendrier des soutenances',    icon:'vld-kpi__icon--slate', svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
        { page:'jury',                   label:'Composition des jurys',     desc:'Former les comités de soutenance',          icon:'vld-kpi__icon--blue',  svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
        { page:'deliberation-resultats', label:'Délibération & Résultats',  desc:'Consulter les résultats finaux',            icon:'vld-kpi__icon--green', svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>' },
      ]
      const encadrant = [
        { page:'enc-affectes',  label:'Étudiants affectés',  desc:'Voir vos étudiants encadrés',     icon:'vld-kpi__icon--blue',  svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
        { page:'enc-suivi',     label:'Suivi & livrables',   desc:'Valider les livrables étudiants', icon:'vld-kpi__icon--green', svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
        { page:'enc-demandes',  label:'Gérer les demandes',  desc:'Traiter les demandes en attente', icon:'vld-kpi__icon--gold',  svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
        { page:'enc-reunions',  label:'Réunions',            desc:'Planifier vos réunions de suivi', icon:'vld-kpi__icon--slate', svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
      ]
      const jury = [
        { page:'jury-projets',     label:'Projets à évaluer', desc:'Accéder aux projets de soutenance', icon:'vld-kpi__icon--blue',  svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
        { page:'jury-evaluations', label:'Notes finales',     desc:'Saisir et consulter vos notes',    icon:'vld-kpi__icon--green', svg:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>' },
      ]
      return { chef, encadrant, jury }[this.activeRole] || []
    },
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
        if (this.activeRole === 'chef')           await this.loadChef()
        else if (this.activeRole === 'encadrant') await this.loadEncadrant()
        else if (this.activeRole === 'jury')      await this.loadJury()
        this.loaded[this.activeRole] = true
        this.heureActualisation = new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
      } catch(e) {
        const s = e?.response?.status
        const m = e?.response?.data?.message || e?.message || 'Erreur inconnue'
        this.erreur = `Erreur ${s ? s + ' — ' : ''}${m}`
      } finally {
        this.loading = false
        await this.$nextTick()
        this.buildCharts()
      }
    },

    async loadChef() {
      const r = await api.get('/dashboard/chef')
      this.chefData.kpi = r.data.kpi
      this.chefData.charts = {
        charge:     r.data.charts.chargeEncadrants,
        surcharge:  r.data.charts.surchargeEncadrants,
        planif:     r.data.charts.planificationSoutenances,
        calendrier: r.data.charts.respectCalendrier,
        phases:     r.data.charts.respectPhases,
        retard:     r.data.charts.retardParEncadrant,
      }
    },

    async loadEncadrant() {
      const r = await api.get('/dashboard/encadrant')
      this.encData.kpi = r.data.kpi
      this.encData.charts = {
        sujets:    r.data.charts.validationSujets,
        reunions:  r.data.charts.chargeSuiviEtudiants,
        rapports:  r.data.charts.validationRapports,
        avancement:r.data.charts.avancementMoyen,
        retard:    r.data.charts.pfeEnRetard,
        reussite:  r.data.charts.tauxReussite,
      }
    },

    async loadJury() {
      const userId = this.currentUser.id
      const mesProjets = (await api.get('/jurys-pfe')).data
        .filter(j => (j.membres||[]).some(m => m.enseignant_id === userId))
      const evalues = mesProjets.filter(j =>
        (j.membres||[]).find(m => m.enseignant_id === userId)?.note !== null)
      const notes = evalues.map(j => {
        const m = (j.membres||[]).find(m => m.enseignant_id === userId)
        return { titre: j.projet_titre || 'Projet #' + j.id, note: m?.note || 0 }
      })
      const noteMoyenne = notes.length
        ? (notes.reduce((s,n) => s + n.note, 0) / notes.length).toFixed(1) : '—'
      this.juryData = {
        totalProjets: mesProjets.length,
        evalues:      evalues.length,
        nonEvalues:   mesProjets.length - evalues.length,
        noteMoyenne,
        projets:      mesProjets.map(j => j.projet_titre || 'Projet #' + j.id),
        notes:        notes.map(n => n.note),
      }
    },

    // En mode 'home' les canvas ne sont pas dans le DOM — on ne construit rien
    buildCharts() {
      if (this.isHome) return
      if (this.activeRole === 'chef')           this.buildChefCharts()
      else if (this.activeRole === 'encadrant') this.buildEncCharts()
      else if (this.activeRole === 'jury')      this.buildJuryCharts()
    },
    destroyAll() { Object.values(this.instances).forEach(c => c?.destroy()); this.instances = {} },
    d(key) { this.instances[key]?.destroy(); delete this.instances[key] },

    // ── Chef charts ──────────────────────────────────────────
    buildChefCharts() { this.buildCharge(); this.buildSurcharge(); this.buildPlanif(); this.buildCalendrier(); this.buildPhases(); this.buildRetardChef() },
    buildCharge() { this.d('charge'); const ctx=this.$refs.chargeCanvas; if(!ctx||!this.chefData.charts.charge?.labels?.length) return; this.instances.charge=new Chart(ctx,{type:'bar',data:{labels:this.chefData.charts.charge.labels,datasets:[{label:'Étudiants',data:this.chefData.charts.charge.values,backgroundColor:this.chefData.charts.charge.labels.map((_,i)=>hex(Object.values(P)[i%5],0.75)),borderRadius:6,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw} étudiant(s)`}}},scales:{y:{...scaleY(),ticks:{stepSize:1,color:'#8a9aaa'}},x:scaleX()}}}) },
    buildSurcharge() { this.d('surcharge'); const ctx=this.$refs.surchargeCanvas; if(!ctx||!this.chefData.charts.surcharge?.labels?.length) return; const s=this.chefData.charts.surcharge.seuil||5; this.instances.surcharge=new Chart(ctx,{type:'bar',data:{labels:this.chefData.charts.surcharge.labels,datasets:[{label:'Étudiants',data:this.chefData.charts.surcharge.values,backgroundColor:this.chefData.charts.surcharge.values.map(v=>v>s?hex(P.red,0.75):hex(P.teal,0.65)),borderRadius:6,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1,color:'#8a9aaa'},grid:{color:'rgba(200,196,188,0.1)'}},x:scaleX()}}}) },
    buildPlanif() { this.d('planif'); const ctx=this.$refs.planifCanvas; if(!ctx||!this.chefData.charts.planif) return; this.instances.planif=new Chart(ctx,{type:'doughnut',data:{labels:this.chefData.charts.planif.labels,datasets:[{data:this.chefData.charts.planif.values,backgroundColor:[hex(P.teal,0.8),hex(P.slate,0.3)],borderColor:['#27ae60','#c8c4bc'],borderWidth:2,circumference:270,rotation:-135}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{display:false}}}}) },
    buildCalendrier() { this.d('calendrier'); const ctx=this.$refs.calendrierCanvas; if(!ctx||!this.chefData.charts.calendrier?.labels?.length) return; this.instances.calendrier=new Chart(ctx,{type:'line',data:{labels:this.chefData.charts.calendrier.labels,datasets:[{label:'Total prévues',data:this.chefData.charts.calendrier.total,borderColor:P.blue,backgroundColor:hex(P.blue,0.08),tension:0.4,fill:true,pointRadius:4},{label:'À temps',data:this.chefData.charts.calendrier.aTemps,borderColor:P.teal,backgroundColor:hex(P.teal,0.08),tension:0.4,fill:true,pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#8a9aaa',boxWidth:12}}},scales:{y:{beginAtZero:true,ticks:{stepSize:1,color:'#8a9aaa'},grid:{color:'rgba(200,196,188,0.1)'}},x:scaleX()}}}) },
    buildPhases() { this.d('phases'); const ctx=this.$refs.phasesCanvas; if(!ctx||!this.chefData.charts.phases?.labels?.length) return; this.instances.phases=new Chart(ctx,{type:'line',data:{labels:this.chefData.charts.phases.labels,datasets:[{label:'Taux de respect (%)',data:this.chefData.charts.phases.values,borderColor:P.purple,backgroundColor:hex(P.purple,0.1),tension:0.4,fill:true,pointRadius:5,pointBackgroundColor:P.purple}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:100,ticks:{callback:v=>v+'%',color:'#8a9aaa'},grid:{color:'rgba(200,196,188,0.1)'}},x:scaleX()}}}) },
    buildRetardChef() { this.d('retard'); const ctx=this.$refs.retardCanvas; if(!ctx||!this.chefData.charts.retard?.labels?.length) return; this.instances.retard=new Chart(ctx,{type:'bar',data:{labels:this.chefData.charts.retard.labels,datasets:[{label:'Taux de retard (%)',data:this.chefData.charts.retard.values,backgroundColor:this.chefData.charts.retard.values.map(v=>v>40?hex(P.red,0.75):v>20?hex(P.gold,0.75):hex(P.teal,0.65)),borderRadius:6,borderSkipped:false}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{min:0,max:100,ticks:{callback:v=>v+'%',color:'#8a9aaa'},grid:{color:'rgba(200,196,188,0.1)'}},y:{ticks:{color:'#8a9aaa'},grid:{display:false}}}}}) },

    // ── Encadrant charts ─────────────────────────────────────
    buildEncCharts() { this.buildEncSujets(); this.buildEncReunions(); this.buildEncRapports(); this.buildEncAvancement(); this.buildEncAvancGauge(); this.buildEncRetard(); this.buildEncReussite() },
    buildEncSujets() { this.d('encSujets'); const ctx=this.$refs.encSujetsCanvas; if(!ctx||!this.encData.charts.sujets?.values?.length) return; this.instances.encSujets=new Chart(ctx,{type:'doughnut',data:{labels:this.encData.charts.sujets.labels,datasets:[{data:this.encData.charts.sujets.values,backgroundColor:[hex(P.teal,0.8),hex(P.gold,0.75)],borderColor:[P.teal,P.gold],borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{display:false}}}}) },
    buildEncReunions() { this.d('encReunions'); const ctx=this.$refs.encReunionsCanvas; if(!ctx||!this.encData.charts.reunions?.labels?.length) return; this.instances.encReunions=new Chart(ctx,{type:'bar',data:{labels:this.encData.charts.reunions.labels,datasets:[{label:'Réunions',data:this.encData.charts.reunions.values,backgroundColor:this.encData.charts.reunions.values.map((_,i)=>hex(Object.values(P)[i%Object.keys(P).length],0.72)),borderRadius:6,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1,color:'#8a9aaa'},grid:{color:'rgba(200,196,188,0.1)'}},x:{ticks:{color:'#8a9aaa',maxRotation:30},grid:{display:false}}}}}) },
    buildEncRapports() { this.d('encRapports'); const ctx=this.$refs.encRapportsCanvas; if(!ctx||!this.encData.charts.rapports?.values?.length) return; this.instances.encRapports=new Chart(ctx,{type:'doughnut',data:{labels:this.encData.charts.rapports.labels,datasets:[{data:this.encData.charts.rapports.values,backgroundColor:[hex(P.teal,0.8),hex(P.gold,0.75),hex(P.red,0.7)],borderColor:[P.teal,P.gold,P.red],borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{display:false}}}}) },
    buildEncAvancement() { this.d('encAvanc'); const ctx=this.$refs.encAvancCanvas; if(!ctx||!this.encData.charts.avancement?.labels?.length) return; this.instances.encAvanc=new Chart(ctx,{type:'bar',data:{labels:this.encData.charts.avancement.labels,datasets:[{label:'Avancement (%)',data:this.encData.charts.avancement.values,backgroundColor:this.encData.charts.avancement.values.map(v=>v>=70?hex(P.teal,0.75):v>=40?hex(P.gold,0.75):hex(P.red,0.7)),borderRadius:5,borderSkipped:false}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{min:0,max:100,ticks:{callback:v=>v+'%',color:'#8a9aaa'},grid:{color:'rgba(200,196,188,0.1)'}},y:{ticks:{color:'#8a9aaa'},grid:{display:false}}}}}) },
    buildEncAvancGauge() { this.d('encAvancGauge'); const ctx=this.$refs.encAvancGaugeCanvas; if(!ctx) return; const v=this.encData.kpi.avancementMoyen; const c=v>=70?P.teal:v>=40?P.gold:P.red; this.instances.encAvancGauge=new Chart(ctx,{type:'doughnut',data:{datasets:[{data:[v,100-v],backgroundColor:[hex(c,0.85),hex(P.slate,0.15)],borderColor:[c,'transparent'],borderWidth:2,circumference:270,rotation:-135}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{display:false}}}}) },
    buildEncRetard() { this.d('encRetard'); const ctx=this.$refs.encRetardCanvas; if(!ctx||!this.encData.charts.retard?.labels?.length) return; this.instances.encRetard=new Chart(ctx,{type:'bar',data:{labels:this.encData.charts.retard.labels,datasets:[{label:'En retard',data:this.encData.charts.retard.values,backgroundColor:this.encData.charts.retard.values.map(v=>v?hex(P.red,0.75):hex(P.teal,0.65)),borderRadius:6,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:1,ticks:{stepSize:1,callback:v=>v===1?'Retard':'OK',color:'#8a9aaa'},grid:{color:'rgba(200,196,188,0.1)'}},x:{ticks:{color:'#8a9aaa',maxRotation:30},grid:{display:false}}}}}) },
    buildEncReussite() { this.d('encReussite'); const ctx=this.$refs.encReussiteCanvas; if(!ctx) return; const v=this.encData.kpi.tauxReussite; const c=v>=70?P.teal:P.red; this.instances.encReussite=new Chart(ctx,{type:'doughnut',data:{datasets:[{data:[v,100-v],backgroundColor:[hex(c,0.85),hex(P.slate,0.15)],borderColor:[c,'transparent'],borderWidth:2,circumference:270,rotation:-135}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{display:false}}}}) },

    // ── Jury charts ──────────────────────────────────────────
    buildJuryCharts() { this.buildJuryEtat(); this.buildJuryNotes() },
    buildJuryEtat() { this.d('juryEtat'); const ctx=this.$refs.juryEtatCanvas; if(!ctx) return; this.instances.juryEtat=new Chart(ctx,{type:'doughnut',data:{labels:['Soumises','En attente'],datasets:[{data:[this.juryData.evalues,this.juryData.nonEvalues],backgroundColor:[hex(P.teal,0.8),hex(P.gold,0.75)],borderColor:[P.teal,P.gold],borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{display:false}}}}) },
    buildJuryNotes() { this.d('juryNotes'); const ctx=this.$refs.juryNotesCanvas; if(!ctx||!this.juryData.projets?.length) return; this.instances.juryNotes=new Chart(ctx,{type:'bar',data:{labels:this.juryData.projets,datasets:[{label:'Note /20',data:this.juryData.notes,backgroundColor:this.juryData.notes.map(n=>n>=10?hex(P.teal,0.75):hex(P.red,0.7)),borderRadius:6,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:20,ticks:{stepSize:4,color:'#8a9aaa'},grid:{color:'rgba(200,196,188,0.1)'}},x:{ticks:{color:'#8a9aaa',maxRotation:30},grid:{display:false}}}}}) },

    // ── PDF ──────────────────────────────────────────────────
    async telechargerPDF() {
      this.downloading = true
      try {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'html2canvas')
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf')
        const el = this.$refs.dashboardRoot
        const canvas = await window.html2canvas(el, { scale:1.5, useCORS:true, backgroundColor:'#c8c4bc', logging:false })
        const imgData = canvas.toDataURL('image/png')
        const { jsPDF } = window.jspdf
        const pdf = new jsPDF({ orientation:'landscape', unit:'mm', format:'a3' })
        const pdfW = pdf.internal.pageSize.getWidth(), pdfH = pdf.internal.pageSize.getHeight()
        const ratio = canvas.width / canvas.height
        let imgW = pdfW, imgH = pdfW / ratio
        if (imgH <= pdfH) {
          pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH)
        } else {
          let y = 0, rem = canvas.height
          const pageH = (pdfH / imgW) * canvas.width
          while (rem > 0) {
            const sh = Math.min(pageH, rem)
            const sc = document.createElement('canvas')
            sc.width = canvas.width; sc.height = sh
            sc.getContext('2d').drawImage(canvas, 0, y, canvas.width, sh, 0, 0, canvas.width, sh)
            if (y > 0) pdf.addPage()
            pdf.addImage(sc.toDataURL('image/png'), 'PNG', 0, 0, imgW, (sh / canvas.width) * imgW)
            y += sh; rem -= sh
          }
        }
        const role = this.roleTabs.find(t => t.key === this.activeRole)?.label || this.activeRole
        const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')
        pdf.save(`Dashboard_${role}_${date}.pdf`)
      } catch(e) { console.error(e) }
      finally { this.downloading = false }
    },
    loadScript(src, key) {
      if (window[key]) return Promise.resolve()
      return new Promise((res, rej) => {
        const s = document.createElement('script')
        s.src = src; s.onload = res; s.onerror = rej
        document.head.appendChild(s)
      })
    },
  },
}
</script>

<style scoped>
.spin-anim { animation: spin-anim .8s linear infinite; }
@keyframes spin-anim { to { transform: rotate(360deg); } }
</style>