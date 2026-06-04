<template>
  <div class="page-shell">
    <div class="card">
      <!-- Chargement -->
      <div v-if="status === 'loading'" class="state-box">
        <div class="spinner"></div>
        <p>Vérification de votre email en cours…</p>
      </div>

      <!-- Succès -->
      <div v-else-if="status === 'success'" class="state-box success">
        <div class="icon">✅</div>
        <h2>Email confirmé !</h2>
        <p>Votre adresse email a été vérifiée avec succès.<br/>
          Votre compte est maintenant en attente de validation par un administrateur.</p>
        <button class="btn-gold" @click="$router.push('/login')">Aller à la connexion</button>
      </div>

      <!-- Expiré -->
      <div v-else-if="status === 'expired'" class="state-box expired">
        <div class="icon">⏱</div>
        <h2>Lien expiré</h2>
        <p>Votre lien de validation a expiré (valable 24h).<br/>
          Veuillez recommencer l'inscription.</p>
        <button class="btn-gold" @click="$router.push('/inscription')">Recommencer l'inscription</button>
      </div>

      <!-- Erreur -->
      <div v-else class="state-box error">
        <div class="icon">❌</div>
        <h2>Lien invalide</h2>
        <p>Ce lien de confirmation est invalide ou déjà utilisé.</p>
        <button class="btn-gold" @click="$router.push('/login')">Retour à la connexion</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

export default {
  name: 'VerifyEmail',
  data() {
    return { status: 'loading' }//fonction qui retourne le statut de composant ici loading càd verifi en cours
  },
  async mounted() {//hook de cycle de vie
    const token = this.$route.params.token//objet de vue router contenant les infos de la route actuelle 
    try {
      await api.get(`/verify-email/${token}`)//on prend le token et l'envoi au backend pour l'informer que l'utilisateur a clické le lien
      this.status = 'success'//si req reussie en change le statut en succes pour afficher le templace de reussi
    } catch (e) {//une erreu se produise
      if (e.response?.status === 410 || e.response?.data?.message === 'expired') {//si 410: gone email l'utilisateur n'a pas verifé son email et son compte à ete supprimé
        this.status = 'expired'//statut expired on affiche le template d'expiration
      } else {
        this.status = 'error'//else erreur de connexion..
      }
    }
  },
}
</script>

<style scoped>
.page-shell { min-height:100vh; background:#c8c4bc; display:flex; align-items:center; justify-content:center; font-family:'Source Sans 3', sans-serif; }
.card { background:#fff; border-radius:16px; padding:60px 40px; max-width:500px; width:100%; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
.state-box { display:flex; flex-direction:column; align-items:center; gap:16px; }
.icon { font-size:56px; }
h2 { font-size:22px; color:#2E4057; margin:0; }
p { color:#5a7a99; font-size:15px; line-height:1.7; margin:0; }
.spinner { width:48px; height:48px; border:4px solid #e2e8f0; border-top-color:#3D6080; border-radius:50%; animation:spin 0.8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.btn-gold { margin-top:8px; background:linear-gradient(135deg,#C9A84C,#B8942A); color:#fff; border:none; padding:12px 32px; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer; }
.btn-gold:hover { opacity:0.9; }
</style>