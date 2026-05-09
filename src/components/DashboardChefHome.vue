<!--
  DashboardChefHome.vue — Dashboard home for Chef de Département
  ─────────────────────────────────────────────────────────────
  • Three role tabs: Chef | Encadrant | Jury
  • Each tab hits its own /dashboard/{role} endpoint (real DB data)
  • Download PDF uses html2canvas + jsPDF (loaded from CDN via script tags)
  • All chart instances destroyed / rebuilt on tab switch
-->
<template>
  <div class="home-wrap" ref="dashboardRoot">

    <!-- ══ HEADER ══ -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Bonjour, {{ currentUser.prenom }} 👋</h1>
        <p class="page-sub">Tableau de bord GIMSI — Pilotage multi-rôles</p>
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
      <p>Chargement des indicateurs {{ activeRoleLabel }}…</p>
    </div>

    <!-- ══ ERROR STATE ══ -->
    <div v-else-if="erreur" class="error-state">
      <div class="error-icon">⚠️</div>
      <div class="error-title">Impossible de charger les données</div>
      <div class="error-msg">{{ erreur }}</div>
      <div class="error-hint">Vérifiez que le serveur Laravel tourne et que le token d'authentification est valide. Consultez la console (F12) pour le détail exact de l'erreur.</div>
      <button class="btn-refresh" style="margin-top:16px" @click="charger">Réessayer</button>
    </div>

    <!-- ══════════════════════════════════════════════
         TAB: CHEF DE DÉPARTEMENT
    ══════════════════════════════════════════════ -->
    <template v-else-if="activeRole === 'chef'">
      <div class="section-label">Indicateurs clés — Chef de Département</div>
      <div class="kpi-row kpi-6">
        <div class="kpi-card kpi-blue">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ chefData.kpi.totalSoutenances }}</div><div class="kpi-label">Soutenances totales</div></div>
        </div>
        <div class="kpi-card kpi-teal">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ chefData.kpi.totalEncadrants }}</div><div class="kpi-label">Encadrants actifs</div></div>
        </div>
        <div class="kpi-card kpi-gold">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ chefData.kpi.chargeMoyenne }}</div><div class="kpi-label">Charge moy. / encadrant</div></div>
        </div>
        <div class="kpi-card" :class="chefData.kpi.tauxRetard > 30 ? 'kpi-red' : 'kpi-green'">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ chefData.kpi.tauxRetard }}%</div><div class="kpi-label">Taux de retard</div></div>
        </div>
        <div class="kpi-card kpi-purple">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ chefData.kpi.tauxPlanification }}%</div><div class="kpi-label">Taux de planification</div></div>
        </div>
        <div class="kpi-card kpi-slate">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ chefData.kpi.totalEtudiants }}</div><div class="kpi-label">Étudiants totaux</div></div>
        </div>
      </div>

      <div class="section-label">Répartition et surcharge des encadrants</div>
      <div class="chart-row">
        <div class="chart-card chart-wide">
          <div class="chart-header"><div class="chart-title">Charge par encadrant</div><div class="chart-badge">Histogramme</div></div>
          <div class="chart-area"><canvas ref="chargeCanvas"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Taux de surcharge <span class="seuil-badge">seuil: {{ chefData.charts.surcharge?.seuil }}</span></div>
            <div class="chart-badge chart-badge-orange">Barres</div>
          </div>
          <div class="chart-area"><canvas ref="surchargeCanvas"></canvas></div>
          <div class="chart-footer">Taux global : <strong>{{ chefData.charts.surcharge?.tauxSurcharge }}%</strong></div>
        </div>
      </div>

      <div class="section-label">Soutenances — planification et respect du calendrier</div>
      <div class="chart-row">
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">Taux de planification</div><div class="chart-badge chart-badge-green">Jauge</div></div>
          <div class="gauge-wrap">
            <canvas ref="planifCanvas" height="180"></canvas>
            <div class="gauge-center">
              <div class="gauge-pct">{{ chefData.kpi.tauxPlanification }}%</div>
              <div class="gauge-lbl">Planifiées</div>
            </div>
          </div>
          <div class="planif-details">
            <span class="pd-item"><span class="dot dot-green"></span>{{ chefData.charts.planif?.planifiees || 0 }} planifiées</span>
            <span class="pd-item"><span class="dot dot-grey"></span>{{ (chefData.charts.planif?.total || 0) - (chefData.charts.planif?.planifiees || 0) }} non planifiées</span>
          </div>
        </div>
        <div class="chart-card chart-wide">
          <div class="chart-header"><div class="chart-title">Respect du calendrier des soutenances</div><div class="chart-badge chart-badge-blue">Courbe</div></div>
          <div class="chart-area"><canvas ref="calendrierCanvas"></canvas></div>
        </div>
      </div>

      <div class="section-label">Avancement des phases PFE et retards</div>
      <div class="chart-row">
        <div class="chart-card chart-wide">
          <div class="chart-header"><div class="chart-title">Taux de respect des phases PFE</div><div class="chart-badge chart-badge-blue">Courbe</div></div>
          <div class="chart-area"><canvas ref="phasesCanvas"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">Taux de retard par encadrant</div><div class="chart-badge chart-badge-orange">Barres</div></div>
          <div class="chart-area"><canvas ref="retardCanvas"></canvas></div>
        </div>
      </div>

      <div class="section-label">Actions rapides</div>
      <div class="qa-grid">
        <button class="qa-card" @click="$emit('navigate','jury')">
          <div class="qa-icon qa-blue"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Composer les jurys</div><div class="qa-s">Affecter les membres aux projets</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="qa-card" @click="$emit('navigate','soutenance')">
          <div class="qa-icon qa-gold"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Planifier les soutenances</div><div class="qa-s">Sessions, salles, calendrier</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="qa-card" @click="$emit('navigate','phases')">
          <div class="qa-icon qa-teal"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Gérer les phases</div><div class="qa-s">Créer et ordonner les étapes</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="qa-card" @click="$emit('navigate','affectation')">
          <div class="qa-icon qa-purple"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Gérer les affectations</div><div class="qa-s">Manuel / Aléatoire / Semi</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         TAB: ENCADRANT
    ══════════════════════════════════════════════ -->
    <template v-else-if="activeRole === 'encadrant'">      <div class="section-label">Indicateurs clés — Rôle Encadrant</div>
      <div class="kpi-row kpi-5">
        <div class="kpi-card kpi-blue">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ encData.kpi.nbEtudiants }}</div><div class="kpi-label">Étudiants encadrés</div></div>
        </div>
        <div class="kpi-card kpi-teal">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div class="kpi-body">
            <div class="kpi-value">{{ encData.kpi.tauxValidation }}%</div>
            <div class="kpi-label">Taux validation sujets</div>
            <div class="kpi-sub">{{ encData.kpi.sujetsValides }}/{{ encData.kpi.sujetsTotal }} sujets</div>
          </div>
        </div>
        <div class="kpi-card kpi-gold">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ encData.kpi.avancementMoyen }}%</div><div class="kpi-label">Avancement moyen</div></div>
        </div>
        <div class="kpi-card kpi-purple">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ encData.kpi.reunionsMoyennes }}</div><div class="kpi-label">Réunions moy./étudiant</div></div>
        </div>
        <div class="kpi-card" :class="encData.kpi.tauxReussite >= 70 ? 'kpi-green' : 'kpi-red'">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ encData.kpi.tauxReussite }}%</div><div class="kpi-label">Taux de réussite</div></div>
        </div>
      </div>

      <div class="section-label">Validation et suivi des étudiants</div>
      <div class="chart-row two-cols">
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">Validation des sujets PFE</div><div class="chart-badge chart-badge-teal">Camembert</div></div>
          <div class="pie-wrap">
            <div class="chart-area pie-canvas"><canvas ref="encSujetsCanvas"></canvas></div>
            <div class="pie-legend">
              <div class="pie-leg-item"><span class="dot dot-teal"></span><span>Validés — <strong>{{ encData.charts.sujets?.values?.[0] || 0 }}</strong></span></div>
              <div class="pie-leg-item"><span class="dot dot-gold"></span><span>En attente — <strong>{{ encData.charts.sujets?.values?.[1] || 0 }}</strong></span></div>
              <div class="pie-rate">{{ encData.kpi.tauxValidation }}% validés</div>
            </div>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">Réunions confirmées par étudiant</div><div class="chart-badge">Histogramme</div></div>
          <div class="chart-area"><canvas ref="encReunionsCanvas"></canvas></div>
        </div>
      </div>

      <div class="section-label">Livrables et avancement</div>
      <div class="chart-row two-cols">
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">Validation des rapports / livrables</div><div class="chart-badge chart-badge-teal">Camembert</div></div>
          <div class="pie-wrap">
            <div class="chart-area pie-canvas"><canvas ref="encRapportsCanvas"></canvas></div>
            <div class="pie-legend">
              <div class="pie-leg-item"><span class="dot dot-teal"></span><span>Validés — <strong>{{ encData.charts.rapports?.values?.[0] || 0 }}</strong></span></div>
              <div class="pie-leg-item"><span class="dot dot-gold"></span><span>En attente — <strong>{{ encData.charts.rapports?.values?.[1] || 0 }}</strong></span></div>
              <div class="pie-leg-item"><span class="dot dot-red"></span><span>Rejetés — <strong>{{ encData.charts.rapports?.values?.[2] || 0 }}</strong></span></div>
              <div class="pie-rate">{{ encData.charts.rapports?.taux || 0 }}% validés</div>
            </div>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">Avancement par étudiant (%)</div><div class="chart-badge chart-badge-purple">Barres</div></div>
          <div class="chart-area"><canvas ref="encAvancCanvas"></canvas></div>
        </div>
      </div>

      <div class="section-label">Alertes retards et réussite</div>
      <div class="chart-row three-cols">
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">Avancement moyen global</div><div class="chart-badge chart-badge-gold">Jauge</div></div>
          <div class="gauge-wrap">
            <canvas ref="encAvancGaugeCanvas" height="170"></canvas>
            <div class="gauge-center">
              <div class="gauge-pct">{{ encData.kpi.avancementMoyen }}%</div>
              <div class="gauge-lbl">Progression</div>
            </div>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">PFE en retard</div><div class="chart-badge chart-badge-orange">Barres</div></div>
          <div class="retard-summary">
            <div class="retard-big" :class="encData.charts.retard?.taux > 40 ? 'text-red' : encData.charts.retard?.taux > 20 ? 'text-gold' : 'text-teal'">
              {{ encData.charts.retard?.taux || 0 }}%
            </div>
            <div class="retard-sub">des PFE présentent un retard</div>
          </div>
          <div class="chart-area-sm"><canvas ref="encRetardCanvas"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">Taux de réussite</div><div class="chart-badge chart-badge-green">Jauge</div></div>
          <div class="gauge-wrap">
            <canvas ref="encReussiteCanvas" height="170"></canvas>
            <div class="gauge-center">
              <div class="gauge-pct" :class="encData.kpi.tauxReussite >= 70 ? 'text-teal' : 'text-red'">{{ encData.kpi.tauxReussite }}%</div>
              <div class="gauge-lbl">Admis</div>
            </div>
          </div>
          <div class="planif-details">
            <span class="pd-item"><span class="dot dot-teal"></span>{{ encData.charts.reussite?.admis || 0 }} admis</span>
            <span class="pd-item"><span class="dot dot-red"></span>{{ encData.charts.reussite?.ajournes || 0 }} ajournés</span>
          </div>
        </div>
      </div>

      <div class="section-label">Actions rapides</div>
      <div class="qa-grid">
        <button class="qa-card" @click="$emit('navigate','enc-affectes')">
          <div class="qa-icon qa-blue"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Mes étudiants</div><div class="qa-s">Suivre la progression de chacun</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="qa-card" @click="$emit('navigate','enc-suivi')">
          <div class="qa-icon qa-teal"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Suivi & livrables</div><div class="qa-s">Valider ou rejeter les dépôts</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="qa-card" @click="$emit('navigate','enc-reunions')">
          <div class="qa-icon qa-gold"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Réunions</div><div class="qa-s">Planifier, confirmer, archiver</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="qa-card" @click="$emit('navigate','enc-voeux')">
          <div class="qa-icon qa-purple"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Mes vœux</div><div class="qa-s">{{ encData.kpi.sujetsTotal - encData.kpi.sujetsValides }} sujets en attente</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         TAB: JURY
    ══════════════════════════════════════════════ -->
    <template v-else-if="activeRole === 'jury'">      <div class="section-label">Indicateurs clés — Rôle Jury</div>
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
        <div class="chart-card">
          <div class="chart-header"><div class="chart-title">Notes attribuées par projet</div><div class="chart-badge">Histogramme</div></div>
          <div class="chart-area"><canvas ref="juryNotesCanvas"></canvas></div>
        </div>
      </div>

      <div class="section-label">Actions rapides</div>
      <div class="qa-grid">
        <button class="qa-card" @click="$emit('navigate','jury-projets')">
          <div class="qa-icon qa-blue"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Projets à évaluer</div><div class="qa-s">{{ juryData.nonEvalues }} en attente</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="qa-card" @click="$emit('navigate','jury-evaluations')">
          <div class="qa-icon qa-teal"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Mes évaluations</div><div class="qa-s">Historique des notes soumises</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="qa-card" @click="$emit('navigate','enc-calendrier')">
          <div class="qa-icon qa-gold"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Calendrier soutenances</div><div class="qa-s">Voir les sessions planifiées</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="qa-card" @click="$emit('navigate','resultat-deliberation')">
          <div class="qa-icon qa-purple"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Résultats & Délibération</div><div class="qa-s">Consulter les fiches finales</div></div>
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

const P = {
  blue:   '#3d6080',
  teal:   '#27ae60',
  gold:   '#f5a623',
  red:    '#e74c3c',
  purple: '#8e44ad',
  slate:  '#7f8c8d',
}

function hex(h, a) {
  const r = parseInt(h.slice(1, 3), 16)
  const g = parseInt(h.slice(3, 5), 16)
  const b = parseInt(h.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

// ── Shared chart option helpers ────────────────────────────────────
const scaleY = (label = '', pct = false) => ({
  beginAtZero: true,
  ticks: {
    color: '#8a9aaa',
    callback: pct ? v => v + '%' : undefined,
  },
  grid: { color: 'rgba(200,196,188,0.1)' },
  ...(pct ? { min: 0, max: 100 } : {}),
})

const scaleX = () => ({
  ticks: { color: '#8a9aaa' },
  grid: { display: false },
})

export default {
  name: 'DashboardChefHome',

  props: {
    currentUser: { type: Object, default: () => ({}) },
  },

  emits: ['navigate'],

  data() {
    return {
      activeRole: 'chef',
      loading: false,
      downloading: false,
      heureActualisation: '--:--',
      instances: {},

      roleTabs: [
        {
          key: 'chef',
          label: 'Chef de Département',
          desc: 'Pilotage de votre spécialité',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        },
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

      // Chef data (from /dashboard/chef)
      chefData: {
        kpi: { totalSoutenances: 0, totalEncadrants: 0, chargeMoyenne: 0, tauxRetard: 0, tauxPlanification: 0, totalEtudiants: 0 },
        charts: { charge: null, surcharge: null, planif: null, calendrier: null, phases: null, retard: null },
      },

      // Encadrant data (from /dashboard/encadrant)
      encData: {
        kpi: { nbEtudiants: 0, tauxValidation: 0, avancementMoyen: 0, reunionsMoyennes: 0, tauxReussite: 0, sujetsValides: 0, sujetsTotal: 0 },
        charts: { sujets: null, reunions: null, rapports: null, avancement: null, retard: null, reussite: null },
      },

      // Jury data (derived from /jurys-pfe)
      juryData: {
        totalProjets: 0,
        evalues: 0,
        nonEvalues: 0,
        noteMoyenne: '—',
        projets: [],
        notes: [],
      },

      // Track which tabs have been loaded
      loaded: { chef: false, encadrant: false, jury: false },
      erreur: null,
    }
  },

  computed: {
    activeRoleLabel() {
      return this.roleTabs.find(t => t.key === this.activeRole)?.label || ''
    },
  },

  async mounted() {
    await this.charger()
  },

  beforeUnmount() {
    this.destroyAll()
  },

  methods: {
    // ── TAB SWITCH ─────────────────────────────────────────────────
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

    // ── LOAD DATA ──────────────────────────────────────────────────
    async charger() {
      this.loading = true
      this.erreur = null
      try {
        if (this.activeRole === 'chef') {
          await this.loadChef()
        } else if (this.activeRole === 'encadrant') {
          await this.loadEncadrant()
        } else if (this.activeRole === 'jury') {
          await this.loadJury()
        }
        this.loaded[this.activeRole] = true
        this.heureActualisation = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      } catch (e) {
        const status = e?.response?.status
        const msg    = e?.response?.data?.message || e?.message || 'Erreur inconnue'
        console.error(`[Dashboard Chef — tab: ${this.activeRole}] Erreur ${status || ''}:`, msg, e)
        this.erreur = `Erreur ${status ? status + ' — ' : ''}${msg}`
      } finally {
        this.loading = false
        await this.$nextTick()
        this.buildCharts()
      }
    },

    async loadChef() {
      const res = await api.get('/dashboard/chef')
      this.chefData.kpi = res.data.kpi
      this.chefData.charts = {
        charge:     res.data.charts.chargeEncadrants,
        surcharge:  res.data.charts.surchargeEncadrants,
        planif:     res.data.charts.planificationSoutenances,
        calendrier: res.data.charts.respectCalendrier,
        phases:     res.data.charts.respectPhases,
        retard:     res.data.charts.retardParEncadrant,
      }
    },

    async loadEncadrant() {
      const res = await api.get('/dashboard/encadrant')
      this.encData.kpi = res.data.kpi
      this.encData.charts = {
        sujets:     res.data.charts.validationSujets,
        reunions:   res.data.charts.chargeSuiviEtudiants,
        rapports:   res.data.charts.validationRapports,
        avancement: res.data.charts.avancementMoyen,
        retard:     res.data.charts.pfeEnRetard,
        reussite:   res.data.charts.tauxReussite,
      }
    },

    async loadJury() {
      // Jury data derived from /jurys-pfe (filtered to the current user's memberships)
      const userId = this.currentUser.id
      const [jurysRes, notesArr] = await Promise.all([
        api.get('/jurys-pfe'),
        api.get('/jurys-pfe').then(r =>
          (r.data || []).filter(j =>
            (j.membres || []).some(m => m.enseignant_id === userId)
          )
        ),
      ])

      const mesProjets = notesArr
      const evalues = mesProjets.filter(j => {
        const myNote = (j.membres || []).find(m => m.enseignant_id === userId)
        return myNote && myNote.note !== null
      })

      const notes = evalues
        .map(j => {
          const m = (j.membres || []).find(m => m.enseignant_id === userId)
          return { titre: j.projet_titre || ('Projet #' + j.id), note: m?.note || 0 }
        })

      const noteMoyenne = notes.length > 0
        ? (notes.reduce((s, n) => s + n.note, 0) / notes.length).toFixed(1)
        : '—'

      this.juryData = {
        totalProjets: mesProjets.length,
        evalues: evalues.length,
        nonEvalues: mesProjets.length - evalues.length,
        noteMoyenne,
        projets: mesProjets.map(j => j.projet_titre || ('Projet #' + j.id)),
        notes: notes.map(n => n.note),
      }
    },

    // ── CHARTS ROUTER ─────────────────────────────────────────────
    buildCharts() {
      if (this.activeRole === 'chef')      this.buildChefCharts()
      else if (this.activeRole === 'encadrant') this.buildEncCharts()
      else if (this.activeRole === 'jury') this.buildJuryCharts()
    },

    destroyAll() {
      Object.values(this.instances).forEach(c => c?.destroy())
      this.instances = {}
    },

    d(key) { this.instances[key]?.destroy(); delete this.instances[key] },

    // ── CHEF CHARTS ────────────────────────────────────────────────
    buildChefCharts() {
      this.buildCharge(); this.buildSurcharge(); this.buildPlanif()
      this.buildCalendrier(); this.buildPhases(); this.buildRetardChef()
    },

    buildCharge() {
      this.d('charge')
      const ctx = this.$refs.chargeCanvas
      if (!ctx || !this.chefData.charts.charge?.labels?.length) return
      this.instances.charge = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.chefData.charts.charge.labels,
          datasets: [{ label: 'Étudiants', data: this.chefData.charts.charge.values,
            backgroundColor: this.chefData.charts.charge.labels.map((_, i) => hex(Object.values(P)[i % 5], 0.75)),
            borderRadius: 6, borderSkipped: false }],
        },
        options: { responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw} étudiant(s)` } } },
          scales: { y: { ...scaleY(), ticks: { stepSize: 1, color: '#8a9aaa' } }, x: scaleX() } },
      })
    },

    buildSurcharge() {
      this.d('surcharge')
      const ctx = this.$refs.surchargeCanvas
      if (!ctx || !this.chefData.charts.surcharge?.labels?.length) return
      const seuil = this.chefData.charts.surcharge.seuil || 5
      this.instances.surcharge = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.chefData.charts.surcharge.labels,
          datasets: [{ label: 'Étudiants', data: this.chefData.charts.surcharge.values,
            backgroundColor: this.chefData.charts.surcharge.values.map(v => v > seuil ? hex(P.red, 0.75) : hex(P.teal, 0.65)),
            borderRadius: 6, borderSkipped: false }],
        },
        options: { responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw} ${c.raw > seuil ? '⚠ Surchargé' : ''}` } } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: '#8a9aaa' }, grid: { color: 'rgba(200,196,188,0.1)' } }, x: scaleX() } },
      })
    },

    buildPlanif() {
      this.d('planif')
      const ctx = this.$refs.planifCanvas
      if (!ctx || !this.chefData.charts.planif) return
      this.instances.planif = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.chefData.charts.planif.labels,
          datasets: [{ data: this.chefData.charts.planif.values,
            backgroundColor: [hex(P.teal, 0.8), hex(P.slate, 0.3)],
            borderColor: ['#27ae60', '#c8c4bc'], borderWidth: 2, circumference: 270, rotation: -135 }],
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '72%',
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw} soutenances` } } } },
      })
    },

    buildCalendrier() {
      this.d('calendrier')
      const ctx = this.$refs.calendrierCanvas
      if (!ctx || !this.chefData.charts.calendrier?.labels?.length) return
      this.instances.calendrier = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.chefData.charts.calendrier.labels,
          datasets: [
            { label: 'Total prévues', data: this.chefData.charts.calendrier.total, borderColor: P.blue, backgroundColor: hex(P.blue, 0.08), tension: 0.4, fill: true, pointRadius: 4 },
            { label: 'À temps', data: this.chefData.charts.calendrier.aTemps, borderColor: P.teal, backgroundColor: hex(P.teal, 0.08), tension: 0.4, fill: true, pointRadius: 4 },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#8a9aaa', boxWidth: 12 } } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: '#8a9aaa' }, grid: { color: 'rgba(200,196,188,0.1)' } }, x: scaleX() } },
      })
    },

    buildPhases() {
      this.d('phases')
      const ctx = this.$refs.phasesCanvas
      if (!ctx || !this.chefData.charts.phases?.labels?.length) return
      this.instances.phases = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.chefData.charts.phases.labels,
          datasets: [{ label: 'Taux de respect (%)', data: this.chefData.charts.phases.values,
            borderColor: P.purple, backgroundColor: hex(P.purple, 0.1), tension: 0.4, fill: true, pointRadius: 5, pointBackgroundColor: P.purple }],
        },
        options: { responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { min: 0, max: 100, ticks: { callback: v => v + '%', color: '#8a9aaa' }, grid: { color: 'rgba(200,196,188,0.1)' } }, x: scaleX() } },
      })
    },

    buildRetardChef() {
      this.d('retard')
      const ctx = this.$refs.retardCanvas
      if (!ctx || !this.chefData.charts.retard?.labels?.length) return
      this.instances.retard = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.chefData.charts.retard.labels,
          datasets: [{ label: 'Taux de retard (%)', data: this.chefData.charts.retard.values,
            backgroundColor: this.chefData.charts.retard.values.map(v => v > 40 ? hex(P.red, 0.75) : v > 20 ? hex(P.gold, 0.75) : hex(P.teal, 0.65)),
            borderRadius: 6, borderSkipped: false }],
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw}% en retard` } } },
          scales: { x: { min: 0, max: 100, ticks: { callback: v => v + '%', color: '#8a9aaa' }, grid: { color: 'rgba(200,196,188,0.1)' } }, y: { ticks: { color: '#8a9aaa' }, grid: { display: false } } } },
      })
    },

    // ── ENCADRANT CHARTS ───────────────────────────────────────────
    buildEncCharts() {
      this.buildEncSujets(); this.buildEncReunions(); this.buildEncRapports()
      this.buildEncAvancement(); this.buildEncAvancGauge(); this.buildEncRetard(); this.buildEncReussite()
    },

    buildEncSujets() {
      this.d('encSujets')
      const ctx = this.$refs.encSujetsCanvas
      if (!ctx || !this.encData.charts.sujets?.values?.length) return
      this.instances.encSujets = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: this.encData.charts.sujets.labels,
          datasets: [{ data: this.encData.charts.sujets.values, backgroundColor: [hex(P.teal, 0.8), hex(P.gold, 0.75)], borderColor: [P.teal, P.gold], borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%',
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw} sujet(s)` } } } },
      })
    },

    buildEncReunions() {
      this.d('encReunions')
      const ctx = this.$refs.encReunionsCanvas
      if (!ctx || !this.encData.charts.reunions?.labels?.length) return
      this.instances.encReunions = new Chart(ctx, {
        type: 'bar',
        data: { labels: this.encData.charts.reunions.labels,
          datasets: [{ label: 'Réunions', data: this.encData.charts.reunions.values,
            backgroundColor: this.encData.charts.reunions.values.map((_, i) => hex(Object.values(P)[i % Object.keys(P).length], 0.72)),
            borderRadius: 6, borderSkipped: false }] },
        options: { responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw} réunion(s)` } } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: '#8a9aaa' }, grid: { color: 'rgba(200,196,188,0.1)' } }, x: { ticks: { color: '#8a9aaa', maxRotation: 30 }, grid: { display: false } } } },
      })
    },

    buildEncRapports() {
      this.d('encRapports')
      const ctx = this.$refs.encRapportsCanvas
      if (!ctx || !this.encData.charts.rapports?.values?.length) return
      this.instances.encRapports = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: this.encData.charts.rapports.labels,
          datasets: [{ data: this.encData.charts.rapports.values, backgroundColor: [hex(P.teal, 0.8), hex(P.gold, 0.75), hex(P.red, 0.7)], borderColor: [P.teal, P.gold, P.red], borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%',
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw} livrable(s)` } } } },
      })
    },

    buildEncAvancement() {
      this.d('encAvanc')
      const ctx = this.$refs.encAvancCanvas
      if (!ctx || !this.encData.charts.avancement?.labels?.length) return
      this.instances.encAvanc = new Chart(ctx, {
        type: 'bar',
        data: { labels: this.encData.charts.avancement.labels,
          datasets: [{ label: 'Avancement (%)', data: this.encData.charts.avancement.values,
            backgroundColor: this.encData.charts.avancement.values.map(v => v >= 70 ? hex(P.teal, 0.75) : v >= 40 ? hex(P.gold, 0.75) : hex(P.red, 0.7)),
            borderRadius: 5, borderSkipped: false }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw}% avancement` } } },
          scales: { x: { min: 0, max: 100, ticks: { callback: v => v + '%', color: '#8a9aaa' }, grid: { color: 'rgba(200,196,188,0.1)' } }, y: { ticks: { color: '#8a9aaa' }, grid: { display: false } } } },
      })
    },

    buildEncAvancGauge() {
      this.d('encAvancGauge')
      const ctx = this.$refs.encAvancGaugeCanvas
      if (!ctx) return
      const v = this.encData.kpi.avancementMoyen
      const color = v >= 70 ? P.teal : v >= 40 ? P.gold : P.red
      this.instances.encAvancGauge = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: [v, 100 - v], backgroundColor: [hex(color, 0.85), hex(P.slate, 0.15)], borderColor: [color, 'transparent'], borderWidth: 2, circumference: 270, rotation: -135 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '72%',
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw}%` } } } },
      })
    },

    buildEncRetard() {
      this.d('encRetard')
      const ctx = this.$refs.encRetardCanvas
      if (!ctx || !this.encData.charts.retard?.labels?.length) return
      this.instances.encRetard = new Chart(ctx, {
        type: 'bar',
        data: { labels: this.encData.charts.retard.labels,
          datasets: [{ label: 'En retard', data: this.encData.charts.retard.values,
            backgroundColor: this.encData.charts.retard.values.map(v => v ? hex(P.red, 0.75) : hex(P.teal, 0.65)),
            borderRadius: 6, borderSkipped: false }] },
        options: { responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.raw ? ' ⚠ En retard' : ' ✓ À jour' } } },
          scales: { y: { min: 0, max: 1, ticks: { stepSize: 1, callback: v => v === 1 ? 'Retard' : 'OK', color: '#8a9aaa' }, grid: { color: 'rgba(200,196,188,0.1)' } }, x: { ticks: { color: '#8a9aaa', maxRotation: 30 }, grid: { display: false } } } },
      })
    },

    buildEncReussite() {
      this.d('encReussite')
      const ctx = this.$refs.encReussiteCanvas
      if (!ctx) return
      const v = this.encData.kpi.tauxReussite
      const color = v >= 70 ? P.teal : P.red
      this.instances.encReussite = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: [v, 100 - v], backgroundColor: [hex(color, 0.85), hex(P.slate, 0.15)], borderColor: [color, 'transparent'], borderWidth: 2, circumference: 270, rotation: -135 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '72%',
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw}%` } } } },
      })
    },

    // ── JURY CHARTS ────────────────────────────────────────────────
    buildJuryCharts() {
      this.buildJuryEtat(); this.buildJuryNotes()
    },

    buildJuryEtat() {
      this.d('juryEtat')
      const ctx = this.$refs.juryEtatCanvas
      if (!ctx) return
      this.instances.juryEtat = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Soumises', 'En attente'],
          datasets: [{ data: [this.juryData.evalues, this.juryData.nonEvalues],
            backgroundColor: [hex(P.teal, 0.8), hex(P.gold, 0.75)], borderColor: [P.teal, P.gold], borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%',
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw} évaluation(s)` } } } },
      })
    },

    buildJuryNotes() {
      this.d('juryNotes')
      const ctx = this.$refs.juryNotesCanvas
      if (!ctx || !this.juryData.projets?.length) return
      this.instances.juryNotes = new Chart(ctx, {
        type: 'bar',
        data: { labels: this.juryData.projets,
          datasets: [{ label: 'Note /20', data: this.juryData.notes,
            backgroundColor: this.juryData.notes.map(n => n >= 10 ? hex(P.teal, 0.75) : hex(P.red, 0.7)),
            borderRadius: 6, borderSkipped: false }] },
        options: { responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw}/20` } } },
          scales: { y: { min: 0, max: 20, ticks: { stepSize: 4, color: '#8a9aaa' }, grid: { color: 'rgba(200,196,188,0.1)' } }, x: { ticks: { color: '#8a9aaa', maxRotation: 30 }, grid: { display: false } } } },
      })
    },

    // ── PDF EXPORT ─────────────────────────────────────────────────
    async telechargerPDF() {
      this.downloading = true
      try {
        // Dynamically load html2canvas and jsPDF from CDN if not already present
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'html2canvas')
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf')

        const el = this.$refs.dashboardRoot
        const canvas = await window.html2canvas(el, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: '#c8c4bc',
          logging: false,
        })

        const imgData = canvas.toDataURL('image/png')
        const { jsPDF } = window.jspdf
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' })

        const pdfW = pdf.internal.pageSize.getWidth()
        const pdfH = pdf.internal.pageSize.getHeight()
        const ratio = canvas.width / canvas.height
        let imgW = pdfW
        let imgH = pdfW / ratio

        // Multi-page if content is taller than one page
        if (imgH <= pdfH) {
          pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH)
        } else {
          let y = 0
          const pageH = (pdfH / imgW) * canvas.width
          let remainingH = canvas.height

          while (remainingH > 0) {
            const sliceH = Math.min(pageH, remainingH)
            const sliceCanvas = document.createElement('canvas')
            sliceCanvas.width = canvas.width
            sliceCanvas.height = sliceH
            const ctx2 = sliceCanvas.getContext('2d')
            ctx2.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH)
            if (y > 0) pdf.addPage()
            pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, (sliceH / canvas.width) * imgW)
            y += sliceH
            remainingH -= sliceH
          }
        }

        const role = this.roleTabs.find(t => t.key === this.activeRole)?.label || this.activeRole
        const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')
        pdf.save(`Dashboard_${role}_${date}.pdf`)
      } catch (e) {
        console.error('Erreur export PDF:', e)
        alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
      } finally {
        this.downloading = false
      }
    },

    loadScript(src, globalKey) {
      if (window[globalKey]) return Promise.resolve()
      return new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = src
        s.onload = resolve
        s.onerror = reject
        document.head.appendChild(s)
      })
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600&display=swap');

.home-wrap { padding: 0; }

/* ── Header ── */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title  { font-family: 'Merriweather', serif; font-size: 22px; font-weight: 700; color: #1e2a35; margin-bottom: 4px; }
.page-sub    { font-size: 13.5px; color: #7A8FA6; }
.header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.last-refresh { font-size: 12px; color: #aaa; }

.btn-refresh, .btn-download {
  display: flex; align-items: center; gap: 6px; padding: 8px 14px;
  border: 1.5px solid #c8c4bc; border-radius: 9px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: all .18s;
}
.btn-refresh  { background: #e8e4dc; color: #4a5a6a; }
.btn-download { background: #3d6080; color: #fff; border-color: #3d6080; }
.btn-refresh:hover:not(:disabled)  { border-color: #3d6080; color: #3d6080; }
.btn-download:hover:not(:disabled) { background: #2f4f6a; }
.btn-refresh:disabled, .btn-download:disabled { opacity: .5; cursor: not-allowed; }

.spinning { animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Role Tabs ── */
.role-tabs {
  display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap;
  background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 14px; padding: 6px;
}
.role-tab {
  display: flex; align-items: center; gap: 8px; padding: 10px 18px;
  border: none; border-radius: 10px; background: transparent;
  color: #7A8FA6; font-size: 13.5px; font-weight: 600;
  cursor: pointer; font-family: 'Source Sans 3', sans-serif;
  transition: all .2s; position: relative;
}
.role-tab:hover { background: rgba(61,96,128,0.08); color: #3d6080; }
.role-tab.active {
  background: #fff; color: #3d6080;
  box-shadow: 0 2px 8px rgba(61,96,128,0.15);
  border: 1.5px solid #c8c4bc;
}
.tab-icon { display: flex; align-items: center; }
.tab-desc {
  font-size: 11px; font-weight: 400; color: #8a9aaa;
  border-left: 1px solid #c8c4bc; margin-left: 4px; padding-left: 8px;
}

/* ── Section labels ── */
.section-label { font-size: 11px; font-weight: 700; color: #8a9aaa; text-transform: uppercase; letter-spacing: .1em; margin: 24px 0 12px; }

/* ── KPI Rows ── */
.kpi-row { display: grid; gap: 14px; margin-bottom: 8px; }
.kpi-6 { grid-template-columns: repeat(6, 1fr); }
.kpi-5 { grid-template-columns: repeat(5, 1fr); }
.kpi-4 { grid-template-columns: repeat(4, 1fr); }

.kpi-card { background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 14px; padding: 18px 16px; display: flex; align-items: center; gap: 13px; box-shadow: 0 2px 10px rgba(0,0,0,.05); }
.kpi-icon-wrap { width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-blue .kpi-icon-wrap   { background: rgba(61,96,128,.12);  color: #3d6080; }
.kpi-teal .kpi-icon-wrap   { background: rgba(39,174,96,.12);  color: #27ae60; }
.kpi-gold .kpi-icon-wrap   { background: rgba(245,166,35,.12); color: #d98e1a; }
.kpi-red .kpi-icon-wrap    { background: rgba(231,76,60,.12);  color: #e74c3c; }
.kpi-green .kpi-icon-wrap  { background: rgba(39,174,96,.12);  color: #27ae60; }
.kpi-purple .kpi-icon-wrap { background: rgba(142,68,173,.12); color: #8e44ad; }
.kpi-slate .kpi-icon-wrap  { background: rgba(127,140,141,.12);color: #7f8c8d; }
.kpi-value { font-family: 'Merriweather', serif; font-size: 22px; font-weight: 700; color: #1e2a35; line-height: 1; }
.kpi-label { font-size: 11.5px; color: #8a9aaa; margin-top: 3px; }
.kpi-sub   { font-size: 11px; color: #aab; margin-top: 2px; }

/* ── Chart layout ── */
.chart-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 8px; }
.two-cols     { grid-template-columns: 1fr 2fr; }
.three-cols   { grid-template-columns: repeat(3, 1fr); }
.chart-wide   { grid-column: span 1; }

.chart-card { background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 16px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,.05); }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.chart-title  { font-size: 13.5px; font-weight: 700; color: #1e2a35; }
.chart-badge  { font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: rgba(61,96,128,.12); color: #3d6080; }
.chart-badge-green  { background: rgba(39,174,96,.12);  color: #27ae60; }
.chart-badge-orange { background: rgba(245,166,35,.12); color: #d98e1a; }
.chart-badge-blue   { background: rgba(61,96,128,.12);  color: #3d6080; }
.chart-badge-teal   { background: rgba(39,174,96,.12);  color: #27ae60; }
.chart-badge-gold   { background: rgba(245,166,35,.12); color: #d98e1a; }
.chart-badge-purple { background: rgba(142,68,173,.12); color: #8e44ad; }
.chart-area    { height: 200px; position: relative; }
.chart-area-sm { height: 130px; position: relative; }
.chart-footer  { margin-top: 10px; font-size: 12.5px; color: #7A8FA6; text-align: center; }

.seuil-badge { font-size: 10px; background: rgba(231,76,60,.12); color: #e74c3c; padding: 2px 7px; border-radius: 20px; margin-left: 6px; }

/* ── Gauge ── */
.gauge-wrap   { position: relative; height: 180px; display: flex; align-items: center; justify-content: center; }
.gauge-center { position: absolute; text-align: center; top: 52%; transform: translateY(-50%); }
.gauge-pct    { font-family: 'Merriweather', serif; font-size: 26px; font-weight: 700; color: #1e2a35; }
.gauge-lbl    { font-size: 12px; color: #8a9aaa; margin-top: 2px; }
.planif-details { display: flex; justify-content: center; gap: 20px; margin-top: 8px; }
.pd-item { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #7A8FA6; }

/* ── Dots ── */
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
.dot-green { background: #27ae60; }.dot-grey { background: #c8c4bc; }
.dot-teal  { background: #27ae60; }.dot-gold  { background: #f5a623; }.dot-red { background: #e74c3c; }

/* ── Pie ── */
.pie-wrap   { display: flex; align-items: center; gap: 20px; min-height: 180px; }
.pie-canvas { flex-shrink: 0; width: 160px !important; height: 160px !important; }
.pie-legend { display: flex; flex-direction: column; gap: 8px; }
.pie-leg-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1e2a35; }
.pie-rate { margin-top: 6px; font-family: 'Merriweather', serif; font-size: 18px; font-weight: 700; color: #1e2a35; }

/* ── Retard ── */
.retard-summary { text-align: center; margin-bottom: 10px; }
.retard-big     { font-family: 'Merriweather', serif; font-size: 32px; font-weight: 700; }
.retard-sub     { font-size: 12px; color: #7A8FA6; margin-top: 2px; }
.text-teal { color: #27ae60; }.text-gold { color: #d98e1a; }.text-red { color: #e74c3c; }

/* ── Quick actions ── */
.qa-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 8px; }
.qa-card { display: flex; align-items: center; gap: 12px; background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 14px; padding: 16px; cursor: pointer; text-align: left; transition: all .2s; }
.qa-card:hover { border-color: #3d6080; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(61,96,128,.12); }
.qa-icon   { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.qa-blue   { background: rgba(61,96,128,.12);  color: #3d6080; }
.qa-gold   { background: rgba(245,166,35,.12); color: #d98e1a; }
.qa-teal   { background: rgba(39,174,96,.12);  color: #27ae60; }
.qa-purple { background: rgba(142,68,173,.12); color: #8e44ad; }
.qa-txt { flex: 1; }
.qa-t { font-size: 13.5px; font-weight: 600; color: #1e2a35; margin-bottom: 2px; }
.qa-s { font-size: 12px; color: #8a9aaa; }
.qa-arr { color: #c8c4bc; flex-shrink: 0; transition: transform .18s, color .18s; }
.qa-card:hover .qa-arr { transform: translateX(3px); color: #3d6080; }

/* ── Loading ── */
.loading-state { text-align: center; padding: 60px; color: #7A8FA6; }
.spinner { width: 32px; height: 32px; border: 3px solid #c8c4bc; border-top-color: #3d6080; border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 12px; }
.error-state { background: #fff5f5; border: 1.5px solid #f5c6cb; border-radius: 14px; padding: 36px; text-align: center; margin-top: 12px; }
.error-icon  { font-size: 40px; margin-bottom: 12px; }
.error-title { font-family: 'Merriweather', serif; font-size: 16px; font-weight: 700; color: #c0392b; margin-bottom: 8px; }
.error-msg   { font-size: 13.5px; color: #e74c3c; font-weight: 600; margin-bottom: 10px; background: #fde8e8; padding: 8px 14px; border-radius: 8px; display: inline-block; }
.error-hint  { font-size: 12.5px; color: #888; max-width: 520px; margin: 0 auto; line-height: 1.6; }

/* ── Responsive ── */
@media(max-width:1400px) { .kpi-6 { grid-template-columns: repeat(3,1fr); } }
@media(max-width:1200px) {
  .kpi-5, .kpi-4 { grid-template-columns: repeat(2,1fr); }
  .chart-row, .two-cols, .three-cols { grid-template-columns: 1fr; }
  .qa-grid { grid-template-columns: repeat(2,1fr); }
  .role-tab .tab-desc { display: none; }
}
@media(max-width:768px) {
  .kpi-6, .kpi-5, .kpi-4 { grid-template-columns: repeat(2,1fr); }
  .qa-grid { grid-template-columns: 1fr; }
  .pie-canvas { width: 120px !important; height: 120px !important; }
}
</style>