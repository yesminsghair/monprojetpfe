<template>
  <div class="page-shell">

    <!-- FORMULAIRE -->
    <transition name="fade-slide">
    <div v-if="etape === 'formulaire'" class="card">

      <!-- Panneau gauche -->
      <aside class="panel-left">
        <svg class="geo" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="340" cy="70"  r="130" fill="rgba(255,255,255,0.04)"/>
          <circle cx="50"  cy="500" r="170" fill="rgba(255,255,255,0.03)"/>
          <circle cx="380" cy="400" r="90"  fill="rgba(255,255,255,0.03)"/>
          <line x1="0" y1="580" x2="400" y2="20" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        </svg>
        <div class="left-content">
          <div class="logo">
            <span class="logo-white">Vers le</span><span class="logo-gold">Diplôme</span>
          </div>
          <h1 class="hero">
            Gestion<br/>
            <em>Intelligente</em><br/>
            des Projets de<br/>Fin d'Études
          </h1>
          <p class="hero-sub">
            Simplifiez la gestion de vos PFE avec une plateforme moderne et intuitive.
            Suivi, évaluation et collaboration en temps réel.
          </p>
        </div>
        <footer class="left-foot">© 2026 Vers le Diplôme. Tous droits réservés.</footer>
      </aside>

      <!-- Panneau droit -->
      <main class="panel-right">
        <div class="right-inner">
          <div class="right-header">
            <h2>Créer un compte</h2>
            <p>Inscrivez-vous pour accéder à votre espace</p>
          </div>

          <form @submit.prevent="validerForm" @reset.prevent="annuler" novalidate>

            <!-- Rôle -->
            <div class="field-block">
              <label class="lbl">Je suis :</label>
              <div class="chips-grid">
                <button
                  v-for="r in roles" :key="r.value"
                  type="button" class="chip"
                  :class="{ 'chip-active': form.role === r.value }"
                  @click="form.role = r.value"
                >{{ r.label }}</button>
              </div>
              <p class="err" v-if="errors.role">{{ errors.role }}</p>
            </div>

            <!-- Nom / Prénom -->
            <div class="row-2">
              <div class="field-block">
                <label class="lbl">Nom</label>
                <input v-model="form.nom" type="text" placeholder="Votre nom"
                  :class="{ 'input-err': errors.nom }" autocomplete="family-name"/>
                <p class="err" v-if="errors.nom">{{ errors.nom }}</p>
              </div>
              <div class="field-block">
                <label class="lbl">Prénom</label>
                <input v-model="form.prenom" type="text" placeholder="Votre prénom"
                  :class="{ 'input-err': errors.prenom }" autocomplete="given-name"/>
                <p class="err" v-if="errors.prenom">{{ errors.prenom }}</p>
              </div>
            </div>

            <!-- Email -->
            <div class="field-block">
              <label class="lbl">Adresse email</label>
              <input v-model="form.email" type="email" placeholder="votre.email@example.com"
                :class="{ 'input-err': errors.email }" autocomplete="email"/>
              <p class="err" v-if="errors.email">{{ errors.email }}</p>
            </div>

            <!-- Numéro d'inscription / Matricule -->
            <div class="field-block">
              <label class="lbl">Numéro d'inscription / Matricule</label>
              <input v-model="form.numero" type="text" placeholder="Ex : AD-597624"
                :class="{ 'input-err': errors.numero }"/>
              <p class="err" v-if="errors.numero">{{ errors.numero }}</p>
            </div>

            <!-- Spécialité (nouveau champ) -->
            <div class="field-block">
              <label class="lbl">Spécialité</label>
              <div class="select-wrap">
                <select v-model="form.specialite" :class="{ 'input-err': errors.specialite }">
                  <option value="">-- Sélectionnez votre spécialité --</option>
                  <option v-for="sp in specialitesDisponibles" :key="sp.value" :value="sp.value">
                    {{ sp.label }}
                  </option>
                </select>
                <svg class="select-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <p class="err" v-if="errors.specialite">{{ errors.specialite }}</p>
            </div>

            <!-- Mot de passe -->
            <div class="row-2">
              <div class="field-block">
                <label class="lbl">Mot de passe</label>
                <div class="pw-wrap" :class="{ 'pw-err': errors.password }">
                  <input v-model="form.password" :type="showPw ? 'text' : 'password'"
                    placeholder="••••••••" autocomplete="new-password"/>
                  <button type="button" class="eye-btn" @click="showPw = !showPw">
                    <svg v-if="!showPw" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
                <!-- Jauge de force -->
                <div class="strength-row" v-if="form.password">
                  <div class="bar" v-for="i in 4" :key="i" :class="barClass(i)"></div>
                  <span class="strength-lbl" :class="strengthLblClass">{{ strengthLabel }}</span>
                </div>
                <!-- Règles de validation -->
                <div class="pw-rules" v-if="form.password">
                  <span :class="['pw-rule', form.password.length >= 8 ? 'rule-ok' : 'rule-ko']">
                    <span class="rule-dot"></span> 8 caractères minimum
                  </span>
                  <span :class="['pw-rule', /[A-Z]/.test(form.password) ? 'rule-ok' : 'rule-ko']">
                    <span class="rule-dot"></span> Une majuscule
                  </span>
                  <span :class="['pw-rule', /[0-9]/.test(form.password) ? 'rule-ok' : 'rule-ko']">
                    <span class="rule-dot"></span> Un chiffre
                  </span>
                  <span :class="['pw-rule', /[^A-Za-z\d]/.test(form.password) ? 'rule-ok' : 'rule-ko']">
                    <span class="rule-dot"></span> Un caractère spécial
                  </span>
                </div>
                <p class="err" v-if="errors.password">{{ errors.password }}</p>
              </div>

              <div class="field-block">
                <label class="lbl">Confirmer</label>
                <div class="pw-wrap" :class="{ 'pw-err': errors.confirmPassword }">
                  <input v-model="form.confirmPassword" :type="showCfm ? 'text' : 'password'"
                    placeholder="••••••••" autocomplete="new-password"/>
                  <button type="button" class="eye-btn" @click="showCfm = !showCfm">
                    <svg v-if="!showCfm" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
                <!-- Indicateur correspondance -->
                <div v-if="form.confirmPassword" class="match-indicator">
                  <span v-if="form.password === form.confirmPassword" class="match-ok">✓ Les mots de passe correspondent</span>
                  <span v-else class="match-ko">✗ Les mots de passe ne correspondent pas</span>
                </div>
                <p class="err" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</p>
              </div>
            </div>

            <!-- Conditions -->
            <label class="check-row">
              <input type="checkbox" v-model="form.conditions" class="native-check"/>
              <span :class="{ 'check-err-txt': errors.conditions }">
                J'accepte les <a href="#" @click.prevent class="link">conditions d'utilisation</a>
              </span>
            </label>
            <p class="err" v-if="errors.conditions">{{ errors.conditions }}</p>

            <!-- Boutons -->
            <div class="btn-group">
              <button type="submit" class="btn-gold">Je m'inscris</button>
              <button type="reset" class="btn-outline">Annuler</button>
            </div>

            <p class="login-hint">Déjà un compte ? <a href="#" class="link" @click.prevent="$router.push('/login')">Se connecter</a></p>

          </form>
        </div>
      </main>
    </div>
    </transition>

    <!-- EN ATTENTE -->
    <transition name="fade-slide">
    <div v-if="etape === 'attente'" class="status-card">
      <div class="status-logo"><span class="logo-white">Vers le</span><span class="logo-gold"> Diplôme</span></div>
      <div class="s-icon-wrap s-yellow">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>
      <span class="s-badge s-badge-wait">En attente de validation</span>
      <h3>Vérifiez votre boîte mail</h3>
      <p>Un lien de confirmation a été envoyé à<br/><strong>{{ form.email }}</strong></p>
      <div class="s-actions">
        <button class="btn-outline" @click="$router.push('/login')">Retour à la connexion</button>
      </div>
    </div>
    </transition>

    <!-- SUCCÈS -->
    <transition name="fade-slide">
    <div v-if="etape === 'succes'" class="status-card">
      <div class="status-logo"><span class="logo-white">Vers le</span><span class="logo-gold"> Diplôme</span></div>
      <div class="s-icon-wrap s-green">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <span class="s-badge s-badge-ok">Compte activé</span>
      <h3>Bienvenue !</h3>
      <p>Votre inscription est confirmée.<br/>Vous pouvez maintenant vous connecter.</p>
      <button class="btn-gold" @click="redirectConnexion">Se connecter</button>
    </div>
    </transition>

    <!-- LIEN EXPIRÉ -->
    <transition name="fade-slide">
    <div v-if="etape === 'expire'" class="status-card">
      <div class="status-logo"><span class="logo-white">Vers le</span><span class="logo-gold"> Diplôme</span></div>
      <div class="s-icon-wrap s-red">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <span class="s-badge s-badge-err">Lien expiré</span>
      <h3>Lien invalide</h3>
      <p>Votre lien de validation a expiré.<br/>Veuillez recommencer l'inscription.</p>
      <button class="btn-gold" @click="etape = 'formulaire'">Retour au formulaire</button>
    </div>
    </transition>

  </div>
</template>

<script>
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

export default {
  name: 'InscriptionForm',
  data() {
    return {
      etape: 'formulaire',
      showPw: false,
      showCfm: false,
      loading: false,
      roles: [
        { value: 'etudiant',   label: 'Étudiant' },
        { value: 'enseignant', label: 'Enseignant' },
        { value: 'encadrant',  label: 'Encadrant' },
      ],
      specialitesDisponibles: [],
      form: {
        nom: '', prenom: '', email: '',
        password: '', confirmPassword: '',
        role: '', numero: '', specialite: '', conditions: false,
      },
      errors: {},
    }
  },

  async mounted() {
    try {
      const { data } = await api.get('/specialites')
      this.specialitesDisponibles = data.map(sp => ({ value: sp.id, label: sp.nom }))
    } catch {
      // fallback silencieux — la liste restera vide
    }
  },

  computed: {
    strengthScore() {
      const p = this.form.password
      if (!p) return 0
      let s = 0
      if (p.length >= 8)         s++
      if (/[A-Z]/.test(p))       s++
      if (/[0-9]/.test(p))       s++
      if (/[^A-Za-z\d]/.test(p)) s++
      return s
    },
    strengthLabel()   { return ['', 'Faible', 'Moyen', 'Bon', 'Fort'][this.strengthScore] },
    strengthLblClass(){ return ['', 'lbl-red', 'lbl-orange', 'lbl-yellow', 'lbl-green'][this.strengthScore] },
  },

  methods: {
    barClass(i) {
      const colors = ['', 'bar-red', 'bar-orange', 'bar-yellow', 'bar-green']
      return i <= this.strengthScore ? colors[this.strengthScore] : 'bar-empty'
    },

    async validerForm() {
      this.form.nom    = this.form.nom.trim()
      this.form.prenom = this.form.prenom.trim()
      this.form.email  = this.form.email.trim()
      this.form.numero = this.form.numero.trim()
      this.errors = {}

      if (!this.form.nom)             this.errors.nom    = 'Le nom est obligatoire.'
      if (!this.form.prenom)          this.errors.prenom = 'Le prénom est obligatoire.'
      if (!this.form.email)           this.errors.email  = "L'adresse email est obligatoire."
      if (!this.form.password)        this.errors.password = 'Le mot de passe est obligatoire.'
      if (!this.form.confirmPassword) this.errors.confirmPassword = 'La confirmation est obligatoire.'
      if (!this.form.role)            this.errors.role   = 'Veuillez sélectionner votre rôle.'
      if (!this.form.numero) {
        this.errors.numero = "Le numéro d'inscription est obligatoire."
      } else if (!/^[A-Z]{2}-[0-9]{6}$/.test(this.form.numero.trim())) {
        this.errors.numero = "Format invalide. Utilisez le format XX-000000 (ex: AD-597624)."
      }
      if (!this.form.specialite)      this.errors.specialite = 'Veuillez sélectionner votre spécialité.'

      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (this.form.email && !emailRx.test(this.form.email))
        this.errors.email = 'Le format de cette adresse mail est invalide.'

      if (this.form.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(this.form.password))
        this.errors.password = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'

      if (this.form.password && this.form.confirmPassword && !this.errors.password &&
          this.form.password !== this.form.confirmPassword)
        this.errors.confirmPassword = 'Les mots de passe ne correspondent pas.'

      if (!this.form.conditions)
        this.errors.conditions = "Vous devez accepter les conditions d'utilisation pour continuer."

      if (Object.keys(this.errors).length > 0) return

      // ── Appel API ──
      this.loading = true
      try {
        await api.post('/inscription', {
          nom:           this.form.nom,
          prenom:        this.form.prenom,
          email:         this.form.email,
          password:      this.form.password,
          role:          this.form.role,
          matricule:     this.form.numero,
          specialite_id: this.form.specialite,
        })
        this.etape = 'attente'
      } catch (error) {
        if (error.response?.status === 422) {
          const errs = error.response.data.errors
          if (errs?.email)     this.errors.email    = errs.email[0]
          if (errs?.password)  this.errors.password = errs.password[0]
          if (errs?.matricule) this.errors.numero   = errs.matricule[0]
          if (errs?.specialite_id) this.errors.specialite = errs.specialite_id[0]
        } else {
          this.errors.email = 'Erreur de connexion. Réessayez plus tard.'
        }
      } finally {
        this.loading = false
      }
    },

    annuler() {
      Object.assign(this.form, {
        nom: '', prenom: '', email: '',
        password: '', confirmPassword: '',
        role: '', numero: '', specialite: '', conditions: false,
      })
      this.errors = {}
      this.$router.push('/')
    },

    redirectConnexion() { this.$router.push('/login') },
  },
}
</script>

<style scoped>
.page-shell {
  min-height: 100vh; background: #c8c4bc;
  display: flex; align-items: center; justify-content: center;
  padding: 32px 16px; font-family: 'Source Sans 3', sans-serif;
}

.card {
  display: flex; width: 100%; max-width: 1020px; min-height: 620px;
  border-radius: 18px; overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes cardIn { from { opacity:0; transform:translateY(20px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }

/* LEFT PANEL */
.panel-left {
  width: 38%; background: linear-gradient(160deg, #4a7090 0%, #3d6080 30%, #2f4f6a 65%, #243d52 100%);
  padding: 48px 40px; display: flex; flex-direction: column; position: relative; overflow: hidden;
}
.geo { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.left-content { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; }
.logo { font-family: 'Merriweather', serif; font-size: 22px; font-weight: 700; margin-bottom: 40px; }
.logo-white { color: #fff; }
.logo-gold  { color: #f5a623; margin-left: 6px; }
.hero { font-family: 'Merriweather', serif; font-size: 28px; font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 24px; flex: 1; }
.hero em { font-style: italic; color: #f5a623; }
.hero-sub { font-size: 13.5px; font-weight: 300; color: rgba(255,255,255,0.60); line-height: 1.72; margin-top: auto; }
.left-foot { font-size: 11.5px; color: rgba(255,255,255,0.30); margin-top: 28px; position: relative; z-index: 1; }

/* RIGHT PANEL */
.panel-right  { flex: 1; background: #ddd9d1; overflow-y: auto; }
.right-inner  { padding: 40px; }
.right-header { margin-bottom: 24px; }
.right-header h2 { font-family: 'Merriweather', serif; font-size: 26px; font-weight: 700; color: #1e2a35; margin-bottom: 5px; }
.right-header p  { font-size: 14px; color: #8a9aaa; font-weight: 300; }

/* Chips rôle */
.chips-grid { display: flex; flex-wrap: wrap; gap: 9px; }
.chip { padding: 8px 17px; border: 1.5px solid #c8c4bc; border-radius: 8px; background: #e8e4dc; font-size: 13.5px; font-family: 'Source Sans 3', sans-serif; font-weight: 500; color: #4a5a6a; cursor: pointer; transition: all 0.18s; }
.chip:hover  { border-color: #f5a623; color: #1e2a35; background: #ede9e0; }
.chip.chip-active { background: #f5a623; border-color: #f5a623; color: #fff; font-weight: 600; box-shadow: 0 2px 10px rgba(245,166,35,0.30); }

/* Select */
.select-wrap  { position: relative; }
.select-icon  { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #8a9aaa; }
.select-wrap select { padding-right: 36px; appearance: none; cursor: pointer; }

/* Password rules */
.pw-rules { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 8px; }
.pw-rule  { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 500; transition: color 0.2s; }
.rule-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.rule-ok  { color: #27ae60; }
.rule-ko  { color: #aaa49c; }

/* Match indicator */
.match-indicator { margin-top: 7px; font-size: 12px; font-weight: 500; }
.match-ok { color: #27ae60; }
.match-ko { color: #c0392b; }

/* Checkbox */
.check-row { display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: #4a5a6a; margin: 10px 0 4px; cursor: pointer; }
.native-check  { width: 16px; height: 16px; accent-color: #f5a623; cursor: pointer; flex-shrink: 0; }
.check-err-txt { color: #c0392b; }
.link { color: #3d6080; font-weight: 600; text-decoration: none; border-bottom: 1px solid rgba(61,96,128,0.3); transition: color 0.15s; }
.link:hover { color: #d4861a; border-color: #d4861a; }

/* Buttons */
.btn-group { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.btn-gold  { width: 100%; padding: 13px 20px; border: none; border-radius: 10px; background: #f5a623; color: #fff; font-size: 15px; font-weight: 600; font-family: 'Source Sans 3', sans-serif; cursor: pointer; transition: background 0.18s, transform 0.15s, box-shadow 0.18s; box-shadow: 0 2px 12px rgba(245,166,35,0.28); }
.btn-gold:hover { background: #d98e1a; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(245,166,35,0.36); }
.btn-outline { width: 100%; padding: 12px; border: 1.5px solid #c8c4bc; border-radius: 10px; background: transparent; color: #4a5a6a; font-size: 14px; font-family: 'Source Sans 3', sans-serif; cursor: pointer; transition: background 0.18s; }
.btn-outline:hover { background: rgba(0,0,0,0.05); border-color: #b0ab9f; }
.login-hint { text-align: center; font-size: 13px; color: #8a9aaa; margin-top: 14px; }

/* Status cards */
.status-card { width: 100%; max-width: 440px; background: #ddd9d1; border-radius: 18px; padding: 52px 44px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.22); display: flex; flex-direction: column; align-items: center; animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }
.status-logo { font-family: 'Merriweather', serif; font-size: 20px; font-weight: 700; margin-bottom: 28px; background: #3d6080; padding: 8px 20px; border-radius: 8px; display: inline-block; }
.s-icon-wrap { width: 76px; height: 76px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
.s-yellow { background: rgba(245,166,35,0.15); color: #d98e1a; }
.s-green  { background: rgba(39,174,96,0.13);  color: #27ae60; }
.s-red    { background: rgba(192,57,43,0.13);  color: #c0392b; }
.s-badge  { display: inline-block; font-size: 11.5px; font-weight: 600; padding: 4px 15px; border-radius: 20px; margin-bottom: 14px; letter-spacing: 0.04em; text-transform: uppercase; }
.s-badge-wait { background: #fff3cd; color: #856404; border: 1px solid rgba(255,193,7,0.45); }
.s-badge-ok   { background: #d4edda; color: #155724; border: 1px solid rgba(40,167,69,0.38); }
.s-badge-err  { background: #f8d7da; color: #721c24; border: 1px solid rgba(220,53,69,0.38); }
.status-card h3 { font-family: 'Merriweather', serif; font-size: 24px; font-weight: 700; color: #1e2a35; margin-bottom: 10px; }
.status-card p  { font-size: 14px; color: #4a5a6a; line-height: 1.75; margin-bottom: 26px; }
.status-card p strong { color: #2f4f6a; }
.s-actions { width: 100%; display: flex; flex-direction: column; gap: 10px; }

/* Transitions */
.fade-slide-enter-active { transition: opacity 0.38s ease, transform 0.38s cubic-bezier(0.22,1,0.36,1); }
.fade-slide-leave-active { transition: opacity 0.2s ease; }
.fade-slide-enter-from   { opacity: 0; transform: translateY(16px); }
.fade-slide-leave-to     { opacity: 0; }

@media (max-width: 768px) {
  .card { flex-direction: column; }
  .panel-left { width: 100%; min-height: 200px; padding: 32px 24px; }
  .right-inner { padding: 28px 20px; }
  .row-2 { grid-template-columns: 1fr; }
}
</style>