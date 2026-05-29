<template>
  <div class="cf-root">

    <!-- ── Page header ─────────────────────────────────────── -->
    <div class="cf-page-header">
      <div class="cf-page-header__left">
        <button class="cf-back-btn" @click="$emit('navigate','voeux-liste')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Retour
        </button>
        <div>
          <h2 class="vld-page-title">
            {{ formulaireAModifier ? 'Modifier le formulaire' : 'Créer un formulaire de vœux' }}
          </h2>
          <p class="vld-page-sub">
            {{ formulaireAModifier ? 'Modifiez les paramètres de votre formulaire' : 'Configurez une nouvelle campagne de collecte de vœux' }}
          </p>
        </div>
      </div>
      <!-- Progress indicator -->
      <div class="cf-progress">
        <div class="cf-progress__step" :class="{ done: form.titre && form.dateLimite }">
          <div class="cf-progress__dot">1</div>
          <span>Paramètres</span>
        </div>
        <div class="cf-progress__line"></div>
        <div class="cf-progress__step" :class="{ done: form.champs.length > 0 }">
          <div class="cf-progress__dot">2</div>
          <span>Champs</span>
        </div>
        <div class="cf-progress__line"></div>
        <div class="cf-progress__step" :class="{ done: form.enseignants.length > 0 }">
          <div class="cf-progress__dot">3</div>
          <span>Enseignants</span>
        </div>
      </div>
    </div>

    <div class="cf-grid">

      <!-- ── Panel 1: Paramètres ─────────────────────────── -->
      <div class="cf-panel">
        <div class="cf-panel__head cf-panel__head--blue">
          <div class="cf-panel__head-icon">⚙️</div>
          <div>
            <div class="cf-panel__head-title">Paramètres</div>
            <div class="cf-panel__head-sub">Titre, date, capacité</div>
          </div>
        </div>
        <div class="cf-panel__body">

          <!-- Titre -->
          <div class="cf-field">
            <label class="cf-label">
              Titre du formulaire
              <span class="cf-required">*</span>
            </label>
            <input
              v-model="form.titre"
              class="cf-input"
              :class="{ 'cf-input--error': errors.titre }"
              placeholder="Ex : Vœux d'encadrement 2025-2026"
              @input="errors.titre = ''"
            />
            <div v-if="errors.titre" class="cf-error-msg">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ errors.titre }}
            </div>
          </div>

          <!-- Date limite -->
          <div class="cf-field">
            <label class="cf-label">
              Date limite
              <span class="cf-required">*</span>
            </label>
            <input
              type="date"
              v-model="form.dateLimite"
              :min="today"
              class="cf-input"
              :class="{ 'cf-input--error': errors.dateLimite }"
              @change="errors.dateLimite = ''"
            />
            <div v-if="errors.dateLimite" class="cf-error-msg">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ errors.dateLimite }}
            </div>
          </div>

          <!-- Nb max étudiants -->
          <div class="cf-field">
            <label class="cf-label">Capacité max par encadrant</label>
            <div class="cf-stepper">
              <button type="button" class="cf-stepper__btn"
                      @click="form.nbMax = Math.max(1, form.nbMax - 1)"
                      :disabled="form.nbMax <= 1">−</button>
              <div class="cf-stepper__display">
                <span class="cf-stepper__val">{{ form.nbMax }}</span>
                <span class="cf-stepper__unit">étudiant{{ form.nbMax > 1 ? 's' : '' }}</span>
              </div>
              <button type="button" class="cf-stepper__btn"
                      @click="form.nbMax = Math.min(10, form.nbMax + 1)"
                      :disabled="form.nbMax >= 10">+</button>
            </div>
            <div class="cf-stepper__track">
              <div class="cf-stepper__fill" :style="{ width: (form.nbMax / 10 * 100) + '%' }"></div>
            </div>
          </div>

          <!-- Message intro -->
          <div class="cf-field">
            <label class="cf-label">Message d'introduction</label>
            <textarea
              v-model="form.message"
              class="cf-input cf-textarea"
              rows="4"
              placeholder="Instructions et contexte pour les enseignants…"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- ── Panel 2: Champs ─────────────────────────────── -->
      <div class="cf-panel">
        <div class="cf-panel__head cf-panel__head--gold">
          <div class="cf-panel__head-icon">📝</div>
          <div>
            <div class="cf-panel__head-title">Champs du formulaire</div>
            <div class="cf-panel__head-sub">{{ form.champs.length }} sélectionné(s)</div>
          </div>
        </div>
        <div class="cf-panel__body">
          <div class="d-flex flex-column gap-2">
            <div
              v-for="c in champsDisponibles" :key="c.id"
              class="cf-champ-row"
              :class="{ 'cf-champ-row--checked': form.champs.includes(c.id) }"
              @click="toggleChamp(c.id)"
            >
              <!-- Custom checkbox (no v-model — toggleChamp is the single source of truth) -->
              <div class="cf-checkbox" :class="{ 'cf-checkbox--on': form.champs.includes(c.id) }" @click.stop>
                <svg v-if="form.champs.includes(c.id)" xmlns="http://www.w3.org/2000/svg" width="11" height="11"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <!-- Content — @click.stop prevents double-toggle with parent div -->
              <div class="cf-champ-icon">{{ c.icon }}</div>
              <div class="cf-champ-label" @click.stop="toggleChamp(c.id)">
                <span class="cf-champ-name">{{ c.nom }}</span>
                <span class="cf-champ-desc">{{ c.desc }}</span>
              </div>
              <!-- Required badge -->
              <div v-if="c.required" class="cf-required-badge">Requis</div>
            </div>
          </div>
          <div v-if="errors.champs" class="cf-error-msg mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ errors.champs }}
          </div>
        </div>
      </div>

      <!-- ── Panel 3: Enseignants (full width) ──────────── -->
      <div class="cf-panel cf-panel--full">
        <div class="cf-panel__head cf-panel__head--teal">
          <div class="cf-panel__head-icon">👩‍🏫</div>
          <div class="flex-grow-1">
            <div class="cf-panel__head-title">Enseignants destinataires</div>
            <div class="cf-panel__head-sub">
              {{ form.enseignants.length ? form.enseignants.length + ' sélectionné(s)' : 'Tous les enseignants (par défaut)' }}
            </div>
          </div>
          <button class="cf-select-btn" @click="showSelector = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Sélectionner
          </button>
        </div>
        <div class="cf-panel__body">
          <div v-if="!form.enseignants.length" class="cf-empty-ens">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Le formulaire sera envoyé à <strong>tous les enseignants</strong> de votre spécialité.</span>
          </div>
          <div v-else class="cf-tags-grid">
            <div v-for="id in form.enseignants" :key="id" class="cf-teacher-tag">
              <div class="cf-teacher-tag__av">{{ initiales(id) }}</div>
              <span class="cf-teacher-tag__name">{{ nomEnseignant(id) }}</span>
              <button class="cf-teacher-tag__rm"
                      @click="form.enseignants = form.enseignants.filter(x => x !== id)"
                      title="Retirer">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="3">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Bottom actions ──────────────────────────────────── -->
    <div class="cf-footer">
      <button class="cf-btn cf-btn--ghost" @click="showAnnulerModal = true">Annuler</button>
      <button class="cf-btn cf-btn--primary" @click="sauvegarder" :disabled="saving">
        <span v-if="saving" class="vld-spinner-sm"></span>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
        </svg>
        {{ saving ? 'Enregistrement…' : (formulaireAModifier ? 'Enregistrer les modifications' : 'Créer le formulaire') }}
      </button>
    </div>

    <!-- ── Selector Modal ──────────────────────────────────── -->
    <Transition name="modal-fade">
      <div v-if="showSelector" class="modal-overlay" @click.self="showSelector = false">
        <div class="cf-modal">
          <div class="cf-modal__head cf-modal__head--teal">
            <div class="cf-modal__icon">👩‍🏫</div>
            <h3 class="cf-modal__title">Sélectionner les enseignants</h3>
            <button class="cf-modal__close" @click="showSelector = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="cf-modal__body">
            <!-- Search -->
            <div class="cf-search">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" class="cf-search__icon">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input v-model="searchEns" class="cf-search__input" placeholder="Rechercher un enseignant…"/>
              <button v-if="searchEns" class="cf-search__clear" @click="searchEns = ''">×</button>
            </div>
            <!-- Count bar -->
            <div class="cf-sel-bar">
              <span class="cf-sel-bar__count">
                <strong>{{ form.enseignants.length }}</strong> sélectionné(s)
              </span>
              <button class="cf-sel-bar__link" @click="form.enseignants = enseignantsFiltres.map(e=>e.id)">Tout</button>
              <span style="color:var(--vld-border-strong)">·</span>
              <button class="cf-sel-bar__link" @click="form.enseignants = []">Aucun</button>
            </div>
            <!-- List -->
            <div class="cf-ens-list">
              <div
                v-for="e in enseignantsFiltres" :key="e.id"
                class="cf-ens-row"
                :class="{ 'cf-ens-row--sel': form.enseignants.includes(e.id) }"
                @click="toggleEns(e.id)"
              >
                <div class="cf-ens-av" :class="form.enseignants.includes(e.id) ? 'cf-ens-av--sel' : ''">
                  {{ ((e.prenom||'')[0] + (e.nom||'')[0]).toUpperCase() }}
                </div>
                <div class="cf-ens-info">
                  <div class="cf-ens-name">{{ e.prenom }} {{ e.nom }}</div>
                  <div class="cf-ens-email">{{ e.email }}</div>
                </div>
                <div v-if="form.enseignants.includes(e.id)" class="cf-ens-check">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>
              <div v-if="!enseignantsFiltres.length" class="cf-ens-empty">Aucun résultat</div>
            </div>
          </div>
          <div class="cf-modal__footer">
            <button class="cf-btn cf-btn--ghost" @click="showSelector = false">Annuler</button>
            <button class="cf-btn cf-btn--primary" @click="showSelector = false">
              Confirmer ({{ form.enseignants.length }})
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Cancel confirmation modal ─────────────────────── -->
    <Transition name="modal-fade">
      <div v-if="showAnnulerModal" class="modal-overlay" @click.self="showAnnulerModal = false">
        <div class="cf-modal cf-modal--sm">
          <div class="cf-modal__head cf-modal__head--danger">
            <div class="cf-modal__icon">⚠️</div>
            <h3 class="cf-modal__title">Annuler les modifications ?</h3>
          </div>
          <div class="cf-modal__body">
            <p style="color:var(--vld-text);font-size:14px;margin:0">
              Toutes les données saisies seront perdues. Cette action est irréversible.
            </p>
          </div>
          <div class="cf-modal__footer">
            <button class="cf-btn cf-btn--ghost" @click="showAnnulerModal = false">Continuer l'édition</button>
            <button class="cf-btn cf-btn--danger" @click="$emit('navigate','voeux-liste')">Quitter sans sauvegarder</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import api from '@/services/api.js'
import { schedulePendingToast } from '@/composables/useToast.js'
export default {
  name: 'CreerFormulaire',
  props: { formulaireAModifier: { type: Object, default: null } },
  emits: ['form-cree', 'navigate'],
  data() {
    return {
      showSelector: false, showAnnulerModal: false, saving: false,
      enseignants: [], searchEns: '',
      form: { titre: '', dateLimite: '', nbMax: 3, message: '', champs: ['disponibilite','nbEtudiants'], enseignants: [] },
      errors: {},
      champsDisponibles: [
        { id:'disponibilite', icon:'📋', nom:'Disponibilité',       desc:'Oui / Partielle / Non',          required: true },
        { id:'nbEtudiants',   icon:'👥', nom:'Nb étudiants / PFE',  desc:"Capacité d'encadrement" },
        { id:'themes',        icon:'💡', nom:'Thèmes',              desc:'Sujets de PFE préférés' },
        { id:'cotutelle',     icon:'🤝', nom:'Co-tutelle',          desc:'Acceptation co-tutelle' },
        { id:'commentaire',   icon:'💬', nom:'Commentaire libre',   desc:'Contraintes particulières' },
      ],
    }
  },
  computed: {
    today() { return new Date().toISOString().split('T')[0] },
    enseignantsFiltres() {
      if (!this.searchEns) return this.enseignants
      const q = this.searchEns.toLowerCase()
      return this.enseignants.filter(e => `${e.prenom} ${e.nom} ${e.email}`.toLowerCase().includes(q))
    },
  },
  async created() {
    await this.loadEnseignants()
    this.populateForm(this.formulaireAModifier)
  },
  watch: {
    formulaireAModifier(f) {
      this.populateForm(f)
    },
  },
  methods: {
    populateForm(f) {
      if (f) {
        this.form = {
          titre:       f.titre            || '',
          dateLimite:  f.date_limite      || '',
          nbMax:       f.nb_max_etudiants || 3,
          message:     f.message          || '',
          champs:      f.champs           || [],
          enseignants: (f.enseignants     || []).map(e => e.id || e),
        }
      } else {
        this.form = { titre: '', dateLimite: '', nbMax: 3, message: '', champs: ['disponibilite','nbEtudiants'], enseignants: [] }
      }
      this.errors = {}
    },
    async loadEnseignants() { try { const r = await api.get('/formulaires-voeux/enseignants-de-ma-specialite'); this.enseignants = r.data||[] } catch(e) { console.error(e) } },
    nomEnseignant(id) { const e = this.enseignants.find(x => x.id === id); return e ? `${e.prenom} ${e.nom}` : '#'+id },
    initiales(id) { const e = this.enseignants.find(x => x.id === id); return e ? ((e.prenom||'')[0]+(e.nom||'')[0]).toUpperCase() : '?' },
    toggleChamp(id) {
      const i = this.form.champs.indexOf(id)
      if (i >= 0) {
        this.form.champs.splice(i, 1)
      } else {
        this.form.champs.push(id)
        this.errors.champs = ''
      }
    },
    toggleEns(id) { const i = this.form.enseignants.indexOf(id); if (i>=0) this.form.enseignants.splice(i,1); else this.form.enseignants.push(id) },
    validate() {
      this.errors = {}
      if (!this.form.titre.trim()) this.errors.titre = 'Titre obligatoire'
      if (!this.form.dateLimite) this.errors.dateLimite = 'Date limite obligatoire'
      if (!this.form.champs.length) this.errors.champs = 'Sélectionnez au moins un champ'
      return !Object.keys(this.errors).length
    },
    async sauvegarder() {
      if (!this.validate()) return; this.saving = true
      try {
        const pl = { titre: this.form.titre, date_limite: this.form.dateLimite, nb_max_etudiants: this.form.nbMax, message: this.form.message, champs: this.form.champs, enseignants: this.form.enseignants }
        if (this.formulaireAModifier) { await api.put(`/formulaires-voeux/${this.formulaireAModifier.id}`, pl) } else { await api.post('/formulaires-voeux', pl) }
        const msg = this.formulaireAModifier ? `« ${this.form.titre} » modifié avec succès` : `« ${this.form.titre} » créé avec succès`
        schedulePendingToast(msg, 'ok')
        this.$emit('form-cree')
      } catch(e) { console.error(e) } finally { this.saving = false }
    },
  },
}
</script>

<style scoped>
/* ── Root / layout ────────────────────────────────────────── */
.cf-root { display: flex; flex-direction: column; gap: 24px; }

/* ── Page header ──────────────────────────────────────────── */
.cf-page-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 20px; flex-wrap: wrap;
}
.cf-page-header__left { display: flex; align-items: flex-start; gap: 14px; }

.cf-back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 13px; border-radius: var(--vld-r-md);
  background: var(--vld-surface-alt); border: 1.5px solid var(--vld-border);
  color: var(--vld-text-muted); font-size: 12.5px; font-weight: 600;
  font-family: var(--vld-font-body); cursor: pointer;
  transition: all var(--vld-t-base);
  white-space: nowrap; margin-top: 4px;
}
.cf-back-btn:hover { border-color: var(--vld-primary); color: var(--vld-primary); background: rgba(61,96,128,.07); }

/* ── Progress indicator ───────────────────────────────────── */
.cf-progress {
  display: flex; align-items: center; gap: 0;
}
.cf-progress__step {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 600; color: var(--vld-text-muted);
  transition: color var(--vld-t-base);
}
.cf-progress__step.done { color: var(--vld-primary); }
.cf-progress__dot {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--vld-surface-alt); border: 2px solid var(--vld-border);
  font-size: 11px; font-weight: 700; color: var(--vld-text-faint);
  transition: all var(--vld-t-base);
}
.cf-progress__step.done .cf-progress__dot {
  background: var(--vld-primary); border-color: var(--vld-primary); color: #fff;
}
.cf-progress__line {
  width: 36px; height: 2px; background: var(--vld-border); margin: 0 4px;
}

/* ── Panel grid ───────────────────────────────────────────── */
.cf-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
@media (max-width: 768px) { .cf-grid { grid-template-columns: 1fr; } }

.cf-panel {
  border-radius: var(--vld-r-xl);
  overflow: hidden;
  box-shadow: var(--vld-shadow-card);
  background: var(--vld-surface);
  border: 1.5px solid var(--vld-border);
  display: flex; flex-direction: column;
}
.cf-panel--full { grid-column: 1 / -1; }

/* Panel coloured headers */
.cf-panel__head {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 20px;
}
.cf-panel__head--blue    { background: linear-gradient(135deg, #2a3f52 0%, #1a2d3e 100%); }
.cf-panel__head--gold    { background: linear-gradient(135deg, #5a3e00 0%, #3a2700 100%); }
.cf-panel__head--teal    { background: linear-gradient(135deg, #0a3d35 0%, #062b25 100%); }

.cf-panel__head-icon { font-size: 26px; flex-shrink: 0; }
.cf-panel__head-title {
  font-family: var(--vld-font-display); font-size: 15px; font-weight: 700;
  color: #fff; line-height: 1.2;
}
.cf-panel__head-sub { font-size: 12px; color: rgba(255,255,255,.55); margin-top: 2px; }

.cf-panel__body { padding: 20px; display: flex; flex-direction: column; gap: 18px; flex: 1; }

/* ── Form elements ────────────────────────────────────────── */
.cf-field { display: flex; flex-direction: column; gap: 7px; }

.cf-label {
  font-size: 12.5px; font-weight: 700; color: var(--vld-text);
  letter-spacing: .02em; text-transform: uppercase;
}
.cf-required { color: var(--vld-danger); margin-left: 3px; }

.cf-input {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid var(--vld-border); border-radius: var(--vld-r-md);
  background: var(--vld-surface-alt); color: var(--vld-text-strong);
  font-size: 14px; font-family: var(--vld-font-body);
  transition: border-color var(--vld-t-base), box-shadow var(--vld-t-base);
  outline: none;
}
.cf-input:focus {
  border-color: var(--vld-primary);
  box-shadow: 0 0 0 3px rgba(61,96,128,.12);
}
.cf-input--error { border-color: var(--vld-danger); }
.cf-input--error:focus { box-shadow: 0 0 0 3px rgba(217,64,64,.12); }
.cf-textarea { resize: vertical; min-height: 90px; }

.cf-error-msg {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 600; color: var(--vld-danger);
}

/* ── Stepper ──────────────────────────────────────────────── */
.cf-stepper {
  display: inline-flex; align-items: center; gap: 0;
  border: 1.5px solid var(--vld-border); border-radius: var(--vld-r-lg);
  overflow: hidden; background: var(--vld-surface-alt);
  box-shadow: var(--vld-shadow-xs);
}
.cf-stepper__btn {
  width: 42px; height: 46px; border: none; background: transparent;
  color: var(--vld-text-muted); font-size: 20px; font-weight: 600;
  cursor: pointer; font-family: var(--vld-font-body); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: background var(--vld-t-base), color var(--vld-t-base);
}
.cf-stepper__btn:hover:not(:disabled) { background: rgba(61,96,128,.12); color: var(--vld-primary); }
.cf-stepper__btn:disabled { opacity: .3; cursor: not-allowed; }
.cf-stepper__display {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-width: 72px; padding: 0 10px;
  border-left: 1px solid var(--vld-border); border-right: 1px solid var(--vld-border);
  height: 46px;
}
.cf-stepper__val {
  font-family: var(--vld-font-display); font-size: 22px; font-weight: 700;
  color: var(--vld-text-strong); line-height: 1; letter-spacing: -.02em;
}
.cf-stepper__unit { font-size: 10px; color: var(--vld-text-faint); font-weight: 500; margin-top: 1px; }

.cf-stepper__track {
  height: 4px; background: var(--vld-border); border-radius: var(--vld-r-full); overflow: hidden; margin-top: 10px;
}
.cf-stepper__fill {
  height: 100%; background: linear-gradient(90deg, var(--vld-primary), var(--vld-primary-light));
  border-radius: var(--vld-r-full); transition: width var(--vld-t-base) var(--vld-ease);
}

/* ── Champ rows ───────────────────────────────────────────── */
.cf-champ-row {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 15px; border-radius: var(--vld-r-lg);
  background: var(--vld-surface-alt); border: 1.5px solid var(--vld-border);
  cursor: pointer; transition: all var(--vld-t-base) var(--vld-ease);
  position: relative; overflow: hidden;
}
.cf-champ-row::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: var(--vld-gold); opacity: 0; transition: opacity var(--vld-t-base);
}
.cf-champ-row:hover { border-color: var(--vld-gold); background: var(--vld-surface-raised); }
.cf-champ-row:hover::before { opacity: .5; }
.cf-champ-row--checked { border-color: var(--vld-gold); background: rgba(245,197,24,.06); }
.cf-champ-row--checked::before { opacity: 1; }

.cf-checkbox {
  width: 20px; height: 20px; border-radius: var(--vld-r-sm); flex-shrink: 0;
  background: var(--vld-surface-raised); border: 1.5px solid var(--vld-border);
  display: flex; align-items: center; justify-content: center;
  transition: all var(--vld-t-base);
}
.cf-checkbox--on { background: var(--vld-gold); border-color: var(--vld-gold); color: #fff; }
.cf-champ-icon { font-size: 18px; flex-shrink: 0; }
.cf-champ-label { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.cf-champ-name  { font-size: 13.5px; font-weight: 700; color: var(--vld-text-strong); }
.cf-champ-desc  { font-size: 12px; color: var(--vld-text-muted); }

.cf-required-badge {
  padding: 2px 8px; border-radius: var(--vld-r-full);
  background: rgba(245,197,24,.18); border: 1px solid rgba(245,197,24,.30);
  font-size: 10.5px; font-weight: 700; color: var(--vld-gold-dark);
  white-space: nowrap;
}

/* ── Teacher tags grid ────────────────────────────────────── */
.cf-empty-ens {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px; border-radius: var(--vld-r-lg);
  background: var(--vld-surface-alt); border: 1.5px dashed var(--vld-border);
  font-size: 13.5px; color: var(--vld-text-muted);
}
.cf-empty-ens svg { color: var(--vld-text-faint); flex-shrink: 0; }

.cf-tags-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.cf-teacher-tag {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 7px 10px 7px 8px; border-radius: var(--vld-r-lg);
  background: rgba(61,96,128,.10); border: 1.5px solid rgba(61,96,128,.20);
  font-size: 13px; font-weight: 600; color: var(--vld-primary);
  animation: fadeUpCard .18s var(--vld-ease);
  transition: all var(--vld-t-base);
}
.cf-teacher-tag:hover { background: rgba(61,96,128,.16); border-color: rgba(61,96,128,.32); }
.cf-teacher-tag__av {
  width: 26px; height: 26px; border-radius: var(--vld-r-sm);
  background: var(--vld-primary); color: #fff; font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cf-teacher-tag__name { color: var(--vld-text-strong); }
.cf-teacher-tag__rm {
  display: flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%; border: none;
  background: transparent; color: var(--vld-text-muted); cursor: pointer;
  transition: all var(--vld-t-fast);
}
.cf-teacher-tag__rm:hover { background: rgba(217,64,64,.15); color: var(--vld-danger); }

/* ── Select button in panel header ───────────────────────── */
.cf-select-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 7px 14px; border-radius: var(--vld-r-md); border: none;
  background: rgba(255,255,255,.15); color: #fff; font-size: 12.5px;
  font-weight: 700; font-family: var(--vld-font-body); cursor: pointer; white-space: nowrap;
  transition: all var(--vld-t-base);
}
.cf-select-btn:hover { background: rgba(255,255,255,.26); }

/* ── Footer actions ───────────────────────────────────────── */
.cf-footer {
  display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap;
}
.cf-btn {
  display: inline-flex; align-items: center; gap: 8px; padding: 11px 22px;
  border-radius: var(--vld-r-lg); font-size: 13.5px; font-weight: 700;
  font-family: var(--vld-font-body); cursor: pointer;
  transition: all var(--vld-t-base) var(--vld-ease);
}
.cf-btn--ghost {
  background: var(--vld-surface-alt); border: 1.5px solid var(--vld-border); color: var(--vld-text-muted);
}
.cf-btn--ghost:hover { border-color: var(--vld-border-strong); color: var(--vld-text); }
.cf-btn--primary {
  background: linear-gradient(135deg, var(--vld-primary) 0%, var(--vld-primary-dark) 100%);
  border: none; color: #fff;
  box-shadow: 0 4px 14px rgba(61,96,128,.30);
}
.cf-btn--primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(61,96,128,.38); }
.cf-btn--primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.cf-btn--danger {
  background: var(--vld-danger); border: none; color: #fff;
  box-shadow: 0 4px 14px rgba(217,64,64,.28);
}
.cf-btn--danger:hover { background: #b43030; transform: translateY(-1px); }

/* ── Modal ────────────────────────────────────────────────── */
.cf-modal {
  width: 100%; max-width: 560px; max-height: 90vh;
  border-radius: var(--vld-r-2xl); overflow: hidden;
  background: var(--vld-surface); box-shadow: var(--vld-shadow-modal);
  display: flex; flex-direction: column;
}
.cf-modal--sm { max-width: 420px; }

.cf-modal__head {
  padding: 20px 22px; display: flex; align-items: center; gap: 12px; flex-shrink: 0;
}
.cf-modal__head--teal   { background: linear-gradient(135deg, #0a3d35, #062b25); }
.cf-modal__head--danger { background: linear-gradient(135deg, #5c1010, #3d0a0a); }

.cf-modal__icon  { font-size: 28px; flex-shrink: 0; }
.cf-modal__title {
  font-family: var(--vld-font-display); font-size: 16px; font-weight: 700;
  color: #fff; margin: 0; flex: 1;
}
.cf-modal__close {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: var(--vld-r-sm);
  border: none; background: rgba(255,255,255,.14); color: rgba(255,255,255,.8);
  cursor: pointer; flex-shrink: 0; transition: all var(--vld-t-base);
}
.cf-modal__close:hover { background: rgba(255,255,255,.26); color: #fff; }

.cf-modal__body {
  flex: 1; overflow-y: auto; padding: 18px 22px;
  display: flex; flex-direction: column; gap: 14px;
}
.cf-modal__footer {
  display: flex; justify-content: flex-end; gap: 10px; padding: 14px 22px;
  border-top: 1px solid var(--vld-border); background: var(--vld-surface-alt); flex-shrink: 0;
}

/* ── Search input ─────────────────────────────────────────── */
.cf-search {
  position: relative; display: flex; align-items: center;
}
.cf-search__icon {
  position: absolute; left: 12px; color: var(--vld-text-muted); pointer-events: none;
}
.cf-search__input {
  width: 100%; padding: 10px 36px; border: 1.5px solid var(--vld-border);
  border-radius: var(--vld-r-lg); background: var(--vld-surface-alt);
  color: var(--vld-text-strong); font-size: 13.5px; font-family: var(--vld-font-body);
  outline: none; transition: border-color var(--vld-t-base);
}
.cf-search__input:focus { border-color: var(--vld-primary); }
.cf-search__clear {
  position: absolute; right: 10px; border: none; background: transparent;
  color: var(--vld-text-muted); cursor: pointer; font-size: 16px; padding: 0;
  transition: color var(--vld-t-base);
}
.cf-search__clear:hover { color: var(--vld-danger); }

/* ── Sel bar ──────────────────────────────────────────────── */
.cf-sel-bar {
  display: flex; align-items: center; gap: 8px;
  font-size: 12.5px; color: var(--vld-text-muted);
}
.cf-sel-bar__count { flex: 1; }
.cf-sel-bar__link {
  background: none; border: none; padding: 0; cursor: pointer;
  font-size: 12.5px; font-weight: 700; color: var(--vld-primary);
  font-family: var(--vld-font-body); transition: color var(--vld-t-base);
}
.cf-sel-bar__link:hover { color: var(--vld-primary-dark); }

/* ── Enseignant list rows ─────────────────────────────────── */
.cf-ens-list {
  display: flex; flex-direction: column; gap: 4px;
  max-height: 340px; overflow-y: auto;
  padding-right: 2px;
  scrollbar-width: thin; scrollbar-color: var(--vld-border) transparent;
}
.cf-ens-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: var(--vld-r-lg); cursor: pointer;
  background: var(--vld-surface-alt); border: 1.5px solid transparent;
  transition: all var(--vld-t-base);
}
.cf-ens-row:hover { border-color: var(--vld-border); background: var(--vld-surface-raised); }
.cf-ens-row--sel  { border-color: var(--vld-primary); background: rgba(61,96,128,.07); }

.cf-ens-av {
  width: 38px; height: 38px; border-radius: var(--vld-r-md); flex-shrink: 0;
  background: var(--vld-primary); color: #fff; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  transition: background var(--vld-t-base);
}
.cf-ens-av--sel { background: var(--vld-primary-dark); }

.cf-ens-info { flex: 1; }
.cf-ens-name  { font-size: 13.5px; font-weight: 600; color: var(--vld-text-strong); }
.cf-ens-email { font-size: 12px; color: var(--vld-text-muted); margin-top: 1px; }

.cf-ens-check {
  width: 22px; height: 22px; border-radius: var(--vld-r-sm); flex-shrink: 0;
  background: var(--vld-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 6px rgba(61,96,128,.28);
  animation: fadeUpCard .14s var(--vld-ease);
}

.cf-ens-empty { text-align: center; color: var(--vld-text-muted); font-size: 13px; padding: 24px 0; }
</style>