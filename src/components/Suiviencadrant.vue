<template>
  <div class="page-content">

    <!-- HEADER -->
    <div class="page-header">
      <div class="header-left">
        <span class="header-icon">🎓</span>
        <div>
          <h2>Suivi des étudiants</h2>
          <p class="subtitle">Avancement, livrables et gestion des phases</p>
        </div>
      </div>
      <div class="header-right">
        <div class="filter-bar">
          <button
            v-for="f in filtres" :key="f.val"
            class="filter-btn" :class="{ active: filtreActif === f.val }"
            @click="filtreActif = f.val"
          >{{ f.label }}</button>
        </div>
      </div>
    </div>

    <!-- NOTIFICATION -->
    <transition name="slide-notif">
      <div v-if="notif.show" class="notif" :class="'notif-' + notif.type">
        <span>{{ notif.msg }}</span>
        <button @click="notif.show = false" class="notif-close">✕</button>
      </div>
    </transition>

    <!-- TABLE -->
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Étudiant</th>
            <th>Phase en cours</th>
            <th>Avancement</th>
            <th>Statut</th>
            <th>Livrable</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in etudiantsFiltres" :key="e.id"
            :class="{
              'row-valide': e.statut === 'valide',
              'row-rejete': e.statut === 'rejete',
              'row-en-cours': e.statut === 'en cours'
            }">

            <td>
              <div class="student-name">{{ e.nom }}</div>
              <div class="student-sujet">{{ e.sujet }}</div>
            </td>

            <td>
              <div class="phase-chip">{{ e.phase }}</div>
            </td>

            <td class="progress-cell">
              <div class="progress-bar-wrap">
                <div class="progress-bg">
                  <div class="progress-fill" :style="{ width: e.progress + '%' }"
                    :class="{ 'fill-done': e.progress >= 100 }"></div>
                </div>
                <span class="pct-text">{{ e.progress }}%</span>
              </div>
            </td>

            <td>
              <span class="status-badge"
                :class="{
                  'status-wait': e.statut === 'en cours' || !e.statut,
                  'status-ok': e.statut === 'valide',
                  'status-ko': e.statut === 'rejete'
                }">
                {{ { 'en cours': '🔄 En cours', 'valide': '✅ Validé', 'rejete': '❌ Rejeté', '': '⏳ En attente' }[e.statut] || e.statut }}
              </span>
            </td>

            <td>
              <span v-if="e.livrable" class="livrable-chip">📄 {{ e.livrable }}</span>
              <span v-else class="empty-cell">Aucun livrable</span>
            </td>

            <td class="actions">
              <!-- Lancer phase -->
              <button class="btn-sm btn-blue"
                @click="lancerPhase(e)"
                :disabled="e.statut === 'en cours'"
                title="Lancer la phase">
                ▶ Lancer
              </button>
              <!-- Valider passage phase suivante -->
              <button class="btn-sm btn-green"
                @click="validerPhase(e)"
                :disabled="e.statut !== 'en cours'"
                title="Valider le passage à la phase suivante">
                ✓ Valider
              </button>
              <!-- Rejeter avec commentaire -->
              <button class="btn-sm btn-danger" @click="openRejet(e)" title="Rejeter le livrable">
                ✕ Rejeter
              </button>
              <!-- Historique -->
              <button class="btn-sm btn-hist" @click="voirHistorique(e)" title="Historique des livrables">
                📋 Historique
              </button>
            </td>

          </tr>
        </tbody>
      </table>
      <div v-if="etudiantsFiltres.length === 0" class="empty-row">
        Aucun étudiant correspondant au filtre
      </div>
    </div>

    <!-- MODAL REJET -->
    <div v-if="modalRejet" class="modal-overlay" @click.self="modalRejet = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3>❌ Rejet du livrable — {{ current?.nom }}</h3>
          <button class="close-btn" @click="modalRejet = false">✕</button>
        </div>
        <div class="form-group">
          <label>Commentaire de rejet *</label>
          <textarea v-model="commentaire" placeholder="Expliquez la raison du rejet à l'étudiant..." rows="4"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-danger-solid" @click="confirmerRejet" :disabled="!commentaire.trim()">
            Confirmer le rejet
          </button>
          <button class="btn-outline" @click="modalRejet = false">Annuler</button>
        </div>
      </div>
    </div>

    <!-- MODAL HISTORIQUE -->
    <div v-if="modalHist" class="modal-overlay" @click.self="modalHist = false">
      <div class="modal-box modal-large">
        <div class="modal-header">
          <h3>📋 Historique des livrables — {{ current?.nom }}</h3>
          <button class="close-btn" @click="modalHist = false">✕</button>
        </div>

        <div class="hist-timeline">
          <div v-for="(h, i) in historique" :key="h.id" class="hist-item">
            <div class="hist-dot" :class="'dot-' + h.statut"></div>
            <div class="hist-content">
              <div class="hist-phase">{{ h.phase }}</div>
              <div class="hist-statut">
                <span class="status-badge"
                  :class="{
                    'status-ok': h.statut === 'validé',
                    'status-ko': h.statut === 'rejeté',
                    'status-wait': h.statut === 'en attente'
                  }">{{ h.statut }}</span>
              </div>
              <div class="hist-comment" v-if="h.commentaire">💬 {{ h.commentaire }}</div>
              <div class="hist-date">{{ h.date }}</div>
            </div>
          </div>
        </div>

        <button class="btn-outline" @click="modalHist = false" style="margin-top:16px">Fermer</button>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'SuiviEncadrant',
  data() {
    return {
      filtreActif: 'tous',
      filtres: [
        { val: 'tous', label: 'Tous' },
        { val: 'en cours', label: 'En cours' },
        { val: 'valide', label: 'Validés' },
        { val: 'rejete', label: 'Rejetés' }
      ],
      etudiants: [
        { id: 1, nom: 'Ali Ben Salem', sujet: 'Système de gestion PFE', phase: 'Phase 1', progress: 40, statut: 'en cours', livrable: 'rapport_v1.pdf' },
        { id: 2, nom: 'Nadia Gharbi', sujet: 'Application mobile IoT', phase: 'Phase 2', progress: 75, statut: 'en cours', livrable: 'rapport_final.pdf' },
        { id: 3, nom: 'Karim Mbarki', sujet: 'Plateforme e-learning', phase: 'Phase 1', progress: 0, statut: '', livrable: null }
      ],
      modalHist: false,
      modalRejet: false,
      historique: [],
      current: null,
      commentaire: '',
      notif: { show: false, msg: '', type: 'success' }
    }
  },
  computed: {
    etudiantsFiltres() {
      if (this.filtreActif === 'tous') return this.etudiants
      return this.etudiants.filter(e => e.statut === this.filtreActif)
    }
  },
  methods: {
    showNotif(msg, type = 'success') {
      this.notif = { show: true, msg, type }
      setTimeout(() => { this.notif.show = false }, 3500)
    },
    lancerPhase(e) {
      e.statut = 'en cours'
      e.progress = 0
      this.showNotif(`Phase lancée pour ${e.nom}`)
    },
    validerPhase(e) {
      e.progress = Math.min(e.progress + 25, 100)
      if (e.progress >= 100) {
        e.statut = 'valide'
        this.showNotif(`${e.nom} — toutes les phases validées ✅`)
      } else {
        const next = parseInt(e.phase.replace(/\D/g, '')) + 1
        e.phase = `Phase ${next}`
        this.showNotif(`${e.nom} — passage à ${e.phase}`)
      }
    },
    openRejet(e) {
      this.current = e
      this.commentaire = ''
      this.modalRejet = true
    },
    confirmerRejet() {
      if (!this.commentaire.trim()) return
      this.current.statut = 'rejete'
      this.current.commentaireRejet = this.commentaire
      this.modalRejet = false
      this.showNotif(`Livrable de ${this.current.nom} rejeté`, 'error')
    },
    voirHistorique(e) {
      this.current = e
      this.historique = [
        { id: 1, phase: 'Phase 1', statut: 'validé', commentaire: 'Rapport conforme aux attentes', date: '10/02/2025' },
        { id: 2, phase: 'Phase 2', statut: 'rejeté', commentaire: 'Partie conception insuffisante, revoir le diagramme de classes', date: '15/03/2025' },
        { id: 3, phase: 'Phase 2', statut: 'validé', commentaire: 'Corrections apportées — validé', date: '22/03/2025' }
      ]
      this.modalHist = true
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; }

.page-content {
  padding: 32px; background: #0F1923;
  min-height: 100vh; font-family: 'DM Sans', sans-serif;
  color: #E8EDF2;
}

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
}
.header-left { display: flex; align-items: center; gap: 14px; }
.header-icon {
  font-size: 28px; background: rgba(245,197,24,0.15);
  width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;
  border-radius: 14px; border: 1px solid rgba(245,197,24,0.3);
}
h2 { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: #F5C518; margin: 0; }
.subtitle { font-size: 13px; color: #7A8FA6; margin: 2px 0 0; }

/* FILTER */
.filter-bar { display: flex; gap: 6px; }
.filter-btn {
  padding: 7px 16px; border-radius: 20px; font-size: 13px;
  font-weight: 600; border: 1px solid rgba(245,197,24,0.2);
  background: transparent; color: #7A8FA6; cursor: pointer; transition: 0.2s;
}
.filter-btn.active, .filter-btn:hover {
  background: rgba(245,197,24,0.15); color: #F5C518;
  border-color: rgba(245,197,24,0.4);
}

/* NOTIF */
.notif {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px; border-radius: 10px; margin-bottom: 16px;
  font-size: 14px; font-weight: 500; border: 1px solid;
}
.notif-success { background: rgba(39,174,96,0.1); color: #2ecc71; border-color: rgba(39,174,96,0.3); }
.notif-error { background: rgba(231,76,60,0.1); color: #e74c3c; border-color: rgba(231,76,60,0.3); }
.notif-close { background: none; border: none; color: inherit; cursor: pointer; font-size: 14px; }
.slide-notif-enter-active, .slide-notif-leave-active { transition: all 0.3s; }
.slide-notif-enter-from, .slide-notif-leave-to { transform: translateY(-10px); opacity: 0; }

/* TABLE */
.table-wrapper {
  background: #1A2635; border-radius: 16px; overflow: hidden;
  border: 1px solid rgba(245,197,24,0.15);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.table { width: 100%; border-collapse: collapse; }
.table th {
  background: #243347; color: #F5C518; padding: 14px 16px;
  font-family: 'Syne', sans-serif; font-size: 11px;
  text-transform: uppercase; letter-spacing: 1px;
  font-weight: 600; border-bottom: 1px solid rgba(245,197,24,0.2);
  text-align: left;
}
.table td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
.table tbody tr:hover { background: rgba(245,197,24,0.03); }
.row-valide { border-left: 3px solid #2ecc71; }
.row-rejete { border-left: 3px solid #e74c3c; }
.row-en-cours { border-left: 3px solid #F5C518; }

.student-name { font-weight: 600; color: #E8EDF2; }
.student-sujet { font-size: 12px; color: #7A8FA6; margin-top: 2px; }
.phase-chip {
  background: rgba(245,197,24,0.12); color: #F5C518;
  border: 1px solid rgba(245,197,24,0.25);
  padding: 4px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 600; display: inline-block;
}
.livrable-chip {
  background: rgba(41,128,185,0.12); color: #5dade2;
  border: 1px solid rgba(41,128,185,0.25);
  padding: 4px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 500;
}
.empty-cell { color: #4A5568; font-style: italic; font-size: 13px; }
.empty-row { padding: 30px; text-align: center; color: #7A8FA6; }

/* PROGRESS */
.progress-cell { min-width: 160px; }
.progress-bar-wrap { display: flex; align-items: center; gap: 10px; }
.progress-bg {
  flex: 1; height: 8px; background: rgba(255,255,255,0.07);
  border-radius: 10px; overflow: hidden;
}
.progress-fill {
  height: 100%; background: #F5C518; border-radius: 10px;
  transition: width 0.5s ease;
}
.progress-fill.fill-done { background: #2ecc71; }
.pct-text { font-size: 12px; color: #7A8FA6; min-width: 36px; }

/* STATUS */
.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.status-wait { background: rgba(245,197,24,0.15); color: #F5C518; border: 1px solid rgba(245,197,24,0.3); }
.status-ok { background: rgba(39,174,96,0.15); color: #2ecc71; border: 1px solid rgba(39,174,96,0.3); }
.status-ko { background: rgba(231,76,60,0.15); color: #e74c3c; border: 1px solid rgba(231,76,60,0.3); }

/* BUTTONS */
.actions { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.btn-sm {
  padding: 5px 10px; border-radius: 7px; font-size: 12px;
  font-weight: 600; border: none; cursor: pointer; transition: 0.15s;
}
.btn-blue { background: rgba(41,128,185,0.15); color: #5dade2; border: 1px solid rgba(41,128,185,0.3); }
.btn-blue:hover:not(:disabled) { background: rgba(41,128,185,0.3); }
.btn-green { background: rgba(39,174,96,0.15); color: #2ecc71; border: 1px solid rgba(39,174,96,0.3); }
.btn-green:hover:not(:disabled) { background: rgba(39,174,96,0.3); }
.btn-danger { background: rgba(231,76,60,0.15); color: #e74c3c; border: 1px solid rgba(231,76,60,0.3); }
.btn-danger:hover { background: rgba(231,76,60,0.3); }
.btn-hist { background: rgba(245,197,24,0.1); color: #F5C518; border: 1px solid rgba(245,197,24,0.25); }
.btn-hist:hover { background: rgba(245,197,24,0.2); }
.btn-sm:disabled { opacity: 0.35; cursor: not-allowed; }

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
.modal-large { width: 620px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
.modal-header h3 { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: #F5C518; margin: 0; }
.close-btn {
  background: rgba(255,255,255,0.07); border: none;
  color: #7A8FA6; width: 32px; height: 32px;
  border-radius: 8px; cursor: pointer; transition: 0.2s;
}
.close-btn:hover { background: rgba(231,76,60,0.2); color: #e74c3c; }

.form-group { margin-bottom: 16px; }
.form-group label {
  display: block; font-size: 11px; font-weight: 600;
  color: #7A8FA6; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 7px;
}
textarea {
  width: 100%; padding: 11px 14px;
  background: #243347; border: 1px solid rgba(245,197,24,0.2);
  border-radius: 10px; color: #E8EDF2;
  font-size: 14px; font-family: 'DM Sans', sans-serif;
  transition: border-color 0.2s; resize: vertical;
}
textarea:focus { border-color: #F5C518; outline: none; box-shadow: 0 0 0 3px rgba(245,197,24,0.1); }

.modal-actions { display: flex; gap: 10px; margin-top: 24px; }
.btn-outline {
  background: transparent; border: 1px solid rgba(245,197,24,0.35);
  color: #F5C518; padding: 10px 18px; border-radius: 10px;
  cursor: pointer; font-size: 14px; transition: 0.2s;
}
.btn-outline:hover { background: rgba(245,197,24,0.1); }
.btn-danger-solid {
  background: #e74c3c; color: white; border: none;
  padding: 10px 18px; border-radius: 10px; font-weight: 700;
  cursor: pointer; transition: 0.2s;
}
.btn-danger-solid:hover:not(:disabled) { background: #c0392b; }
.btn-danger-solid:disabled { opacity: 0.4; cursor: not-allowed; }

/* TIMELINE */
.hist-timeline { display: flex; flex-direction: column; gap: 16px; }
.hist-item { display: flex; gap: 16px; align-items: flex-start; }
.hist-dot {
  width: 14px; height: 14px; border-radius: 50%; margin-top: 4px; flex-shrink: 0;
}
.dot-validé { background: #2ecc71; box-shadow: 0 0 8px rgba(39,174,96,0.5); }
.dot-rejeté { background: #e74c3c; box-shadow: 0 0 8px rgba(231,76,60,0.5); }
.dot-en\ attente { background: #F5C518; box-shadow: 0 0 8px rgba(245,197,24,0.5); }
.hist-content {
  background: #243347; border-radius: 10px; padding: 12px 16px;
  flex: 1; border: 1px solid rgba(255,255,255,0.06);
}
.hist-phase { font-weight: 600; color: #E8EDF2; font-size: 14px; margin-bottom: 6px; }
.hist-statut { margin-bottom: 6px; }
.hist-comment { font-size: 13px; color: #7A8FA6; font-style: italic; margin-bottom: 4px; }
.hist-date { font-size: 12px; color: #4A5568; }
</style>