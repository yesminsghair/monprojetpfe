<template>
  <div v-if="specialite" class="modal-overlay" @click.self="$emit('fermer')">
    <div class="modal-box" role="alertdialog" aria-modal="true">

      <div class="modal-hd">
        <div class="modal-hd__left">
          <div class="modal-hd-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <span class="modal-title">Supprimer la spécialité</span>
        </div>
        <button class="modal-close" @click="$emit('fermer')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="modal-bd">
        <div class="warn-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
            fill="none" stroke="#c0392b" stroke-width="1.4">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <p class="confirm-txt">
          Supprimer la spécialité <strong>{{ specialite.nom }}</strong> ?
        </p>
        <p class="confirm-sub">Cette action est irréversible. Toutes les données associées seront perdues.</p>

        <!-- Spec summary card -->
        <div class="spec-summary">
          <div class="spec-summary__row">
            <span class="spec-summary__label">Nom</span>
            <span class="spec-summary__value">{{ specialite.nom }}</span>
          </div>
          <div class="spec-summary__row">
            <span class="spec-summary__label">Code</span>
            <span class="spec-summary__value spec-summary__value--mono">{{ specialite.code }}</span>
          </div>
          <!-- ADDED: capacite_max row -->
          <div class="spec-summary__row" v-if="specialite.capacite_max != null">
            <span class="spec-summary__label">Capacité</span>
            <span class="spec-summary__value">{{ specialite.capacite_max }} étudiants</span>
          </div>
          <div class="spec-summary__row" v-if="specialite.chef_nom">
            <span class="spec-summary__label">Chef actuel</span>
            <span class="spec-summary__value spec-summary__value--warn">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ specialite.chef_nom }} — perdra son affectation
            </span>
          </div>
        </div>

        <!-- Confirm by typing -->
        <div class="field">
          <label class="lbl">Tapez <strong class="code-txt">{{ specialite.code }}</strong> pour confirmer</label>
          <input v-model="saisie" class="inp" :class="{ 'inp--ok': saisieOk }"
            :placeholder="specialite.code" />
        </div>
      </div>

      <!-- Error toast (inline, inside modal) -->
      <transition name="toast-pop">
        <div v-if="toast.visible" class="toast-banner toast-err">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ toast.message }}
        </div>
      </transition>

      <div class="modal-ft">
        <button class="btn-danger" :disabled="!saisieOk || saving" @click="confirmer">
          <div v-if="saving" class="spin-sm"></div>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
          </svg>
          Supprimer définitivement
        </button>
        <button class="btn-ghost" @click="$emit('fermer')">Annuler</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'SupprimerSpecialite',
  props: { specialite: { type: Object, default: null } },
  emits: ['supprimee', 'fermer'],

  data() {
    return {
      saisie: '',
      saving: false,
      toast: { visible: false, message: '', _timer: null },
    }
  },

  computed: {
    saisieOk() {
      return this.saisie.trim().toUpperCase() === (this.specialite?.code || '').toUpperCase()
    },
  },

  watch: {
    specialite() { this.saisie = '' },
  },

  methods: {
    async confirmer() {
      if (!this.saisieOk) return
      this.saving = true
      try {
        await api.delete(`/specialites/${this.specialite.id}`)
        this.$emit('supprimee', this.specialite.id)
        this.$emit('fermer')
      } catch (e) {
        const msg = e.response?.data?.message || 'Erreur lors de la suppression.'
        this.showToast(msg)
      } finally {
        this.saving = false
      }
    },

    showToast(message) {
      clearTimeout(this.toast._timer)
      this.toast = { visible: true, message, _timer: null }
      this.toast._timer = setTimeout(() => { this.toast.visible = false }, 4000)
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(10,20,35,.52);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
  padding: 24px; backdrop-filter: blur(4px);
}
.modal-box {
  background: #f5f7fa; border-radius: 18px; width: 100%; max-width: 440px;
  box-shadow: 0 32px 80px rgba(0,0,0,.22); overflow: hidden;
  animation: modalIn .28s cubic-bezier(.22,1,.36,1) both;
  font-family: 'Sora', sans-serif;
}
@keyframes modalIn { from { opacity:0; transform:scale(.94) translateY(14px); } to { opacity:1; transform:none; } }

.modal-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px; background: #fdf0f0; border-bottom: 1px solid #f5cccc;
}
.modal-hd__left { display: flex; align-items: center; gap: 10px; }
.modal-hd-icon {
  width: 34px; height: 34px; border-radius: 9px;
  background: rgba(192,57,43,.12); color: #c0392b;
  display: flex; align-items: center; justify-content: center;
}
.modal-title { font-size: 15px; font-weight: 700; color: #1a2332; }
.modal-close {
  background: none; border: none; color: #8a9ab0; cursor: pointer;
  display: flex; padding: 4px; border-radius: 6px; transition: color .15s;
}
.modal-close:hover { color: #1a2332; }

.modal-bd { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; }
.modal-ft { display: flex; gap: 10px; padding: 16px 22px 20px; border-top: 1px solid #dde3ec; }

.warn-center { text-align: center; }
.confirm-txt { font-size: 15px; color: #1a2332; text-align: center; line-height: 1.6; }
.confirm-sub { font-size: 12.5px; color: #7a8a9a; text-align: center; }

.spec-summary {
  background: #fff; border: 1px solid #e5eaf0; border-radius: 11px; overflow: hidden;
}
.spec-summary__row {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px;
  border-bottom: 1px solid #f0f3f7;
}
.spec-summary__row:last-child { border-bottom: none; }
.spec-summary__label {
  font-size: 11.5px; color: #9aabb8; text-transform: uppercase; letter-spacing: .5px;
  font-weight: 600; width: 80px; flex-shrink: 0;
}
.spec-summary__value { font-size: 13.5px; color: #1a2332; font-weight: 500; }
.spec-summary__value--mono { font-family: 'DM Mono', monospace; font-size: 13px; }
.spec-summary__value--warn {
  display: flex; align-items: center; gap: 5px;
  color: #c07b2c; font-size: 12.5px;
}

.field { display: flex; flex-direction: column; gap: 7px; }
.lbl { font-size: 13px; font-weight: 500; color: #3a4a5a; }
.code-txt { font-family: 'DM Mono', monospace; color: #c0392b; font-size: 13px; }
.inp {
  width: 100%; padding: 10px 13px;
  background: #fff; border: 1.5px solid #d8e0ec; border-radius: 9px;
  font-size: 14px; font-family: 'DM Mono', monospace; color: #1a2332;
  outline: none; transition: border-color .2s, box-shadow .2s; letter-spacing: .5px;
}
.inp:focus { border-color: #c0392b; box-shadow: 0 0 0 3px rgba(192,57,43,.1); }
.inp--ok { border-color: #1e7a4e; box-shadow: 0 0 0 3px rgba(30,122,78,.1); }
.inp::placeholder { color: #b0bcc8; letter-spacing: 0; }

.toast-banner {
  display: flex; align-items: center; gap: 9px;
  padding: 10px 22px; font-size: 13px; font-weight: 600;
  font-family: 'Sora', sans-serif; border-top: 1px solid transparent;
}
.toast-err { background: #fdf0ef; color: #c0392b; border-top-color: #f0c0bb; }
.toast-pop-enter-active, .toast-pop-leave-active { transition: all .25s ease; }
.toast-pop-enter-from, .toast-pop-leave-to { opacity: 0; transform: translateY(6px); }

.btn-danger {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px; border: none; border-radius: 10px;
  background: #c0392b; color: #fff; font-size: 13.5px; font-weight: 600;
  font-family: 'Sora', sans-serif; cursor: pointer;
  box-shadow: 0 3px 12px rgba(192,57,43,.25); transition: all .18s;
}
.btn-danger:hover:not(:disabled) { background: #a93226; transform: translateY(-1px); }
.btn-danger:disabled { opacity: .45; cursor: not-allowed; }
.btn-ghost {
  padding: 10px 18px; border: 1.5px solid #d0dae6; border-radius: 10px;
  background: transparent; color: #5a6a7a; font-size: 13.5px;
  font-family: 'Sora', sans-serif; cursor: pointer; transition: background .18s;
}
.btn-ghost:hover { background: #edf1f7; }
.spin-sm {
  width: 13px; height: 13px; border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>