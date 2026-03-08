<template>
  <div class="page-wrapper">
    <div class="form-card">

      <!-- Header -->
      <div class="form-card-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            <line x1="12" y1="11" x2="12" y2="17"/>
            <line x1="9" y1="14" x2="15" y2="14"/>
          </svg>
        </div>
        <div>
          <h2 class="card-title">Créer une spécialité</h2>
          <p class="card-sub">Remplissez les informations pour ajouter une nouvelle spécialité académique.</p>
        </div>
      </div>

      <!-- Toast succès inline -->
      <transition name="toast-slide">
        <div v-if="successMsg" class="inline-success">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ successMsg }}
        </div>
      </transition>

      <form @submit.prevent="valider" @reset.prevent="annuler" novalidate>

        <!-- Nom -->
        <div class="field-block">
          <label class="lbl">Nom de la spécialité <span class="req">*</span></label>
          <input v-model="form.nom" type="text" placeholder="Ex : Génie Logiciel"
            :class="{ 'input-err': errors.nom }"/>
          <p class="err" v-if="errors.nom">{{ errors.nom }}</p>
        </div>

        <!-- Code -->
        <div class="field-block">
          <label class="lbl">Code de la spécialité <span class="req">*</span></label>
          <input v-model="form.code" type="text" placeholder="Ex : GL2024"
            :class="{ 'input-err': errors.code }"
            @input="form.code = form.code.toUpperCase()"/>
          <p class="field-hint" v-if="!errors.code">Lettres majuscules et chiffres uniquement (ex : GL2024)</p>
          <p class="err" v-if="errors.code">{{ errors.code }}</p>
        </div>

        <!-- Description -->
        <div class="field-block">
          <label class="lbl">Description <span class="req">*</span></label>
          <textarea v-model="form.description" placeholder="Décrivez brièvement cette spécialité..."
            rows="4" :class="{ 'input-err': errors.description }"></textarea>
          <p class="err" v-if="errors.description">{{ errors.description }}</p>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="submit" class="btn-gold">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Enregistrer
          </button>
          <button type="reset" class="btn-outline">Annuler</button>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreerSpecialite',
  props: {
    specialitesExistantes: { type: Array, default: () => [] },
  },
  emits: ['created'],
  data() {
    return {
      form: { nom: '', code: '', description: '' },
      errors: {},
      successMsg: '',
    }
  },
  methods: {
    valider() {
      this.form.nom         = this.form.nom.trim()
      this.form.code        = this.form.code.trim().toUpperCase()
      this.form.description = this.form.description.trim()
      this.errors = {}
      this.successMsg = ''

      if (!this.form.nom)         this.errors.nom         = 'Le nom est obligatoire.'
      if (!this.form.code)        this.errors.code        = 'Le code est obligatoire.'
      if (!this.form.description) this.errors.description = 'La description est obligatoire.'

      if (this.form.code && !/^[A-Z0-9]+$/.test(this.form.code))
        this.errors.code = 'Le code doit contenir uniquement des lettres majuscules et des chiffres.'

      if (this.form.code && !this.errors.code) {
        const codeExiste = this.specialitesExistantes.some(s => s.code.toUpperCase() === this.form.code)
        if (codeExiste) this.errors.code = 'Ce code de spécialité existe déjà.'
      }
      if (this.form.nom && !this.errors.nom) {
        const nomExiste = this.specialitesExistantes.some(s => s.nom.toLowerCase() === this.form.nom.toLowerCase())
        if (nomExiste) this.errors.nom = 'Cette spécialité existe déjà.'
      }

      if (Object.keys(this.errors).length > 0) return

      const nouvelle = {
        id: Date.now(),
        ...this.form,
        dateCreation: new Date().toLocaleDateString('fr-FR'),
        chefs: [],
      }
      this.$emit('created', nouvelle)
      this.successMsg = 'Spécialité créée avec succès.'
      this.reinitialiser()
      setTimeout(() => { this.successMsg = '' }, 3500)
    },
    annuler()      { this.reinitialiser() },
    reinitialiser() { Object.assign(this.form, { nom: '', code: '', description: '' }); this.errors = {} },
  },
}
</script>

<style scoped>
.page-wrapper { min-height: 100%; display: flex; justify-content: center; align-items: flex-start; padding: 32px 16px; }
.form-card    { max-width: 620px; animation: cardIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes cardIn { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
</style>