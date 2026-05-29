<template>
  <div>

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div>
        <h2 class="vld-page-title">Mes livrables</h2>
        <p class="sec-subtitle">Déposez vos documents — seules les phases activées par le chef sont accessibles</p>
      </div>
      <div class="kpi-strip">
        <div class="kpi-badge kpi-badge--ok">
          <strong>{{ nValides }}</strong><span>Validé(s)</span>
        </div>
        <div class="kpi-badge kpi-badge--warn">
          <strong>{{ nAttente }}</strong><span>En attente</span>
        </div>
        <div class="kpi-badge kpi-badge--ko">
          <strong>{{ nRejetes }}</strong><span>Rejeté(s)</span>
        </div>
      </div>
    </div>

    <!-- TOAST -->
    <Transition name="toast">
      <div v-if="toast.show" class="vld-toast-wrap">
        <div class="sec-toast" :class="toast.type === 'ok' ? 'sec-toast--ok' : 'sec-toast--err'">
          {{ toast.msg }}
          <button class="sec-toast__x" @click="toast.show = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- LOADING -->
    <div v-if="loading" class="vld-state">
      <div class="vld-spinner mx-auto mb-3"></div>
      <p>Chargement des données...</p>
    </div>

    <!-- MAIN CONTENT -->
    <template v-else>
      <div class="lv-layout">

        <!-- LEFT col: Sujet -->
        <div class="lv-sujet-col">
          <div class="lv-sec-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Sujet de projet
          </div>

          <!-- Mode manuel -->
          <div v-if="isManuel" class="sujet-card sujet-card--ok">
            <div class="sujet-card__top">
              <span class="sujet-card__label">Phase 0</span>
              <span class="sujet-card__badge sujet-card__badge--ok">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                Accord mutuel
              </span>
            </div>
            <div v-if="projet && projet.titre">
              <div class="sujet-card__title">{{ projet.titre }}</div>
              <div class="sujet-card__desc">{{ projet.description }}</div>
            </div>
            <div v-else class="sujet-card__hint">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Sujet issu de votre demande d'encadrement — pré-rempli automatiquement.
            </div>
          </div>

          <!-- Validated -->
          <div v-else-if="projet && projet.valide" class="sujet-card sujet-card--ok">
            <div class="sujet-card__top">
              <span class="sujet-card__label">Phase 0</span>
              <span class="sujet-card__badge sujet-card__badge--ok">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                Validé
              </span>
            </div>
            <div class="sujet-card__title">{{ projet.titre }}</div>
            <div class="sujet-card__desc">{{ projet.description }}</div>
          </div>

          <!-- Pending -->
          <div v-else-if="projet && !projet.valide && !sujetFormOpen" class="sujet-card sujet-card--pending">
            <div class="sujet-card__top">
              <span class="sujet-card__label">Phase 0</span>
              <span class="sujet-card__badge sujet-card__badge--pending">En attente</span>
            </div>
            <div class="sujet-card__title">{{ projet.titre }}</div>
            <div class="sujet-card__desc">{{ projet.description }}</div>
            <button class="btn-sujet-edit" @click="openSujetForm">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier
            </button>
          </div>

          <!-- Form -->
          <div v-else class="sujet-card">
            <div class="sujet-card__top">
              <span class="sujet-card__label">Phase 0</span>
              <span class="sujet-card__badge sujet-card__badge--todo">{{ sujetFormOpen ? 'Modification' : 'À compléter' }}</span>
            </div>
            <div v-if="affectation && affectation.mode === 'semi'" class="sujet-card__hint">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Proposez votre sujet — il sera validé par votre encadrant.
            </div>
            <div class="sujet-form">
              <label class="sujet-form__label">Titre <span class="sujet-form__required">*</span></label>
              <input v-model="sujetForm.titre" class="sujet-form__input" placeholder="Titre du projet..." />
              <label class="sujet-form__label">Description <span class="sujet-form__required">*</span></label>
              <textarea v-model="sujetForm.description" class="sujet-form__textarea" rows="3" placeholder="Objectifs, méthodologie, livrables..."></textarea>
              <div class="sujet-form__actions">
                <button v-if="sujetFormOpen" class="btn-sujet-cancel" @click="sujetFormOpen = false">Annuler</button>
                <button class="btn-sujet-confirm" :disabled="sujetSaving" @click="soumettreProjet">
                  <svg v-if="!sujetSaving" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <div v-else class="spinner-sm"></div>
                  {{ projet ? 'Enregistrer' : 'Confirmer' }}
                </button>
              </div>
            </div>
          </div>

          <!-- ─── LIVRABLE HISTORY PANEL ─── -->
          <div style="margin-top: 18px;">
            <div class="lv-sec-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.85"/></svg>
              Historique des dépôts
            </div>

            <div v-if="!histLivrables.length" class="lv-hist-empty">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p>Aucun livrable déposé pour l'instant.</p>
            </div>

            <div v-else class="lv-hist-list">
              <div
                v-for="entry in histLivrables" :key="entry.id"
                class="lv-hist-row"
                :class="{
                  'lv-hist-row--ok':   entry.statut === 'valide',
                  'lv-hist-row--ko':   entry.statut === 'rejete',
                  'lv-hist-row--wait': entry.statut === 'en_attente',
                }">
                <!-- Status stripe -->
                <div class="lv-hist-stripe"></div>

                <div class="lv-hist-body">
                  <div class="lv-hist-top">
                    <span class="lv-hist-phase">{{ entry.phase_nom }}</span>
                    <span class="lv-hist-version" v-if="entry.version > 1">v{{ entry.version }}</span>
                    <span class="lv-status lv-hist-badge"
                      :class="{
                        'lv-status--ok':   entry.statut === 'valide',
                        'lv-status--ko':   entry.statut === 'rejete',
                        'lv-status--wait': entry.statut === 'en_attente',
                      }">
                      {{ { en_attente: 'En attente', valide: 'Validé', rejete: 'Rejeté' }[entry.statut] || entry.statut }}
                    </span>
                  </div>
                  <div class="lv-hist-file">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    {{ entry.fileName }}
                  </div>
                  <div class="lv-hist-meta">
                    <span>Déposé le {{ entry.dateDepot }}</span>
                    <span v-if="entry.dateRemplacement" class="lv-hist-replaced">
                      · Remplacé le {{ entry.dateRemplacement }}
                    </span>
                  </div>
                  <div v-if="entry.commentaire" class="lv-hist-comment">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {{ entry.commentaire }}
                  </div>
                </div>

                <a v-if="entry.fichier_url" :href="entry.fichier_url" target="_blank" class="lv-hist-open" title="Ouvrir le fichier">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT col: Phases -->
        <div class="lv-phases-col">
          <div class="lv-sec-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Livrables par phase
          </div>

          <div v-if="!phases.length" class="vld-state">
            <div class="vld-state__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <p class="vld-state__title">Aucune phase activée pour le moment</p>
            <p class="vld-state__sub">Vous serez notifié(e) dès qu'une phase sera ouverte.</p>
          </div>

          <div v-else class="phases-grid">
            <div
              v-for="phase in phases" :key="phase.id"
              class="phase-card"
              :class="{ 'phase-card--active': phase.active && !phase.terminee, 'phase-card--done': phase.terminee }">

              <div class="pc-bar"></div>
              <div class="pc-top">
                <span class="pc-num">Phase {{ phase.ordre }}</span>
                <span class="pc-badge"
                  :class="phase.terminee ? 'pc-badge--done' : phase.active ? 'pc-badge--active' : ''">
                  {{ phase.terminee ? 'Terminée' : phase.active ? 'En cours' : 'Inactive' }}
                </span>
              </div>
              <div class="pc-nom">{{ phase.nom }}</div>
              <div class="pc-dates">{{ phase.dateDebut }} — {{ phase.dateFin }}</div>

              <div v-if="!phase.livrableObligatoire" class="pc-no-lv">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Aucun livrable requis
              </div>

              <template v-if="phase.livrableObligatoire">

                <!-- Has livrable -->
                <div v-if="phase.livrable" class="lv-area">
                  <div class="lv-file">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <div class="lv-info">
                      <div class="lv-nom">{{ phase.livrable.fileName }}</div>
                      <div class="lv-date">
                        Déposé le {{ phase.livrable.dateDepot }}
                        <span v-if="phase.livrable.version > 1" class="lv-version-chip">v{{ phase.livrable.version }}</span>
                      </div>
                    </div>
                  </div>
                  <span class="lv-status"
                    :class="{
                      'lv-status--wait': phase.livrable.statut === 'en_attente',
                      'lv-status--ok':   phase.livrable.statut === 'valide',
                      'lv-status--ko':   phase.livrable.statut === 'rejete',
                    }">
                    {{ { en_attente: 'En attente', valide: 'Validé', rejete: 'Rejeté' }[phase.livrable.statut] || phase.livrable.statut }}
                  </span>
                  <div v-if="phase.livrable.statut === 'rejete' && phase.livrable.commentaire" class="lv-comment">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {{ phase.livrable.commentaire }}
                  </div>
                  <!-- Replace: uses PUT to update same record → encadrant sees new file instantly -->
                  <label
                    v-if="phase.livrable.statut !== 'valide' && !phase.terminee"
                    :for="'f' + phase.id"
                    class="btn-lv-replace">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Remplacer
                  </label>
                  <button
                    v-if="phase.livrable.statut === 'en_attente' && !phase.livrable.verrouille && !phase.terminee"
                    class="btn-lv-remove"
                    @click="retirerLivrable(phase)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    Retirer
                  </button>
                  <!-- replace input: calls uploadReplace which PUTs -->
                  <input type="file" :id="'f' + phase.id" accept="application/pdf" @change="uploadReplace($event, phase)" style="display:none" />
                </div>

                <!-- Upload zone (no livrable yet) -->
                <div v-else class="depot-area">
                  <label v-if="!phase.terminee" :for="'fnew' + phase.id" class="btn-depot">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Déposer un livrable PDF
                  </label>
                  <div v-else class="lv-missed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Phase terminée sans livrable
                  </div>
                  <input type="file" :id="'fnew' + phase.id" accept="application/pdf" @change="upload($event, phase)" style="display:none" />
                </div>

              </template>

              <div v-if="phase.terminee" class="pc-done-bar">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Phase complète
              </div>
            </div>
          </div>

        </div>
      </div>
    </template>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'LivrablesEtudiant',
  data() {
    return {
      toast:         { show: false, msg: '', type: 'ok' },
      phases:        [],
      histLivrables: [],   // flat list of all livrable records (current + historical)
      loading:       false,
      affectation:   null,
      projet:        null,
      sujetFormOpen: false,
      sujetSaving:   false,
      sujetForm:     { titre: '', description: '' },
    }
  },
  computed: {
    nValides()  { return this.phases.filter(p => p.livrable?.statut === 'valide').length },
    nAttente()  { return this.phases.filter(p => p.livrable?.statut === 'en_attente').length },
    nRejetes()  { return this.phases.filter(p => p.livrable?.statut === 'rejete').length },
    isManuel()  { return this.affectation?.mode === 'manuel' },
  },
  mounted() { this.chargerDonnees() },
  methods: {
    async chargerDonnees() {
      this.loading = true
      try {
        const [resPhases, resLivrables, resAff, resProjet, resHist] = await Promise.all([
          api.get('/phases'),
          api.get('/livrables').catch(() => ({ data: [] })),
          api.get('/affectations/mon-affectation').catch(() => ({ data: null })),
          api.get('/projets/mon-projet').catch(() => ({ data: null })),
          // history endpoint returns all versions including replaced ones
          api.get('/livrables/historique').catch(() => ({ data: [] })),
        ])

        this.affectation = resAff.data || null
        const p = resProjet.data
        this.projet = (p && p.id) ? p : null
        if (this.projet) {
          this.sujetForm.titre       = this.projet.titre       || ''
          this.sujetForm.description = this.projet.description || ''
        }

        // Build phase livrable map (current active livrable per phase)
        const livrablesMap = {}
        ;(resLivrables.data || []).forEach(l => {
          livrablesMap[l.phase_id] = {
            id:          l.id,
            fileName:    l.file_name || (l.fichier ? l.fichier.split('/').pop() : 'fichier.pdf'),
            fichier_url: l.fichier_url || null,
            dateDepot:   this.formatDate(l.depose_le),
            statut:      l.statut,
            commentaire: l.commentaire ?? null,
            verrouille:  l.verrouille ?? false,
            version:     l.version ?? 1,
          }
        })

        this.phases = (resPhases.data || [])
          .filter(p => p.type !== 'sujet')
          .map(p => ({
            id:                  p.id,
            ordre:               p.ordre,
            nom:                 p.nom,
            dateDebut:           this.formatDate(p.date_debut),
            dateFin:             this.formatDate(p.date_fin),
            active:              !!p.active,
            terminee:            !!p.terminee,
            livrableObligatoire: !!p.livrable_obligatoire,
            livrable:            livrablesMap[p.id] || null,
          }))

        // Build history list: all livrable records sorted newest first
        // Fallback: if no dedicated endpoint, build from current livrables
        const histRaw = resHist.data?.length
          ? resHist.data
          : resLivrables.data || []

        // Build a phase name lookup from phases
        const phaseNames = {}
        this.phases.forEach(ph => { phaseNames[ph.id] = ph.nom })

        this.histLivrables = histRaw
          .map(l => ({
            id:                l.id,
            phase_id:          l.phase_id,
            phase_nom:         l.phase_nom || phaseNames[l.phase_id] || `Phase ${l.phase_id}`,
            fileName:          l.file_name || (l.fichier ? l.fichier.split('/').pop() : 'fichier.pdf'),
            fichier_url:       l.fichier_url || null,
            dateDepot:         this.formatDate(l.depose_le),
            dateRemplacement:  l.remplace_le ? this.formatDate(l.remplace_le) : null,
            statut:            l.statut,
            commentaire:       l.commentaire ?? null,
            version:           l.version ?? 1,
          }))
          .sort((a, b) => new Date(b.dateDepot) - new Date(a.dateDepot))

      } catch (error) {
        console.error('Erreur livrables:', error)
        this.showToast('Erreur de chargement', 'err')
      } finally {
        this.loading = false
      }
    },

    openSujetForm() {
      if (this.projet) {
        this.sujetForm.titre       = this.projet.titre       || ''
        this.sujetForm.description = this.projet.description || ''
      }
      this.sujetFormOpen = true
    },

    async soumettreProjet() {
      if (!this.sujetForm.titre.trim() || !this.sujetForm.description.trim()) {
        this.showToast('Veuillez remplir le titre et la description.', 'err'); return
      }
      this.sujetSaving = true
      try {
        if (this.projet && this.projet.id) {
          const res = await api.put(`/projets/${this.projet.id}`, { titre: this.sujetForm.titre, description: this.sujetForm.description })
          this.projet = res.data
          this.showToast('Sujet mis à jour ✓')
        } else {
          const res = await api.post('/projets', { titre: this.sujetForm.titre, description: this.sujetForm.description })
          this.projet = res.data
          this.showToast('Sujet soumis — en attente de validation ✓')
        }
        this.sujetFormOpen = false
      } catch (error) {
        this.showToast(error.response?.data?.message || 'Erreur lors de la soumission', 'err')
      } finally {
        this.sujetSaving = false
      }
    },

    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      if (isNaN(d)) return date
      return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
    },

    async retirerLivrable(phase) {
      if (!confirm('Retirer ce livrable ?')) return
      try {
        await api.delete(`/livrables/${phase.livrable.id}`)
        await this.chargerDonnees()
        this.showToast('Livrable retiré ✓')
      } catch (error) {
        this.showToast(error.response?.data?.message || 'Impossible de retirer le livrable', 'err')
      }
    },

    // ── First upload (POST) ───────────────────────────────────────────────────
    async upload(e, phase) {
      const file = e.target.files[0]
      if (!file || file.type !== 'application/pdf') { this.showToast('Fichier PDF uniquement', 'err'); return }
      const formData = new FormData()
      formData.append('phase_id', phase.id)
      formData.append('fichier', file)
      try {
        await api.post('/livrables', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        await this.chargerDonnees()
        this.showToast(`Livrable déposé pour "${phase.nom}" ✓`)
      } catch (error) {
        this.showToast(error.response?.data?.message || 'Erreur lors du dépôt', 'err')
      }
      e.target.value = ''
    },

    // ── Replacement upload (PUT) — updates the existing record so the
    //    encadrant always sees the latest file without needing a refresh ────────
    async uploadReplace(e, phase) {
      const file = e.target.files[0]
      if (!file || file.type !== 'application/pdf') { this.showToast('Fichier PDF uniquement', 'err'); return }
      const formData = new FormData()
      formData.append('phase_id', phase.id)
      formData.append('fichier', file)
      // PUT to the existing livrable id → backend replaces the file in-place,
      // resets statut to 'en_attente', increments version, records remplace_le
      try {
        await api.put(
          `/livrables/${phase.livrable.id}/replace`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        await this.chargerDonnees()
        this.showToast(`Livrable remplacé pour "${phase.nom}" ✓`)
      } catch (error) {
        // Fallback: some backends expose the replace via the same POST endpoint
        // with a replace flag — try that before giving up
        try {
          const fd2 = new FormData()
          fd2.append('phase_id', phase.id)
          fd2.append('fichier', file)
          fd2.append('replace_id', phase.livrable.id)
          await api.post('/livrables', fd2, { headers: { 'Content-Type': 'multipart/form-data' } })
          await this.chargerDonnees()
          this.showToast(`Livrable remplacé pour "${phase.nom}" ✓`)
        } catch (err2) {
          this.showToast(err2.response?.data?.message || 'Erreur lors du remplacement', 'err')
        }
      }
      e.target.value = ''
    },

    showToast(msg, type = 'ok') {
      this.toast = { show: true, msg, type }
      setTimeout(() => (this.toast.show = false), 3200)
    },
  },
}
</script>