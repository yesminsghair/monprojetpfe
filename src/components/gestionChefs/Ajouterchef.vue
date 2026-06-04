<template>
  <div class="page-wrap">
    <div class="page-header">
      <div class="page-header__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
      </div>
      <div>
        <h1 class="page-title">Promouvoir un chef de département</h1>
        <p class="page-sub">Recherchez un utilisateur par email ou matricule pour le promouvoir</p>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast-pop">
      <div v-if="toast.visible" class="toast" :class="toast.type">
        <svg v-if="toast.type === 'toast-ok'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ toast.message }}
      </div>
    </transition>

    <div class="form-card">

      <!-- Search -->
      <div class="section-label">
        <span class="section-num">1</span>
        Rechercher l'utilisateur
      </div>
      <div class="search-row">
        <div class="inp-wrap" :class="{ 'inp-wrap--err': erreurRecherche }">
          <svg class="inp-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="recherche"
            class="inp"
            placeholder="Email ou matricule de l'utilisateur…"
            @keyup.enter="rechercherUtilisateur"
          />
          <button v-if="recherche" class="inp-clear" @click="recherche=''; utilisateurTrouve=null; erreurRecherche=''">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <button class="btn-search" @click="rechercherUtilisateur" :disabled="chargement">
          <div v-if="chargement" class="spin-sm"></div>
          <span v-else>Rechercher</span>
        </button>
      </div>
      <p class="err-msg" v-if="erreurRecherche">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ erreurRecherche }}
      </p>

      <!-- Result -->
      <transition name="slide-down">
        <div v-if="utilisateurTrouve" class="result-block">
          <div class="divider">
            <span class="divider-text">Utilisateur trouvé</span>
          </div>
          <div class="section-label">
            <span class="section-num">2</span>
            Confirmer la promotion
          </div>

          <div class="user-card">
            <div class="user-av" :style="{ background: avatarBg }">{{ initiales }}</div>
            <div class="user-details">
              <div class="user-name">{{ utilisateurTrouve.prenom }} {{ utilisateurTrouve.nom }}</div>
              <div class="user-info-row">
                <div class="user-info-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  {{ utilisateurTrouve.email }}
                </div>
                <div class="user-info-item" v-if="utilisateurTrouve.matricule">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8l-2 4h12z"/>
                  </svg>
                  {{ utilisateurTrouve.matricule }}
                </div>
              </div>
              <div class="user-role-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Rôle actuel : {{ utilisateurTrouve.role }}
              </div>
            </div>
            <div class="promo-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
            <div class="new-role-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Chef de département
            </div>
          </div>

          <div class="field">
            <label class="lbl">Domaine d'expertise <span class="opt">(optionnel)</span></label>
            <input
              v-model="domaineExpertise"
              class="text-inp"
              placeholder="Ex : Génie Logiciel, Intelligence Artificielle…"
            />
          </div>

          <button class="btn-confirm" @click="confirmerAjout" :disabled="saving">
            <div v-if="saving" class="spin-sm spin-sm--dark"></div>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Promouvoir chef de département
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'

const COLORS = ['#3d6080','#2e7d6b','#7c5cbf','#c07b2c','#b03d5b']

export default {
  name: 'AjouterChef',
  props: {
    specialites: { type: Array, default: () => [] },//recus depuis le parent par defaut vide
    chefs:       { type: Array, default: () => [] },//recus du parent
  },
  emits: ['chef-ajoute'],//evenement de promotion reussie
  data() {//etat initiale reactif du comp
    return { //decl var reactives et initialisation
      recherche: '', erreurRecherche: '',
      utilisateurTrouve: null, domaineExpertise: '',
      chargement: false, saving: false,
      toast: { visible: false, message: '', type: 'err', _timer: null },

    }
  },

  computed: {
    initiales() {//les initiales(2lettres de nom&prenom d'utilisateur trouvé)
      if (!this.utilisateurTrouve) return ''//si l'utilisateur cherché n'existe pas 
      return ((this.utilisateurTrouve.prenom || '')[0] + (this.utilisateurTrouve.nom || '')[0]).toUpperCase()
    },
    avatarBg() {//utiliser la palette pour lui donner une couleur 
      return COLORS[(this.utilisateurTrouve?.id || 0) % COLORS.length]//modulo pour rester dans la liste 
    },
  },

  methods: {//methode s'execute lorsque on clique sur rechercher 
    async rechercherUtilisateur() {
      this.erreurRecherche = ''; this.utilisateurTrouve = null //vider les erreur et effacer l'utilisateur precedent
      if (!this.recherche.trim()) { this.erreurRecherche = 'Ce champ est obligatoire.'; return }//verif que le champ de recherche n'est pas vide si oui on arrete 
      this.chargement = true//active le spinner de chargement 
      try { //envoi une requette au front pour chercher l'utilisateur saisie
        const r = await api.get('/chefs/rechercher', { params: { q: this.recherche.trim() } })
        this.utilisateurTrouve = r.data || null //on stocke les données de user trouvé
        if (!this.utilisateurTrouve) this.erreurRecherche = 'Utilisateur non trouvé.'//sinon affiche msg erreur 
      } catch (e) {// sinon affiché err de backend
        this.erreurRecherche = e.response?.data?.message || 'Erreur lors de la recherche.'
      } finally { this.chargement = false }//desactive le spinner 
    },

    async confirmerAjout() {
      if (!this.utilisateurTrouve) return //methode de promouvoir quand on clique sur promouvoir chef 
      this.saving = true//spinner active
      try {
        const r = await api.post('/chefs/promouvoir', {
          utilisateurId:    this.utilisateurTrouve.id,//envoi l'id et domaine 
          domaineExpertise: this.domaineExpertise || null,//optionnelle
        })
        this.$emit('chef-ajoute', r.data)//emet event au parent et lkui passe les données du nv chef
        this.utilisateurTrouve = null; this.recherche = ''; this.domaineExpertise = ''//reinitialiser le form
      } catch (e) {
        this.showToast(e.response?.data?.message || 'Erreur lors de la promotion.', 'err')
      } finally { this.saving = false }
    },

    showToast(message, type = 'toast-ok') {
      clearTimeout(this.toast._timer)
      this.toast = { visible: true, message, type, _timer: null }
      this.toast._timer = setTimeout(() => { this.toast.visible = false }, 3500)
    },
  },
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.page-wrap { font-family: 'Sora', sans-serif; color: #1a2332; display: flex; flex-direction: column; align-items: center; }

.page-header {
  display: flex; align-items: center; gap: 14px; margin-bottom: 28px;
  width: 100%; max-width: 560px;
}
.page-header__icon {
  width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(135deg, #f5a623, #3d7aba);
  display: flex; align-items: center; justify-content: center;
  color: #fff; box-shadow: 0 4px 14px rgba(44,95,138,.28);
}
.page-title { font-size: 20px; font-weight: 700; letter-spacing: -0.4px; }
.page-sub { font-size: 13px; color: #6b7a8d; margin-top: 3px; }

.form-card {
  background: #fff; border-radius: 16px; border: 1px solid #e5eaf0;
  box-shadow: 0 2px 16px rgba(0,0,0,.06);
  padding: 24px; max-width: 560px; margin: 0 auto;
}

.section-label {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; font-weight: 600; color: #3a4a5a;
  margin-bottom: 12px;
}
.section-num {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  background: #2c5f8a; color: #fff; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

/* Search */
.search-row { display: flex; gap: 10px; align-items: flex-start; }
.inp-wrap {
  flex: 1; display: flex; align-items: center; position: relative;
  background: #f4f7fb; border: 1.5px solid #d8e2ee; border-radius: 10px;
  transition: border-color .2s, box-shadow .2s;
}
.inp-wrap:focus-within { border-color: #f5a623; box-shadow: 0 0 0 3px rgba(44,95,138,.1); background: #fff; }
.inp-wrap--err { border-color: #c0392b; }
.inp-icon { position: absolute; left: 13px; color: #8a9ab0; pointer-events: none; flex-shrink: 0; }
.inp {
  width: 100%; padding: 11px 36px 11px 36px;
  background: transparent; border: none; outline: none;
  font-size: 13.5px; font-family: 'Sora', sans-serif; color: #1a2332;
}
.inp::placeholder { color: #b0bcc8; }
.inp-clear {
  position: absolute; right: 10px; background: none; border: none;
  color: #a0aab4; cursor: pointer; display: flex; padding: 4px; border-radius: 4px;
}
.inp-clear:hover { color: #1a2332; }
.btn-search {
  padding: 11px 20px; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #f5a623, #3d7aba);
  color: #fff; font-size: 13.5px; font-weight: 600; font-family: 'Sora', sans-serif;
  cursor: pointer; white-space: nowrap; transition: all .18s;
  display: inline-flex; align-items: center; gap: 6px;
  box-shadow: 0 2px 10px rgba(44,95,138,.25);
}
.btn-search:hover:not(:disabled) { transform: translateY(-1px); }
.btn-search:disabled { opacity: .6; cursor: not-allowed; }
.err-msg {
  display: flex; align-items: center; gap: 6px;
  font-size: 12.5px; color: #c0392b; margin-top: 8px;
}

/* Divider */
.divider {
  display: flex; align-items: center; gap: 12px;
  margin: 20px 0 16px;
}
.divider::before, .divider::after {
  content: ''; flex: 1; height: 1px; background: #e5eaf0;
}
.divider-text { font-size: 11.5px; color: #f5a623; font-weight: 600; white-space: nowrap; }

/* User card */
.user-card {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; background: #f4f7fb;
  border: 1px solid #dde5f0; border-radius: 12px; margin-bottom: 18px; flex-wrap: wrap;
}
.user-av {
  width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
  color: #fff; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.user-details { flex: 1; min-width: 0; }
.user-name { font-size: 15px; font-weight: 700; color: #1a2332; }
.user-info-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 5px; }
.user-info-item {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: #6a7a8a;
}
.user-role-badge {
  display: inline-flex; align-items: center; gap: 5px;
  margin-top: 6px; padding: 3px 9px;
  background: #e8f0fa; color: #2c5f8a; border-radius: 5px;
  font-size: 12px; font-weight: 500;
}
.promo-arrow { color: #8a9ab0; }
.new-role-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; background: #e6f5ee; color: #1e7a4e;
  border-radius: 8px; font-size: 13px; font-weight: 600;
  border: 1px solid #b8dcc8;
}

/* Field */
.field { margin-bottom: 18px; }
.lbl { display: block; font-size: 12.5px; font-weight: 600; color: #3a4a5a; margin-bottom: 7px; }
.opt { font-weight: 400; color: #9aabb8; font-size: 12px; margin-left: 4px; }
.text-inp {
  width: 100%; padding: 10px 13px;
  background: #f4f7fb; border: 1.5px solid #d8e2ee;
  border-radius: 10px; font-size: 13.5px;
  font-family: 'Sora', sans-serif; color: #1a2332;
  outline: none; transition: border-color .2s, box-shadow .2s;
}
.text-inp:focus { border-color:#f5a623; box-shadow: 0 0 0 3px rgba(44,95,138,.1); background: #fff; }
.text-inp::placeholder { color: #b0bcc8; }

.btn-confirm {
  display: inline-flex; align-items: center; gap: 8px;
  width: 100%; justify-content: center;
  padding: 12px 20px; border: none; border-radius: 11px;
  background: linear-gradient(135deg, #f5a623, #28a36a);
  color: #fff; font-size: 14px; font-weight: 700;
  font-family: 'Sora', sans-serif; cursor: pointer;
  box-shadow: 0 4px 16px rgba(30,122,78,.3); transition: all .18s;
}
.btn-confirm:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(30,122,78,.4); }
.btn-confirm:disabled { opacity: .6; cursor: not-allowed; }

.spin-sm {
  width: 13px; height: 13px; border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Toast */
.toast {
  position: fixed; top: 22px; right: 22px; z-index: 9999;
  display: flex; align-items: center; gap: 9px;
  padding: 12px 18px; border-radius: 11px;
  font-size: 13.5px; font-weight: 600; font-family: 'Sora', sans-serif;
  box-shadow: 0 6px 24px rgba(0,0,0,.14);
}
.toast-ok  { background: #e6f5ee; color: #1e7a4e; border: 1px solid #b8dcc8; }
.toast-err { background: #fdf0ef; color: #c0392b; border: 1px solid #f0c0bb; }
.toast-pop-enter-active, .toast-pop-leave-active { transition: all .28s ease; }
.toast-pop-enter-from, .toast-pop-leave-to { opacity: 0; transform: translateY(-10px) scale(.96); }

.slide-down-enter-active { transition: all .3s ease; }
.slide-down-enter-from { opacity: 0; transform: translateY(-10px); }
</style>