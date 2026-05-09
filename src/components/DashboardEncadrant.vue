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

        <div class="nav-cat" v-if="!sidebarCollapsed">Soutenance</div>

        <button class="nav-item nav-parent" :class="{active: soutenanceOpen || isSoutenancePage}" @click="soutenanceOpen=!soutenanceOpen" :title="sidebarCollapsed?'Soutenance':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Plan de soutenance <svg class="chevron" :class="{open:soutenanceOpen}" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></span>
        </button>
        <div v-if="(soutenanceOpen || isSoutenancePage) && !sidebarCollapsed" class="sub-nav">
          <button class="nav-item nav-child" :class="{active:currentPage==='calendrier-soutenance'}" @click="navigate('calendrier-soutenance')">
            <span class="nav-icon sub-icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
            <span class="nav-label">Calendrier</span>
          </button>
          <button class="nav-item nav-child" :class="{active:currentPage==='proposer-plan'}" @click="navigate('proposer-plan')">
            <span class="nav-icon sub-icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>
            <span class="nav-label">Proposer un plan</span>
          </button>
        </div>

        <div class="nav-cat" v-if="!sidebarCollapsed">Évaluation</div>

        <button class="nav-item nav-parent" :class="{active: evaluationOpen || isEvaluationPage}" @click="evaluationOpen=!evaluationOpen" :title="sidebarCollapsed?'Évaluation':''">
          <span class="nav-icon" style="position:relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span v-if="sidebarCollapsed && projetsNonEvalues>0" class="badge-dot"></span>
          </span>
          <span class="nav-label" v-if="!sidebarCollapsed">Évaluation PFE <span v-if="projetsNonEvalues>0" class="badge-cnt">{{ projetsNonEvalues }}</span> <svg class="chevron" :class="{open:evaluationOpen}" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></span>
        </button>
        <div v-if="(evaluationOpen || isEvaluationPage) && !sidebarCollapsed" class="sub-nav">
          <button class="nav-item nav-child" :class="{active:currentPage==='projets-a-evaluer'}" @click="navigate('projets-a-evaluer')">
            <span class="nav-icon sub-icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></span>
            <span class="nav-label">Projets à évaluer <span v-if="projetsNonEvalues>0" class="badge-cnt">{{ projetsNonEvalues }}</span></span>
          </button>
          <button class="nav-item nav-child" :class="{active:currentPage==='mes-evaluations'}" @click="navigate('mes-evaluations')">
            <span class="nav-icon sub-icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></span>
            <span class="nav-label">Mes évaluations</span>
          </button>
        </div>

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

          <!-- ══ HOME — delegated to DashboardEncadrantHome ══ -->
          <DashboardEncadrantHome
            v-if="currentPage === 'home'"
            key="home"
            :current-user="currentUser"
            @navigate="navigate"
          />

          <!-- VOEUX -->
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

          <!-- PROPOSER UN PLAN -->
          <div v-else-if="currentPage==='proposer-plan'" key="proposer-plan">
            <div class="ptb"><h2 class="spt">Proposer un plan de soutenances</h2><p class="sps">Soumettez une proposition de créneaux au chef de département</p></div>

            <div v-if="!etudiantsAffectes.length" class="empty-state">
              <div class="empty-icon">📅</div>
              <div class="empty-t">Aucun étudiant affecté</div>
              <p class="empty-s">Vous devez avoir des étudiants affectés pour proposer un plan de soutenance.</p>
            </div>

            <div v-else class="plan-form">
              <div class="plan-form-title">Créneaux proposés</div>
              <div v-for="(slot, i) in planSlots" :key="i" class="plan-slot-row">
                <div class="form-group"><label>Date</label><input type="date" v-model="slot.date" /></div>
                <div class="form-group"><label>Heure</label><input type="time" v-model="slot.heure" /></div>
                <div class="form-group"><label>Salle</label><input type="text" v-model="slot.salle" placeholder="ex: A101" /></div>
                <div class="form-group">
                  <label>Étudiant / Projet</label>
                  <select v-model="slot.etudiant_id">
                    <option value="">— Sélectionner —</option>
                    <option v-for="e in etudiantsAffectes" :key="e.id" :value="e.id">
                      {{ e.prenom }} {{ e.nom }} · {{ e.specialite || '—' }}
                    </option>
                  </select>
                </div>
                <button class="btn-del-slot" @click="planSlots.splice(i,1)" v-if="planSlots.length>1">×</button>
              </div>
              <button class="btn-add-slot" @click="ajouterSlotEnc">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Ajouter un créneau
              </button>
              <div class="plan-form-actions">
                <button class="btn-primary-enc" @click="soumettreplanEnc" :disabled="savingPlan">
                  <span v-if="savingPlan" class="spin-sm"></span>
                  {{ savingPlan ? 'Envoi en cours...' : 'Soumettre le plan' }}
                </button>
              </div>

              <div v-if="mesPlansEnc.length" style="border-top:1px solid rgba(255,255,255,0.07);padding-top:20px;margin-top:24px">
                <div class="plan-form-title">Mes plans précédemment soumis</div>
                <div v-for="plan in mesPlansEnc" :key="plan.id" class="plan-history">
                  <span class="ph-date">{{ plan.date_proposition }}</span>
                  <span class="ph-status" :class="plan.statut==='validé'||plan.statut==='approuve' ? 'ph-ok' : plan.statut==='rejeté'||plan.statut==='rejete' ? 'ph-nok' : 'ph-wait'">
                    {{ plan.statut === 'approuve' ? 'Validé' : plan.statut === 'rejete' ? 'Rejeté' : 'En attente' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- ════ CALENDRIER SOUTENANCE ════ -->
          <div v-else-if="currentPage==='calendrier-soutenance'" key="calendrier-soutenance">
            <div class="ptb"><h2 class="spt">📅 Calendrier de soutenance</h2><p class="sps">Vos sessions planifiées par le chef de département</p></div>
            <div v-if="loadingSessions" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
            <div v-else-if="!mesSessions.length" class="empty-state">
              <div class="empty-icon">📅</div>
              <div class="empty-t">Aucune session planifiée</div>
              <p class="empty-s">Le calendrier sera affiché une fois que le chef de département aura publié les soutenances.</p>
            </div>
            <div v-else class="sessions-list">
              <div v-for="s in mesSessions" :key="s.id" class="session-card">
                <div class="session-date-block">
                  <div class="session-jour">{{ formatJour(s.date) }}</div>
                  <div class="session-mois">{{ formatMois(s.date) }}</div>
                </div>
                <div class="session-details">
                  <div class="session-titre">{{ s.projet }}</div>
                  <div class="session-info">🕐 {{ s.heure_debut }} – {{ s.heure_fin }} · 🏫 {{ s.salle }}</div>
                  <div class="session-etudiant">👤 {{ s.etudiant }}</div>
                </div>
                <div class="session-status">
                  <span class="badge-session" :class="s.evalue ? 'badge-done' : 'badge-todo'">{{ s.evalue ? '✓ Évalué' : '⏳ À évaluer' }}</span>
                  <button v-if="!s.evalue" class="btn-eval-quick" @click="ouvrirEvaluation(s)">Évaluer →</button>
                </div>
              </div>
            </div>
          </div>

          <!-- ════ PROJETS À ÉVALUER ════ -->
          <div v-else-if="currentPage==='projets-a-evaluer'" key="projets-a-evaluer">
            <div class="ptb"><h2 class="spt">🗂 Projets à évaluer</h2><p class="sps">Téléchargez les livrables et remplissez la grille d'évaluation</p></div>
            <div v-if="loadingProjets" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
            <div v-else-if="!mesProjets.length" class="empty-state">
              <div class="empty-icon">📄</div>
              <div class="empty-t">Aucun projet assigné</div>
              <p class="empty-s">Vous n'avez pas encore de projets à évaluer en tant que membre de jury.</p>
            </div>
            <div v-else class="projets-grid">
              <div v-for="p in mesProjets" :key="p.id" class="projet-card" :class="{'projet-evalue': p.evalue}">
                <div class="pc-header">
                  <div class="pc-titre">{{ p.titre }}</div>
                  <span class="pc-badge" :class="p.evalue ? 'badge-evalue' : 'badge-pending'">{{ p.evalue ? '✓ Évalué' : '⏳ En attente' }}</span>
                </div>
                <div class="pc-etudiant">👤 {{ p.etudiant_nom }} · Encadrant : {{ p.encadrant }}</div>
                <div class="pc-session" v-if="p.date_soutenance">📅 {{ p.date_soutenance }} · 🏫 {{ p.salle }}</div>
                <div class="pc-actions">
                  <a v-if="p.livrable_url" :href="p.livrable_url" target="_blank" class="btn-download">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Livrable
                  </a>
                  <span v-else class="no-livrable">Livrable non disponible</span>
                  <button class="btn-evaluer" @click="ouvrirEvaluation(p)">{{ p.evalue ? '✏ Modifier' : '📝 Évaluer' }}</button>
                </div>
              </div>
            </div>
          </div>

          <!-- ════ MES ÉVALUATIONS ════ -->
          <div v-else-if="currentPage==='mes-evaluations'" key="mes-evaluations">
            <div class="ptb"><h2 class="spt">✅ Mes évaluations</h2><p class="sps">Consultez et modifiez vos évaluations avant la délibération</p></div>
            <div v-if="!mesEvaluations.length" class="empty-state">
              <div class="empty-icon">📋</div>
              <div class="empty-t">Aucune évaluation soumise</div>
              <p class="empty-s">Vos évaluations apparaîtront ici après avoir noté vos projets assignés.</p>
              <button class="btn-primary-enc" style="margin-top:12px" @click="navigate('projets-a-evaluer')">Voir les projets →</button>
            </div>
            <div v-else>
              <div v-for="ev in mesEvaluations" :key="ev.id" class="eval-card">
                <div class="eval-header">
                  <div><div class="eval-titre">{{ ev.projet_titre }}</div><div class="eval-etudiant-sub">{{ ev.etudiant_nom }}</div></div>
                  <div class="eval-meta">
                    <span class="eval-date">{{ ev.date }}</span>
                    <span class="badge-note">{{ ev.note_totale }}/20</span>
                    <button class="btn-modifier" @click="ouvrirModif(ev)">✏ Modifier</button>
                  </div>
                </div>
                <div class="eval-criteres" v-if="ev.criteres && ev.criteres.length">
                  <div v-for="c in ev.criteres" :key="c.id" class="critere-row">
                    <span class="critere-label">{{ c.nom }}</span>
                    <div class="critere-bar-wrap"><div class="critere-bar" :style="{width: (c.bareme ? c.note/c.bareme*100 : 0)+'%'}"></div></div>
                    <span class="critere-note">{{ c.note }}/{{ c.bareme }}</span>
                  </div>
                </div>
                <div v-if="ev.commentaire" class="eval-comment">💬 {{ ev.commentaire }}</div>
              </div>
            </div>
          </div>

        </transition>
      </div>
    </div>
  </div>
  <!-- ════ MODAL ÉVALUATION ════ -->
  <transition name="modal-fade">
    <div v-if="showEvalModal" class="overlay" @click.self="showEvalModal=false">
      <div class="modal modal-lg">
        <button class="fiche-close" @click="showEvalModal=false">×</button>
        <h3 class="modal-title">Évaluation — {{ evalProjet?.titre }}</h3>
        <p class="eval-etudiant-info">👤 {{ evalProjet?.etudiant_nom }} · Encadrant : {{ evalProjet?.encadrant }}</p>
        <div v-if="loadingGrille" class="loading-state" style="padding:20px"><div class="spinner"></div></div>
        <div v-else-if="!evalCategories.length" class="empty-state" style="padding:20px">
          <p>Aucune grille d'évaluation publiée. Contactez le chef de département.</p>
        </div>
        <div v-else class="eval-scroll">
          <div v-for="cat in evalCategories" :key="cat.id" class="eval-category">
            <div class="cat-header"><span class="cat-nom">{{ cat.nom }}</span><span class="cat-bareme">/ {{ cat.bareme_max }} pts</span></div>
            <div class="grille-criteres">
              <div v-for="c in cat.criteres" :key="c.id" class="critere-eval-row">
                <div class="ce-info"><div class="ce-nom">{{ c.nom }}</div><div class="ce-desc">Barème : /{{ c.bareme_max }}</div></div>
                <div class="ce-note-wrap">
                  <input type="number" :min="0" :max="c.bareme_max" step="0.25" v-model.number="c.note"
                    class="note-input" :class="{'note-err': c.note > c.bareme_max || c.note < 0}" />
                  <span class="ce-max">/{{ c.bareme_max }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="eval-total"><span>Note totale :</span><span class="total-val">{{ noteTotale.toFixed(2) }}/20</span></div>
        <div class="form-group" style="margin-top:14px">
          <label>Commentaire (facultatif)</label>
          <textarea v-model="evalCommentaire" rows="3" placeholder="Observations générales..."></textarea>
        </div>
        <div class="modal-footer-enc">
          <button class="btn-cancel-enc" @click="showEvalModal=false">Annuler</button>
          <button class="btn-primary-enc" @click="soumettreEvaluation" :disabled="savingEval">
            <span v-if="savingEval" class="spin-sm"></span>
            {{ savingEval ? 'Envoi...' : 'Soumettre l\'évaluation' }}
          </button>
        </div>
      </div>
    </div>
  </transition>

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
import DashboardEncadrantHome from './DashboardEncadrantHome.vue'

export default {
  name: 'DashboardEncadrant',
  components: {
    ConsulterProfil, ModifierProfil, DemandesEncadrement,
    SuiviEncadrant, ReunionEncadrant, FicheVoeux,
    NotificationsDropdown, Messagerie,
    DashboardEncadrantHome,
  },

  async mounted() {
    await this.chargerDonnees()
    await this.chargerFormulaireActif()
    this.chargerMesPlansEnc()
    this.chargerMesSessions()
    this.chargerMesProjetsJury()
  },

  data() {
    return {
      sidebarCollapsed: false,
      currentPage: 'home',
      toast: { visible: false, type: 'toast-ok', message: '' },
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),
      nbEnAttente: 0,
      nbLivrablesPending: 0,
      etudiantsAffectes: [],
      capaciteMax: 0,
      searchEtu: '',
      ficheEtudiant: null,

      // Voeux state
      formulaireActif: null,
      voeuxSoumis: false,
      voeuxData: null,
      dateSoumission: '',
      modeModifierVoeux: false,

      // Proposer un plan
      planSlots: [{ date: '', heure: '', salle: '', etudiant_id: '' }],
      savingPlan: false,
      mesPlansEnc: [],

      // Soutenance
      mesSessions: [],
      loadingSessions: false,

      // Évaluation (as jury member for encadrant role)
      mesProjets: [],
      mesEvaluations: [],
      loadingProjets: false,
      showEvalModal: false,
      evalProjet: null,
      evalCategories: [],
      evalCommentaire: '',
      loadingGrille: false,
      savingEval: false,

      // Sous-menus toggle
      soutenanceOpen: false,
      evaluationOpen: false,
    }
  },

  computed: {
    projetsNonEvalues() { return this.mesProjets.filter(p => !p.evalue).length },

    noteTotale() {
      let total = 0
      this.evalCategories.forEach(cat => { cat.criteres.forEach(c => { total += (c.note || 0) }) })
      return total
    },

    isSoutenancePage() { return ['calendrier-soutenance','proposer-plan'].includes(this.currentPage) },
    isEvaluationPage() { return ['projets-a-evaluer','mes-evaluations'].includes(this.currentPage) },

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
        voeux:           'Mes vœux d\'encadrement',
        demandes:        'Gérer les demandes',
        affectes:        'Étudiants affectés',
        suivi:           'Suivi & livrables',
        reunions:        'Réunions',
        messagerie:      'Messagerie',
        'proposer-plan':          'Plan de soutenance — Proposer',
        'calendrier-soutenance':  'Plan de soutenance — Calendrier',
        'projets-a-evaluer':      'Évaluation PFE — Projets à évaluer',
        'mes-evaluations':        'Évaluation PFE — Mes évaluations',
        profil:          'Mon profil',
        'profil-edit':   'Modifier le profil',
      }[this.currentPage] || ''
    },
    dateNow() {
      return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    },
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

    initiales(n) { return (n || '?').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) },

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
        this.etudiantsAffectes = affData.map(a => ({
          id:         a.etudiant_id,
          prenom:     a.etudiant ? a.etudiant.split(' ')[0] : '',
          nom:        a.etudiant ? a.etudiant.split(' ').slice(1).join(' ') : '',
          matricule:  a.matricule || '',
          specialite: a.specialite || '',
          email:      a.email || '',
          telephone:  a.telephone || '',
          statut:     a.statut,
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
      this.voeuxSoumis       = true
      this.voeuxData         = voeux
      this.dateSoumission    = new Date().toLocaleDateString('fr-FR')
      this.modeModifierVoeux = false
      this.capaciteMax       = voeux?.nbre_max_pfe || this.capaciteMax
      this.afficherToast({ message: 'Vos vœux ont été soumis avec succès !', type: 'toast-ok' })
      this.navigate('voeux')
    },

    onRoleChanged(newRole) {
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
      a.download = `etudiants_affectes_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    },

    ajouterSlotEnc() {
      this.planSlots.push({ date: '', heure: '', salle: '', etudiant_id: '' })
    },

    async chargerMesPlansEnc() {
      try {
        const res = await api.get('/plans-soutenance')
        const userId = this.currentUser.id
        this.mesPlansEnc = (res.data || [])
          .filter(p => p.proposant_id === userId || p.encadrant_id === userId)
          .map(p => ({
            id: p.id,
            date_proposition: p.created_at
              ? new Date(p.created_at).toLocaleDateString('fr-FR')
              : new Date().toLocaleDateString('fr-FR'),
            statut: p.statut || 'En attente',
          }))
      } catch (e) {
        // endpoint may not exist yet — silently ignore
      }
    },

    async soumettreplanEnc() {
      // Nouvelle structure : une ligne plans_soutenance = un créneau (date/heure/salle inline)
      // On soumet un plan par slot rempli (plusieurs appels API si plusieurs slots)
      const slots = this.planSlots.filter(s => s.date && s.heure && s.salle)
      if (!slots.length) {
        this.afficherToast({ message: 'Veuillez remplir au moins un créneau (date, heure, salle).', type: 'toast-err' })
        return
      }
      this.savingPlan = true
      try {
        // Chercher si l'étudiant sélectionné a déjà une soutenance pour lier le plan
        for (const s of slots) {
          let soutenanceId = null
          if (s.etudiant_id) {
            // Trouver la soutenance de cet étudiant via les sessions déjà chargées
            const session = (this.mesSessions || []).find(ms => ms.etudiant_id === s.etudiant_id)
            soutenanceId = session?.id || null
          }
          await api.post('/plans-soutenance', {
            proposant_id:  this.currentUser.id,
            role:          'encadrant',
            date:          s.date,
            heure_debut:   s.heure,
            salle:         s.salle,
            soutenance_id: soutenanceId,
          })
        }
        this.afficherToast({ message: '✅ Plan(s) soumis au chef de département avec succès.', type: 'toast-ok' })
        this.mesPlansEnc.unshift({
          id: Date.now(),
          date_proposition: new Date().toLocaleDateString('fr-FR'),
          statut: 'En attente',
        })
        this.planSlots = [{ date: '', heure: '', salle: '', etudiant_id: '' }]
        await this.chargerMesPlansEnc()
      } catch (e) {
        const msg = e?.response?.data?.message || 'Erreur lors de la soumission du plan.'
        this.afficherToast({ message: msg, type: 'toast-err' })
      } finally {
        this.savingPlan = false
      }
    },

    // ── CALENDRIER SOUTENANCE ─────────────────────────────────────────
    async chargerMesSessions() {
      this.loadingSessions = true
      try {
        const res = await api.get('/jurys-pfe')
        const userId = this.currentUser.id
        this.mesSessions = (res.data || [])
          .filter(j => j.date_soutenance && (j.encadrant_id === userId || (j.membres || []).some(m => m.enseignant_id === userId)))
          .map(j => ({
            id: j.id,
            date: j.date_soutenance,
            heure_debut: (j.heure_debut || '').substring(0, 5),
            heure_fin:   (j.heure_fin   || '').substring(0, 5),
            salle:   j.salle       || '—',
            projet:  j.projet_titre || '—',
            etudiant: j.etudiant_nom || '—',
            evalue: false,
          }))
      } catch(e) { console.error('Erreur sessions:', e); this.mesSessions = [] }
      finally { this.loadingSessions = false }
    },

    // ── ÉVALUATION ────────────────────────────────────────────────────
    async chargerMesProjetsJury() {
      this.loadingProjets = true
      try {
        const res = await api.get('/jurys-pfe')
        const userId = this.currentUser.id
        this.mesProjets = (res.data || [])
          .filter(j => (j.membres || []).some(m => m.enseignant_id === userId))
          .map(j => ({
            id: j.id,
            titre:        j.projet_titre  || ('Projet #' + j.id),
            etudiant_nom: j.etudiant_nom  || '—',
            encadrant:    j.encadrant_nom || '—',
            date_soutenance: j.date_soutenance || null,
            salle:           j.salle || null,
            livrable_url:    null,
            evalue:          false,
          }))

        // Mark already-evaluated projects
        if (this.mesEvaluations.length) {
          this.mesEvaluations.forEach(ev => {
            const p = this.mesProjets.find(pr => pr.titre === ev.projet_titre)
            if (p) p.evalue = true
          })
        }
      } catch(e) { console.error('Erreur projets jury:', e); this.mesProjets = [] }
      finally { this.loadingProjets = false }
    },

    async ouvrirEvaluation(projet) {
      this.evalProjet = projet
      this.evalCommentaire = ''
      this.showEvalModal = true
      this.loadingGrille = true
      try {
        const res = await api.get('/grilles')
        const grilles = res.data || []
        // Validated grille has statut 'verrouille' — that is the one to use
        const grille = grilles.find(g => g.statut === 'verrouille')
        if (grille) {
          const detail = await api.get(`/grilles/${grille.id}`)
          this.evalCategories = (detail.data.categories || []).map(cat => ({
            id: cat.id, nom: cat.nom, bareme_max: parseFloat(cat.bareme_max),
            criteres: (cat.criteres || []).map(cr => ({
              id: cr.id, nom: cr.nom, bareme_max: parseFloat(cr.bareme_max), note: 0,
            }))
          }))
        } else { this.evalCategories = [] }
      } catch(e) { console.error('Erreur grille:', e); this.evalCategories = [] }
      finally { this.loadingGrille = false }

      // Pre-fill if already evaluated
      const existing = this.mesEvaluations.find(ev => ev.projet_titre === projet.titre)
      if (existing?.criteres?.length) {
        this.evalCategories.forEach(cat => {
          cat.criteres.forEach(cr => {
            const found = existing.criteres.find(ec => ec.id === cr.id)
            if (found) cr.note = found.note || 0
          })
        })
        this.evalCommentaire = existing.commentaire || ''
      }
    },

    ouvrirModif(ev) {
      const projet = this.mesProjets.find(p => p.titre === ev.projet_titre) || {
        titre: ev.projet_titre, etudiant_nom: ev.etudiant_nom, encadrant: '—'
      }
      this.ouvrirEvaluation(projet)
    },

    async soumettreEvaluation() {
      for (const cat of this.evalCategories) {
        for (const c of cat.criteres) {
          if (c.note < 0 || c.note > c.bareme_max) {
            this.afficherToast({ message: `Note invalide pour "${c.nom}" (max ${c.bareme_max}).`, type: 'toast-err' })
            return
          }
        }
      }
      this.savingEval = true
      try {
        const juryId = this.evalProjet?.id
        if (juryId) {
          await api.post(`/jurys-pfe/${juryId}/notes`, {
            enseignant_id: this.currentUser.id,
            note: parseFloat(this.noteTotale.toFixed(2)),
            commentaire: this.evalCommentaire,
            finalise: true,
          })
        }
        this.afficherToast({ message: 'Évaluation soumise avec succès.', type: 'toast-ok' })

        // Update local state
        const idx = this.mesProjets.findIndex(p => p.id === this.evalProjet?.id)
        if (idx !== -1) this.mesProjets[idx].evalue = true

        const allCriteres = this.evalCategories.flatMap(cat =>
          cat.criteres.map(c => ({ id: c.id, nom: c.nom, bareme: c.bareme_max, note: c.note }))
        )
        const newEval = {
          id: Date.now(),
          projet_titre: this.evalProjet?.titre,
          etudiant_nom: this.evalProjet?.etudiant_nom,
          date: new Date().toLocaleDateString('fr-FR'),
          note_totale: parseFloat(this.noteTotale.toFixed(2)),
          criteres: allCriteres,
          commentaire: this.evalCommentaire,
        }
        const existIdx = this.mesEvaluations.findIndex(e => e.projet_titre === this.evalProjet?.titre)
        if (existIdx !== -1) this.mesEvaluations[existIdx] = newEval
        else this.mesEvaluations.push(newEval)

        this.showEvalModal = false
      } catch(e) {
        this.afficherToast({ message: e?.response?.data?.message || 'Erreur lors de la soumission.', type: 'toast-err' })
      } finally { this.savingEval = false }
    },

    formatJour(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric' })
    },
    formatMois(d) {
      if (!d) return ''
      return new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }).toUpperCase()
    },

    afficherToast({ message, type }) {
      this.toast = { visible: true, type, message }
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
.ptb{margin-bottom:24px}.spt{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:#E8EDF2;margin-bottom:4px}.sps{font-size:13.5px;color:#7A8FA6}
/* Voeux read-only fiche */
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
@media(max-width:768px){.content-area{padding:20px}.topbar{padding:0 16px}}
/* Plan */
.plan-form{background:#1A2635;border:1px solid rgba(245,197,24,0.15);border-radius:14px;padding:24px}
.plan-form-title{font-weight:700;font-size:14.5px;color:#E8EDF2;margin-bottom:16px}
.plan-slot-row{display:grid;grid-template-columns:1fr 1fr 1fr 2fr auto;gap:12px;align-items:end;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.06)}
.form-group{display:flex;flex-direction:column;gap:5px}
.form-group label{font-size:12.5px;font-weight:600;color:#F5C518}
.form-group input,.form-group select,.form-group textarea{padding:9px 12px;border:1px solid rgba(245,197,24,0.18);border-radius:8px;background:#243347;font-size:13.5px;color:#E8EDF2;font-family:'DM Sans',sans-serif}
.form-group input:focus,.form-group select:focus{outline:none;border-color:#F5C518}
.btn-del-slot{width:32px;height:32px;border:none;border-radius:8px;background:rgba(231,76,60,.1);color:#e74c3c;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.btn-del-slot:hover{background:#e74c3c;color:#fff}
.btn-add-slot{display:flex;align-items:center;gap:7px;padding:9px 16px;background:#243347;border:1.5px dashed rgba(245,197,24,0.3);border-radius:9px;font-size:13px;font-weight:600;color:#7A8FA6;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s;margin-bottom:20px}
.btn-add-slot:hover{border-color:#F5C518;color:#F5C518}
.plan-form-actions{display:flex;justify-content:flex-end}
.plan-history{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.ph-date{font-size:13px;color:#A8BDD4;flex:1}
.ph-status{padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700}
.ph-ok{background:#d4edda;color:#155724}.ph-nok{background:#f8d7da;color:#721c24}.ph-wait{background:#fff3cd;color:#856404}
.spin-sm{width:12px;height:12px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── Submenu ── */
.nav-parent{justify-content:space-between}
.sub-nav{padding-left:14px;margin-bottom:4px}
.nav-child{font-size:13px;padding:8px 10px;color:rgba(255,255,255,0.55)}
.nav-child.active{color:#F5C518;background:rgba(245,166,35,0.15)}
.sub-icon{opacity:.7}
.chevron{margin-left:auto;transition:transform .2s;flex-shrink:0}
.chevron.open{transform:rotate(180deg)}

/* ── Sessions calendar ── */
.sessions-list{display:flex;flex-direction:column;gap:12px}
.session-card{display:flex;align-items:center;gap:16px;background:#1A2635;border:1px solid rgba(245,197,24,0.18);border-radius:14px;padding:16px 20px;transition:background .15s}
.session-card:hover{background:#243347}
.session-date-block{display:flex;flex-direction:column;align-items:center;min-width:52px}
.session-jour{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#F5C518;line-height:1}
.session-mois{font-size:11px;color:#7A8FA6;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
.session-details{flex:1}
.session-titre{font-weight:700;font-size:14.5px;color:#E8EDF2;margin-bottom:4px}
.session-info{font-size:13px;color:#A8BDD4;margin-bottom:3px}
.session-etudiant{font-size:13px;color:#7A8FA6}
.session-status{display:flex;flex-direction:column;align-items:flex-end;gap:8px;min-width:110px}
.badge-session{padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap}
.badge-done{background:rgba(39,174,96,0.15);color:#27ae60}
.badge-todo{background:rgba(245,197,24,0.1);color:#F5C518}
.btn-eval-quick{padding:6px 12px;background:#F5C518;color:#0F1923;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;transition:background .15s;white-space:nowrap}
.btn-eval-quick:hover{background:#d9ae10}

/* ── Projets grid ── */
.projets-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px}
.projet-card{background:#1A2635;border:1px solid rgba(245,197,24,0.18);border-radius:14px;padding:20px;transition:border-color .15s}
.projet-card:hover{border-color:rgba(245,197,24,0.4)}
.projet-evalue{border-color:rgba(39,174,96,0.3)}
.pc-header{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px}
.pc-titre{font-weight:700;font-size:14.5px;color:#E8EDF2;line-height:1.3}
.pc-badge{padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:700;white-space:nowrap;flex-shrink:0}
.badge-evalue{background:rgba(39,174,96,0.15);color:#27ae60}
.badge-pending{background:rgba(245,197,24,0.1);color:#F5C518}
.pc-etudiant{font-size:13px;color:#A8BDD4;margin-bottom:6px}
.pc-session{font-size:12.5px;color:#7A8FA6;margin-bottom:14px}
.pc-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.btn-download{display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;font-size:13px;color:#A8BDD4;text-decoration:none;transition:all .15s}
.btn-download:hover{border-color:#F5C518;color:#F5C518}
.no-livrable{font-size:12.5px;color:#7A8FA6;font-style:italic}
.btn-evaluer{padding:8px 16px;background:#F5C518;color:#0F1923;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s}
.btn-evaluer:hover{background:#d9ae10}

/* ── Evaluation cards ── */
.eval-card{background:#1A2635;border:1px solid rgba(245,197,24,0.18);border-radius:14px;padding:20px;margin-bottom:14px}
.eval-header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:14px}
.eval-titre{font-weight:700;font-size:14.5px;color:#E8EDF2;margin-bottom:4px}
.eval-etudiant-sub{font-size:13px;color:#7A8FA6}
.eval-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.eval-date{font-size:12.5px;color:#7A8FA6}
.badge-note{padding:4px 12px;background:rgba(245,197,24,0.15);color:#F5C518;border-radius:20px;font-size:13px;font-weight:700}
.btn-modifier{padding:6px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;font-size:12.5px;color:#A8BDD4;cursor:pointer;transition:all .15s}
.btn-modifier:hover{border-color:#F5C518;color:#F5C518}
.eval-criteres{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
.critere-row{display:flex;align-items:center;gap:10px}
.critere-label{font-size:12.5px;color:#A8BDD4;min-width:160px;flex-shrink:0}
.critere-bar-wrap{flex:1;height:6px;background:#0F1923;border-radius:99px;overflow:hidden}
.critere-bar{height:100%;background:linear-gradient(90deg,#3d6080,#F5C518);border-radius:99px;transition:width .4s ease}
.critere-note{font-size:12px;color:#7A8FA6;min-width:50px;text-align:right}
.eval-comment{padding:10px 14px;background:#0F1923;border-radius:8px;font-size:13px;color:#A8BDD4;border-left:3px solid rgba(245,197,24,0.4)}

/* ── Eval Modal ── */
.modal-lg{max-width:640px;width:95%}
.modal-title{font-family:'Syne',sans-serif;font-size:17px;color:#E8EDF2;margin-bottom:6px}
.eval-etudiant-info{font-size:13px;color:#7A8FA6;margin-bottom:18px}
.eval-scroll{max-height:52vh;overflow-y:auto;padding-right:4px}
.eval-category{margin-bottom:20px}
.cat-header{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#0F1923;border-radius:8px;margin-bottom:10px}
.cat-nom{font-weight:700;font-size:13.5px;color:#F5C518}
.cat-bareme{font-size:12.5px;color:#7A8FA6}
.grille-criteres{display:flex;flex-direction:column;gap:8px;padding:0 4px}
.critere-eval-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px;background:#243347;border-radius:8px}
.ce-info{flex:1}
.ce-nom{font-size:13.5px;color:#E8EDF2;font-weight:600}
.ce-desc{font-size:11.5px;color:#7A8FA6;margin-top:2px}
.ce-note-wrap{display:flex;align-items:center;gap:6px}
.note-input{width:72px;padding:6px 8px;border:1.5px solid rgba(245,197,24,0.25);border-radius:7px;background:#1A2635;color:#E8EDF2;font-size:14px;font-family:'DM Sans',sans-serif;text-align:center}
.note-input:focus{outline:none;border-color:#F5C518}
.note-err{border-color:#e74c3c!important}
.ce-max{font-size:12.5px;color:#7A8FA6;min-width:24px}
.eval-total{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#0F1923;border-radius:10px;margin:16px 0 4px;font-size:14px;color:#A8BDD4;font-weight:600}
.total-val{font-size:20px;font-weight:800;color:#F5C518;font-family:'Syne',sans-serif}
.modal-footer-enc{display:flex;justify-content:flex-end;gap:10px;margin-top:16px}
.btn-cancel-enc{padding:10px 18px;background:transparent;border:1px solid rgba(245,197,24,0.18);border-radius:9px;font-size:13px;font-weight:600;color:#A8BDD4;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s}
.btn-cancel-enc:hover{border-color:#F5C518;color:#F5C518}

</style>