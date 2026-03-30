<template>
  <div class="page-content">
    <div class="form-card">
      <div class="form-card-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        </div>
        <div>
          <h3 class="card-title">Ajouter un chef de département</h3>
          <p class="card-sub">Recherchez un enseignant ou encadrant existant pour le promouvoir chef</p>
        </div>
      </div>

      <!-- Étape 1 : Recherche -->
      <div v-if="!utilisateurTrouve">
        <div class="field-block">
          <label class="lbl">Email ou Matricule <span class="req">*</span></label>
          <div class="search-row">
            <input v-model="recherche" type="text" placeholder="enseignant@isimm.tn ou ENS-001"
              :class="{ 'input-err': erreurRecherche }"
              @keyup.enter="rechercherUtilisateur"/>
            <button type="button" class="btn-gold" @click="rechercherUtilisateur" :disabled="chargement">
              <svg v-if="!chargement" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              {{ chargement ? '...' : 'Rechercher' }}
            </button>
          </div>
          <p class="err" v-if="erreurRecherche">{{ erreurRecherche }}</p>
        </div>
      </div>

      <!-- Étape 2 : Confirmation -->
      <div v-else>
        <div class="user-found-card">
          <div class="user-avatar">{{ initiales }}</div>
          <div class="user-info">
            <p class="user-name">{{ utilisateurTrouve.prenom }} {{ utilisateurTrouve.nom }}</p>
            <p class="user-email">{{ utilisateurTrouve.email }}</p>
            <p class="user-role">Rôle actuel : <strong>{{ utilisateurTrouve.role }}</strong> — Matricule : <strong>{{ utilisateurTrouve.matricule }}</strong></p>
          </div>
        </div>

        <div class="field-block">
          <label class="lbl">Domaine d'expertise</label>
          <input v-model="domaineExpertise" type="text" placeholder="Ex : Intelligence Artificielle, Réseaux…"/>
        </div>

        <div class="alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Cet utilisateur sera promu <strong>Chef de département</strong>. Son rôle sera modifié dans le système.
        </div>

        <div class="form-actions">
          <button type="button" class="btn-gold" @click="confirmerPromotion" :disabled="chargement">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Confirmer la promotion
          </button>
          <button type="button" class="btn-outline" @click="reinitialiser">Rechercher un autre</button>
          <button type="button" class="btn-outline" @click="annuler">Annuler</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'AjouterChef',
  props: {
    specialites: { type: Array, default: () => [] },
    chefs:       { type: Array, default: () => [] },
  },
  emits: ['chef-ajoute', 'toast', 'navigate'],
  data() {
    return {
      recherche:         '',
      erreurRecherche:   '',
      utilisateurTrouve: null,
      domaineExpertise:  '',
      chargement:        false,
    }
  },
  computed: {
    initiales() {
      if (!this.utilisateurTrouve) return ''
      return ((this.utilisateurTrouve.prenom || '')[0] + (this.utilisateurTrouve.nom || '')[0]).toUpperCase()
    },
  },
  methods: {
    rechercherUtilisateur() {
      this.erreurRecherche = ''
      if (!this.recherche.trim()) {
        this.erreurRecherche = "L'email ou le matricule est obligatoire."
        return
      }
      this.chargement = true
      this.$emit('chef-ajoute', {
        action: 'rechercher',
        q: this.recherche.trim(),
        callback: this.onUtilisateurTrouve,
      })
    },
    onUtilisateurTrouve(utilisateur, erreur) {
      this.chargement = false
      if (erreur) {
        this.erreurRecherche = erreur
        this.utilisateurTrouve = null
      } else {
        this.utilisateurTrouve = utilisateur
        this.erreurRecherche = ''
      }
    },
    confirmerPromotion() {
      this.chargement = true
      this.$emit('chef-ajoute', {
        action: 'promouvoir',
        utilisateur: this.utilisateurTrouve,
        domaineExpertise: this.domaineExpertise,
      })
    },
    reinitialiser() {
      this.utilisateurTrouve = null
      this.recherche         = ''
      this.domaineExpertise  = ''
      this.erreurRecherche   = ''
      this.chargement        = false
    },
    annuler() {
      this.reinitialiser()
      this.$emit('navigate', 'chef-list')
    },
  },
}
</script>

<style scoped>
.page-content    { flex: 1; padding: 32px; font-family: 'Source Sans 3', sans-serif; }
.form-card       { max-width: 660px; animation: cardIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes cardIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
.search-row      { display: flex; gap: 10px; }
.search-row input { flex: 1; }
.user-found-card { display: flex; align-items: center; gap: 16px; background: #f0f6ff; border: 1px solid #c8ddf5; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
.user-avatar     { width: 48px; height: 48px; border-radius: 50%; background: #3d6080; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex-shrink: 0; }
.user-name       { font-weight: 600; font-size: 16px; color: #1a2332; margin: 0 0 2px; }
.user-email      { font-size: 13px; color: #5a7a99; margin: 0 0 4px; }
.user-role       { font-size: 13px; color: #5a7a99; margin: 0; }
.alert-info      { display: flex; align-items: flex-start; gap: 8px; background: #e8f4fd; border: 1px solid #b8d9f0; border-radius: 8px; padding: 12px 14px; font-size: 13.5px; color: #1a5a8a; margin-bottom: 20px; }
</style>