<template>
  <div class="page-content">

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- COMPOSITION DES JURYS                                  -->
    <!-- ══════════════════════════════════════════════════════ -->

    <!-- Toast inline -->
    <transition name="toast-fade">
      <div v-if="toast.show" class="toast-inline" :class="toast.type">{{ toast.message }}</div>
    </transition>

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <span class="header-icon">👥</span>
        <div>
          <h2>Composition des jurys</h2>
          <span class="subtitle">Gérez les membres de jury pour chaque étudiant de votre département</span>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-blue" @click="chargerEtudiants" :disabled="loadingEtudiants">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Actualiser
        </button>
      </div>
    </div>

    <!-- Stats bar -->
    <div class="stats-bar">
      <div class="stat-card">
        <span class="stat-val">{{ etudiants.length }}</span>
        <span class="stat-label">Étudiants</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">{{ etudiants.filter(e=>e.jury_id).length }}</span>
        <span class="stat-label">Jurys créés</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">{{ etudiants.filter(e=>(e.membres||[]).length>=3).length }}</span>
        <span class="stat-label">Jurys complets</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">{{ etudiants.filter(e=>!e.projet_pfe_id).length }}</span>
        <span class="stat-label">Sans projet</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loadingEtudiants" class="loading-state">
      <div class="spinner"></div>
      Chargement des données…
    </div>

    <!-- Empty -->
    <div v-else-if="!etudiants.length" class="empty-state">
      <div class="empty-icon">🎓</div>
      <div>Aucun étudiant trouvé pour votre département.</div>
    </div>

    <!-- Table -->
    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Étudiant</th>
            <th>Projet PFE</th>
            <th>Encadrant</th>
            <th>Membres du jury</th>
            <th>Président</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="et in etudiants" :key="et.etudiant_id"
              :class="{
                'row-complete':  (et.membres||[]).length >= 3,
                'row-no-projet': !et.projet_pfe_id,
              }">

            <!-- Étudiant -->
            <td>
              <div class="u-nom">{{ et.etudiant_nom }}</div>
              <div class="u-mat">{{ et.matricule || '—' }}</div>
            </td>

            <!-- Projet -->
            <td>
              <span v-if="et.projet_titre" class="projet-titre-cell">{{ et.projet_titre }}</span>
              <span v-else class="no-projet">Aucun projet PFE</span>
            </td>

            <!-- Encadrant -->
            <td>
              <span v-if="et.encadrant_nom" class="encadrant-chip">{{ et.encadrant_nom }}</span>
              <span v-else class="no-membre">—</span>
            </td>

            <!-- Membres du jury -->
            <td>
              <div v-if="(et.membres||[]).length" class="membres-list">
                <span v-for="m in et.membres" :key="m.id" class="membre-chip">
                  <span class="chip-av">{{ initiales(m.nom) }}</span>
                  {{ m.nom }}
                  <span class="chip-role">{{ roleLabel(m.fonction) }}</span>
                  <button class="chip-del" @click="retirerMembre(et, m)" title="Retirer">×</button>
                </span>
              </div>
              <span v-else class="no-membre">Aucun membre</span>
            </td>

            <!-- Président -->
            <td>
              <span v-if="presidentDe(et)" class="badge-president">{{ presidentDe(et) }}</span>
              <span v-else class="badge-none">—</span>
            </td>

            <!-- Statut -->
            <td>
              <span v-if="!et.projet_pfe_id" class="badge-jury badge-no-projet">Sans projet</span>
              <span v-else-if="(et.membres||[]).length >= 3" class="badge-jury badge-complet">✓ Complet</span>
              <span v-else class="badge-jury badge-incomplet">⚠ Incomplet</span>
            </td>

            <!-- Actions : ajouter membre -->
            <td class="td-actions">
              <div v-if="et.projet_pfe_id && (et.membres||[]).length < 3" class="add-membre-row">
                <!-- Rôle -->
                <select v-model="selectionRole[et.etudiant_id]" class="select-role">
                  <option value="examinateur">Examinateur</option>
                  <option value="president">Président</option>
                  <option value="encadrant">Encadrant</option>
                </select>

                <!-- Membre : grouped by dept encadrants first -->
                <select v-model="selectionMembre[et.etudiant_id]"
                        class="select-membre"
                        @change="ajouterMembreRapide(et)">
                  <option value="">+ Ajouter membre</option>
                  <optgroup label="Encadrants du département">
                    <option v-for="e in enseignantsDisposPour(et)" :key="e.id"
                            :value="e.id + '|' + e.nom_complet">
                      {{ e.nom_complet }}
                    </option>
                  </optgroup>
                </select>
              </div>

              <!-- Supprimer jury -->
              <button v-if="et.jury_id" class="btn-icon btn-del" @click="supprimerJury(et)" title="Supprimer le jury">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'GestionJury',
  emits: ['toast'],

  data() {
    return {
      loadingEtudiants: false,

      // Composition : liste des étudiants du chef avec leur jury
      etudiants:      [],
      enseignants:    [],   // tous enseignants/encadrants dispo
      // reactive map : etudiant_id → selected value "id|nom" dans le select
      selectionMembre: {},
      selectionRole: {},

      toast: { show: false, message: '', type: 'toast-ok' },
    }
  },

  mounted() {
    this.chargerEtudiants()
  },

  methods: {
    // ── TOAST LOCAL ───────────────────────────────────────────
    showToast(message, type = 'toast-ok') {
      this.$emit('toast', { message, type })
      this.toast = { show: true, message, type }
      setTimeout(() => { this.toast.show = false }, 3500)
    },

    // ── CHARGEMENTS ───────────────────────────────────────────

    async chargerEtudiants() {
      this.loadingEtudiants = true
      try {
        // Nouvel endpoint : liste des étudiants du chef avec infos jury
        const res = await api.get('/jurys-pfe/etudiants-du-chef')
        this.etudiants = res.data || []
        // Initialiser la map de sélection
        this.etudiants.forEach(et => {
          if (!(et.etudiant_id in this.selectionMembre)) {
            this.selectionMembre[et.etudiant_id] = ''
          }
          if (!(et.etudiant_id in this.selectionRole)) {
            this.selectionRole[et.etudiant_id] = 'examinateur'
          }
        })
        // Load encadrants AFTER etudiants so the dept filter has data
        await this.chargerEnseignants()
      } catch (err) {
        console.error('Erreur chargement étudiants:', err)
        this.showToast('Impossible de charger la liste des étudiants.', 'toast-err')
      } finally {
        this.loadingEtudiants = false
      }
    },

    async chargerEnseignants() {
      try {
        const res = await api.get('/utilisateurs')
        // Build the set of encadrant IDs that supervise students in this department
        // (derived from etudiants-du-chef which is already scoped to the chef's specialité)
        const encadrantIdsInDept = new Set(
          (this.etudiants || [])
            .map(et => et.encadrant_id)
            .filter(Boolean)
        )
        this.enseignants = (res.data || [])
          .filter(u => u.role === 'encadrant' && encadrantIdsInDept.has(u.id))
          .map(u => ({
            id:          u.id,
            nom_complet: `${u.prenom ?? ''} ${u.nom ?? ''}`.trim(),
            role:        u.role,
          }))
      } catch (err) {
        console.error('Erreur chargement enseignants:', err)
      }
    },



    // ── COMPOSITION RAPIDE ────────────────────────────────────

    // Retourne la liste des enseignants pas encore membres de ce jury
    enseignantsDisposPour(et) {
      const dejaDans = new Set((et.membres || []).map(m => m.enseignant_id))
      return this.enseignants.filter(e => !dejaDans.has(e.id))
    },

    // Appelé au @change du select
    async ajouterMembreRapide(et) {
      const val = this.selectionMembre[et.etudiant_id]
      if (!val) return

      const [ensId] = val.split('|')
      const enseignantId = parseInt(ensId)

      // Réinitialiser le select immédiatement
      this.selectionMembre[et.etudiant_id] = ''

      // 1. Si le jury n'existe pas encore, le créer d'abord
      if (!et.jury_id) {
        if (!et.projet_pfe_id) {
          this.showToast('Cet étudiant n\'a pas encore de projet PFE enregistré.', 'toast-err')
          return
        }
        try {
          const juryRes = await api.post('/jurys-pfe', { projet_id: et.projet_pfe_id })
          et.jury_id = juryRes.data.id
          // Backend auto-adds the encadrant as a member — map with correct nom
          et.membres = (juryRes.data.membres || []).map(m => ({
            id:            m.id,
            enseignant_id: m.enseignant_id,
            nom:           m.enseignant
              ? `${m.enseignant.prenom ?? ''} ${m.enseignant.nom ?? ''}`.trim()
              : (et.encadrant_nom || '—'),
            fonction:      m.fonction,
          }))
          if (et.membres.length) {
            this.showToast(`Jury créé — encadrant ${et.encadrant_nom} ajouté automatiquement.`, 'toast-ok')
          }
        } catch (err) {
          const msg = err.response?.data?.message || 'Erreur lors de la création du jury.'
          this.showToast(msg, 'toast-err')
          return
        }
      }

      // 2. Ajouter le membre
      try {
        // Déterminer la fonction : s'il n'y a pas encore de président, proposer
        const fonction = this.selectionRole[et.etudiant_id] || 'examinateur'

        const res = await api.post(`/jurys-pfe/${et.jury_id}/membres`, {
          enseignant_id: enseignantId,
          fonction,
        })

        // Mettre à jour la ligne localement
        const nouveauMembre = res.data
        et.membres = [...(et.membres || []), {
          id:            nouveauMembre.id,
          enseignant_id: nouveauMembre.enseignant_id,
          nom:           `${nouveauMembre.enseignant?.prenom ?? ''} ${nouveauMembre.enseignant?.nom ?? ''}`.trim(),
          fonction:      nouveauMembre.fonction,
        }]

        this.showToast('Membre ajouté au jury.', 'toast-ok')
      } catch (err) {
        const msg = err.response?.data?.message || 'Erreur lors de l\'ajout du membre.'
        this.showToast(msg, 'toast-err')
      }
    },

    async retirerMembre(et, membre) {
      if (!confirm(`Retirer ${membre.nom} du jury ?`)) return
      try {
        await api.delete(`/jurys-pfe/${et.jury_id}/membres/${membre.id}`)
        et.membres = et.membres.filter(m => m.id !== membre.id)
        this.showToast('Membre retiré.', 'toast-ok')
      } catch (err) {
        const msg = err.response?.data?.message || 'Erreur lors du retrait.'
        this.showToast(msg, 'toast-err')
      }
    },

    async supprimerJury(et) {
      if (!confirm(`Supprimer le jury de ${et.etudiant_nom} ? Tous les membres seront retirés.`)) return
      try {
        await api.delete(`/jurys-pfe/${et.jury_id}`)
        et.jury_id  = null
        et.membres  = []
        this.showToast('Jury supprimé.', 'toast-ok')
      } catch (err) {
        const msg = err.response?.data?.message || 'Erreur lors de la suppression.'
        this.showToast(msg, 'toast-err')
      }
    },

    // ── DÉLIBÉRATION ──────────────────────────────────────────
    // La délibération se fait jury par jury via le tableau
    // de l'onglet délibération. Pas de route globale.




    // ── HELPERS ───────────────────────────────────────────────

    presidentDe(et) {
      const p = (et.membres || []).find(m => m.fonction === 'president')
      return p ? p.nom : null
    },

    roleLabel(fonction) {
      const map = { president: 'Prés.', encadrant: 'Enc.', examinateur: 'Exam.' }
      return map[fonction] || fonction
    },



    initiales(n) {
      if (!n) return '?'
      return n.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    },
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.page-content{font-family:'Source Sans 3',sans-serif;color:#1e2a35}

/* TABS */
.tabs-bar{display:flex;gap:8px;margin-bottom:28px;border-bottom:2px solid #c8c4bc;padding-bottom:0}
.tab-btn{display:flex;align-items:center;gap:8px;padding:11px 20px;border:none;background:transparent;font-size:13.5px;font-weight:600;color:#8a9aaa;cursor:pointer;font-family:'Source Sans 3',sans-serif;border-bottom:3px solid transparent;margin-bottom:-2px;transition:all .18s}
.tab-btn:hover{color:#F5C518}
.tab-btn.active{color:#3d6080;border-bottom-color:#3d6080}

/* HEADER */
.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;gap:16px;flex-wrap:wrap}
.header-left{display:flex;align-items:center;gap:14px}
.header-icon{font-size:28px;line-height:1}
.page-header h2{font-family:'Merriweather',serif;font-size:20px;color:#1e2a35;margin-bottom:3px}
.subtitle{font-size:13.5px;color:#7A8FA6}
.header-actions{display:flex;gap:10px;flex-wrap:wrap}

/* BUTTONS */
.btn-gold{display:flex;align-items:center;gap:7px;padding:10px 18px;background:#F5C518;color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .2s;box-shadow:0 4px 16px rgba(245,197,24,0.3)}
.btn-gold:hover:not(:disabled){transform:translateY(-1px)}
.btn-gold:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-blue{display:flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(61,96,128,0.15);color:#3d6080;border:1.5px solid #3d6080;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .2s}
.btn-blue:hover:not(:disabled){background:rgba(61,96,128,0.25)}
.btn-blue:disabled{opacity:.5;cursor:not-allowed}

/* STATS */
.stats-bar{display:flex;gap:14px;margin-bottom:24px;flex-wrap:wrap}
.stat-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:12px;padding:16px 24px;display:flex;flex-direction:column;align-items:center;min-width:110px}
.stat-val{font-family:'Merriweather',serif;font-size:26px;font-weight:700;color:#1e2a35;line-height:1}
.stat-label{font-size:12px;color:#8a9aaa;margin-top:4px}

/* TABLE */
.table-wrapper{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;overflow:auto}
.table{width:100%;border-collapse:collapse;min-width:900px}
.table thead tr{background:#0F1923}
.table th{padding:11px 14px;font-size:11px;font-weight:700;color:#7a9ab5;text-transform:uppercase;letter-spacing:.05em;text-align:left}
.table td{padding:12px 14px;font-size:13.5px;border-top:1px solid rgba(200,196,188,0.3);vertical-align:middle;background:#fff}
.table tr:hover td{background:#f5f3ef}
.row-complete td{background:rgba(39,174,96,0.04)}
.row-no-projet td{background:rgba(255,180,0,0.03)}

/* STUDENT */
.u-nom{font-weight:700;color:#1e2a35;font-size:14px}
.u-mat{font-size:12px;color:#7A8FA6;margin-top:1px}

/* PROJET */
.projet-titre-cell{font-size:13px;color:#2c4a6e;font-weight:500;line-height:1.4}
.no-projet{font-size:12.5px;color:#c0781a;font-style:italic}

/* ENCADRANT */
.encadrant-chip{font-size:12.5px;color:#4a7090;background:rgba(74,112,144,0.1);padding:2px 8px;border-radius:12px}

/* MEMBRES */
.membres-list{display:flex;flex-wrap:wrap;gap:5px}
.membre-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;background:#e8f0f8;border:1px solid #b8d0e8;border-radius:16px;font-size:12px;color:#2c4a6e}
.chip-av{width:18px;height:18px;border-radius:50%;background:#3d6080;color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.chip-role{font-size:10px;color:#7a9ab5;padding:1px 5px;background:rgba(255,255,255,0.6);border-radius:8px}
.chip-del{background:none;border:none;cursor:pointer;color:#aaa;font-size:13px;line-height:1;padding:0 0 0 2px;transition:color .15s}
.chip-del:hover{color:#e74c3c}
.no-membre{font-size:12.5px;color:#aaa;font-style:italic}

/* PRESIDENT */
.badge-president{padding:3px 10px;background:rgba(245,197,24,.12);color:#b8900a;border:1px solid rgba(245,197,24,.3);border-radius:20px;font-size:12px;font-weight:600}
.badge-none{color:#ccc;font-size:13px}

/* BADGES STATUT */
.badge-jury{padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700}
.badge-complet{background:#d4edda;color:#155724}
.badge-incomplet{background:#fff3cd;color:#856404}
.badge-no-projet{background:#f0e0c0;color:#7a4500}

/* INLINE ADD */
.td-actions{text-align:center;white-space:nowrap}
.inline-add{display:inline-block;margin-right:6px}
.add-membre-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.select-role{padding:6px 8px;border:1.5px solid #c8c4bc;border-radius:8px;font-size:12px;color:#2c4a6e;background:#fff;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:border-color .15s}
.select-role:focus{outline:none;border-color:#F5C518}
.select-membre{padding:6px 10px;border:1.5px solid #c8c4bc;border-radius:8px;font-size:12.5px;color:#2c4a6e;background:#fff;cursor:pointer;font-family:'Source Sans 3',sans-serif;max-width:200px;transition:border-color .15s}
.select-membre:focus{outline:none;border-color:#3d6080}
.btn-icon{width:30px;height:30px;border:none;border-radius:7px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .15s;margin:0 2px;vertical-align:middle}
.btn-del{background:rgba(231,76,60,.08);color:#e74c3c}.btn-del:hover{background:#e74c3c;color:#fff}

/* EVAL CARDS */
.eval-card{background:#fff;border:1.5px solid #c8c4bc;border-radius:14px;padding:22px;margin-bottom:16px}
.eval-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px}
.eval-titre{font-weight:700;font-size:15px;color:#1e2a35;display:block}
.eval-etudiant{font-size:13px;color:#8a9aaa;margin-top:2px;display:block}
.eval-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.eval-jury-name{font-size:13px;color:#4a7090}
.eval-date{font-size:12.5px;color:#aaa}
.eval-criteres{display:flex;flex-direction:column;gap:10px;margin-bottom:14px}
.critere-row{display:flex;align-items:center;gap:12px}
.critere-label{font-size:13px;color:#4a5a6a;min-width:180px}
.critere-bar-wrap{flex:1;height:8px;background:#f0ede8;border-radius:4px;overflow:hidden}
.critere-bar{height:100%;background:linear-gradient(90deg,#4a7090,#f5a623);border-radius:4px;transition:width .4s}
.critere-note{font-size:13px;font-weight:700;color:#1e2a35;min-width:48px;text-align:right}
.eval-comment{display:flex;align-items:flex-start;gap:8px;padding:10px 14px;background:#f5f3ef;border-radius:9px;font-size:13px;color:#4a5a6a;font-style:italic}

/* RÉSULTATS */
.projet-nom-sm{font-size:13px;color:#4a7090}
.td-center{text-align:center}
.note-chip{padding:4px 10px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:8px;font-size:13px;font-weight:700;color:#1e2a35}
.note-finale{background:rgba(245,197,24,0.15);color:#9a7200;border-color:rgba(245,197,24,.4)}
.mention-badge{padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700}
.mention-tb{background:#d4edda;color:#155724}.mention-b{background:#cce5ff;color:#004085}
.mention-ab{background:#d1ecf1;color:#0c5460}.mention-p{background:#fff3cd;color:#856404}
.mention-ins{background:#f8d7da;color:#721c24}
.decision-badge{padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700}
.decision-ok{background:#d4edda;color:#155724}.decision-nok{background:#f8d7da;color:#721c24}
.badge-note{padding:4px 12px;background:rgba(245,197,24,0.15);color:#9a7200;border:1px solid rgba(245,197,24,.3);border-radius:20px;font-size:13px;font-weight:700}

/* BANNERS */
.banner-delib{display:flex;align-items:center;gap:10px;padding:14px 18px;background:#cce5ff;border:1px solid #b8daff;border-radius:10px;font-size:13.5px;color:#004085;font-weight:500;margin-bottom:20px}
.banner-publie{padding:14px 18px;background:#d4edda;border:1px solid #c3e6cb;border-radius:10px;font-size:13.5px;color:#155724;font-weight:500;margin-bottom:20px}

/* TOAST INLINE */
.toast-inline{position:fixed;bottom:28px;right:28px;padding:12px 20px;border-radius:10px;font-size:13.5px;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.12)}
.toast-ok{background:#d4edda;color:#155724;border:1px solid #c3e6cb}
.toast-err{background:#f8d7da;color:#721c24;border:1px solid #f5c6cb}
.toast-fade-enter-active,.toast-fade-leave-active{transition:opacity .3s,transform .3s}
.toast-fade-enter-from,.toast-fade-leave-to{opacity:0;transform:translateY(8px)}

/* DELIBERATION TABLE extras */
.td-date{font-size:13px;color:#4a7090}
.btn-small{padding:6px 11px;border:none;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .15s;white-space:nowrap}
.btn-ok{background:#d4edda;color:#155724}.btn-ok:hover{background:#27ae60;color:#fff}
.btn-gold-sm{background:rgba(245,197,24,.2);color:#9a7200;border:1px solid rgba(245,197,24,.4)}.btn-gold-sm:hover{background:#F5C518;color:#fff}
.check-published{font-size:18px;color:#27ae60}

/* MISC */
.loading-state{text-align:center;padding:60px;color:#7A8FA6}
.spinner{width:32px;height:32px;border:3px solid #c8c4bc;border-top-color:#3d6080;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-state{text-align:center;padding:60px;color:#8a9aaa;line-height:1.7}
.empty-icon{font-size:48px;margin-bottom:14px}
</style>