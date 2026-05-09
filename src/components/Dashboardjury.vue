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
        <button class="nav-item" :class="{active:currentPage==='home'}" @click="navigate('home')" :title="sidebarCollapsed?'Accueil':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Tableau de bord</span>
        </button>

        <div class="nav-cat" v-if="!sidebarCollapsed">Mes soutenances</div>

        <button class="nav-item" :class="{active:currentPage==='mes-projets'}" @click="navigate('mes-projets')" :title="sidebarCollapsed?'Mes projets':''">
          <span class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span v-if="sidebarCollapsed && projetsNonEvalues>0" class="badge-dot"></span>
          </span>
          <span class="nav-label" v-if="!sidebarCollapsed">
            Projets à évaluer
            <span v-if="projetsNonEvalues>0" class="badge-cnt">{{ projetsNonEvalues }}</span>
          </span>
        </button>

        <button class="nav-item" :class="{active:currentPage==='mes-evaluations'}" @click="navigate('mes-evaluations')" :title="sidebarCollapsed?'Mes évaluations':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Mes évaluations</span>
        </button>

        <button class="nav-item" :class="{active:currentPage==='calendrier'}" @click="navigate('calendrier')" :title="sidebarCollapsed?'Calendrier':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Calendrier</span>
        </button>

        <!-- ✅ Suivi des étudiants (fonctionnalité encadrant accessible après affectation jury) -->
        <div class="nav-cat" v-if="!sidebarCollapsed">Suivi académique</div>

        <button class="nav-item" :class="{active:currentPage==='suivi'}" @click="navigate('suivi')" :title="sidebarCollapsed?'Suivi étudiants':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Suivi des étudiants</span>
        </button>

        <button class="nav-item" :class="{active:currentPage==='reunions'}" @click="navigate('reunions')" :title="sidebarCollapsed?'Réunions':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Réunions</span>
        </button>

        <div class="nav-cat" v-if="!sidebarCollapsed">Planification</div>

        <button class="nav-item" :class="{active:currentPage==='proposer-plan'}" @click="navigate('proposer-plan')" :title="sidebarCollapsed?'Proposer un plan':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Proposer un plan</span>
        </button>
      </nav>

        <div class="nav-cat" v-if="!sidebarCollapsed">Communication</div>
        <button class="nav-item" :class="{active:currentPage==='messagerie'}" @click="navigate('messagerie')" :title="sidebarCollapsed?'Messagerie':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Messagerie</span>
        </button>
      <div class="sb-user" v-if="!sidebarCollapsed">
        <div class="u-av">{{ initiales(currentUser.prenom+' '+currentUser.nom) }}</div>
        <div class="u-info">
          <div class="u-name">{{ currentUser.prenom }} {{ currentUser.nom }}</div>
          <div class="u-role">Membre de jury</div>
        </div>
        <button class="logout-btn" @click="logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
      <div class="sb-user-col" v-else>
        <div class="u-av-sm">{{ initiales(currentUser.prenom+' '+currentUser.nom) }}</div>
      </div>
    </aside>

    <!-- MAIN -->
    <div class="main-wrap">
      <header class="topbar">
        <div class="breadcrumb">
          <span class="bc-root">Espace Jury</span>
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
          <div v-if="currentPage==='home'" key="home">
            <div class="ptb">
              <h1 class="pt">Bonjour, {{ currentUser.prenom }} 👋</h1>
              <p class="ps">Consultez vos projets à évaluer et soumettez vos fiches d'évaluation.</p>
            </div>

            <div v-if="projetsNonEvalues>0" class="alert-gold">
              <span class="al-icon">📋</span>
              <div class="al-body">
                <div class="al-t">{{ projetsNonEvalues }} projet(s) en attente d'évaluation</div>
                <div class="al-s">La délibération ne peut avoir lieu qu'après toutes les évaluations.</div>
              </div>
              <button class="btn-alert" @click="navigate('mes-projets')">Évaluer maintenant →</button>
            </div>

            <div class="kpi-grid">
              <div class="kpi-card kpi-blue">
                <div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div>
                <div><div class="kpi-v">{{ mesProjets.length }}</div><div class="kpi-l">Projets assignés</div></div>
              </div>
              <div class="kpi-card kpi-gold">
                <div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg></div>
                <div><div class="kpi-v">{{ projetsNonEvalues }}</div><div class="kpi-l">À évaluer</div></div>
              </div>
              <div class="kpi-card kpi-green">
                <div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
                <div><div class="kpi-v">{{ mesEvaluations.length }}</div><div class="kpi-l">Évaluations soumises</div></div>
              </div>
              <div class="kpi-card kpi-slate">
                <div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                <div><div class="kpi-v">{{ mesSessions.length }}</div><div class="kpi-l">Sessions planifiées</div></div>
              </div>
            </div>

            <div class="sec-title">Actions rapides</div>
            <div class="qa-grid">
              <button class="qa-card" @click="navigate('mes-projets')">
                <div class="qa-icon qa-gold"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Évaluer un projet</div><div class="qa-s">Consulter le livrable et remplir la grille</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('suivi')">
                <div class="qa-icon qa-blue"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Suivi des étudiants</div><div class="qa-s">Consulter l'avancement des projets</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('calendrier')">
                <div class="qa-icon qa-teal"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Calendrier soutenances</div><div class="qa-s">Voir mes sessions planifiées</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>

          <!-- MES PROJETS -->
          <div v-else-if="currentPage==='mes-projets'" key="mes-projets">
            <div class="ptb"><h2 class="spt">Projets à évaluer</h2><p class="sps">Téléchargez les livrables et remplissez la grille d'évaluation</p></div>
            <div v-if="loadingProjets" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
            <div v-else-if="!mesProjets.length" class="empty-state"><div class="empty-icon">📄</div><p>Aucun projet ne vous a été assigné.</p></div>
            <div v-else class="projets-grid">
              <div v-for="p in mesProjets" :key="p.id" class="projet-card" :class="{'projet-evalue': p.evalue}">
                <div class="pc-header">
                  <div class="pc-titre">{{ p.titre }}</div>
                  <span class="pc-badge" :class="p.evalue ? 'badge-evalue' : 'badge-pending'">{{ p.evalue ? '✓ Évalué' : '⏳ En attente' }}</span>
                </div>
                <div class="pc-etudiant">👤 {{ p.etudiant_nom }} · {{ p.encadrant }}</div>
                <div class="pc-session" v-if="p.date_soutenance">📅 {{ p.date_soutenance }} · {{ p.salle }}</div>
                <div class="pc-actions">
                  <a v-if="p.livrable_url" :href="p.livrable_url" target="_blank" class="btn-download">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Télécharger le livrable
                  </a>
                  <span v-else class="no-livrable">Livrable non disponible</span>
                  <button class="btn-evaluer" @click="ouvrirEvaluation(p)">
                    {{ p.evalue ? '✏ Modifier l\'évaluation' : '📝 Évaluer' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- MES ÉVALUATIONS -->
          <div v-else-if="currentPage==='mes-evaluations'" key="mes-evaluations">
            <div class="ptb"><h2 class="spt">Mes évaluations soumises</h2><p class="sps">Consultez et modifiez vos évaluations avant la délibération</p></div>
            <div v-if="!mesEvaluations.length" class="empty-state"><div class="empty-icon">📋</div><p>Vous n'avez encore soumis aucune évaluation.</p></div>
            <div v-else>
              <div v-for="ev in mesEvaluations" :key="ev.id" class="eval-card">
                <div class="eval-header">
                  <div>
                    <div class="eval-titre">{{ ev.projet_titre }}</div>
                    <div class="eval-etudiant">{{ ev.etudiant_nom }}</div>
                  </div>
                  <div class="eval-meta">
                    <span class="eval-date">{{ ev.date }}</span>
                    <span class="badge-note">{{ ev.note_totale }}/20</span>
                    <button class="btn-modifier" @click="ouvrirModif(ev)">✏ Modifier</button>
                  </div>
                </div>
                <div class="eval-criteres">
                  <div v-for="c in (ev.criteres || [])" :key="c.id" class="critere-row">
                    <span class="critere-label">{{ c.nom }}</span>
                    <div class="critere-bar-wrap"><div class="critere-bar" :style="{width: (c.bareme ? c.note/c.bareme*100 : 0)+'%'}"></div></div>
                    <span class="critere-note">{{ c.note }}/{{ c.bareme }}</span>
                  </div>
                </div>
                <div v-if="ev.commentaire" class="eval-comment">💬 {{ ev.commentaire }}</div>
              </div>
            </div>
          </div>

          <!-- CALENDRIER -->
          <div v-else-if="currentPage==='calendrier'" key="calendrier">
            <div class="ptb"><h2 class="spt">Mon calendrier de soutenances</h2><p class="sps">Vos sessions de soutenance planifiées</p></div>
            <div v-if="loadingSessions" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
            <div v-else-if="!mesSessions.length" class="empty-state"><div class="empty-icon">📅</div><p>Aucune session de soutenance planifiée pour vous.</p></div>
            <div v-else class="sessions-list">
              <!-- ✅ FIX: uniquement les sessions non annulées -->
              <div v-for="s in sessionsActives" :key="s.id" class="session-card">
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
                  <span class="badge-session" :class="s.evalue ? 'badge-done' : 'badge-todo'">
                    {{ s.evalue ? '✓ Évalué' : '⏳ À évaluer' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- ✅ SUIVI ÉTUDIANTS (fonctionnalité encadrant) -->
          <div v-else-if="currentPage==='suivi'" key="suivi">
            <div class="ptb"><h2 class="spt">Suivi des étudiants</h2><p class="sps">Consultez l'avancement des projets assignés à votre jury</p></div>
            <div v-if="loadingSuivi" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
            <div v-else-if="!mesSuivis.length" class="empty-state"><div class="empty-icon">📊</div><p>Aucun étudiant assigné à votre jury pour le moment.</p></div>
            <div v-else class="suivi-grid">
              <div v-for="e in mesSuivis" :key="e.id" class="suivi-card">
                <div class="sc-top">
                  <div class="sc-av" :style="{background: e.color}">{{ initiales(e.nom) }}</div>
                  <div class="sc-info">
                    <div class="sc-nom">{{ e.nom }}</div>
                    <div class="sc-sujet">{{ e.sujet || '—' }}</div>
                  </div>
                  <div class="sc-pct-wrap">
                    <div class="sc-pct">{{ e.progress }}%</div>
                  </div>
                </div>
                <div class="sc-bar-wrap">
                  <div class="sc-bar-fill" :style="{width: e.progress+'%', background: e.color}"></div>
                </div>
                <div class="sc-phase-row">
                  <span class="sc-phase-lbl">Phase actuelle :</span>
                  <span class="sc-phase-val">{{ e.phaseActuelle || '—' }}</span>
                  <span class="sc-phase-badge" :class="e.phaseActive ? 'spb-active' : 'spb-wait'">
                    {{ e.phaseActive ? 'En cours' : 'En attente' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- ✅ RÉUNIONS (lecture seule pour jury) -->
          <div v-else-if="currentPage==='messagerie'" key="messagerie">
            <Messagerie />
          </div>

          <div v-else-if="currentPage==='reunions'" key="reunions">
            <div class="ptb"><h2 class="spt">Réunions</h2><p class="sps">Consultez les réunions liées aux projets de votre jury</p></div>
            <div v-if="loadingReunions" class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
            <div v-else-if="!mesReunions.length" class="empty-state"><div class="empty-icon">📆</div><p>Aucune réunion trouvée.</p></div>
            <div v-else class="reunions-list">
              <div v-for="r in mesReunions" :key="r.id" class="reunion-card">
                <div class="rc-date-block">
                  <div class="rc-jour">{{ formatJour(r.date_reunion) }}</div>
                  <div class="rc-mois">{{ formatMois(r.date_reunion) }}</div>
                </div>
                <div class="rc-details">
                  <div class="rc-titre">{{ r.etudiant_nom }}</div>
                  <div class="rc-info">🕐 {{ formatHeure(r.date_reunion) }} · {{ r.encadrant_nom }}</div>
                </div>
                <span class="rc-badge" :class="{
                  'badge-conf': r.statut==='confirmee',
                  'badge-plan': r.statut==='planifiee',
                  'badge-ann':  r.statut==='annulee'
                }">{{ {confirmee:'Confirmée', planifiee:'Planifiée', annulee:'Annulée'}[r.statut] || r.statut }}</span>
              </div>
            </div>
          </div>

          <!-- PROPOSER UN PLAN -->
          <div v-else-if="currentPage==='proposer-plan'" key="proposer-plan">
            <div class="ptb"><h2 class="spt">Proposer un plan de soutenances</h2><p class="sps">Soumettez une proposition au chef de département</p></div>
            <div class="plan-form">
              <div class="plan-form-title">Créneaux proposés</div>
              <div v-for="(slot, i) in planSlots" :key="i" class="plan-slot-row">
                <div class="form-group"><label>Date</label><input type="date" v-model="slot.date" /></div>
                <div class="form-group"><label>Heure</label><input type="time" v-model="slot.heure" /></div>
                <div class="form-group"><label>Salle</label><input type="text" v-model="slot.salle" placeholder="ex: A101" /></div>
                <div class="form-group">
                  <label>Projet</label>
                  <select v-model="slot.projet_id">
                    <option value="">— Sélectionner un projet —</option>
                    <option v-for="p in mesProjets" :key="p.id" :value="p.id">
                      {{ p.titre }} · {{ p.etudiant_nom }}
                    </option>
                  </select>
                </div>
                <button class="btn-del-slot" @click="planSlots.splice(i,1)" v-if="planSlots.length>1">×</button>
              </div>
              <button class="btn-add-slot" @click="ajouterSlot">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Ajouter un créneau
              </button>
              <div class="plan-form-actions">
                <button class="btn-gold" @click="soumettreplan" :disabled="savingPlan">
                  <span v-if="savingPlan" class="spin-sm"></span>
                  {{ savingPlan ? 'Envoi en cours...' : 'Soumettre le plan' }}
                </button>
              </div>
              <div v-if="mesPlans.length" class="mes-plans-section">
                <div class="plan-form-title" style="margin-top:28px">Mes plans précédemment soumis</div>
                <div v-for="plan in mesPlans" :key="plan.id" class="plan-history">
                  <span class="ph-date">{{ plan.date_proposition }}</span>
                  <span class="ph-status" :class="plan.statut==='validé' ? 'ph-ok' : plan.statut==='rejeté' ? 'ph-nok' : 'ph-wait'">{{ plan.statut }}</span>
                </div>
              </div>
            </div>
          </div>

        </transition>
      </div>
    </div>

    <!-- MODAL ÉVALUATION (avec vraie grille par catégorie) -->
    <transition name="modal-fade">
      <div v-if="showEvalModal" class="modal-overlay" @click.self="showEvalModal=false">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3>Évaluation — {{ evalProjet?.titre }}</h3>
            <button class="modal-close" @click="showEvalModal=false">×</button>
          </div>
          <div class="modal-body">
            <div class="eval-etudiant-info">
              👤 {{ evalProjet?.etudiant_nom }} · Encadrant : {{ evalProjet?.encadrant }}
            </div>

            <div v-if="loadingGrille" class="loading-state" style="padding:20px"><div class="spinner"></div></div>
            <div v-else>
              <!-- Grille par catégorie -->
              <div v-for="cat in evalCategories" :key="cat.id" class="eval-category">
                <div class="cat-header">
                  <span class="cat-nom">{{ cat.nom }}</span>
                  <span class="cat-bareme">/ {{ cat.bareme_max }} pts</span>
                </div>
                <div class="grille-criteres">
                  <div v-for="c in cat.criteres" :key="c.id" class="critere-eval-row">
                    <div class="ce-info">
                      <div class="ce-nom">{{ c.nom }}</div>
                      <div class="ce-desc">Barème : /{{ c.bareme_max }}</div>
                    </div>
                    <div class="ce-note-wrap">
                      <input type="number" :min="0" :max="c.bareme_max" :step="0.25" v-model.number="c.note"
                        class="note-input" :class="{'note-err': c.note > c.bareme_max || c.note < 0}" />
                      <span class="ce-max">/{{ c.bareme_max }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="eval-total">
              <span>Note totale estimée :</span>
              <span class="total-val">{{ noteTotale.toFixed(2) }}/20</span>
            </div>

            <div class="form-group">
              <label>Commentaire (facultatif)</label>
              <textarea v-model="evalCommentaire" rows="3" placeholder="Observations générales sur le projet..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showEvalModal=false">Annuler</button>
            <button class="btn-gold" @click="soumettreEvaluation" :disabled="savingEval">
              <span v-if="savingEval" class="spin-sm"></span>
              {{ savingEval ? 'Envoi...' : 'Soumettre l\'évaluation' }}
            </button>
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


export default {
  name: 'DashboardJury',
  components: { Messagerie, NotificationsDropdown },
  data() {
    return {
      sidebarCollapsed: false,
      currentPage: 'home',
      toast: { visible: false, type: 'toast-ok', message: '' },
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),

      loadingProjets: false,
      loadingSuivi: false,
      loadingReunions: false,
      loadingSessions: false,
      loadingGrille: false,

      mesProjets: [],
      mesEvaluations: [],
      mesSessions: [],
      mesPlans: [],
      mesSuivis: [],
      mesReunions: [],

      showEvalModal: false,
      evalProjet: null,
      evalCategories: [],   // ✅ grille par catégorie/critère
      evalCommentaire: '',
      savingEval: false,

      savingPlan: false,
      planSlots: [{ date: '', heure: '', salle: '', projet_id: '' }],
    }
  },

  computed: {
    projetsNonEvalues() { return this.mesProjets.filter(p => !p.evalue).length },

    // ✅ Note totale calculée depuis les catégories
    noteTotale() {
      let total = 0
      this.evalCategories.forEach(cat => {
        cat.criteres.forEach(c => { total += (c.note || 0) })
      })
      return total
    },

    // ✅ Sessions sans les annulées (si étudiant a décliné)
    sessionsActives() {
      return this.mesSessions.filter(s => s.statut !== 'annulee')
    },

    breadcrumb() {
      return {
        'mes-projets':     'Projets à évaluer',
        'mes-evaluations': 'Mes évaluations',
        'calendrier':      'Calendrier',
        'proposer-plan':   'Proposer un plan',
        'suivi':           'Suivi des étudiants',
        'reunions':        'Réunions',
        messagerie:    'Messagerie',
      }[this.currentPage] || ''
    },
    dateNow() {
      return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    },
    colors() {
      return ['#3d6080','#27ae60','#d35400','#8e44ad','#2980b9','#c0392b']
    },
  },

  async mounted() {
    await this.chargerDonnees()
  },

  methods: {
    navigate(p) { this.currentPage = p },

    async chargerDonnees() {
      this.loadingProjets = true
      try {
        // ✅ Utilise les vraies routes de l'API
        const [juryRes, sessRes, evalRes] = await Promise.allSettled([
          api.get('/jurys'),
          api.get('/soutenances'),
          api.get('/notes-jury'),
        ])

        // Construire mesProjets depuis les jurys où je suis membre
        const userId = this.currentUser.id
        const jurys = juryRes.status === 'fulfilled' ? juryRes.value.data : []
        this.mesProjets = jurys
          .filter(j => (j.membres || []).some(m => m.enseignant_id === userId || m.id === userId))
          .map(j => ({
            id: j.id,
            affectation_id: j.affectation_id,
            titre: j.projet_titre || 'Projet #' + j.id,
            etudiant_nom: j.etudiant_nom || '—',
            encadrant: j.encadrant_nom || '—',
            date_soutenance: null,
            salle: null,
            livrable_url: null,
            evalue: false,
          }))

        // Sessions
        const seances = sessRes.status === 'fulfilled' ? sessRes.value.data : []
        const affIds = this.mesProjets.map(p => p.affectation_id)
        this.mesSessions = seances
          .filter(s => {
            const jId = s.jury_id
            return this.mesProjets.some(p => p.id === jId)
          })
          .map(s => ({
            id: s.id,
            jury_id: s.jury_id,
            date: s.date || s.date_seance?.split('T')[0],
            heure_debut: s.heure_debut || s.date_seance?.split('T')[1]?.substring(0,5),
            heure_fin: s.heure_fin || '',
            salle: s.salle,
            projet: s.projet_titre || '—',
            etudiant: s.etudiant_nom || '—',
            statut: s.statut || 'planifiee',
            evalue: false,
          }))

        // Lier dates de soutenance aux projets
        this.mesSessions.forEach(s => {
          const p = this.mesProjets.find(pr => pr.id === s.jury_id)
          if (p) { p.date_soutenance = s.date; p.salle = s.salle }
        })

        // Évaluations soumises
        const evals = evalRes.status === 'fulfilled' ? evalRes.value.data : []
        this.mesEvaluations = evals
          .filter(e => e.membre_jury?.includes(this.currentUser.nom) || true)
          .map(e => ({
            id: e.id,
            projet_titre: e.projet_titre || '—',
            etudiant_nom: e.etudiant_nom || '—',
            date: e.date || new Date().toLocaleDateString('fr-FR'),
            note_totale: e.note_totale || 0,
            criteres: e.criteres || [],
            commentaire: e.commentaire,
          }))

        // Marquer projets évalués
        this.mesEvaluations.forEach(ev => {
          const p = this.mesProjets.find(pr => pr.titre === ev.projet_titre)
          if (p) p.evalue = true
        })

      } catch(e) {
        console.error('Erreur chargement:', e)
      } finally {
        this.loadingProjets = false
      }

      // Suivi, réunions et plans en parallèle
      this.chargerSuivi()
      this.chargerReunions()
      this.chargerMesPlans()
    },

    async chargerSuivi() {
      this.loadingSuivi = true
      try {
        // ✅ Jury voit le suivi des étudiants de ses projets (en lecture)
        const res = await api.get('/suivi/encadrant')
        this.mesSuivis = (res.data || []).map((e, i) => ({
          id: e.id,
          nom: e.nom,
          sujet: e.sujet,
          progress: e.progress || 0,
          phaseActuelle: e.phaseActuelle || '—',
          phaseActive: e.phaseActive || false,
          color: this.colors[i % this.colors.length],
        }))
      } catch(e) {
        this.mesSuivis = []
      } finally {
        this.loadingSuivi = false
      }
    },

    async chargerReunions() {
      this.loadingReunions = true
      try {
        const res = await api.get('/reunions')
        // ✅ Filtrer les réunions annulées (étudiant a décliné)
        this.mesReunions = (res.data || [])
          .filter(r => r.statut !== 'annulee')
          .map(r => ({
            id: r.id,
            etudiant_nom: r.etudiant_nom || '—',
            encadrant_nom: r.encadrant_nom || '—',
            date_reunion: r.date_reunion,
            statut: r.statut,
          }))
      } catch(e) {
        this.mesReunions = []
      } finally {
        this.loadingReunions = false
      }
    },

    async ouvrirEvaluation(projet) {
      this.evalProjet = projet
      this.evalCommentaire = ''
      this.showEvalModal = true
      this.loadingGrille = true

      try {
        // ✅ Charger la vraie grille avec catégories et critères
        const res = await api.get('/grilles')
        const grilles = res.data || []
        if (grilles.length > 0) {
          const grille = grilles.find(g => g.statut === 'publie') || grilles[0]
          const detail = await api.get(`/grilles/${grille.id}`)
          this.evalCategories = (detail.data.categories || []).map(cat => ({
            id: cat.id,
            nom: cat.nom,
            bareme_max: parseFloat(cat.bareme_max),
            criteres: (cat.criteres || []).map(cr => ({
              id: cr.id,
              nom: cr.nom,
              bareme_max: parseFloat(cr.bareme_max),
              note: 0,
            }))
          }))
        } else {
          this.evalCategories = []
        }
      } catch(e) {
        console.error('Erreur chargement grille:', e)
        this.evalCategories = []
      } finally {
        this.loadingGrille = false
      }

      // Pré-remplir si déjà évalué
      const existing = this.mesEvaluations.find(ev => ev.projet_titre === projet.titre)
      if (existing && existing.criteres?.length) {
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
      // Validation
      for (const cat of this.evalCategories) {
        for (const c of cat.criteres) {
          if (c.note < 0 || c.note > c.bareme_max) {
            this.afficherToast({ message: `Note invalide pour "${c.nom}".`, type: 'toast-err' })
            return
          }
        }
      }

      this.savingEval = true
      try {
        // ✅ Utilise POST /jurys/{jury}/notes
        const juryId = this.evalProjet?.id
        if (juryId) {
          await api.post(`/jurys/${juryId}/notes`, {
            membre_id: this.currentUser.id,
            note: parseFloat(this.noteTotale.toFixed(2)),
            commentaire: this.evalCommentaire,
            finalise: true,
          })
        }
        this.afficherToast({ message: 'Évaluation soumise avec succès.', type: 'toast-ok' })

        // Mise à jour locale
        const idx = this.mesProjets.findIndex(p => p.id === this.evalProjet?.id)
        if (idx !== -1) this.mesProjets[idx].evalue = true

        const note = parseFloat(this.noteTotale.toFixed(2))
        const allCriteres = this.evalCategories.flatMap(cat => cat.criteres.map(c => ({
          id: c.id, nom: c.nom, bareme: c.bareme_max, note: c.note
        })))
        const newEval = {
          id: Date.now(),
          projet_titre: this.evalProjet?.titre,
          etudiant_nom: this.evalProjet?.etudiant_nom,
          date: new Date().toLocaleDateString('fr-FR'),
          note_totale: note,
          criteres: allCriteres,
          commentaire: this.evalCommentaire,
        }
        const existIdx = this.mesEvaluations.findIndex(e => e.projet_titre === this.evalProjet?.titre)
        if (existIdx !== -1) this.mesEvaluations[existIdx] = newEval
        else this.mesEvaluations.push(newEval)

        this.showEvalModal = false
      } catch(e) {
        console.error('Erreur évaluation:', e)
        this.afficherToast({ message: 'Erreur lors de la soumission.', type: 'toast-err' })
      } finally {
        this.savingEval = false
      }
    },

    ajouterSlot() { this.planSlots.push({ date: '', heure: '', salle: '', projet_id: '' }) },

    async chargerMesPlans() {
      try {
        const res = await api.get('/plans-soutenance')
        const userId = this.currentUser.id
        this.mesPlans = (res.data || [])
          .filter(p => p.proposant_id === userId || p.jury_membre_id === userId)
          .map(p => ({
            id: p.id,
            date_proposition: p.created_at
              ? new Date(p.created_at).toLocaleDateString('fr-FR')
              : new Date().toLocaleDateString('fr-FR'),
            statut: p.statut || 'En attente',
          }))
      } catch(e) {
        // endpoint may not exist yet — silently ignore
      }
    },

    async soumettreplan() {
      // Validate: every slot must have date, heure, salle
      const valid = this.planSlots.every(s => s.date && s.heure && s.salle)
      if (!valid) {
        this.afficherToast({ message: 'Veuillez remplir la date, l\'heure et la salle pour chaque créneau.', type: 'toast-err' })
        return
      }
      // At least one slot must have a project selected
      const hasProjet = this.planSlots.some(s => s.projet_id)
      if (!hasProjet) {
        this.afficherToast({ message: 'Veuillez sélectionner au moins un projet.', type: 'toast-err' })
        return
      }

      this.savingPlan = true
      try {
        // Send the full plan as a single request to the chef endpoint
        await api.post('/plans-soutenance', {
          proposant_id: this.currentUser.id,
          role: 'jury',
          creneaux: this.planSlots
            .filter(s => s.projet_id)
            .map(s => ({
              jury_id:      s.projet_id,
              date:         s.date,
              heure_debut:  s.heure,
              salle:        s.salle,
            })),
        })

        this.afficherToast({ message: '✅ Plan soumis au chef de département avec succès.', type: 'toast-ok' })
        this.mesPlans.unshift({
          id: Date.now(),
          date_proposition: new Date().toLocaleDateString('fr-FR'),
          statut: 'En attente',
        })
        this.planSlots = [{ date: '', heure: '', salle: '', projet_id: '' }]
      } catch(e) {
        const msg = e?.response?.data?.message || 'Erreur lors de la soumission du plan.'
        this.afficherToast({ message: msg, type: 'toast-err' })
      } finally {
        this.savingPlan = false
      }
    },

    formatJour(d) { try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric' }) } catch { return d } },
    formatMois(d) { try { return new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) } catch { return '' } },
    formatHeure(d) { try { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) } catch { return '' } },

    logout() { localStorage.removeItem('user'); this.$router?.push('/login') },
    initiales(n) { return (n || '?').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) },
    afficherToast({ message, type }) {
      this.toast = { visible: true, type, message }
      setTimeout(() => { this.toast.visible = false }, 3400)
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.global-toast{position:fixed;top:22px;right:22px;z-index:9999;display:flex;align-items:center;gap:10px;padding:13px 20px;border-radius:12px;font-size:14px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.16);font-family:'Source Sans 3',sans-serif}
.toast-ok{background:#d4edda;color:#155724;border:1px solid rgba(40,167,69,.3)}.toast-err{background:#f8d7da;color:#721c24;border:1px solid rgba(220,53,69,.3)}
.toast-anim-enter-active,.toast-anim-leave-active{transition:opacity .25s,transform .25s}.toast-anim-enter-from{opacity:0;transform:translateX(20px)}.toast-anim-leave-to{opacity:0}
.dashboard-shell{display:flex;min-height:100vh;background:#0F1923;font-family:'Source Sans 3',sans-serif}
.sidebar{width:260px;min-height:100vh;background:linear-gradient(160deg,#1A2635 0%,#0F1923 100%);display:flex;flex-direction:column;flex-shrink:0;transition:width .3s cubic-bezier(.22,1,.36,1);position:sticky;top:0;height:100vh;overflow:hidden}
.sidebar.collapsed{width:68px}
.sb-brand{display:flex;align-items:center;justify-content:space-between;padding:22px 18px 18px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0}
.brand-full{font-family:'Merriweather',serif;font-size:16px;font-weight:700;white-space:nowrap}.brand-icon{font-family:'Merriweather',serif;font-size:15px;font-weight:700;color:#F5C518;width:32px;text-align:center}
.logo-w{color:#fff}.logo-g{color:#F5C518;margin-left:5px}
.collapse-btn{background:rgba(255,255,255,.08);border:none;border-radius:7px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.6);cursor:pointer;flex-shrink:0;transition:background .18s}.collapse-btn:hover{background:rgba(245,197,24,0.2);color:#F5C518}
.sb-nav{flex:1;padding:14px 10px;overflow-y:auto;overflow-x:hidden}
.nav-cat{font-size:10px;font-weight:700;color:rgba(245,166,35,.75);text-transform:uppercase;letter-spacing:.12em;padding:12px 12px 4px;white-space:nowrap}
.nav-item{display:flex;align-items:center;gap:11px;width:100%;padding:10px 11px;border:none;border-radius:10px;background:transparent;color:rgba(255,255,255,.62);font-size:13.5px;font-family:'Source Sans 3',sans-serif;font-weight:500;cursor:pointer;text-align:left;transition:all .18s;white-space:nowrap;overflow:hidden;margin-bottom:2px;position:relative}
.nav-item:hover{background:rgba(255,255,255,.09);color:#fff}.nav-item.active{background:rgba(245,166,35,.22);color:#F5C518}
.nav-icon{display:flex;align-items:center;flex-shrink:0;position:relative}.nav-label{overflow:hidden;text-overflow:ellipsis}
.badge-dot{position:absolute;top:-2px;right:-2px;width:8px;height:8px;border-radius:50%;background:#f5a623;border:2px solid #2f4f6a}
.badge-cnt{background:rgba(245,166,35,.35);color:#f5e6c0;font-size:10px;font-weight:700;padding:1px 7px;border-radius:99px;margin-left:4px}
.sb-user{display:flex;align-items:center;gap:10px;padding:14px;border-top:1px solid rgba(255,255,255,.08);flex-shrink:0}
.u-av{width:36px;height:36px;border-radius:10px;background:#f5a623;color:#fff;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.u-info{flex:1;overflow:hidden}.u-name{font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.u-role{font-size:11.5px;color:rgba(255,255,255,.42)}
.logout-btn{background:none;border:none;color:rgba(255,255,255,.38);cursor:pointer;display:flex;align-items:center;padding:5px;border-radius:6px;transition:color .15s}.logout-btn:hover{color:#F5C518}
.sb-user-col{padding:14px 10px;border-top:1px solid rgba(255,255,255,.08);display:flex;justify-content:center}
.u-av-sm{width:36px;height:36px;border-radius:10px;background:#f5a623;color:#fff;font-weight:700;font-size:11px;display:flex;align-items:center;justify-content:center}
.main-wrap{flex:1;display:flex;flex-direction:column;min-width:0}
.topbar{background:#1A2635;border-bottom:1px solid rgba(245,197,24,0.15);padding:0 32px;height:60px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;position:sticky;top:0;z-index:10}
.breadcrumb{display:flex;align-items:center;gap:7px;font-size:13.5px}.bc-root{color:#F5C518;font-weight:600}.bc-curr{color:#E8EDF2;font-weight:600}
.topbar-r{display:flex;align-items:center;gap:14px}.tb-date{font-size:12.5px;color:#7A8FA6;text-transform:capitalize}
.content-area{flex:1;padding:32px;overflow-y:auto}
.ptb{margin-bottom:28px}.pt{font-family:'Merriweather',serif;font-size:24px;font-weight:700;color:#E8EDF2;margin-bottom:5px}.ps{font-size:14px;color:#7A8FA6}
.spt{font-family:'Merriweather',serif;font-size:20px;font-weight:700;color:#E8EDF2;margin-bottom:5px}.sps{font-size:14px;color:#7A8FA6}
.alert-gold{display:flex;align-items:center;gap:14px;padding:16px 20px;background:rgba(245,197,24,0.08);border:1.5px solid #f5a623;border-radius:12px;margin-bottom:24px}
.al-icon{font-size:22px}.al-body{flex:1}.al-t{font-weight:700;color:#E8EDF2;font-size:14px;margin-bottom:3px}.al-s{font-size:13px;color:#7A8FA6}
.btn-alert{padding:9px 18px;background:#F5C518;color:#0F1923;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;white-space:nowrap}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
.kpi-card{background:#1A2635;border-radius:14px;padding:22px 20px;display:flex;align-items:center;gap:16px;box-shadow:0 2px 12px rgba(0,0,0,.06);border:1px solid rgba(245,197,24,0.12)}
.kpi-icon{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.kpi-blue .kpi-icon{background:rgba(245,197,24,.12);color:#F5C518}.kpi-gold .kpi-icon{background:rgba(245,166,35,.12);color:#d98e1a}.kpi-green .kpi-icon{background:rgba(39,174,96,.12);color:#27ae60}.kpi-slate .kpi-icon{background:rgba(74,90,106,.1);color:#A8BDD4}
.kpi-v{font-family:'Merriweather',serif;font-size:28px;font-weight:700;color:#E8EDF2;line-height:1}.kpi-l{font-size:12px;color:#7A8FA6;margin-top:4px}
.sec-title{font-size:12px;font-weight:700;color:#7A8FA6;text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px}
.qa-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.qa-card{display:flex;align-items:center;gap:14px;background:#1A2635;border:1px solid rgba(245,197,24,0.15);border-radius:14px;padding:18px 20px;cursor:pointer;text-align:left;transition:all .2s}
.qa-card:hover{border-color:#F5C518;transform:translateY(-2px)}
.qa-icon{width:44px;height:44px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.qa-blue{background:rgba(245,197,24,.12);color:#F5C518}.qa-gold{background:rgba(245,166,35,.12);color:#d98e1a}.qa-teal{background:rgba(39,174,96,.12);color:#27ae60}
.qa-txt{flex:1}.qa-t{font-size:14px;font-weight:600;color:#E8EDF2;margin-bottom:2px}.qa-s{font-size:12.5px;color:#7A8FA6}
.qa-arr{color:#c8c4bc;flex-shrink:0;transition:transform .18s,color .18s}.qa-card:hover .qa-arr{transform:translateX(3px);color:#F5C518}
/* Projets */
.projets-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:18px}
.projet-card{background:#1A2635;border:1px solid rgba(245,197,24,0.15);border-radius:14px;padding:22px;transition:box-shadow .2s}
.projet-card:hover{box-shadow:0 4px 18px rgba(0,0,0,.1)}.projet-evalue{border-color:#27ae60;background:rgba(39,174,96,0.06)}
.pc-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;gap:10px}
.pc-titre{font-family:'Merriweather',serif;font-size:14px;font-weight:700;color:#E8EDF2;flex:1}
.pc-badge{padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;flex-shrink:0}
.badge-evalue{background:#d4edda;color:#155724}.badge-pending{background:#fff3cd;color:#856404}
.pc-etudiant,.pc-session{font-size:13px;color:#7A8FA6;margin-bottom:6px}
.pc-actions{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}
.btn-download{display:flex;align-items:center;gap:6px;padding:8px 14px;background:#243347;border:1px solid rgba(245,197,24,0.15);border-radius:8px;font-size:13px;font-weight:600;color:#A8BDD4;text-decoration:none;transition:all .18s}
.btn-download:hover{border-color:#F5C518;color:#F5C518}
.no-livrable{font-size:13px;color:#aaa;font-style:italic;align-self:center}
.btn-evaluer{padding:8px 18px;background:#F5C518;color:#0F1923;border:none;border-radius:8px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .2s}
.btn-evaluer:hover{transform:translateY(-1px)}
/* Évaluations */
.eval-card{background:#1A2635;border:1px solid rgba(245,197,24,0.15);border-radius:14px;padding:22px;margin-bottom:16px}
.eval-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px}
.eval-titre{font-weight:700;font-size:15px;color:#E8EDF2}.eval-etudiant{font-size:13px;color:#7A8FA6;margin-top:2px}
.eval-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.eval-date{font-size:12.5px;color:#aaa}
.badge-note{padding:4px 12px;background:rgba(245,197,24,0.2);color:#fff;border-radius:20px;font-size:13px;font-weight:700}
.btn-modifier{padding:7px 14px;background:#243347;border:1px solid rgba(245,197,24,0.15);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;color:#A8BDD4;transition:all .18s}
.btn-modifier:hover{border-color:#F5C518;color:#F5C518}
.eval-criteres{display:flex;flex-direction:column;gap:10px;margin-bottom:14px}
.critere-row{display:flex;align-items:center;gap:12px}
.critere-label{font-size:13px;color:#A8BDD4;min-width:180px}
.critere-bar-wrap{flex:1;height:8px;background:#0F1923;border-radius:4px;overflow:hidden}
.critere-bar{height:100%;background:linear-gradient(90deg,#4a7090,#f5a623);border-radius:4px}
.critere-note{font-size:13px;font-weight:700;color:#E8EDF2;min-width:48px;text-align:right}
.eval-comment{display:flex;align-items:flex-start;gap:8px;padding:10px 14px;background:#243347;border-radius:9px;font-size:13px;color:#A8BDD4;font-style:italic}
/* Sessions */
.sessions-list{display:flex;flex-direction:column;gap:14px}
.session-card{display:flex;align-items:center;gap:20px;background:#1A2635;border:1px solid rgba(245,197,24,0.15);border-radius:14px;padding:20px;transition:box-shadow .2s}
.session-date-block{text-align:center;flex-shrink:0;background:rgba(245,197,24,0.15);color:#fff;border-radius:12px;padding:12px 16px;min-width:70px}
.session-jour{font-family:'Merriweather',serif;font-size:28px;font-weight:700;line-height:1}.session-mois{font-size:12px;margin-top:3px;opacity:.8}
.session-details{flex:1}.session-titre{font-weight:700;font-size:15px;color:#E8EDF2;margin-bottom:6px}
.session-info,.session-etudiant{font-size:13px;color:#7A8FA6;margin-bottom:3px}
.badge-session{padding:5px 12px;border-radius:20px;font-size:12.5px;font-weight:700}
.badge-done{background:#d4edda;color:#155724}.badge-todo{background:#fff3cd;color:#856404}
/* Suivi */
.suivi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.suivi-card{background:#1A2635;border:1px solid rgba(245,197,24,0.12);border-radius:14px;padding:20px}
.sc-top{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.sc-av{width:40px;height:40px;border-radius:10px;color:#fff;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sc-nom{font-weight:700;font-size:14px;color:#E8EDF2}.sc-sujet{font-size:12px;color:#7A8FA6;margin-top:2px}
.sc-pct-wrap{margin-left:auto}.sc-pct{font-family:'Merriweather',serif;font-size:18px;font-weight:700;color:#F5C518}
.sc-bar-wrap{height:5px;background:#243347;border-radius:10px;overflow:hidden;margin-bottom:12px}
.sc-bar-fill{height:100%;border-radius:10px;transition:width .5s ease}
.sc-phase-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.sc-phase-lbl{font-size:11.5px;color:#7A8FA6;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.sc-phase-val{font-size:13px;color:#E8EDF2;font-weight:600;flex:1}
.sc-phase-badge{font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px}
.spb-active{background:#fff3cd;color:#856404;border:1px solid #ffc107}.spb-wait{background:#243347;color:#7A8FA6;border:1px solid rgba(255,255,255,.1)}
/* Réunions */
.reunions-list{display:flex;flex-direction:column;gap:12px}
.reunion-card{display:flex;align-items:center;gap:16px;background:#1A2635;border:1px solid rgba(245,197,24,0.12);border-radius:12px;padding:16px}
.rc-date-block{text-align:center;flex-shrink:0;background:rgba(245,197,24,0.12);color:#fff;border-radius:10px;padding:10px 14px;min-width:60px}
.rc-jour{font-family:'Merriweather',serif;font-size:22px;font-weight:700;line-height:1}.rc-mois{font-size:11px;margin-top:2px;opacity:.75}
.rc-details{flex:1}.rc-titre{font-weight:700;font-size:14px;color:#E8EDF2;margin-bottom:3px}.rc-info{font-size:12.5px;color:#7A8FA6}
.rc-badge{padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;flex-shrink:0}
.badge-conf{background:#d4edda;color:#155724}.badge-plan{background:#fff3cd;color:#856404}.badge-ann{background:#f8d7da;color:#721c24}
/* Plan */
.plan-form{background:#1A2635;border:1px solid rgba(245,197,24,0.15);border-radius:14px;padding:24px}
.plan-form-title{font-weight:700;font-size:14.5px;color:#E8EDF2;margin-bottom:16px}
.plan-slot-row{display:grid;grid-template-columns:1fr 1fr 1fr 2fr auto;gap:12px;align-items:end;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.06)}
.form-group{display:flex;flex-direction:column;gap:5px}
.form-group label{font-size:12.5px;font-weight:600;color:#F5C518}
.form-group input,.form-group select,.form-group textarea{padding:9px 12px;border:1px solid rgba(245,197,24,0.18);border-radius:8px;background:#243347;font-size:13.5px;color:#E8EDF2;font-family:'Source Sans 3',sans-serif}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{outline:none;border-color:#F5C518}
.form-group textarea{resize:vertical}
.btn-del-slot{width:32px;height:32px;border:none;border-radius:8px;background:rgba(231,76,60,.1);color:#e74c3c;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.btn-del-slot:hover{background:#e74c3c;color:#fff}
.btn-add-slot{display:flex;align-items:center;gap:7px;padding:9px 16px;background:#243347;border:1.5px dashed rgba(245,197,24,0.3);border-radius:9px;font-size:13px;font-weight:600;color:#7A8FA6;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .18s;margin-bottom:20px}
.btn-add-slot:hover{border-color:#F5C518;color:#F5C518}
.plan-form-actions{display:flex;justify-content:flex-end}
.btn-gold{display:flex;align-items:center;gap:7px;padding:10px 18px;background:#F5C518;color:#0F1923;border:none;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .2s;box-shadow:0 4px 16px rgba(245,197,24,0.3)}
.btn-gold:hover:not(:disabled){transform:translateY(-1px)}.btn-gold:disabled{opacity:.5;cursor:not-allowed}
.mes-plans-section{border-top:1px solid rgba(255,255,255,0.07);padding-top:20px}
.plan-history{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.ph-date{font-size:13px;color:#A8BDD4;flex:1}
.ph-status{padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700}
.ph-ok{background:#d4edda;color:#155724}.ph-nok{background:#f8d7da;color:#721c24}.ph-wait{background:#fff3cd;color:#856404}
/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:#1A2635;border-radius:16px;width:100%;max-width:680px;max-height:88vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:22px 24px 0}
.modal-header h3{font-family:'Merriweather',serif;font-size:17px;color:#E8EDF2}
.modal-close{background:none;border:none;font-size:22px;color:#7A8FA6;cursor:pointer;line-height:1}.modal-close:hover{color:#E8EDF2}
.modal-body{padding:20px 24px;display:flex;flex-direction:column;gap:16px}
.modal-footer{padding:16px 24px;border-top:1px solid rgba(255,255,255,0.07);display:flex;justify-content:flex-end;gap:10px}
.btn-cancel{padding:10px 18px;background:#243347;border:1px solid rgba(245,197,24,0.18);border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;color:#A8BDD4}
.eval-etudiant-info{padding:10px 14px;background:#243347;border-radius:9px;font-size:13.5px;color:#F5C518;font-weight:500}
/* Grille par catégorie */
.eval-category{margin-bottom:16px}
.cat-header{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#243347;border-radius:8px 8px 0 0;margin-bottom:1px}
.cat-nom{font-weight:700;font-size:13.5px;color:#F5C518}.cat-bareme{font-size:12.5px;color:#7A8FA6;font-weight:600}
.grille-criteres{display:flex;flex-direction:column;gap:2px}
.critere-eval-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px 14px;background:#1e2d3d;border-radius:4px}
.ce-info{flex:1}.ce-nom{font-weight:600;font-size:13.5px;color:#E8EDF2}.ce-desc{font-size:12px;color:#7A8FA6;margin-top:1px}
.ce-note-wrap{display:flex;align-items:center;gap:6px;flex-shrink:0}
.note-input{width:64px;padding:7px 10px;border:1px solid rgba(245,197,24,0.18);border-radius:8px;background:#0F1923;font-size:15px;font-weight:700;color:#E8EDF2;font-family:'Source Sans 3',sans-serif;text-align:center}
.note-input:focus{outline:none;border-color:#F5C518}.note-err{border-color:#e74c3c}
.ce-max{font-size:13px;color:#7A8FA6;font-weight:600}
.eval-total{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:rgba(245,197,24,0.15);border-radius:10px;color:#fff;font-weight:600;font-size:14px}
.total-val{font-family:'Merriweather',serif;font-size:22px;font-weight:700;color:#F5C518}
/* Misc */
.loading-state{text-align:center;padding:60px;color:#7A8FA6}
.spinner{width:32px;height:32px;border:3px solid #243347;border-top-color:#F5C518;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px}
.spin-sm{width:12px;height:12px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-state{text-align:center;padding:60px;color:#7A8FA6;line-height:1.7}
.empty-icon{font-size:48px;margin-bottom:14px}
.page-fade-enter-active{transition:opacity .25s,transform .25s cubic-bezier(.22,1,.36,1)}.page-fade-leave-active{transition:opacity .15s}
.page-fade-enter-from{opacity:0;transform:translateY(8px)}.page-fade-leave-to{opacity:0}
.modal-fade-enter-active,.modal-fade-leave-active{transition:opacity .2s,transform .2s}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0;transform:scale(.97)}
@media(max-width:1100px){.kpi-grid{grid-template-columns:repeat(2,1fr)}.qa-grid{grid-template-columns:1fr 1fr}.plan-slot-row{grid-template-columns:1fr 1fr}}
@media(max-width:768px){.content-area{padding:20px}.topbar{padding:0 16px}}
</style>