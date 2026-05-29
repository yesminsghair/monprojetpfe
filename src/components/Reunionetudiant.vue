<template>
  <div>
    <div class="mb-4">
      <h2 class="vld-page-title">Mes réunions avec l'encadrant</h2>
      <p class="vld-page-sub">Confirmez ou déclinez les créneaux proposés par {{ encadrant }}</p>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="vld-toast-wrap">
        <div class="alert d-flex align-items-center gap-2 shadow-sm py-3 px-4 mb-0" :class="toast.type==='ok'?'alert-success':'alert-danger'">
          {{ toast.msg }}<button class="btn-close ms-auto" @click="toast.show=false"></button>
        </div>
      </div>
    </Transition>

    <!-- Prochaine réunion -->
    <div v-if="nextMeeting" class="vld-banner vld-banner--success mb-4">
      <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <div class="vld-banner__body">
        <div class="vld-banner__title">Prochaine réunion confirmée</div>
        <div class="vld-banner__sub">{{ nextMeeting.date.toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long'}) }} à {{ nextMeeting.heure }}</div>
      </div>
      <span class="badge bg-success">{{ dansXJours(nextMeeting.date) }}</span>
    </div>

    <!-- Propositions en attente -->
    <div v-if="pending.length" class="mb-4">
      <div class="vld-section-label">Créneaux en attente de réponse</div>
      <div class="d-flex flex-column gap-2">
        <div v-for="r in pending" :key="r.id" class="card" style="border-left:4px solid var(--vld-accent)">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
              <div>
                <div class="fw-bold" style="color:var(--vld-text-strong)">{{ r.date.toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long'}) }}</div>
                <div style="font-size:13px;color:var(--vld-text-muted)">{{ r.heure }} · Proposé par {{ encadrant }}</div>
              </div>
              <span class="badge bg-warning text-dark">En attente</span>
            </div>
            <div class="d-flex gap-2 align-items-end flex-wrap">
              <button class="btn btn-success d-flex align-items-center gap-2" @click="confirmer(r)">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Confirmer
              </button>
              <div class="d-flex flex-column gap-1 flex-grow-1" style="max-width:340px">
                <input v-model="r._raison" class="form-control form-control-sm" :class="r._showRejet&&!r._raison?'is-invalid':''" placeholder="Motif de refus (obligatoire pour décliner)" />
                <div v-if="r._showRejet&&!r._raison" class="invalid-feedback d-block">Le motif est obligatoire.</div>
              </div>
              <button class="btn btn-outline-danger d-flex align-items-center gap-2" @click="decliner(r)">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Décliner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Réunions confirmées -->
    <div v-if="confirmed.length" class="mb-4">
      <div class="vld-section-label">Réunions confirmées</div>
      <div class="d-flex flex-column gap-2">
        <div v-for="r in confirmed" :key="r.id" class="card">
          <div class="card-body d-flex align-items-center gap-3 flex-wrap">
            <div class="text-center" style="min-width:52px">
              <div style="font-family:var(--vld-font-display);font-size:26px;font-weight:800;color:var(--vld-primary);line-height:1">{{ r.date.toLocaleDateString('fr-FR',{day:'numeric'}) }}</div>
              <div style="font-size:11px;font-weight:700;color:var(--vld-text-muted);text-transform:uppercase">{{ r.date.toLocaleDateString('fr-FR',{month:'short'}) }}</div>
            </div>
            <div class="flex-grow-1">
              <div class="fw-semibold" style="color:var(--vld-text-strong)">{{ r.date.toLocaleDateString('fr-FR',{weekday:'long'}) }}</div>
              <div style="font-size:13px;color:var(--vld-text-muted)">{{ r.heure }}</div>
            </div>
            <span class="badge bg-success">✓ Confirmée</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Historique -->
    <div v-if="repondues.filter(r=>r.statut==='annulee').length" class="mb-4">
      <div class="vld-section-label">Créneaux déclinés</div>
      <div class="d-flex flex-column gap-2">
        <div v-for="r in repondues.filter(r=>r.statut==='annulee')" :key="r.id" class="card" style="opacity:.75">
          <div class="card-body d-flex align-items-center gap-3 flex-wrap">
            <div class="flex-grow-1">
              <div class="fw-semibold" style="color:var(--vld-text-muted);text-decoration:line-through">{{ r.date.toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long'}) }} à {{ r.heure }}</div>
            </div>
            <span class="badge bg-secondary">Décliné</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!pending.length && !confirmed.length && !loading" class="vld-state">
      <div class="vld-state__icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <p class="vld-state__title">Aucune réunion pour le moment</p>
      <p class="vld-state__sub">Votre encadrant proposera bientôt des créneaux.</p>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'
export default {
  name: 'ReunionEtudiant',
  data () { return { encadrant:'', propositions:[], toast:{show:false,msg:'',type:'ok'}, loading:false } },
  computed: {
    pending ()   { return this.propositions.filter(p=>p.statut==='planifiee') },
    repondues () { return this.propositions.filter(p=>p.statut==='confirmee'||p.statut==='annulee') },
    confirmed () { return this.propositions.filter(p=>p.statut==='confirmee').sort((a,b)=>new Date(a.date)-new Date(b.date)) },
    nextMeeting () { const now=new Date(); return this.confirmed.find(m=>new Date(m.date)>=now)||this.confirmed[0]||null },
  },
  mounted () { this.chargerReunions(); this.chargerEncadrant() },
  methods: {
    showToast(msg,type='ok') { this.toast={show:true,msg,type}; setTimeout(()=>this.toast.show=false,3500) },
    formatHeure(d) { if(!d) return ''; const n=typeof d==='string'?d.replace(' ','T'):d; return new Date(n).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) },
    dansXJours(d) { const diff=Math.ceil((new Date(d)-new Date())/(1000*60*60*24)); return diff===0?'Aujourd\'hui':diff===1?'Demain':`Dans ${diff} j` },
    async chargerReunions () { try { const r=await api.get('/reunions'); this.propositions=r.data.map(r=>({id:r.id,date:new Date((r.date_reunion||'').replace(' ','T')),heure:this.formatHeure(r.date_reunion),statut:r.statut,_showRejet:false,_raison:''})) } catch(e) { console.error(e) } },
    async chargerEncadrant () { try { const r=await api.get('/suivi/etudiant'); this.encadrant=r.data.encadrant_nom||'Encadrant' } catch(e) { this.encadrant='Encadrant' } },
    async confirmer (r) { try { await api.put(`/reunions/${r.id}`,{statut:'confirmee'}); r.statut='confirmee'; this.showToast('Réunion confirmée ✓') } catch(e) { this.showToast(e.response?.data?.message||'Erreur','err') } },
    async decliner (r) {
      r._showRejet=true
      if(!r._raison.trim()) { this.showToast('Veuillez indiquer un motif.','err'); return }
      try { await api.put(`/reunions/${r.id}`,{statut:'annulee',motif:r._raison}); r.statut='annulee'; this.showToast('Créneau décliné.') }
      catch(e) { this.showToast(e.response?.data?.message||'Erreur','err') }
    },
  },
}
</script>