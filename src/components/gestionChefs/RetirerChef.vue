<template>
  <transition name="modal-fade">
  <div class="modal-overlay" @click.self="$emit('fermer')">
    <div class="modal-box">

      <div class="modal-header">
        <div class="modal-title-group">
          <div class="modal-icon icon-red">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          </div>
          <h3>Retirer du poste</h3>
        </div>
        <button class="modal-close" @click="$emit('fermer')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="modal-body" v-if="chef">
        <div class="confirm-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 24 24"
            fill="none" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p class="confirm-text">
          Retirer <strong>{{ chef.prenom }} {{ chef.nom }}</strong> de la spécialité
          <!-- specialiteNom comes from ChefController::format() -->
          <strong>{{ chef.specialiteNom || '—' }}</strong> ?
        </p>
        <p class="confirm-sub">Le compte utilisateur restera actif mais sans rôle de chef.</p>

        <div class="field-block">
          <label class="lbl">Motif du retrait <span class="opt">(optionnel)</span></label>
          <textarea v-model="motif" rows="2"
            placeholder="Ex : Fin de mandat, mutation, démission..."></textarea>
        </div>

        <label class="check-row">
          <input type="checkbox" v-model="supprimerCompte" class="native-check"/>
          <span :class="{ 'lbl-danger': supprimerCompte }">
            Supprimer également le compte utilisateur
          </span>
        </label>

        <div class="alert-danger" v-if="supprimerCompte">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Cette action supprimera également le compte utilisateur. Action irréversible.
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-danger" :disabled="saving" @click="confirmer">
          <span v-if="saving" class="vld-spinner-sm" style="width:13px;height:13px;margin-right:6px"></span>
          {{ supprimerCompte ? 'Retirer et supprimer' : 'Confirmer le retrait' }}
        </button>
        <button class="btn-outline" @click="$emit('fermer')">Annuler</button>
      </div>

    </div>
  </div>
  </transition>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'RetirerChef',
  props: {
    chef: { type: Object, default: null },
  },
  emits: ['fermer', 'retire'],

  data() {
    return {
      motif:           '',
      supprimerCompte: false,
      saving:          false,
    }
  },

  watch: {
    chef() { this.motif = ''; this.supprimerCompte = false },
  },

  methods: {
    async confirmer() {
      this.saving = true
      try {
        // POST /api/chefs/{id}/retirer  (ChefController::retirer)
        // Controller reads: $request->supprimerCompte
        // On supprimerCompte=true it returns { deleted: true } and does NOT delete the row
        // (actual account deletion should be handled separately if needed)
        await api.post(`/chefs/${this.chef.id}/retirer`, {
          supprimerCompte: this.supprimerCompte,
          motif:           this.motif.trim(),
        })
        this.$emit('retire', {
          chefId:          this.chef.id,
          motif:           this.motif.trim(),
          supprimerCompte: this.supprimerCompte,
          dateRetrait:     new Date().toLocaleDateString('fr-FR'),
        })
        this.$emit('fermer')
      } catch (e) {
        console.error(e)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.modal-overlay { position: fixed; inset: 0; background: rgba(13,31,53,0.52); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; backdrop-filter: blur(3px); }
.modal-box { background: #ddd9d1; border-radius: 16px; width: 100%; max-width: 440px; box-shadow: 0 24px 60px rgba(0,0,0,0.28); animation: modalIn 0.28s cubic-bezier(0.22,1,0.36,1) both; font-family: 'Source Sans 3', sans-serif; overflow: hidden; }
@keyframes modalIn { from { opacity:0; transform: scale(0.94) translateY(14px); } to { opacity:1; transform: none; } }

.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid #c8c4bc; background: #d5d1c9; }
.modal-title-group { display: flex; align-items: center; gap: 12px; }
.modal-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
.icon-red { background: rgba(192,57,43,0.12); color: #c0392b; }
.modal-header h3 { font-family: 'Merriweather', serif; font-size: 16px; font-weight: 700; color: #1e2a35; }
.modal-close { background: none; border: none; color: #8a9aaa; cursor: pointer; display: flex; padding: 4px; border-radius: 6px; transition: color 0.15s; width: auto; box-shadow: none; }
.modal-close:hover { color: #1e2a35; box-shadow: none; transform: none; }

.modal-body { padding: 24px; }
.modal-footer { display: flex; gap: 10px; padding: 16px 24px 20px; border-top: 1px solid #c8c4bc; }

.confirm-icon { text-align: center; margin-bottom: 14px; }
.confirm-text { font-size: 15px; color: #1e2a35; text-align: center; line-height: 1.65; margin-bottom: 6px; }
.confirm-sub  { font-size: 12.5px; color: #8a9aaa; text-align: center; margin-bottom: 20px; }

.field-block { margin-bottom: 14px; }
.lbl { font-size: 13.5px; font-weight: 600; color: #1e2a35; display: block; margin-bottom: 7px; }
.opt { font-weight: 400; color: #8a9aaa; font-size: 12px; margin-left: 4px; }

textarea { width: 100%; padding: 10px 14px; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 10px; font-size: 13.5px; font-family: 'Source Sans 3', sans-serif; color: #1e2a35; outline: none; resize: vertical; transition: border-color 0.2s; }
textarea:focus { border-color: #3d6080; box-shadow: 0 0 0 3px rgba(61,96,128,0.13); }
textarea::placeholder { color: #aaa49c; }

.check-row { display: flex; align-items: center; gap: 10px; cursor: pointer; margin-bottom: 10px; font-size: 13.5px; color: #4a5a6a; }
.native-check { width: 16px; height: 16px; accent-color: #c0392b; cursor: pointer; flex-shrink: 0; }
.lbl-danger { color: #c0392b; font-weight: 600; }

.alert-danger { display: flex; align-items: flex-start; gap: 8px; background: #f8d7da; border: 1px solid rgba(220,53,69,0.35); border-radius: 9px; padding: 11px 14px; font-size: 12.5px; color: #721c24; margin-top: 4px; }
.alert-danger svg { flex-shrink: 0; margin-top: 1px; }

.btn-danger { padding: 11px 22px; border: none; border-radius: 10px; background: #c0392b; color: #fff; font-size: 14px; font-weight: 600; font-family: 'Source Sans 3', sans-serif; cursor: pointer; transition: background 0.18s, transform 0.15s; display: inline-flex; align-items: center; }
.btn-danger:hover:not(:disabled) { background: #a93226; transform: translateY(-1px); }
.btn-danger:disabled { opacity: .65; cursor: not-allowed; }
.btn-outline { padding: 11px 20px; border: 1.5px solid #c8c4bc; border-radius: 10px; background: transparent; color: #4a5a6a; font-size: 14px; font-family: 'Source Sans 3', sans-serif; cursor: pointer; transition: background 0.18s; }
.btn-outline:hover { background: rgba(0,0,0,0.05); }

.modal-fade-enter-active { transition: opacity 0.25s ease; }
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>