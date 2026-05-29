<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">Suivi des étudiants</h2>
      <p class="page-sub">Consultez l'avancement des projets assignés à votre jury</p>
    </div>
    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
    <div v-else-if="!suivis.length" class="empty-state">
      <div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
      <p>Aucun étudiant assigné à votre jury pour le moment.</p>
    </div>
    <div v-else class="suivi-grid">
      <div v-for="e in suivis" :key="e.id" class="suivi-card">
        <div class="suivi-top">
          <div class="suivi-avatar" :style="{ background: e.color }">{{ initiales(e.nom) }}</div>
          <div class="suivi-info">
            <div class="suivi-name">{{ e.nom }}</div>
            <div class="suivi-subject">{{ e.sujet || '—' }}</div>
          </div>
          <div class="suivi-pct">{{ e.progress }}%</div>
        </div>
        <div class="progress-bar"><div class="progress-fill" :style="{ width: e.progress + '%', background: e.color }"></div></div>
        <div class="suivi-phase">
          <span class="phase-label">Phase :</span>
          <span class="phase-value">{{ e.phaseActuelle || '—' }}</span>
          <span class="phase-badge" :class="e.phaseActive ? 'phase-active' : 'phase-wait'">
            {{ e.phaseActive ? 'En cours' : 'En attente' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'
const COLORS = ['#3d6080','#27ae60','#d35400','#8e44ad','#2980b9','#c0392b']
export default {
  name: 'SuiviEtudiantsJury',
  data() { return { suivis: [], loading: false } },
  async mounted() {
    this.loading = true
    try {
      const res = await api.get('/suivi/encadrant')
      this.suivis = (res.data || []).map((e, i) => ({
        id: e.id, nom: e.nom, sujet: e.sujet,
        progress: e.progress || 0,
        phaseActuelle: e.phaseActuelle || '—',
        phaseActive: e.phaseActive || false,
        color: COLORS[i % COLORS.length],
      }))
    } catch { this.suivis = [] }
    finally { this.loading = false }
  },
  methods: {
    initiales(n) { return (n || '?').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) },
  },
}
</script>