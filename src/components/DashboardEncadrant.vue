<template>
  <div class="dashboard-shell">
    <transition name="toast-anim">
      <div v-if="toast.visible" class="global-toast" :class="toast.type">
        <svg v-if="toast.type==='toast-ok'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
        {{ toast.message }}
      </div>
    </transition>

    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sb-brand">
        <div class="brand-full" v-if="!sidebarCollapsed"><span class="logo-w">Vers le</span><span class="logo-g">Diplôme</span></div>
        <div class="brand-icon" v-else>VD</div>
        <button class="collapse-btn" @click="sidebarCollapsed=!sidebarCollapsed"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
      </div>
      <nav class="sb-nav">
        <button class="nav-item" :class="{active:currentPage==='home'}" @click="navigate('home')">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Tableau de bord</span>
        </button>

        <!-- ✅ NEW: Vœux d'encadrement section -->
        <div class="nav-cat" v-if="!sidebarCollapsed">Vœux d'encadrement</div>

        <button v-if="!voeuxSoumis" class="nav-item" :class="{active:currentPage==='voeux'}" @click="navigate('voeux')" :title="sidebarCollapsed?'Mes vœux':''">
          <span class="nav-icon" style="position:relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span v-if="sidebarCollapsed && formulaireActif && !voeuxSoumis" class="badge-dot"></span>
          </span>
          <span class="nav-label" v-if="!sidebarCollapsed">
            Remplir le formulaire
            <span v-if="formulaireActif" class="badge-cnt">!</span>
          </span>
        </button>

        <button v-if="voeuxSoumis" class="nav-item" :class="{active:currentPage==='voeux'}" @click="navigate('voeux')" :title="sidebarCollapsed?'Ma fiche':''">
          <span class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </span>
          <span class="nav-label" v-if="!sidebarCollapsed">Ma fiche <span class="badge-soumis">✓</span></span>
        </button>

        <div class="nav-cat" v-if="!sidebarCollapsed">Mon encadrement</div>

        <button class="nav-item" :class="{active:currentPage==='demandes'}" @click="navigate('demandes')" :title="sidebarCollapsed?'Demandes':''">
          <span class="nav-icon" style="position:relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span v-if="sidebarCollapsed && nbEnAttente>0" class="badge-dot"></span>
          </span>
          <span class="nav-label" v-if="!sidebarCollapsed">Gérer les demandes <span v-if="nbEnAttente>0" class="badge-cnt">{{ nbEnAttente }}</span></span>
        </button>

        <button class="nav-item" :class="{active:currentPage==='affectes'}" @click="navigate('affectes')" :title="sidebarCollapsed?'Étudiants affectés':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Étudiants affectés</span>
        </button>

        <div class="nav-cat" v-if="!sidebarCollapsed">Suivi de projet</div>

        <button class="nav-item" :class="{active:currentPage==='suivi'}" @click="navigate('suivi')" :title="sidebarCollapsed?'Suivi avancement':''">
          <span class="nav-icon" style="position:relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span v-if="sidebarCollapsed && nbLivrablesPending>0" class="badge-dot"></span>
          </span>
          <span class="nav-label" v-if="!sidebarCollapsed">
            Suivi &amp; livrables
            <span v-if="nbLivrablesPending>0" class="badge-cnt">{{ nbLivrablesPending }}</span>
          </span>
        </button>

        <button class="nav-item" :class="{active:currentPage==='reunions'}" @click="navigate('reunions')" :title="sidebarCollapsed?'Réunions':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Réunions</span>
        </button>

        <div class="nav-cat" v-if="!sidebarCollapsed">Communication</div>

        <button class="nav-item" :class="{active:currentPage==='messagerie'}" @click="navigate('messagerie')" :title="sidebarCollapsed?'Messagerie':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Messagerie</span>
        </button>

      </nav>
      <div class="sb-user" v-if="!sidebarCollapsed">
        <div class="u-av" style="cursor:pointer" @click="navigate('profil')" :title="'Mon profil'">{{ initiales(currentUser.prenom+' '+currentUser.nom) }}</div>
        <div class="u-info"><div class="u-name">{{ currentUser.prenom }} {{ currentUser.nom }}</div><div class="u-role">Encadrant</div></div>
        <button class="logout-btn" @click="logout"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button>
      </div>
      <div class="sb-user-col" v-else><div class="u-av-sm">{{ initiales(currentUser.prenom+' '+currentUser.nom) }}</div></div>
    </aside>

    <div class="main-wrap">
      <header class="topbar">
        <div class="breadcrumb"><span class="bc-root">Espace Encadrant</span><template v-if="breadcrumb"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg><span class="bc-curr">{{ breadcrumb }}</span></template></div>
        <div class="topbar-r">
          <NotificationsDropdown />
          <span class="tb-date">{{ dateNow }}</span>
        </div>
      </header>

      <div class="content-area">
        <transition name="page-fade" mode="out-in">

          <!-- HOME -->
          <div v-if="currentPage==='home'" key="home">
            <div class="ptb"><h1 class="pt">Bonjour, {{ currentUser.prenom }} 👋</h1><p class="ps">Gérez les demandes des étudiants et consultez vos affectations.</p></div>

            <!-- ✅ NEW: voeux alert on home -->
            <div class="alert-gold" v-if="formulaireActif && !voeuxSoumis">
              <span class="al-icon">📋</span>
              <div class="al-body">
                <div class="al-t">Formulaire de vœux disponible</div>
                <div class="al-s">Date limite : <strong>{{ formatDate(formulaireActif.date_limite) }}</strong></div>
              </div>
              <button class="btn-alert" @click="navigate('voeux')">Remplir maintenant →</button>
            </div>

            <div v-if="etudiantsAffectes.length" class="banner-affectation">
              <div class="ba-icon">📋</div>
              <div class="ba-body">
                <div class="ba-t">Liste d'affectation publiée</div>
                <div class="ba-s">Vous avez <strong>{{ etudiantsAffectes.length }}</strong> étudiant(s) affecté(s) officiellement.</div>
              </div>
              <button class="ba-btn" @click="navigate('affectes')">Voir la liste →</button>
            </div>

            <div class="alert-gold" v-if="nbEnAttente>0">
              <span class="al-icon">📬</span>
              <div class="al-body"><div class="al-t">{{ nbEnAttente }} demande(s) en attente de réponse</div><div class="al-s">Des étudiants attendent votre décision.</div></div>
              <button class="btn-alert" @click="navigate('demandes')">Traiter maintenant →</button>
            </div>

            <div class="kpi-grid">
              <div class="kpi-card kpi-gold"><div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div><div class="kpi-v">{{ nbEnAttente }}</div><div class="kpi-l">En attente</div></div></div>
              <div class="kpi-card kpi-green"><div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div><div><div class="kpi-v">{{ etudiantsAffectes.length }}</div><div class="kpi-l">Acceptées</div></div></div>
              <div class="kpi-card kpi-blue"><div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="kpi-v">{{ etudiantsAffectes.length }}</div><div class="kpi-l">Affectés (chef dept)</div></div></div>
              <div class="kpi-card kpi-slate"><div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div><div><div class="kpi-v">{{ capaciteMax }}</div><div class="kpi-l">Capacité max</div></div></div>
            </div>
            <div class="sec-title">Actions rapides</div>
            <div class="qa-grid">
              <!-- ✅ NEW: voeux quick-action -->
              <button class="qa-card" @click="navigate('voeux')">
                <div class="qa-icon qa-teal"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <div class="qa-txt">
                  <div class="qa-t">{{ voeuxSoumis ? 'Consulter ma fiche de vœux' : 'Remplir le formulaire de vœux' }}</div>
                  <div class="qa-s">{{ voeuxSoumis ? 'Voir vos préférences soumises' : 'Disponibilité, spécialités, capacité' }}</div>
                </div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('demandes')">
                <div class="qa-icon qa-gold"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Gérer les demandes étudiants</div><div class="qa-s">Accepter ou rejeter avec motif</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('affectes')">
                <div class="qa-icon qa-blue"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Consulter mes étudiants affectés</div><div class="qa-s">Liste établie par le chef de département</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('suivi')">
                <div class="qa-icon qa-teal"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Suivi &amp; livrables</div><div class="qa-s">Valider ou rejeter les livrables</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>

          <!-- ✅ NEW: VOEUX PAGE (fill or read-only) -->
          <div v-else-if="currentPage==='voeux'" key="voeux">
            <!-- Lecture (already submitted) -->
            <div v-if="voeuxSoumis && !modeModifierVoeux" class="page-content">
              <div class="page-header-block">
                <div>
                  <h2 class="page-title">Ma fiche de vœux</h2>
                  <p class="page-sub">{{ formulaireActif?.titre }} · Soumise le {{ dateSoumission }}</p>
                </div>
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
                <div class="fiche-statut-enc">
                  <span class="badge-soumis-lg">✓ Soumise</span>
                  <span class="fiche-date-enc">{{ dateSoumission }}</span>
                </div>
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

            <!-- No formulaire available -->
            <div v-else-if="!formulaireActif && !modeModifierVoeux" class="empty-state">
              <div class="empty-icon">📋</div>
              <div class="empty-t">Aucun formulaire disponible</div>
              <p class="empty-s">Le chef de département n'a pas encore publié de formulaire de vœux.</p>
            </div>

            <!-- Fill / edit mode -->
            <div v-else>
              <div v-if="modeModifierVoeux" class="back-header-enc">
                <button class="back-btn-enc" @click="modeModifierVoeux=false">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                  Retour à ma fiche
                </button>
              </div>
              <FicheVoeux
                :formulaire="formulaireActif"
                :mode-soumission-only="true"
                @soumis="onVoeuxSoumis"
                @role-changed="onRoleChanged"
              />
            </div>
          </div>

          <DemandesEncadrement
            v-else-if="currentPage==='demandes'"
            key="demandes"
            @nb-en-attente="onNbEnAttente"
          />

          <SuiviEncadrant
            v-else-if="currentPage==='suivi'"
            key="suivi"
            @toast="afficherToast"
          />

          <ReunionEncadrant
            v-else-if="currentPage==='reunions'"
            key="reunions"
            @toast="afficherToast"
          />

          <Messagerie
            v-else-if="currentPage==='messagerie'"
            key="messagerie"
          />

          <div v-else-if="currentPage==='affectes'" key="affectes">
            <div class="aff-page-header">
              <div>
                <h2 class="spt">Mes étudiants affectés</h2>
                <p class="sps">Liste officielle publiée par le chef de département</p>
              </div>
              <button v-if="etudiantsAffectes.length" class="btn-export" @click="exporterCSV">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Exporter CSV
              </button>
            </div>

            <div class="aff-stats-strip" v-if="etudiantsAffectes.length">
              <div class="aff-stat"><div class="aff-stat-v">{{ etudiantsAffectes.length }}</div><div class="aff-stat-l">Étudiants affectés</div></div>
              <div class="aff-stat"><div class="aff-stat-v">{{ capaciteMax }}</div><div class="aff-stat-l">Capacité max</div></div>
              <div class="aff-stat"><div class="aff-stat-v aff-stat-pct">{{ capaciteMax ? Math.round(etudiantsAffectes.length/capaciteMax*100) : 100 }}%</div><div class="aff-stat-l">Charge</div></div>
              <div class="aff-stat-bar-wrap">
                <div class="aff-stat-l" style="margin-bottom:6px">Progression de charge</div>
                <div class="aff-bar-bg"><div class="aff-bar-fill" :style="{width:Math.min(100,etudiantsAffectes.length/(capaciteMax||1)*100)+'%'}"></div></div>
              </div>
            </div>

            <div class="search-bar-wrap" v-if="etudiantsAffectes.length">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a9aaa" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="searchEtu" class="search-input" placeholder="Rechercher par nom, matricule, spécialité..."/>
              <span v-if="searchEtu && etudiantsFiltres.length" style="font-size:12px;color:#7A8FA6;white-space:nowrap">{{ etudiantsFiltres.length }} résultat(s)</span>
              <button v-if="searchEtu" @click="searchEtu=''" class="search-clear">✕</button>
            </div>

            <transition name="modal-fade">
              <div class="overlay" v-if="ficheEtudiant" @click.self="ficheEtudiant=null">
                <div class="modal fiche-etu-modal">
                  <button class="fiche-close" @click="ficheEtudiant=null">✕</button>
                  <div class="fiche-etu-header">
                    <div class="fiche-av-lg">{{ initiales(ficheEtudiant.prenom+' '+ficheEtudiant.nom) }}</div>
                    <div>
                      <h3 class="fiche-nom">{{ ficheEtudiant.prenom }} {{ ficheEtudiant.nom }}</h3>
                      <div class="fiche-role">Étudiant · <span class="badge badge-blue">{{ ficheEtudiant.specialite || '—' }}</span></div>
                    </div>
                  </div>
                  <div class="fiche-rows">
                    <div class="fiche-row"><span class="fiche-lbl">Matricule</span><span>{{ ficheEtudiant.matricule || '—' }}</span></div>
                    <div class="fiche-row"><span class="fiche-lbl">Email</span><span>{{ ficheEtudiant.email || '—' }}</span></div>
                    <div class="fiche-row"><span class="fiche-lbl">Spécialité</span><span>{{ ficheEtudiant.specialite || '—' }}</span></div>
                    <div class="fiche-row" v-if="ficheEtudiant.telephone"><span class="fiche-lbl">Téléphone</span><span>{{ ficheEtudiant.telephone }}</span></div>
                    <div class="fiche-row"><span class="fiche-lbl">Statut</span><span class="badge badge-green">Affecté ✓</span></div>
                  </div>
                  <button class="btn-fermer" style="width:100%;margin-top:4px" @click="ficheEtudiant=null">Fermer</button>
                </div>
              </div>
            </transition>

            <div v-if="!etudiantsAffectes.length" class="empty-state">
              <div class="empty-icon">👨‍🎓</div>
              <div class="empty-t">Aucun étudiant affecté</div>
              <p class="empty-s">Le chef de département n'a pas encore finalisé les affectations.</p>
            </div>

            <template v-else>
              <div class="aff-table-card">
                <table class="aff-table">
                  <thead>
                    <tr>
                      <th class="th-n">#</th>
                      <th>Étudiant</th>
                      <th>Matricule</th>
                      <th>Spécialité</th>
                      <th>Contact</th>
                      <th class="th-action">Fiche</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(e,i) in etudiantsFiltres" :key="e.id" class="aff-tr" @click="ficheEtudiant=e">
                      <td class="td-n"><span class="row-num">{{ i+1 }}</span></td>
                      <td>
                        <div class="etu-cell">
                          <div class="etu-av-gold">{{ initiales(e.prenom+' '+e.nom) }}</div>
                          <div><div class="etu-nom">{{ e.prenom }} {{ e.nom }}</div><div class="etu-sub" v-if="e.email">{{ e.email }}</div></div>
                        </div>
                      </td>
                      <td><span class="mat-badge">{{ e.matricule || '—' }}</span></td>
                      <td><span class="spec-pill">{{ e.specialite || '—' }}</span></td>
                      <td><span class="tel-txt" v-if="e.telephone">📞 {{ e.telephone }}</span><span class="tel-none" v-else>—</span></td>
                      <td class="td-action">
                        <button class="btn-fiche-sm" @click.stop="ficheEtudiant=e">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                      </td>
                    </tr>
                    <tr v-if="etudiantsFiltres.length===0">
                      <td colspan="6" class="empty-row">Aucun résultat pour "{{ searchEtu }}"</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </div>

          <ConsulterProfil v-else-if="currentPage==='profil'" key="profil" @modifier="currentPage='profil-edit'"/>
          <ModifierProfil  v-else-if="currentPage==='profil-edit'" key="profil-edit" @annuler="currentPage='profil'" @sauvegarde="currentPage='profil'"/>

        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'
import NotificationsDropdown from './GestionArchivageCommunication/Notifications.vue'
import ConsulterProfil from './ConsulterProfil.vue'
import ModifierProfil from './ModifierProfil.vue'
import DemandesEncadrement from './GestionDemandes/DemandesEncadrement.vue'
import SuiviEncadrant from './Suiviencadrant.vue'
import ReunionEncadrant from './Reunionencadrant.vue'
import Messagerie from './GestionArchivageCommunication/Messagerie.vue'
import FicheVoeux from './GestionFormulaires/FicheVoeux.vue'

export default {
  name: 'DashboardEncadrant',
  components: {ConsulterProfil, ModifierProfil, DemandesEncadrement, SuiviEncadrant, ReunionEncadrant, FicheVoeux, NotificationsDropdown, Messagerie },

  async mounted() {
    await this.chargerDonnees()
    await this.chargerFormulaireActif()
  },

  data() {
    return {
      sidebarCollapsed: false,
      currentPage: 'home',
      toast: { visible:false, type:'toast-ok', message:'' },
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),
      nbEnAttente: 0,
      etudiantsAffectes: [],
      capaciteMax: 0,
      searchEtu: '',
      ficheEtudiant: null,

      // ✅ NEW: voeux state (mirrors DashboardEnseignant)
      formulaireActif: null,
      voeuxSoumis: false,
      voeuxData: null,
      dateSoumission: '',
      modeModifierVoeux: false,
    }
  },

  computed: {
    etudiantsFiltres() {
      if (!this.searchEtu) return this.etudiantsAffectes
      const q = this.searchEtu.toLowerCase()
      return this.etudiantsAffectes.filter(e =>
        (e.prenom + ' ' + e.nom).toLowerCase().includes(q) ||
        (e.matricule || '').toLowerCase().includes(q) ||
        (e.specialite || '').toLowerCase().includes(q)
      )
    },
    breadcrumb() {
      return {
        voeux:        'Mes vœux d\'encadrement',
        demandes:     'Gérer les demandes',
        affectes:     'Étudiants affectés',
        suivi:        'Suivi & livrables',
        reunions:     'Réunions',
        messagerie:   'Messagerie',
        profil:       'Mon profil',
        'profil-edit':'Modifier le profil',
      }[this.currentPage] || ''
    },
    dateNow() {
      return new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
    },
    // Allow modification only if deadline not passed and form not locked
    peutModifier() {
      if (!this.formulaireActif?.date_limite) return false
      if (this.formulaireActif.statut === 'verrouille') return false
      return new Date(this.formulaireActif.date_limite) > new Date()
    },
  },

  methods: {
    navigate(p) {
      this.currentPage = p
      this.modeModifierVoeux = false
    },

    logout() {
      localStorage.removeItem('user')
      this.$router?.push('/login')
    },

    initiales(n) { return (n||'?').split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2) },

    formatDate(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('fr-FR')
    },

    labelDisponibilite(d) {
      return { oui: '✅ Disponible', partielle: '⚡ Partiellement', non: '❌ Non disponible' }[d] || d || '—'
    },

    async chargerFormulaireActif() {
      try {
        const res = await api.get('/formulaires-voeux')
        const publie = res.data.find(f => f.statut === 'publie' || f.statut === 'verrouille')
        if (publie) {
          this.formulaireActif = publie
          const voeuxRes = await api.get('/voeux-encadrement?formulaire_id=' + publie.id)
          if (voeuxRes.data && voeuxRes.data.statut === 'soumis') {
            this.voeuxSoumis    = true
            this.voeuxData      = voeuxRes.data
            this.dateSoumission = voeuxRes.data.soumis_at
              ? new Date(voeuxRes.data.soumis_at).toLocaleDateString('fr-FR')
              : ''
          }
        }
      } catch (e) {
        console.error('Erreur chargement formulaire voeux:', e)
      }
    },

    async chargerDonnees() {
      try {
        const affRes = await api.get('/affectations/mes-affectations')
        const raw = affRes.data
        const affData = Array.isArray(raw) ? raw : (raw && raw.id ? [raw] : [])
        // All results are already diffusée — no need to filter further
        this.etudiantsAffectes = affData.map(a => ({
          id:        a.etudiant_id,
          prenom:    a.etudiant ? a.etudiant.split(' ')[0] : '',
          nom:       a.etudiant ? a.etudiant.split(' ').slice(1).join(' ') : '',
          matricule: a.matricule || '',
          specialite:a.specialite || '',
          email:     a.email || '',
          telephone: a.telephone || '',
          statut:    a.statut,
        }))

        const demRes = await api.get('/demandes-encadrement')
        const demandes = demRes.data || []
        this.nbEnAttente = demandes.filter(d => d.statut === 'en_attente').length

        const formRes = await api.get('/formulaires-voeux').catch(() => ({ data: [] }))
        const formList = formRes.data || []
        const latestForm = formList.find(f => f.statut === 'publie' || f.statut === 'verrouille') || formList[0]
        const voeuxRes = latestForm
          ? await api.get('/voeux-encadrement?formulaire_id=' + latestForm.id).catch(() => ({ data: null }))
          : { data: null }
        this.capaciteMax = voeuxRes.data?.nbre_max_pfe || this.etudiantsAffectes.length || 0
      } catch (e) {
        console.error('Erreur chargement encadrant:', e)
      }
    },

    onNbEnAttente(nb) { this.nbEnAttente = nb },

    onVoeuxSoumis(voeux) {
      this.voeuxSoumis      = true
      this.voeuxData        = voeux
      this.dateSoumission   = new Date().toLocaleDateString('fr-FR')
      this.modeModifierVoeux = false
      this.capaciteMax      = voeux?.nbre_max_pfe || this.capaciteMax
      this.afficherToast({ message: 'Vos vœux ont été soumis avec succès !', type: 'toast-ok' })
      this.navigate('voeux')
    },

    onRoleChanged(newRole) {
      // encadrant role-changed event is a no-op here (they're already encadrant)
      // but update localStorage in case the server changed something
      if (newRole) {
        this.currentUser = { ...this.currentUser, role: newRole }
        localStorage.setItem('user', JSON.stringify(this.currentUser))
      }
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
      a.href = url
      a.download = `etudiants_affectes_${new Date().toISOString().slice(0,10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    },

    afficherToast({message,type}) {
      this.toast = { visible:true, type, message }
      setTimeout(() => { this.toast.visible = false }, 3400)
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.global-toast{position:fixed;top:22px;right:22px;z-index:9999;display:flex;align-items:center;gap:10px;padding:13px 20px;border-radius:12px;font-size:14px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,0.16);font-family:'DM Sans',sans-serif}
.toast-ok{background:#d4edda;color:#155724;border:1px solid rgba(40,167,69,0.3)}.toast-err{background:#f8d7da;color:#721c24;border:1px solid rgba(220,53,69,0.3)}
.toast-anim-enter-active,.toast-anim-leave-active{transition:opacity .25s,transform .25s}.toast-anim-enter-from{opacity:0;transform:translateX(20px)}.toast-anim-leave-to{opacity:0}
.dashboard-shell{display:flex;min-height:100vh;background:#0F1923;font-family:'DM Sans',sans-serif}
.sidebar{width:260px;min-height:100vh;background:linear-gradient(160deg,#1A2635 0%,#0F1923 100%);display:flex;flex-direction:column;flex-shrink:0;transition:width .3s cubic-bezier(.22,1,.36,1);position:sticky;top:0;height:100vh;overflow:hidden}
.sidebar.collapsed{width:68px}
.sb-brand{display:flex;align-items:center;justify-content:space-between;padding:22px 18px 18px;border-bottom:1px solid rgba(255,255,255,0.08);flex-shrink:0}
.brand-full{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;white-space:nowrap}.brand-icon{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#F5C518;width:32px;text-align:center}
.logo-w{color:#fff}.logo-g{color:#F5C518;margin-left:5px}
.collapse-btn{background:rgba(255,255,255,0.08);border:none;border-radius:7px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);cursor:pointer;flex-shrink:0;transition:background .18s}.collapse-btn:hover{background:rgba(255,255,255,0.15);color:#fff}
.sb-nav{flex:1;padding:14px 10px;overflow-y:auto;overflow-x:hidden}
.nav-cat{font-size:10px;font-weight:700;color:rgba(245,166,35,0.75);text-transform:uppercase;letter-spacing:.12em;padding:12px 12px 4px}
.nav-item{display:flex;align-items:center;gap:11px;width:100%;padding:10px 11px;border:none;border-radius:10px;background:transparent;color:rgba(255,255,255,0.62);font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;text-align:left;transition:all .18s;white-space:nowrap;overflow:hidden;margin-bottom:2px;position:relative}
.nav-item:hover{background:rgba(255,255,255,0.09);color:#fff}.nav-item.active{background:rgba(245,166,35,0.22);color:#F5C518}
.nav-icon{display:flex;align-items:center;flex-shrink:0;position:relative}.nav-label{overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:7px}
.badge-cnt{background:#f5a623;color:#fff;font-size:10px;font-weight:700;padding:1px 7px;border-radius:99px;flex-shrink:0}
.badge-soumis{background:rgba(39,174,96,0.3);color:#a8f0c6;font-size:10px;font-weight:700;padding:1px 7px;border-radius:99px}
.badge-dot{position:absolute;top:-3px;right:-3px;width:8px;height:8px;background:#f5a623;border-radius:50%;border:2px solid #2f4f6a}
.sb-user{display:flex;align-items:center;gap:10px;padding:14px;border-top:1px solid rgba(255,255,255,0.08);flex-shrink:0}
.u-av{width:36px;height:36px;border-radius:10px;background:#f5a623;color:#fff;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.u-info{flex:1;overflow:hidden}.u-name{font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.u-role{font-size:11.5px;color:rgba(255,255,255,0.42)}
.logout-btn{background:none;border:none;color:rgba(255,255,255,0.38);cursor:pointer;display:flex;align-items:center;padding:5px;border-radius:6px;transition:color .15s}.logout-btn:hover{color:#F5C518}
.sb-user-col{padding:14px 10px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:center}
.u-av-sm{width:36px;height:36px;border-radius:10px;background:#f5a623;color:#fff;font-weight:700;font-size:11px;display:flex;align-items:center;justify-content:center}
.main-wrap{flex:1;display:flex;flex-direction:column;min-width:0}
.topbar{background:#1A2635;border-bottom:1px solid #c8c4bc;padding:0 32px;height:60px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;position:sticky;top:0;z-index:10}
.breadcrumb{display:flex;align-items:center;gap:7px;font-size:13.5px}.bc-root{color:#F5C518;font-weight:600}.bc-curr{color:#E8EDF2;font-weight:600}
.topbar-r{display:flex;align-items:center;gap:14px}.tb-date{font-size:12.5px;color:#7A8FA6;text-transform:capitalize}
.content-area{flex:1;padding:32px;overflow-y:auto}
.ptb{margin-bottom:24px}.pt{font-family:'Syne',sans-serif;font-size:24px;font-weight:700;color:#E8EDF2;margin-bottom:5px}.ps{font-size:14px;color:#7A8FA6}
.banner-affectation{display:flex;align-items:center;gap:14px;background:#d4edda;border:1.5px solid rgba(39,174,96,0.4);border-radius:14px;padding:18px 22px;margin-bottom:20px}
.ba-icon{font-size:28px;flex-shrink:0}.ba-body{flex:1}.ba-t{font-size:15px;font-weight:700;color:#1e7e34;margin-bottom:3px}.ba-s{font-size:13.5px;color:#2d6a4f}
.ba-btn{padding:9px 18px;background:#27ae60;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}.ba-btn:hover{background:#1e8449}
.ph{margin-bottom:22px}.spt{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:#E8EDF2;margin-bottom:4px}.sps{font-size:13.5px;color:#7A8FA6}
.alert-gold{display:flex;align-items:center;gap:16px;padding:18px 22px;border-radius:14px;margin-bottom:20px;background:#fff8e8;border:1.5px solid #f5a623}
.al-icon{font-size:28px;flex-shrink:0}.al-body{flex:1}.al-t{font-size:14px;font-weight:700;color:#7d5a00;margin-bottom:3px}.al-s{font-size:13px;color:#9a7020}
.btn-alert{padding:9px 18px;background:#f5a623;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;transition:background .18s}.btn-alert:hover{background:#d98e1a}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
.kpi-card{background:#1A2635;border-radius:14px;padding:22px 20px;display:flex;align-items:center;gap:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border:1px solid rgba(245,197,24,0.18)}
.kpi-icon{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.kpi-blue .kpi-icon{background:rgba(245,197,24,0.12);color:#F5C518}.kpi-gold .kpi-icon{background:rgba(245,166,35,0.12);color:#d98e1a}.kpi-green .kpi-icon{background:rgba(39,174,96,0.12);color:#27ae60}.kpi-slate .kpi-icon{background:rgba(74,90,106,0.1);color:#A8BDD4}
.kpi-v{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;color:#E8EDF2;line-height:1}.kpi-l{font-size:12px;color:#7A8FA6;margin-top:4px}
.sec-title{font-size:12px;font-weight:700;color:#7A8FA6;text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px}
.qa-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.qa-card{display:flex;align-items:center;gap:14px;background:#1A2635;border:1px solid rgba(245,197,24,0.18);border-radius:14px;padding:18px 20px;cursor:pointer;text-align:left;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
.qa-card:hover{border-color:#F5C518;box-shadow:0 4px 18px rgba(61,96,128,0.12);transform:translateY(-2px)}
.qa-icon{width:44px;height:44px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.qa-blue{background:rgba(245,197,24,0.12);color:#F5C518}.qa-gold{background:rgba(245,166,35,0.12);color:#d98e1a}.qa-teal{background:rgba(39,174,96,0.12);color:#27ae60}
.qa-txt{flex:1}.qa-t{font-size:14px;font-weight:600;color:#E8EDF2;margin-bottom:2px}.qa-s{font-size:12.5px;color:#7A8FA6}
.qa-arr{color:#c8c4bc;flex-shrink:0;transition:transform .18s,color .18s}.qa-card:hover .qa-arr{transform:translateX(3px);color:#F5C518}
/* Voeux read-only fiche (encadrant theme) */
.page-content{padding:0}
.page-header-block{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:16px;flex-wrap:wrap}
.page-title{font-family:'Syne',sans-serif;font-size:20px;color:#E8EDF2;margin-bottom:4px}
.page-sub{font-size:13.5px;color:#7A8FA6}
.header-actions{display:flex;align-items:center;gap:10px}
.btn-primary-enc{display:flex;align-items:center;gap:8px;padding:10px 20px;background:#F5C518;color:#0F1923;border:none;border-radius:10px;font-size:13.5px;font-weight:700;cursor:pointer;transition:background .18s}
.btn-primary-enc:hover{background:#d9ae10}
.deadline-passed-enc{display:flex;align-items:center;gap:6px;padding:8px 14px;background:#f8d7da;color:#922b21;border-radius:8px;font-size:13px;font-weight:600}
.fiche-card-enc{background:#1A2635;border:1px solid rgba(245,197,24,0.18);border-radius:14px;overflow:hidden}
.fiche-statut-enc{display:flex;align-items:center;gap:12px;padding:16px 20px;background:#0F1923;border-bottom:1px solid rgba(245,197,24,0.18)}
.badge-soumis-lg{padding:5px 14px;background:rgba(39,174,96,0.2);color:#a8f0c6;border-radius:20px;font-size:13px;font-weight:700}
.fiche-date-enc{font-size:13px;color:#7A8FA6}
.fiche-table-enc{width:100%;border-collapse:collapse}
.fiche-table-enc tr{border-top:1px solid rgba(255,255,255,0.07)}
.fiche-table-enc tr:first-child{border-top:none}
.fiche-lbl-enc{padding:14px 20px;font-size:13px;font-weight:600;color:#7A8FA6;background:#1A2635;width:200px;white-space:nowrap}
.fiche-val-enc{padding:14px 20px;font-size:13.5px;color:#E8EDF2;background:#1A2635}
.dispo-badge{font-weight:600}
.dispo-badge.oui{color:#27ae60}.dispo-badge.partielle{color:#d98e1a}.dispo-badge.non{color:#e74c3c}
.spec-tag-enc{display:inline-block;padding:3px 10px;background:rgba(245,197,24,0.1);color:#F5C518;border-radius:20px;font-size:12px;font-weight:600;margin:2px 4px 2px 0}
.back-header-enc{margin-bottom:20px}
.back-btn-enc{display:flex;align-items:center;gap:7px;padding:8px 16px;background:#1A2635;border:1px solid rgba(245,197,24,0.18);border-radius:9px;font-size:13px;color:#A8BDD4;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s}
.back-btn-enc:hover{border-color:#F5C518;color:#F5C518}
/* Affectés table */
.aff-page-header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:20px}
.aff-stats-strip{display:grid;grid-template-columns:repeat(3,auto) 1fr;gap:0;background:#1A2635;border:1px solid rgba(245,197,24,0.18);border-radius:14px;padding:18px 24px;margin-bottom:18px;align-items:center}
.aff-stat{padding:0 24px;border-right:1.5px solid #c8c4bc;text-align:center}
.aff-stat:first-child{padding-left:0}
.aff-stat-v{font-size:26px;font-weight:800;color:#E8EDF2;font-family:'Syne',sans-serif}
.aff-stat-pct{color:#F5C518}
.aff-stat-l{font-size:12px;color:#7A8FA6;font-weight:600;margin-top:2px}
.aff-stat-bar-wrap{padding-left:24px;flex:1}
.aff-bar-bg{height:10px;background:#0F1923;border-radius:99px;overflow:hidden}
.aff-bar-fill{height:100%;background:linear-gradient(90deg,#3d6080,#5a8ab0);border-radius:99px;transition:width .5s ease}
.aff-table-card{background:#1A2635;border:1px solid rgba(245,197,24,0.18);border-radius:14px;overflow:hidden}
.aff-table{width:100%;border-collapse:collapse}
.aff-table thead tr{background:#0F1923}
.aff-table th{padding:12px 16px;font-size:11.5px;font-weight:700;color:#A8BDD4;text-transform:uppercase;letter-spacing:.5px;text-align:left;white-space:nowrap}
.th-n,.th-action{width:50px;text-align:center}
.aff-tr{border-top:1px solid rgba(255,255,255,0.07);cursor:pointer;transition:background .15s}
.aff-tr:hover{background:#243347}
.aff-tr td{padding:14px 16px;vertical-align:middle}
.row-num{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;background:rgba(245,197,24,0.2);color:#fff;border-radius:8px;font-size:12px;font-weight:700}
.etu-cell{display:flex;align-items:center;gap:10px}
.etu-av-gold{width:40px;height:40px;border-radius:11px;background:#f5a623;color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.etu-nom{font-size:14px;font-weight:700;color:#E8EDF2}
.etu-sub{font-size:12px;color:#7A8FA6;margin-top:2px}
.mat-badge{padding:3px 10px;background:#243347;border:1px solid rgba(255,255,255,0.07);border-radius:6px;font-size:12px;font-weight:600;color:#A8BDD4;white-space:nowrap}
.spec-pill{padding:4px 12px;background:rgba(245,197,24,0.1);color:#F5C518;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap}
.tel-txt{font-size:13px;color:#E8EDF2}
.tel-none{color:#c8c4bc}
.td-action{text-align:center}
.btn-fiche-sm{width:34px;height:34px;border:1.5px solid #3d6080;background:transparent;border-radius:9px;color:#F5C518;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .15s}.btn-fiche-sm:hover{background:rgba(245,197,24,0.2);color:#fff}
.empty-row{text-align:center;padding:32px;color:#7A8FA6;font-size:14px}
.search-bar-wrap{display:flex;align-items:center;gap:10px;background:#1A2635;border:1px solid rgba(245,197,24,0.18);border-radius:10px;padding:10px 14px;margin-bottom:16px}
.search-input{flex:1;border:none;background:transparent;font-size:14px;color:#E8EDF2;font-family:'DM Sans',sans-serif;outline:none}
.search-clear{background:none;border:none;color:#7A8FA6;cursor:pointer;font-size:16px;padding:0 4px}.search-clear:hover{color:#E8EDF2}
.btn-export{display:flex;align-items:center;gap:7px;padding:9px 18px;background:rgba(245,197,24,0.2);color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}.btn-export:hover{background:#2f4f6a}
.fiche-etu-modal{max-width:480px;text-align:left}
.fiche-etu-header{display:flex;align-items:center;gap:16px;margin-bottom:20px}
.fiche-av-lg{width:60px;height:60px;border-radius:16px;background:#f5a623;color:#fff;font-weight:700;font-size:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.fiche-nom{font-family:'Syne',sans-serif;font-size:17px;color:#E8EDF2;margin-bottom:6px}
.fiche-role{font-size:13px;color:#7A8FA6;display:flex;align-items:center;gap:6px}
.fiche-close{position:absolute;top:16px;right:16px;background:none;border:none;font-size:18px;cursor:pointer;color:#7A8FA6}.fiche-close:hover{color:#E8EDF2}
.fiche-rows{margin-bottom:20px}
.fiche-row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid #c8c4bc;font-size:13.5px;color:#E8EDF2}
.fiche-lbl{color:#7A8FA6;font-weight:600;font-size:13px}
.btn-fermer{padding:10px 18px;background:transparent;border:1px solid rgba(245,197,24,0.18);border-radius:9px;font-size:13px;font-weight:600;color:#A8BDD4;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s}.btn-fermer:hover{border-color:#F5C518;color:#F5C518}
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:600;white-space:nowrap}
.badge-green{background:#d4edda;color:#1e7e34}.badge-blue{background:rgba(245,197,24,0.12);color:#F5C518}
.empty-state{text-align:center;padding:60px 20px;background:#1A2635;border:1px solid rgba(245,197,24,0.18);border-radius:14px}
.empty-icon{font-size:48px;margin-bottom:12px}.empty-t{font-size:16px;font-weight:600;color:#A8BDD4;margin-bottom:6px}.empty-s{font-size:13.5px;color:#7A8FA6}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:999}
.modal{background:#1A2635;border-radius:16px;padding:28px;max-width:440px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.2);position:relative}
.modal-fade-enter-active,.modal-fade-leave-active{transition:opacity .25s}.modal-fade-enter-from,.modal-fade-leave-to{opacity:0}
.page-fade-enter-active{transition:opacity .25s,transform .25s cubic-bezier(.22,1,.36,1)}.page-fade-leave-active{transition:opacity .15s}
.page-fade-enter-from{opacity:0;transform:translateY(8px)}.page-fade-leave-to{opacity:0}
@media(max-width:1100px){.kpi-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){.content-area{padding:20px}.topbar{padding:0 16px}.qa-grid{grid-template-columns:1fr}}
</style>