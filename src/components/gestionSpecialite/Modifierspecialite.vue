<template>
  <div class="page-wrapper">
    <div class="form-card">
      <div class="form-card-header">
        <div class="header-icon" style="background:rgba(61,96,128,0.12);color:#3d6080;">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </div>
        <div>
          <h2 class="card-title">Modifier la spécialité</h2>
          <p class="card-sub">Modifiez les informations de <strong style="color:#3d6080;">{{ specialite?.nom }}</strong></p>
        </div>
      </div>

      <div v-if="!specialite" class="empty-state">
        <p>Aucune spécialité sélectionnée pour modification.</p>
      </div>

      <form v-else @submit.prevent="valider" @reset.prevent="annuler" novalidate>

        <transition name="toast-slide">
          <div v-if="erreurServeur" class="inline-error">
            Impossible de modifier la spécialité. Veuillez réessayer.
          </div>
        </transition>

        <div class="field-block">
          <label class="lbl">Nom de la spécialité <span class="req">*</span></label>
          <input v-model="form.nom" type="text" placeholder="Ex : Génie Logiciel" :class="{ 'input-err': errors.nom }"/>
          <p class="err" v-if="errors.nom">{{ errors.nom }}</p>
        </div>

        <div class="field-block">
          <label class="lbl">Code de la spécialité <span class="req">*</span></label>
          <input v-model="form.code" type="text" placeholder="Ex : GL2024" :class="{ 'input-err': errors.code }" @input="form.code = form.code.toUpperCase()"/>
          <p class="field-hint" v-if="!errors.code">Lettres majuscules et chiffres uniquement</p>
          <p class="err" v-if="errors.code">{{ errors.code }}</p>
        </div>

        <div class="field-block">
          <label class="lbl">Description <span class="req">*</span></label>
          <textarea v-model="form.description" rows="4" placeholder="Décrivez brièvement cette spécialité..." :class="{ 'input-err': errors.description }"></textarea>
          <p class="err" v-if="errors.description">{{ errors.description }}</p>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Enregistrer les modifications
          </button>
          <button type="reset" class="btn-outline">Annuler</button>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModifierSpecialite',
  props: {
    specialite:            { type: Object, default: null },
    specialitesExistantes: { type: Array,  default: () => [] },
  },
  emits: ['updated', 'cancelled'],
  data() {
    return {
      form: { nom: '', code: '', description: '' },
      errors: {},
      erreurServeur: false,
    }
  },
  watch: {
    specialite: {
      immediate: true,
      handler(val) {
        if (val) {
          this.form = { nom: val.nom, code: val.code, description: val.description }
          this.errors = {}
          this.erreurServeur = false
        }
      },
    },
  },
  methods: {
    valider() {
      this.form.nom         = this.form.nom.trim()
      this.form.code        = this.form.code.trim().toUpperCase()
      this.form.description = this.form.description.trim()
      this.errors = {}
      this.erreurServeur = false

      if (!this.form.nom)         this.errors.nom         = 'Le nom est obligatoire.'
      if (!this.form.code)        this.errors.code        = 'Le code est obligatoire.'
      if (!this.form.description) this.errors.description = 'La description est obligatoire.'

      if (this.form.code && !/^[A-Z0-9]+$/.test(this.form.code))
        this.errors.code = 'Le code doit contenir uniquement des lettres majuscules et des chiffres.'

      if (this.form.code && !this.errors.code) {
        const doublon = this.specialitesExistantes.some(s => s.id !== this.specialite.id && s.code.toUpperCase() === this.form.code)
        if (doublon) this.errors.code = 'Ce code est déjà utilisé par une autre spécialité.'
      }
      if (this.form.nom && !this.errors.nom) {
        const doublon = this.specialitesExistantes.some(s => s.id !== this.specialite.id && s.nom.toLowerCase() === this.form.nom.toLowerCase())
        if (doublon) this.errors.nom = 'Ce nom est déjà utilisé par une autre spécialité.'
      }

      if (Object.keys(this.errors).length > 0) return
      this.$emit('updated', { ...this.specialite, ...this.form })
    },
    annuler() {
      if (this.specialite) {
        this.form = { nom: this.specialite.nom, code: this.specialite.code, description: this.specialite.description }
      }
      this.errors = {}
      this.erreurServeur = false
      this.$emit('cancelled')
    },
  },
}
</script>

<style scoped>
.page-wrapper { min-height: 100%; display: flex; justify-content: center; align-items: flex-start; padding: 32px 16px; }
.form-card    { max-width: 620px; animation: cardIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes cardIn { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
</style>