<template>
  <div>
    <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
      <div>
        <h2 class="vld-page-title">Demandes d'encadrement</h2>
        <p class="vld-page-sub">Gérez les demandes des étudiants — acceptez ou rejetez avec un motif</p>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <button v-for="f in filtres" :key="f.val"
          class="btn btn-sm d-flex align-items-center gap-2"
          :class="filtreActif === f.val ? 'btn-primary' : 'btn-outline-secondary'"
          @click="filtreActif = f.val">
          {{ f.label }}
          <span v-if="compterStatut(f.val) > 0" class="badge" :class="filtreActif===f.val ? 'bg-light text-primary' : 'bg-primary'">{{ compterStatut(f.val) }}</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="vld-state"><div class="vld-spinner mx-auto mb-3"></div><p>Chargement...</p></div>

    <div v-else-if="!demandesFiltrees.length" class="vld-state">
      <div class="vld-state__icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
      <p class="vld-state__title">Aucune demande {{ filtreActif !== 'toutes' ? `"${labelStatut(filtreActif)}"` : '' }}</p>
    </div>

    <div v-else class="table-responsive card">
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th>Étudiant</th><th>Sujet</th><th>Date</th><th>Statut</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="d in demandesFiltrees" :key="d.id">
            <tr style="cursor:pointer" :style="borderStyle(d.statut)" @click="toggleDetail(d.id)">
              <td>
                <div class="fw-semibold" style="color:var(--vld-text-strong)">{{ d.etudiant }}</div>
                <div style="font-size:12px;color:var(--vld-text-muted)">{{ d.matricule }}</div>
              </td>
              <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ d.sujet }}</td>
              <td style="font-size:12.5px;white-space:nowrap">{{ d.date_demande }}</td>
              <td>
                <span class="badge" :class="d.statut==='acceptee' ? 'bg-success' : d.statut==='rejetee' ? 'bg-danger' : 'bg-warning text-dark'">
                  {{ labelStatut(d.statut) }}
                </span>
              </td>
              <td @click.stop>
                <template v-if="d.statut === 'en_attente'">
                  <button class="btn btn-success btn-sm me-2" @click="accepter(d.id)" :disabled="saving">✓ Accepter</button>
                  <button class="btn btn-danger btn-sm"  @click="ouvrirRejet(d.id)">✕ Rejeter</button>
                </template>
                <span v-else style="font-size:12px;color:var(--vld-text-muted);font-style:italic">{{ d.traite_at }}</span>
              </td>
            </tr>

            <!-- Detail row -->
            <tr v-if="detailOuvert === d.id">
              <td colspan="5" style="background:var(--vld-surface);padding:0">
                <div class="p-3 border-top" style="border-color:var(--vld-border)!important">
                  <div v-if="d.description" class="d-flex gap-2 mb-2" style="font-size:13.5px">
                    <span class="fw-semibold" style="min-width:110px;color:var(--vld-text-muted)">Description :</span>
                    <span style="color:var(--vld-text-strong)">{{ d.description }}</span>
                  </div>
                  <div v-if="d.doc_pdf" class="d-flex gap-2 mb-2">
                    <span class="fw-semibold" style="min-width:110px;color:var(--vld-text-muted);font-size:13.5px">Document :</span>
                    <a :href="'http://127.0.0.1:8000/storage/'+d.doc_pdf" target="_blank" class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Voir PDF
                    </a>
                  </div>
                  <div v-if="d.motif_rejet" class="d-flex gap-2 mb-2" style="font-size:13.5px">
                    <span class="fw-semibold" style="min-width:110px;color:var(--vld-text-muted)">Motif rejet :</span>
                    <span style="color:#c0392b">{{ d.motif_rejet }}</span>
                  </div>

                  <!-- Reject form -->
                  <div v-if="showMotifFor === d.id" class="mt-3 pt-3 border-top" style="border-color:var(--vld-border)!important">
                    <label class="form-label">Motif du rejet <span class="text-danger">*</span></label>
                    <textarea v-model="motifRejet" class="form-control mb-2" rows="3" placeholder="Expliquez pourquoi vous ne pouvez pas encadrer cet étudiant..."></textarea>
                    <div v-if="motifError" class="text-danger mb-2" style="font-size:12.5px">{{ motifError }}</div>
                    <div class="d-flex gap-2 justify-content-end">
                      <button class="btn btn-outline-secondary btn-sm" @click="showMotifFor=null;motifRejet=''">Annuler</button>
                      <button class="btn btn-danger btn-sm d-flex align-items-center gap-2" @click="confirmerRejet(d.id)" :disabled="saving">
                        <span v-if="saving" class="vld-spinner-sm"></span>
                        Confirmer le rejet
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'
export default {
  name: 'DemandesEncadrement',
  emits: ['nb-en-attente'],
  data () {
    return {
      demandes: [], filtreActif: 'toutes',
      filtres: [{ val:'toutes', label:'Toutes' },{ val:'en_attente', label:'En attente' },{ val:'acceptee', label:'Acceptées' },{ val:'rejetee', label:'Rejetées' }],
      detailOuvert: null, showMotifFor: null, motifRejet: '', motifError: '', loading: false, saving: false,
    }
  },
  computed: {
    demandesFiltrees () { return this.filtreActif === 'toutes' ? this.demandes : this.demandes.filter(d => d.statut === this.filtreActif) },
  },
  async created () { await this.chargerDemandes() },
  methods: {
    async chargerDemandes () {
      this.loading = true
      try { const r = await api.get('/demandes-encadrement'); this.demandes = r.data || []; this.$emit('nb-en-attente', this.demandes.filter(d=>d.statut==='en_attente').length) }
      catch (e) { console.error(e) } finally { this.loading = false }
    },
    toggleDetail (id) { this.detailOuvert = this.detailOuvert === id ? null : id },
    ouvrirRejet (id)  { this.showMotifFor = id; this.detailOuvert = id; this.motifRejet = ''; this.motifError = '' },
    async accepter (id) {
      this.saving = true
      try { await api.post(`/demandes-encadrement/${id}/accepter`); await this.chargerDemandes() }
      catch (e) { console.error(e) } finally { this.saving = false }
    },
    async confirmerRejet (id) {
      if (!this.motifRejet.trim() || this.motifRejet.length < 10) { this.motifError = 'Le motif doit contenir au moins 10 caractères.'; return }
      this.motifError = ''; this.saving = true
      try { await api.post(`/demandes-encadrement/${id}/rejeter`, { motif_rejet: this.motifRejet }); this.showMotifFor = null; this.motifRejet = ''; this.detailOuvert = null; await this.chargerDemandes() }
      catch (e) { console.error(e) } finally { this.saving = false }
    },
    compterStatut (val) { return val === 'toutes' ? this.demandes.length : this.demandes.filter(d=>d.statut===val).length },
    labelStatut (s)     { return { en_attente:'En attente', acceptee:'Acceptée', rejetee:'Rejetée' }[s] || s },
    borderStyle (s)     { return { borderLeft: `3px solid ${s==='acceptee'?'#27ae60':s==='rejetee'?'#c0392b':'#d98e1a'}` } },
  },
}
</script>