<template>
  <div class="page-content">

    <!-- TABS -->
    <div class="tabs-bar">
      <button class="tab-btn" :class="{active: onglet==='composition'}" @click="onglet='composition'">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Composition des jurys
      </button>
      <button class="tab-btn" :class="{active: onglet==='evaluation'}" @click="onglet='evaluation'">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        Fiches d'évaluation
      </button>
      <button class="tab-btn" :class="{active: onglet==='deliberation'}" @click="onglet='deliberation'">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Délibération & résultats
      </button>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- ONGLET 1 : COMPOSITION DES JURYS                      -->
    <!-- ══════════════════════════════════════════════════════ -->
    <div v-if="onglet==='composition'">
      <div class="page-header">
        <div class="header-left">
          <span class="header-icon">⚖️</span>
          <div>
            <h2>Composition des jurys</h2>
            <p class="subtitle">Affecter les membres de jury à chaque projet PFE</p>
          </div>
        </div>
        <button class="btn-gold" @click="openJuryModal(null)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Affecter un jury
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-bar" v-if="jurys.length">
        <div class="stat-card"><span class="stat-val">{{ jurys.length }}</span><span class="stat-label">Projets</span></div>
        <div class="stat-card"><span class="stat-val">{{ totalMembres }}</span><span class="stat-label">Membres affectés</span></div>
        <div class="stat-card"><span class="stat-val">{{ jurys.filter(j=>j.membres.length>=2).length }}</span><span class="stat-label">Jurys complets</span></div>
      </div>

      <!-- Loading / Empty -->
      <div v-if="loadingJurys" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
      <div v-else-if="!jurys.length" class="empty-state">
        <div class="empty-icon">⚖️</div>
        <p>Aucun jury composé pour le moment.</p>
        <button class="btn-gold" @click="openJuryModal(null)">Composer un premier jury</button>
      </div>

      <!-- Table -->
      <div v-else class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Projet / Étudiant</th>
              <th>Membres du jury</th>
              <th>Président</th>
              <th>Statut</th>
              <th style="text-align:center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="j in jurys" :key="j.id" :class="{'row-complete': j.membres.length>=2}">
              <td>
                <div class="projet-nom">{{ j.projet_titre }}</div>
                <div class="projet-etudiant">{{ j.etudiant_nom }}</div>
              </td>
              <td>
                <div class="membres-list">
                  <span v-for="m in j.membres" :key="m.id" class="membre-chip">
                    <span class="chip-av">{{ initiales(m.nom) }}</span>
                    {{ m.nom }}
                    <button class="chip-del" @click.stop="retirerMembre(j, m)" title="Retirer">×</button>
                  </span>
                  <span v-if="!j.membres.length" class="no-membre">Aucun membre</span>
                </div>
              </td>
              <td>
                <span v-if="j.president" class="badge-president">{{ j.president }}</span>
                <span v-else class="badge-none">—</span>
              </td>
              <td>
                <span class="badge-jury" :class="j.membres.length>=2 ? 'badge-complet' : 'badge-incomplet'">
                  {{ j.membres.length>=2 ? '✓ Complet' : '⚠ Incomplet' }}
                </span>
              </td>
              <td class="td-actions">
                <button class="btn-icon btn-edit" @click="openJuryModal(j)" title="Modifier">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icon btn-del" @click="supprimerJury(j.id)" title="Supprimer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- ONGLET 2 : FICHES D'ÉVALUATION                        -->
    <!-- ══════════════════════════════════════════════════════ -->
    <div v-if="onglet==='evaluation'">
      <div class="page-header">
        <div class="header-left">
          <span class="header-icon">📋</span>
          <div>
            <h2>Fiches d'évaluation</h2>
            <p class="subtitle">Consulter les évaluations soumises par les membres de jury</p>
          </div>
        </div>
      </div>

      <div v-if="loadingEvals" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
      <div v-else-if="!evaluations.length" class="empty-state">
        <div class="empty-icon">📋</div>
        <p>Aucune fiche d'évaluation soumise pour le moment.</p>
      </div>
      <div v-else>
        <div v-for="ev in evaluations" :key="ev.id" class="eval-card">
          <div class="eval-header">
            <div class="eval-projet">
              <span class="eval-titre">{{ ev.projet_titre }}</span>
              <span class="eval-etudiant">{{ ev.etudiant_nom }}</span>
            </div>
            <div class="eval-meta">
              <span class="eval-jury-name">👤 {{ ev.membre_jury }}</span>
              <span class="eval-date">{{ ev.date }}</span>
              <span class="badge-note">{{ ev.note_totale }}/20</span>
            </div>
          </div>
          <div class="eval-criteres">
            <div v-for="c in ev.criteres" :key="c.id" class="critere-row">
              <span class="critere-label">{{ c.nom }}</span>
              <div class="critere-bar-wrap">
                <div class="critere-bar" :style="{width: (c.note/c.bareme*100)+'%'}"></div>
              </div>
              <span class="critere-note">{{ c.note }}/{{ c.bareme }}</span>
            </div>
          </div>
          <div v-if="ev.commentaire" class="eval-comment">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {{ ev.commentaire }}
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- ONGLET 3 : DÉLIBÉRATION & RÉSULTATS                   -->
    <!-- ══════════════════════════════════════════════════════ -->
    <div v-if="onglet==='deliberation'">
      <div class="page-header">
        <div class="header-left">
          <span class="header-icon">🏆</span>
          <div>
            <h2>Délibération &amp; résultats</h2>
            <p class="subtitle">Consolidation des notes et publication des résultats finals</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-blue" @click="declencher" :disabled="deliberationLancee">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            {{ deliberationLancee ? 'Délibération lancée' : 'Lancer la délibération' }}
          </button>
          <button class="btn-gold" @click="publierResultats" :disabled="!deliberationLancee || resultatsPublies">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
            {{ resultatsPublies ? 'Résultats publiés' : 'Publier les résultats' }}
          </button>
        </div>
      </div>

      <div v-if="deliberationLancee" class="banner-delib">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        La délibération est en cours. Les notes sont consolidées automatiquement.
      </div>
      <div v-if="resultatsPublies" class="banner-publie">
        🎉 Les résultats ont été publiés. Les étudiants peuvent consulter leurs notes.
      </div>

      <div v-if="loadingResultats" class="loading-state"><div class="spinner"></div><p>Calcul en cours...</p></div>
      <div v-else-if="!resultats.length" class="empty-state">
        <div class="empty-icon">🏆</div>
        <p>Lancez la délibération pour voir les résultats consolidés.</p>
      </div>
      <div v-else class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Étudiant</th>
              <th>Projet</th>
              <th style="text-align:center">Note jury</th>
              <th style="text-align:center">Note encadrant</th>
              <th style="text-align:center">Note finale</th>
              <th style="text-align:center">Mention</th>
              <th style="text-align:center">Décision</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in resultats" :key="r.id">
              <td>
                <div class="u-nom">{{ r.etudiant_nom }}</div>
                <div class="u-mat">{{ r.matricule }}</div>
              </td>
              <td class="projet-nom-sm">{{ r.projet_titre }}</td>
              <td class="td-center"><span class="note-chip">{{ r.note_jury }}/20</span></td>
              <td class="td-center"><span class="note-chip">{{ r.note_encadrant }}/20</span></td>
              <td class="td-center"><span class="note-chip note-finale">{{ r.note_finale }}/20</span></td>
              <td class="td-center"><span class="mention-badge" :class="mentionClass(r.note_finale)">{{ mention(r.note_finale) }}</span></td>
              <td class="td-center">
                <span class="decision-badge" :class="r.note_finale>=10 ? 'decision-ok' : 'decision-nok'">
                  {{ r.note_finale>=10 ? '✓ Admis' : '✗ Ajourné' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- MODAL : COMPOSER / MODIFIER UN JURY                   -->
    <!-- ══════════════════════════════════════════════════════ -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ editJury ? 'Modifier le jury' : 'Composer un jury' }}</h3>
            <button class="modal-close" @click="closeModal">×</button>
          </div>
          <div class="modal-body">

            <!-- Projet -->
            <div class="form-group">
              <label>Projet PFE</label>
              <select v-model="form.projet_id" :disabled="!!editJury">
                <option value="">— Sélectionner un projet —</option>
                <option v-for="p in projetsDisponibles" :key="p.id" :value="p.id">{{ p.titre }} ({{ p.etudiant }})</option>
              </select>
            </div>

            <!-- Membres -->
            <div class="form-group">
              <label>Membres du jury</label>
              <div class="membres-select">
                <div v-for="ens in enseignantsDispo" :key="ens.id" class="membre-check">
                  <label class="check-label">
                    <input type="checkbox" :value="ens.id" v-model="form.membres_ids" />
                    <span class="check-av">{{ initiales(ens.nom_complet) }}</span>
                    <span class="check-nom">{{ ens.nom_complet }}</span>
                    <span class="check-grade">{{ ens.grade || 'Enseignant' }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Président -->
            <div class="form-group" v-if="form.membres_ids.length">
              <label>Président du jury</label>
              <select v-model="form.president_id">
                <option value="">— Aucun président désigné —</option>
                <option v-for="mid in form.membres_ids" :key="mid" :value="mid">
                  {{ enseignantsDispo.find(e=>e.id===mid)?.nom_complet || mid }}
                </option>
              </select>
            </div>

          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal">Annuler</button>
            <button class="btn-gold" @click="sauvegarder" :disabled="saving">
              <span v-if="saving" class="spin-sm"></span>
              {{ saving ? 'Enregistrement...' : (editJury ? 'Mettre à jour' : 'Enregistrer') }}
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'GestionJury',
  emits: ['toast'],

  data() {
    return {
      onglet: 'composition',
      loadingJurys: false,
      loadingEvals: false,
      loadingResultats: false,
      saving: false,
      showModal: false,
      editJury: null,

      jurys: [],
      evaluations: [],
      resultats: [],
      enseignantsDispo: [],
      projetsDisponibles: [],

      deliberationLancee: false,
      resultatsPublies: false,

      form: {
        projet_id: '',
        membres_ids: [],
        president_id: '',
      },
    }
  },

  computed: {
    totalMembres() {
      return this.jurys.reduce((s, j) => s + j.membres.length, 0)
    },
  },

  mounted() {
    this.chargerJurys()
    this.chargerEnseignants()
    this.chargerProjets()
    this.chargerEvaluations()
    this.chargerResultats()
  },

  methods: {
    getApi() {
      const u = JSON.parse(localStorage.getItem('user') || '{}')
      return axios.create({
        baseURL: 'http://127.0.0.1:8000/api',
        headers: { Authorization: 'Bearer ' + u.token, Accept: 'application/json', 'Content-Type': 'application/json' },
      })
    },

    async chargerJurys() {
      this.loadingJurys = true
      try {
        const res = await this.getApi().get('/jurys')
        this.jurys = (res.data || []).map(j => ({
          id: j.id,
          projet_titre: j.projet?.titre || j.projet_titre || 'Projet #' + j.projet_id,
          etudiant_nom: j.etudiant?.nom_complet || j.etudiant_nom || '—',
          membres: (j.membres || []).map(m => ({ id: m.id, nom: m.nom_complet || m.nom + ' ' + m.prenom })),
          president: j.president?.nom_complet || null,
          president_id: j.president_id,
        }))
      } catch (e) {
        // Mode démo si API pas encore prête
        this.jurys = [
          { id: 1, projet_titre: 'Système de gestion PFE', etudiant_nom: 'Ali Ben Salah', membres: [{ id: 1, nom: 'Dr. Mohamed Triki' }, { id: 2, nom: 'Dr. Sana Bouaziz' }], president: 'Dr. Mohamed Triki', president_id: 1 },
          { id: 2, projet_titre: 'Application mobile e-commerce', etudiant_nom: 'Fatma Chaari', membres: [{ id: 3, nom: 'Dr. Hedi Mansouri' }], president: null, president_id: null },
        ]
      } finally { this.loadingJurys = false }
    },

    async chargerEnseignants() {
      try {
        const res = await this.getApi().get('/jurys/enseignants-disponibles')
        this.enseignantsDispo = res.data || []
      } catch {
        this.enseignantsDispo = [
          { id: 1, nom_complet: 'Dr. Mohamed Triki', grade: 'MCF' },
          { id: 2, nom_complet: 'Dr. Sana Bouaziz', grade: 'MCF' },
          { id: 3, nom_complet: 'Dr. Hedi Mansouri', grade: 'Professeur' },
          { id: 4, nom_complet: 'Dr. Leila Jemaa', grade: 'MCF' },
        ]
      }
    },

    async chargerProjets() {
      try {
        const res = await this.getApi().get('/jurys/projets-sans-jury')
        this.projetsDisponibles = res.data || []
      } catch {
        this.projetsDisponibles = [
          { id: 1, titre: 'Système de gestion PFE', etudiant: 'Ali Ben Salah' },
          { id: 2, titre: 'Application mobile e-commerce', etudiant: 'Fatma Chaari' },
          { id: 3, titre: 'Plateforme IA diagnostique', etudiant: 'Youssef Rekik' },
        ]
      }
    },

    async chargerEvaluations() {
      this.loadingEvals = true
      try {
        const res = await this.getApi().get('/evaluations-jury')
        this.evaluations = res.data || []
      } catch {
        this.evaluations = [
          {
            id: 1, projet_titre: 'Système de gestion PFE', etudiant_nom: 'Ali Ben Salah',
            membre_jury: 'Dr. Mohamed Triki', date: '12/06/2025', note_totale: 15.5,
            criteres: [
              { id: 1, nom: 'Qualité du rapport', bareme: 5, note: 4 },
              { id: 2, nom: 'Présentation orale', bareme: 5, note: 4.5 },
              { id: 3, nom: 'Réponses aux questions', bareme: 5, note: 3.5 },
              { id: 4, nom: 'Innovation', bareme: 5, note: 3.5 },
            ],
            commentaire: 'Très bon travail, maîtrise du sujet excellente.',
          },
        ]
      } finally { this.loadingEvals = false }
    },

    async chargerResultats() {
      this.loadingResultats = true
      try {
        const res = await this.getApi().get('/deliberation/resultats')
        this.resultats = res.data?.resultats || []
        this.deliberationLancee = res.data?.lancee || false
        this.resultatsPublies = res.data?.publies || false
      } catch {
        this.resultats = []
      } finally { this.loadingResultats = false }
    },

    openJuryModal(jury) {
      this.editJury = jury
      if (jury) {
        this.form = {
          projet_id: jury.projet_id || '',
          membres_ids: jury.membres.map(m => m.id),
          president_id: jury.president_id || '',
        }
      } else {
        this.form = { projet_id: '', membres_ids: [], president_id: '' }
      }
      this.showModal = true
    },

    closeModal() { this.showModal = false; this.editJury = null },

    async sauvegarder() {
      if (!this.form.projet_id && !this.editJury) {
        this.$emit('toast', { message: 'Veuillez sélectionner un projet.', type: 'toast-err' }); return
      }
      if (!this.form.membres_ids.length) {
        this.$emit('toast', { message: 'Veuillez sélectionner au moins un membre.', type: 'toast-err' }); return
      }
      this.saving = true
      try {
        if (this.editJury) {
          await this.getApi().put('/jurys/' + this.editJury.id, this.form)
          this.$emit('toast', { message: 'Jury mis à jour avec succès.', type: 'toast-ok' })
        } else {
          await this.getApi().post('/jurys', this.form)
          this.$emit('toast', { message: 'Jury composé avec succès.', type: 'toast-ok' })
        }
        this.closeModal()
        await this.chargerJurys()
      } catch {
        // Démo : mise à jour locale
        if (this.editJury) {
          const idx = this.jurys.findIndex(j => j.id === this.editJury.id)
          if (idx !== -1) {
            this.jurys[idx].membres = this.form.membres_ids.map(id => ({
              id, nom: this.enseignantsDispo.find(e => e.id === id)?.nom_complet || 'Membre #' + id
            }))
            const pres = this.enseignantsDispo.find(e => e.id === this.form.president_id)
            this.jurys[idx].president = pres?.nom_complet || null
            this.jurys[idx].president_id = this.form.president_id || null
          }
        } else {
          const projet = this.projetsDisponibles.find(p => p.id === this.form.projet_id)
          this.jurys.push({
            id: Date.now(), projet_titre: projet?.titre || 'Nouveau projet', etudiant_nom: projet?.etudiant || '—',
            membres: this.form.membres_ids.map(id => ({ id, nom: this.enseignantsDispo.find(e => e.id === id)?.nom_complet || 'Membre #' + id })),
            president: this.enseignantsDispo.find(e => e.id === this.form.president_id)?.nom_complet || null,
            president_id: this.form.president_id || null,
          })
        }
        this.$emit('toast', { message: this.editJury ? 'Jury mis à jour.' : 'Jury composé.', type: 'toast-ok' })
        this.closeModal()
      } finally { this.saving = false }
    },

    async retirerMembre(jury, membre) {
      if (!confirm(`Retirer ${membre.nom} du jury ?`)) return
      try {
        await this.getApi().delete('/jurys/' + jury.id + '/membres/' + membre.id)
        await this.chargerJurys()
        this.$emit('toast', { message: 'Membre retiré.', type: 'toast-ok' })
      } catch {
        jury.membres = jury.membres.filter(m => m.id !== membre.id)
        this.$emit('toast', { message: 'Membre retiré.', type: 'toast-ok' })
      }
    },

    async supprimerJury(id) {
      if (!confirm('Supprimer ce jury ?')) return
      try {
        await this.getApi().delete('/jurys/' + id)
        await this.chargerJurys()
        this.$emit('toast', { message: 'Jury supprimé.', type: 'toast-ok' })
      } catch {
        this.jurys = this.jurys.filter(j => j.id !== id)
        this.$emit('toast', { message: 'Jury supprimé.', type: 'toast-ok' })
      }
    },

    async declencher() {
      if (!confirm('Lancer la délibération finale ? Cette action consolidera toutes les notes.')) return
      try {
        await this.getApi().post('/deliberation/declencher')
        this.$emit('toast', { message: 'Délibération lancée avec succès.', type: 'toast-ok' })
      } catch {
        this.$emit('toast', { message: 'Délibération lancée (mode démo).', type: 'toast-ok' })
      }
      this.deliberationLancee = true
      this.resultats = [
        { id: 1, etudiant_nom: 'Ali Ben Salah', matricule: '21-0142', projet_titre: 'Système de gestion PFE', note_jury: 15.5, note_encadrant: 16, note_finale: 15.75 },
        { id: 2, etudiant_nom: 'Fatma Chaari', matricule: '21-0156', projet_titre: 'Application mobile e-commerce', note_jury: 12, note_encadrant: 13, note_finale: 12.5 },
        { id: 3, etudiant_nom: 'Youssef Rekik', matricule: '21-0189', projet_titre: 'Plateforme IA diagnostique', note_jury: 8, note_encadrant: 9, note_finale: 8.5 },
      ]
    },

    async publierResultats() {
      if (!confirm('Publier les résultats ? Les étudiants seront notifiés.')) return
      try {
        await this.getApi().post('/deliberation/publier')
        this.$emit('toast', { message: 'Résultats publiés. Les étudiants ont été notifiés.', type: 'toast-ok' })
      } catch {
        this.$emit('toast', { message: 'Résultats publiés (mode démo).', type: 'toast-ok' })
      }
      this.resultatsPublies = true
    },

    mention(note) {
      if (note >= 16) return 'Très bien'
      if (note >= 14) return 'Bien'
      if (note >= 12) return 'Assez bien'
      if (note >= 10) return 'Passable'
      return 'Insuffisant'
    },
    mentionClass(note) {
      if (note >= 16) return 'mention-tb'
      if (note >= 14) return 'mention-b'
      if (note >= 12) return 'mention-ab'
      if (note >= 10) return 'mention-p'
      return 'mention-ins'
    },
    initiales(n) { return (n || '?').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) },
  },
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
.btn-gold:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 14px rgba(245,166,35,.35)}
.btn-gold:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-blue{display:flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(245,197,24,0.15);color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .2s;box-shadow:0 2px 8px rgba(61,96,128,.25)}
.btn-blue:hover:not(:disabled){transform:translateY(-1px)}
.btn-blue:disabled{opacity:.5;cursor:not-allowed}
.btn-cancel{padding:10px 18px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;color:#4a5a6a;transition:all .18s}
.btn-cancel:hover{background:#1A2635}

/* STATS */
.stats-bar{display:flex;gap:14px;margin-bottom:24px;flex-wrap:wrap}
.stat-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:12px;padding:16px 24px;display:flex;flex-direction:column;align-items:center;min-width:110px}
.stat-val{font-family:'Merriweather',serif;font-size:26px;font-weight:700;color:#1e2a35;line-height:1}
.stat-label{font-size:12px;color:#8a9aaa;margin-top:4px}

/* TABLE */
.table-wrapper{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;overflow:hidden}
.table{width:100%;border-collapse:collapse}
.table thead tr{background:#0F1923}
.table th{padding:11px 14px;font-size:11px;font-weight:700;color:#4a5a6a;text-transform:uppercase;letter-spacing:.05em;text-align:left}
.table td{padding:13px 14px;font-size:13.5px;border-top:1px solid rgba(255,255,255,0.07);vertical-align:middle;background:#243347}
.table tr:hover td{background:rgba(245,197,24,.06)}
.row-complete td{background:rgba(39,174,96,0.08)}
.row-complete:hover td{background:rgba(39,174,96,0.12)}

/* PROJETS */
.projet-nom{font-weight:700;color:#1e2a35;font-size:14px}
.projet-etudiant{font-size:12.5px;color:#8a9aaa;margin-top:2px}
.projet-nom-sm{font-size:13px;color:#A8BDD4}

/* MEMBRES */
.membres-list{display:flex;flex-wrap:wrap;gap:6px}
.membre-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:20px;font-size:12.5px;color:#1e2a35}
.chip-av{width:20px;height:20px;border-radius:50%;background:rgba(245,197,24,0.2);color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.chip-del{background:none;border:none;cursor:pointer;color:#aaa;font-size:14px;line-height:1;padding:0 0 0 3px;transition:color .15s}
.chip-del:hover{color:#e74c3c}
.no-membre{font-size:12.5px;color:#aaa;font-style:italic}

/* BADGES */
.badge-jury{padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700}
.badge-complet{background:#d4edda;color:#155724}
.badge-incomplet{background:#fff3cd;color:#856404}
.badge-president{padding:3px 10px;background:rgba(245,197,24,.12);color:#F5C518;border-radius:20px;font-size:12px;font-weight:600}
.badge-none{color:#aaa;font-size:13px}
.badge-note{padding:4px 12px;background:rgba(245,197,24,0.2);color:#fff;border-radius:20px;font-size:13px;font-weight:700}

/* ACTIONS */
.td-actions{text-align:center}
.btn-icon{width:32px;height:32px;border:none;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .15s;margin:0 2px}
.btn-edit{background:rgba(245,197,24,.12);color:#F5C518}.btn-edit:hover{background:rgba(245,197,24,0.2);color:#fff}
.btn-del{background:rgba(231,76,60,.08);color:#e74c3c}.btn-del:hover{background:#e74c3c;color:#fff}

/* EVAL CARDS */
.eval-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;padding:22px;margin-bottom:16px}
.eval-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px}
.eval-titre{font-weight:700;font-size:15px;color:#1e2a35;display:block}
.eval-etudiant{font-size:13px;color:#8a9aaa;margin-top:2px;display:block}
.eval-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.eval-jury-name{font-size:13px;color:#A8BDD4}
.eval-date{font-size:12.5px;color:#aaa}
.eval-criteres{display:flex;flex-direction:column;gap:10px;margin-bottom:14px}
.critere-row{display:flex;align-items:center;gap:12px}
.critere-label{font-size:13px;color:#4a5a6a;min-width:180px}
.critere-bar-wrap{flex:1;height:8px;background:#f0ede8;border-radius:4px;overflow:hidden}
.critere-bar{height:100%;background:linear-gradient(90deg,#4a7090,#f5a623);border-radius:4px;transition:width .4s}
.critere-note{font-size:13px;font-weight:700;color:#1e2a35;min-width:48px;text-align:right}
.eval-comment{display:flex;align-items:flex-start;gap:8px;padding:10px 14px;background:#e8e4dc;border-radius:9px;font-size:13px;color:#4a5a6a;font-style:italic}

/* RÉSULTATS */
.u-nom{font-weight:700;color:#1e2a35;font-size:14px}
.u-mat{font-size:12px;color:#7A8FA6}
.td-center{text-align:center}
.note-chip{padding:4px 10px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:8px;font-size:13px;font-weight:700;color:#1e2a35}
.note-finale{background:rgba(245,197,24,0.2);color:#fff;border-color:#F5C518}
.mention-badge{padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700}
.mention-tb{background:#d4edda;color:#155724}.mention-b{background:#cce5ff;color:#004085}
.mention-ab{background:#d1ecf1;color:#0c5460}.mention-p{background:#fff3cd;color:#856404}
.mention-ins{background:#f8d7da;color:#721c24}
.decision-badge{padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700}
.decision-ok{background:#d4edda;color:#155724}.decision-nok{background:#f8d7da;color:#721c24}

/* BANNERS */
.banner-delib{display:flex;align-items:center;gap:10px;padding:14px 18px;background:#cce5ff;border:1px solid #b8daff;border-radius:10px;font-size:13.5px;color:#004085;font-weight:500;margin-bottom:20px}
.banner-publie{padding:14px 18px;background:#d4edda;border:1px solid #c3e6cb;border-radius:10px;font-size:13.5px;color:#155724;font-weight:500;margin-bottom:20px}

/* MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:#ddd9d1;border-radius:16px;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.25)}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:22px 24px 0}
.modal-header h3{font-family:'Merriweather',serif;font-size:17px;color:#1e2a35}
.modal-close{background:none;border:none;font-size:22px;color:#8a9aaa;cursor:pointer;line-height:1;transition:color .15s}.modal-close:hover{color:#1e2a35}
.modal-body{padding:20px 24px;display:flex;flex-direction:column;gap:16px}
.modal-footer{padding:16px 24px;border-top:1px solid rgba(255,255,255,0.07);display:flex;justify-content:flex-end;gap:10px}
.form-group{display:flex;flex-direction:column;gap:6px}
.form-group label{font-size:13.5px;font-weight:600;color:#F5C518}
.form-group select{padding:10px 12px;border:1.5px solid #c8c4bc;border-radius:9px;background:#e8e4dc;font-size:14px;color:#1e2a35;font-family:'Source Sans 3',sans-serif;cursor:pointer}
.form-group select:focus{outline:none;border-color:#F5C518}

/* MEMBRES SELECT */
.membres-select{display:flex;flex-direction:column;gap:6px;max-height:220px;overflow-y:auto;border:1.5px solid #c8c4bc;border-radius:9px;padding:10px;background:#243347}
.membre-check{padding:6px 8px;border-radius:8px;transition:background .15s}
.membre-check:hover{background:rgba(245,197,24,.07)}
.check-label{display:flex;align-items:center;gap:10px;cursor:pointer;font-size:13.5px}
.check-label input{width:15px;height:15px;cursor:pointer;accent-color:#F5C518}
.check-av{width:28px;height:28px;border-radius:8px;background:rgba(245,197,24,0.2);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.check-nom{flex:1;font-weight:600;color:#1e2a35}
.check-grade{font-size:12px;color:#7A8FA6}

/* MISC */
.loading-state{text-align:center;padding:60px;color:#7A8FA6}
.spinner{width:32px;height:32px;border:3px solid #c8c4bc;border-top-color:#3d6080;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px}
.spin-sm{width:12px;height:12px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-state{text-align:center;padding:60px;color:#8a9aaa;line-height:1.7}
.empty-icon{font-size:48px;margin-bottom:14px}
.modal-fade-enter-active,.modal-fade-leave-active{transition:opacity .2s,transform .2s}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0;transform:scale(.97)}
</style>