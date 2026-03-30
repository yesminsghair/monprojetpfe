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
        <button class="nav-item" :class="{active:currentPage==='home'}" @click="navigate('home')">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Tableau de bord</span>
        </button>

        <div class="nav-cat" v-if="!sidebarCollapsed">Vœux d'encadrement</div>

        <!-- Remplir — visible si pas encore soumis -->
        <button v-if="!voeuxSoumis" class="nav-item" :class="{active:currentPage==='remplir'}" @click="navigate('remplir')">
          <span class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </span>
          <span class="nav-label" v-if="!sidebarCollapsed">
            Remplir le formulaire
            <span v-if="formulaireActif" class="badge-new">!</span>
          </span>
        </button>

        <!-- Ma fiche — visible si soumis -->
        <button v-if="voeuxSoumis" class="nav-item" :class="{active:currentPage==='ma-fiche'}" @click="navigate('ma-fiche')">
          <span class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </span>
          <span class="nav-label" v-if="!sidebarCollapsed">Ma fiche <span class="badge-soumis">✓</span></span>
        </button>

        <div class="nav-cat" v-if="!sidebarCollapsed">Mon compte</div>
        <button class="nav-item" :class="{active:currentPage==='profil'}" @click="navigate('profil')">
          <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
          <span class="nav-label" v-if="!sidebarCollapsed">Mon profil</span>
        </button>
      </nav>

      <div class="sb-user" v-if="!sidebarCollapsed">
        <div class="u-av" @click="navigate('profil')" style="cursor:pointer">{{ initiales(currentUser.prenom+' '+currentUser.nom) }}</div>
        <div class="u-info"><div class="u-name">{{ currentUser.prenom }} {{ currentUser.nom }}</div><div class="u-role">{{ roleLabel }}</div></div>
        <button class="logout-btn" @click="logout"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button>
      </div>
      <div class="sb-user-col" v-else><div class="u-av-sm">{{ initiales(currentUser.prenom+' '+currentUser.nom) }}</div></div>
    </aside>

    <!-- MAIN -->
    <div class="main-wrap">
      <header class="topbar">
        <div class="breadcrumb">
          <span class="bc-root">Espace {{ roleLabel }}</span>
          <template v-if="breadcrumb">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span class="bc-curr">{{ breadcrumb }}</span>
          </template>
        </div>
        <div class="topbar-r"><span class="tb-date">{{ dateNow }}</span></div>
      </header>

      <div class="content-area">
        <transition name="page-fade" mode="out-in">

          <!-- ═══ HOME ═══ -->
          <div v-if="currentPage==='home'" key="home">
            <div class="ptb"><h1 class="pt">Bonjour, {{ currentUser.prenom }} 👋</h1><p class="ps">Exprimez vos vœux d'encadrement pour les PFE.</p></div>

            <!-- Alerte : formulaire disponible non rempli -->
            <div class="alert-gold" v-if="formulaireActif && !voeuxSoumis">
              <span class="al-icon">📋</span>
              <div class="al-body">
                <div class="al-t">Formulaire de vœux disponible</div>
                <div class="al-s">Date limite : <strong>{{ formatDate(formulaireActif.date_limite) }}</strong></div>
              </div>
              <button class="btn-alert" @click="navigate('remplir')">Remplir maintenant →</button>
            </div>

            <!-- Statut : fiche soumise -->
            <div class="statut-ok" v-if="voeuxSoumis">
              <div class="ok-check">✓</div>
              <div>
                <div class="ok-t">Fiche de vœux soumise</div>
                <div class="ok-s">
                  {{ dateSoumission }}
                  · {{ voeuxData?.disponibilite === 'oui' ? 'Disponible' : voeuxData?.disponibilite === 'partielle' ? 'Partiellement disponible' : 'Non disponible' }}
                  <template v-if="voeuxData?.nbre_etudiants"> · {{ voeuxData.nbre_etudiants }} étudiant(s) max</template>
                </div>
              </div>
              <button class="btn-outline-sm" @click="navigate('ma-fiche')">Consulter →</button>
            </div>

            <div class="kpi-grid">
              <div class="kpi-card kpi-gold">
                <div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <div><div class="kpi-v">{{ voeuxSoumis ? '✓' : '—' }}</div><div class="kpi-l">Fiche vœux</div></div>
              </div>
              <div class="kpi-card kpi-blue">
                <div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
                <div><div class="kpi-v">{{ voeuxData?.nbre_etudiants ?? '—' }}</div><div class="kpi-l">Capacité déclarée</div></div>
              </div>
              <div class="kpi-card kpi-green">
                <div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                <div><div class="kpi-v">{{ formulaireActif ? formatDateCourt(formulaireActif.date_limite) : '—' }}</div><div class="kpi-l">Date limite</div></div>
              </div>
            </div>

            <div class="sec-title">Actions</div>
            <div class="qa-grid">
              <button class="qa-card" @click="navigate(voeuxSoumis ? 'ma-fiche' : 'remplir')">
                <div class="qa-icon qa-gold"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <div class="qa-txt">
                  <div class="qa-t">{{ voeuxSoumis ? 'Consulter ma fiche' : 'Remplir le formulaire' }}</div>
                  <div class="qa-s">{{ voeuxSoumis ? 'Voir vos préférences soumises' : 'Disponibilité, spécialités, capacité' }}</div>
                </div>
                <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>

          <!-- ═══ REMPLIR ═══ -->
          <div v-else-if="currentPage==='remplir'" key="remplir">
            <div v-if="!formulaireActif" class="empty-page">
              <div class="empty-icon">📋</div>
              <p>Aucun formulaire disponible pour le moment.</p>
              <p class="empty-sub">Le chef de département publiera bientôt un formulaire.</p>
            </div>
            <FicheVoeux
              v-else
              :formulaire="formulaireActif"
              :mode-soumission-only="true"
              @soumis="onVoeuxSoumis"
              @role-changed="onRoleChanged"
            />
          </div>

          <!-- ═══ MA FICHE (lecture + modifier) ═══ -->
          <div v-else-if="currentPage==='ma-fiche'" key="ma-fiche">
            <!-- Mode lecture -->
            <div v-if="!modeModifier" class="page-content">
              <div class="page-header-block">
                <div>
                  <h2 class="page-title">Ma fiche de vœux</h2>
                  <p class="page-sub">{{ formulaireActif?.titre }} · Soumise le {{ dateSoumission }}</p>
                </div>
                <div class="header-actions">
                  <!-- Bouton modifier — seulement si date limite pas encore atteinte -->
                  <button v-if="peutModifier" class="btn-primary" @click="modeModifier=true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Modifier ma fiche
                  </button>
                  <div v-else class="deadline-passed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Date limite dépassée
                  </div>
                </div>
              </div>

              <!-- Tableau de lecture -->
              <div class="fiche-card">
                <div class="fiche-statut">
                  <span class="badge-soumis-lg">✓ Soumise</span>
                  <span class="fiche-date">{{ dateSoumission }}</span>
                </div>

                <table class="fiche-table">
                  <tbody>
                    <tr>
                      <td class="fiche-lbl">Disponibilité</td>
                      <td class="fiche-val">
                        <span :class="['dispo-badge', voeuxData?.disponibilite]">
                          {{ labelDisponibilite(voeuxData?.disponibilite) }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="voeuxData?.nbre_etudiants !== undefined">
                      <td class="fiche-lbl">Nb max étudiants</td>
                      <td class="fiche-val">{{ voeuxData.nbre_etudiants }}</td>
                    </tr>
                    <tr v-if="voeuxData?.specialites?.length">
                      <td class="fiche-lbl">Spécialités souhaitées</td>
                      <td class="fiche-val">
                        <span v-for="s in voeuxData.specialites" :key="s" class="spec-tag">{{ s }}</span>
                      </td>
                    </tr>
                    <tr v-if="voeuxData?.themes">
                      <td class="fiche-lbl">Thèmes préférés</td>
                      <td class="fiche-val">{{ voeuxData.themes }}</td>
                    </tr>
                    <tr v-if="voeuxData?.commentaire">
                      <td class="fiche-lbl">Commentaires</td>
                      <td class="fiche-val">{{ voeuxData.commentaire }}</td>
                    </tr>
                    <tr>
                      <td class="fiche-lbl">Co-tutelle</td>
                      <td class="fiche-val">{{ voeuxData?.cotutelle ? 'Acceptée' : 'Non' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Mode modification (FicheVoeux en mode édition) -->
            <div v-else>
              <div class="back-header">
                <button class="back-btn" @click="modeModifier=false">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                  Retour à ma fiche
                </button>
              </div>
              <FicheVoeux
                :formulaire="formulaireActif"
                :mode-soumission-only="true"
                @soumis="onVoeuxModifie"
                @role-changed="onRoleChanged"
              />
            </div>
          </div>

          <!-- PROFIL -->
          <ConsulterProfil v-else-if="currentPage==='profil'" key="profil" @modifier="currentPage='profil-edit'"/>
          <ModifierProfil  v-else-if="currentPage==='profil-edit'" key="profil-edit" @annuler="currentPage='profil'" @sauvegarde="currentPage='profil'"/>

        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import FicheVoeux      from './GestionFormulaires/FicheVoeux.vue'
import ConsulterProfil from './ConsulterProfil.vue'
import ModifierProfil  from './ModifierProfil.vue'

export default {
  name: 'DashboardEnseignant',
  components: { FicheVoeux, ConsulterProfil, ModifierProfil },

  async mounted() {
    await this.chargerFormulaireActif()
  },

  data() {
    return {
      sidebarCollapsed: false,
      currentPage: 'home',
      modeModifier: false,
      formulaireActif: null,
      toast: { visible: false, type: 'toast-ok', message: '' },
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),
      voeuxSoumis: false,
      voeuxData: null,
      dateSoumission: '',
    }
  },

  computed: {
    breadcrumb() {
      return { remplir: 'Remplir le formulaire', 'ma-fiche': 'Ma fiche', profil: 'Mon profil', 'profil-edit': 'Modifier le profil' }[this.currentPage] || ''
    },
    dateNow() {
      return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    },
    roleLabel() {
      return this.currentUser.role === 'encadrant' ? 'Encadrant' : 'Enseignant'
    },
    // Modifier autorisé seulement si date limite pas encore dépassée
    peutModifier() {
      if (!this.formulaireActif?.date_limite) return false
      return new Date(this.formulaireActif.date_limite) > new Date()
    },
  },

  methods: {
    navigate(p) {
      this.currentPage  = p
      this.modeModifier = false
    },

    getApi() {
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      return axios.create({
        baseURL: 'http://127.0.0.1:8000/api',
        headers: { Authorization: 'Bearer ' + stored.token, Accept: 'application/json' },
      })
    },

    async chargerFormulaireActif() {
      try {
        const res    = await this.getApi().get('/formulaires-voeux')
        const publie = res.data.find(f => f.statut === 'publie' || f.statut === 'verrouille')
        if (publie) {
          this.formulaireActif = publie

          // Charger le vœu existant de cet enseignant
          const voeuxRes = await this.getApi().get('/voeux-encadrement?formulaire_id=' + publie.id)
          if (voeuxRes.data && voeuxRes.data.statut === 'soumis') {
            this.voeuxSoumis    = true
            this.voeuxData      = voeuxRes.data
            this.dateSoumission = voeuxRes.data.soumis_at
              ? new Date(voeuxRes.data.soumis_at).toLocaleDateString('fr-FR')
              : ''
            // Naviguer directement vers ma-fiche au chargement
            this.currentPage = 'ma-fiche'
          }
        }
      } catch (e) {
        console.error('Erreur chargement formulaire:', e)
      }
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

    formatDateCourt(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    },

    labelDisponibilite(d) {
      return { oui: '✅ Disponible', partielle: '⚡ Partiellement', non: '❌ Non disponible' }[d] || d || '—'
    },

    onVoeuxSoumis(voeux) {
      this.voeuxSoumis    = true
      this.voeuxData      = voeux
      this.dateSoumission = new Date().toLocaleDateString('fr-FR')
      this.modeModifier   = false
      this.afficherToast({ message: 'Vos vœux ont été soumis avec succès !', type: 'toast-ok' })
      this.navigate('ma-fiche')
    },

    onVoeuxModifie(voeux) {
      this.voeuxData    = voeux
      this.modeModifier = false
      this.afficherToast({ message: 'Fiche mise à jour avec succès.', type: 'toast-ok' })
    },

    onRoleChanged(newRole) {
      this.currentUser = { ...this.currentUser, role: newRole }
      this.afficherToast({ message: 'Votre rôle est maintenant : Encadrant 🎉', type: 'toast-ok' })
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
.global-toast{position:fixed;top:22px;right:22px;z-index:9999;display:flex;align-items:center;gap:10px;padding:13px 20px;border-radius:12px;font-size:14px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,0.16);font-family:'Source Sans 3',sans-serif}
.toast-ok{background:#d4edda;color:#155724;border:1px solid rgba(40,167,69,0.3)}.toast-err{background:#f8d7da;color:#721c24;border:1px solid rgba(220,53,69,0.3)}
.toast-anim-enter-active,.toast-anim-leave-active{transition:opacity .25s,transform .25s}.toast-anim-enter-from{opacity:0;transform:translateX(20px)}.toast-anim-leave-to{opacity:0}
.dashboard-shell{display:flex;min-height:100vh;background:#c8c4bc;font-family:'Source Sans 3',sans-serif}
.sidebar{width:260px;min-height:100vh;background:linear-gradient(160deg,#4a7090 0%,#3d6080 30%,#2f4f6a 65%,#243d52 100%);display:flex;flex-direction:column;flex-shrink:0;transition:width .3s;position:sticky;top:0;height:100vh;overflow:hidden}
.sidebar.collapsed{width:68px}
.sb-brand{display:flex;align-items:center;justify-content:space-between;padding:22px 18px 18px;border-bottom:1px solid rgba(255,255,255,0.08);flex-shrink:0}
.brand-full{font-family:'Merriweather',serif;font-size:16px;font-weight:700;white-space:nowrap}.brand-icon{font-family:'Merriweather',serif;font-size:15px;font-weight:700;color:#f5a623;width:32px;text-align:center}
.logo-w{color:#fff}.logo-g{color:#f5a623;margin-left:5px}
.collapse-btn{background:rgba(255,255,255,0.08);border:none;border-radius:7px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);cursor:pointer;flex-shrink:0;transition:background .18s}
.collapse-btn:hover{background:rgba(255,255,255,0.15);color:#fff}
.sb-nav{flex:1;padding:14px 10px;overflow-y:auto;overflow-x:hidden}
.nav-cat{font-size:10px;font-weight:700;color:rgba(245,166,35,0.75);text-transform:uppercase;letter-spacing:.12em;padding:12px 12px 4px}
.nav-item{display:flex;align-items:center;gap:11px;width:100%;padding:10px 11px;border:none;border-radius:10px;background:transparent;color:rgba(255,255,255,0.62);font-size:13.5px;font-family:'Source Sans 3',sans-serif;font-weight:500;cursor:pointer;text-align:left;transition:all .18s;white-space:nowrap;overflow:hidden;margin-bottom:2px}
.nav-item:hover{background:rgba(255,255,255,0.09);color:#fff}.nav-item.active{background:rgba(245,166,35,0.22);color:#f5a623}
.nav-icon{display:flex;align-items:center;flex-shrink:0}.nav-label{overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:7px}
.badge-new{background:#f5a623;color:#fff;font-size:10px;font-weight:700;padding:1px 7px;border-radius:99px}
.badge-soumis{background:rgba(39,174,96,0.3);color:#a8f0c6;font-size:10px;font-weight:700;padding:1px 7px;border-radius:99px}
.sb-user{display:flex;align-items:center;gap:10px;padding:14px;border-top:1px solid rgba(255,255,255,0.08);flex-shrink:0}
.u-av{width:36px;height:36px;border-radius:10px;background:#f5a623;color:#fff;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.u-info{flex:1;overflow:hidden}.u-name{font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.u-role{font-size:11.5px;color:rgba(255,255,255,0.42)}
.logout-btn{background:none;border:none;color:rgba(255,255,255,0.38);cursor:pointer;display:flex;align-items:center;padding:5px;border-radius:6px;transition:color .15s}.logout-btn:hover{color:#f5a623}
.sb-user-col{padding:14px 10px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:center}
.u-av-sm{width:36px;height:36px;border-radius:10px;background:#f5a623;color:#fff;font-weight:700;font-size:11px;display:flex;align-items:center;justify-content:center}
.main-wrap{flex:1;display:flex;flex-direction:column;min-width:0}
.topbar{background:#ddd9d1;border-bottom:1px solid #c8c4bc;padding:0 32px;height:60px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;position:sticky;top:0;z-index:10}
.breadcrumb{display:flex;align-items:center;gap:7px;font-size:13.5px}.bc-root{color:#3d6080;font-weight:600}.bc-curr{color:#1e2a35;font-weight:600}
.topbar-r{display:flex;align-items:center;gap:14px}.tb-date{font-size:12.5px;color:#8a9aaa;text-transform:capitalize}
.content-area{flex:1;padding:32px;overflow-y:auto}
/* Home */
.ptb{margin-bottom:24px}.pt{font-family:'Merriweather',serif;font-size:24px;font-weight:700;color:#1e2a35;margin-bottom:5px}.ps{font-size:14px;color:#8a9aaa}
.alert-gold{display:flex;align-items:center;gap:16px;padding:18px 22px;border-radius:14px;margin-bottom:20px;background:#fff8e8;border:1.5px solid #f5a623}
.al-icon{font-size:28px;flex-shrink:0}.al-body{flex:1}.al-t{font-size:14px;font-weight:700;color:#7d5a00;margin-bottom:3px}.al-s{font-size:13px;color:#9a7020}
.btn-alert{padding:9px 18px;background:#f5a623;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}
.btn-alert:hover{background:#d98e1a}
.statut-ok{display:flex;align-items:center;gap:14px;background:#d4edda;border:1.5px solid rgba(39,174,96,0.3);border-radius:14px;padding:16px 22px;margin-bottom:20px}
.ok-check{width:36px;height:36px;border-radius:10px;background:#27ae60;color:#fff;font-size:18px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ok-t{font-size:14px;font-weight:700;color:#155724}.ok-s{font-size:13px;color:#1e7e34;margin-top:2px}
.btn-outline-sm{margin-left:auto;padding:8px 18px;background:transparent;border:1.5px solid #27ae60;border-radius:8px;font-size:13px;font-weight:600;color:#27ae60;cursor:pointer;transition:all .18s;white-space:nowrap}
.btn-outline-sm:hover{background:#27ae60;color:#fff}
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px}
.kpi-card{background:#ddd9d1;border-radius:14px;padding:22px 20px;display:flex;align-items:center;gap:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border:1.5px solid #c8c4bc}
.kpi-icon{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.kpi-blue .kpi-icon{background:rgba(61,96,128,0.12);color:#3d6080}.kpi-gold .kpi-icon{background:rgba(245,166,35,0.12);color:#d98e1a}.kpi-green .kpi-icon{background:rgba(39,174,96,0.12);color:#27ae60}
.kpi-v{font-family:'Merriweather',serif;font-size:28px;font-weight:700;color:#1e2a35;line-height:1}.kpi-l{font-size:12px;color:#8a9aaa;margin-top:4px}
.sec-title{font-size:12px;font-weight:700;color:#8a9aaa;text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px}
.qa-grid{display:grid;grid-template-columns:1fr;gap:14px;max-width:480px}
.qa-card{display:flex;align-items:center;gap:14px;background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;padding:18px 20px;cursor:pointer;text-align:left;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
.qa-card:hover{border-color:#3d6080;box-shadow:0 4px 18px rgba(61,96,128,0.12);transform:translateY(-2px)}
.qa-icon{width:44px;height:44px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.qa-gold{background:rgba(245,166,35,0.12);color:#d98e1a}
.qa-txt{flex:1}.qa-t{font-size:14px;font-weight:600;color:#1e2a35;margin-bottom:2px}.qa-s{font-size:12.5px;color:#8a9aaa}
.qa-arr{color:#c8c4bc;flex-shrink:0;transition:transform .18s,color .18s}.qa-card:hover .qa-arr{transform:translateX(3px);color:#3d6080}
/* Empty */
.empty-page{text-align:center;padding:60px;color:#8a9aaa}
.empty-icon{font-size:48px;margin-bottom:12px}
.empty-sub{font-size:12.5px;margin-top:6px}
/* Ma fiche */
.page-content{padding:0}
.page-header-block{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:16px;flex-wrap:wrap}
.page-title{font-family:'Merriweather',serif;font-size:20px;color:#1e2a35;margin-bottom:4px}
.page-sub{font-size:13.5px;color:#8a9aaa}
.header-actions{display:flex;align-items:center;gap:10px}
.btn-primary{display:flex;align-items:center;gap:8px;padding:10px 20px;background:#3d6080;color:#fff;border:none;border-radius:10px;font-size:13.5px;font-weight:600;cursor:pointer;transition:background .18s}
.btn-primary:hover{background:#2f4f6a}
.deadline-passed{display:flex;align-items:center;gap:6px;padding:8px 14px;background:#f8d7da;color:#922b21;border-radius:8px;font-size:13px;font-weight:600}
.fiche-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
.fiche-statut{display:flex;align-items:center;gap:12px;padding:16px 20px;background:#c8c4bc;border-bottom:1.5px solid #b8b4ac}
.badge-soumis-lg{padding:5px 14px;background:#d4edda;color:#1e7e34;border-radius:20px;font-size:13px;font-weight:700}
.fiche-date{font-size:13px;color:#4a5a6a}
.fiche-table{width:100%;border-collapse:collapse}
.fiche-table tr{border-top:1px solid #c8c4bc}
.fiche-table tr:first-child{border-top:none}
.fiche-lbl{padding:14px 20px;font-size:13px;font-weight:600;color:#4a5a6a;background:#e8e4dc;width:200px;white-space:nowrap}
.fiche-val{padding:14px 20px;font-size:13.5px;color:#1e2a35;background:#e8e4dc}
.dispo-badge{font-weight:600}
.dispo-badge.oui{color:#1e7e34}.dispo-badge.partielle{color:#d98e1a}.dispo-badge.non{color:#922b21}
.spec-tag{display:inline-block;padding:3px 10px;background:rgba(61,96,128,0.1);color:#3d6080;border-radius:20px;font-size:12px;font-weight:600;margin:2px 4px 2px 0}
/* Modifier mode */
.back-header{margin-bottom:20px}
.back-btn{display:flex;align-items:center;gap:7px;padding:8px 16px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:9px;font-size:13px;color:#4a5a6a;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .18s}
.back-btn:hover{border-color:#3d6080;color:#3d6080}
/* Transitions */
.page-fade-enter-active{transition:opacity .25s,transform .25s}.page-fade-leave-active{transition:opacity .15s}
.page-fade-enter-from{opacity:0;transform:translateY(8px)}.page-fade-leave-to{opacity:0}
@media(max-width:768px){.content-area{padding:20px}.topbar{padding:0 16px}.kpi-grid{grid-template-columns:1fr 1fr}}
</style>