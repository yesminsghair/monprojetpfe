<template>
  <div class="page-content">
    <div class="form-card">
      <div class="form-card-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        </div>
        <div>
          <h3 class="card-title">Nouveau chef de département</h3>
          <p class="card-sub">Renseignez les informations du chef à ajouter</p>
        </div>
      </div>

      <!-- Aucune spécialité disponible -->
      <div class="alert-warn" v-if="specialites.length === 0">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <strong>Vous devez d'abord créer au moins une spécialité.</strong>
          <a href="#" @click.prevent="$emit('navigate','spec-create')" class="link"> Créer une spécialité →</a>
        </div>
      </div>

      <form @submit.prevent="enregistrer" novalidate>

        <div class="row-2">
          <div class="field-block">
            <label class="lbl">Nom <span class="req">*</span></label>
            <input v-model="form.nom" type="text" placeholder="Nom du chef" :class="{ 'input-err': errors.nom }"/>
            <p class="err" v-if="errors.nom">{{ errors.nom }}</p>
          </div>
          <div class="field-block">
            <label class="lbl">Prénom <span class="req">*</span></label>
            <input v-model="form.prenom" type="text" placeholder="Prénom du chef" :class="{ 'input-err': errors.prenom }"/>
            <p class="err" v-if="errors.prenom">{{ errors.prenom }}</p>
          </div>
        </div>

        <div class="field-block">
          <label class="lbl">Adresse email <span class="req">*</span></label>
          <input v-model="form.email" type="email" placeholder="chef@universite.dz" :class="{ 'input-err': errors.email }"/>
          <p class="err" v-if="errors.email">{{ errors.email }}</p>
          <div class="alert-info" v-if="emailExistant">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Un utilisateur avec cet email existe déjà. Souhaitez-vous l'affecter comme chef ?
            <button type="button" class="btn-link" @click="affecterExistant">Oui, affecter →</button>
          </div>
        </div>

        <div class="field-block">
          <label class="lbl">Téléphone</label>
          <input v-model="form.telephone" type="text" placeholder="Ex : 0555 12 34 56" :class="{ 'input-err': errors.telephone }"/>
          <p class="err" v-if="errors.telephone">{{ errors.telephone }}</p>
        </div>

        <!-- Domaine d'expertise (nouveau champ) -->
        <div class="field-block">
          <label class="lbl">Domaine d'expertise <span class="req">*</span></label>
          <input v-model="form.domaineExpertise" type="text" placeholder="Ex : Intelligence Artificielle, Réseaux…"
            :class="{ 'input-err': errors.domaineExpertise }"/>
          <p class="field-hint" v-if="!errors.domaineExpertise">Indiquez le domaine de spécialisation du chef.</p>
          <p class="err" v-if="errors.domaineExpertise">{{ errors.domaineExpertise }}</p>
        </div>

        <!-- Spécialité -->
        <div class="field-block">
          <label class="lbl">Spécialité affectée <span class="req">*</span></label>
          <div class="select-wrap">
            <select v-model="form.specialiteId"
              :class="{ 'input-err': errors.specialiteId }"
              :disabled="specialites.length === 0">
              <option value="">-- Sélectionner une spécialité --</option>
              <option v-for="sp in specialites" :key="sp.id" :value="sp.id">
                {{ sp.code }} — {{ sp.nom }}
              </option>
            </select>
            <svg class="select-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <p class="err" v-if="errors.specialiteId">{{ errors.specialiteId }}</p>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-gold" :disabled="specialites.length === 0">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Enregistrer
          </button>
          <button type="button" class="btn-outline" @click="annuler">Annuler</button>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AjouterChef',
  props: {
    specialites: { type: Array, default: () => [] },
    chefs:       { type: Array, default: () => [] },
  },
  emits: ['chef-ajoute', 'toast', 'navigate'],
  data() {
    return {
      form: { nom: '', prenom: '', email: '', telephone: '', domaineExpertise: '', specialiteId: '' },
      errors: {},
    }
  },
  computed: {
    emailExistant() {
      const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return this.form.email && rx.test(this.form.email) &&
        this.chefs.some(c => c.email.toLowerCase() === this.form.email.toLowerCase())
    },
  },
  methods: {
    enregistrer() {
      this.form.nom             = this.form.nom.trim()
      this.form.prenom          = this.form.prenom.trim()
      this.form.email           = this.form.email.trim()
      this.form.domaineExpertise= this.form.domaineExpertise.trim()
      this.errors = {}

      if (!this.form.nom)              this.errors.nom              = 'Le nom est obligatoire.'
      if (!this.form.prenom)           this.errors.prenom           = 'Le prénom est obligatoire.'
      if (!this.form.email)            this.errors.email            = "L'adresse email est obligatoire."
      if (!this.form.domaineExpertise) this.errors.domaineExpertise = 'Le domaine d\'expertise est obligatoire.'
      if (!this.form.specialiteId)     this.errors.specialiteId     = 'Veuillez sélectionner une spécialité.'

      const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (this.form.email && !rx.test(this.form.email))
        this.errors.email = "Format d'email invalide."
      if (this.form.email && rx.test(this.form.email) && this.emailExistant)
        this.errors.email = 'Cette adresse email est déjà associée à un compte.'
      if (this.form.telephone && !/^[0-9+\s\-().]{8,15}$/.test(this.form.telephone))
        this.errors.telephone = 'Format de numéro de téléphone invalide.'

      if (Object.keys(this.errors).length > 0) return

      const sp = this.specialites.find(s => s.id === this.form.specialiteId)
      const nouveau = {
        id: Date.now(),
        nom: this.form.nom,
        prenom: this.form.prenom,
        email: this.form.email,
        telephone: this.form.telephone,
        domaineExpertise: this.form.domaineExpertise,
        specialiteId:   sp ? sp.id   : null,
        specialiteNom:  sp ? sp.nom  : '',
        specialiteCode: sp ? sp.code : '',
        dateAffectation: new Date().toLocaleDateString('fr-FR'),
        historique: sp ? [{ specialite: sp.nom, date: new Date().toLocaleDateString('fr-FR'), motif: 'Affectation initiale' }] : [],
      }
      this.$emit('chef-ajoute', nouveau)
      this.$emit('toast', { message: 'Chef de département ajouté avec succès.', type: 'toast-ok' })
      this.$emit('navigate', 'chef-list')
    },
    annuler() {
      Object.assign(this.form, { nom:'', prenom:'', email:'', telephone:'', domaineExpertise:'', specialiteId:'' })
      this.errors = {}
      this.$emit('navigate', 'chef-list')
    },
    affecterExistant() {
      this.$emit('toast', { message: 'Redirection vers l\'affectation...', type: 'toast-ok' })
      this.$emit('navigate', 'chef-list')
    },
  },
}
</script>

<style scoped>
.page-content { flex: 1; padding: 32px; font-family: 'Source Sans 3', sans-serif; }
.form-card    { max-width: 660px; animation: cardIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes cardIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
.link     { color: #3d6080; font-weight: 600; text-decoration: none; border-bottom: 1px solid rgba(61,96,128,0.3); margin-left: 4px; }
.btn-link { background: none; border: none; color: #f5a623; font-weight: 600; font-size: 13.5px; cursor: pointer; padding: 0; margin-left: 6px; text-decoration: underline; font-family: 'Source Sans 3', sans-serif; }
</style>