<template>
  <div class="pj-root">

    <!-- Page header -->
    <div class="pj-header mb-4">
      <h2 class="pj-title">Projets à évaluer</h2>
      <p class="pj-sub">Accédez à vos projets assignés en tant que président et soumettez vos évaluations</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="vld-state"><div class="vld-spinner mx-auto mb-3"></div><p>Chargement...</p></div>

    <!-- Empty -->
    <div v-else-if="!projetsEval.length" class="vld-state">
      <div class="vld-state__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <p class="vld-state__title">Aucun projet à évaluer</p>
    </div>

    <template v-else>

      <!-- Section label -->
      <div class="pj-col-label pj-col-label--eval mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Évaluation (Président) <span class="pj-count">{{ projetsEval.length }}</span>
      </div>

      <!-- Cards grid -->
      <div class="pj-card-grid">
        <div v-for="p in projetsEval" :key="p.id" class="pj-card pj-card--eval" :class="{ 'pj-card--done': p.evalue }">
          <div class="pj-card__top">
            <span class="pj-role-badge pj-role-badge--president">Président</span>
            <span class="pj-status-dot" :class="p.evalue ? 'pj-status-dot--done' : 'pj-status-dot--pending'">
              {{ p.evalue ? 'Évalué' : 'En attente' }}
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
            {{ p.date_soutenance }}<span v-if="p.salle"> · {{ p.salle }}</span>
          </div>

          <div class="pj-card__actions">
            <!-- Visualiser livrable final -->
            <button class="pj-btn pj-btn--livrable" @click="ouvrirLivrable(p)" :title="'Visualiser le livrable final de ' + p.etudiant_nom">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Livrable final
            </button>

            <!-- Évaluer / Modifier -->
            <button class="pj-btn pj-btn--eval" @click="ouvrirEvaluation(p)">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              {{ p.evalue ? 'Modifier' : 'Évaluer' }}
            </button>
          </div>
        </div>
      </div>

    </template>

    <!-- ══ MODAL: Visualiser livrable final ════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="showLivrableModal" class="pj-overlay" @click.self="fermerLivrable">
        <div class="pj-modal pj-modal--livrable">

          <div class="pj-modal__header pj-modal__header--livrable">
            <div>
              <div class="pj-modal__pretitle">Livrable final — Phase "livrables"</div>
              <h3 class="pj-modal__title">{{ livrableProjet?.titre }}</h3>
              <p class="pj-modal__sub">{{ livrableProjet?.etudiant_nom }}</p>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <a v-if="livrableUrl" :href="livrableUrl" target="_blank" class="pj-btn pj-btn--ghost pj-btn--sm" title="Ouvrir dans un nouvel onglet">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Ouvrir
              </a>
              <button class="pj-modal__close" @click="fermerLivrable">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="pj-modal__body pj-modal__body--pdf">

            <!-- Loading -->
            <div v-if="loadingLivrable" class="pj-pdf-state">
              <div class="vld-spinner mx-auto mb-3"></div>
              <p>Chargement du livrable…</p>
            </div>

            <!-- Not found -->
            <div v-else-if="livrableErreur" class="pj-pdf-state pj-pdf-state--err">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p>{{ livrableErreur }}</p>
            </div>

            <!-- PDF iframe -->
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

    <!-- ══ MODAL: Évaluation (président) ═══════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="showModal" class="pj-overlay" @click.self="showModal = false">
        <div class="pj-modal pj-modal--eval">

          <div class="pj-modal__header pj-modal__header--eval">
            <div>
              <div class="pj-modal__pretitle">Grille d'évaluation — Président</div>
              <h3 class="pj-modal__title">{{ evalProjet?.titre }}</h3>
              <p class="pj-modal__sub">{{ evalProjet?.etudiant_nom }} · {{ evalProjet?.encadrant }}</p>
            </div>
            <button class="pj-modal__close" @click="showModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div v-if="loadingGrille" class="pj-modal__loading"><div class="vld-spinner mx-auto mb-2"></div></div>
          <div v-else-if="!evalCategories.length" class="pj-modal__empty">Aucune grille disponible</div>

          <div v-else class="pj-modal__body">
            <div v-for="cat in evalCategories" :key="cat.id" class="pj-grille-cat">
              <div class="pj-grille-cat__header">
                <span class="pj-grille-cat__name">{{ cat.nom }}</span>
                <span class="pj-grille-cat__score">
                  {{ catTotal(cat).toFixed(2) }} / {{ cat.bareme_max }} pts
                </span>
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
              <button class="pj-btn pj-btn--ghost" @click="showModal = false">Annuler</button>
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
      projets: [], loading: false,

      // Livrable modal
      showLivrableModal: false,
      livrableProjet:    null,
      livrableUrl:       null,
      loadingLivrable:   false,
      livrableErreur:    null,

      // Eval modal
      showModal:      false,
      loadingGrille:  false,
      evalProjet:     null,
      evalCategories: [], commentaire: '', saving: false,
    }
  },

  computed: {
    projetsEval () { return this.projets.filter(p => p.monRole === 'president') },
    noteTotale () {
      return this.evalCategories.reduce(
        (s, cat) => s + cat.criteres.reduce((cs, c) => cs + (c.note || 0), 0), 0
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
    catTotal (cat) {
      return cat.criteres.reduce((s, c) => s + (c.note || 0), 0)
    },

    async charger () {
      this.loading = true
      try {
        const userId = this.currentUser.id
        const [juryRes, evalRes] = await Promise.allSettled([
          api.get('/jurys-pfe'),
          api.get('/jurys-pfe/mes-notes'),
        ])
        const jurys = juryRes.status === 'fulfilled' ? juryRes.value.data : []
        this.projets = jurys
          .filter(j => (j.membres || []).some(m => m.enseignant_id === userId))
          .map(j => {
            const monMembre = (j.membres || []).find(m => m.enseignant_id === userId)
            return {
              id:              j.id,
              titre:           j.projet_titre || 'Projet #' + j.id,
              etudiant_id:     j.etudiant_id  || null,
              etudiant_nom:    j.etudiant_nom  || '—',
              encadrant:       j.encadrant_nom || '—',
              date_soutenance: j.date_soutenance || null,
              salle:           j.salle || null,
              evalue:          false,
              monRole:         monMembre?.fonction || 'examinateur',
              president_id:    j.president_id || null,
            }
          })

        const evals = evalRes.status === 'fulfilled' ? evalRes.value.data : []
        evals.forEach(ev => {
          const p = this.projets.find(pr => pr.id === ev.jury_id)
          if (p) p.evalue = true
        })
      } catch (e) { console.error(e) }
      finally { this.loading = false }
    },

    // ── Livrable final ──────────────────────────────────────────────
    async ouvrirLivrable (projet) {
      this.livrableProjet  = projet
      this.livrableUrl     = null
      this.livrableErreur  = null
      this.showLivrableModal = true
      this.loadingLivrable   = true
      try {
        // Fetch livrables for this student (jury-accessible endpoint)
        const res = await api.get(`/livrables/etudiant/${projet.etudiant_id}`)
        const livrables = res.data || []

        // Find the livrable belonging to the phase named "livrables" (case-insensitive)
        const livrable = livrables.find(l =>
          (l.phase_nom || l.phase?.nom || '').toLowerCase().includes('livrable')
        ) || livrables[livrables.length - 1] // fallback: last submitted livrable

        if (!livrable) {
          this.livrableErreur = "Aucun livrable final trouvé pour cet étudiant."
        } else {
          // Build the URL — use the download route
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

    // ── Évaluation ──────────────────────────────────────────────────
    async ouvrirEvaluation (projet) {
      this.evalProjet = projet
      this.commentaire = ''
      this.evalCategories = []
      this.showModal = true
      this.loadingGrille = true
      try {
        const res    = await api.get('/grilles')
        const grille = (res.data || []).find(g => g.statut === 'publie' || g.statut === 'verrouille') || res.data?.[0]
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
              const existing = await api.get(`/jurys-pfe/${projet.id}/ma-note`)
              if (existing.data?.criteres?.length) {
                existing.data.criteres.forEach(ec => {
                  this.evalCategories.forEach(cat => {
                    const cr = cat.criteres.find(c => c.id === ec.critere_id)
                    if (cr) cr.note = ec.note
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
        await api.post(`/jurys-pfe/${this.evalProjet.id}/notes`, {
          enseignant_id: this.currentUser.id,
          note:          parseFloat(this.noteTotale.toFixed(2)),
          commentaire:   this.commentaire,
          finalise:      true,
          criteres,
        })
        const idx = this.projets.findIndex(p => p.id === this.evalProjet.id)
        if (idx !== -1) this.projets[idx].evalue = true
        this.$emit('toast', { message: 'Évaluation soumise avec succès.', type: 'ok' })
        this.showModal = false
      } catch (e) {
        this.$emit('toast', { message: e?.response?.data?.message || 'Erreur lors de la soumission.', type: 'err' })
      } finally { this.saving = false }
    },
  },
}
</script>

<style scoped>
/* ── Root ──────────────────────────────────────────────────────── */
.pj-root {
  --pj-blue: #3d6080; --pj-blue-lt: #e8f0fe; --pj-blue-mid: #3d6080;
  --pj-yellow: #f59e0b; --pj-yellow-lt: #fef9ee; --pj-yellow-dark: #d97706;
  --pj-green: #10b981; --pj-red: #ef4444;
  --pj-surface: var(--vld-surface, #fff);
  --pj-border: var(--bs-border-color, #e5e7eb);
  --pj-text: var(--vld-text-strong, #111827);
  --pj-muted: var(--vld-text-muted, #6b7280);
  --pj-r: 12px;
}

/* ── Page header ───────────────────────────────────────────────── */
.pj-header { border-left: 4px solid var(--pj-yellow); padding-left: 14px; }
.pj-title  { font-size: 20px; font-weight: 700; color: var(--pj-text); margin: 0 0 4px; }
.pj-sub    { font-size: 13px; color: var(--pj-muted); margin: 0; }

/* ── Section label ─────────────────────────────────────────────── */
.pj-col-label {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
  padding: 6px 12px; border-radius: 8px; width: fit-content;
}
.pj-col-label--eval { background: var(--pj-yellow-lt); color: var(--pj-yellow-dark); border: 1px solid #fde68a; }
.pj-count { background: rgba(0,0,0,.10); border-radius: 20px; padding: 1px 7px; font-size: 11px; margin-left: 2px; }

/* ── Cards grid ────────────────────────────────────────────────── */
.pj-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}
.pj-card {
  background: var(--pj-surface); border-radius: var(--pj-r);
  border: 1.5px solid var(--pj-border); padding: 16px;
  transition: box-shadow .15s, border-color .15s;
}
.pj-card:hover         { box-shadow: 0 4px 16px rgba(0,0,0,.07); }
.pj-card--eval         { border-left: 4px solid var(--pj-yellow); }
.pj-card--eval:hover   { border-color: var(--pj-yellow); }
.pj-card--done         { opacity: .88; }

.pj-card__top {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
}
.pj-card__title {
  font-size: 14.5px; font-weight: 700; color: var(--pj-text); margin-bottom: 6px;
  line-height: 1.35;
}
.pj-card__meta {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: var(--pj-muted); margin-bottom: 3px;
}
.pj-card__actions {
  display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;
}

/* ── Role badges ───────────────────────────────────────────────── */
.pj-role-badge {
  font-size: 10.5px; font-weight: 700; letter-spacing: .05em;
  text-transform: uppercase; padding: 3px 9px; border-radius: 20px;
}
.pj-role-badge--president { background: var(--pj-yellow-lt); color: var(--pj-yellow-dark); border: 1px solid #fde68a; }

/* ── Status dots ───────────────────────────────────────────────── */
.pj-status-dot { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; }
.pj-status-dot--done    { background: #d1fae5; color: #065f46; }
.pj-status-dot--pending { background: #fef3c7; color: #92400e; }

/* ── Buttons ───────────────────────────────────────────────────── */
.pj-btn {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12.5px; font-weight: 600; padding: 6px 14px;
  border-radius: 8px; border: none; cursor: pointer;
  transition: background .15s, transform .1s;
  text-decoration: none;
}
.pj-btn:active { transform: scale(.97); }
.pj-btn--eval         { background: var(--pj-yellow); color: #1a1a1a; }
.pj-btn--eval:hover   { background: var(--pj-yellow-dark); color: #fff; }
.pj-btn--ghost        { background: transparent; color: var(--pj-muted); border: 1.5px solid var(--pj-border); }
.pj-btn--ghost:hover  { background: #f3f4f6; }
.pj-btn--livrable        { background: var(--pj-blue-lt); color: var(--pj-blue); border: 1.5px solid rgba(61,96,128,.25); }
.pj-btn--livrable:hover  { background: var(--pj-blue); color: #fff; }
.pj-btn--lg { padding: 9px 22px; font-size: 13.5px; }
.pj-btn--sm { padding: 5px 11px; font-size: 11.5px; }

/* ── Modal overlay ─────────────────────────────────────────────── */
.pj-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.50); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 20px;
  backdrop-filter: blur(3px);
}
.pj-modal {
  background: var(--pj-surface); border-radius: 16px; width: 100%;
  max-width: 660px; max-height: 92vh; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,.20);
}
.pj-modal--livrable { max-width: 860px; }

/* Modal header */
.pj-modal__header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 20px 24px 18px; border-bottom: 1.5px solid var(--pj-border);
}
.pj-modal__header--eval     { background: var(--pj-yellow-lt); border-bottom-color: #fde68a; }
.pj-modal__header--livrable {
  background: linear-gradient(135deg, #2f4f6a, #3d6080);
  border-bottom-color: rgba(255,255,255,.1);
}
.pj-modal__header--livrable .pj-modal__pretitle { color: rgba(255,255,255,.65); }
.pj-modal__header--livrable .pj-modal__title    { color: #fff; }
.pj-modal__header--livrable .pj-modal__sub      { color: rgba(255,255,255,.7); }
.pj-modal__header--livrable .pj-modal__close    { background: rgba(255,255,255,.15); color: #fff; }
.pj-modal__header--livrable .pj-modal__close:hover { background: rgba(255,255,255,.25); }

.pj-modal__pretitle { font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; margin-bottom: 4px; }
.pj-modal__header--eval .pj-modal__pretitle { color: var(--pj-yellow-dark); }
.pj-modal__title { font-size: 17px; font-weight: 700; color: var(--pj-text); margin: 0 0 3px; }
.pj-modal__sub   { font-size: 12.5px; color: var(--pj-muted); margin: 0; }
.pj-modal__close {
  background: rgba(0,0,0,.06); border: none; border-radius: 8px;
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; margin-left: 12px; transition: background .15s;
}
.pj-modal__close:hover { background: rgba(0,0,0,.12); }

.pj-modal__loading { padding: 40px; text-align: center; }
.pj-modal__empty   { padding: 40px; text-align: center; color: var(--pj-muted); font-size: 14px; }
.pj-modal__body    { flex: 1; overflow-y: auto; padding: 20px 24px; }
.pj-modal__body--pdf { padding: 0; overflow: hidden; }
.pj-modal__footer  { padding: 16px 24px; border-top: 1.5px solid var(--pj-border); background: var(--pj-surface); }
.pj-modal__actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; }

/* ── PDF viewer ────────────────────────────────────────────────── */
.pj-pdf-frame {
  width: 100%; height: 72vh; border: none; display: block;
}
.pj-pdf-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 320px; gap: 12px; color: var(--pj-muted); font-size: 13.5px; text-align: center;
  padding: 24px;
}
.pj-pdf-state--err { color: var(--pj-red); }
.pj-pdf-state--err svg { stroke: var(--pj-red); }

/* ── Grille ────────────────────────────────────────────────────── */
.pj-grille-cat { margin-bottom: 16px; border-radius: 10px; overflow: hidden; border: 1.5px solid var(--pj-border); }
.pj-grille-cat__header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 9px 14px; background: var(--pj-yellow-dark); color: #fff;
  font-size: 13px; font-weight: 700;
}
.pj-grille-cat__score { font-size: 12px; opacity: .9; font-weight: 600; }
.pj-critere-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-top: 1px solid var(--pj-border); background: var(--pj-surface);
}
.pj-critere-row__info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; padding-right: 12px; }
.pj-critere-row__nom    { font-size: 13px; font-weight: 600; color: var(--pj-text); }
.pj-critere-row__bareme { font-size: 11.5px; color: var(--pj-muted); }
.pj-critere-row__input-wrap { flex-shrink: 0; }
.pj-note-input {
  width: 72px; height: 36px; border: 2px solid var(--pj-border); border-radius: 8px;
  text-align: center; font-size: 14px; font-weight: 700;
  color: var(--pj-text); background: var(--pj-surface); transition: border-color .15s;
}
.pj-note-input:focus    { outline: none; border-color: var(--pj-yellow); box-shadow: 0 0 0 3px rgba(245,158,11,.15); }
.pj-note-input--err     { border-color: var(--pj-red) !important; background: #fff5f5; }

/* ── Total bar ─────────────────────────────────────────────────── */
.pj-total-bar {
  display: flex; justify-content: space-between; align-items: center;
  background: var(--pj-yellow-lt); border: 1.5px solid #fde68a;
  border-radius: 10px; padding: 10px 16px; margin-bottom: 14px;
}
.pj-total-bar__label { font-size: 13px; font-weight: 600; color: var(--pj-yellow-dark); }
.pj-total-bar__val   { font-size: 20px; font-weight: 800; color: var(--pj-yellow-dark); }
.pj-note--high { color: var(--pj-green)       !important; }
.pj-note--mid  { color: var(--pj-yellow-dark) !important; }
.pj-note--low  { color: var(--pj-red)         !important; }

/* ── Comment ───────────────────────────────────────────────────── */
.pj-comment-wrap  { margin-bottom: 4px; }
.pj-label         { font-size: 12.5px; font-weight: 600; color: var(--pj-muted); margin-bottom: 6px; display: block; }
.pj-textarea      { width: 100%; border: 1.5px solid var(--pj-border); border-radius: 8px; padding: 9px 12px; font-size: 13px; resize: vertical; }
.pj-textarea:focus { outline: none; border-color: var(--pj-yellow); box-shadow: 0 0 0 3px rgba(245,158,11,.12); }

/* ── Transition ────────────────────────────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s, transform .2s; }
.modal-fade-enter-from, .modal-fade-leave-to       { opacity: 0; transform: scale(.97); }
</style>