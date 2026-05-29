<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div>
        <h2 class="vld-page-title">Planifier des réunions</h2>
        <p class="vld-page-sub">Proposez des créneaux à vos étudiants — Semaine {{ weekNum }}</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="semainePrecedente">←</button>
        <button class="btn btn-outline-secondary btn-sm" @click="semaineSuivante">→</button>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="vld-toast-wrap">
        <div class="alert d-flex align-items-center gap-2 shadow-sm py-3 px-4 mb-0" :class="toast.type==='ok'?'alert-success':'alert-danger'">
          {{ toast.msg }}<button class="btn-close ms-auto" @click="toast.show=false"></button>
        </div>
      </div>
    </Transition>

    <!-- Student selector -->
    <div class="d-flex align-items-center gap-3 mb-4 flex-wrap">
      <label class="form-label mb-0">Étudiant :</label>
      <select v-model="selectedStudent" class="form-select" style="max-width:260px">
        <option :value="null">— Tous mes étudiants —</option>
        <option v-for="e in etudiants" :key="e.id" :value="e.id">{{ e.nom }}</option>
      </select>
    </div>

    <!-- Calendar grid -->
    <div class="card mb-4 overflow-hidden">
      <div class="table-responsive">
        <table class="table mb-0" style="min-width:600px">
          <thead>
            <tr>
              <th style="width:70px;background:var(--vld-surface-alt)">Heure</th>
              <th v-for="j in jours" :key="j.key" class="text-center" style="background:var(--vld-surface-alt)">
                <div style="font-weight:700;font-size:13px;color:var(--vld-text-strong)">{{ j.nom }}</div>
                <div style="font-size:11px;color:var(--vld-text-muted)">{{ j.date.toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}) }}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="heure in heures" :key="heure">
              <td style="font-size:12px;color:var(--vld-text-muted);font-weight:600;white-space:nowrap;background:var(--vld-surface-alt)">{{ heure }}</td>
              <td v-for="j in jours" :key="j.key"
                class="calendar-cell"
                :class="isSelected(j,heure) ? 'cell-selected' : isBooked(j,heure) ? 'cell-booked' : 'cell-empty'"
                @click="toggleSlot(j,heure)">
                <div v-if="isBooked(j,heure)" class="booked-label">{{ bookedLabel(j,heure) }}</div>
                <svg v-else-if="isSelected(j,heure)" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Selection summary + send -->
    <div v-if="selection.length" class="card mb-4">
      <div class="card-body">
        <div class="fw-bold mb-3" style="font-size:14px;color:var(--vld-text-strong)">{{ selection.length }} créneau(x) sélectionné(s)</div>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span v-for="(s,i) in selection" :key="i" class="badge bg-primary px-3 py-2 d-flex align-items-center gap-2">
            {{ s.date.toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short'}) }} {{ s.heure }}
            <button class="btn-close btn-close-white ms-1" style="font-size:9px" @click="selection.splice(i,1)"></button>
          </span>
        </div>
        <div class="row g-2 align-items-end">
          <div class="col-12 col-sm-auto">
            <label class="form-label" style="font-size:12px">Proposer à :</label>
            <select v-model="selectedStudent" class="form-select form-select-sm">
              <option :value="null">— Choisir un étudiant —</option>
              <option v-for="e in etudiants" :key="e.id" :value="e.id">{{ e.nom }}</option>
            </select>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary d-flex align-items-center gap-2" @click="proposer" :disabled="loading || !selectedStudent">
              <span v-if="loading" class="vld-spinner-sm"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Envoyer les propositions
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Réunions existantes -->
    <div class="vld-section-label">Réunions proposées</div>
    <div v-if="!propositions.length" class="vld-state" style="padding:32px">
      <p class="vld-state__title">Aucune réunion proposée</p>
    </div>
    <div v-else class="d-flex flex-column gap-2">
      <div v-for="r in propositions" :key="r.id" class="card">
        <div class="card-body d-flex align-items-center gap-3 flex-wrap">
          <div class="vld-av vld-av--sm vld-av--blue">{{ initiales(r.etudiant) }}</div>
          <div class="flex-grow-1">
            <div class="fw-semibold" style="color:var(--vld-text-strong)">{{ r.etudiant }}</div>
            <div style="font-size:12.5px;color:var(--vld-text-muted)">{{ r.date?.toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long'}) }} à {{ r.heure }}</div>
            <div v-if="r.raison" class="mt-1" style="font-size:12.5px;color:#c0392b;font-style:italic">Motif : {{ r.raison }}</div>
          </div>
          <span class="badge" :class="r.statut==='confirme' ? 'bg-success' : r.statut==='rejete' ? 'bg-danger' : 'bg-warning text-dark'">
            {{ {confirme:'✓ Confirmée',rejete:'✕ Annulée',attente:'En attente'}[r.statut]||r.statut }}
          </span>
          <button v-if="r.statut!=='rejete'" class="vld-icon-btn vld-icon-btn--del" @click="annuler(r.id)" title="Annuler">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'
export default {
  name: 'ReunionEncadrant',
  data () {
    return {
      etudiants:[], selectedStudent:null, jourNoms:['Lun','Mar','Mer','Jeu','Ven'],
      heures:['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'],
      selection:[], propositions:[], weekStart:new Date(),
      toast:{show:false,msg:'',type:'ok'}, loading:false,
    }
  },
  computed: {
    jours () {
      const d=new Date(this.weekStart); const diff=d.getDay()===0?-6:1-d.getDay(); d.setDate(d.getDate()+diff)
      return this.jourNoms.map((nom,i)=>{ const date=new Date(d); date.setDate(d.getDate()+i); return{nom,date,key:date.toDateString()} })
    },
    weekNum () { const d=new Date(this.weekStart); d.setHours(0,0,0,0); d.setDate(d.getDate()+3-((d.getDay()+6)%7)); const w1=new Date(d.getFullYear(),0,4); return 1+Math.round(((d-w1)/86400000-3+((w1.getDay()+6)%7))/7) },
  },
  mounted () { this.chargerEtudiants(); this.chargerReunions() },
  methods: {
    showToast(msg,type='ok') { this.toast={show:true,msg,type}; setTimeout(()=>this.toast.show=false,3500) },
    initiales(n) { return (n||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() },
    semainePrecedente () { const d=new Date(this.weekStart); d.setDate(d.getDate()-7); this.weekStart=d },
    semaineSuivante ()  { const d=new Date(this.weekStart); d.setDate(d.getDate()+7); this.weekStart=d },
    isSelected (j,h) { return this.selection.some(s=>s.date.toDateString()===j.key&&s.heure===h) },
    isBooked (j,h)   { return this.propositions.some(p=>p.date?.toDateString()===j.key&&p.heure===h) },
    bookedLabel (j,h) { const p=this.propositions.find(p=>p.date?.toDateString()===j.key&&p.heure===h); return p?p.etudiant.split(' ')[0]:'' },
    toggleSlot (j,h)  { if(this.isBooked(j,h)) return; const idx=this.selection.findIndex(s=>s.date.toDateString()===j.key&&s.heure===h); if(idx>=0) this.selection.splice(idx,1); else this.selection.push({date:j.date,heure:h}) },
    formatHeure(d) { if(!d) return ''; const norm=typeof d==='string'?d.replace(' ','T'):d; return new Date(norm).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) },
    async chargerEtudiants () { try { const r=await api.get('/suivi/encadrant'); this.etudiants=r.data.map(e=>({id:e.etudiant_id||e.id,nom:e.nom})) } catch(e) { console.error(e) } },
    async chargerReunions () {
      try {
        const r=await api.get('/reunions')
        this.propositions=r.data.filter(r=>r.statut!=='annulee').map(r=>({id:r.id,etudiant:r.etudiant_nom,date:new Date((r.date_reunion||'').replace(' ','T')),heure:this.formatHeure(r.date_reunion),statut:r.statut==='planifiee'?'attente':r.statut==='confirmee'?'confirme':r.statut,raison:r.motif}))
      } catch(e) { console.error(e) }
    },
    async proposer () {
      if(!this.selectedStudent) { this.showToast('Sélectionnez un étudiant','err'); return }
      if(!this.selection.length) { this.showToast('Sélectionnez au moins un créneau','err'); return }
      this.loading=true
      try {
        for(const s of this.selection) {
          const dt=new Date(s.date); const[h,m]=s.heure.split(':').map(Number); dt.setHours(h,m,0,0)
          await api.post('/reunions',{etudiant_id:this.selectedStudent,date_reunion:dt.toISOString().slice(0,19).replace('T',' '),statut:'planifiee'})
        }
        this.showToast(`${this.selection.length} réunion(s) proposée(s) ✓`)
        this.selection=[]; await this.chargerReunions()
      } catch(e) { this.showToast(e.response?.data?.message||'Erreur','err') } finally { this.loading=false }
    },
    async annuler (id) { if(!confirm('Annuler cette réunion ?')) return; try { await api.put(`/reunions/${id}`,{statut:'annulee'}); await this.chargerReunions(); this.showToast('Réunion annulée.') } catch(e) { this.showToast('Erreur','err') } },
  },
}
</script>

<style scoped>
.calendar-cell { width:80px;height:40px;cursor:pointer;border:1px solid var(--vld-border);text-align:center;vertical-align:middle;transition:background .15s; }
.cell-empty:hover { background:rgba(61,96,128,.08); }
.cell-selected   { background:var(--vld-primary)!important;color:#fff; }
.cell-booked     { background:rgba(39,174,96,.15);cursor:default; }
.booked-label    { font-size:10px;font-weight:700;color:#27ae60;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 4px; }
</style>