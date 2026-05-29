<template>
  <div class="dept-wrapper">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
      <div>
        <h2 class="vld-page-title">Mon département</h2>
        <p class="vld-page-sub">Vue d'ensemble de votre spécialité</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="dept-tabs mb-4">
      <button
        v-for="tab in tabs" :key="tab.key"
        class="dept-tab"
        :class="{ active: onglet === tab.key }"
        @click="onglet = tab.key"
      >
        <span class="dept-tab__icon" v-html="tab.icon"></span>
        <span class="dept-tab__label">{{ tab.label }}</span>
        <span class="dept-tab__count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- ÉTUDIANTS -->
    <transition name="dept-fade" mode="out-in">
      <template v-if="onglet === 'etudiants'" key="etudiants">
        <div v-if="loadingEtudiants" class="vld-state">
          <div class="vld-spinner mx-auto mb-3"></div>
          <p class="vld-state__sub">Chargement des étudiants…</p>
        </div>
        <div v-else-if="!etudiants.length" class="vld-state">
          <div class="vld-state__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <p class="vld-state__title">Aucun étudiant</p>
          <p class="vld-state__sub">Aucun étudiant enregistré dans votre spécialité.</p>
        </div>
        <div v-else class="dept-card">
          <div class="dept-card__header">
            <span class="dept-card__header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
            </span>
            <span class="dept-card__header-title">Liste des étudiants</span>
            <span class="dept-card__header-count">{{ etudiants.length }} inscrits</span>
          </div>
          <div class="table-responsive">
            <table class="dept-table">
              <thead>
                <tr>
                  <th style="width:52px"></th>
                  <th>Étudiant</th>
                  <th>Matricule</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Affectation</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in etudiants" :key="e.id" class="dept-table__row">
                  <td>
                    <div class="vld-av vld-av--md vld-av--gold">{{ initiales(e.prenom, e.nom) }}</div>
                  </td>
                  <td>
                    <div class="dept-table__name">{{ e.prenom }} {{ e.nom }}</div>
                  </td>
                  <td>
                    <span class="dept-badge dept-badge--neutral">{{ e.matricule || '—' }}</span>
                  </td>
                  <td>
                    <span class="dept-table__email">{{ e.email || '—' }}</span>
                  </td>
                  <td>
                    <span class="dept-table__muted">{{ e.telephone || '—' }}</span>
                  </td>
                  <td>
                    <span v-if="e.encadrant" class="dept-badge dept-badge--success">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {{ e.encadrant }}
                    </span>
                    <span v-else class="dept-badge dept-badge--muted">Non affecté</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- ENSEIGNANTS -->
      <template v-else-if="onglet === 'enseignants'" key="enseignants">
        <div v-if="!enseignants.length" class="vld-state">
          <div class="vld-state__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <p class="vld-state__title">Aucun enseignant</p>
          <p class="vld-state__sub">Aucun enseignant enregistré dans votre spécialité.</p>
        </div>
        <div v-else class="dept-card">
          <div class="dept-card__header">
            <span class="dept-card__header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </span>
            <span class="dept-card__header-title">Corps enseignant</span>
            <span class="dept-card__header-count">{{ enseignants.length }} enseignants</span>
          </div>
          <div class="table-responsive">
            <table class="dept-table">
              <thead>
                <tr>
                  <th style="width:52px"></th>
                  <th>Enseignant</th>
                  <th>Matricule</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Établissement</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in enseignants" :key="e.id" class="dept-table__row">
                  <td>
                    <div class="vld-av vld-av--md vld-av--blue">{{ initiales(e.prenom, e.nom) }}</div>
                  </td>
                  <td>
                    <div class="dept-table__name">{{ e.prenom }} {{ e.nom }}</div>
                  </td>
                  <td>
                    <span class="dept-badge dept-badge--neutral">{{ e.matricule || '—' }}</span>
                  </td>
                  <td>
                    <span class="dept-table__email">{{ e.email || '—' }}</span>
                  </td>
                  <td>
                    <span class="dept-table__muted">{{ e.telephone || '—' }}</span>
                  </td>
                  <td>
                    <span class="dept-table__muted dept-table__muted--italic">{{ e.etablissement || '—' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- ENCADRANTS -->
      <template v-else-if="onglet === 'encadrants'" key="encadrants">
        <div v-if="loadingEncadrants" class="vld-state">
          <div class="vld-spinner mx-auto mb-3"></div>
          <p class="vld-state__sub">Chargement des encadrants…</p>
        </div>
        <div v-else-if="!encadrants.length" class="vld-state">
          <div class="vld-state__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <p class="vld-state__title">Aucun encadrant</p>
          <p class="vld-state__sub">Les enseignants deviennent encadrants après avoir soumis leurs vœux.</p>
        </div>
        <div v-else class="dept-card">
          <div class="dept-card__header">
            <span class="dept-card__header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
                <polyline points="16 11 18 13 22 9"/>
              </svg>
            </span>
            <span class="dept-card__header-title">Encadrants actifs</span>
            <span class="dept-card__header-count">{{ encadrants.length }} encadrants</span>
          </div>
          <div class="table-responsive">
            <table class="dept-table">
              <thead>
                <tr>
                  <th style="width:52px"></th>
                  <th>Encadrant</th>
                  <th>Email</th>
                  <th>Domaine</th>
                  <th class="text-center">Étudiants affectés</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in encadrants" :key="e.id" class="dept-table__row">
                  <td>
                    <div class="vld-av vld-av--md vld-av--green">{{ initiales(e.prenom, e.nom) }}</div>
                  </td>
                  <td>
                    <div class="dept-table__name">{{ e.prenom }} {{ e.nom }}</div>
                  </td>
                  <td>
                    <span class="dept-table__email">{{ e.email || '—' }}</span>
                  </td>
                  <td>
                    <span class="dept-table__muted dept-table__muted--italic">{{ e.domaine || '—' }}</span>
                  </td>
                  <td class="text-center">
                    <span class="dept-badge dept-badge--primary dept-badge--bold">{{ e.nb_affectes }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'MonDepartement',

  props: {
    etudiants:         { type: Array,   default: () => [] },
    enseignants:       { type: Array,   default: () => [] },
    encadrants:        { type: Array,   default: () => [] },
    loadingEtudiants:  { type: Boolean, default: false    },
    loadingEncadrants: { type: Boolean, default: false    },
  },

  data () {
    return { onglet: 'etudiants' }
  },

  computed: {
    tabs () {
      return [
        {
          key: 'etudiants', label: 'Étudiants', count: this.etudiants.length,
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
        },
        {
          key: 'enseignants', label: 'Enseignants', count: this.enseignants.length,
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
        },
        {
          key: 'encadrants', label: 'Encadrants', count: this.encadrants.length,
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/><polyline points="16 11 18 13 22 9"/></svg>`,
        },
      ]
    },
  },

  methods: {
    initiales (prenom = '', nom = '') {
      return `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase() || '?'
    },
  },
}
</script>

<style scoped>
/* ── Wrapper ─────────────────────────────────────── */
.dept-wrapper {
  animation: dept-mount .22s var(--vld-ease);
}
@keyframes dept-mount {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Tab bar ─────────────────────────────────────── */
.dept-tabs {
  display:   flex;
  gap:       8px;
  flex-wrap: wrap;
  padding:   4px;
  background: var(--vld-surface);
  border:    1px solid var(--vld-border);
  border-radius: var(--vld-r-xl);
  width:     fit-content;
  box-shadow: var(--vld-shadow-xs);
}

.dept-tab {
  display:       flex;
  align-items:   center;
  gap:           7px;
  padding:       8px 16px;
  border:        1.5px solid transparent;
  border-radius: var(--vld-r-lg);
  background:    transparent;
  color:         var(--vld-text-muted);
  font-size:     13.5px;
  font-weight:   600;
  font-family:   var(--vld-font-body);
  cursor:        pointer;
  transition:    all var(--vld-t-base) var(--vld-ease);
  white-space:   nowrap;
}
.dept-tab__icon {
  display:     flex;
  align-items: center;
  opacity:     .7;
  transition:  opacity var(--vld-t-base);
}
.dept-tab:hover {
  color:            var(--vld-text-strong);
  background:       var(--vld-surface-alt);
  border-color:     var(--vld-border);
}
.dept-tab:hover .dept-tab__icon { opacity: 1; }

.dept-tab.active {
  background:   var(--vld-surface-raised);
  color:        var(--vld-primary);
  border-color: var(--vld-primary);
  box-shadow:   0 1px 6px rgba(61, 96, 128, .14);
}
.dept-tab.active .dept-tab__icon { opacity: 1; color: var(--vld-primary); }

.dept-tab__count {
  display:       inline-flex;
  align-items:   center;
  justify-content: center;
  min-width:     22px;
  padding:       1px 7px;
  background:    rgba(61, 96, 128, .10);
  border-radius: var(--vld-r-full);
  font-size:     11px;
  font-weight:   700;
  color:         var(--vld-primary);
  transition:    background var(--vld-t-base);
}
.dept-tab.active .dept-tab__count {
  background: rgba(61, 96, 128, .16);
}

/* ── Card container ──────────────────────────────── */
.dept-card {
  background:    var(--vld-surface);
  border:        1px solid var(--vld-border);
  border-radius: var(--vld-r-xl);
  overflow:      hidden;
  box-shadow:    var(--vld-shadow-card);
  transition:    box-shadow var(--vld-t-base);
}
.dept-card:hover {
  box-shadow: var(--vld-shadow-card-hover);
}

/* Card sub-header strip */
.dept-card__header {
  display:       flex;
  align-items:   center;
  gap:           10px;
  padding:       12px 18px;
  background:    var(--vld-surface-alt);
  border-bottom: 1px solid var(--vld-border);
}
.dept-card__header-icon {
  display:        flex;
  align-items:    center;
  color:          var(--vld-primary);
  opacity:        .8;
}
.dept-card__header-title {
  font-family:  var(--vld-font-body);
  font-size:    13px;
  font-weight:  700;
  color:        var(--vld-text-strong);
  letter-spacing: .01em;
  flex:         1;
}
.dept-card__header-count {
  font-size:   12px;
  font-weight: 600;
  color:       var(--vld-text-muted);
  font-family: var(--vld-font-body);
}

/* ── Table ───────────────────────────────────────── */
.dept-table {
  width:           100%;
  border-collapse: collapse;
  font-family:     var(--vld-font-body);
}

.dept-table thead tr {
  background: var(--vld-surface-alt);
}
.dept-table thead th {
  padding:     11px 14px;
  font-size:   11.5px;
  font-weight: 700;
  color:       var(--vld-text-muted);
  text-transform: uppercase;
  letter-spacing: .06em;
  border-bottom: 1.5px solid var(--vld-border);
  white-space: nowrap;
}

.dept-table__row {
  border-bottom: 1px solid var(--vld-border);
  transition:    background var(--vld-t-fast);
}
.dept-table__row:last-child { border-bottom: none; }
.dept-table__row:hover { background: rgba(61, 96, 128, .04); }

.dept-table td {
  padding:        12px 14px;
  vertical-align: middle;
}

/* Cell typography helpers */
.dept-table__name {
  font-size:   14px;
  font-weight: 600;
  color:       var(--vld-text-strong);
  line-height: 1.3;
}
.dept-table__email {
  font-size: 12.5px;
  color:     var(--vld-primary);
  font-weight: 500;
}
.dept-table__muted {
  font-size: 12.5px;
  color:     var(--vld-text-muted);
}
.dept-table__muted--italic { font-style: italic; }

/* ── Badges ──────────────────────────────────────── */
.dept-badge {
  display:       inline-flex;
  align-items:   center;
  gap:           4px;
  padding:       3px 9px;
  border-radius: var(--vld-r-full);
  font-size:     11.5px;
  font-weight:   600;
  font-family:   var(--vld-font-body);
  white-space:   nowrap;
  border:        1px solid transparent;
}

.dept-badge--neutral {
  background:   var(--vld-surface-raised);
  border-color: var(--vld-border);
  color:        var(--vld-text-muted);
}
.dept-badge--success {
  background:   var(--vld-success-bg);
  border-color: rgba(30, 158, 96, .25);
  color:        var(--vld-success);
}
.dept-badge--muted {
  background:   rgba(110, 132, 153, .10);
  border-color: rgba(110, 132, 153, .20);
  color:        var(--vld-text-muted);
}
.dept-badge--primary {
  background:   var(--vld-info-bg);
  border-color: rgba(61, 96, 128, .22);
  color:        var(--vld-primary);
}
.dept-badge--bold { font-weight: 700; min-width: 28px; justify-content: center; }

/* ── Tab transition ──────────────────────────────── */
.dept-fade-enter-active {
  transition: opacity var(--vld-t-base) var(--vld-ease),
              transform var(--vld-t-base) var(--vld-ease);
}
.dept-fade-leave-active {
  transition: opacity var(--vld-t-fast) ease,
              transform var(--vld-t-fast) ease;
}
.dept-fade-enter-from { opacity: 0; transform: translateY(6px); }
.dept-fade-leave-to   { opacity: 0; transform: translateY(-4px); }
</style>