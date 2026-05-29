<template>
  <div>
    <div class="mb-4">
      <h2 class="vld-page-title">Proposer un plan de soutenances</h2>
      <p class="vld-page-sub">Soumettez une proposition de créneaux au chef de département</p>
    </div>

    <div v-if="!etudiantsAffectes.length" class="vld-state">
      <div class="vld-state__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </div>
      <p class="vld-state__title">Aucun étudiant affecté</p>
      <p class="vld-state__sub">Vous devez avoir des étudiants affectés pour proposer un plan.</p>
    </div>

    <div v-else class="card">
      <div class="card-header">Créneaux proposés</div>
      <div class="card-body">
        <div v-for="(slot, i) in slots" :key="i" class="row g-3 align-items-end mb-3 pb-3" :class="{ 'border-bottom': i < slots.length - 1 }">
          <div class="col-12 col-sm-6 col-lg-3">
            <label class="form-label">Étudiant</label>
            <select v-model="slot.etudiant_id" class="form-select">
              <option value="">— Choisir —</option>
              <option v-for="e in etudiantsAffectes" :key="e.id" :value="e.id">{{ e.prenom }} {{ e.nom }}</option>
            </select>
          </div>
          <div class="col-6 col-sm-3 col-lg-2">
            <label class="form-label">Date</label>
            <input type="date" v-model="slot.date" class="form-control" />
          </div>
          <div class="col-6 col-sm-3 col-lg-2">
            <label class="form-label">Heure</label>
            <input type="time" v-model="slot.heure" class="form-control" />
          </div>
          <div class="col-6 col-sm-3 col-lg-2">
            <label class="form-label">Salle</label>
            <input type="text" v-model="slot.salle" class="form-control" placeholder="ex: A101" />
          </div>
          <div class="col-auto" v-if="slots.length > 1">
            <button class="btn btn-outline-danger btn-sm" @click="slots.splice(i, 1)">✕</button>
          </div>
        </div>

        <button class="btn btn-outline-primary d-flex align-items-center gap-2 mb-4" @click="slots.push({ etudiant_id:'', date:'', heure:'', salle:'' })">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Ajouter un créneau
        </button>

        <div class="d-flex justify-content-end">
          <button class="btn btn-primary d-flex align-items-center gap-2" @click="soumettre" :disabled="saving">
            <span v-if="saving" class="vld-spinner-sm"></span>
            {{ saving ? 'Envoi...' : 'Soumettre le plan' }}
          </button>
        </div>

        <div v-if="mesPlans.length" class="mt-4 pt-4 border-top">
          <div class="fw-bold mb-3" style="font-size:14px;color:var(--vld-text-strong)">Plans soumis précédemment</div>
          <div v-for="p in mesPlans" :key="p.id" class="d-flex align-items-center gap-3 mb-2">
            <span style="font-size:13px;color:var(--vld-text-muted);flex:1">{{ p.date }}</span>
            <span class="badge" :class="p.statut==='validé' ? 'bg-success' : p.statut==='rejeté' ? 'bg-danger' : 'bg-warning text-dark'">{{ p.statut }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'ProposerPlan',
  emits: ['toast'],
  props: {
    currentUser:       { type: Object, required: true    },
    etudiantsAffectes: { type: Array,  default: () => [] },
  },
  data () {
    return { slots: [{ etudiant_id:'', date:'', heure:'', salle:'' }], saving: false, mesPlans: [] }
  },
  async mounted () { await this.chargerPlans() },
  methods: {
    async chargerPlans () {
      try {
        const res    = await api.get('/plans-soutenance')
        const userId = this.currentUser.id
        this.mesPlans = (res.data || [])
          .filter(p => p.proposant_id === userId || p.encadrant_id === userId)
          .map(p => ({ id: p.id, date: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—', statut: p.statut || 'En attente' }))
      } catch (e) { /* ignore */ }
    },
    async soumettre () {
      if (!this.slots.every(s => s.date && s.heure && s.salle)) {
        this.$emit('toast', { message: "Veuillez remplir date, heure et salle pour chaque créneau.", type: 'err' }); return
      }
      if (!this.slots.some(s => s.etudiant_id)) {
        this.$emit('toast', { message: 'Sélectionnez au moins un étudiant.', type: 'err' }); return
      }
      this.saving = true
      try {
        await api.post('/plans-soutenance', {
          proposant_id: this.currentUser.id, role: this.currentUser.role,
          creneaux: this.slots.filter(s => s.etudiant_id).map(s => ({ etudiant_id: s.etudiant_id, date: s.date, heure_debut: s.heure, salle: s.salle })),
        })
        this.$emit('toast', { message: 'Plan soumis avec succès.', type: 'ok' })
        this.mesPlans.unshift({ id: Date.now(), date: new Date().toLocaleDateString('fr-FR'), statut: 'En attente' })
        this.slots = [{ etudiant_id:'', date:'', heure:'', salle:'' }]
      } catch (e) {
        this.$emit('toast', { message: e?.response?.data?.message || 'Erreur lors de la soumission.', type: 'err' })
      } finally { this.saving = false }
    },
  },
}
</script>