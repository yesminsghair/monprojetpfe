<template>
  <div>

    <!-- GRILLES EN ATTENTE (shown when currentView === 'attente') -->
    <div v-if="currentView === 'attente'">
      <div class="mb-4">
        <h2 class="vld-page-title">Grilles en attente</h2>
        <p class="vld-page-sub">Grilles soumises par les chefs de specialite, en attente de validation</p>
      </div>

      <div v-if="loadingGrilles" class="vld-state">
        <div class="vld-spinner mx-auto mb-3"></div>
        <p>Chargement...</p>
      </div>

      <div v-else-if="!grillesAttente.length" class="vg-empty">
        <div class="vg-empty__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <p class="vg-empty__title">Aucune grille en attente</p>
        <p class="vg-empty__sub">Toutes les grilles soumises ont ete traitees.</p>
      </div>

      <div v-else class="d-flex flex-column gap-3">
        <div v-for="g in grillesAttente" :key="g.id" class="vg-card vg-card--pending">
          <div class="vg-card__left">
            <div class="vg-card__accent" style="background: var(--vld-accent)"></div>
            <div class="vg-card__info">
              <div class="vg-card__title">{{ g.chef_nom || '—' }}</div>
              <div class="vg-card__meta">
                <span v-if="g.chef_specialite" class="vg-meta-chip vg-meta-chip--spec">{{ g.chef_specialite }}</span>
                <span class="vg-meta-chip">{{ totalCategories(g) }} categorie(s)</span>
                <span class="vg-meta-chip">{{ totalCriteres(g) }} critere(s)</span>
                <span class="vg-meta-chip vg-meta-chip--date">
                  Soumise le {{ formatDate(g.publie_le || g.updated_at) }}
                </span>
              </div>
            </div>
          </div>
          <div class="vg-card__actions">
            <button class="vg-btn vg-btn--consult" @click="voirGrille(g)">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Consulter
            </button>
            <button class="vg-btn vg-btn--validate" @click="validerGrille(g)">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Valider
            </button>
            <button class="vg-btn vg-btn--reject" @click="rejeterGrille(g)">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Rejeter
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- GRILLES VALIDEES (shown when currentView === 'validees') -->
    <div v-else-if="currentView === 'validees'">
      <div class="mb-4">
        <h2 class="vld-page-title">Grilles validees</h2>
        <p class="vld-page-sub">Grilles approuvees et verrouillees</p>
      </div>

      <div v-if="loadingGrilles" class="vld-state">
        <div class="vld-spinner mx-auto mb-3"></div>
        <p>Chargement...</p>
      </div>

      <div v-else-if="!grillesValidesList.length" class="vg-empty">
        <div class="vg-empty__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
        </div>
        <p class="vg-empty__title">Aucune grille validee</p>
        <p class="vg-empty__sub">Les grilles validees apparaitront ici.</p>
      </div>

      <div v-else class="d-flex flex-column gap-3">
        <div v-for="g in grillesValidesList" :key="g.id" class="vg-card vg-card--validated">
          <div class="vg-card__left">
            <div class="vg-card__accent" style="background: #27ae60"></div>
            <div class="vg-card__info">
              <div class="vg-card__title">
                {{ g.chef_nom || '—' }}
                <span class="vg-validated-badge">Validee</span>
              </div>
              <div class="vg-card__meta">
                <span v-if="g.chef_specialite" class="vg-meta-chip vg-meta-chip--spec">{{ g.chef_specialite }}</span>
                <span class="vg-meta-chip">{{ totalCategories(g) }} categorie(s)</span>
                <span class="vg-meta-chip">{{ totalCriteres(g) }} critere(s)</span>
                <span class="vg-meta-chip vg-meta-chip--ok">Validee le {{ formatDate(g.verrouille_le) }}</span>
              </div>
            </div>
          </div>
          <div class="vg-card__actions">
            <button class="vg-btn vg-btn--consult" @click="voirGrille(g)">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Consulter
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CONSULTER GRILLE -->
    <Transition name="rm-modal">
      <div v-if="showGrilleModal" class="rm-overlay" @click.self="showGrilleModal = false">
        <div class="rm-modal rm-modal--consult">

          <!-- Modal header — dark navy like GestionGrille -->
          <div class="rm-modal__head rm-modal__head--consult">
            <div class="rm-modal__head-left">
              <div class="rm-modal__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <div>
                <div class="rm-modal__title">Grille d'evaluation PFE</div>
                <div class="rm-modal__sub">{{ grilleDetail && grilleDetail.chef_nom || '—' }} &mdash; {{ grilleDetail && grilleDetail.chef_specialite || '' }}</div>
              </div>
            </div>
            <button class="rm-modal__close" @click="showGrilleModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Info strip -->
          <div class="vg-modal-info-strip">
            <div class="vg-info-chip">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Soumise le {{ formatDate(grilleDetail && (grilleDetail.publie_le || grilleDetail.updated_at)) }}
            </div>
            <div v-if="grilleDetail && ['valide','publie','verrouille'].includes(grilleDetail.statut)" class="vg-info-chip vg-info-chip--ok">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Validee le {{ formatDate(grilleDetail && grilleDetail.verrouille_le) }}
            </div>
            <div class="vg-info-chip vg-info-chip--vis">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {{ grilleDetail && grilleDetail.visibilite === 'jury_only' ? 'Jurys uniquement' : 'Encadrants + Jurys' }}
            </div>
            <div class="vg-info-chip">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              {{ totalCategories(grilleDetail || {}) }} cat. / {{ totalCriteres(grilleDetail || {}) }} crit. / {{ totalBareme(grilleDetail || {}) }} pts
            </div>
          </div>

          <!-- Modal body — categories with their colors -->
          <div class="rm-modal__body vg-modal-body">
            <div
              v-for="cat in (grilleDetail && grilleDetail.categories || [])"
              :key="cat.id"
              class="vg-cat-block"
            >
              <!-- Category header — clickable to expand/collapse -->
              <div
                class="vg-cat-block__head"
                :style="{ background: cat.color || '#3d6080', cursor: 'pointer' }"
                @click="toggleCat(cat.id)"
              >
                <div class="vg-cat-block__accent" :style="{ background: 'rgba(255,255,255,0.45)' }"></div>
                <div class="vg-cat-block__name">{{ cat.nom }}</div>
                <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
                  <span class="vg-cat-block__badge" :style="{ background: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.40)', color: '#fff' }">
                    {{ cat.bareme_max }} pts max
                  </span>
                  <span class="vg-cat-count-badge" :style="{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.30)' }">
                    {{ (cat.criteres || []).length }} crit.
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2.5"
                    :style="{ transform: expandedCats[cat.id] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .22s' }"
                  ><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
              <!-- Criteres — shown only when expanded -->
              <Transition name="vg-expand">
                <div v-if="expandedCats[cat.id]" class="vg-cat-block__body">
                  <div v-if="!cat.criteres || !cat.criteres.length" class="vg-cat-block__empty">
                    Aucun critere
                  </div>
                  <div class="vg-cat-criteres-scroll">
                    <div
                      v-for="(cr, i) in (cat.criteres || [])"
                      :key="cr.id"
                      class="vg-cr-row"
                      :style="{ borderBottom: i < cat.criteres.length - 1 ? '1px solid var(--vld-border, #e8e4dc)' : 'none' }"
                    >
                      <div class="vg-cr-row__name">{{ cr.nom }}</div>
                      <div class="vg-cr-row__bar">
                        <div class="vg-cr-row__progress">
                          <div class="vg-cr-row__fill" :style="{ width: (cat.bareme_max ? (cr.bareme_max / cat.bareme_max * 100) : 0) + '%', background: cat.color || '#3d6080' }"></div>
                        </div>
                        <span class="vg-cr-row__pts" :style="{ color: cat.color || '#3d6080' }">{{ cr.bareme_max }} pt</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Footer -->
          <div class="rm-modal__foot rm-modal__foot--consult">
            <button class="rm-btn rm-btn--ghost" @click="showGrilleModal = false">Fermer</button>
          </div>

        </div>
      </div>
    </Transition>

    <!-- MODAL REJETER GRILLE -->
    <Transition name="rm-modal">
      <div v-if="showRejectModal" class="rm-overlay" @click.self="closeRejectModal">
        <div class="rm-modal rm-modal--reject">
          <div class="rm-modal__head rm-modal__head--reject">
            <div class="rm-modal__head-left">
              <div class="rm-modal__icon rm-modal__icon--reject">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <div>
                <div class="rm-modal__title">Rejeter la grille</div>
                <div class="rm-modal__sub">{{ rejectTarget && rejectTarget.chef_nom || '—' }} &mdash; {{ rejectTarget && rejectTarget.chef_specialite || '' }}</div>
              </div>
            </div>
            <button class="rm-modal__close" @click="closeRejectModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="rm-modal__body vg-reject-body">
            <div class="vg-reject-warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Le chef de specialite pourra corriger et resoumettre sa grille.
            </div>
            <div class="vg-reject-field">
              <label class="vg-reject-label">
                Motif du rejet <span class="vg-reject-optional">(optionnel)</span>
              </label>
              <textarea v-model="rejectReason" class="vg-reject-textarea" placeholder="Ex : Le bareme total depasse 20 pts, certains criteres manquent de precision..." rows="4"></textarea>
            </div>
          </div>
          <div class="rm-modal__foot rm-modal__foot--reject">
            <button class="rm-btn rm-btn--ghost" @click="closeRejectModal">Annuler</button>
            <button class="rm-btn rm-btn--danger" :disabled="rejectLoading" @click="confirmerRejet">
              <svg v-if="!rejectLoading" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span v-if="rejectLoading" class="vld-spinner vld-spinner--sm"></span>
              {{ rejectLoading ? 'Rejet en cours...' : 'Rejeter la grille' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'ValidationGrilles',

  props: {
    currentPage: { type: String, default: 'grilles-validation' },
  },

  emits: ['toast', 'grilles-count'],

  data () {
    return {
      grilles:         [],
      loadingGrilles:  false,
      showGrilleModal: false,
      grilleDetail:    null,
      expandedCats:    {},
      showRejectModal: false,
      rejectTarget:    null,
      rejectReason:    '',
      rejectLoading:   false,
    }
  },

  computed: {
    currentView () {
      return this.currentPage === 'grilles-validees' ? 'validees' : 'attente'
    },
    grillesAttente ()    { return this.grilles.filter(function (g) { return g.statut === 'en_attente' }) },
    grillesValidesList () { return this.grilles.filter(function (g) { return ['valide','publie','verrouille'].includes(g.statut) }) },
  },

  watch: {
    currentPage () { this.chargerGrilles() },
  },

  async mounted () {
    await this.chargerGrilles()
  },

  methods: {
    async chargerGrilles () {
      this.loadingGrilles = true
      try {
        const res = await api.get('/grilles')
        this.grilles = await Promise.all((res.data || []).map(async function (g) {
          try {
            const detail = await api.get('/grilles/' + g.id)
            const chef   = detail.data.chef
            return Object.assign({}, detail.data, {
              chef_nom:        chef ? (chef.prenom + ' ' + chef.nom) : '—',
              chef_specialite: (chef && chef.specialite && chef.specialite.nom) || null,
            })
          } catch (e) {
            return Object.assign({}, g, { chef_nom: '—', chef_specialite: null })
          }
        }))
      } catch (e) {
        this.grilles = []
      } finally {
        this.loadingGrilles = false
        this.$emit('grilles-count', this.grillesAttente.length)
      }
    },

    voirGrille (g) {
      this.grilleDetail    = g
      this.showGrilleModal = true
      var expanded = {}
      var cats = g.categories || []
      if (cats.length > 0) expanded[cats[0].id] = true
      this.expandedCats = expanded
    },

    async validerGrille (g) {
      try {
        await api.post('/grilles/' + g.id + '/verrouiller')
        const idx = this.grilles.findIndex(function (gr) { return gr.id === g.id })
        if (idx !== -1) {
          this.grilles[idx] = Object.assign({}, this.grilles[idx], {
            statut: 'valide',
            verrouille_le: new Date().toISOString(),
          })
        }
        this.$emit('grilles-count', this.grillesAttente.length)
        this.$emit('toast', { msg: 'Grille de ' + g.chef_nom + ' validée avec succès.', message: 'Grille de ' + g.chef_nom + ' validée avec succès.', type: 'ok', status: 'ok' })
      } catch (e) {
        this.$emit('toast', { msg: 'Erreur lors de la validation.', message: 'Erreur lors de la validation.', type: 'err', status: 'err' })
      }
    },

    rejeterGrille (g) {
      this.rejectTarget  = g
      this.rejectReason  = ''
      this.rejectLoading = false
      this.showRejectModal = true
    },

    closeRejectModal () {
      this.showRejectModal = false
      this.rejectTarget    = null
      this.rejectReason    = ''
      this.rejectLoading   = false
    },

    async confirmerRejet () {
      if (!this.rejectTarget) return
      this.rejectLoading = true
      const target = this.rejectTarget
      try {
        const payload = this.rejectReason.trim() ? { motif: this.rejectReason.trim() } : {}
        await api.post('/grilles/' + target.id + '/rejeter', payload)
        this.grilles = this.grilles.filter(function (gr) { return gr.id !== target.id })
        this.$emit('grilles-count', this.grillesAttente.length)
        this.$emit('toast', { msg: 'Grille de ' + target.chef_nom + ' rejetee.', message: 'Grille de ' + target.chef_nom + ' rejetee.', type: 'ok', status: 'ok' })
        this.closeRejectModal()
      } catch (e) {
        this.$emit('toast', { msg: 'Erreur lors du rejet.', message: 'Erreur lors du rejet.', type: 'err', status: 'err' })
        this.rejectLoading = false
      }
    },

    toggleCat (catId) {
      this.expandedCats = Object.assign({}, this.expandedCats, { [catId]: !this.expandedCats[catId] })
    },

    totalCategories (g) {
      return (g.categories || []).length
    },

    totalCriteres (g) {
      return (g.categories || []).reduce(function (s, c) { return s + (c.criteres ? c.criteres.length : 0) }, 0)
    },

    totalBareme (g) {
      return (g.categories || []).reduce(function (s, c) { return s + parseFloat(c.bareme_max || 0) }, 0).toFixed(2)
    },

    formatDate (d) {
      if (!d) return '—'
      try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) } catch (e) { return d }
    },
  },
}
</script>

<style scoped>

/* ── Card layout ── */
.vg-card {
  background: #fff;
  border-radius: 14px;
  border: 1.5px solid #e8e4dc;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0;
  overflow: hidden;
  transition: box-shadow .18s;
}
.vg-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,.11); }

.vg-card__left {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-width: 0;
}
.vg-card__accent {
  width: 5px;
  flex-shrink: 0;
}
.vg-card__info {
  padding: 16px 18px;
  flex: 1;
  min-width: 0;
}
.vg-card__title {
  font-size: 15px;
  font-weight: 700;
  color: #1e2a35;
  margin-bottom: 7px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.vg-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.vg-meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: #f0ece4;
  color: #4a5a6a;
  border: 1px solid #ddd8ce;
}
.vg-meta-chip--spec  { background: #eaf3fb; color: #1a4a6e; border-color: #b8d8f0; }
.vg-meta-chip--pts   { background: #fffbf0; color: #7a4800; border-color: #f5c96a; font-weight: 700; }
.vg-meta-chip--ok    { background: #eafaf1; color: #1a7a40; border-color: #7dcea0; }
.vg-meta-chip--date  { background: #f5f0ff; color: #4a3080; border-color: #c8b8f0; }

.vg-validated-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: #27ae60;
  color: #fff;
  letter-spacing: .03em;
}

.vg-card__actions {
  display: flex;
  gap: 8px;
  padding: 16px 18px;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
}

/* ── Buttons ── */
.vg-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 15px;
  border-radius: 8px;
  border: 1.5px solid;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
}
.vg-btn--consult {
  background: #fff;
  border-color: #b8c8d8;
  color: #2f4f6a;
}
.vg-btn--consult:hover { background: #eaf3fb; border-color: #2f4f6a; }
.vg-btn--validate {
  background: linear-gradient(135deg, #27ae60 0%, #1a8a48 100%);
  border-color: #1a8a48;
  color: #fff;
  box-shadow: 0 2px 8px rgba(39,174,96,.28);
}
.vg-btn--validate:hover { background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); box-shadow: 0 4px 14px rgba(39,174,96,.40); }
.vg-btn--reject {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  border-color: #c0392b;
  color: #fff;
  box-shadow: 0 2px 8px rgba(192,57,43,.28);
}
.vg-btn--reject:hover { background: linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%); box-shadow: 0 4px 14px rgba(192,57,43,.40); }

/* ── Empty state ── */
.vg-empty {
  text-align: center;
  padding: 60px 24px;
  background: #fff;
  border-radius: 16px;
  border: 2px dashed #d8d4cc;
}
.vg-empty__icon { color: #b0a898; margin-bottom: 16px; }
.vg-empty__title { font-size: 16px; font-weight: 700; color: #2a3a4a; margin: 0 0 6px; }
.vg-empty__sub { font-size: 13px; color: #7a8a9a; margin: 0; }

/* ── MODAL overlay & shell (same as GestionGrille) ── */
.rm-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(10,18,28,.52);
  backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.rm-modal {
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0,0,0,.08), 0 24px 64px rgba(0,0,0,.28), 0 0 0 1px rgba(255,255,255,.06);
}
.rm-modal--consult {
  max-width: 580px;
  max-height: 90vh;
  height: 90vh;
  background: #f5f8ff;
  border: 1.5px solid rgba(47,79,106,.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.rm-modal__head--consult {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #2f4f6a 0%, #1a3248 100%);
  flex-shrink: 0;
}
.rm-modal__head-left { display: flex; align-items: center; gap: 13px; flex: 1; min-width: 0; }
.rm-modal__icon {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: rgba(255,255,255,.18); border: 1.5px solid rgba(255,255,255,.28);
  display: flex; align-items: center; justify-content: center; color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
}
.rm-modal__title { font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 2px; font-family: 'Merriweather', serif; }
.rm-modal__sub   { font-size: 11.5px; color: rgba(255,255,255,.65); font-weight: 500; }
.rm-modal__close {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  background: rgba(255,255,255,.14); border: none; color: rgba(255,255,255,.75);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .12s, color .12s;
}
.rm-modal__close:hover { background: rgba(255,255,255,.28); color: #fff; }

/* Info strip below header */
.vg-modal-info-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 20px;
  background: #edf2f7;
  border-bottom: 1.5px solid rgba(47,79,106,.12);
  flex-shrink: 0;
}
.vg-info-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: #fff;
  color: #4a5a6a;
  border: 1px solid #c8d4e0;
}
.vg-info-chip--ok  { background: #eafaf1; color: #1a7a40; border-color: #7dcea0; }
.vg-info-chip--vis { background: #eaf3fb; color: #1a4a6e; border-color: #b8d8f0; }

/* Modal body */
.rm-modal__body { padding: 0; display: flex; flex-direction: column; background: #f5f8ff; flex: 1; min-height: 0; }
.vg-modal-body  {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: 14px 18px;
  display: flex; flex-direction: column; gap: 12px;
  scrollbar-width: thin; scrollbar-color: #b8c8d8 transparent;
}
.vg-modal-body::-webkit-scrollbar { width: 6px; }
.vg-modal-body::-webkit-scrollbar-track { background: transparent; }
.vg-modal-body::-webkit-scrollbar-thumb { background: #b8c8d8; border-radius: 99px; }

/* Category block */
.vg-cat-block {
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid #e0dcd4;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.vg-cat-block__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
}
.vg-cat-block__accent {
  width: 4px; height: 36px; border-radius: 3px; flex-shrink: 0;
}
.vg-cat-block__name {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}
.vg-cat-block__badge {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}
.vg-cat-block__body {
  background: #fff;
}
.vg-cat-block__empty {
  padding: 10px 16px;
  font-size: 12.5px;
  color: #9a8a7a;
  font-style: italic;
}

/* Critere row */
.vg-cr-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 16px;
}
.vg-cr-row__name {
  font-size: 13px;
  font-weight: 600;
  color: #2a3a4a;
  flex: 1;
}
.vg-cr-row__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.vg-cr-row__progress {
  width: 80px;
  height: 4px;
  border-radius: 99px;
  background: rgba(0,0,0,.08);
  overflow: hidden;
}
.vg-cr-row__fill {
  height: 100%;
  border-radius: 99px;
  transition: width .4s;
}
.vg-cr-row__pts {
  font-size: 13px;
  font-weight: 700;
  min-width: 40px;
  text-align: right;
}

/* Modal footer */
.rm-modal__foot--consult {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 22px;
  background: #edf2f7;
  border-top: 1.5px solid rgba(47,79,106,.12);
  flex-shrink: 0;
}
.rm-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 18px; border-radius: 8px; border: 1.5px solid;
  font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: .15s;
}
.rm-btn--ghost { background: #f5f3f0; border-color: #c8c4bc; color: #4a5a6a; }
.rm-btn--ghost:hover { background: #e8e4dc; color: #1e2a35; }

/* Transitions */
.rm-modal-enter-active, .rm-modal-leave-active { transition: all .22s; }
.rm-modal-enter-from, .rm-modal-leave-to { opacity: 0; transform: scale(.96) translateY(6px); }

/* Criteres scrollable list inside each category — capped at ~2.5 rows */
.vg-cat-criteres-scroll {
  max-height: 110px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #c8d4e0 transparent;
}
.vg-cat-criteres-scroll::-webkit-scrollbar { width: 5px; }
.vg-cat-criteres-scroll::-webkit-scrollbar-track { background: transparent; }
.vg-cat-criteres-scroll::-webkit-scrollbar-thumb { background: #c8d4e0; border-radius: 99px; }

/* Reject modal */
.rm-modal--reject { max-width: 480px; background: #fff; border: 1.5px solid rgba(192,57,43,.22); }
.rm-modal__head--reject {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #c0392b 0%, #922b21 100%);
}
.rm-modal__icon--reject { background: rgba(255,255,255,.18); border: 1.5px solid rgba(255,255,255,.28); }
.vg-reject-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; background: #fff; }
.vg-reject-warning {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 11px 14px; border-radius: 10px;
  background: #fff8f0; border: 1.5px solid #f5c96a; color: #7a4800;
  font-size: 13px; font-weight: 600;
}
.vg-reject-field { display: flex; flex-direction: column; gap: 6px; }
.vg-reject-label { font-size: 13px; font-weight: 700; color: #2a3a4a; display: flex; align-items: center; gap: 6px; }
.vg-reject-optional { font-size: 11.5px; font-weight: 500; color: #8a9aaa; }
.vg-reject-textarea {
  width: 100%; resize: vertical; border: 1.5px solid #c8d4e0; border-radius: 10px;
  padding: 10px 13px; font-size: 13px; color: #2a3a4a; background: #f7fafd;
  outline: none; font-family: inherit; transition: border-color .15s, box-shadow .15s;
  box-sizing: border-box; min-height: 90px;
}
.vg-reject-textarea:focus { border-color: #c0392b; box-shadow: 0 0 0 3px rgba(192,57,43,.1); background: #fff; }
.vg-reject-textarea::placeholder { color: #aab4be; }
.rm-modal__foot--reject {
  display: flex; justify-content: flex-end; gap: 8px; padding: 14px 20px;
  background: #fdf5f4; border-top: 1.5px solid rgba(192,57,43,.12);
}
.rm-btn--danger {
  display: flex; align-items: center; gap: 7px; padding: 8px 18px; border-radius: 8px;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  border: 1.5px solid #c0392b; color: #fff;
  font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: .15s;
  box-shadow: 0 2px 8px rgba(192,57,43,.25);
}
.rm-btn--danger:hover:not(:disabled) { background: linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%); }
.rm-btn--danger:disabled { opacity: .65; cursor: not-allowed; }
.vld-spinner--sm { width: 13px; height: 13px; border-width: 2px; }
</style>