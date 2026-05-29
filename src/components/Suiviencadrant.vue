<template>
<div>

  <!-- HEADER -->
  <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
    <div>
      <h2 class="vld-page-title">Suivi des étudiants</h2>
      <p class="sec-subtitle">Avancement par phase — validez ou rejetez le travail de chaque étudiant</p>
    </div>
    <div class="filter-bar">
      <button
        v-for="f in filtres" :key="f.val"
        class="filter-btn" :class="{ active: filtreActif === f.val }"
        @click="filtreActif = f.val">
        {{ f.label }}
      </button>
    </div>
  </div>

  <!-- TOAST -->
  <Transition name="toast">
    <div v-if="toast.show" class="vld-toast-wrap">
      <div class="sec-toast" :class="toast.type === 'ok' ? 'sec-toast--ok' : 'sec-toast--err'">
        {{ toast.msg }}
        <button class="sec-toast__x" @click="toast.show = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  </Transition>

  <!-- LOADING -->
  <div v-if="loading" class="vld-state">
    <div class="vld-spinner mx-auto mb-3"></div>
    <p>Chargement...</p>
  </div>

  <!-- EMPTY -->
  <div v-else-if="!etudiantsFiltres.length" class="vld-state">
    <div class="vld-state__icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
    </div>
    <p class="vld-state__title">Aucun étudiant dans cette catégorie</p>
  </div>

  <!-- STUDENTS GRID -->
  <div v-else class="students-grid">
    <div
      v-for="e in etudiantsFiltres" :key="e.id"
      class="student-card"
      :class="{ 'student-card--active': e.phaseActive, 'student-card--done': e.termineTotal }">

      <!-- Top row -->
      <div class="sc-top">
        <div class="sc-av" :style="{ background: e.color }">{{ initials(e.nom) }}</div>
        <div class="sc-info">
          <div class="sc-nom">{{ e.nom }}</div>
          <div class="sc-sujet">{{ e.sujet || '—' }}</div>
        </div>
        <div class="sc-ring" :title="e.progress + '% accompli'">
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

      <!-- Phase info -->
      <div class="sc-phase">
        <span class="sp-lbl">Phase actuelle</span>
        <span class="sp-val">{{ e.phaseActuelle || '—' }}</span>
        <span class="sp-badge"
          :class="e.termineTotal ? 'sp-badge--done' : e.phaseActive ? 'sp-badge--active' : 'sp-badge--wait'">
          {{ e.termineTotal ? 'Terminé' : e.phaseActive ? 'En cours' : 'En attente' }}
        </span>
      </div>

      <!-- Progress bar -->
      <div class="sc-progress-bar">
        <div class="sc-bar-fill" :style="{ width: e.progress + '%', background: e.color }"></div>
      </div>

      <!-- Phase dots -->
      <div class="sc-dots">
        <span
          v-for="(ph, pi) in e.phases" :key="pi"
          class="pdot"
          :class="{
            'pdot--done':     ph.statut === 'validee',
            'pdot--active':   ph.statut === 'en_cours',
            'pdot--rejected': ph.statut === 'rejetee',
            'pdot--future':   ph.statut === 'en_attente',
          }"
          :title="ph.phase_nom + ' — ' + ph.statut">
        </span>
      </div>

      <!-- Actions -->
      <div class="sc-actions">
        <button class="btn-act btn-act--validate" :disabled="!e.phaseActive" @click="validerPhase(e)">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Valider phase
        </button>
        <button class="btn-act btn-act--reject" :disabled="!e.phaseActive" @click="openRejet(e)">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Rejeter phase
        </button>
        <button class="btn-act btn-act--history" @click="voirHistorique(e)">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Historique
        </button>
      </div>

      <!-- ─── LIVRABLES SECTION ─── -->
      <div class="sc-livrables" v-if="livrablesDe(e).length">
        <div class="lv-sep">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Livrables déposés
          <span class="lv-count-badge">{{ livrablesDe(e).length }}</span>
        </div>

        <div v-for="lv in livrablesDe(e)" :key="lv.id" class="lv-row">
          <div class="lv-row-info">
            <div class="lv-phase-name">
              {{ lv.phase_nom }}
              <!-- Version chip: shows when student has replaced the file -->
              <span v-if="lv.version > 1" class="lv-enc-version">
                v{{ lv.version }}
                <span class="lv-enc-version__badge">remplacé</span>
              </span>
            </div>
            <div class="lv-file-name">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
              {{ lv.file_name || '—' }}
            </div>
            <div class="lv-date">
              {{ lv.depose_le ? new Date(lv.depose_le).toLocaleDateString('fr-FR') : '' }}
              <span v-if="lv.remplace_le" class="lv-replaced-notice">
                · mis à jour {{ new Date(lv.remplace_le).toLocaleDateString('fr-FR') }}
              </span>
            </div>
          </div>

          <!-- Status badge -->
          <span class="lv-badge"
            :class="lv.statut === 'valide' ? 'lv-badge--ok' : lv.statut === 'rejete' ? 'lv-badge--ko' : 'lv-badge--pending'">
            {{ { en_attente: 'En attente', valide: 'Validé', rejete: 'Rejeté' }[lv.statut] || lv.statut }}
          </span>

          <!-- Actions -->
          <div class="lv-row-actions">
            <!-- Visualise: opens preview modal -->
            <button
              class="btn-lv-icon btn-lv-icon--view"
              title="Visualiser le livrable"
              @click="ouvrirPreview(lv)">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <!-- Validate -->
            <button v-if="lv.statut === 'en_attente'" class="btn-lv-icon btn-lv-icon--ok" title="Valider" @click="validerLivrable(lv)">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <!-- Reject -->
            <button v-if="lv.statut === 'en_attente'" class="btn-lv-icon btn-lv-icon--ko" title="Rejeter" @click="openRejetLv(lv)">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- ═══ Modal: Visualiser livrable ═══ -->
  <Transition name="modal-fade">
    <div v-if="modalPreview" class="modal-overlay" @click.self="modalPreview = false">
      <div class="sec-modal sec-modal--preview">
        <div class="sec-modal__hdr">
          <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <h3 style="margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              {{ previewLv?.file_name || 'Livrable' }}
            </h3>
            <span v-if="previewLv?.version > 1" class="lv-enc-version" style="flex-shrink:0">
              v{{ previewLv.version }}
            </span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
            <!-- Open externally -->
            <a
              v-if="previewLv?.fichier_url"
              :href="previewLv.fichier_url"
              target="_blank"
              class="btn-lv-icon btn-lv-icon--view"
              title="Ouvrir dans un nouvel onglet"
              style="text-decoration:none;">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            <button class="sec-modal__close" @click="modalPreview = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <!-- Meta row -->
        <div class="lv-preview-meta" v-if="previewLv">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            {{ previewEtudiant?.nom }}
          </span>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {{ previewLv.depose_le ? new Date(previewLv.depose_le).toLocaleDateString('fr-FR') : '' }}
            <span v-if="previewLv.remplace_le" class="lv-replaced-notice">
              · remplacé le {{ new Date(previewLv.remplace_le).toLocaleDateString('fr-FR') }}
            </span>
          </span>
          <span class="lv-badge"
            :class="previewLv.statut === 'valide' ? 'lv-badge--ok' : previewLv.statut === 'rejete' ? 'lv-badge--ko' : 'lv-badge--pending'">
            {{ { en_attente: 'En attente', valide: 'Validé', rejete: 'Rejeté' }[previewLv.statut] || previewLv.statut }}
          </span>
        </div>

        <!-- Preview frame: PDF embed or fallback -->
        <div class="lv-preview-frame">
          <iframe
            v-if="previewLv?.fichier_url && isPdf(previewLv.fichier_url)"
            :src="previewLv.fichier_url"
            class="lv-preview-iframe"
            frameborder="0">
          </iframe>
          <div v-else-if="previewLv?.fichier_url" class="lv-preview-fallback">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p>Aperçu non disponible pour ce format.</p>
            <a :href="previewLv.fichier_url" target="_blank" class="btn-act btn-act--history" style="display:inline-flex;margin-top:10px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Ouvrir le fichier
            </a>
          </div>
          <div v-else class="lv-preview-fallback">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p>Aucun fichier disponible pour ce livrable.</p>
          </div>
        </div>

        <!-- Footer actions -->
        <div class="sec-modal__footer">
          <button class="btn-modal-cancel" @click="modalPreview = false">Fermer</button>
          <button
            v-if="previewLv?.statut === 'en_attente'"
            class="btn-modal-validate"
            @click="validerLivrableDepuisPreview()">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Valider ce livrable
          </button>
          <button
            v-if="previewLv?.statut === 'en_attente'"
            class="btn-modal-reject"
            @click="rejeterLivrableDepuisPreview()">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Rejeter
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Modal: Rejeter phase -->
  <Transition name="modal-fade">
    <div v-if="modalRejet" class="modal-overlay" @click.self="modalRejet = false">
      <div class="sec-modal">
        <div class="sec-modal__hdr">
          <h3>Rejeter la phase</h3>
          <button class="sec-modal__close" @click="modalRejet = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="sec-modal__body">
          <div v-if="currentEt" class="sec-modal__phase-info">
            {{ currentEt.nom }} — {{ currentEt.phaseActuelle }}
          </div>
          <div class="fg">
            <label>Commentaire <span class="req">*</span></label>
            <textarea v-model="commentaireRejet" class="ta" rows="4" placeholder="Expliquez pourquoi cette phase est rejetée..."></textarea>
          </div>
        </div>
        <div class="sec-modal__footer">
          <button class="btn-modal-cancel" @click="modalRejet = false">Annuler</button>
          <button class="btn-modal-reject" @click="confirmerRejet" :disabled="!commentaireRejet.trim()">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Rejeter
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Modal: Rejeter livrable -->
  <Transition name="modal-fade">
    <div v-if="modalRejetLv" class="modal-overlay" @click.self="modalRejetLv = false">
      <div class="sec-modal">
        <div class="sec-modal__hdr">
          <h3>Rejeter le livrable</h3>
          <button class="sec-modal__close" @click="modalRejetLv = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="sec-modal__body">
          <div class="fg">
            <label>Commentaire <span class="req">*</span></label>
            <textarea v-model="commentaireRejetLv" class="ta" rows="4" placeholder="Expliquez les corrections nécessaires..."></textarea>
          </div>
        </div>
        <div class="sec-modal__footer">
          <button class="btn-modal-cancel" @click="modalRejetLv = false">Annuler</button>
          <button class="btn-modal-reject" @click="confirmerRejetLv" :disabled="!commentaireRejetLv.trim()">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Rejeter
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Modal: Historique -->
  <Transition name="modal-fade">
    <div v-if="modalHist" class="modal-overlay" @click.self="modalHist = false">
      <div class="sec-modal sec-modal--lg">
        <div class="sec-modal__hdr">
          <h3>Historique — {{ currentEt?.nom }}</h3>
          <button class="sec-modal__close" @click="modalHist = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="sec-modal__body">
          <div v-if="!historique.length" class="empty-hist">Aucun historique disponible.</div>
          <div v-else class="timeline">
            <div v-for="(h, i) in historique" :key="i" class="tl-item">
              <div class="tl-dot" :class="'tl-dot--' + h.type"></div>
              <div class="tl-content">
                <div class="tl-phase">{{ h.phase_nom }}</div>
                <span class="tl-badge" :class="'tl-badge--' + h.type">{{ h.action }}</span>
                <div v-if="h.commentaire" class="tl-comment">{{ h.commentaire }}</div>
                <div class="tl-date">{{ h.date }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="sec-modal__footer">
          <button class="btn-modal-cancel" @click="modalHist = false">Fermer</button>
        </div>
      </div>
    </div>
  </Transition>

</div>
</template>

<script>
import api from '@/services/api.js'
const COLORS = ['#3d6080','#27ae60','#d35400','#8e44ad','#2980b9','#c0392b']

export default {
  name: 'SuiviEncadrant',
  data() {
    return {
      filtreActif: 'tous',
      filtres: [
        { val: 'tous',    label: 'Tous' },
        { val: 'actif',   label: 'En cours' },
        { val: 'valide',  label: 'Validés' },
        { val: 'attente', label: 'En attente' },
      ],
      etudiants:    [],
      livrables:    [],
      // Preview modal
      modalPreview:    false,
      previewLv:       null,
      previewEtudiant: null,
      // Phase reject modal
      modalRejet:       false,
      commentaireRejet: '',
      currentEt:        null,
      // Livrable reject modal
      modalRejetLv:       false,
      commentaireRejetLv: '',
      currentLv:          null,
      // Historique modal
      modalHist:  false,
      historique: [],
      // Misc
      toast:   { show: false, msg: '', type: 'ok' },
      loading: false,
    }
  },
  computed: {
    etudiantsFiltres() {
      if (this.filtreActif === 'tous')    return this.etudiants
      if (this.filtreActif === 'actif')   return this.etudiants.filter(e => e.phaseActive)
      if (this.filtreActif === 'valide')  return this.etudiants.filter(e => e.termineTotal)
      if (this.filtreActif === 'attente') return this.etudiants.filter(e => !e.phaseActive && !e.termineTotal)
      return this.etudiants
    },
  },
  mounted() { this.chargerSuivi() },
  methods: {
    showToast(msg, type = 'ok') {
      this.toast = { show: true, msg, type }
      setTimeout(() => this.toast.show = false, 3500)
    },
    initials(n) {
      if (!n) return '?'
      return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    },
    colorFor(id) { return COLORS[id % COLORS.length] },
    getActivePhaseId(e) {
      const a = e.phases.find(p => p.statut === 'en_cours')
      return a?.phase_id ?? null
    },
    livrablesDe(e) {
      return (this.livrables || []).filter(l => l.etudiant_id === e.etudiant_id)
    },
    isPdf(url) {
      return url && (url.toLowerCase().endsWith('.pdf') || url.includes('/pdf') || url.includes('application/pdf'))
    },

    async chargerSuivi() {
      this.loading = true
      try {
        const r = await api.get('/suivi/encadrant')
        this.etudiants = r.data.map(e => ({
          id:           e.id,
          etudiant_id:  e.etudiant_id,
          nom:          e.nom,
          sujet:        e.sujet,
          phases:       e.phases || [],
          phaseActuelle: e.phaseActuelle,
          phaseActive:  e.phaseActive,
          progress:     e.progress,
          color:        this.colorFor(e.id),
          termineTotal: e.termineTotal,
        }))
      } catch { this.showToast('Erreur chargement suivi', 'err') }

      try {
        const r = await api.get('/livrables/encadrant')
        // Include version + remplace_le for replacement tracking
        this.livrables = (r.data || []).map(l => ({
          ...l,
          version:     l.version    ?? 1,
          remplace_le: l.remplace_le ?? null,
        }))
      } catch { this.livrables = [] }

      finally { this.loading = false }
    },

    // ── Phase actions ─────────────────────────────────────────────────────────
    async validerPhase(e) {
      const pid = this.getActivePhaseId(e)
      if (!pid) { this.showToast('Aucune phase en cours', 'err'); return }
      try {
        await api.post('/suivi/valider', { affectation_id: e.id, phase_id: pid })
        await this.chargerSuivi()
        this.showToast(`Phase validée pour ${e.nom} ✓`)
      } catch (err) { this.showToast(err.response?.data?.error || 'Erreur', 'err') }
    },

    openRejet(e) { this.currentEt = e; this.commentaireRejet = ''; this.modalRejet = true },

    async confirmerRejet() {
      if (!this.commentaireRejet.trim()) { this.showToast('Commentaire requis', 'err'); return }
      const pid = this.getActivePhaseId(this.currentEt)
      if (!pid) { this.showToast('Aucune phase en cours', 'err'); return }
      try {
        await api.post('/suivi/rejeter', {
          affectation_id:       this.currentEt.id,
          phase_id:             pid,
          commentaire_encadrant: this.commentaireRejet,
        })
        await this.chargerSuivi()
        this.modalRejet = false
        this.showToast(`Phase de ${this.currentEt.nom} rejetée`, 'err')
      } catch (err) { this.showToast(err.response?.data?.error || 'Erreur', 'err') }
    },

    // ── Livrable preview ──────────────────────────────────────────────────────
    ouvrirPreview(lv) {
      // Find which student this livrable belongs to
      this.previewLv = lv
      this.previewEtudiant = this.etudiants.find(e => e.etudiant_id === lv.etudiant_id) || null
      this.modalPreview = true
    },

    async validerLivrableDepuisPreview() {
      if (!this.previewLv) return
      await this.validerLivrable(this.previewLv)
      this.modalPreview = false
    },

    rejeterLivrableDepuisPreview() {
      if (!this.previewLv) return
      this.openRejetLv(this.previewLv)
      this.modalPreview = false
    },

    // ── Livrable actions ──────────────────────────────────────────────────────
    openRejetLv(lv) { this.currentLv = lv; this.commentaireRejetLv = ''; this.modalRejetLv = true },

    async validerLivrable(lv) {
      try {
        await api.put(`/livrables/${lv.id}`, { statut: 'valide' })
        lv.statut = 'valide'
        this.showToast('Livrable validé ✓')
      } catch (err) { this.showToast(err.response?.data?.message || 'Erreur', 'err') }
    },

    async confirmerRejetLv() {
      if (!this.commentaireRejetLv.trim()) { this.showToast('Commentaire requis', 'err'); return }
      try {
        await api.put(`/livrables/${this.currentLv.id}`, {
          statut:      'rejete',
          commentaire: this.commentaireRejetLv,
        })
        this.currentLv.statut = 'rejete'
        this.modalRejetLv = false
        this.showToast('Livrable rejeté')
      } catch (err) { this.showToast(err.response?.data?.message || 'Erreur', 'err') }
    },

    // ── Historique ────────────────────────────────────────────────────────────
    async voirHistorique(e) {
      this.currentEt = e; this.historique = []
      try {
        const r = await api.get(`/suivi/historique/${e.id}`)
        this.historique = r.data
      } catch { this.historique = [] }
      this.modalHist = true
    },
  },
}
</script>