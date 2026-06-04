<template>
  <div class="fe-root">

    <!-- ── Page header ── -->
    <div class="fe-header">
      <div class="fe-header__left">
        <div class="fe-header__icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div>
          <h2 class="fe-page-title">Fiches d'évaluation</h2>
          <p class="fe-page-sub">Notes soumises par les présidents de jury</p>
          <div v-if="departementNom" class="fe-dept-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Département — {{ departementNom }}
          </div>
        </div>
      </div>

      <div class="fe-stat-pills">
        <div class="fe-stat-pill fe-stat-pill--success">
          <span class="fe-stat-pill__dot"></span>
          <span class="fe-stat-pill__num">{{ ficheStats.complets }}</span>
          <span class="fe-stat-pill__label">complet(s)</span>
        </div>
        <div class="fe-stat-pill fe-stat-pill--warning">
          <span class="fe-stat-pill__dot"></span>
          <span class="fe-stat-pill__num">{{ ficheStats.partiels }}</span>
          <span class="fe-stat-pill__label">partiel(s)</span>
        </div>
        <div class="fe-stat-pill fe-stat-pill--neutral">
          <span class="fe-stat-pill__dot"></span>
          <span class="fe-stat-pill__num">{{ ficheStats.aucun }}</span>
          <span class="fe-stat-pill__label">sans fiche</span>
        </div>
      </div>
    </div>

    <!-- ── Search ── -->
    <div class="fe-search-wrap">
      <svg class="fe-search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
           viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input v-model="searchFiche" class="fe-search" placeholder="Rechercher par étudiant, projet, président…" />
    </div>

    <!-- ── Loading ── -->
    <div v-if="loadingFiches" class="fe-state">
      <div class="fe-spinner"></div>
      <p class="fe-state__label">Chargement…</p>
    </div>

    <!-- ── Server error ── -->
    <div v-else-if="erreur" class="fe-state fe-state--err">
      <div class="fe-state__icon fe-state__icon--err">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <p class="fe-state__title">Chargement impossible</p>
      <p class="fe-state__sub">{{ erreur }}</p>
      <button class="fe-retry-btn" @click="chargerFiches">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        Réessayer
      </button>
    </div>

    <!-- ── Empty ── -->
    <div v-else-if="!fichesFiltered.length" class="fe-state">
      <div class="fe-state__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="1.4">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        </svg>
      </div>
      <p class="fe-state__title">Aucune fiche trouvée</p>
      <p class="fe-state__sub">Modifiez votre recherche ou vérifiez les données.</p>
    </div>

    <!-- ── Cards list ── -->
    <div v-else class="fe-list">
      <div
        v-for="g in fichesFiltered"
        :key="g.jury_id"
        class="fe-card"
        :class="{ 'fe-card--open': openGroupes.includes(g.jury_id) }"
      >
        <!-- Card header (clickable) -->
        <div class="fe-card__header" @click="toggleGroupe(g.jury_id)">
          <div class="fe-av fe-av--blue">{{ initiales(g.etudiant_nom) }}</div>

          <div class="fe-card__meta">
            <div class="fe-card__name">{{ g.etudiant_nom }}</div>
            <div class="fe-card__project">{{ g.projet_titre || '—' }}</div>
          </div>

          <!-- Soutenance date / salle chips -->
          <div class="fe-card__chips">
            <span v-if="g.date_soutenance" class="fe-chip fe-chip--date">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {{ formatDate(g.date_soutenance) }}<template v-if="g.heure_debut"> · {{ g.heure_debut }}</template>
            </span>
            <span v-if="g.salle" class="fe-chip fe-chip--salle">{{ g.salle }}</span>
          </div>

          <div class="fe-card__right">
            <span
              class="fe-badge"
              :class="presidentFiche(g) ? 'fe-badge--success' : g.fiches.length ? 'fe-badge--warning' : 'fe-badge--neutral'"
            >
              <span class="fe-badge__dot"></span>
              {{ presidentFiche(g) ? 'Complet' : g.fiches.length ? 'Partiel' : 'Aucune fiche' }}
            </span>
            <div class="fe-chevron" :class="{ 'fe-chevron--open': openGroupes.includes(g.jury_id) }">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>

        <!-- Expanded body -->
        <div v-if="openGroupes.includes(g.jury_id)" class="fe-card__body">

          <!-- Context strip: président · encadrant · résultat -->
          <div class="fe-context-strip">
            <div class="fe-context-item">
              <span class="fe-context-label">Président du jury</span>
              <span class="fe-context-val" :class="{ 'fe-context-val--missing': !g.president_nom }">
                <template v-if="g.president_nom">
                  <div class="fe-av fe-av--xs fe-av--blue">{{ initiales(g.president_nom) }}</div>
                  {{ g.president_nom }}
                </template>
                <template v-else>Non désigné</template>
              </span>
            </div>

            <div class="fe-context-item">
              <span class="fe-context-label">Encadrant</span>
              <span class="fe-context-val" :class="{ 'fe-context-val--missing': !g.encadrant_nom || g.encadrant_nom === '--' }">
                <template v-if="g.encadrant_nom && g.encadrant_nom !== '--'">
                  <div class="fe-av fe-av--xs fe-av--gold">{{ initiales(g.encadrant_nom) }}</div>
                  {{ g.encadrant_nom }}
                </template>
                <template v-else>—</template>
              </span>
            </div>

            <template v-if="g.resultat">
              <div class="fe-context-item">
                <span class="fe-context-label">Note finale</span>
                <span class="fe-context-val fe-context-val--score">
                  <span class="fe-score">{{ g.resultat.note_finale ?? '—' }}</span>
                  <span v-if="g.resultat.note_finale !== null" class="fe-score__denom">/20</span>
                </span>
              </div>

              <div v-if="g.resultat.mention" class="fe-context-item">
                <span class="fe-context-label">Mention</span>
                <span class="fe-mention-chip" :class="mentionClass(g.resultat.mention)">
                  {{ g.resultat.mention }}
                </span>
              </div>

              <div v-if="g.resultat.decision" class="fe-context-item">
                <span class="fe-context-label">Décision</span>
                <span class="fe-decision-chip" :class="g.resultat.decision === 'admis' ? 'fe-decision-chip--admis' : 'fe-decision-chip--ajourne'">
                  {{ g.resultat.decision === 'admis' ? '✓ Admis' : '✗ Ajourné' }}
                </span>
              </div>
            </template>
          </div>

          <!-- No fiches -->
          <div v-if="!g.fiches.length" class="fe-empty-row">
            Aucune fiche soumise pour ce jury.
          </div>

          <!-- Fiches table -->
          <div v-else class="fe-table-wrap">
            <table class="fe-table">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Rôle</th>
                  <th>Note</th>
                  <th>Finalisé</th>
                  <th>Soumis le</th>
                  <th>Commentaire</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="f in g.fiches" :key="f.id">
                  <tr class="fe-table__row" :class="{ 'fe-table__row--expanded': expandedFiches.includes(f.id) }">
                    <td>
                      <div class="fe-member">
                        <div class="fe-av fe-av--sm" :class="f.fonction === 'president' ? 'fe-av--blue' : 'fe-av--gold'">
                          {{ initiales(f.membre_nom) }}
                        </div>
                        <div>
                          <div class="fe-member__name">{{ f.membre_nom }}</div>
                          <div v-if="f.fonction === 'president'" class="fe-member__sub">Président</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="fe-role-badge"
                        :class="f.fonction === 'president' ? 'fe-role-badge--president' : f.fonction === 'encadrant' ? 'fe-role-badge--encadrant' : 'fe-role-badge--examiner'">
                        {{ roleLabel(f.fonction) }}
                      </span>
                    </td>
                    <td>
                      <div class="fe-note">
                        <span class="fe-note__val">{{ f.note_totale ?? '—' }}</span>
                        <span v-if="f.note_totale !== null" class="fe-note__denom">/20</span>
                      </div>
                    </td>
                    <td>
                      <span class="fe-finalise" :class="f.finalise ? 'fe-finalise--yes' : 'fe-finalise--no'">
                        <svg v-if="f.finalise" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        {{ f.finalise ? 'Oui' : 'Non' }}
                      </span>
                    </td>
                    <td>
                      <span class="fe-date">{{ f.date_soumission || '—' }}</span>
                    </td>
                    <td>
                      <div class="fe-comment-cell">
                        <span v-if="f.commentaire" class="fe-comment-text">{{ f.commentaire }}</span>
                        <span v-else class="fe-comment-empty">—</span>
                        <button
                          v-if="f.categories?.length"
                          class="fe-detail-toggle"
                          :class="{ 'fe-detail-toggle--open': expandedFiches.includes(f.id) }"
                          @click.stop="toggleFiche(f.id)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                          Détail grille
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Criteria breakdown row -->
                  <tr v-if="expandedFiches.includes(f.id) && f.categories?.length" class="fe-table__detail-row">
                    <td colspan="6">
                      <div class="fe-grille">
                        <div v-for="cat in f.categories" :key="cat.id" class="fe-grille__cat">
                          <div class="fe-grille__cat-header">
                            <span class="fe-grille__cat-nom">{{ cat.nom }}</span>
                            <span class="fe-grille__cat-note">{{ cat.note }} / {{ cat.bareme }}</span>
                          </div>
                          <div class="fe-grille__criteres">
                            <div v-for="c in cat.criteres" :key="c.id" class="fe-grille__critere">
                              <span class="fe-grille__critere-nom">{{ c.nom }}</span>
                              <span class="fe-grille__critere-score">
                                <span class="fe-grille__score-bar-wrap">
                                  <span class="fe-grille__score-bar" :style="{ width: ((c.note / c.bareme) * 100) + '%' }"></span>
                                </span>
                                {{ c.note }} / {{ c.bareme }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'FichesEvaluation',
  emits: ['toast'],
  props: {
    currentUser: { type: Object, default: null },
  },

  data () {
    return {
      loadingFiches:  false,
      ficheGroupes:   [],
      openGroupes:    [],
      expandedFiches: [],
      searchFiche:    '',
      erreur:         null,
    }
  },

  computed: {
    departementNom () {
      return this.currentUser?.specialite_nom
          || this.currentUser?.departement_nom
          || this.currentUser?.specialite
          || null
    },
    ficheStats () {
      return {
        total:    this.ficheGroupes.length,
        complets: this.ficheGroupes.filter(g => this.presidentFiche(g)).length,
        partiels: this.ficheGroupes.filter(g => g.fiches.length > 0 && !this.presidentFiche(g)).length,
        aucun:    this.ficheGroupes.filter(g => g.fiches.length === 0).length,
      }
    },
    fichesFiltered () {
      if (!this.searchFiche) return this.ficheGroupes
      const q = this.searchFiche.toLowerCase()
      return this.ficheGroupes.filter(g =>
        g.etudiant_nom.toLowerCase().includes(q) ||
        (g.projet_titre    || '').toLowerCase().includes(q) ||
        (g.president_nom   || '').toLowerCase().includes(q) ||
        (g.encadrant_nom   || '').toLowerCase().includes(q)
      )
    },
  },

  mounted () { this.chargerFiches() },

  methods: {
    initiales (n) {
      return (n || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    },
    roleLabel (r) {
      return { president: 'Président', encadrant: 'Encadrant', examinateur: 'Examinateur' }[r] || r
    },
    mentionClass (mention) {
      const m = (mention || '').toLowerCase()
      if (m.includes('très bien')) return 'fe-mention--tbien'
      if (m.includes('bien'))      return 'fe-mention--bien'
      if (m.includes('assez'))     return 'fe-mention--abien'
      if (m.includes('passable'))  return 'fe-mention--pass'
      return 'fe-mention--insuf'
    },
    formatDate (d) {
      if (!d) return '—'
      const [y, m, day] = String(d).split('-')
      return `${day}/${m}/${y}`
    },
    toggleGroupe (id) {
      const i = this.openGroupes.indexOf(id)
      if (i >= 0) this.openGroupes.splice(i, 1)
      else this.openGroupes.push(id)
    },
    toggleFiche (id) {
      const i = this.expandedFiches.indexOf(id)
      if (i >= 0) this.expandedFiches.splice(i, 1)
      else this.expandedFiches.push(id)
    },
    presidentFiche (g) {
      return (g.fiches || []).find(f => f.fonction === 'president' && f.finalise)
    },
    async chargerFiches () {
      this.loadingFiches = true
      this.erreur        = null
      try {
        const r = await api.get('/fiches-evaluation')
        this.ficheGroupes = Array.isArray(r.data) ? r.data : []
      } catch (e) {
        const status = e?.response?.status
        if (status === 500) {
          this.erreur = "Erreur serveur lors du chargement des fiches (500). Contactez l'administrateur."
        } else if (status === 403) {
          this.erreur = "Accès refusé. Vous n'avez pas les droits pour consulter ces fiches."
        } else {
          this.erreur = "Impossible de charger les fiches d'évaluation."
        }
        this.$emit('toast', { type: 'toast-err', message: this.erreur })
        console.error('[FichesEvaluation]', e)
      } finally {
        this.loadingFiches = false
      }
    },
  },
}
</script>

<style scoped>
/* ══════════════════════════════════════════════
   FichesEvaluation — scoped premium styles
   ══════════════════════════════════════════════ */
.fe-root { display:flex; flex-direction:column; gap:1.5rem; }

/* Header */
.fe-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
.fe-header__left { display:flex; align-items:center; gap:.9rem; }
.fe-header__icon-wrap { display:flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:var(--vld-r-md); flex-shrink:0; background:linear-gradient(135deg, var(--vld-primary), var(--vld-primary-dark)); color:#fff; box-shadow:0 4px 12px rgba(61,96,128,.30); }
.fe-page-title { font-family:var(--vld-font-display); font-size:1.35rem; font-weight:800; color:var(--vld-text-strong); margin:0; line-height:1.2; }
.fe-page-sub   { font-size:.83rem; color:var(--vld-text-muted); margin:.15rem 0 .35rem; }

.fe-dept-badge {
  display:inline-flex; align-items:center; gap:.38rem;
  padding:.22rem .75rem; border-radius:var(--vld-r-full);
  background:linear-gradient(135deg, rgba(61,96,128,.1), rgba(61,96,128,.06));
  border:1.5px solid rgba(61,96,128,.22);
  font-size:.75rem; font-weight:700; color:var(--vld-primary-dark);
  letter-spacing:.02em;
}
.fe-dept-badge svg { flex-shrink:0; stroke:var(--vld-primary); }

/* Stat pills */
.fe-stat-pills { display:flex; gap:.5rem; flex-wrap:wrap; }
.fe-stat-pill { display:inline-flex; align-items:center; gap:.45rem; padding:.38rem .85rem; border-radius:var(--vld-r-full); font-size:.8rem; font-weight:600; border:1.5px solid transparent; transition:transform .14s var(--vld-ease); }
.fe-stat-pill:hover { transform:translateY(-1px); }
.fe-stat-pill__dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.fe-stat-pill__num { font-family:var(--vld-font-display); font-size:.88rem; font-weight:800; }
.fe-stat-pill--success { background:var(--vld-success-bg); color:var(--vld-success); border-color:rgba(30,158,96,.22); }
.fe-stat-pill--success .fe-stat-pill__dot { background:var(--vld-success); }
.fe-stat-pill--warning { background:var(--vld-warning-bg); color:var(--vld-warning); border-color:rgba(224,144,32,.28); }
.fe-stat-pill--warning .fe-stat-pill__dot { background:var(--vld-warning); }
.fe-stat-pill--neutral { background:var(--vld-surface-alt); color:var(--vld-text-muted); border-color:var(--vld-border); }
.fe-stat-pill--neutral .fe-stat-pill__dot { background:var(--vld-text-faint); }

/* Search */
.fe-search-wrap { position:relative; max-width:420px; }
.fe-search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:var(--vld-text-muted); pointer-events:none; }
.fe-search { width:100%; padding:.6rem 1rem .6rem 2.4rem; border-radius:var(--vld-r-lg); border:1.5px solid var(--vld-border); background:var(--vld-surface-alt); color:var(--vld-text-strong); font-family:var(--vld-font-body); font-size:.88rem; outline:none; transition:border-color var(--vld-t-base) var(--vld-ease), box-shadow var(--vld-t-base) var(--vld-ease); }
.fe-search::placeholder { color:var(--vld-text-faint); }
.fe-search:focus { border-color:var(--vld-primary); box-shadow:0 0 0 3px rgba(61,96,128,.13); }

/* State */
.fe-state { display:flex; flex-direction:column; align-items:center; padding:3.5rem 1rem; gap:.75rem; color:var(--vld-text-muted); text-align:center; }
.fe-state--err { gap:.6rem; }
.fe-state__icon { width:72px; height:72px; display:flex; align-items:center; justify-content:center; border-radius:var(--vld-r-xl); background:var(--vld-surface-alt); border:1.5px solid var(--vld-border); color:var(--vld-text-faint); }
.fe-state__icon--err { background:var(--vld-danger-bg); border-color:rgba(217,64,64,.22); color:var(--vld-danger); }
.fe-state__title { font-size:1rem; font-weight:700; color:var(--vld-text-strong); margin:0; }
.fe-state__sub   { font-size:.83rem; margin:0; max-width:360px; }
.fe-spinner { width:32px; height:32px; border:3px solid var(--vld-border); border-top-color:var(--vld-primary); border-radius:50%; animation:fe-spin .75s linear infinite; }
@keyframes fe-spin { to { transform:rotate(360deg); } }
.fe-state__label { font-size:.85rem; color:var(--vld-text-muted); margin:0; }
.fe-retry-btn {
  display:inline-flex; align-items:center; gap:.45rem;
  margin-top:.25rem; padding:.45rem 1.1rem; border-radius:var(--vld-r-lg);
  background:var(--vld-primary); color:#fff; border:none;
  font-size:.82rem; font-weight:700; cursor:pointer; font-family:var(--vld-font-body);
  transition:background var(--vld-t-fast);
}
.fe-retry-btn:hover { background:var(--vld-primary-dark); }

/* Card list */
.fe-list { display:flex; flex-direction:column; gap:.7rem; }
.fe-card { background:var(--vld-surface); border:1.5px solid var(--vld-border); border-radius:var(--vld-r-xl); box-shadow:var(--vld-shadow-card); overflow:hidden; transition:box-shadow var(--vld-t-base) var(--vld-ease), border-color var(--vld-t-base) var(--vld-ease); }
.fe-card:hover { box-shadow:var(--vld-shadow-card-hover); border-color:var(--vld-border-strong); }
.fe-card--open { border-color:rgba(61,96,128,.35); box-shadow:0 4px 18px rgba(61,96,128,.10), 0 1px 3px rgba(0,0,0,.05); }

/* Card header */
.fe-card__header { display:flex; align-items:center; gap:.9rem; padding:.9rem 1.1rem; cursor:pointer; user-select:none; flex-wrap:wrap; transition:background var(--vld-t-fast); }
.fe-card__header:hover { background:var(--vld-surface-alt); }
.fe-card__meta { flex:1; min-width:0; display:flex; flex-direction:column; gap:.1rem; }
.fe-card__name { font-size:.93rem; font-weight:700; color:var(--vld-text-strong); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.fe-card__project { font-size:.78rem; color:var(--vld-text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.fe-card__right { display:flex; align-items:center; gap:.7rem; flex-shrink:0; margin-left:auto; }

/* Chips */
.fe-card__chips { display:flex; align-items:center; gap:.4rem; flex-wrap:wrap; }
.fe-chip { display:inline-flex; align-items:center; gap:.3rem; padding:.18rem .6rem; border-radius:var(--vld-r-full); font-size:.72rem; font-weight:600; border:1px solid transparent; }
.fe-chip--date  { background:var(--vld-info-bg); color:var(--vld-primary); border-color:rgba(61,96,128,.18); }
.fe-chip--salle { background:var(--vld-surface-alt); color:var(--vld-text-muted); border-color:var(--vld-border); }

/* Chevron */
.fe-chevron { color:var(--vld-text-faint); transition:transform var(--vld-t-base) var(--vld-ease), color var(--vld-t-base); line-height:1; }
.fe-chevron--open { transform:rotate(180deg); color:var(--vld-primary); }

/* Badge */
.fe-badge { display:inline-flex; align-items:center; gap:.35rem; padding:.28rem .75rem; border-radius:var(--vld-r-full); font-size:.75rem; font-weight:700; border:1.5px solid transparent; }
.fe-badge__dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
.fe-badge--success { background:var(--vld-success-bg); color:var(--vld-success); border-color:rgba(30,158,96,.20); }
.fe-badge--success .fe-badge__dot { background:var(--vld-success); }
.fe-badge--warning { background:var(--vld-warning-bg); color:var(--vld-warning); border-color:rgba(224,144,32,.25); }
.fe-badge--warning .fe-badge__dot { background:var(--vld-warning); }
.fe-badge--neutral { background:var(--vld-surface-alt); color:var(--vld-text-muted); border-color:var(--vld-border); }
.fe-badge--neutral .fe-badge__dot { background:var(--vld-text-faint); }

/* Avatar */
.fe-av { display:flex; align-items:center; justify-content:center; font-weight:800; border-radius:var(--vld-r-md); flex-shrink:0; letter-spacing:.03em; width:38px; height:38px; font-size:.78rem; }
.fe-av--xs { width:20px; height:20px; font-size:.58rem; border-radius:var(--vld-r-xs); }
.fe-av--sm { width:28px; height:28px; font-size:.7rem;  border-radius:var(--vld-r-sm); }
.fe-av--blue { background:linear-gradient(135deg, var(--vld-primary-light), var(--vld-primary-dark)); color:#fff; box-shadow:0 2px 8px rgba(61,96,128,.28); }
.fe-av--gold { background:linear-gradient(135deg, var(--vld-gold), var(--vld-accent)); color:#1e2a35; box-shadow:0 2px 6px rgba(245,197,24,.32); }

/* Card body */
.fe-card__body { border-top:1.5px solid var(--vld-border); background:linear-gradient(to bottom, var(--vld-surface-alt), var(--vld-surface-raised)); animation:fe-expand .18s var(--vld-ease) both; }
@keyframes fe-expand { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }

/* Context strip */
.fe-context-strip { display:flex; align-items:stretch; flex-wrap:wrap; padding:.8rem 1.1rem; gap:1.4rem; border-bottom:1px solid var(--vld-border); background:rgba(0,0,0,.02); }
.fe-context-item  { display:flex; flex-direction:column; gap:.3rem; }
.fe-context-label { font-size:.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--vld-text-faint); }
.fe-context-val   { display:flex; align-items:center; gap:.4rem; font-size:.85rem; font-weight:600; color:var(--vld-text-strong); }
.fe-context-val--missing { color:var(--vld-text-faint); font-weight:400; font-style:italic; }
.fe-context-val--score   { gap:.2rem; }
.fe-score        { font-family:var(--vld-font-display); font-size:1.15rem; font-weight:800; color:var(--vld-text-strong); }
.fe-score__denom { font-size:.75rem; color:var(--vld-text-faint); }

/* Mention */
.fe-mention-chip { display:inline-block; padding:.22rem .7rem; border-radius:var(--vld-r-full); font-size:.76rem; font-weight:700; border:1px solid transparent; }
.fe-mention--tbien { background:rgba(30,158,96,.12);  color:var(--vld-success);      border-color:rgba(30,158,96,.22); }
.fe-mention--bien  { background:rgba(61,96,128,.12);  color:var(--vld-primary-dark); border-color:rgba(61,96,128,.22); }
.fe-mention--abien { background:var(--vld-info-bg);   color:var(--vld-primary);      border-color:rgba(61,96,128,.18); }
.fe-mention--pass  { background:var(--vld-warning-bg);color:var(--vld-warning);      border-color:rgba(224,144,32,.25); }
.fe-mention--insuf { background:var(--vld-danger-bg); color:var(--vld-danger);       border-color:rgba(217,64,64,.22); }

/* Decision */
.fe-decision-chip { display:inline-block; padding:.22rem .7rem; border-radius:var(--vld-r-full); font-size:.76rem; font-weight:700; border:1px solid transparent; }
.fe-decision-chip--admis   { background:var(--vld-success-bg); color:var(--vld-success); border-color:rgba(30,158,96,.22); }
.fe-decision-chip--ajourne { background:var(--vld-danger-bg);  color:var(--vld-danger);  border-color:rgba(217,64,64,.22); }

/* Table */
.fe-empty-row { padding:1.5rem; text-align:center; font-size:.83rem; color:var(--vld-text-muted); font-style:italic; }
.fe-table-wrap { overflow-x:auto; }
.fe-table { width:100%; border-collapse:collapse; font-size:.85rem; }
.fe-table thead tr { border-bottom:1.5px solid var(--vld-border); }
.fe-table th { padding:.6rem 1rem; text-align:left; font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--vld-text-faint); white-space:nowrap; }
.fe-table__row { transition:background var(--vld-t-fast); }
.fe-table__row:not(:last-of-type) { border-bottom:1px solid var(--vld-border); }
.fe-table__row:hover,
.fe-table__row--expanded { background:rgba(61,96,128,.04); }
.fe-table td { padding:.7rem 1rem; vertical-align:middle; color:var(--vld-text); }
.fe-table__detail-row td { padding:0; background:var(--vld-surface-raised); border-bottom:1px solid var(--vld-border); }

/* Member */
.fe-member { display:flex; align-items:center; gap:.55rem; }
.fe-member__name { font-size:.88rem; font-weight:600; color:var(--vld-text-strong); }
.fe-member__sub  { font-size:.72rem; color:var(--vld-primary); font-weight:600; }

/* Role badge */
.fe-role-badge { display:inline-block; padding:.22rem .65rem; border-radius:var(--vld-r-full); font-size:.73rem; font-weight:700; border:1px solid transparent; }
.fe-role-badge--president { background:var(--vld-gold-muted); color:#7a5000; border-color:rgba(245,197,24,.30); }
.fe-role-badge--encadrant { background:var(--vld-info-bg); color:var(--vld-primary-dark); border-color:rgba(61,96,128,.20); }
.fe-role-badge--examiner  { background:var(--vld-surface-alt); color:var(--vld-text-muted); border-color:var(--vld-border); }

/* Note */
.fe-note { display:flex; align-items:baseline; gap:.18rem; }
.fe-note__val   { font-family:var(--vld-font-display); font-size:1.05rem; font-weight:800; color:var(--vld-text-strong); }
.fe-note__denom { font-size:.73rem; color:var(--vld-text-faint); }

/* Finalised */
.fe-finalise { display:inline-flex; align-items:center; gap:.32rem; padding:.24rem .65rem; border-radius:var(--vld-r-full); font-size:.75rem; font-weight:700; border:1px solid transparent; }
.fe-finalise--yes { background:var(--vld-success-bg); color:var(--vld-success); border-color:rgba(30,158,96,.18); }
.fe-finalise--no  { background:var(--vld-surface-alt); color:var(--vld-text-faint); border-color:var(--vld-border); }

/* Date */
.fe-date { font-size:.8rem; color:var(--vld-text-muted); white-space:nowrap; }

/* Comment */
.fe-comment-cell  { display:flex; flex-direction:column; gap:.35rem; max-width:280px; }
.fe-comment-text  { font-size:.82rem; color:var(--vld-text); line-height:1.45; white-space:pre-wrap; word-break:break-word; }
.fe-comment-empty { font-size:.82rem; color:var(--vld-text-faint); }

/* Detail toggle */
.fe-detail-toggle { display:inline-flex; align-items:center; gap:.3rem; padding:.18rem .55rem; border-radius:var(--vld-r-sm); background:transparent; border:1px solid var(--vld-border); color:var(--vld-text-muted); font-size:.72rem; font-weight:600; font-family:var(--vld-font-body); cursor:pointer; transition:all var(--vld-t-fast); white-space:nowrap; }
.fe-detail-toggle:hover { border-color:var(--vld-primary); color:var(--vld-primary); background:var(--vld-info-bg); }
.fe-detail-toggle svg { transition:transform var(--vld-t-base) var(--vld-ease); }
.fe-detail-toggle--open svg { transform:rotate(180deg); }

/* Grille breakdown */
.fe-grille { display:flex; flex-direction:column; gap:.1rem; padding:.75rem 1.1rem 1rem; }
.fe-grille__cat { display:flex; flex-direction:column; gap:.35rem; padding:.6rem 0; border-bottom:1px dashed var(--vld-border); }
.fe-grille__cat:last-child { border-bottom:none; }
.fe-grille__cat-header { display:flex; align-items:center; justify-content:space-between; }
.fe-grille__cat-nom    { font-size:.8rem; font-weight:700; color:var(--vld-text-strong); }
.fe-grille__cat-note   { font-size:.8rem; font-weight:700; color:var(--vld-primary); }
.fe-grille__criteres   { display:flex; flex-direction:column; gap:.3rem; padding-left:.75rem; border-left:2px solid var(--vld-border); }
.fe-grille__critere    { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
.fe-grille__critere-nom   { font-size:.78rem; color:var(--vld-text-muted); flex:1; }
.fe-grille__critere-score { display:flex; align-items:center; gap:.55rem; font-size:.78rem; font-weight:600; color:var(--vld-text); white-space:nowrap; }
.fe-grille__score-bar-wrap { width:60px; height:5px; border-radius:3px; background:var(--vld-border); overflow:hidden; }
.fe-grille__score-bar { display:block; height:100%; border-radius:3px; background:linear-gradient(90deg, var(--vld-primary-light), var(--vld-primary)); transition:width .4s var(--vld-ease); }

/* Responsive */
@media (max-width:700px) {
  .fe-header { flex-direction:column; align-items:flex-start; }
  .fe-card__chips { display:none; }
  .fe-context-strip { gap:.75rem; }
  .fe-table th:nth-child(5), .fe-table td:nth-child(5) { display:none; }
}
</style>