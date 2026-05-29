<template>
  <div>
    <div class="page-hero">
      <h1 class="page-title">Bonjour, {{ currentUser.prenom }}</h1>
      <p class="page-sub">Soumettez et suivez votre demande d'encadrement PFE.</p>
    </div>

    <!-- Affectation banner -->
    <div v-if="monAffectation && monAffectation.statut === 'diffusee'" class="banner banner-success">
      <div class="banner-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <div class="banner-body">
        <div class="banner-title">Votre affectation a été publiée !</div>
        <div class="banner-sub">
          Encadrant : <strong>{{ monAffectation.encadrant || '—' }}</strong>
          <span v-if="monAffectation.specialite"> · {{ monAffectation.specialite }}</span>
        </div>
      </div>
      <span class="badge badge-success">Officiel</span>
    </div>

    <!-- Info banner when accord mutuel inactive and no affectation -->
    <div v-if="!accordMutuelActif && !monAffectation" class="banner banner-info">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <div>Le chef de département gère les affectations automatiquement. Les demandes directes ne sont pas disponibles.</div>
    </div>

    <!-- Current demande status card -->
    <div v-if="maDemande && accordMutuelActif" class="status-card">
      <div class="status-card-left">
        <div class="status-icon" :class="'status-icon-' + maDemande.statut">
          <svg v-if="maDemande.statut === 'acceptee'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else-if="maDemande.statut === 'rejetee'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="status-info">
          <div class="status-titre">{{ maDemande.sujet || maDemande.titre }}</div>
          <div class="status-sub">{{ maDemande.encadrant }} · {{ maDemande.specialite }}</div>
          <span class="badge" :class="'badge-' + maDemande.statut">{{ labelStatut(maDemande.statut) }}</span>
        </div>
      </div>
      <div class="status-actions">
        <button class="icon-btn icon-btn-view" @click="$emit('navigate', 'consulter-demande')" title="Consulter">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button v-if="maDemande.statut === 'en_attente'" class="icon-btn icon-btn-edit" @click="$emit('navigate', 'modifier-demande')" title="Modifier">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button v-if="maDemande.statut === 'en_attente'" class="icon-btn icon-btn-del" @click="$emit('navigate', 'annuler-demande')" title="Annuler">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="kpi-grid kpi-grid-3">
      <div class="kpi-card kpi-gold">
        <div class="kpi-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
        </div>
        <div>
          <div class="kpi-value">{{ maDemande ? '✓' : '—' }}</div>
          <div class="kpi-label">Demande</div>
        </div>
      </div>
      <div class="kpi-card" :class="monAffectation ? 'kpi-green' : 'kpi-slate'">
        <div class="kpi-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <div>
          <div class="kpi-value">{{ monAffectation ? '✓' : '—' }}</div>
          <div class="kpi-label">Affectation</div>
        </div>
      </div>
      <div class="kpi-card kpi-blue">
        <div class="kpi-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div>
          <div class="kpi-value">{{ encadrants.filter(e => e.disponible).length }}</div>
          <div class="kpi-label">Encadrants dispo</div>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="section-label">Actions</div>
    <div class="qa-grid">
      <!-- Affectation result card (static) -->
      <div v-if="monAffectation && monAffectation.statut === 'diffusee'" class="qa-card qa-card-static">
        <div class="qa-icon qa-green">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="qa-content">
          <div class="qa-title">Mon encadrant</div>
          <div class="qa-sub"><strong>{{ monAffectation.encadrant }}</strong></div>
        </div>
      </div>

      <button v-if="accordMutuelActif" class="qa-card" @click="$emit('navigate', 'ma-demande')">
        <div class="qa-icon qa-gold">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="qa-content">
          <div class="qa-title">{{ maDemande ? 'Gérer ma demande' : 'Soumettre une demande' }}</div>
          <div class="qa-sub">Titre, description, encadrant, document</div>
        </div>
        <svg class="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <button class="qa-card" @click="$emit('navigate', 'encadrants')">
        <div class="qa-icon qa-blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <div class="qa-content">
          <div class="qa-title">Parcourir les encadrants</div>
          <div class="qa-sub">Spécialités et disponibilités</div>
        </div>
        <svg class="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <button class="qa-card" @click="$emit('navigate', 'livrables')">
        <div class="qa-icon qa-gold">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div class="qa-content">
          <div class="qa-title">Mes livrables</div>
          <div class="qa-sub">Déposer et suivre mes livrables</div>
        </div>
        <svg class="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <button class="qa-card" @click="$emit('navigate', 'reunions')">
        <div class="qa-icon qa-teal">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="qa-content">
          <div class="qa-title">Réunions</div>
          <div class="qa-sub">Planifier des créneaux avec mon encadrant</div>
        </div>
        <svg class="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <button class="qa-card" @click="$emit('navigate', 'resultats')">
        <div class="qa-icon qa-green">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="qa-content">
          <div class="qa-title">Mon résultat final</div>
          <div class="qa-sub">Note, mention et décision de délibération</div>
        </div>
        <svg class="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EtudiantHome',
  emits: ['navigate'],
  props: {
    currentUser:      { type: Object, required: true },
    maDemande:        { type: Object, default: null },
    monAffectation:   { type: Object, default: null },
    encadrants:       { type: Array,  default: () => [] },
    accordMutuelActif:{ type: Boolean, default: false },
  },
  methods: {
    labelStatut(s) {
      return { en_attente: 'En attente', acceptee: 'Acceptée', rejetee: 'Rejetée' }[s] || s
    },
  },
}
</script>