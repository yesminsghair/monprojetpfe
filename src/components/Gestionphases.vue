<template>
  <div class="page-content">

    <!-- HEADER -->
    <div class="page-header">
      <div class="header-left">
        <span class="header-icon">📋</span>
        <div>
          <h2>Gestion des phases d'évaluation</h2>
          <p class="subtitle">Définir et ordonner les phases du projet</p>
        </div>
      </div>
      <button class="btn-gold" @click="openForm()">
        <span>+</span> Nouvelle phase
      </button>
    </div>

    <!-- STATS -->
    <div class="stats-bar" v-if="phases.length">
      <div class="stat-card">
        <span class="stat-val">{{ phases.length }}</span>
        <span class="stat-label">Phases</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">{{ totalCoeff }}</span>
        <span class="stat-label">Coeff. total</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">{{ phasesActives }}</span>
        <span class="stat-label">Actives</span>
      </div>
    </div>

    <!-- TABLEAU -->
    <div class="table-wrapper" v-if="phases.length">
      <table class="table">
        <thead>
          <tr>
            <th>Ordre</th>
            <th>Nom de la phase</th>
            <th>Date début</th>
            <th>Date fin</th>
            <th>Coefficient</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, index) in phases" :key="p.id" :class="{ 'row-active': p.active }">
            <td>
              <div class="order-badge">{{ index + 1 }}</div>
            </td>
            <td>
              <div class="phase-name">{{ p.nom }}</div>
            </td>
            <td class="date-cell">{{ formatDate(p.dateDebut) }}</td>
            <td class="date-cell">{{ formatDate(p.dateFin) }}</td>
            <td>
              <span class="coef-badge">x{{ p.coefficient }}</span>
            </td>
            <td>
              <span class="status-badge" :class="p.active ? 'status-active' : 'status-inactive'">
                {{ p.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="actions">
              <button @click="monter(index)" class="icon-btn" title="Monter" :disabled="index === 0">↑</button>
              <button @click="descendre(index)" class="icon-btn" title="Descendre" :disabled="index === phases.length - 1">↓</button>
              <button @click="toggleActive(p)" class="btn-sm btn-blue">
                {{ p.active ? 'Désactiver' : 'Activer' }}
              </button>
              <button @click="editPhase(p)" class="btn-sm btn-outline">Modifier</button>
              <button @click="supprimer(p.id)" class="btn-sm btn-danger">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-box">
      <div class="empty-icon">📂</div>
      <p>Aucune phase définie</p>
      <button class="btn-gold" @click="openForm()">Créer la première phase</button>
    </div>

    <!-- MODAL -->
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal-box">
        <div class="modal-header">
          <h3>{{ editMode ? '✏️ Modifier la phase' : '➕ Créer une phase' }}</h3>
          <button class="close-btn" @click="closeForm">✕</button>
        </div>

        <div class="form-group">
          <label>Nom de la phase *</label>
          <input v-model="form.nom" placeholder="Ex: Soutenance intermédiaire" :class="{ 'input-error': errors.nom }" />
          <small v-if="errors.nom" class="error-text">{{ errors.nom }}</small>
        </div>

        <div class="row-2">
          <div class="form-group">
            <label>Date de début *</label>
            <input type="date" v-model="form.dateDebut" :class="{ 'input-error': errors.dateDebut }" />
            <small v-if="errors.dateDebut" class="error-text">{{ errors.dateDebut }}</small>
          </div>
          <div class="form-group">
            <label>Date de fin *</label>
            <input type="date" v-model="form.dateFin" :class="{ 'input-error': errors.dateFin }" />
            <small v-if="errors.dateFin" class="error-text">{{ errors.dateFin }}</small>
          </div>
        </div>

        <div class="form-group">
          <label>Coefficient *</label>
          <input type="number" v-model.number="form.coefficient" min="1" :class="{ 'input-error': errors.coefficient }" />
          <small v-if="errors.coefficient" class="error-text">{{ errors.coefficient }}</small>
        </div>

        <div class="modal-actions">
          <button class="btn-gold" @click="save">{{ editMode ? 'Enregistrer' : 'Créer la phase' }}</button>
          <button class="btn-outline" @click="closeForm">Annuler</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'GestionPhases',
  data() {
    return {
      phases: [],
      showForm: false,
      editMode: false,
      form: { id: null, nom: '', dateDebut: '', dateFin: '', coefficient: 1, active: false },
      errors: {}
    }
  },
  computed: {
    totalCoeff() {
      return this.phases.reduce((s, p) => s + Number(p.coefficient), 0)
    },
    phasesActives() {
      return this.phases.filter(p => p.active).length
    }
  },
  methods: {
    formatDate(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('fr-FR')
    },
    openForm() {
      this.resetForm()
      this.showForm = true
    },
    closeForm() {
      this.showForm = false
    },
    resetForm() {
      this.form = { id: null, nom: '', dateDebut: '', dateFin: '', coefficient: 1, active: false }
      this.editMode = false
      this.errors = {}
    },
    validerForm() {
      this.errors = {}
      if (!this.form.nom) this.errors.nom = 'Champ obligatoire'
      if (!this.form.dateDebut) this.errors.dateDebut = 'Champ obligatoire'
      if (!this.form.dateFin) this.errors.dateFin = 'Champ obligatoire'
      if (!this.form.coefficient) this.errors.coefficient = 'Champ obligatoire'
      else if (this.form.coefficient < 1) this.errors.coefficient = 'Le coefficient doit être ≥ 1'
      if (this.form.dateDebut && this.form.dateFin && this.form.dateFin < this.form.dateDebut)
        this.errors.dateFin = 'Date de fin antérieure à la date de début'
      return Object.keys(this.errors).length === 0
    },
    save() {
      if (!this.validerForm()) return
      if (this.editMode) {
        const i = this.phases.findIndex(p => p.id === this.form.id)
        this.phases.splice(i, 1, { ...this.form })
      } else {
        this.phases.push({ ...this.form, id: Date.now() })
      }
      this.closeForm()
    },
    editPhase(p) {
      this.form = { ...p }
      this.editMode = true
      this.showForm = true
      this.errors = {}
    },
    supprimer(id) {
      if (confirm('Supprimer cette phase ?')) {
        this.phases = this.phases.filter(p => p.id !== id)
      }
    },
    toggleActive(p) {
      p.active = !p.active
    },
    monter(index) {
      if (index === 0) return
      const temp = this.phases[index]
      this.phases.splice(index, 1)
      this.phases.splice(index - 1, 0, temp)
    },
    descendre(index) {
      if (index === this.phases.length - 1) return
      const temp = this.phases[index]
      this.phases.splice(index, 1)
      this.phases.splice(index + 1, 0, temp)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; }

.page-content {
  padding: 32px;
  background: #0F1923;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  color: #E8EDF2;
}

/* HEADER */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.header-icon {
  font-size: 28px;
  background: rgba(245,197,24,0.15);
  width: 52px; height: 52px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 14px;
  border: 1px solid rgba(245,197,24,0.3);
}
.page-header h2 {
  font-family: 'Syne', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #F5C518;
  margin: 0;
}
.subtitle {
  font-size: 13px;
  color: #7A8FA6;
  margin: 2px 0 0;
}

/* STATS */
.stats-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  background: #1A2635;
  border: 1px solid rgba(245,197,24,0.2);
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 100px;
}
.stat-val {
  font-family: 'Syne', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #F5C518;
  line-height: 1;
}
.stat-label {
  font-size: 12px;
  color: #7A8FA6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* TABLE */
.table-wrapper {
  background: #1A2635;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(245,197,24,0.15);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th {
  background: #243347;
  color: #F5C518;
  padding: 14px 16px;
  font-family: 'Syne', sans-serif;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  border-bottom: 1px solid rgba(245,197,24,0.2);
  text-align: left;
}
.table td {
  padding: 14px 16px;
  font-size: 14px;
  color: #C8D6E5;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.table tbody tr:hover {
  background: rgba(245,197,24,0.04);
}
.row-active {
  border-left: 3px solid #F5C518;
}

/* BADGES */
.order-badge {
  width: 32px; height: 32px;
  background: rgba(245,197,24,0.15);
  border: 1px solid rgba(245,197,24,0.4);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  color: #F5C518;
  font-size: 13px;
}
.phase-name {
  font-weight: 600;
  color: #E8EDF2;
}
.date-cell { color: #7A8FA6; font-size: 13px; }
.coef-badge {
  background: rgba(245,197,24,0.15);
  color: #F5C518;
  border: 1px solid rgba(245,197,24,0.3);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 13px;
}
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.status-active { background: rgba(39,174,96,0.2); color: #2ecc71; border: 1px solid rgba(39,174,96,0.3); }
.status-inactive { background: rgba(122,143,166,0.15); color: #7A8FA6; border: 1px solid rgba(122,143,166,0.2); }

/* ACTIONS */
.actions {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

/* BUTTONS */
.btn-gold {
  background: #F5C518;
  color: #0F1923;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-family: 'Syne', sans-serif;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex; align-items: center; gap: 6px;
}
.btn-gold:hover { background: #D4A017; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(245,197,24,0.4); }

.btn-outline {
  background: transparent;
  border: 1px solid rgba(245,197,24,0.35);
  color: #F5C518;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.btn-outline:hover { background: rgba(245,197,24,0.1); }

.btn-sm {
  padding: 5px 10px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-blue { background: rgba(41,128,185,0.2); color: #5dade2; border: 1px solid rgba(41,128,185,0.3); }
.btn-blue:hover { background: rgba(41,128,185,0.35); }
.btn-danger { background: rgba(231,76,60,0.2); color: #e74c3c; border: 1px solid rgba(231,76,60,0.3); }
.btn-danger:hover { background: rgba(231,76,60,0.35); }

.icon-btn {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #E8EDF2;
  width: 30px; height: 30px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.icon-btn:hover:not(:disabled) { background: rgba(245,197,24,0.2); color: #F5C518; border-color: rgba(245,197,24,0.4); }
.icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.btn-sm:disabled { opacity: 0.3; cursor: not-allowed; }

/* EMPTY */
.empty-box {
  background: #1A2635;
  border: 2px dashed rgba(245,197,24,0.25);
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  color: #7A8FA6;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-box p { margin-bottom: 20px; font-size: 15px; }

/* MODAL */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.modal-box {
  background: #1A2635;
  border: 1px solid rgba(245,197,24,0.25);
  border-radius: 18px;
  padding: 28px;
  width: 460px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.6);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.modal-header h3 {
  font-family: 'Syne', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #F5C518;
  margin: 0;
}
.close-btn {
  background: rgba(255,255,255,0.07);
  border: none;
  color: #7A8FA6;
  width: 32px; height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}
.close-btn:hover { background: rgba(231,76,60,0.2); color: #e74c3c; }

.form-group { margin-bottom: 16px; }
.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #7A8FA6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 7px;
}

input, select {
  width: 100%;
  padding: 11px 14px;
  background: #243347;
  border: 1px solid rgba(245,197,24,0.2);
  border-radius: 10px;
  color: #E8EDF2;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  transition: border-color 0.2s;
}
input:focus, select:focus {
  border-color: #F5C518;
  outline: none;
  box-shadow: 0 0 0 3px rgba(245,197,24,0.1);
}
input.input-error { border-color: #e74c3c; }

.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.error-text { color: #e74c3c; font-size: 11px; margin-top: 5px; display: block; }

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}
</style>