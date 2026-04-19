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

        <div class="nav-cat" v-if="!sidebarCollapsed">Demande d'encadrement</div>

        <button class="nav-item" :class="{active:currentPage==='ma-demande'}" @click="navigate('ma-demande')" :title="sidebarCollapsed?'Ma demande':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Ma demande</span>
        </button>
        <button class="nav-item" :class="{active:currentPage==='encadrants'}" @click="navigate('encadrants')" :title="sidebarCollapsed?'Encadrants':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Encadrants disponibles</span>
        </button>

        <div class="nav-cat" v-if="!sidebarCollapsed">Mon projet PFE</div>

        <button class="nav-item" :class="{active:currentPage==='livrables'}" @click="navigate('livrables')" :title="sidebarCollapsed?'Livrables':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Mes livrables</span>
        </button>

        <button class="nav-item" :class="{active:currentPage==='reunions'}" @click="navigate('reunions')" :title="sidebarCollapsed?'Réunions':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Réunions</span>
        </button>

        <button class="nav-item" :class="{active:currentPage==='resultats'}" @click="navigate('resultats')" :title="sidebarCollapsed?'Résultats':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Mon résultat final</span>
        </button>

      </nav>

      <div class="sb-user" v-if="!sidebarCollapsed">
        <div class="u-av" style="cursor:pointer" @click="navigate('profil')" :title="'Mon profil'">{{ initiales(currentUser.prenom+' '+currentUser.nom) }}</div>
        <div class="u-info"><div class="u-name">{{ currentUser.prenom }} {{ currentUser.nom }}</div><div class="u-role">Étudiant</div></div>
        <button class="logout-btn" @click="logout"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button>
      </div>
      <div class="sb-user-col" v-else><div class="u-av-sm">{{ initiales(currentUser.prenom+' '+currentUser.nom) }}</div></div>
    </aside>

    <div class="main-wrap">
      <header class="topbar">
        <div class="breadcrumb"><span class="bc-root">Espace Étudiant</span><template v-if="breadcrumb"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg><span class="bc-curr">{{ breadcrumb }}</span></template></div>
        <div class="topbar-r"><span class="tb-date">{{ dateNow }}</span></div>
      </header>

      <div class="content-area">
        <transition name="page-fade" mode="out-in">

          <!-- HOME -->
          <div v-if="currentPage==='home'" key="home">
            <div class="ptb"><h1 class="pt">Bonjour, {{ currentUser.prenom }} 👋</h1><p class="ps">Soumettez et suivez votre demande d'encadrement PFE.</p></div>

            <div v-if="monAffectation && monAffectation.statut === 'diffusee'" class="banner-affectation">

            <!-- ── Phase countdown alert ── -->
            <div v-if="phaseEnCours && joursRestants !== null"
              class="banner-phase-countdown"
              :class="{
                'bpc-urgent':  joursRestants <= 3,
                'bpc-warning': joursRestants > 3 && joursRestants <= 7,
                'bpc-normal':  joursRestants > 7
              }">
              <div class="bpc-icon">{{ joursRestants <= 3 ? '🔴' : joursRestants <= 7 ? '🟡' : '📅' }}</div>
              <div class="bpc-body">
                <div class="bpc-t">Phase en cours : <strong>{{ phaseEnCours.nom }}</strong></div>
                <div class="bpc-s" v-if="joursRestants > 0">
                  Il vous reste <strong>{{ joursRestants }} jour{{ joursRestants > 1 ? 's' : '' }}</strong>
                  pour soumettre votre livrable
                  <span v-if="phaseEnCours.date_fin">
                    (échéance : {{ new Date(phaseEnCours.date_fin).toLocaleDateString('fr-FR') }})
                  </span>
                </div>
                <div class="bpc-s bpc-expired" v-else>⚠️ La date limite de cette phase est dépassée.</div>
              </div>
            </div>
              <div class="ba-icon">🎓</div>
              <div class="ba-body">
                <div class="ba-t">Votre affectation a été publiée !</div>
                <div class="ba-s">
                  Encadrant : <strong>{{ monAffectation.encadrant || '—' }}</strong>
                  <span v-if="monAffectation.specialite"> · {{ monAffectation.specialite }}</span>
                </div>
              </div>
              <span class="ba-badge">✓ Officiel</span>
            </div>

            <div v-if="loadingDonnees" class="loading-state" style="padding:32px;text-align:center;color:#8a9aaa">
              <div class="spinner" style="width:24px;height:24px;border:3px solid #c8c4bc;border-top-color:#3d6080;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;margin-bottom:8px"></div>
              <p>Chargement...</p>
            </div>

            <template v-else>

            <div v-if="!accordMutuelActif && !monAffectation" class="banner-info">
              <span>ℹ️</span>
              <div>Le chef de département n'a pas encore activé le mode accord mutuel. Les demandes directes ne sont pas disponibles pour le moment.</div>
            </div>

            <div v-if="accordMutuelActif && !maDemande && !monAffectation" class="banner-accord-mutuel">
              <div class="bam-icon">🤝</div>
              <div class="bam-body">
                <div class="bam-t">Mode accord mutuel activé</div>
                <div class="bam-s">Le chef de département vous invite à choisir votre encadrant et soumettre une demande. Consultez la liste des encadrants disponibles et envoyez votre demande dès maintenant.</div>
              </div>
              <button class="bam-btn" @click="navigate('encadrants')">Choisir un encadrant →</button>
            </div>

            <div v-if="maDemande && accordMutuelActif" class="statut-card-rich">
              <div class="scr-left">
                <div class="scr-ico" :class="'scr-ico-'+maDemande.statut">{{ statutIcon(maDemande.statut) }}</div>
                <div class="scr-info">
                  <div class="scr-titre">{{ maDemande.sujet || maDemande.titre }}</div>
                  <div class="scr-sub">{{ maDemande.encadrant }} · {{ maDemande.specialite }}</div>
                  <span class="scr-badge" :class="'scr-badge-'+maDemande.statut">{{ labelStatut(maDemande.statut) }}</span>
                </div>
              </div>
              <div class="scr-actions">
                <button class="scr-btn scr-btn-view" @click="navigate('consulter-demande')" title="Consulter la demande">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button v-if="maDemande.statut==='en_attente'" class="scr-btn scr-btn-edit" @click="navigate('modifier-demande')" title="Modifier">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button v-if="maDemande.statut==='en_attente'" class="scr-btn scr-btn-del" @click="navigate('annuler-demande')" title="Annuler la demande">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </div>

            <div class="kpi-grid">
              <div class="kpi-card kpi-gold"><div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div><div><div class="kpi-v">{{ maDemande ? '✓' : '—' }}</div><div class="kpi-l">Demande</div></div></div>
              <div class="kpi-card" :class="monAffectation ? 'kpi-green' : 'kpi-slate'"><div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="kpi-v">{{ monAffectation ? '✓' : '—' }}</div><div class="kpi-l">Affectation</div></div></div>
              <div class="kpi-card kpi-blue"><div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="kpi-v">{{ encadrants.filter(e=>e.disponible).length }}</div><div class="kpi-l">Encadrants dispo</div></div></div>
            </div>

            <div class="sec-title">Actions</div>
            <div class="qa-grid">
              <div v-if="monAffectation && monAffectation.statut === 'diffusee'" class="qa-card qa-card-result">
                <div class="qa-icon qa-green"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
                <div class="qa-txt">
                  <div class="qa-t">Mon encadrant</div>
                  <div class="qa-s"><strong>{{ monAffectation.encadrant }}</strong></div>
                  <div class="qa-s" v-if="monAffectation.specialite">{{ monAffectation.specialite }}</div>
                </div>
              </div>
              <button v-if="accordMutuelActif" class="qa-card" @click="navigate('ma-demande')">
                <div class="qa-icon qa-gold"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <div class="qa-txt"><div class="qa-t">{{ maDemande ? 'Gérer ma demande' : 'Soumettre une demande' }}</div><div class="qa-s">Titre, description, encadrant, document</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('encadrants')">
                <div class="qa-icon qa-blue"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Parcourir les encadrants</div><div class="qa-s">Spécialités et disponibilités</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('livrables')">
                <div class="qa-icon qa-gold"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Mes livrables</div><div class="qa-s">Déposer et suivre mes livrables</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('reunions')">
                <div class="qa-icon qa-teal"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Réunions</div><div class="qa-s">Planifier des créneaux avec mon encadrant</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('resultats')">
                <div class="qa-icon qa-green"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Mon résultat final</div><div class="qa-s">Note, mention et décision de délibération</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            </template><!-- end v-else loading -->
          </div>

          <!-- MA DEMANDE -->
          <div v-else-if="currentPage==='ma-demande'" key="ma-demande">
            <div v-if="!accordMutuelActif && !maDemande" class="lock-card">
              <div class="lock-icon">🔒</div>
              <h3>Demandes non disponibles</h3>
              <p>Le chef de département a choisi le mode automatique. Les demandes directes ne sont pas activées.</p>
              <button class="btn-outline" @click="navigate('home')">← Retour</button>
            </div>

            <template v-else>
              <div class="ph" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
                <div><h2 class="spt">Ma demande d'encadrement</h2>
                <p class="sps">{{ maDemande && !editMode ? 'Consultez ou modifiez votre demande' : 'Remplissez le formulaire' }}</p></div>
              </div>

              <div v-if="maDemande && !editMode" class="demande-view">
                <div class="statut-banner" :class="'sb-'+maDemande.statut">
                  <div class="sb-icon">{{ statutIcon(maDemande.statut) }}</div>
                  <div class="sb-body">
                    <div class="sb-t">{{ labelStatut(maDemande.statut) }}</div>
                    <div class="sb-s" v-if="maDemande.statut==='en_attente'">En attente de réponse de votre encadrant</div>
                    <div class="sb-s" v-else-if="maDemande.statut==='acceptee'">Votre demande a été acceptée 🎉</div>
                    <div class="sb-s" v-else-if="maDemande.statut==='rejetee'">Votre demande a été rejetée</div>
                  </div>
                </div>
                <div class="motif-rejet" v-if="maDemande.statut==='rejetee' && maDemande.motif_rejet">
                  <strong>⚠ Motif :</strong> {{ maDemande.motif_rejet }}
                </div>
                <div class="dv-card">
                  <div class="dv-row"><span class="dv-lbl">Sujet</span><span class="dv-val">{{ maDemande.sujet || maDemande.titre }}</span></div>
                  <div class="dv-row"><span class="dv-lbl">Encadrant</span><span class="dv-val">{{ maDemande.encadrant || '—' }}</span></div>
                  <div class="dv-row"><span class="dv-lbl">Description</span><span class="dv-val">{{ maDemande.description }}</span></div>
                  <div class="dv-row" v-if="maDemande.doc_pdf">
                    <span class="dv-lbl">Document</span>
                    <a class="file-link" :href="'http://127.0.0.1:8000/storage/'+maDemande.doc_pdf" target="_blank">📄 Voir le document</a>
                  </div>
                  <div class="dv-row"><span class="dv-lbl">Date</span><span class="dv-val">{{ maDemande.date_demande ? new Date(maDemande.date_demande).toLocaleDateString('fr-FR') : '—' }}</span></div>
                </div>
                <div class="dv-footer" v-if="maDemande.statut==='en_attente'">
                  <button class="btn-primary" @click="editMode=true; formDemande={sujet:maDemande.sujet||maDemande.titre,description:maDemande.description,encadrant_id:maDemande.encadrant_id,fichier:null}">✏️ Modifier</button>
                  <button class="btn-danger-sm" @click="annulerDemande" :disabled="submitting">🗑 Annuler</button>
                </div>
                <div class="dv-footer" v-else-if="maDemande.statut==='rejetee'">
                  <button class="btn-primary" @click="maDemande=null; editMode=false; formDemande={sujet:'',description:'',encadrant_id:null,fichier:null}">Nouvelle demande</button>
                </div>
              </div>

              <div v-if="!maDemande || editMode" class="form-card">
                <div class="form-title">{{ editMode ? '✏️ Modifier ma demande' : '📝 Nouvelle demande d\'encadrement' }}</div>

                <div class="field-block">
                  <label class="fl">Sujet du PFE <span class="req">*</span></label>
                  <input v-model="formDemande.sujet" class="fi" type="text" placeholder="Ex : Plateforme de gestion PFE avec IA"/>
                  <p class="err" v-if="errs.sujet">{{ errs.sujet }}</p>
                </div>

                <div class="field-block">
                  <label class="fl">Description <span class="req">*</span></label>
                  <textarea v-model="formDemande.description" class="fi ft" rows="4" placeholder="Décrivez votre sujet, objectifs et méthodologie..."></textarea>
                  <p class="err" v-if="errs.description">{{ errs.description }}</p>
                </div>

                <div class="field-block">
                  <label class="fl">Encadrant souhaité <span class="req">*</span></label>
                  <select v-model="formDemande.encadrant_id" class="fi">
                    <option value="">-- Sélectionner un encadrant --</option>
                    <option v-for="e in encadrants" :key="e.id" :value="e.id">{{ e.prenom }} {{ e.nom }}{{ e.domaine ? ' — '+e.domaine : '' }}</option>
                  </select>
                  <p class="err" v-if="errs.encadrant">{{ errs.encadrant }}</p>
                  <p style="font-size:12px;color:#8a9aaa;margin-top:4px">Ou choisissez depuis <a href="#" @click.prevent="navigate('encadrants')" style="color:#F5C518">la liste des encadrants</a></p>
                </div>

                <div class="field-block">
                  <label class="fl">Document du sujet <span style="font-size:12px;color:#7A8FA6">(PDF, optionnel)</span></label>
                  <div class="file-upload-zone" @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="handleDrop">
                    <input type="file" ref="fileInput" accept=".pdf,.doc,.docx" style="display:none" @change="handleFile"/>
                    <div v-if="!formDemande.fichier" class="file-upload-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8a9aaa" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <p>Cliquez ou glissez un fichier PDF ici</p>
                      <span>Max 5 Mo</span>
                    </div>
                    <div v-else class="file-selected">
                      <span>📄 {{ formDemande.fichier.name }}</span>
                      <button class="file-remove" @click.stop="formDemande.fichier=null">✕</button>
                    </div>
                  </div>
                </div>

                <div class="form-footer">
                  <button class="btn-outline" v-if="editMode" @click="editMode=false">Annuler</button>
                  <button class="btn-primary" @click="soumettreDemande" :disabled="submitting">
                    <span v-if="submitting" class="spinner"></span>
                    {{ editMode ? 'Enregistrer' : 'Envoyer la demande' }}
                  </button>
                </div>
              </div>
            </template>
          </div>

          <div v-else-if="currentPage==='consulter-demande'" key="consulter-demande">
            <div class="page-header-back">
              <button class="back-btn" @click="navigate('home')">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                Retour
              </button>
              <div><h2 class="spt">Ma demande</h2><p class="sps">Détails de votre demande d'encadrement</p></div>
            </div>
            <div v-if="maDemande">
              <div class="statut-banner" :class="'sb-'+maDemande.statut">
                <div class="sb-icon">{{ statutIcon(maDemande.statut) }}</div>
                <div class="sb-body">
                  <div class="sb-t">{{ labelStatut(maDemande.statut) }}</div>
                  <div class="sb-s" v-if="maDemande.statut==='en_attente'">En attente de réponse de votre encadrant</div>
                  <div class="sb-s" v-else-if="maDemande.statut==='acceptee'">Votre demande a été acceptée 🎉</div>
                  <div class="sb-s" v-else-if="maDemande.statut==='rejetee'">Votre demande a été rejetée</div>
                </div>
              </div>
              <div class="motif-rejet" v-if="maDemande.statut==='rejetee' && maDemande.motif_rejet">
                <strong>⚠ Motif du rejet :</strong> {{ maDemande.motif_rejet }}
              </div>
              <div class="dv-card">
                <div class="dv-row"><span class="dv-lbl">Sujet</span><span class="dv-val">{{ maDemande.sujet || maDemande.titre }}</span></div>
                <div class="dv-row"><span class="dv-lbl">Encadrant</span><span class="dv-val">{{ maDemande.encadrant || '—' }}</span></div>
                <div class="dv-row"><span class="dv-lbl">Spécialité</span><span class="dv-val">{{ maDemande.specialite || '—' }}</span></div>
                <div class="dv-row"><span class="dv-lbl">Description</span><span class="dv-val" style="white-space:pre-line">{{ maDemande.description }}</span></div>
                <div class="dv-row" v-if="maDemande.doc_pdf">
                  <span class="dv-lbl">Document</span>
                  <a class="file-link" :href="'http://127.0.0.1:8000/storage/'+maDemande.doc_pdf" target="_blank" rel="noopener">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Voir le document PDF
                  </a>
                </div>
                <div class="dv-row"><span class="dv-lbl">Date</span><span class="dv-val">{{ maDemande.date_demande ? new Date(maDemande.date_demande).toLocaleDateString('fr-FR') : '—' }}</span></div>
              </div>
              <div class="page-footer-actions" v-if="maDemande.statut==='en_attente'">
                <button class="btn-primary" @click="navigate('modifier-demande')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Modifier la demande
                </button>
                <button class="btn-danger-outline" @click="navigate('annuler-demande')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  Annuler la demande
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="currentPage==='modifier-demande'" key="modifier-demande">
            <div class="page-header-back">
              <button class="back-btn" @click="navigate('consulter-demande')">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                Retour
              </button>
              <div><h2 class="spt">Modifier ma demande</h2><p class="sps">Modifiez votre demande avant qu'elle soit traitée</p></div>
            </div>
            <div class="form-card">
              <div class="field-block">
                <label class="fl">Sujet du PFE <span class="req">*</span></label>
                <input v-model="formDemande.sujet" class="fi" type="text" placeholder="Ex : Plateforme de gestion PFE"/>
                <p class="err" v-if="errs.sujet">{{ errs.sujet }}</p>
              </div>
              <div class="field-block">
                <label class="fl">Description <span class="req">*</span></label>
                <textarea v-model="formDemande.description" class="fi ft" rows="5" placeholder="Décrivez votre sujet..."/>
                <p class="err" v-if="errs.description">{{ errs.description }}</p>
              </div>
              <div class="field-block">
                <label class="fl">Encadrant souhaité <span class="req">*</span></label>
                <select v-model="formDemande.encadrant_id" class="fi">
                  <option value="">-- Sélectionner un encadrant --</option>
                  <option v-for="e in encadrants" :key="e.id" :value="e.id">{{ e.prenom }} {{ e.nom }}{{ e.domaine ? ' — '+e.domaine : '' }}</option>
                </select>
                <p class="err" v-if="errs.encadrant">{{ errs.encadrant }}</p>
              </div>
              <div class="field-block">
                <label class="fl">Nouveau document <span style="font-size:12px;color:#7A8FA6">(optionnel — remplace l'existant)</span></label>
                <div class="file-upload-zone" @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="handleDrop">
                  <input type="file" ref="fileInput" accept=".pdf,.doc,.docx" style="display:none" @change="handleFile"/>
                  <div v-if="!formDemande.fichier" class="file-upload-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8a9aaa" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <p>Cliquez ou glissez un PDF</p>
                  </div>
                  <div v-else class="file-selected">
                    <span>📄 {{ formDemande.fichier.name }}</span>
                    <button class="file-remove" @click.stop="formDemande.fichier=null">✕</button>
                  </div>
                </div>
              </div>
              <div class="form-footer">
                <button class="btn-outline" @click="navigate('consulter-demande')">Annuler</button>
                <button class="btn-primary" @click="modifierDemande" :disabled="submitting">
                  <span v-if="submitting" class="spinner"></span>
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="currentPage==='annuler-demande'" key="annuler-demande">
            <div class="page-header-back">
              <button class="back-btn" @click="navigate('consulter-demande')">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                Retour
              </button>
              <div><h2 class="spt">Annuler ma demande</h2><p class="sps">Cette action est irréversible</p></div>
            </div>
            <div class="annul-card">
              <div class="annul-icon">⚠️</div>
              <h3>Confirmer l'annulation</h3>
              <p>Vous êtes sur le point d'annuler votre demande d'encadrement pour :</p>
              <div class="annul-demande-info" v-if="maDemande">
                <strong>{{ maDemande.sujet || maDemande.titre }}</strong><br>
                <span>Encadrant : {{ maDemande.encadrant }}</span>
              </div>
              <p class="annul-warning">Une fois annulée, vous pourrez soumettre une nouvelle demande.</p>
              <div class="annul-actions">
                <button class="btn-outline" @click="navigate('consulter-demande')">
                  Non, garder ma demande
                </button>
                <button class="btn-danger" @click="annulerDemande" :disabled="submitting">
                  <span v-if="submitting" class="spinner"></span>
                  Oui, annuler la demande
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="currentPage==='encadrants'" key="encadrants">
            <div class="ph">
              <h2 class="spt">Encadrants disponibles</h2>
              <p class="sps">Recherchez et choisissez votre encadrant PFE</p>
            </div>

            <div v-if="!accordMutuelActif && !monAffectation" class="lock-card">
              <div class="lock-icon">🔒</div>
              <h3>Mode accord mutuel non activé</h3>
              <p>Le chef de département n'a pas encore activé le mode accord mutuel. Revenez plus tard.</p>
              <button class="btn-outline" @click="navigate('home')">← Retour</button>
            </div>
            <div v-else-if="maDemande && (maDemande.statut==='en_attente' || maDemande.statut==='acceptee')" class="lock-card">
              <div class="lock-icon">🔒</div>
              <h3>Liste non disponible</h3>
              <p v-if="maDemande.statut==='en_attente'">Vous avez déjà une demande <strong>en attente</strong>. Vous ne pouvez pas parcourir les encadrants tant qu'elle n'est pas traitée.</p>
              <p v-else>Votre demande a été <strong>acceptée</strong>. Vous avez déjà un encadrant.</p>
              <button class="btn-outline" @click="navigate('consulter-demande')">Voir ma demande</button>
            </div>
            <template v-else>
            <div class="search-bar-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a9aaa" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="searchEnc" class="search-input" placeholder="Rechercher par nom, domaine..." />
              <button v-if="searchEnc" @click="searchEnc=''" class="search-clear">✕</button>
            </div>
            <div v-if="ficheEncadrant" class="fiche-overlay" @click.self="ficheEncadrant=null">
              <div class="fiche-modal">
                <button class="fiche-close" @click="ficheEncadrant=null">✕</button>
                <div class="fiche-av-lg">{{ initiales(ficheEncadrant.prenom+' '+ficheEncadrant.nom) }}</div>
                <h3 class="fiche-nom">{{ ficheEncadrant.prenom }} {{ ficheEncadrant.nom }}</h3>
                <div class="fiche-role">Encadrant</div>
                <div class="fiche-rows">
                  <div class="fiche-row"><span class="fiche-lbl">Domaine</span><span>{{ ficheEncadrant.domaine || '—' }}</span></div>
                  <div class="fiche-row"><span class="fiche-lbl">Spécialité</span><span>{{ ficheEncadrant.specialite || '—' }}</span></div>
                  <div class="fiche-row"><span class="fiche-lbl">Étudiants encadrés</span><span>{{ ficheEncadrant.nb_affectes || 0 }}</span></div>
                  <div class="fiche-row"><span class="fiche-lbl">Email</span><span>{{ ficheEncadrant.email || '—' }}</span></div>
                  <div class="fiche-row" v-if="ficheEncadrant.telephone"><span class="fiche-lbl">Téléphone</span><span>{{ ficheEncadrant.telephone }}</span></div>
                </div>
                <button class="btn-choisir" @click="choisirEncadrant(ficheEncadrant); ficheEncadrant=null" v-if="accordMutuelActif">
                  Choisir comme encadrant
                </button>
              </div>
            </div>
            <div v-if="encadrantsFiltres.length === 0" class="empty-enc">Aucun encadrant trouvé.</div>
            <div class="enc-grid" v-else>
              <div v-for="e in encadrantsFiltres" :key="e.id" class="enc-card" :class="{'enc-full':!e.disponible}">
                <div class="enc-header">
                  <div class="enc-av">{{ initiales(e.prenom+' '+e.nom) }}</div>
                  <div class="enc-info">
                    <div class="enc-nom">{{ e.prenom }} {{ e.nom }}</div>
                    <div class="enc-dept">{{ e.domaine || 'Encadrant' }}</div>
                  </div>
                <span class="dispo-badge" :class="e.disponible ? 'dispo-ok' : 'dispo-ko'">
                    {{ e.disponible ? 'Disponible' : 'Complet' }}
                </span>
                </div>
                <div class="enc-specs">
                  <span class="spec-tag" v-if="e.domaine">{{ e.domaine }}</span>
                </div>
                <div class="enc-cap">
                  <span class="cap-txt">{{ e.nb_affectes || 0 }} étudiant(s) encadré(s)</span>
                </div>
                <div class="enc-actions">
                  <button class="btn-fiche" @click="ficheEncadrant=e">Voir la fiche</button>
                  <button class="btn-choisir" @click="choisirEncadrant(e)" v-if="accordMutuelActif">Choisir</button>
                </div>
              </div>
            </div>
            </template>
          </div>

          <ConsulterProfil
            v-else-if="currentPage==='profil'"
            key="profil"
            @modifier="currentPage='profil-edit'"
          />
          <ModifierProfil
            v-else-if="currentPage==='profil-edit'"
            key="profil-edit"
            @annuler="currentPage='profil'"
            @sauvegarde="currentPage='profil'"
          />

          <LivrableEtudiant
            v-else-if="currentPage==='livrables'"
            key="livrables"
            @toast="afficherToast"
          />

          <!-- ✅ Student uses ReunionEtudiant (confirmation view) -->
          <ReunionEtudiant
            v-else-if="currentPage==='reunions'"
            key="reunions"
            @toast="afficherToast"
          />

          <div v-else-if="currentPage==='resultats'" key="resultats">
            <div class="ptb"><h2 class="spt">Mon résultat final</h2><p class="sps">Consultez votre note, mention et décision suite à la délibération</p></div>
            <div v-if="monResultat" class="resultat-card">
              <div class="rc-header">
                <div class="rc-icon">🏆</div>
                <div>
                  <div class="rc-titre">{{ monResultat.projet_titre }}</div>
                  <div class="rc-sub">Soutenance du {{ monResultat.date_soutenance || '—' }}</div>
                </div>
              </div>
              <div class="rc-notes">
                <div class="rc-note-item">
                  <span class="rn-label">Note jury</span>
                  <span class="rn-val">{{ monResultat.note_jury }}/20</span>
                </div>
                <div class="rc-note-item">
                  <span class="rn-label">Note encadrant</span>
                  <span class="rn-val">{{ monResultat.note_encadrant }}/20</span>
                </div>
                <div class="rc-note-item rc-note-finale">
                  <span class="rn-label">Note finale</span>
                  <span class="rn-val rn-val-finale">{{ monResultat.note_finale }}/20</span>
                </div>
              </div>
              <div class="rc-footer">
                <span class="mention-badge" :class="mentionClass(monResultat.note_finale)">{{ mention(monResultat.note_finale) }}</span>
                <span class="decision-badge" :class="monResultat.note_finale>=10 ? 'decision-ok' : 'decision-nok'">
                  {{ monResultat.note_finale>=10 ? '✓ Admis(e)' : '✗ Ajourné(e)' }}
                </span>
              </div>
            </div>
            <div v-else-if="loadingResultat" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
            <div v-else class="empty-state">
              <div class="empty-icon">⏳</div>
              <p>Les résultats n'ont pas encore été publiés.<br><span style="font-size:12.5px">Vous serez notifié(e) dès que le chef de département publie les résultats.</span></p>
            </div>
          </div>

        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'
import ConsulterProfil from './ConsulterProfil.vue'
import ModifierProfil from './ModifierProfil.vue'
import LivrableEtudiant from './Livrablesetudiant.vue'
import ReunionEtudiant from './Reunionetudiant.vue'

export default {
  name: 'DashboardEtudiant',

  components: {
    ConsulterProfil,
    ModifierProfil,
    LivrableEtudiant,
    ReunionEtudiant
  },

  async mounted() {
    await this.chargerDonnees()
    await this.chargerResultat()
    await this.chargerPhaseActive()
  },

  data() {
    return {
      sidebarCollapsed: false,
      currentPage: 'home',

      toast: {
        visible: false,
        type: 'toast-ok',
        message: ''
      },

      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),

      maDemande: null,
      editMode: false,
      submitting: false,

      formDemande: {
        sujet: '',
        description: '',
        encadrant_id: null,
        fichier: null
      },

      errs: {},
      encadrants: [],
      accordMutuelActif: false,
      monAffectation: null,
      loadingDonnees: true,

      searchEnc: '',
      ficheEncadrant: null,

      monResultat: null,
      loadingResultat: false,
      phaseEnCours: null,
    }
  },

  computed: {
    joursRestants() {
      if (!this.phaseEnCours?.date_fin) return null
      const fin = new Date(this.phaseEnCours.date_fin)
      fin.setHours(23, 59, 59, 999)
      return Math.ceil((fin - new Date()) / (1000 * 60 * 60 * 24))
    },

    encadrantsFiltres() {
      if (!this.searchEnc) return this.encadrants

      const q = this.searchEnc.toLowerCase()

      return this.encadrants.filter(e =>
        (`${e.nom} ${e.prenom}`.toLowerCase().includes(q)) ||
        (e.domaine || '').toLowerCase().includes(q) ||
        (e.specialite || '').toLowerCase().includes(q)
      )
    },

    breadcrumb() {
      const map = {
        'ma-demande': 'Ma demande',
        'consulter-demande': 'Consulter ma demande',
        'modifier-demande': 'Modifier ma demande',
        'annuler-demande': 'Annuler ma demande',
        encadrants: 'Encadrants disponibles',
        livrables: 'Mes livrables',
        reunions: 'Réunions',
        resultats: 'Mon résultat final',
        profil: 'Mon profil',
        'profil-edit': 'Modifier le profil',
      }

      return map[this.currentPage] || ''
    },

    dateNow() {
      return new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }
  },

  methods: {
      initiales(fullname) {
    if (!fullname) return ''
    const parts = fullname.split(' ')
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
  },
    navigate(page) {
      this.currentPage = page

      if (page === 'modifier-demande' && this.maDemande) {
        this.formDemande = {
          sujet: this.maDemande.sujet || this.maDemande.titre || '',
          description: this.maDemande.description || '',
          encadrant_id: this.maDemande.encadrant_id || null,
          fichier: null
        }
        this.errs = {}
      }
    },

    afficherToast({ message, type }) {
      this.toast = { visible: true, type, message }

      setTimeout(() => {
        this.toast.visible = false
      }, 3000)
    },

    async chargerPhaseActive() {
      try {
        // /api/phases returns only active phases for non-chef users
        const res = await api.get('/phases')
        const phases = res.data || []
        // Find the active (not yet terminated) phase
        this.phaseEnCours = phases.find(p => p.active && !p.terminee) || null
      } catch {
        this.phaseEnCours = null
      }
    },

    async chargerResultat() {
      this.loadingResultat = true

      try {
        const res = await api.get('/resultats')
        const resultats = Array.isArray(res.data) ? res.data : []

        this.monResultat = resultats.find(r =>
          r.etudiant_id === this.currentUser?.id
        ) || null

      } catch (error) {
        console.error('Erreur résultat:', error)
        this.monResultat = null
      } finally {
        this.loadingResultat = false
      }
    },

    async chargerDonnees() {
      this.loadingDonnees = true
      try {
        const [demRes, encRes, modeRes, affRes] = await Promise.all([
          api.get('/demandes-encadrement'),
          api.get('/affectations/encadrants-disponibles'),
          api.get('/affectations/mode'),
          api.get('/affectations/mon-affectation').catch(() => ({ data: null })),
        ])

        // API returns a single object (not array) for students
        const demData = demRes.data
        if (!demData) {
          this.maDemande = null
        } else if (Array.isArray(demData)) {
          this.maDemande = demData[0] || null
        } else if (typeof demData === 'object' && demData.id) {
          this.maDemande = demData
        } else {
          this.maDemande = null
        }

        this.encadrants = encRes.data || []

        // mode === 'manuel' means accord-mutuel is active for this promo
        const mode = modeRes.data?.mode
        this.accordMutuelActif = mode === 'manuel'

        const affData = affRes.data
        if (Array.isArray(affData)) {
          this.monAffectation = affData.find(a => a.statut === 'diffusee') || null
        } else if (affData && affData.id) {
          this.monAffectation = affData
        } else {
          this.monAffectation = null
        }

      } catch (error) {
        console.error('Erreur chargement:', error)
        this.accordMutuelActif = false
      } finally {
        this.loadingDonnees = false
      }
    },

    async soumettreDemande() {
      this.errs = {}

      if (!this.formDemande.sujet)
        this.errs.sujet = 'Le sujet est obligatoire'

      if (!this.formDemande.description)
        this.errs.description = 'La description est obligatoire'

      if (!this.formDemande.encadrant_id)
        this.errs.encadrant = 'Choisissez un encadrant'

      if (Object.keys(this.errs).length) return

      this.submitting = true

      try {
        const fd = new FormData()
        fd.append('sujet', this.formDemande.sujet)
        fd.append('description', this.formDemande.description)
        fd.append('encadrant_id', String(this.formDemande.encadrant_id))

        if (this.formDemande.fichier instanceof File) {
          fd.append('doc_pdf', this.formDemande.fichier, this.formDemande.fichier.name)
        }

        // Let browser set multipart/form-data with correct boundary
        const res = await api.post('/demandes-encadrement', fd, {
          headers: { 'Content-Type': undefined }
        })

        this.maDemande = res.data.demande || res.data

        this.formDemande = {
          sujet: '',
          description: '',
          encadrant_id: null,
          fichier: null
        }

        this.afficherToast({
          message: 'Demande soumise avec succès !',
          type: 'toast-ok'
        })

        this.navigate('home')

      } catch (error) {
        this.afficherToast({
          message: error.response?.data?.message || 'Erreur lors de la soumission.',
          type: 'toast-err'
        })
      } finally {
        this.submitting = false
      }
    },

    // ── Encadrant selection from the list ──────────────────────────
    choisirEncadrant(enc) {
      this.formDemande.encadrant_id = enc.id
      const nom = enc.nom_complet || ((enc.prenom || '') + ' ' + (enc.nom || '')).trim()
      this.afficherToast({ message: nom + ' sélectionné(e).', type: 'toast-ok' })
      this.navigate('ma-demande')
      this.editMode = false
    },

    // ── File upload handlers ────────────────────────────────────
    handleFile(event) {
      const file = event.target.files[0]
      if (file) this.formDemande.fichier = file
    },

    handleDrop(event) {
      const file = event.dataTransfer.files[0]
      if (file) this.formDemande.fichier = file
    },

    // ── Status helpers ──────────────────────────────────────────
    statutIcon(statut) {
      const icons = { en_attente: '⏳', acceptee: '✅', rejetee: '❌' }
      return icons[statut] || '📄'
    },

    labelStatut(statut) {
      const labels = { en_attente: 'En attente', acceptee: 'Acceptée', rejetee: 'Rejetée' }
      return labels[statut] || statut
    },

    // ── Result helpers ──────────────────────────────────────────
    mention(note) {
      if (note >= 16) return 'Très bien'
      if (note >= 14) return 'Bien'
      if (note >= 12) return 'Assez bien'
      if (note >= 10) return 'Passable'
      return 'Insuffisant'
    },

    mentionClass(note) {
      if (note >= 16) return 'mention-tb'
      if (note >= 14) return 'mention-b'
      if (note >= 12) return 'mention-ab'
      if (note >= 10) return 'mention-p'
      return 'mention-ins'
    },

    // ── Auth ────────────────────────────────────────────────────
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    },

    // ── Modify existing request ─────────────────────────────────
    async modifierDemande() {
      this.errs = {}
      if (!this.formDemande.sujet)        this.errs.sujet       = 'Le sujet est obligatoire'
      if (!this.formDemande.description)  this.errs.description = 'La description est obligatoire'
      if (!this.formDemande.encadrant_id) this.errs.encadrant   = 'Choisissez un encadrant'
      if (Object.keys(this.errs).length) return

      this.submitting = true
      try {
        const fd = new FormData()
        fd.append('sujet',        this.formDemande.sujet)
        fd.append('description',  this.formDemande.description)
        fd.append('encadrant_id', String(this.formDemande.encadrant_id))
        if (this.formDemande.fichier instanceof File) fd.append('doc_pdf', this.formDemande.fichier, this.formDemande.fichier.name)

        // Laravel method spoofing via form field (works with multipart)
        fd.append('_method', 'PUT')
        const res = await api.post(
          '/demandes-encadrement/' + this.maDemande.id,
          fd,
          { headers: { 'Content-Type': undefined } }
        )
        this.maDemande = res.data.demande || res.data
        this.editMode  = false
        this.afficherToast({ message: 'Demande mise à jour !', type: 'toast-ok' })
        this.navigate('ma-demande')
      } catch (error) {
        this.afficherToast({
          message: (error.response && error.response.data && error.response.data.message)
            || 'Erreur lors de la modification.',
          type: 'toast-err'
        })
      } finally {
        this.submitting = false
      }
    },

    // ── Cancel request ──────────────────────────────────────────
    async annulerDemande() {
      this.submitting = true
      try {
        await api.delete('/demandes-encadrement/' + this.maDemande.id)
        this.maDemande = null
        this.editMode  = false
        this.formDemande = { sujet: '', description: '', encadrant_id: null, fichier: null }
        this.afficherToast({ message: 'Demande annulée.', type: 'toast-ok' })
        this.navigate('home')
      } catch (error) {
        this.afficherToast({
          message: (error.response && error.response.data && error.response.data.message)
            || "Impossible d'annuler.",
          type: 'toast-err'
        })
      } finally {
        this.submitting = false
      }
    },
  }
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
.nav-cat{font-size:10px;font-weight:700;color:rgba(245,166,35,0.75);text-transform:uppercase;letter-spacing:.12em;padding:12px 12px 4px}
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
.ptb{margin-bottom:24px}.pt{font-family:'Merriweather',serif;font-size:24px;font-weight:700;color:#1e2a35;margin-bottom:5px}.ps{font-size:14px;color:#7A8FA6}
.ph{margin-bottom:22px}.spt{font-family:'Merriweather',serif;font-size:20px;font-weight:700;color:#1e2a35;margin-bottom:4px}.sps{font-size:13.5px;color:#7A8FA6}
.statut-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;padding:20px;margin-bottom:24px}
.statut-banner{display:flex;align-items:center;gap:14px;border-radius:14px;padding:18px 22px;margin-bottom:16px}
.sb-en_attente{background:#fff8e8;border:1.5px solid #f5a623}
.sb-acceptee{background:#d4edda;border:1.5px solid rgba(39,174,96,0.4)}
.sb-rejetee{background:#f8d7da;border:1.5px solid rgba(231,76,60,0.4)}
.sb-icon{font-size:26px;flex-shrink:0}
.sb-body{flex:1}.sb-t{font-size:15px;font-weight:700;color:#1e2a35}.sb-s{font-size:13px;color:#4a5a6a;margin-top:2px}
.motif-rejet{background:#f8d7da;border:1px solid rgba(231,76,60,0.3);border-radius:10px;padding:12px 16px;font-size:13.5px;color:#922b21;margin-bottom:16px}
.dv-card{background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:14px;overflow:hidden;margin-bottom:16px}
.dv-row{display:flex;align-items:flex-start;gap:16px;padding:13px 18px;border-bottom:1px solid #c8c4bc;font-size:13.5px}.dv-row:last-child{border-bottom:none}
.dv-lbl{width:110px;color:#8a9aaa;font-weight:600;font-size:13px;flex-shrink:0}.dv-val{color:#1e2a35;line-height:1.5}
.file-upload-zone{border:2px dashed #c8c4bc;border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:border-color .18s;background:#243347}.file-upload-zone:hover{border-color:#F5C518}
.file-upload-placeholder p{font-size:14px;color:#4a5a6a;margin:8px 0 4px}.file-upload-placeholder span{font-size:12px;color:#7A8FA6}
.file-selected{display:flex;align-items:center;justify-content:space-between;padding:4px 0}.file-selected span{font-size:14px;color:#1e2a35}
.file-remove{background:none;border:none;color:#e74c3c;cursor:pointer;font-size:16px;padding:0 6px}.file-remove:hover{color:#c0392b}
.lock-card{text-align:center;padding:60px 32px;background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:16px}
.lock-icon{font-size:48px;margin-bottom:16px}.lock-card h3{font-family:'Merriweather',serif;font-size:18px;color:#1e2a35;margin-bottom:8px}.lock-card p{font-size:14px;color:#8a9aaa;margin-bottom:24px}
.statut-card-rich{display:flex;align-items:center;gap:16px;background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:16px;padding:18px 20px;margin-bottom:20px;box-shadow:0 2px 10px rgba(0,0,0,0.05)}
.scr-left{display:flex;align-items:center;gap:14px;flex:1;min-width:0}
.scr-ico{font-size:32px;flex-shrink:0;width:46px;height:46px;display:flex;align-items:center;justify-content:center;border-radius:12px}
.scr-ico-en_attente{background:rgba(245,166,35,0.15)}.scr-ico-acceptee{background:rgba(39,174,96,0.12)}.scr-ico-rejetee{background:rgba(231,76,60,0.1)}
.scr-info{flex:1;min-width:0}
.scr-titre{font-size:14px;font-weight:700;color:#1e2a35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px}
.scr-sub{font-size:12.5px;color:#8a9aaa;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.scr-badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:700}
.scr-badge-en_attente{background:rgba(245,197,24,0.15);color:#b07d0a}
.scr-badge-acceptee{background:#d4edda;color:#1e7e34}
.scr-badge-rejetee{background:#f8d7da;color:#922b21}
.scr-actions{display:flex;gap:8px;flex-shrink:0}
.scr-btn{width:38px;height:38px;border:none;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .18s}
.scr-btn-view{background:rgba(245,197,24,0.1);color:#F5C518}.scr-btn-view:hover{background:rgba(245,197,24,0.2);color:#fff}
.scr-btn-edit{background:rgba(245,166,35,0.12);color:#d98e1a}.scr-btn-edit:hover{background:#f5a623;color:#fff}
.scr-btn-del{background:rgba(231,76,60,0.1);color:#e74c3c}.scr-btn-del:hover{background:#e74c3c;color:#fff}
.page-header-back{display:flex;align-items:flex-start;gap:16px;margin-bottom:24px}
.back-btn{display:flex;align-items:center;gap:7px;padding:9px 16px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:9px;font-size:13px;color:#4a5a6a;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .18s;white-space:nowrap;flex-shrink:0}.back-btn:hover{border-color:#3d6080;color:#F5C518}
.page-footer-actions{display:flex;gap:12px;margin-top:20px;flex-wrap:wrap}
.btn-danger-outline{display:flex;align-items:center;gap:7px;padding:10px 20px;background:transparent;border:1.5px solid #e74c3c;border-radius:9px;font-size:13.5px;font-weight:600;color:#e74c3c;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .18s}.btn-danger-outline:hover{background:#e74c3c;color:#fff}
.annul-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:16px;padding:40px;text-align:center;max-width:520px}
.annul-icon{font-size:48px;margin-bottom:16px}
.annul-card h3{font-family:'Merriweather',serif;font-size:18px;color:#1e2a35;margin-bottom:10px}
.annul-card p{font-size:14px;color:#4a5a6a;margin-bottom:12px}
.annul-demande-info{background:#e8e4dc;border-radius:10px;padding:14px 18px;margin:12px 0;text-align:left;font-size:13.5px;color:#1e2a35;line-height:1.6}
.annul-demande-info span{color:#8a9aaa;font-size:13px}
.annul-warning{font-size:13px;color:#8a9aaa;font-style:italic;margin-top:8px}
.annul-actions{display:flex;gap:12px;justify-content:center;margin-top:24px;flex-wrap:wrap}
.btn-danger{display:flex;align-items:center;gap:7px;padding:10px 20px;background:#e74c3c;color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:background .18s}.btn-danger:hover:not(:disabled){background:#c0392b}.btn-danger:disabled{opacity:.6;cursor:not-allowed}
.btn-danger-sm{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;background:#e74c3c;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:background .18s}.btn-danger-sm:hover:not(:disabled){background:#c0392b}.btn-danger-sm:disabled{opacity:.6;cursor:not-allowed}
.dv-footer{display:flex;gap:10px;padding:16px 18px;border-top:1.5px solid #c8c4bc;background:#e8e4dc}
.file-link{display:inline-flex;align-items:center;gap:6px;color:#F5C518;font-weight:600;font-size:13.5px;text-decoration:none;padding:6px 12px;background:rgba(245,197,24,0.08);border-radius:8px;transition:background .18s}.file-link:hover{background:rgba(245,197,24,0.16)}
.banner-affectation{display:flex;align-items:center;gap:14px;background:#d4edda;border:1.5px solid rgba(39,174,96,0.4);border-radius:14px;padding:18px 22px;margin-bottom:20px}
.ba-icon{font-size:28px;flex-shrink:0}
.ba-body{flex:1}.ba-t{font-size:15px;font-weight:700;color:#1e7e34;margin-bottom:3px}.ba-s{font-size:13.5px;color:#2d6a4f}
.ba-badge{padding:5px 14px;background:#27ae60;color:#fff;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap}
.banner-accord-mutuel{display:flex;align-items:center;gap:14px;background:rgba(61,96,128,0.08);border:1.5px solid rgba(61,96,128,0.25);border-radius:14px;padding:16px 20px;margin-bottom:20px;flex-wrap:wrap}
.bam-icon{font-size:28px;flex-shrink:0}.bam-body{flex:1;min-width:200px}.bam-t{font-size:14px;font-weight:700;color:#1e2a35;margin-bottom:3px}.bam-s{font-size:13px;color:#4a5a6a;line-height:1.5}
.bam-btn{padding:10px 18px;background:rgba(245,197,24,0.2);color:#fff;border:none;border-radius:10px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;white-space:nowrap;transition:all .18s;flex-shrink:0}.bam-btn:hover{background:#2f4f6a}
.banner-info{display:flex;align-items:flex-start;gap:12px;background:#fff8e8;border:1.5px solid #bee3f8;border-radius:14px;padding:16px 20px;margin-bottom:20px;font-size:13.5px;color:#2b6cb0}
.qa-card-result{cursor:default!important;border-color:rgba(39,174,96,0.4)!important;background:rgba(39,174,96,0.08)!important}
.qa-green{background:rgba(39,174,96,0.12);color:#27ae60}
.qa-teal{background:rgba(39,174,96,0.12);color:#27ae60}
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px}
.kpi-card{background:#ddd9d1;border-radius:14px;padding:22px 20px;display:flex;align-items:center;gap:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border:1.5px solid #c8c4bc}
.kpi-icon{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.kpi-blue .kpi-icon{background:rgba(245,197,24,0.12);color:#F5C518}.kpi-gold .kpi-icon{background:rgba(245,166,35,0.12);color:#d98e1a}.kpi-green .kpi-icon{background:rgba(39,174,96,0.12);color:#27ae60}.kpi-slate .kpi-icon{background:rgba(74,90,106,0.1);color:#A8BDD4}
.kpi-v{font-family:'Merriweather',serif;font-size:22px;font-weight:700;color:#1e2a35;line-height:1}.kpi-l{font-size:12px;color:#8a9aaa;margin-top:4px}
.sec-title{font-size:12px;font-weight:700;color:#8a9aaa;text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px}
.qa-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.qa-card{display:flex;align-items:center;gap:14px;background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;padding:18px 20px;cursor:pointer;text-align:left;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
.qa-card:hover{border-color:#3d6080;box-shadow:0 4px 18px rgba(61,96,128,0.12);transform:translateY(-2px)}
.qa-icon{width:44px;height:44px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.qa-blue{background:rgba(245,197,24,0.12);color:#F5C518}.qa-gold{background:rgba(245,166,35,0.12);color:#d98e1a}
.qa-txt{flex:1}.qa-t{font-size:14px;font-weight:600;color:#1e2a35;margin-bottom:2px}.qa-s{font-size:12.5px;color:#7A8FA6}
.qa-arr{color:#c8c4bc;flex-shrink:0;transition:transform .18s,color .18s}.qa-card:hover .qa-arr{transform:translateX(3px);color:#F5C518}
.demande-view{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;overflow:hidden}
.form-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;padding:28px}
.form-title{font-size:13px;font-weight:700;color:#F5C518;text-transform:uppercase;letter-spacing:.06em;margin-bottom:22px;padding-bottom:14px;border-bottom:1.5px solid #c8c4bc}
.field-block{margin-bottom:18px}.fl{display:block;font-size:13.5px;font-weight:600;color:#1e2a35;margin-bottom:6px}.req{color:#c0392b}
.fi{width:100%;padding:10px 13px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:9px;font-size:13.5px;color:#1e2a35;font-family:'Source Sans 3',sans-serif;transition:border-color .18s}
.fi:focus{outline:none;border-color:#3d6080;box-shadow:0 0 0 3px rgba(61,96,128,0.1)}.ft{resize:vertical;min-height:100px}
.err{color:#c0392b;font-size:12px;margin-top:5px}
.form-footer{display:flex;justify-content:flex-end;gap:10px;margin-top:24px;padding-top:20px;border-top:1.5px solid #c8c4bc}
.btn-primary{display:flex;align-items:center;gap:8px;padding:11px 22px;background:rgba(245,197,24,0.2);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .18s}.btn-primary:hover{background:#2f4f6a}.btn-primary:disabled{opacity:.6;cursor:not-allowed}
.btn-outline{padding:11px 18px;background:transparent;border:1.5px solid #c8c4bc;border-radius:10px;font-size:13.5px;color:#4a5a6a;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .18s}.btn-outline:hover{border-color:#3d6080;color:#F5C518}
.spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}
.enc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.enc-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;padding:20px;transition:all .2s}
.enc-card:hover{box-shadow:0 4px 18px rgba(0,0,0,0.08);transform:translateY(-2px)}
.enc-full{opacity:.7}
.enc-header{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.enc-av{width:42px;height:42px;border-radius:11px;background:rgba(245,197,24,0.2);color:#fff;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.enc-info{flex:1}.enc-nom{font-size:14px;font-weight:700;color:#1e2a35}.enc-dept{font-size:12px;color:#8a9aaa;margin-top:2px}
.dispo-badge{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;flex-shrink:0}
.dispo-ok{background:#d4edda;color:#1e7e34}.dispo-no{background:#f8d7da;color:#a71d2a}
.enc-specs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
.spec-tag{padding:3px 10px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:20px;font-size:11.5px;font-weight:600;color:#A8BDD4}
.enc-cap{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.cap-txt{font-size:12px;color:#8a9aaa;white-space:nowrap}
.enc-actions{display:flex;gap:8px;margin-top:4px}
.btn-fiche{flex:1;padding:9px;background:transparent;border:1.5px solid #3d6080;color:#F5C518;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;transition:all .18s}.btn-fiche:hover{background:rgba(245,197,24,0.2);color:#fff}
.btn-choisir{flex:1;padding:10px;background:rgba(245,197,24,0.2);color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .18s}.btn-choisir:hover:not(:disabled){background:#2f4f6a}.btn-choisir:disabled{background:#f0ede8;color:#8a9aaa;cursor:not-allowed}
.search-bar-wrap{display:flex;align-items:center;gap:10px;background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:10px;padding:10px 14px;margin-bottom:20px}
.search-input{flex:1;border:none;background:transparent;font-size:14px;color:#1e2a35;font-family:'Source Sans 3',sans-serif;outline:none}
.search-clear{background:none;border:none;color:#8a9aaa;cursor:pointer;font-size:16px;padding:0 4px}.search-clear:hover{color:#1e2a35}
.empty-enc{text-align:center;padding:40px;color:#8a9aaa;font-size:14px}
.fiche-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px}
.fiche-modal{background:#ddd9d1;border-radius:18px;padding:32px;max-width:420px;width:100%;position:relative;text-align:center}
.fiche-close{position:absolute;top:16px;right:16px;background:none;border:none;font-size:18px;cursor:pointer;color:#7A8FA6}.fiche-close:hover{color:#1e2a35}
.fiche-av-lg{width:72px;height:72px;border-radius:18px;background:#f5a623;color:#fff;font-weight:700;font-size:24px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px}
.fiche-nom{font-family:'Merriweather',serif;font-size:18px;color:#1e2a35;margin-bottom:4px}
.fiche-role{font-size:13px;color:#8a9aaa;margin-bottom:20px}
.fiche-rows{text-align:left;margin-bottom:20px}
.fiche-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #c8c4bc;font-size:13.5px;color:#1e2a35}
.fiche-lbl{color:#8a9aaa;font-weight:600}
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:600;white-space:nowrap}
.badge-orange{background:#fff8e8;color:#d98e1a}.badge-green{background:#d4edda;color:#1e7e34}.badge-red{background:#f8d7da;color:#a71d2a}.badge-gray{background:rgba(74,90,106,0.1);color:#A8BDD4}
.page-fade-enter-active{transition:opacity .25s,transform .25s cubic-bezier(.22,1,.36,1)}.page-fade-leave-active{transition:opacity .15s}
.page-fade-enter-from{opacity:0;transform:translateY(8px)}.page-fade-leave-to{opacity:0}
.resultat-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:16px;padding:30px;max-width:600px}
.rc-header{display:flex;align-items:center;gap:18px;margin-bottom:28px}
.rc-icon{font-size:40px;line-height:1}
.rc-titre{font-family:'Merriweather',serif;font-size:18px;font-weight:700;color:#1e2a35;margin-bottom:5px}
.rc-sub{font-size:13px;color:#7A8FA6}
.rc-notes{display:flex;flex-direction:column;gap:12px;margin-bottom:24px}
.rc-note-item{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:#e8e4dc;border-radius:10px}
.rc-note-finale{background:rgba(245,197,24,0.2)}
.rn-label{font-size:14px;font-weight:600;color:#A8BDD4}
.rc-note-finale .rn-label{color:rgba(255,255,255,0.8)}
.rn-val{font-family:'Merriweather',serif;font-size:22px;font-weight:700;color:#1e2a35}
.rn-val-finale{color:#fff;font-size:28px}
.rc-footer{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.mention-badge{padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700}
.mention-tb{background:#d4edda;color:#155724}.mention-b{background:#cce5ff;color:#004085}
.mention-ab{background:#d1ecf1;color:#0c5460}.mention-p{background:#fff3cd;color:#856404}
.mention-ins{background:#f8d7da;color:#721c24}
.decision-badge{padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700}
.decision-ok{background:#d4edda;color:#155724}.decision-nok{background:#f8d7da;color:#721c24}
.loading-state{text-align:center;padding:60px;color:#7A8FA6}
@media(max-width:1100px){.enc-grid{grid-template-columns:1fr 1fr}}
@media(max-width:768px){.content-area{padding:20px}.topbar{padding:0 16px}.kpi-grid{grid-template-columns:1fr 1fr}.qa-grid{grid-template-columns:1fr}.enc-grid{grid-template-columns:1fr}}
.banner-phase-countdown{display:flex;align-items:flex-start;gap:14px;border-radius:14px;padding:16px 20px;margin-bottom:16px;border:1.5px solid}
.bpc-normal{background:#e8f4fd;border-color:rgba(61,96,128,0.3)}
.bpc-warning{background:#fff8e8;border-color:rgba(245,166,35,0.5)}
.bpc-urgent{background:#fdf0f0;border-color:rgba(231,76,60,0.5);animation:pulse-bpc 2s ease-in-out infinite}
@keyframes pulse-bpc{0%,100%{border-color:rgba(231,76,60,0.4)}50%{border-color:rgba(231,76,60,0.9)}}
.bpc-icon{font-size:22px;flex-shrink:0;margin-top:1px}
.bpc-body{flex:1}
.bpc-t{font-size:14px;font-weight:600;color:#1e2a35;margin-bottom:3px}
.bpc-s{font-size:13px;color:#4a5a6a;line-height:1.5}
.bpc-expired{color:#c0392b;font-weight:600}
</style>