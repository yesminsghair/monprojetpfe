<template>
  <div class="page-content">

    <!-- HEADER -->
    <div class="page-header">
      <div class="header-left">
        <span class="header-icon">🎓</span>
        <div>
          <h2>Gestion des soutenances</h2>
          <p class="subtitle">Planifier les sessions, affecter les projets et publier le calendrier</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-outline" @click="onglet='calendrier'" v-if="onglet!=='calendrier'">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Calendrier
        </button>
        <button class="btn-gold" @click="openModal(null)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouvelle séance
        </button>
        <button class="btn-green" @click="publierCalendrier" :disabled="calendrierPublie">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
          {{ calendrierPublie ? '✓ Calendrier publié' : 'Publier le calendrier' }}
        </button>
      </div>
    </div>

    <!-- CONFLITS ALERT -->
    <div v-if="conflits.length" class="alert-conflits">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <div>
        <div class="conflict-title">{{ conflits.length }} conflit(s) détecté(s)</div>
        <div v-for="c in conflits" :key="c.id" class="conflict-item">⚠ {{ c.message }}</div>
      </div>
    </div>

    <!-- STATS -->
    <div class="stats-bar">
      <div class="stat-card"><span class="stat-val">{{ sessions.length }}</span><span class="stat-label">Sessions</span></div>
      <div class="stat-card"><span class="stat-val">{{ sessions.filter(s=>s.projet).length }}</span><span class="stat-label">Projets affectés</span></div>
      <div class="stat-card"><span class="stat-val">{{ sallesUniques }}</span><span class="stat-label">Salles utilisées</span></div>
      <div class="stat-card stat-card-ok" v-if="calendrierPublie"><span class="stat-val">✓</span><span class="stat-label">Publié</span></div>
    </div>

    <!-- TABS -->
    <div class="tabs-bar">
      <button class="tab-btn" :class="{active:onglet==='liste'}" @click="onglet='liste'">Liste des sessions</button>
      <button class="tab-btn" :class="{active:onglet==='calendrier'}" @click="onglet='calendrier'">Vue calendrier</button>
      <button class="tab-btn" :class="{active:onglet==='plans'}" @click="onglet='plans'">Plans proposés</button>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- ONGLET LISTE                                           -->
    <!-- ══════════════════════════════════════════════════════ -->
    <div v-if="onglet==='liste'">
      <div v-if="loadingSessions" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
      <div v-else-if="!sessions.length" class="empty-state">
        <div class="empty-icon">📅</div>
        <p>Aucune session de soutenance planifiée.</p>
        <button class="btn-gold" @click="openModal(null)">Planifier la première session</button>
      </div>
      <div v-else class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Date &amp; Heure</th>
              <th>Salle</th>
              <th>Projet / Étudiant</th>
              <th>Jury</th>
              <th>Statut</th>
              <th style="text-align:center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in sessions" :key="s.id" :class="{'row-conflit': s.conflit}">
              <td>
                <div class="session-date">{{ s.date }}</div>
                <div class="session-heure">{{ s.heure_debut }} – {{ s.heure_fin }}</div>
              </td>
              <td>
                <span class="salle-badge">{{ s.salle }}</span>
              </td>
              <td>
                <div v-if="s.projet">
                  <div class="projet-nom">{{ s.projet }}</div>
                  <div class="projet-etudiant">{{ s.etudiant }}</div>
                </div>
                <span v-else class="no-projet">— Non affecté</span>
              </td>
              <td>
                <div class="jury-list">
                  <span v-for="(m,i) in s.jury_membres" :key="i" class="jury-chip">{{ m }}</span>
                  <span v-if="!s.jury_membres?.length" class="no-membre">—</span>
                </div>
              </td>
              <td>
                <span class="status-badge" :class="statusClass(s)">{{ statusLabel(s) }}</span>
              </td>
              <td class="td-actions">
                <button class="btn-icon btn-assign" @click="openAffectation(s)" title="Affecter un projet" v-if="!s.projet">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </button>
                <button class="btn-icon btn-edit" @click="openModal(s)" title="Modifier">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icon btn-del" @click="supprimer(s.id)" title="Supprimer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- ONGLET CALENDRIER                                      -->
    <!-- ══════════════════════════════════════════════════════ -->
    <div v-if="onglet==='calendrier'">
      <div class="calendrier-grid">
        <div v-for="jour in joursAvecSessions" :key="jour.date" class="jour-card">
          <div class="jour-header">{{ jour.dateLabel }}</div>
          <div v-for="s in jour.sessions" :key="s.id" class="slot-card" :class="{'slot-libre':!s.projet,'slot-conflit':s.conflit}">
            <div class="slot-time">{{ s.heure_debut }} – {{ s.heure_fin }}</div>
            <div class="slot-salle">🏫 {{ s.salle }}</div>
            <div v-if="s.projet" class="slot-projet">{{ s.projet }}</div>
            <div v-if="s.etudiant" class="slot-etudiant">{{ s.etudiant }}</div>
            <div v-if="!s.projet" class="slot-libre-txt">Créneau libre</div>
          </div>
        </div>
        <div v-if="!joursAvecSessions.length" class="empty-state">
          <div class="empty-icon">📅</div><p>Aucune session planifiée.</p>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- ONGLET PLANS PROPOSÉS PAR JURY                        -->
    <!-- ══════════════════════════════════════════════════════ -->
    <div v-if="onglet==='plans'">
      <div class="page-subheader">
        <h3>Plans proposés par les membres de jury</h3>
        <p class="subtitle">Examinez et validez les propositions</p>
      </div>
      <div v-if="!plans.length" class="empty-state">
        <div class="empty-icon">📝</div>
        <p>Aucun plan proposé pour le moment.</p>
      </div>
      <div v-else>
        <div v-for="plan in plans" :key="plan.id" class="plan-card">
          <div class="plan-header">
            <div>
              <div class="plan-jury">👤 {{ plan.membre_jury }}</div>
              <div class="plan-date">Proposé le {{ plan.date_proposition }}</div>
            </div>
            <div class="plan-actions">
              <span class="plan-badge" :class="plan.statut==='validé' ? 'badge-valide' : plan.statut==='rejeté' ? 'badge-rejete' : 'badge-attente'">
                {{ plan.statut || 'En attente' }}
              </span>
              <button v-if="plan.statut!=='validé'" class="btn-small btn-ok" @click="validerPlan(plan)">✓ Valider</button>
              <button v-if="plan.statut!=='rejeté'" class="btn-small btn-nok" @click="rejeterPlan(plan)">✗ Rejeter</button>
            </div>
          </div>
          <div class="plan-sessions">
            <div v-for="(sess,i) in plan.sessions" :key="i" class="plan-session-row">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span class="ps-date">{{ sess.date }}</span>
              <span class="ps-time">{{ sess.heure }}</span>
              <span class="ps-salle">{{ sess.salle }}</span>
              <span class="ps-projet">{{ sess.projet }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- MODAL : SESSION                                        -->
    <!-- ══════════════════════════════════════════════════════ -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ editSession ? 'Modifier la session' : 'Nouvelle session de soutenance' }}</h3>
            <button class="modal-close" @click="closeModal">×</button>
          </div>
          <div class="modal-body">

            <div class="form-row">
              <div class="form-group">
                <label>Date *</label>
                <input type="date" v-model="form.date" @change="form.salle = ''" />
              </div>
              <div class="form-group">
                <label>Salle *</label>
                <select v-model="form.salle" :disabled="!form.date || !form.heure_debut || !form.heure_fin">
                  <option value="">
                    {{ (!form.date || !form.heure_debut || !form.heure_fin) ? "— Remplir date &amp; horaire d'abord —" : "— Sélectionner une salle —" }}}
                  </option>
                  <option
                    v-for="s in sallesAvecStatut"
                    :key="s.salle"
                    :value="s.salle"
                    :disabled="s.occupee"
                    :class="s.occupee ? 'option-occupee' : 'option-libre'"
                  >
                    {{ s.occupee ? '🔴 ' + s.salle + ' (occupée)' : '🟢 ' + s.salle }}
                  </option>
                </select>
                <span v-if="!form.date || !form.heure_debut || !form.heure_fin" class="field-hint">
                  Remplissez la date et les horaires pour voir les salles disponibles
                </span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Heure début *</label>
                <input type="time" v-model="form.heure_debut" @change="form.salle = ''" />
              </div>
              <div class="form-group">
                <label>Heure fin *</label>
                <input type="time" v-model="form.heure_fin" @change="form.salle = ''" />
              </div>
            </div>

            <!-- Jury member conflicts warning -->
            <div v-if="conflitsMembresJury.length" class="alert-jury-conflit">
              <div class="conflit-jury-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                {{ conflitsMembresJury.length }} membre(s) du jury déjà occupé(s) à ce créneau
              </div>
              <div v-for="c in conflitsMembresJury" :key="c.id" class="conflit-jury-row">
                <span class="conflit-nom">{{ c.nom }}</span>
                <span class="conflit-detail">jury de « {{ c.projet }} » ({{ c.heure }})</span>
              </div>
            </div>

            <div class="form-group" v-if="!editSession">
              <label>Projet PFE *</label>
              <select v-model="form.jury_id" @change="syncProjetFromJury">
                <option value="">— Sélectionner un projet —</option>
                <option v-for="j in jurysDisponibles" :key="j.id" :value="j.id">
                  {{ j.titre }} – {{ j.etudiant }}
                </option>
              </select>
              <!-- Preview card shown after selection -->
              <div v-if="selectedJuryPreview" class="projet-preview">
                <div class="preview-row">
                  <span class="preview-label">🎓 Étudiant</span>
                  <span class="preview-val">{{ selectedJuryPreview.etudiant }}</span>
                </div>
                <div class="preview-row" v-if="selectedJuryPreview.encadrant">
                  <span class="preview-label">👨‍🏫 Encadrant</span>
                  <span class="preview-val">{{ selectedJuryPreview.encadrant }}</span>
                </div>
                <div class="preview-row" v-if="selectedJuryPreview.membres && selectedJuryPreview.membres.length">
                  <span class="preview-label">⚖️ Jury</span>
                  <span class="preview-val">{{ selectedJuryPreview.membres.map(m => m.nom).join(', ') }}</span>
                </div>
              </div>
            </div>

            <!-- Vérification conflits inline -->
            <div v-if="conflitDetecte" class="alert-conflit-inline">
              ⚠ Attention : un conflit potentiel a été détecté (même salle ou même jury à ce créneau).
            </div>

          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal">Annuler</button>
            <button class="btn-gold" @click="sauvegarder" :disabled="saving">
              <span v-if="saving" class="spin-sm"></span>
              {{ saving ? 'Enregistrement...' : (editSession ? 'Mettre à jour' : 'Créer la session') }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- MODAL : AFFECTATION PROJET -->
    <transition name="modal-fade">
      <div v-if="showAffectModal" class="modal-overlay" @click.self="showAffectModal=false">
        <div class="modal">
          <div class="modal-header">
            <h3>Affecter un projet à la session</h3>
            <button class="modal-close" @click="showAffectModal=false">×</button>
          </div>
          <div class="modal-body">
            <p class="affect-session-info">
              📅 {{ affectSession?.date }} · {{ affectSession?.heure_debut }}–{{ affectSession?.heure_fin }} · 🏫 {{ affectSession?.salle }}
            </p>
            <div class="form-group">
              <label>Projet PFE</label>
              <select v-model="affectProjetId">
                <option value="">— Sélectionner —</option>
                <option v-for="p in projetsDisponibles" :key="p.id" :value="p.id">{{ p.titre }} – {{ p.etudiant }}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showAffectModal=false">Annuler</button>
            <button class="btn-gold" @click="confirmerAffectation">Affecter</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'GestionSoutenance',
  emits: ['toast'],

  data() {
    return {
      onglet: 'liste',
      loadingSessions: false,
      saving: false,
      showModal: false,
      showAffectModal: false,
      editSession: null,
      affectSession: null,
      affectProjetId: '',
      calendrierPublie: false,
      conflits: [],
      conflitDetecte: false,

      sessions: [],
      plans: [],
      projetsDisponibles: [],
      jurysDisponibles: [],
      selectedJuryPreview: null,

      // Master list of available rooms — edit to match your building
      allSalles: [
        'Salle A101', 'Salle A102', 'Salle A103',
        'Salle B201', 'Salle B202', 'Salle B203',
        'Salle C301', 'Salle C302',
        'Amphi 1',   'Amphi 2',
      ],

      form: {
        date: '',
        salle: '',
        heure_debut: '',
        heure_fin: '',
        projet_id: '',
        jury_id: '',
      },
    }
  },

  computed: {
    sallesUniques() {
      return new Set(this.sessions.map(s => s.salle).filter(Boolean)).size
    },

    // Helper: check if two time ranges [a1,a2] and [b1,b2] overlap
    // (used by both sallesDisponibles and conflitsMembresJury)
    _creneauOverlap() {
      return (d1, h1, f1, d2, h2, f2) => {
        if (!d1 || !h1 || !f1 || !d2 || !h2 || !f2) return false
        if (d1 !== d2) return false
        const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
        return toMin(h1) < toMin(f2) && toMin(h2) < toMin(f1)
      }
    },

    // Salles occupied during the currently-selected slot
    sallesOccupees() {
      const { date, heure_debut, heure_fin } = this.form
      if (!date || !heure_debut || !heure_fin) return new Set()
      const busy = new Set()
      this.sessions.forEach(s => {
        if (!s.salle) return
        // Skip the session being edited
        if (this.editSession && s.id === this.editSession.id) return
        if (this._creneauOverlap(date, heure_debut, heure_fin, s.date, s.heure_debut, s.heure_fin)) {
          busy.add(s.salle)
        }
      })
      return busy
    },

    // Salles list annotated with availability
    sallesAvecStatut() {
      return this.allSalles.map(salle => ({
        salle,
        occupee: this.sallesOccupees.has(salle),
      }))
    },

    // Jury members busy at the selected slot
    conflitsMembresJury() {
      const { date, heure_debut, heure_fin } = this.form
      if (!date || !heure_debut || !heure_fin || !this.selectedJuryPreview) return []

      // Collect enseignant_ids of the selected jury
      const membreIds = new Set(
        (this.selectedJuryPreview.membres || []).map(m => m.enseignant_id).filter(Boolean)
      )
      if (!membreIds.size) return []

      const conflits = []
      this.sessions.forEach(s => {
        if (this.editSession && s.id === this.editSession.id) return
        if (!this._creneauOverlap(date, heure_debut, heure_fin, s.date, s.heure_debut, s.heure_fin)) return
        // Check each member of that session's jury
        ;(s.jury_membres_ids || []).forEach(id => {
          if (membreIds.has(id)) {
            const membre = (this.selectedJuryPreview.membres || []).find(m => m.enseignant_id === id)
            const nom = membre?.nom || ('Membre #' + id)
            if (!conflits.find(c => c.id === id)) {
              conflits.push({
                id,
                nom,
                projet: s.projet || ('Soutenance #' + s.id),
                heure: `${s.heure_debut}–${s.heure_fin}`,
              })
            }
          }
        })
      })
      return conflits
    },

    joursAvecSessions() {
      const map = {}
      this.sessions.forEach(s => {
        if (!map[s.date]) map[s.date] = { date: s.date, dateLabel: this.formatDate(s.date), sessions: [] }
        map[s.date].sessions.push(s)
      })
      return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
    },
  },

  mounted() {
    this.chargerSessions()
    this.chargerProjets()
    this.chargerPlans()
    this.chargerJurys()
  },

  methods: {


    async chargerJurys() {
      try {
        const res = await api.get('/jurys-pfe')
        // Only show jurys that have no soutenance scheduled yet (not planifie/termine)
        this.jurysDisponibles = (res.data || [])
          .filter(j => !j.date_soutenance || j.statut === 'en_attente')
          .map(j => ({
            id:       j.id,
            titre:    j.projet_titre || ('Projet #' + j.id),
            etudiant: j.etudiant_nom || '—',
            encadrant: j.encadrant_nom || null,
            membres:  (j.membres || []).map(m => ({
            enseignant_id: m.enseignant_id ?? m.id,
            nom: m.nom || (m.prenom ? m.prenom + ' ' + m.nom : ''),
            fonction: m.fonction,
          })),
          }))
      } catch (error) {
        console.error('Erreur chargement jurys:', error)
        this.jurysDisponibles = []
      }
    },

    async chargerSessions() {
      this.loadingSessions = true
      try {
        const res = await api.get('/jurys-pfe')
        this.sessions = (res.data || [])
          .filter(s => s.date_soutenance)
          .map(s => this.mapSession(s))
        this.detecterConflits()
      } catch (error) {
        console.error('Erreur chargement sessions:', error)
        this.$emit('toast', { message: 'Erreur de chargement des sessions', type: 'toast-err' })
        this.sessions = []
      } finally {
        this.loadingSessions = false
      }
    },

    mapSession(s) {
      return {
        id: s.id,
        date: s.date_soutenance || '',
        heure_debut: (s.heure_debut || '').substring(0, 5),
        heure_fin: (s.heure_fin || '').substring(0, 5),
        salle: s.salle || '',
        projet: s.projet_titre || null,
        etudiant: s.etudiant_nom || null,
        jury_membres: (s.membres || []).map(m => m.nom || ''),
        // Keep IDs for jury-member conflict detection (parallel array — same index as jury_membres)
        jury_membres_ids: (s.membres || []).map(m => m.enseignant_id).filter(Boolean),
        conflit: false
      }
    },

    calculerHeureFin(dateSeance) {
      if (!dateSeance) return ''
      const date = new Date(dateSeance)
      date.setHours(date.getHours() + 1)
      return date.toTimeString().substring(0, 5)
    },

    async chargerProjets() {
      try {
        const res = await api.get('/jurys-pfe/projets-disponibles')
        this.projetsDisponibles = (res.data || []).map(p => ({ id: p.id, titre: p.titre || ('Projet #' + p.id), etudiant: p.etudiant_nom || '—' }))
      } catch (error) {
        console.error('Erreur chargement projets:', error)
        this.projetsDisponibles = []
      }
    },

    async chargerPlans() {
      // No backend endpoint for proposals yet — leave list empty
      this.plans = []
    },

    detecterConflits() {
      this.conflits = []
      const toMin = t => { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m }
      const overlaps = (s1, s2) => {
        if (s1.date !== s2.date || s1.id === s2.id) return false
        return toMin(s1.heure_debut) < toMin(s2.heure_fin) && toMin(s2.heure_debut) < toMin(s1.heure_fin)
      }

      this.sessions.forEach((s, i) => {
        s.conflit = false
      })

      this.sessions.forEach((s, i) => {
        this.sessions.forEach((other, j) => {
          if (i >= j) return
          if (!overlaps(s, other)) return

          // Salle conflict
          if (s.salle && s.salle === other.salle) {
            const msg = `Salle ${s.salle} occupée deux fois le ${s.date} : ${s.heure_debut}-${s.heure_fin} et ${other.heure_debut}-${other.heure_fin}`
            if (!this.conflits.find(c => c.message === msg)) this.conflits.push({ id: s.id, message: msg })
            s.conflit = true; other.conflit = true
          }

          // Jury member conflict
          const idsA = new Set(s.jury_membres_ids || [])
          const idsB = new Set(other.jury_membres_ids || [])
          idsA.forEach(id => {
            if (idsB.has(id)) {
              const membreIdx = (s.jury_membres_ids || []).indexOf(id)
              const membreNom = membreIdx !== -1 ? (s.jury_membres[membreIdx] || ('Membre #' + id)) : ('Membre #' + id)
              const msg = `Conflit de jury le ${s.date} : « ${s.projet || 'Séance #' + s.id} » et « ${other.projet || 'Séance #' + other.id} » partagent un membre (${membreNom})`
              if (!this.conflits.find(c => c.message === msg)) this.conflits.push({ id: s.id, message: msg })
              s.conflit = true; other.conflit = true
            }
          })
        })
      })
    },

    openModal(session) {
      this.editSession = session
      if (session) {
        this.form = {
          date: session.date,
          salle: session.salle,
          heure_debut: session.heure_debut,
          heure_fin: session.heure_fin,
          projet_id: session.projet_id || ''
        }
      } else {
        this.form = { date: '', salle: '', heure_debut: '', heure_fin: '', projet_id: '' }
        this.selectedJuryPreview = null
      }
      this.conflitDetecte = false
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.editSession = null
      this.selectedJuryPreview = null
    },

    syncProjetFromJury() {
      const jury = this.jurysDisponibles.find(j => j.id === this.form.jury_id)
      this.selectedJuryPreview = jury || null
    },

    async sauvegarder() {
      if (!this.form.date || !this.form.salle || !this.form.heure_debut || !this.form.heure_fin || (!this.editSession && !this.form.jury_id)) {
        this.$emit('toast', { message: 'Veuillez remplir tous les champs obligatoires.', type: 'toast-err' })
        return
      }
      // Block if the selected salle is occupied at this slot
      const salleChoisie = this.sallesAvecStatut.find(s => s.salle === this.form.salle)
      if (salleChoisie && salleChoisie.occupee) {
        this.$emit('toast', { message: `La salle « ${this.form.salle} » est déjà réservée à ce créneau. Veuillez choisir une autre salle.`, type: 'toast-err' })
        return
      }

      // Warn (but allow override) if jury members are busy
      if (this.conflitsMembresJury.length) {
        const noms = this.conflitsMembresJury.map(c => c.nom).join(', ')
        if (!confirm(`⚠ Conflit de jury détecté : ${noms} sont déjà dans un autre jury à ce créneau.\n\nConfirmer quand même ?`)) return
      }

      this.saving = true
      try {
        // Laravel expects H:i exactly — strip seconds if browser added them (e.g. "09:30:00" → "09:30")
        const trimTime = t => t ? t.substring(0, 5) : t
        const payload = {
          date_soutenance: this.form.date,
          heure_debut: trimTime(this.form.heure_debut),
          heure_fin: trimTime(this.form.heure_fin),
          salle: this.form.salle,
          statut: 'planifie',
        }

        if (this.editSession) {
          await api.put(`/jurys-pfe/${this.editSession.id}`, payload)
          this.$emit('toast', { message: 'Séance mise à jour.', type: 'toast-ok' })
        } else {
          await api.put(`/jurys-pfe/${this.form.jury_id}`, payload)
          this.$emit('toast', { message: 'Séance créée avec succès.', type: 'toast-ok' })
        }
        this.closeModal()
        await this.chargerSessions()
      } catch (error) {
        console.error('Erreur sauvegarde:', error)
        this.$emit('toast', { message: 'Erreur lors de l\'enregistrement', type: 'toast-err' })
      } finally {
        this.saving = false
      }
    },

    openAffectation(session) {
      this.affectSession = session
      this.affectProjetId = ''
      this.showAffectModal = true
    },

    async confirmerAffectation() {
      if (!this.affectProjetId) {
        this.$emit('toast', { message: 'Sélectionnez un projet.', type: 'toast-err' })
        return
      }

      try {
        await api.put(`/jurys-pfe/${this.affectSession.id}`, {
          projet_id: this.affectProjetId
        })
        await this.chargerSessions()
        this.$emit('toast', { message: 'Projet affecté à la session.', type: 'toast-ok' })
      } catch (error) {
        console.error('Erreur affectation:', error)
        this.$emit('toast', { message: 'Erreur lors de l\'affectation', type: 'toast-err' })
      }
      this.showAffectModal = false
    },

    async supprimer(id) {
      if (!confirm('Supprimer cette session de soutenance ?')) return
      try {
        await api.put(`/jurys-pfe/${id}`, { statut: 'annule', date_soutenance: null, heure_debut: null, heure_fin: null, salle: null })
        await this.chargerSessions()
        this.$emit('toast', { message: 'Soutenance annulée.', type: 'toast-ok' })
      } catch (error) {
        console.error('Erreur suppression:', error)
        this.$emit('toast', { message: 'Erreur lors de la suppression', type: 'toast-err' })
      }
    },

    async publierCalendrier() {
      if (!confirm('Publier le calendrier des soutenances ? Tous les participants seront notifiés.')) return
      try {
        await api.post('/jurys-pfe/publier-calendrier')
        this.calendrierPublie = true
        this.$emit('toast', { message: 'Calendrier publié. Tous les participants ont été notifiés.', type: 'toast-ok' })
      } catch (error) {
        console.error('Erreur publication:', error)
        this.$emit('toast', { message: 'Erreur lors de la publication', type: 'toast-err' })
      }
    },

    async validerPlan(plan) {
      try {
        await api.put(`/soutenances/plans/${plan.id}/valider`)
        plan.statut = 'validé'
        this.$emit('toast', { message: 'Plan validé avec succès.', type: 'toast-ok' })
      } catch (error) {
        console.error('Erreur validation plan:', error)
        this.$emit('toast', { message: 'Erreur lors de la validation', type: 'toast-err' })
      }
    },

    async rejeterPlan(plan) {
      try {
        await api.put(`/soutenances/plans/${plan.id}/rejeter`)
        plan.statut = 'rejeté'
        this.$emit('toast', { message: 'Plan rejeté.', type: 'toast-ok' })
      } catch (error) {
        console.error('Erreur rejet plan:', error)
        this.$emit('toast', { message: 'Erreur lors du rejet', type: 'toast-err' })
      }
    },

    statusLabel(s) {
      if (s.conflit) return '⚠ Conflit'
      if (s.projet) return '✓ Planifiée'
      return 'Libre'
    },

    statusClass(s) {
      if (s.conflit) return 'status-conflit'
      if (s.projet) return 'status-ok'
      return 'status-libre'
    },

    formatDate(d) {
      if (!d) return d
      try {
        return new Date(d).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      } catch {
        return d
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.page-content{font-family:'Source Sans 3',sans-serif;color:#1e2a35}
.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;gap:16px;flex-wrap:wrap}
.page-subheader{margin-bottom:20px}
.page-subheader h3{font-family:'Merriweather',serif;font-size:17px;color:#1e2a35;margin-bottom:4px}
.header-left{display:flex;align-items:center;gap:14px}
.header-icon{font-size:28px;line-height:1}
.page-header h2{font-family:'Merriweather',serif;font-size:20px;color:#1e2a35;margin-bottom:3px}
.subtitle{font-size:13.5px;color:#7A8FA6}
.header-actions{display:flex;gap:10px;flex-wrap:wrap}
.btn-gold{display:flex;align-items:center;gap:7px;padding:10px 18px;background:#F5C518;color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .2s;box-shadow:0 4px 16px rgba(245,197,24,0.3)}
.btn-gold:hover:not(:disabled){transform:translateY(-1px)}.btn-gold:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-green{display:flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(39,174,96,0.2);color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .2s}
.btn-green:hover:not(:disabled){transform:translateY(-1px)}.btn-green:disabled{opacity:.6;cursor:not-allowed;transform:none}
.btn-outline{display:flex;align-items:center;gap:7px;padding:10px 18px;background:transparent;border:1.5px solid #c8c4bc;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;color:#4a5a6a;font-family:'Source Sans 3',sans-serif;transition:all .18s}
.btn-outline:hover{border-color:#3d6080;color:#F5C518}
.btn-cancel{padding:10px 18px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;color:#A8BDD4}
.alert-conflits{display:flex;align-items:flex-start;gap:12px;padding:14px 18px;background:#fff3cd;border:1.5px solid #ffeeba;border-radius:12px;margin-bottom:20px;color:#856404}
.conflict-title{font-weight:700;font-size:14px;margin-bottom:6px}
.conflict-item{font-size:13px;margin-bottom:3px}
.stats-bar{display:flex;gap:14px;margin-bottom:22px;flex-wrap:wrap}
.stat-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:12px;padding:14px 22px;display:flex;flex-direction:column;align-items:center;min-width:100px}
.stat-card-ok{border-color:#27ae60;background:#d4edda}
.stat-val{font-family:'Merriweather',serif;font-size:24px;font-weight:700;color:#1e2a35;line-height:1}
.stat-label{font-size:12px;color:#8a9aaa;margin-top:4px}
.tabs-bar{display:flex;gap:8px;margin-bottom:24px;border-bottom:2px solid #c8c4bc}
.tab-btn{padding:10px 20px;border:none;background:transparent;font-size:13.5px;font-weight:600;color:#8a9aaa;cursor:pointer;font-family:'Source Sans 3',sans-serif;border-bottom:3px solid transparent;margin-bottom:-2px;transition:all .18s}
.tab-btn:hover{color:#F5C518}.tab-btn.active{color:#3d6080;border-bottom-color:#3d6080}
.table-wrapper{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;overflow:hidden}
.table{width:100%;border-collapse:collapse}
.table thead tr{background:#0F1923}
.table th{padding:11px 14px;font-size:11px;font-weight:700;color:#4a5a6a;text-transform:uppercase;letter-spacing:.05em;text-align:left}
.table td{padding:13px 14px;font-size:13.5px;border-top:1px solid rgba(255,255,255,0.07);vertical-align:middle;background:#243347}
.table tr:hover td{background:rgba(245,197,24,.06)}
.row-conflit td{background:#fff9e6}
.session-date{font-weight:700;color:#1e2a35;font-size:14px}
.session-heure{font-size:12.5px;color:#8a9aaa;margin-top:2px}
.salle-badge{padding:4px 10px;background:rgba(245,197,24,.1);color:#F5C518;border-radius:8px;font-size:13px;font-weight:600}
.projet-nom{font-weight:700;color:#1e2a35;font-size:13.5px}
.projet-etudiant{font-size:12.5px;color:#8a9aaa;margin-top:2px}
.no-projet{font-size:12.5px;color:#aaa;font-style:italic}
.jury-list{display:flex;flex-wrap:wrap;gap:5px}
.jury-chip{padding:3px 9px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:20px;font-size:12px;color:#A8BDD4}
.no-membre{font-size:12.5px;color:#aaa}
.status-badge{padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700}
.status-ok{background:#d4edda;color:#155724}.status-libre{background:#e8e4dc;color:#7A8FA6}.status-conflit{background:#fff3cd;color:#856404}
.td-actions{text-align:center;white-space:nowrap}
.btn-icon{width:32px;height:32px;border:none;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .15s;margin:0 2px}
.btn-edit{background:rgba(245,197,24,.12);color:#F5C518}.btn-edit:hover{background:rgba(245,197,24,0.2);color:#fff}
.btn-del{background:rgba(231,76,60,.08);color:#e74c3c}.btn-del:hover{background:#e74c3c;color:#fff}
.btn-assign{background:rgba(39,174,96,.1);color:#27ae60}.btn-assign:hover{background:#27ae60;color:#fff}
/* CALENDRIER */
.calendrier-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
.jour-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;overflow:hidden}
.jour-header{padding:10px 16px;background:#f0ede8;font-weight:700;font-size:13.5px;color:#1e2a35;text-transform:capitalize}
.slot-card{padding:14px 16px;border-top:1px solid rgba(255,255,255,0.07);transition:background .15s}
.slot-card:hover{background:#243347}
.slot-libre{background:#1A2635}
.slot-conflit{background:#fff9e6}
.slot-time{font-weight:700;font-size:13px;color:#1e2a35}
.slot-salle{font-size:12.5px;color:#8a9aaa;margin:3px 0}
.slot-projet{font-size:13px;font-weight:600;color:#F5C518;margin-top:5px}
.slot-etudiant{font-size:12px;color:#7A8FA6}
.slot-libre-txt{font-size:12.5px;color:#aaa;font-style:italic;margin-top:4px}
/* PLANS */
.plan-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;padding:20px;margin-bottom:16px}
.plan-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px}
.plan-jury{font-weight:700;color:#1e2a35;font-size:14px}
.plan-date{font-size:12.5px;color:#aaa;margin-top:3px}
.plan-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.plan-badge{padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700}
.badge-valide{background:#d4edda;color:#155724}.badge-rejete{background:#f8d7da;color:#721c24}.badge-attente{background:#fff3cd;color:#856404}
.btn-small{padding:6px 12px;border:none;border-radius:7px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .15s}
.btn-ok{background:#d4edda;color:#155724}.btn-ok:hover{background:#27ae60;color:#fff}
.btn-nok{background:#f8d7da;color:#721c24}.btn-nok:hover{background:#e74c3c;color:#fff}
.plan-sessions{display:flex;flex-direction:column;gap:8px}
.plan-session-row{display:flex;align-items:center;gap:10px;padding:9px 12px;background:#e8e4dc;border-radius:8px;font-size:13px;flex-wrap:wrap}
.ps-date{font-weight:700;color:#1e2a35}.ps-time{color:#7A8FA6}.ps-salle{padding:2px 8px;background:#ddd9d1;border-radius:6px;font-size:12px}.ps-projet{color:#F5C518;font-weight:600}
/* MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:#ddd9d1;border-radius:16px;width:100%;max-width:520px;max-height:88vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.25)}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:22px 24px 0}
.modal-header h3{font-family:'Merriweather',serif;font-size:17px;color:#1e2a35}
.modal-close{background:none;border:none;font-size:22px;color:#8a9aaa;cursor:pointer;line-height:1;transition:color .15s}.modal-close:hover{color:#1e2a35}
.modal-body{padding:20px 24px;display:flex;flex-direction:column;gap:14px}
.modal-footer{padding:16px 24px;border-top:1px solid rgba(255,255,255,0.07);display:flex;justify-content:flex-end;gap:10px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.form-group{display:flex;flex-direction:column;gap:6px}
.form-group label{font-size:13.5px;font-weight:600;color:#F5C518}
.form-group input,.form-group select{padding:10px 12px;border:1.5px solid #c8c4bc;border-radius:9px;background:#e8e4dc;font-size:14px;color:#1e2a35;font-family:'Source Sans 3',sans-serif}
.form-group input:focus,.form-group select:focus{outline:none;border-color:#F5C518}
.alert-conflit-inline{padding:10px 14px;background:#fff3cd;border:1px solid #ffeeba;border-radius:8px;font-size:13px;color:#856404}
.field-hint{font-size:11.5px;color:#7A8FA6;margin-top:4px;display:block;font-style:italic}
.option-occupee{color:#e74c3c}
.option-libre{color:#27ae60}
.alert-jury-conflit{padding:12px 16px;background:rgba(231,76,60,0.08);border:1.5px solid rgba(231,76,60,0.35);border-radius:10px;display:flex;flex-direction:column;gap:7px}
.conflit-jury-title{display:flex;align-items:center;gap:8px;font-weight:700;font-size:13px;color:#e74c3c}
.conflit-jury-row{display:flex;align-items:baseline;gap:8px;padding:5px 10px;background:rgba(231,76,60,0.06);border-radius:7px}
.conflit-nom{font-weight:700;font-size:13px;color:#1e2a35;min-width:130px}
.conflit-detail{font-size:12.5px;color:#7A8FA6}
.projet-preview{margin-top:10px;padding:12px 14px;background:#1A2635;border:1.5px solid #3d6080;border-radius:10px;display:flex;flex-direction:column;gap:7px}
.preview-row{display:flex;align-items:baseline;gap:10px}
.preview-label{font-size:11.5px;font-weight:700;color:#7A8FA6;min-width:90px;flex-shrink:0}
.preview-val{font-size:13px;color:#e8e4dc;font-weight:500}
.projet-preview{margin-top:10px;padding:12px 14px;background:#1A2635;border:1.5px solid #3d6080;border-radius:10px;display:flex;flex-direction:column;gap:7px}
.preview-row{display:flex;align-items:baseline;gap:10px}
.preview-label{font-size:11.5px;font-weight:700;color:#7A8FA6;min-width:90px;flex-shrink:0}
.preview-val{font-size:13px;color:#e8e4dc;font-weight:500}
.affect-session-info{padding:10px 14px;background:#e8e4dc;border-radius:9px;font-size:13.5px;color:#F5C518;font-weight:500}
/* MISC */
.loading-state{text-align:center;padding:60px;color:#7A8FA6}
.spinner{width:32px;height:32px;border:3px solid #c8c4bc;border-top-color:#3d6080;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px}
.spin-sm{width:12px;height:12px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-state{text-align:center;padding:60px;color:#8a9aaa;line-height:1.7;display:flex;flex-direction:column;align-items:center;gap:14px}
.empty-icon{font-size:48px}
.modal-fade-enter-active,.modal-fade-leave-active{transition:opacity .2s,transform .2s}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0;transform:scale(.97)}
</style>