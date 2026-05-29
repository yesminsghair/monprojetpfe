<template>
  <div>
    <div class="mb-4">
      <h2 class="vld-page-title">Calendrier de soutenance</h2>
      <p class="vld-page-sub">Vos sessions planifiées</p>
    </div>

    <div v-if="loading" class="vld-state">
      <div class="vld-spinner mx-auto mb-3"></div>
      <p>Chargement...</p>
    </div>

    <div v-else-if="!sessions.length" class="vld-state">
      <div class="vld-state__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </div>
      <p class="vld-state__title">Aucune session planifiée</p>
      <p class="vld-state__sub">Aucune soutenance n'a encore été planifiée.</p>
    </div>

    <div v-else class="d-flex flex-column gap-3">
      <div v-for="s in sessions" :key="s.id" class="card">
        <div class="card-body d-flex align-items-center gap-4">
          <!-- Date block -->
          <div class="text-center" style="min-width:56px">
            <div style="font-family:var(--vld-font-display);font-size:28px;font-weight:800;color:var(--vld-primary);line-height:1">
              {{ formatDay(s.date) }}
            </div>
            <div style="font-size:11px;color:var(--vld-text-muted);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-top:2px">
              {{ formatMonth(s.date) }}
            </div>
          </div>

          <!-- Details -->
          <div class="flex-grow-1">
            <div class="fw-bold mb-1" style="font-size:14.5px;color:var(--vld-text-strong)">{{ s.projet }}</div>
            <div style="font-size:13px;color:var(--vld-text);margin-bottom:3px">
              {{ s.heure_debut }} – {{ s.heure_fin }}
              <span v-if="s.salle"> · Salle {{ s.salle }}</span>
            </div>
            <div style="font-size:13px;color:var(--vld-text-muted)">{{ s.etudiant }}</div>
          </div>

          <!-- Status -->
          <span class="badge" :class="s.evalue ? 'bg-success' : 'bg-warning text-dark'">
            {{ s.evalue ? 'Évalué' : 'À évaluer' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'CalendrierSoutenance',
  emits: ['toast'],

  props: {
    currentUser: { type: Object, required: true },
  },

  data () {
    return { sessions: [], loading: false }
  },

  async mounted () {
    await this.charger()
  },

  methods: {
    async charger () {
      this.loading = true
      try {
        const res    = await api.get('/jurys-pfe')
        const userId = this.currentUser.id
        this.sessions = (res.data || [])
          .filter(j => j.date_soutenance && (
            j.encadrant_id === userId ||
            (j.membres || []).some(m => m.enseignant_id === userId)
          ))
          .map(j => ({
            id:          j.id,
            date:        j.date_soutenance,
            heure_debut: (j.heure_debut || '').substring(0, 5),
            heure_fin:   (j.heure_fin   || '').substring(0, 5),
            salle:       j.salle        || '',
            projet:      j.projet_titre || '—',
            etudiant:    j.etudiant_nom || '—',
            evalue:      false,
          }))
      } catch (e) {
        this.sessions = []
      } finally {
        this.loading = false
      }
    },

    formatDay (d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric' })
    },

    formatMonth (d) {
      if (!d) return ''
      return new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }).toUpperCase()
    },
  },
}
</script>