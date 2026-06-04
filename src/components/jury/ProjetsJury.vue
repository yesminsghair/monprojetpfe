<template>
  <div class="pj-root">

    <!-- Page header -->
    <div class="pj-page-header mb-5">
      <h2 class="pj-page-title">Mes projets jury</h2>
      <p class="pj-page-sub">Évaluez vos projets en tant que président de jury</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="vld-state">
      <div class="vld-spinner mx-auto mb-3"></div>
      <p>Chargement...</p>
    </div>

    <template v-else>

      <!-- ══════════════════════════════════════════════════════════
           SECTION : ÉVALUATION (Président uniquement)
      ═══════════════════════════════════════════════════════════ -->
      <div class="pj-section mb-5">
        <div class="pj-section-header pj-section-header--eval mb-3">
          <div class="pj-section-header__icon pj-section-header__icon--eval">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <span>Évaluation — Président</span>
          <span class="pj-count">{{ projetsEval.length }}</span>
        </div>

        <div v-if="!projetsEval.length" class="pj-empty">
          <div class="pj-empty__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <p>Aucun projet à évaluer en tant que président.</p>
        </div>

        <div v-else class="pj-card-grid">
          <div
            v-for="p in projetsEval" :key="'eval-' + p.id"
            class="pj-card pj-card--eval"
            :class="{ 'pj-card--done': p.evalue, 'pj-card--locked': !p.peutEvaluer }"
          >
            <div class="pj-card__top">
              <span class="pj-badge pj-badge--president">Président</span>
              <span class="pj-status" :class="statusClass(p)">
                {{ statusLabel(p) }}
              </span>
            </div>

            <div class="pj-card__title">{{ p.titre }}</div>

            <div class="pj-card__meta">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {{ p.etudiant_nom }}
            </div>
            <div class="pj-card__meta">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Encadrant : {{ p.encadrant }}
            </div>
            <div v-if="p.date_soutenance" class="pj-card__meta">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {{ p.date_soutenance }}<span v-if="p.heure_debut"> à {{ p.heure_debut }}</span><span v-if="p.salle"> · {{ p.salle }}</span>
            </div>

            <!-- ── Résultat de l'évaluation (si déjà évalué) ── -->
            <div v-if="p.evalue && p.note_finale !== null" class="pj-eval-result">
              <div class="pj-eval-result__note">
                <span class="pj-eval-result__label">Note soumise</span>
                <span
                  class="pj-eval-result__val"
                  :class="p.note_finale >= 14 ? 'pj-note--high' : p.note_finale >= 10 ? 'pj-note--mid' : 'pj-note--low'"
                >{{ parseFloat(p.note_finale).toFixed(2) }}<small> / 20</small></span>
              </div>
              <div v-if="p.commentaire" class="pj-eval-result__comment">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>{{ p.commentaire }}</span>
              </div>
            </div>

            <!-- Lock notice when soutenance not started yet -->
            <div v-if="!p.peutEvaluer" class="pj-lock-notice">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span v-if="!p.publie">Composition du jury non encore publiée</span>
              <span v-else-if="p.statut !== 'publie'">Soutenance non encore publiée</span>
              <span v-else>Disponible après la fin de la soutenance</span>
            </div>

            <div class="pj-card__actions">
              <button class="pj-btn pj-btn--livrable" @click="ouvrirLivrable(p)">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Livrable final
              </button>
              <button class="pj-btn pj-btn--dl" @click="telechargerLivrable(p)" :disabled="p._downloading" :title="'Télécharger le livrable de ' + p.etudiant_nom">
                <svg v-if="!p._downloading" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span v-else class="vld-spinner-sm" style="border-color:rgba(61,96,128,.3);border-top-color:var(--pj-blue);"></span>
              </button>

              <!-- Evaluate button — only when allowed -->
              <button
                v-if="p.peutEvaluer"
                class="pj-btn pj-btn--eval"
                @click="ouvrirEvaluation(p)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                {{ p.evalue ? 'Modifier' : 'Évaluer' }}
              </button>

              <!-- Locked placeholder -->
              <span v-else class="pj-btn-locked" title="La soutenance doit être publiée et l'heure de début atteinte">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Évaluation verrouillée
              </span>
            </div>
          </div>
        </div>
      </div>

    </template>

    <!-- ══ MODAL : Livrable final (PDF) ════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="showLivrableModal" class="pj-overlay" @click.self="fermerLivrable">
        <div class="pj-modal pj-modal--livrable">
          <div class="pj-modal__header pj-modal__header--livrable">
            <div>
              <div class="pj-modal__pretitle">Livrable final</div>
              <h3 class="pj-modal__title">{{ livrableProjet?.titre || livrableProjet?.projet_titre }}</h3>
              <p class="pj-modal__sub">{{ livrableProjet?.etudiant_nom }}</p>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <a v-if="livrableUrl" :href="livrableUrl" target="_blank" class="pj-btn pj-btn--ghost pj-btn--sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Ouvrir
              </a>
              <button class="pj-modal__close" @click="fermerLivrable">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          <div class="pj-modal__body pj-modal__body--pdf">
            <div v-if="loadingLivrable" class="pj-pdf-state">
              <div class="vld-spinner mx-auto mb-3"></div>
              <p>Chargement du livrable…</p>
            </div>
            <div v-else-if="livrableErreur" class="pj-pdf-state pj-pdf-state--err">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p>{{ livrableErreur }}</p>
            </div>
            <iframe v-else-if="livrableUrl"
              :src="livrableUrl + '#toolbar=1&navpanes=0'"
              class="pj-pdf-frame"
              type="application/pdf"
              frameborder="0"
            ></iframe>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══ MODAL : Grille d'évaluation (Président) ═════════════════ -->
    <Transition name="modal-fade">
      <div v-if="showEvalModal" class="pj-overlay" @click.self="showEvalModal = false">
        <div class="pj-modal pj-modal--eval">
          <div class="pj-modal__header pj-modal__header--eval">
            <div>
              <div class="pj-modal__pretitle">Grille d'évaluation — Président</div>
              <h3 class="pj-modal__title">{{ evalProjet?.titre }}</h3>
              <p class="pj-modal__sub">{{ evalProjet?.etudiant_nom }} · {{ evalProjet?.encadrant }}</p>
            </div>
            <button class="pj-modal__close" @click="showEvalModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div v-if="loadingGrille" class="pj-modal__loading"><div class="vld-spinner mx-auto mb-2"></div></div>
          <div v-else-if="!evalCategories.length" class="pj-modal__empty">Aucune grille disponible.</div>
          <div v-else class="pj-modal__body">
            <div v-for="cat in evalCategories" :key="cat.id" class="pj-grille-cat">
              <div class="pj-grille-cat__header">
                <span>{{ cat.nom }}</span>
                <span>{{ catTotal(cat).toFixed(2) }} / {{ cat.bareme_max }} pts</span>
              </div>
              <div class="pj-grille-cat__rows">
                <div v-for="c in cat.criteres" :key="c.id" class="pj-critere-row">
                  <div class="pj-critere-row__info">
                    <span class="pj-critere-row__nom">{{ c.nom }}</span>
                    <span class="pj-critere-row__bareme">/{{ c.bareme_max }}</span>
                  </div>
                  <div class="pj-critere-row__input-wrap">
                    <input type="number" :min="0" :max="c.bareme_max" :step="0.25"
                      v-model.number="c.note"
                      class="pj-note-input"
                      :class="{ 'pj-note-input--err': c.note > c.bareme_max || c.note < 0 }" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!loadingGrille && evalCategories.length" class="pj-modal__footer">
            <div class="pj-total-bar">
              <span class="pj-total-bar__label">Note totale estimée</span>
              <span class="pj-total-bar__val" :class="noteColor">{{ noteTotale.toFixed(2) }} / 20</span>
            </div>
            <div class="pj-comment-wrap">
              <label class="pj-label">Commentaire <span style="opacity:.6">(facultatif)</span></label>
              <textarea v-model="commentaire" class="pj-textarea" rows="3" placeholder="Observations générales..."></textarea>
            </div>
            <div class="pj-modal__actions">
              <button class="pj-btn pj-btn--ghost" @click="showEvalModal = false">Annuler</button>
              <button class="pj-btn pj-btn--eval pj-btn--lg" @click="soumettre" :disabled="saving">
                <span v-if="saving" class="vld-spinner-sm"></span>
                {{ saving ? 'Envoi...' : "Soumettre l'évaluation" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'ProjetsJury',
  emits: ['toast'],
  props: { currentUser: { type: Object, required: true } },

  data () {
    return {
      loading: false,
      projets: [],        // jurys where the user is a member

      // ── Modal livrable ──
      showLivrableModal: false,
      livrableProjet:    null,
      livrableUrl:       null,
      loadingLivrable:   false,
      livrableErreur:    null,

      // ── Modal évaluation (président) ──
      showEvalModal:  false,
      loadingGrille:  false,
      evalProjet:     null,
      evalCategories: [],
      commentaire:    '',
      saving:         false,
    }
  },

  computed: {
    /** Only jurys where the current user is président */
    projetsEval () {
      return this.projets.filter(p => p.monRole === 'president')
    },

    noteTotale () {
      return this.evalCategories.reduce(
        (s, cat) => s + cat.criteres.reduce((cs, c) => cs + (parseFloat(c.note) || 0), 0), 0
      )
    },
    noteColor () {
      const n = this.noteTotale
      if (n >= 14) return 'pj-note--high'
      if (n >= 10) return 'pj-note--mid'
      return 'pj-note--low'
    },
  },

  async mounted () { await this.charger() },

  methods: {

    // ── Chargement initial ──────────────────────────────────────────
    async charger () {
      this.loading = true
      try {
        const userId = this.currentUser.id
        const [juryRes, evalRes] = await Promise.allSettled([
          api.get('/jurys-pfe'),
          api.get('/jurys-pfe/mes-notes'),
        ])
        const jurys = juryRes.status === 'fulfilled' ? juryRes.value.data : []
        const evals = evalRes.status === 'fulfilled' ? evalRes.value.data : []

        // Build map of soutenance_id → eval data for enriching cards
        const evalMap = {}
        evals.forEach(ev => { evalMap[ev.jury_id] = ev })
        const evaluatedIds = new Set(evals.map(ev => ev.jury_id))

        this.projets = jurys
          // The API returns flat fields: encadrant_id, president_id, examinateur_id
          .filter(j =>
            j.encadrant_id   === userId ||
            j.president_id   === userId ||
            j.examinateur_id === userId
          )
          .map(j => {
            const isPresident   = j.president_id   === userId
            const isEncadrant   = j.encadrant_id   === userId
            const monRole       = isPresident  ? 'president'
                                : isEncadrant  ? 'encadrant'
                                :                'examinateur'
            const soutenanceId  = j.soutenance_id || j.id
            const peutEvaluer   = this.evaluerAutorise(j)
            const evalData      = evalMap[soutenanceId] || null
            return {
              id:              j.id,
              soutenance_id:   soutenanceId,
              titre:           j.projet_titre || 'Projet #' + j.id,
              etudiant_id:     j.etudiant_id  || null,
              etudiant_nom:    j.etudiant_nom  || '—',
              encadrant:       j.encadrant_nom || '—',
              date_soutenance: j.date_soutenance || null,
              heure_debut:     j.heure_debut ? j.heure_debut.substring(0, 5) : null,
              heure_fin:       j.heure_fin   ? j.heure_fin.substring(0, 5)   : null,
              salle:           j.salle || null,
              statut:          j.statut || null,
              publie:          j.publie === true || j.publie === 1,
              evalue:          evaluatedIds.has(soutenanceId),
              note_finale:     evalData ? parseFloat(evalData.note) || null : null,
              commentaire:     evalData?.commentaire || null,
              monRole,
              president_id:    j.president_id || null,
              peutEvaluer,
            }
          })

      } catch (e) { console.error(e) }
      finally { this.loading = false }
    },

    /**
     * A président may evaluate only when:
     *  1. The jury composition is published (publie === true/1)
     *  2. The soutenance is in statut 'publie' (session is scheduled & confirmed)
     *  3. The scheduled end time has already passed
     */
    evaluerAutorise (jury) {
      // Guard 1: jury composition must be published
      if (!jury.publie && jury.publie !== 1) return false
      // Guard 2: soutenance session must be published
      if (jury.statut !== 'publie') return false
      // Guard 3: must have a scheduled date
      if (!jury.date_soutenance) return false

      const heureStr = jury.heure_fin
        ? jury.heure_fin.substring(0, 5)
        : (jury.heure_debut ? jury.heure_debut.substring(0, 5) : null)
      if (!heureStr) return false

      const endsAt = new Date(`${jury.date_soutenance}T${heureStr}:00`)
      return !isNaN(endsAt) && Date.now() >= endsAt.getTime()
    },

    // ── Status badge helpers ────────────────────────────────────────
    statusLabel (p) {
      if (p.evalue)        return 'Évalué'
      if (!p.peutEvaluer)  return 'Non disponible'
      return 'À évaluer'
    },
    statusClass (p) {
      if (p.evalue)        return 'pj-status--done'
      if (!p.peutEvaluer)  return 'pj-status--locked'
      return 'pj-status--pending'
    },

    // ── Livrable final ──────────────────────────────────────────────
    async ouvrirLivrable (projet) {
      this.livrableProjet    = projet
      this.livrableUrl       = null
      this.livrableErreur    = null
      this.showLivrableModal = true
      this.loadingLivrable   = true
      try {
        const res      = await api.get(`/livrables/soutenance/${projet.soutenance_id}`)
        const livrables = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : [])
        const livrable  = livrables.find(l =>
          (l.phase_nom || l.phase?.nom || '').toLowerCase().includes('livrable')
        ) || livrables[livrables.length - 1]
        if (!livrable) {
          this.livrableErreur = "Aucun livrable final trouvé pour cet étudiant."
        } else {
          this.livrableUrl = `/api/livrables/${livrable.id}/download`
        }
      } catch (e) {
        this.livrableErreur = "Impossible de charger le livrable. Vérifiez votre connexion."
        console.error(e)
      } finally {
        this.loadingLivrable = false
      }
    },

    fermerLivrable () {
      this.showLivrableModal = false
      this.livrableUrl       = null
      this.livrableErreur    = null
      this.livrableProjet    = null
    },

    // ── Téléchargement direct du livrable ──────────────────────────
    async telechargerLivrable (projet) {
      if (projet._downloading) return
      projet._downloading = true
      try {
        const res      = await api.get(`/livrables/soutenance/${projet.soutenance_id}`)
        const livrables = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : [])
        const livrable  = livrables.find(l =>
          (l.phase_nom || l.phase?.nom || '').toLowerCase().includes('livrable')
        ) || livrables[livrables.length - 1]
        if (!livrable) {
          this.$emit('toast', { message: "Aucun livrable final trouvé.", type: 'err' })
          return
        }
        const url = `/api/livrables/${livrable.id}/download`
        const a   = document.createElement('a')
        a.href    = url
        a.download = `livrable_${projet.etudiant_nom.replace(/\s+/g, '_')}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } catch (e) {
        this.$emit('toast', { message: "Impossible de télécharger le livrable.", type: 'err' })
        console.error(e)
      } finally {
        projet._downloading = false
      }
    },

    // ── Évaluation président ────────────────────────────────────────
    async ouvrirEvaluation (projet) {
      // Extra safety: prevent opening if no longer authorised
      if (!projet.peutEvaluer) {
        this.$emit('toast', {
          message: "L'évaluation n'est disponible qu'après la fin de la soutenance.",
          type: 'err',
        })
        return
      }

      this.evalProjet     = projet
      this.commentaire    = ''
      this.evalCategories = []
      this.showEvalModal  = true
      this.loadingGrille  = true
      try {
        const res    = await api.get('/grilles')
        const grille = (res.data || []).find(g => g.statut === 'verrouille')
                    || (res.data || []).find(g => g.statut === 'publie')
                    || res.data?.[0]
        if (grille) {
          const detail = await api.get(`/grilles/${grille.id}`)
          this.evalCategories = (detail.data.categories || []).map(cat => ({
            id: cat.id, nom: cat.nom, bareme_max: parseFloat(cat.bareme_max),
            criteres: (cat.criteres || []).map(cr => ({
              id: cr.id, nom: cr.nom, bareme_max: parseFloat(cr.bareme_max), note: 0,
            })),
          }))
          if (projet.evalue) {
            try {
              // Route binding is `Soutenance $juryPfe` → must use soutenance_id
              const existing = await api.get(`/jurys-pfe/${projet.soutenance_id}/ma-note`)
              if (existing.data?.criteres?.length) {
                existing.data.criteres.forEach(ec => {
                  this.evalCategories.forEach(cat => {
                    const cr = cat.criteres.find(c => c.id === ec.critere_id)
                    if (cr) cr.note = parseFloat(ec.note) || 0
                  })
                })
              }
              this.commentaire = existing.data?.commentaire || ''
            } catch { /* keep zeros */ }
          }
        }
      } catch { this.evalCategories = [] }
      finally { this.loadingGrille = false }
    },

    catTotal (cat) {
      return cat.criteres.reduce((s, c) => s + (parseFloat(c.note) || 0), 0)
    },

    async soumettre () {
      for (const cat of this.evalCategories) {
        for (const c of cat.criteres) {
          if (c.note < 0 || c.note > c.bareme_max) {
            this.$emit('toast', { message: `Note invalide pour "${c.nom}".`, type: 'err' }); return
          }
        }
      }
      this.saving = true
      try {
        const criteres = this.evalCategories.flatMap(cat =>
          cat.criteres.map(c => ({ critere_id: c.id, note: c.note }))
        )
        await api.post(`/jurys-pfe/${this.evalProjet.soutenance_id}/notes`, {
          enseignant_id: this.currentUser.id,
          note:          parseFloat(this.noteTotale.toFixed(2)),
          commentaire:   this.commentaire,
          finalise:      true,
          criteres,
        })
        const idx = this.projets.findIndex(p => p.id === this.evalProjet.id)
        if (idx !== -1) {
          this.projets[idx].evalue      = true
          this.projets[idx].note_finale = parseFloat(this.noteTotale.toFixed(2))
          this.projets[idx].commentaire = this.commentaire || null
        }
        this.$emit('toast', { message: 'Évaluation soumise avec succès.', type: 'ok' })
        this.showEvalModal = false
      } catch (e) {
        this.$emit('toast', {
          message: e?.response?.data?.message || 'Erreur lors de la soumission.',
          type: 'err',
        })
      } finally { this.saving = false }
    },
  },
}
</script>

<style scoped>
/* ── Root & variables ──────────────────────────────────────────── */
.pj-root {
  --pj-blue:        #3d6080;
  --pj-blue-lt:     #4a7090;
  --pj-blue-dark:   #2f4f6a;
  --pj-blue-tint:   #e8f0f5;
  --pj-gold:        #f5a623;
  --pj-gold-dark:   #d98e1a;
  --pj-gold-tint:   #fef9ed;
  --pj-green:       #10b981;
  --pj-red:         #ef4444;
  --pj-amber:       #f59e0b;
  --pj-border:      #c8c4bc;
  --pj-card:        #e8e4dc;
  --pj-text:        #1e2a35;
  --pj-muted:       #8a9aaa;
  --pj-surface:     var(--vld-surface, #fff);
}

/* ── Page header ───────────────────────────────────────────────── */
.pj-page-header { border-left: 4px solid var(--pj-gold); padding-left: 14px; }
.pj-page-title  { font-size: 20px; font-weight: 700; color: var(--pj-text); margin: 0 0 4px; }
.pj-page-sub    { font-size: 13px; color: var(--pj-muted); margin: 0; }

/* ── Section header ────────────────────────────────────────────── */
.pj-section-header {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 11.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
  padding: 6px 14px 6px 8px; border-radius: 50px;
  border: 1.5px solid transparent;
}
.pj-section-header__icon {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.pj-section-header--eval {
  background: var(--pj-gold-tint); color: var(--pj-gold-dark);
  border-color: rgba(245,166,35,.35);
}
.pj-section-header__icon--eval { background: rgba(245,166,35,.2); color: var(--pj-gold-dark); }
.pj-count {
  background: rgba(0,0,0,.1); border-radius: 20px;
  padding: 1px 8px; font-size: 11px;
}

/* ── Empty states ──────────────────────────────────────────────── */
.pj-empty {
  display: flex; flex-direction: column; align-items: center;
  padding: 36px 24px; color: var(--pj-muted); gap: 10px; font-size: 13.5px;
}
.pj-empty__icon {
  width: 64px; height: 64px; border-radius: 50%;
  background: var(--pj-blue-tint); display: flex; align-items: center; justify-content: center;
  color: var(--pj-blue);
}

/* ── Card grid ─────────────────────────────────────────────────── */
.pj-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}
.pj-card {
  background: var(--pj-card); border-radius: 16px;
  border: 1.5px solid var(--pj-border);
  padding: 16px; transition: box-shadow .2s, transform .2s;
}
.pj-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.1); transform: translateY(-2px); }
.pj-card--eval    { border-left: 4px solid var(--pj-gold); }
.pj-card--done    { opacity: .85; }
.pj-card--locked  { border-left-color: var(--pj-muted); }

/* ── Top row ───────────────────────────────────────────────────── */
.pj-card__top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }

/* ── Badges ────────────────────────────────────────────────────── */
.pj-badge {
  font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 20px;
}
.pj-badge--president { background: rgba(245,166,35,.15); color: var(--pj-gold-dark); border: 1px solid rgba(245,166,35,.3); }

/* ── Status chips ──────────────────────────────────────────────── */
.pj-status { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
.pj-status--done   { background: #d1fae5; color: #065f46; }
.pj-status--pending { background: #fef3c7; color: #92400e; }
.pj-status--locked  { background: #f3f4f6; color: #6b7280; }

/* ── Card body ─────────────────────────────────────────────────── */
.pj-card__title {
  font-size: 14px; font-weight: 700; color: var(--pj-text); line-height: 1.35; margin-bottom: 8px;
}
.pj-card__meta {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: var(--pj-muted); margin-bottom: 5px;
}
.pj-card__meta:last-of-type { margin-bottom: 12px; }

/* ── Eval result summary (on card) ──────────────────────────────── */
.pj-eval-result {
  background: var(--pj-gold-tint);
  border: 1.5px solid rgba(245,166,35,.3);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pj-eval-result__note {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pj-eval-result__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--pj-muted);
  text-transform: uppercase;
  letter-spacing: .06em;
}
.pj-eval-result__val {
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
}
.pj-eval-result__val small {
  font-size: 11px;
  font-weight: 600;
  opacity: .7;
  margin-left: 1px;
}
.pj-eval-result__comment {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  font-size: 11.5px;
  color: var(--pj-muted);
  font-style: italic;
  line-height: 1.4;
  border-top: 1px solid rgba(245,166,35,.2);
  padding-top: 6px;
}
.pj-eval-result__comment svg { flex-shrink: 0; margin-top: 1px; stroke: var(--pj-gold-dark); }
.pj-eval-result__comment span { word-break: break-word; }

/* ── Lock notice ───────────────────────────────────────────────── */
.pj-lock-notice {
  display: flex; align-items: center; gap: 6px;
  font-size: 11.5px; color: var(--pj-muted); font-style: italic;
  background: rgba(0,0,0,.04); border-radius: 8px;
  padding: 6px 10px; margin-bottom: 12px;
}
.pj-lock-notice svg { flex-shrink: 0; stroke: var(--pj-muted); }

/* ── Actions ───────────────────────────────────────────────────── */
.pj-card__actions { display: flex; gap: 8px; flex-wrap: wrap; }

.pj-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12.5px; font-weight: 700; padding: 7px 14px;
  border-radius: 8px; border: none; cursor: pointer;
  transition: all .2s; text-decoration: none; flex: 1; justify-content: center;
}
.pj-btn--livrable {
  background: var(--pj-blue-tint); color: var(--pj-blue);
  border: 1.5px solid rgba(61,96,128,.25);
}
.pj-btn--livrable:hover { background: var(--pj-blue); color: #fff; }

.pj-btn--dl {
  flex: unset; width: 34px; height: 34px; padding: 0;
  background: var(--pj-blue-tint); color: var(--pj-blue);
  border: 1.5px solid rgba(61,96,128,.25); border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .2s; flex-shrink: 0;
}
.pj-btn--dl:hover:not(:disabled) { background: var(--pj-blue); color: #fff; }
.pj-btn--dl:disabled { opacity: .6; cursor: not-allowed; }

.pj-btn--eval {
  background: linear-gradient(160deg, var(--pj-gold), var(--pj-gold-dark));
  color: #fff; box-shadow: 0 3px 10px rgba(245,166,35,.3);
}
.pj-btn--eval:hover {
  box-shadow: 0 5px 16px rgba(245,166,35,.45); transform: translateY(-1px);
}
.pj-btn--eval:disabled { opacity: .6; cursor: not-allowed; transform: none; }

.pj-btn--ghost {
  background: transparent; color: var(--pj-blue);
  border: 1.5px solid rgba(61,96,128,.3);
}
.pj-btn--ghost:hover { background: var(--pj-blue-tint); }

.pj-btn--lg { padding: 9px 22px; font-size: 13px; }
.pj-btn--sm { padding: 5px 12px; font-size: 12px; flex: unset; }

.pj-btn-locked {
  display: inline-flex; align-items: center; gap: 6px; flex: 1; justify-content: center;
  font-size: 12px; color: var(--pj-muted); font-style: italic;
  padding: 7px 14px; border-radius: 8px;
  background: rgba(0,0,0,.04); border: 1.5px dashed var(--pj-border);
  cursor: not-allowed;
}

/* ── Modal overlay ─────────────────────────────────────────────── */
.pj-overlay {
  position: fixed; inset: 0; background: rgba(30,42,53,.6); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 20px;
  backdrop-filter: blur(4px);
}
.pj-modal {
  background: var(--pj-surface); border-radius: 20px; width: 100%;
  max-width: 640px; max-height: 92vh; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 30px 80px rgba(0,0,0,.25);
}
.pj-modal--livrable { max-width: 880px; }
.pj-modal--eval     { max-width: 660px; }

/* Modal header */
.pj-modal__header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 22px 26px 20px;
}
.pj-modal__header--eval    { background: linear-gradient(160deg, #c47c0c, #a36208); }
.pj-modal__header--livrable { background: linear-gradient(160deg, #2f4f6a, #1e2a35); }
.pj-modal__pretitle { font-size: 10.5px; font-weight: 700; letter-spacing:.09em; text-transform:uppercase; color:rgba(255,255,255,.65); margin-bottom:5px; }
.pj-modal__title    { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 4px; }
.pj-modal__sub      { font-size: 12.5px; color: rgba(255,255,255,.7); margin: 0; }
.pj-modal__close {
  background: rgba(255,255,255,.12); border: none; border-radius: 9px;
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; margin-left: 12px; color: #fff; transition: background .15s;
}
.pj-modal__close:hover { background: rgba(255,255,255,.22); }

.pj-modal__body    { flex: 1; overflow-y: auto; padding: 22px 26px; }
.pj-modal__body--pdf { padding: 0; overflow: hidden; }
.pj-modal__loading { padding: 40px; text-align: center; color: var(--pj-muted); }
.pj-modal__empty   { padding: 32px; text-align: center; color: var(--pj-muted); font-size: 13.5px; }
.pj-modal__footer  { padding: 18px 26px; border-top: 1.5px solid var(--pj-border); }
.pj-modal__actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; }

/* ── PDF viewer ─────────────────────────────────────────────────── */
.pj-pdf-frame { width: 100%; height: 74vh; border: none; display: block; }
.pj-pdf-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 320px; gap: 12px; color: var(--pj-muted); font-size: 13.5px; text-align: center; padding: 24px;
}
.pj-pdf-state--err { color: var(--pj-red); }
.pj-pdf-state--err svg { stroke: var(--pj-red); }

/* ── Grille ─────────────────────────────────────────────────────── */
.pj-grille-cat { margin-bottom: 16px; border-radius: 12px; overflow: hidden; border: 1.5px solid var(--pj-border); }
.pj-grille-cat__header {
  display: flex; justify-content: space-between;
  padding: 9px 14px;
  background: linear-gradient(160deg, var(--pj-gold), var(--pj-gold-dark));
  color: #fff; font-size: 12.5px; font-weight: 700;
}
.pj-grille-cat__rows { background: var(--pj-surface); }
.pj-critere-row { display: flex; align-items: center; gap: 10px; padding: 9px 14px; border-top: 1px solid var(--pj-border); }
.pj-critere-row__info { flex: 1; display: flex; justify-content: space-between; align-items: center; }
.pj-critere-row__nom    { font-size: 13px; color: var(--pj-text); }
.pj-critere-row__bareme { font-size: 11.5px; color: var(--pj-muted); }
.pj-critere-row__input-wrap { flex-shrink: 0; }

.pj-note-input {
  width: 72px; height: 32px; text-align: center;
  border: 1.5px solid var(--pj-border); border-radius: 8px;
  font-size: 13px; font-weight: 700; color: var(--pj-text);
  background: var(--pj-surface); outline: none; transition: border-color .15s;
}
.pj-note-input:focus { border-color: var(--pj-gold); }
.pj-note-input--err  { border-color: var(--pj-red); color: var(--pj-red); }

/* ── Total & comment ─────────────────────────────────────────────── */
.pj-total-bar {
  display: flex; justify-content: space-between; align-items: center;
  background: var(--pj-gold-tint); border: 1.5px solid rgba(245,166,35,.35);
  border-radius: 12px; padding: 12px 16px; margin-bottom: 14px;
}
.pj-total-bar__label { font-size: 13px; font-weight: 600; color: var(--pj-blue-dark); }
.pj-total-bar__val   { font-size: 22px; font-weight: 800; }
.pj-note--high { color: var(--pj-green); }
.pj-note--mid  { color: var(--pj-amber); }
.pj-note--low  { color: var(--pj-red); }

.pj-label    { display: block; font-size: 12.5px; font-weight: 600; color: var(--pj-muted); margin-bottom: 6px; }
.pj-textarea {
  width: 100%; border: 1.5px solid var(--pj-border); border-radius: 10px;
  padding: 10px 12px; font-size: 13px; color: var(--pj-text); resize: vertical;
  background: var(--pj-surface); outline: none; transition: border-color .15s;
}
.pj-textarea:focus { border-color: var(--pj-gold); }
.pj-comment-wrap { margin-bottom: 4px; }

/* ── Spinner (tiny) ─────────────────────────────────────────────── */
.vld-spinner-sm {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Transition ─────────────────────────────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .22s, transform .22s; }
.modal-fade-enter-from, .modal-fade-leave-to       { opacity: 0; transform: scale(.96); }
</style>