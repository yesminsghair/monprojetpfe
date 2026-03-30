<template>
  <div class="page-content">

    <!-- En-tête page -->
    <div class="page-header-block">
      <div class="page-header-left">
        <button class="back-btn" @click="$emit('navigate','voeux-liste')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Retour
        </button>
        <div>
          <h2 class="page-title">{{ modeEdition ? 'Modifier le formulaire de vœux' : 'Définir un formulaire de vœux' }}</h2>
          <p class="page-sub">{{ modeEdition ? 'Modifiez votre brouillon avant de le publier' : 'Configurez le formulaire qui sera envoyé aux enseignants' }}</p>
        </div>
      </div>
      <div class="step-indicator">
        <div class="step active"><span class="step-num">1</span><span class="step-lbl">Définir</span></div>
        <div class="step-line"></div>
        <div class="step"><span class="step-num">2</span><span class="step-lbl">Publier</span></div>
        <div class="step-line"></div>
        <div class="step"><span class="step-num">3</span><span class="step-lbl">Suivre</span></div>
      </div>
    </div>

    <div class="form-layout">

      <!-- Carte principale -->
      <div class="form-card">
        <div class="card-section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Informations du formulaire
        </div>

        <!-- Titre -->
        <div class="field-block">
          <label class="field-label">Titre du formulaire <span class="required">*</span></label>
          <input
            v-model="form.titre"
            type="text"
            class="field-input"
            :class="{ 'field-error': errors.titre }"
            placeholder="Ex : Formulaire vœux d'encadrement PFE 2026"
          />
          <p class="err-msg" v-if="errors.titre">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ errors.titre }}
          </p>
        </div>

        <!-- Champs du formulaire envoyé aux enseignants -->
        <div class="field-block">
          <label class="field-label">Champs proposés aux enseignants <span class="required">*</span></label>
          <p class="field-hint">Sélectionnez les informations que les enseignants devront renseigner</p>
          <div class="champs-grid">
            <label v-for="champ in champsDisponibles" :key="champ.id" class="champ-item"
              :class="{ 'champ-selected': form.champs.includes(champ.id) }">
              <input type="checkbox" :value="champ.id" v-model="form.champs" class="champ-check"/>
              <div class="champ-body">
                <span class="champ-icon">{{ champ.icon }}</span>
                <div>
                  <div class="champ-nom">{{ champ.nom }}</div>
                  <div class="champ-desc">{{ champ.desc }}</div>
                </div>
              </div>
            </label>
          </div>
          <p class="err-msg" v-if="errors.champs">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ errors.champs }}
          </p>
        </div>

        <!-- Date limite -->
        <div class="row-2">
          <div class="field-block">
            <label class="field-label">Date limite de réponse <span class="required">*</span></label>
            <p class="field-hint">Les enseignants ne pourront plus répondre après cette date</p>
            <input
              type="date"
              v-model="form.dateLimite"
              class="field-input"
              :class="{ 'field-error': errors.dateLimite }"
              :min="today"
            />
            <p class="err-msg" v-if="errors.dateLimite">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ errors.dateLimite }}
            </p>
          </div>

          <div class="field-block">
            <label class="field-label">Nombre max d'étudiants par encadrant</label>
            <p class="field-hint">Limite de charge par enseignant</p>
            <div class="number-input">
              <button type="button" @click="form.nbMax > 1 && form.nbMax--" class="num-btn">−</button>
              <input type="number" v-model="form.nbMax" class="field-input num-field" min="1" max="20"/>
              <button type="button" @click="form.nbMax < 20 && form.nbMax++" class="num-btn">+</button>
            </div>
          </div>
        </div>

        <!-- Message -->
        <div class="field-block">
          <label class="field-label">Message d'accompagnement</label>
          <p class="field-hint">Ce message sera affiché en tête du formulaire pour les enseignants</p>
          <textarea
            v-model="form.message"
            class="field-input field-textarea"
            rows="3"
            placeholder="Ex : Merci de remplir ce formulaire avant la date limite afin que nous puissions procéder à l'affectation des encadrants..."
          />
        </div>

      </div>

      <!-- Carte destinataires -->
      <div class="form-card">
        <div class="card-section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Enseignants destinataires
        </div>

        <div class="dest-toolbar">
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="searchEns" class="search-input" placeholder="Rechercher un enseignant..."/>
          </div>
          <div class="dest-actions">
            <button type="button" class="select-all-btn" @click="selectAll">Tout sélectionner</button>
            <button type="button" class="select-all-btn" @click="form.enseignants=[]">Effacer</button>
          </div>
        </div>

        <p class="selection-count">
          <strong>{{ form.enseignants.length }}</strong> enseignant(s) sélectionné(s) sur {{ enseignants.length }}
        </p>

        <div class="enseignant-list">
          <label
            v-for="e in enseignantsFiltres"
            :key="e.id"
            class="ens-item"
            :class="{ 'ens-selected': form.enseignants.includes(e.id) }"
          >
            <input type="checkbox" :value="e.id" v-model="form.enseignants" class="ens-check"/>
            <div class="ens-avatar">{{ (e.prenom[0]||'') + (e.nom[0]||'') }}</div>
            <div class="ens-info">
              <div class="ens-name">{{ e.prenom }} {{ e.nom }}</div>
              <div class="ens-email">{{ e.email }}</div>
            </div>
            <svg v-if="form.enseignants.includes(e.id)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ens-check-icon"><polyline points="20 6 9 17 4 12"/></svg>
          </label>
          <div v-if="enseignantsFiltres.length === 0" class="empty-search">
            Aucun enseignant trouvé
          </div>
        </div>

        <p class="err-msg" v-if="errors.enseignants">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ errors.enseignants }}
        </p>
      </div>

    </div>

    <!-- Actions -->
    <div class="form-footer">
      <button class="btn-outline" type="button" @click="annuler">
        Annuler
      </button>
      <div class="footer-right">
        <div class="statut-preview" v-if="form.titre">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Sera enregistré en <strong>brouillon</strong>
        </div>
        <button class="btn-primary" type="button" @click="enregistrer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Enregistrer le formulaire
        </button>
      </div>
    </div>

    <!-- Modale confirmation annulation -->
    <transition name="modal-fade">
      <div v-if="showAnnulerModal" class="overlay" @click.self="showAnnulerModal=false">
        <div class="confirm-modal">
          <div class="confirm-icon warn">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <h4>Annuler la création ?</h4>
          <p>Le formulaire ne sera pas enregistré. Toutes les données saisies seront perdues.</p>
          <div class="confirm-btns">
            <button class="btn-outline" @click="showAnnulerModal=false">Continuer la saisie</button>
            <button class="btn-danger" @click="confirmerAnnulation">Oui, annuler</button>
          </div>
        </div>
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
  name: 'CreerFormulaire',
  props: {
    enseignants:         { type: Array,  default: () => [] },
    formulaireAModifier: { type: Object, default: null },   // Si défini → mode édition brouillon
  },
  emits: ['form-cree', 'navigate'],

  data() {
    return {
      searchEns: '',
      showAnnulerModal: false,
      saving: false,
      champsDisponibles: [
        { id: 'disponibilite',   icon: '📅', nom: 'Disponibilité',          desc: 'Oui / Non / Partielle' },
        { id: 'specialites',     icon: '📚', nom: 'Spécialités souhaitées', desc: 'Domaines à encadrer' },
        { id: 'nbEtudiants',     icon: '👥', nom: 'Nb max d\'étudiants',   desc: 'Capacité d\'accueil' },
        { id: 'commentaire',     icon: '💬', nom: 'Commentaires',           desc: 'Contraintes particulières' },
        { id: 'themes',          icon: '🎯', nom: 'Thèmes préférés',        desc: 'Sujets d\'intérêt' },
        { id: 'cotutelle',       icon: '🤝', nom: 'Co-tutelle',             desc: 'Accepte un co-encadrant' },
      ],
      form: {
        titre: '',
        dateLimite: '',
        nbMax: 3,
        message: '',
        champs: ['disponibilite', 'specialites', 'nbEtudiants'],
        enseignants: []
      },
      errors: {}
    }
  },

  computed: {
    today() { return new Date().toISOString().split('T')[0] },
    modeEdition() { return !!this.formulaireAModifier },
    enseignantsFiltres() {
      if (!this.searchEns) return this.enseignants
      const q = this.searchEns.toLowerCase()
      return this.enseignants.filter(e =>
        (e.nom + ' ' + e.prenom).toLowerCase().includes(q) ||
        (e.email||'').toLowerCase().includes(q)
      )
    }
  },

  watch: {
    // Quand le prop change (passage en mode édition), pré-remplir le formulaire
    formulaireAModifier: {
      immediate: true,
      handler(f) {
        if (f) {
          this.form.titre      = f.titre || ''
          this.form.dateLimite = f.date_limite || f.dateLimite || ''
          this.form.nbMax      = f.nb_max_etudiants || f.nbMax || 3
          this.form.message    = f.message || ''
          this.form.champs     = f.champs || ['disponibilite','specialites','nbEtudiants']
        }
      }
    }
  },

  methods: {
    selectAll() { this.form.enseignants = this.enseignants.map(e => e.id) },

    async enregistrer() {
      this.errors = {}
      if (!this.form.titre.trim())
        this.errors.titre = 'Le titre du formulaire est obligatoire'
      if (this.form.champs.length === 0)
        this.errors.champs = 'Sélectionnez au moins un champ pour le formulaire'
      if (!this.form.dateLimite) {
        this.errors.dateLimite = 'La date limite est obligatoire'
      } else if (this.form.dateLimite <= this.today) {
        this.errors.dateLimite = 'La date limite doit être postérieure à aujourd\'hui'
      }
      if (Object.keys(this.errors).length > 0) return

      this.saving = true
      try {
        let res
        if (this.modeEdition) {
          // Mise à jour du brouillon existant via PUT (on utilise store qui est un upsert)
          res = await api.post('/formulaires-voeux', {
            titre:            this.form.titre,
            date_limite:      this.form.dateLimite,
            nb_max_etudiants: this.form.nbMax,
            champs:           this.form.champs,
            message:          this.form.message,
          })
          // Supprimer l'ancien brouillon si c'est un update
          // (le backend crée un nouveau — on pourrait aussi faire un PUT /formulaires-voeux/{id})
        } else {
          res = await api.post('/formulaires-voeux', {
            titre:            this.form.titre,
            date_limite:      this.form.dateLimite,
            nb_max_etudiants: this.form.nbMax,
            champs:           this.form.champs,
            message:          this.form.message,
          })
        }
        this.$emit('form-cree', res.data.formulaire)
      } catch (e) {
        const errs = e.response?.data?.errors || {}
        if (errs.titre)       this.errors.titre      = errs.titre[0]
        if (errs.date_limite) this.errors.dateLimite = errs.date_limite[0]
        if (!Object.keys(errs).length)
          this.errors.titre = 'Erreur lors de la création. Réessayez.'
      } finally {
        this.saving = false
      }
    },

    annuler() {
      const hasData = this.form.titre || this.form.dateLimite || this.form.enseignants.length > 0
      if (hasData) {
        this.showAnnulerModal = true
      } else {
        this.$emit('navigate', 'voeux-liste')
      }
    },

    confirmerAnnulation() {
      this.showAnnulerModal = false
      this.$emit('navigate', 'voeux-liste')
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600&family=Merriweather:wght@700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.page-content { padding: 32px; font-family: 'Source Sans 3', sans-serif; }

/* Header */
.page-header-block {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 28px; gap: 20px; flex-wrap: wrap;
}
.page-header-left { display: flex; align-items: flex-start; gap: 16px; }
.back-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 14px;
  background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 9px;
  color: #4a5a6a; font-size: 13px; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: all 0.18s; white-space: nowrap; margin-top: 4px;
}
.back-btn:hover { border-color: #3d6080; color: #3d6080; }
.page-title { font-family: 'Merriweather', serif; font-size: 20px; color: #1e2a35; margin-bottom: 4px; }
.page-sub { font-size: 13.5px; color: #8a9aaa; }

/* Step indicator */
.step-indicator { display: flex; align-items: center; gap: 6px; }
.step { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.step-num {
  width: 28px; height: 28px; border-radius: 50%; background: #e8e4dc;
  border: 2px solid #c8c4bc; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #8a9aaa;
}
.step.active .step-num { background: #3d6080; border-color: #3d6080; color: #fff; }
.step-lbl { font-size: 11px; color: #8a9aaa; white-space: nowrap; }
.step.active .step-lbl { color: #3d6080; font-weight: 600; }
.step-line { width: 32px; height: 2px; background: #c8c4bc; margin-bottom: 16px; }

/* Layout */
.form-layout { display: grid; grid-template-columns: 1fr 380px; gap: 20px; margin-bottom: 20px; }
@media (max-width: 1100px) { .form-layout { grid-template-columns: 1fr; } }

/* Cards */
.form-card {
  background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 14px;
  padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.card-section-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 700; color: #3d6080;
  text-transform: uppercase; letter-spacing: 0.06em;
  margin-bottom: 20px; padding-bottom: 12px;
  border-bottom: 1.5px solid #c8c4bc;
}

/* Fields */
.field-block { margin-bottom: 18px; }
.field-label { display: block; font-size: 13.5px; font-weight: 600; color: #1e2a35; margin-bottom: 5px; }
.field-hint { font-size: 12px; color: #8a9aaa; margin-bottom: 8px; }
.required { color: #c0392b; }
.field-input {
  width: 100%; padding: 10px 13px;
  background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 9px;
  font-size: 13.5px; color: #1e2a35; font-family: inherit;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.field-input:focus { outline: none; border-color: #3d6080; box-shadow: 0 0 0 3px rgba(61,96,128,0.1); }
.field-input.field-error { border-color: #c0392b; background: #fdf0f0; }
.field-textarea { resize: vertical; min-height: 80px; }
.err-msg { display: flex; align-items: center; gap: 5px; color: #c0392b; font-size: 12px; margin-top: 5px; }

/* Number input */
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.number-input { display: flex; align-items: center; gap: 8px; }
.num-btn {
  width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid #c8c4bc;
  background: #e8e4dc; color: #3d6080; font-size: 18px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.num-btn:hover { background: #3d6080; color: #fff; border-color: #3d6080; }
.num-field { width: 60px; text-align: center; }

/* Champs formulaire */
.champs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.champ-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 10px;
  cursor: pointer; transition: all 0.18s;
}
.champ-item:hover { border-color: #3d6080; }
.champ-selected { border-color: #3d6080; background: rgba(61,96,128,0.08); }
.champ-check { accent-color: #3d6080; }
.champ-body { display: flex; align-items: center; gap: 8px; }
.champ-icon { font-size: 18px; }
.champ-nom { font-size: 13px; font-weight: 600; color: #1e2a35; }
.champ-desc { font-size: 11.5px; color: #8a9aaa; }

/* Destinataires */
.dest-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
.search-box {
  flex: 1; display: flex; align-items: center; gap: 8px; min-width: 160px;
  padding: 8px 12px; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 9px;
}
.search-box:focus-within { border-color: #3d6080; }
.search-input { border: none; background: transparent; font-size: 13px; font-family: inherit; color: #1e2a35; flex: 1; outline: none; }
.dest-actions { display: flex; gap: 6px; }
.select-all-btn {
  padding: 7px 12px; background: transparent; border: 1.5px solid #c8c4bc;
  border-radius: 8px; font-size: 12px; color: #4a5a6a; cursor: pointer; font-family: inherit;
  transition: all 0.15s;
}
.select-all-btn:hover { border-color: #3d6080; color: #3d6080; }
.selection-count { font-size: 12.5px; color: #4a5a6a; margin-bottom: 12px; }

.enseignant-list { display: flex; flex-direction: column; gap: 6px; max-height: 300px; overflow-y: auto; }
.enseignant-list::-webkit-scrollbar { width: 4px; }
.enseignant-list::-webkit-scrollbar-thumb { background: #c8c4bc; border-radius: 4px; }

.ens-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 10px;
  cursor: pointer; transition: all 0.18s;
}
.ens-item:hover { border-color: #3d6080; }
.ens-selected { border-color: #27ae60; background: rgba(39,174,96,0.06); }
.ens-check { display: none; }
.ens-avatar {
  width: 34px; height: 34px; border-radius: 8px; background: #3d6080;
  color: #fff; font-weight: 700; font-size: 11px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ens-info { flex: 1; }
.ens-name { font-size: 13.5px; font-weight: 600; color: #1e2a35; }
.ens-email { font-size: 12px; color: #8a9aaa; }
.ens-check-icon { flex-shrink: 0; }
.empty-search { text-align: center; padding: 16px; color: #8a9aaa; font-size: 13px; }

/* Footer */
.form-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; background: #ddd9d1; border: 1.5px solid #c8c4bc;
  border-radius: 14px; gap: 12px;
}
.footer-right { display: flex; align-items: center; gap: 14px; }
.statut-preview { font-size: 12.5px; color: #8a9aaa; display: flex; align-items: center; gap: 5px; }
.btn-primary {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 22px; background: #3d6080; color: #fff;
  border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.18s;
}
.btn-primary:hover { background: #2f4f6a; transform: translateY(-1px); }
.btn-outline {
  padding: 11px 18px; background: transparent;
  border: 1.5px solid #c8c4bc; border-radius: 10px;
  font-size: 13.5px; color: #4a5a6a; cursor: pointer; font-family: inherit;
  transition: all 0.18s;
}
.btn-outline:hover { border-color: #3d6080; color: #3d6080; }

/* Modale */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 999;
}
.confirm-modal {
  background: #ddd9d1; border-radius: 16px; padding: 32px;
  max-width: 420px; width: 90%; text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.confirm-icon {
  width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
}
.confirm-icon.warn { background: rgba(245,166,35,0.15); color: #d98e1a; }
.confirm-modal h4 { font-size: 18px; font-weight: 700; color: #1e2a35; margin-bottom: 10px; }
.confirm-modal p { font-size: 14px; color: #4a5a6a; line-height: 1.6; margin-bottom: 24px; }
.confirm-btns { display: flex; gap: 10px; justify-content: center; }
.btn-danger {
  padding: 10px 20px; background: #c0392b; color: #fff;
  border: none; border-radius: 9px; font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background 0.18s;
}
.btn-danger:hover { background: #a93226; }
.modal-fade-enter-active { transition: opacity 0.25s; }
.modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>