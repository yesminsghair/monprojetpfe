<template>
  <div class="dashboard-shell">

    <transition name="toast-anim">
      <div v-if="toast.visible" class="global-toast" :class="toast.type">
        <svg v-if="toast.type === 'toast-ok'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <!-- SIDEBAR -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sb-brand">
        <div class="brand-full" v-if="!sidebarCollapsed">
          <span class="logo-white">Vers le</span><span class="logo-gold">Diplôme</span>
        </div>
        <div class="brand-icon" v-else>VD</div>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <nav class="sb-nav">
        <button class="nav-item" :class="{ active: currentPage === 'home' }" @click="navigate('home')" :title="sidebarCollapsed ? 'Tableau de bord' : ''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Tableau de bord</span>
        </button>

        <!-- Spécialités -->
        <div class="nav-section">
          <button class="nav-item nav-group-toggle"
            :class="{ 'group-active': openGroup === 'specialites', 'group-open': openGroup === 'specialites' }"
            @click="toggleGroup('specialites')"
            :title="sidebarCollapsed ? 'Gestion des spécialités' : ''">
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
            <span class="nav-label" v-if="!sidebarCollapsed">Gestion des spécialités</span>
            <span class="chevron" v-if="!sidebarCollapsed" :class="{ 'chevron-open': openGroup === 'specialites' }">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </button>
          <transition name="submenu">
            <div v-if="openGroup === 'specialites' && !sidebarCollapsed" class="sub-menu">
              <button class="sub-item" :class="{ active: currentPage === 'spec-create' }" @click="navigate('spec-create')"><span class="sub-dot"></span>Créer une spécialité</button>
              <button class="sub-item" :class="{ active: currentPage === 'spec-list' }" @click="navigate('spec-list')"><span class="sub-dot"></span>Liste des spécialités</button>
            </div>
          </transition>
        </div>

        <!-- Chefs -->
        <div class="nav-section">
          <button class="nav-item nav-group-toggle"
            :class="{ 'group-active': openGroup === 'chefs', 'group-open': openGroup === 'chefs' }"
            @click="toggleGroup('chefs')"
            :title="sidebarCollapsed ? 'Gestion des chefs' : ''">
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
            <span class="nav-label" v-if="!sidebarCollapsed">Gestion des chefs</span>
            <span class="chevron" v-if="!sidebarCollapsed" :class="{ 'chevron-open': openGroup === 'chefs' }">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </button>
          <transition name="submenu">
            <div v-if="openGroup === 'chefs' && !sidebarCollapsed" class="sub-menu">
              <button class="sub-item" :class="{ active: currentPage === 'chef-create' }" @click="navigate('chef-create')"><span class="sub-dot"></span>Ajouter un chef</button>
              <button class="sub-item" :class="{ active: currentPage === 'chef-list' }" @click="navigate('chef-list')"><span class="sub-dot"></span>Liste des chefs</button>
            </div>
          </transition>
        </div>

        <!-- GRILLES D'ÉVALUATION -->
        <div class="nav-section">
          <button class="nav-item nav-group-toggle"
            :class="{ 'group-active': openGroup === 'grilles', 'group-open': openGroup === 'grilles' }"
            @click="toggleGroup('grilles')"
            :title="sidebarCollapsed ? 'Grilles d\'évaluation' : ''">
            <span class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span v-if="sidebarCollapsed && grillesEnAttente > 0" class="badge-dot-dir"></span>
            </span>
            <span class="nav-label" v-if="!sidebarCollapsed">
              Grilles d'évaluation
              <span v-if="grillesEnAttente > 0" class="badge-cnt-dir">{{ grillesEnAttente }}</span>
            </span>
            <span class="chevron" v-if="!sidebarCollapsed" :class="{ 'chevron-open': openGroup === 'grilles' }">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </button>
          <transition name="submenu">
            <div v-if="openGroup === 'grilles' && !sidebarCollapsed" class="sub-menu">
              <button class="sub-item" :class="{ active: currentPage === 'grilles-validation' }" @click="navigate('grilles-validation')">
                <span class="sub-dot"></span>Validation des grilles
                <span v-if="grillesEnAttente > 0" class="badge-cnt-dir" style="margin-left:6px">{{ grillesEnAttente }}</span>
              </button>
              <button class="sub-item" :class="{ active: currentPage === 'grilles-validees' }" @click="navigate('grilles-validees')">
                <span class="sub-dot"></span>Grilles validées
              </button>
            </div>
          </transition>
        </div>

        <div class="nav-section-title" v-if="!sidebarCollapsed" style="padding:8px 16px;font-size:10px;font-weight:700;color:rgba(245,166,35,0.7);text-transform:uppercase;letter-spacing:.1em">Communication</div>
        <button class="nav-btn" :class="{active:currentPage==='messagerie'}" @click="navigate('messagerie')" :title="sidebarCollapsed?'Messagerie':''">
          <span class="nav-icon-dir"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
          <span class="nav-label-dir" v-if="!sidebarCollapsed">Messagerie</span>
        </button>
      </nav>

      <div class="sb-user" v-if="!sidebarCollapsed">
        <button class="user-avatar user-avatar-btn" @click="navigate('profil')" title="Mon profil">
          {{ (currentUser.prenom?.[0] || '') + (currentUser.nom?.[0] || '') }}
        </button>
        <div class="user-info">
          <div class="user-name">{{ currentUser.prenom }} {{ currentUser.nom }}</div>
          <div class="user-role">Directeur de stage</div>
        </div>
        <button class="logout-btn" title="Se déconnecter" @click="logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
      <div class="sb-user-collapsed" v-else>
        <button class="user-avatar-sm user-avatar-btn" @click="navigate('profil')" title="Mon profil">
          {{ (currentUser.prenom?.[0] || '') + (currentUser.nom?.[0] || '') }}
        </button>
      </div>
    </aside>

    <!-- MAIN -->
    <div class="main-wrap">
      <header class="topbar">
        <div class="topbar-left">
          <div class="page-breadcrumb">
            <span class="breadcrumb-home">Tableau de bord</span>
            <template v-for="(b, i) in breadcrumb" :key="i">
              <span class="breadcrumb-sep"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
              <span class="breadcrumb-item" :class="{ 'breadcrumb-last': i === breadcrumb.length - 1 }">{{ b }}</span>
            </template>
          </div>
        </div>
        <div class="topbar-right">
          <button class="topbar-profil-btn" @click="navigate('profil')" title="Mon profil">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>{{ currentUser.prenom }}</span>
          </button>
          <div class="topbar-date">{{ dateNow }}</div>
          <NotificationsDropdown />
        </div>
      </header>

      <main class="content-area">
        <transition name="page-fade" mode="out-in">

          <!-- HOME -->
          <div v-if="currentPage === 'home'" key="home" class="page-home">
            <div class="page-title-block">
              <h1 class="page-title">Bonjour, {{ currentUser.prenom }} 👋</h1>
              <p class="page-subtitle">Voici un aperçu de votre espace de gestion des PFE.</p>
            </div>

            <!-- Alerte grilles en attente -->
            <div v-if="grillesEnAttente > 0" class="alert-validation">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div class="alert-body">
                <div class="alert-title">{{ grillesEnAttente }} grille(s) en attente de validation</div>
                <div class="alert-sub">Des chefs de département ont soumis des grilles pour votre approbation.</div>
              </div>
              <button class="btn-alert" @click="navigate('grilles-validation')">Valider maintenant →</button>
            </div>

            <div class="kpi-grid">
              <div class="kpi-card kpi-blue">
                <div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
                <div class="kpi-body"><div class="kpi-value">{{ specialites.length }}</div><div class="kpi-label">Total spécialités</div></div>
              </div>
              <div class="kpi-card kpi-gold">
                <div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                <div class="kpi-body"><div class="kpi-value">{{ chefs.length }}</div><div class="kpi-label">Chefs de département</div></div>
              </div>
              <div class="kpi-card kpi-green">
                <div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                <div class="kpi-body"><div class="kpi-value">{{ grillesValidees }}</div><div class="kpi-label">Grilles validées</div></div>
              </div>
              <div class="kpi-card kpi-slate">
                <div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
                <div class="kpi-body"><div class="kpi-value">{{ grillesEnAttente }}</div><div class="kpi-label">Grilles en attente</div></div>
              </div>
            </div>

            <div class="section-title">Actions rapides</div>
            <div class="quick-actions">
              <button class="qa-card" @click="navigate('spec-create')">
                <div class="qa-icon qa-blue"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
                <div class="qa-text"><div class="qa-title">Nouvelle spécialité</div><div class="qa-sub">Créer une spécialité académique</div></div>
                <svg class="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('chef-create')">
                <div class="qa-icon qa-gold"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg></div>
                <div class="qa-text"><div class="qa-title">Ajouter un chef</div><div class="qa-sub">Nouveau chef de département</div></div>
                <svg class="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('grilles-validation')">
                <div class="qa-icon" :class="grillesEnAttente > 0 ? 'qa-orange' : 'qa-green'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div class="qa-text">
                  <div class="qa-title">Grilles d'évaluation</div>
                  <div class="qa-sub">{{ grillesEnAttente > 0 ? grillesEnAttente + ' grille(s) à valider' : 'Toutes les grilles sont validées' }}</div>
                </div>
                <svg class="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('spec-list')">
                <div class="qa-icon qa-blue"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></div>
                <div class="qa-text"><div class="qa-title">Liste des spécialités</div><div class="qa-sub">Consulter, modifier, supprimer</div></div>
                <svg class="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>

          <!-- CRÉER SPÉCIALITÉ -->
          <Creerspecialite v-else-if="currentPage === 'spec-create'" key="spec-create" :specialitesExistantes="specialites" @created="onSpecialiteCreee"/>

          <!-- LISTE SPÉCIALITÉS -->
          <Listespecialites v-else-if="currentPage === 'spec-list'" key="spec-list" :specialites="specialites" @go-create="navigate('spec-create')" @update-specialite="onSpecialiteModifiee" @delete-specialite="onSpecialiteSupprimee"/>

          <!-- AJOUTER CHEF -->
          <AjouterChef v-else-if="currentPage === 'chef-create'" key="chef-create" :specialites="specialites" :chefs="chefs" @chef-ajoute="onChefAjoute" @toast="afficherToast" @navigate="navigate"/>

          <!-- LISTE CHEFS -->
          <ConsulterChefs v-else-if="currentPage === 'chef-list'" key="chef-list" :chefs="chefs" :specialites="specialites" @chefs-maj="onChefsMaj" @toast="afficherToast" @navigate="navigate"/>

          <!-- ✅ VALIDATION GRILLES -->
          <div v-else-if="currentPage === 'grilles-validation'" key="grilles-validation">
            <div class="page-title-block">
              <h2 class="page-title" style="font-size:20px">Validation des grilles</h2>
              <p class="page-subtitle">Grilles soumises par les chefs de département en attente de votre approbation</p>
            </div>
            <div v-if="loadingGrilles" class="loading-center"><div class="spinner-dir"></div></div>
            <div v-else-if="!grillesAttente.length" class="empty-dir">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><polyline points="20 6 9 17 4 12"/></svg>
              <p>Aucune grille en attente de validation.</p>
            </div>
            <div v-else class="grilles-list">
              <div v-for="g in grillesAttente" :key="g.id" class="grille-card grille-attente">
                <div class="gc-header">
                  <div>
                    <div class="gc-nom">{{ g.nom }}</div>
                    <div class="gc-meta">
                      <strong>Chef :</strong> {{ g.chef_nom || '—' }}
                      <span v-if="g.chef_specialite"> · <strong>Spécialité :</strong> {{ g.chef_specialite }}</span>
                      · {{ g.categories?.length || 0 }} catégorie(s)
                      · {{ totalCriteres(g) }} critère(s)
                      · Total : {{ totalBareme(g) }}/20 pts
                    </div>
                  </div>
                  <div class="gc-actions">
                    <button class="btn-voir" @click="voirGrille(g)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      Consulter
                    </button>
                    <button class="btn-valider-grille" @click="validerGrille(g)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      Valider
                    </button>
                    <button class="btn-rejeter-grille" @click="rejeterGrille(g)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ✅ GRILLES VALIDÉES -->
          <div v-else-if="currentPage === 'grilles-validees'" key="grilles-validees">
            <div class="page-title-block">
              <h2 class="page-title" style="font-size:20px">Grilles validées</h2>
              <p class="page-subtitle">Liste des grilles approuvées et verrouillées</p>
            </div>
            <div v-if="loadingGrilles" class="loading-center"><div class="spinner-dir"></div></div>
            <div v-else-if="!grillesValidesList.length" class="empty-dir">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p>Aucune grille validée pour le moment.</p>
            </div>
            <div v-else class="grilles-list">
              <div v-for="g in grillesValidesList" :key="g.id" class="grille-card grille-validee">
                <div class="gc-header">
                  <div>
                    <div class="gc-nom">{{ g.nom }}</div>
                    <div class="gc-meta">
                      <strong>Chef :</strong> {{ g.chef_nom || '—' }}
                      <span v-if="g.chef_specialite"> · <strong>Spécialité :</strong> {{ g.chef_specialite }}</span>
                      · {{ totalCriteres(g) }} critère(s)
                      · Total : {{ totalBareme(g) }}/20 pts
                      · <span class="gc-date">Validée le {{ formatDate(g.verrouille_le) }}</span>
                    </div>
                  </div>
                  <div class="gc-actions">
                    <button class="btn-voir" @click="voirGrille(g)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      Consulter
                    </button>
                    <span class="badge-valide-grille">✓ Validée</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PROFIL -->
          <div v-else-if="currentPage==='messagerie'" key="messagerie">
            <Messagerie />
          </div>

          <ConsulterProfil v-else-if="currentPage === 'profil'" key="profil" :user="currentUser" @modifier="currentPage = 'profil-edit'"/>
          <ModifierProfil v-else-if="currentPage === 'profil-edit'" key="profil-edit" :user="currentUser" @annuler="currentPage = 'profil'" @sauvegarde="onProfilSauvegarde"/>

        </transition>
      </main>
    </div>

    <!-- MODAL : Détail grille -->
    <transition name="modal-fade">
      <div v-if="showGrilleModal" class="modal-overlay" @click.self="showGrilleModal=false">
        <div class="modal-grille">
          <div class="modal-grille-header">
            <div>
              <h3>{{ grilleDetail?.nom }}</h3>
              <div class="mg-meta">Chef : {{ grilleDetail?.chef_nom || '—' }}</div>
            </div>
            <button class="modal-close" @click="showGrilleModal=false">×</button>
          </div>
          <div class="modal-grille-body">
            <div v-for="cat in (grilleDetail?.categories || [])" :key="cat.id" class="mg-category">
              <div class="mg-cat-header">
                <span class="mg-cat-nom">{{ cat.nom }}</span>
                <span class="mg-cat-bareme">/ {{ cat.bareme_max }} pts</span>
              </div>
              <div v-for="cr in (cat.criteres || [])" :key="cr.id" class="mg-critere">
                <span class="mg-cr-nom">{{ cr.nom }}</span>
                <span class="mg-cr-pts">{{ cr.bareme_max }} pt</span>
              </div>
            </div>
            <div class="mg-total">
              <span>Total barème</span>
              <span class="mg-total-val">{{ totalBareme(grilleDetail) }} / 20 pts</span>
            </div>
          </div>
          <div class="modal-grille-footer">
            <button class="btn-cancel-dir" @click="showGrilleModal=false">Fermer</button>
            <template v-if="grilleDetail?.statut === 'publie' || grilleDetail?.statut === 'brouillon'">
              <button class="btn-rejeter-grille" @click="rejeterGrille(grilleDetail); showGrilleModal=false">Rejeter</button>
              <button class="btn-valider-grille" @click="validerGrille(grilleDetail); showGrilleModal=false">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                Valider la grille
              </button>
            </template>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import api from '@/services/api.js'
import Messagerie from './GestionArchivageCommunication/Messagerie.vue'
import NotificationsDropdown from './GestionArchivageCommunication/Notifications.vue'
import Creerspecialite  from './gestionSpecialite/Creerspecialite.vue'
import Listespecialites from './gestionSpecialite/Listespecialites.vue'
import AjouterChef      from './gestionChefs/Ajouterchef.vue'
import ConsulterChefs   from './gestionChefs/ListeChefs.vue'
import ConsulterProfil  from './ConsulterProfil.vue'
import ModifierProfil   from './ModifierProfil.vue'

export default {
  name: 'DashboardDirecteur',
  components: {Creerspecialite, Listespecialites, AjouterChef, ConsulterChefs, ConsulterProfil, ModifierProfil, NotificationsDropdown, NotificationsDropdown, Messagerie },

  data() {
    return {
      sidebarCollapsed: false,
      openGroup: null,
      currentPage: 'home',
      profilPage: 'consulter',
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),
      toast: { visible: false, type: 'toast-ok', message: '' },

      specialites: [],
      chefs: [],

      // ✅ Grilles d'évaluation
      grilles: [],
      loadingGrilles: false,
      showGrilleModal: false,
      grilleDetail: null,
    }
  },

  computed: {
    breadcrumb() {
      const map = {
        'home':               [],
        'spec-create':        ['Gestion des spécialités', 'Créer une spécialité'],
        'spec-list':          ['Gestion des spécialités', 'Liste des spécialités'],
        'chef-create':        ['Gestion des chefs', 'Ajouter un chef'],
        'chef-list':          ['Gestion des chefs', 'Liste des chefs'],
        'grilles-validation': ['Grilles d\'évaluation', 'Validation'],
        'grilles-validees':   ['Grilles d\'évaluation', 'Validées'],
        'profil':             ['Mon profil', 'Consultation'],
        'profil-edit':        ['Mon profil', 'Modifier'],
      }
      return map[this.currentPage] || []
    },
    dateNow() {
      return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    },
    chefsAffectes() { return this.chefs.filter(c => c.specialiteId).length },
    specialitesSansChef() { return this.specialites.filter(s => !s.chefs || s.chefs.length === 0).length },

    // ✅ Grilles en attente = publiées par le chef mais pas encore verrouillées (pas validées)
    grillesAttente() {
      return this.grilles.filter(g => g.statut === 'publie')
    },
    grillesValidesList() {
      return this.grilles.filter(g => g.statut === 'verrouille')
    },
    grillesEnAttente() { return this.grillesAttente.length },
    grillesValidees() { return this.grillesValidesList.length },
  },

  methods: {
    toggleGroup(group) { this.openGroup = this.openGroup === group ? null : group },
    navigate(page) {
      this.currentPage = page
      if (page === 'spec-create' || page === 'spec-list') this.openGroup = 'specialites'
      else if (page === 'chef-create' || page === 'chef-list') this.openGroup = 'chefs'
      else if (page === 'grilles-validation' || page === 'grilles-validees') { this.openGroup = 'grilles'; this.chargerGrilles() }
      else this.openGroup = null
    },
    onProfilSauvegarde(updated) {
      this.currentUser = updated
      localStorage.setItem('user', JSON.stringify(updated))
      this.currentPage = 'profil'
    },
    logout() { localStorage.removeItem('user'); this.$router.push('/login') },

    // ── SPÉCIALITÉS ──
    async chargerSpecialites() {
      try {
        const res = await api.get('/specialites')
        this.specialites = res.data.map(s => ({ ...s, chefs: s.chefs || [] }))
      } catch(e) { console.error('Erreur spécialités:', e) }
    },
    async onSpecialiteCreee(spec) {
      try {
        const res = await api.post('/specialites', { nom: spec.nom, code: spec.code, description: spec.description, date_creation: spec.dateCreation || null })
        this.specialites.push({ ...res.data, chefs: [] })
        this.afficherToast({ message: `Spécialité "${res.data.nom}" créée.`, type: 'toast-ok' })
        this.navigate('spec-list')
      } catch(e) { this.afficherToast({ message: 'Erreur lors de la création.', type: 'toast-err' }) }
    },
    async onSpecialiteModifiee(updated) {
      try {
        const res = await api.put(`/specialites/${updated.id}`, { nom: updated.nom, code: updated.code, description: updated.description, date_creation: updated.dateCreation || null })
        const i = this.specialites.findIndex(s => s.id === updated.id)
        if (i !== -1) this.specialites.splice(i, 1, { ...res.data, chefs: this.specialites[i].chefs || [] })
        this.afficherToast({ message: `Spécialité modifiée.`, type: 'toast-ok' })
      } catch(e) { this.afficherToast({ message: 'Erreur lors de la modification.', type: 'toast-err' }) }
    },
    async onSpecialiteSupprimee(id) {
      try {
        await api.delete(`/specialites/${id}`)
        this.specialites = this.specialites.filter(s => s.id !== id)
        this.afficherToast({ message: 'Spécialité supprimée.', type: 'toast-ok' })
      } catch(e) { this.afficherToast({ message: 'Erreur lors de la suppression.', type: 'toast-err' }) }
    },

    // ── CHEFS ──
    async chargerChefs() {
      try {
        const res = await api.get('/chefs')
        this.chefs = res.data
        this.syncSpecialitesChefs(res.data)
      } catch(e) { console.error('Erreur chefs:', e) }
    },
    syncSpecialitesChefs(chefs) {
      this.specialites = this.specialites.map(sp => ({
        ...sp,
        chefs: chefs.filter(c => c.specialiteId === sp.id).map(c => ({ id: c.id, nom: c.nom })),
      }))
    },
    async onChefAjoute(payload) {
      if (payload.action === 'rechercher') {
        try {
          const res = await api.get('/chefs/rechercher', { params: { q: payload.q } })
          payload.callback(res.data, null)
        } catch(e) { payload.callback(null, e.response?.data?.message || 'Introuvable.') }
        return
      }
      if (payload.action === 'promouvoir') {
        try {
          const res = await api.post('/chefs/promouvoir', { utilisateurId: payload.utilisateur.id, domaineExpertise: payload.domaineExpertise || '' })
          this.chefs.push(res.data)
          this.syncSpecialitesChefs(this.chefs)
          this.afficherToast({ message: `${res.data.prenom} ${res.data.nom} promu chef.`, type: 'toast-ok' })
          this.navigate('chef-list')
        } catch(e) {
          this.afficherToast({ message: e.response?.data?.message || 'Erreur.', type: 'toast-err' })
          if (payload.resetChargement) payload.resetChargement()
        }
      }
    },
    onChefsMaj(updatedChefs) {
      this.chefs = updatedChefs
      this.syncSpecialitesChefs(updatedChefs)
    },

    // ── ✅ GRILLES ──
    async chargerGrilles() {
      this.loadingGrilles = true
      try {
        const res = await api.get('/grilles')
        this.grilles = await Promise.all((res.data || []).map(async g => {
          try {
            const detail = await api.get(`/grilles/${g.id}`)
            const chef = detail.data.chef
            return {
              ...detail.data,
              chef_nom: chef ? `${chef.prenom} ${chef.nom}` : '—',
              chef_specialite: chef?.specialite?.nom || null,
            }
          } catch {
            return { ...g, chef_nom: '—', chef_specialite: null }
          }
        }))
      } catch(e) {
        this.grilles = []
      } finally {
        this.loadingGrilles = false
      }
    },

    voirGrille(g) {
      this.grilleDetail = g
      this.showGrilleModal = true
    },

    async validerGrille(g) {
      try {
        // ✅ Validation = verrouiller la grille (rend officielle)
        await api.post(`/grilles/${g.id}/verrouiller`)
        const idx = this.grilles.findIndex(gr => gr.id === g.id)
        if (idx !== -1) this.grilles[idx] = { ...this.grilles[idx], statut: 'verrouille', verrouille_le: new Date().toISOString() }
        this.afficherToast({ message: `Grille "${g.nom}" validée et verrouillée.`, type: 'toast-ok' })
      } catch(e) {
        this.afficherToast({ message: 'Erreur lors de la validation.', type: 'toast-err' })
      }
    },

    async rejeterGrille(g) {
      if (!confirm(`Rejeter la grille "${g.nom}" ? Elle sera remise en brouillon.`)) return
      try {
        // ✅ Rejet = remettre en brouillon
        await api.put(`/grilles/${g.id}`, { statut: 'brouillon' })
        const idx = this.grilles.findIndex(gr => gr.id === g.id)
        if (idx !== -1) this.grilles.splice(idx, 1) // Retirer de la liste directeur
        this.afficherToast({ message: `Grille "${g.nom}" rejetée — renvoyée au chef.`, type: 'toast-ok' })
      } catch(e) {
        this.afficherToast({ message: 'Erreur lors du rejet.', type: 'toast-err' })
      }
    },

    // ── HELPERS ──
    totalCriteres(g) {
      return (g?.categories || []).reduce((s, c) => s + (c.criteres?.length || 0), 0)
    },
    totalBareme(g) {
      return (g?.categories || []).reduce((s, c) => s + parseFloat(c.bareme_max || 0), 0).toFixed(2)
    },
    formatDate(d) {
      if (!d) return '—'
      try { return new Date(d).toLocaleDateString('fr-FR') } catch { return d }
    },

    afficherToast({ message, type }) {
      this.toast = { visible: true, type, message }
      setTimeout(() => { this.toast.visible = false }, 3500)
    },
  },

  mounted() {
    this.chargerSpecialites()
    this.chargerChefs()
    this.chargerGrilles()  // always load for badge count on home
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,700;1,700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.global-toast { position: fixed; top: 22px; right: 22px; z-index: 9999; display: flex; align-items: center; gap: 10px; padding: 13px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; box-shadow: 0 8px 24px rgba(0,0,0,0.16); max-width: 380px; font-family: 'Source Sans 3', sans-serif; }
.toast-ok  { background: #d4edda; color: #155724; border: 1px solid rgba(40,167,69,0.3); }
.toast-err { background: #f8d7da; color: #721c24; border: 1px solid rgba(220,53,69,0.3); }
.toast-anim-enter-active { transition: opacity 0.3s, transform 0.3s cubic-bezier(0.22,1,0.36,1); }
.toast-anim-leave-active { transition: opacity 0.2s; }
.toast-anim-enter-from   { opacity: 0; transform: translateX(20px); }
.toast-anim-leave-to     { opacity: 0; }
.dashboard-shell { display: flex; min-height: 100vh; background: #c8c4bc; font-family: 'Source Sans 3', sans-serif; }
.sidebar { width: 260px; min-height: 100vh; background: linear-gradient(160deg, #4a7090 0%, #3d6080 30%, #2f4f6a 65%, #243d52 100%); display: flex; flex-direction: column; flex-shrink: 0; transition: width 0.3s cubic-bezier(0.22, 1, 0.36, 1); position: sticky; top: 0; height: 100vh; overflow: hidden; }
.sidebar.collapsed { width: 68px; }
.sb-brand { display: flex; align-items: center; justify-content: space-between; padding: 22px 18px 18px; border-bottom: 1px solid rgba(255,255,255,0.08); flex-shrink: 0; }
.brand-full { font-family: 'Merriweather', serif; font-size: 16px; font-weight: 700; white-space: nowrap; }
.brand-icon { font-family: 'Merriweather', serif; font-size: 15px; font-weight: 700; color: #f5a623; width: 32px; text-align: center; }
.logo-white { color: #fff; } .logo-gold { color: #f5a623; margin-left: 5px; }
.collapse-btn { background: rgba(255,255,255,0.08); border: none; border-radius: 7px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.6); cursor: pointer; flex-shrink: 0; transition: background 0.18s, color 0.18s; }
.collapse-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
.sb-nav { flex: 1; padding: 14px 10px; overflow-y: auto; overflow-x: hidden; }
.sb-nav::-webkit-scrollbar { width: 3px; } .sb-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
.nav-section { margin-bottom: 2px; }
.nav-item { display: flex; align-items: center; gap: 11px; width: 100%; padding: 10px 11px; border: none; border-radius: 10px; background: transparent; color: rgba(255,255,255,0.62); font-size: 13.5px; font-family: 'Source Sans 3', sans-serif; font-weight: 500; cursor: pointer; text-align: left; transition: all 0.18s; white-space: nowrap; overflow: hidden; margin-bottom: 2px; position: relative; }
.nav-item:hover { background: rgba(255,255,255,0.09); color: #fff; } .nav-item.active { background: rgba(245,166,35,0.2); color: #f5a623; }
.nav-item.group-open, .nav-item.group-active { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.92); }
.nav-icon { display: flex; align-items: center; flex-shrink: 0; position: relative; } .nav-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.badge-dot-dir { position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; border-radius: 50%; background: #f5a623; border: 2px solid #3d6080; }
.badge-cnt-dir { background: rgba(245,166,35,0.3); color: #f5e6c0; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 99px; margin-left: 4px; }
.chevron { flex-shrink: 0; display: flex; align-items: center; color: rgba(255,255,255,0.35); transition: transform 0.25s; } .chevron-open { transform: rotate(180deg); }
.sub-menu { margin: 2px 0 4px 16px; border-left: 1.5px solid rgba(255,255,255,0.10); padding-left: 10px; }
.sub-item { display: flex; align-items: center; gap: 9px; width: 100%; padding: 8px 10px; border: none; border-radius: 8px; background: transparent; color: rgba(255,255,255,0.52); font-size: 13px; font-family: 'Source Sans 3', sans-serif; font-weight: 400; cursor: pointer; text-align: left; transition: all 0.18s; white-space: nowrap; margin-bottom: 1px; }
.sub-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.88); } .sub-item.active { background: rgba(245,166,35,0.14); color: #f5a623; font-weight: 600; }
.sub-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; opacity: 0.55; } .sub-item.active .sub-dot { opacity: 1; }
.submenu-enter-active { transition: max-height 0.28s cubic-bezier(0.22,1,0.36,1), opacity 0.22s; overflow: hidden; } .submenu-leave-active { transition: max-height 0.2s ease, opacity 0.15s; overflow: hidden; }
.submenu-enter-from { max-height: 0; opacity: 0; } .submenu-enter-to { max-height: 120px; opacity: 1; } .submenu-leave-from { max-height: 120px; opacity: 1; } .submenu-leave-to { max-height: 0; opacity: 0; }
.sb-user { display: flex; align-items: center; gap: 10px; padding: 14px 14px 18px; border-top: 1px solid rgba(255,255,255,0.08); flex-shrink: 0; }
.user-avatar { width: 36px; height: 36px; border-radius: 10px; background: #f5a623; color: #fff; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-info { flex: 1; overflow: hidden; } .user-name { font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .user-role { font-size: 11.5px; color: rgba(255,255,255,0.42); white-space: nowrap; }
.logout-btn { background: none; border: none; color: rgba(255,255,255,0.38); cursor: pointer; display: flex; align-items: center; padding: 5px; border-radius: 6px; transition: color 0.15s, background 0.15s; } .logout-btn:hover { color: #f5a623; background: rgba(255,255,255,0.07); }
.user-avatar-btn { cursor: pointer; border: none; font-size: inherit; font-weight: inherit; font-family: inherit; transition: transform 0.18s, box-shadow 0.18s; } .user-avatar-btn:hover { transform: scale(1.08); box-shadow: 0 0 0 3px rgba(245,166,35,0.35); }
.sb-user-collapsed { padding: 14px 10px 18px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: center; }
.user-avatar-sm { width: 36px; height: 36px; border-radius: 10px; background: #f5a623; color: #fff; font-weight: 700; font-size: 11px; display: flex; align-items: center; justify-content: center; }
.main-wrap { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.topbar { background: #ddd9d1; border-bottom: 1px solid #c8c4bc; padding: 0 32px; height: 60px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; position: sticky; top: 0; z-index: 10; box-shadow: 0 1px 0 rgba(0,0,0,0.04); }
.page-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13.5px; flex-wrap: wrap; }
.breadcrumb-home { color: #3d6080; font-weight: 600; } .breadcrumb-sep { color: #c8c4bc; display: flex; align-items: center; } .breadcrumb-item { color: #8a9aaa; } .breadcrumb-last { color: #1e2a35; font-weight: 600; }
.topbar-right { display: flex; align-items: center; gap: 16px; } .topbar-date { font-size: 12.5px; color: #8a9aaa; text-transform: capitalize; white-space: nowrap; }
.topbar-profil-btn { display:flex; align-items:center; gap:7px; padding:7px 14px; background:#e8e4dc; border:1.5px solid #c8c4bc; border-radius:9px; color:#4a5a6a; font-size:13px; font-weight:600; font-family:'Source Sans 3',sans-serif; cursor:pointer; transition:all 0.18s; } .topbar-profil-btn:hover { border-color:#3d6080; color:#3d6080; background:#ddd9d1; }
.notif-btn { position: relative; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 9px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: #4a5a6a; cursor: pointer; transition: all 0.18s; } .notif-btn:hover { border-color: #3d6080; color: #3d6080; }
.notif-dot { position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; background: #f5a623; border-radius: 50%; border: 1.5px solid #ddd9d1; }
.content-area { flex: 1; padding: 32px; overflow-y: auto; }
.page-title-block { margin-bottom: 28px; } .page-title { font-family: 'Merriweather', serif; font-size: 24px; font-weight: 700; color: #1e2a35; margin-bottom: 5px; } .page-subtitle { font-size: 14px; color: #8a9aaa; font-weight: 300; }
/* Alerte validation */
.alert-validation { display: flex; align-items: center; gap: 14px; padding: 16px 20px; background: #fff9e6; border: 1.5px solid #f5a623; border-radius: 12px; margin-bottom: 24px; }
.alert-body { flex: 1; } .alert-title { font-weight: 700; color: #1e2a35; font-size: 14px; margin-bottom: 3px; } .alert-sub { font-size: 13px; color: #8a9aaa; }
.btn-alert { padding: 9px 18px; background: #f5a623; color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Source Sans 3', sans-serif; white-space: nowrap; }
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 36px; }
.kpi-card { background: #ddd9d1; border-radius: 14px; padding: 22px 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1.5px solid #c8c4bc; }
.kpi-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-blue .kpi-icon  { background: rgba(61,96,128,0.12); color: #3d6080; } .kpi-gold .kpi-icon  { background: rgba(245,166,35,0.12); color: #d98e1a; } .kpi-green .kpi-icon { background: rgba(39,174,96,0.12); color: #27ae60; } .kpi-slate .kpi-icon { background: rgba(74,90,106,0.10); color: #4a5a6a; }
.kpi-value { font-family: 'Merriweather', serif; font-size: 28px; font-weight: 700; color: #1e2a35; line-height: 1; } .kpi-label { font-size: 12px; color: #8a9aaa; margin-top: 4px; }
.section-title { font-size: 12.5px; font-weight: 600; color: #8a9aaa; text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 14px; }
.quick-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.qa-card { display: flex; align-items: center; gap: 14px; background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 14px; padding: 18px 20px; cursor: pointer; text-align: left; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.qa-card:hover { border-color: #3d6080; box-shadow: 0 4px 18px rgba(61,96,128,0.12); transform: translateY(-2px); }
.qa-icon { width: 44px; height: 44px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.qa-blue { background: rgba(61,96,128,0.12); color: #3d6080; } .qa-gold { background: rgba(245,166,35,0.12); color: #d98e1a; } .qa-orange { background: rgba(245,166,35,0.15); color: #d98e1a; } .qa-green { background: rgba(39,174,96,0.12); color: #27ae60; }
.qa-text { flex: 1; } .qa-title { font-size: 14px; font-weight: 600; color: #1e2a35; margin-bottom: 2px; } .qa-sub { font-size: 12.5px; color: #8a9aaa; }
.qa-arrow { color: #c8c4bc; flex-shrink: 0; transition: transform 0.18s, color 0.18s; } .qa-card:hover .qa-arrow { transform: translateX(3px); color: #3d6080; }
/* Grilles */
.grilles-section-title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #1e2a35; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 14px; }
.gs-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.gs-orange { background: #f5a623; } .gs-green { background: #27ae60; }
.grilles-list { display: flex; flex-direction: column; gap: 12px; }
.grille-card { background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 14px; padding: 20px; }
.grille-attente { border-left: 4px solid #f5a623; }
.grille-validee { border-left: 4px solid #27ae60; opacity: 0.85; }
.gc-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.gc-nom { font-weight: 700; font-size: 15px; color: #1e2a35; margin-bottom: 4px; } .gc-meta { font-size: 13px; color: #8a9aaa; } .gc-date { color: #27ae60; }
.gc-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.btn-voir { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 8px; font-size: 13px; font-weight: 600; color: #4a5a6a; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: all 0.18s; }
.btn-voir:hover { border-color: #3d6080; color: #3d6080; }
.btn-valider-grille { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #27ae60; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; color: #fff; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: all 0.18s; }
.btn-valider-grille:hover { background: #1e8449; }
.btn-rejeter-grille { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; font-size: 13px; font-weight: 600; color: #721c24; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: all 0.18s; }
.btn-rejeter-grille:hover { background: #e74c3c; color: #fff; border-color: #e74c3c; }
.badge-valide-grille { padding: 5px 12px; background: #d4edda; color: #155724; border-radius: 20px; font-size: 12.5px; font-weight: 700; }
/* Modal grille */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-grille { background: #fff; border-radius: 16px; width: 100%; max-width: 640px; max-height: 88vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-grille-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 26px 0; } .modal-grille-header h3 { font-family: 'Merriweather', serif; font-size: 18px; color: #1e2a35; margin-bottom: 4px; } .mg-meta { font-size: 13px; color: #8a9aaa; }
.modal-close { background: none; border: none; font-size: 24px; color: #8a9aaa; cursor: pointer; line-height: 1; flex-shrink: 0; } .modal-close:hover { color: #1e2a35; }
.modal-grille-body { padding: 20px 26px; } .modal-grille-footer { padding: 16px 26px; border-top: 1px solid #e0ddd8; display: flex; justify-content: flex-end; gap: 10px; }
.mg-category { margin-bottom: 16px; border: 1.5px solid #e0ddd8; border-radius: 10px; overflow: hidden; }
.mg-cat-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #f0ede8; } .mg-cat-nom { font-weight: 700; font-size: 14px; color: #1e2a35; } .mg-cat-bareme { font-size: 13px; color: #3d6080; font-weight: 600; }
.mg-critere { display: flex; justify-content: space-between; align-items: center; padding: 9px 16px; border-top: 1px solid #f0ede8; } .mg-cr-nom { font-size: 13.5px; color: #4a5a6a; } .mg-cr-pts { font-size: 13px; font-weight: 600; color: #3d6080; }
.mg-total { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-top: 2px solid #e0ddd8; margin-top: 8px; font-weight: 700; font-size: 14px; color: #1e2a35; }
.mg-total-val { font-family: 'Merriweather', serif; font-size: 20px; color: #3d6080; }
.btn-cancel-dir { padding: 10px 18px; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 9px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: 'Source Sans 3', sans-serif; color: #4a5a6a; }
.loading-center { text-align: center; padding: 60px; }
.spinner-dir { width: 36px; height: 36px; border: 3px solid #c8c4bc; border-top-color: #3d6080; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-dir { text-align: center; padding: 60px; color: #8a9aaa; } .empty-dir svg { opacity: 0.3; margin-bottom: 14px; display: block; margin-left: auto; margin-right: auto; } .empty-dir p { font-size: 14px; }
.page-fade-enter-active { transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.22,1,0.36,1); } .page-fade-leave-active { transition: opacity 0.16s ease; }
.page-fade-enter-from { opacity: 0; transform: translateY(10px); } .page-fade-leave-to { opacity: 0; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.97); }
@media (max-width: 1100px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .quick-actions { grid-template-columns: 1fr; } .content-area { padding: 20px; } .topbar { padding: 0 20px; } .topbar-date { display: none; } }
</style>