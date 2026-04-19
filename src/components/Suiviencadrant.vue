<template>
<div class="page-content">

  <div class="page-header">
    <div>
      <h2>Suivi des étudiants</h2>
      <p class="subtitle">Avancement par phase — validez ou rejetez le travail de chaque étudiant</p>
    </div>
    <div class="filter-bar">
      <button v-for="f in filtres" :key="f.val" class="filter-btn"
        :class="{active: filtreActif===f.val}"
        @click="filtreActif=f.val">{{ f.label }}
      </button>
    </div>
  </div>

  <transition name="toast">
    <div v-if="toast.show" class="toast" :class="'toast-'+toast.type">
      {{ toast.msg }}
      <button @click="toast.show=false" class="toast-x">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  </transition>

  <div v-if="loading" class="loading-state">
    <div class="spinner"></div>
    <p>Chargement...</p>
  </div>

  <div v-else-if="!etudiants.length" class="empty-state">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
    <p>Aucun étudiant affecté pour le moment.</p>
  </div>

  <div class="students-grid" v-else>
    <div v-for="e in etudiantsFiltres" :key="e.id"
      class="student-card"
      :class="{'card-active': e.phaseActive, 'card-done': e.termineTotal}">

      <div class="sc-top">
        <div class="sc-av" :style="{background: e.color}">{{ initials(e.nom) }}</div>
        <div class="sc-info">
          <div class="sc-nom">{{ e.nom }}</div>
          <div class="sc-sujet">{{ e.sujet || '—' }}</div>
        </div>
        <div class="sc-ring" title="Progression globale">
          <svg width="46" height="46" viewBox="0 0 46 46">
            <circle cx="23" cy="23" r="19" fill="none" stroke="#c8c4bc" stroke-width="4"/>
            <circle cx="23" cy="23" r="19" fill="none" :stroke="e.color" stroke-width="4"
              stroke-linecap="round"
              stroke-dasharray="119"
              :stroke-dashoffset="119 - (e.progress / 100 * 119)"
              transform="rotate(-90 23 23)"/>
          </svg>
          <span class="sc-pct">{{ e.progress }}%</span>
        </div>
      </div>

      <div class="sc-phase">
        <span class="sp-lbl">Phase actuelle</span>
        <span class="sp-val">{{ e.phaseActuelle }}</span>
        <span class="sp-badge" :class="e.phaseActive ? 'spb-active' : 'spb-wait'">
          {{ e.phaseActive ? 'En cours' : 'En attente' }}
        </span>
      </div>

      <div class="sc-progress-bar">
        <div class="sc-bar-fill" :style="{width: e.progress+'%', background: e.color}"></div>
      </div>

      <!-- Phase dots -->
      <div class="sc-dots">
        <span v-for="(ph, pi) in e.phases" :key="pi"
          class="pdot"
          :class="{
            'pdot-done':    ph.statut === 'validee',
            'pdot-active':  ph.statut === 'en_cours',
            'pdot-rejected':ph.statut === 'rejetee',
            'pdot-future':  ph.statut === 'en_attente' || ph.statut === 'terminee',
          }"
          :title="ph.nom + ' — ' + ph.statut">
        </span>
      </div>

      <div class="sc-actions">
        <!-- Valider: only when phase is active (en_cours) -->
        <button class="btn-act btn-valider" @click="validerPhase(e)" :disabled="!e.phaseActive">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Valider phase
        </button>
        <!-- Rejeter: only when phase is active (en_cours) -->
        <button class="btn-act btn-rejeter" @click="openRejet(e)" :disabled="!e.phaseActive">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Rejeter phase
        </button>
        <button class="btn-act btn-hist" @click="voirHistorique(e)">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Historique
        </button>
      </div>

      <!-- LIVRABLES SECTION -->
      <div class="sc-livrables" v-if="livrablesParEtudiant(e.etudiant_id).length">
        <div class="lv-sep">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Livrables déposés
          <span class="lv-count-badge">{{ livrablesParEtudiant(e.etudiant_id).length }}</span>
        </div>
        <div v-for="lv in livrablesParEtudiant(e.etudiant_id)" :key="lv.id" class="lv-row">
          <div class="lv-row-info">
            <div class="lv-phase-name">{{ lv.phase_nom }}</div>
            <div class="lv-file-name">📎 {{ lv.file_name }}</div>
            <div class="lv-date">{{ formatDate(lv.depose_le) }}</div>
          </div>
          <span class="lv-badge" :class="'lvb-'+lv.statut">
            {{ {en_attente:'En attente',valide:'Validé ✓',rejete:'Rejeté'}[lv.statut] || lv.statut }}
          </span>
          <div class="lv-row-actions" v-if="lv.statut === 'en_attente'">
            <button class="btn-lv-dl"  @click="telecharger(lv)" title="Télécharger">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
            <button class="btn-lv-ok"  @click="validerLivrable(lv)" title="Valider">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button class="btn-lv-ko"  @click="openRejetLivrable(lv)" title="Rejeter">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="lv-row-actions" v-else>
            <button class="btn-lv-dl" @click="telecharger(lv)" title="Télécharger">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- MODAL REJET -->
  <transition name="modal-fade">
    <div v-if="modalRejet" class="modal-overlay" @click.self="modalRejet=false">
      <div class="modal">
        <div class="modal-hdr">
          <h3>Rejeter la phase — {{ currentEt?.nom }}</h3>
          <button class="modal-close" @click="modalRejet=false">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-phase-info" v-if="currentEt">
            Phase : <strong>{{ currentEt.phaseActuelle }}</strong>
          </p>
          <div class="fg">
            <label>Commentaire de rejet <span class="req">*</span></label>
            <textarea v-model="commentaireRejet"
              placeholder="Expliquez à l'étudiant la raison du rejet..."
              rows="4" class="ta"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="modalRejet=false">Annuler</button>
          <button class="btn-reject" @click="confirmerRejet" :disabled="!commentaireRejet.trim()">
            Confirmer le rejet
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- MODAL REJET LIVRABLE -->
  <transition name="modal-fade">
    <div v-if="modalRejetLv" class="modal-overlay" @click.self="modalRejetLv=false">
      <div class="modal">
        <div class="modal-hdr">
          <h3>Rejeter le livrable — {{ currentLv?.etudiant_nom }}</h3>
          <button class="modal-close" @click="modalRejetLv=false">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-phase-info" v-if="currentLv">
            Phase : <strong>{{ currentLv.phase_nom }}</strong> · Fichier : {{ currentLv.file_name }}
          </p>
          <div class="fg">
            <label>Motif du rejet <span class="req">*</span></label>
            <textarea v-model="commentaireRejetLv"
              placeholder="Expliquez à l'étudiant la raison du rejet du livrable..."
              rows="4" class="ta"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="modalRejetLv=false">Annuler</button>
          <button class="btn-reject" @click="confirmerRejetLivrable" :disabled="!commentaireRejetLv.trim()">
            Confirmer le rejet
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- MODAL HISTORIQUE -->
  <transition name="modal-fade">
    <div v-if="modalHist" class="modal-overlay" @click.self="modalHist=false">
      <div class="modal modal-lg">
        <div class="modal-hdr">
          <h3>Historique — {{ currentEt?.nom }}</h3>
          <button class="modal-close" @click="modalHist=false">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="!historique.length" class="empty-hist">Aucun historique pour cet étudiant.</div>
          <div class="timeline" v-else>
            <div v-for="h in historique" :key="h.id" class="tl-item">
              <div class="tl-dot" :class="'tld-'+h.statut"></div>
              <div class="tl-content">
                <div class="tl-phase">{{ h.phase }}</div>
                <span class="tl-badge" :class="'tlb-'+h.statut">{{ h.statut }}</span>
                <div class="tl-comment" v-if="h.commentaire">{{ h.commentaire }}</div>
                <div class="tl-date">{{ h.date }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="modalHist=false">Fermer</button>
        </div>
      </div>
    </div>
  </transition>

</div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'SuiviEncadrant',
  data() {
    return {
      filtreActif: 'tous',
      filtres: [
        { val: 'tous',    label: 'Tous' },
        { val: 'actif',   label: 'En cours' },
        { val: 'valide',  label: 'Validés' },
        { val: 'attente', label: 'En attente' }
      ],
      etudiants: [],
      livrables: [],
      modalRejet: false,
      modalHist:  false,
      modalRejetLv: false,
      currentEt: null,
      currentLv: null,
      commentaireRejet: '',
      commentaireRejetLv: '',
      historique: [],
      toast: { show: false, msg: '', type: 'ok' },
      loading: false
    }
  },
  computed: {
    etudiantsFiltres() {
      if (this.filtreActif === 'tous')    return this.etudiants
      if (this.filtreActif === 'actif')   return this.etudiants.filter(e => e.phaseActive)
      if (this.filtreActif === 'valide')  return this.etudiants.filter(e => e.termineTotal)
      if (this.filtreActif === 'attente') return this.etudiants.filter(e => !e.phaseActive && !e.termineTotal)
      return this.etudiants
    }
  },
  mounted() {
    this.chargerSuivi()
  },
  methods: {

    async chargerSuivi() {
      this.loading = true
      try {
        const [suiviRes, lvRes] = await Promise.all([
          api.get('/suivi/encadrant'),
          api.get('/livrables/encadrant').catch(() => ({ data: [] }))
        ])
        this.etudiants = suiviRes.data.map(e => ({
          id:           e.id,
          etudiant_id:  e.etudiant_id,
          nom:          e.nom,
          sujet:        e.sujet,
          phases:       e.phases || [],
          phaseActuelle:e.phaseActuelle,
          phaseActive:  e.phaseActive,
          progress:     e.progress,
          color:        this.colorFor(e.id),
          termineTotal: e.termineTotal,
        }))
        this.livrables = lvRes.data || []
      } catch (error) {
        console.error('Erreur chargement suivi:', error)
        this.showToast('Erreur de chargement', 'err')
      } finally {
        this.loading = false
      }
    },

    colorFor(id) {
      const colors = ['#3d6080', '#27ae60', '#d35400', '#8e44ad', '#2980b9', '#c0392b']
      return colors[id % colors.length]
    },

    initials(n) {
      if (!n) return '?'
      return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    },

    // Find the current active phase_id for a student
    getActivePhaseId(e) {
      const active = e.phases.find(p => p.statut === 'en_cours')
      return active?.phase_id ?? null
    },

    async validerPhase(e) {
      const phaseId = this.getActivePhaseId(e)
      if (!phaseId) {
        this.showToast('Aucune phase en cours pour cet étudiant', 'err')
        return
      }
      try {
        await api.post('/suivi/valider', {
          affectation_id: e.id,
          phase_id:       phaseId,
        })
        await this.chargerSuivi()
        this.showToast(`Phase validée pour ${e.nom} ✓`)
      } catch (error) {
        this.showToast(error.response?.data?.error || 'Erreur lors de la validation', 'err')
      }
    },

    openRejet(e) {
      this.currentEt        = e
      this.commentaireRejet = ''
      this.modalRejet       = true
    },

    async confirmerRejet() {
      if (!this.commentaireRejet.trim()) {
        this.showToast('Commentaire requis', 'err')
        return
      }
      const phaseId = this.getActivePhaseId(this.currentEt)
      if (!phaseId) {
        this.showToast('Aucune phase en cours', 'err')
        return
      }
      try {
        await api.post('/suivi/rejeter', {
          affectation_id:        this.currentEt.id,
          phase_id:              phaseId,
          commentaire_encadrant: this.commentaireRejet,
        })
        await this.chargerSuivi()
        this.modalRejet = false
        this.showToast(`Phase de ${this.currentEt.nom} rejetée`, 'err')
      } catch (error) {
        this.showToast(error.response?.data?.error || 'Erreur lors du rejet', 'err')
      }
    },

    async voirHistorique(e) {
      this.currentEt  = e
      this.historique = []
      try {
        const res       = await api.get(`/suivi/historique/${e.id}`)
        this.historique = res.data
      } catch {
        this.historique = []
      }
      this.modalHist = true
    },

    livrablesParEtudiant(etudiantId) {
      return this.livrables.filter(lv => lv.etudiant_id === etudiantId)
    },

    formatDate(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('fr-FR')
    },

    telecharger(lv) {
      window.open(`/api/livrables/${lv.id}/download`, '_blank')
    },

    async validerLivrable(lv) {
      try {
        await api.put(`/livrables/${lv.id}/valider`)
        await this.chargerSuivi()
        this.showToast(`Livrable de ${lv.etudiant_nom} validé ✓`)
      } catch (err) {
        this.showToast(err.response?.data?.message || 'Erreur', 'err')
      }
    },

    openRejetLivrable(lv) {
      this.currentLv          = lv
      this.commentaireRejetLv = ''
      this.modalRejetLv       = true
    },

    async confirmerRejetLivrable() {
      if (!this.commentaireRejetLv.trim()) {
        this.showToast('Commentaire requis', 'err')
        return
      }
      try {
        await api.put(`/livrables/${this.currentLv.id}/rejeter`, {
          commentaire: this.commentaireRejetLv,
        })
        await this.chargerSuivi()
        this.modalRejetLv = false
        this.showToast(`Livrable de ${this.currentLv.etudiant_nom} rejeté`)
      } catch (err) {
        this.showToast(err.response?.data?.message || 'Erreur', 'err')
      }
    },

    showToast(msg, type = 'ok') {
      this.toast = { show: true, msg, type }
      setTimeout(() => (this.toast.show = false), 3000)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.page-content { font-family: 'Source Sans 3', sans-serif; color: #1e2a35; }
.page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; gap:16px; flex-wrap:wrap; }
h2 { font-family:'Merriweather',serif; font-size:1.4rem; font-weight:700; color:#1e2a35; margin-bottom:4px; }
.subtitle { font-size:0.88rem; color:#8a9aaa; font-weight:300; }
.filter-bar { display:flex; gap:8px; flex-wrap:wrap; }
.filter-btn { padding:7px 16px; border:1.5px solid #c8c4bc; border-radius:20px; background:#ddd9d1; font-size:0.82rem; font-weight:600; color:#4a5a6a; cursor:pointer; font-family:'Source Sans 3',sans-serif; transition:.18s; }
.filter-btn:hover { border-color:#3d6080; color:#3d6080; }
.filter-btn.active { background:linear-gradient(160deg,#4a7090,#3d6080); color:#fff; border-color:transparent; }
.toast { display:flex; justify-content:space-between; align-items:center; padding:11px 16px; border-radius:10px; margin-bottom:16px; font-size:0.88rem; font-weight:500; border:1.5px solid; }
.toast-ok  { background:#e8f5e9; color:#155724; border-color:#c3e6cb; }
.toast-err { background:#f8d7da; color:#721c24; border-color:#f5c6cb; }
.toast-x { background:none; border:none; cursor:pointer; color:inherit; opacity:.6; display:flex; align-items:center; }
.toast-enter-active, .toast-leave-active { transition:all .25s; }
.toast-enter-from, .toast-leave-to { opacity:0; transform:translateY(-6px); }
.loading-state { text-align:center; padding:60px; color:#8a9aaa; }
.spinner { width:32px; height:32px; border:3px solid #c8c4bc; border-top-color:#3d6080; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 12px; }
@keyframes spin { to { transform:rotate(360deg); } }
.empty-state { text-align:center; padding:60px; color:#8a9aaa; background:#e8e4dc; border:2px dashed #c8c4bc; border-radius:14px; }
.empty-state svg { opacity:.4; margin-bottom:12px; }
.students-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
.student-card { background:#e8e4dc; border:1.5px solid #c8c4bc; border-radius:14px; padding:18px; box-shadow:0 2px 10px rgba(0,0,0,.06); transition:box-shadow .2s,transform .2s; border-top:3px solid #c8c4bc; }
.student-card:hover { box-shadow:0 6px 22px rgba(0,0,0,.1); transform:translateY(-2px); }
.card-active { border-top-color:#f5a623; }
.card-done   { border-top-color:#27ae60; }
.sc-top { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
.sc-av { width:40px; height:40px; border-radius:10px; color:#fff; font-weight:700; font-size:0.88rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-family:'Merriweather',serif; }
.sc-nom   { font-weight:700; font-size:0.92rem; color:#1e2a35; }
.sc-sujet { font-size:0.78rem; color:#8a9aaa; margin-top:2px; font-weight:300; }
.sc-ring  { position:relative; margin-left:auto; width:46px; height:46px; flex-shrink:0; }
.sc-pct   { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:0.68rem; font-weight:700; color:#1e2a35; }
.sc-phase { display:flex; align-items:center; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
.sp-lbl   { font-size:0.72rem; font-weight:700; color:#8a9aaa; text-transform:uppercase; letter-spacing:.05em; white-space:nowrap; }
.sp-val   { font-size:0.85rem; font-weight:600; color:#1e2a35; flex:1; }
.sp-badge { font-size:0.72rem; font-weight:700; padding:3px 9px; border-radius:20px; white-space:nowrap; }
.spb-active { background:#fff3cd; color:#856404; border:1px solid #ffc107; }
.spb-wait   { background:#ddd9d1; color:#8a9aaa; border:1px solid #c8c4bc; }
.sc-progress-bar { height:5px; background:#c8c4bc; border-radius:10px; overflow:hidden; margin-bottom:8px; }
.sc-bar-fill { height:100%; border-radius:10px; transition:width .5s ease; }
.sc-dots { display:flex; gap:4px; margin-bottom:14px; flex-wrap:wrap; }
.pdot { width:9px; height:9px; border-radius:50%; display:inline-block; transition:background .3s; }
.pdot-done     { background:#27ae60; }
.pdot-active   { background:#f5a623; box-shadow:0 0 4px rgba(245,166,35,.5); }
.pdot-rejected { background:#e74c3c; }
.pdot-future   { background:#c8c4bc; }
.sc-actions { display:flex; gap:7px; flex-wrap:wrap; }
.btn-act { display:inline-flex; align-items:center; gap:5px; padding:6px 12px; border-radius:8px; font-size:0.78rem; font-weight:600; border:1.5px solid; cursor:pointer; font-family:'Source Sans 3',sans-serif; transition:.15s; }
.btn-act:disabled { opacity:.35; cursor:not-allowed; }
.btn-valider { background:#d4edda; color:#155724; border-color:#c3e6cb; }
.btn-valider:hover:not(:disabled) { background:#27ae60; color:#fff; border-color:#27ae60; }
.btn-rejeter { background:#f8d7da; color:#c0392b; border-color:#f5c6cb; }
.btn-rejeter:hover:not(:disabled) { background:#e74c3c; color:#fff; border-color:#e74c3c; }
.btn-hist    { background:#fff3cd; color:#856404; border-color:#ffc107; }
.btn-hist:hover { background:#f5a623; color:#1e2a35; border-color:#f5a623; }
/* MODAL */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; }
.modal { background:#ddd9d1; border-radius:16px; width:100%; max-width:480px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.25); }
.modal-lg { max-width:560px; }
.modal-hdr { display:flex; justify-content:space-between; align-items:center; padding:20px 24px 0; gap:10px; }
.modal-hdr h3 { font-family:'Merriweather',serif; font-size:1rem; color:#1e2a35; flex:1; }
.modal-close { background:none; border:none; cursor:pointer; color:#8a9aaa; display:flex; align-items:center; transition:color .15s; }
.modal-close:hover { color:#1e2a35; }
.modal-body { padding:20px 24px; }
.modal-phase-info { font-size:13px; color:#4a5a6a; background:#e8e4dc; border:1.5px solid #c8c4bc; border-radius:8px; padding:9px 13px; margin-bottom:14px; }
.modal-footer { padding:16px 24px; border-top:1px solid #c8c4bc; display:flex; justify-content:flex-end; gap:10px; }
.fg { display:flex; flex-direction:column; gap:6px; }
.fg label { font-size:0.88rem; font-weight:600; color:#2f4f6a; }
.req { color:#e74c3c; }
.ta { padding:10px 12px; border:1.5px solid #c8c4bc; border-radius:9px; background:#e8e4dc; font-size:0.9rem; color:#1e2a35; font-family:'Source Sans 3',sans-serif; resize:vertical; transition:.18s; }
.ta:focus { outline:none; border-color:#e74c3c; background:#fff; }
.btn-cancel { padding:10px 18px; background:#c8c4bc; border:1.5px solid #b0aba2; border-radius:9px; font-size:0.88rem; font-weight:600; cursor:pointer; color:#4a5a6a; font-family:'Source Sans 3',sans-serif; transition:.15s; }
.btn-cancel:hover { background:#b0aba2; }
.btn-reject { padding:10px 18px; background:#e74c3c; border:none; border-radius:9px; font-size:0.88rem; font-weight:700; cursor:pointer; color:#fff; font-family:'Source Sans 3',sans-serif; transition:.18s; }
.btn-reject:hover:not(:disabled) { background:#c0392b; }
.btn-reject:disabled { opacity:.4; cursor:not-allowed; }
.empty-hist { text-align:center; padding:24px; color:#8a9aaa; font-size:0.88rem; }
.modal-fade-enter-active, .modal-fade-leave-active { transition:opacity .2s, transform .2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity:0; transform:scale(.97); }
/* LIVRABLES IN CARD */
.sc-livrables { margin-top:12px; border-top:1.5px solid #c8c4bc; padding-top:10px; display:flex; flex-direction:column; gap:8px; }
.lv-sep { display:flex; align-items:center; gap:6px; font-size:0.72rem; font-weight:700; color:#4a5a6a; text-transform:uppercase; letter-spacing:.06em; margin-bottom:2px; }
.lv-count-badge { background:#3d6080; color:#fff; font-size:10px; font-weight:700; padding:1px 7px; border-radius:99px; }
.lv-row { background:#ddd9d1; border:1.5px solid #c8c4bc; border-radius:10px; padding:9px 11px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.lv-row-info { flex:1; min-width:0; }
.lv-phase-name { font-size:0.82rem; font-weight:700; color:#1e2a35; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.lv-file-name  { font-size:0.75rem; color:#4a5a6a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.lv-date       { font-size:0.72rem; color:#8a9aaa; }
.lv-badge { font-size:0.72rem; font-weight:700; padding:3px 9px; border-radius:20px; white-space:nowrap; }
.lvb-en_attente { background:#fff3cd; color:#856404; border:1px solid #ffc107; }
.lvb-valide     { background:#d4edda; color:#155724; border:1px solid #c3e6cb; }
.lvb-rejete     { background:#f8d7da; color:#721c24; border:1px solid #f5c6cb; }
.lv-row-actions { display:flex; gap:5px; flex-shrink:0; }
.btn-lv-dl, .btn-lv-ok, .btn-lv-ko { width:28px; height:28px; border:1.5px solid; border-radius:7px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.15s; }
.btn-lv-dl { background:#e8e4dc; border-color:#c8c4bc; color:#4a5a6a; }
.btn-lv-dl:hover { background:#3d6080; color:#fff; border-color:#3d6080; }
.btn-lv-ok { background:#d4edda; border-color:#c3e6cb; color:#155724; }
.btn-lv-ok:hover { background:#27ae60; color:#fff; border-color:#27ae60; }
.btn-lv-ko { background:#f8d7da; border-color:#f5c6cb; color:#c0392b; }
.btn-lv-ko:hover { background:#e74c3c; color:#fff; border-color:#e74c3c; }
.timeline { display:flex; flex-direction:column; gap:14px; }
.tl-item { display:flex; gap:14px; align-items:flex-start; }
.tl-dot { width:13px; height:13px; border-radius:50%; flex-shrink:0; margin-top:4px; background:#c8c4bc; }
.tld-validee { background:#27ae60; box-shadow:0 0 6px rgba(39,174,96,.4); }
.tld-rejetee { background:#e74c3c; box-shadow:0 0 6px rgba(231,76,60,.4); }
.tld-en_cours { background:#f5a623; }
.tl-content { flex:1; background:#e8e4dc; border:1.5px solid #c8c4bc; border-radius:10px; padding:11px 14px; }
.tl-phase   { font-weight:700; font-size:0.88rem; color:#1e2a35; margin-bottom:5px; }
.tl-badge   { font-size:0.75rem; font-weight:700; padding:2px 9px; border-radius:20px; display:inline-block; margin-bottom:5px; background:#e8e4dc; color:#4a5a6a; border:1px solid #c8c4bc; }
.tlb-validee { background:#d4edda; color:#155724; border:1px solid #c3e6cb; }
.tlb-rejetee { background:#f8d7da; color:#721c24; border:1px solid #f5c6cb; }
.tl-comment { font-size:0.8rem; color:#8a9aaa; font-style:italic; margin-bottom:4px; }
.tl-date    { font-size:0.75rem; color:#c8c4bc; }
</style>