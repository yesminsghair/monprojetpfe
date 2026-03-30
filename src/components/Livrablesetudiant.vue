<template>
  <div class="page-content">

    <!-- HEADER -->
    <div class="page-header">
      <div class="header-left">
        <span class="header-icon">📁</span>
        <div>
          <h2>Mes livrables</h2>
          <p class="subtitle">Déposer et suivre vos documents par phase d'évaluation</p>
        </div>
      </div>
      <button class="btn-gold" @click="showForm = true">
        <span>+</span> Déposer un livrable
      </button>
    </div>

    <!-- NOTIFICATIONS -->
    <transition name="slide-notif">
      <div v-if="notification.show" class="notif" :class="'notif-' + notification.type">
        <span class="notif-icon">{{ notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : '⚠️' }}</span>
        {{ notification.msg }}
        <button class="notif-close" @click="notification.show = false">✕</button>
      </div>
    </transition>

    <!-- STATS -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-val">{{ livrables.length }}</span>
        <span class="stat-label">Total</span>
      </div>
      <div class="stat-card stat-yellow">
        <span class="stat-val">{{ livrables.filter(l => l.statut === 'attente').length }}</span>
        <span class="stat-label">En attente</span>
      </div>
      <div class="stat-card stat-green">
        <span class="stat-val">{{ livrables.filter(l => l.statut === 'valide').length }}</span>
        <span class="stat-label">Validés</span>
      </div>
      <div class="stat-card stat-red">
        <span class="stat-val">{{ livrables.filter(l => l.statut === 'rejete').length }}</span>
        <span class="stat-label">Rejetés</span>
      </div>
    </div>

    <!-- TABLE -->
    <div class="table-wrapper" v-if="livrables.length">
      <table class="table">
        <thead>
          <tr>
            <th>Phase</th>
            <th>Fichier</th>
            <th>Date de dépôt</th>
            <th>Statut</th>
            <th>Commentaire encadrant</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in livrables" :key="l.id" :class="{ 'row-rejected': l.statut === 'rejete', 'row-validated': l.statut === 'valide' }">
            <td>
              <div class="phase-chip">{{ l.phase }}</div>
            </td>
            <td>
              <div class="file-info" v-if="l.fileName">
                <span class="file-icon">📄</span>
                <span class="file-name">{{ l.fileName }}</span>
              </div>
              <span v-else class="empty-cell">Aucun fichier</span>
            </td>
            <td class="date-col">{{ l.dateDepot || '—' }}</td>
            <td>
              <span class="status-badge"
                :class="{
                  'status-wait': l.statut === 'attente',
                  'status-ok': l.statut === 'valide',
                  'status-ko': l.statut === 'rejete'
                }">
                {{ statusLabel(l.statut) }}
              </span>
            </td>
            <td>
              <span v-if="l.commentaireEncadrant" class="comment-text">💬 {{ l.commentaireEncadrant }}</span>
              <span v-else class="empty-cell">—</span>
            </td>
            <td class="actions">
              <!-- Modifier le fichier si pas encore validé définitivement -->
              <label class="btn-sm btn-upload" v-if="!l.valideFinal" :for="'upload-' + l.id" title="Remplacer le fichier">
                🔄 Modifier
                <input type="file" :id="'upload-' + l.id" accept="application/pdf" @change="upload($event, l)" style="display:none" />
              </label>
              <!-- Voir -->
              <button class="btn-sm btn-view" @click="voir(l)" v-if="l.file" title="Visualiser">👁 Voir</button>
              <!-- Télécharger -->
              <a class="btn-sm btn-download" :href="l.file" :download="l.fileName" v-if="l.file" title="Télécharger">⬇ Télécharger</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-box">
      <div class="empty-icon">📂</div>
      <p>Aucun livrable déposé</p>
      <button class="btn-gold" @click="showForm = true">Déposer mon premier livrable</button>
    </div>

    <!-- MODAL AJOUT -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3>📤 Déposer un livrable</h3>
          <button class="close-btn" @click="showForm = false">✕</button>
        </div>

        <div class="form-group">
          <label>Phase d'évaluation *</label>
          <select v-model="newDoc.phase">
            <option disabled value="">Sélectionner une phase</option>
            <option v-for="phase in phases" :key="phase" :value="phase">{{ phase }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Commentaire (optionnel)</label>
          <input type="text" v-model="newDoc.commentaire" placeholder="Note ou précision pour l'encadrant..." />
        </div>

        <div class="form-group">
          <label>Fichier PDF *</label>
          <div class="file-drop" :class="{ 'has-file': newDoc.fileName }" @click="$refs.fileInput.click()">
            <span v-if="!newDoc.fileName">
              <span style="font-size:32px">📄</span><br>
              Cliquez pour sélectionner un PDF
            </span>
            <span v-else class="file-selected">
              ✅ {{ newDoc.fileName }}
            </span>
          </div>
          <input ref="fileInput" type="file" @change="handleFileUpload" accept="application/pdf" style="display:none" />
        </div>

        <div class="modal-actions">
          <button class="btn-gold" @click="ajouterLivrable">Déposer</button>
          <button class="btn-outline" @click="showForm = false">Annuler</button>
        </div>
      </div>
    </div>

    <!-- VIEWER -->
    <div v-if="viewer" class="modal-overlay" @click.self="viewer = null">
      <div class="modal-box viewer-box">
        <div class="modal-header">
          <h3>👁 Visualisation du document</h3>
          <button class="close-btn" @click="viewer = null">✕</button>
        </div>
        <iframe :src="viewer" width="100%" height="500px" style="border:none; border-radius:8px;"></iframe>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'LivrablesEtudiant',
  data() {
    return {
      livrables: [],
      viewer: null,
      showForm: false,
      newDoc: { phase: '', commentaire: '', file: null, fileName: '' },
      phases: ['Phase 1 — Rapport intermédiaire', 'Phase 2 — Soutenance blanche', 'Phase 3 — Rapport final', 'Correction'],
      notification: { show: false, msg: '', type: 'success' }
    }
  },
  mounted() {
    const saved = JSON.parse(localStorage.getItem('livrables'))
    if (saved) this.livrables = saved
  },
  methods: {
    statusLabel(s) {
      return { attente: '⏳ En attente', valide: '✅ Validé', rejete: '❌ Rejeté' }[s] || s
    },
    save() {
      localStorage.setItem('livrables', JSON.stringify(this.livrables))
    },
    showNotif(msg, type = 'success') {
      this.notification = { show: true, msg, type }
      setTimeout(() => { this.notification.show = false }, 4000)
    },
    upload(e, l) {
      const file = e.target.files[0]
      if (!file || file.type !== 'application/pdf') { this.showNotif('PDF uniquement', 'error'); return }
      if (l.valideFinal) { this.showNotif('Ce livrable est déjà validé définitivement', 'warn'); return }
      const reader = new FileReader()
      reader.onload = (event) => {
        l.file = event.target.result
        l.fileName = file.name
        l.statut = 'attente'
        l.dateDepot = new Date().toLocaleDateString('fr-FR')
        this.save()
        this.showNotif('Livrable mis à jour — en attente de validation')
      }
      reader.readAsDataURL(file)
    },
    voir(l) { this.viewer = l.file },
    handleFileUpload(e) {
      const file = e.target.files[0]
      if (!file || file.type !== 'application/pdf') { this.showNotif('PDF uniquement', 'error'); return }
      this.newDoc.fileName = file.name
      const reader = new FileReader()
      reader.onload = (event) => { this.newDoc.file = event.target.result }
      reader.readAsDataURL(file)
    },
    ajouterLivrable() {
      if (!this.newDoc.file || !this.newDoc.phase) {
        this.showNotif('Veuillez sélectionner une phase et un fichier PDF', 'warn')
        return
      }
      this.livrables.push({
        id: Date.now(),
        phase: this.newDoc.phase,
        file: this.newDoc.file,
        fileName: this.newDoc.fileName,
        commentaire: this.newDoc.commentaire,
        commentaireEncadrant: '',
        statut: 'attente',
        valideFinal: false,
        dateDepot: new Date().toLocaleDateString('fr-FR')
      })
      this.save()
      this.newDoc = { phase: '', commentaire: '', file: null, fileName: '' }
      this.showForm = false
      this.showNotif('Livrable déposé avec succès — en attente de validation')
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

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
}
.header-left { display: flex; align-items: center; gap: 14px; }
.header-icon {
  font-size: 28px; background: rgba(245,197,24,0.15);
  width: 52px; height: 52px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 14px; border: 1px solid rgba(245,197,24,0.3);
}
h2 { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: #F5C518; margin: 0; }
.subtitle { font-size: 13px; color: #7A8FA6; margin: 2px 0 0; }

/* NOTIF */
.notif {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 18px; border-radius: 10px; margin-bottom: 16px;
  font-size: 14px; font-weight: 500;
  border: 1px solid;
}
.notif-success { background: rgba(39,174,96,0.1); color: #2ecc71; border-color: rgba(39,174,96,0.3); }
.notif-error { background: rgba(231,76,60,0.1); color: #e74c3c; border-color: rgba(231,76,60,0.3); }
.notif-warn { background: rgba(245,197,24,0.1); color: #F5C518; border-color: rgba(245,197,24,0.3); }
.notif-icon { font-size: 16px; }
.notif-close { margin-left: auto; background: none; border: none; color: inherit; cursor: pointer; font-size: 14px; opacity: 0.7; }
.slide-notif-enter-active, .slide-notif-leave-active { transition: all 0.3s; }
.slide-notif-enter-from, .slide-notif-leave-to { transform: translateY(-10px); opacity: 0; }

/* STATS */
.stats-row { display: flex; gap: 14px; margin-bottom: 24px; }
.stat-card {
  background: #1A2635; border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; padding: 14px 22px;
  display: flex; flex-direction: column; gap: 4px;
}
.stat-card.stat-yellow { border-color: rgba(245,197,24,0.3); }
.stat-card.stat-green { border-color: rgba(39,174,96,0.3); }
.stat-card.stat-red { border-color: rgba(231,76,60,0.3); }
.stat-val { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #F5C518; line-height: 1; }
.stat-yellow .stat-val { color: #F5C518; }
.stat-green .stat-val { color: #2ecc71; }
.stat-red .stat-val { color: #e74c3c; }
.stat-label { font-size: 11px; color: #7A8FA6; text-transform: uppercase; letter-spacing: 0.5px; }

/* TABLE */
.table-wrapper {
  background: #1A2635; border-radius: 16px; overflow: hidden;
  border: 1px solid rgba(245,197,24,0.15);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.table { width: 100%; border-collapse: collapse; }
.table th {
  background: #243347; color: #F5C518;
  padding: 14px 16px;
  font-family: 'Syne', sans-serif;
  font-size: 11px; text-transform: uppercase;
  letter-spacing: 1px; font-weight: 600;
  border-bottom: 1px solid rgba(245,197,24,0.2);
  text-align: left;
}
.table td { padding: 13px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
.table tbody tr:hover { background: rgba(245,197,24,0.03); }
.row-rejected { border-left: 3px solid #e74c3c; }
.row-validated { border-left: 3px solid #2ecc71; }

.phase-chip {
  background: rgba(245,197,24,0.12); color: #F5C518;
  border: 1px solid rgba(245,197,24,0.25);
  padding: 4px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 600; display: inline-block;
}
.file-info { display: flex; align-items: center; gap: 8px; }
.file-icon { font-size: 18px; }
.file-name { font-size: 13px; color: #C8D6E5; font-weight: 500; }
.date-col { color: #7A8FA6; font-size: 13px; }
.empty-cell { color: #4A5568; font-style: italic; font-size: 13px; }
.comment-text { font-size: 13px; color: #C8D6E5; font-style: italic; }

.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.status-wait { background: rgba(245,197,24,0.15); color: #F5C518; border: 1px solid rgba(245,197,24,0.3); }
.status-ok { background: rgba(39,174,96,0.15); color: #2ecc71; border: 1px solid rgba(39,174,96,0.3); }
.status-ko { background: rgba(231,76,60,0.15); color: #e74c3c; border: 1px solid rgba(231,76,60,0.3); }

.actions { display: flex; gap: 6px; align-items: center; }
.btn-sm {
  padding: 5px 10px; border-radius: 7px; font-size: 12px;
  font-weight: 600; cursor: pointer; transition: 0.15s;
  text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
}
.btn-upload { background: rgba(245,197,24,0.12); color: #F5C518; border: 1px solid rgba(245,197,24,0.3); cursor: pointer; }
.btn-upload:hover { background: rgba(245,197,24,0.22); }
.btn-view { background: rgba(41,128,185,0.15); color: #5dade2; border: 1px solid rgba(41,128,185,0.3); }
.btn-view:hover { background: rgba(41,128,185,0.3); }
.btn-download { background: rgba(39,174,96,0.15); color: #2ecc71; border: 1px solid rgba(39,174,96,0.3); }
.btn-download:hover { background: rgba(39,174,96,0.3); }

/* EMPTY */
.empty-box {
  background: #1A2635; border: 2px dashed rgba(245,197,24,0.25);
  border-radius: 16px; padding: 60px 20px;
  text-align: center; color: #7A8FA6;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-box p { margin-bottom: 20px; font-size: 15px; }

/* MODAL */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-box {
  background: #1A2635; border: 1px solid rgba(245,197,24,0.25);
  border-radius: 18px; padding: 28px; width: 500px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.6);
}
.viewer-box { width: 800px; max-width: 95vw; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
.modal-header h3 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #F5C518; margin: 0; }
.close-btn {
  background: rgba(255,255,255,0.07); border: none;
  color: #7A8FA6; width: 32px; height: 32px;
  border-radius: 8px; cursor: pointer; transition: 0.2s;
}
.close-btn:hover { background: rgba(231,76,60,0.2); color: #e74c3c; }

.form-group { margin-bottom: 16px; }
.form-group label {
  display: block; font-size: 11px; font-weight: 600;
  color: #7A8FA6; text-transform: uppercase;
  letter-spacing: 0.5px; margin-bottom: 7px;
}
input, select {
  width: 100%; padding: 11px 14px;
  background: #243347; border: 1px solid rgba(245,197,24,0.2);
  border-radius: 10px; color: #E8EDF2;
  font-size: 14px; font-family: 'DM Sans', sans-serif;
  transition: border-color 0.2s;
}
input:focus, select:focus { border-color: #F5C518; outline: none; box-shadow: 0 0 0 3px rgba(245,197,24,0.1); }

.file-drop {
  background: #243347; border: 2px dashed rgba(245,197,24,0.25);
  border-radius: 10px; padding: 30px 20px;
  text-align: center; cursor: pointer; color: #7A8FA6;
  font-size: 14px; line-height: 1.6; transition: all 0.2s;
}
.file-drop:hover { border-color: #F5C518; background: rgba(245,197,24,0.05); }
.file-drop.has-file { border-color: #2ecc71; background: rgba(39,174,96,0.05); }
.file-selected { color: #2ecc71; font-weight: 600; }

.btn-gold {
  background: #F5C518; color: #0F1923; border: none;
  padding: 10px 20px; border-radius: 10px; font-weight: 700;
  font-family: 'Syne', sans-serif; cursor: pointer;
  font-size: 14px; transition: all 0.2s;
  display: inline-flex; align-items: center; gap: 6px;
}
.btn-gold:hover { background: #D4A017; box-shadow: 0 4px 16px rgba(245,197,24,0.4); }
.btn-outline {
  background: transparent; border: 1px solid rgba(245,197,24,0.35);
  color: #F5C518; padding: 10px 18px; border-radius: 10px;
  cursor: pointer; font-size: 14px; transition: all 0.2s;
}
.btn-outline:hover { background: rgba(245,197,24,0.1); }
.modal-actions { display: flex; gap: 10px; margin-top: 24px; }
</style>