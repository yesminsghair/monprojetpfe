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
              <label class="lbl">Numéro d'inscription / Matricule <span class="optional">(optionnel)</span></label>
              <input v-model="form.numero" type="text" placeholder="Ex : AD-597624"
                :class="{ 'input-err': errors.numero }"/>
              <p class="err" v-if="errors.numero">{{ errors.numero }}</p>
            </div>

            <!-- Spécialité -->
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
                <div class="pw-rules" v-if="form.password">
                  <span :class="['pw-rule', form.password.length >= 8 ? 'rule-ok' : 'rule-ko']">
                    <span class="rule-dot"></span> 8 caractères minimum
                  </span>
                  <span :class="['pw-rule', /[A-Z]/.test(form.password) ? 'rule-ok' : 'rule-ko']">
                    <span class="rule-dot"></span> Une majuscule
                  </span>
                  <span :class="['pw-rule', /[a-z]/.test(form.password) ? 'rule-ok' : 'rule-ko']">
                    <span class="rule-dot"></span> Une minuscule
                  </span>
                  <span :class="['pw-rule', /[0-9]/.test(form.password) ? 'rule-ok' : 'rule-ko']">
                    <span class="rule-dot"></span> Un chiffre
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
                J'accepte les
                <a href="#" @click.prevent="showConditionsModal = true" class="link">conditions d'utilisation</a>
              </span>
            </label>
            <p class="err" v-if="errors.conditions">{{ errors.conditions }}</p>

            <!-- Boutons -->
            <div class="btn-group">
              <button type="submit" class="btn-gold" :disabled="loading">
                <span v-if="loading" class="spinner"></span>
                {{ loading ? 'Inscription en cours...' : "Je m'inscris" }}
              </button>
              <button type="reset" class="btn-outline" :disabled="loading">Annuler</button>
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

    <!-- ══════════════ CONDITIONS MODAL ══════════════ -->
    <transition name="modal-fade">
      <div v-if="showConditionsModal" class="modal-overlay" @click.self="closeConditions">
        <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="cond-title">

          <!-- Header -->
          <div class="modal-header">
            <div class="modal-title-row">
              <span class="modal-icon">📄</span>
              <h3 id="cond-title">Conditions d'utilisation</h3>
            </div>
            <button class="modal-close" @click="closeConditions" aria-label="Fermer">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <div class="cond-intro">
              <p>En utilisant la plateforme <strong>Vers le Diplôme</strong>, vous acceptez les présentes conditions. Veuillez les lire attentivement avant de valider votre inscription.</p>
              <p class="cond-date">Dernière mise à jour : Janvier 2026</p>
            </div>

            <div class="cond-section">
              <h4><span class="cond-num">1</span> Objet et accès</h4>
              <p>La plateforme <strong>Vers le Diplôme</strong> est un outil académique interne réservé aux membres de l'Institut Supérieur de Gestion de Sousse (ISG Sousse) impliqués dans le processus de gestion des Projets de Fin d'Études. L'accès est conditionné à la validation de votre compte par un administrateur de la plateforme.</p>
            </div>

            <div class="cond-section">
              <h4><span class="cond-num">2</span> Comptes utilisateurs</h4>
              <ul class="cond-list">
                <li>Chaque utilisateur ne peut posséder qu'un seul compte sur la plateforme.</li>
                <li>Vous êtes responsable de la confidentialité de vos identifiants de connexion.</li>
                <li>Toute activité réalisée depuis votre compte engage votre responsabilité.</li>
                <li>En cas de perte ou de compromission de votre mot de passe, utilisez immédiatement la fonction « Réinitialiser mot de passe ».</li>
                <li>L'administrateur se réserve le droit de désactiver tout compte non conforme aux présentes conditions.</li>
              </ul>
            </div>

            <div class="cond-section">
              <h4><span class="cond-num">3</span> Utilisation acceptable</h4>
              <ul class="cond-list">
                <li>La plateforme est strictement réservée à un usage académique lié aux PFE et aux stages.</li>
                <li>Il est interdit de publier, soumettre ou partager des contenus illicites, trompeurs ou irrespectueux.</li>
                <li>Les livrables et documents soumis doivent être des productions originales. Toute forme de plagiat est prohibée.</li>
                <li>La messagerie intégrée est réservée aux communications académiques entre les acteurs du processus PFE.</li>
                <li>Il est interdit d'utiliser la plateforme pour accéder aux données d'autres utilisateurs sans autorisation.</li>
              </ul>
            </div>

            <div class="cond-section">
              <h4><span class="cond-num">4</span> Données personnelles</h4>
              <p>Les données collectées (nom, prénom, email, matricule, rôle, spécialité) sont utilisées exclusivement dans le cadre de la gestion des PFE à l'ISG Sousse. Elles ne sont ni vendues ni transmises à des tiers. Les mots de passe sont stockés sous forme chiffrée. Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.</p>
            </div>

            <div class="cond-section">
              <h4><span class="cond-num">5</span> Propriété intellectuelle</h4>
              <p>Les livrables et rapports déposés sur la plateforme demeurent la propriété intellectuelle de leurs auteurs. En les soumettant, vous accordez à l'ISG Sousse le droit de les consulter à des fins d'évaluation académique et d'archivage. Les projets sélectionnés pour la bibliothèque PFE sont accessibles en lecture à tous les utilisateurs de la plateforme.</p>
            </div>

            <div class="cond-section">
              <h4><span class="cond-num">6</span> Disponibilité et maintenance</h4>
              <p>La plateforme s'engage à assurer une disponibilité maximale. Des interruptions ponctuelles peuvent survenir pour des opérations de maintenance. La plateforme n'est pas responsable des pertes de données résultant d'une utilisation incorrecte ou de pannes matérielles imprévisibles.</p>
            </div>

            <div class="cond-section">
              <h4><span class="cond-num">7</span> Modifications des conditions</h4>
              <p>Ces conditions peuvent être mises à jour à tout moment. Les utilisateurs seront notifiés des modifications significatives via la messagerie de la plateforme. La poursuite de l'utilisation de la plateforme après notification vaut acceptation des nouvelles conditions.</p>
            </div>

            <div class="cond-hint">
              <span class="cond-hint-icon">ℹ️</span>
              <span>En cliquant sur <strong>« J'accepte et je ferme »</strong>, vous confirmez avoir lu et compris l'intégralité de ces conditions d'utilisation.</span>
            </div>
          </div>

          <!-- Footer avec deux actions -->
          <div class="modal-footer">
            <button class="modal-btn-decline" @click="declineConditions">Refuser</button>
            <button class="modal-btn-accept" @click="acceptConditions">J'accepte et je ferme</button>
          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import axios from 'axios'//biblio axios responsablr de comm laravel/vue vers les req http

const api = axios.create({ //creation d'une instance d'axios 
  baseURL: 'http://127.0.0.1:8000/api',//adresse de base de l'api laravel
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },//données recus et envoyés sont de type JSON
})

export default {
  name: 'InscriptionForm',//nom du comp utilisé dans le debbuging par DevTools
  data() { //fonction vue retourne les var reactives (mise à jour auto de l'interface)
    return {//un objet avec tous donn de com
      etape: 'formulaire',
      showPw: false,//aff mdp
      showCfm: false,//aff conf mdp
      loading: false,//dire qu'une req api et en cours
      showConditionsModal: false,   // ← controls the conditions popup
      roles: [//tab des roles
        { value: 'etudiant',   label: 'Étudiant' },
        { value: 'enseignant', label: 'Enseignant' },
        { value: 'encadrant',  label: 'Encadrant' },
      ],
      specialitesDisponibles: [],//tab specialites from back
      form: {//objet js contient les données de form saisi par uti
        nom: '', prenom: '', email: '',
        password: '', confirmPassword: '',
        role: '', numero: '', specialite: '', conditions: false,
      },
      errors: {},//les message d'error
    }
  },

  async mounted() {//fonct automatique s'execute au charg de page
    try {
      const { data } = await api.get('/specialites')//send a http get req to back, l'exec de la req que lorsque la reponse est recu
      this.specialitesDisponibles = data.map(sp => ({ value: sp.id, label: sp.nom }))//reponse stocke dans data et parcouru avec map puis transformé et stocke dans cet objet 
    } catch {
      // catch vide c'est à dire un fallback silencieux 
    }
    // Close modal on ESC
    window.addEventListener('keydown', this.handleEsc)
  },//ecouteur devenemnt sur le clavier pour detecter la touche esc pour fermer la fnentre de cond

  beforeUnmount() {//s'execute avant detruire le comp
    window.removeEventListener('keydown', this.handleEsc)//supp lecout clavier listner pour eviter fruit memoire
  },
//computed : proprietes calcules valeur dérivée d'autres données réactives et mise en cache
  computed: {
    strengthScore() {//calcule le score de mdp
      const p = this.form.password
      if (!p) return 0
      let s = 0
      if (p.length >= 8)   s++
      if (/[A-Z]/.test(p)) s++
      if (/[a-z]/.test(p)) s++
      if (/[0-9]/.test(p)) s++
      return s
    },
    strengthLabel()   { return ['', 'Faible', 'Moyen', 'Bon', 'Fort'][this.strengthScore] },//convert le score en des textes
    strengthLblClass(){ return ['', 'lbl-red', 'lbl-orange', 'lbl-yellow', 'lbl-green'][this.strengthScore] },//convert en des couleurs css
  },

  methods: {
    // ── ESC key handler ──────────────────────
    handleEsc(e) { 
      if (e.key === 'Escape' && this.showConditionsModal) this.closeConditions()
    },// une methode qui verifie si le modele de cond est affiché et que l'uti a clické sur fermer (escape) et le ferme

    // ── Conditions modal ─────────────────────
    closeConditions()   { this.showConditionsModal = false },//cache popup
    //utilisateur accepte ( coche checkbox automatiquement, ferme modal, enlève erreur si existante)
    acceptConditions()  { this.form.conditions = true;  this.showConditionsModal = false; if (this.errors.conditions) this.errors.conditions = null },
   //refuser (décoche + ferme)
    declineConditions() { this.form.conditions = false; this.showConditionsModal = false },

    // ── Password strength bar ──────────────
    // gère couleur des barres selon force
    barClass(i) {
      const colors = ['', 'bar-red', 'bar-orange', 'bar-yellow', 'bar-green']//pamette couleur
      return i <= this.strengthScore ? colors[this.strengthScore] : 'bar-empty'//remplit ou laisse vide
    },

    // ── Form validation & submit ─────────────
    async validerForm() {//trim: supprime les espace inutiles
      this.form.nom    = this.form.nom.trim()
      this.form.prenom = this.form.prenom.trim()
      this.form.email  = this.form.email.trim()
      this.form.numero = this.form.numero.trim()
      this.errors = {}
// liste des error à afficher 
      if (!this.form.nom)             this.errors.nom    = 'Le nom est obligatoire.'
      if (!this.form.prenom)          this.errors.prenom = 'Le prénom est obligatoire.'
      if (!this.form.email)           this.errors.email  = "L'adresse email est obligatoire."
      if (!this.form.password)        this.errors.password = 'Le mot de passe est obligatoire.'
      if (!this.form.confirmPassword) this.errors.confirmPassword = 'La confirmation est obligatoire.'
      if (!this.form.role)            this.errors.role   = 'Veuillez sélectionner votre rôle.'

      if (this.form.numero && !/^[A-Z]{2}-[0-9]{6}$/.test(this.form.numero)) {//test pour la comparaison
        this.errors.numero = "Format invalide. Utilisez le format XX-000000 (ex: AD-597624)."
      }

      if (!this.form.specialite) this.errors.specialite = 'Veuillez sélectionner votre spécialité.'

      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      //format email à respecter
      if (this.form.email && !emailRx.test(this.form.email))
        this.errors.email = 'Le format de cette adresse mail est invalide.'

      if (this.form.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(this.form.password))
        this.errors.password = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.'

      if (this.form.password && this.form.confirmPassword && !this.errors.password &&
          this.form.password !== this.form.confirmPassword)
        this.errors.confirmPassword = 'Les mots de passe ne correspondent pas.'

      if (!this.form.conditions)
        this.errors.conditions = "Vous devez accepter les conditions d'utilisation pour continuer."

      if (Object.keys(this.errors).length > 0) return //bloque en cas d'erreurs 

      // ── Appel API ──
      this.loading = true//active le spinner
      try {
        await api.post('/inscription', {//envoi des données au back par req http post
          nom:           this.form.nom,
          prenom:        this.form.prenom,
          email:         this.form.email,
          password:      this.form.password,
          role:          this.form.role,
          matricule:     this.form.numero || null,
          specialite_id: this.form.specialite || null,
        })
        this.etape = 'attente' // en passe à l'etape d'attente (switch écran)
      } catch (error) {//bloc s'execute si req est echoue, error objet axios ,response.data la reponse json du back
        if (error.response?.status === 422) {//err de validation laravel (les données envoyés dans post sont incorrectes)
          const errs = error.response.data.errors//on recupere les err
          if (errs?.email)         this.errors.email      = errs.email[0]
          if (errs?.password)      this.errors.password   = errs.password[0]
          if (errs?.matricule)     this.errors.numero     = errs.matricule[0]
          if (errs?.specialite_id) this.errors.specialite = errs.specialite_id[0]
        } else if (error.response?.status === 500) {//erreur du serveur laravel 
          this.errors.email = 'Erreur serveur : vérifiez la configuration email (Mailtrap) dans le .env.'
        } else {//autre erreurs conx,réseau...
          this.errors.email = 'Erreur de connexion. Réessayez plus tard.'
        }//l'axios error recoit la reponse et lit le json puis le transforme en js 
      } finally {
        this.loading = false//arrete le spinner
      }
    },

    annuler() {//methode lorque l'uti clique sur annuler
      Object.assign(this.form, {//remettre l'objet form à vide
        nom: '', prenom: '', email: '',
        password: '', confirmPassword: '',
        role: '', numero: '', specialite: '', conditions: false,
      })
      this.errors = {}//effece les erreurs
      this.$router.push('/')//en retour à la page d'accueil
    },

    redirectConnexion() { this.$router.push('/login') },//redirection vers login si on clique sur se connecter 
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,700;1,700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

.page-shell {
  min-height: 100vh; width: 100%; background: #c8c4bc;
  display: flex; align-items: center; justify-content: center;
  padding: 32px 16px; font-family: 'Source Sans 3', sans-serif;
  box-sizing: border-box;
}

.card {
  display: flex; flex-direction: row; width: 100%; max-width: 1020px; min-height: 620px;
  border-radius: 18px; overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes cardIn { from { opacity:0; transform:translateY(20px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }

/* LEFT PANEL */
.panel-left {
  width: 38%; min-width: 260px; flex-shrink: 0;
  background: linear-gradient(160deg, #4a7090 0%, #3d6080 30%, #2f4f6a 65%, #243d52 100%);
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

/* Fields */
.field-block { margin-bottom: 16px; }
.lbl { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #3d5a72; }
.optional { font-size: 12px; font-weight: 400; color: #8a9aaa; }
input, select {
  width: 100%; padding: 12px 14px;
  border: 1.5px solid #c8c4bc; border-radius: 10px;
  background: #e8e4dc; font-size: 14.5px; color: #1e2a35;
  font-family: 'Source Sans 3', sans-serif; transition: all 0.2s;
}
input:focus, select:focus { outline: none; border-color: #3d6080; background: #fff; box-shadow: 0 0 0 3px rgba(61,96,128,0.12); }
.input-err { border-color: #e74c3c !important; background: #fdf2f2; }
.err { font-size: 12px; color: #e74c3c; margin-top: 5px; }
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

/* Chips rôle */
.chips-grid { display: flex; flex-wrap: wrap; gap: 9px; }
.chip { padding: 8px 17px; border: 1.5px solid #c8c4bc; border-radius: 8px; background: #e8e4dc; font-size: 13.5px; font-family: 'Source Sans 3', sans-serif; font-weight: 500; color: #4a5a6a; cursor: pointer; transition: all 0.18s; }
.chip:hover  { border-color: #f5a623; color: #1e2a35; background: #ede9e0; }
.chip.chip-active { background: #f5a623; border-color: #f5a623; color: #fff; font-weight: 600; box-shadow: 0 2px 10px rgba(245,166,35,0.30); }

/* Select */
.select-wrap  { position: relative; }
.select-icon  { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #8a9aaa; }
.select-wrap select { padding-right: 36px; appearance: none; cursor: pointer; }

/* Password strength */
.strength-row { display: flex; align-items: center; gap: 6px; margin-top: 8px; }
.bar { flex: 1; height: 4px; border-radius: 4px; transition: background 0.3s; }
.bar-empty   { background: #c8c4bc; }
.bar-red     { background: #e74c3c; }
.bar-orange  { background: #e67e22; }
.bar-yellow  { background: #f1c40f; }
.bar-green   { background: #27ae60; }
.strength-lbl { font-size: 11.5px; font-weight: 600; white-space: nowrap; }
.lbl-red    { color: #e74c3c; }
.lbl-orange { color: #e67e22; }
.lbl-yellow { color: #d4ac0d; }
.lbl-green  { color: #27ae60; }

/* Password rules */
.pw-wrap { position: relative; }
.pw-wrap input { padding-right: 42px; }
.pw-wrap.pw-err input { border-color: #e74c3c; background: #fdf2f2; }
.eye-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #8a9aaa; padding: 0; display: flex; align-items: center; }
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
.btn-gold  { width: 100%; padding: 13px 20px; border: none; border-radius: 10px; background: #f5a623; color: #fff; font-size: 15px; font-weight: 600; font-family: 'Source Sans 3', sans-serif; cursor: pointer; transition: background 0.18s, transform 0.15s, box-shadow 0.18s; box-shadow: 0 2px 12px rgba(245,166,35,0.28); display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-gold:hover:not(:disabled) { background: #d98e1a; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(245,166,35,0.36); }
.btn-gold:disabled { background: #c8b98a; cursor: not-allowed; box-shadow: none; }
.btn-outline { width: 100%; padding: 12px; border: 1.5px solid #c8c4bc; border-radius: 10px; background: transparent; color: #4a5a6a; font-size: 14px; font-family: 'Source Sans 3', sans-serif; cursor: pointer; transition: background 0.18s; }
.btn-outline:hover:not(:disabled) { background: rgba(0,0,0,0.05); border-color: #b0ab9f; }
.login-hint { text-align: center; font-size: 13px; color: #8a9aaa; margin-top: 14px; }

/* Spinner */
.spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

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

/* ─── CONDITIONS MODAL ─────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(15, 25, 35, 0.72);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 1.5rem;
}
.modal-box {
  background: #f0ece4;
  border-radius: 20px;
  width: 100%; max-width: 620px;
  max-height: 84vh;
  display: flex; flex-direction: column;
  box-shadow: 0 32px 80px rgba(0,0,0,0.35);
  overflow: hidden;
  animation: modalIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.3rem 1.6rem;
  background: linear-gradient(160deg, #4a7090, #2f4f6a);
  flex-shrink: 0;
}
.modal-title-row { display: flex; align-items: center; gap: 0.7rem; }
.modal-icon { font-size: 1.4rem; }
.modal-header h3 {
  font-family: 'Merriweather', serif;
  font-size: 1.1rem; font-weight: 700; color: white; margin: 0;
}
.modal-close {
  background: rgba(255,255,255,0.1); border: none;
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: white; cursor: pointer; transition: background 0.2s; flex-shrink: 0;
}
.modal-close:hover { background: rgba(255,255,255,0.2); }

.modal-body {
  flex: 1; overflow-y: auto; padding: 1.5rem 1.6rem;
  font-family: 'Source Sans 3', sans-serif;
  font-size: 0.9rem; color: #2a3a48;
  scroll-behavior: smooth;
}
.modal-body::-webkit-scrollbar { width: 5px; }
.modal-body::-webkit-scrollbar-track { background: #ddd9d1; }
.modal-body::-webkit-scrollbar-thumb { background: #a0b4c4; border-radius: 3px; }

/* Conditions inner styles */
.cond-intro {
  background: rgba(61,96,128,0.08); border-left: 3px solid #3d6080;
  border-radius: 0 8px 8px 0; padding: 0.9rem 1rem;
  margin-bottom: 1.4rem;
}
.cond-intro p { color: #3a4a58; font-size: 0.92rem; line-height: 1.7; margin: 0; }
.cond-intro p + p { margin-top: 0.3rem; }
.cond-date { color: #8a9aaa !important; font-size: 0.8rem !important; font-style: italic; }

.cond-section { margin-bottom: 1.3rem; }
.cond-section h4 {
  display: flex; align-items: center; gap: 0.6rem;
  font-family: 'Merriweather', serif;
  font-size: 0.95rem; font-weight: 700; color: #2f4f6a;
  margin-bottom: 0.7rem;
  padding-bottom: 0.35rem;
  border-bottom: 2px solid rgba(61,96,128,0.12);
}
.cond-num {
  width: 22px; height: 22px; border-radius: 50%;
  background: linear-gradient(160deg, #4a7090, #2f4f6a);
  color: white; font-size: 0.72rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-family: 'Source Sans 3', sans-serif;
}
.cond-section p {
  color: #4a5a6a; font-size: 0.9rem; line-height: 1.72; margin: 0;
}
.cond-list {
  padding-left: 1.1rem; margin: 0;
  display: flex; flex-direction: column; gap: 0.4rem;
}
.cond-list li {
  color: #4a5a6a; font-size: 0.9rem; line-height: 1.65;
  padding-left: 0.2rem;
}

.cond-hint {
  display: flex; align-items: flex-start; gap: 0.65rem;
  background: rgba(245,166,35,0.09); border: 1px solid rgba(245,166,35,0.28);
  border-radius: 10px; padding: 0.85rem 1rem;
  font-size: 0.87rem; color: #5a4a2a; line-height: 1.6;
  margin-top: 0.5rem;
}
.cond-hint-icon { font-size: 1.15rem; flex-shrink: 0; margin-top: 1px; }

.modal-footer {
  padding: 1rem 1.6rem;
  border-top: 1px solid #c8c4bc;
  display: flex; justify-content: flex-end; gap: 0.75rem;
  flex-shrink: 0; background: #e8e4dc;
}
.modal-btn-decline {
  padding: 0.6rem 1.4rem;
  background: transparent; color: #6a7a8a;
  border: 1.5px solid #c8c4bc; border-radius: 8px;
  font-family: 'Source Sans 3', sans-serif;
  font-size: 0.88rem; font-weight: 500; cursor: pointer;
  transition: all 0.2s;
}
.modal-btn-decline:hover { border-color: #a0b0c0; color: #3a4a58; background: rgba(0,0,0,0.04); }
.modal-btn-accept {
  padding: 0.6rem 1.6rem;
  background: linear-gradient(160deg, #4a7090, #2f4f6a);
  color: white; border: none; border-radius: 8px;
  font-family: 'Source Sans 3', sans-serif;
  font-size: 0.9rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 3px 10px rgba(61,96,128,0.3);
}
.modal-btn-accept:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(61,96,128,0.4); }

/* ─── Transitions ─────────────────────────────── */
.fade-slide-enter-active { transition: opacity 0.38s ease, transform 0.38s cubic-bezier(0.22,1,0.36,1); }
.fade-slide-leave-active { transition: opacity 0.2s ease; }
.fade-slide-enter-from   { opacity: 0; transform: translateY(16px); }
.fade-slide-leave-to     { opacity: 0; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* ─── Responsive ──────────────────────────────── */
@media (max-width: 768px) {
  .page-shell { padding: 0; align-items: stretch; }
  .card { flex-direction: column; max-width: 100%; min-height: 100vh; border-radius: 0; box-shadow: none; }
  .panel-left { width: 100%; min-height: 220px; padding: 32px 24px; }
  .right-inner { padding: 28px 20px; }
  .row-2 { grid-template-columns: 1fr; }
  .modal-box { max-height: 92vh; }
  .modal-footer { flex-direction: column-reverse; }
  .modal-btn-decline, .modal-btn-accept { width: 100%; text-align: center; }
}
</style>