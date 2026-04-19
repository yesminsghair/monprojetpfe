<template>
<div class="page-content">

  <div class="page-header">
    <div class="header-left">
      <div class="header-icon">📋</div>
      <div>
        <h2>Phases d'évaluation PFE</h2>
        <p class="subtitle">Définir le calendrier commun à tous les projets et les livrables attendus</p>
      </div>
    </div>
    <div class="header-right">
      <div class="total-chip">
        <span>{{ phases.length }} phases</span>
        <span class="chip-sep">·</span>
        <span>{{ phases.filter(p=>p.livrableObligatoire).length }} livrables requis</span>
        <span class="chip-sep">·</span>
        <span class="chip-active">{{ phases.filter(p=>p.active).length }} active(s)</span>
      </div>
      <button class="btn-gold" @click="openForm()">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nouvelle phase
      </button>
    </div>
  </div>

  <transition name="notif-slide">
    <div v-if="notif.show" class="notif" :class="'notif-'+notif.type">
      {{ notif.msg }}<button @click="notif.show=false" class="notif-x">×</button>
    </div>
  </transition>

  <!-- INFO BANNER: activation logic -->
  <div class="info-banner" v-if="phases.length">
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    Une phase doit être <strong>activée</strong> par le chef pour être visible par les étudiants et encadrants.
    La phase suivante ne peut être activée que lorsque la précédente est <strong>terminée</strong>.
  </div>

  <!-- TABLE -->
  <div class="table-card" v-if="phases.length">
    <table class="table">
      <thead>
        <tr>
          <th>Ordre</th>
          <th>Nom de la phase</th>
          <th>Période</th>
          <th>Coefficient</th>
          <th class="th-center">Livrable requis ?</th>
          <th class="th-center">Statut</th>
          <th class="th-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(p,i) in phases" :key="p.id" class="table-row" :class="{'row-active':p.active,'row-done':p.terminee}">
          <td>
            <div class="order-cell">
              <div class="order-num">{{ i+1 }}</div>
              <div class="order-arrows">
                <button class="arr-btn" @click="monter(i)" :disabled="i===0">↑</button>
                <button class="arr-btn" @click="descendre(i)" :disabled="i===phases.length-1">↓</button>
              </div>
            </div>
          </td>
          <td>
            <div class="phase-nom">{{ p.nom }}</div>
          </td>
          <td class="td-dates">
            <span class="date-from">{{ fmtDate(p.dateDebut) }}</span>
            <span class="date-arrow">→</span>
            <span class="date-to">{{ fmtDate(p.dateFin) }}</span>
          </td>
          <td>
            <span class="coef-badge">×{{ p.coefficient }}</span>
          </td>
          <td class="td-center">
            <button class="toggle-btn"
              :class="p.livrableObligatoire ? 'toggle-on' : 'toggle-off'"
              @click="toggleLivrable(p)"
              :title="p.livrableObligatoire ? 'Désactiver le livrable' : 'Activer le livrable'">
              <span class="toggle-dot"></span>
              <span class="toggle-label">{{ p.livrableObligatoire ? 'Oui' : 'Non' }}</span>
            </button>
          </td>
          <td class="td-center">
            <!-- Status badge -->
            <span v-if="p.terminee" class="status-badge status-done">✓ Terminée</span>
            <span v-else-if="p.active" class="status-badge status-active">● Active</span>
            <span v-else class="status-badge status-inactive">⊘ Inactive</span>
          </td>
          <td class="td-center td-actions">
            <!-- Activate button: only if previous is done (or it's first) and current not yet active/done -->
            <button v-if="!p.active && !p.terminee" class="btn-activate"
              :disabled="!peutActiver(i)"
              :title="peutActiver(i) ? 'Activer cette phase' : 'La phase précédente doit être terminée d\'abord'"
              @click="activerPhase(p, i)">
              ▶ Activer
            </button>
            <!-- Terminate button: only if active -->
            <button v-if="p.active && !p.terminee" class="btn-terminate" @click="terminerPhase(p)">
              ■ Terminer
            </button>
            <button class="btn-icon btn-edit" @click="editPhase(p)" title="Modifier" :disabled="p.active||p.terminee">✏️</button>
            <button class="btn-icon btn-del" @click="supprimer(p.id)" title="Supprimer" :disabled="p.active||p.terminee">🗑</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="empty-state" v-else>
    <div class="empty-ico">📋</div>
    <p>Aucune phase définie — créez le calendrier PFE</p>
    <button class="btn-gold" @click="openForm()">Créer la première phase</button>
  </div>

  <!-- MODAL -->
  <transition name="modal-fade">
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <div class="modal-hdr">
          <h3>{{ editMode ? 'Modifier la phase' : 'Créer une phase' }}</h3>
          <button class="modal-close" @click="closeForm">×</button>
        </div>
        <div class="modal-body">

          <div class="form-group">
            <label>Nom de la phase *</label>
            <input v-model="form.nom" placeholder="Ex: Spécification et recueil des exigences" :class="{'inp-err':errors.nom}"/>
            <p class="err" v-if="errors.nom">{{ errors.nom }}</p>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date de début *</label>
              <input type="date" v-model="form.dateDebut" :class="{'inp-err':errors.dateDebut}"/>
              <p class="err" v-if="errors.dateDebut">{{ errors.dateDebut }}</p>
            </div>
            <div class="form-group">
              <label>Date de fin *</label>
              <input type="date" v-model="form.dateFin" :class="{'inp-err':errors.dateFin}"/>
              <p class="err" v-if="errors.dateFin">{{ errors.dateFin }}</p>
            </div>
          </div>

          <div class="form-group">
            <label>Coefficient *</label>
            <input type="number" v-model.number="form.coefficient" min="1"/>
          </div>

          <div class="form-group">
            <label>Livrable obligatoire pour cette phase ?</label>
            <div class="livrable-choice">
              <label class="choice-option" :class="{selected: form.livrableObligatoire===true}">
                <input type="radio" :value="true" v-model="form.livrableObligatoire"/>
                <span class="co-icon">📄</span>
                <div>
                  <div class="co-label">Oui — livrable requis</div>
                  <div class="co-sub">L'étudiant doit déposer un document</div>
                </div>
              </label>
              <label class="choice-option" :class="{selected: form.livrableObligatoire===false}">
                <input type="radio" :value="false" v-model="form.livrableObligatoire"/>
                <span class="co-icon">🚫</span>
                <div>
                  <div class="co-label">Non — pas de livrable</div>
                  <div class="co-sub">Phase sans dépôt de document</div>
                </div>
              </label>
            </div>
          </div>

        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeForm">Annuler</button>
          <button class="btn-gold" @click="save">{{ editMode ? 'Enregistrer' : 'Créer' }}</button>
        </div>
      </div>
    </div>
  </transition>

</div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'GestionPhases',
  data() {
    return {
      showForm: false,
      editMode: false,
      notif: { show: false, msg: '', type: 'ok' },
      phases: [],
      form: { id: null, nom: '', dateDebut: '', dateFin: '', coefficient: 1, livrableObligatoire: true },
      errors: {},
      loading: false
    }
  },
  mounted() {
    this.chargerPhases()
  },
  methods: {

    async chargerPhases() {
      this.loading = true
      try {
        const res = await api.get('/phases')
        this.phases = res.data.map(p => ({
          id: p.id,
          nom: p.nom,
          ordre: p.ordre,
          dateDebut: p.date_debut,
          dateFin: p.date_fin,
          coefficient: p.coefficient,
          livrable_obligatoire: p.livrable_obligatoire,
          livrableObligatoire: p.livrable_obligatoire,
          // active = phase is currently accessible to students/encadrants
          active: p.active ?? false,
          // terminee = phase has been marked as finished by the chef
          terminee: p.terminee ?? false,
        }))
      } catch (error) {
        this.showNotif('Erreur de chargement', 'err')
      } finally {
        this.loading = false
      }
    },

    // A phase can be activated only if:
    // - it's the first phase (index 0), OR the previous phase is terminee
    peutActiver(i) {
      if (i === 0) return true
      return this.phases[i - 1]?.terminee === true
    },

    async activerPhase(p, i) {
      if (!this.peutActiver(i)) {
        this.showNotif('La phase précédente doit être terminée avant d\'activer celle-ci.', 'err')
        return
      }
      try {
        await api.put(`/phases/${p.id}`, { active: true })
        await this.chargerPhases()
        this.showNotif(`Phase "${p.nom}" activée — visible par étudiants et encadrants ✓`)
      } catch (err) {
        this.showNotif(err.response?.data?.message || 'Erreur lors de l\'activation', 'err')
      }
    },

    async terminerPhase(p) {
      if (!confirm(`Marquer la phase "${p.nom}" comme terminée ? Les étudiants ne pourront plus y accéder.`)) return
      try {
        await api.put(`/phases/${p.id}`, { terminee: true })
        await this.chargerPhases()
        this.showNotif(`Phase "${p.nom}" terminée ✓`)
      } catch (err) {
        this.showNotif(err.response?.data?.message || 'Erreur', 'err')
      }
    },

    // Format date as DD/MM/YYYY (date only, no time)
    fmtDate(d) {
      if (!d) return '—'
      const parts = String(d).split('T')[0].split('-')
      if (parts.length !== 3) return d
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    },

    toggleLivrable(p) {
      p.livrable_obligatoire = !p.livrable_obligatoire
      p.livrableObligatoire = p.livrable_obligatoire
      this.updatePhase(p)
    },

    async updatePhase(p) {
      try {
        await api.put(`/phases/${p.id}`, { livrable_obligatoire: p.livrable_obligatoire })
        this.showNotif('Modifié ✓')
      } catch {
        p.livrable_obligatoire = !p.livrable_obligatoire
        this.showNotif('Erreur', 'err')
      }
    },

    openForm() { this.resetForm(); this.showForm = true },
    closeForm() { this.showForm = false },
    resetForm() {
      this.form = { id: null, nom: '', dateDebut: '', dateFin: '', coefficient: 1, livrableObligatoire: true }
      this.errors = {}
      this.editMode = false
    },

    validate() {
      this.errors = {}
      if (!this.form.nom) this.errors.nom = 'Champ obligatoire'
      if (!this.form.dateDebut) this.errors.dateDebut = 'Champ obligatoire'
      if (!this.form.dateFin) this.errors.dateFin = 'Champ obligatoire'
      if (this.form.dateDebut && this.form.dateFin && this.form.dateFin < this.form.dateDebut)
        this.errors.dateFin = 'Date invalide'
      return Object.keys(this.errors).length === 0
    },

    async save() {
      if (!this.validate()) return
      try {
        const payload = {
          nom: this.form.nom,
          date_debut: this.form.dateDebut,
          date_fin: this.form.dateFin,
          coefficient: this.form.coefficient,
          livrable_obligatoire: this.form.livrableObligatoire
        }
        if (this.editMode) {
          await api.put(`/phases/${this.form.id}`, payload)
          this.showNotif('Phase modifiée ✓')
        } else {
          await api.post('/phases', payload)
          this.showNotif('Phase créée ✓')
        }
        await this.chargerPhases()
        this.closeForm()
      } catch (error) {
        this.showNotif(error.response?.data?.message || 'Erreur', 'err')
      }
    },

    editPhase(p) {
      this.form = {
        id: p.id,
        nom: p.nom,
        dateDebut: p.dateDebut || p.date_debut,
        dateFin: p.dateFin || p.date_fin,
        coefficient: p.coefficient,
        livrableObligatoire: p.livrableObligatoire ?? p.livrable_obligatoire
      }
      this.editMode = true
      this.showForm = true
      this.errors = {}
    },

    async supprimer(id) {
      if (!confirm('Supprimer cette phase ?')) return
      try {
        await api.delete(`/phases/${id}`)
        await this.chargerPhases()
        this.showNotif('Phase supprimée')
      } catch {
        this.showNotif('Erreur lors de la suppression', 'err')
      }
    },

    async monter(i) {
      if (i === 0) return
      const newOrder = [...this.phases]
      ;[newOrder[i], newOrder[i - 1]] = [newOrder[i - 1], newOrder[i]]
      const phasesToUpdate = newOrder.map((p, idx) => ({ id: p.id, ordre: idx + 1 }))
      try {
        await api.put('/phases/reorder', { phases: phasesToUpdate })
        await this.chargerPhases()
      } catch { this.showNotif('Erreur', 'err') }
    },

    async descendre(i) {
      if (i === this.phases.length - 1) return
      const newOrder = [...this.phases]
      ;[newOrder[i], newOrder[i + 1]] = [newOrder[i + 1], newOrder[i]]
      const phasesToUpdate = newOrder.map((p, idx) => ({ id: p.id, ordre: idx + 1 }))
      try {
        await api.put('/phases/reorder', { phases: phasesToUpdate })
        await this.chargerPhases()
      } catch { this.showNotif('Erreur', 'err') }
    },

    showNotif(msg, type = 'ok') {
      this.notif = { show: true, msg, type }
      setTimeout(() => (this.notif.show = false), 3500)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box}
.page-content{font-family:'Source Sans 3',sans-serif;color:#1e2a35}
.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px}
.header-left{display:flex;align-items:center;gap:12px}
.header-icon{font-size:24px;width:46px;height:46px;background:#fff8ee;border:1.5px solid #f5c87a;border-radius:12px;display:flex;align-items:center;justify-content:center}
h2{font-family:'Merriweather',serif;font-size:19px;color:#1e2a35;margin:0}
.subtitle{font-size:13px;color:#8a9aaa;margin-top:2px}
.header-right{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.total-chip{background:#eef2f7;border:1.5px solid #b6cfe0;color:#3d6080;padding:6px 14px;border-radius:20px;font-size:12.5px;font-weight:600;display:flex;gap:6px;align-items:center}
.chip-sep{opacity:.5}
.chip-active{color:#27ae60}

.info-banner{display:flex;align-items:flex-start;gap:10px;background:#e8f4fd;border:1.5px solid rgba(61,96,128,0.3);border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#2c4f72;line-height:1.5}
.info-banner svg{flex-shrink:0;margin-top:1px}

.notif{display:flex;justify-content:space-between;align-items:center;padding:11px 16px;border-radius:10px;margin-bottom:14px;font-size:13.5px;font-weight:500;border:1.5px solid}
.notif-ok{background:#e8f5e9;color:#155724;border-color:#c3e6cb}
.notif-err{background:#f8d7da;color:#721c24;border-color:#f5c6cb}
.notif-x{background:none;border:none;cursor:pointer;font-size:18px;color:inherit;opacity:.6}
.notif-slide-enter-active,.notif-slide-leave-active{transition:all .25s}
.notif-slide-enter-from,.notif-slide-leave-to{opacity:0;transform:translateY(-6px)}

.table-card{background:#fff;border:1.5px solid #e0ddd8;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
.table{width:100%;border-collapse:collapse}
.table thead tr{background:#eef2f7}
.table th{padding:11px 14px;font-size:11px;font-weight:700;color:#4a5a6a;text-transform:uppercase;letter-spacing:.05em;text-align:left;border-bottom:1.5px solid #e0ddd8}
.th-center{text-align:center}
.table td{padding:13px 14px;font-size:13.5px;vertical-align:middle;border-bottom:1px solid #f0ede8;background:#fff}
.table-row:hover td{background:#fafaf8}
.row-active td{background:#fffbf0!important;border-left:3px solid #f5a623}
.row-done td{background:#f5fdf8!important;opacity:.85}

.order-cell{display:flex;align-items:center;gap:6px}
.order-num{width:28px;height:28px;border-radius:7px;background:#fff8ee;border:1.5px solid #f5c87a;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#d98e1a;flex-shrink:0}
.order-arrows{display:flex;flex-direction:column;gap:2px}
.arr-btn{width:18px;height:18px;border:1px solid #e0ddd8;background:#f8f6f2;border-radius:4px;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;color:#4a5a6a;transition:.15s;padding:0}
.arr-btn:hover:not(:disabled){background:#3d6080;color:#fff;border-color:#3d6080}
.arr-btn:disabled{opacity:.3;cursor:not-allowed}

.phase-nom{font-weight:600;color:#1e2a35;font-size:14px}
.td-dates{white-space:nowrap}
.date-from,.date-to{font-size:12.5px;color:#4a5a6a}
.date-arrow{color:#c8c4bc;margin:0 4px;font-size:12px}
.coef-badge{background:#fff8ee;color:#d98e1a;border:1.5px solid #f5c87a;padding:3px 10px;border-radius:20px;font-weight:700;font-size:12.5px}
.td-center{text-align:center}

/* STATUS BADGES */
.status-badge{display:inline-block;padding:4px 11px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;border:1px solid}
.status-active{background:#fff8e8;color:#b07d0a;border-color:#f5c87a;animation:pulse-badge 2s ease-in-out infinite}
.status-done{background:#d4edda;color:#155724;border-color:#c3e6cb}
.status-inactive{background:#f0ede8;color:#8a9aaa;border-color:#e0ddd8}
@keyframes pulse-badge{0%,100%{opacity:1}50%{opacity:.7}}

/* ACTION BUTTONS */
.td-actions{display:flex;gap:5px;justify-content:center;align-items:center;flex-wrap:wrap}
.btn-activate{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;background:linear-gradient(135deg,#f5a623,#d98e1a);color:#fff;border:none;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.15s;white-space:nowrap}
.btn-activate:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 3px 10px rgba(245,166,35,.35)}
.btn-activate:disabled{opacity:.35;cursor:not-allowed;transform:none;box-shadow:none}
.btn-terminate{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;background:#27ae60;color:#fff;border:none;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.15s;white-space:nowrap}
.btn-terminate:hover{background:#1e8449}
.btn-icon{width:30px;height:30px;border:1.5px solid #e0ddd8;background:#f8f6f2;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;transition:.15s}
.btn-icon:hover:not(:disabled){background:#eef2f7;border-color:#3d6080}
.btn-del:hover:not(:disabled){background:#fde8e8!important;border-color:#e74c3c!important}
.btn-icon:disabled{opacity:.3;cursor:not-allowed}

/* TOGGLE */
.toggle-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:20px;border:1.5px solid;cursor:pointer;font-size:12.5px;font-weight:700;font-family:'Source Sans 3',sans-serif;transition:.18s}
.toggle-on{background:#e8f5e9;color:#155724;border-color:#c3e6cb}
.toggle-on .toggle-dot{width:9px;height:9px;border-radius:50%;background:#27ae60;flex-shrink:0}
.toggle-off{background:#f8f6f2;color:#8a9aaa;border-color:#e0ddd8}
.toggle-off .toggle-dot{width:9px;height:9px;border-radius:50%;background:#c8c4bc;flex-shrink:0}

.empty-state{background:#fff;border:2px dashed #e0ddd8;border-radius:14px;padding:50px 20px;text-align:center;color:#8a9aaa;display:flex;flex-direction:column;align-items:center;gap:12px}
.empty-ico{font-size:46px}
.empty-state p{font-size:14px}

.btn-gold{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:linear-gradient(135deg,#f5a623,#d98e1a);color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.2s;box-shadow:0 2px 8px rgba(245,166,35,.2)}
.btn-gold:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(245,166,35,.3)}
.btn-cancel{padding:10px 18px;background:#f8f6f2;border:1.5px solid #e0ddd8;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;color:#4a5a6a;transition:.18s}
.btn-cancel:hover{background:#f0ede8}

.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:#fff;border-radius:16px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.modal-hdr{display:flex;justify-content:space-between;align-items:center;padding:20px 24px 0}
.modal-hdr h3{font-family:'Merriweather',serif;font-size:17px;color:#1e2a35}
.modal-close{background:none;border:none;font-size:22px;color:#8a9aaa;cursor:pointer}
.modal-body{padding:20px 24px;display:flex;flex-direction:column;gap:14px}
.modal-footer{padding:16px 24px;border-top:1px solid #e0ddd8;display:flex;justify-content:flex-end;gap:10px}
.form-group{display:flex;flex-direction:column;gap:6px}
.form-group label{font-size:13.5px;font-weight:600;color:#3d5a72}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.form-group input,.form-group select{padding:10px 12px;border:1.5px solid #e0ddd8;border-radius:9px;background:#f8f6f2;font-size:14px;color:#1e2a35;font-family:'Source Sans 3',sans-serif;transition:.18s}
.form-group input:focus,.form-group select:focus{outline:none;border-color:#f5a623;background:#fff}
.inp-err{border-color:#e74c3c!important}
.err{color:#e74c3c;font-size:12px;margin-top:2px}
.modal-fade-enter-active,.modal-fade-leave-active{transition:opacity .2s,transform .2s}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0;transform:scale(.97)}

.livrable-choice{display:flex;flex-direction:column;gap:8px}
.choice-option{display:flex;align-items:center;gap:12px;padding:12px 14px;background:#f8f6f2;border:1.5px solid #e0ddd8;border-radius:10px;cursor:pointer;transition:.18s}
.choice-option:hover{border-color:#f5a623}
.choice-option.selected{background:#fff8ee;border-color:#f5a623}
.choice-option input{display:none}
.co-icon{font-size:20px;flex-shrink:0}
.co-label{font-size:13.5px;font-weight:600;color:#1e2a35}
.co-sub{font-size:12px;color:#8a9aaa;margin-top:1px}
</style>