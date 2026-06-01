<template>
  <div class="ce-root">

    <!-- Page header -->
    <div class="ce-page-header mb-4">
      <h2 class="ce-page-title">Évaluations du président</h2>
      <p class="ce-page-sub">Consultez les évaluations soumises par le président (encadrant &amp; examinateur uniquement)</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="vld-state">
      <div class="vld-spinner mx-auto mb-3"></div>
      <p>Chargement...</p>
    </div>

    <template v-else>

      <!-- Section label -->
      <div class="ce-section-label mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        Évaluations du président (consultation) <span class="ce-count">{{ projetsConsult.length }}</span>
      </div>

      <!-- Empty state -->
      <div v-if="!projetsConsult.length" class="ce-state">
        <div class="ce-state__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <p class="ce-state__title">Aucune évaluation à consulter</p>
        <p class="ce-state__sub">Vous n'êtes pas encore membre d'un jury en tant qu'encadrant ou examinateur.</p>
      </div>

      <!-- Card grid -->
      <div v-else class="ce-grid">
        <div v-for="pc in projetsConsult" :key="'c-' + pc.jury_id" class="ce-card">

          <!-- Top badges row -->
          <div class="ce-card__top">
            <span class="ce-role-badge">
              {{ pc.monRole === 'encadrant' ? '👨‍🏫 Encadrant' : '🔍 Examinateur' }}
            </span>
            <span class="ce-status" :class="pc.presidentEvalue ? 'ce-status--done' : 'ce-status--pending'">
              {{ pc.presidentEvalue ? 'Évalué' : 'En attente' }}
            </span>
          </div>

          <!-- Title -->
          <div class="ce-card__title">{{ pc.projet_titre }}</div>

          <!-- Meta -->
          <div class="ce-card__meta">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {{ pc.etudiant_nom }}
          </div>

          <!-- Note preview -->
          <div v-if="pc.presidentEvalue" class="ce-note-preview">
            <span class="ce-note-label">Note du président</span>
            <span class="ce-note-val">{{ pc.noteAffichee }}<span class="ce-note-denom">/20</span></span>
          </div>

          <!-- Actions -->
          <div class="ce-card__actions">
            <!-- Visualiser livrable final -->
            <button class="ce-btn ce-btn--livrable" @click="ouvrirLivrable(pc)" :title="'Visualiser le livrable final de ' + pc.etudiant_nom">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Livrable final
            </button>

            <!-- Consulter évaluation -->
            <button v-if="pc.presidentEvalue" class="ce-btn ce-btn--consult" @click="consulter(pc)">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Voir l'évaluation
            </button>
            <span v-else class="ce-btn-disabled">En attente du président</span>
          </div>

        </div>
      </div>

    </template>

    <!-- ══ MODAL: Visualiser livrable final ════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="showLivrableModal" class="ce-overlay" @click.self="fermerLivrable">
        <div class="ce-modal ce-modal--livrable">

          <div class="ce-modal__header ce-modal__header--livrable">
            <div class="ce-modal__header-left">
              <div class="ce-modal__pretitle">Livrable final — Phase "livrables"</div>
              <h3 class="ce-modal__title">{{ livrableProjet?.projet_titre }}</h3>
              <p class="ce-modal__sub">{{ livrableProjet?.etudiant_nom }}</p>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <a v-if="livrableUrl" :href="livrableUrl" target="_blank" class="ce-btn ce-btn--open" title="Ouvrir dans un nouvel onglet">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Ouvrir
              </a>
              <button class="ce-modal__close" @click="fermerLivrable">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <div class="ce-modal__body ce-modal__body--pdf">
            <div v-if="loadingLivrable" class="ce-pdf-state">
              <div class="vld-spinner mx-auto mb-3"></div>
              <p>Chargement du livrable…</p>
            </div>
            <div v-else-if="livrableErreur" class="ce-pdf-state ce-pdf-state--err">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p>{{ livrableErreur }}</p>
            </div>
            <iframe v-else-if="livrableUrl"
              :src="livrableUrl + '#toolbar=1&navpanes=0'"
              class="ce-pdf-frame"
              type="application/pdf"
              frameborder="0"
            ></iframe>
          </div>

        </div>
      </div>
    </Transition>

    <!-- ══ MODAL: Consultation évaluation ══════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="showModal" class="ce-overlay" @click.self="showModal = false">
        <div class="ce-modal">

          <div class="ce-modal__header">
            <div class="ce-modal__header-left">
              <div class="ce-modal__pretitle">Consultation — Évaluation du président</div>
              <h3 class="ce-modal__title">{{ activeProjet?.projet_titre }}</h3>
              <p class="ce-modal__sub">
                {{ activeProjet?.etudiant_nom }}
                <span class="ce-modal__role-chip">
                  {{ activeProjet?.monRole === 'encadrant' ? 'Encadrant' : 'Examinateur' }}
                </span>
              </p>
            </div>
            <button class="ce-modal__close" @click="showModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="ce-modal__body">
            <div v-if="loadingDetail" class="ce-modal__loading">
              <div class="vld-spinner mx-auto mb-2"></div>
              <p>Chargement de l'évaluation…</p>
            </div>
            <template v-else-if="activeNote">
              <div v-if="activeNote.categories && activeNote.categories.length">
                <div v-for="cat in activeNote.categories" :key="cat.id" class="ce-grille-cat">
                  <div class="ce-grille-cat__header">
                    <span>{{ cat.nom }}</span>
                    <span>{{ Number(cat.note).toFixed(2) }} / {{ cat.bareme }} pts</span>
                  </div>
                  <div v-for="c in cat.criteres" :key="c.id" class="ce-critere-row">
                    <span class="ce-critere-nom">{{ c.nom }}</span>
                    <div class="ce-critere-bar">
                      <div class="ce-critere-bar__track">
                        <div class="ce-critere-bar__fill"
                          :style="{ width: (c.bareme ? c.note / c.bareme * 100 : 0) + '%' }"></div>
                      </div>
                    </div>
                    <span class="ce-critere-val">{{ Number(c.note).toFixed(2) }}/{{ c.bareme }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="ce-no-detail">Aucun détail par critère disponible.</div>
            </template>
            <div v-else class="ce-no-detail">Impossible de charger l'évaluation.</div>
          </div>

          <div v-if="activeNote && !loadingDetail" class="ce-modal__footer">
            <div class="ce-total-bar">
              <span class="ce-total-bar__label">Note totale du président</span>
              <strong class="ce-total-bar__val">{{ Number(activeNote.note_totale).toFixed(2) }} / 20</strong>
            </div>
            <div v-if="activeNote.commentaire" class="ce-comment">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>{{ activeNote.commentaire }}</span>
            </div>
            <div class="ce-modal__actions">
              <button class="ce-btn ce-btn--close" @click="showModal = false">Fermer</button>
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
  name: 'MesEvaluations',
  emits: ['toast'],
  props: { currentUser: { type: Object, required: true } },

  data () {
    return {
      loading: false,
      projetsConsult: [],

      // Livrable modal
      showLivrableModal: false,
      livrableProjet:    null,
      livrableUrl:       null,
      loadingLivrable:   false,
      livrableErreur:    null,

      // Consult eval modal
      showModal:     false,
      activeProjet:  null,
      activeNote:    null,
      loadingDetail: false,
    }
  },

  async mounted () { await this.charger() },

  methods: {
    async charger () {
      this.loading = true
      try {
        const userId   = this.currentUser.id
        const jurysRes = await api.get('/jurys-pfe')
        const jurys    = jurysRes.data || []

        this.projetsConsult = jurys
          .filter(j => {
            // Only show jurys where:
            //  1. The current user is a non-president member (encadrant / examinateur)
            //  2. The soutenance is published (statut === 'publie')
            const moi = (j.membres || []).find(m => m.enseignant_id === userId)
            return moi && moi.fonction !== 'president' && j.statut === 'publie'
          })
          .map(j => {
            const moi = (j.membres || []).find(m => m.enseignant_id === userId)
            const presidentEvalue = (j.nb_fiches || 0) > 0
            return {
              jury_id:        j.id,
              projet_titre:   j.projet_titre || '—',
              etudiant_id:    j.etudiant_id  || null,
              etudiant_nom:   j.etudiant_nom  || '—',
              president_id:   j.president_id  || null,
              monRole:        moi?.fonction || 'examinateur',
              presidentEvalue,
              noteAffichee:   presidentEvalue ? '—' : null,
            }
          })
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    // ── Livrable final ──────────────────────────────────────────────
    async ouvrirLivrable (pc) {
      this.livrableProjet    = pc
      this.livrableUrl       = null
      this.livrableErreur    = null
      this.showLivrableModal = true
      this.loadingLivrable   = true
      try {
        const res      = await api.get(`/livrables/etudiant/${pc.etudiant_id}`)
        const livrables = res.data || []

        // Find the livrable belonging to the phase named "livrables" (case-insensitive)
        const livrable = livrables.find(l =>
          (l.phase_nom || l.phase?.nom || '').toLowerCase().includes('livrable')
        ) || livrables[livrables.length - 1] // fallback: last submitted

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

    // ── Consulter évaluation ────────────────────────────────────────
    async consulter (pc) {
      this.activeProjet  = pc
      this.activeNote    = null
      this.showModal     = true
      this.loadingDetail = true
      try {
        const res   = await api.get(`/jurys-pfe/${pc.jury_id}/notes`)
        const notes = res.data || []
        const presNote = notes.find(n => n.enseignant_id === pc.president_id)
                      || notes.find(n => n.fonction === 'president')
                      || notes[0]
        if (presNote) {
          this.activeNote = {
            note_totale: presNote.note,
            commentaire: presNote.commentaire || '',
            categories:  presNote.categories || [],
          }
          pc.noteAffichee = Number(presNote.note).toFixed(2)
        }
      } catch (e) {
        console.error(e)
        this.activeNote = null
      } finally {
        this.loadingDetail = false
      }
    },
  },
}
</script>

<style scoped>
.ce-root {
  --vd-blue:      #3d6080;
  --vd-blue-dark: #2f4f6a;
  --vd-blue-lt:   #4a7090;
  --vd-gold:      #f5a623;
  --vd-gold-dark: #d98e1a;
  --vd-bg:        #ddd9d1;
  --vd-card:      #e8e4dc;
  --vd-border:    #c8c4bc;
  --vd-text:      #1e2a35;
  --vd-muted:     #8a9aaa;
  --vd-blue-tint: #e8f0f5;
  --vd-gold-tint: #fef9ed;
  --vd-surface:   var(--vld-surface, #fff);
  --vd-red:       #ef4444;
}

/* ── Page header ────────────────────────────────────────────────── */
.ce-page-header { border-left: 4px solid var(--vd-gold); padding-left: 14px; }
.ce-page-title  { font-size: 20px; font-weight: 700; color: var(--vd-text); margin: 0 0 4px; }
.ce-page-sub    { font-size: 13px; color: var(--vd-muted); margin: 0; }

/* ── Section label ──────────────────────────────────────────────── */
.ce-section-label {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 11.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
  padding: 5px 13px; border-radius: 50px;
  background: var(--vd-blue-tint); color: var(--vd-blue);
  border: 1px solid rgba(61,96,128,0.25);
}
.ce-count {
  background: rgba(61,96,128,0.15); border-radius: 20px;
  padding: 1px 8px; font-size: 11px; margin-left: 2px;
}

/* ── State ──────────────────────────────────────────────────────── */
.ce-state { text-align: center; padding: 48px 24px; color: var(--vd-muted); }
.ce-state__icon {
  width: 72px; height: 72px; margin: 0 auto 16px;
  background: var(--vd-blue-tint); border-radius: 50%;
  display: flex; align-items: center; justify-content: center; color: var(--vd-blue);
}
.ce-state__title { font-size: 15px; font-weight: 700; color: var(--vd-text); margin-bottom: 6px; }
.ce-state__sub   { font-size: 13px; color: var(--vd-muted); max-width: 360px; margin: 0 auto; line-height: 1.6; }

/* ── Card grid ──────────────────────────────────────────────────── */
.ce-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* ── Card ───────────────────────────────────────────────────────── */
.ce-card {
  background: var(--vd-card); border-radius: 16px;
  border: 1.5px solid var(--vd-border); border-left: 4px solid var(--vd-blue);
  padding: 18px; position: relative; overflow: hidden;
  transition: all 0.3s ease;
}
.ce-card::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(160deg, var(--vd-blue-lt), var(--vd-blue-dark));
  opacity: 0; transition: opacity 0.3s; z-index: 0;
}
.ce-card:hover { transform: translateY(-5px); box-shadow: 0 14px 32px rgba(0,0,0,.12); border-color: var(--vd-blue); }
.ce-card:hover::before { opacity: 1; }
.ce-card > * { position: relative; z-index: 1; }
.ce-card:hover .ce-card__title,
.ce-card:hover .ce-card__meta { color: #fff; }
.ce-card:hover .ce-card__meta svg { stroke: rgba(255,255,255,0.7); }
.ce-card:hover .ce-note-label { color: rgba(255,255,255,0.7); }
.ce-card:hover .ce-note-val   { color: var(--vd-gold); }

.ce-card__top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }

.ce-role-badge {
  font-size: 10.5px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
  background: rgba(61,96,128,0.12); color: var(--vd-blue);
  border: 1px solid rgba(61,96,128,0.2); transition: background 0.3s, color 0.3s, border-color 0.3s;
}
.ce-card:hover .ce-role-badge {
  background: rgba(255,255,255,0.15); color: #fff; border-color: rgba(255,255,255,0.25);
}

.ce-status { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
.ce-status--done    { background: #d1fae5; color: #065f46; }
.ce-status--pending { background: #fef3c7; color: #92400e; }

.ce-card__title {
  font-size: 14.5px; font-weight: 700; color: var(--vd-text);
  line-height: 1.35; margin-bottom: 8px; transition: color 0.3s;
}
.ce-card__meta {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: var(--vd-muted); margin-bottom: 14px; transition: color 0.3s;
}
.ce-card__meta svg { stroke: var(--vd-muted); transition: stroke 0.3s; }

/* Note preview */
.ce-note-preview {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.3);
  border-radius: 10px; padding: 8px 12px; margin-bottom: 14px;
  transition: background 0.3s, border-color 0.3s;
}
.ce-card:hover .ce-note-preview { background: rgba(245,166,35,0.15); border-color: rgba(245,166,35,0.4); }
.ce-note-label { font-size: 11.5px; font-weight: 600; color: var(--vd-muted); transition: color 0.3s; }
.ce-note-val   { font-size: 18px; font-weight: 800; color: var(--vd-blue); transition: color 0.3s; }
.ce-note-denom { font-size: 12px; font-weight: 600; opacity: 0.7; }

/* Actions */
.ce-card__actions { display: flex; gap: 8px; flex-wrap: wrap; }

/* ── Buttons ────────────────────────────────────────────────────── */
.ce-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12.5px; font-weight: 700; padding: 7px 14px;
  border-radius: 8px; border: none; cursor: pointer;
  transition: all 0.2s; text-decoration: none; flex: 1; justify-content: center;
}
.ce-btn--livrable {
  background: rgba(61,96,128,0.12); color: var(--vd-blue);
  border: 1.5px solid rgba(61,96,128,0.25);
}
.ce-btn--livrable:hover { background: var(--vd-blue); color: #fff; }
.ce-card:hover .ce-btn--livrable {
  background: rgba(255,255,255,0.15); color: #fff; border-color: rgba(255,255,255,0.3);
}
.ce-card:hover .ce-btn--livrable:hover { background: rgba(255,255,255,0.25); }

.ce-btn--consult {
  background: linear-gradient(160deg, var(--vd-blue-lt), var(--vd-blue-dark));
  color: #fff; box-shadow: 0 3px 10px rgba(61,96,128,0.25);
}
.ce-btn--consult:hover {
  background: linear-gradient(160deg, var(--vd-gold), var(--vd-gold-dark));
  box-shadow: 0 5px 16px rgba(245,166,35,0.35); transform: translateY(-1px);
}
.ce-card:hover .ce-btn--consult { background: rgba(255,255,255,0.2); border: 1.5px solid rgba(255,255,255,0.4); box-shadow: none; }
.ce-card:hover .ce-btn--consult:hover { background: var(--vd-gold); color: var(--vd-text); border-color: var(--vd-gold); }

.ce-btn--open {
  background: rgba(255,255,255,0.15); color: #fff;
  border: 1.5px solid rgba(255,255,255,0.3); padding: 5px 12px; font-size: 12px; flex: unset;
}
.ce-btn--open:hover { background: rgba(255,255,255,0.28); }

.ce-btn--close {
  background: linear-gradient(160deg, var(--vd-blue-lt), var(--vd-blue-dark));
  color: #fff; padding: 9px 24px; font-size: 13px;
  box-shadow: 0 3px 10px rgba(61,96,128,0.25); flex: unset;
}
.ce-btn--close:hover {
  background: linear-gradient(160deg, var(--vd-gold), var(--vd-gold-dark));
  box-shadow: 0 5px 16px rgba(245,166,35,0.35); transform: translateY(-1px);
}

.ce-btn-disabled {
  font-size: 12px; color: var(--vd-muted); font-style: italic;
  display: flex; align-items: center; width: 100%; justify-content: center;
  padding: 7px 0; transition: color 0.3s;
}
.ce-card:hover .ce-btn-disabled { color: rgba(255,255,255,0.5); }

/* ── Modal overlay ──────────────────────────────────────────────── */
.ce-overlay {
  position: fixed; inset: 0; background: rgba(30,42,53,0.6); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 20px;
  backdrop-filter: blur(4px);
}
.ce-modal {
  background: var(--vd-surface, #fff); border-radius: 20px; width: 100%;
  max-width: 640px; max-height: 92vh; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 30px 80px rgba(0,0,0,0.25);
}
.ce-modal--livrable { max-width: 880px; }

/* Modal header */
.ce-modal__header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 22px 26px 20px;
  background: linear-gradient(160deg, var(--vd-blue-lt), var(--vd-blue-dark));
}
.ce-modal__header--livrable {
  background: linear-gradient(160deg, #2f4f6a, #1e2a35);
}
.ce-modal__pretitle { font-size: 10.5px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; color: rgba(255,255,255,.65); margin-bottom: 5px; }
.ce-modal__title    { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 4px; }
.ce-modal__sub      { font-size: 12.5px; color: rgba(255,255,255,.7); margin: 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ce-modal__role-chip {
  font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
  background: rgba(245,166,35,.25); color: var(--vd-gold); border: 1px solid rgba(245,166,35,.4);
}
.ce-modal__close {
  background: rgba(255,255,255,.12); border: none; border-radius: 9px;
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; margin-left: 12px; color: #fff; transition: background .15s;
}
.ce-modal__close:hover { background: rgba(255,255,255,.22); }

.ce-modal__body    { flex: 1; overflow-y: auto; padding: 22px 26px; }
.ce-modal__body--pdf { padding: 0; overflow: hidden; }
.ce-modal__loading { padding: 40px; text-align: center; color: var(--vd-muted); }
.ce-modal__footer  { padding: 18px 26px; border-top: 1.5px solid var(--vd-border); }
.ce-modal__actions { display: flex; justify-content: flex-end; margin-top: 16px; }

/* ── PDF viewer ─────────────────────────────────────────────────── */
.ce-pdf-frame {
  width: 100%; height: 74vh; border: none; display: block;
}
.ce-pdf-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 320px; gap: 12px; color: var(--vd-muted); font-size: 13.5px; text-align: center; padding: 24px;
}
.ce-pdf-state--err { color: var(--vd-red); }
.ce-pdf-state--err svg { stroke: var(--vd-red); }

/* ── Grille ─────────────────────────────────────────────────────── */
.ce-grille-cat { margin-bottom: 16px; border-radius: 12px; overflow: hidden; border: 1.5px solid var(--vd-border); }
.ce-grille-cat__header {
  display: flex; justify-content: space-between;
  padding: 9px 14px;
  background: linear-gradient(160deg, var(--vd-blue-lt), var(--vd-blue-dark));
  color: #fff; font-size: 12.5px; font-weight: 700;
}
.ce-critere-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 14px; border-top: 1px solid var(--vd-border); background: var(--vd-card);
}
.ce-critere-nom {
  font-size: 12.5px; color: var(--vd-muted); width: 160px; flex-shrink: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ce-critere-bar { flex: 1; }
.ce-critere-bar__track { height: 6px; border-radius: 3px; background: var(--vd-border); overflow: hidden; }
.ce-critere-bar__fill  { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--vd-blue), var(--vd-gold)); transition: width 0.4s ease; }
.ce-critere-val { font-size: 12px; font-weight: 700; color: var(--vd-blue); width: 56px; text-align: right; flex-shrink: 0; }

.ce-no-detail { font-size: 13px; color: var(--vd-muted); padding: 16px; background: var(--vd-card); border-radius: 10px; text-align: center; }

/* ── Total & comment ────────────────────────────────────────────── */
.ce-total-bar {
  display: flex; justify-content: space-between; align-items: center;
  background: var(--vd-gold-tint); border: 1.5px solid rgba(245,166,35,.35);
  border-radius: 12px; padding: 12px 16px; margin-bottom: 14px;
}
.ce-total-bar__label { font-size: 13px; font-weight: 600; color: var(--vd-blue-dark); }
.ce-total-bar__val   { font-size: 22px; font-weight: 800; color: var(--vd-gold-dark); }

.ce-comment {
  display: flex; align-items: flex-start; gap: 9px;
  padding: 11px 14px; border-radius: 10px; margin-bottom: 16px;
  background: var(--vd-blue-tint); font-size: 13px; color: var(--vd-text);
  border: 1px solid rgba(61,96,128,.2);
}
.ce-comment svg { flex-shrink: 0; margin-top: 2px; color: var(--vd-blue); }

/* ── Transition ─────────────────────────────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .22s, transform .22s; }
.modal-fade-enter-from, .modal-fade-leave-to       { opacity: 0; transform: scale(.96); }
</style>