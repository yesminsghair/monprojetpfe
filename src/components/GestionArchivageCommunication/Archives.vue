<template>
  <div class="pfe-page">

    <!-- ══ HEADER ══ -->
    <div class="pfe-header">
      <div class="pfe-header__left">
        <div class="pfe-header__icon pfe-header__icon--blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5"/>
            <line x1="10" y1="12" x2="14" y2="12"/>
          </svg>
        </div>
        <div>
          <h1 class="pfe-header__title">Archives PFE</h1>
          <p class="pfe-header__sub">
            {{ totalEtudiants }} étudiant(s) archivé(s) · {{ archives.length }} session(s)
          </p>
        </div>
      </div>
    </div>

    <!-- ══ TOOLBAR ══ -->
    <div class="pfe-toolbar">
      <div class="pfe-search">
        <svg class="pfe-search__icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
             viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" class="pfe-search__input"
               placeholder="Nom, matricule, projet, encadrant…" />
        <button v-if="search" class="pfe-search__clear" @click="search = ''">✕</button>
      </div>
    </div>

    <!-- ══ LOADING ══ -->
    <div v-if="loading" class="pfe-state">
      <div class="pfe-spinner pfe-spinner--lg"></div>
      <p class="pfe-state__sub">Chargement des archives…</p>
    </div>

    <!-- ══ EMPTY ══ -->
    <div v-else-if="!filteredArchives.length" class="pfe-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24"
           fill="none" stroke="var(--vld-text-faint)" stroke-width="1.3">
        <path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5"/>
      </svg>
      <p class="pfe-state__title">Aucune archive</p>
      <p class="pfe-state__sub">Les résultats archivés apparaîtront ici.</p>
    </div>

    <!-- ══ ARCHIVE GROUPS ══ -->
    <div v-else class="arc-groups">
      <div v-for="group in filteredArchives" :key="group.date" class="arc-group">

        <!-- Session group header -->
        <div class="arc-group__header">
          <div class="arc-group__header-left">
            <div class="arc-group__date-block">
              <span class="arc-date-day">{{ dayOf(group.date) }}</span>
              <span class="arc-date-month">{{ monthOf(group.date) }}</span>
              <span class="arc-date-year">{{ yearOf(group.date) }}</span>
            </div>
            <div>
              <div class="arc-group__title">Session du {{ formatDate(group.date) }}</div>
              <div class="arc-group__count">{{ group.data.length }} étudiant(s)</div>
            </div>
          </div>
          <button v-if="isDirecteur" class="arc-btn-del"
                  :disabled="deleting === group.date"
                  @click.stop="supprimerArchive(group.date)">
            <span v-if="deleting === group.date"
                  class="pfe-spinner pfe-spinner--sm"
                  style="border-top-color:var(--vld-danger)"/>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>
            Supprimer
          </button>
        </div>

        <!-- Student cards grid -->
        <div class="pfe-grid">
          <div
            v-for="e in group.data"
            :key="e.id"
            class="pfe-card-wrap"
          >
            <div
              class="pfe-card"
              :class="{ 'pfe-card--open': openId === e.id }"
              @click="toggle(e.id)"
            >
              <div class="pfe-card__body">
                <div class="pfe-card__top">
                  <div class="pfe-av" :class="e.note_finale >= 10 ? 'pfe-av--blue' : 'pfe-av--gold'">
                    {{ initiales(e.nom) }}
                  </div>
                  <div class="pfe-card__info">
                    <div class="pfe-card__name">{{ e.nom }}</div>
                    <div class="pfe-card__mat">{{ e.matricule }}</div>
                    <div class="pfe-card__sujet" :title="e.projet_titre">{{ e.projet_titre || '—' }}</div>
                  </div>
                  <div class="pfe-card__score">
                    <div class="pfe-score-pill"
                         :class="e.note_finale >= 10 ? 'pfe-score-pill--pass' : 'pfe-score-pill--fail'">
                      <span class="pfe-score-num">{{ e.note_finale }}</span>
                      <span class="pfe-score-denom">/20</span>
                    </div>
                    <span class="pfe-mention" :class="mentionClass(e.note_finale)">
                      {{ getMention(e.note_finale) }}
                    </span>
                  </div>
                </div>

                <div class="pfe-card__meta">
                  <span class="pfe-card__enc">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    {{ e.encadrant_nom || '—' }}
                  </span>
                  <span v-if="e.archive_le" class="pfe-archive-tag">{{ e.archive_le }}</span>
                </div>
              </div>

              <div class="pfe-card__footer" @click.stop>
                <div class="pfe-card__badges">
                  <span class="pfe-decision"
                        :class="e.decision === 'admis' ? 'pfe-decision--admis' : 'pfe-decision--ajourne'">
                    {{ e.decision === 'admis' ? '✓ Admis' : '✗ Ajourné' }}
                  </span>
                </div>
              </div>

              <div class="pfe-chevron" :class="{ 'pfe-chevron--open': openId === e.id }">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            <!-- Detail panel with full encadrant + jury + soutenance info -->
            <transition name="pfe-detail-expand">
              <div v-if="openId === e.id" class="pfe-detail" @click.stop>

                <!-- Étudiant -->
                <div class="pfe-section">
                  <div class="pfe-section__title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Étudiant
                  </div>
                  <div class="pfe-detail-grid">
                    <div class="pfe-detail-block">
                      <div class="pfe-detail-label">Nom complet</div>
                      <div class="pfe-detail-val">{{ e.nom }}</div>
                    </div>
                    <div class="pfe-detail-block">
                      <div class="pfe-detail-label">Matricule</div>
                      <div class="pfe-detail-val pfe-detail-val--code">{{ e.matricule }}</div>
                    </div>
                    <div class="pfe-detail-block pfe-detail-block--full">
                      <div class="pfe-detail-label">Sujet du projet</div>
                      <div class="pfe-detail-val pfe-detail-val--sujet">{{ e.projet_titre || '—' }}</div>
                    </div>
                  </div>
                </div>

                <!-- Encadrant -->
                <div class="pfe-section">
                  <div class="pfe-section__title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    Encadrant
                  </div>
                  <div class="pfe-detail-grid">
                    <div class="pfe-detail-block pfe-detail-block--full">
                      <div class="pfe-detail-label">Nom de l'encadrant</div>
                      <div class="pfe-detail-val">{{ e.encadrant_nom || '—' }}</div>
                    </div>
                  </div>
                </div>

                <!-- Jury & Soutenance -->
                <div class="pfe-section">
                  <div class="pfe-section__title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Jury &amp; Soutenance
                  </div>
                  <div class="pfe-detail-grid">
                    <div class="pfe-detail-block">
                      <div class="pfe-detail-label">Date de soutenance</div>
                      <div class="pfe-detail-val">
                        {{ e.date_soutenance ? formatDate(e.date_soutenance) : '—' }}
                      </div>
                    </div>
                    <div class="pfe-detail-block">
                      <div class="pfe-detail-label">Note jury</div>
                      <div class="pfe-detail-val">
                        <span v-if="e.note_jury != null" class="pfe-note-chip pfe-note-chip--jury">
                          {{ e.note_jury }}/20
                        </span>
                        <span v-else class="pfe-detail-val--muted">—</span>
                      </div>
                    </div>
                    <div class="pfe-detail-block">
                      <div class="pfe-detail-label">Note encadrant</div>
                      <div class="pfe-detail-val">
                        <span v-if="e.note_encadrant != null" class="pfe-note-chip pfe-note-chip--enc">
                          {{ e.note_encadrant }}/20
                        </span>
                        <span v-else class="pfe-detail-val--muted">—</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Résultat -->
                <div class="pfe-section">
                  <div class="pfe-section__title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <circle cx="12" cy="8" r="6"/>
                      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                    </svg>
                    Résultat
                  </div>
                  <div class="pfe-result-row">
                    <div class="pfe-result-score"
                         :class="e.note_finale >= 10 ? 'pfe-result-score--pass' : 'pfe-result-score--fail'">
                      <span class="pfe-result-num">{{ e.note_finale }}</span>
                      <span class="pfe-result-denom">/20</span>
                    </div>
                    <div class="pfe-result-badges">
                      <span class="pfe-mention" style="font-size:.82rem;padding:.3rem 1rem"
                            :class="mentionClass(e.note_finale)">{{ getMention(e.note_finale) }}</span>
                      <span class="pfe-decision" style="font-size:.82rem;padding:.3rem 1rem"
                            :class="e.decision === 'admis' ? 'pfe-decision--admis' : 'pfe-decision--ajourne'">
                        {{ e.decision === 'admis' ? '✓ Admis' : '✗ Ajourné' }}
                      </span>
                      <span v-if="e.publie_le"  class="pfe-publie-tag">Publié le {{ e.publie_le }}</span>
                      <span v-if="e.archive_le" class="pfe-archive-tag">Archivé le {{ e.archive_le }}</span>
                    </div>
                  </div>
                </div>

              </div>
            </transition>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'Archives',
  emits: ['toast'],
  props: {
    role: { type: String, default: 'chef' },
  },
  data () {
    return { archives: [], loading: false, deleting: null, search: '', openId: null }
  },
  computed: {
    isDirecteur () { return this.role === 'directeur' },
    totalEtudiants () { return this.archives.reduce((s, a) => s + a.data.length, 0) },
    filteredArchives () {
      if (!this.search.trim()) return this.archives
      const q = this.search.toLowerCase()
      return this.archives
        .map(a => ({ ...a, data: a.data.filter(e =>
          (e.nom           || '').toLowerCase().includes(q) ||
          (e.matricule     || '').toLowerCase().includes(q) ||
          (e.projet_titre  || '').toLowerCase().includes(q) ||
          (e.encadrant_nom || '').toLowerCase().includes(q)
        )}))
        .filter(a => a.data.length > 0)
    },
  },
  mounted () { this.chargerArchives() },
  methods: {
    async chargerArchives () {
      this.loading = true
      try { const { data } = await api.get('/resultats-pfe/archives'); this.archives = Array.isArray(data) ? data : [] }
      catch { this.$emit('toast', { type: 'error', message: 'Erreur lors du chargement des archives.' }) }
      finally { this.loading = false }
    },
    async supprimerArchive (date) {
      if (!confirm(`Supprimer l'archive du ${this.formatDate(date)} ?`)) return
      this.deleting = date
      try {
        await api.delete(`/resultats-pfe/archives/${date}`)
        this.archives = this.archives.filter(a => a.date !== date)
        this.$emit('toast', { type: 'ok', message: 'Archive supprimée.' })
      } catch (e) {
        this.$emit('toast', { type: 'error', message: e.response?.data?.message || 'Erreur.' })
      } finally { this.deleting = null }
    },
    toggle (id) { this.openId = this.openId === id ? null : id },
    initiales (n) { return (n || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() },
    getMention (n) {
      if (n == null) return '—'
      if (n >= 16) return 'Très bien'; if (n >= 14) return 'Bien'
      if (n >= 12) return 'Assez bien'; if (n >= 10) return 'Passable'
      return 'Insuffisant'
    },
    mentionClass (n) {
      if (n == null) return 'pfe-mention--neutral'
      if (n >= 16) return 'pfe-mention--tb'; if (n >= 14) return 'pfe-mention--bien'
      if (n >= 12) return 'pfe-mention--ab'; if (n >= 10) return 'pfe-mention--pass'
      return 'pfe-mention--fail'
    },
    formatDate (d) { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) },
    dayOf (d)   { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit' }) },
    monthOf (d) { return new Date(d).toLocaleDateString('fr-FR', { month: 'short' }).replace('.','').toUpperCase() },
    yearOf (d)  { return new Date(d).getFullYear() },
  },
}
</script>