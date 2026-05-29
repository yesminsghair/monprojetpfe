<template>
  <div class="fv-root">

    <!-- ── No formulaire ──────────────────────────────────── -->
    <div v-if="!formulaire" class="vld-state">
      <div style="font-size:48px;margin-bottom:16px">📭</div>
      <p class="vld-state__title">Aucun formulaire disponible</p>
      <p class="vld-state__sub">Aucun formulaire de vœux n'est actuellement actif.</p>
    </div>

    <template v-else>
      <!-- Hero banner -->
      <div class="fv-hero">
        <div class="fv-hero__left">
          <div class="fv-hero__badge">Vœux d'encadrement</div>
          <h2 class="fv-hero__title">{{ formulaire.titre }}</h2>
          <p v-if="formulaire.message" class="fv-hero__msg">{{ formulaire.message }}</p>
        </div>
        <div class="fv-hero__deadline">
          <div class="fv-hero__deadline-label">Date limite</div>
          <div class="fv-hero__deadline-val">{{ formatDate(formulaire.date_limite) }}</div>
          <div v-if="isExpiringSoon(formulaire.date_limite)" class="fv-hero__expire">
            <span class="fv-expire-dot"></span>
            Expire bientôt
          </div>
        </div>
      </div>

      <!-- ── Form card ─────────────────────────────────────── -->
      <div class="fv-card">

        <!-- ── Disponibilité ──────────────────────────────── -->
        <div v-if="hasChamp('disponibilite')" class="fv-section">
          <div class="fv-section__head">
            <div class="fv-section__icon fv-section__icon--blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div>
              <div class="fv-section__title">Disponibilité <span class="fv-required">*</span></div>
              <div class="fv-section__sub">Sélectionnez votre situation pour cette année</div>
            </div>
          </div>
          <div class="fv-dispo-grid">
            <div
              v-for="opt in dispoOptions" :key="opt.val"
              class="fv-dispo-card"
              :class="[`fv-dispo-card--${opt.val}`, { 'fv-dispo-card--sel': form.disponibilite === opt.val }]"
              @click="form.disponibilite = opt.val"
            >
              <div class="fv-dispo-card__icon">{{ opt.icon }}</div>
              <div class="fv-dispo-card__body">
                <div class="fv-dispo-card__label">{{ opt.label }}</div>
                <div class="fv-dispo-card__desc">{{ opt.desc }}</div>
              </div>
              <div class="fv-dispo-card__radio" :class="{ 'fv-dispo-card__radio--on': form.disponibilite === opt.val }"></div>
            </div>
          </div>
          <div v-if="errs.disponibilite" class="fv-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ errs.disponibilite }}
          </div>
        </div>

        <!-- ── Capacité d'encadrement — two separate styled rows ── -->
        <div v-if="hasChamp('disponibilite') && hasChamp('nbEtudiants')" class="fv-divider"></div>
        <div v-if="hasChamp('nbEtudiants')" class="fv-section">
          <div class="fv-section__head">
            <div class="fv-section__icon fv-section__icon--gold">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <div class="fv-section__title">Capacité d'encadrement</div>
              <div class="fv-section__sub">Définissez vos limites pour l'année en cours</div>
            </div>
          </div>

          <!-- Single stepper card -->
          <div class="fv-cap-card">

            <div class="fv-cap-half fv-cap-half--single">
              <div class="fv-cap-half__info">
                <div class="fv-cap-half__label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Nombre de PFE souhaité
                </div>
                <div class="fv-cap-half__sub">
                  Maximum autorisé : {{ formulaire.nb_max_etudiants || 10 }} PFE
                </div>
              </div>
              <div class="fv-stepper-wrap">
                <button class="fv-stepper__btn" type="button"
                        @click="form.nbre_max_pfe = Math.max(0, form.nbre_max_pfe - 1)"
                        :disabled="form.nbre_max_pfe <= 0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                <div class="fv-stepper__display">
                  <span class="fv-stepper__val">{{ form.nbre_max_pfe }}</span>
                  <span class="fv-stepper__lbl">PFE</span>
                </div>
                <button class="fv-stepper__btn" type="button"
                        @click="form.nbre_max_pfe = Math.min(formulaire.nb_max_etudiants || 10, form.nbre_max_pfe + 1)"
                        :disabled="form.nbre_max_pfe >= (formulaire.nb_max_etudiants || 10)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </div>
            </div>

          </div>

        </div>

        <!-- ── Thèmes ─────────────────────────────────────── -->
        <div v-if="hasChamp('themes')" class="fv-divider"></div>
        <div v-if="hasChamp('themes')" class="fv-section">
          <div class="fv-section__head">
            <div class="fv-section__icon fv-section__icon--purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <div>
              <div class="fv-section__title">Thèmes / Domaines préférés</div>
              <div class="fv-section__sub">Sujets de PFE qui vous intéressent</div>
            </div>
          </div>
          <textarea
            v-model="form.themes"
            class="fv-textarea"
            rows="3"
            placeholder="Ex: Intelligence artificielle, Cybersécurité, IoT, Big Data…"
          ></textarea>
        </div>

        <!-- ── Type / Mode d'encadrement ─────────────────── -->
        <div v-if="hasChamp('encadrement')" class="fv-divider"></div>
        <div v-if="hasChamp('encadrement')" class="fv-section">
          <div class="fv-section__head">
            <div class="fv-section__icon fv-section__icon--blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <div class="fv-section__title">Mode d'encadrement</div>
              <div class="fv-section__sub">Précisez le type d'encadrement que vous proposez</div>
            </div>
          </div>
          <textarea
            v-model="form.encadrement"
            class="fv-textarea"
            rows="2"
            placeholder="Ex: Présentiel, distanciel, hybride — ou toute précision sur votre mode de suivi…"
          ></textarea>
        </div>

        <!-- ── Co-tutelle ─────────────────────────────────── -->
        <div v-if="hasChamp('cotutelle')" class="fv-divider"></div>
        <div v-if="hasChamp('cotutelle')" class="fv-section">
          <div class="fv-section__head">
            <div class="fv-section__icon fv-section__icon--orange">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <div class="fv-section__title">Co-tutelle</div>
              <div class="fv-section__sub">Encadrement en collaboration avec un autre enseignant</div>
            </div>
          </div>
          <div class="fv-radio-group">
            <label class="fv-radio-card fv-radio-card--yes" :class="{ 'fv-radio-card--sel': form.cotutelle === true }">
              <input type="radio" v-model="form.cotutelle" :value="true" style="display:none"/>
              <div class="fv-radio-card__dot" :class="{ on: form.cotutelle === true }"></div>
              <div>
                <div class="fv-radio-card__label">Acceptée</div>
                <div class="fv-radio-card__desc">Je suis disponible pour une co-tutelle</div>
              </div>
            </label>
            <label class="fv-radio-card fv-radio-card--no" :class="{ 'fv-radio-card--sel': form.cotutelle === false }">
              <input type="radio" v-model="form.cotutelle" :value="false" style="display:none"/>
              <div class="fv-radio-card__dot" :class="{ on: form.cotutelle === false }"></div>
              <div>
                <div class="fv-radio-card__label">Refusée</div>
                <div class="fv-radio-card__desc">Encadrement individuel uniquement</div>
              </div>
            </label>
          </div>
        </div>

        <!-- ── Commentaire ────────────────────────────────── -->
        <div v-if="hasChamp('commentaire')" class="fv-divider"></div>
        <div v-if="hasChamp('commentaire')" class="fv-section">
          <div class="fv-section__head">
            <div class="fv-section__icon fv-section__icon--muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <div class="fv-section__title">Commentaires libres</div>
              <div class="fv-section__sub">Contraintes ou précisions particulières</div>
            </div>
          </div>
          <textarea
            v-model="form.commentaire"
            class="fv-textarea"
            rows="3"
            placeholder="Précisez vos contraintes, disponibilités particulières, ou toute autre information utile…"
          ></textarea>
        </div>
      </div>

      <!-- ── Submit row ─────────────────────────────────────── -->
      <div class="fv-submit-row">

        <!-- Deadline banner -->
        <div class="fv-deadline-banner" :class="{ 'fv-deadline-banner--urgent': isExpiringSoon(formulaire.date_limite) }">
          <div class="fv-deadline-banner__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="fv-deadline-banner__body">
            <span class="fv-deadline-banner__label">Date limite de soumission</span>
            <span class="fv-deadline-banner__date">{{ formatDate(formulaire.date_limite) }}</span>
          </div>
          <div v-if="isExpiringSoon(formulaire.date_limite)" class="fv-deadline-banner__urgent-tag">
            <span class="fv-expire-dot"></span>
            Expire bientôt
          </div>
          <div class="fv-deadline-banner__note">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Vous pouvez modifier vos vœux jusqu'à cette date.
          </div>
        </div>

        <!-- Buttons row -->
        <div class="fv-actions">
          <button class="fv-draft-btn" @click="enregistrerBrouillon" :disabled="savingDraft || saving">
            <span v-if="savingDraft" class="vld-spinner-sm"></span>
            <svg v-else-if="savedDraft" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            {{ savingDraft ? 'Enregistrement…' : savedDraft ? 'Brouillon enregistré !' : 'Enregistrer brouillon' }}
          </button>

          <button class="fv-submit-btn" @click="soumettre" :disabled="saving || savingDraft">
            <span v-if="saving" class="vld-spinner-sm"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            {{ saving ? 'Envoi en cours…' : 'Soumettre mes vœux' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'FicheVoeux',

  props: {
    formulaire:        { type: Object,  default: null  },
    modeSoumissionOnly:{ type: Boolean, default: false },
    voeuxInitiaux:     { type: Object,  default: null  },
  },

  emits: ['soumis', 'role-changed', 'brouillon-sauvegarde'],

  data() {
    return {
      saving: false,
      savingDraft: false,
      savedDraft: false,
      errs: {},
      form: {
        disponibilite:  '',
        nbre_max_pfe:   3,
        themes:         '',
        encadrement:    '',
        cotutelle:      null,
        commentaire:    '',
      },
      dispoOptions: [
        { val: 'oui',       icon: '✅', label: 'Disponible',              desc: "J'accepte d'encadrer des PFE cette année" },
        { val: 'partielle', icon: '⚡', label: 'Partiellement disponible', desc: 'Je peux encadrer sous certaines conditions' },
        { val: 'non',       icon: '❌', label: 'Non disponible',           desc: "Je ne peux pas encadrer cette année" },
      ],
    }
  },

  async created() {
    // Default to the chef's cap when no prior answer exists
    this.form.nbre_max_pfe = this.formulaire?.nb_max_etudiants ?? 3
    if (this.voeuxInitiaux) {
      this.hydrateForm(this.voeuxInitiaux)
    }
  },

  watch: {
    voeuxInitiaux(v) {
      if (v) this.hydrateForm(v)
    },
  },

  methods: {
    hydrateForm(v) {
      const cap = this.formulaire?.nb_max_etudiants ?? 10
      this.form = {
        disponibilite:  v.disponibilite  || '',
        nbre_max_pfe:   Math.min(v.nbre_max_pfe ?? cap, cap),
        themes:         v.themes         || '',
        encadrement:    v.encadrement    || '',
        cotutelle:      v.cotutelle      ?? null,
        commentaire:    v.commentaire    || '',
      }
    },

    hasChamp(c) {
      return (this.formulaire?.champs || []).includes(c)
    },

    formatDate(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    },

    isExpiringSoon(d) {
      if (!d) return false
      const diff = (new Date(d) - new Date()) / (1000 * 60 * 60 * 24)
      return diff <= 5 && diff >= 0
    },

    validate() {
      this.errs = {}
      if (this.hasChamp('disponibilite') && !this.form.disponibilite) {
        this.errs.disponibilite = 'Veuillez indiquer votre disponibilité'
      }
      return !Object.keys(this.errs).length
    },

    async enregistrerBrouillon() {
      this.savingDraft = true
      this.savedDraft  = false
      try {
        const payload = {
          formulaire_id: this.formulaire.id,
          disponibilite: this.form.disponibilite,
          nbre_max_pfe:  this.form.nbre_max_pfe,
          themes:        this.form.themes,
          encadrement:   this.form.encadrement,
          cotutelle:     this.form.cotutelle,
          commentaire:   this.form.commentaire,
          statut:        'brouillon',
        }
        const r = await api.post('/voeux-encadrement', payload)
        this.savedDraft = true
        this.$emit('brouillon-sauvegarde', r.data.voeu ?? r.data)
        setTimeout(() => { this.savedDraft = false }, 3000)
      } catch (e) {
        console.error('Erreur sauvegarde brouillon:', e)
      } finally {
        this.savingDraft = false
      }
    },

    async soumettre() {
      if (!this.validate()) return
      this.saving = true
      try {
        const payload = {
          formulaire_id:  this.formulaire.id,
          disponibilite:  this.form.disponibilite,
          nbre_max_pfe:   this.form.nbre_max_pfe,
          themes:         this.form.themes,
          encadrement:    this.form.encadrement,
          cotutelle:      this.form.cotutelle,
          commentaire:    this.form.commentaire,
          statut:         'soumis',
        }
        const r = await api.post('/voeux-encadrement', payload)
        if (r.data.role_changed) {
          this.$emit('role-changed', r.data.new_role)
        }
        this.$emit('soumis', r.data.voeu ?? r.data)
      } catch (e) {
        console.error('Erreur soumission voeux:', e)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
/* ── Root ─────────────────────────────────────────────────── */
.fv-root { display: flex; flex-direction: column; gap: 22px; max-width: 740px; }

/* ── Hero banner ──────────────────────────────────────────── */
.fv-hero {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;
  padding: 24px 28px; border-radius: var(--vld-r-2xl);
  background: linear-gradient(135deg, #1e2f3e 0%, #243d52 50%, #1a2d3e 100%);
  box-shadow: var(--vld-shadow-card); position: relative; overflow: hidden;
  flex-wrap: wrap;
}
.fv-hero::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(245,197,24,.08) 0%, transparent 60%);
  pointer-events: none;
}
.fv-hero__left { flex: 1; min-width: 240px; }
.fv-hero__badge {
  display: inline-flex; padding: 3px 12px; border-radius: var(--vld-r-full);
  background: rgba(245,197,24,.18); border: 1px solid rgba(245,197,24,.28);
  color: var(--vld-gold); font-size: 11px; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase; margin-bottom: 10px;
}
.fv-hero__title {
  font-family: var(--vld-font-display); font-size: 20px; font-weight: 700;
  color: #fff; margin: 0 0 8px; line-height: 1.3;
}
.fv-hero__msg { font-size: 13.5px; color: rgba(255,255,255,.60); margin: 0; line-height: 1.5; }

.fv-hero__deadline {
  text-align: right; flex-shrink: 0;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
  border-radius: var(--vld-r-lg); padding: 12px 16px;
}
.fv-hero__deadline-label { font-size: 10.5px; color: rgba(255,255,255,.45); text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
.fv-hero__deadline-val   { font-family: var(--vld-font-display); font-size: 16px; font-weight: 700; color: #fff; margin-top: 4px; }
.fv-hero__expire {
  margin-top: 8px;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 999px;
  background: rgba(255, 90, 90, .15); border: 1px solid rgba(255, 90, 90, .35);
  font-size: 11px; font-weight: 700; color: #ff8888;
  letter-spacing: .03em;
}
.fv-expire-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #ff6b6b; flex-shrink: 0;
  animation: fv-pulse-dot 1.6s ease-in-out infinite;
}
@keyframes fv-pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .4; transform: scale(.75); }
}

/* ── Main card ────────────────────────────────────────────── */
.fv-card {
  border-radius: var(--vld-r-xl); background: var(--vld-surface);
  border: 1.5px solid var(--vld-border); box-shadow: var(--vld-shadow-card);
  overflow: hidden;
}

/* ── Section ──────────────────────────────────────────────── */
.fv-section { padding: 22px 24px; }
.fv-section__head {
  display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px;
}
.fv-section__icon {
  width: 40px; height: 40px; border-radius: var(--vld-r-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.fv-section__icon--blue   { background: rgba(61,96,128,.14); color: var(--vld-primary); }
.fv-section__icon--gold   { background: rgba(245,197,24,.15); color: #c9a000; }
.fv-section__icon--teal   { background: rgba(0,160,120,.12); color: #009f7a; }
.fv-section__icon--purple { background: rgba(130,80,200,.12); color: #8250c8; }
.fv-section__icon--orange { background: rgba(245,130,30,.12); color: #d07820; }
.fv-section__icon--muted  { background: var(--vld-surface-alt); color: var(--vld-text-muted); }

.fv-section__title {
  font-size: 14.5px; font-weight: 700; color: var(--vld-text-strong); line-height: 1.2;
}
.fv-section__sub { font-size: 12.5px; color: var(--vld-text-muted); margin-top: 3px; }
.fv-required { color: var(--vld-danger); }

.fv-divider { height: 1px; background: var(--vld-border); margin: 0; }

/* ── Error ────────────────────────────────────────────────── */
.fv-error {
  display: flex; align-items: center; gap: 6px;
  font-size: 12.5px; font-weight: 600; color: var(--vld-danger); margin-top: 10px;
}

/* ── Dispo cards ──────────────────────────────────────────── */
.fv-dispo-grid { display: flex; flex-direction: column; gap: 10px; }
.fv-dispo-card {
  display: flex; align-items: center; gap: 16px; padding: 15px 18px;
  border-radius: var(--vld-r-xl); border: 2px solid var(--vld-border);
  background: var(--vld-surface-alt); cursor: pointer;
  transition: all var(--vld-t-base) var(--vld-ease); position: relative; overflow: hidden;
}
.fv-dispo-card::after {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
  border-radius: 0 2px 2px 0; opacity: 0; transition: opacity var(--vld-t-base);
}
.fv-dispo-card--oui::after       { background: var(--vld-success); }
.fv-dispo-card--partielle::after { background: var(--vld-warning); }
.fv-dispo-card--non::after       { background: var(--vld-danger); }
.fv-dispo-card:hover { background: var(--vld-surface-raised); }
.fv-dispo-card:hover::after { opacity: .5; }
.fv-dispo-card--sel::after  { opacity: 1 !important; }
.fv-dispo-card--sel.fv-dispo-card--oui {
  border-color: var(--vld-success); background: rgba(30,158,96,.07);
  box-shadow: 0 2px 12px rgba(30,158,96,.12);
}
.fv-dispo-card--sel.fv-dispo-card--partielle {
  border-color: var(--vld-warning); background: rgba(224,144,32,.07);
  box-shadow: 0 2px 12px rgba(224,144,32,.12);
}
.fv-dispo-card--sel.fv-dispo-card--non {
  border-color: var(--vld-danger); background: rgba(217,64,64,.07);
  box-shadow: 0 2px 12px rgba(217,64,64,.12);
}
.fv-dispo-card__icon  { font-size: 26px; flex-shrink: 0; }
.fv-dispo-card__body  { flex: 1; }
.fv-dispo-card__label { font-size: 14.5px; font-weight: 700; color: var(--vld-text-strong); }
.fv-dispo-card__desc  { font-size: 12.5px; color: var(--vld-text-muted); margin-top: 3px; }
.fv-dispo-card__radio {
  width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--vld-border);
  flex-shrink: 0; transition: all var(--vld-t-base);
  display: flex; align-items: center; justify-content: center;
}
.fv-dispo-card__radio--on {
  border-color: var(--vld-primary); background: var(--vld-primary);
  box-shadow: 0 0 0 3px rgba(61,96,128,.18);
}
.fv-dispo-card__radio--on::after {
  content: ''; width: 8px; height: 8px; border-radius: 50%; background: #fff;
}

/* ── Capacité unified card ────────────────────────────────── */
.fv-cap-card {
  display: flex; align-items: stretch;
  border: 1.5px solid var(--vld-border); border-radius: var(--vld-r-lg);
  background: var(--vld-surface-alt); overflow: hidden;
}
.fv-cap-card__sep {
  width: 1.5px; background: var(--vld-border); flex-shrink: 0;
}
.fv-cap-half {
  flex: 1; display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 16px 20px; flex-wrap: wrap;
}
.fv-cap-half--single {
  border-left: 4px solid var(--vld-primary);
  background: linear-gradient(90deg, rgba(61,96,128,.05) 0%, transparent 60%);
}
.fv-cap-half__info { flex: 1; min-width: 120px; }
.fv-cap-half__label {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 700; color: var(--vld-text-strong); margin-bottom: 3px;
}
.fv-cap-half__sub { font-size: 11.5px; color: var(--vld-text-muted); }

/* ── Steppers ─────────────────────────────────────────────── */
.fv-stepper-wrap {
  display: flex; align-items: center;
  background: var(--vld-surface); border: 1.5px solid var(--vld-border);
  border-radius: var(--vld-r-lg); overflow: hidden; width: fit-content;
  box-shadow: var(--vld-shadow-xs);
}
.fv-stepper__btn {
  width: 42px; height: 48px; border: none; background: transparent;
  color: var(--vld-text-muted); cursor: pointer; display: flex;
  align-items: center; justify-content: center; flex-shrink: 0;
  transition: background var(--vld-t-base), color var(--vld-t-base);
}
.fv-stepper__btn:hover:not(:disabled) { background: rgba(61,96,128,.10); color: var(--vld-primary); }
.fv-stepper__btn:disabled { opacity: .3; cursor: not-allowed; }
.fv-stepper__display {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-width: 72px; padding: 0 8px; height: 48px;
  border-left: 1.5px solid var(--vld-border); border-right: 1.5px solid var(--vld-border);
}
.fv-stepper__val {
  font-family: var(--vld-font-display); font-size: 24px; font-weight: 700;
  color: var(--vld-primary); line-height: 1; letter-spacing: -.03em;
}
.fv-stepper__lbl { font-size: 10.5px; color: var(--vld-text-faint); margin-top: 2px; font-weight: 500; }

/* ── Chips ────────────────────────────────────────────────── */
.fv-chips-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.fv-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 16px; border-radius: var(--vld-r-full);
  background: var(--vld-surface-alt); border: 1.5px solid var(--vld-border);
  font-size: 13px; font-weight: 600; color: var(--vld-text-muted);
  font-family: var(--vld-font-body); cursor: pointer;
  transition: all var(--vld-t-base) var(--vld-ease);
}
.fv-chip:hover { border-color: var(--vld-primary); color: var(--vld-primary); background: rgba(61,96,128,.06); }
.fv-chip--sel {
  background: var(--vld-primary); border-color: var(--vld-primary); color: #fff;
  box-shadow: 0 3px 10px rgba(61,96,128,.28);
}
.fv-chip--sel:hover { background: var(--vld-primary-dark); border-color: var(--vld-primary-dark); }

/* ── Textarea ─────────────────────────────────────────────── */
.fv-textarea {
  width: 100%; padding: 12px 14px; border: 1.5px solid var(--vld-border);
  border-radius: var(--vld-r-lg); background: var(--vld-surface-alt);
  color: var(--vld-text-strong); font-size: 14px; font-family: var(--vld-font-body);
  resize: vertical; min-height: 90px; outline: none;
  transition: border-color var(--vld-t-base), box-shadow var(--vld-t-base);
  box-sizing: border-box;
}
.fv-textarea:focus { border-color: var(--vld-primary); box-shadow: 0 0 0 3px rgba(61,96,128,.10); }

/* ── Co-tutelle radio cards ───────────────────────────────── */
.fv-radio-group { display: flex; gap: 14px; flex-wrap: wrap; }
.fv-radio-card {
  flex: 1; min-width: 200px; display: flex; align-items: center; gap: 14px;
  padding: 14px 18px; border-radius: var(--vld-r-xl); cursor: pointer;
  background: var(--vld-surface-alt); border: 2px solid var(--vld-border);
  transition: all var(--vld-t-base) var(--vld-ease);
}
.fv-radio-card:hover { border-color: var(--vld-primary); background: rgba(61,96,128,.05); }
.fv-radio-card--sel  { border-color: var(--vld-primary); background: rgba(61,96,128,.08); box-shadow: 0 2px 10px rgba(61,96,128,.10); }
.fv-radio-card--yes.fv-radio-card--sel { border-color: var(--vld-success); background: rgba(30,158,96,.06); }
.fv-radio-card--no.fv-radio-card--sel  { border-color: var(--vld-danger);  background: rgba(217,64,64,.06); }
.fv-radio-card__dot {
  width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--vld-border);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: all var(--vld-t-base);
}
.fv-radio-card__dot.on { border-color: var(--vld-primary); background: var(--vld-primary); }
.fv-radio-card__dot.on::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #fff; }
.fv-radio-card__label { font-size: 14px; font-weight: 700; color: var(--vld-text-strong); }
.fv-radio-card__desc  { font-size: 12px; color: var(--vld-text-muted); margin-top: 3px; }

/* ── Submit row ───────────────────────────────────────────── */
.fv-submit-row {
  display: flex; flex-direction: column; gap: 16px;
}

/* Deadline banner */
.fv-deadline-banner {
  flex: 1; min-width: 260px;
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  padding: 14px 18px; border-radius: var(--vld-r-xl);
  background: rgba(61,96,128,.06);
  border: 1.5px solid rgba(61,96,128,.18);
  transition: background var(--vld-t-base), border-color var(--vld-t-base);
}
.fv-deadline-banner--urgent {
  background: rgba(220,60,40,.06);
  border-color: rgba(220,60,40,.25);
}
.fv-deadline-banner__icon {
  width: 38px; height: 38px; border-radius: var(--vld-r-md); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(61,96,128,.12); color: var(--vld-primary);
}
.fv-deadline-banner--urgent .fv-deadline-banner__icon {
  background: rgba(220,60,40,.12); color: #c03030;
}
.fv-deadline-banner__body {
  display: flex; flex-direction: column; gap: 2px;
}
.fv-deadline-banner__label {
  font-size: 10.5px; font-weight: 700; letter-spacing: .06em;
  text-transform: uppercase; color: var(--vld-text-muted);
}
.fv-deadline-banner--urgent .fv-deadline-banner__label { color: #b03030; }
.fv-deadline-banner__date {
  font-family: var(--vld-font-display); font-size: 15px; font-weight: 700;
  color: var(--vld-text-strong);
}
.fv-deadline-banner--urgent .fv-deadline-banner__date { color: #c03030; }
.fv-deadline-banner__urgent-tag {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 999px;
  background: rgba(220,60,40,.12); border: 1px solid rgba(220,60,40,.30);
  font-size: 11px; font-weight: 700; color: #c03030;
}
.fv-deadline-banner__note {
  display: flex; align-items: center; gap: 6px;
  font-size: 11.5px; color: var(--vld-text-muted); width: 100%;
  padding-top: 2px;
}

/* Submit button */
.fv-actions {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: flex-end;
}

.fv-draft-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 22px; border-radius: var(--vld-r-lg);
  background: var(--vld-surface-alt);
  border: 1.5px solid var(--vld-border);
  color: var(--vld-text-muted); font-size: 13.5px; font-weight: 700;
  font-family: var(--vld-font-body); cursor: pointer;
  transition: all var(--vld-t-base) var(--vld-ease);
  white-space: nowrap; flex-shrink: 0;
}
.fv-draft-btn:hover:not(:disabled) {
  border-color: var(--vld-primary); color: var(--vld-primary);
  background: rgba(61,96,128,.06);
}
.fv-draft-btn:disabled { opacity: .5; cursor: not-allowed; }

.fv-submit-btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 28px; border: none; border-radius: var(--vld-r-lg);
  background: linear-gradient(135deg, var(--vld-primary) 0%, var(--vld-primary-dark) 100%);
  color: #fff; font-size: 14px; font-weight: 700; font-family: var(--vld-font-body);
  cursor: pointer; box-shadow: 0 4px 16px rgba(61,96,128,.32);
  transition: all var(--vld-t-base) var(--vld-ease);
  white-space: nowrap; flex-shrink: 0;
}
.fv-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(61,96,128,.40); }
.fv-submit-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }
</style>