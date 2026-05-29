<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-items-center gap-3 mb-4 flex-wrap">
      <button class="vld-back-btn" @click="$emit('annuler')">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Retour au profil
      </button>
      <div>
        <h1 class="vld-page-title mb-0">Modifier mon profil</h1>
        <p class="vld-page-sub mb-0">Mettez à jour vos informations personnelles</p>
      </div>
    </div>

    <!-- ══ Toast ══ -->
    <Transition name="mp-toast">
      <div v-if="toast.visible" class="mp-toast" :class="toast.type === 'ok' ? 'mp-toast--ok' : 'mp-toast--err'">
        <div class="mp-toast__icon">
          <svg v-if="toast.type === 'ok'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="mp-toast__body">
          <span class="mp-toast__title">{{ toast.type === 'ok' ? 'Succès' : 'Erreur' }}</span>
          <span class="mp-toast__msg">{{ toast.message }}</span>
        </div>
        <button class="mp-toast__close" @click="toast.visible = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <!-- Progress bar -->
        <div class="mp-toast__bar" :class="toast.type === 'ok' ? 'mp-toast__bar--ok' : 'mp-toast__bar--err'"></div>
      </div>
    </Transition>

    <!-- ══ Form ══ -->
    <div class="row g-4 mb-4">

      <!-- Informations personnelles -->
      <div class="col-12 col-md-6">
        <div class="mp-card">
          <div class="mp-card__header mp-card__header--blue">
            <div class="mp-card__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            Informations personnelles
          </div>
          <div class="mp-card__body">
            <div class="row g-3 mb-3">
              <div class="col-6">
                <label class="mp-label">Prénom <span class="mp-required">*</span></label>
                <input v-model="form.prenom" type="text" class="mp-input" :class="{ 'mp-input--err': errors.prenom }" placeholder="Votre prénom" />
                <div v-if="errors.prenom" class="mp-field-err">{{ errors.prenom }}</div>
              </div>
              <div class="col-6">
                <label class="mp-label">Nom <span class="mp-required">*</span></label>
                <input v-model="form.nom" type="text" class="mp-input" :class="{ 'mp-input--err': errors.nom }" placeholder="Votre nom" />
                <div v-if="errors.nom" class="mp-field-err">{{ errors.nom }}</div>
              </div>
            </div>
            <div class="mb-3">
              <label class="mp-label">Établissement</label>
              <input v-model="form.etablissement" type="text" class="mp-input" placeholder="Votre établissement" />
            </div>
            <!-- Domaine d'expertise : encadrant, enseignant, chef, jury, directeur -->
            <div v-if="showDomaineField">
              <label class="mp-label">Domaine d'expertise</label>
              <input v-model="form.domaine_expertise" type="text" class="mp-input" placeholder="Ex : Intelligence Artificielle, Réseaux..." />
              <div class="mp-hint">Visible sur votre profil public</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Coordonnées -->
      <div class="col-12 col-md-6">
        <div class="mp-card">
          <div class="mp-card__header mp-card__header--gold">
            <div class="mp-card__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            Coordonnées
          </div>
          <div class="mp-card__body">
            <div class="mb-3">
              <label class="mp-label">Email <span class="mp-required">*</span></label>
              <input v-model="form.email" type="email" class="mp-input" :class="{ 'mp-input--err': errors.email }" placeholder="votre@email.tn" />
              <div v-if="errors.email" class="mp-field-err">{{ errors.email }}</div>
            </div>
            <div class="mb-3">
              <label class="mp-label">Téléphone</label>
              <div class="mp-input-group">
                <span class="mp-input-prefix">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 4.18 2 2 0 0 1 5.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                <input v-model="form.telephone" type="tel" class="mp-input mp-input--prefixed" :class="{ 'mp-input--err': errors.telephone }" placeholder="+216 XX XXX XXX" />
              </div>
              <div v-if="errors.telephone" class="mp-field-err">{{ errors.telephone }}</div>
            </div>
            <div>
              <label class="mp-label">Matricule</label>
              <input v-model="form.matricule" type="text" class="mp-input" :class="{ 'mp-input--err': errors.matricule }" placeholder="Ex : AD-597624" />
              <div v-if="errors.matricule" class="mp-field-err">{{ errors.matricule }}</div>
              <div class="mp-hint">Format attendu : XX-000000 (ex : AD-597624)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mot de passe -->
      <div class="col-12">
        <div class="mp-card">
          <div class="mp-card__header mp-card__header--slate">
            <div class="mp-card__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            Changer le mot de passe
            <span class="mp-optional-hint">Laissez vide pour conserver le mot de passe actuel</span>
          </div>
          <div class="mp-card__body">
            <div class="row g-3">
              <div class="col-12 col-md-4">
                <label class="mp-label">Mot de passe actuel</label>
                <div class="mp-pw-wrap">
                  <input :type="showPw.current ? 'text' : 'password'" v-model="form.motDePasseActuel"
                         class="mp-input mp-input--pw" :class="{ 'mp-input--err': errors.motDePasseActuel }"
                         placeholder="Mot de passe actuel" autocomplete="current-password" />
                  <button class="mp-pw-eye" type="button" @click="showPw.current = !showPw.current" :title="showPw.current ? 'Masquer' : 'Afficher'">
                    <svg v-if="showPw.current" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                <div v-if="errors.motDePasseActuel" class="mp-field-err">{{ errors.motDePasseActuel }}</div>
              </div>
              <div class="col-12 col-md-4">
                <label class="mp-label">Nouveau mot de passe</label>
                <div class="mp-pw-wrap">
                  <input :type="showPw.new ? 'text' : 'password'" v-model="form.nouveauMotDePasse"
                         class="mp-input mp-input--pw" :class="{ 'mp-input--err': errors.nouveauMotDePasse }"
                         placeholder="Nouveau mot de passe" autocomplete="new-password" />
                  <button class="mp-pw-eye" type="button" @click="showPw.new = !showPw.new">
                    <svg v-if="showPw.new" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                <div v-if="errors.nouveauMotDePasse" class="mp-field-err">{{ errors.nouveauMotDePasse }}</div>
                <!-- Password strength chips -->
                <div v-if="form.nouveauMotDePasse" class="mp-pw-chips">
                  <span class="mp-chip" :class="form.nouveauMotDePasse.length >= 8 ? 'mp-chip--ok' : 'mp-chip--off'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline v-if="form.nouveauMotDePasse.length >= 8" points="20 6 9 17 4 12"/><line v-else x1="18" y1="6" x2="6" y2="18"/></svg>
                    8 car. min
                  </span>
                  <span class="mp-chip" :class="/[A-Z]/.test(form.nouveauMotDePasse) ? 'mp-chip--ok' : 'mp-chip--off'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline v-if="/[A-Z]/.test(form.nouveauMotDePasse)" points="20 6 9 17 4 12"/><line v-else x1="18" y1="6" x2="6" y2="18"/></svg>
                    Majuscule
                  </span>
                  <span class="mp-chip" :class="/[a-z]/.test(form.nouveauMotDePasse) ? 'mp-chip--ok' : 'mp-chip--off'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline v-if="/[a-z]/.test(form.nouveauMotDePasse)" points="20 6 9 17 4 12"/><line v-else x1="18" y1="6" x2="6" y2="18"/></svg>
                    Minuscule
                  </span>
                  <span class="mp-chip" :class="/[0-9]/.test(form.nouveauMotDePasse) ? 'mp-chip--ok' : 'mp-chip--off'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline v-if="/[0-9]/.test(form.nouveauMotDePasse)" points="20 6 9 17 4 12"/><line v-else x1="18" y1="6" x2="6" y2="18"/></svg>
                    Chiffre
                  </span>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <label class="mp-label">Confirmer le mot de passe</label>
                <div class="mp-pw-wrap">
                  <input :type="showPw.confirm ? 'text' : 'password'" v-model="form.confirmerMotDePasse"
                         class="mp-input mp-input--pw" :class="{ 'mp-input--err': errors.confirmerMotDePasse }"
                         placeholder="Confirmer" autocomplete="new-password" />
                  <button class="mp-pw-eye" type="button" @click="showPw.confirm = !showPw.confirm">
                    <svg v-if="showPw.confirm" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                <div v-if="errors.confirmerMotDePasse" class="mp-field-err">{{ errors.confirmerMotDePasse }}</div>
                <div v-if="form.nouveauMotDePasse && form.confirmerMotDePasse && form.nouveauMotDePasse === form.confirmerMotDePasse"
                     class="mp-pw-match">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  Les mots de passe correspondent
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Actions -->
    <div class="mp-actions">
      <button class="mp-btn mp-btn--cancel" @click="$emit('annuler')">Annuler</button>
      <button class="mp-btn mp-btn--save" @click="sauvegarder" :disabled="saving">
        <span v-if="saving" class="mp-spinner"></span>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        {{ saving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
      </button>
    </div>

  </div>
</template>

<script>
import api from '@/services/api.js'
import { useToast } from '@/composables/useToast'

const ROLES_EXPERTISE = ['encadrant', 'enseignant', 'chef', 'jury', 'directeur']

export default {
  name: 'ModifierProfil',
  emits: ['annuler', 'sauvegarde'],

  props: {
    user: { type: Object, default: () => ({}) },
  },

  setup () {
    const { toast, showToast } = useToast()
    return { toast, showToast }
  },

  data () {
    // Prioritise prop `user` (fresh /me data), then localStorage fallback
    const stored = JSON.parse(localStorage.getItem('user') || '{}')
    const src    = (this.user && Object.keys(this.user).length) ? this.user : stored

    return {
      saving:   false,
      userRole: src.role || stored.role || '',
      showPw:   { current: false, new: false, confirm: false },
      errors:   {},
      form: {
        prenom:              src.prenom            ?? '',
        nom:                 src.nom               ?? '',
        email:               src.email             ?? '',
        telephone:           src.telephone         ?? '',
        matricule:           src.matricule         ?? '',
        etablissement:       src.etablissement     ?? '',
        domaine_expertise:   src.domaine_expertise ?? '',
        motDePasseActuel:    '',
        nouveauMotDePasse:   '',
        confirmerMotDePasse: '',
      },
    }
  },

  computed: {
    showDomaineField () {
      return ROLES_EXPERTISE.includes(this.userRole)
    },
  },

  methods: {
    valider () {
      this.errors = {}
      if (!this.form.prenom.trim()) this.errors.prenom = 'Le prénom est requis.'
      if (!this.form.nom.trim())    this.errors.nom    = 'Le nom est requis.'
      if (!this.form.email.trim())  this.errors.email  = "L'email est requis."
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email))
        this.errors.email = "Format d'email invalide."

      if (this.form.matricule && !/^[A-Z]{2}-[0-9]{6}$/.test(this.form.matricule.trim()))
        this.errors.matricule = 'Format attendu : XX-000000 (ex : AD-597624).'

      if (this.form.telephone && !/^[+0-9()\s\-]{7,20}$/.test(this.form.telephone.trim()))
        this.errors.telephone = 'Numéro de téléphone invalide.'

      if (this.form.nouveauMotDePasse || this.form.confirmerMotDePasse || this.form.motDePasseActuel) {
        if (!this.form.motDePasseActuel)
          this.errors.motDePasseActuel = 'Veuillez saisir votre mot de passe actuel.'
        if (!this.form.nouveauMotDePasse)
          this.errors.nouveauMotDePasse = 'Veuillez saisir un nouveau mot de passe.'
        else if (this.form.nouveauMotDePasse.length < 8)
          this.errors.nouveauMotDePasse = 'Minimum 8 caractères.'
        else if (!/[A-Z]/.test(this.form.nouveauMotDePasse) ||
                 !/[a-z]/.test(this.form.nouveauMotDePasse) ||
                 !/[0-9]/.test(this.form.nouveauMotDePasse))
          this.errors.nouveauMotDePasse = 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre.'
        if (this.form.nouveauMotDePasse && this.form.nouveauMotDePasse !== this.form.confirmerMotDePasse)
          this.errors.confirmerMotDePasse = 'Les mots de passe ne correspondent pas.'
      }
      return Object.keys(this.errors).length === 0
    },

    async sauvegarder () {
      if (!this.valider()) return
      this.saving = true
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      try {
        const res = await api.put(`/utilisateurs/${stored.id}`, {
          nom:               this.form.nom.trim(),
          prenom:            this.form.prenom.trim(),
          email:             this.form.email.trim(),
          telephone:         this.form.telephone.trim(),
          matricule:         this.form.matricule.trim(),
          etablissement:     this.form.etablissement.trim(),
          domaine_expertise: this.form.domaine_expertise.trim(),
        })

        if (this.form.nouveauMotDePasse) {
          await api.post('/change-password', {
            current_password: this.form.motDePasseActuel,
            password:         this.form.nouveauMotDePasse,
          })
        }

        const updated = { ...stored, ...res.data }
        localStorage.setItem('user', JSON.stringify(updated))
        this.showToast('Profil mis à jour avec succès !', 'ok')
        this.$emit('sauvegarde', updated)
        setTimeout(() => this.$emit('annuler'), 1600)

      } catch (e) {
        const msg  = e.response?.data?.message || ''
        const errs = e.response?.data?.errors   || {}
        if (errs.email)    this.errors.email    = errs.email[0]
        if (errs.nom)      this.errors.nom      = errs.nom[0]
        if (errs.telephone) this.errors.telephone = errs.telephone[0]
        if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('mot de passe'))
          this.errors.motDePasseActuel = 'Mot de passe actuel incorrect.'
        else if (!errs.email && !errs.nom)
          this.showToast('Erreur lors de la mise à jour. Veuillez réessayer.', 'err')
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
/* ══════════════════════════════════════════
   Cards
══════════════════════════════════════════ */
.mp-card {
  border-radius: 16px;
  border: 1.5px solid var(--vld-border, #c8c4bc);
  background: var(--vld-surface, #ddd9d1);
  overflow: hidden;
  height: 100%;
  display: flex; flex-direction: column;
}
.mp-card__header {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px;
  font-size: 13px; font-weight: 700;
  border-bottom: 1.5px solid var(--vld-border, #c8c4bc);
  position: relative;
}
.mp-card__header::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
  border-radius: 0 2px 2px 0;
}
.mp-card__header--blue::before  { background: #3d6080; }
.mp-card__header--gold::before  { background: #f5a623; }
.mp-card__header--slate::before { background: #8e9eae; }
.mp-card__header--blue  { color: var(--vld-primary, #3d6080); }
.mp-card__header--gold  { color: #b87c10; }
.mp-card__header--slate { color: var(--vld-text-muted, #8a9aaa); }

.mp-card__icon {
  width: 32px; height: 32px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.mp-card__header--blue  .mp-card__icon { background: rgba(61,96,128,.12);  color: #3d6080; }
.mp-card__header--gold  .mp-card__icon { background: rgba(245,166,35,.15); color: #d98e1a; }
.mp-card__header--slate .mp-card__icon { background: rgba(142,158,174,.12);color: #8e9eae; }

.mp-card__body { padding: 20px; flex: 1; }

.mp-optional-hint {
  margin-left: auto;
  font-size: 11.5px;
  font-weight: 400;
  color: var(--vld-text-faint, #aab4be);
}

/* ══════════════════════════════════════════
   Form controls
══════════════════════════════════════════ */
.mp-label {
  display: block;
  font-size: 12px; font-weight: 600;
  color: var(--vld-text-muted, #8a9aaa);
  text-transform: uppercase; letter-spacing: .04em;
  margin-bottom: 6px;
}
.mp-required { color: #e74c3c; }

.mp-input {
  width: 100%;
  padding: 9px 13px;
  border-radius: 10px;
  border: 1.5px solid var(--vld-border, #c8c4bc);
  background: var(--vld-bg, #f0ece4);
  color: var(--vld-text-strong, #1e2a35);
  font-size: 13.5px;
  transition: border-color .15s, box-shadow .15s;
  outline: none;
  box-sizing: border-box;
}
.mp-input:focus {
  border-color: var(--vld-primary, #3d6080);
  box-shadow: 0 0 0 3px rgba(61,96,128,.12);
}
.mp-input--err {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231,76,60,.10);
}

/* Input with left icon prefix */
.mp-input-group { position: relative; }
.mp-input-prefix {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  color: var(--vld-text-muted, #8a9aaa);
  pointer-events: none;
  display: flex; align-items: center;
}
.mp-input--prefixed { padding-left: 36px; }

/* Password wrapper */
.mp-pw-wrap { position: relative; }
.mp-input--pw { padding-right: 42px; }
.mp-pw-eye {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: var(--vld-text-muted, #8a9aaa);
  padding: 3px;
  transition: color .15s;
}
.mp-pw-eye:hover { color: var(--vld-primary, #3d6080); }

.mp-field-err {
  font-size: 11.5px; color: #e74c3c;
  margin-top: 4px; font-weight: 500;
}
.mp-hint {
  font-size: 11.5px; color: var(--vld-text-faint, #aab4be);
  margin-top: 4px;
}

/* Password strength chips */
.mp-pw-chips {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-top: 8px;
}
.mp-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px; font-weight: 600;
  border: 1px solid transparent;
  transition: all .2s;
}
.mp-chip--ok {
  background: rgba(39,174,96,.13);
  border-color: rgba(39,174,96,.3);
  color: #1a7a40;
}
.mp-chip--off {
  background: rgba(142,158,174,.10);
  border-color: rgba(142,158,174,.25);
  color: var(--vld-text-muted, #8a9aaa);
}

/* Password match indicator */
.mp-pw-match {
  display: flex; align-items: center; gap: 5px;
  margin-top: 6px;
  font-size: 12px; font-weight: 600;
  color: #27ae60;
}

/* ══════════════════════════════════════════
   Actions bar
══════════════════════════════════════════ */
.mp-actions {
  display: flex; justify-content: flex-end; gap: 12px;
  padding-top: 4px;
}
.mp-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 13.5px; font-weight: 700;
  cursor: pointer;
  transition: transform .15s, box-shadow .15s, background .15s;
  border: none;
}
.mp-btn--cancel {
  background: var(--vld-surface, #ddd9d1);
  border: 1.5px solid var(--vld-border, #c8c4bc);
  color: var(--vld-text-muted, #8a9aaa);
}
.mp-btn--cancel:hover { background: var(--vld-border, #c8c4bc); }
.mp-btn--save {
  background: linear-gradient(135deg, #f5a623 0%, #e8920a 100%);
  color: #1e2e3e;
  box-shadow: 0 4px 14px rgba(245,166,35,.35);
}
.mp-btn--save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245,166,35,.45);
}
.mp-btn--save:disabled { opacity: .65; cursor: not-allowed; }

/* Spinner inside button */
.mp-spinner {
  width: 15px; height: 15px;
  border: 2px solid rgba(30,46,62,.3);
  border-top-color: #1e2e3e;
  border-radius: 50%;
  animation: mp-spin .7s linear infinite;
  flex-shrink: 0;
}
@keyframes mp-spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════
   Toast
══════════════════════════════════════════ */
.mp-toast {
  position: fixed;
  top: 24px; right: 24px;
  z-index: 9999;
  display: flex; align-items: flex-start; gap: 12px;
  min-width: 300px; max-width: 420px;
  padding: 14px 16px 18px;
  border-radius: 14px;
  border: 1.5px solid transparent;
  box-shadow: 0 8px 32px rgba(0,0,0,.18);
  overflow: hidden;
  backdrop-filter: blur(8px);
}
.mp-toast--ok {
  background: #f0fdf4;
  border-color: rgba(39,174,96,.3);
}
.mp-toast--err {
  background: #fff5f5;
  border-color: rgba(231,76,60,.3);
}
.mp-toast__icon {
  width: 32px; height: 32px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.mp-toast--ok  .mp-toast__icon { background: rgba(39,174,96,.15);  color: #27ae60; }
.mp-toast--err .mp-toast__icon { background: rgba(231,76,60,.12);  color: #e74c3c; }
.mp-toast__body { flex: 1; }
.mp-toast__title {
  display: block;
  font-size: 13px; font-weight: 700;
  margin-bottom: 2px;
}
.mp-toast--ok  .mp-toast__title { color: #1a7a40; }
.mp-toast--err .mp-toast__title { color: #c0392b; }
.mp-toast__msg { font-size: 12.5px; color: #444; }
.mp-toast__close {
  background: none; border: none; cursor: pointer;
  color: #aaa; padding: 2px;
  flex-shrink: 0;
  transition: color .15s;
}
.mp-toast__close:hover { color: #555; }

/* Animated bottom progress bar */
.mp-toast__bar {
  position: absolute;
  bottom: 0; left: 0;
  height: 3px; border-radius: 0 0 0 14px;
  animation: mp-bar 3.4s linear forwards;
}
.mp-toast__bar--ok  { background: #27ae60; }
.mp-toast__bar--err { background: #e74c3c; }
@keyframes mp-bar { from { width: 100%; } to { width: 0%; } }

/* Toast transition */
.mp-toast-enter-active { animation: mp-slide-in .3s ease; }
.mp-toast-leave-active { animation: mp-slide-out .25s ease forwards; }
@keyframes mp-slide-in {
  from { opacity: 0; transform: translateY(-16px) scale(.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes mp-slide-out {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(-10px) scale(.97); }
}
</style>