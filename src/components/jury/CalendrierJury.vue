<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">Mon calendrier de soutenances</h2>
      <p class="page-sub">Vos sessions de soutenance planifiées</p>
    </div>
    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
    <div v-else-if="!sessions.length" class="empty-state">
      <div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <p>Aucune session de soutenance planifiée pour vous.</p>
    </div>
    <div v-else class="sessions-list">
      <div v-for="s in sessions" :key="s.id" class="session-card">
        <div class="session-date-block">
          <div class="session-day">{{ formatDay(s.date) }}</div>
          <div class="session-month">{{ formatMonth(s.date) }}</div>
        </div>
        <div class="session-details">
          <div class="session-title">{{ s.projet }}</div>
          <div class="session-info">{{ s.heure_debut }} – {{ s.heure_fin }} · {{ s.salle }}</div>
          <div class="session-student">{{ s.etudiant }}</div>
        </div>
        <span class="badge" :class="s.evalue ? 'badge-success' : 'badge-warning'">
          {{ s.evalue ? 'Évalué' : 'À évaluer' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'
export default {
  name: 'CalendrierJury',
  props: { currentUser: { type: Object, required: true } },
  data() { return { sessions: [], loading: false } },
  async mounted() {
    this.loading = true
    try {
      const res = await api.get('/soutenances')
      this.sessions = (res.data || [])
        .filter(s => s.statut !== 'annulee')
        .map(s => ({
          id: s.id, jury_id: s.jury_id,
          date: s.date || s.date_seance?.split('T')[0],
          heure_debut: s.heure_debut || '', heure_fin: s.heure_fin || '',
          salle: s.salle, projet: s.projet_titre || '—',
          etudiant: s.etudiant_nom || '—', evalue: false,
        }))
    } catch (e) { this.sessions = [] }
    finally { this.loading = false }
  },
  methods: {
    formatDay(d)   { try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric' }) } catch { return d } },
    formatMonth(d) { try { return new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) } catch { return '' } },
  },
}
</script>