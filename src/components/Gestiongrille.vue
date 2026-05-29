<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div>
        <h2 class="vld-page-title">Grille d'évaluation PFE</h2>
        <p class="vld-page-sub">Définissez les catégories et critères — le total doit faire exactement 20 pts</p>
      </div>
      <div class="d-flex align-items-center gap-3 flex-wrap">
        <span class="badge px-3 py-2 fs-6" :class="totalOk ? 'bg-success' : 'bg-warning text-dark'">
          {{ totalNotes }} / 20 pts {{ totalOk ? '✓' : '⚠' }}
        </span>
        <button v-if="!verrouille && !publie" class="btn btn-outline-primary d-flex align-items-center gap-2" @click="openCat">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Catégorie
        </button>
        <template v-if="!verrouille && !publie && categories.length">
          <div class="d-flex align-items-center gap-2">
            <label class="form-label mb-0" style="font-size:13px;white-space:nowrap;color:var(--vld-text-muted)">Visible par :</label>
            <select v-model="visibilite" class="form-select form-select-sm" style="width:auto;min-width:180px">
              <option value="encadrant_jury">Encadrants + Jurys</option>
              <option value="jury_only">Jurys uniquement</option>
            </select>
          </div>
          <button class="btn btn-gold d-flex align-items-center gap-2" @click="publier" :disabled="!totalOk">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Soumettre au directeur
          </button>
        </template>
      </div>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="vld-toast-wrap">
        <div class="alert d-flex align-items-center gap-2 shadow-sm py-3 px-4 mb-0" :class="toast.type==='ok' ? 'alert-success' : 'alert-danger'">
          {{ toast.msg }}
          <button class="btn-close ms-auto" @click="toast.show=false"></button>
        </div>
      </div>
    </Transition>

    <!-- Status banners -->
    <div v-if="verrouille" class="vld-banner vld-banner--success mb-4">
      <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
      <div class="vld-banner__body">
        <div class="vld-banner__title">Grille validée par le directeur — accessible aux {{ visibilite === 'jury_only' ? 'jurys uniquement' : 'encadrants et jurys' }}</div>
        <div class="vld-banner__sub">Cette grille est officielle et ne peut plus être modifiée.</div>
      </div>
      <span class="badge bg-success">✓ Officielle</span>
    </div>
    <div v-else-if="publie" class="vld-banner vld-banner--warning mb-4">
      <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
      <div class="vld-banner__body">
        <div class="vld-banner__title">Grille en attente de validation du directeur</div>
        <div class="vld-banner__sub">Vous ne pouvez plus modifier les catégories ni les critères.</div>
      </div>
      <span class="badge bg-warning text-dark">En attente</span>
    </div>
    <div v-else class="vld-banner vld-banner--info mb-4">
      <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
      <div>Grille en cours de rédaction. Total actuel : <strong>{{ totalNotes }}/20 pts</strong>. Toutes les catégories doivent totaliser exactement 20 pts avant soumission.</div>
    </div>

    <!-- Empty state -->
    <div v-if="!categories.length" class="vld-state">
      <div class="vld-state__icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
      <p class="vld-state__title">Aucune catégorie définie</p>
      <p class="vld-state__sub">Commencez par ajouter des catégories (ex: Rapport, Soutenance, Travail technique)</p>
      <button class="btn btn-primary mt-3" @click="openCat" v-if="!verrouille && !publie">Ajouter une catégorie</button>
    </div>

    <!-- Categories -->
    <div v-else class="d-flex flex-column gap-3 mb-4">
      <div v-for="cat in categories" :key="cat.id" class="card">
        <div class="card-header d-flex align-items-center gap-3">
          <div class="cat-accent-bar" :style="{ background: cat.color }"></div>
          <div class="flex-grow-1">
            <div class="fw-bold" style="font-size:15px">{{ cat.nom }}</div>
            <div style="font-size:12.5px;color:var(--vld-text-muted)">{{ cat.criteres.length }} critère(s) · {{ catSum(cat) }} / {{ cat.max }} pts</div>
          </div>
          <span class="badge px-3 py-2" :style="{ background: cat.color + '22', color: cat.color, border: '1.5px solid ' + cat.color + '55' }">
            {{ cat.max }} pts max
          </span>
          <div class="d-flex gap-2" v-if="!verrouille && !publie">
            <button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" @click="openCr(cat)">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Critère
            </button>
            <button class="vld-icon-btn vld-icon-btn--edit" @click="editCat(cat)">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="vld-icon-btn vld-icon-btn--del" @click="delCat(cat.id)">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          <div v-if="!cat.criteres.length" class="p-3 text-center" style="font-size:13px;color:var(--vld-text-muted);font-style:italic">
            Aucun critère — cliquez sur Critère pour en ajouter
          </div>
          <div v-else>
            <div v-for="(cr, i) in cat.criteres" :key="cr.id"
              class="d-flex align-items-center gap-3 px-4 py-3"
              :style="{ borderBottom: i < cat.criteres.length-1 ? '1px solid var(--vld-border)' : 'none' }">
              <div class="flex-grow-1">
                <div style="font-size:13.5px;font-weight:600;color:var(--vld-text-strong)">{{ cr.nom }}</div>
                <div class="progress mt-1" style="height:4px;max-width:180px">
                  <div class="progress-bar" :style="{ width: (cat.max ? cr.note/cat.max*100 : 0)+'%', background: cat.color }"></div>
                </div>
              </div>
              <span class="fw-bold" :style="{ color: cat.color }">{{ cr.note }} pt</span>
              <div class="d-flex gap-1" v-if="!verrouille && !publie">
                <button class="vld-icon-btn vld-icon-btn--edit" @click="editCr(cat, cr)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="vld-icon-btn vld-icon-btn--del" @click="delCr(cat, cr.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recap table -->
    <div v-if="categories.length" class="card">
      <div class="card-header fw-bold">Récapitulatif</div>
      <div class="table-responsive">
        <table class="table mb-0">
          <thead><tr><th>Catégorie</th><th>Critères</th><th>Max</th></tr></thead>
          <tbody>
            <tr v-for="c in categories" :key="c.id">
              <td><span class="fw-semibold" :style="{ color: c.color }">{{ c.nom }}</span></td>
              <td style="font-size:13px;color:var(--vld-text-muted)">{{ c.criteres.map(cr=>cr.nom).join(', ') || '—' }}</td>
              <td><span class="fw-bold" :style="{ color: c.color }">{{ c.max }} pts</span></td>
            </tr>
            <tr style="background:var(--vld-surface-alt)">
              <td colspan="2" class="fw-bold text-end">TOTAL</td>
              <td><span class="fw-bold fs-5" :class="totalOk ? 'text-success' : 'text-danger'">{{ totalNotes }}/20</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Category Modal -->
    <Transition name="modal-fade">
      <div v-if="showCatM" class="modal-overlay" @click.self="showCatM=false">
        <div class="card p-0" style="width:100%;max-width:460px">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span class="fw-bold">{{ editingCat ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}</span>
            <button class="btn-close" @click="showCatM=false"></button>
          </div>
          <div class="card-body d-flex flex-column gap-3">
            <div>
              <label class="form-label">Nom <span class="text-danger">*</span></label>
              <input v-model="catF.nom" class="form-control" placeholder="Ex: Rapport technique, Soutenance..." />
            </div>
            <div>
              <label class="form-label">Barème max <span class="text-muted">(pts)</span></label>
              <input type="number" v-model.number="catF.max" min="0.5" max="20" step="0.5" class="form-control" />
              <div style="font-size:12px;color:var(--vld-text-muted);margin-top:4px">
                Disponible : {{ (20 - totalSansCat).toFixed(1) }} pts restants
              </div>
            </div>
            <div>
              <label class="form-label">Couleur</label>
              <div class="d-flex flex-wrap gap-2">
                <button v-for="c in colors" :key="c.value"
                  class="color-swatch"
                  :style="{ background: c.value, outline: catF.color===c.value ? '3px solid ' + c.value : 'none', outlineOffset: '2px' }"
                  :title="c.label"
                  @click="catF.color=c.value">
                  <svg v-if="catF.color===c.value" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div class="card-footer d-flex justify-content-end gap-2">
            <button class="btn btn-outline-secondary" @click="showCatM=false">Annuler</button>
            <button class="btn btn-primary d-flex align-items-center gap-2" @click="saveCat" :disabled="savingCat">
              <span v-if="savingCat" class="vld-spinner-sm"></span>
              {{ editingCat ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Criterion Modal -->
    <Transition name="modal-fade">
      <div v-if="showCrM" class="modal-overlay" @click.self="showCrM=false">
        <div class="card p-0" style="width:100%;max-width:420px">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span class="fw-bold">{{ editingCr ? 'Modifier le critère' : 'Nouveau critère' }}</span>
            <button class="btn-close" @click="showCrM=false"></button>
          </div>
          <div class="card-body d-flex flex-column gap-3">
            <div style="font-size:13px;color:var(--vld-text-muted)">Catégorie : <strong :style="{color:currentCat?.color}">{{ currentCat?.nom }}</strong></div>
            <div>
              <label class="form-label">Nom du critère <span class="text-danger">*</span></label>
              <input v-model="crF.nom" class="form-control" placeholder="Ex: Qualité de la rédaction..." />
            </div>
            <div>
              <label class="form-label">Barème (pts)</label>
              <input type="number" v-model.number="crF.note" min="0.25" :max="crMaxRestant" step="0.25" class="form-control" />
              <div style="font-size:12px;color:var(--vld-text-muted);margin-top:4px">
                Disponible dans cette catégorie : <strong>{{ crMaxRestant.toFixed(2) }} pts</strong>
              </div>
            </div>
          </div>
          <div class="card-footer d-flex justify-content-end gap-2">
            <button class="btn btn-outline-secondary" @click="showCrM=false">Annuler</button>
            <button class="btn btn-primary" @click="saveCr">{{ editingCr ? 'Enregistrer' : 'Ajouter' }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import api from '@/services/api.js'
const COLORS = [
  { value:'#3d6080',label:'Bleu acier' },{ value:'#27ae60',label:'Vert' },
  { value:'#e74c3c',label:'Rouge' },     { value:'#f5a623',label:'Orange' },
  { value:'#8e44ad',label:'Violet' },    { value:'#2980b9',label:'Bleu vif' },
  { value:'#d35400',label:'Brun orangé' },{ value:'#16a085',label:'Teal' },
  { value:'#c0392b',label:'Cramoisi' },  { value:'#2c3e50',label:'Ardoise' },
]
export default {
  name: 'GestionGrille',
  data () {
    return {
      publie:false, verrouille:false, showCatM:false, showCrM:false,
      editingCat:null, editingCr:null, currentCat:null, savingCat:false,
      toast:{ show:false, msg:'', type:'ok' },
      colors:COLORS, catF:{ nom:'', color:COLORS[0].value, max:2 }, crF:{ nom:'', note:1 },
      categories:[], loading:false, grilleId:null, catColorMap:{},
      visibilite: 'encadrant_jury',
    }
  },
  computed: {
    totalNotes ()   { return this.categories.reduce((s,c)=>s+c.max,0) },
    totalOk ()      { return this.totalNotes === 20 },
    totalSansCat () { if (!this.editingCat) return this.totalNotes; return this.categories.filter(c=>c.id!==this.editingCat.id).reduce((s,c)=>s+c.max,0) },
    crMaxRestant () {
      if (!this.currentCat) return 0
      const otherSum = this.currentCat.criteres
        .filter(cr => !this.editingCr || cr.id !== this.editingCr.id)
        .reduce((s, cr) => s + cr.note, 0)
      return Math.max(0, this.currentCat.max - otherSum)
    },
  },
  mounted () { this.chargerGrille() },
  methods: {
    async chargerGrille () {
      this.loading=true
      try {
        const res = await api.get('/grilles')
        if (res.data.length>0) {
          const g = res.data[0]; this.grilleId=g.id; this.publie=g.statut==='publie'; this.verrouille=g.statut==='verrouille'
          this.visibilite = g.visibilite || 'encadrant_jury'
          this.categories = g.categories.map(cat => {
            if (!this.catColorMap[cat.id]) { const n=Object.keys(this.catColorMap).length; this.catColorMap[cat.id]=COLORS[n%COLORS.length].value }
            return { id:cat.id, nom:cat.nom, color:cat.color||this.catColorMap[cat.id], max:parseFloat(cat.bareme_max), criteres:cat.criteres.map(cr=>({ id:cr.id, nom:cr.nom, note:parseFloat(cr.bareme_max) })) }
          })
        } else { const c=await api.post('/grilles',{nom:'Grille PFE'}); this.grilleId=c.data.id; this.publie=false; this.verrouille=false; this.categories=[] }
      } catch { this.showToast('Erreur de chargement','err') } finally { this.loading=false }
    },
    catSum (c) { return c.criteres.reduce((s,x)=>s+x.note,0) },
    showToast (msg,type='ok') { this.toast={show:true,msg,type}; setTimeout(()=>this.toast.show=false,3000) },
    openCat () {
      if (this.verrouille||this.publie) { this.showToast('Grille non modifiable','err'); return }
      this.editingCat=null
      const used=this.categories.map(c=>c.color)
      this.catF={ nom:'', color:COLORS.find(c=>!used.includes(c.value))?.value||COLORS[0].value, max:2 }
      this.showCatM=true
    },
    editCat (c) {
      if (this.verrouille||this.publie) { this.showToast('Grille non modifiable','err'); return }
      this.editingCat=c; this.catF={nom:c.nom,color:c.color,max:c.max}; this.showCatM=true
    },
    async saveCat () {
      if (!this.catF.nom.trim()) { this.showToast('Nom requis','err'); return }
      this.savingCat=true
      try {
        if (this.editingCat) {
          await api.put(`/grilles/${this.grilleId}/categories/${this.editingCat.id}`,{nom:this.catF.nom,bareme_max:this.catF.max,color:this.catF.color})
          const idx=this.categories.findIndex(c=>c.id===this.editingCat.id)
          if (idx!==-1) { this.categories[idx].nom=this.catF.nom; this.categories[idx].max=this.catF.max; this.categories[idx].color=this.catF.color }
          this.showToast('Catégorie modifiée ✓'); this.showCatM=false
        } else {
          const res=await api.post(`/grilles/${this.grilleId}/categories`,{nom:this.catF.nom,bareme_max:this.catF.max,color:this.catF.color})
          this.catColorMap[res.data.id]=this.catF.color
          this.categories.push({
            id:       res.data.id,
            nom:      res.data.nom,
            color:    res.data.color||this.catF.color,
            max:      parseFloat(res.data.bareme_max),
            criteres: [],
          })
          this.showToast('Catégorie créée ✓')
          this.showCatM=false
        }
      } catch { this.showToast('Erreur','err') } finally { this.savingCat=false }
    },
    async delCat (id) {
      if (this.verrouille||this.publie) { this.showToast('Grille non modifiable','err'); return }
      if (!confirm('Supprimer cette catégorie et tous ses critères ?')) return
      try { await api.delete(`/grilles/${this.grilleId}/categories/${id}`); this.categories=this.categories.filter(c=>c.id!==id); this.showToast('Supprimée') }
      catch { this.showToast('Erreur','err') }
    },
    openCr (cat) {
      if (this.verrouille||this.publie) { this.showToast('Grille non modifiable','err'); return }
      this.currentCat=cat; this.editingCr=null; this.crF={nom:'',note:0.5}; this.showCrM=true
    },
    editCr (cat,cr) {
      if (this.verrouille||this.publie) { this.showToast('Grille non modifiable','err'); return }
      this.currentCat=cat; this.editingCr=cr; this.crF={nom:cr.nom,note:cr.note}; this.showCrM=true
    },
    async delCr (cat,crId) {
      if (!confirm('Supprimer ce critère ?')) return
      try { await api.delete(`/criteres/${crId}`); cat.criteres=cat.criteres.filter(c=>c.id!==crId); this.showToast('Critère supprimé') }
      catch { this.showToast('Erreur','err') }
    },
    async saveCr () {
      if (!this.crF.nom.trim()) { this.showToast('Nom requis','err'); return }
      if (!this.crF.note || this.crF.note <= 0) { this.showToast('Le barème doit être supérieur à 0','err'); return }
      const otherSum = this.currentCat.criteres
        .filter(cr => !this.editingCr || cr.id !== this.editingCr.id)
        .reduce((s, cr) => s + cr.note, 0)
      if (otherSum + parseFloat(this.crF.note) > this.currentCat.max) {
        this.showToast(
          `Total (${(otherSum + parseFloat(this.crF.note)).toFixed(2)} pts) dépasserait le max de la catégorie (${this.currentCat.max} pts)`,
          'err'
        )
        return
      }
      try {
        if (this.editingCr) { await api.put(`/criteres/${this.editingCr.id}`,{nom:this.crF.nom,bareme_max:this.crF.note}); this.editingCr.nom=this.crF.nom; this.editingCr.note=this.crF.note; this.showToast('Critère modifié ✓') }
        else { await api.post(`/grilles/${this.grilleId}/categories/${this.currentCat.id}/criteres`,{nom:this.crF.nom,bareme_max:this.crF.note}); await this.chargerGrille(); this.showToast('Critère ajouté ✓') }
        this.showCrM=false
      } catch { this.showToast('Erreur','err') }
    },
    async publier () {
      if (!this.totalOk) { this.showToast('Le total doit être exactement 20 pts','err'); return }
      if (!confirm('Soumettre la grille au directeur ? Vous ne pourrez plus la modifier.')) return
      try {
        await api.put(`/grilles/${this.grilleId}`, { visibilite: this.visibilite })
        await api.post(`/grilles/${this.grilleId}/publier`)
        this.publie=true; this.showToast('Grille soumise — en attente de validation ✓')
      }
      catch { this.showToast('Erreur','err') }
    },
  },
}
</script>

<style scoped>
.btn-gold { background:linear-gradient(135deg,#f5a623,#d98e1a);color:#fff;border:none;font-weight:600;font-family:var(--vld-font-body); }
.btn-gold:hover:not(:disabled) { transform:translateY(-1px);box-shadow:0 4px 14px rgba(245,166,35,.3);color:#fff; }
.btn-gold:disabled { opacity:.4;cursor:not-allowed; }
.cat-accent-bar { width:5px;height:40px;border-radius:3px;flex-shrink:0; }
.color-swatch { width:28px;height:28px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s; }
.color-swatch:hover { transform:scale(1.15); }
.modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px; }
</style>