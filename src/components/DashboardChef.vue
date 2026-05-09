<template>
  <div class="dashboard-shell">
    <transition name="toast-anim">
      <div v-if="toast.visible" class="global-toast" :class="toast.type">
        <svg v-if="toast.type==='toast-ok'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
        {{ toast.message }}
      </div>
    </transition>

    <!-- SIDEBAR -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sb-brand">
        <div class="brand-full" v-if="!sidebarCollapsed"><span class="logo-w">Vers le</span><span class="logo-g">Diplôme</span></div>
        <div class="brand-icon" v-else>VD</div>
        <button class="collapse-btn" @click="sidebarCollapsed=!sidebarCollapsed">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      <nav class="sb-nav">

        <!-- ════════════════════════════════
             TABLEAU DE BORD
        ════════════════════════════════ -->
        <button class="nav-item" :class="{active:currentPage==='home'}" @click="navigate('home')" :title="sidebarCollapsed?'Accueil':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Tableau de bord</span>
        </button>

        <!-- ════════════════════════════════
             SECTION CHEF
        ════════════════════════════════ -->
        <div class="role-section-header" v-if="!sidebarCollapsed">
          <div class="role-section-line"></div>
          <span class="role-section-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Chef de Département
          </span>
          <div class="role-section-line"></div>
        </div>
        <div class="role-section-icon" v-if="sidebarCollapsed" title="Chef de Département">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(245,197,24,0.5)" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>

        <!-- Mon département -->
        <button class="nav-item" :class="{active:currentPage==='mon-departement'}" @click="navigate('mon-departement')" :title="sidebarCollapsed?'Mon département':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Mon département</span>
        </button>

        <!-- Vœux d'encadrement (chef) -->
        <button v-if="!sidebarCollapsed" class="nav-group" :class="{open:openGroup==='voeux'}" @click="toggleGroup('voeux')">
          <span class="group-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>
          <span class="group-label">Vœux d'encadrement</span>
          <svg class="chevron" :class="{rotated:openGroup==='voeux'}" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <button v-if="sidebarCollapsed" class="nav-item" :class="{active:currentPage==='voeux-creer'||currentPage==='voeux-liste'}" @click="navigate('voeux-creer')" title="Vœux">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>
        </button>
        <transition name="submenu">
          <div v-if="openGroup==='voeux' && !sidebarCollapsed" class="sub-menu">
            <button class="sub-item" :class="{active:currentPage==='voeux-creer'}" @click="navigate('voeux-creer')"><span class="sub-dot"></span>Créer un formulaire</button>
            <button class="sub-item" :class="{active:currentPage==='voeux-liste'}" @click="navigate('voeux-liste')"><span class="sub-dot"></span>Suivi &amp; réponses</button>
          </div>
        </transition>

        <!-- Affectation -->
        <button v-if="!sidebarCollapsed" class="nav-group" :class="{open:openGroup==='aff'}" @click="toggleGroup('aff')">
          <span class="group-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></span>
          <span class="group-label">Affectation</span>
          <svg class="chevron" :class="{rotated:openGroup==='aff'}" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <button v-if="sidebarCollapsed" class="nav-item" :class="{active:currentPage==='affectation'}" @click="navigate('affectation')" title="Affectation">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/></svg></span>
        </button>
        <transition name="submenu">
          <div v-if="openGroup==='aff' && !sidebarCollapsed" class="sub-menu">
            <button class="sub-item" :class="{active:currentPage==='affectation'}" @click="navigate('affectation')"><span class="sub-dot"></span>Gérer les affectations</button>
          </div>
        </transition>

        <!-- Évaluation PFE (chef) -->
        <button v-if="!sidebarCollapsed" class="nav-group" :class="{open:openGroup==='eval'}" @click="toggleGroup('eval')">
          <span class="group-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
          <span class="group-label">Évaluation PFE</span>
          <svg class="chevron" :class="{rotated:openGroup==='eval'}" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <button v-if="sidebarCollapsed" class="nav-item" :class="{active:currentPage==='phases'||currentPage==='grille'}" @click="navigate('phases')" title="Évaluation PFE">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></span>
        </button>
        <transition name="submenu">
          <div v-if="openGroup==='eval' && !sidebarCollapsed" class="sub-menu">
            <button class="sub-item" :class="{active:currentPage==='phases'}" @click="navigate('phases')"><span class="sub-dot"></span>Phases d'évaluation</button>
            <button class="sub-item" :class="{active:currentPage==='grille'}" @click="navigate('grille')"><span class="sub-dot"></span>Grille d'évaluation</button>
          </div>
        </transition>

        <!-- Soutenances (chef) -->
        <button v-if="!sidebarCollapsed" class="nav-group" :class="{open:openGroup==='sout'}" @click="toggleGroup('sout')">
          <span class="group-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
          <span class="group-label">Soutenances</span>
          <svg class="chevron" :class="{rotated:openGroup==='sout'}" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <button v-if="sidebarCollapsed" class="nav-item" :class="{active:currentPage==='jury'||currentPage==='soutenance'}" @click="navigate('jury')" title="Soutenances">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
        </button>
        <transition name="submenu">
          <div v-if="openGroup==='sout' && !sidebarCollapsed" class="sub-menu">
            <button class="sub-item" :class="{active:currentPage==='jury'}" @click="navigate('jury')"><span class="sub-dot"></span>Composition des jurys</button>
            <button class="sub-item" :class="{active:currentPage==='soutenance'}" @click="navigate('soutenance')"><span class="sub-dot"></span>Planifier les soutenances</button>
          </div>
        </transition>

        <!-- Résultats & Délibération -->
        <button v-if="!sidebarCollapsed" class="nav-group" :class="{open:openGroup==='rd'}" @click="toggleGroup('rd')">
          <span class="group-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></span>
          <span class="group-label">Résultats &amp; Délibération</span>
          <svg class="chevron" :class="{rotated:openGroup==='rd'}" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <button v-if="sidebarCollapsed" class="nav-item" :class="{active:currentPage==='fiches-evaluation'||currentPage==='deliberation-resultats'}" @click="navigate('fiches-evaluation')" title="Résultats & Délibération">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></span>
        </button>
        <transition name="submenu">
          <div v-if="openGroup==='rd' && !sidebarCollapsed" class="sub-menu">
            <button class="sub-item" :class="{active:currentPage==='fiches-evaluation'}" @click="navigate('fiches-evaluation')"><span class="sub-dot"></span>Fiches d'évaluation</button>
            <button class="sub-item" :class="{active:currentPage==='deliberation-resultats'}" @click="navigate('deliberation-resultats')"><span class="sub-dot"></span>Délibération &amp; Résultats</button>
          </div>
        </transition>

        <!-- ════════════════════════════════
             SECTION ENCADRANT
        ════════════════════════════════ -->
        <div class="role-section-header" v-if="!sidebarCollapsed">
          <div class="role-section-line"></div>
          <span class="role-section-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/><polyline points="16 11 18 13 22 9"/></svg>
            Encadrant
          </span>
          <div class="role-section-line"></div>
        </div>
        <div class="role-section-icon" v-if="sidebarCollapsed" title="Encadrant">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(245,197,24,0.5)" stroke-width="2.5"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
        </div>

        <!-- Vœux d'encadrement (encadrant) -->
        <button class="nav-item" :class="{active:currentPage==='enc-voeux'}" @click="navigate('enc-voeux')" :title="sidebarCollapsed?'Mes vœux':''">
          <span class="nav-icon" style="position:relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span v-if="sidebarCollapsed && formulaireActif && !voeuxSoumis" class="badge-dot"></span>
          </span>
          <span class="nav-label" v-if="!sidebarCollapsed">
            {{ voeuxSoumis ? 'Ma fiche' : 'Remplir le formulaire' }}
            <span v-if="voeuxSoumis" class="badge-soumis">✓</span>
            <span v-else-if="formulaireActif" class="badge-cnt">!</span>
          </span>
        </button>

        <!-- Gérer les demandes -->
        <button class="nav-item" :class="{active:currentPage==='enc-demandes'}" @click="navigate('enc-demandes')" :title="sidebarCollapsed?'Demandes':''">
          <span class="nav-icon" style="position:relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span v-if="sidebarCollapsed && nbEnAttente>0" class="badge-dot"></span>
          </span>
          <span class="nav-label" v-if="!sidebarCollapsed">Gérer les demandes <span v-if="nbEnAttente>0" class="badge-cnt">{{ nbEnAttente }}</span></span>
        </button>

        <!-- Étudiants affectés -->
        <button class="nav-item" :class="{active:currentPage==='enc-affectes'}" @click="navigate('enc-affectes')" :title="sidebarCollapsed?'Étudiants affectés':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Étudiants affectés</span>
        </button>

        <!-- Suivi & livrables -->
        <button class="nav-item" :class="{active:currentPage==='enc-suivi'}" @click="navigate('enc-suivi')" :title="sidebarCollapsed?'Suivi':''">
          <span class="nav-icon" style="position:relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span v-if="sidebarCollapsed && nbLivrablesPending>0" class="badge-dot"></span>
          </span>
          <span class="nav-label" v-if="!sidebarCollapsed">Suivi &amp; livrables <span v-if="nbLivrablesPending>0" class="badge-cnt">{{ nbLivrablesPending }}</span></span>
        </button>

        <!-- Réunions -->
        <button class="nav-item" :class="{active:currentPage==='enc-reunions'}" @click="navigate('enc-reunions')" :title="sidebarCollapsed?'Réunions':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Réunions</span>
        </button>

        <!-- Plan de soutenance (encadrant) -->
        <button v-if="!sidebarCollapsed" class="nav-group" :class="{open:openGroup==='enc-sout'}" @click="toggleGroup('enc-sout')">
          <span class="group-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
          <span class="group-label">Plan de soutenance</span>
          <svg class="chevron" :class="{rotated:openGroup==='enc-sout'}" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <button v-if="sidebarCollapsed" class="nav-item" :class="{active:currentPage==='enc-calendrier'||currentPage==='enc-proposer-plan'}" @click="navigate('enc-calendrier')" title="Plan soutenance">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
        </button>
        <transition name="submenu">
          <div v-if="openGroup==='enc-sout' && !sidebarCollapsed" class="sub-menu">
            <button class="sub-item" :class="{active:currentPage==='enc-calendrier'}" @click="navigate('enc-calendrier')"><span class="sub-dot"></span>Calendrier</button>
            <button class="sub-item" :class="{active:currentPage==='enc-proposer-plan'}" @click="navigate('enc-proposer-plan')"><span class="sub-dot"></span>Proposer un plan</button>
          </div>
        </transition>

        <!-- ════════════════════════════════
             SECTION JURY
        ════════════════════════════════ -->
        <div class="role-section-header" v-if="!sidebarCollapsed">
          <div class="role-section-line"></div>
          <span class="role-section-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Jury
          </span>
          <div class="role-section-line"></div>
        </div>
        <div class="role-section-icon" v-if="sidebarCollapsed" title="Jury">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(245,197,24,0.5)" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>

        <!-- Évaluation PFE (jury) -->
        <button v-if="!sidebarCollapsed" class="nav-group" :class="{open:openGroup==='jury-eval'}" @click="toggleGroup('jury-eval')">
          <span class="group-icon" style="position:relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </span>
          <span class="group-label">Évaluation PFE <span v-if="projetsNonEvalues>0" class="badge-cnt">{{ projetsNonEvalues }}</span></span>
          <svg class="chevron" :class="{rotated:openGroup==='jury-eval'}" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <button v-if="sidebarCollapsed" class="nav-item" :class="{active:currentPage==='jury-projets'||currentPage==='jury-evaluations'}" @click="navigate('jury-projets')" title="Évaluation jury">
          <span class="nav-icon" style="position:relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
            <span v-if="projetsNonEvalues>0" class="badge-dot"></span>
          </span>
        </button>
        <transition name="submenu">
          <div v-if="openGroup==='jury-eval' && !sidebarCollapsed" class="sub-menu">
            <button class="sub-item" :class="{active:currentPage==='jury-projets'}" @click="navigate('jury-projets')">
              <span class="sub-dot"></span>Projets à évaluer <span v-if="projetsNonEvalues>0" class="badge-cnt">{{ projetsNonEvalues }}</span>
            </button>
            <button class="sub-item" :class="{active:currentPage==='jury-evaluations'}" @click="navigate('jury-evaluations')"><span class="sub-dot"></span>Mes évaluations</button>
          </div>
        </transition>

        <!-- ════════════════════════════════
             COMMUNICATION (shared)
        ════════════════════════════════ -->
        <div class="nav-cat" v-if="!sidebarCollapsed">Communication</div>
        <button class="nav-item" :class="{active:currentPage==='messagerie'}" @click="navigate('messagerie')" :title="sidebarCollapsed?'Messagerie':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Messagerie</span>
        </button>

      </nav>

      <div class="sb-user" v-if="!sidebarCollapsed">
        <div class="u-av">{{ initiales(currentUser.prenom+' '+currentUser.nom) }}</div>
        <div class="u-info">
          <div class="u-name">{{ currentUser.prenom }} {{ currentUser.nom }}</div>
          <div class="u-role">Chef de département</div>
        </div>
        <button class="logout-btn" @click="logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
      <div class="sb-user-col" v-else><div class="u-av-sm">{{ initiales(currentUser.prenom+' '+currentUser.nom) }}</div></div>
    </aside>

    <!-- MAIN -->
    <div class="main-wrap">
      <header class="topbar">
        <div class="breadcrumb">
          <span class="bc-root">{{ breadcrumbRoot }}</span>
          <template v-if="breadcrumb">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span class="bc-curr">{{ breadcrumb }}</span>
          </template>
        </div>
        <div class="topbar-r">
          <NotificationsDropdown />
          <span class="tb-date">{{ dateNow }}</span>
        </div>
      </header>

      <div class="content-area">
        <transition name="page-fade" mode="out-in">

          <!-- HOME -->
          <DashboardChefHome v-if="currentPage==='home'" key="home" :current-user="currentUser" @navigate="navigate"/>

          <!-- ── CHEF PAGES ── -->
          <CreerFormulaire v-else-if="currentPage==='voeux-creer'" key="vc" :enseignants="enseignants" :formulaire-a-modifier="formulaireAModifier" @form-cree="onFormulaireCree" @navigate="navigate"/>
          <ListeFormulaires v-else-if="currentPage==='voeux-liste'" key="vl" @modifier="onModifierFormulaire" @navigate="navigate"/>
          <GestionAffectations v-else-if="currentPage==='affectation'" key="aff" @toast="afficherToast"/>
          <GestionPhases v-else-if="currentPage==='phases'" key="phases" @toast="afficherToast"/>
          <GestionGrille v-else-if="currentPage==='grille'" key="grille" @toast="afficherToast"/>
          <GestionJury v-else-if="currentPage==='jury'" key="jury" @toast="afficherToast"/>
          <GestionSoutenance v-else-if="currentPage==='soutenance'" key="soutenance" @toast="afficherToast"/>
          <FichesEvaluation      v-else-if="currentPage==='fiches-evaluation'"      key="fiches"      @toast="afficherToast"/>
          <DeliberationResultats v-else-if="currentPage==='deliberation-resultats'" key="deliberation" @toast="afficherToast"/>

          <!-- Mon département -->
          <div v-else-if="currentPage==='mon-departement'" key="mon-departement">
            <div class="dept-header">
              <div>
                <h2 class="page-title">Mon département</h2>
                <p class="page-sub">Vue d'ensemble de votre spécialité</p>
              </div>
            </div>
            <div class="dept-tabs">
              <button class="dept-tab" :class="{active: deptOnglet==='etudiants'}" @click="deptOnglet='etudiants'">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                Étudiants <span class="tab-count">{{ etudiants.length }}</span>
              </button>
              <button class="dept-tab" :class="{active: deptOnglet==='enseignants'}" @click="deptOnglet='enseignants'">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                Enseignants <span class="tab-count">{{ enseignants.length }}</span>
              </button>
              <button class="dept-tab" :class="{active: deptOnglet==='encadrants'}" @click="deptOnglet='encadrants'">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/><polyline points="16 11 18 13 22 9"/></svg>
                Encadrants <span class="tab-count">{{ encadrants.length }}</span>
              </button>
            </div>

            <div v-if="deptOnglet==='etudiants'">
              <div v-if="loadingEtudiants" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
              <div v-else-if="!etudiants.length" class="empty-state"><div class="empty-icon">👨‍🎓</div><p>Aucun étudiant dans votre spécialité.</p></div>
              <div v-else class="dept-table-card">
                <table class="dept-table">
                  <thead><tr><th class="th-av"></th><th>Étudiant</th><th>Matricule</th><th>Email</th><th>Téléphone</th><th>Affectation</th></tr></thead>
                  <tbody>
                    <tr v-for="e in etudiants" :key="e.id" class="dept-tr">
                      <td><div class="av-gold">{{ initiales(e.prenom+' '+e.nom) }}</div></td>
                      <td><div class="u-nom">{{ e.prenom }} {{ e.nom }}</div></td>
                      <td><span class="mat-tag">{{ e.matricule || '—' }}</span></td>
                      <td class="td-email">{{ e.email || '—' }}</td>
                      <td class="td-tel">{{ e.telephone || '—' }}</td>
                      <td><span v-if="e.encadrant" class="badge-affecte">✓ {{ e.encadrant }}</span><span v-else class="badge-non-affecte">Non affecté</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else-if="deptOnglet==='enseignants'">
              <div v-if="!enseignants.length" class="empty-state"><div class="empty-icon">🎓</div><p>Aucun enseignant dans votre spécialité.</p></div>
              <div v-else class="dept-table-card">
                <table class="dept-table">
                  <thead><tr><th class="th-av"></th><th>Enseignant</th><th>Matricule</th><th>Email</th><th>Téléphone</th><th>Établissement</th></tr></thead>
                  <tbody>
                    <tr v-for="e in enseignants" :key="e.id" class="dept-tr">
                      <td><div class="av-blue">{{ initiales(e.prenom+' '+e.nom) }}</div></td>
                      <td><div class="u-nom">{{ e.prenom }} {{ e.nom }}</div></td>
                      <td><span class="mat-tag">{{ e.matricule || '—' }}</span></td>
                      <td class="td-email">{{ e.email || '—' }}</td>
                      <td class="td-tel">{{ e.telephone || '—' }}</td>
                      <td class="td-etab">{{ e.etablissement || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else-if="deptOnglet==='encadrants'">
              <div v-if="loadingEncadrants" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
              <div v-else-if="!encadrants.length" class="empty-state">
                <div class="empty-icon">👤</div>
                <p>Aucun encadrant disponible.<br><span style="font-size:12.5px;color:#aaa">Les enseignants deviennent encadrants après avoir soumis leurs vœux.</span></p>
              </div>
              <div v-else class="dept-table-card">
                <table class="dept-table">
                  <thead><tr><th class="th-av"></th><th>Encadrant</th><th>Email</th><th>Domaine</th><th class="th-center">Affectés</th></tr></thead>
                  <tbody>
                    <tr v-for="e in encadrants" :key="e.id" class="dept-tr">
                      <td><div class="av-green">{{ initiales(e.prenom+' '+e.nom) }}</div></td>
                      <td><div class="u-nom">{{ e.prenom }} {{ e.nom }}</div></td>
                      <td class="td-email">{{ e.email || '—' }}</td>
                      <td class="td-domaine">{{ e.domaine || '—' }}</td>
                      <td class="td-center">{{ e.nb_affectes }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ── ENCADRANT PAGES ── -->
          <!-- Vœux encadrant -->
          <div v-else-if="currentPage==='enc-voeux'" key="enc-voeux">
            <div v-if="voeuxSoumis && !modeModifierVoeux" class="page-content">
              <div class="page-header-block">
                <div><h2 class="page-title">Ma fiche de vœux</h2><p class="page-sub">{{ formulaireActif?.titre }}</p></div>
                <div class="header-actions">
                  <button v-if="peutModifier" class="btn-primary-enc" @click="modeModifierVoeux=true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Modifier ma fiche
                  </button>
                  <div v-else class="deadline-passed-enc">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Date limite dépassée
                  </div>
                </div>
              </div>
              <div class="fiche-card-enc">
                <div class="fiche-statut-enc"><span class="badge-soumis-lg">✓ Soumise</span><span class="fiche-date-enc">{{ dateSoumission }}</span></div>
                <table class="fiche-table-enc">
                  <tbody>
                    <tr><td class="fiche-lbl-enc">Disponibilité</td><td class="fiche-val-enc"><span :class="['dispo-badge', voeuxData?.disponibilite]">{{ labelDisponibilite(voeuxData?.disponibilite) }}</span></td></tr>
                    <tr v-if="voeuxData?.nbre_etudiants !== undefined"><td class="fiche-lbl-enc">Nb max étudiants</td><td class="fiche-val-enc">{{ voeuxData.nbre_etudiants }}</td></tr>
                    <tr v-if="voeuxData?.specialites?.length"><td class="fiche-lbl-enc">Spécialités souhaitées</td><td class="fiche-val-enc"><span v-for="s in voeuxData.specialites" :key="s" class="spec-tag-enc">{{ s }}</span></td></tr>
                    <tr v-if="voeuxData?.themes"><td class="fiche-lbl-enc">Thèmes préférés</td><td class="fiche-val-enc">{{ voeuxData.themes }}</td></tr>
                    <tr v-if="voeuxData?.commentaire"><td class="fiche-lbl-enc">Commentaires</td><td class="fiche-val-enc">{{ voeuxData.commentaire }}</td></tr>
                    <tr><td class="fiche-lbl-enc">Co-tutelle</td><td class="fiche-val-enc">{{ voeuxData?.cotutelle ? 'Acceptée' : 'Non' }}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else-if="!formulaireActif && !modeModifierVoeux" class="empty-state">
              <div class="empty-icon">📋</div>
              <div class="empty-t">Aucun formulaire disponible</div>
              <p class="empty-s">Aucun formulaire de vœux publié pour le moment.</p>
            </div>
            <div v-else>
              <div v-if="modeModifierVoeux" class="back-header-enc">
                <button class="back-btn-enc" @click="modeModifierVoeux=false">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                  Retour à ma fiche
                </button>
              </div>
              <FicheVoeux :formulaire="formulaireActif" :mode-soumission-only="true" :voeux-initiaux="modeModifierVoeux ? voeuxData : null" @soumis="onVoeuxSoumis"/>
            </div>
          </div>

          <!-- Demandes encadrant -->
          <DemandesEncadrement v-else-if="currentPage==='enc-demandes'" key="enc-demandes" @nb-en-attente="onNbEnAttente" @toast="afficherToast"/>

          <!-- Étudiants affectés encadrant -->
          <div v-else-if="currentPage==='enc-affectes'" key="enc-affectes">
            <div class="page-header-block">
              <div><h2 class="page-title">Étudiants affectés</h2><p class="page-sub">Liste des étudiants sous votre encadrement</p></div>
              <button v-if="etudiantsAffectes.length" class="btn-export" @click="exporterCSV">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Exporter CSV
              </button>
            </div>
            <div v-if="!etudiantsAffectes.length" class="empty-state"><div class="empty-icon">👨‍🎓</div><div class="empty-t">Aucun étudiant affecté</div><p class="empty-s">Les affectations n'ont pas encore été finalisées.</p></div>
            <div v-else class="dept-table-card">
              <table class="dept-table">
                <thead><tr><th class="th-av"></th><th>Étudiant</th><th>Matricule</th><th>Spécialité</th><th>Contact</th></tr></thead>
                <tbody>
                  <tr v-for="e in etudiantsAffectes" :key="e.id" class="dept-tr">
                    <td><div class="av-gold">{{ initiales(e.prenom+' '+e.nom) }}</div></td>
                    <td><div class="u-nom">{{ e.prenom }} {{ e.nom }}</div><div v-if="e.email" style="font-size:12px;color:#7A8FA6">{{ e.email }}</div></td>
                    <td><span class="mat-tag">{{ e.matricule || '—' }}</span></td>
                    <td class="td-domaine">{{ e.specialite || '—' }}</td>
                    <td class="td-tel">{{ e.telephone || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Suivi encadrant -->
          <SuiviEncadrant v-else-if="currentPage==='enc-suivi'" key="enc-suivi" @toast="afficherToast"/>

          <!-- Réunions encadrant -->
          <ReunionEncadrant v-else-if="currentPage==='enc-reunions'" key="enc-reunions" @toast="afficherToast"/>

          <!-- Proposer un plan encadrant -->
          <div v-else-if="currentPage==='enc-proposer-plan'" key="enc-proposer-plan">
            <div class="page-header-block"><div><h2 class="page-title">Proposer un plan de soutenances</h2><p class="page-sub">Soumettez une proposition de créneaux</p></div></div>
            <div v-if="!etudiantsAffectes.length" class="empty-state"><div class="empty-icon">📅</div><div class="empty-t">Aucun étudiant affecté</div><p class="empty-s">Vous devez avoir des étudiants affectés pour proposer un plan.</p></div>
            <div v-else class="plan-form">
              <div class="plan-form-title">Créneaux proposés</div>
              <div v-for="(slot, i) in planSlots" :key="i" class="plan-slot-row">
                <div class="form-group"><label>Étudiant</label>
                  <select v-model="slot.etudiant_id">
                    <option value="">— Choisir —</option>
                    <option v-for="e in etudiantsAffectes" :key="e.id" :value="e.id">{{ e.prenom }} {{ e.nom }}</option>
                  </select>
                </div>
                <div class="form-group"><label>Date</label><input type="date" v-model="slot.date"/></div>
                <div class="form-group"><label>Heure</label><input type="time" v-model="slot.heure"/></div>
                <div class="form-group"><label>Salle</label><input type="text" v-model="slot.salle" placeholder="ex: A101"/></div>
                <button v-if="planSlots.length>1" class="btn-rm-slot" @click="planSlots.splice(i,1)">✕</button>
              </div>
              <button class="btn-add-slot" @click="planSlots.push({date:'',heure:'',salle:'',etudiant_id:''})">+ Ajouter un créneau</button>
              <div style="margin-top:20px;display:flex;gap:12px">
                <button class="btn-primary-enc" @click="soumettreplanEnc" :disabled="savingPlan">
                  <span v-if="savingPlan" class="spin-sm"></span>
                  {{ savingPlan ? 'Envoi...' : 'Soumettre le plan' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Calendrier soutenance encadrant -->
          <div v-else-if="currentPage==='enc-calendrier'" key="enc-calendrier">
            <div class="page-header-block"><div><h2 class="page-title">Calendrier de soutenance</h2><p class="page-sub">Vos sessions planifiées</p></div></div>
            <div v-if="loadingSessions" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
            <div v-else-if="!mesSessions.length" class="empty-state"><div class="empty-icon">📅</div><div class="empty-t">Aucune session planifiée</div><p class="empty-s">Aucune soutenance n'a encore été planifiée.</p></div>
            <div v-else class="sessions-list">
              <div v-for="s in mesSessions" :key="s.id" class="session-card">
                <div class="session-date-block"><div class="session-jour">{{ formatJour(s.date) }}</div><div class="session-mois">{{ formatMois(s.date) }}</div></div>
                <div class="session-details">
                  <div class="session-titre">{{ s.projet }}</div>
                  <div class="session-info">{{ s.heure_debut }} – {{ s.heure_fin }} · Salle {{ s.salle }}</div>
                  <div class="session-etudiant">{{ s.etudiant }}</div>
                </div>
                <div class="session-status">
                  <span :class="['badge-session', s.evalue ? 'badge-done' : 'badge-todo']">{{ s.evalue ? 'Évalué' : 'À évaluer' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ── JURY PAGES ── -->
          <!-- Projets à évaluer (jury) -->
          <div v-else-if="currentPage==='jury-projets'" key="jury-projets">
            <div class="page-header-block"><div><h2 class="page-title">Projets à évaluer</h2><p class="page-sub">Évaluations en attente en tant que membre du jury</p></div></div>
            <div v-if="loadingProjets" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
            <div v-else-if="!mesProjets.length" class="empty-state"><div class="empty-icon">📋</div><div class="empty-t">Aucun projet à évaluer</div><p class="empty-s">Vous n'avez pas encore de projets assignés en tant que jury.</p></div>
            <div v-else class="projets-grid">
              <div v-for="p in mesProjets" :key="p.id" class="projet-card" :class="{'projet-evalue': p.evalue}">
                <div class="pc-header">
                  <div class="pc-titre">{{ p.titre }}</div>
                  <span :class="['pc-badge', p.evalue ? 'badge-evalue' : 'badge-pending']">{{ p.evalue ? 'Évalué ✓' : 'En attente' }}</span>
                </div>
                <div class="pc-etudiant">{{ p.etudiant_nom }}</div>
                <div class="pc-session" v-if="p.date_soutenance">{{ formatDate(p.date_soutenance) }} · {{ p.salle || '—' }}</div>
                <div class="pc-actions">
                  <span v-if="p.isPresident" class="pc-role-badge badge-president-jury">⭐ Président</span>
                  <span v-else class="pc-role-badge badge-membre-jury">{{ p.fonction === 'encadrant' ? 'Encadrant' : 'Examinateur' }}</span>
                  <button v-if="p.isPresident" class="btn-evaluer" @click="ouvrirEvaluation(p)">{{ p.evalue ? 'Modifier' : 'Évaluer' }}</button>
                  <button v-else-if="p.evalue" class="btn-consulter" @click="ouvrirConsultation(p)" title="Consulter votre évaluation">👁 Voir mon éval.</button>
                  <span v-else class="pc-readonly-hint">En attente du président</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Mes évaluations (jury) -->
          <div v-else-if="currentPage==='jury-evaluations'" key="jury-evaluations">
            <div class="page-header-block"><div><h2 class="page-title">Mes évaluations</h2><p class="page-sub">Historique de vos évaluations soumises</p></div></div>
            <div v-if="!mesEvaluations.length" class="empty-state"><div class="empty-icon">✅</div><div class="empty-t">Aucune évaluation soumise</div><p class="empty-s">Vos évaluations apparaîtront ici.</p></div>
            <div v-else>
              <div v-for="ev in mesEvaluations" :key="ev.id" class="eval-card">
                <div class="eval-header">
                  <div><div class="eval-titre">{{ ev.projet_titre }}</div><div class="eval-etudiant-sub">{{ ev.etudiant_nom }}</div></div>
                  <div class="eval-meta">
                    <span class="eval-date">{{ ev.date }}</span>
                    <span class="badge-note">{{ ev.note_totale }}/20</span>
                    <button v-if="mesProjets.find(p=>p.id===ev.jury_id)?.isPresident" class="btn-modifier" @click="ouvrirModif(ev)">Modifier</button>
                  </div>
                </div>
                <div v-if="ev.commentaire" class="eval-comment">{{ ev.commentaire }}</div>
              </div>
            </div>
          </div>

          <!-- Messagerie -->
          <Messagerie v-else-if="currentPage==='messagerie'" key="messagerie"/>

        </transition>
      </div>
    </div>

    <!-- Evaluation Modal (jury) -->
    <transition name="modal-fade">
      <div class="overlay" v-if="showEvalModal" @click.self="showEvalModal=false">
        <div class="modal modal-lg">
          <div class="modal-title">{{ evalReadOnly ? 'Mon évaluation (lecture seule)' : 'Évaluation' }} — {{ evalProjet?.titre }}</div>
          <div class="eval-etudiant-info">Étudiant : {{ evalProjet?.etudiant_nom }}</div>
          <div v-if="loadingGrille" class="loading-state"><div class="spinner"></div><p>Chargement de la grille...</p></div>
          <div v-else-if="!evalCategories.length" class="empty-state" style="padding:20px"><p>Aucune grille d'évaluation disponible.</p></div>
          <div v-else class="eval-scroll">
            <div v-for="cat in evalCategories" :key="cat.id" class="eval-category">
              <div class="cat-header"><span class="cat-nom">{{ cat.nom }}</span><span class="cat-bareme">/ {{ cat.bareme_max }} pts</span></div>
              <div class="grille-criteres">
                <div v-for="c in cat.criteres" :key="c.id" class="critere-eval-row">
                  <div class="ce-info"><div class="ce-nom">{{ c.nom }}</div><div class="ce-desc">Barème : /{{ c.bareme_max }}</div></div>
                  <div class="ce-note-wrap">
                    <input type="number" :min="0" :max="c.bareme_max" step="0.25" v-model.number="c.note" class="note-input" :class="{'note-err': c.note > c.bareme_max || c.note < 0}" :disabled="evalReadOnly"/>
                    <span class="ce-max">/{{ c.bareme_max }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="eval-total"><span>Note totale :</span><span class="total-val">{{ noteTotale.toFixed(2) }}/20</span></div>
          <div class="form-group" style="margin-top:14px">
            <label>Commentaire (facultatif)</label>
            <textarea v-model="evalCommentaire" rows="3" placeholder="Observations générales..." :disabled="evalReadOnly" :readonly="evalReadOnly"></textarea>
          </div>
          <div class="modal-footer-enc">
            <button class="btn-cancel-enc" @click="showEvalModal=false;evalReadOnly=false">Annuler</button>
            <button v-if="!evalReadOnly" class="btn-primary-enc" @click="soumettreEvaluation" :disabled="savingEval">
              <span v-if="savingEval" class="spin-sm"></span>
              {{ savingEval ? 'Envoi...' : 'Soumettre l\'évaluation' }}
            </button>
            <span v-else class="eval-readonly-notice">👁 Lecture seule — seul le président peut évaluer</span>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import api from '@/services/api.js'

import DashboardChefHome      from './DashboardChefHome.vue'
import NotificationsDropdown  from './GestionArchivageCommunication/Notifications.vue'
import CreerFormulaire        from './GestionFormulaires/CreerFormulaire.vue'
import ListeFormulaires       from './GestionFormulaires/ListeFormulaires.vue'
import GestionAffectations    from './GestionAffectations/GestionAffectations.vue'
import GestionPhases          from './Gestionphases.vue'
import GestionGrille          from './Gestiongrille.vue'
import GestionJury            from './Gestionjury.vue'
import GestionSoutenance      from './Gestionsoutenance.vue'
import FichesEvaluation       from './FichesEvaluation.vue'
import DeliberationResultats  from './DeliberationResultats.vue'
import Messagerie             from './GestionArchivageCommunication/Messagerie.vue'
// Encadrant components
import DemandesEncadrement    from './GestionDemandes/DemandesEncadrement.vue'
import SuiviEncadrant         from './Suiviencadrant.vue'
import ReunionEncadrant       from './Reunionencadrant.vue'
import FicheVoeux             from './GestionFormulaires/FicheVoeux.vue'

export default {
  name: 'DashboardChef',
  components: {
    DashboardChefHome, CreerFormulaire, ListeFormulaires, GestionAffectations,
    GestionPhases, GestionGrille, GestionJury, GestionSoutenance,
    FichesEvaluation, DeliberationResultats, NotificationsDropdown, Messagerie,
    // Encadrant
    DemandesEncadrement, SuiviEncadrant, ReunionEncadrant, FicheVoeux,
  },

  data() {
    return {
      // Layout
      sidebarCollapsed: false,
      currentPage: 'home',
      openGroup: 'voeux',

      // Toast
      toast: { visible: false, type: 'toast-ok', message: '' },
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),

      // Chef data
      deptOnglet: 'etudiants',
      enseignants: [],
      formulaires: [],
      formulaireAModifier: null,
      loadingFormulaires: false,
      etudiants: [],
      encadrants: [],
      loadingEtudiants: false,
      loadingEncadrants: false,

      // Encadrant data
      nbEnAttente: 0,
      nbLivrablesPending: 0,
      etudiantsAffectes: [],
      capaciteMax: 0,
      searchEtu: '',
      ficheEtudiant: null,

      // Vœux (encadrant)
      formulaireActif: null,
      voeuxSoumis: false,
      voeuxData: null,
      dateSoumission: '',
      modeModifierVoeux: false,

      // Plan soutenance (encadrant)
      planSlots: [{ date: '', heure: '', salle: '', etudiant_id: '' }],
      savingPlan: false,
      mesPlansEnc: [],

      // Sessions (encadrant/jury)
      mesSessions: [],
      loadingSessions: false,

      // Évaluation jury
      mesProjets: [],
      mesEvaluations: [],
      loadingProjets: false,
      showEvalModal: false,
      evalProjet: null,
      evalCategories: [],
      evalCommentaire: '',
      loadingGrille: false,
      savingEval: false,
      evalReadOnly: false,
    }
  },

  computed: {
    breadcrumbRoot() {
      const encPages = ['enc-voeux','enc-demandes','enc-affectes','enc-suivi','enc-reunions','enc-calendrier','enc-proposer-plan']
      const juryPages = ['jury-projets','jury-evaluations']
      if (encPages.includes(this.currentPage)) return 'Espace Encadrant'
      if (juryPages.includes(this.currentPage)) return 'Espace Jury'
      return 'Chef de Département'
    },
    breadcrumb() {
      const map = {
        'voeux-creer':            'Créer un formulaire',
        'voeux-liste':            'Suivi & réponses',
        'affectation':            'Gérer les affectations',
        'mon-departement':        'Mon département',
        'phases':                 "Phases d'évaluation",
        'grille':                 "Grille d'évaluation",
        'jury':                   'Composition des jurys',
        'soutenance':             'Planifier les soutenances',
        'fiches-evaluation':      'Fiches d\'évaluation',
        'deliberation-resultats': 'Délibération & Résultats',
        'enc-voeux':              "Mes vœux d'encadrement",
        'enc-demandes':           'Gérer les demandes',
        'enc-affectes':           'Étudiants affectés',
        'enc-suivi':              'Suivi & livrables',
        'enc-reunions':           'Réunions',
        'enc-calendrier':         'Calendrier de soutenance',
        'enc-proposer-plan':      'Proposer un plan',
        'jury-projets':           'Projets à évaluer',
        'jury-evaluations':       'Mes évaluations',
        'messagerie':             'Messagerie',
      }
      return map[this.currentPage] || ''
    },
    dateNow() {
      return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    },
    peutModifier() {
      if (!this.formulaireActif?.date_limite) return false
      if (this.formulaireActif.statut === 'verrouille') return false
      return new Date(this.formulaireActif.date_limite) > new Date()
    },
    projetsNonEvalues() {
      return this.mesProjets.filter(p => !p.evalue).length
    },
    noteTotale() {
      let total = 0
      this.evalCategories.forEach(cat => { cat.criteres.forEach(c => { total += (c.note || 0) }) })
      return total
    },
  },

  async mounted() {
    await this.chargerFormulaires()
    await this.chargerEnseignants()
    await this.chargerEtudiants()
    await this.chargerEncadrants()
    await this.chargerDonneesEncadrant()
    await this.chargerFormulaireActif()
    this.chargerMesPlansEnc()
    this.chargerMesSessions()
    this.chargerMesProjetsJury()
  },

  methods: {
    toggleGroup(g) { this.openGroup = this.openGroup === g ? null : g },

    navigate(p) {
      this.currentPage = p
      this.modeModifierVoeux = false
      // Keep sidebar group open based on page
      if (p === 'voeux-creer' || p === 'voeux-liste') this.openGroup = 'voeux'
      else if (p === 'affectation')                    this.openGroup = 'aff'
      else if (p === 'phases' || p === 'grille')       this.openGroup = 'eval'
      else if (p === 'jury' || p === 'soutenance')     this.openGroup = 'sout'
      else if (p === 'fiches-evaluation' || p === 'deliberation-resultats') this.openGroup = 'rd'
      else if (p === 'enc-calendrier' || p === 'enc-proposer-plan') this.openGroup = 'enc-sout'
      else if (p === 'jury-projets' || p === 'jury-evaluations')    this.openGroup = 'jury-eval'
    },

    logout() {
      localStorage.removeItem('user')
      this.$router?.push('/login')
    },

    initiales(n) { return (n || '?').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) },

    formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('fr-FR') },

    formatJour(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric' }) },

    formatMois(d) { if (!d) return ''; return new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }).toUpperCase() },

    labelDisponibilite(d) {
      return { oui: '✅ Disponible', partielle: '⚡ Partiellement', non: '❌ Non disponible' }[d] || d || '—'
    },

    afficherToast({ message, type }) {
      this.toast = { visible: true, type, message }
      setTimeout(() => { this.toast.visible = false }, 3400)
    },

    // ── CHEF METHODS ──────────────────────────────────────────────────
    async chargerFormulaires() {
      this.loadingFormulaires = true
      try {
        const res = await api.get('/formulaires-voeux')
        this.formulaires = res.data.map(f => ({
          id: f.id, titre: f.titre,
          dateCreation: f.created_at ? new Date(f.created_at).toLocaleDateString('fr-FR') : '',
          dateLimite: f.date_limite, nbMax: f.nb_max_etudiants, champs: f.champs || [],
          message: f.message,
          statut: f.statut === 'publie' ? 'publié' : f.statut === 'verrouille' ? 'verrouillé' : 'brouillon',
          enseignants: [], reponses: Array.from({ length: f.nb_reponses || 0 }, (_, i) => ({ id: i })),
          nb_reponses: f.nb_reponses || 0,
        }))
      } catch (e) { console.error('Erreur chargement formulaires:', e) }
      finally { this.loadingFormulaires = false }
    },

    async chargerEnseignants() {
      try {
        const res = await api.get('/formulaires-voeux/enseignants-de-ma-specialite')
        this.enseignants = res.data.map(u => ({
          id: u.id, nom: u.nom, prenom: u.prenom, email: u.email,
          matricule: u.matricule, telephone: u.telephone, etablissement: u.etablissement, role: u.role,
        }))
      } catch (e) { console.error('Erreur chargement enseignants:', e) }
    },

    async chargerEtudiants() {
      this.loadingEtudiants = true
      try {
        const [etudiants, affectations] = await Promise.all([
          api.get('/affectations/etudiants-de-ma-specialite'),
          api.get('/affectations'),
        ])
        const affMap = {}
        ;(affectations.data || []).forEach(a => { if (a.etudiant_id) affMap[a.etudiant_id] = a.encadrant })
        this.etudiants = (etudiants.data || []).map(e => ({ ...e, encadrant: affMap[e.id] || null }))
      } catch (e) { console.error('Erreur étudiants:', e) }
      finally { this.loadingEtudiants = false }
    },

    async chargerEncadrants() {
      this.loadingEncadrants = true
      try {
        const res = await api.get('/affectations/encadrants-disponibles')
        this.encadrants = (res.data || []).map(e => ({
          id: e.id, nom: e.nom, prenom: e.prenom, email: e.email,
          domaine: e.domaine, nb_affectes: e.nb_affectes || 0, nb_max_pfe: null,
        }))
      } catch (e) { console.error('Erreur encadrants:', e) }
      finally { this.loadingEncadrants = false }
    },

    onModifierFormulaire(f) {
      this.formulaireAModifier = f
      this.navigate('voeux-creer')
    },

    async onFormulaireCree() {
      this.formulaireAModifier = null
      this.afficherToast({ message: 'Formulaire sauvegardé avec succès.', type: 'toast-ok' })
      this.navigate('voeux-liste')
    },

    // ── ENCADRANT METHODS ──────────────────────────────────────────────
    async chargerFormulaireActif() {
      try {
        const res = await api.get('/formulaires-voeux')
        const publie = res.data.find(f => f.statut === 'publie' || f.statut === 'verrouille')
        if (publie) {
          this.formulaireActif = publie
          const voeuxRes = await api.get('/voeux-encadrement?formulaire_id=' + publie.id)
          if (voeuxRes.data && voeuxRes.data.statut === 'soumis') {
            this.voeuxSoumis = true
            this.voeuxData = voeuxRes.data
            this.dateSoumission = voeuxRes.data.soumis_at
              ? new Date(voeuxRes.data.soumis_at).toLocaleDateString('fr-FR') : ''
          }
        }
      } catch (e) { console.error('Erreur formulaire vœux:', e) }
    },

    async chargerDonneesEncadrant() {
      try {
        const affRes = await api.get('/affectations/mes-affectations')
        const raw = affRes.data
        const affData = Array.isArray(raw) ? raw : (raw && raw.id ? [raw] : [])
        this.etudiantsAffectes = affData.map(a => ({
          id: a.etudiant_id,
          prenom: a.etudiant ? a.etudiant.split(' ')[0] : '',
          nom: a.etudiant ? a.etudiant.split(' ').slice(1).join(' ') : '',
          matricule: a.matricule || '', specialite: a.specialite || '',
          email: a.email || '', telephone: a.telephone || '', statut: a.statut,
        }))
        const demRes = await api.get('/demandes-encadrement')
        this.nbEnAttente = (demRes.data || []).filter(d => d.statut === 'en_attente').length
      } catch (e) { console.error('Erreur données encadrant:', e) }
    },

    onNbEnAttente(nb) { this.nbEnAttente = nb },

    onVoeuxSoumis(voeux) {
      this.voeuxSoumis = true
      this.voeuxData = voeux
      this.dateSoumission = new Date().toLocaleDateString('fr-FR')
      this.modeModifierVoeux = false
      this.capaciteMax = voeux?.nbre_max_pfe || this.capaciteMax
      this.afficherToast({ message: 'Vos vœux ont été soumis avec succès !', type: 'toast-ok' })
      this.navigate('enc-voeux')
    },

    exporterCSV() {
      const rows = [['#', 'Prénom', 'Nom', 'Matricule', 'Spécialité', 'Statut']]
      this.etudiantsAffectes.forEach((e, i) => {
        rows.push([i + 1, e.prenom, e.nom, e.matricule, e.specialite || '', 'Affecté'])
      })
      const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `etudiants_affectes_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
      URL.revokeObjectURL(url)
    },

    async chargerMesPlansEnc() {
      try {
        const res = await api.get('/plans-soutenance')
        const userId = this.currentUser.id
        this.mesPlansEnc = (res.data || [])
          .filter(p => p.proposant_id === userId || p.encadrant_id === userId)
          .map(p => ({
            id: p.id,
            date_proposition: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
            statut: p.statut || 'En attente',
          }))
      } catch (e) { /* silently ignore */ }
    },

    async soumettreplanEnc() {
      const valid = this.planSlots.every(s => s.date && s.heure && s.salle)
      if (!valid) { this.afficherToast({ message: "Veuillez remplir la date, l'heure et la salle pour chaque créneau.", type: 'toast-err' }); return }
      const hasEtu = this.planSlots.some(s => s.etudiant_id)
      if (!hasEtu) { this.afficherToast({ message: 'Veuillez sélectionner au moins un étudiant.', type: 'toast-err' }); return }
      this.savingPlan = true
      try {
        await api.post('/plans-soutenance', {
          proposant_id: this.currentUser.id, role: 'encadrant',
          creneaux: this.planSlots.filter(s => s.etudiant_id).map(s => ({
            etudiant_id: s.etudiant_id, date: s.date, heure_debut: s.heure, salle: s.salle,
          })),
        })
        this.afficherToast({ message: '✅ Plan soumis au chef de département avec succès.', type: 'toast-ok' })
        this.planSlots = [{ date: '', heure: '', salle: '', etudiant_id: '' }]
      } catch (e) {
        this.afficherToast({ message: e?.response?.data?.message || 'Erreur lors de la soumission du plan.', type: 'toast-err' })
      } finally { this.savingPlan = false }
    },

    // ── JURY METHODS ───────────────────────────────────────────────────
    async chargerMesSessions() {
      this.loadingSessions = true
      try {
        const res = await api.get('/jurys-pfe')
        const userId = this.currentUser.id
        this.mesSessions = (res.data || [])
          .filter(j => j.date_soutenance && (j.encadrant_id === userId || (j.membres || []).some(m => m.enseignant_id === userId)))
          .map(j => ({
            id: j.id, date: j.date_soutenance,
            heure_debut: (j.heure_debut || '').substring(0, 5),
            heure_fin: (j.heure_fin || '').substring(0, 5),
            salle: j.salle || '—', projet: j.projet_titre || '—',
            etudiant: j.etudiant_nom || '—', evalue: false,
          }))
      } catch (e) { console.error('Erreur sessions:', e); this.mesSessions = [] }
      finally { this.loadingSessions = false }
    },

    async chargerMesProjetsJury() {
      this.loadingProjets = true
      try {
        const res = await api.get('/jurys-pfe')
        const userId = this.currentUser.id
        this.mesProjets = (res.data || [])
          .filter(j => (j.membres || []).some(m => m.enseignant_id === userId))
          .map(j => {
            const userId = this.currentUser.id
            const membre = (j.membres || []).find(m => m.enseignant_id === userId)
            return {
              id: j.id, titre: j.projet_titre || ('Projet #' + j.id),
              etudiant_nom: j.etudiant_nom || '—', encadrant: j.encadrant_nom || '—',
              date_soutenance: j.date_soutenance || null, salle: j.salle || null,
              livrable_url: null, evalue: false,
              fonction: membre?.fonction || 'examinateur',
              isPresident: membre?.fonction === 'president',
            }
          })
        // Load existing notes for this user
        const notesRes = await api.get('/jurys-pfe/mes-notes')
        const notesMap = {}
        for (const n of (notesRes.data || [])) { notesMap[n.jury_id] = n }
        this.mesProjets.forEach(p => {
          if (notesMap[p.id]) {
            p.evalue = true
            p._noteExistante = notesMap[p.id]
          }
        })
        // Build mesEvaluations from existing notes
        this.mesEvaluations = (notesRes.data || []).map(n => ({
          id: n.id,
          jury_id: n.jury_id,
          projet_titre: (this.mesProjets.find(p => p.id === n.jury_id) || {}).titre || ('Jury #' + n.jury_id),
          etudiant_nom: (this.mesProjets.find(p => p.id === n.jury_id) || {}).etudiant_nom || '—',
          date: n.updated_at ? new Date(n.updated_at).toLocaleDateString('fr-FR') : '—',
          note_totale: parseFloat(n.note || 0),
          commentaire: n.commentaire || '',
          finalise: n.finalise,
          criteres: [],
        }))
      } catch (e) { console.error('Erreur projets jury:', e); this.mesProjets = [] }
      finally { this.loadingProjets = false }
    },

    async ouvrirEvaluation(projet) {
      this.evalProjet = projet
      this.evalCommentaire = ''
      this.showEvalModal = true
      this.evalReadOnly = false
      this.loadingGrille = true
      try {
        const res = await api.get('/grilles')
        const grille = (res.data || []).find(g => g.statut === 'verrouille')
        if (grille) {
          const detail = await api.get(`/grilles/${grille.id}`)
          this.evalCategories = (detail.data.categories || []).map(cat => ({
            id: cat.id, nom: cat.nom, bareme_max: parseFloat(cat.bareme_max),
            criteres: (cat.criteres || []).map(cr => ({ id: cr.id, nom: cr.nom, bareme_max: parseFloat(cr.bareme_max), note: 0 }))
          }))
        } else { this.evalCategories = [] }
      } catch (e) { console.error('Erreur grille:', e); this.evalCategories = [] }
      finally { this.loadingGrille = false }
      // Pre-fill existing note if any
      if (projet._noteExistante) {
        this.evalCommentaire = projet._noteExistante.commentaire || ''
        // Load per-critere breakdown if available
        try {
          const detailRes = await api.get(`/jurys-pfe/${projet.id}/ma-note`)
          if (detailRes.data?.criteres) {
            this.evalCategories.forEach(cat => {
              cat.criteres.forEach(cr => {
                const found = detailRes.data.criteres.find(ec => ec.critere_id === cr.id)
                if (found) cr.note = found.note || 0
              })
            })
          }
          this.evalCommentaire = detailRes.data?.commentaire || ''
        } catch (e) { /* silently ignore — form starts empty */ }
      }
    },

    ouvrirModif(ev) {
      const projet = this.mesProjets.find(p => p.titre === ev.projet_titre) || {
        titre: ev.projet_titre, etudiant_nom: ev.etudiant_nom, encadrant: '—'
      }
      this.ouvrirEvaluation(projet)
    },

    async ouvrirConsultation(projet) {
      // Non-president can only view their own submitted note (read-only)
      this.evalProjet = projet
      this.showEvalModal = true
      this.evalReadOnly = true
      this.loadingGrille = true
      try {
        const res = await api.get('/grilles')
        const grille = (res.data || []).find(g => g.statut === 'verrouille')
        if (grille) {
          const detail = await api.get(`/grilles/${grille.id}`)
          this.evalCategories = (detail.data.categories || []).map(cat => ({
            id: cat.id, nom: cat.nom, bareme_max: parseFloat(cat.bareme_max),
            criteres: (cat.criteres || []).map(cr => ({ id: cr.id, nom: cr.nom, bareme_max: parseFloat(cr.bareme_max), note: 0 }))
          }))
        } else { this.evalCategories = [] }
      } catch (e) { this.evalCategories = [] }
      finally { this.loadingGrille = false }
      // Fill with existing note
      try {
        const detailRes = await api.get(`/jurys-pfe/${projet.id}/ma-note`)
        if (detailRes.data?.criteres) {
          this.evalCategories.forEach(cat => {
            cat.criteres.forEach(cr => {
              const found = detailRes.data.criteres.find(ec => ec.critere_id === cr.id)
              if (found) cr.note = found.note || 0
            })
          })
        }
        this.evalCommentaire = detailRes.data?.commentaire || ''
      } catch (e) { /* no prior note */ }
    },

    async soumettreEvaluation() {
      for (const cat of this.evalCategories) {
        for (const c of cat.criteres) {
          if (c.note < 0 || c.note > c.bareme_max) {
            this.afficherToast({ message: `Note invalide pour "${c.nom}" (max ${c.bareme_max}).`, type: 'toast-err' }); return
          }
        }
      }
      this.savingEval = true
      try {
        const juryId = this.evalProjet?.id
        if (juryId) {
          // Build per-critère array for notes_grille_pfe
          const criteres = this.evalCategories.flatMap(cat =>
            cat.criteres.map(c => ({ critere_id: c.id, note: parseFloat(c.note || 0) }))
          )
          await api.post(`/jurys-pfe/${juryId}/notes`, {
            enseignant_id: this.currentUser.id,
            note: parseFloat(this.noteTotale.toFixed(2)),
            commentaire: this.evalCommentaire,
            finalise: true,
            criteres,
          })
        }
        this.afficherToast({ message: 'Évaluation soumise avec succès.', type: 'toast-ok' })
        const idx = this.mesProjets.findIndex(p => p.id === this.evalProjet?.id)
        if (idx !== -1) this.mesProjets[idx].evalue = true
        const allCriteres = this.evalCategories.flatMap(cat =>
          cat.criteres.map(c => ({ id: c.id, nom: c.nom, bareme: c.bareme_max, note: c.note }))
        )
        const newEval = {
          id: Date.now(), projet_titre: this.evalProjet?.titre,
          etudiant_nom: this.evalProjet?.etudiant_nom,
          date: new Date().toLocaleDateString('fr-FR'),
          note_totale: parseFloat(this.noteTotale.toFixed(2)),
          criteres: allCriteres, commentaire: this.evalCommentaire,
        }
        const existIdx = this.mesEvaluations.findIndex(e => e.projet_titre === this.evalProjet?.titre)
        if (existIdx !== -1) this.mesEvaluations[existIdx] = newEval
        else this.mesEvaluations.push(newEval)
        this.showEvalModal = false
      } catch (e) {
        this.afficherToast({ message: e?.response?.data?.message || 'Erreur lors de la soumission.', type: 'toast-err' })
      } finally { this.savingEval = false }
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.global-toast{position:fixed;top:22px;right:22px;z-index:9999;display:flex;align-items:center;gap:10px;padding:13px 20px;border-radius:12px;font-size:14px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,0.16);font-family:'Source Sans 3',sans-serif}
.toast-ok{background:#d4edda;color:#155724;border:1px solid rgba(40,167,69,0.3)}.toast-err{background:#f8d7da;color:#721c24;border:1px solid rgba(220,53,69,0.3)}
.toast-anim-enter-active,.toast-anim-leave-active{transition:opacity .25s,transform .25s}.toast-anim-enter-from{opacity:0;transform:translateX(20px)}.toast-anim-leave-to{opacity:0}
.dashboard-shell{display:flex;min-height:100vh;background:#c8c4bc;font-family:'Source Sans 3',sans-serif}

/* ── Sidebar ── */
.sidebar{width:260px;min-height:100vh;background:linear-gradient(160deg,#4a7090 0%,#3d6080 30%,#2f4f6a 65%,#243d52 100%);display:flex;flex-direction:column;flex-shrink:0;transition:width .3s cubic-bezier(.22,1,.36,1);position:sticky;top:0;height:100vh;overflow:hidden}
.sidebar.collapsed{width:68px}
.sb-brand{display:flex;align-items:center;justify-content:space-between;padding:22px 18px 18px;border-bottom:1px solid rgba(255,255,255,0.1);flex-shrink:0}
.brand-full{font-family:'Merriweather',serif;font-size:16px;font-weight:700;white-space:nowrap}.brand-icon{font-family:'Merriweather',serif;font-size:15px;font-weight:700;color:#F5C518;width:32px;text-align:center}
.logo-w{color:#fff}.logo-g{color:#F5C518;margin-left:5px}
.collapse-btn{background:rgba(255,255,255,0.08);border:none;border-radius:7px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);cursor:pointer;flex-shrink:0;transition:background .18s}.collapse-btn:hover{background:rgba(255,255,255,0.15);color:#fff}
.sb-nav{flex:1;padding:14px 10px;overflow-y:auto;overflow-x:hidden}

/* ── Role section dividers ── */
.role-section-header{display:flex;align-items:center;gap:8px;padding:14px 4px 6px;margin-top:4px}
.role-section-line{flex:1;height:1px;background:rgba(245,197,24,0.25)}
.role-section-label{display:flex;align-items:center;gap:5px;font-size:10px;font-weight:700;color:rgba(245,197,24,0.9);text-transform:uppercase;letter-spacing:.1em;white-space:nowrap}
.role-section-icon{display:flex;justify-content:center;padding:10px 0 4px;opacity:0.6}

/* ── Nav items ── */
.nav-cat{font-size:10px;font-weight:700;color:rgba(245,166,35,0.75);text-transform:uppercase;letter-spacing:.12em;padding:12px 12px 4px;white-space:nowrap}
.nav-item{display:flex;align-items:center;gap:11px;width:100%;padding:10px 11px;border:none;border-radius:10px;background:transparent;color:rgba(255,255,255,0.62);font-size:13.5px;font-family:'Source Sans 3',sans-serif;font-weight:500;cursor:pointer;text-align:left;transition:all .18s;white-space:nowrap;overflow:hidden;margin-bottom:2px}
.nav-item:hover{background:rgba(255,255,255,0.09);color:#fff}.nav-item.active{background:rgba(255,255,255,0.15);color:#fff}
.nav-icon{display:flex;align-items:center;flex-shrink:0;position:relative}.nav-label{overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px}

/* ── Nav groups (collapsible) ── */
.nav-group{display:flex;align-items:center;gap:10px;width:100%;padding:10px 11px;border:none;border-radius:10px;background:transparent;color:rgba(255,255,255,0.75);font-size:13px;font-family:'Source Sans 3',sans-serif;font-weight:600;cursor:pointer;text-align:left;transition:all .18s;margin-bottom:2px;margin-top:2px}
.nav-group:hover{background:rgba(255,255,255,0.07);color:#fff}.nav-group.open{color:#F5C518}
.group-icon{display:flex;align-items:center;flex-shrink:0;opacity:0.7}.group-label{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chevron{flex-shrink:0;transition:transform .25s;opacity:0.6}.chevron.rotated{transform:rotate(180deg)}
.sub-menu{padding-left:12px;overflow:hidden}
.sub-item{display:flex;align-items:center;gap:9px;width:100%;padding:8px 11px;border:none;border-radius:8px;background:transparent;color:rgba(255,255,255,0.55);font-size:13px;font-family:'Source Sans 3',sans-serif;cursor:pointer;text-align:left;transition:all .15s;margin-bottom:1px}
.sub-item:hover{background:rgba(255,255,255,0.07);color:#fff}.sub-item.active{background:rgba(245,197,24,0.15);color:#F5C518}
.sub-dot{width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0;opacity:0.6}
.submenu-enter-active{transition:max-height .25s ease,opacity .2s}.submenu-leave-active{transition:max-height .2s ease,opacity .15s}
.submenu-enter-from,.submenu-leave-to{max-height:0;opacity:0}.submenu-enter-to,.submenu-leave-from{max-height:300px;opacity:1}

/* ── Badges ── */
.nav-cnt{background:rgba(245,166,35,0.35);color:#f5e6c0;font-size:10px;font-weight:700;padding:1px 7px;border-radius:99px;margin-left:4px}
.badge-cnt{background:#f5a623;color:#fff;font-size:10px;font-weight:700;padding:1px 7px;border-radius:99px;flex-shrink:0}
.badge-soumis{background:rgba(39,174,96,0.3);color:#155724;font-size:10px;font-weight:700;padding:1px 7px;border-radius:99px}
.badge-dot{position:absolute;top:-3px;right:-3px;width:8px;height:8px;background:#f5a623;border-radius:50%;border:2px solid #3d6080}

/* ── User area ── */
.sb-user{display:flex;align-items:center;gap:10px;padding:14px;border-top:1px solid rgba(255,255,255,0.08);flex-shrink:0}
.u-av{width:36px;height:36px;border-radius:10px;background:#f5a623;color:#fff;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.u-info{flex:1;overflow:hidden}.u-name{font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.u-role{font-size:11.5px;color:rgba(255,255,255,0.42)}
.logout-btn{background:none;border:none;color:rgba(255,255,255,0.38);cursor:pointer;display:flex;align-items:center;padding:5px;border-radius:6px;transition:color .15s}.logout-btn:hover{color:#F5C518}
.sb-user-col{padding:14px 10px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:center}
.u-av-sm{width:36px;height:36px;border-radius:10px;background:#f5a623;color:#fff;font-weight:700;font-size:11px;display:flex;align-items:center;justify-content:center}

/* ── Main ── */
.main-wrap{flex:1;display:flex;flex-direction:column;min-width:0}
.topbar{background:#ddd9d1;border-bottom:1px solid #c8c4bc;padding:0 32px;height:60px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;position:sticky;top:0;z-index:10}
.breadcrumb{display:flex;align-items:center;gap:7px;font-size:13.5px}.bc-root{color:#3d6080;font-weight:700}.bc-curr{color:#1e2a35;font-weight:600}
.topbar-r{display:flex;align-items:center;gap:14px}.tb-date{font-size:12.5px;color:#8a9aaa;text-transform:capitalize}
.content-area{flex:1;padding:32px;overflow-y:auto}
.page-fade-enter-active{transition:opacity .25s,transform .25s cubic-bezier(.22,1,.36,1)}.page-fade-leave-active{transition:opacity .15s}
.page-fade-enter-from{opacity:0;transform:translateY(8px)}.page-fade-leave-to{opacity:0}

/* ── Page helpers ── */
.page-header-block{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:16px;flex-wrap:wrap}
.page-title{font-family:'Merriweather',serif;font-size:20px;color:#1e2a35;margin-bottom:4px}
.page-sub{font-size:13.5px;color:#7A8FA6}
.header-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}

/* ── Dept tabs ── */
.dept-header{margin-bottom:20px}
.dept-tabs{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.dept-tab{display:flex;align-items:center;gap:8px;padding:10px 20px;border:1.5px solid #c8c4bc;border-radius:10px;background:#ddd9d1;color:#4a5a6a;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .18s}
.dept-tab:hover{border-color:#3d6080;color:#3d6080}.dept-tab.active{background:rgba(61,96,128,0.15);color:#3d6080;border-color:#3d6080}
.tab-count{padding:1px 8px;background:rgba(61,96,128,0.1);border-radius:20px;font-size:11.5px;font-weight:700;color:#3d6080}
.dept-table-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;overflow:hidden}
.dept-table{width:100%;border-collapse:collapse}
.dept-table thead tr{background:#e8e4dc}
.dept-table th{padding:11px 14px;font-size:11px;font-weight:700;color:#4a5a6a;text-transform:uppercase;letter-spacing:.05em;text-align:left;white-space:nowrap}
.th-av{width:50px}.th-center{text-align:center}
.dept-tr{border-top:1px solid rgba(0,0,0,0.05);transition:background .15s}
.dept-tr:hover{background:#e0dcd4}
.dept-tr td{padding:13px 14px;font-size:13.5px;vertical-align:middle;color:#4a5a6a}
.av-gold{width:38px;height:38px;border-radius:10px;background:#f5a623;color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.av-blue{width:38px;height:38px;border-radius:10px;background:#3d6080;color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.av-green{width:38px;height:38px;border-radius:10px;background:#27ae60;color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.u-nom{font-weight:700;color:#1e2a35;font-size:14px}
.mat-tag{padding:2px 9px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:6px;font-size:12px;font-weight:600;color:#3d6080}
.td-email{font-size:13px;color:#3d6080}
.td-tel{font-size:13px;color:#7A8FA6}
.td-domaine{font-size:13px;color:#4a5a6a;font-style:italic}
.td-etab{font-size:13px;color:#7A8FA6}
.td-center{text-align:center}
.badge-affecte{padding:3px 10px;background:#d4edda;color:#1e7e34;border-radius:20px;font-size:12px;font-weight:600}
.badge-non-affecte{padding:3px 10px;background:#e8e4dc;color:#8a9aaa;border-radius:20px;font-size:12px;font-style:italic}

/* ── Loading / Empty ── */
.loading-state{text-align:center;padding:60px;color:#7A8FA6}
.spinner{width:32px;height:32px;border:3px solid #c8c4bc;border-top-color:#3d6080;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-state{text-align:center;padding:60px;color:#8a9aaa;line-height:1.6}
.empty-icon{font-size:48px;margin-bottom:12px}
.empty-t{font-weight:700;font-size:15px;color:#4a5a6a;margin-bottom:6px}
.empty-s{font-size:13.5px}

/* ── Encadrant — Vœux ── */
.page-content{}
.fiche-card-enc{background:#fff;border:1.5px solid #c8c4bc;border-radius:14px;padding:24px;max-width:700px}
.fiche-statut-enc{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.badge-soumis-lg{background:#d4edda;color:#1e7e34;padding:5px 14px;border-radius:20px;font-size:13px;font-weight:700}
.fiche-date-enc{font-size:13px;color:#8a9aaa}
.fiche-table-enc{width:100%;border-collapse:collapse}
.fiche-lbl-enc{padding:10px 14px 10px 0;font-size:13px;font-weight:600;color:#4a5a6a;width:200px;vertical-align:top;border-bottom:1px solid #f0ede8}
.fiche-val-enc{padding:10px 0;font-size:13.5px;color:#1e2a35;border-bottom:1px solid #f0ede8}
.dispo-badge{padding:3px 10px;border-radius:20px;font-size:12.5px;font-weight:600;background:#e8e4dc;color:#4a5a6a}
.spec-tag-enc{display:inline-block;padding:2px 9px;background:#e8f0f8;color:#3d6080;border-radius:6px;font-size:12px;font-weight:600;margin-right:5px}
.btn-primary-enc{display:flex;align-items:center;gap:8px;padding:10px 18px;background:#3d6080;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:background .18s}
.btn-primary-enc:hover{background:#2f4f6a}.btn-primary-enc:disabled{opacity:0.6;cursor:not-allowed}
.deadline-passed-enc{display:flex;align-items:center;gap:7px;font-size:13px;color:#e74c3c;background:#fdf2f2;border:1px solid #f5c6cb;border-radius:8px;padding:8px 14px}
.back-header-enc{margin-bottom:20px}
.back-btn-enc{display:flex;align-items:center;gap:7px;background:none;border:none;color:#3d6080;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;padding:6px 0}
.back-btn-enc:hover{color:#1e2a35}

/* ── Plan de soutenance ── */
.plan-form{background:#fff;border:1.5px solid #c8c4bc;border-radius:14px;padding:24px}
.plan-form-title{font-size:15px;font-weight:700;color:#1e2a35;margin-bottom:16px}
.plan-slot-row{display:flex;gap:12px;align-items:flex-end;margin-bottom:12px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid #f0ede8}
.form-group{display:flex;flex-direction:column;gap:5px}
.form-group label{font-size:12px;font-weight:600;color:#4a5a6a}
.form-group input,.form-group select{padding:8px 12px;border:1.5px solid #c8c4bc;border-radius:8px;font-size:13.5px;font-family:'Source Sans 3',sans-serif;background:#fff;color:#1e2a35;outline:none}
.form-group input:focus,.form-group select:focus{border-color:#3d6080}
.btn-rm-slot{background:none;border:1px solid #f5c6cb;border-radius:7px;color:#e74c3c;padding:6px 10px;cursor:pointer;font-size:13px;align-self:flex-end}
.btn-add-slot{background:none;border:1.5px dashed #c8c4bc;border-radius:9px;color:#3d6080;font-size:13px;font-weight:600;padding:10px 18px;cursor:pointer;width:100%;font-family:'Source Sans 3',sans-serif;transition:all .18s}
.btn-add-slot:hover{border-color:#3d6080;background:rgba(61,96,128,0.04)}
.btn-export{display:flex;align-items:center;gap:8px;padding:9px 16px;background:#fff;border:1.5px solid #c8c4bc;border-radius:9px;font-size:13px;font-weight:600;color:#4a5a6a;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .18s}
.btn-export:hover{border-color:#3d6080;color:#3d6080}

/* ── Sessions ── */
.sessions-list{display:flex;flex-direction:column;gap:12px}
.session-card{display:flex;align-items:center;gap:16px;background:#fff;border:1.5px solid #c8c4bc;border-radius:14px;padding:16px 20px;transition:background .15s}
.session-card:hover{background:#f0ede8}
.session-date-block{display:flex;flex-direction:column;align-items:center;min-width:52px}
.session-jour{font-family:'Merriweather',serif;font-size:28px;font-weight:800;color:#3d6080;line-height:1}
.session-mois{font-size:11px;color:#7A8FA6;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
.session-details{flex:1}
.session-titre{font-weight:700;font-size:14.5px;color:#1e2a35;margin-bottom:4px}
.session-info{font-size:13px;color:#4a5a6a;margin-bottom:3px}
.session-etudiant{font-size:13px;color:#7A8FA6}
.session-status{display:flex;flex-direction:column;align-items:flex-end;gap:8px;min-width:110px}
.badge-session{padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap}
.badge-done{background:#d4edda;color:#1e7e34}.badge-todo{background:#fff3cd;color:#856404}

/* ── Projets grid ── */
.projets-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px}
.projet-card{background:#fff;border:1.5px solid #c8c4bc;border-radius:14px;padding:20px;transition:border-color .15s}
.projet-card:hover{border-color:#3d6080}.projet-evalue{border-color:rgba(39,174,96,0.4)}
.pc-header{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px}
.pc-titre{font-weight:700;font-size:14.5px;color:#1e2a35;line-height:1.3}
.pc-badge{padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:700;white-space:nowrap;flex-shrink:0}
.badge-evalue{background:#d4edda;color:#1e7e34}.badge-pending{background:#fff3cd;color:#856404}
.pc-etudiant{font-size:13px;color:#4a5a6a;margin-bottom:6px}
.pc-session{font-size:12.5px;color:#7A8FA6;margin-bottom:14px}
.pc-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.btn-evaluer{padding:8px 16px;background:#3d6080;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:background .15s}
.btn-evaluer:hover{background:#2f4f6a}

/* ── Eval cards ── */
.eval-card{background:#fff;border:1.5px solid #c8c4bc;border-radius:14px;padding:20px;margin-bottom:14px}
.eval-header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:14px}
.eval-titre{font-weight:700;font-size:14.5px;color:#1e2a35;margin-bottom:4px}
.eval-etudiant-sub{font-size:13px;color:#7A8FA6}
.eval-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.eval-date{font-size:12.5px;color:#7A8FA6}
.badge-note{padding:4px 12px;background:rgba(61,96,128,0.1);color:#3d6080;border-radius:20px;font-size:13px;font-weight:700}
.btn-modifier{padding:6px 12px;background:#f0ede8;border:1px solid #c8c4bc;border-radius:8px;font-size:12.5px;color:#4a5a6a;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .15s}
.btn-modifier:hover{border-color:#3d6080;color:#3d6080}
.eval-comment{padding:10px 14px;background:#f0ede8;border-radius:8px;font-size:13px;color:#4a5a6a;border-left:3px solid #3d6080}

/* ── Eval Modal ── */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:#fff;border-radius:16px;padding:28px;max-height:90vh;overflow-y:auto;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.2)}
.modal-lg{max-width:640px}
.modal-title{font-family:'Merriweather',serif;font-size:17px;color:#1e2a35;margin-bottom:6px}
.eval-etudiant-info{font-size:13px;color:#7A8FA6;margin-bottom:18px}
.eval-scroll{max-height:50vh;overflow-y:auto;padding-right:4px}
.eval-category{margin-bottom:20px}
.cat-header{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f0ede8;border-radius:8px;margin-bottom:10px}
.cat-nom{font-weight:700;font-size:13.5px;color:#3d6080}
.cat-bareme{font-size:12.5px;color:#7A8FA6}
.grille-criteres{display:flex;flex-direction:column;gap:8px;padding:0 4px}
.critere-eval-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px;background:#f8f5f0;border-radius:8px}
.ce-info{flex:1}.ce-nom{font-size:13.5px;color:#1e2a35;font-weight:600}.ce-desc{font-size:11.5px;color:#7A8FA6;margin-top:2px}
.ce-note-wrap{display:flex;align-items:center;gap:6px}
.note-input{width:72px;padding:6px 8px;border:1.5px solid #c8c4bc;border-radius:7px;background:#fff;color:#1e2a35;font-size:14px;font-family:'Source Sans 3',sans-serif;text-align:center}
.note-input:focus{outline:none;border-color:#3d6080}.note-err{border-color:#e74c3c!important}
.ce-max{font-size:12.5px;color:#7A8FA6;min-width:24px}
.eval-total{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#f0ede8;border-radius:10px;margin:16px 0 4px;font-size:14px;color:#4a5a6a;font-weight:600}
.total-val{font-size:20px;font-weight:800;color:#3d6080;font-family:'Merriweather',serif}
.modal-footer-enc{display:flex;justify-content:flex-end;gap:10px;margin-top:16px}
.btn-cancel-enc{padding:10px 18px;background:transparent;border:1.5px solid #c8c4bc;border-radius:9px;font-size:13px;font-weight:600;color:#4a5a6a;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .18s}
.btn-cancel-enc:hover{border-color:#3d6080;color:#3d6080}
.spin-sm{width:12px;height:12px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
.modal-fade-enter-active,.modal-fade-leave-active{transition:opacity .2s}.modal-fade-enter-from,.modal-fade-leave-to{opacity:0}

@media(max-width:768px){.content-area{padding:20px}.topbar{padding:0 16px}.plan-slot-row{flex-direction:column}.projets-grid{grid-template-columns:1fr}}

/* ── Jury role badges ── */
.pc-role-badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;margin-right:6px}
.badge-president-jury{background:rgba(245,197,24,.15);color:#9a7200;border:1px solid rgba(245,197,24,.4)}
.badge-membre-jury{background:rgba(74,112,144,.12);color:#3d6080;border:1px solid rgba(74,112,144,.25)}
.pc-readonly-hint{font-size:12px;color:#8a9aaa;font-style:italic}
.btn-consulter{padding:7px 14px;border:1.5px solid #3d6080;background:rgba(61,96,128,.08);color:#3d6080;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .18s}
.btn-consulter:hover{background:rgba(61,96,128,.18)}
.eval-readonly-notice{font-size:12.5px;color:#7A8FA6;font-style:italic;align-self:center;margin-left:8px}
</style>