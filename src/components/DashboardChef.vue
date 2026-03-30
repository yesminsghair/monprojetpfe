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
        <button class="collapse-btn" @click="sidebarCollapsed=!sidebarCollapsed"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
      </div>
      <nav class="sb-nav">

        <!-- Tableau de bord -->
        <button class="nav-item" :class="{active:currentPage==='home'}" @click="navigate('home')" :title="sidebarCollapsed?'Accueil':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Tableau de bord</span>
        </button>

        <!-- ── Mon département ── -->
        <button class="nav-item" :class="{active:currentPage==='mon-departement'}" @click="navigate('mon-departement')" :title="sidebarCollapsed?'Mon département':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Mon département</span>
        </button>

        <!-- ── Vœux d'encadrement ── -->
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
            <button class="sub-item" :class="{active:currentPage==='voeux-creer'}" @click="navigate('voeux-creer')">
              <span class="sub-dot"></span>Créer un formulaire
            </button>
            <button class="sub-item" :class="{active:currentPage==='voeux-liste'}" @click="navigate('voeux-liste')">
              <span class="sub-dot"></span>Suivi &amp; réponses
            </button>
          </div>
        </transition>

        <!-- ── Affectation ── -->
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
            <button class="sub-item" :class="{active:currentPage==='affectation'}" @click="navigate('affectation')">
              <span class="sub-dot"></span>Gérer les affectations
            </button>
          </div>
        </transition>

        <!-- ── Évaluation PFE ── -->
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
            <button class="sub-item" :class="{active:currentPage==='phases'}" @click="navigate('phases')">
              <span class="sub-dot"></span>Phases d'évaluation
            </button>
            <button class="sub-item" :class="{active:currentPage==='grille'}" @click="navigate('grille')">
              <span class="sub-dot"></span>Grille d'évaluation
            </button>
          </div>
        </transition>

        <!-- ── Soutenances ── -->
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
            <button class="sub-item" :class="{active:currentPage==='jury'}" @click="navigate('jury')">
              <span class="sub-dot"></span>Composition des jurys
            </button>
            <button class="sub-item" :class="{active:currentPage==='soutenance'}" @click="navigate('soutenance')">
              <span class="sub-dot"></span>Planifier les soutenances
            </button>
          </div>
        </transition>

      </nav>
      <div class="sb-user" v-if="!sidebarCollapsed">
        <div class="u-av">{{ initiales(currentUser.prenom+' '+currentUser.nom) }}</div>
        <div class="u-info"><div class="u-name">{{ currentUser.prenom }} {{ currentUser.nom }}</div><div class="u-role">Chef de département</div></div>
        <button class="logout-btn" @click="logout"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button>
      </div>
      <div class="sb-user-col" v-else><div class="u-av-sm">{{ initiales(currentUser.prenom+' '+currentUser.nom) }}</div></div>
    </aside>

    <!-- MAIN -->
    <div class="main-wrap">
      <header class="topbar">
        <div class="breadcrumb"><span class="bc-root">Chef de Département</span><template v-if="breadcrumb"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg><span class="bc-curr">{{ breadcrumb }}</span></template></div>
        <div class="topbar-r"><span class="tb-date">{{ dateNow }}</span></div>
      </header>

      <div class="content-area">
        <transition name="page-fade" mode="out-in">

          <!-- HOME -->
          <div v-if="currentPage==='home'" key="home">
            <div class="ptb"><h1 class="pt">Bonjour, {{ currentUser.prenom }} 👋</h1><p class="ps">Gérez les vœux d'encadrement et les affectations des étudiants.</p></div>
            <div class="kpi-grid">
              <div class="kpi-card kpi-blue"><div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div><div class="kpi-v">{{ formulaires.length }}</div><div class="kpi-l">Formulaires</div></div></div>
              <div class="kpi-card kpi-green"><div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div><div><div class="kpi-v">{{ formulaires.filter(f=>f.statut==='publié').length }}</div><div class="kpi-l">Publiés</div></div></div>
              <div class="kpi-card kpi-gold"><div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="kpi-v">{{ enseignants.length }}</div><div class="kpi-l">Enseignants</div></div></div>
              <div class="kpi-card kpi-slate"><div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div><div><div class="kpi-v">5</div><div class="kpi-l">Affectés</div></div></div>
            </div>
            <div class="sec-title">Actions rapides</div>
            <div class="qa-grid">
              <button class="qa-card" @click="navigate('voeux-creer')">
                <div class="qa-icon qa-gold"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Créer un formulaire de vœux</div><div class="qa-s">Définir et envoyer aux enseignants</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('voeux-liste')">
                <div class="qa-icon qa-blue"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Consulter les vœux reçus</div><div class="qa-s">Réponses des enseignants</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('affectation')">
                <div class="qa-icon qa-teal"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Gérer les affectations</div><div class="qa-s">Manuel / Aléatoire / Semi-aléatoire</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('phases')">
                <div class="qa-icon qa-gold"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Gérer les phases</div><div class="qa-s">Créer et ordonner les phases d'évaluation</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('grille')">
                <div class="qa-icon qa-blue"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Grille d'évaluation</div><div class="qa-s">Définir les critères et barèmes</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('jury')">
                <div class="qa-icon qa-teal"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Composer les jurys</div><div class="qa-s">Affecter les membres de jury aux projets</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('soutenance')">
                <div class="qa-icon qa-gold"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Planifier les soutenances</div><div class="qa-s">Sessions, salles, calendrier</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>

          <CreerFormulaire v-else-if="currentPage==='voeux-creer'" key="vc" :enseignants="enseignants" :formulaire-a-modifier="formulaireAModifier" @form-cree="onFormulaireCree" @navigate="navigate"/>
          <ListeFormulaires v-else-if="currentPage==='voeux-liste'" key="vl" @modifier="onModifierFormulaire" @navigate="navigate"/>
          <GestionAffectations v-else-if="currentPage==='affectation'" key="aff" @toast="afficherToast"/>
          <GestionPhases v-else-if="currentPage==='phases'" key="phases" @toast="afficherToast"/>
          <GestionGrille v-else-if="currentPage==='grille'" key="grille" @toast="afficherToast"/>
          <GestionJury v-else-if="currentPage==='jury'" key="jury" @toast="afficherToast"/>
          <GestionSoutenance v-else-if="currentPage==='soutenance'" key="soutenance" @toast="afficherToast"/>

          <!-- ═══ ÉTUDIANTS DE MA SPÉCIALITÉ ═══ -->
          <!-- ═══ MON DÉPARTEMENT (3 onglets) ═══ -->
          <div v-else-if="currentPage==='mon-departement'" key="mon-departement">
            <div class="dept-header">
              <div>
                <h2 class="page-title">Mon département</h2>
                <p class="page-sub">Vue d'ensemble de votre spécialité</p>
              </div>
            </div>

            <!-- Onglets -->
            <div class="dept-tabs">
              <button class="dept-tab" :class="{active: deptOnglet==='etudiants'}" @click="deptOnglet='etudiants'">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                Étudiants
                <span class="tab-count">{{ etudiants.length }}</span>
              </button>
              <button class="dept-tab" :class="{active: deptOnglet==='enseignants'}" @click="deptOnglet='enseignants'">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                Enseignants
                <span class="tab-count">{{ enseignants.length }}</span>
              </button>
              <button class="dept-tab" :class="{active: deptOnglet==='encadrants'}" @click="deptOnglet='encadrants'">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/><polyline points="16 11 18 13 22 9"/></svg>
                Encadrants
                <span class="tab-count">{{ encadrants.length }}</span>
              </button>
            </div>

            <!-- ── ONGLET ÉTUDIANTS ── -->
            <div v-if="deptOnglet==='etudiants'">
              <div v-if="loadingEtudiants" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
              <div v-else-if="!etudiants.length" class="empty-state"><div class="empty-icon">👨‍🎓</div><p>Aucun étudiant dans votre spécialité.</p></div>
              <div v-else class="dept-table-card">
                <table class="dept-table">
                  <thead><tr>
                    <th class="th-av"></th>
                    <th>Étudiant</th>
                    <th>Matricule</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Affectation</th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="e in etudiants" :key="e.id" class="dept-tr">
                      <td><div class="av-gold">{{ initiales(e.prenom+' '+e.nom) }}</div></td>
                      <td><div class="u-nom">{{ e.prenom }} {{ e.nom }}</div></td>
                      <td><span class="mat-tag">{{ e.matricule || '—' }}</span></td>
                      <td class="td-email">{{ e.email || '—' }}</td>
                      <td class="td-tel">{{ e.telephone || '—' }}</td>
                      <td>
                        <span v-if="e.encadrant" class="badge-affecte">✓ {{ e.encadrant }}</span>
                        <span v-else class="badge-non-affecte">Non affecté</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ── ONGLET ENSEIGNANTS ── -->
            <div v-else-if="deptOnglet==='enseignants'">
              <div v-if="!enseignants.length" class="empty-state"><div class="empty-icon">🎓</div><p>Aucun enseignant dans votre spécialité.</p></div>
              <div v-else class="dept-table-card">
                <table class="dept-table">
                  <thead><tr>
                    <th class="th-av"></th>
                    <th>Enseignant</th>
                    <th>Matricule</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Établissement</th>
                  </tr></thead>
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

            <!-- ── ONGLET ENCADRANTS ── -->
            <div v-else-if="deptOnglet==='encadrants'">
              <div v-if="loadingEncadrants" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
              <div v-else-if="!encadrants.length" class="empty-state">
                <div class="empty-icon">👤</div>
                <p>Aucun encadrant disponible.<br><span style="font-size:12.5px;color:#aaa">Les enseignants deviennent encadrants après avoir soumis leurs vœux.</span></p>
              </div>
              <div v-else class="dept-table-card">
                <table class="dept-table">
                  <thead><tr>
                    <th class="th-av"></th>
                    <th>Encadrant</th>
                    <th>Email</th>
                    <th>Domaine</th>
                    <th class="th-center">Max étudiants</th>
                    <th class="th-center">Affectés</th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="e in encadrants" :key="e.id" class="dept-tr">
                      <td><div class="av-green">{{ initiales(e.prenom+' '+e.nom) }}</div></td>
                      <td><div class="u-nom">{{ e.prenom }} {{ e.nom }}</div></td>
                      <td class="td-email">{{ e.email || '—' }}</td>
                      <td class="td-domaine">{{ e.domaine || '—' }}</td>
                      <td class="td-center">{{ e.nb_max_pfe || '—' }}</td>
                      <td class="td-center">
                        <span :class="e.nb_affectes > 0 ? 'badge-affecte' : 'badge-non-affecte'">{{ e.nb_affectes || 0 }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import CreerFormulaire     from './GestionFormulaires/CreerFormulaire.vue'
import ListeFormulaires    from './GestionFormulaires/ListeFormulaires.vue'
import GestionAffectations from './GestionAffectations/GestionAffectations.vue'
import GestionPhases       from './Gestionphases.vue'
import GestionGrille       from './Gestiongrille.vue'
import GestionJury         from './Gestionjury.vue'
import GestionSoutenance   from './Gestionsoutenance.vue'

export default {
  name: 'DashboardChef',
  components: { CreerFormulaire, ListeFormulaires, GestionAffectations, GestionPhases, GestionGrille, GestionJury, GestionSoutenance },
  data() {
    return {
      sidebarCollapsed: false,
      currentPage: 'home',
      openGroup: 'voeux',
      deptOnglet: 'etudiants',
      toast: { visible: false, type: 'toast-ok', message: '' },
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),
      enseignants: [],
      formulaires: [],
      formulaireAModifier: null,
      loadingFormulaires: false,
      etudiants: [],
      encadrants: [],
      loadingEtudiants: false,
      loadingEncadrants: false,
    }
  },
  computed: {
    breadcrumb() { return {'voeux-creer':'Créer un formulaire','voeux-liste':'Suivi & résultats','affectation':'Gérer les affectations','mon-departement':'Mon département','phases':'Phases d\'évaluation','grille':'Grille d\'évaluation','jury':'Composition des jurys','soutenance':'Planifier les soutenances'}[this.currentPage]||'' },
    dateNow() { return new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) },
  },
  async mounted() {
    await this.chargerFormulaires()
    await this.chargerEnseignants()
    await this.chargerEtudiants()
    await this.chargerEncadrants()
  },

  methods: {
    toggleGroup(g) { this.openGroup = this.openGroup === g ? null : g },
    navigate(p) {
      this.currentPage = p
      if (p === 'voeux-creer' || p === 'voeux-liste')  this.openGroup = 'voeux'
      else if (p === 'affectation')                      this.openGroup = 'aff'
      else if (p === 'phases' || p === 'grille')         this.openGroup = 'eval'
      else if (p === 'jury' || p === 'soutenance')       this.openGroup = 'sout'
    },

    getApi() {
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      const inst = axios.create({
        baseURL: 'http://127.0.0.1:8000/api',
        headers: { 'Authorization': 'Bearer ' + stored.token, 'Accept': 'application/json', 'Content-Type': 'application/json' },
      })
      return inst
    },

    async chargerFormulaires() {
      this.loadingFormulaires = true
      try {
        const res = await this.getApi().get('/formulaires-voeux')
        // Adapter le format API → format attendu par les sous-composants
        this.formulaires = res.data.map(f => ({
          id:           f.id,
          titre:        f.titre,
          dateCreation: f.created_at ? new Date(f.created_at).toLocaleDateString('fr-FR') : '',
          dateLimite:   f.date_limite,
          nbMax:        f.nb_max_etudiants,
          champs:       f.champs || [],
          message:      f.message,
          statut:       f.statut === 'publie' ? 'publié' : f.statut === 'verrouille' ? 'verrouillé' : 'brouillon',
          enseignants:  [],
          reponses:     Array.from({ length: f.nb_reponses || 0 }, (_, i) => ({ id: i })),
          nb_reponses:  f.nb_reponses || 0,
        }))
      } catch (e) {
        console.error('Erreur chargement formulaires:', e)
      } finally {
        this.loadingFormulaires = false
      }
    },

    async chargerEnseignants() {
      try {
        const res = await this.getApi().get('/formulaires-voeux/enseignants-de-ma-specialite')
        this.enseignants = res.data.map(u => ({
          id:           u.id,
          nom:          u.nom,
          prenom:       u.prenom,
          email:        u.email,
          matricule:    u.matricule,
          telephone:    u.telephone,
          etablissement:u.etablissement,
          role:         u.role,
        }))
      } catch (e) {
        console.error('Erreur chargement enseignants:', e)
      }
    },
    async chargerEtudiants() {
      this.loadingEtudiants = true
      try {
        const [etudiants, affectations] = await Promise.all([
          this.getApi().get('/affectations/etudiants-de-ma-specialite'),
          this.getApi().get('/affectations'),
        ])
        const affMap = {}
        ;(affectations.data || []).forEach(a => {
          if (a.etudiant_id) affMap[a.etudiant_id] = a.encadrant
        })
        this.etudiants = (etudiants.data || []).map(e => ({
          ...e,
          encadrant: affMap[e.id] || null,
        }))
      } catch (e) { console.error('Erreur étudiants:', e) }
      finally { this.loadingEtudiants = false }
    },

    async chargerEncadrants() {
      this.loadingEncadrants = true
      try {
        // encadrants-disponibles filtre déjà par spécialité et role=encadrant
        const res = await this.getApi().get('/affectations/encadrants-disponibles')
        // Enrichir avec le nb_max_pfe depuis les vœux soumis
        this.encadrants = (res.data || []).map(e => ({
          id:         e.id,
          nom:        e.nom,
          prenom:     e.prenom,
          email:      e.email,
          domaine:    e.domaine,
          nb_affectes:e.nb_affectes || 0,
          nb_max_pfe: null, // sera enrichi si besoin
        }))
      } catch (e) { console.error('Erreur encadrants:', e) }
      finally { this.loadingEncadrants = false }
    },
    logout() {
      localStorage.removeItem('user')
      this.$router?.push('/login')
    },
    initiales(n) { return (n||'?').split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2) },
    onModifierFormulaire(f) {
      this.formulaireAModifier = f
      this.navigate('voeux-creer')
    },
    async onFormulaireCree(form) {
      this.formulaireAModifier = null
      this.afficherToast({message:'Formulaire sauvegardé avec succès.',type:'toast-ok'})
      this.navigate('voeux-liste')
    },
    async publierFormulaire(id) {
      await this.chargerFormulaires()
      this.afficherToast({message:'Formulaire publié avec succès.',type:'toast-ok'})
    },
    async verrouillerFormulaire(id) {
      await this.chargerFormulaires()
      this.afficherToast({message:'Formulaire verrouillé. Les réponses sont clôturées.',type:'toast-ok'})
    },
    afficherToast({message,type}) { this.toast={visible:true,type,message};setTimeout(()=>{this.toast.visible=false},3400) },
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
.sidebar{width:260px;min-height:100vh;background:linear-gradient(160deg,#4a7090 0%,#3d6080 30%,#2f4f6a 65%,#243d52 100%);display:flex;flex-direction:column;flex-shrink:0;transition:width .3s cubic-bezier(.22,1,.36,1);position:sticky;top:0;height:100vh;overflow:hidden}
.sidebar.collapsed{width:68px}
.sb-brand{display:flex;align-items:center;justify-content:space-between;padding:22px 18px 18px;border-bottom:1px solid rgba(255,255,255,0.1);flex-shrink:0}
.brand-full{font-family:'Merriweather',serif;font-size:16px;font-weight:700;white-space:nowrap}.brand-icon{font-family:'Merriweather',serif;font-size:15px;font-weight:700;color:#F5C518;width:32px;text-align:center}
.logo-w{color:#fff}.logo-g{color:#F5C518;margin-left:5px}
.collapse-btn{background:rgba(255,255,255,0.08);border:none;border-radius:7px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);cursor:pointer;flex-shrink:0;transition:background .18s}.collapse-btn:hover{background:rgba(255,255,255,0.15);color:#fff}
.sb-nav{flex:1;padding:14px 10px;overflow-y:auto;overflow-x:hidden}
.nav-cat{font-size:10px;font-weight:700;color:rgba(245,166,35,0.75);text-transform:uppercase;letter-spacing:.12em;padding:12px 12px 4px;white-space:nowrap}
.nav-item{display:flex;align-items:center;gap:11px;width:100%;padding:10px 11px;border:none;border-radius:10px;background:transparent;color:rgba(255,255,255,0.62);font-size:13.5px;font-family:'Source Sans 3',sans-serif;font-weight:500;cursor:pointer;text-align:left;transition:all .18s;white-space:nowrap;overflow:hidden;margin-bottom:2px}
.nav-item:hover{background:rgba(255,255,255,0.09);color:#fff}.nav-item.active{background:rgba(255,255,255,0.15);color:#fff}
.nav-icon{display:flex;align-items:center;flex-shrink:0}.nav-label{overflow:hidden;text-overflow:ellipsis}
.sb-user{display:flex;align-items:center;gap:10px;padding:14px;border-top:1px solid rgba(255,255,255,0.08);flex-shrink:0}
.u-av{width:36px;height:36px;border-radius:10px;background:#f5a623;color:#fff;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.u-info{flex:1;overflow:hidden}.u-name{font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.u-role{font-size:11.5px;color:rgba(255,255,255,0.42)}
.logout-btn{background:none;border:none;color:rgba(255,255,255,0.38);cursor:pointer;display:flex;align-items:center;padding:5px;border-radius:6px;transition:color .15s}.logout-btn:hover{color:#F5C518}
.sb-user-col{padding:14px 10px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:center}
.u-av-sm{width:36px;height:36px;border-radius:10px;background:#f5a623;color:#fff;font-weight:700;font-size:11px;display:flex;align-items:center;justify-content:center}
.main-wrap{flex:1;display:flex;flex-direction:column;min-width:0}
.topbar{background:#ddd9d1;border-bottom:1px solid #c8c4bc;padding:0 32px;height:60px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;position:sticky;top:0;z-index:10}
.breadcrumb{display:flex;align-items:center;gap:7px;font-size:13.5px}.bc-root{color:#F5C518;font-weight:600}.bc-curr{color:#1e2a35;font-weight:600}
.topbar-r{display:flex;align-items:center;gap:14px}.tb-date{font-size:12.5px;color:#8a9aaa;text-transform:capitalize}
.content-area{flex:1;padding:32px;overflow-y:auto}
.ptb{margin-bottom:28px}.pt{font-family:'Merriweather',serif;font-size:24px;font-weight:700;color:#1e2a35;margin-bottom:5px}.ps{font-size:14px;color:#7A8FA6}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
.kpi-card{background:#ddd9d1;border-radius:14px;padding:22px 20px;display:flex;align-items:center;gap:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border:1.5px solid #c8c4bc}
.kpi-icon{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.kpi-blue .kpi-icon{background:rgba(245,197,24,0.12);color:#F5C518}.kpi-gold .kpi-icon{background:rgba(245,166,35,0.12);color:#d98e1a}.kpi-green .kpi-icon{background:rgba(39,174,96,0.12);color:#27ae60}.kpi-slate .kpi-icon{background:rgba(74,90,106,0.1);color:#A8BDD4}
.kpi-v{font-family:'Merriweather',serif;font-size:28px;font-weight:700;color:#1e2a35;line-height:1}.kpi-l{font-size:12px;color:#8a9aaa;margin-top:4px}
.sec-title{font-size:12px;font-weight:700;color:#8a9aaa;text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px}
.qa-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.qa-card{display:flex;align-items:center;gap:14px;background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;padding:18px 20px;cursor:pointer;text-align:left;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
.qa-card:hover{border-color:#3d6080;box-shadow:0 4px 18px rgba(61,96,128,0.12);transform:translateY(-2px)}
.qa-icon{width:44px;height:44px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.qa-blue{background:rgba(245,197,24,0.12);color:#F5C518}.qa-gold{background:rgba(245,166,35,0.12);color:#d98e1a}.qa-teal{background:rgba(39,174,96,0.12);color:#27ae60}
.qa-txt{flex:1}.qa-t{font-size:14px;font-weight:600;color:#1e2a35;margin-bottom:2px}.qa-s{font-size:12.5px;color:#7A8FA6}
.qa-arr{color:#c8c4bc;flex-shrink:0;transition:transform .18s,color .18s}.qa-card:hover .qa-arr{transform:translateX(3px);color:#F5C518}
.page-fade-enter-active{transition:opacity .25s,transform .25s cubic-bezier(.22,1,.36,1)}.page-fade-leave-active{transition:opacity .15s}
.page-fade-enter-from{opacity:0;transform:translateY(8px)}.page-fade-leave-to{opacity:0}
@media(max-width:1100px){.kpi-grid{grid-template-columns:repeat(2,1fr)}.qa-grid{grid-template-columns:1fr 1fr}}
@media(max-width:768px){.content-area{padding:20px}.topbar{padding:0 16px}}
/* Nav count badge */
.nav-cnt{background:rgba(245,166,35,0.35);color:#f5e6c0;font-size:10px;font-weight:700;padding:1px 7px;border-radius:99px;margin-left:4px}
/* Nav group (collapsible) */
.nav-group{display:flex;align-items:center;gap:10px;width:100%;padding:10px 11px;border:none;border-radius:10px;background:transparent;color:rgba(255,255,255,0.75);font-size:13px;font-family:'Source Sans 3',sans-serif;font-weight:600;cursor:pointer;text-align:left;transition:all .18s;margin-bottom:2px;margin-top:6px}
.nav-group:hover{background:rgba(255,255,255,0.07);color:#fff}
.nav-group.open{color:#F5C518}
.group-icon{display:flex;align-items:center;flex-shrink:0;opacity:0.7}
.group-label{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chevron{flex-shrink:0;transition:transform .25s;opacity:0.6}
.chevron.rotated{transform:rotate(180deg)}
.sub-menu{padding-left:12px;overflow:hidden}
.sub-item{display:flex;align-items:center;gap:9px;width:100%;padding:8px 11px;border:none;border-radius:8px;background:transparent;color:rgba(255,255,255,0.55);font-size:13px;font-family:'Source Sans 3',sans-serif;cursor:pointer;text-align:left;transition:all .15s;margin-bottom:1px}
.sub-item:hover{background:rgba(255,255,255,0.07);color:#fff}
.sub-item.active{background:rgba(245,197,24,0.15);color:#F5C518}
.sub-dot{width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0;opacity:0.6}
.submenu-enter-active{transition:max-height .25s ease,opacity .2s}
.submenu-leave-active{transition:max-height .2s ease,opacity .15s}
.submenu-enter-from,.submenu-leave-to{max-height:0;opacity:0}
.submenu-enter-to,.submenu-leave-from{max-height:200px;opacity:1}
/* Pages département */
.page-header-block{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:16px;flex-wrap:wrap}
.page-title{font-family:'Merriweather',serif;font-size:20px;color:#1e2a35;margin-bottom:4px}
/* ── Mon département ── */
.dept-header{margin-bottom:20px}
.dept-tabs{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.dept-tab{display:flex;align-items:center;gap:8px;padding:10px 20px;border:1.5px solid #c8c4bc;border-radius:10px;background:#ddd9d1;color:#4a5a6a;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .18s}
.dept-tab:hover{border-color:#3d6080;color:#F5C518}
.dept-tab.active{background:rgba(245,197,24,0.2);color:#fff;border-color:#F5C518}
.dept-tab.active .tab-count{background:rgba(255,255,255,0.25);color:#fff}
.tab-count{padding:1px 8px;background:rgba(245,197,24,0.1);border-radius:20px;font-size:11.5px;font-weight:700;color:#F5C518}
.dept-table-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;overflow:hidden}
.dept-table{width:100%;border-collapse:collapse}
.dept-table thead tr{background:#0F1923}
.dept-table th{padding:11px 14px;font-size:11px;font-weight:700;color:#4a5a6a;text-transform:uppercase;letter-spacing:.05em;text-align:left;white-space:nowrap}
.th-av{width:50px}.th-center{text-align:center}
.dept-tr{border-top:1px solid rgba(255,255,255,0.07);transition:background .15s}
.dept-tr:hover{background:#243347}
.dept-tr td{padding:13px 14px;font-size:13.5px;vertical-align:middle}
.av-gold{width:38px;height:38px;border-radius:10px;background:#f5a623;color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.av-blue{width:38px;height:38px;border-radius:10px;background:rgba(245,197,24,0.2);color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.av-green{width:38px;height:38px;border-radius:10px;background:#27ae60;color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.u-nom{font-weight:700;color:#1e2a35;font-size:14px}
.mat-tag{padding:2px 9px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:6px;font-size:12px;font-weight:600;color:#A8BDD4}
.td-email{font-size:13px;color:#A8BDD4}
.td-tel{font-size:13px;color:#A8BDD4}
.td-domaine{font-size:13px;color:#A8BDD4}
.td-etab{font-size:13px;color:#A8BDD4}
.td-center{text-align:center}
.page-sub{font-size:13.5px;color:#7A8FA6}
.loading-state{text-align:center;padding:60px;color:#7A8FA6}
.spinner{width:32px;height:32px;border:3px solid #c8c4bc;border-top-color:#3d6080;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-state{text-align:center;padding:60px;color:#8a9aaa;line-height:1.6}
.empty-icon{font-size:48px;margin-bottom:12px}
.table-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
.table{width:100%;border-collapse:collapse}
.table th{background:#f0ede8;padding:11px 14px;font-size:11.5px;font-weight:700;color:#4a5a6a;text-transform:uppercase;letter-spacing:0.05em;text-align:left}
.table td{padding:13px 14px;border-top:1px solid rgba(255,255,255,0.07);font-size:13.5px;background:#243347}
.table-row:hover td{background:rgba(245,197,24,0.06)}
.user-nom{font-weight:600;color:#1e2a35}
.td-mat{font-size:12.5px;color:#7A8FA6}
.td-email{font-size:13px;color:#A8BDD4}
.td-domaine{font-size:13px;color:#4a5a6a;font-style:italic}
.td-center{text-align:center}
.badge-affecte{padding:3px 10px;background:#d4edda;color:#1e7e34;border-radius:20px;font-size:12px;font-weight:600}
.badge-non-affecte{padding:3px 10px;background:#e8e4dc;color:#8a9aaa;border-radius:20px;font-size:12px;font-style:italic}
</style>