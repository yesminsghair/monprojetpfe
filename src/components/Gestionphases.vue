<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div class="d-flex align-items-center gap-3">
        <div class="vld-kpi__icon vld-kpi__icon--blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
        </div>
        <div>
          <h2 class="vld-page-title mb-0">Phases d'évaluation PFE</h2>
          <p class="vld-page-sub mb-0">Définir le calendrier commun à tous les projets</p>
        </div>
      </div>
      <div class="d-flex align-items-center gap-3">
        <div class="d-flex gap-2 flex-wrap">
          <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2">{{ phases.length + 1 }} phases</span>
          <span class="badge bg-success bg-opacity-10 text-success px-3 py-2">{{ phases.filter(p=>p.livrableObligatoire).length }} livrables requis</span>
          <span class="badge bg-warning bg-opacity-10 text-warning px-3 py-2">{{ phases.filter(p=>p.active).length + 1 }} active(s)</span>
        </div>
        <button class="btn btn-gold d-flex align-items-center gap-2" @click="openForm">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouvelle phase
        </button>
      </div>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="notif.show" class="vld-toast-wrap">
        <div class="alert d-flex align-items-center gap-2 shadow-sm py-3 px-4 mb-0" :class="notif.type==='ok' ? 'alert-success' : 'alert-danger'">
          {{ notif.msg }}
          <button class="btn-close ms-auto" @click="notif.show=false"></button>
        </div>
      </div>
    </Transition>

    <div class="vld-banner vld-banner--info mb-4">
      <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
      <div>La <strong>Phase 0 — Sujet PFE</strong> est automatique et toujours active. Les autres phases doivent être activées manuellement, dans l'ordre.</div>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Ordre</th><th>Nom</th><th>Description</th><th>Période</th>
              <th>Coef.</th><th class="text-center">Livrable</th><th class="text-center">Statut</th><th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- Phase 0 -->
            <tr style="background:rgba(61,96,128,.04);border-left:3px solid var(--vld-primary)">
              <td><div class="phase-num" style="background:rgba(61,96,128,.1);color:var(--vld-primary);border-color:rgba(61,96,128,.3)">0</div></td>
              <td>
                <div class="fw-bold" style="color:var(--vld-text-strong)">Définition du sujet PFE</div>
                <span class="badge bg-primary bg-opacity-10 text-primary" style="font-size:10px">Automatique</span>
              </td>
              <td style="font-size:12.5px;color:var(--vld-text-muted);max-width:200px">L'étudiant saisit le titre et la description de son projet PFE.</td>
              <td style="font-size:12.5px;color:var(--vld-text-muted);font-style:italic">Toute la durée</td>
              <td><span class="badge bg-secondary bg-opacity-10 text-secondary">—</span></td>
              <td class="text-center"><span class="badge bg-secondary bg-opacity-10 text-secondary">Formulaire</span></td>
              <td class="text-center"><span class="badge bg-primary">Toujours active</span></td>
              <td class="text-center"><span style="font-size:12px;color:var(--vld-text-muted)">🔒 Verrouillée</span></td>
            </tr>

            <!-- Regular phases -->
            <tr v-for="(p, i) in phases" :key="p.id"
              :style="p.terminee ? 'opacity:.85;background:rgba(39,174,96,.04)' : p.active ? 'background:rgba(245,166,35,.04);border-left:3px solid var(--vld-accent)' : ''">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="phase-num">{{ i+1 }}</div>
                  <div class="d-flex flex-column gap-1">
                    <button class="arr-btn" @click="monter(i)" :disabled="i===0">↑</button>
                    <button class="arr-btn" @click="descendre(i)" :disabled="i===phases.length-1">↓</button>
                  </div>
                </div>
              </td>
              <td><div class="fw-bold" style="color:var(--vld-text-strong)">{{ p.nom }}</div></td>
              <td style="font-size:12.5px;color:var(--vld-text-muted);max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ p.description||'—' }}</td>
              <td style="font-size:12.5px;white-space:nowrap;color:var(--vld-text)">
                {{ fmtDate(p.dateDebut) }} <span style="color:var(--vld-border);margin:0 4px">→</span> {{ fmtDate(p.dateFin) }}
              </td>
              <td><span class="badge bg-warning bg-opacity-10 text-warning border border-warning-subtle fw-bold">×{{ p.coefficient }}</span></td>
              <td class="text-center">
                <button class="badge border-0 px-3 py-2" style="cursor:pointer"
                  :class="p.livrableObligatoire ? 'bg-success text-white' : 'bg-secondary bg-opacity-10 text-secondary'"
                  @click="toggleLivrable(p)">
                  {{ p.livrableObligatoire ? '● Oui' : '⊘ Non' }}
                </button>
              </td>
              <td class="text-center">
                <span v-if="p.terminee"  class="badge bg-success">✓ Terminée</span>
                <span v-else-if="p.active" class="badge bg-warning text-dark">● Active</span>
                <span v-else class="badge bg-secondary">⊘ Inactive</span>
              </td>
              <td class="text-center">
                <div class="d-flex gap-2 justify-content-center align-items-center flex-wrap">
                  <button v-if="!p.active && !p.terminee" class="btn btn-gold btn-sm" :disabled="!peutActiver(i)" @click="activerPhase(p,i)">▶ Activer</button>
                  <button v-if="p.active && !p.terminee" class="btn btn-success btn-sm" @click="terminerPhase(p)">■ Terminer</button>
                  <button class="vld-icon-btn vld-icon-btn--edit" :disabled="p.active||p.terminee" @click="editPhase(p)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="vld-icon-btn vld-icon-btn--del" :disabled="p.active||p.terminee" @click="supprimer(p.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!phases.length" class="p-4 text-center" style="color:var(--vld-text-muted);font-size:13.5px">
        Aucune autre phase définie — ajoutez les phases du calendrier PFE avec le bouton ci-dessus.
      </div>
    </div>

    <!-- MODAL -->
    <Transition name="modal-fade">
      <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
        <div class="card p-0" style="width:100%;max-width:500px;max-height:90vh;overflow-y:auto">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span class="fw-bold">{{ editMode ? 'Modifier la phase' : 'Créer une phase' }}</span>
            <button class="btn-close" @click="closeForm"></button>
          </div>
          <div class="card-body d-flex flex-column gap-3">
            <div>
              <label class="form-label">Nom de la phase <span class="text-danger">*</span></label>
              <input v-model="form.nom" class="form-control" :class="{'is-invalid':errors.nom}" placeholder="Ex: Spécification et recueil des exigences" />
              <div class="invalid-feedback">{{ errors.nom }}</div>
            </div>
            <div>
              <label class="form-label">Description</label>
              <textarea v-model="form.description" class="form-control" rows="3" placeholder="Décrivez les objectifs..."></textarea>
            </div>
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label">Date de début <span class="text-danger">*</span></label>
                <input type="date" v-model="form.dateDebut" class="form-control" :class="{'is-invalid':errors.dateDebut}" />
                <div class="invalid-feedback">{{ errors.dateDebut }}</div>
              </div>
              <div class="col-6">
                <label class="form-label">Date de fin <span class="text-danger">*</span></label>
                <input type="date" v-model="form.dateFin" class="form-control" :class="{'is-invalid':errors.dateFin}" />
                <div class="invalid-feedback">{{ errors.dateFin }}</div>
              </div>
            </div>
            <div>
              <label class="form-label">Coefficient <span class="text-muted" style="font-size:12px">(0–10)</span> <span class="text-danger">*</span></label>
              <input type="number" v-model.number="form.coefficient" min="0" max="10" step="0.5" class="form-control" :class="{'is-invalid':errors.coefficient}" />
              <div class="invalid-feedback">{{ errors.coefficient }}</div>
            </div>
            <div>
              <label class="form-label">Livrable obligatoire ?</label>
              <div class="d-flex flex-column gap-2">
                <label class="livrable-opt" :class="{selected:form.livrableObligatoire===true}" @click="form.livrableObligatoire=true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <div><div class="fw-semibold" style="font-size:13.5px">Oui — livrable requis</div><div style="font-size:12px;color:var(--vld-text-muted)">L'étudiant doit déposer un document</div></div>
                </label>
                <label class="livrable-opt" :class="{selected:form.livrableObligatoire===false}" @click="form.livrableObligatoire=false">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                  <div><div class="fw-semibold" style="font-size:13.5px">Non — pas de livrable</div><div style="font-size:12px;color:var(--vld-text-muted)">Phase sans dépôt de document</div></div>
                </label>
              </div>
            </div>
          </div>
          <div class="card-footer d-flex justify-content-end gap-2">
            <button class="btn btn-outline-secondary" @click="closeForm">Annuler</button>
            <button class="btn btn-gold" @click="save">{{ editMode ? 'Enregistrer' : 'Créer' }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import api from '@/services/api.js'
export default {
  name: 'GestionPhases',
  data () {
    return {
      showForm: false, editMode: false,
      notif: { show: false, msg: '', type: 'ok' },
      phases: [],
      form: { id: null, nom: '', description: '', dateDebut: '', dateFin: '', coefficient: 1, livrableObligatoire: true },
      errors: {}, loading: false,
    }
  },
  mounted () { this.chargerPhases() },
  methods: {
    async chargerPhases () {
      this.loading = true
      try {
        const res = await api.get('/phases')
        this.phases = res.data.filter(p => p.type !== 'sujet').map(p => ({
          id: p.id, nom: p.nom, description: p.description || '', ordre: p.ordre,
          dateDebut: p.date_debut, dateFin: p.date_fin, coefficient: p.coefficient,
          livrableObligatoire: p.livrable_obligatoire, active: p.active ?? false, terminee: p.terminee ?? false,
        }))
      } catch { this.showNotif('Erreur de chargement', 'err') }
      finally { this.loading = false }
    },
    peutActiver (i) { return i === 0 || this.phases[i-1]?.terminee === true },
    async activerPhase (p, i) {
      if (!this.peutActiver(i)) { this.showNotif("La phase précédente doit être terminée d'abord.", 'err'); return }
      try { await api.put(`/phases/${p.id}`, { active: true }); await this.chargerPhases(); this.showNotif(`Phase "${p.nom}" activée ✓`) }
      catch (e) { this.showNotif(e.response?.data?.message || "Erreur lors de l'activation", 'err') }
    },
    async terminerPhase (p) {
      if (!confirm(`Marquer "${p.nom}" comme terminée ?`)) return
      try { await api.put(`/phases/${p.id}`, { terminee: true }); await this.chargerPhases(); this.showNotif(`Phase "${p.nom}" terminée ✓`) }
      catch (e) { this.showNotif(e.response?.data?.message || 'Erreur', 'err') }
    },
    fmtDate (d) { if (!d) return '—'; const p = String(d).split('T')[0].split('-'); if (p.length!==3) return d; return `${p[2]}/${p[1]}/${p[0]}` },
    toggleLivrable (p) { p.livrableObligatoire = !p.livrableObligatoire; this.updatePhase(p) },
    async updatePhase (p) {
      try { await api.put(`/phases/${p.id}`, { livrable_obligatoire: p.livrableObligatoire }); this.showNotif('Modifié ✓') }
      catch { p.livrableObligatoire = !p.livrableObligatoire; this.showNotif('Erreur', 'err') }
    },
    openForm ()  { this.resetForm(); this.showForm = true },
    closeForm () { this.showForm = false },
    resetForm () { this.form = { id:null, nom:'', description:'', dateDebut:'', dateFin:'', coefficient:1, livrableObligatoire:true }; this.errors={}; this.editMode=false },
    validate () {
      this.errors = {}
      if (!this.form.nom) this.errors.nom = 'Champ obligatoire'
      if (!this.form.dateDebut) this.errors.dateDebut = 'Champ obligatoire'
      if (!this.form.dateFin) this.errors.dateFin = 'Champ obligatoire'
      if (this.form.dateDebut && this.form.dateFin && this.form.dateFin < this.form.dateDebut) this.errors.dateFin = 'Date de fin antérieure à la date de début'
      if (this.form.coefficient==='' || this.form.coefficient<0 || this.form.coefficient>10) this.errors.coefficient = 'Entre 0 et 10'
      return !Object.keys(this.errors).length
    },
    async save () {
      if (!this.validate()) return
      try {
        const pl = { nom:this.form.nom, description:this.form.description||null, date_debut:this.form.dateDebut, date_fin:this.form.dateFin, coefficient:this.form.coefficient, livrable_obligatoire:this.form.livrableObligatoire, type:'standard' }
        if (this.editMode) { await api.put(`/phases/${this.form.id}`, pl); this.showNotif('Phase modifiée ✓') }
        else                { await api.post('/phases', pl); this.showNotif('Phase créée ✓') }
        await this.chargerPhases(); this.closeForm()
      } catch (e) { this.showNotif(e.response?.data?.message || 'Erreur', 'err') }
    },
    editPhase (p) { this.form = { id:p.id, nom:p.nom, description:p.description||'', dateDebut:p.dateDebut, dateFin:p.dateFin, coefficient:p.coefficient, livrableObligatoire:p.livrableObligatoire }; this.editMode=true; this.showForm=true; this.errors={} },
    async supprimer (id) {
      if (!confirm('Supprimer cette phase ?')) return
      try { await api.delete(`/phases/${id}`); await this.chargerPhases(); this.showNotif('Phase supprimée') }
      catch { this.showNotif('Erreur lors de la suppression', 'err') }
    },
    async monter (i) {
      if (i===0) return
      const o=[...this.phases];[o[i],o[i-1]]=[o[i-1],o[i]]
      try { await api.put('/phases/reorder',{phases:o.map((p,idx)=>({id:p.id,ordre:idx+1}))}); await this.chargerPhases() } catch { this.showNotif('Erreur','err') }
    },
    async descendre (i) {
      if (i===this.phases.length-1) return
      const o=[...this.phases];[o[i],o[i+1]]=[o[i+1],o[i]]
      try { await api.put('/phases/reorder',{phases:o.map((p,idx)=>({id:p.id,ordre:idx+1}))}); await this.chargerPhases() } catch { this.showNotif('Erreur','err') }
    },
    showNotif (msg, type='ok') { this.notif={show:true,msg,type}; setTimeout(()=>this.notif.show=false,3500) },
  },
}
</script>

<style scoped>
.btn-gold { background:linear-gradient(135deg,#f5a623,#d98e1a);color:#fff;border:none;font-weight:600;font-family:var(--vld-font-body); }
.btn-gold:hover { transform:translateY(-1px);box-shadow:0 4px 14px rgba(245,166,35,.3);color:#fff; }
.btn-gold:disabled { opacity:.4;transform:none;cursor:not-allowed; }
.phase-num { width:28px;height:28px;border-radius:7px;background:rgba(245,197,24,.12);border:1.5px solid rgba(245,197,24,.4);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:var(--vld-accent);flex-shrink:0; }
.arr-btn { width:18px;height:18px;border:1px solid var(--vld-border);background:var(--vld-surface-alt);border-radius:4px;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;color:var(--vld-text);transition:.15s;padding:0; }
.arr-btn:hover:not(:disabled) { background:var(--vld-primary);color:#fff;border-color:var(--vld-primary); }
.arr-btn:disabled { opacity:.3;cursor:not-allowed; }
.modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px; }
.livrable-opt { display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--vld-surface-alt);border:1.5px solid var(--vld-border);border-radius:var(--vld-r-lg);cursor:pointer;transition:border-color var(--vld-t-base); }
.livrable-opt:hover,.livrable-opt.selected { border-color:var(--vld-accent);background:rgba(245,166,35,.06); }
</style>