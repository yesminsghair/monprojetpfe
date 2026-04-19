<template>
  <div class="page-content">
    <div class="page-header-block">
      <div>
        <h2 class="page-title">Demandes d'encadrement</h2>
        <p class="page-sub">Gérez les demandes des étudiants — acceptez ou rejetez avec un motif</p>
      </div>
      <div class="filter-tabs">
        <button v-for="f in filtres" :key="f.val" :class="['tab-btn', { active: filtreActif === f.val }]" @click="filtreActif = f.val">
          {{ f.label }}<span class="tab-cnt" v-if="compterStatut(f.val) > 0">{{ compterStatut(f.val) }}</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>

    <div v-else-if="demandesFiltrees.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <p>Aucune demande {{ filtreActif !== 'toutes' ? `"${labelStatut(filtreActif)}"` : '' }}</p>
    </div>

    <div v-else class="table-card">
      <table class="table">
        <thead>
          <tr><th>Étudiant</th><th>N°</th><th>Sujet</th><th>Date</th><th>Statut</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <template v-for="d in demandesFiltrees" :key="d.id">
            <tr class="table-row" :class="'row-' + d.statut" @click="toggleDetail(d.id)">
              <td><div class="etud-nom">{{ d.etudiant }}</div><div class="etud-mat">{{ d.matricule }}</div></td>
              <td class="td-num">{{ d.numero }}</td>
              <td class="td-sujet">{{ d.sujet }}</td>
              <td class="td-date">{{ d.date_demande }}</td>
              <td><span :class="['badge-statut', d.statut]">{{ labelStatut(d.statut) }}</span></td>
              <td class="td-actions" @click.stop>
                <template v-if="d.statut === 'en_attente'">
                  <button class="btn-accepter" @click="accepter(d.id)" :disabled="saving">✓ Accepter</button>
                  <button class="btn-rejeter"  @click="ouvrirRejet(d.id)">✕ Rejeter</button>
                </template>
                <span v-else class="traite-txt">{{ d.traite_at }}</span>
              </td>
            </tr>
            <tr v-if="detailOuvert === d.id" class="detail-row">
              <td colspan="6">
                <div class="detail-bloc">
                  <div class="detail-field" v-if="d.description"><span class="detail-lbl">Description :</span><span class="detail-val">{{ d.description }}</span></div>
                  <div class="detail-field" v-if="d.doc_pdf">
                    <span class="detail-lbl">Document :</span>
                    <a class="doc-link" :href="'http://127.0.0.1:8000/storage/'+d.doc_pdf" target="_blank" rel="noopener">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Voir le document PDF
                    </a>
                  </div>
                  <div class="detail-field" v-if="d.motif_rejet"><span class="detail-lbl">Motif rejet :</span><span class="detail-val motif-txt">{{ d.motif_rejet }}</span></div>
                  <div class="motif-form" v-if="showMotifFor === d.id">
                    <label class="field-label">Motif du rejet <span class="req">*</span></label>
                    <textarea v-model="motifRejet" class="field-input field-textarea" rows="3" placeholder="Expliquez pourquoi vous ne pouvez pas encadrer cet étudiant..."/>
                    <p class="err-msg" v-if="motifError">{{ motifError }}</p>
                    <div class="motif-actions">
                      <button class="btn-outline-sm" @click="showMotifFor=null; motifRejet=''">Annuler</button>
                      <!-- FIX: was sending { motif: ... }, backend expects { motif_rejet: ... } -->
                      <button class="btn-danger-sm" @click="confirmerRejet(d.id)" :disabled="saving">{{ saving ? '...' : 'Confirmer le rejet' }}</button>
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
  data() {
    return {
      demandes: [], filtreActif: 'toutes',
      filtres: [{ val:'toutes', label:'Toutes' }, { val:'en_attente', label:'En attente' }, { val:'acceptee', label:'Acceptées' }, { val:'rejetee', label:'Rejetées' }],
      detailOuvert: null, showMotifFor: null, motifRejet: '', motifError: '', loading: false, saving: false,
    }
  },
  computed: {
    demandesFiltrees() { return this.filtreActif === 'toutes' ? this.demandes : this.demandes.filter(d => d.statut === this.filtreActif) },
  },
  async created() { await this.chargerDemandes() },
  methods: {
    async chargerDemandes() {
      this.loading = true
      try { const r = await api.get('/demandes-encadrement'); this.demandes = r.data || []; this.$emit('nb-en-attente', this.demandes.filter(d=>d.statut==='en_attente').length) }
      catch(e) { console.error(e) } finally { this.loading = false }
    },
    toggleDetail(id) { this.detailOuvert = this.detailOuvert === id ? null : id },
    ouvrirRejet(id) { this.showMotifFor = id; this.detailOuvert = id; this.motifRejet = ''; this.motifError = '' },
    async accepter(id) {
      this.saving = true
      try { await api.post(`/demandes-encadrement/${id}/accepter`); await this.chargerDemandes() }
      catch(e) { console.error(e.response?.data?.message) } finally { this.saving = false }
    },
    async confirmerRejet(id) {
      if (!this.motifRejet.trim() || this.motifRejet.length < 10) { this.motifError = 'Le motif doit contenir au moins 10 caractères.'; return }
      this.motifError = ''; this.saving = true
      try {
        // FIX: Backend DemandeEncadrementController@rejeter expects 'motif_rejet', not 'motif'
        await api.post(`/demandes-encadrement/${id}/rejeter`, { motif_rejet: this.motifRejet })
        this.showMotifFor = null; this.motifRejet = ''; this.detailOuvert = null; await this.chargerDemandes()
      }
      catch(e) { console.error(e.response?.data?.message) } finally { this.saving = false }
    },
    compterStatut(val) { return val === 'toutes' ? this.demandes.length : this.demandes.filter(d=>d.statut===val).length },
    labelStatut(s) { return { en_attente:'En attente', acceptee:'Acceptée', rejetee:'Rejetée' }[s] || s },
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600&family=Merriweather:wght@700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.page-content{padding:32px;font-family:'Source Sans 3',sans-serif}
.page-header-block{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:16px;flex-wrap:wrap}
.page-title{font-family:'Merriweather',serif;font-size:20px;color:#1e2a35;margin-bottom:4px}
.page-sub{font-size:13.5px;color:#8a9aaa}
.filter-tabs{display:flex;gap:6px;flex-wrap:wrap}
.tab-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:20px;font-size:13px;color:#4a5a6a;cursor:pointer;font-family:inherit;font-weight:600;transition:all 0.18s}
.tab-btn.active{background:#3d6080;border-color:#3d6080;color:#fff}
.tab-cnt{padding:1px 7px;border-radius:10px;font-size:11px}
.tab-btn.active .tab-cnt{background:rgba(255,255,255,0.25)}
.tab-btn:not(.active) .tab-cnt{background:rgba(61,96,128,0.15);color:#3d6080}
.loading-state{text-align:center;padding:60px;color:#8a9aaa}
.spinner{width:32px;height:32px;border:3px solid #c8c4bc;border-top-color:#3d6080;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-state{text-align:center;padding:60px;color:#8a9aaa}
.empty-icon{font-size:48px;margin-bottom:12px}
.table-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
.table{width:100%;border-collapse:collapse}
.table th{background:#c8c4bc;padding:11px 14px;font-size:11.5px;font-weight:700;color:#4a5a6a;text-transform:uppercase;letter-spacing:0.05em;text-align:left}
.table td{padding:13px 14px;border-top:1px solid #c8c4bc;font-size:13.5px;background:#e8e4dc}
.table-row{cursor:pointer}
.table-row:hover td{background:rgba(61,96,128,0.06)}
.row-en_attente td{border-left:3px solid #d98e1a}
.row-acceptee td{border-left:3px solid #27ae60}
.row-rejetee td{border-left:3px solid #c0392b}
.etud-nom{font-weight:600;color:#1e2a35}
.etud-mat{font-size:12px;color:#8a9aaa}
.td-num{font-size:12px;color:#8a9aaa;white-space:nowrap}
.td-sujet{font-weight:500;color:#1e2a35;max-width:220px}
.td-date{font-size:12.5px;color:#4a5a6a;white-space:nowrap}
.td-actions{display:flex;gap:8px;align-items:center}
.traite-txt{font-size:12px;color:#8a9aaa;font-style:italic}
.badge-statut{padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap}
.badge-statut.en_attente{background:#fef9e7;color:#d98e1a}
.badge-statut.acceptee{background:#d4edda;color:#1e7e34}
.badge-statut.rejetee{background:#fde8e8;color:#c0392b}
.btn-accepter{padding:6px 13px;background:rgba(39,174,96,0.12);color:#1a6b3a;border:1.5px solid rgba(39,174,96,0.3);border-radius:8px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.18s}
.btn-accepter:hover{background:#27ae60;color:#fff;border-color:#27ae60}
.btn-accepter:disabled{opacity:0.5;cursor:not-allowed}
.btn-rejeter{padding:6px 13px;background:rgba(192,57,43,0.08);color:#922b21;border:1.5px solid rgba(192,57,43,0.25);border-radius:8px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.18s}
.btn-rejeter:hover{background:#c0392b;color:#fff;border-color:#c0392b}
.detail-row td{background:#ddd9d1;padding:0;border-top:none;cursor:default}
.detail-bloc{padding:14px 18px;border-top:1.5px dashed #c8c4bc}
.detail-field{display:flex;gap:8px;margin-bottom:8px;font-size:13.5px;align-items:flex-start}
.detail-lbl{font-weight:600;color:#4a5a6a;white-space:nowrap;min-width:120px}
.detail-val{color:#1e2a35;line-height:1.5}
.motif-txt{color:#922b21}
.doc-link{display:inline-flex;align-items:center;gap:6px;color:#3d6080;font-weight:600;font-size:13.5px;text-decoration:none;padding:6px 14px;background:rgba(61,96,128,0.08);border-radius:8px;border:1px solid rgba(61,96,128,0.2);transition:all .18s}.doc-link:hover{background:#3d6080;color:#fff}
.motif-form{margin-top:12px;padding-top:12px;border-top:1.5px solid #c8c4bc}
.field-label{display:block;font-size:13px;font-weight:600;color:#1e2a35;margin-bottom:6px}
.req{color:#c0392b}
.field-input{width:100%;padding:9px 12px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:8px;font-size:13px;color:#1e2a35;font-family:inherit}
.field-textarea{resize:vertical;min-height:70px}
.err-msg{font-size:12px;color:#c0392b;margin-top:4px}
.motif-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}
.btn-outline-sm{padding:7px 14px;background:transparent;border:1.5px solid #c8c4bc;border-radius:8px;font-size:13px;color:#4a5a6a;cursor:pointer;font-family:inherit}
.btn-danger-sm{padding:7px 14px;background:#c0392b;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
.btn-danger-sm:disabled{opacity:0.5}
</style>