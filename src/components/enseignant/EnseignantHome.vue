<template>
  <div>
    <div class="page-hero">
      <h1 class="page-title">Bonjour, {{ currentUser.prenom }}</h1>
      <p class="page-sub">Exprimez vos vœux d'encadrement pour les PFE.</p>
    </div>

    <!-- Alert: formulaire disponible et non soumis -->
    <div v-if="formulaireActif && !voeuxSoumis" class="banner banner-warning">
      <div class="banner-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      </div>
      <div class="banner-body">
        <div class="banner-title">Formulaire de vœux disponible</div>
        <div class="banner-sub">Date limite : <strong>{{ formatDate(formulaireActif.date_limite) }}</strong></div>
      </div>
      <button class="btn-primary-sm" @click="$emit('navigate', 'remplir')">Remplir maintenant →</button>
    </div>

    <!-- Statut: vœux déjà soumis -->
    <div v-if="voeuxSoumis" class="banner banner-success">
      <div class="banner-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="banner-body">
        <div class="banner-title">Fiche de vœux soumise</div>
        <div class="banner-sub">
          {{ dateSoumission }}
          <template v-if="voeuxData?.disponibilite">
            · {{ labelDisponibilite(voeuxData.disponibilite) }}
          </template>
          <template v-if="voeuxData?.nbre_etudiants">
            · {{ voeuxData.nbre_etudiants }} étudiant(s) max
          </template>
        </div>
      </div>
      <button class="btn-outline-sm" @click="$emit('navigate', 'ma-fiche')">Consulter →</button>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid kpi-grid-3">
      <div class="kpi-card kpi-gold">
        <div class="kpi-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div>
          <div class="kpi-value">{{ voeuxSoumis ? '✓' : '—' }}</div>
          <div class="kpi-label">Fiche vœux</div>
        </div>
      </div>
      <div class="kpi-card kpi-blue">
        <div class="kpi-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <div>
          <div class="kpi-value">{{ voeuxData?.nbre_etudiants ?? '—' }}</div>
          <div class="kpi-label">Capacité déclarée</div>
        </div>
      </div>
      <div class="kpi-card kpi-green">
        <div class="kpi-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div>
          <div class="kpi-value">{{ formulaireActif ? formatDateCourt(formulaireActif.date_limite) : '—' }}</div>
          <div class="kpi-label">Date limite</div>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="section-label">Actions rapides</div>
    <div class="qa-grid qa-grid-1">
      <button class="qa-card" @click="$emit('navigate', voeuxSoumis ? 'ma-fiche' : 'remplir')">
        <div class="qa-icon qa-gold">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="qa-content">
          <div class="qa-title">{{ voeuxSoumis ? 'Consulter ma fiche' : 'Remplir le formulaire' }}</div>
          <div class="qa-sub">{{ voeuxSoumis ? 'Voir vos préférences soumises' : 'Disponibilité, spécialités, capacité' }}</div>
        </div>
        <svg class="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <button class="qa-card" @click="$emit('navigate', 'messagerie')">
        <div class="qa-icon qa-teal">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="qa-content">
          <div class="qa-title">Messagerie</div>
          <div class="qa-sub">Communiquer avec les autres utilisateurs</div>
        </div>
        <svg class="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <button class="qa-card" @click="$emit('navigate', 'biblio-pfe')">
        <div class="qa-icon qa-blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <div class="qa-content">
          <div class="qa-title">Bibliothèque PFE</div>
          <div class="qa-sub">Consulter les meilleurs projets</div>
        </div>
        <svg class="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EnseignantHome',
  emits: ['navigate'],
  props: {
    currentUser:     { type: Object,  required: true },
    formulaireActif: { type: Object,  default: null  },
    voeuxSoumis:     { type: Boolean, default: false },
    voeuxData:       { type: Object,  default: null  },
    dateSoumission:  { type: String,  default: ''    },
  },
  methods: {
    formatDate(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('fr-FR')
    },
    formatDateCourt(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    },
    labelDisponibilite(d) {
      return { oui: 'Disponible', partielle: 'Partiellement disponible', non: 'Non disponible' }[d] || d || '—'
    },
  },
}
</script>