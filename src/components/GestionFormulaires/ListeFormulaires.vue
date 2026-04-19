<template>
  <div class="page-content">

    <div class="page-header-block">
      <div>
        <h2 class="page-title">Gestion des formulaires de vœux</h2>
        <p class="page-sub">Suivez l'état de vos formulaires et gérez les réponses des enseignants</p>
      </div>
      <button class="btn-primary" @click="$emit('navigate','voeux-creer')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Définir un formulaire
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement des formulaires...</p>
    </div>

    <template v-else>
      <div class="stats-row" v-if="formulaires.length">
        <div class="stat-chip stat-blue"><span class="stat-val">{{ formulaires.length }}</span><span class="stat-lbl">Total</span></div>
        <div class="stat-chip stat-gray"><span class="stat-val">{{ formulaires.filter(f=>f.statut==='brouillon').length }}</span><span class="stat-lbl">Brouillons</span></div>
        <div class="stat-chip stat-green"><span class="stat-val">{{ formulaires.filter(f=>f.statut==='publie').length }}</span><span class="stat-lbl">Publiés</span></div>
        <div class="stat-chip stat-red"><span class="stat-val">{{ formulaires.filter(f=>f.statut==='verrouille').length }}</span><span class="stat-lbl">Verrouillés</span></div>
      </div>

      <div class="table-card" v-if="formulaires.length">
        <table class="table">
          <thead>
            <tr><th>Titre</th><th>Créé le</th><th>Date limite</th><th>État</th><th>Réponses</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr v-for="f in formulaires" :key="f.id" class="table-row">
              <td class="td-titre">
                <div class="form-titre">{{ f.titre }}</div>
                <div class="form-dest">{{ f.nb_reponses || 0 }} réponse(s)</div>
              </td>
              <td class="td-date">{{ formatDate(f.created_at) }}</td>
              <td class="td-date">
                <span :class="{ 'date-warn': isExpiringSoon(f.date_limite) && f.statut==='publie' }">
                  {{ formatDate(f.date_limite) }}
                </span>
              </td>
              <td>
                <span class="badge" :class="badgeClass(f.statut)">
                  <span class="badge-dot"></span>{{ labelStatut(f.statut) }}
                </span>
              </td>
              <td><span class="reponses-count">{{ f.nb_reponses || 0 }}</span></td>
              <td class="td-actions">
                <button class="icon-btn" title="Voir les réponses" @click="voirReponses(f)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button v-if="f.statut==='brouillon'" class="action-btn btn-edit" @click="modifierBrouillon(f)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Modifier
                </button>
                <button v-if="f.statut==='brouillon'" class="action-btn btn-green" @click="demanderPublier(f)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Publier
                </button>
                <button v-if="f.statut==='publie'" class="action-btn btn-red" @click="demanderVerrouiller(f)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Verrouiller
                </button>
                <span v-if="f.statut==='verrouille'" class="locked-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Clôturé
                </span>
                <button v-if="f.statut==='brouillon'" class="icon-btn icon-btn-danger" title="Supprimer" @click="demanderSupprimer(f)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>Aucun formulaire de vœux</h3>
        <p>Commencez par définir un formulaire à envoyer aux enseignants</p>
        <button class="btn-primary" @click="$emit('navigate','voeux-creer')">Définir un formulaire</button>
      </div>
    </template>

    <!-- Panel réponses -->
    <transition name="panel-slide">
      <div v-if="formulaireSelectionne" class="panel-overlay" @click.self="formulaireSelectionne=null">
        <div class="side-panel">
          <div class="panel-header">
            <div><h3>Suivi des réponses</h3><p class="panel-sub">{{ formulaireSelectionne.titre }}</p></div>
            <button class="close-panel" @click="formulaireSelectionne=null">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div v-if="loadingReponses" class="panel-empty">Chargement...</div>
          <template v-else>
            <div class="panel-stats">
              <div class="pstat"><div class="pstat-val green">{{ reponses.filter(r=>r.statut==='soumis').length }}</div><div class="pstat-lbl">Soumis</div></div>
              <div class="pstat"><div class="pstat-val orange">{{ reponses.filter(r=>r.statut==='brouillon').length }}</div><div class="pstat-lbl">Brouillons</div></div>
              <div class="pstat"><div class="pstat-val blue">{{ reponses.length }}</div><div class="pstat-lbl">Total</div></div>
            </div>
            <div class="panel-section-title">Réponses reçues</div>
            <div v-if="reponses.length" class="reponse-list">
              <div v-for="r in reponses" :key="r.id" class="reponse-card">
                <div class="rep-avatar">{{ initiales(r.enseignant_nom) }}</div>
                <div class="rep-info">
                  <div class="rep-name">{{ r.enseignant_nom }}</div>
                  <div class="rep-detail">
                    {{ r.disponibilite === 'oui' ? '✅ Disponible' : r.disponibilite === 'partielle' ? '⚡ Partiel' : '❌ Non dispo' }}
                    · {{ r.nbre_etudiants }} étudiant(s)
                  </div>
                  <div class="rep-themes" v-if="r.themes">{{ r.themes }}</div>
                </div>
                <span class="rep-badge" :class="r.statut==='soumis'?'rep-soumis':'rep-draft'">{{ r.statut==='soumis'?'Soumis':'Brouillon' }}</span>
              </div>
            </div>
            <div v-else class="panel-empty">Aucune réponse reçue pour le moment</div>
          </template>
        </div>
      </div>
    </transition>

    <!-- Modale Publier -->
    <transition name="modal-fade">
      <div v-if="modalPublier" class="overlay" @click.self="modalPublier=null">
        <div class="confirm-modal">
          <div class="confirm-icon green"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></div>
          <h4>Publier le formulaire ?</h4>
          <p>Les enseignants de votre département pourront voir et remplir ce formulaire immédiatement.</p>
          <div class="confirm-btns">
            <button class="btn-outline" @click="modalPublier=null">Annuler</button>
            <button class="btn-success" @click="confirmerPublier" :disabled="saving">{{ saving?'...':'Oui, publier' }}</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modale Verrouiller -->
    <transition name="modal-fade">
      <div v-if="modalVerrouiller" class="overlay" @click.self="modalVerrouiller=null">
        <div class="confirm-modal">
          <div class="confirm-icon warn"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
          <h4>Verrouiller le formulaire ?</h4>
          <p>Le formulaire sera clôturé. Aucune réponse ou modification ne sera plus acceptée.</p>
          <div class="confirm-btns">
            <button class="btn-outline" @click="modalVerrouiller=null">Annuler</button>
            <button class="btn-danger" @click="confirmerVerrouiller" :disabled="saving">{{ saving?'...':'Oui, verrouiller' }}</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modale Supprimer -->
    <transition name="modal-fade">
      <div v-if="modalSupprimer" class="overlay" @click.self="modalSupprimer=null">
        <div class="confirm-modal">
          <div class="confirm-icon danger-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></div>
          <h4>Supprimer ce brouillon ?</h4>
          <p>Cette action est irréversible.</p>
          <div class="confirm-btns">
            <button class="btn-outline" @click="modalSupprimer=null">Annuler</button>
            <button class="btn-danger" @click="confirmerSupprimer" :disabled="saving">{{ saving?'...':'Supprimer' }}</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'ListeFormulaires',

  emits: ['modifier', 'navigate'],

  data() {
    return {
      formulaires: [],
      loading: false,
      error: null,

      modalSupprimer: null,
      modalPublier: null,
      modalVerrouiller: null,

      formulaireSelectionne: null,
      reponses: [],
      loadingReponses: false,
      saving: false
    }
  },

  async created() {
    await this.chargerFormulaires()
  },

  methods: {
    async chargerFormulaires() {
      this.loading = true
      try {
        const res = await api.get('/formulaires-voeux')
        this.formulaires = res.data || []
      } catch (e) {
        console.error(e)
        this.formulaires = []
        this.error = 'Erreur chargement formulaires'
      } finally {
        this.loading = false
      }
    },

    formatDate(date) {
      if (!date) return '-'
      const d = new Date(date)
      if (isNaN(d.getTime())) return '-'
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },

    isExpiringSoon(date) {
      if (!date) return false
      const now = new Date()
      const target = new Date(date)
      if (isNaN(target.getTime())) return false
      const diffDays = (target - now) / (1000 * 60 * 60 * 24)
      return diffDays <= 5 && diffDays >= 0
    },

    badgeClass(statut) {
      return { brouillon: 'badge-gray', publie: 'badge-green', verrouille: 'badge-red' }[statut] || 'badge-gray'
    },

    labelStatut(statut) {
      return { brouillon: 'Brouillon', publie: 'Publié', verrouille: 'Verrouillé' }[statut] || 'Inconnu'
    },

    initiales(nom) {
      if (!nom) return '?'
      return nom.split(' ').map(p => p[0] || '').join('').toUpperCase().slice(0, 2)
    },

    // ── Réponses panel ────────────────────────────────────────────
    async voirReponses(f) {
      this.formulaireSelectionne = f
      this.reponses = []
      this.loadingReponses = true
      try {
        // GET /voeux-encadrement?formulaire_id=X  (returns all voeux for this formulaire)
        const res = await api.get('/voeux-encadrement/liste', {
          params: { formulaire_id: f.id }
        })
        this.reponses = res.data || []
      } catch (e) {
        console.error(e)
        this.reponses = []
      } finally {
        this.loadingReponses = false
      }
    },

    // ── Modify ────────────────────────────────────────────────────
    modifierBrouillon(f) {
      this.$emit('modifier', f)
    },

    // ── Publish ───────────────────────────────────────────────────
    demanderPublier(f) {
      this.modalPublier = f
    },

    async confirmerPublier() {
      if (!this.modalPublier) return
      this.saving = true
      try {
        await api.patch(`/formulaires-voeux/${this.modalPublier.id}/publier`)
        this.modalPublier = null
        await this.chargerFormulaires()
      } catch (e) {
        console.error(e)
      } finally {
        this.saving = false
      }
    },

    // ── Lock ──────────────────────────────────────────────────────
    demanderVerrouiller(f) {
      this.modalVerrouiller = f
    },

    async confirmerVerrouiller() {
      if (!this.modalVerrouiller) return
      this.saving = true
      try {
        await api.patch(`/formulaires-voeux/${this.modalVerrouiller.id}/verrouiller`)
        this.modalVerrouiller = null
        await this.chargerFormulaires()
      } catch (e) {
        console.error(e)
      } finally {
        this.saving = false
      }
    },

    // ── Delete ────────────────────────────────────────────────────
    demanderSupprimer(f) {
      this.modalSupprimer = f
    },

    async confirmerSupprimer() {
      if (!this.modalSupprimer) return
      this.saving = true
      try {
        await api.delete(`/formulaires-voeux/${this.modalSupprimer.id}`)
        this.modalSupprimer = null
        await this.chargerFormulaires()
      } catch (e) {
        console.error(e)
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600&family=Merriweather:wght@700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.page-content{padding:32px;font-family:'Source Sans 3',sans-serif}
.page-header-block{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:16px;flex-wrap:wrap}
.page-title{font-family:'Merriweather',serif;font-size:20px;color:#1e2a35;margin-bottom:4px}
.page-sub{font-size:13.5px;color:#8a9aaa}
.btn-primary{display:flex;align-items:center;gap:8px;padding:10px 20px;background:#3d6080;color:#fff;border:none;border-radius:10px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.18s;white-space:nowrap}
.btn-primary:hover{background:#2f4f6a}
.loading-state{text-align:center;padding:60px;color:#8a9aaa}
.spinner{width:32px;height:32px;border:3px solid #c8c4bc;border-top-color:#3d6080;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px}
@keyframes spin{to{transform:rotate(360deg)}}
.stats-row{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap}
.stat-chip{display:flex;flex-direction:column;align-items:center;padding:10px 20px;border-radius:10px;border:1.5px solid transparent}
.stat-blue{background:rgba(61,96,128,0.1);border-color:rgba(61,96,128,0.2)}
.stat-gray{background:rgba(74,90,106,0.1);border-color:rgba(74,90,106,0.2)}
.stat-green{background:rgba(39,174,96,0.1);border-color:rgba(39,174,96,0.2)}
.stat-red{background:rgba(192,57,43,0.1);border-color:rgba(192,57,43,0.2)}
.stat-val{font-family:'Merriweather',serif;font-size:22px;font-weight:700;color:#1e2a35}
.stat-lbl{font-size:11.5px;color:#8a9aaa}
.table-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
.table{width:100%;border-collapse:collapse}
.table th{background:#c8c4bc;padding:12px 16px;font-size:12px;font-weight:700;color:#4a5a6a;text-transform:uppercase;letter-spacing:0.05em;text-align:left}
.table td{padding:14px 16px;border-top:1px solid #c8c4bc;font-size:13.5px}
.table-row:hover td{background:rgba(61,96,128,0.04)}
.td-titre .form-titre{font-weight:600;color:#1e2a35;margin-bottom:2px}
.td-titre .form-dest{font-size:12px;color:#8a9aaa}
.td-date{color:#4a5a6a;font-size:13px;white-space:nowrap}
.date-warn{color:#d98e1a;font-weight:600}
.badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600}
.badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor}
.badge-gray{background:#e8e4dc;color:#4a5a6a}
.badge-green{background:#d4edda;color:#1e7e34}
.badge-red{background:#f8d7da;color:#a71d2a}
.reponses-count{font-size:13px;color:#1e2a35;font-weight:600}
.td-actions{display:flex;align-items:center;gap:6px}
.icon-btn{width:32px;height:32px;border-radius:8px;border:1.5px solid #c8c4bc;background:#e8e4dc;color:#3d6080;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.18s}
.icon-btn:hover{border-color:#3d6080;background:rgba(61,96,128,0.1)}
.icon-btn-danger:hover{border-color:#c0392b;color:#c0392b;background:rgba(192,57,43,0.08)}
.action-btn{display:flex;align-items:center;gap:5px;padding:6px 12px;border:none;border-radius:8px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.18s;white-space:nowrap}
.btn-green{background:rgba(39,174,96,0.12);color:#1a6b3a}
.btn-green:hover{background:#27ae60;color:#fff}
.btn-red{background:rgba(192,57,43,0.1);color:#922b21}
.btn-red:hover{background:#c0392b;color:#fff}
.btn-edit{background:rgba(61,96,128,0.1);color:#3d6080}
.btn-edit:hover{background:#3d6080;color:#fff}
.locked-badge{display:flex;align-items:center;gap:4px;font-size:12px;color:#8a9aaa;font-style:italic}
.empty-state{text-align:center;padding:60px 30px;background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px}
.empty-icon{font-size:48px;margin-bottom:16px}
.empty-state h3{font-size:18px;color:#1e2a35;margin-bottom:8px}
.empty-state p{font-size:14px;color:#8a9aaa;margin-bottom:24px}
.panel-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:500;display:flex;justify-content:flex-end}
.side-panel{width:420px;max-width:90vw;height:100%;background:#ddd9d1;overflow-y:auto;box-shadow:-8px 0 40px rgba(0,0,0,0.15);display:flex;flex-direction:column}
.panel-header{display:flex;justify-content:space-between;align-items:flex-start;padding:24px;border-bottom:1.5px solid #c8c4bc}
.panel-header h3{font-size:16px;font-weight:700;color:#1e2a35;margin-bottom:4px}
.panel-sub{font-size:12.5px;color:#8a9aaa}
.close-panel{background:none;border:none;cursor:pointer;color:#8a9aaa;display:flex;align-items:center;padding:4px;border-radius:6px}
.close-panel:hover{color:#1e2a35}
.panel-stats{display:flex;justify-content:space-around;padding:20px 24px;border-bottom:1.5px solid #c8c4bc}
.pstat{text-align:center}
.pstat-val{font-family:'Merriweather',serif;font-size:26px;font-weight:700}
.pstat-val.green{color:#27ae60}.pstat-val.orange{color:#d98e1a}.pstat-val.blue{color:#3d6080}
.pstat-lbl{font-size:12px;color:#8a9aaa;margin-top:2px}
.panel-section-title{padding:16px 24px 8px;font-size:12px;font-weight:700;color:#8a9aaa;text-transform:uppercase;letter-spacing:0.06em}
.reponse-list{padding:0 24px 24px;display:flex;flex-direction:column;gap:8px}
.reponse-card{display:flex;align-items:flex-start;gap:12px;padding:12px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:10px}
.rep-avatar{width:36px;height:36px;border-radius:8px;background:#3d6080;color:#fff;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.rep-name{font-size:13.5px;font-weight:600;color:#1e2a35}
.rep-detail{font-size:12px;color:#4a5a6a;margin-top:2px}
.rep-themes{font-size:11.5px;color:#8a9aaa;margin-top:3px;font-style:italic}
.rep-info{flex:1}
.rep-badge{padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap}
.rep-soumis{background:#d4edda;color:#1e7e34}
.rep-draft{background:#e8e4dc;color:#8a9aaa}
.panel-empty{padding:20px 24px;text-align:center;color:#8a9aaa;font-size:13.5px}
.panel-slide-enter-active{transition:opacity 0.25s}.panel-slide-leave-active{transition:opacity 0.2s}
.panel-slide-enter-from,.panel-slide-leave-to{opacity:0}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:999}
.confirm-modal{background:#ddd9d1;border-radius:16px;padding:32px;max-width:420px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.2)}
.confirm-icon{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.confirm-icon.green{background:rgba(39,174,96,0.15);color:#27ae60}
.confirm-icon.warn{background:rgba(245,166,35,0.15);color:#d98e1a}
.confirm-icon.danger-icon{background:rgba(192,57,43,0.12);color:#c0392b}
.confirm-modal h4{font-size:18px;font-weight:700;color:#1e2a35;margin-bottom:10px}
.confirm-modal p{font-size:14px;color:#4a5a6a;line-height:1.6;margin-bottom:24px}
.confirm-btns{display:flex;gap:10px;justify-content:center}
.btn-outline{padding:10px 20px;background:transparent;border:1.5px solid #c8c4bc;border-radius:9px;font-size:14px;color:#4a5a6a;cursor:pointer;font-family:inherit;transition:all 0.18s}
.btn-outline:hover{border-color:#3d6080;color:#3d6080}
.btn-success{padding:10px 20px;background:#27ae60;color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit}
.btn-success:hover{background:#1e8449}
.btn-success:disabled,.btn-danger:disabled{opacity:0.6;cursor:not-allowed}
.btn-danger{padding:10px 20px;background:#c0392b;color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit}
.btn-danger:hover{background:#a93226}
.modal-fade-enter-active{transition:opacity 0.25s}.modal-fade-leave-active{transition:opacity 0.2s}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0}
</style>