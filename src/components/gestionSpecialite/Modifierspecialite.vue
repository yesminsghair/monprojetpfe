<template>
  <div class="modal-overlay" @click.self="$emit('fermer')">
    <div class="modal-box" role="dialog" aria-modal="true">

      <div class="modal-hd">
        <div class="modal-hd__left">
          <div class="modal-hd-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <span class="modal-title">{{ editing ? 'Modifier la spécialité' : 'Nouvelle spécialité' }}</span>
        </div>
        <button class="modal-close" @click="$emit('fermer')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="modal-bd">
        <div class="grid-2">
          <div class="field">
            <label class="lbl">Nom <span class="req">*</span></label>
            <input v-model="f.nom" class="inp" :class="{ 'inp--err': errs.nom }"
              placeholder="Ex : Génie Logiciel" />
            <p class="err" v-if="errs.nom">{{ errs.nom }}</p>
          </div>
          <div class="field">
            <label class="lbl">Code <span class="req">*</span></label>
            <input v-model="f.code" class="inp" :class="{ 'inp--err': errs.code }"
              placeholder="Ex : GL" style="font-family:'DM Mono',monospace;text-transform:uppercase" />
            <p class="err" v-if="errs.code">{{ errs.code }}</p>
          </div>
        </div>

        <div class="field">
          <label class="lbl">Description</label>
          <textarea v-model="f.description" class="textarea" rows="3"
            placeholder="Description de la spécialité…"></textarea>
        </div>

        <div class="grid-2">
          <div class="field">
            <label class="lbl">Date de création</label>
            <input v-model="f.date_creation" class="inp" type="text"
              placeholder="JJ/MM/AAAA" />
            <p class="hint">Format : JJ/MM/AAAA</p>
          </div>
          <!-- FIXED: was f.capacite (wrong name) → now f.capacite_max -->
          <div class="field">
            <label class="lbl">Capacité max étudiants</label>
            <input
              v-model.number="f.capacite_max"
              class="inp"
              :class="{ 'inp--err': errs.capacite_max }"
              type="number"
              min="1"
              max="9999"
              placeholder="30"
            />
            <p class="err" v-if="errs.capacite_max">{{ errs.capacite_max }}</p>
          </div>
        </div>
      </div>

      <!-- Erreur API globale (inline dans le formulaire) -->
      <div v-if="errs._global" class="err-global">{{ errs._global }}</div>

      <div class="modal-ft">
        <button class="btn-primary" :disabled="saving" @click="save">
          <div v-if="saving" class="spin-sm"></div>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ editing ? 'Enregistrer les modifications' : 'Créer la spécialité' }}
        </button>
        <button class="btn-ghost" @click="$emit('fermer')">Annuler</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'ModifierSpecialite',
  props: { specialite: { type: Object, default: null } }, 
  emits: ['creee', 'modifiee', 'fermer', 'annuler'],

  data() {
    return {
      f: { nom: '', code: '', description: '', date_creation: '', capacite_max: null },
      errs: {},
      saving: false,
    }
  },

  computed: {
    editing() { return !!this.specialite }
  },

  watch: {
    specialite: {
      immediate: true,
      handler(s) {
        if (s) {
          console.log('[ModifierSpecialite] specialite prop:', JSON.stringify(s))
          let dc = ''
          if (s.date_creation) {
            const parts = s.date_creation.split('-') // "YYYY-MM-DD" → ['YYYY','MM','DD']
            if (parts.length === 3) {
              dc = `${parts[2]}/${parts[1]}/${parts[0]}` // → "DD/MM/YYYY"
            } else {
              dc = s.date_creation // fallback if already in another format
            }
          }
          this.f = {
            nom:          s.nom          || '',
            code:         s.code         || '',
            description:  s.description  || '',
            date_creation: dc,
            capacite_max: s.capacite_max != null ? Number(s.capacite_max) : null,
          }
        }
      }
    },
  },

  methods: {
    validate() {
      this.errs = {}
      if (!this.f.nom.trim())  this.errs.nom  = 'Le nom est obligatoire.'
      if (!this.f.code.trim()) this.errs.code = 'Le code est obligatoire.'
      if (this.f.capacite_max != null && this.f.capacite_max < 1)
        this.errs.capacite_max = 'Capacité invalide (min. 1).'
      return !Object.keys(this.errs).length
    },

    async save() {
      if (!this.validate()) return
      this.saving = true

      // FIXED: added capacite_max to the payload (was missing before)
      const payload = {
        nom:           this.f.nom.trim(),
        code:          this.f.code.trim().toUpperCase(),
        description:   this.f.description || null,
        date_creation: this.f.date_creation || null,
        capacite_max:  this.f.capacite_max,
      }

      try {
        if (this.editing) {
          const r = await api.put(`/specialites/${this.specialite.id}`, payload)
          this.$emit('modifiee', r.data)
          this.$emit('fermer')
        } else {
          const r = await api.post('/specialites', payload)
          this.$emit('creee', r.data)
          this.$emit('fermer')
        }
      } catch (e) {
        const v = e.response?.data?.errors || {}
        if (v.nom)          this.errs.nom          = v.nom[0]
        if (v.code)         this.errs.code         = v.code[0]
        if (v.capacite_max) this.errs.capacite_max = v.capacite_max[0]
        if (!Object.keys(v).length)
          this.errs._global = e.response?.data?.message || 'Une erreur est survenue.'
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
  background: #f5f7fa; border-radius: 18px; width: 100%; max-width: 520px;
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
  background: rgba(46,125,107,.12); color: #2e7d6b;
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

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.lbl { font-size: 12.5px; font-weight: 600; color: #3a4a5a; }
.req { color: #e0882a; }
.inp {
  width: 100%; padding: 10px 13px;
  background: #fff; border: 1.5px solid #d8e0ec; border-radius: 9px;
  font-size: 13.5px; font-family: 'Sora', sans-serif; color: #1a2332;
  outline: none; transition: border-color .2s, box-shadow .2s;
}
.inp:focus { border-color: #2e7d6b; box-shadow: 0 0 0 3px rgba(46,125,107,.12); }
.inp--err { border-color: #c0392b; }
.inp::placeholder { color: #b0bcc8; }
/* remove number spinners */
.inp[type=number]::-webkit-inner-spin-button,
.inp[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
.inp[type=number] { -moz-appearance: textfield; }
.textarea {
  width: 100%; padding: 10px 13px;
  background: #fff; border: 1.5px solid #d8e0ec; border-radius: 9px;
  font-size: 13.5px; font-family: 'Sora', sans-serif; color: #1a2332;
  outline: none; resize: vertical; transition: border-color .2s, box-shadow .2s;
}
.textarea:focus { border-color: #2e7d6b; box-shadow: 0 0 0 3px rgba(46,125,107,.12); }
.textarea::placeholder { color: #b0bcc8; }
.err  { font-size: 12px; color: #c0392b; }
.hint { font-size: 11.5px; color: #9aabb8; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #2e7d6b, #3aaa8e);
  color: #fff; font-size: 13.5px; font-weight: 600;
  font-family: 'Sora', sans-serif; cursor: pointer;
  box-shadow: 0 3px 12px rgba(46,125,107,.3); transition: all .18s;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(46,125,107,.4); }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
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

/* Erreur API globale */
.err-global {
  margin: 0 22px 0; padding: 9px 13px;
  background: #fdf0ef; color: #c0392b; border: 1px solid #f0c0bb;
  border-radius: 8px; font-size: 12.5px; font-weight: 500;
}
</style>