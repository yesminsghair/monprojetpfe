<template>
  <transition name="modal-fade">
  <div class="modal-overlay" @click.self="$emit('fermer')">
    <div class="modal-box">

      <div class="modal-header">
        <div class="modal-title-group">
          <div class="modal-icon icon-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <h3>Modifier les informations</h3>
        </div>
        <button class="modal-close" @click="$emit('fermer')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="modal-body" v-if="chef">

        <!-- Chef info header -->
        <div class="chef-card">
          <div class="chef-avatar">{{ initiales }}</div>
          <div>
            <p class="chef-name">{{ chef.prenom }} {{ chef.nom }}</p>
            <p class="chef-email">{{ chef.email }}</p>
          </div>
        </div>

        <form @submit.prevent="confirmer" novalidate>

          <div class="row-2">
            <div class="field-block">
              <label class="lbl">Nom <span class="req">*</span></label>
              <input v-model="form.nom" type="text" placeholder="Nom"
                :class="{ 'input-err': errors.nom }"/>
              <p class="err" v-if="errors.nom">{{ errors.nom }}</p>
            </div>
            <div class="field-block">
              <label class="lbl">Prénom <span class="req">*</span></label>
              <input v-model="form.prenom" type="text" placeholder="Prénom"
                :class="{ 'input-err': errors.prenom }"/>
              <p class="err" v-if="errors.prenom">{{ errors.prenom }}</p>
            </div>
          </div>

          <div class="field-block">
            <label class="lbl">Adresse email <span class="req">*</span></label>
            <input v-model="form.email" type="email" placeholder="chef@universite.dz"
              :class="{ 'input-err': errors.email }"/>
            <p class="err" v-if="errors.email">{{ errors.email }}</p>
          </div>

          <div class="field-block">
            <label class="lbl">Téléphone</label>
            <input v-model="form.telephone" type="text" placeholder="Ex : 0555 12 34 56"
              :class="{ 'input-err': errors.telephone }"/>
            <p class="err" v-if="errors.telephone">{{ errors.telephone }}</p>
          </div>

        </form>
      </div>

      <div class="modal-footer">
        <button class="btn-blue" @click="confirmer">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Enregistrer
        </button>
        <button class="btn-outline" @click="$emit('fermer')">Annuler</button>
      </div>

    </div>
  </div>
  </transition>
</template>

<script>
export default {
  name: 'ModifierChef',
  props: {
    chef:  { type: Object, default: null },
    chefs: { type: Array,  default: () => [] },
  },
  emits: ['fermer', 'modifie'],

  data() {
    return {
      form: { nom: '', prenom: '', email: '', telephone: '' },
      errors: {},
    }
  },

  computed: {
    initiales() {
      if (!this.chef) return ''
      return ((this.chef.prenom||'')[0] + (this.chef.nom||'')[0]).toUpperCase()
    },
  },

  watch: {
    chef: {
      immediate: true,
      handler(val) {
        if (val) {
          this.form = { nom: val.nom, prenom: val.prenom, email: val.email, telephone: val.telephone || '' }
          this.errors = {}
        }
      },
    },
  },

  methods: {
    confirmer() {
      this.form.nom    = this.form.nom.trim()
      this.form.prenom = this.form.prenom.trim()
      this.form.email  = this.form.email.trim()
      this.errors = {}

      if (!this.form.nom)    this.errors.nom    = 'Le nom est obligatoire.'
      if (!this.form.prenom) this.errors.prenom = 'Le prénom est obligatoire.'
      if (!this.form.email)  this.errors.email  = "L'adresse email est obligatoire."

      const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (this.form.email && !rx.test(this.form.email))
        this.errors.email = "Format d'email invalide."

      // Doublon email (exclure le chef en cours)
      if (this.form.email && rx.test(this.form.email)) {
        const doublon = this.chefs.some(
          c => c.id !== this.chef.id && c.email.toLowerCase() === this.form.email.toLowerCase()
        )
        if (doublon) this.errors.email = 'Cette adresse email est déjà utilisée.'
      }

      if (this.form.telephone && !/^[0-9+\s\-().]{8,15}$/.test(this.form.telephone))
        this.errors.telephone = 'Format de numéro de téléphone invalide.'

      if (Object.keys(this.errors).length > 0) return

      this.$emit('modifie', {
        id: this.chef.id,
        nom: this.form.nom,
        prenom: this.form.prenom,
        email: this.form.email,
        telephone: this.form.telephone,
      })
      this.$emit('fermer')
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(13,31,53,0.52);
  display: flex; align-items: center; justify-content: center;
  z-index: 300; padding: 24px; backdrop-filter: blur(3px);
}

.modal-box {
  background: #ddd9d1; border-radius: 16px; width: 100%; max-width: 500px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.28);
  animation: modalIn 0.28s cubic-bezier(0.22,1,0.36,1) both;
  font-family: 'Source Sans 3', sans-serif; overflow: hidden;
}

@keyframes modalIn {
  from { opacity:0; transform:scale(0.94) translateY(14px); }
  to   { opacity:1; transform:none; }
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px; border-bottom: 1px solid #c8c4bc; background: #d5d1c9;
}

.modal-title-group { display: flex; align-items: center; gap: 10px; }

.modal-icon {
  width: 34px; height: 34px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
}

.icon-blue { background: rgba(61,96,128,0.15); color: #3d6080; }

.modal-header h3 {
  font-family: 'Merriweather', serif; font-size: 17px;
  font-weight: 700; color: #1e2a35;
}

.modal-close {
  background: none; border: none; color: #8a9aaa; cursor: pointer;
  display: flex; padding: 4px; border-radius: 6px; transition: color 0.15s;
}
.modal-close:hover { color: #1e2a35; }

.modal-body { padding: 22px 24px; }

.chef-card {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; background: rgba(61,96,128,0.08);
  border-radius: 10px; margin-bottom: 20px;
}
.chef-avatar {
  width: 40px; height: 40px; border-radius: 50%; background: #3d6080;
  color: #fff; font-weight: 700; font-size: 13px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.chef-name  { font-weight: 600; color: #1e2a35; font-size: 14px; }
.chef-email { font-size: 12px; color: #8a9aaa; margin-top: 2px; }

.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.field-block { margin-bottom: 16px; }

.lbl { display: block; font-size: 13.5px; font-weight: 600; color: #1e2a35; margin-bottom: 7px; }
.req { color: #f5a623; }

input[type="text"], input[type="email"] {
  width: 100%; padding: 10px 14px;
  background: #e8e4dc; border: 1.5px solid #c8c4bc;
  border-radius: 10px; font-size: 14px;
  font-family: 'Source Sans 3', sans-serif; color: #1e2a35;
  outline: none; transition: border-color 0.2s, box-shadow 0.2s;
}
input:focus { border-color: #3d6080; box-shadow: 0 0 0 3px rgba(61,96,128,0.13); }
input.input-err { border-color: #c0392b; background: #f8f0ee; }
input::placeholder { color: #aaa49c; }

.err { font-size: 12px; color: #c0392b; margin-top: 5px; display: block; }

.modal-footer {
  display: flex; gap: 10px; padding: 16px 24px 20px;
  border-top: 1px solid #c8c4bc;
}

.btn-blue {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 22px; border: none; border-radius: 10px;
  background: #3d6080; color: #fff; font-size: 14px; font-weight: 600;
  font-family: 'Source Sans 3', sans-serif; cursor: pointer;
  transition: background 0.18s, transform 0.15s;
  box-shadow: 0 2px 10px rgba(61,96,128,0.25);
}
.btn-blue:hover { background: #2f4f6a; transform: translateY(-1px); }

.btn-outline {
  padding: 11px 22px; border: 1.5px solid #c8c4bc; border-radius: 10px;
  background: transparent; color: #4a5a6a; font-size: 14px;
  font-family: 'Source Sans 3', sans-serif; cursor: pointer;
  transition: background 0.18s;
}
.btn-outline:hover { background: rgba(0,0,0,0.05); }

.modal-fade-enter-active { transition: opacity 0.25s ease; }
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>