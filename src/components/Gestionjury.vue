<template>
  <div>
    <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
      <div>
        <h2 class="vld-page-title">Composition des jurys PFE</h2>
        <p class="vld-page-sub">Attribuez les membres de jury pour chaque projet de votre département</p>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <span class="badge bg-success bg-opacity-10 text-success px-3 py-2">{{ etudiants.filter(e=>e.jury_id).length }} jury(s) créé(s)</span>
        <span class="badge bg-warning bg-opacity-10 text-warning px-3 py-2">{{ etudiants.filter(e=>!e.jury_id).length }} sans jury</span>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="vld-toast-wrap">
        <div class="alert d-flex align-items-center gap-2 shadow-sm py-3 px-4 mb-0" :class="toast.type==='toast-ok'?'alert-success':'alert-danger'">
          {{ toast.message }}<button class="btn-close ms-auto" @click="toast.show=false"></button>
        </div>
      </div>
    </Transition>

    <div v-if="loadingEtudiants" class="vld-state"><div class="vld-spinner mx-auto mb-3"></div><p>Chargement...</p></div>

    <div v-else-if="!etudiants.length" class="vld-state">
      <div class="vld-state__icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
      <p class="vld-state__title">Aucun étudiant trouvé</p>
      <p class="vld-state__sub">Les affectations doivent être finalisées avant de composer les jurys.</p>
    </div>

    <div v-else class="d-flex flex-column gap-3">
      <div v-for="et in etudiants" :key="et.etudiant_id" class="card">
        <div class="card-header d-flex align-items-center gap-3 flex-wrap">
          <div class="vld-av vld-av--md vld-av--gold">{{ initiales(et.etudiant_nom) }}</div>
          <div class="flex-grow-1">
            <div class="fw-bold" style="color:var(--vld-text-strong)">{{ et.etudiant_nom }}</div>
            <div style="font-size:12.5px;color:var(--vld-text-muted)">{{ et.projet_titre || 'Projet sans titre' }} · Encadrant : {{ et.encadrant_nom || '—' }}</div>
          </div>
          <div class="d-flex gap-2 align-items-center">
            <span v-if="et.jury_id" class="badge bg-success">✓ Jury composé</span>
            <span v-else class="badge bg-warning text-dark">⊘ Sans jury</span>
            <button v-if="et.jury_id" class="vld-icon-btn vld-icon-btn--del" @click="supprimerJury(et)" title="Supprimer le jury">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
            </button>
          </div>
        </div>
        <div class="card-body">
          <!-- Members list -->
          <div v-if="et.membres?.length" class="d-flex flex-wrap gap-2 mb-3">
            <div v-for="m in et.membres" :key="m.id"
              class="d-flex align-items-center gap-2 px-3 py-2 rounded"
              style="background:var(--vld-surface-alt);border:1.5px solid var(--vld-border)">
              <span class="badge" :class="m.fonction==='president' ? 'bg-warning text-dark' : m.fonction==='encadrant' ? 'bg-primary' : 'bg-secondary'">
                {{ roleLabel(m.fonction) }}
              </span>
              <span style="font-size:13.5px;color:var(--vld-text-strong)">{{ m.nom }}</span>
              <button class="btn-close btn-close-sm ms-1" style="font-size:10px" @click="retirerMembre(et, m)"></button>
            </div>
          </div>
          <div v-else-if="!et.jury_id" class="mb-3" style="font-size:13px;color:var(--vld-text-muted);font-style:italic">
            Ajoutez un membre pour créer automatiquement le jury (l'encadrant sera ajouté automatiquement).
          </div>

          <!-- Add member row -->
          <div class="row g-2 align-items-end">
            <div class="col-12 col-sm-6 col-lg-5">
              <label class="form-label" style="font-size:12px">Ajouter un membre</label>
              <select v-model="selectionMembre[et.etudiant_id]" class="form-select form-select-sm" @change="ajouterMembreRapide(et)">
                <option value="">— Choisir un enseignant —</option>
                <option v-for="e in enseignantsDisposPour(et)" :key="e.id" :value="e.id+'|'+e.nom_complet">{{ e.nom_complet }}</option>
              </select>
            </div>
            <div class="col-12 col-sm-4 col-lg-3">
              <label class="form-label" style="font-size:12px">Rôle</label>
              <select v-model="selectionRole[et.etudiant_id]" class="form-select form-select-sm">
                <option value="examinateur">Examinateur</option>
                <option value="president">Président</option>
              </select>
            </div>
            <div class="col-auto">
              <div class="d-flex gap-2 align-items-center" style="font-size:12.5px;color:var(--vld-text-muted)">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                {{ et.membres?.length || 0 }} membre(s)
                <span v-if="presidentDe(et)" class="badge bg-warning text-dark ms-1">Prés: {{ presidentDe(et) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'
export default {
  name: 'GestionJury',
  emits: ['toast'],
  data () {
    return {
      loadingEtudiants: false,
      etudiants: [], enseignants: [],
      selectionMembre: {}, selectionRole: {},
      toast: { show: false, message: '', type: 'toast-ok' },
    }
  },
  mounted () { this.chargerEtudiants() },
  methods: {
    showToast (message, type='toast-ok') {
      this.$emit('toast', { message, type })
      this.toast = { show: true, message, type }
      setTimeout(() => { this.toast.show = false }, 3500)
    },
    async chargerEtudiants () {
      this.loadingEtudiants = true
      try {
        const res = await api.get('/jurys-pfe/etudiants-du-chef')
        this.etudiants = res.data || []
        this.etudiants.forEach(et => {
          if (!(et.etudiant_id in this.selectionMembre)) this.selectionMembre[et.etudiant_id] = ''
          if (!(et.etudiant_id in this.selectionRole))  this.selectionRole[et.etudiant_id]  = 'examinateur'
        })
        await this.chargerEnseignants()
      } catch { this.showToast('Impossible de charger la liste des étudiants.', 'toast-err') }
      finally { this.loadingEtudiants = false }
    },
    async chargerEnseignants () {
      try {
        const res = await api.get('/utilisateurs')
        const encIds = new Set(this.etudiants.map(e => e.encadrant_id).filter(Boolean))
        this.enseignants = (res.data||[]).filter(u => u.role==='encadrant' && encIds.has(u.id)).map(u => ({ id:u.id, nom_complet:`${u.prenom??''} ${u.nom??''}`.trim(), role:u.role }))
      } catch { console.error('Erreur chargement enseignants') }
    },
    enseignantsDisposPour (et) { const ids=new Set((et.membres||[]).map(m=>m.enseignant_id)); return this.enseignants.filter(e=>!ids.has(e.id)) },
    async ajouterMembreRapide (et) {
      const val = this.selectionMembre[et.etudiant_id]; if (!val) return
      const enseignantId = parseInt(val.split('|')[0])
      this.selectionMembre[et.etudiant_id] = ''
      if (!et.jury_id) {
        if (!et.projet_pfe_id) { this.showToast("Cet étudiant n'a pas encore de projet PFE.", 'toast-err'); return }
        try {
          const jr = await api.post('/jurys-pfe', { projet_id: et.projet_pfe_id })
          et.jury_id = jr.data.id
          et.membres = (jr.data.membres||[]).map(m => ({ id:m.id, enseignant_id:m.enseignant_id, nom:`${m.enseignant?.prenom??''} ${m.enseignant?.nom??''}`.trim(), fonction:m.fonction }))
          if (et.membres.length) this.showToast(`Jury créé — encadrant ${et.encadrant_nom} ajouté automatiquement.`)
        } catch (e) { this.showToast(e.response?.data?.message||'Erreur création jury.', 'toast-err'); return }
      }
      try {
        const res = await api.post(`/jurys-pfe/${et.jury_id}/membres`, { enseignant_id:enseignantId, fonction:this.selectionRole[et.etudiant_id]||'examinateur' })
        const m = res.data
        et.membres = [...(et.membres||[]), { id:m.id, enseignant_id:m.enseignant_id, nom:`${m.enseignant?.prenom??''} ${m.enseignant?.nom??''}`.trim(), fonction:m.fonction }]
        this.showToast('Membre ajouté au jury.')
      } catch (e) { this.showToast(e.response?.data?.message||"Erreur lors de l'ajout.", 'toast-err') }
    },
    async retirerMembre (et, membre) {
      if (!confirm(`Retirer ${membre.nom} du jury ?`)) return
      try { await api.delete(`/jurys-pfe/${et.jury_id}/membres/${membre.id}`); et.membres=et.membres.filter(m=>m.id!==membre.id); this.showToast('Membre retiré.') }
      catch (e) { this.showToast(e.response?.data?.message||'Erreur lors du retrait.', 'toast-err') }
    },
    async supprimerJury (et) {
      if (!confirm(`Supprimer le jury de ${et.etudiant_nom} ?`)) return
      try { await api.delete(`/jurys-pfe/${et.jury_id}`); et.jury_id=null; et.membres=[]; this.showToast('Jury supprimé.') }
      catch (e) { this.showToast(e.response?.data?.message||'Erreur.', 'toast-err') }
    },
    presidentDe (et) { const p=(et.membres||[]).find(m=>m.fonction==='president'); return p?p.nom:null },
    roleLabel (f)    { return { president:'Prés.', encadrant:'Enc.', examinateur:'Exam.' }[f]||f },
    initiales (n)    { return (n||'?').split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2) },
  },
}
</script>