<template>
  <div class="page-content">

    <div class="page-header-block">
      <div>
        <h2 class="page-title">Fiche de vœux d'encadrement</h2>
        <p class="page-sub">Exprimez vos préférences pour l'encadrement des PFE</p>
      </div>
      <div class="deadline-chip" :class="{ warn: isExpiringSoon }">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Date limite : {{ formatDate(formulaire.date_limite || formulaire.dateLimite) }}
      </div>
    </div>

    <!-- Message du chef -->
    <div class="message-banner" v-if="formulaire.message">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ formulaire.message }}
    </div>

    <!-- Bannière rôle changé -->
    <div class="role-banner" v-if="roleChange">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <div>
        <strong>Votre rôle a été mis à jour !</strong>
        <p>Vous avez exprimé votre disponibilité à encadrer. Votre rôle est maintenant <strong>Encadrant</strong>. Les fonctions d'encadrement sont maintenant disponibles dans votre tableau de bord.</p>
      </div>
    </div>

    <div class="form-card">

      <!-- Disponibilité -->
      <div class="field-block" v-if="hasChamp('disponibilite')">
        <label class="field-label">Êtes-vous disponible pour encadrer des PFE ? <span class="required">*</span></label>
        <div class="radio-group">
          <label v-for="opt in disponibiliteOpts" :key="opt.val" class="radio-item"
            :class="{ 'radio-selected': form.disponibilite === opt.val }">
            <input type="radio" :value="opt.val" v-model="form.disponibilite" class="radio-hidden"/>
            <span class="radio-icon">{{ opt.icon }}</span>
            <div>
              <div class="radio-label">{{ opt.label }}</div>
              <div class="radio-sub">{{ opt.sub }}</div>
            </div>
          </label>
        </div>
        <p class="err-msg" v-if="errors.disponibilite">{{ errors.disponibilite }}</p>
      </div>

      <!-- Spécialités -->
      <div class="field-block" v-if="hasChamp('specialites') && form.disponibilite !== 'non'">
        <label class="field-label">Spécialités souhaitées <span class="required">*</span></label>
        <p class="field-hint">Sélectionnez les domaines dans lesquels vous souhaitez encadrer</p>
        <div class="champs-grid">
          <label v-for="sp in specialitesDisponibles" :key="sp" class="champ-item"
            :class="{ 'champ-selected': form.specialites.includes(sp) }">
            <input type="checkbox" :value="sp" v-model="form.specialites"/>
            <span>{{ sp }}</span>
          </label>
        </div>
        <p class="err-msg" v-if="errors.specialites">{{ errors.specialites }}</p>
      </div>

      <!-- Nb max étudiants -->
      <div class="field-block" v-if="hasChamp('nbEtudiants') && form.disponibilite !== 'non'">
        <label class="field-label">Nombre maximum d'étudiants à encadrer <span class="required">*</span></label>
        <div class="number-input">
          <button type="button" @click="form.nbEtudiants > 1 && form.nbEtudiants--" class="num-btn">−</button>
          <input type="number" v-model="form.nbEtudiants" class="field-input num-field" min="1" :max="formulaire.nb_max_etudiants || formulaire.nbMax || 10"/>
          <button type="button" @click="form.nbEtudiants < (formulaire.nb_max_etudiants || formulaire.nbMax || 10) && form.nbEtudiants++" class="num-btn">+</button>
          <span class="num-hint">(max {{ formulaire.nb_max_etudiants || formulaire.nbMax || 10 }})</span>
        </div>
      </div>

      <!-- Thèmes -->
      <div class="field-block" v-if="hasChamp('themes') && form.disponibilite !== 'non'">
        <label class="field-label">Thèmes préférés</label>
        <textarea v-model="form.themes" class="field-input field-textarea" rows="2"
          placeholder="Ex: Machine Learning, Sécurité réseau, Développement mobile..."/>
      </div>

      <!-- Co-tutelle -->
      <div class="field-block" v-if="hasChamp('cotutelle')">
        <label class="field-label field-inline">
          <input type="checkbox" v-model="form.cotutelle" class="toggle-check"/>
          <span class="toggle-label">J'accepte une co-tutelle avec un autre enseignant</span>
        </label>
      </div>

      <!-- Commentaires -->
      <div class="field-block" v-if="hasChamp('commentaire')">
        <label class="field-label">Commentaires ou contraintes particulières</label>
        <p class="field-hint">Disponibilité partielle, conditions spécifiques, précisions...</p>
        <textarea v-model="form.commentaire" class="field-input field-textarea" rows="3"
          placeholder="Ex: Je suis disponible uniquement les lundis et mercredis..."/>
      </div>

      <!-- Formulaire verrouillé -->
      <div class="locked-notice" v-if="formulaire.statut === 'verrouille' || formulaire.statut === 'verrouillé'">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Ce formulaire est clôturé. Aucune modification n'est plus possible.
      </div>

      <div class="form-footer" v-if="formulaire.statut !== 'verrouille' && formulaire.statut !== 'verrouillé'">
        <button v-if="!modeSoumissionOnly" class="btn-outline" type="button" @click="sauvegarderBrouillon" :disabled="saving">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
          Sauvegarder en brouillon
        </button>
        <button class="btn-primary" type="button" @click="soumettre" :disabled="saving">
          <span v-if="saving" class="spinner"></span>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Soumettre la fiche
        </button>
      </div>

    </div>

    <!-- Toast local -->
    <transition name="toast-anim">
      <div v-if="localToast.visible" class="local-toast" :class="localToast.type">
        {{ localToast.message }}
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
api.interceptors.request.use(cfg => {
  const u = localStorage.getItem('user')
  if (u) cfg.headers.Authorization = 'Bearer ' + JSON.parse(u).token
  return cfg
})

export default {
  name: 'FicheVoeux',
  props: {
    formulaire:          { type: Object, default: () => ({ champs: [], date_limite: '', nb_max_etudiants: 5, statut: 'publie' }) },
    modeSoumissionOnly:  { type: Boolean, default: false },  // true = pas de bouton brouillon
  },
  emits: ['soumis', 'role-changed'],

  data() {
    return {
      saving: false,
      errors: {},
      roleChange: false,
      localToast: { visible: false, type: '', message: '' },
      disponibiliteOpts: [
        { val: 'oui',      icon: '✅', label: 'Disponible',      sub: 'Je peux encadrer des PFE' },
        { val: 'partielle', icon: '⚡', label: 'Partiellement',   sub: 'Avec contraintes' },
        { val: 'non',       icon: '❌', label: 'Non disponible',  sub: 'Je ne peux pas encadrer' },
      ],
      specialitesDisponibles: [],
      form: {
        disponibilite: '',
        specialites: [],
        nbEtudiants: 3,
        themes: '',
        commentaire: '',
        cotutelle: false,
        statut: 'brouillon',
      }
    }
  },

  computed: {
    isExpiringSoon() {
      const d = this.formulaire.date_limite || this.formulaire.dateLimite
      if (!d) return false
      const diff = (new Date(d) - new Date()) / (1000*60*60*24)
      return diff >= 0 && diff <= 3
    }
  },

  async created() {
    // Charger les spécialités depuis l'API
    try {
      const res = await api.get('/specialites')
      this.specialitesDisponibles = res.data.map(s => s.nom)
    } catch (e) {
      this.specialitesDisponibles = ['Génie Logiciel', 'Réseaux & Télécoms', 'Intelligence Artificielle', 'Sécurité Informatique', 'Systèmes Embarqués', 'Base de Données']
    }

    // Charger le brouillon existant si présent
    if (this.formulaire?.id) {
      try {
        const res = await api.get(`/voeux-encadrement?formulaire_id=${this.formulaire.id}`)
        if (res.data) {
          const v = res.data
          this.form.disponibilite = v.disponibilite || ''
          this.form.specialites   = v.specialites || []
          this.form.nbEtudiants   = v.nbre_etudiants || 3
          this.form.themes        = v.themes || ''
          this.form.commentaire   = v.commentaire || ''
          this.form.cotutelle     = v.cotutelle || false
          this.form.statut        = v.statut || 'brouillon'
        }
      } catch (e) { /* pas de brouillon */ }
    }
  },

  methods: {
    hasChamp(id) {
      const champs = this.formulaire.champs
      if (!champs || champs.length === 0) return true
      return champs.includes(id)
    },
    formatDate(d) {
      if (!d) return '—'
      if (d.includes('/')) return d
      return new Date(d).toLocaleDateString('fr-FR')
    },
    async sauvegarderBrouillon() {
      await this.envoyerVoeu('brouillon')
    },
    async soumettre() {
      this.errors = {}

      // Vérifier disponibilité seulement si le champ est présent
      if (this.hasChamp('disponibilite') && !this.form.disponibilite) {
        this.errors.disponibilite = 'Veuillez indiquer votre disponibilité'
      }

      // Vérifier spécialités seulement si le champ est présent dans le formulaire
      if (this.hasChamp('specialites') && this.form.disponibilite !== 'non' && this.form.specialites.length === 0) {
        this.errors.specialites = 'Sélectionnez au moins une spécialité'
      }

      if (Object.keys(this.errors).length) return

      await this.envoyerVoeu('soumis')
    },

    async envoyerVoeu(statut) {
      if (!this.formulaire?.id) {
        this.toast('Formulaire introuvable. Rechargez la page.', 'toast-err')
        return
      }
      this.saving = true
      try {
        const res = await api.post('/voeux-encadrement', {
          formulaire_id:  this.formulaire.id,
          disponibilite:  this.form.disponibilite || null,
          nbre_etudiants: this.form.nbEtudiants,
          nbre_max_pfe:   this.formulaire.nb_max_etudiants || this.formulaire.nbMax || 3,
          specialites:    this.form.specialites,
          encadrement:    this.form.themes,
          themes:         this.form.themes,
          commentaire:    this.form.commentaire,
          cotutelle:      this.form.cotutelle,
          statut,
        })

        this.form.statut = statut
        const msg = statut === 'soumis' ? 'Vœux soumis avec succès !' : 'Brouillon sauvegardé.'
        this.toast(msg, 'toast-ok')

        if (statut === 'soumis') {
          if (res.data?.role_changed) {
            this.roleChange = true
            const userData = JSON.parse(localStorage.getItem('user') || '{}')
            userData.role = 'encadrant'
            localStorage.setItem('user', JSON.stringify(userData))
            this.$emit('role-changed', 'encadrant')
          }
          this.$emit('soumis', { ...this.form, ...res.data?.voeu })
        }
      } catch (e) {
        const msg = e.response?.data?.message
          || (e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(' ') : null)
          || 'Erreur lors de l\'envoi. Vérifiez votre connexion.'
        this.toast(msg, 'toast-err')
      } finally {
        this.saving = false
      }
    },
    toast(msg, type) {
      this.localToast = { visible: true, message: msg, type }
      setTimeout(() => { this.localToast.visible = false }, 3000)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600&family=Merriweather:wght@700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.page-content { padding: 32px; font-family: 'Source Sans 3', sans-serif; max-width: 720px; }
.page-header-block { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
.page-title { font-family: 'Merriweather', serif; font-size: 20px; color: #1e2a35; margin-bottom: 4px; }
.page-sub { font-size: 13.5px; color: #8a9aaa; }
.deadline-chip { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 20px; font-size: 13px; font-weight: 600; color: #4a5a6a; }
.deadline-chip.warn { background: rgba(245,166,35,0.12); border-color: #d98e1a; color: #d98e1a; }
.message-banner { display: flex; gap: 10px; padding: 14px 16px; background: rgba(61,96,128,0.08); border: 1.5px solid rgba(61,96,128,0.2); border-radius: 10px; margin-bottom: 20px; font-size: 13.5px; color: #3d6080; line-height: 1.5; }
.role-banner { display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: rgba(39,174,96,0.1); border: 1.5px solid rgba(39,174,96,0.3); border-radius: 12px; margin-bottom: 20px; color: #1a6b3a; }
.role-banner strong { display: block; font-size: 14px; margin-bottom: 4px; }
.role-banner p { font-size: 13px; line-height: 1.5; margin: 0; }
.form-card { background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 14px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.field-block { margin-bottom: 22px; }
.field-label { display: block; font-size: 13.5px; font-weight: 600; color: #1e2a35; margin-bottom: 8px; }
.field-hint { font-size: 12px; color: #8a9aaa; margin-bottom: 10px; }
.required { color: #c0392b; }
.field-input { width: 100%; padding: 10px 13px; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 9px; font-size: 13.5px; color: #1e2a35; font-family: inherit; transition: border-color 0.18s; }
.field-input:focus { outline: none; border-color: #3d6080; box-shadow: 0 0 0 3px rgba(61,96,128,0.1); }
.field-textarea { resize: vertical; min-height: 80px; }
.err-msg { color: #c0392b; font-size: 12px; margin-top: 6px; }
.radio-group { display: flex; gap: 10px; flex-wrap: wrap; }
.radio-hidden { display: none; }
.radio-item { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 10px; cursor: pointer; flex: 1; min-width: 140px; transition: all 0.18s; }
.radio-item:hover { border-color: #3d6080; }
.radio-selected { border-color: #3d6080; background: rgba(61,96,128,0.08); }
.radio-icon { font-size: 20px; }
.radio-label { font-size: 13.5px; font-weight: 600; color: #1e2a35; }
.radio-sub { font-size: 12px; color: #8a9aaa; }
.champs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.champ-item { display: flex; align-items: center; gap: 8px; padding: 9px 12px; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 9px; cursor: pointer; font-size: 13.5px; transition: all 0.18s; }
.champ-item:hover { border-color: #3d6080; }
.champ-selected { border-color: #3d6080; background: rgba(61,96,128,0.08); }
.number-input { display: flex; align-items: center; gap: 8px; }
.num-btn { width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid #c8c4bc; background: #e8e4dc; color: #3d6080; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.num-btn:hover { background: #3d6080; color: #fff; }
.num-field { width: 60px; text-align: center; }
.num-hint { font-size: 12px; color: #8a9aaa; }
.field-inline { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.toggle-check { accent-color: #3d6080; width: 16px; height: 16px; }
.toggle-label { font-size: 13.5px; color: #1e2a35; }
.locked-notice { display: flex; align-items: center; gap: 8px; padding: 14px; background: rgba(192,57,43,0.08); border: 1.5px solid rgba(192,57,43,0.2); border-radius: 10px; font-size: 13.5px; color: #922b21; margin-top: 16px; }
.form-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 28px; padding-top: 20px; border-top: 1.5px solid #c8c4bc; }
.btn-primary { display: flex; align-items: center; gap: 8px; padding: 11px 22px; background: #3d6080; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.18s; }
.btn-primary:hover { background: #2f4f6a; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-outline { display: flex; align-items: center; gap: 8px; padding: 11px 18px; background: transparent; border: 1.5px solid #c8c4bc; border-radius: 10px; font-size: 13.5px; color: #4a5a6a; cursor: pointer; font-family: inherit; transition: all 0.18s; }
.btn-outline:hover { border-color: #3d6080; color: #3d6080; }
.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.local-toast { position: fixed; bottom: 24px; right: 24px; padding: 13px 20px; border-radius: 12px; background: #d4edda; color: #155724; font-size: 14px; font-weight: 500; box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 9999; }
.local-toast.toast-err { background: #fde8e8; color: #922b21; }
.toast-anim-enter-active { transition: opacity 0.3s, transform 0.3s; }
.toast-anim-leave-active { transition: opacity 0.2s; }
.toast-anim-enter-from { opacity: 0; transform: translateY(10px); }
.toast-anim-leave-to { opacity: 0; }
</style>