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
          Nouvelle session
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
                <input type="date" v-model="form.date" />
              </div>
              <div class="form-group">
                <label>Salle *</label>
                <input type="text" v-model="form.salle" placeholder="ex: Salle A101" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Heure début *</label>
                <input type="time" v-model="form.heure_debut" />
              </div>
              <div class="form-group">
                <label>Heure fin *</label>
                <input type="time" v-model="form.heure_fin" />
              </div>
            </div>

            <div class="form-group">
              <label>Projet PFE (optionnel)</label>
              <select v-model="form.projet_id">
                <option value="">— Aucun projet affecté —</option>
                <option v-for="p in projetsDisponibles" :key="p.id" :value="p.id">{{ p.titre }} – {{ p.etudiant }}</option>
              </select>
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
import axios from 'axios'

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

      form: {
        date: '',
        salle: '',
        heure_debut: '',
        heure_fin: '',
        projet_id: '',
      },
    }
  },

  computed: {
    sallesUniques() {
      return new Set(this.sessions.map(s => s.salle).filter(Boolean)).size
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
  },

  methods: {
    getApi() {
      const u = JSON.parse(localStorage.getItem('user') || '{}')
      return axios.create({
        baseURL: 'http://127.0.0.1:8000/api',
        headers: { Authorization: 'Bearer ' + u.token, Accept: 'application/json', 'Content-Type': 'application/json' },
      })
    },

    async chargerSessions() {
      this.loadingSessions = true
      try {
        const res = await this.getApi().get('/soutenances')
        this.sessions = (res.data || []).map(s => this.mapSession(s))
        this.detecterConflits()
      } catch {
        this.sessions = [
          { id: 1, date: '2025-06-15', heure_debut: '09:00', heure_fin: '10:00', salle: 'Salle A101', projet: 'Système de gestion PFE', etudiant: 'Ali Ben Salah', jury_membres: ['Dr. Triki', 'Dr. Bouaziz'], conflit: false },
          { id: 2, date: '2025-06-15', heure_debut: '10:00', heure_fin: '11:00', salle: 'Salle A102', projet: 'Application mobile e-commerce', etudiant: 'Fatma Chaari', jury_membres: ['Dr. Mansouri', 'Dr. Jemaa'], conflit: false },
          { id: 3, date: '2025-06-16', heure_debut: '09:00', heure_fin: '10:00', salle: 'Salle B201', projet: null, etudiant: null, jury_membres: [], conflit: false },
        ]
      } finally { this.loadingSessions = false }
    },

    mapSession(s) {
      return {
        id: s.id, date: s.date, heure_debut: s.heure_debut, heure_fin: s.heure_fin, salle: s.salle,
        projet: s.projet?.titre || s.projet_titre || null, etudiant: s.etudiant?.nom_complet || s.etudiant_nom || null,
        jury_membres: (s.jury_membres || []).map(m => m.nom_complet || m.nom || m), conflit: s.conflit || false,
      }
    },

    async chargerProjets() {
      try {
        const res = await this.getApi().get('/soutenances/projets-disponibles')
        this.projetsDisponibles = res.data || []
      } catch {
        this.projetsDisponibles = [
          { id: 1, titre: 'Système de gestion PFE', etudiant: 'Ali Ben Salah' },
          { id: 2, titre: 'Application mobile e-commerce', etudiant: 'Fatma Chaari' },
          { id: 3, titre: 'Plateforme IA diagnostique', etudiant: 'Youssef Rekik' },
          { id: 4, titre: 'Système de surveillance IoT', etudiant: 'Mariem Zouari' },
        ]
      }
    },

    async chargerPlans() {
      try {
        const res = await this.getApi().get('/soutenances/plans-proposes')
        this.plans = res.data || []
      } catch {
        this.plans = [
          {
            id: 1, membre_jury: 'Dr. Mohamed Triki', date_proposition: '10/05/2025', statut: 'En attente',
            sessions: [
              { date: '15/06/2025', heure: '09:00', salle: 'A101', projet: 'Système de gestion PFE' },
              { date: '15/06/2025', heure: '11:00', salle: 'A101', projet: 'Application mobile e-commerce' },
            ],
          },
        ]
      }
    },

    detecterConflits() {
      this.conflits = []
      const parCreneau = {}
      this.sessions.forEach(s => {
        const key = s.date + '_' + s.heure_debut + '_' + s.salle
        if (parCreneau[key]) {
          this.conflits.push({ id: s.id, message: `Salle ${s.salle} double-réservée le ${s.date} à ${s.heure_debut}` })
          s.conflit = true
        } else { parCreneau[key] = s }
      })
    },

    openModal(session) {
      this.editSession = session
      if (session) {
        this.form = { date: session.date, salle: session.salle, heure_debut: session.heure_debut, heure_fin: session.heure_fin, projet_id: '' }
      } else {
        this.form = { date: '', salle: '', heure_debut: '', heure_fin: '', projet_id: '' }
      }
      this.conflitDetecte = false
      this.showModal = true
    },

    closeModal() { this.showModal = false; this.editSession = null },

    async sauvegarder() {
      if (!this.form.date || !this.form.salle || !this.form.heure_debut || !this.form.heure_fin) {
        this.$emit('toast', { message: 'Veuillez remplir tous les champs obligatoires.', type: 'toast-err' }); return
      }
      this.saving = true
      try {
        if (this.editSession) {
          await this.getApi().put('/soutenances/' + this.editSession.id, this.form)
          this.$emit('toast', { message: 'Session mise à jour.', type: 'toast-ok' })
        } else {
          await this.getApi().post('/soutenances', this.form)
          this.$emit('toast', { message: 'Session créée avec succès.', type: 'toast-ok' })
        }
        this.closeModal()
        await this.chargerSessions()
      } catch {
        const projet = this.projetsDisponibles.find(p => p.id === this.form.projet_id)
        if (this.editSession) {
          const idx = this.sessions.findIndex(s => s.id === this.editSession.id)
          if (idx !== -1) Object.assign(this.sessions[idx], { ...this.form, projet: projet?.titre || this.sessions[idx].projet, etudiant: projet?.etudiant || this.sessions[idx].etudiant })
        } else {
          this.sessions.push({
            id: Date.now(), ...this.form, projet: projet?.titre || null, etudiant: projet?.etudiant || null, jury_membres: [], conflit: false,
          })
        }
        this.detecterConflits()
        this.$emit('toast', { message: this.editSession ? 'Session mise à jour.' : 'Session créée.', type: 'toast-ok' })
        this.closeModal()
      } finally { this.saving = false }
    },

    openAffectation(session) { this.affectSession = session; this.affectProjetId = ''; this.showAffectModal = true },

    async confirmerAffectation() {
      if (!this.affectProjetId) { this.$emit('toast', { message: 'Sélectionnez un projet.', type: 'toast-err' }); return }
      try {
        await this.getApi().put('/soutenances/' + this.affectSession.id + '/affecter', { projet_id: this.affectProjetId })
        await this.chargerSessions()
        this.$emit('toast', { message: 'Projet affecté à la session.', type: 'toast-ok' })
      } catch {
        const projet = this.projetsDisponibles.find(p => p.id === this.affectProjetId)
        const idx = this.sessions.findIndex(s => s.id === this.affectSession.id)
        if (idx !== -1) { this.sessions[idx].projet = projet?.titre || '—'; this.sessions[idx].etudiant = projet?.etudiant || '—' }
        this.$emit('toast', { message: 'Projet affecté (mode démo).', type: 'toast-ok' })
      }
      this.showAffectModal = false
    },

    async supprimer(id) {
      if (!confirm('Supprimer cette session de soutenance ?')) return
      try {
        await this.getApi().delete('/soutenances/' + id)
        await this.chargerSessions()
        this.$emit('toast', { message: 'Session supprimée.', type: 'toast-ok' })
      } catch {
        this.sessions = this.sessions.filter(s => s.id !== id)
        this.detecterConflits()
        this.$emit('toast', { message: 'Session supprimée.', type: 'toast-ok' })
      }
    },

    async publierCalendrier() {
      if (!confirm('Publier le calendrier des soutenances ? Tous les participants seront notifiés.')) return
      try {
        await this.getApi().post('/soutenances/publier-calendrier')
        this.$emit('toast', { message: 'Calendrier publié. Tous les participants ont été notifiés.', type: 'toast-ok' })
      } catch {
        this.$emit('toast', { message: 'Calendrier publié (mode démo).', type: 'toast-ok' })
      }
      this.calendrierPublie = true
    },

    async validerPlan(plan) {
      try {
        await this.getApi().put('/soutenances/plans/' + plan.id + '/valider')
      } catch {}
      plan.statut = 'validé'
      this.$emit('toast', { message: 'Plan validé avec succès.', type: 'toast-ok' })
    },

    async rejeterPlan(plan) {
      try {
        await this.getApi().put('/soutenances/plans/' + plan.id + '/rejeter')
      } catch {}
      plan.statut = 'rejeté'
      this.$emit('toast', { message: 'Plan rejeté.', type: 'toast-ok' })
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
      try { return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }
      catch { return d }
    },
  },
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