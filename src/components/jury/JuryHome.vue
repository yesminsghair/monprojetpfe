<template>
  <div>
    <div class="page-hero">
      <h1 class="page-title">Bonjour, {{ currentUser.prenom }}</h1>
      <p class="page-sub">Consultez vos projets à évaluer et soumettez vos fiches d'évaluation.</p>
    </div>

    <div v-if="projetsNonEvalues > 0" class="banner banner-warning">
      <div class="banner-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <div class="banner-body">
        <div class="banner-title">{{ projetsNonEvalues }} projet(s) en attente d'évaluation</div>
        <div class="banner-sub">La délibération ne peut avoir lieu qu'après toutes les évaluations.</div>
      </div>
      <button class="btn-primary-sm" @click="$emit('navigate', 'mes-projets')">Évaluer maintenant →</button>
    </div>

    <div class="kpi-grid kpi-grid-4">
      <div class="kpi-card kpi-blue">
        <div class="kpi-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
        </div>
        <div>
          <div class="kpi-value">{{ mesProjets.length }}</div>
          <div class="kpi-label">Projets assignés</div>
        </div>
      </div>
      <div class="kpi-card kpi-gold">
        <div class="kpi-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div>
          <div class="kpi-value">{{ projetsNonEvalues }}</div>
          <div class="kpi-label">À évaluer</div>
        </div>
      </div>
      <div class="kpi-card kpi-green">
        <div class="kpi-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <div class="kpi-value">{{ mesEvaluations.length }}</div>
          <div class="kpi-label">Évaluations soumises</div>
        </div>
      </div>
      <div class="kpi-card kpi-slate">
        <div class="kpi-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <div class="kpi-value">{{ mesSessions.length }}</div>
          <div class="kpi-label">Sessions planifiées</div>
        </div>
      </div>
    </div>

    <div class="section-label">Actions rapides</div>
    <div class="qa-grid qa-grid-3">
      <button class="qa-card" @click="$emit('navigate', 'mes-projets')">
        <div class="qa-icon qa-gold">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
        </div>
        <div class="qa-content">
          <div class="qa-title">Évaluer un projet</div>
          <div class="qa-sub">Consulter le livrable et remplir la grille</div>
        </div>
        <svg class="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <button class="qa-card" @click="$emit('navigate', 'suivi')">
        <div class="qa-icon qa-blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <div class="qa-content">
          <div class="qa-title">Suivi des étudiants</div>
          <div class="qa-sub">Consulter l'avancement des projets</div>
        </div>
        <svg class="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <button class="qa-card" @click="$emit('navigate', 'calendrier')">
        <div class="qa-icon qa-teal">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="qa-content">
          <div class="qa-title">Calendrier soutenances</div>
          <div class="qa-sub">Voir mes sessions planifiées</div>
        </div>
        <svg class="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JuryHome',
  emits: ['navigate'],
  props: {
    currentUser:    { type: Object, required: true },
    mesProjets:     { type: Array, default: () => [] },
    mesEvaluations: { type: Array, default: () => [] },
    mesSessions:    { type: Array, default: () => [] },
  },
  computed: {
    projetsNonEvalues() { return this.mesProjets.filter(p => !p.evalue).length },
  },
}
</script>