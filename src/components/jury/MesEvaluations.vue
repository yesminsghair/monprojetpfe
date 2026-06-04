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

          <!-- Note preview (when evaluated) -->
          <div v-if="pc.presidentEvalue && pc.noteAffichee != null" class="ce-note-preview">
            <div class="ce-note-preview__left">
              <span class="ce-note-label">Note du président</span>
              <span class="ce-note-val">{{ pc.noteAffichee }}<span class="ce-note-denom">/20</span></span>
            </div>
            <!-- Visibility badge -->
            <span class="ce-vis-badge" :class="pc.visibilite === 'encadrant_jury' ? 'ce-vis-badge--full' : 'ce-vis-badge--partial'">
              <svg v-if="pc.visibilite === 'encadrant_jury'" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              {{ pc.visibilite === 'encadrant_jury' ? 'Grille complète' : 'Note finale' }}
            </span>
          </div>

          <!-- Not yet evaluated notice -->
          <div v-if="!pc.presidentEvalue" class="ce-pending-notice">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            L'évaluation du président n'a pas encore eu lieu.
          </div>

          <!-- President comment preview (encadrant_jury only, when evaluated) -->
          <div v-if="pc.presidentEvalue && pc.visibilite === 'encadrant_jury' && pc.commentairePreview" class="ce-comment-preview">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>{{ pc.commentairePreview }}</span>
          </div>

          <!-- Submission date (when evaluated) -->
          <div v-if="pc.presidentEvalue && pc.soumisLe" class="ce-card__date">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Soumis le {{ pc.soumisLe }}
          </div>

          <!-- Actions -->
          <div class="ce-card__actions">
            <!-- Consulter évaluation -->
            <button
              class="ce-btn ce-btn--consult"
              :class="{ 'ce-btn--disabled': !pc.presidentEvalue }"
              :disabled="!pc.presidentEvalue"
              :title="!pc.presidentEvalue ? 'Le président n\'a pas encore soumis son évaluation' : 'Consulter l\'évaluation du président'"
              @click="pc.presidentEvalue && consulter(pc)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Consulter l'évaluation
            </button>
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
                <span v-if="activeNote" class="ce-modal__vis-chip"
                  :class="activeNote.visibilite === 'encadrant_jury' ? 'ce-modal__vis-chip--full' : 'ce-modal__vis-chip--partial'">
                  {{ activeNote.visibilite === 'encadrant_jury' ? '👁 Grille complète' : '🔒 Note finale uniquement' }}
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

              <!-- ── jury_only mode: note finale only ── -->
              <template v-if="activeNote.visibilite === 'jury_only'">
                <div class="ce-jury-only-banner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></svg>
                  <div>
                    <strong>Visibilité restreinte</strong>
                    <p>Le chef de département a défini une visibilité « jury uniquement ». Seule la note finale est accessible.</p>
                  </div>
                </div>
                <div class="ce-note-only-card">
                  <div class="ce-note-only__circle">
                    <span class="ce-note-only__val">{{ safeNote(activeNote.note_totale) !== null ? safeNote(activeNote.note_totale).toFixed(2) : '—' }}</span>
                    <span class="ce-note-only__denom">/20</span>
                  </div>
                  <div class="ce-note-only__info">
                    <div class="ce-note-only__mention" :class="getMentionClass(activeNote.note_totale)">
                      {{ getMention(activeNote.note_totale) }}
                    </div>
                    <div class="ce-note-only__label">Note finale soumise par le président</div>
                    <div v-if="activeNote.soumis_le" class="ce-note-only__date">Soumis le {{ activeNote.soumis_le }}</div>
                  </div>
                </div>
              </template>

              <!-- ── encadrant_jury mode: full grille ── -->
              <template v-else>
                <!-- Grille par catégorie -->
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

            </template>

            <div v-else class="ce-no-detail">Le président n'a pas encore soumis son évaluation.</div>
          </div>

          <!-- Footer with note + comment (hidden for jury_only comment, shown for encadrant_jury) -->
          <div v-if="activeNote && !loadingDetail" class="ce-modal__footer">
            <div class="ce-total-bar">
              <span class="ce-total-bar__label">Note totale du président</span>
              <strong class="ce-total-bar__val">{{ safeNote(activeNote.note_totale) !== null ? safeNote(activeNote.note_totale).toFixed(2) : '—' }} / 20</strong>
            </div>

            <!-- Comment: shown for encadrant_jury (with or without text) -->
            <div v-if="activeNote.visibilite === 'encadrant_jury'" class="ce-comment">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <div>
                <div class="ce-comment__label">Commentaire du président</div>
                <span v-if="activeNote.commentaire">{{ activeNote.commentaire }}</span>
                <span v-else style="font-style:italic;color:var(--vd-muted)">Aucun commentaire saisi.</span>
              </div>
            </div>

            <div v-if="activeNote.soumis_le" class="ce-modal__submitted">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Soumis le {{ activeNote.soumis_le }}
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
        const userId = this.currentUser.id

        const [jurysRes, notesRes] = await Promise.allSettled([
          api.get('/jurys-pfe'),
          api.get('/jurys-pfe/mes-notes'),
        ])
        const jurys    = jurysRes.status  === 'fulfilled' ? jurysRes.value.data  : []
        const mesNotes = notesRes.status  === 'fulfilled' ? notesRes.value.data  : []

        const soutenanceIdsWithMyNote = new Set(mesNotes.map(n => n.jury_id))

        this.projetsConsult = jurys
          .filter(j => {
            const isEncadrant    = j.encadrant_id    === userId
            const isExaminateur  = j.examinateur_id  === userId
            const isPresident    = j.president_id    === userId
            const juryPublie     = j.publie === true || j.publie === 1
            return (isEncadrant || isExaminateur) && !isPresident && juryPublie
          })
          .map(j => {
            const isEncadrant   = j.encadrant_id === userId
            const monRole       = isEncadrant ? 'encadrant' : 'examinateur'

            return {
              jury_id:            j.id,  // card key — also the soutenance ID
              soutenance_id:      j.soutenance_id, // confirmed from API: separate field
              projet_titre:       j.projet_titre  || '—',
              etudiant_id:        j.etudiant_id   || null,
              etudiant_nom:       j.etudiant_nom  || '—',
              president_id:       j.president_id  || null,
              monRole,
              // Will be set to true by chargerCarteInfo() when the API confirms
              // a finalised president evaluation exists. Never rely on the jury
              // list fields (president_note_id etc.) — those don't exist on the
              // Soutenance resource returned by /jurys-pfe.
              presidentEvalue:    false,
              noteAffichee:       null,
              visibilite:         null,
              commentairePreview: null,
              soumisLe:           null,
            }
          })

        // Call chargerCarteInfo for ALL cards — the API response itself tells us
        // whether the president has submitted (non-null = submitted). We cannot
        // rely on the jury list payload to know this in advance.
        await Promise.allSettled(
          this.projetsConsult.map(pc => this.chargerCarteInfo(pc))
        )
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    // Loads card-level info by calling the evaluation-recue endpoint.
    // If the president has not yet submitted, the endpoint returns null and
    // presidentEvalue stays false. If it returns data, we set presidentEvalue = true
    // so the card and "Consulter" button become visible.
    async chargerCarteInfo (pc) {
      try {
        const res  = await api.get(`/jurys-pfe/${pc.soutenance_id}/evaluation-recue`)
        const data = res.data
        // null, or object without soumis_le → president hasn't submitted yet
        if (!data || !data.soumis_le) return

        // Use index-based replacement so Vue's reactivity detects the change.
        const idx = this.projetsConsult.findIndex(p => p.jury_id === pc.jury_id)
        if (idx === -1) return

        const commentairePreview = (data.visibilite === 'encadrant_jury' && data.commentaire)
          ? (data.commentaire.length > 80 ? data.commentaire.slice(0, 80) + '\u2026' : data.commentaire)
          : null

        this.projetsConsult.splice(idx, 1, {
          ...this.projetsConsult[idx],
          presidentEvalue:    true,
          noteAffichee:       (parseFloat(String(data.note).replace(',','.')) || 0).toFixed(2),
          visibilite:         data.visibilite || 'jury_only',
          soumisLe:           data.soumis_le  || null,
          commentairePreview,
        })
      } catch (e) {
        // Non-blocking — 403 means we're not in this jury or president hasn't submitted
        console.warn('chargerCarteInfo:', e)
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
        const res      = await api.get(`/livrables/soutenance/${pc.soutenance_id}`)
        const livrables = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : [])

        const livrable = livrables.find(l =>
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

    // ── Consulter évaluation ────────────────────────────────────────
    async consulter (pc) {
      if (!pc.presidentEvalue) return   // guard: no published result yet
      this.activeProjet  = pc
      this.activeNote    = null
      this.showModal     = true
      this.loadingDetail = true
      try {
        // Use the dedicated evaluation-recue endpoint which respects visibility rules
        const res  = await api.get(`/jurys-pfe/${pc.soutenance_id}/evaluation-recue`)
        const data = res.data

        if (data && data.soumis_le) {
          this.activeNote = {
            visibilite:  data.visibilite  || 'jury_only',
            note_totale: data.note,
            commentaire: data.commentaire || null,
            soumis_le:   data.soumis_le   || null,
            // categories only present for encadrant_jury
            categories:  data.categories  || [],
          }
          // Update card with fresh data
          pc.noteAffichee = (parseFloat(String(data.note).replace(',','.')) || 0).toFixed(2)
          pc.visibilite   = data.visibilite || 'jury_only'
          pc.soumisLe     = data.soumis_le  || null
          if (data.visibilite === 'encadrant_jury' && data.commentaire) {
            pc.commentairePreview = data.commentaire.length > 80
              ? data.commentaire.slice(0, 80) + '…'
              : data.commentaire
          }
        }
      } catch (e) {
        console.error(e)
        this.activeNote = null
      } finally {
        this.loadingDetail = false
      }
    },

    // Safely parse a note value from the API (may be string, null, or numeric)
    safeNote (val) {
      const n = parseFloat(String(val).replace(',', '.'))
      return isNaN(n) ? null : n
    },

    getMention (note) {
      const n = this.safeNote(note)
      if (n === null) return '—'
      if (n >= 16) return 'Très bien'
      if (n >= 14) return 'Bien'
      if (n >= 12) return 'Assez bien'
      if (n >= 10) return 'Passable'
      return 'Insuffisant'
    },

    getMentionClass (note) {
      const n = this.safeNote(note)
      if (n === null) return ''
      if (n >= 16) return 'ce-mention--tresb'
      if (n >= 14) return 'ce-mention--bien'
      if (n >= 12) return 'ce-mention--assezb'
      if (n >= 10) return 'ce-mention--passable'
      return 'ce-mention--insuf'
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
  --vd-green:     #059669;
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
.ce-card:hover .ce-card__date { color: rgba(255,255,255,0.55); }
.ce-card:hover .ce-card__date svg { stroke: rgba(255,255,255,0.5); }

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

.ce-card__date {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: var(--vd-muted); margin-bottom: 10px; transition: color 0.3s;
}

/* Note preview */
.ce-note-preview {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.3);
  border-radius: 10px; padding: 8px 12px; margin-bottom: 10px;
  transition: background 0.3s, border-color 0.3s;
}
.ce-card:hover .ce-note-preview { background: rgba(245,166,35,0.15); border-color: rgba(245,166,35,0.4); }
.ce-note-preview__left { display: flex; flex-direction: column; gap: 2px; }
.ce-note-label { font-size: 11.5px; font-weight: 600; color: var(--vd-muted); transition: color 0.3s; }
.ce-note-val   { font-size: 18px; font-weight: 800; color: var(--vd-blue); transition: color 0.3s; }
.ce-note-denom { font-size: 12px; font-weight: 600; opacity: 0.7; }

/* Visibility badge on card */
.ce-vis-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px;
  white-space: nowrap;
}
.ce-vis-badge--full    { background: rgba(5,150,105,0.12); color: #065f46; border: 1px solid rgba(5,150,105,0.25); }
.ce-vis-badge--partial { background: rgba(245,166,35,0.12); color: #92400e; border: 1px solid rgba(245,166,35,0.3); }
.ce-card:hover .ce-vis-badge--full    { background: rgba(5,150,105,0.2); }
.ce-card:hover .ce-vis-badge--partial { background: rgba(245,166,35,0.2); }

/* Comment preview on card */
.ce-comment-preview {
  display: flex; align-items: flex-start; gap: 6px;
  font-size: 11.5px; color: var(--vd-muted); font-style: italic;
  margin-bottom: 10px; line-height: 1.45; transition: color 0.3s;
  background: rgba(61,96,128,0.06); border-radius: 8px; padding: 7px 10px;
  border: 1px solid rgba(61,96,128,0.12);
}
.ce-comment-preview svg { flex-shrink: 0; margin-top: 2px; stroke: var(--vd-muted); transition: stroke 0.3s; }
.ce-card:hover .ce-comment-preview { color: rgba(255,255,255,0.65); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); }
.ce-card:hover .ce-comment-preview svg { stroke: rgba(255,255,255,0.5); }

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

.ce-btn--disabled,
.ce-btn--disabled:hover {
  opacity: 0.42; cursor: not-allowed; pointer-events: none;
  transform: none !important; box-shadow: none !important;
}

/* Pending notice on card */
.ce-pending-notice {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--vd-muted); font-style: italic;
  padding: 7px 10px; border-radius: 8px;
  background: rgba(0,0,0,0.04); border: 1px dashed var(--vd-border);
  margin-top: 2px;
}
.ce-pending-notice svg { flex-shrink: 0; stroke: var(--vd-muted); }

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
.ce-modal__vis-chip {
  font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
}
.ce-modal__vis-chip--full    { background: rgba(5,150,105,.25); color: #6ee7b7; border: 1px solid rgba(5,150,105,.4); }
.ce-modal__vis-chip--partial { background: rgba(239,68,68,.2); color: #fca5a5; border: 1px solid rgba(239,68,68,.35); }
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
.ce-modal__submitted {
  display: flex; align-items: center; gap: 5px;
  font-size: 11.5px; color: var(--vd-muted); margin-top: 10px;
}

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

/* ── jury_only mode ─────────────────────────────────────────────── */
.ce-jury-only-banner {
  display: flex; align-items: flex-start; gap: 12px;
  background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2);
  border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;
  color: var(--vd-text);
}
.ce-jury-only-banner svg { flex-shrink: 0; margin-top: 2px; stroke: var(--vd-red); }
.ce-jury-only-banner strong { font-size: 13px; font-weight: 700; color: var(--vd-red); display: block; margin-bottom: 3px; }
.ce-jury-only-banner p { font-size: 12.5px; color: var(--vd-muted); margin: 0; line-height: 1.5; }

.ce-note-only-card {
  display: flex; align-items: center; gap: 20px;
  background: var(--vd-gold-tint); border: 1.5px solid rgba(245,166,35,0.35);
  border-radius: 16px; padding: 20px 24px;
}
.ce-note-only__circle {
  width: 76px; height: 76px; border-radius: 50%;
  background: linear-gradient(135deg, var(--vd-gold), var(--vd-gold-dark));
  display: flex; align-items: center; justify-content: center; gap: 1px;
  flex-shrink: 0; box-shadow: 0 6px 20px rgba(245,166,35,0.35);
}
.ce-note-only__val   { font-size: 24px; font-weight: 900; color: #fff; line-height: 1; }
.ce-note-only__denom { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.75); line-height: 1; align-self: flex-end; padding-bottom: 2px; }
.ce-note-only__info  { display: flex; flex-direction: column; gap: 4px; }
.ce-note-only__mention { font-size: 15px; font-weight: 800; }
.ce-note-only__label  { font-size: 12px; color: var(--vd-muted); }
.ce-note-only__date   { font-size: 11px; color: var(--vd-muted); margin-top: 2px; }

/* Mention colors */
.ce-mention--tresb   { color: var(--vd-green); }
.ce-mention--bien    { color: #0891b2; }
.ce-mention--assezb  { color: var(--vd-blue); }
.ce-mention--passable{ color: var(--vd-gold-dark); }
.ce-mention--insuf   { color: var(--vd-red); }

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
  padding: 11px 14px; border-radius: 10px; margin-bottom: 12px;
  background: var(--vd-blue-tint); font-size: 13px; color: var(--vd-text);
  border: 1px solid rgba(61,96,128,.2);
}
.ce-comment svg { flex-shrink: 0; margin-top: 2px; color: var(--vd-blue); }
.ce-comment__label { font-size: 10.5px; font-weight: 700; color: var(--vd-blue); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }

/* ── Transition ─────────────────────────────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .22s, transform .22s; }
.modal-fade-enter-from, .modal-fade-leave-to       { opacity: 0; transform: scale(.96); }
</style>