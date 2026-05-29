<template>
  <div class="pfe-page">

    <!-- ══ HEADER ══ -->
    <div class="pfe-header pfe-header--gold">
      <div class="pfe-header__left">
        <div class="pfe-header__icon pfe-header__icon--gold">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <div>
          <h1 class="pfe-header__title">Bibliothèque PFE</h1>
          <p class="pfe-header__sub pfe-header__sub--gold">
            {{ resultats.length }} meilleur(s) projet(s) · mention ≥ Très Bien (16/20)
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
               placeholder="Nom, matricule, sujet, encadrant…" />
        <button v-if="search" class="pfe-search__clear" @click="search = ''">✕</button>
      </div>
      <div class="bib-years">
        <button
          v-for="y in annees" :key="y"
          class="bib-year-pill"
          :class="{ 'bib-year-pill--active': anneeFilter === y }"
          @click="anneeFilter = anneeFilter === y ? '' : y"
        >{{ y }}</button>
      </div>
    </div>

    <!-- ══ LOADING ══ -->
    <div v-if="loading" class="pfe-state">
      <div class="pfe-spinner pfe-spinner--lg"></div>
      <p class="pfe-state__sub">Chargement de la bibliothèque…</p>
    </div>

    <!-- ══ EMPTY ══ -->
    <div v-else-if="!filtered.length" class="pfe-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24"
           fill="none" stroke="var(--vld-text-faint)" stroke-width="1.3">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      <p class="pfe-state__title">
        {{ search || anneeFilter ? 'Aucun résultat correspondant' : 'Bibliothèque vide' }}
      </p>
      <p class="pfe-state__sub">Les projets distingués apparaissent ici après publication.</p>
    </div>

    <!-- ══ CARD GRID ══ -->
    <div v-else class="pfe-grid">
      <div
        v-for="(r, i) in filtered"
        :key="r.id"
        class="pfe-card-wrap"
        :style="{ animationDelay: (i * 0.04) + 's' }"
      >
        <div
          class="pfe-card pfe-card--biblio"
          :class="{ 'pfe-card--open': openId === r.id }"
          @click="toggle(r.id)"
        >
          <div class="pfe-card__body">
            <div class="pfe-card__top">
              <!-- Always gold avatar for biblio -->
              <div class="pfe-av pfe-av--gold">{{ initiales(r.nom) }}</div>

              <div class="pfe-card__info">
                <div class="pfe-card__name">{{ r.nom }}</div>
                <div class="pfe-card__mat">{{ r.matricule }}</div>
                <div class="pfe-card__sujet" :title="r.sujet">{{ r.sujet || '—' }}</div>
              </div>

              <div class="pfe-card__score">
                <div class="pfe-score-pill pfe-score-pill--pass">
                  <span class="pfe-score-num">{{ r.note }}</span>
                  <span class="pfe-score-denom">/20</span>
                </div>
                <span class="pfe-mention pfe-mention--tb">Très bien</span>
              </div>
            </div>

            <div class="pfe-card__meta">
              <span class="pfe-card__enc">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {{ r.encadrant_nom || '—' }}
              </span>
              <span class="pfe-year-tag">{{ r.annee }}</span>
            </div>
          </div>

          <div class="pfe-card__footer" @click.stop>
            <div class="pfe-card__badges">
              <span class="pfe-tag pfe-tag--biblio">⭐ En bibliothèque</span>
            </div>
          </div>

          <div class="pfe-chevron" :class="{ 'pfe-chevron--open': openId === r.id }">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        <!-- Detail panel -->
        <transition name="pfe-detail-expand">
          <div v-if="openId === r.id" class="pfe-detail" @click.stop>

            <!-- Encadrant & Promotion -->
            <div class="pfe-section">
              <div class="pfe-section__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Encadrant &amp; Promotion
              </div>
              <div class="pfe-detail-grid">
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Nom complet</div>
                  <div class="pfe-detail-val">{{ r.nom }}</div>
                </div>
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Matricule</div>
                  <div class="pfe-detail-val pfe-detail-val--code">{{ r.matricule }}</div>
                </div>
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Encadrant</div>
                  <div class="pfe-detail-val">{{ r.encadrant_nom || '—' }}</div>
                </div>
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Année universitaire</div>
                  <div class="pfe-detail-val">
                    <span class="pfe-year-tag">{{ r.annee }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sujet -->
            <div class="pfe-section">
              <div class="pfe-section__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                Sujet du projet
              </div>
              <div class="pfe-detail-val pfe-detail-val--sujet">{{ r.sujet || '—' }}</div>
            </div>

            <!-- Résultat -->
            <div class="pfe-section">
              <div class="pfe-section__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Résultat &amp; Mention
              </div>
              <div class="pfe-result-row">
                <div class="pfe-result-score pfe-result-score--pass">
                  <span class="pfe-result-num">{{ r.note }}</span>
                  <span class="pfe-result-denom">/20</span>
                </div>
                <div class="pfe-result-badges">
                  <span class="pfe-mention pfe-mention--tb" style="font-size:.82rem;padding:.3rem 1rem">
                    ⭐ Très bien
                  </span>
                  <span class="pfe-decision pfe-decision--admis" style="font-size:.82rem;padding:.3rem 1rem">
                    ✓ Admis
                  </span>
                </div>
              </div>
            </div>

          </div>
        </transition>
      </div>
    </div>

    <div v-if="!loading && filtered.length" class="bib-footer">
      {{ filtered.length }} projet(s) affiché(s) sur {{ resultats.length }}
    </div>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'BiblioPfe',
  emits: ['toast'],
  data () {
    return { resultats: [], loading: false, search: '', anneeFilter: '', openId: null }
  },
  computed: {
    annees () {
      return [...new Set(this.resultats.map(r => r.annee).filter(Boolean))].sort().reverse()
    },
    filtered () {
      let list = this.resultats
      if (this.anneeFilter) list = list.filter(r => r.annee === this.anneeFilter)
      if (this.search.trim()) {
        const q = this.search.toLowerCase()
        list = list.filter(r =>
          (r.nom           || '').toLowerCase().includes(q) ||
          (r.matricule     || '').toLowerCase().includes(q) ||
          (r.sujet         || '').toLowerCase().includes(q) ||
          (r.encadrant_nom || '').toLowerCase().includes(q) ||
          (r.annee         || '').toLowerCase().includes(q)
        )
      }
      return list
    },
  },
  mounted () { this.charger() },
  methods: {
    async charger () {
      this.loading = true
      try { const { data } = await api.get('/resultats-pfe/bibliotheque'); this.resultats = Array.isArray(data) ? data : [] }
      catch { this.$emit('toast', { type: 'error', message: 'Erreur lors du chargement.' }) }
      finally { this.loading = false }
    },
    toggle (id) { this.openId = this.openId === id ? null : id },
    initiales (nom) { return (nom || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() },
  },
}
</script>