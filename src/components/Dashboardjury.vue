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

        <!-- Tableau de bord -->
        <button class="nav-item" :class="{active:currentPage==='home'}" @click="navigate('home')" :title="sidebarCollapsed?'Accueil':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Tableau de bord</span>
        </button>

        <div class="nav-cat" v-if="!sidebarCollapsed">Mes soutenances</div>

        <!-- Mes projets à évaluer -->
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

        <!-- Mes évaluations -->
        <button class="nav-item" :class="{active:currentPage==='mes-evaluations'}" @click="navigate('mes-evaluations')" :title="sidebarCollapsed?'Mes évaluations':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="18" x2="15" y2="12"/><polyline points="20 6 9 17 4 12"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Mes évaluations</span>
        </button>

        <!-- Calendrier soutenances -->
        <button class="nav-item" :class="{active:currentPage==='calendrier'}" @click="navigate('calendrier')" :title="sidebarCollapsed?'Calendrier':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Calendrier</span>
        </button>

        <div class="nav-cat" v-if="!sidebarCollapsed">Planification</div>

        <!-- Proposer un plan -->
        <button class="nav-item" :class="{active:currentPage==='proposer-plan'}" @click="navigate('proposer-plan')" :title="sidebarCollapsed?'Proposer un plan':''">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Proposer un plan</span>
        </button>

      </nav>

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
        <div class="topbar-r"><span class="tb-date">{{ dateNow }}</span></div>
      </header>

      <div class="content-area">
        <transition name="page-fade" mode="out-in">

          <!-- ═══════════════════ HOME ═══════════════════ -->
          <div v-if="currentPage==='home'" key="home">
            <div class="ptb">
              <h1 class="pt">Bonjour, {{ currentUser.prenom }} 👋</h1>
              <p class="ps">Consultez vos projets à évaluer et soumettez vos fiches d'évaluation.</p>
            </div>

            <!-- Alerte projets à évaluer -->
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
              <button class="qa-card" @click="navigate('calendrier')">
                <div class="qa-icon qa-blue"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Consulter le calendrier</div><div class="qa-s">Voir mes sessions de soutenance</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="qa-card" @click="navigate('proposer-plan')">
                <div class="qa-icon qa-teal"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
                <div class="qa-txt"><div class="qa-t">Proposer un plan</div><div class="qa-s">Soumettre un planning au chef de département</div></div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>

          <!-- ═══════════════════ MES PROJETS À ÉVALUER ═══════════════════ -->
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

          <!-- ═══════════════════ MES ÉVALUATIONS ═══════════════════ -->
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
                  <div v-for="c in ev.criteres" :key="c.id" class="critere-row">
                    <span class="critere-label">{{ c.nom }}</span>
                    <div class="critere-bar-wrap"><div class="critere-bar" :style="{width: (c.note/c.bareme*100)+'%'}"></div></div>
                    <span class="critere-note">{{ c.note }}/{{ c.bareme }}</span>
                  </div>
                </div>
                <div v-if="ev.commentaire" class="eval-comment">💬 {{ ev.commentaire }}</div>
              </div>
            </div>
          </div>

          <!-- ═══════════════════ CALENDRIER ═══════════════════ -->
          <div v-else-if="currentPage==='calendrier'" key="calendrier">
            <div class="ptb"><h2 class="spt">Mon calendrier de soutenances</h2><p class="sps">Vos sessions de soutenance planifiées</p></div>

            <div v-if="!mesSessions.length" class="empty-state"><div class="empty-icon">📅</div><p>Aucune session de soutenance planifiée pour vous.</p></div>
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
                  <span class="badge-session" :class="s.evalue ? 'badge-done' : 'badge-todo'">
                    {{ s.evalue ? '✓ Évalué' : '⏳ À évaluer' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══════════════════ PROPOSER UN PLAN ═══════════════════ -->
          <div v-else-if="currentPage==='proposer-plan'" key="proposer-plan">
            <div class="ptb"><h2 class="spt">Proposer un plan de soutenances</h2><p class="sps">Soumettez une proposition au chef de département</p></div>

            <div class="plan-form">
              <div class="plan-form-title">Créneaux proposés</div>
              <div v-for="(slot, i) in planSlots" :key="i" class="plan-slot-row">
                <div class="form-group">
                  <label>Date</label>
                  <input type="date" v-model="slot.date" />
                </div>
                <div class="form-group">
                  <label>Heure</label>
                  <input type="time" v-model="slot.heure" />
                </div>
                <div class="form-group">
                  <label>Salle</label>
                  <input type="text" v-model="slot.salle" placeholder="ex: A101" />
                </div>
                <div class="form-group">
                  <label>Projet</label>
                  <select v-model="slot.projet_id">
                    <option value="">— Projet —</option>
                    <option v-for="p in mesProjets" :key="p.id" :value="p.id">{{ p.titre }}</option>
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

              <!-- Mes plans soumis -->
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

    <!-- ═══════════════════ MODAL ÉVALUATION ═══════════════════ -->
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

            <div class="grille-criteres">
              <div v-for="c in evalCriteres" :key="c.id" class="critere-eval-row">
                <div class="ce-info">
                  <div class="ce-nom">{{ c.nom }}</div>
                  <div class="ce-desc">Barème : /{{ c.bareme }}</div>
                </div>
                <div class="ce-note-wrap">
                  <input type="number" :min="0" :max="c.bareme" :step="0.5" v-model.number="c.note"
                    class="note-input" :class="{'note-err': c.note > c.bareme || c.note < 0}" />
                  <span class="ce-max">/{{ c.bareme }}</span>
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
import axios from 'axios'

export default {
  name: 'DashboardJury',
  data() {
    return {
      sidebarCollapsed: false,
      currentPage: 'home',
      toast: { visible: false, type: 'toast-ok', message: '' },
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),

      loadingProjets: false,
      mesProjets: [],
      mesEvaluations: [],
      mesSessions: [],
      mesPlans: [],

      showEvalModal: false,
      evalProjet: null,
      evalCriteres: [],
      evalCommentaire: '',
      savingEval: false,

      savingPlan: false,
      planSlots: [{ date: '', heure: '', salle: '', projet_id: '' }],
    }
  },

  computed: {
    projetsNonEvalues() { return this.mesProjets.filter(p => !p.evalue).length },
    noteTotale() {
      if (!this.evalCriteres.length) return 0
      const totalBareme = this.evalCriteres.reduce((s, c) => s + c.bareme, 0)
      const totalNote = this.evalCriteres.reduce((s, c) => s + (c.note || 0), 0)
      return totalBareme > 0 ? (totalNote / totalBareme) * 20 : 0
    },
    breadcrumb() {
      return {
        'mes-projets': 'Projets à évaluer',
        'mes-evaluations': 'Mes évaluations',
        'calendrier': 'Calendrier',
        'proposer-plan': 'Proposer un plan',
      }[this.currentPage] || ''
    },
    dateNow() {
      return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    },
  },

  async mounted() {
    await this.chargerDonnees()
  },

  methods: {
    getApi() {
      const u = JSON.parse(localStorage.getItem('user') || '{}')
      return axios.create({
        baseURL: 'http://127.0.0.1:8000/api',
        headers: { Authorization: 'Bearer ' + u.token, Accept: 'application/json', 'Content-Type': 'application/json' },
      })
    },

    navigate(p) { this.currentPage = p },

    async chargerDonnees() {
      this.loadingProjets = true
      try {
        const [projRes, evalRes, sessRes, planRes] = await Promise.allSettled([
          this.getApi().get('/jury/mes-projets'),
          this.getApi().get('/jury/mes-evaluations'),
          this.getApi().get('/jury/mes-sessions'),
          this.getApi().get('/jury/mes-plans'),
        ])
        this.mesProjets = projRes.status === 'fulfilled' ? projRes.value.data : this.demoMesProjets()
        this.mesEvaluations = evalRes.status === 'fulfilled' ? evalRes.value.data : this.demoMesEvaluations()
        this.mesSessions = sessRes.status === 'fulfilled' ? sessRes.value.data : this.demoMesSessions()
        this.mesPlans = planRes.status === 'fulfilled' ? planRes.value.data : []
      } catch {
        this.mesProjets = this.demoMesProjets()
        this.mesEvaluations = this.demoMesEvaluations()
        this.mesSessions = this.demoMesSessions()
      } finally { this.loadingProjets = false }
    },

    demoMesProjets() {
      return [
        { id: 1, titre: 'Système de gestion PFE', etudiant_nom: 'Ali Ben Salah', encadrant: 'Dr. Kamel Bouzid', date_soutenance: '15/06/2025', salle: 'Salle A101', livrable_url: '#', evalue: false },
        { id: 2, titre: 'Application mobile e-commerce', etudiant_nom: 'Fatma Chaari', encadrant: 'Dr. Sihem Ayed', date_soutenance: '15/06/2025', salle: 'Salle A102', livrable_url: '#', evalue: true },
      ]
    },

    demoMesEvaluations() {
      return [
        {
          id: 1, projet_titre: 'Application mobile e-commerce', etudiant_nom: 'Fatma Chaari', date: '14/06/2025', note_totale: 14.5,
          criteres: [
            { id: 1, nom: 'Qualité du rapport', bareme: 5, note: 3.5 },
            { id: 2, nom: 'Présentation orale', bareme: 5, note: 4 },
            { id: 3, nom: 'Réponses aux questions', bareme: 5, note: 3.5 },
            { id: 4, nom: 'Innovation', bareme: 5, note: 3.5 },
          ],
          commentaire: 'Bon travail dans l\'ensemble, présentation claire.',
        },
      ]
    },

    demoMesSessions() {
      return [
        { id: 1, date: '2025-06-15', heure_debut: '09:00', heure_fin: '10:00', salle: 'Salle A101', projet: 'Système de gestion PFE', etudiant: 'Ali Ben Salah', evalue: false },
        { id: 2, date: '2025-06-15', heure_debut: '10:00', heure_fin: '11:00', salle: 'Salle A102', projet: 'Application mobile e-commerce', etudiant: 'Fatma Chaari', evalue: true },
      ]
    },

    async ouvrirEvaluation(projet) {
      this.evalProjet = projet
      this.evalCommentaire = ''
      // Charger la grille de critères
      try {
        const res = await this.getApi().get('/grille-evaluation/criteres')
        this.evalCriteres = (res.data || []).map(c => ({ ...c, note: 0 }))
      } catch {
        this.evalCriteres = [
          { id: 1, nom: 'Qualité du rapport', bareme: 5, note: 0 },
          { id: 2, nom: 'Présentation orale', bareme: 5, note: 0 },
          { id: 3, nom: 'Réponses aux questions', bareme: 5, note: 0 },
          { id: 4, nom: 'Innovation', bareme: 5, note: 0 },
        ]
      }
      // Pré-remplir si déjà évalué
      const existing = this.mesEvaluations.find(e => e.projet_titre === projet.titre)
      if (existing) {
        existing.criteres.forEach(ec => {
          const c = this.evalCriteres.find(x => x.id === ec.id)
          if (c) c.note = ec.note
        })
        this.evalCommentaire = existing.commentaire || ''
      }
      this.showEvalModal = true
    },

    ouvrirModif(eval_) {
      const projet = this.mesProjets.find(p => p.titre === eval_.projet_titre) || { titre: eval_.projet_titre, etudiant_nom: eval_.etudiant_nom, encadrant: '—' }
      this.ouvrirEvaluation(projet)
    },

    async soumettreEvaluation() {
      for (const c of this.evalCriteres) {
        if (c.note < 0 || c.note > c.bareme) {
          this.afficherToast({ message: `Note invalide pour "${c.nom}".`, type: 'toast-err' }); return
        }
      }
      this.savingEval = true
      try {
        await this.getApi().post('/jury/evaluer', {
          projet_id: this.evalProjet?.id,
          criteres: this.evalCriteres.map(c => ({ id: c.id, note: c.note })),
          commentaire: this.evalCommentaire,
        })
        this.afficherToast({ message: 'Évaluation soumise avec succès.', type: 'toast-ok' })
      } catch {
        this.afficherToast({ message: 'Évaluation soumise (mode démo).', type: 'toast-ok' })
      }
      // Marquer comme évalué
      const idx = this.mesProjets.findIndex(p => p.id === this.evalProjet?.id)
      if (idx !== -1) this.mesProjets[idx].evalue = true
      const note = parseFloat(this.noteTotale.toFixed(2))
      const newEval = {
        id: Date.now(), projet_titre: this.evalProjet?.titre, etudiant_nom: this.evalProjet?.etudiant_nom,
        date: new Date().toLocaleDateString('fr-FR'), note_totale: note,
        criteres: this.evalCriteres.map(c => ({ ...c })), commentaire: this.evalCommentaire,
      }
      const existIdx = this.mesEvaluations.findIndex(e => e.projet_titre === this.evalProjet?.titre)
      if (existIdx !== -1) this.mesEvaluations[existIdx] = newEval
      else this.mesEvaluations.push(newEval)
      this.showEvalModal = false
      this.savingEval = false
    },

    ajouterSlot() { this.planSlots.push({ date: '', heure: '', salle: '', projet_id: '' }) },

    async soumettreplan() {
      const valid = this.planSlots.every(s => s.date && s.heure && s.salle)
      if (!valid) { this.afficherToast({ message: 'Remplissez tous les champs de chaque créneau.', type: 'toast-err' }); return }
      this.savingPlan = true
      try {
        await this.getApi().post('/jury/proposer-plan', { sessions: this.planSlots })
        this.afficherToast({ message: 'Plan soumis au chef de département.', type: 'toast-ok' })
      } catch {
        this.afficherToast({ message: 'Plan soumis (mode démo).', type: 'toast-ok' })
      }
      this.mesPlans.push({ id: Date.now(), date_proposition: new Date().toLocaleDateString('fr-FR'), statut: 'En attente' })
      this.planSlots = [{ date: '', heure: '', salle: '', projet_id: '' }]
      this.savingPlan = false
    },

    formatJour(d) { try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric' }) } catch { return d } },
    formatMois(d) { try { return new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) } catch { return '' } },

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

/* SHELL */
.global-toast{position:fixed;top:22px;right:22px;z-index:9999;display:flex;align-items:center;gap:10px;padding:13px 20px;border-radius:12px;font-size:14px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.16);font-family:'DM Sans',sans-serif}
.toast-ok{background:#d4edda;color:#155724;border:1px solid rgba(40,167,69,.3)}.toast-err{background:#f8d7da;color:#721c24;border:1px solid rgba(220,53,69,.3)}
.toast-anim-enter-active,.toast-anim-leave-active{transition:opacity .25s,transform .25s}.toast-anim-enter-from{opacity:0;transform:translateX(20px)}.toast-anim-leave-to{opacity:0}
.dashboard-shell{display:flex;min-height:100vh;background:#0F1923;font-family:'DM Sans',sans-serif}

/* SIDEBAR */
.sidebar{width:260px;min-height:100vh;background:linear-gradient(160deg,#1A2635 0%,#0F1923 100%);display:flex;flex-direction:column;flex-shrink:0;transition:width .3s cubic-bezier(.22,1,.36,1);position:sticky;top:0;height:100vh;overflow:hidden}
.sidebar.collapsed{width:68px}
.sb-brand{display:flex;align-items:center;justify-content:space-between;padding:22px 18px 18px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0}
.brand-full{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;white-space:nowrap}.brand-icon{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#F5C518;width:32px;text-align:center}
.logo-w{color:#fff}.logo-g{color:#F5C518;margin-left:5px}
.collapse-btn{background:rgba(255,255,255,.08);border:none;border-radius:7px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.6);cursor:pointer;flex-shrink:0;transition:background .18s}.collapse-btn:hover{background:rgba(245,197,24,0.2);color:#F5C518}
.sb-nav{flex:1;padding:14px 10px;overflow-y:auto;overflow-x:hidden}
.nav-cat{font-size:10px;font-weight:700;color:rgba(245,166,35,.75);text-transform:uppercase;letter-spacing:.12em;padding:12px 12px 4px;white-space:nowrap}
.nav-item{display:flex;align-items:center;gap:11px;width:100%;padding:10px 11px;border:none;border-radius:10px;background:transparent;color:rgba(255,255,255,.62);font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;text-align:left;transition:all .18s;white-space:nowrap;overflow:hidden;margin-bottom:2px;position:relative}
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

/* TOPBAR */
.main-wrap{flex:1;display:flex;flex-direction:column;min-width:0}
.topbar{background:#1A2635;border-bottom:1px solid #c8c4bc;padding:0 32px;height:60px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;position:sticky;top:0;z-index:10}
.breadcrumb{display:flex;align-items:center;gap:7px;font-size:13.5px}.bc-root{color:#F5C518;font-weight:600}.bc-curr{color:#E8EDF2;font-weight:600}
.topbar-r{display:flex;align-items:center;gap:14px}.tb-date{font-size:12.5px;color:#7A8FA6;text-transform:capitalize}
.content-area{flex:1;padding:32px;overflow-y:auto}

/* HOME */
.ptb{margin-bottom:28px}.pt{font-family:'Syne',sans-serif;font-size:24px;font-weight:700;color:#E8EDF2;margin-bottom:5px}.ps{font-size:14px;color:#7A8FA6}
.spt{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:#E8EDF2;margin-bottom:5px}.sps{font-size:14px;color:#7A8FA6}
.alert-gold{display:flex;align-items:center;gap:14px;padding:16px 20px;background:#fff9e6;border:1.5px solid #f5a623;border-radius:12px;margin-bottom:24px}
.al-icon{font-size:22px}.al-body{flex:1}.al-t{font-weight:700;color:#E8EDF2;font-size:14px;margin-bottom:3px}.al-s{font-size:13px;color:#7A8FA6}
.btn-alert{padding:9px 18px;background:#F5C518;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
.kpi-card{background:#1A2635;border-radius:14px;padding:22px 20px;display:flex;align-items:center;gap:16px;box-shadow:0 2px 12px rgba(0,0,0,.06);border:1px solid rgba(245,197,24,0.18)}
.kpi-icon{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.kpi-blue .kpi-icon{background:rgba(245,197,24,.12);color:#F5C518}.kpi-gold .kpi-icon{background:rgba(245,166,35,.12);color:#d98e1a}.kpi-green .kpi-icon{background:rgba(39,174,96,.12);color:#27ae60}.kpi-slate .kpi-icon{background:rgba(74,90,106,.1);color:#A8BDD4}
.kpi-v{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;color:#E8EDF2;line-height:1}.kpi-l{font-size:12px;color:#7A8FA6;margin-top:4px}
.sec-title{font-size:12px;font-weight:700;color:#7A8FA6;text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px}
.qa-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.qa-card{display:flex;align-items:center;gap:14px;background:#1A2635;border:1px solid rgba(245,197,24,0.18);border-radius:14px;padding:18px 20px;cursor:pointer;text-align:left;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.qa-card:hover{border-color:#F5C518;box-shadow:0 4px 18px rgba(61,96,128,.12);transform:translateY(-2px)}
.qa-icon{width:44px;height:44px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.qa-blue{background:rgba(245,197,24,.12);color:#F5C518}.qa-gold{background:rgba(245,166,35,.12);color:#d98e1a}.qa-teal{background:rgba(39,174,96,.12);color:#27ae60}
.qa-txt{flex:1}.qa-t{font-size:14px;font-weight:600;color:#E8EDF2;margin-bottom:2px}.qa-s{font-size:12.5px;color:#7A8FA6}
.qa-arr{color:#c8c4bc;flex-shrink:0;transition:transform .18s,color .18s}.qa-card:hover .qa-arr{transform:translateX(3px);color:#F5C518}

/* PROJETS */
.projets-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:18px}
.projet-card{background:#1A2635;border:1px solid rgba(245,197,24,0.18);border-radius:14px;padding:22px;transition:box-shadow .2s}
.projet-card:hover{box-shadow:0 4px 18px rgba(0,0,0,.1)}
.projet-evalue{border-color:#27ae60;background:rgba(39,174,96,0.08)}
.pc-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;gap:10px}
.pc-titre{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#E8EDF2;flex:1}
.pc-badge{padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;flex-shrink:0}
.badge-evalue{background:#d4edda;color:#155724}.badge-pending{background:#fff3cd;color:#856404}
.pc-etudiant,.pc-session{font-size:13px;color:#7A8FA6;margin-bottom:6px}
.pc-actions{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}
.btn-download{display:flex;align-items:center;gap:6px;padding:8px 14px;background:#243347;border:1px solid rgba(245,197,24,0.18);border-radius:8px;font-size:13px;font-weight:600;color:#A8BDD4;text-decoration:none;transition:all .18s}
.btn-download:hover{border-color:#F5C518;color:#F5C518}
.no-livrable{font-size:13px;color:#aaa;font-style:italic;align-self:center}
.btn-evaluer{padding:8px 18px;background:#F5C518;color:#fff;border:none;border-radius:8px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s}
.btn-evaluer:hover{transform:translateY(-1px);box-shadow:0 3px 10px rgba(245,166,35,.3)}

/* ÉVALUATIONS */
.eval-card{background:#1A2635;border:1px solid rgba(245,197,24,0.18);border-radius:14px;padding:22px;margin-bottom:16px}
.eval-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px}
.eval-titre{font-weight:700;font-size:15px;color:#E8EDF2}
.eval-etudiant{font-size:13px;color:#7A8FA6;margin-top:2px}
.eval-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.eval-date{font-size:12.5px;color:#aaa}
.badge-note{padding:4px 12px;background:rgba(245,197,24,0.2);color:#fff;border-radius:20px;font-size:13px;font-weight:700}
.btn-modifier{padding:7px 14px;background:#243347;border:1px solid rgba(245,197,24,0.18);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;color:#A8BDD4;transition:all .18s}
.btn-modifier:hover{border-color:#F5C518;color:#F5C518}
.eval-criteres{display:flex;flex-direction:column;gap:10px;margin-bottom:14px}
.critere-row{display:flex;align-items:center;gap:12px}
.critere-label{font-size:13px;color:#A8BDD4;min-width:180px}
.critere-bar-wrap{flex:1;height:8px;background:#0F1923;border-radius:4px;overflow:hidden}
.critere-bar{height:100%;background:linear-gradient(90deg,#4a7090,#f5a623);border-radius:4px}
.critere-note{font-size:13px;font-weight:700;color:#E8EDF2;min-width:48px;text-align:right}
.eval-comment{display:flex;align-items:flex-start;gap:8px;padding:10px 14px;background:#243347;border-radius:9px;font-size:13px;color:#A8BDD4;font-style:italic}

/* SESSIONS */
.sessions-list{display:flex;flex-direction:column;gap:14px}
.session-card{display:flex;align-items:center;gap:20px;background:#1A2635;border:1px solid rgba(245,197,24,0.18);border-radius:14px;padding:20px;transition:box-shadow .2s}
.session-card:hover{box-shadow:0 4px 18px rgba(0,0,0,.1)}
.session-date-block{text-align:center;flex-shrink:0;background:rgba(245,197,24,0.2);color:#fff;border-radius:12px;padding:12px 16px;min-width:70px}
.session-jour{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;line-height:1}
.session-mois{font-size:12px;margin-top:3px;opacity:.8}
.session-details{flex:1}
.session-titre{font-weight:700;font-size:15px;color:#E8EDF2;margin-bottom:6px}
.session-info,.session-etudiant{font-size:13px;color:#7A8FA6;margin-bottom:3px}
.session-status{flex-shrink:0}
.badge-session{padding:5px 12px;border-radius:20px;font-size:12.5px;font-weight:700}
.badge-done{background:#d4edda;color:#155724}.badge-todo{background:#fff3cd;color:#856404}

/* PLAN FORM */
.plan-form{background:#1A2635;border:1px solid rgba(245,197,24,0.18);border-radius:14px;padding:24px}
.plan-form-title{font-weight:700;font-size:14.5px;color:#E8EDF2;margin-bottom:16px}
.plan-slot-row{display:grid;grid-template-columns:1fr 1fr 1fr 2fr auto;gap:12px;align-items:end;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #c8c4bc}
.form-group{display:flex;flex-direction:column;gap:5px}
.form-group label{font-size:12.5px;font-weight:600;color:#F5C518}
.form-group input,.form-group select{padding:9px 12px;border:1px solid rgba(245,197,24,0.18);border-radius:8px;background:#243347;font-size:13.5px;color:#E8EDF2;font-family:'DM Sans',sans-serif}
.form-group input:focus,.form-group select:focus{outline:none;border-color:#F5C518}
.btn-del-slot{width:32px;height:32px;border:none;border-radius:8px;background:rgba(231,76,60,.1);color:#e74c3c;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.btn-del-slot:hover{background:#e74c3c;color:#fff}
.btn-add-slot{display:flex;align-items:center;gap:7px;padding:9px 16px;background:#243347;border:1.5px dashed #c8c4bc;border-radius:9px;font-size:13px;font-weight:600;color:#7A8FA6;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s;margin-bottom:20px}
.btn-add-slot:hover{border-color:#F5C518;color:#F5C518}
.plan-form-actions{display:flex;justify-content:flex-end}
.btn-gold{display:flex;align-items:center;gap:7px;padding:10px 18px;background:#F5C518;color:#0F1923;border:none;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;box-shadow:0 4px 16px rgba(245,197,24,0.3)}
.btn-gold:hover:not(:disabled){transform:translateY(-1px)}.btn-gold:disabled{opacity:.5;cursor:not-allowed}
.mes-plans-section{border-top:1px solid rgba(255,255,255,0.07);padding-top:20px}
.plan-history{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #e8e4dc}
.ph-date{font-size:13px;color:#A8BDD4;flex:1}
.ph-status{padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700}
.ph-ok{background:#d4edda;color:#155724}.ph-nok{background:#f8d7da;color:#721c24}.ph-wait{background:#fff3cd;color:#856404}

/* MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:#1A2635;border-radius:16px;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.25)}
.modal-lg{max-width:680px}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:22px 24px 0}
.modal-header h3{font-family:'Syne',sans-serif;font-size:17px;color:#E8EDF2}
.modal-close{background:none;border:none;font-size:22px;color:#7A8FA6;cursor:pointer;line-height:1}.modal-close:hover{color:#E8EDF2}
.modal-body{padding:20px 24px;display:flex;flex-direction:column;gap:16px}
.modal-footer{padding:16px 24px;border-top:1px solid rgba(255,255,255,0.07);display:flex;justify-content:flex-end;gap:10px}
.btn-cancel{padding:10px 18px;background:#243347;border:1px solid rgba(245,197,24,0.18);border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;color:#A8BDD4}
.eval-etudiant-info{padding:10px 14px;background:#243347;border-radius:9px;font-size:13.5px;color:#F5C518;font-weight:500}
.grille-criteres{display:flex;flex-direction:column;gap:12px}
.critere-eval-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 14px;background:#243347;border-radius:10px}
.ce-info{flex:1}.ce-nom{font-weight:600;font-size:14px;color:#E8EDF2}.ce-desc{font-size:12px;color:#7A8FA6;margin-top:2px}
.ce-note-wrap{display:flex;align-items:center;gap:6px;flex-shrink:0}
.note-input{width:64px;padding:7px 10px;border:1px solid rgba(245,197,24,0.18);border-radius:8px;background:#1A2635;font-size:15px;font-weight:700;color:#E8EDF2;font-family:'DM Sans',sans-serif;text-align:center}
.note-input:focus{outline:none;border-color:#F5C518}
.note-err{border-color:#e74c3c;background:#fdf2f2}
.ce-max{font-size:13px;color:#7A8FA6;font-weight:600}
.eval-total{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:rgba(245,197,24,0.2);border-radius:10px;color:#fff;font-weight:600;font-size:14px}
.total-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:700}
.form-group textarea{padding:10px 12px;border:1px solid rgba(245,197,24,0.18);border-radius:9px;background:#243347;font-size:14px;color:#E8EDF2;font-family:'DM Sans',sans-serif;resize:vertical}
.form-group textarea:focus{outline:none;border-color:#F5C518}

/* MISC */
.loading-state{text-align:center;padding:60px;color:#7A8FA6}
.spinner{width:32px;height:32px;border:3px solid #c8c4bc;border-top-color:#F5C518;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px}
.spin-sm{width:12px;height:12px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-state{text-align:center;padding:60px;color:#7A8FA6;line-height:1.7}
.empty-icon{font-size:48px;margin-bottom:14px}
.page-fade-enter-active{transition:opacity .25s,transform .25s cubic-bezier(.22,1,.36,1)}.page-fade-leave-active{transition:opacity .15s}
.page-fade-enter-from{opacity:0;transform:translateY(8px)}.page-fade-leave-to{opacity:0}
.modal-fade-enter-active,.modal-fade-leave-active{transition:opacity .2s,transform .2s}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0;transform:scale(.97)}
@media(max-width:1100px){.kpi-grid{grid-template-columns:repeat(2,1fr)}.qa-grid{grid-template-columns:1fr 1fr}.plan-slot-row{grid-template-columns:1fr 1fr;grid-template-rows:auto auto auto}}
@media(max-width:768px){.content-area{padding:20px}.topbar{padding:0 16px}}
</style>