<template>
  <Teleport to="body">
    <Transition name="mfm-fade">
      <div v-if="modelValue" class="mfm-overlay" @click.self="onCancel">
        <div class="mfm-modal">

          <!-- ── Header ──────────────────────────────────────── -->
          <div class="mfm-header">
            <div class="mfm-header__icon">✏️</div>
            <div class="mfm-header__text">
              <div class="mfm-header__title">Modifier le formulaire</div>
              <div class="mfm-header__sub">{{ formulaire?.titre }}</div>
            </div>
            <button class="mfm-close" @click="onCancel">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- ── Body ───────────────────────────────────────── -->
          <div class="mfm-body">

            <!-- Titre -->
            <div class="mfm-field">
              <label class="mfm-label">Titre du formulaire <span class="mfm-required">*</span></label>
              <input v-model="form.titre" class="mfm-input" :class="{'mfm-input--error': errors.titre}"
                     placeholder="Ex : Vœux d'encadrement 2025-2026"
                     @input="errors.titre = ''" />
              <div v-if="errors.titre" class="mfm-error">{{ errors.titre }}</div>
            </div>

            <!-- Date limite -->
            <div class="mfm-field">
              <label class="mfm-label">Date limite <span class="mfm-required">*</span></label>
              <input type="date" v-model="form.dateLimite" :min="today"
                     class="mfm-input" :class="{'mfm-input--error': errors.dateLimite}"
                     @change="errors.dateLimite = ''" />
              <div v-if="errors.dateLimite" class="mfm-error">{{ errors.dateLimite }}</div>
            </div>

            <!-- Capacité -->
            <div class="mfm-field">
              <label class="mfm-label">Capacité max par encadrant</label>
              <div class="mfm-stepper">
                <button type="button" class="mfm-stepper__btn"
                        @click="form.nbMax = Math.max(1, form.nbMax - 1)"
                        :disabled="form.nbMax <= 1">−</button>
                <span class="mfm-stepper__val">{{ form.nbMax }} étudiant{{ form.nbMax > 1 ? 's' : '' }}</span>
                <button type="button" class="mfm-stepper__btn"
                        @click="form.nbMax = Math.min(10, form.nbMax + 1)"
                        :disabled="form.nbMax >= 10">+</button>
              </div>
            </div>

            <!-- Message -->
            <div class="mfm-field">
              <label class="mfm-label">Message d'introduction</label>
              <textarea v-model="form.message" class="mfm-input mfm-textarea" rows="3"
                        placeholder="Instructions pour les enseignants…"></textarea>
            </div>

            <!-- Champs -->
            <div class="mfm-field">
              <label class="mfm-label">Champs du formulaire</label>
              <div class="mfm-champs">
                <div v-for="c in champsDisponibles" :key="c.id"
                     class="mfm-champ" :class="{'mfm-champ--on': form.champs.includes(c.id)}"
                     @click="toggleChamp(c.id)">
                  <div class="mfm-champ__check" :class="{'mfm-champ__check--on': form.champs.includes(c.id)}">
                    <svg v-if="form.champs.includes(c.id)" xmlns="http://www.w3.org/2000/svg"
                         width="10" height="10" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span class="mfm-champ__icon">{{ c.icon }}</span>
                  <span class="mfm-champ__nom">{{ c.nom }}</span>
                </div>
              </div>
              <div v-if="errors.champs" class="mfm-error">{{ errors.champs }}</div>
            </div>

          </div>

          <!-- ── Footer ─────────────────────────────────────── -->
          <div class="mfm-footer">
            <button class="mfm-btn mfm-btn--ghost" @click="onCancel" :disabled="saving">
              Annuler
            </button>
            <button class="mfm-btn mfm-btn--primary" @click="sauvegarder" :disabled="saving">
              <span v-if="saving" class="mfm-spinner"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'ModifierFormulaireModal',
  props: {
    modelValue: { type: Boolean, default: false },
    formulaire:  { type: Object,  default: null  },
  },
  emits: ['update:modelValue', 'saved'],

  data() {
    return {
      saving: false,
      form: { titre: '', dateLimite: '', nbMax: 3, message: '', champs: [] },
      errors: {},
      champsDisponibles: [
        { id: 'disponibilite', icon: '📋', nom: 'Disponibilité'      },
        { id: 'nbEtudiants',   icon: '👥', nom: 'Nb étudiants / PFE' },
        { id: 'themes',        icon: '💡', nom: 'Thèmes'             },
        { id: 'cotutelle',     icon: '🤝', nom: 'Co-tutelle'         },
        { id: 'commentaire',   icon: '💬', nom: 'Commentaire libre'  },
      ],
    }
  },

  computed: {
    today() { return new Date().toISOString().split('T')[0] },
  },

  watch: {
    // Every time the modal opens with a new formulaire, populate the form
    formulaire: {
      immediate: true,
      handler(f) {
        if (!f) return
        this.errors = {}
        this.form = {
          titre:      f.titre             || '',
          dateLimite: (f.date_limite || '').substring(0, 10),
          nbMax:      f.nb_max_etudiants  || 3,
          message:    f.message           || '',
          champs:     Array.isArray(f.champs) ? [...f.champs] : [],
        }
      },
    },
  },

  methods: {
    toggleChamp(id) {
      const i = this.form.champs.indexOf(id)
      if (i >= 0) { this.form.champs.splice(i, 1) }
      else        { this.form.champs.push(id); this.errors.champs = '' }
    },

    validate() {
      this.errors = {}
      if (!this.form.titre.trim())  this.errors.titre     = 'Titre obligatoire'
      if (!this.form.dateLimite)    this.errors.dateLimite = 'Date limite obligatoire'
      if (!this.form.champs.length) this.errors.champs    = 'Sélectionnez au moins un champ'
      return !Object.keys(this.errors).length
    },

    async sauvegarder() {
      if (!this.validate() || this.saving) return
      this.saving = true
      try {
        await api.put(`/formulaires-voeux/${this.formulaire.id}`, {
          titre:             this.form.titre,
          date_limite:       this.form.dateLimite,
          nb_max_etudiants:  this.form.nbMax,
          message:           this.form.message,
          champs:            this.form.champs,
        })
        this.$emit('saved', this.form.titre)
        this.$emit('update:modelValue', false)
      } catch(e) {
        console.error(e)
        this.errors.titre = e.response?.data?.message || 'Erreur lors de la sauvegarde'
      } finally {
        this.saving = false
      }
    },

    onCancel() {
      if (this.saving) return
      this.$emit('update:modelValue', false)
    },
  },
}
</script>

<style scoped>
/* ── Overlay ──────────────────────────────────────────────── */
.mfm-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,.45); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}

/* ── Modal box ────────────────────────────────────────────── */
.mfm-modal {
  width: 100%; max-width: 520px; max-height: 90vh;
  background: var(--vld-surface); border-radius: var(--vld-r-2xl);
  box-shadow: var(--vld-shadow-modal);
  display: flex; flex-direction: column; overflow: hidden;
}

/* ── Header ───────────────────────────────────────────────── */
.mfm-header {
  display: flex; align-items: center; gap: 12px;
  padding: 20px 22px;
  background: linear-gradient(135deg, #0a3d62, #063050);
  flex-shrink: 0;
}
.mfm-header__icon  { font-size: 26px; flex-shrink: 0; }
.mfm-header__text  { flex: 1; }
.mfm-header__title { font-family: var(--vld-font-display); font-size: 16px; font-weight: 700; color: #fff; }
.mfm-header__sub   { font-size: 12px; color: rgba(255,255,255,.55); margin-top: 2px;
                     white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px; }
.mfm-close {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: var(--vld-r-sm); border: none; flex-shrink: 0;
  background: rgba(255,255,255,.14); color: rgba(255,255,255,.8); cursor: pointer;
  transition: background var(--vld-t-base);
}
.mfm-close:hover { background: rgba(255,255,255,.26); color: #fff; }

/* ── Body ─────────────────────────────────────────────────── */
.mfm-body {
  flex: 1; overflow-y: auto; padding: 20px 22px;
  display: flex; flex-direction: column; gap: 16px;
}

/* ── Fields ───────────────────────────────────────────────── */
.mfm-field  { display: flex; flex-direction: column; gap: 6px; }
.mfm-label  { font-size: 12.5px; font-weight: 700; color: var(--vld-text-muted); text-transform: uppercase; letter-spacing: .04em; }
.mfm-required { color: var(--vld-danger); }
.mfm-input {
  padding: 10px 13px; border: 1.5px solid var(--vld-border);
  border-radius: var(--vld-r-lg); background: var(--vld-surface-alt);
  color: var(--vld-text-strong); font-size: 13.5px; font-family: var(--vld-font-body);
  outline: none; transition: border-color var(--vld-t-base); width: 100%;
}
.mfm-input:focus          { border-color: var(--vld-primary); }
.mfm-input--error         { border-color: var(--vld-danger); }
.mfm-textarea             { resize: vertical; min-height: 80px; }
.mfm-error { font-size: 12px; color: var(--vld-danger); }

/* ── Stepper ──────────────────────────────────────────────── */
.mfm-stepper {
  display: inline-flex; align-items: center; gap: 0;
  border: 1.5px solid var(--vld-border); border-radius: var(--vld-r-lg); overflow: hidden;
  background: var(--vld-surface-alt); width: fit-content;
}
.mfm-stepper__btn {
  padding: 8px 16px; border: none; background: transparent;
  color: var(--vld-text-strong); font-size: 16px; font-weight: 700; cursor: pointer;
  transition: background var(--vld-t-base);
}
.mfm-stepper__btn:hover:not(:disabled) { background: var(--vld-surface-raised); }
.mfm-stepper__btn:disabled { color: var(--vld-text-faint); cursor: not-allowed; }
.mfm-stepper__val {
  padding: 8px 18px; font-size: 13.5px; font-weight: 600; color: var(--vld-text-strong);
  border-left: 1.5px solid var(--vld-border); border-right: 1.5px solid var(--vld-border);
  min-width: 120px; text-align: center;
}

/* ── Champs grid ──────────────────────────────────────────── */
.mfm-champs { display: flex; flex-direction: column; gap: 6px; }
.mfm-champ {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: var(--vld-r-lg); cursor: pointer;
  background: var(--vld-surface-alt); border: 1.5px solid transparent;
  transition: all var(--vld-t-base); user-select: none;
}
.mfm-champ:hover    { border-color: var(--vld-border); background: var(--vld-surface-raised); }
.mfm-champ--on      { border-color: var(--vld-primary); background: rgba(61,96,128,.07); }
.mfm-champ__check {
  width: 18px; height: 18px; border-radius: var(--vld-r-sm); flex-shrink: 0;
  border: 1.5px solid var(--vld-border); background: var(--vld-surface);
  display: flex; align-items: center; justify-content: center; transition: all var(--vld-t-base);
}
.mfm-champ__check--on { background: var(--vld-primary); border-color: var(--vld-primary); }
.mfm-champ__icon { font-size: 15px; flex-shrink: 0; }
.mfm-champ__nom  { font-size: 13px; font-weight: 600; color: var(--vld-text-strong); }

/* ── Footer ───────────────────────────────────────────────── */
.mfm-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 22px; border-top: 1px solid var(--vld-border);
  background: var(--vld-surface-alt); flex-shrink: 0;
}
.mfm-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px; border-radius: var(--vld-r-lg);
  font-size: 13.5px; font-weight: 700; font-family: var(--vld-font-body);
  cursor: pointer; transition: all var(--vld-t-base) var(--vld-ease); border: none;
}
.mfm-btn:disabled { opacity: .55; cursor: not-allowed; transform: none !important; }
.mfm-btn--ghost {
  background: var(--vld-surface-raised); border: 1.5px solid var(--vld-border); color: var(--vld-text-muted);
}
.mfm-btn--ghost:hover:not(:disabled) { border-color: var(--vld-border-strong); color: var(--vld-text); }
.mfm-btn--primary {
  background: linear-gradient(135deg, var(--vld-primary), var(--vld-primary-dark));
  color: #fff; box-shadow: 0 4px 14px rgba(61,96,128,.30);
}
.mfm-btn--primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(61,96,128,.38); }

/* ── Spinner ──────────────────────────────────────────────── */
.mfm-spinner {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  animation: mfm-spin .7s linear infinite; flex-shrink: 0;
}
@keyframes mfm-spin { to { transform: rotate(360deg); } }

/* ── Transition ───────────────────────────────────────────── */
.mfm-fade-enter-active { transition: opacity .2s ease, transform .2s ease; }
.mfm-fade-leave-active { transition: opacity .15s ease, transform .15s ease; }
.mfm-fade-enter-from   { opacity: 0; transform: scale(.96); }
.mfm-fade-leave-to     { opacity: 0; transform: scale(.96); }
</style>