<template>
  <div>
    <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
      <div>
        <h2 class="vld-page-title">Planification des soutenances</h2>
        <p class="vld-page-sub">Gérez les sessions, salles et plans proposés par les jurys</p>
      </div>
      <div class="d-flex gap-2 align-items-center flex-wrap">
        <span v-if="conflitDetecte" class="badge bg-danger px-3 py-2">⚠ Conflits détectés</span>
        <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2">{{ sessions.length }} session(s)</span>
        <button class="btn btn-primary d-flex align-items-center gap-2" @click="openModal()">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Planifier une session
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="d-flex gap-2 mb-4 flex-wrap">
      <button v-for="tab in tabs" :key="tab.key" class="btn btn-sm" :class="onglet===tab.key ? 'btn-primary' : 'btn-outline-secondary'" @click="onglet=tab.key">
        {{ tab.label }}
        <span v-if="tab.count" class="badge ms-1" :class="onglet===tab.key ? 'bg-light text-primary' : 'bg-primary'">{{ tab.count }}</span>
      </button>
    </div>

    <!-- LISTE -->
    <template v-if="onglet==='liste'">
      <div v-if="loadingSessions" class="vld-state"><div class="vld-spinner mx-auto mb-3"></div><p>Chargement...</p></div>
      <div v-else-if="!sessions.length" class="vld-state">
        <div class="vld-state__icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
        <p class="vld-state__title">Aucune session planifiée</p>
        <button class="btn btn-primary mt-3" @click="openModal()">Planifier la première session</button>
      </div>
      <div v-else class="table-responsive card">
        <table class="table table-hover mb-0">
          <thead><tr><th>Date & Heure</th><th>Projet</th><th>Étudiant</th><th>Salle</th><th>Jury</th><th class="text-center">Actions</th></tr></thead>
          <tbody>
            <tr v-for="s in sessions" :key="s.id" :class="s.conflit ? 'table-danger' : ''">
              <td style="white-space:nowrap">
                <div class="fw-semibold">{{ formatDate(s.date) }}</div>
                <div style="font-size:12px;color:var(--vld-text-muted)">{{ s.heure_debut }} – {{ s.heure_fin }}</div>
              </td>
              <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ s.projet||'—' }}</td>
              <td style="font-size:13px;color:var(--vld-text-muted)">{{ s.etudiant||'—' }}</td>
              <td><span class="badge bg-secondary bg-opacity-10 text-secondary">{{ s.salle||'—' }}</span></td>
              <td style="font-size:12.5px;color:var(--vld-text-muted)">{{ s.jury_membres?.join(', ')||'—' }}</td>
              <td class="text-center">
                <div class="d-flex gap-1 justify-content-center">
                  <button class="vld-icon-btn vld-icon-btn--edit" @click="openModal(s)"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                  <button class="vld-icon-btn vld-icon-btn--del" @click="supprimerSession(s.id)"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- CALENDRIER -->
    <template v-if="onglet==='calendrier'">
      <div v-if="!joursAvecSessions.length" class="vld-state"><p class="vld-state__title">Aucune session à afficher</p></div>
      <div v-else class="d-flex flex-column gap-4">
        <div v-for="jour in joursAvecSessions" :key="jour.date">
          <div class="fw-bold mb-2 px-1" style="font-size:15px;color:var(--vld-primary)">{{ jour.dateLabel }}</div>
          <div class="row g-3">
            <div v-for="s in jour.sessions" :key="s.id" class="col-12 col-md-6">
              <div class="card h-100" :class="s.conflit ? 'border-danger' : ''">
                <div class="card-body">
                  <div class="fw-bold mb-1">{{ s.projet||'—' }}</div>
                  <div style="font-size:12.5px;color:var(--vld-text-muted)">{{ s.heure_debut }} – {{ s.heure_fin }} · {{ s.salle||'—' }}</div>
                  <div style="font-size:12.5px;color:var(--vld-text-muted)">{{ s.etudiant||'—' }}</div>
                  <div v-if="s.conflit" class="badge bg-danger mt-2">⚠ Conflit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- PLANS PROPOSÉS -->
    <template v-if="onglet==='plans'">
      <div v-if="!plans.length" class="vld-state"><p class="vld-state__title">Aucun plan proposé</p></div>
      <div v-else class="d-flex flex-column gap-3">
        <div v-for="p in plans" :key="p.id" class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
              <div>
                <div class="fw-bold">{{ p.membre_jury }}</div>
                <div style="font-size:12.5px;color:var(--vld-text-muted)">Proposé le {{ p.date_proposition }}</div>
              </div>
              <span class="badge" :class="p.statut==='validé' ? 'bg-success' : p.statut==='rejeté' ? 'bg-danger' : 'bg-warning text-dark'">{{ p.statut }}</span>
            </div>
            <div class="table-responsive mb-3">
              <table class="table table-sm mb-0">
                <thead><tr><th>Date</th><th>Heure</th><th>Salle</th><th>Projet</th></tr></thead>
                <tbody>
                  <tr v-for="(sess, i) in p.sessions" :key="i">
                    <td>{{ sess.date }}</td><td>{{ sess.heure }}</td><td>{{ sess.salle }}</td><td>{{ sess.projet }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="p.statut==='En attente'" class="d-flex gap-2 justify-content-end">
              <button class="btn btn-success btn-sm" @click="validerPlan(p.id)">✓ Valider</button>
              <button class="btn btn-danger btn-sm" @click="rejeterPlan(p.id)">✕ Rejeter</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- SESSION MODAL -->
    <Transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
        <div class="card p-0" style="width:100%;max-width:560px;max-height:92vh;overflow-y:auto">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span class="fw-bold">{{ editSession ? 'Modifier la session' : 'Planifier une session' }}</span>
            <button class="btn-close" @click="showModal=false"></button>
          </div>
          <div class="card-body d-flex flex-column gap-3">
            <div>
              <label class="form-label">Jury / Projet <span class="text-danger">*</span></label>
              <select v-model="form.jury_id" class="form-select" @change="onJuryChange">
                <option value="">— Sélectionner un jury —</option>
                <option v-for="j in jurysDisponibles" :key="j.id" :value="j.id">{{ j.titre }} · {{ j.etudiant }}</option>
              </select>
            </div>
            <div class="row g-3">
              <div class="col-12 col-sm-6">
                <label class="form-label">Date <span class="text-danger">*</span></label>
                <input type="date" v-model="form.date" class="form-control" />
              </div>
              <div class="col-6 col-sm-3">
                <label class="form-label">Début</label>
                <input type="time" v-model="form.heure_debut" class="form-control" />
              </div>
              <div class="col-6 col-sm-3">
                <label class="form-label">Fin</label>
                <input type="time" v-model="form.heure_fin" class="form-control" />
              </div>
            </div>
            <div>
              <label class="form-label">Salle</label>
              <div class="d-flex flex-wrap gap-2">
                <button v-for="s in sallesAvecStatut" :key="s.salle" type="button"
                  class="btn btn-sm"
                  :class="form.salle===s.salle ? 'btn-primary' : s.occupee ? 'btn-outline-danger' : 'btn-outline-secondary'"
                  :title="s.occupee ? 'Occupée à ce créneau' : ''"
                  @click="form.salle=s.salle">
                  {{ s.salle }}
                  <span v-if="s.occupee">⚠</span>
                </button>
              </div>
            </div>
            <!-- Jury conflict warning -->
            <div v-if="conflitsMembresJury.length" class="alert alert-warning py-2">
              <strong>Conflit de membres jury :</strong>
              <ul class="mb-0 mt-1">
                <li v-for="c in conflitsMembresJury" :key="c.id" style="font-size:13px">{{ c.nom }} — occupe {{ c.projet }} ({{ c.heure }})</li>
              </ul>
            </div>
            <!-- Preview jury members -->
            <div v-if="selectedJuryPreview">
              <label class="form-label">Membres du jury</label>
              <div class="d-flex flex-wrap gap-2">
                <span v-for="m in selectedJuryPreview.membres" :key="m.enseignant_id"
                  class="badge px-3 py-2"
                  :class="m.fonction==='president' ? 'bg-warning text-dark' : m.fonction==='encadrant' ? 'bg-primary' : 'bg-secondary'">
                  {{ m.nom }} ({{ m.fonction }})
                </span>
              </div>
            </div>
          </div>
          <div class="card-footer d-flex justify-content-end gap-2">
            <button class="btn btn-outline-secondary" @click="showModal=false">Annuler</button>
            <button class="btn btn-primary d-flex align-items-center gap-2" @click="sauvegarder" :disabled="saving">
              <span v-if="saving" class="vld-spinner-sm"></span>
              {{ editSession ? 'Enregistrer' : 'Planifier' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script>
import api from '@/services/api.js'
export default {
  name: 'GestionSoutenance',
  emits: ['toast'],
  data () {
    return {
      onglet:'liste', loadingSessions:false, saving:false, showModal:false,
      editSession:null, calendrierPublie:false, conflits:[], conflitDetecte:false,
      sessions:[], plans:[], projetsDisponibles:[], jurysDisponibles:[], selectedJuryPreview:null,
      allSalles:['Salle A101','Salle A102','Salle A103','Salle B201','Salle B202','Salle B203','Salle C301','Salle C302','Amphi 1','Amphi 2'],
      form:{ date:'', salle:'', heure_debut:'', heure_fin:'', projet_id:'', jury_id:'' },
    }
  },
  computed: {
    tabs () { return [{ key:'liste', label:'Sessions', count:this.sessions.length },{ key:'calendrier', label:'Calendrier' },{ key:'plans', label:'Plans proposés', count:this.plans.filter(p=>p.statut==='En attente').length }] },
    _overlap () { return (d1,h1,f1,d2,h2,f2)=>{ if(!d1||!h1||!f1||!d2||!h2||!f2) return false; if(d1!==d2) return false; const m=t=>{const[h,mn]=t.split(':').map(Number);return h*60+mn}; return m(h1)<m(f2)&&m(h2)<m(f1) } },
    sallesOccupees () { const{date,heure_debut,heure_fin}=this.form; if(!date||!heure_debut||!heure_fin) return new Set(); const b=new Set(); this.sessions.forEach(s=>{ if(!s.salle) return; if(this.editSession&&s.id===this.editSession.id) return; if(this._overlap(date,heure_debut,heure_fin,s.date,s.heure_debut,s.heure_fin)) b.add(s.salle) }); return b },
    sallesAvecStatut () { return this.allSalles.map(salle=>({ salle, occupee:this.sallesOccupees.has(salle) })) },
    conflitsMembresJury () { const{date,heure_debut,heure_fin}=this.form; if(!date||!heure_debut||!heure_fin||!this.selectedJuryPreview) return []; const ids=new Set((this.selectedJuryPreview.membres||[]).map(m=>m.enseignant_id).filter(Boolean)); if(!ids.size) return []; const c=[]; this.sessions.forEach(s=>{ if(this.editSession&&s.id===this.editSession.id) return; if(!this._overlap(date,heure_debut,heure_fin,s.date,s.heure_debut,s.heure_fin)) return; (s.jury_membres_ids||[]).forEach(id=>{ if(ids.has(id)){const m=(this.selectedJuryPreview.membres||[]).find(x=>x.enseignant_id===id); if(!c.find(x=>x.id===id)) c.push({id,nom:m?.nom||'Membre #'+id,projet:s.projet||'Soutenance #'+s.id,heure:`${s.heure_debut}–${s.heure_fin}`}) }}) }); return c },
    joursAvecSessions () { const map={}; this.sessions.forEach(s=>{ if(!map[s.date]) map[s.date]={date:s.date,dateLabel:this.formatDate(s.date),sessions:[]}; map[s.date].sessions.push(s) }); return Object.values(map).sort((a,b)=>a.date.localeCompare(b.date)) },
  },
  mounted () { this.chargerSessions(); this.chargerProjets(); this.chargerPlans(); this.chargerJurys() },
  methods: {
    async chargerJurys () { try { const r=await api.get('/jurys-pfe'); this.jurysDisponibles=(r.data||[]).filter(j=>j.statut!=='termine'&&j.statut!=='annule').map(j=>({ id:j.id, titre:j.projet_titre||'Projet #'+j.id, etudiant:j.etudiant_nom||'—', membres:(j.membres||[]).map(m=>({enseignant_id:m.enseignant_id??m.id,nom:m.nom||(m.prenom?m.prenom+' '+m.nom:''),fonction:m.fonction})) })) } catch(e) { this.jurysDisponibles=[] } },
    async chargerSessions () { this.loadingSessions=true; try { const r=await api.get('/jurys-pfe'); this.sessions=(r.data||[]).filter(s=>s.date_soutenance).map(s=>this.mapSession(s)); this.detecterConflits() } catch(e) { this.$emit('toast',{message:'Erreur chargement sessions',type:'toast-err'}); this.sessions=[] } finally { this.loadingSessions=false } },
    mapSession (s) { return { id:s.id, date:s.date_soutenance||'', heure_debut:(s.heure_debut||'').substring(0,5), heure_fin:(s.heure_fin||'').substring(0,5), salle:s.salle||'', projet:s.projet_titre||null, etudiant:s.etudiant_nom||null, jury_membres:(s.membres||[]).map(m=>m.nom||''), jury_membres_ids:(s.membres||[]).map(m=>m.enseignant_id).filter(Boolean), conflit:false } },
    async chargerProjets () { try { const r=await api.get('/jurys-pfe/projets-disponibles'); this.projetsDisponibles=(r.data||[]).map(p=>({id:p.id,titre:p.titre||'Projet #'+p.id,etudiant:p.etudiant_nom||'—'})) } catch(e) { this.projetsDisponibles=[] } },
    async chargerPlans () { try { const r=await api.get('/plans-soutenance'); this.plans=(r.data||[]).map(p=>({ id:p.id, membre_jury:p.proposant_nom||'Proposant #'+p.proposant_id, date_proposition:p.created_at?new Date(p.created_at).toLocaleDateString('fr-FR'):'—', statut:p.statut==='approuve'?'validé':p.statut==='rejete'?'rejeté':'En attente', sessions:[{date:p.date||'—',heure:p.heure_debut||'—',salle:p.salle||'—',projet:p.projet_titre||'—'}] })) } catch(e) { this.plans=[] } },
    detecterConflits () { const toMin=t=>{ if(!t) return 0; const[h,m]=t.split(':').map(Number); return h*60+m }; this.conflitDetecte=false; const salleMap={}; this.sessions.forEach(s=>{ if(!s.salle||!s.date) return; const key=s.salle+'|'+s.date; if(!salleMap[key]) salleMap[key]=[]; salleMap[key].push(s) }); this.sessions.forEach(s=>{ s.conflit=false }); Object.values(salleMap).forEach(group=>{ for(let i=0;i<group.length;i++) for(let j=i+1;j<group.length;j++) { const a=group[i],b=group[j]; if(toMin(a.heure_debut)<toMin(b.heure_fin)&&toMin(b.heure_debut)<toMin(a.heure_fin)) { a.conflit=true; b.conflit=true; this.conflitDetecte=true } } }) },
    openModal (s=null) { if(s) { this.editSession=s; this.form={date:s.date,salle:s.salle,heure_debut:s.heure_debut,heure_fin:s.heure_fin,projet_id:'',jury_id:s.id}; this.selectedJuryPreview=this.jurysDisponibles.find(j=>j.id===s.id)||null } else { this.editSession=null; this.form={date:'',salle:'',heure_debut:'',heure_fin:'',projet_id:'',jury_id:''}; this.selectedJuryPreview=null }; this.showModal=true },
    onJuryChange () { this.selectedJuryPreview=this.jurysDisponibles.find(j=>j.id===this.form.jury_id)||null },
    async sauvegarder () {
      if(!this.form.jury_id||!this.form.date) { this.$emit('toast',{message:'Jury et date requis.',type:'toast-err'}); return }
      this.saving=true
      try {
        const pl={date_soutenance:this.form.date,heure_debut:this.form.heure_debut,heure_fin:this.form.heure_fin,salle:this.form.salle,statut:'planifie'}
        if(this.editSession) { await api.put(`/jurys-pfe/${this.editSession.id}`,pl); this.$emit('toast',{message:'Session modifiée ✓',type:'toast-ok'}) }
        else { await api.put(`/jurys-pfe/${this.form.jury_id}`,pl); this.$emit('toast',{message:'Session planifiée ✓',type:'toast-ok'}) }
        await this.chargerSessions(); this.showModal=false
      } catch(e) { console.error('[jurys-pfe PUT errors]', e.response?.data?.errors ?? e.response?.data); this.$emit('toast',{message:e.response?.data?.message||'Erreur',type:'toast-err'}) }
      finally { this.saving=false }
    },
    async supprimerSession (id) { if(!confirm('Annuler cette session ?')) return; try { await api.put(`/jurys-pfe/${id}`,{date_soutenance:null,salle:null,heure_debut:null,heure_fin:null,statut:'en_attente'}); await this.chargerSessions(); this.$emit('toast',{message:'Session annulée.',type:'toast-ok'}) } catch(e) { this.$emit('toast',{message:'Erreur',type:'toast-err'}) } },
    async validerPlan (id) { try { await api.post(`/plans-soutenance/${id}/valider`); await this.chargerPlans(); await this.chargerSessions(); this.$emit('toast',{message:'Plan validé.',type:'toast-ok'}) } catch { this.$emit('toast',{message:'Erreur',type:'toast-err'}) } },
    async rejeterPlan (id) { try { await api.post(`/plans-soutenance/${id}/rejeter`); await this.chargerPlans(); this.$emit('toast',{message:'Plan rejeté.',type:'toast-ok'}) } catch { this.$emit('toast',{message:'Erreur',type:'toast-err'}) } },
    formatDate (d) { if(!d) return '—'; const p=d.split('-'); return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:d },
  },
}
</script>

<style scoped>
.modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px; }
</style>