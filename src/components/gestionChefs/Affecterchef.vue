<template>
  <div v-if="chef" class="modal-overlay" @click.self="$emit('fermer')">
    <div class="modal-box" role="dialog" aria-modal="true">

      <!-- Header -->
      <div class="modal-hd">
        <div class="modal-hd__left">
          <div class="modal-hd-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </div>
          <span class="modal-title">Affecter à une spécialité</span>
        </div>
        <button class="modal-close" @click="$emit('fermer')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="modal-bd">

        <!-- Chef info card -->
        <div class="chef-info-card">
          <div class="chef-av" :style="{ background: avatarColor }">{{ initiales }}</div>
          <div>
            <div class="chef-full-name">{{ chef.prenom }} {{ chef.nom }}</div>
            <div class="chef-email">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {{ chef.email }}
            </div>
            <div class="chef-current-spec" v-if="chef.specialiteNom">
              Actuellement affecté à : <strong>{{ chef.specialiteNom }}</strong>
            </div>
            <div class="chef-current-spec chef-current-spec--vacant" v-else>
              Aucune spécialité affectée
            </div>
          </div>
        </div>

        <!-- Step indicator -->
        <div class="steps">
          <div class="step" :class="{ 'step--active': !confirmStep, 'step--done': confirmStep }">
            <div class="step-num">{{ confirmStep ? '✓' : '1' }}</div>
            <span>Choisir la spécialité</span>
          </div>
          <div class="step-line" :class="{ 'step-line--done': confirmStep }"></div>
          <div class="step" :class="{ 'step--active': confirmStep }">
            <div class="step-num">2</div>
            <span>Confirmer</span>
          </div>
        </div>

        <!-- Step 1: Choisir spécialité -->
        <div v-if="!confirmStep">
          <div class="field">
            <label class="lbl">Spécialité <span class="req">*</span></label>
            <div class="select-wrap">
              <select v-model="specialiteChoisie" class="sel" :class="{ 'sel--err': errSpec }">
                <option value="">— Choisir une spécialité —</option>
                <option v-for="s in specialites" :key="s.id" :value="s.id">
                  {{ s.nom }} ({{ s.code }})
                </option>
              </select>
              <svg class="sel-arrow" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <p class="err" v-if="errSpec">{{ errSpec }}</p>
          </div>

          <!-- Conflict warning (step 1 preview) -->
          <div v-if="conflitChef && specialiteChoisie" class="conflict-banner">
            <div class="conflict-banner__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <div class="conflict-banner__title">Spécialité déjà encadrée</div>
              <div class="conflict-banner__body">
                <strong>{{ conflitChef.prenom }} {{ conflitChef.nom }}</strong>
                est actuellement chef de cette spécialité. Voulez-vous le remplacer ?
              </div>
            </div>
          </div>

          <!-- Selected spec preview -->
          <div v-else-if="specialiteSelectionnee && specialiteChoisie" class="spec-preview">
            <div class="spec-preview__dot" :style="{ background: '#2c5f8a' }"></div>
            <div>
              <div class="spec-preview__name">{{ specialiteSelectionnee.nom }}</div>
              <div class="spec-preview__code">{{ specialiteSelectionnee.code }}</div>
            </div>
            <div class="spec-preview__free">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Poste libre
            </div>
          </div>
        </div>

        <!-- Step 2: Confirmation (after conflict) -->
        <div v-else>
          <div class="confirm-card">
            <div class="confirm-card__section">
              <div class="confirm-card__label">Nouveau chef</div>
              <div class="confirm-card__value">{{ chef.prenom }} {{ chef.nom }}</div>
            </div>
            <div class="confirm-card__arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
            <div class="confirm-card__section">
              <div class="confirm-card__label">Spécialité</div>
              <div class="confirm-card__value">{{ specialiteSelectionnee?.nom }}</div>
            </div>
          </div>
          <div class="confirm-replace-note" v-if="conflitChef">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <strong>{{ conflitChef.prenom }} {{ conflitChef.nom }}</strong>
            sera retiré de cette spécialité et restera encadrant.
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="modal-ft">
        <template v-if="!confirmStep">
          <button class="btn-primary" :disabled="!specialiteChoisie || saving" @click="passer">
            {{ conflitChef ? 'Continuer →' : 'Affecter' }}
            <div v-if="saving && !conflitChef" class="spin-sm"></div>
          </button>
          <button class="btn-ghost" @click="$emit('fermer')">Annuler</button>
        </template>
        <template v-else>
          <button class="btn-primary btn-primary--orange" :disabled="saving" @click="confirmer">
            <div v-if="saving" class="spin-sm"></div>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Confirmer le remplacement
          </button>
          <button class="btn-ghost" @click="confirmStep = false">← Retour</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'

const COLORS = ['#3d6080','#5b8db0','#2e7d6b','#7c5cbf','#c07b2c','#b03d5b','#3d7a80']

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
      errSpec:           '',
      saving:            false,
      confirmStep:       false,   
    }
  },

  computed: {
    initiales() {
      if (!this.chef) return ''
      return ((this.chef.prenom || '')[0] + (this.chef.nom || '')[0]).toUpperCase()
    },
    avatarColor() {
      return COLORS[(this.chef?.id || 0) % COLORS.length]
    },
    //detection si la specialité a déjà un chef 
    conflitChef() {
      if (!this.specialiteChoisie) return null
      return this.chefs.find(
        c => c.specialiteId === this.specialiteChoisie && c.id !== this.chef?.id
      ) || null
    },
    specialiteSelectionnee() {//retourne lobjet du specialité choisi 
      return this.specialites.find(s => s.id === this.specialiteChoisie) || null
    },
  },

  watch: {//surveillance : le chef change on reinitialise le formulaire , specialité change on retourne à la ére etape
    chef() { this.specialiteChoisie = ''; this.errSpec = ''; this.confirmStep = false },
    specialiteChoisie() { this.errSpec = ''; this.confirmStep = false },
  },

  methods: {//validation de selection
    passer() {
      this.errSpec = ''//vide les err perece
      if (!this.specialiteChoisie) {
        this.errSpec = 'Veuillez choisir une spécialité.'
        return
      }
      // s'ilya un conflit on retourne à l'etape de confirm
      if (this.conflitChef) {
        this.confirmStep = true
        return
      }
      //sinon on affecte
      this.confirmer()
    },

    async confirmer() {
      this.saving = true//spinner 
      try {//requete post avec id chef et id sepec
        const r = await api.post(`/chefs/${this.chef.id}/affecter`, {
          specialiteId: this.specialiteChoisie,
        })
        this.$emit('affecte', r.data)//emet even au parent
        this.$emit('fermer')//et on ferme le modal
      } catch (e) {
        this.errSpec = e.response?.data?.message || "Erreur lors de l'affectation."
        this.confirmStep = false
      } finally {
        this.saving = false
      }
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
  background: #f5f7fa; border-radius: 18px; width: 100%; max-width: 500px;
  box-shadow: 0 32px 80px rgba(0,0,0,.22); overflow: hidden;
  animation: modalIn .28s cubic-bezier(.22,1,.36,1) both;
  font-family: 'Sora', sans-serif;
}
@keyframes modalIn { from { opacity:0; transform:scale(.94) translateY(14px); } to { opacity:1; transform:none; } }

.modal-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px; background: #edf0f5; border-bottom: 1px solid #dde3ec;
}
.modal-hd__left { display: flex; align-items: center; gap: 10px; }
.modal-hd-icon {
  width: 34px; height: 34px; border-radius: 9px;
  background: rgba(44,95,138,.12); color: #2c5f8a;
  display: flex; align-items: center; justify-content: center;
}
.modal-title { font-size: 15px; font-weight: 700; color: #1a2332; }
.modal-close {
  background: none; border: none; color: #8a9ab0; cursor: pointer;
  display: flex; padding: 4px; border-radius: 6px; transition: color .15s;
}
.modal-close:hover { color: #1a2332; }

.modal-bd { padding: 20px 22px; display: flex; flex-direction: column; gap: 16px; }
.modal-ft { display: flex; gap: 10px; padding: 16px 22px 20px; border-top: 1px solid #dde3ec; }

/* Chef card */
.chef-info-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; background: #fff;
  border: 1px solid #e5eaf0; border-radius: 12px;
}
.chef-av {
  width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
  color: #fff; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  letter-spacing: .5px;
}
.chef-full-name { font-size: 14.5px; font-weight: 700; color: #1a2332; }
.chef-email {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: #7a8a9a; margin-top: 3px;
}
.chef-current-spec { font-size: 12px; color: #9aabb8; margin-top: 4px; }
.chef-current-spec--vacant { font-style: italic; }

/* Steps */
.steps {
  display: flex; align-items: center; gap: 0;
}
.step {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 500; color: #9aabb8;
}
.step--active { color: #2c5f8a; }
.step--done   { color: #1e7a4e; }
.step-num {
  width: 22px; height: 22px; border-radius: 50%; border: 2px solid currentColor;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
  transition: all .2s;
}
.step--active .step-num { background: #2c5f8a; color: #fff; border-color: #2c5f8a; }
.step--done   .step-num { background: #1e7a4e; color: #fff; border-color: #1e7a4e; }
.step-line {
  flex: 1; height: 2px; background: #dde3ec;
  margin: 0 8px; transition: background .3s;
}
.step-line--done { background: #1e7a4e; }

/* Field */
.field { display: flex; flex-direction: column; gap: 6px; }
.lbl { font-size: 12.5px; font-weight: 600; color: #3a4a5a; }
.req { color: #e0882a; }
.select-wrap { position: relative; }
.sel {
  width: 100%; padding: 10px 36px 10px 13px;
  background: #fff; border: 1.5px solid #d8e0ec;
  border-radius: 10px; font-size: 13.5px;
  font-family: 'Sora', sans-serif; color: #1a2332;
  outline: none; appearance: none; cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
}
.sel:focus { border-color: #2c5f8a; box-shadow: 0 0 0 3px rgba(44,95,138,.12); }
.sel--err { border-color: #c0392b; }
.sel-arrow {
  position: absolute; right: 11px; top: 50%;
  transform: translateY(-50%); pointer-events: none; color: #8a9ab0;
}
.err { font-size: 12px; color: #c0392b; margin-top: 4px; }

/* Conflict banner */
.conflict-banner {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 13px 15px; background: #fff8ec;
  border: 1.5px solid #f0c060; border-radius: 11px;
}
.conflict-banner__icon { color: #c07b2c; margin-top: 1px; flex-shrink: 0; }
.conflict-banner__title { font-size: 13px; font-weight: 700; color: #7a5010; margin-bottom: 4px; }
.conflict-banner__body  { font-size: 12.5px; color: #7a5820; line-height: 1.5; }

/* Spec preview */
.spec-preview {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; background: #eaf4ee;
  border: 1px solid #b8dcc8; border-radius: 10px;
}
.spec-preview__dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.spec-preview__name { font-size: 13.5px; font-weight: 600; color: #1a2332; }
.spec-preview__code { font-size: 11.5px; color: #5a8a6a; font-family: 'DM Mono', monospace; }
.spec-preview__free {
  margin-left: auto; display: flex; align-items: center; gap: 4px;
  font-size: 12px; color: #1e7a4e; font-weight: 600;
}

/* Confirm card */
.confirm-card {
  display: flex; align-items: center; gap: 12px;
  padding: 16px; background: #fff;
  border: 1px solid #e5eaf0; border-radius: 12px; margin-bottom: 12px;
}
.confirm-card__section { flex: 1; }
.confirm-card__label { font-size: 11px; color: #9aabb8; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 5px; }
.confirm-card__value { font-size: 14px; font-weight: 600; color: #1a2332; }
.confirm-card__arrow { color: #8a9ab0; flex-shrink: 0; }
.confirm-replace-note {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 11px 13px; background: #fff3e0;
  border: 1px solid #f0d090; border-radius: 9px;
  font-size: 12.5px; color: #6a4010; line-height: 1.5;
}
.confirm-replace-note svg { flex-shrink: 0; color: #c07b2c; margin-top: 1px; }

/* Buttons */
.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #2c5f8a, #3d7aba);
  color: #fff; font-size: 13.5px; font-weight: 600;
  font-family: 'Sora', sans-serif; cursor: pointer;
  box-shadow: 0 3px 12px rgba(44,95,138,.3); transition: all .18s;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(44,95,138,.4); }
.btn-primary:disabled { opacity: .55; cursor: not-allowed; }
.btn-primary--orange {
  background: linear-gradient(135deg, #c07b2c, #e09040);
  box-shadow: 0 3px 12px rgba(192,123,44,.3);
}
.btn-primary--orange:hover:not(:disabled) { box-shadow: 0 5px 18px rgba(192,123,44,.4); }
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