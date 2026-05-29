<template>
  <div class="pfe-page">

    <!-- ══ HEADER ══════════════════════════════════════════ -->
    <div class="pfe-header">
      <div class="pfe-header__left">
        <div class="pfe-header__icon pfe-header__icon--gold">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="12" cy="8" r="6"/>
            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
        </div>
        <div>
          <h1 class="pfe-header__title">Résultats des soutenances</h1>
          <p class="pfe-header__sub">Délibération · Publication · Bibliothèque · Archivage</p>
        </div>
      </div>
      <div class="pfe-header__actions">
        <button v-if="hasUnpublished" class="pfe-btn pfe-btn--gold"
                :disabled="loadingPublierTous" @click="publierTous">
          <span v-if="loadingPublierTous" class="pfe-spinner pfe-spinner--sm pfe-spinner--dark"/>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
          </svg>
          Publier tout
        </button>
        <button v-if="hasPublishedUnarchived" class="pfe-btn pfe-btn--outline"
                :disabled="loadingArchiver" @click="archiverTous">
          <span v-if="loadingArchiver" class="pfe-spinner pfe-spinner--sm pfe-spinner--white"/>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5"/>
            <line x1="10" y1="12" x2="14" y2="12"/>
          </svg>
          Archiver tout
        </button>
      </div>
    </div>

    <!-- ══ STATS ════════════════════════════════════════════ -->
    <div v-if="!loading && resultats.length" class="rc-stats">
      <div class="rc-stat rc-stat--blue">
        <div class="rc-stat__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="rc-stat__body">
          <strong>{{ resultats.length }}</strong><span>Total délibérés</span>
        </div>
      </div>
      <div class="rc-stat rc-stat--gold">
        <div class="rc-stat__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
          </svg>
        </div>
        <div class="rc-stat__body">
          <strong>{{ resultats.filter(r => r.publie).length }}</strong><span>Publiés</span>
        </div>
      </div>
      <div class="rc-stat rc-stat--blue-light">
        <div class="rc-stat__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="rc-stat__body">
          <strong>{{ resultats.filter(r => r.decision === 'admis').length }}</strong><span>Admis</span>
        </div>
      </div>
      <div class="rc-stat rc-stat--gold-light">
        <div class="rc-stat__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="rc-stat__body">
          <strong>{{ resultats.filter(r => r.decision !== 'admis').length }}</strong><span>Ajournés</span>
        </div>
      </div>
      <div class="rc-stat rc-stat--blue-deep">
        <div class="rc-stat__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <div class="rc-stat__body">
          <strong>{{ resultats.filter(r => r.en_biblio).length }}</strong><span>Bibliothèque</span>
        </div>
      </div>
    </div>

    <!-- ══ TOOLBAR ══════════════════════════════════════════ -->
    <div class="pfe-toolbar">
      <div class="pfe-search">
        <svg class="pfe-search__icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
             viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" class="pfe-search__input" placeholder="Nom, matricule, projet…" />
        <button v-if="search" class="pfe-search__clear" @click="search = ''">✕</button>
      </div>
      <div class="pfe-pills">
        <button v-for="f in filters" :key="f.key" class="pfe-pill"
                :class="{ 'pfe-pill--active': activeFilter === f.key }"
                @click="activeFilter = f.key">{{ f.label }}</button>
      </div>
    </div>

    <!-- ══ LOADING ══════════════════════════════════════════ -->
    <div v-if="loading" class="pfe-state">
      <div class="pfe-spinner pfe-spinner--lg"></div>
      <p class="pfe-state__sub">Chargement des résultats…</p>
    </div>

    <!-- ══ EMPTY ════════════════════════════════════════════ -->
    <div v-else-if="!filtered.length" class="pfe-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24"
           fill="none" stroke="var(--vld-text-faint)" stroke-width="1.3">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
      <p class="pfe-state__title">
        {{ search || activeFilter !== 'tous' ? 'Aucun résultat correspondant' : 'Aucun résultat disponible' }}
      </p>
      <p class="pfe-state__sub">Les résultats apparaissent ici après délibération.</p>
    </div>

    <!-- ══ CARD GRID ════════════════════════════════════════ -->
    <div v-else class="pfe-grid">
      <div
        v-for="(r, i) in filtered"
        :key="r.id"
        class="pfe-card-wrap"
        :style="{ animationDelay: (i * 0.04) + 's' }"
      >
        <!-- Card -->
        <div
          class="pfe-card"
          :class="{
            'pfe-card--open':      openId === r.id,
            'pfe-card--unpublished': !r.publie,
            'pfe-card--biblio':    r.en_biblio,
          }"
          @click="toggle(r.id)"
        >
          <div class="pfe-card__body">
            <div class="pfe-card__top">
              <div class="pfe-av" :class="r.publie ? 'pfe-av--blue' : 'pfe-av--gold'">
                {{ initiales(r.etudiant_nom) }}
              </div>
              <div class="pfe-card__info">
                <div class="pfe-card__name">{{ r.etudiant_nom }}</div>
                <div class="pfe-card__mat">{{ r.matricule }}</div>
                <div class="pfe-card__sujet" :title="r.projet_titre">{{ r.projet_titre || '—' }}</div>
              </div>
              <div class="pfe-card__score">
                <div class="pfe-score-pill"
                     :class="r.note_finale >= 10 ? 'pfe-score-pill--pass' : 'pfe-score-pill--fail'">
                  <span class="pfe-score-num">{{ r.note_finale ?? '—' }}</span>
                  <span class="pfe-score-denom">/20</span>
                </div>
                <span class="pfe-mention" :class="mentionClass(r.note_finale)">
                  {{ getMention(r.note_finale) }}
                </span>
              </div>
            </div>

            <div class="pfe-card__meta">
              <span class="pfe-card__enc">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {{ r.encadrant_nom || '—' }}
              </span>
              <span v-if="r.date_soutenance" class="pfe-year-tag">
                {{ formatDateShort(r.date_soutenance) }}
              </span>
            </div>
          </div>

          <div class="pfe-card__footer" @click.stop>
            <div class="pfe-card__badges">
              <span class="pfe-decision"
                    :class="r.decision === 'admis' ? 'pfe-decision--admis' : 'pfe-decision--ajourne'">
                {{ r.decision === 'admis' ? '✓ Admis' : '✗ Ajourné' }}
              </span>
              <span v-if="r.publie" class="pfe-tag pfe-tag--published">
                Publié<span v-if="r.publie_le" class="pfe-tag__date"> · {{ r.publie_le }}</span>
              </span>
              <span v-if="r.en_biblio" class="pfe-tag pfe-tag--biblio">⭐</span>
            </div>
            <div class="pfe-card__actions">
              <button v-if="!r.publie" class="pfe-action pfe-action--publish"
                      :disabled="pendingId === r.id + '-pub'" @click="publierResultat(r)">
                <span v-if="pendingId === r.id + '-pub'" class="pfe-spinner pfe-spinner--xs pfe-spinner--dark"/>
                Publier
              </button>
              <button v-if="r.publie && r.note_finale >= 16 && !r.en_biblio"
                      class="pfe-action pfe-action--biblio"
                      :disabled="pendingId === r.id + '-bib'" @click="ajouterBiblio(r)">
                <span v-if="pendingId === r.id + '-bib'" class="pfe-spinner pfe-spinner--xs pfe-spinner--white"/>
                Biblio.
              </button>
              <button v-if="!r.publie && r.decision === 'admis'"
                      class="pfe-action pfe-action--ajourne"
                      :disabled="pendingId === r.id + '-adj'" @click="toggleDecision(r)">
                <span v-if="pendingId === r.id + '-adj'" class="pfe-spinner pfe-spinner--xs pfe-spinner--gold"/>
                Ajourner
              </button>
              <button v-else-if="!r.publie && r.decision !== 'admis'"
                      class="pfe-action pfe-action--readmit"
                      :disabled="pendingId === r.id + '-adj'" @click="toggleDecision(r)">
                <span v-if="pendingId === r.id + '-adj'" class="pfe-spinner pfe-spinner--xs pfe-spinner--white"/>
                Réadmettre
              </button>
              <button v-if="r.publie && !r.archive"
                      class="pfe-action pfe-action--archive"
                      :disabled="pendingId === r.id + '-arc'" @click="archiverResultat(r)">
                <span v-if="pendingId === r.id + '-arc'" class="pfe-spinner pfe-spinner--xs"/>
                Archiver
              </button>
            </div>
          </div>

          <div class="pfe-chevron" :class="{ 'pfe-chevron--open': openId === r.id }">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        <!-- Detail panel connected below card -->
        <transition name="pfe-detail-expand">
          <div v-if="openId === r.id" class="pfe-detail" @click.stop>
            <div class="pfe-section">
              <div class="pfe-section__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Étudiant
              </div>
              <div class="pfe-detail-grid">
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Nom complet</div>
                  <div class="pfe-detail-val">{{ r.etudiant_nom }}</div>
                </div>
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Matricule</div>
                  <div class="pfe-detail-val pfe-detail-val--code">{{ r.matricule }}</div>
                </div>
                <div class="pfe-detail-block pfe-detail-block--full">
                  <div class="pfe-detail-label">Sujet du projet</div>
                  <div class="pfe-detail-val pfe-detail-val--sujet">{{ r.projet_titre || '—' }}</div>
                </div>
              </div>
            </div>

            <div class="pfe-section">
              <div class="pfe-section__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Encadrant &amp; Jury
              </div>
              <div class="pfe-detail-grid">
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Nom de l'encadrant</div>
                  <div class="pfe-detail-val">{{ r.encadrant_nom || '—' }}</div>
                </div>
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Note jury</div>
                  <div class="pfe-detail-val">
                    <span v-if="r.note_jury != null" class="pfe-note-chip pfe-note-chip--jury">{{ r.note_jury }}/20</span>
                    <span v-else class="pfe-detail-val--muted">—</span>
                  </div>
                </div>
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Note encadrant</div>
                  <div class="pfe-detail-val">
                    <span v-if="r.note_encadrant != null" class="pfe-note-chip pfe-note-chip--enc">{{ r.note_encadrant }}/20</span>
                    <span v-else class="pfe-detail-val--muted">—</span>
                  </div>
                </div>
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Date de soutenance</div>
                  <div class="pfe-detail-val">{{ r.date_soutenance ? formatDate(r.date_soutenance) : '—' }}</div>
                </div>
              </div>
            </div>

            <div class="pfe-section">
              <div class="pfe-section__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="12" cy="8" r="6"/>
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                </svg>
                Résultat final
              </div>
              <div class="pfe-result-row">
                <div class="pfe-result-score"
                     :class="r.note_finale >= 10 ? 'pfe-result-score--pass' : 'pfe-result-score--fail'">
                  <span class="pfe-result-num">{{ r.note_finale }}</span>
                  <span class="pfe-result-denom">/20</span>
                </div>
                <div class="pfe-result-badges">
                  <span class="pfe-mention" style="font-size:.82rem;padding:.3rem 1rem"
                        :class="mentionClass(r.note_finale)">{{ getMention(r.note_finale) }}</span>
                  <span class="pfe-decision" style="font-size:.82rem;padding:.3rem 1rem"
                        :class="r.decision === 'admis' ? 'pfe-decision--admis' : 'pfe-decision--ajourne'">
                    {{ r.decision === 'admis' ? '✓ Admis' : '✗ Ajourné' }}
                  </span>
                  <span v-if="r.publie_le"  class="pfe-publie-tag">Publié le {{ r.publie_le }}</span>
                  <span v-if="r.archive_le" class="pfe-archive-tag">Archivé le {{ r.archive_le }}</span>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'ConsulterResultatFinal',
  emits: ['toast'],
  data () {
    return {
      resultats: [], loading: false, search: '', activeFilter: 'tous',
      openId: null, pendingId: null, loadingPublierTous: false, loadingArchiver: false,
      filters: [
        { key: 'tous', label: 'Tous' }, { key: 'unpub', label: 'À publier' },
        { key: 'publie', label: 'Publiés' }, { key: 'admis', label: 'Admis' },
        { key: 'ajourne', label: 'Ajournés' }, { key: 'biblio', label: 'Bibliothèque' },
        { key: 'archive', label: 'Archivés' },
      ],
    }
  },
  computed: {
    hasUnpublished ()         { return this.resultats.some(r => !r.publie) },
    hasPublishedUnarchived () { return this.resultats.some(r => r.publie && !r.archive) },
    filtered () {
      let list = this.resultats
      if (this.activeFilter === 'unpub')   list = list.filter(r => !r.publie)
      if (this.activeFilter === 'publie')  list = list.filter(r =>  r.publie)
      if (this.activeFilter === 'admis')   list = list.filter(r =>  r.decision === 'admis')
      if (this.activeFilter === 'ajourne') list = list.filter(r =>  r.decision !== 'admis')
      if (this.activeFilter === 'biblio')  list = list.filter(r =>  r.en_biblio)
      if (this.activeFilter === 'archive') list = list.filter(r =>  r.archive)
      if (this.search.trim()) {
        const q = this.search.toLowerCase()
        list = list.filter(r =>
          (r.etudiant_nom || '').toLowerCase().includes(q) ||
          (r.matricule    || '').toLowerCase().includes(q) ||
          (r.projet_titre || '').toLowerCase().includes(q)
        )
      }
      return list
    },
  },
  mounted () { this.charger() },
  methods: {
    async charger () {
      this.loading = true
      try { const { data } = await api.get('/resultats-pfe'); this.resultats = Array.isArray(data) ? data : [] }
      catch { this.$emit('toast', { type: 'error', message: 'Erreur lors du chargement.' }) }
      finally { this.loading = false }
    },
    toggle (id) { this.openId = this.openId === id ? null : id },
    async publierResultat (r) {
      this.pendingId = r.id + '-pub'
      try { await api.post(`/resultats-pfe/${r.id}/publier`); r.publie = true; r.publie_le = new Date().toLocaleDateString('fr-FR'); this.$emit('toast', { type: 'ok', message: 'Résultat publié.' }) }
      catch (e) { this.$emit('toast', { type: 'error', message: e.response?.data?.message || 'Erreur.' }) }
      finally { this.pendingId = null }
    },
    async ajouterBiblio (r) {
      this.pendingId = r.id + '-bib'
      try { await api.post(`/resultats-pfe/${r.id}/bibliotheque`, { en_biblio: true }); r.en_biblio = true; this.$emit('toast', { type: 'ok', message: 'Ajouté à la bibliothèque.' }) }
      catch (e) { this.$emit('toast', { type: 'error', message: e.response?.data?.message || 'Erreur.' }) }
      finally { this.pendingId = null }
    },
    async toggleDecision (r) {
      const nd = r.decision === 'admis' ? 'ajourne' : 'admis'; this.pendingId = r.id + '-adj'
      try { await api.post(`/resultats-pfe/${r.id}/decision`, { decision: nd }); r.decision = nd; this.$emit('toast', { type: 'ok', message: 'Décision mise à jour.' }) }
      catch (e) { this.$emit('toast', { type: 'error', message: e.response?.data?.message || 'Erreur.' }) }
      finally { this.pendingId = null }
    },
    async archiverResultat (r) {
      this.pendingId = r.id + '-arc'
      try { await api.post(`/resultats-pfe/${r.id}/archiver`); r.archive = true; r.archive_le = new Date().toLocaleDateString('fr-FR'); this.$emit('toast', { type: 'ok', message: 'Archivé.' }) }
      catch (e) { this.$emit('toast', { type: 'error', message: e.response?.data?.message || 'Erreur.' }) }
      finally { this.pendingId = null }
    },
    async publierTous () {
      this.loadingPublierTous = true
      try { const { data } = await api.post('/resultats-pfe/publier-tous'); this.$emit('toast', { type: 'ok', message: data.message }); await this.charger() }
      catch (e) { this.$emit('toast', { type: 'error', message: e.response?.data?.message || 'Erreur.' }) }
      finally { this.loadingPublierTous = false }
    },
    async archiverTous () {
      this.loadingArchiver = true
      try { const { data } = await api.post('/resultats-pfe/archiver-tous'); this.$emit('toast', { type: 'ok', message: data.message }); await this.charger() }
      catch (e) { this.$emit('toast', { type: 'error', message: e.response?.data?.message || 'Erreur.' }) }
      finally { this.loadingArchiver = false }
    },
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
    formatDateShort (d) { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) },
  },
}
</script>