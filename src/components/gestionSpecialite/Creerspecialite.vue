<template>
  <div class="page-content">
    <div class="page-header-block">
      <div>
        <h2 class="page-title">Créer une spécialité</h2>
        <p class="page-sub">Ajoutez une nouvelle spécialité au département</p>
      </div>
    </div>

    <div class="form-card">
      <div class="field-block">
        <label class="field-label">Nom de la spécialité <span class="req">*</span></label>
        <input v-model="form.nom" class="field-input" :class="{'field-error': errors.nom}"
          type="text" placeholder="Ex : Génie Logiciel"/>
        <p class="err-msg" v-if="errors.nom">{{ errors.nom }}</p>
      </div>

      <div class="field-block">
        <label class="field-label">Code <span class="req">*</span></label>
        <input v-model="form.code" class="field-input" :class="{'field-error': errors.code}"
          type="text" placeholder="Ex : GL2025"/>
        <p class="err-msg" v-if="errors.code">{{ errors.code }}</p>
      </div>

      <div class="field-block">
        <label class="field-label">Description</label>
        <textarea v-model="form.description" class="field-input field-textarea" rows="3"
          placeholder="Description de la spécialité..."/>
      </div>

      <div class="field-block">
        <label class="field-label">Date de création</label>
        <input v-model="form.dateCreation" class="field-input" type="date"/>
      </div>

      <div class="form-footer">
        <button class="btn-outline" @click="$emit('navigate','spec-list')">Annuler</button>
        <button class="btn-primary" @click="soumettre" :disabled="saving">
          <span v-if="saving" class="spinner"></span>
          {{ saving ? 'Création...' : 'Créer la spécialité' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Creerspecialite',
  emits: ['specialite-creee', 'navigate'],
  data() {
    return {
      saving: false,
      form: { nom: '', code: '', description: '', dateCreation: '' },
      errors: {}
    }
  },
  methods: {
    soumettre() {
      this.errors = {}
      if (!this.form.nom.trim())  this.errors.nom  = 'Le nom est obligatoire'
      if (!this.form.code.trim()) this.errors.code = 'Le code est obligatoire'
      if (Object.keys(this.errors).length) return
      this.saving = true
      this.$emit('specialite-creee', { ...this.form })
      // Le parent gère l'appel API et la navigation
      setTimeout(() => { this.saving = false }, 1500)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600&family=Merriweather:wght@700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.page-content{padding:32px;font-family:'Source Sans 3',sans-serif;max-width:640px}
.page-header-block{margin-bottom:24px}
.page-title{font-family:'Merriweather',serif;font-size:20px;color:#1e2a35;margin-bottom:4px}
.page-sub{font-size:13.5px;color:#8a9aaa}
.form-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
.field-block{margin-bottom:20px}
.field-label{display:block;font-size:13px;font-weight:600;color:#1e2a35;margin-bottom:6px}
.req{color:#c0392b}
.field-input{width:100%;padding:10px 13px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:9px;font-size:13.5px;color:#1e2a35;font-family:inherit;transition:border-color 0.18s}
.field-input:focus{outline:none;border-color:#3d6080}
.field-textarea{resize:vertical;min-height:80px}
.field-error{border-color:#c0392b}
.err-msg{font-size:12px;color:#c0392b;margin-top:4px}
.form-footer{display:flex;justify-content:flex-end;gap:10px;margin-top:24px;padding-top:20px;border-top:1.5px solid #c8c4bc}
.btn-primary{display:flex;align-items:center;gap:8px;padding:10px 22px;background:#3d6080;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.18s}
.btn-primary:hover{background:#2f4f6a}
.btn-primary:disabled{opacity:0.6;cursor:not-allowed}
.btn-outline{padding:10px 18px;background:transparent;border:1.5px solid #c8c4bc;border-radius:10px;font-size:14px;color:#4a5a6a;cursor:pointer;font-family:inherit;transition:all 0.18s}
.btn-outline:hover{border-color:#3d6080;color:#3d6080}
.spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
</style>