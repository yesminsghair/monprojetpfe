<template>
  <div class="page-content">

    <!-- HEADER -->
    <div class="page-header">
      <div class="header-left">
        <span class="header-icon">📊</span>
        <div>
          <h2>Grille d'évaluation</h2>
          <p class="subtitle">Configurer les critères et paramètres de la grille de soutenance</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-gold" @click="openForm" :disabled="verrouille">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Ajouter un critère
        </button>
        <button class="btn-outline" @click="publierGrille" :disabled="publie || verrouille">
          {{ publie ? '✅ Publiée' : '📢 Publier' }}
        </button>
        <button class="btn-lock" @click="verrouillerGrille" :disabled="verrouille">
          {{ verrouille ? '🔒 Verrouillée' : '🔐 Verrouiller' }}
        </button>
      </div>
    </div>

    <!-- SETTINGS CARD -->
    <div class="settings-card">

      <!-- Statut badges -->
      <div class="settings-row">
        <div class="settings-col">
          <div class="setting-label">Statut de la grille</div>
          <div class="status-badges">
            <span class="status-pill" :class="publie ? 'pill-green' : 'pill-gray'">
              {{ publie ? '✅ Publiée' : '⏳ Non publiée' }}
            </span>
            <span class="status-pill" :class="verrouille ? 'pill-red' : 'pill-orange'">
              {{ verrouille ? '🔒 Verrouillée' : '✏️ Modifiable' }}
            </span>
          </div>
        </div>
        <div class="settings-col" v-if="criteres.length">
          <div class="setting-label">Total barème</div>
          <div class="total-bareme">{{ totalBareme }} <span class="total-unit">points</span></div>
        </div>
      </div>

      <!-- Visibilité : mode rapide -->
      <div class="visibility-section">
        <div class="vis-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span>Qui peut consulter la grille ?</span>
          <div class="mode-toggle">
            <button class="mode-btn" :class="{active: visMode==='rapide'}" @click="visMode='rapide'">Mode rapide</button>
            <button class="mode-btn" :class="{active: visMode==='personnalise'}" @click="visMode='personnalise'">Personnalisé</button>
          </div>
        </div>

        <!-- Mode rapide -->
        <div v-if="visMode==='rapide'" class="rapide-options">
          <label v-for="opt in visOptions" :key="opt.val" class="vis-radio"
            :class="{selected: consultationRapide===opt.val}">
            <input type="radio" :value="opt.val" v-model="consultationRapide" :disabled="verrouille" @change="applyRapide"/>
            <span class="radio-icon">{{ opt.icon }}</span>
            <div class="radio-info">
              <div class="radio-label">{{ opt.label }}</div>
              <div class="radio-sub">{{ opt.sub }}</div>
            </div>
            <span class="radio-check" v-if="consultationRapide===opt.val">✓</span>
          </label>
        </div>

        <!-- Mode personnalisé -->
        <div v-if="visMode==='personnalise'" class="personnalise-wrap">

          <!-- Encadrants -->
          <div class="pers-group">
            <div class="pers-group-header">
              <div class="pers-group-title">
                <span class="pers-icon enc-icon">👨‍🏫</span>
                <span>Encadrants autorisés</span>
                <span class="pers-count">{{ encadrantsSelectionnes.length }}/{{ encadrants.length }}</span>
              </div>
              <div class="pers-bulk">
                <button class="bulk-btn" @click="tousEncadrants" :disabled="verrouille">Tous</button>
                <button class="bulk-btn" @click="aucunEncadrant" :disabled="verrouille">Aucun</button>
              </div>
            </div>
            <div class="pers-search">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="searchEnc" placeholder="Rechercher un encadrant..." :disabled="verrouille"/>
            </div>
            <div class="pers-list">
              <label v-for="e in encadrantsFiltres" :key="e.id" class="pers-item"
                :class="{checked: encadrantsSelectionnes.includes(e.id)}">
                <input type="checkbox" :value="e.id" v-model="encadrantsSelectionnes" :disabled="verrouille"/>
                <div class="pers-av" :style="{background: e.color}">{{ initials(e.nom) }}</div>
                <div class="pers-info">
                  <div class="pers-nom">{{ e.nom }}</div>
                  <div class="pers-meta">{{ e.specialite }}</div>
                </div>
                <span class="pers-check-icon" v-if="encadrantsSelectionnes.includes(e.id)">✓</span>
              </label>
              <div class="pers-empty" v-if="!encadrantsFiltres.length">Aucun résultat</div>
            </div>
          </div>

          <!-- Jurys -->
          <div class="pers-group">
            <div class="pers-group-header">
              <div class="pers-group-title">
                <span class="pers-icon jury-icon">⚖️</span>
                <span>Membres de jury autorisés</span>
                <span class="pers-count">{{ jurysSelectionnes.length }}/{{ jurys.length }}</span>
              </div>
              <div class="pers-bulk">
                <button class="bulk-btn" @click="tousJurys" :disabled="verrouille">Tous</button>
                <button class="bulk-btn" @click="aucunJury" :disabled="verrouille">Aucun</button>
              </div>
            </div>
            <div class="pers-search">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="searchJury" placeholder="Rechercher un membre de jury..." :disabled="verrouille"/>
            </div>
            <div class="pers-list">
              <label v-for="j in jurysFiltres" :key="j.id" class="pers-item"
                :class="{checked: jurysSelectionnes.includes(j.id)}">
                <input type="checkbox" :value="j.id" v-model="jurysSelectionnes" :disabled="verrouille"/>
                <div class="pers-av" :style="{background: j.color}">{{ initials(j.nom) }}</div>
                <div class="pers-info">
                  <div class="pers-nom">{{ j.nom }}</div>
                  <div class="pers-meta">{{ j.grade }}</div>
                </div>
                <span class="pers-check-icon" v-if="jurysSelectionnes.includes(j.id)">✓</span>
              </label>
              <div class="pers-empty" v-if="!jurysFiltres.length">Aucun résultat</div>
            </div>
          </div>

        </div>

        <!-- Résumé accès -->
        <div class="access-summary" v-if="visMode==='personnalise'">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Accès accordé à {{ encadrantsSelectionnes.length }} encadrant(s) et {{ jurysSelectionnes.length }} membre(s) de jury
          <button class="save-access-btn" @click="sauvegarderAcces" :disabled="verrouille">Enregistrer</button>
        </div>
      </div>
    </div>

    <!-- TABLE CRITÈRES -->
    <div class="table-wrapper" v-if="criteres.length">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Critère d'évaluation</th>
            <th>Type</th>
            <th>Barème</th>
            <th>Pondération</th>
            <th>% du total</th>
            <th v-if="!verrouille" class="th-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, index) in criteres" :key="c.id" class="table-row">
            <td><div class="index-badge">{{ index + 1 }}</div></td>
            <td>
              <div class="critere-title">{{ c.nom }}</div>
              <div class="critere-desc" v-if="c.description">{{ c.description }}</div>
            </td>
            <td>
              <span class="type-badge" :class="c.type === 'Qualitatif' ? 'type-qual' : 'type-quant'">{{ c.type }}</span>
            </td>
            <td><span class="score-badge">{{ c.note }} pts</span></td>
            <td><span class="coef-badge">×{{ c.coefficient }}</span></td>
            <td>
              <div class="pct-wrap">
                <div class="pct-bg"><div class="pct-fill" :style="{width: getPct(c)+'%'}"></div></div>
                <span class="pct-num">{{ getPct(c) }}%</span>
              </div>
            </td>
            <td class="td-actions" v-if="!verrouille">
              <button class="btn-icon btn-edit" @click="editCritere(c)" title="Modifier">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-icon btn-del" @click="supprimer(c.id)" title="Supprimer">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <p>Aucun critère défini — commencez par en ajouter un</p>
      <button class="btn-gold" @click="openForm" :disabled="verrouille">+ Premier critère</button>
    </div>

    <!-- MODAL -->
    <transition name="modal-fade">
      <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ editMode ? 'Modifier un critère' : 'Ajouter un critère' }}</h3>
            <button class="modal-close" @click="closeForm">×</button>
          </div>
          <div class="modal-body">

            <div class="form-group">
              <label>Nom du critère *</label>
              <input v-model="form.nom" placeholder="Ex: Qualité du rapport écrit" :class="{'input-err': errors.nom}"/>
              <p v-if="errors.nom" class="err-msg">{{ errors.nom }}</p>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea v-model="form.description" placeholder="Description optionnelle..." rows="3"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Type d'évaluation</label>
                <select v-model="form.type">
                  <option value="Qualitatif">Qualitatif</option>
                  <option value="Quantitatif">Quantitatif</option>
                </select>
              </div>
              <div class="form-group">
                <label>Barème (points) *</label>
                <input type="number" v-model.number="form.note" min="1" :class="{'input-err': errors.note}"/>
                <p v-if="errors.note" class="err-msg">{{ errors.note }}</p>
              </div>
            </div>

            <div class="form-group">
              <label>Pondération (coefficient)</label>
              <input type="number" v-model.number="form.coefficient" min="1"/>
            </div>

          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeForm">Annuler</button>
            <button class="btn-gold" @click="save">{{ editMode ? 'Enregistrer' : 'Ajouter' }}</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
export default {
  name: 'GestionGrille',
  data() {
    return {
      criteres: [],
      publie: false,
      verrouille: false,
      showForm: false,
      editMode: false,

      // Visibility
      visMode: 'rapide',
      consultationRapide: 'chefs',
      visOptions: [
        { val: 'chefs',       icon: '🏛️', label: 'Chefs de département uniquement', sub: 'Accès restreint aux chefs' },
        { val: 'encadrants',  icon: '👨‍🏫', label: 'Encadrants + Chefs',              sub: 'Tous les encadrants peuvent consulter' },
        { val: 'jurys',       icon: '⚖️', label: 'Membres de jury + Chefs',          sub: 'Les membres de jury peuvent consulter' },
        { val: 'tous',        icon: '🌐', label: 'Tout le monde',                    sub: 'Encadrants, jurys et étudiants' },
      ],

      // Personnalisé
      searchEnc: '',
      searchJury: '',
      encadrantsSelectionnes: [],
      jurysSelectionnes: [],

      // Données mock - en production, charger depuis l'API
      encadrants: [
        { id: 1, nom: 'Dr. Tarek Chaari',    specialite: 'Informatique',       color: '#3d6080' },
        { id: 2, nom: 'Prof. Sonia Mrad',    specialite: 'Réseaux & Systèmes', color: '#27ae60' },
        { id: 3, nom: 'Dr. Kamel Boussema', specialite: 'Intelligence Artificielle', color: '#8e44ad' },
        { id: 4, nom: 'Dr. Rim Trabelsi',   specialite: 'Génie Logiciel',      color: '#e67e22' },
        { id: 5, nom: 'Prof. Anes Hajri',   specialite: 'Base de données',     color: '#c0392b' },
      ],
      jurys: [
        { id: 1, nom: 'Prof. Hatem Zouari',  grade: 'Professeur',          color: '#2c3e50' },
        { id: 2, nom: 'Dr. Leila Mansouri',  grade: 'Maître de conférence', color: '#16a085' },
        { id: 3, nom: 'Dr. Fares Ben Ammar', grade: 'Maître assistant',     color: '#d35400' },
        { id: 4, nom: 'Prof. Nabil Gasmi',   grade: 'Professeur',          color: '#7f8c8d' },
      ],

      form: { id: null, nom: '', description: '', type: 'Qualitatif', note: 1, coefficient: 1 },
      errors: { nom: '', note: '' },
    }
  },
  computed: {
    totalBareme() {
      return this.criteres.reduce((s, c) => s + Number(c.note) * Number(c.coefficient), 0)
    },
    encadrantsFiltres() {
      const q = this.searchEnc.toLowerCase()
      return this.encadrants.filter(e => e.nom.toLowerCase().includes(q) || e.specialite.toLowerCase().includes(q))
    },
    jurysFiltres() {
      const q = this.searchJury.toLowerCase()
      return this.jurys.filter(j => j.nom.toLowerCase().includes(q) || j.grade.toLowerCase().includes(q))
    },
  },
  mounted() {
    const data = JSON.parse(localStorage.getItem('grilleData') || 'null')
    if (data) {
      this.criteres = data.criteres || []
      this.consultationRapide = data.consultationRapide || 'chefs'
      this.visMode = data.visMode || 'rapide'
      this.publie = data.publie || false
      this.verrouille = data.verrouille || false
      this.encadrantsSelectionnes = data.encadrantsSelectionnes || []
      this.jurysSelectionnes = data.jurysSelectionnes || []
    }
  },
  methods: {
    initials(n) { return n.replace(/Dr\.|Prof\./gi,'').trim().split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() },

    getPct(c) {
      if (!this.totalBareme) return 0
      return Math.round((c.note * c.coefficient / this.totalBareme) * 100)
    },

    saveStorage() {
      localStorage.setItem('grilleData', JSON.stringify({
        criteres: this.criteres,
        consultationRapide: this.consultationRapide,
        visMode: this.visMode,
        publie: this.publie,
        verrouille: this.verrouille,
        encadrantsSelectionnes: this.encadrantsSelectionnes,
        jurysSelectionnes: this.jurysSelectionnes,
      }))
    },

    applyRapide() {
      if (this.consultationRapide === 'tous') {
        this.encadrantsSelectionnes = this.encadrants.map(e => e.id)
        this.jurysSelectionnes = this.jurys.map(j => j.id)
      } else if (this.consultationRapide === 'encadrants') {
        this.encadrantsSelectionnes = this.encadrants.map(e => e.id)
        this.jurysSelectionnes = []
      } else if (this.consultationRapide === 'jurys') {
        this.encadrantsSelectionnes = []
        this.jurysSelectionnes = this.jurys.map(j => j.id)
      } else {
        this.encadrantsSelectionnes = []
        this.jurysSelectionnes = []
      }
      this.saveStorage()
    },

    tousEncadrants() { this.encadrantsSelectionnes = this.encadrants.map(e => e.id) },
    aucunEncadrant() { this.encadrantsSelectionnes = [] },
    tousJurys()     { this.jurysSelectionnes = this.jurys.map(j => j.id) },
    aucunJury()     { this.jurysSelectionnes = [] },
    sauvegarderAcces() { this.saveStorage(); alert('Accès enregistré ✓') },

    openForm() { this.resetForm(); this.showForm = true },
    closeForm() { this.showForm = false },
    resetForm() {
      this.form = { id: null, nom: '', description: '', type: 'Qualitatif', note: 1, coefficient: 1 }
      this.errors = { nom: '', note: '' }
      this.editMode = false
    },
    validate() {
      this.errors = { nom: '', note: '' }
      let ok = true
      if (!this.form.nom) { this.errors.nom = 'Champ obligatoire'; ok = false }
      if (!this.form.note || this.form.note < 1) { this.errors.note = 'Minimum 1 point'; ok = false }
      return ok
    },
    save() {
      if (!this.validate()) return
      if (this.editMode) {
        const i = this.criteres.findIndex(c => c.id === this.form.id)
        this.criteres.splice(i, 1, { ...this.form })
      } else {
        this.criteres.push({ ...this.form, id: Date.now() })
      }
      this.saveStorage()
      this.closeForm()
    },
    editCritere(c) { this.form = { ...c }; this.editMode = true; this.showForm = true },
    supprimer(id) {
      if (confirm('Supprimer ce critère ?')) {
        this.criteres = this.criteres.filter(c => c.id !== id)
        this.saveStorage()
      }
    },
    publierGrille() {
      if (confirm('Publier la grille ? Elle sera visible selon les paramètres de visibilité.')) {
        this.publie = true; this.saveStorage()
      }
    },
    verrouillerGrille() {
      if (confirm('Verrouiller la grille ? Aucune modification ne sera possible après cela.')) {
        this.verrouille = true; this.publie = true; this.saveStorage()
      }
    },
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.page-content{font-family:'Source Sans 3',sans-serif;color:#1e2a35;padding:0}

/* HEADER */
.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;gap:16px;flex-wrap:wrap}
.header-left{display:flex;align-items:center;gap:14px}
.header-icon{font-size:28px;line-height:1}
.page-header h2{font-family:'Merriweather',serif;font-size:20px;color:#1e2a35;margin-bottom:3px}
.subtitle{font-size:13.5px;color:#8a9aaa}
.header-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}

/* SETTINGS CARD */
.settings-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;padding:20px 24px;margin-bottom:24px;box-shadow:0 2px 10px rgba(0,0,0,0.05)}
.settings-row{display:flex;gap:32px;margin-bottom:20px;flex-wrap:wrap}
.settings-col{display:flex;flex-direction:column;gap:8px}
.setting-label{font-size:11px;font-weight:700;color:#8a9aaa;text-transform:uppercase;letter-spacing:.05em}
.status-badges{display:flex;gap:8px;flex-wrap:wrap}
.status-pill{padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600}
.pill-green{background:#d4edda;color:#155724}
.pill-gray{background:#e8e4dc;color:#8a9aaa;border:1px solid #c8c4bc}
.pill-red{background:#f8d7da;color:#721c24}
.pill-orange{background:#fff3cd;color:#856404}
.total-bareme{font-family:'Merriweather',serif;font-size:26px;font-weight:700;color:#f5a623}
.total-unit{font-size:13px;font-weight:400;color:#8a9aaa;font-family:'Source Sans 3',sans-serif}

/* VISIBILITY SECTION */
.visibility-section{border-top:1px solid #c8c4bc;padding-top:18px}
.vis-header{display:flex;align-items:center;gap:10px;margin-bottom:16px;font-size:14px;font-weight:600;color:#3d5a72;flex-wrap:wrap}
.mode-toggle{margin-left:auto;display:flex;background:#e8e4dc;border-radius:8px;padding:3px;gap:2px}
.mode-btn{padding:6px 14px;border:none;border-radius:6px;font-size:12.5px;font-weight:600;cursor:pointer;background:transparent;color:#8a9aaa;font-family:'Source Sans 3',sans-serif;transition:.18s}
.mode-btn.active{background:#fff;color:#3d6080;box-shadow:0 1px 4px rgba(0,0,0,0.1)}

/* RAPIDE OPTIONS */
.rapide-options{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
.vis-radio{display:flex;align-items:center;gap:12px;padding:12px 14px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:10px;cursor:pointer;transition:.18s;position:relative}
.vis-radio:hover{border-color:#3d6080;background:#f4f6f8}
.vis-radio.selected{border-color:#f5a623;background:#fff9ee}
.vis-radio input{display:none}
.radio-icon{font-size:20px;flex-shrink:0}
.radio-label{font-size:13.5px;font-weight:600;color:#1e2a35}
.radio-sub{font-size:12px;color:#8a9aaa;margin-top:2px}
.radio-check{margin-left:auto;color:#f5a623;font-weight:700;font-size:16px}

/* PERSONNALISE */
.personnalise-wrap{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:700px){.personnalise-wrap{grid-template-columns:1fr}}

.pers-group{background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:12px;overflow:hidden}
.pers-group-header{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:#ddd9d1;border-bottom:1px solid #c8c4bc}
.pers-group-title{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:700;color:#1e2a35}
.pers-icon{font-size:16px}
.pers-count{font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(61,96,128,0.1);color:#3d6080}
.pers-bulk{display:flex;gap:6px}
.bulk-btn{padding:4px 10px;border:1px solid #c8c4bc;border-radius:6px;background:#ddd9d1;color:#4a5a6a;font-size:12px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.15s}
.bulk-btn:hover:not(:disabled){background:#3d6080;color:#fff;border-color:#3d6080}
.bulk-btn:disabled{opacity:.4;cursor:not-allowed}

.pers-search{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #c8c4bc;background:#ddd9d1}
.pers-search input{flex:1;border:none;background:transparent;font-size:13px;color:#1e2a35;outline:none;font-family:'Source Sans 3',sans-serif}
.pers-search input::placeholder{color:#aaa}
.pers-search input:disabled{opacity:.5}

.pers-list{max-height:220px;overflow-y:auto}
.pers-item{display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;border-bottom:1px solid rgba(200,196,188,0.5);transition:.15s}
.pers-item:last-child{border-bottom:none}
.pers-item:hover{background:rgba(61,96,128,0.06)}
.pers-item.checked{background:#f0f7ff}
.pers-item input{display:none}
.pers-av{width:32px;height:32px;border-radius:8px;color:#fff;font-weight:700;font-size:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Merriweather',serif}
.pers-nom{font-size:13.5px;font-weight:600;color:#1e2a35}
.pers-meta{font-size:12px;color:#8a9aaa}
.pers-check-icon{margin-left:auto;color:#f5a623;font-weight:700;font-size:15px}
.pers-empty{padding:20px;text-align:center;color:#aaa;font-size:13px}

/* ACCESS SUMMARY */
.access-summary{display:flex;align-items:center;gap:10px;margin-top:14px;padding:10px 16px;background:#e8f5e9;border:1px solid #c8e6c9;border-radius:9px;font-size:13.5px;color:#2e7d32;flex-wrap:wrap}
.save-access-btn{margin-left:auto;background:linear-gradient(135deg,#f5a623,#d98e1a);color:#fff;border:none;padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.2s}
.save-access-btn:hover:not(:disabled){transform:translateY(-1px)}
.save-access-btn:disabled{opacity:.4;cursor:not-allowed}

/* BUTTONS */
.btn-gold{display:flex;align-items:center;gap:7px;padding:10px 18px;background:linear-gradient(135deg,#f5a623,#d98e1a);color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .2s;box-shadow:0 2px 8px rgba(245,166,35,.25)}
.btn-gold:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 14px rgba(245,166,35,.35)}
.btn-gold:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-outline{display:flex;align-items:center;gap:7px;padding:10px 18px;background:transparent;border:1.5px solid #c8c4bc;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;color:#4a5a6a;font-family:'Source Sans 3',sans-serif;transition:all .18s}
.btn-outline:hover:not(:disabled){border-color:#3d6080;color:#3d6080}
.btn-outline:disabled{opacity:.5;cursor:not-allowed}
.btn-lock{display:flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(231,76,60,.08);border:1.5px solid rgba(231,76,60,.3);border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;color:#c0392b;font-family:'Source Sans 3',sans-serif;transition:all .18s}
.btn-lock:hover:not(:disabled){background:rgba(231,76,60,.15)}
.btn-lock:disabled{opacity:.5;cursor:not-allowed}
.btn-cancel{padding:10px 18px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;color:#4a5a6a;transition:.18s}
.btn-cancel:hover{background:#ddd9d1}

/* TABLE */
.table-wrapper{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.05)}
.table{width:100%;border-collapse:collapse}
.table thead tr{background:#c8c4bc}
.table th{padding:11px 14px;font-size:11px;font-weight:700;color:#4a5a6a;text-transform:uppercase;letter-spacing:.05em;text-align:left}
.th-center{text-align:center}
.table td{padding:13px 14px;font-size:13.5px;vertical-align:middle;border-top:1px solid #c8c4bc;background:#e8e4dc}
.table-row:hover td{background:rgba(61,96,128,.06)}

.index-badge{width:28px;height:28px;border-radius:7px;background:rgba(245,166,35,.15);border:1.5px solid rgba(245,166,35,.35);display:flex;align-items:center;justify-content:center;font-weight:700;color:#d98e1a;font-size:12.5px}
.critere-title{font-weight:700;color:#1e2a35;font-size:14px}
.critere-desc{font-size:12px;color:#8a9aaa;margin-top:3px}
.type-badge{padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
.type-qual{background:rgba(61,96,128,.12);color:#3d6080}
.type-quant{background:rgba(142,68,173,.12);color:#7d3c98}
.score-badge{padding:3px 10px;background:rgba(245,166,35,.15);color:#d98e1a;border:1px solid rgba(245,166,35,.3);border-radius:20px;font-weight:700;font-size:12.5px}
.coef-badge{padding:3px 10px;background:rgba(39,174,96,.12);color:#1e8449;border:1px solid rgba(39,174,96,.25);border-radius:20px;font-weight:700;font-size:12.5px}
.pct-wrap{display:flex;align-items:center;gap:8px;min-width:100px}
.pct-bg{flex:1;height:6px;background:#c8c4bc;border-radius:10px;overflow:hidden}
.pct-fill{height:100%;background:linear-gradient(90deg,#3d6080,#f5a623);border-radius:10px;transition:width .4s}
.pct-num{font-size:12px;color:#8a9aaa;min-width:34px}
.td-actions{text-align:center;white-space:nowrap}
.btn-icon{width:30px;height:30px;border:none;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:.15s;margin:0 2px}
.btn-edit{background:rgba(61,96,128,.12);color:#3d6080}.btn-edit:hover{background:#3d6080;color:#fff}
.btn-del{background:rgba(231,76,60,.08);color:#e74c3c}.btn-del:hover{background:#e74c3c;color:#fff}

/* EMPTY */
.empty-state{text-align:center;padding:60px 20px;color:#8a9aaa;line-height:1.7;display:flex;flex-direction:column;align-items:center;gap:14px;background:#ddd9d1;border:2px dashed #c8c4bc;border-radius:14px}
.empty-icon{font-size:48px}

/* MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:#ddd9d1;border-radius:16px;width:100%;max-width:540px;max-height:88vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.25)}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:22px 24px 0}
.modal-header h3{font-family:'Merriweather',serif;font-size:17px;color:#1e2a35}
.modal-close{background:none;border:none;font-size:22px;color:#8a9aaa;cursor:pointer;line-height:1;transition:color .15s}.modal-close:hover{color:#1e2a35}
.modal-body{padding:20px 24px;display:flex;flex-direction:column;gap:14px}
.modal-footer{padding:16px 24px;border-top:1px solid #c8c4bc;display:flex;justify-content:flex-end;gap:10px}
.form-group{display:flex;flex-direction:column;gap:6px}
.form-group label{font-size:13.5px;font-weight:600;color:#3d5a72}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.form-group input,.form-group select,.form-group textarea{padding:10px 12px;border:1.5px solid #c8c4bc;border-radius:9px;background:#e8e4dc;font-size:14px;color:#1e2a35;font-family:'Source Sans 3',sans-serif;transition:.18s;resize:vertical}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{outline:none;border-color:#3d6080}
input.input-err,.input-err{border-color:#e74c3c!important}
.err-msg{color:#e74c3c;font-size:12px;margin-top:2px}
.modal-fade-enter-active,.modal-fade-leave-active{transition:opacity .2s,transform .2s}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0;transform:scale(.97)}
</style>