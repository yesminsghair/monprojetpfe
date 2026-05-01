<template>
  <div class="page-content">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h2>Mes livrables</h2>
        <p class="subtitle">Déposez vos documents — seules les phases activées par le chef sont accessibles</p>
      </div>
      <div class="kpi-row">
        <div class="kpi kpi-ok"><strong>{{ nValides }}</strong><span>Validé(s)</span></div>
        <div class="kpi kpi-warn"><strong>{{ nAttente }}</strong><span>En attente</span></div>
        <div class="kpi kpi-ko"><strong>{{ nRejetes }}</strong><span>Rejeté(s)</span></div>
      </div>
    </div>

    <!-- TOAST -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="'toast-'+toast.type">
        {{ toast.msg }}
        <button @click="toast.show=false" class="toast-x">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </transition>

    <!-- LOADING -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement des données...</p>
    </div>

    <!-- MAIN CONTENT -->
    <template v-else>
      <div class="main-layout">

        <!-- LEFT col: Phase 0 Sujet — always visible -->
        <div class="sujet-col">
          <div class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Sujet de projet
          </div>

          <!-- Mode manuel: read-only from demande -->
          <div v-if="isManuel" class="sujet-card sujet-valide">
            <div class="sujet-card-top">
              <span class="sujet-label">Phase 0</span>
              <span class="sujet-badge sb-valide">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                Accord mutuel
              </span>
            </div>
            <div v-if="projet && projet.titre">
              <div class="sujet-titre">{{ projet.titre }}</div>
              <div class="sujet-desc">{{ projet.description }}</div>
            </div>
            <div v-else class="sujet-hint">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Sujet issu de votre demande d'encadrement — pré-rempli automatiquement.
            </div>
          </div>

          <!-- Validated -->
          <div v-else-if="projet && projet.valide" class="sujet-card sujet-valide">
            <div class="sujet-card-top">
              <span class="sujet-label">Phase 0</span>
              <span class="sujet-badge sb-valide">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                Validé
              </span>
            </div>
            <div class="sujet-titre">{{ projet.titre }}</div>
            <div class="sujet-desc">{{ projet.description }}</div>
          </div>

          <!-- Pending: submitted, not yet validated, not editing -->
          <div v-else-if="projet && !projet.valide && !sujetFormOpen" class="sujet-card sujet-pending">
            <div class="sujet-card-top">
              <span class="sujet-label">Phase 0</span>
              <span class="sujet-badge sb-pending">En attente</span>
            </div>
            <div class="sujet-titre">{{ projet.titre }}</div>
            <div class="sujet-desc">{{ projet.description }}</div>
            <button class="btn-edit-sujet" @click="openSujetForm">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier
            </button>
          </div>

          <!-- Form: new project or editing -->
          <div v-else class="sujet-card sujet-form-card">
            <div class="sujet-card-top">
              <span class="sujet-label">Phase 0</span>
              <span class="sujet-badge sb-todo">{{ sujetFormOpen ? 'Modification' : 'À compléter' }}</span>
            </div>
            <div v-if="affectation && affectation.mode === 'semi'" class="sujet-hint">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Proposez votre sujet — il sera validé par votre encadrant.
            </div>
            <div class="sujet-fields">
              <label class="field-label">Titre <span class="required">*</span></label>
              <input v-model="sujetForm.titre" class="field-input" placeholder="Titre du projet..." />
              <label class="field-label" style="margin-top:10px">Description <span class="required">*</span></label>
              <textarea v-model="sujetForm.description" class="field-textarea" rows="3" placeholder="Objectifs, méthodologie, livrables..."></textarea>
              <div class="sujet-actions">
                <button v-if="sujetFormOpen" class="btn-annuler" @click="sujetFormOpen = false">Annuler</button>
                <button class="btn-confirmer" :disabled="sujetSaving" @click="soumettreProjet">
                  <svg v-if="!sujetSaving" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <div v-else class="spinner-sm"></div>
                  {{ projet ? 'Enregistrer' : 'Confirmer' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT col: Phases / Livrables -->
        <div class="phases-col">
          <div class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Livrables par phase
          </div>

          <div v-if="!phases.length" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <p>Aucune phase activée pour le moment.</p>
            <p class="empty-sub">Vous serez notifié(e) dès qu'une phase sera ouverte.</p>
          </div>

          <div v-else class="phases-grid">
            <div
              v-for="phase in phases"
              :key="phase.id"
              class="phase-card"
              :class="{ 'pc-active': phase.active && !phase.terminee, 'pc-done': phase.terminee }"
            >
              <div class="pc-bar"></div>
              <div class="pc-top">
                <span class="pc-num">Phase {{ phase.ordre }}</span>
                <span class="pc-badge" :class="{ 'pb-active': phase.active && !phase.terminee, 'pb-done': phase.terminee }">
                  {{ phase.terminee ? 'Terminée' : 'En cours' }}
                </span>
              </div>
              <div class="pc-nom">{{ phase.nom }}</div>
              <div class="pc-dates">{{ phase.dateDebut }} — {{ phase.dateFin }}</div>

              <div v-if="!phase.livrableObligatoire" class="pc-no-lv">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Aucun livrable requis
              </div>

              <template v-if="phase.livrableObligatoire">
                <div v-if="phase.livrable" class="lv-area">
                  <div class="lv-file">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <div class="lv-info">
                      <div class="lv-nom">{{ phase.livrable.fileName }}</div>
                      <div class="lv-date">{{ phase.livrable.dateDepot }}</div>
                    </div>
                  </div>
                  <span class="lv-status" :class="{ 'ls-wait': phase.livrable.statut==='en_attente', 'ls-ok': phase.livrable.statut==='valide', 'ls-ko': phase.livrable.statut==='rejete' }">
                    {{ { en_attente:'En attente', valide:'Validé', rejete:'Rejeté' }[phase.livrable.statut] || phase.livrable.statut }}
                  </span>
                  <div v-if="phase.livrable.statut==='rejete' && phase.livrable.commentaire" class="lv-comment">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {{ phase.livrable.commentaire }}
                  </div>
                  <label v-if="phase.livrable.statut!=='valide' && !phase.terminee" :for="'f'+phase.id" class="btn-modifier">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Remplacer
                  </label>
                  <button v-if="phase.livrable.statut==='en_attente' && !phase.livrable.verrouille && !phase.terminee" class="btn-retirer" @click="retirerLivrable(phase)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    Retirer
                  </button>
                  <input type="file" :id="'f'+phase.id" accept="application/pdf" @change="upload($event,phase)" style="display:none" />
                </div>

                <div v-else class="depot-area">
                  <label v-if="!phase.terminee" :for="'f'+phase.id" class="btn-depot">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Déposer un livrable PDF
                  </label>
                  <div v-else class="lv-missed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Phase terminée sans livrable
                  </div>
                  <input type="file" :id="'f'+phase.id" accept="application/pdf" @change="upload($event,phase)" style="display:none" />
                </div>
              </template>

              <div v-if="phase.terminee" class="pc-done-bar">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Phase complète
              </div>
            </div>
          </div>

        </div>
      </div>
    </template>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'LivrablesEtudiant',
  data() {
    return {
      toast:         { show: false, msg: '', type: 'ok' },
      phases:        [],
      loading:       false,
      affectation:   null,
      projet:        null,
      sujetFormOpen: false,
      sujetSaving:   false,
      sujetForm:     { titre: '', description: '' }
    }
  },
  computed: {
    nValides()  { return this.phases.filter(p => p.livrable?.statut === 'valide').length },
    nAttente()  { return this.phases.filter(p => p.livrable?.statut === 'en_attente').length },
    nRejetes()  { return this.phases.filter(p => p.livrable?.statut === 'rejete').length },
    isManuel()  { return this.affectation?.mode === 'manuel' }
  },
  mounted() { this.chargerDonnees() },
  methods: {
    async chargerDonnees() {
      this.loading = true
      try {
        const [resPhases, resLivrables, resAff, resProjet] = await Promise.all([
          api.get('/phases'),
          api.get('/livrables').catch(() => ({ data: [] })),
          api.get('/affectations/mon-affectation').catch(() => ({ data: null })),
          api.get('/projets/mon-projet').catch(() => ({ data: null }))
        ])
        this.affectation = resAff.data || null
        const p = resProjet.data
        this.projet = (p && p.id) ? p : null
        if (this.projet) {
          this.sujetForm.titre       = this.projet.titre       || ''
          this.sujetForm.description = this.projet.description || ''
        }
        const livrablesMap = {}
        ;(resLivrables.data || []).forEach(l => {
          livrablesMap[l.phase_id] = {
            id:          l.id,
            fileName:    l.file_name || (l.fichier ? l.fichier.split('/').pop() : 'fichier.pdf'),
            dateDepot:   this.formatDate(l.depose_le),
            statut:      l.statut,
            commentaire: l.commentaire ?? null,
            verrouille:  l.verrouille ?? false,
          }
        })
        // Filter out sujet-type phases — Phase 0 is always rendered from the hardcoded card above
        this.phases = (resPhases.data || [])
          .filter(p => p.type !== 'sujet')
          .map(p => ({
            id:                  p.id,
            ordre:               p.ordre,
            nom:                 p.nom,
            dateDebut:           this.formatDate(p.date_debut),
            dateFin:             this.formatDate(p.date_fin),
            active:              !!p.active,
            terminee:            !!p.terminee,
            livrableObligatoire: !!p.livrable_obligatoire,
            livrable:            livrablesMap[p.id] || null
          }))
      } catch (error) {
        console.error('Erreur livrables:', error)
        this.showToast('Erreur de chargement', 'err')
      } finally {
        this.loading = false
      }
    },

    openSujetForm() {
      if (this.projet) {
        this.sujetForm.titre       = this.projet.titre       || ''
        this.sujetForm.description = this.projet.description || ''
      }
      this.sujetFormOpen = true
    },

    async soumettreProjet() {
      if (!this.sujetForm.titre.trim() || !this.sujetForm.description.trim()) {
        this.showToast('Veuillez remplir le titre et la description.', 'err')
        return
      }
      this.sujetSaving = true
      try {
        if (this.projet && this.projet.id) {
          const res = await api.put(`/projets/${this.projet.id}`, {
            titre:       this.sujetForm.titre,
            description: this.sujetForm.description
          })
          this.projet = res.data
          this.showToast('Sujet mis à jour ✓')
        } else {
          const res = await api.post('/projets', {
            titre:       this.sujetForm.titre,
            description: this.sujetForm.description
          })
          this.projet = res.data
          this.showToast('Sujet soumis — en attente de validation ✓')
        }
        this.sujetFormOpen = false
      } catch (error) {
        this.showToast(error.response?.data?.message || 'Erreur lors de la soumission', 'err')
      } finally {
        this.sujetSaving = false
      }
    },

    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      if (isNaN(d)) return date
      return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
    },

    async retirerLivrable(phase) {
      if (!confirm('Retirer ce livrable ?')) return
      try {
        await api.delete(`/livrables/${phase.livrable.id}`)
        await this.chargerDonnees()
        this.showToast('Livrable retiré ✓')
      } catch (error) {
        this.showToast(error.response?.data?.message || 'Impossible de retirer le livrable', 'err')
      }
    },

    async upload(e, phase) {
      const file = e.target.files[0]
      if (!file || file.type !== 'application/pdf') {
        this.showToast('Fichier PDF uniquement', 'err')
        return
      }
      const formData = new FormData()
      formData.append('phase_id', phase.id)
      formData.append('fichier', file)
      try {
        await api.post('/livrables', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        await this.chargerDonnees()
        this.showToast(`Livrable déposé pour "${phase.nom}" ✓`)
      } catch (error) {
        this.showToast(error.response?.data?.message || 'Erreur lors du dépôt', 'err')
      }
      e.target.value = ''
    },

    showToast(msg, type = 'ok') {
      this.toast = { show: true, msg, type }
      setTimeout(() => (this.toast.show = false), 3200)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
.page-content { font-family: 'Source Sans 3', sans-serif; color: #1e2a35; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
h2 { font-family: 'Merriweather', serif; font-size: 1.4rem; font-weight: 700; color: #1e2a35; margin-bottom: 4px; }
.subtitle { font-size: 0.88rem; color: #8a9aaa; font-weight: 300; }
.kpi-row { display: flex; gap: 10px; flex-wrap: wrap; }
.kpi { display: flex; flex-direction: column; align-items: center; padding: 8px 16px; border-radius: 10px; border: 1.5px solid; gap: 2px; }
.kpi strong { font-family: 'Merriweather', serif; font-size: 1.4rem; font-weight: 700; line-height: 1; }
.kpi span { font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
.kpi-ok   { background: #d4edda; border-color: #c3e6cb; } .kpi-ok   strong, .kpi-ok   span { color: #155724; }
.kpi-warn { background: #fff3cd; border-color: #ffc107; } .kpi-warn strong, .kpi-warn span { color: #856404; }
.kpi-ko   { background: #f8d7da; border-color: #f5c6cb; } .kpi-ko   strong, .kpi-ko   span { color: #721c24; }
.toast { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 10px; margin-bottom: 14px; font-size: 0.86rem; font-weight: 500; border: 1.5px solid; }
.toast-ok  { background: #e8f5e9; color: #155724; border-color: #c3e6cb; }
.toast-err { background: #f8d7da; color: #721c24; border-color: #f5c6cb; }
.toast-x { background: none; border: none; cursor: pointer; color: inherit; opacity: .6; display: flex; align-items: center; }
.toast-enter-active, .toast-leave-active { transition: all .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-6px); }
.loading-state { text-align: center; padding: 60px; color: #8a9aaa; }
.spinner { width: 30px; height: 30px; border: 3px solid #c8c4bc; border-top-color: #3d6080; border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 12px; }
.spinner-sm { width: 12px; height: 12px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
.main-layout { display: flex; gap: 16px; align-items: flex-start; }
.sujet-col { flex: 0 0 250px; min-width: 0; }
.phases-col { flex: 1; min-width: 0; }
.section-title { display: flex; align-items: center; gap: 7px; font-size: 0.72rem; font-weight: 700; color: #2f4f6a; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; padding-bottom: 7px; border-bottom: 1.5px solid #c8c4bc; }
.sujet-card { background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 12px; overflow: hidden; }
.sujet-card-top { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px 8px; }
.sujet-label { font-size: 0.67rem; font-weight: 700; color: #8a9aaa; text-transform: uppercase; letter-spacing: .06em; }
.sujet-badge { font-size: 0.67rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; display: flex; align-items: center; gap: 4px; }
.sb-valide  { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.sb-pending { background: #fff3cd; color: #856404; border: 1px solid #ffc107; }
.sb-todo    { background: #fff3cd; color: #856404; border: 1px solid #e0a800; }
.sujet-valide  { border-color: #c3e6cb; } .sujet-valide  .sujet-card-top { background: rgba(212,237,218,.3); }
.sujet-pending { border-color: #ffc107; } .sujet-pending .sujet-card-top { background: rgba(255,243,205,.3); }
.sujet-titre { font-family: 'Merriweather', serif; font-size: 0.8rem; font-weight: 700; color: #1e2a35; padding: 0 12px 4px; line-height: 1.4; }
.sujet-desc  { font-size: 0.76rem; color: #4a5a6a; padding: 0 12px 10px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.sujet-hint  { display: flex; align-items: flex-start; gap: 6px; font-size: 0.74rem; color: #4a7090; background: rgba(74,112,144,.07); border-top: 1px solid rgba(74,112,144,.12); padding: 7px 12px; line-height: 1.4; }
.sujet-fields { padding: 0 12px 12px; }
.field-label  { display: block; font-size: 0.74rem; font-weight: 600; color: #4a5a6a; margin-bottom: 4px; margin-top: 10px; }
.required { color: #c0392b; }
.field-input { width: 100%; padding: 7px 10px; background: #f5f3f0; border: 1.5px solid #c8c4bc; border-radius: 8px; font-size: 0.8rem; font-family: 'Source Sans 3', sans-serif; color: #1e2a35; outline: none; transition: .2s; }
.field-input:focus { border-color: #4a7090; background: #fff; }
.field-textarea { width: 100%; padding: 7px 10px; background: #f5f3f0; border: 1.5px solid #c8c4bc; border-radius: 8px; font-size: 0.8rem; font-family: 'Source Sans 3', sans-serif; color: #1e2a35; outline: none; transition: .2s; resize: vertical; min-height: 68px; }
.field-textarea:focus { border-color: #4a7090; background: #fff; }
.sujet-actions { display: flex; justify-content: flex-end; gap: 7px; margin-top: 10px; }
.btn-confirmer { display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: linear-gradient(160deg,#4a7090,#2f4f6a); color: #fff; border: none; border-radius: 8px; font-size: 0.76rem; font-weight: 700; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: .2s; }
.btn-confirmer:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(47,79,106,.28); }
.btn-confirmer:disabled { opacity: .6; cursor: not-allowed; }
.btn-annuler { padding: 6px 12px; background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 8px; font-size: 0.76rem; font-weight: 600; color: #4a5a6a; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: .18s; }
.btn-annuler:hover { border-color: #3d6080; color: #3d6080; }
.btn-edit-sujet { display: flex; align-items: center; gap: 6px; margin: 0 12px 10px; padding: 6px 12px; background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 8px; font-size: 0.74rem; font-weight: 600; color: #4a5a6a; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: .18s; }
.btn-edit-sujet:hover { border-color: #4a7090; color: #4a7090; }
.empty-state { text-align: center; padding: 40px 20px; color: #8a9aaa; background: #e8e4dc; border: 2px dashed #c8c4bc; border-radius: 12px; }
.empty-state svg { opacity: .4; margin-bottom: 12px; }
.empty-state p { font-size: 13px; margin-bottom: 4px; }
.empty-sub { font-size: 12px; opacity: .7; }
.phases-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
.phase-card { background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 12px; overflow: hidden; position: relative; transition: .2s; }
.phase-card:hover { box-shadow: 0 5px 18px rgba(0,0,0,.09); }
.pc-bar { height: 3px; }
.pc-active .pc-bar { background: linear-gradient(90deg,#f5a623,#d98e1a); }
.pc-done   .pc-bar { background: linear-gradient(90deg,#27ae60,#1e8449); }
.pc-top { display: flex; justify-content: space-between; align-items: center; padding: 11px 13px 0; }
.pc-num { font-size: 0.67rem; font-weight: 700; color: #8a9aaa; text-transform: uppercase; letter-spacing: .06em; }
.pc-badge { font-size: 0.67rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
.pb-active { background: #fff3cd; color: #856404; border: 1px solid #ffc107; }
.pb-done   { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.pc-nom   { font-family: 'Merriweather', serif; font-size: 0.82rem; font-weight: 700; color: #1e2a35; padding: 8px 13px 3px; line-height: 1.35; }
.pc-dates { font-size: 0.73rem; color: #8a9aaa; font-weight: 300; padding: 0 13px 11px; }
.pc-no-lv { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #155724; background: #d4edda; border-top: 1px solid #c3e6cb; padding: 8px 12px; }
.depot-area { padding: 0 13px 13px; }
.btn-depot { display: flex; align-items: center; justify-content: center; gap: 7px; width: 100%; padding: 9px; background: linear-gradient(160deg,#f5a623,#d98e1a); color: #1e2a35; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: .2s; box-shadow: 0 3px 8px rgba(245,166,35,.22); }
.btn-depot:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(245,166,35,.32); }
.lv-missed { display: flex; align-items: center; gap: 6px; font-size: 0.76rem; color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 8px 10px; justify-content: center; }
.lv-area { padding: 0 13px 12px; display: flex; flex-direction: column; gap: 7px; }
.lv-file { display: flex; align-items: center; gap: 8px; background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 8px; padding: 8px 10px; }
.lv-info { flex: 1; min-width: 0; }
.lv-nom  { font-size: 0.78rem; font-weight: 600; color: #1e2a35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lv-date { font-size: 0.7rem; color: #8a9aaa; }
.lv-status { font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-align: center; }
.ls-wait { background: #fff3cd; color: #856404; border: 1px solid #ffc107; }
.ls-ok   { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.ls-ko   { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
.lv-comment { font-size: 0.74rem; color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 7px; padding: 7px 9px; display: flex; align-items: flex-start; gap: 5px; }
.btn-modifier { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 7px; background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 8px; font-size: 0.76rem; font-weight: 600; color: #4a5a6a; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: .18s; }
.btn-modifier:hover { border-color: #3d6080; color: #3d6080; }
.btn-retirer { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 7px; background: #fff0f0; border: 1.5px solid #f5c6cb; border-radius: 8px; font-size: 0.76rem; font-weight: 600; color: #721c24; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: .18s; width: 100%; }
.btn-retirer:hover { border-color: #c0392b; color: #c0392b; background: #f8d7da; }
.pc-done-bar { display: flex; align-items: center; gap: 6px; font-size: 0.74rem; font-weight: 700; color: #155724; background: #d4edda; border-top: 1px solid #c3e6cb; padding: 8px 12px; }
</style>