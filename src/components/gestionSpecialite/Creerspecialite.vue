<template>
  <div class="page-wrap">

    <!-- Header -->
    <div class="page-header">
      <div class="page-header__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h1 class="page-title">{{ editing ? 'Modifier la spécialité' : 'Créer une spécialité' }}</h1>
      <p class="page-sub">{{ editing ? 'Modifiez les informations de la spécialité' : 'Renseignez les informations de la nouvelle spécialité' }}</p>
    </div>

    <!-- Toast -->
    <transition name="toast-pop">
      <div v-if="toast.visible" class="toast" :class="toast.type">
        <svg v-if="toast.type === 'toast-ok'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ toast.message }}
      </div>
    </transition>

    <!-- Form card -->
    <div class="form-card">

      <!-- Nom -->
      <div class="section-label">
        <span class="section-num">1</span>
        Informations générales
      </div>

      <div class="field">
        <label class="lbl">Nom <span class="req">*</span></label>
        <div class="inp-wrap" :class="{ 'inp-wrap--err': errs.nom }">
          <svg class="inp-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          </svg>
          <input v-model="f.nom" class="inp" placeholder="Ex : Génie Logiciel" />
        </div>
        <p class="err-msg" v-if="errs.nom">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ errs.nom }}
        </p>
      </div>

      <!-- Code -->
      <div class="field">
        <label class="lbl">Code <span class="req">*</span></label>
        <div class="inp-wrap" :class="{ 'inp-wrap--err': errs.code }">
          <svg class="inp-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
          <input v-model="f.code" class="inp" placeholder="Ex : GL" />
        </div>
        <p class="err-msg" v-if="errs.code">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ errs.code }}
        </p>
      </div>

      <!-- Description -->
      <div class="field">
        <label class="lbl">Description <span class="opt">(optionnel)</span></label>
        <textarea v-model="f.description" class="text-area" rows="3"
          placeholder="Décrivez brièvement la spécialité…"></textarea>
      </div>

      <!-- Date création -->
      <div class="field">
        <label class="lbl">Date de création <span class="opt">(optionnel)</span></label>
        <div class="inp-wrap">
          <svg class="inp-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <input v-model="f.date_creation" class="inp" placeholder="JJ/MM/AAAA" />
        </div>
      </div>

      <!-- Capacité max -->
      <div class="divider">
        <span class="divider-text">Paramètres de capacité</span>
      </div>

      <div class="section-label">
        <span class="section-num">2</span>
        Capacité d'accueil
      </div>

      <div class="field">
        <label class="lbl">Capacité max étudiants <span class="req">*</span></label>
        <div class="inp-wrap" :class="{ 'inp-wrap--err': errs.capacite_max }">
          <svg class="inp-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <input
            v-model.number="f.capacite_max"
            type="number"
            min="1"
            max="9999"
            class="inp"
            placeholder="Ex : 30"
          />
        </div>
        <p class="err-msg" v-if="errs.capacite_max">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ errs.capacite_max }}
        </p>
        <p class="hint">Nombre maximal d'étudiants pouvant être affectés à cette spécialité.</p>
      </div>

      <!-- Actions -->
      <div class="actions-row">
        <button class="btn-cancel" @click="$emit('annuler')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Annuler
        </button>
        <button class="btn-confirm" @click="save" :disabled="saving">
          <div v-if="saving" class="spin-sm"></div>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {{ editing ? 'Enregistrer les modifications' : 'Créer la spécialité' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'//import l'instance d'axios crée 

export default {
  name: 'CreerSpecialite', 
  props: { specialite: { type: Object, default: null } }, //la propriete recus du parent , doit etre un objet javascript
  emits: ['creee', 'modifiee', 'annuler'],//declaration des evenenments que le composant envoi au parant

  data() {//la fonction qui retourne l'etat initial reactif du composant 
    return {
      //un objet de form f et ces champs
      f: { nom: '', code: '', description: '', date_creation: '', capacite_max: 30 },
      errs: {},//objet vide de depart pour stocker les messages d'err
      saving: false,
      toast: { visible: false, message: '', type: 'toast-ok', _timer: null },
    }
  },

  computed: {//si la specialité existe retourne true: on le modifie sinon pn peut créer une nouvelle
    editing() { return !!this.specialite },
  },

  watch: {//utiliser surveille la prop specialité pour le preremplissage 
    specialite: {
      immediate: true,//excution emadiatment au montage du composant
      handler(s) {
        if (s) this.f = { //si existe mode de modification si non mode creation (vide)
          nom: s.nom || '',
          code: s.code || '',
          description: s.description || '',
          date_creation: s.date_creation || '',
          capacite_max: s.capacite_max ?? 30,//si la capacité est null ou underfined elle prend la valeur 30
        }
      },
    },
  },

  methods: {
    validate() {
      this.errs = {}//vide les erreur precedente 
      //trim pour verifier si le champ contient que les espaces
      if (!this.f.nom.trim())  this.errs.nom  = 'Ce champ est obligatoire.'
      if (!this.f.code.trim()) this.errs.code = 'Ce champ est obligatoire.'
      if (!this.f.capacite_max || this.f.capacite_max < 1)
        this.errs.capacite_max = 'Veuillez saisir une capacité valide (≥ 1).'
      return !Object.keys(this.errs).length//obj d'erreur retourne true si acune erreur
    },

    showToast(message, type = 'toast-ok') {//par defaut
      clearTimeout(this.toast._timer)//annule le timer precedent
      this.toast = { visible: true, message, type, _timer: null }
      this.toast._timer = setTimeout(() => { this.toast.visible = false }, 3500)//3.5
    },

    async save() {//coeur du comp
      if (!this.validate()) return //validation si echoué on areete
      this.saving = true//spinner et desactive boutton
      try {
        if (this.editing) {//si on ai dans le mode d'edition
          const r = await api.put(`/specialites/${this.specialite.id}`, this.f)//on envoi une req put de remplessage avec l'id de specialité et le contenu de formulaire objet f
          this.$emit('modifiee', r.data)//emet l'evenement
          this.showToast(`Spécialité « ${r.data.nom} » modifiée avec succès.`, 'toast-ok')// affiche le toast de modif avec succes
        } else {//mode creation , requete post , objet f
          const r = await api.post('/specialites', this.f)
          //msg de creation avec success
          const msg = `Spécialité « ${r.data.nom} » créée avec succès.`
          this.showToast(msg, 'toast-ok')//toast de creation
          setTimeout(() => {
            this.$emit('creee', { data: r.data, toastMessage: msg })
          }, 900)//attendre 0.9 secondes et emet levenement creee
        }
      } catch (e) {//cas d'erreur on recupere l'erreur du backend 
        const v = e.response?.data?.errors || {}
        if (v.nom)          this.errs.nom          = v.nom[0]//premier message d'erreur..
        if (v.code)         this.errs.code         = v.code[0]
        if (v.capacite_max) this.errs.capacite_max = v.capacite_max[0]
        this.showToast(e.response?.data?.message || 'Une erreur est survenue.', 'toast-err')
      } finally {
        this.saving = false//désactive le spinner dans les 2 cas 
      }
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.page-wrap { font-family: 'Sora', sans-serif; color: #1a2332; position: relative; max-width: 620px; margin: 0 auto; }

/* Header */
.page-header {
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; margin-bottom: 28px;
}
.page-header__icon {
  width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(135deg, #f5a623, #3d7aba);
  display: flex; align-items: center; justify-content: center;
  color: #fff; box-shadow: 0 4px 14px rgba(44,95,138,.28);
}
.page-title  { font-size: 20px; font-weight: 700; letter-spacing: -.4px; }
.page-sub    { font-size: 13px; color: #6b7a8d; margin-top: 3px; }

/* Toast */
.toast {
  position: fixed; top: 22px; right: 22px; z-index: 9999;
  display: flex; align-items: center; gap: 9px;
  padding: 12px 18px; border-radius: 11px;
  font-size: 13.5px; font-weight: 600; font-family: 'Sora', sans-serif;
  box-shadow: 0 6px 24px rgba(0,0,0,.14);
}
.toast-ok  { background: #e6f5ee; color: #1e7a4e; border: 1px solid #b8dcc8; }
.toast-err { background: #fdf0ef; color: #c0392b; border: 1px solid #f0c0bb; }
.toast-pop-enter-active, .toast-pop-leave-active { transition: all .28s ease; }
.toast-pop-enter-from, .toast-pop-leave-to { opacity: 0; transform: translateY(-10px) scale(.96); }

/* Form card */
.form-card {
  background: #fff; border-radius: 16px; border: 1px solid #e5eaf0;
  box-shadow: 0 2px 16px rgba(0,0,0,.06);
  padding: 24px; max-width: 560px;
  margin: 0 auto;
}

/* Section label */
.section-label {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; font-weight: 600; color: #3a4a5a;
  margin-bottom: 14px;
}
.section-num {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  background: #2c5f8a; color: #fff; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

/* Divider */
.divider {
  display: flex; align-items: center; gap: 12px;
  margin: 22px 0 18px;
}
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e5eaf0; }
.divider-text { font-size: 11.5px; color: #f5a623; font-weight: 600; white-space: nowrap; }

/* Fields */
.field { margin-bottom: 16px; }
.lbl   { display: block; font-size: 12.5px; font-weight: 600; color: #3a4a5a; margin-bottom: 7px; }
.req   { color: #c0392b; margin-left: 2px; }
.opt   { font-weight: 400; color: #9aabb8; font-size: 12px; margin-left: 4px; }
.hint  { font-size: 11.5px; color: #9aabb8; margin-top: 5px; }

.inp-wrap {
  display: flex; align-items: center; position: relative;
  background: #f4f7fb; border: 1.5px solid #d8e2ee; border-radius: 10px;
  transition: border-color .2s, box-shadow .2s;
}
.inp-wrap:focus-within { border-color: #f5a623; box-shadow: 0 0 0 3px rgba(44,95,138,.1); background: #fff; }
.inp-wrap--err { border-color: #c0392b; }
.inp-icon { position: absolute; left: 13px; color: #8a9ab0; pointer-events: none; flex-shrink: 0; }
.inp {
  width: 100%; padding: 11px 14px 11px 36px;
  background: transparent; border: none; outline: none;
  font-size: 13.5px; font-family: 'Sora', sans-serif; color: #1a2332;
}
.inp::placeholder { color: #b0bcc8; }
/* remove number spinners */
.inp[type=number]::-webkit-inner-spin-button,
.inp[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
.inp[type=number] { -moz-appearance: textfield; }

.text-area {
  width: 100%; padding: 10px 13px; resize: vertical;
  background: #f4f7fb; border: 1.5px solid #d8e2ee; border-radius: 10px;
  font-size: 13.5px; font-family: 'Sora', sans-serif; color: #1a2332;
  outline: none; transition: border-color .2s, box-shadow .2s;
}
.text-area:focus { border-color: #f5a623; box-shadow: 0 0 0 3px rgba(44,95,138,.1); background: #fff; }
.text-area::placeholder { color: #b0bcc8; }

.err-msg {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #c0392b; margin-top: 6px;
}

/* Actions */
.actions-row {
  display: flex; gap: 10px; justify-content: flex-end;
  margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5eaf0;
}
.btn-cancel {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 18px; border-radius: 10px;
  border: 1.5px solid #d8e2ee; background: #fff;
  color: #5a6a7a; font-size: 13.5px; font-weight: 600;
  font-family: 'Sora', sans-serif; cursor: pointer; transition: all .18s;
}
.btn-cancel:hover { border-color: #c0392b; color: #c0392b; }

.btn-confirm {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 22px; border: none; border-radius: 11px;
  background: linear-gradient(135deg, #f5a623, #3d7aba);
  color: #fff; font-size: 13.5px; font-weight: 700;
  font-family: 'Sora', sans-serif; cursor: pointer;
  box-shadow: 0 4px 16px rgba(44,95,138,.28); transition: all .18s;
}
.btn-confirm:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(44,95,138,.38); }
.btn-confirm:disabled { opacity: .6; cursor: not-allowed; }

.spin-sm {
  width: 13px; height: 13px; border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>