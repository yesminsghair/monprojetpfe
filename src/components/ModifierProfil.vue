<template>
  <div class="modifier-page">

    <!-- Toast -->
    <transition name="toast-anim">
      <div v-if="toast.visible" class="global-toast" :class="toast.type">
        <svg v-if="toast.type==='toast-ok'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <!-- En-tête -->
    <div class="modifier-topbar">
      <button class="btn-back" @click="$emit('annuler')">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Retour au profil
      </button>
      <div class="topbar-title">
        <h1 class="page-title">Modifier mon profil</h1>
        <p class="page-sub">Mettez à jour vos informations personnelles</p>
      </div>
    </div>

    <!-- ══ FORMULAIRE ══ -->
    <div class="form-grid">

      <!-- Bloc : Informations personnelles -->
      <div class="form-card">
        <div class="form-card-header">
          <div class="fcard-icon fcard-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h2 class="form-card-title">Informations personnelles</h2>
        </div>
        <div class="form-card-body">
          <div class="fields-row">
            <div class="field-block">
              <label class="lbl">Prénom <span class="req">*</span></label>
              <input v-model="form.prenom" type="text" placeholder="Votre prénom" :class="{ 'input-err': errors.prenom }"/>
              <p class="err" v-if="errors.prenom">{{ errors.prenom }}</p>
            </div>
            <div class="field-block">
              <label class="lbl">Nom <span class="req">*</span></label>
              <input v-model="form.nom" type="text" placeholder="Votre nom" :class="{ 'input-err': errors.nom }"/>
              <p class="err" v-if="errors.nom">{{ errors.nom }}</p>
            </div>
          </div>
          <div class="field-block">
            <label class="lbl">Établissement</label>
            <input v-model="form.etablissement" type="text" placeholder="Votre établissement"/>
          </div>
          <!-- Domaine expertise (encadrant/enseignant) -->
          <div class="field-block" v-if="['encadrant','enseignant'].includes(userRole)">
            <label class="lbl">Domaine d'expertise</label>
            <input v-model="form.domaine_expertise" type="text" placeholder="Ex : Intelligence Artificielle, Réseaux..."/>
          </div>
        </div>
      </div>

      <!-- Bloc : Coordonnées -->
      <div class="form-card">
        <div class="form-card-header">
          <div class="fcard-icon fcard-gold">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <h2 class="form-card-title">Coordonnées</h2>
        </div>
        <div class="form-card-body">
          <div class="field-block">
            <label class="lbl">Email <span class="req">*</span></label>
            <input v-model="form.email" type="email" placeholder="votre@email.tn" :class="{ 'input-err': errors.email }"/>
            <p class="err" v-if="errors.email">{{ errors.email }}</p>
          </div>
          <div class="field-block">
            <label class="lbl">Matricule</label>
            <input v-model="form.matricule" type="text" placeholder="Ex : ETU-2024-001"/>
          </div>
        </div>
      </div>

      <!-- Bloc : Mot de passe -->
      <div class="form-card form-card-full">
        <div class="form-card-header">
          <div class="fcard-icon fcard-slate">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 class="form-card-title">Changer le mot de passe</h2>
          <span class="optional-hint">Laissez vide pour garder le mot de passe actuel</span>
        </div>
        <div class="form-card-body">
          <div class="fields-row">
            <div class="field-block">
              <label class="lbl">Mot de passe actuel</label>
              <div class="pw-wrap">
                <input :type="showPw.current ? 'text' : 'password'" v-model="form.motDePasseActuel" placeholder="Mot de passe actuel" :class="{ 'input-err': errors.motDePasseActuel }"/>
                <button type="button" class="eye-btn" @click="showPw.current = !showPw.current">
                  <svg v-if="showPw.current" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <p class="err" v-if="errors.motDePasseActuel">{{ errors.motDePasseActuel }}</p>
            </div>
            <div class="field-block">
              <label class="lbl">Nouveau mot de passe</label>
              <div class="pw-wrap">
                <input :type="showPw.new ? 'text' : 'password'" v-model="form.nouveauMotDePasse" placeholder="Nouveau mot de passe" :class="{ 'input-err': errors.nouveauMotDePasse }"/>
                <button type="button" class="eye-btn" @click="showPw.new = !showPw.new">
                  <svg v-if="showPw.new" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <div v-if="form.nouveauMotDePasse" class="pw-rules">
                <span class="pw-rule" :class="pwRule(form.nouveauMotDePasse.length >= 8)"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 8 car. min</span>
                <span class="pw-rule" :class="pwRule(/[A-Z]/.test(form.nouveauMotDePasse))"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Majuscule</span>
                <span class="pw-rule" :class="pwRule(/[0-9]/.test(form.nouveauMotDePasse))"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Chiffre</span>
              </div>
              <p class="err" v-if="errors.nouveauMotDePasse">{{ errors.nouveauMotDePasse }}</p>
            </div>
            <div class="field-block">
              <label class="lbl">Confirmer le mot de passe</label>
              <div class="pw-wrap">
                <input :type="showPw.confirm ? 'text' : 'password'" v-model="form.confirmerMotDePasse" placeholder="Confirmer" :class="{ 'input-err': errors.confirmerMotDePasse }"/>
                <button type="button" class="eye-btn" @click="showPw.confirm = !showPw.confirm">
                  <svg v-if="showPw.confirm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <p class="err" v-if="errors.confirmerMotDePasse">{{ errors.confirmerMotDePasse }}</p>
              <p class="pw-match ok" v-if="form.nouveauMotDePasse && form.confirmerMotDePasse && form.nouveauMotDePasse === form.confirmerMotDePasse">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Les mots de passe correspondent
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ══ ACTIONS ══ -->
    <div class="form-actions">
      <button class="btn-cancel" @click="$emit('annuler')">Annuler</button>
      <button class="btn-save" @click="sauvegarder" :disabled="saving">
        <span v-if="saving" class="spinner"></span>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        {{ saving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
      </button>
    </div>

  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ModifierProfil',
  emits: ['annuler', 'sauvegarde'],
  props: {
    user: { type: Object, default: () => ({}) },
  },
  data() {
    const stored = JSON.parse(localStorage.getItem('user') || '{}')
    return {
      saving: false,
      userRole: stored.role || '',
      showPw: { current: false, new: false, confirm: false },
      errors: {},
      toast: { visible: false, type: 'toast-ok', message: '' },
      form: {
        prenom:              this.user.prenom             || stored.prenom || '',
        nom:                 this.user.nom                || stored.nom    || '',
        email:               this.user.email              || stored.email  || '',
        matricule:           this.user.matricule          || stored.matricule || '',
        etablissement:       this.user.etablissement      || '',
        domaine_expertise:   this.user.domaine_expertise  || '',
        motDePasseActuel:    '',
        nouveauMotDePasse:   '',
        confirmerMotDePasse: '',
      },
    }
  },
  methods: {
    pwRule(ok) { return ok ? 'rule-ok' : 'rule-no' },

    valider() {
      this.errors = {}
      if (!this.form.prenom.trim()) this.errors.prenom = 'Le prénom est requis.'
      if (!this.form.nom.trim())    this.errors.nom    = 'Le nom est requis.'
      if (!this.form.email.trim())  this.errors.email  = "L'email est requis."
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email))
        this.errors.email = "Format d'email invalide."

      if (this.form.nouveauMotDePasse || this.form.confirmerMotDePasse || this.form.motDePasseActuel) {
        if (!this.form.motDePasseActuel)
          this.errors.motDePasseActuel = 'Veuillez saisir votre mot de passe actuel.'
        if (!this.form.nouveauMotDePasse)
          this.errors.nouveauMotDePasse = 'Veuillez saisir un nouveau mot de passe.'
        else if (this.form.nouveauMotDePasse.length < 8)
          this.errors.nouveauMotDePasse = 'Minimum 8 caractères.'
        if (this.form.nouveauMotDePasse && this.form.nouveauMotDePasse !== this.form.confirmerMotDePasse)
          this.errors.confirmerMotDePasse = 'Les mots de passe ne correspondent pas.'
      }
      return Object.keys(this.errors).length === 0
    },

    async sauvegarder() {
      if (!this.valider()) return
      this.saving = true

      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      const headers = {
        'Authorization': `Bearer ${stored.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }

      try {
        // 1. Mettre à jour les infos du profil
        const res = await axios.put(
          `http://127.0.0.1:8000/api/utilisateurs/${stored.id}`,
          {
            nom:               this.form.nom.trim(),
            prenom:            this.form.prenom.trim(),
            email:             this.form.email.trim(),
            matricule:         this.form.matricule.trim(),
            etablissement:     this.form.etablissement.trim(),
            domaine_expertise: this.form.domaine_expertise.trim(),
          },
          { headers }
        )

        // 2. Mettre à jour le mot de passe si rempli
        if (this.form.nouveauMotDePasse) {
          await axios.post(
            'http://127.0.0.1:8000/api/change-password',
            {
              current_password: this.form.motDePasseActuel,
              password:         this.form.nouveauMotDePasse,
            },
            { headers }
          )
        }

        // 3. Mettre à jour le localStorage avec les nouvelles données
        const updated = { ...stored, ...res.data }
        localStorage.setItem('user', JSON.stringify(updated))

        this.afficherToast('toast-ok', 'Profil mis à jour avec succès !')
        this.$emit('sauvegarde', updated)
        setTimeout(() => this.$emit('annuler'), 1200)

      } catch (e) {
        const msg = e.response?.data?.message || ''
        if (e.response?.status === 422) {
          const errs = e.response.data.errors || {}
          if (errs.email) this.errors.email = errs.email[0]
          if (errs.nom)   this.errors.nom   = errs.nom[0]
          if (msg.includes('mot de passe') || msg.includes('password'))
            this.errors.motDePasseActuel = 'Mot de passe actuel incorrect.'
        } else if (msg.includes('password') || msg.includes('mot de passe')) {
          this.errors.motDePasseActuel = 'Mot de passe actuel incorrect.'
        } else {
          this.afficherToast('toast-err', "Erreur lors de la mise à jour. Réessayez.")
        }
      } finally {
        this.saving = false
      }
    },

    afficherToast(type, message) {
      this.toast = { visible: true, type, message }
      setTimeout(() => { this.toast.visible = false }, 3500)
    },
  },
}
</script>

<style scoped>
.modifier-page { padding: 0; animation: fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
.global-toast { position: fixed; top: 22px; right: 22px; z-index: 9999; display: flex; align-items: center; gap: 10px; padding: 13px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; box-shadow: 0 8px 24px rgba(0,0,0,0.16); max-width: 380px; font-family: 'Source Sans 3', sans-serif; }
.toast-ok  { background: #d4edda; color: #155724; border: 1px solid rgba(40,167,69,0.3); }
.toast-err { background: #f8d7da; color: #721c24; border: 1px solid rgba(220,53,69,0.3); }
.toast-anim-enter-active { transition: opacity 0.3s, transform 0.3s; }
.toast-anim-leave-active { transition: opacity 0.2s; }
.toast-anim-enter-from   { opacity: 0; transform: translateX(20px); }
.toast-anim-leave-to     { opacity: 0; }
.modifier-topbar { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; }
.btn-back { display: flex; align-items: center; gap: 6px; padding: 9px 16px; border: 1.5px solid #c8c4bc; border-radius: 10px; background: #e8e4dc; color: #4a5a6a; font-size: 13px; font-weight: 600; font-family: 'Source Sans 3', sans-serif; cursor: pointer; transition: all 0.18s; flex-shrink: 0; }
.btn-back:hover { border-color: #3d6080; color: #3d6080; }
.topbar-title { flex: 1; }
.page-title { font-family: 'Merriweather', serif; font-size: 22px; font-weight: 700; color: #1e2a35; }
.page-sub { font-size: 13px; color: #8a9aaa; margin-top: 3px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
.form-card-full { grid-column: 1 / -1; }
.form-card { background: #ddd9d1; border-radius: 16px; border: 1.5px solid #c8c4bc; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.form-card-header { display: flex; align-items: center; gap: 12px; padding: 18px 22px 14px; border-bottom: 1px solid #c8c4bc; }
.fcard-icon { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.fcard-blue  { background: rgba(61,96,128,0.12);  color: #3d6080; }
.fcard-gold  { background: rgba(245,166,35,0.12);  color: #d98e1a; }
.fcard-slate { background: rgba(74,90,106,0.10);   color: #4a5a6a; }
.form-card-title { font-family: 'Merriweather', serif; font-size: 14px; font-weight: 700; color: #1e2a35; flex: 1; }
.optional-hint { font-size: 11.5px; color: #8a9aaa; white-space: nowrap; }
.form-card-body { padding: 18px 22px 20px; }
.fields-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.field-block { margin-bottom: 14px; }
.lbl { display: block; margin-bottom: 6px; font-size: 13.5px; font-weight: 600; color: #3d5a72; }
.req { color: #e74c3c; }
input, select { width: 100%; padding: 11px 14px; border: 1.5px solid #c8c4bc; border-radius: 10px; background: #e8e4dc; font-size: 14px; color: #1e2a35; font-family: 'Source Sans 3', sans-serif; transition: all 0.2s; appearance: none; }
input:focus, select:focus { outline: none; border-color: #3d6080; background: #f0ede8; box-shadow: 0 0 0 3px rgba(61,96,128,0.12); }
.input-err { border-color: #e74c3c !important; background: #fdf2f2; }
.err { font-size: 12px; color: #e74c3c; margin-top: 5px; }
.pw-wrap { position: relative; }
.pw-wrap input { padding-right: 44px; }
.eye-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; color: #8a9aaa; display: flex; align-items: center; transition: color 0.18s; }
.eye-btn:hover { color: #3d6080; }
.pw-rules { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.pw-rule { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 6px; transition: all 0.2s; }
.rule-ok { background: rgba(39,174,96,0.12); color: #1e8449; }
.rule-no { background: rgba(200,196,188,0.5); color: #8a9aaa; }
.pw-match { font-size: 12px; font-weight: 600; margin-top: 6px; display: flex; align-items: center; gap: 5px; }
.pw-match.ok { color: #27ae60; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; }
.btn-cancel { padding: 12px 24px; border: 1.5px solid #c8c4bc; border-radius: 11px; background: #e8e4dc; color: #4a5a6a; font-size: 14px; font-weight: 600; font-family: 'Source Sans 3', sans-serif; cursor: pointer; transition: all 0.18s; }
.btn-cancel:hover { border-color: #3d6080; color: #3d6080; }
.btn-save { display: flex; align-items: center; gap: 9px; padding: 12px 28px; background: linear-gradient(135deg, #4a7090, #2f4f6a); color: #fff; border: none; border-radius: 11px; font-size: 14px; font-weight: 600; font-family: 'Source Sans 3', sans-serif; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(61,96,128,0.30); }
.btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(61,96,128,0.38); }
.btn-save:disabled { background: #aaa49c; box-shadow: none; cursor: not-allowed; }
.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 900px) { .form-grid { grid-template-columns: 1fr; } .modifier-topbar { flex-direction: column; align-items: flex-start; } }
</style>