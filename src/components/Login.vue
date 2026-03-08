<template>
  <div class="page-shell">
    <div class="card">

      <!-- Panneau gauche (même que Inscription) -->
      <aside class="panel-left">
        <svg class="geo" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="340" cy="70"  r="130" fill="rgba(255,255,255,0.04)"/>
          <circle cx="50"  cy="500" r="170" fill="rgba(255,255,255,0.03)"/>
          <circle cx="380" cy="400" r="90"  fill="rgba(255,255,255,0.03)"/>
          <line x1="0" y1="580" x2="400" y2="20" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        </svg>
        <div class="left-content">
          <router-link to="/" class="logo">
            <span class="logo-white">Vers le</span><span class="logo-gold">Diplôme</span>
          </router-link>
          <h1 class="hero">
            Accédez à<br/>
            <em>votre espace</em><br/>
            personnel
          </h1>
          <p class="hero-sub">
            Gérez vos projets de fin d'études avec une plateforme moderne.
            Suivi, évaluation et collaboration en temps réel.
          </p>
        </div>
        <footer class="left-foot">© 2026 Vers le Diplôme. Tous droits réservés.</footer>
      </aside>

      <!-- Panneau droit -->
      <main class="panel-right">
        <div class="right-inner">

          <div class="right-header">
            <h2>Connexion</h2>
            <p>Entrez vos identifiants pour accéder à votre espace</p>
          </div>

          <form @submit.prevent="handleLogin" novalidate>

            <div class="field-block">
              <label class="lbl">Email</label>
              <input
                type="email"
                v-model="email"
                @blur="validateEmail"
                :class="{ 'input-err': emailError }"
                placeholder="exemple@univ.dz"
                autocomplete="email"
              />
              <p class="err" v-if="emailError">{{ emailError }}</p>
            </div>

            <div class="field-block">
              <label class="lbl">Mot de passe</label>
              <div class="pw-wrap">
                <input
                  :type="showPw ? 'text' : 'password'"
                  v-model="password"
                  @blur="validatePassword"
                  :class="{ 'input-err': passwordError }"
                  placeholder="Votre mot de passe"
                  autocomplete="current-password"
                />
                <!-- Icône œil uniquement (sans emoji singe) -->
                <button type="button" class="eye-btn" @click="showPw = !showPw" tabindex="-1" :aria-label="showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
                  <svg v-if="showPw" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <p class="err" v-if="passwordError">{{ passwordError }}</p>
            </div>

            <div class="forgot-row">
              <router-link to="/reset-password" class="forgot-link">Mot de passe oublié ?</router-link>
            </div>

            <button type="submit" class="btn-submit" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Vérification...' : 'Se connecter' }}
            </button>

          </form>

          <!-- ✅ NOUVEAU : lien vers la page d'accueil -->
          <div class="home-link-row">
            <router-link to="/" class="home-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Retour à l'accueil
            </router-link>
          </div>

          <p class="switch-link">
            Pas encore de compte ?
            <router-link to="/inscription">S'inscrire</router-link>
          </p>

          <!-- Comptes de test -->
          <div class="test-accounts">
            <p class="test-title">🔑 Comptes de test</p>
            <div class="test-grid">
              <button class="test-btn" v-for="c in testComptes" :key="c.email"
                @click="fillCompte(c)" type="button">
                <span class="test-role">{{ c.label }}</span>
                <span class="test-email">{{ c.email }}</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router  = useRouter()
const email   = ref('')
const password = ref('')
const emailError   = ref('')
const passwordError = ref('')
const loading = ref(false)
const showPw  = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const COMPTES = [
  { email: 'admin@gmail.com',      password: 'admin123', role: 'admin',      label: 'Admin'       },
  { email: 'directeur@univ.dz',    password: 'dir123',   role: 'directeur',  label: 'Directeur'   },
  { email: 'etudiant@univ.dz',     password: 'etu123',   role: 'etudiant',   label: 'Étudiant'    },
  { email: 'enseignant@univ.dz',   password: 'ens123',   role: 'enseignant', label: 'Enseignant'  },
]

const testComptes = COMPTES

const fillCompte = (c) => {
  email.value    = c.email
  password.value = c.password
  emailError.value = ''
  passwordError.value = ''
}

const validateEmail = () => {
  if (!email.value)
    emailError.value = "L'email est obligatoire"
  else if (!emailRegex.test(email.value))
    emailError.value = "Format d'email invalide"
  else
    emailError.value = ''
}

const validatePassword = () => {
  if (!password.value)
    passwordError.value = 'Le mot de passe est obligatoire'
  else if (password.value.length < 6)
    passwordError.value = 'Minimum 6 caractères'
  else
    passwordError.value = ''
}

const handleLogin = () => {
  emailError.value    = ''
  passwordError.value = ''
  validateEmail()
  validatePassword()
  if (emailError.value || passwordError.value) return

  loading.value = true

  setTimeout(() => {
    loading.value = false

    const emailExists = COMPTES.some(c => c.email === email.value)
    if (!emailExists) {
      emailError.value = "Aucun compte trouvé avec cet email"
      return
    }

    const compte = COMPTES.find(
      c => c.email === email.value && c.password === password.value
    )
    if (!compte) {
      passwordError.value = 'Mot de passe incorrect'
      return
    }

    localStorage.setItem('user', JSON.stringify({
      email: compte.email, role: compte.role, isAdmin: compte.role === 'admin'
    }))
    const routes = {
      admin: '/admin', directeur: '/dashboard',
      etudiant: '/dashboard', enseignant: '/dashboard',
    }
    router.push(routes[compte.role] ?? '/dashboard')
  }, 800)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,700;1,700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.page-shell {
  min-height: 100vh;
  background: #c8c4bc;
  display: flex; align-items: center; justify-content: center;
  padding: 32px 16px;
  font-family: 'Source Sans 3', sans-serif;
}

/* ── CARD ── */
.card {
  display: flex; width: 100%; max-width: 980px; min-height: 580px;
  border-radius: 18px; overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes cardIn {
  from { opacity:0; transform:translateY(20px) scale(0.98); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}

/* ── LEFT PANEL ── */
.panel-left {
  width: 40%;
  background: linear-gradient(160deg, #4a7090 0%, #3d6080 30%, #2f4f6a 65%, #243d52 100%);
  padding: 48px 40px;
  display: flex; flex-direction: column; position: relative; overflow: hidden;
}
.geo { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
.left-content { position:relative; z-index:1; flex:1; display:flex; flex-direction:column; }

.logo {
  font-family: 'Merriweather', serif; font-size: 22px; font-weight: 700;
  margin-bottom: 40px; text-decoration: none; display: inline-block;
}
.logo-white { color: #fff; }
.logo-gold  { color: #f5a623; margin-left: 6px; }

.hero {
  font-family: 'Merriweather', serif; font-size: 28px; font-weight: 700;
  color: #fff; line-height: 1.3; margin-bottom: 24px; flex: 1;
}
.hero em { font-style: italic; color: #f5a623; }
.hero-sub { font-size: 13.5px; font-weight: 300; color: rgba(255,255,255,0.6); line-height: 1.72; }
.left-foot { font-size: 11.5px; color: rgba(255,255,255,0.3); margin-top: 28px; position:relative; z-index:1; }

/* ── RIGHT PANEL ── */
.panel-right { flex:1; background: #ddd9d1; overflow-y: auto; }
.right-inner { padding: 44px 40px; }
.right-header { margin-bottom: 28px; }
.right-header h2 {
  font-family: 'Merriweather', serif; font-size: 26px; font-weight: 700;
  color: #1e2a35; margin-bottom: 5px;
}
.right-header p { font-size: 14px; color: #8a9aaa; font-weight: 300; }

/* ── FIELDS ── */
.field-block { margin-bottom: 16px; }
.lbl { display:block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #3d5a72; }

input {
  width: 100%; padding: 12px 14px;
  border: 1.5px solid #c8c4bc; border-radius: 10px;
  background: #e8e4dc; font-size: 14.5px; color: #1e2a35;
  font-family: 'Source Sans 3', sans-serif;
  transition: all 0.2s;
}
input:focus { outline:none; border-color: #3d6080; background: #fff; box-shadow: 0 0 0 3px rgba(61,96,128,0.12); }
.input-err  { border-color: #e74c3c !important; background: #fdf2f2; }
.err { font-size: 12px; color: #e74c3c; margin-top: 5px; }

.pw-wrap { position:relative; }
.pw-wrap input { padding-right: 46px; }
.eye-btn {
  position:absolute; right:10px; top:50%; transform:translateY(-50%);
  background:none; border:none; cursor:pointer; padding:4px;
  color: #8a9aaa; display:flex; align-items:center; justify-content:center;
  transition: color 0.18s;
}
.eye-btn:hover { color: #3d6080; }

.forgot-row { text-align:right; margin-bottom: 18px; }
.forgot-link { font-size: 13px; color: #3d6080; text-decoration:none; font-weight:500; }
.forgot-link:hover { text-decoration: underline; }

/* ── SUBMIT ── */
.btn-submit {
  width: 100%; padding: 13px;
  background: linear-gradient(160deg, #4a7090, #2f4f6a);
  color: #fff; border: none; border-radius: 10px;
  font-size: 15px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px;
  box-shadow: 0 4px 14px rgba(61,96,128,0.3);
  font-family: 'Source Sans 3', sans-serif;
}
.btn-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 18px rgba(61,96,128,0.4); }
.btn-submit:disabled { background: #aaa49c; box-shadow:none; cursor:not-allowed; }

.spinner {
  width:15px; height:15px; border:2px solid rgba(255,255,255,0.4);
  border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block;
}
@keyframes spin { to { transform:rotate(360deg); } }

/* ── LIEN ACCUEIL ── */
.home-link-row {
  margin-top: 14px; text-align: center;
}
.home-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; color: #8a9aaa; text-decoration: none;
  font-weight: 500; transition: color 0.18s;
}
.home-link:hover { color: #3d6080; }

.switch-link { margin-top:12px; text-align:center; font-size:14px; color:#8a9aaa; }
.switch-link a { color:#3d6080; font-weight:600; text-decoration:none; }
.switch-link a:hover { text-decoration:underline; }

/* ── TEST ACCOUNTS ── */
.test-accounts {
  margin-top: 22px; padding: 14px 16px;
  background: #e8e4dc; border-radius: 12px;
  border: 1.5px dashed #c8c4bc;
}
.test-title { font-size: 12px; font-weight: 600; color: #8a9aaa; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
.test-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
.test-btn   {
  padding: 8px 10px; background: #ddd9d1; border: 1.5px solid #c8c4bc;
  border-radius: 8px; cursor:pointer; text-align:left; transition:all 0.18s;
  display:flex; flex-direction:column; gap:2px;
}
.test-btn:hover { border-color:#3d6080; background:#d4d0c8; }
.test-role  { font-size: 11px; font-weight: 700; color: #3d6080; text-transform: uppercase; letter-spacing: 0.5px; }
.test-email { font-size: 11.5px; color: #8a9aaa; }

/* ── RESPONSIVE ── */
@media (max-width: 700px) {
  .card { flex-direction: column; max-width: 440px; }
  .panel-left { width: 100%; min-height: 180px; padding: 30px 24px 24px; }
  .hero { font-size: 20px; flex:none; margin-bottom: 10px; }
  .hero-sub { display: none; }
  .right-inner { padding: 28px 22px; }
  .test-grid { grid-template-columns: 1fr; }
}
</style>