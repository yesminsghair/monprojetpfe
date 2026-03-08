<template>
  <transition name="modal-fade">
  <div class="modal-overlay" @click.self="$emit('fermer')">
    <div class="modal-box">

      <div class="modal-header">
        <div class="modal-title-group">
          <div class="modal-icon icon-gold">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          </div>
          <h3>Affecter à une spécialité</h3>
        </div>
        <button class="modal-close" @click="$emit('fermer')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="modal-body" v-if="chef">

        <!-- Chef info -->
        <div class="chef-card">
          <div class="chef-avatar">{{ initiales }}</div>
          <div>
            <p class="chef-name">{{ chef.prenom }} {{ chef.nom }}</p>
            <p class="chef-email">{{ chef.email }}</p>
          </div>
        </div>

        <!-- US 14 - 2.a : Déjà affecté -->
        <div class="alert-info" v-if="chef.specialiteId">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Ce chef est déjà affecté à <strong>{{ chef.specialiteNom }}</strong>. Choisir une nouvelle spécialité remplacera l'affectation actuelle.
        </div>

        <!-- US 14 - étape 5 : Sélectionner spécialité -->
        <div class="field-block">
          <label class="lbl">Spécialité <span class="req">*</span></label>
          <div class="select-wrap">
            <select v-model="specialiteChoisie" :class="{ 'input-err': errSpec }">
              <option value="">-- Sélectionner une spécialité --</option>
              <option v-for="sp in specialites" :key="sp.id" :value="sp.id">
                {{ sp.code }} — {{ sp.nom }}
                {{ sp.id === chef.specialiteId ? '(actuelle)' : '' }}
              </option>
            </select>
            <svg class="select-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <p class="err" v-if="errSpec">{{ errSpec }}</p>
        </div>

        <!-- US 14 - 7.a : Conflit de chef -->
        <div class="alert-warn" v-if="conflitChef">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>Cette spécialité a déjà un chef affecté (<strong>{{ conflitChef.prenom }} {{ conflitChef.nom }}</strong>). Confirmer remplacera son affectation.</span>
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn-gold" @click="confirmer">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Confirmer l'affectation
        </button>
        <!-- US 14 - 6.a : Annuler -->
        <button class="btn-outline" @click="$emit('fermer')">Annuler</button>
      </div>

    </div>
  </div>
  </transition>
</template>

<script>
export default {
  name: 'AffecterChef',
  props: {
    chef:        { type: Object, default: null },
    specialites: { type: Array,  default: () => [] },
    chefs:       { type: Array,  default: () => [] },
  },
  emits: ['fermer', 'affecte'],
  data() {
    return {
      specialiteChoisie: '',
      errSpec: '',
    }
  },
  computed: {
    initiales() {
      if (!this.chef) return ''
      return ((this.chef.prenom || '')[0] + (this.chef.nom || '')[0]).toUpperCase()
    },
    // US 14 - 7.a
    conflitChef() {
      if (!this.specialiteChoisie) return null
      return this.chefs.find(c => c.specialiteId === this.specialiteChoisie && c.id !== this.chef?.id) || null
    },
  },
  watch: {
    chef() { this.specialiteChoisie = ''; this.errSpec = '' },
  },
  methods: {
    confirmer() {
      // US 14 - 5.a
      if (!this.specialiteChoisie) { this.errSpec = 'Veuillez sélectionner une spécialité.'; return }
      this.errSpec = ''
      const sp = this.specialites.find(s => s.id === this.specialiteChoisie)
      this.$emit('affecte', {
        chefId:        this.chef.id,
        specialiteId:  this.specialiteChoisie,
        specialiteNom: sp ? sp.nom  : '',
        specialiteCode:sp ? sp.code : '',
        conflitChefId: this.conflitChef ? this.conflitChef.id : null,
      })
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.modal-overlay { position: fixed; inset: 0; background: rgba(13,31,53,0.52); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; backdrop-filter: blur(3px); }
.modal-box { background: #ddd9d1; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 24px 60px rgba(0,0,0,0.28); animation: modalIn 0.28s cubic-bezier(0.22,1,0.36,1) both; font-family: 'Source Sans 3', sans-serif; overflow: hidden; }
@keyframes modalIn { from { opacity:0; transform: scale(0.94) translateY(14px); } to { opacity:1; transform: none; } }

.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid #c8c4bc; background: #d5d1c9; }
.modal-title-group { display: flex; align-items: center; gap: 12px; }
.modal-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
.icon-gold { background: rgba(245,166,35,0.15); color: #d98e1a; }
.modal-header h3 { font-family: 'Merriweather', serif; font-size: 16px; font-weight: 700; color: #1e2a35; }
.modal-close { background: none; border: none; color: #8a9aaa; cursor: pointer; display: flex; padding: 4px; border-radius: 6px; transition: color 0.15s, background 0.15s; width: auto; box-shadow: none; }
.modal-close:hover { color: #1e2a35; background: rgba(0,0,0,0.07); box-shadow: none; transform: none; }

.modal-body { padding: 22px 24px; }
.modal-footer { display: flex; gap: 10px; padding: 16px 24px 20px; border-top: 1px solid #c8c4bc; }

.chef-card { display: flex; align-items: center; gap: 14px; padding: 14px; background: rgba(61,96,128,0.08); border-radius: 10px; margin-bottom: 18px; border: 1px solid rgba(61,96,128,0.12); }
.chef-avatar { width: 44px; height: 44px; border-radius: 50%; background: #3d6080; color: #fff; font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.chef-name  { font-weight: 700; color: #1e2a35; font-size: 14.5px; }
.chef-email { font-size: 12.5px; color: #8a9aaa; margin-top: 2px; }

.alert-info, .alert-warn {
  display: flex; align-items: flex-start; gap: 9px;
  border-radius: 9px; padding: 11px 14px;
  font-size: 13px; margin-bottom: 16px;
}
.alert-info { background: rgba(61,96,128,0.08); border: 1px solid rgba(61,96,128,0.18); color: #2f4f6a; }
.alert-warn { background: #fff3cd; border: 1px solid rgba(255,193,7,0.5); color: #856404; }
.alert-info svg, .alert-warn svg { flex-shrink: 0; margin-top: 1px; }

.field-block { margin-bottom: 8px; }
.lbl { display: block; font-size: 13.5px; font-weight: 600; color: #1e2a35; margin-bottom: 7px; }
.req { color: #f5a623; }

.select-wrap { position: relative; }
.select-wrap select { width: 100%; padding: 11px 36px 11px 15px; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 10px; font-size: 14px; font-family: 'Source Sans 3', sans-serif; color: #1e2a35; outline: none; appearance: none; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; }
.select-wrap select:focus { border-color: #3d6080; box-shadow: 0 0 0 3px rgba(61,96,128,0.13); }
.select-wrap select.input-err { border-color: #c0392b; background: #f8f0ee; }
.select-icon { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #8a9aaa; }

.err { font-size: 12px; color: #c0392b; margin-top: 5px; display: block; }

.btn-gold { display: inline-flex; align-items: center; gap: 7px; padding: 11px 22px; border: none; border-radius: 10px; background: #f5a623; color: #fff; font-size: 14px; font-weight: 600; font-family: 'Source Sans 3', sans-serif; cursor: pointer; transition: background 0.18s, transform 0.15s; box-shadow: 0 2px 10px rgba(245,166,35,0.26); }
.btn-gold:hover { background: #d98e1a; transform: translateY(-1px); }
.btn-outline { padding: 11px 20px; border: 1.5px solid #c8c4bc; border-radius: 10px; background: transparent; color: #4a5a6a; font-size: 14px; font-family: 'Source Sans 3', sans-serif; cursor: pointer; transition: background 0.18s; }
.btn-outline:hover { background: rgba(0,0,0,0.05); }

.modal-fade-enter-active { transition: opacity 0.25s ease; }
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>