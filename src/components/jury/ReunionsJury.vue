<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">Réunions</h2>
      <p class="page-sub">Consultez les réunions liées aux projets de votre jury</p>
    </div>
    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
    <div v-else-if="!reunions.length" class="empty-state">
      <div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/></svg></div>
      <p>Aucune réunion trouvée.</p>
    </div>
    <div v-else class="list-cards">
      <div v-for="r in reunions" :key="r.id" class="list-card">
        <div class="date-block">
          <div class="date-day">{{ formatDay(r.date_reunion) }}</div>
          <div class="date-month">{{ formatMonth(r.date_reunion) }}</div>
        </div>
        <div class="list-details">
          <div class="list-title">{{ r.etudiant_nom }}</div>
          <div class="list-sub">{{ formatTime(r.date_reunion) }} · {{ r.encadrant_nom }}</div>
        </div>
        <span class="badge" :class="{ 'badge-success': r.statut==='confirmee', 'badge-warning': r.statut==='planifiee', 'badge-danger': r.statut==='annulee' }">
          {{ { confirmee:'Confirmée', planifiee:'Planifiée', annulee:'Annulée' }[r.statut] || r.statut }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'
export default {
  name: 'ReunionsJury',
  data() { return { reunions: [], loading: false } },
  async mounted() {
    this.loading = true
    try {
      const res = await api.get('/reunions')
      this.reunions = (res.data || [])
        .filter(r => r.statut !== 'annulee')
        .map(r => ({ id: r.id, etudiant_nom: r.etudiant_nom || '—', encadrant_nom: r.encadrant_nom || '—', date_reunion: r.date_reunion, statut: r.statut }))
    } catch { this.reunions = [] }
    finally { this.loading = false }
  },
  methods: {
    formatDay(d)   { try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric' }) } catch { return d } },
    formatMonth(d) { try { return new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) } catch { return '' } },
    formatTime(d)  { try { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) } catch { return '' } },
  },
}
</script>