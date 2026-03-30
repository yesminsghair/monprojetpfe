<template>
  <div class="page-shell">
    <div class="card">

      <!-- Panneau gauche -->
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
            Réinitialisez<br/>
            <em>votre mot</em><br/>
            de passe
          </h1>
          <p class="hero-sub">
            Suivez les étapes pour retrouver l'accès à votre espace personnel en toute sécurité.
          </p>
        </div>
        <!-- Indicateur d'étape -->
        <div class="steps-indicator">
          <div v-for="(s, i) in stepsList" :key="i"
            :class="['step-dot', { done: stepIndex > i, current: stepIndex === i }]"
            :title="s">
          </div>
        </div>
        <footer class="left-foot">© 2026 Vers le Diplôme. Tous droits réservés.</footer>
      </aside>

      <!-- Panneau droit -->
      <main class="panel-right">
        <div class="right-inner">
          <transition name="fade-slide" mode="out-in">

            <!-- ══ ÉTAPE A : Saisie email (étapes 3-7) ══ -->
            <div v-if="step === 'email'" key="email">
              <div class="right-header">
                <h2>Mot de passe oublié ?</h2>
                <p>Entrez votre email pour recevoir un lien de réinitialisation</p>
              </div>
              <form @submit.prevent="handleSendEmail" novalidate>
                <div class="field-block">
                  <label class="lbl">Email</label>
                  <input
                    type="email" v-model="email" @blur="validateEmail"
                    :class="{ 'input-err': emailError }"
                    placeholder="exemple@univ.dz" autocomplete="email"
                  />
                  <!-- 6.a champ vide/incorrect | 6.b email inexistant -->
                  <p class="err" v-if="emailError">{{ emailError }}</p>
                </div>
                <!-- Étape 5 : bouton réinitialiser -->
                <button type="submit" class="btn-submit" :disabled="loading">
                  <span v-if="loading" class="spinner"></span>
                  {{ loading ? 'Vérification...' : 'Envoyer le lien de réinitialisation' }}
                </button>
              </form>
            </div>

            <!-- ══ ÉTAPE B : Email envoyé (étapes 7-8) ══ -->
            <div v-else-if="step === 'sent'" key="sent" class="status-box">
              <div class="s-icon s-blue">📩</div>
              <h3>Email envoyé !</h3>
              <p>Un lien de réinitialisation a été envoyé à<br><strong>{{ email }}</strong></p>
              <p class="note">Vérifiez votre boîte de réception et les spams.</p>

              <!-- Simulation clic lien (étape 8-9) -->
              <button class="btn-submit" @click="simulerLienValide" type="button">
                🔗 Simuler le clic sur le lien reçu
              </button>
              <button class="btn-outline" @click="simulerLienExpire" type="button">
                ⏰ Simuler un lien expiré (test)
              </button>

              <div class="resend-row">
                <button class="btn-text" @click="resendEmail" :disabled="resendTimer > 0">
                  {{ resendTimer > 0 ? `Renvoyer dans ${resendTimer}s` : 'Renvoyer le lien' }}
                </button>
                <button class="btn-text" @click="backToEmail">Modifier l'email</button>
              </div>
            </div>

            <!-- ══ ÉTAPE C : Lien expiré (scénario 8.a) ══ -->
            <div v-else-if="step === 'expired'" key="expired" class="status-box">
              <div class="s-icon s-red">⏰</div>
              <h3>Lien expiré</h3>
              <p>Votre lien de réinitialisation a expiré.<br>Veuillez en demander un nouveau.</p>
              <!-- Scénario 8.a : retour étape 7 -->
              <button class="btn-submit" @click="resendAndGoToSent" type="button">
                Renvoyer un nouveau lien
              </button>
            </div>

            <!-- ══ ÉTAPE D : Nouveau mot de passe (étapes 9-12) ══ -->
            <div v-else-if="step === 'newPassword'" key="newPassword">
              <div class="right-header">
                <h2>Nouveau mot de passe</h2>
                <p>Choisissez un mot de passe sécurisé pour votre compte</p>
              </div>
              <form @submit.prevent="handleChangePassword" novalidate>

                <!-- Étape 10 : saisir nouveau mot de passe -->
                <div class="field-block">
                  <label class="lbl">Nouveau mot de passe</label>
                  <div class="pw-wrap">
                    <input
                      :type="showNew ? 'text' : 'password'"
                      v-model="newPassword" @blur="validateNewPassword"
                      :class="{ 'input-err': newPasswordError }"
                      placeholder="Minimum 8 caractères"
                    />
                    <button type="button" class="eye-btn" @click="showNew = !showNew" tabindex="-1">
                      {{ showNew ? '🙈' : '👁️' }}
                    </button>
                  </div>
                  <!-- Indicateur de force -->
                  <div v-if="newPassword" class="strength-bar">
                    <div class="strength-fill" :style="{ width: strength.pct+'%', background: strength.color }"></div>
                  </div>
                  <small v-if="newPassword" class="strength-label" :style="{ color: strength.color }">
                    {{ strength.label }}
                  </small>
                  <!-- 12.a champ vide/incorrect -->
                  <p class="err" v-if="newPasswordError">{{ newPasswordError }}</p>
                </div>

                <div class="field-block">
                  <label class="lbl">Confirmer le mot de passe</label>
                  <div class="pw-wrap">
                    <input
                      :type="showConfirm ? 'text' : 'password'"
                      v-model="confirmPassword" @blur="validateConfirm"
                      :class="{ 'input-err': confirmError }"
                      placeholder="Répétez votre mot de passe"
                    />
                    <button type="button" class="eye-btn" @click="showConfirm = !showConfirm" tabindex="-1">
                      {{ showConfirm ? '🙈' : '👁️' }}
                    </button>
                  </div>
                  <!-- 12.a mots de passe différents -->
                  <p class="err" v-if="confirmError">{{ confirmError }}</p>
                </div>

                <!-- Étape 11 : bouton changer mot de passe -->
                <button type="submit" class="btn-submit" :disabled="loading">
                  <span v-if="loading" class="spinner"></span>
                  {{ loading ? 'Mise à jour...' : 'Changer le mot de passe' }}
                </button>
              </form>
            </div>

            <!-- ══ ÉTAPE E : Succès (étapes 13-14) ══ -->
            <div v-else-if="step === 'success'" key="success" class="status-box">
              <div class="s-icon s-green">✓</div>
              <h3>Mot de passe mis à jour !</h3>
              <!-- Étape 14 : message de succès -->
              <p>Votre mot de passe a été réinitialisé avec succès.<br>Vous pouvez maintenant vous connecter.</p>
              <button class="btn-submit" @click="goToLogin" type="button">Se connecter</button>
            </div>

          </transition>

          <div class="footer-link">
            <router-link to="/login">← Retour à la connexion</router-link>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

const router = useRouter()
const route  = useRoute()   // Pour lire le token et email depuis l'URL

const step     = ref('email')
const email    = ref('')
const emailError = ref('')
const loading  = ref(false)
const resendTimer = ref(0)

const newPassword     = ref('')
const confirmPassword = ref('')
const newPasswordError = ref('')
const confirmError    = ref('')
const showNew    = ref(false)
const showConfirm = ref(false)

const stepsList = ['Email', 'Lien envoyé', 'Nouveau mot de passe', 'Succès']
const stepIndex = computed(() => ({ email:0, sent:1, expired:1, newPassword:2, success:3 }[step.value] ?? 0))

// resetToken et email lus depuis l'URL quand l'utilisateur arrive via le lien email
const resetToken = route.params.token || ''
const resetEmail = route.query.email || ''
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Indicateur de force
const strength = computed(() => {
  const p = newPassword.value; if (!p) return { pct:0, color:'#e2e8f0', label:'' }
  let s = 0
  if (p.length >= 8) s++; if (p.length >= 12) s++
  if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++
  return [
    { pct:20, color:'#e74c3c', label:'Très faible' },
    { pct:40, color:'#e67e22', label:'Faible' },
    { pct:60, color:'#f5a623', label:'Moyen' },
    { pct:80, color:'#27ae60', label:'Fort' },
    { pct:100,color:'#1e8449', label:'Très fort' },
  ][Math.min(s, 4)]
})

// ── Validations
const validateEmail = () => {
  if (!email.value) emailError.value = "L'email est obligatoire"
  else if (!emailRegex.test(email.value)) emailError.value = "Format d'email invalide"
  else emailError.value = ''
}
const validateNewPassword = () => {
  if (!newPassword.value) newPasswordError.value = 'Le mot de passe est obligatoire'
  else if (newPassword.value.length < 8) newPasswordError.value = 'Minimum 8 caractères requis'
  else newPasswordError.value = ''
}
const validateConfirm = () => {
  if (!confirmPassword.value) confirmError.value = 'Veuillez confirmer votre mot de passe'
  else if (confirmPassword.value !== newPassword.value) confirmError.value = 'Les mots de passe ne correspondent pas'
  else confirmError.value = ''
}

// ── Handlers
const handleSendEmail = async () => {
  validateEmail()
  if (emailError.value) return           // 6.a champ vide/invalide
  loading.value = true
  try {
    await api.post('/forgot-password', { email: email.value })
    // Même réponse succès si email existe ou non (sécurité)
    step.value = 'sent'                  // Étape 7 : lien envoyé
    startResendTimer()
  } catch (e) {
    emailError.value = "Erreur de connexion. Réessayez plus tard."
  } finally {
    loading.value = false
  }
}

// Si l'URL contient un token de reset (l'utilisateur arrive via le lien email)
// On passe directement à l'étape 'newPassword'
if (resetToken && resetEmail) {
  step.value = 'newPassword'
}

const resendAndGoToSent = () => { step.value = 'sent'; startResendTimer() }

const handleChangePassword = async () => {
  validateNewPassword(); validateConfirm()
  if (newPasswordError.value || confirmError.value) return   // 12.a
  loading.value = true
  try {
    await api.post('/reset-password', {
      email:    resetEmail,
      token:    resetToken,
      password: newPassword.value,
    })
    step.value = 'success'               // Étape 13-14
  } catch (e) {
    if (e.response?.data?.message === 'expired') {
      step.value = 'expired'             // Scénario 8.a : lien expiré
    } else {
      newPasswordError.value = e.response?.data?.message || "Erreur. Réessayez."
    }
  } finally {
    loading.value = false
  }
}

const backToEmail  = () => { step.value = 'email'; emailError.value = '' }
const resendEmail = async () => {
  if (resendTimer.value > 0) return
  try {
    await api.post('/forgot-password', { email: email.value })
  } catch (e) { /* silencieux */ }
  startResendTimer()
}
const goToLogin    = () => router.push('/login')

const startResendTimer = () => {
  resendTimer.value = 30
  const iv = setInterval(() => { resendTimer.value--; if (resendTimer.value <= 0) clearInterval(iv) }, 1000)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,700;1,700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

.page-shell {
  min-height:100vh; background:#c8c4bc;
  display:flex; align-items:center; justify-content:center;
  padding:32px 16px; font-family:'Source Sans 3',sans-serif;
}
.card {
  display:flex; width:100%; max-width:980px; min-height:580px;
  border-radius:18px; overflow:hidden;
  box-shadow:0 20px 60px rgba(0,0,0,0.25);
  animation:cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes cardIn { from{opacity:0;transform:translateY(20px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }

/* LEFT */
.panel-left {
  width:40%;
  background:linear-gradient(160deg,#4a7090 0%,#3d6080 30%,#2f4f6a 65%,#243d52 100%);
  padding:48px 40px; display:flex; flex-direction:column; position:relative; overflow:hidden;
}
.geo { position:absolute;inset:0;width:100%;height:100%;pointer-events:none; }
.left-content { position:relative;z-index:1;flex:1;display:flex;flex-direction:column; }
.logo { font-family:'Merriweather',serif;font-size:22px;font-weight:700;margin-bottom:40px;text-decoration:none;display:inline-block; }
.logo-white { color:#fff; }
.logo-gold  { color:#f5a623;margin-left:6px; }
.hero { font-family:'Merriweather',serif;font-size:26px;font-weight:700;color:#fff;line-height:1.3;margin-bottom:20px;flex:1; }
.hero em { font-style:italic;color:#f5a623; }
.hero-sub { font-size:13px;font-weight:300;color:rgba(255,255,255,0.6);line-height:1.7; }

/* Step indicator */
.steps-indicator { display:flex;gap:8px;align-items:center;margin-top:28px;position:relative;z-index:1; }
.step-dot { width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.2);transition:all 0.3s; }
.step-dot.done { background:#f5a623; }
.step-dot.current { background:#fff;transform:scale(1.3); }

.left-foot { font-size:11.5px;color:rgba(255,255,255,0.3);margin-top:16px;position:relative;z-index:1; }

/* RIGHT */
.panel-right { flex:1;background:#ddd9d1;overflow-y:auto; }
.right-inner { padding:44px 40px; }
.right-header { margin-bottom:26px; }
.right-header h2 { font-family:'Merriweather',serif;font-size:24px;font-weight:700;color:#1e2a35;margin-bottom:5px; }
.right-header p  { font-size:14px;color:#8a9aaa;font-weight:300; }

/* Fields */
.field-block { margin-bottom:16px; }
.lbl { display:block;margin-bottom:6px;font-size:14px;font-weight:500;color:#3d5a72; }
input {
  width:100%;padding:12px 14px;
  border:1.5px solid #c8c4bc;border-radius:10px;
  background:#e8e4dc;font-size:14.5px;color:#1e2a35;
  font-family:'Source Sans 3',sans-serif;transition:all 0.2s;
}
input:focus { outline:none;border-color:#3d6080;background:#fff;box-shadow:0 0 0 3px rgba(61,96,128,0.12); }
.input-err { border-color:#e74c3c !important;background:#fdf2f2; }
.err { font-size:12px;color:#e74c3c;margin-top:5px; }

.pw-wrap { position:relative; }
.pw-wrap input { padding-right:42px; }
.eye-btn { position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:15px;padding:0; }

/* Strength */
.strength-bar { height:4px;background:#c8c4bc;border-radius:4px;margin-top:8px;overflow:hidden; }
.strength-fill { height:100%;border-radius:4px;transition:all 0.3s; }
.strength-label { display:block;font-size:11px;margin-top:4px;font-weight:600; }

/* Buttons */
.btn-submit {
  width:100%;padding:13px;margin-top:6px;
  background:linear-gradient(160deg,#4a7090,#2f4f6a);
  color:#fff;border:none;border-radius:10px;
  font-size:15px;font-weight:600;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:8px;
  transition:all 0.2s;box-shadow:0 4px 14px rgba(61,96,128,0.3);
  font-family:'Source Sans 3',sans-serif;
}
.btn-submit:hover:not(:disabled) { transform:translateY(-1px);box-shadow:0 6px 18px rgba(61,96,128,0.4); }
.btn-submit:disabled { background:#aaa49c;box-shadow:none;cursor:not-allowed; }

.btn-outline {
  width:100%;padding:12px;margin-top:10px;
  background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:10px;
  font-size:14px;font-weight:600;color:#4a5a6a;cursor:pointer;
  transition:all 0.2s;font-family:'Source Sans 3',sans-serif;
}
.btn-outline:hover { border-color:#3d6080;color:#3d6080; }

.resend-row { display:flex;gap:12px;justify-content:center;margin-top:16px; }
.btn-text { background:none;border:none;cursor:pointer;font-size:13px;color:#3d6080;font-weight:500;padding:4px;font-family:'Source Sans 3',sans-serif; }
.btn-text:disabled { color:#aaa49c;cursor:not-allowed; }
.btn-text:hover:not(:disabled) { text-decoration:underline; }

/* Status box */
.status-box { text-align:center;padding:10px 0; }
.s-icon {
  width:72px;height:72px;border-radius:50%;margin:0 auto 20px;
  display:flex;align-items:center;justify-content:center;font-size:30px;
}
.s-green { background:linear-gradient(135deg,#27ae60,#1e8449);box-shadow:0 10px 20px rgba(39,174,96,0.3); }
.s-blue  { background:linear-gradient(135deg,#3d6080,#2f4f6a);box-shadow:0 10px 20px rgba(61,96,128,0.3); }
.s-red   { background:linear-gradient(135deg,#e74c3c,#c0392b);box-shadow:0 10px 20px rgba(231,76,60,0.3); }
.status-box h3 { font-family:'Merriweather',serif;font-size:22px;color:#1e2a35;margin-bottom:10px; }
.status-box p  { font-size:14px;color:#8a9aaa;line-height:1.6;margin-bottom:8px;font-weight:300; }
.status-box p strong { color:#3d6080;font-weight:600; }
.note { background:#e8e4dc;border-radius:8px;padding:10px;font-size:13px;margin-bottom:18px; }

.footer-link { margin-top:24px;text-align:center; }
.footer-link a { font-size:13px;color:#8a9aaa;text-decoration:none;transition:color 0.2s; }
.footer-link a:hover { color:#3d6080; }

.spinner { width:15px;height:15px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block; }
@keyframes spin { to { transform:rotate(360deg); } }

/* Transitions */
.fade-slide-enter-active { transition:opacity 0.3s,transform 0.3s cubic-bezier(0.22,1,0.36,1); }
.fade-slide-leave-active { transition:opacity 0.15s; }
.fade-slide-enter-from   { opacity:0;transform:translateY(12px); }
.fade-slide-leave-to     { opacity:0; }

@media (max-width:700px) {
  .card { flex-direction:column;max-width:440px; }
  .panel-left { width:100%;min-height:160px;padding:28px 24px 20px; }
  .hero { font-size:18px;flex:none;margin-bottom:8px; }
  .hero-sub { display:none; }
  .right-inner { padding:28px 22px; }
}
</style>