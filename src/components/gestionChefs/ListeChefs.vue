<template>
  <div class="page-content">
    <div class="page-header-block">
      <div>
        <h2 class="page-title">Liste des chefs de département</h2>
        <p class="page-sub">{{ chefs.length }} chef(s) enregistré(s)</p>
      </div>
      <button class="btn-primary" @click="$emit('navigate','chef-create')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ajouter un chef
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement...</p>
    </div>

    <div v-else-if="!chefs.length" class="empty-state">
      <div class="empty-icon">👤</div>
      <p>Aucun chef de département. Ajoutez-en un.</p>
    </div>

    <div v-else class="chefs-list">
      <div v-for="c in chefs" :key="c.id" class="chef-card">

        <!-- Mode lecture -->
        <template v-if="editId !== c.id">
          <div class="chef-top">
            <div class="chef-av">{{ initiales(c.prenom + ' ' + c.nom) }}</div>
            <div class="chef-info">
              <div class="chef-nom">{{ c.prenom }} {{ c.nom }}</div>
              <div class="chef-email">{{ c.email }}</div>
              <div class="chef-domaine" v-if="c.domaineExpertise">{{ c.domaineExpertise }}</div>
            </div>
            <div class="chef-actions">
              <button class="icon-btn" @click="startEdit(c)" title="Modifier">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="icon-btn icon-danger" @click="confirmerRetrait(c)" title="Retirer le rôle chef">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
              </button>
            </div>
          </div>

          <div class="chef-meta">
            <span v-if="c.specialiteNom" class="spec-pill">
              🎓 {{ c.specialiteNom }} ({{ c.specialiteCode }})
            </span>
            <span v-else class="no-spec">Aucune spécialité assignée</span>
            <span v-if="c.dateAffectation" class="date-pill">📅 Depuis le {{ c.dateAffectation }}</span>
          </div>

          <!-- Affecter spécialité -->
          <div class="affect-row" v-if="specialites.length">
            <select v-model="c._selectedSpec" class="spec-select">
              <option value="">— Choisir une spécialité —</option>
              <option v-for="s in specialites" :key="s.id" :value="s.id">{{ s.nom }}</option>
            </select>
            <button class="btn-affecter" @click="affecterSpec(c)" :disabled="!c._selectedSpec">
              Affecter
            </button>
          </div>
        </template>

        <!-- Mode édition -->
        <template v-else>
          <div class="edit-form">
            <div class="edit-row">
              <div class="field-block-sm"><label class="fl-sm">Prénom</label><input v-model="editForm.prenom" class="fi-sm"/></div>
              <div class="field-block-sm"><label class="fl-sm">Nom</label><input v-model="editForm.nom" class="fi-sm"/></div>
            </div>
            <div class="field-block-sm"><label class="fl-sm">Email</label><input v-model="editForm.email" class="fi-sm"/></div>
            <div class="field-block-sm"><label class="fl-sm">Domaine d'expertise</label><input v-model="editForm.domaineExpertise" class="fi-sm"/></div>
            <div class="edit-actions">
              <button class="btn-outline-sm" @click="editId=null">Annuler</button>
              <button class="btn-save-sm" @click="sauvegarder(c)">Enregistrer</button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Modale retrait chef -->
    <transition name="modal-fade">
      <div v-if="modalRetrait" class="overlay" @click.self="modalRetrait=null">
        <div class="confirm-modal">
          <div class="confirm-icon warn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h4>Retirer le rôle chef ?</h4>
          <p>{{ modalRetrait?.prenom }} {{ modalRetrait?.nom }} redeviendra enseignant/encadrant. Sa spécialité sera libérée.</p>
          <div class="confirm-btns">
            <button class="btn-outline" @click="modalRetrait=null">Annuler</button>
            <button class="btn-danger" @click="retirerChef">Confirmer</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})
api.interceptors.request.use(cfg => {
  const u = localStorage.getItem('user')
  if (u) cfg.headers.Authorization = 'Bearer ' + JSON.parse(u).token
  return cfg
})

export default {
  name: 'ListeChefs',
  props: {
    chefs:       { type: Array, default: () => [] },
    specialites: { type: Array, default: () => [] },
  },
  emits: ['chefs-maj', 'navigate'],
  data() {
    return {
      loading: false,
      editId: null,
      editForm: {},
      modalRetrait: null,
    }
  },
  methods: {
    initiales(n) {
      return (n||'?').split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2)
    },
    startEdit(c) {
      this.editId   = c.id
      this.editForm = { prenom: c.prenom, nom: c.nom, email: c.email, domaineExpertise: c.domaineExpertise || '', telephone: c.telephone || '' }
    },
    async sauvegarder(c) {
      try {
        const res = await api.put(`/chefs/${c.id}/modifier`, {
          nom:              this.editForm.nom,
          prenom:           this.editForm.prenom,
          email:            this.editForm.email,
          domaineExpertise: this.editForm.domaineExpertise,
          telephone:        this.editForm.telephone,
        })
        const updated = this.chefs.map(x => x.id === c.id ? { ...x, ...res.data } : x)
        this.$emit('chefs-maj', updated)
        this.editId = null
      } catch (e) {
        console.error('Erreur modification chef:', e.response?.data?.message)
      }
    },
    async affecterSpec(c) {
      if (!c._selectedSpec) return
      try {
        const res = await api.post(`/chefs/${c.id}/affecter`, { specialiteId: c._selectedSpec })
        const updated = this.chefs.map(x => x.id === c.id ? { ...x, ...res.data } : x)
        this.$emit('chefs-maj', updated)
      } catch (e) {
        console.error('Erreur affectation:', e.response?.data?.message)
      }
    },
    confirmerRetrait(c) { this.modalRetrait = c },
    async retirerChef() {
      try {
        await api.post(`/chefs/${this.modalRetrait.id}/retirer`)
        const updated = this.chefs.filter(x => x.id !== this.modalRetrait.id)
        this.$emit('chefs-maj', updated)
        this.modalRetrait = null
      } catch (e) {
        console.error('Erreur retrait chef:', e.response?.data?.message)
      }
    }
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
.btn-primary{display:flex;align-items:center;gap:8px;padding:10px 20px;background:#3d6080;color:#fff;border:none;border-radius:10px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.18s}
.btn-primary:hover{background:#2f4f6a}
.loading-state{text-align:center;padding:60px;color:#8a9aaa}
.spinner{width:32px;height:32px;border:3px solid #c8c4bc;border-top-color:#3d6080;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-state{text-align:center;padding:60px;color:#8a9aaa}
.empty-icon{font-size:48px;margin-bottom:12px}
.chefs-list{display:flex;flex-direction:column;gap:14px}
.chef-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;padding:20px;transition:box-shadow 0.18s}
.chef-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.08)}
.chef-top{display:flex;align-items:flex-start;gap:14px;margin-bottom:12px}
.chef-av{width:44px;height:44px;border-radius:10px;background:#3d6080;color:#fff;font-weight:700;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.chef-info{flex:1}
.chef-nom{font-size:15px;font-weight:700;color:#1e2a35}
.chef-email{font-size:12.5px;color:#4a5a6a;margin-top:2px}
.chef-domaine{font-size:12px;color:#8a9aaa;margin-top:2px;font-style:italic}
.chef-actions{display:flex;gap:6px}
.icon-btn{width:30px;height:30px;border-radius:7px;border:1.5px solid #c8c4bc;background:#e8e4dc;color:#4a5a6a;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s}
.icon-btn:hover{border-color:#3d6080;color:#3d6080}
.icon-danger:hover{border-color:#c0392b;color:#c0392b}
.chef-meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.spec-pill{padding:4px 12px;background:rgba(61,96,128,0.1);color:#3d6080;border-radius:20px;font-size:12.5px;font-weight:600}
.no-spec{font-size:12.5px;color:#c8c4bc;font-style:italic}
.date-pill{font-size:12px;color:#8a9aaa}
.affect-row{display:flex;gap:8px;align-items:center;padding-top:14px;border-top:1.5px solid #c8c4bc}
.spec-select{flex:1;padding:8px 12px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:8px;font-size:13px;color:#1e2a35;font-family:inherit}
.spec-select:focus{outline:none;border-color:#3d6080}
.btn-affecter{padding:8px 16px;background:#3d6080;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap}
.btn-affecter:hover{background:#2f4f6a}
.btn-affecter:disabled{opacity:0.5;cursor:not-allowed}
.edit-form{display:flex;flex-direction:column;gap:10px}
.edit-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.field-block-sm{display:flex;flex-direction:column;gap:4px}
.fl-sm{font-size:12px;font-weight:600;color:#4a5a6a}
.fi-sm{padding:7px 10px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:7px;font-size:13px;color:#1e2a35;font-family:inherit;width:100%}
.fi-sm:focus{outline:none;border-color:#3d6080}
.edit-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:4px}
.btn-outline-sm{padding:6px 14px;background:transparent;border:1.5px solid #c8c4bc;border-radius:8px;font-size:12.5px;color:#4a5a6a;cursor:pointer;font-family:inherit}
.btn-save-sm{padding:6px 14px;background:#3d6080;color:#fff;border:none;border-radius:8px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:999}
.confirm-modal{background:#ddd9d1;border-radius:16px;padding:32px;max-width:400px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.2)}
.confirm-icon{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.warn-icon{background:rgba(245,166,35,0.15);color:#d98e1a}
.confirm-modal h4{font-size:17px;font-weight:700;color:#1e2a35;margin-bottom:8px}
.confirm-modal p{font-size:13.5px;color:#4a5a6a;line-height:1.6;margin-bottom:22px}
.confirm-btns{display:flex;gap:10px;justify-content:center}
.btn-outline{padding:9px 18px;background:transparent;border:1.5px solid #c8c4bc;border-radius:9px;font-size:13.5px;color:#4a5a6a;cursor:pointer;font-family:inherit}
.btn-outline:hover{border-color:#3d6080;color:#3d6080}
.btn-danger{padding:9px 18px;background:#c0392b;color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit}
.btn-danger:hover{background:#a93226}
.modal-fade-enter-active{transition:opacity 0.25s}.modal-fade-leave-active{transition:opacity 0.2s}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0}
</style>