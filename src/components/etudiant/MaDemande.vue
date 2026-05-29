<template>
  <div>
    <!-- Accord mutuel inactive + no demande -->
    <div v-if="!accordMutuelActif && !maDemande" class="vld-state">
      <div class="vld-state__icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
      <p class="vld-state__title">Demandes non disponibles</p>
      <p class="vld-state__sub">Le chef de département a choisi le mode automatique.</p>
      <button class="btn btn-outline-primary mt-3" @click="$emit('navigate', 'home')">← Retour</button>
    </div>

    <template v-else>

      <!-- READ-ONLY VIEW -->
      <div v-if="maDemande && !editMode && currentPage !== 'modifier-demande' && currentPage !== 'annuler-demande'">
        <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
          <div>
            <h2 class="vld-page-title">Ma demande d'encadrement</h2>
            <p class="vld-page-sub">Consultez ou modifiez votre demande</p>
          </div>
          <button class="vld-back-btn" @click="$emit('navigate', 'home')">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Retour
          </button>
        </div>

        <div class="vld-banner mb-4"
          :class="maDemande.statut==='acceptee' ? 'vld-banner--success' : maDemande.statut==='rejetee' ? 'vld-banner--danger' : 'vld-banner--warning'">
          <div class="vld-banner__body">
            <div class="vld-banner__title">{{ labelStatut(maDemande.statut) }}</div>
            <div class="vld-banner__sub">{{ subtitleStatut(maDemande.statut) }}</div>
          </div>
          <span class="badge" :class="maDemande.statut==='acceptee' ? 'bg-success' : maDemande.statut==='rejetee' ? 'bg-danger' : 'bg-warning text-dark'">{{ labelStatut(maDemande.statut) }}</span>
        </div>

        <div v-if="maDemande.statut==='rejetee' && maDemande.motif_rejet" class="alert alert-danger mb-3">
          <strong>Motif :</strong> {{ maDemande.motif_rejet }}
        </div>

        <div class="card mb-4">
          <div class="card-body p-0">
            <div class="vld-detail">
              <div class="vld-detail__row"><span class="vld-detail__lbl">Sujet</span><span class="vld-detail__val fw-semibold">{{ maDemande.sujet || maDemande.titre }}</span></div>
              <div class="vld-detail__row"><span class="vld-detail__lbl">Encadrant</span><span class="vld-detail__val">{{ maDemande.encadrant || '—' }}</span></div>
              <div class="vld-detail__row"><span class="vld-detail__lbl">Spécialité</span><span class="vld-detail__val">{{ maDemande.specialite || '—' }}</span></div>
              <div class="vld-detail__row"><span class="vld-detail__lbl">Description</span><span class="vld-detail__val" style="white-space:pre-line">{{ maDemande.description }}</span></div>
              <div class="vld-detail__row" v-if="maDemande.doc_pdf">
                <span class="vld-detail__lbl">Document</span>
                <span class="vld-detail__val"><a :href="'http://127.0.0.1:8000/storage/'+maDemande.doc_pdf" target="_blank" class="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Voir PDF</a></span>
              </div>
              <div class="vld-detail__row"><span class="vld-detail__lbl">Date</span><span class="vld-detail__val">{{ maDemande.date_demande ? new Date(maDemande.date_demande).toLocaleDateString('fr-FR') : '—' }}</span></div>
            </div>
          </div>
        </div>

        <div class="d-flex gap-2 flex-wrap">
          <button v-if="maDemande.statut==='en_attente'" class="btn btn-primary d-flex align-items-center gap-2" @click="startEdit">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Modifier la demande
          </button>
          <button v-if="maDemande.statut==='en_attente'" class="btn btn-outline-danger d-flex align-items-center gap-2" @click="$emit('navigate','annuler-demande')">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            Annuler la demande
          </button>
          <button v-if="maDemande.statut==='rejetee'" class="btn btn-primary d-flex align-items-center gap-2" @click="nouvelleDemandeDepuisRejet" :disabled="submitting">
            <span v-if="submitting" class="vld-spinner-sm"></span>
            Nouvelle demande
          </button>
        </div>
      </div>

      <!-- FORM: new or edit -->
      <div v-if="(!maDemande || editMode) && currentPage !== 'annuler-demande'">
        <div class="mb-4">
          <h2 class="vld-page-title">{{ editMode ? 'Modifier ma demande' : "Nouvelle demande d'encadrement" }}</h2>
          <p class="vld-page-sub">Remplissez le formulaire ci-dessous</p>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Sujet du PFE <span class="text-danger">*</span></label>
              <input v-model="form.sujet" class="form-control" type="text" placeholder="Ex : Plateforme de gestion PFE avec IA" />
              <div v-if="errs.sujet" class="text-danger mt-1" style="font-size:12.5px">{{ errs.sujet }}</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Description <span class="text-danger">*</span></label>
              <textarea v-model="form.description" class="form-control" rows="4" placeholder="Décrivez votre sujet, objectifs et méthodologie..."></textarea>
              <div v-if="errs.description" class="text-danger mt-1" style="font-size:12.5px">{{ errs.description }}</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Encadrant souhaité <span class="text-danger">*</span></label>
              <select v-model="form.encadrant_id" class="form-select">
                <option value="">-- Sélectionner un encadrant --</option>
                <option v-for="e in encadrants" :key="e.id" :value="e.id">{{ e.prenom }} {{ e.nom }}{{ e.domaine ? ' — ' + e.domaine : '' }}</option>
              </select>
              <div v-if="errs.encadrant" class="text-danger mt-1" style="font-size:12.5px">{{ errs.encadrant }}</div>
            </div>
            <div class="mb-4">
              <label class="form-label">Document du sujet <span class="text-muted" style="font-size:12px">(PDF, optionnel)</span></label>
              <div class="vld-file-zone" @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="handleDrop">
                <input type="file" ref="fileInput" accept=".pdf" style="display:none" @change="handleFile" />
                <div v-if="!form.fichier" class="text-center py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vld-text-faint)" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p style="margin:8px 0 4px;font-size:14px;color:var(--vld-text)">Cliquez ou glissez un fichier PDF</p>
                  <span style="font-size:12px;color:var(--vld-text-faint)">Max 10 Mo — PDF uniquement</span>
                </div>
                <div v-else class="d-flex align-items-center justify-content-between px-2">
                  <span style="font-size:13.5px;color:var(--vld-text-strong)">{{ form.fichier.name }}</span>
                  <button class="btn-close btn-sm ms-2" @click.stop="form.fichier = null"></button>
                </div>
              </div>
            </div>
            <div class="d-flex justify-content-end gap-2">
              <button v-if="editMode" class="btn btn-outline-secondary" @click="editMode = false">Annuler</button>
              <button class="btn btn-primary d-flex align-items-center gap-2" @click="soumettre" :disabled="submitting">
                <span v-if="submitting" class="vld-spinner-sm"></span>
                {{ editMode ? 'Enregistrer' : 'Envoyer la demande' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- CANCEL CONFIRMATION -->
      <div v-if="currentPage === 'annuler-demande'" class="card" style="max-width:520px">
        <div class="card-body text-center py-5">
          <div class="mb-3" style="color:#e74c3c">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <h5 class="fw-bold mb-2">Confirmer l'annulation</h5>
          <p style="font-size:13.5px;color:var(--vld-text-muted)">Vous êtes sur le point d'annuler votre demande :</p>
          <div v-if="maDemande" class="alert alert-warning mb-4" style="font-size:13.5px">
            <strong>{{ maDemande.sujet || maDemande.titre }}</strong><br>
            <span>Encadrant : {{ maDemande.encadrant }}</span>
          </div>
          <div class="d-flex justify-content-center gap-3">
            <button class="btn btn-outline-secondary" @click="$emit('navigate', 'consulter-demande')">Non, garder</button>
            <button class="btn btn-danger d-flex align-items-center gap-2" @click="annuler" :disabled="submitting">
              <span v-if="submitting" class="vld-spinner-sm"></span>
              Oui, annuler
            </button>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'MaDemande',
  emits: ['demande-updated', 'toast', 'navigate'],
  props: {
    currentPage:       { type: String,  required: true },
    maDemande:         { type: Object,  default: null  },
    encadrants:        { type: Array,   default: () => [] },
    accordMutuelActif: { type: Boolean, default: false },
  },
  data () {
    return {
      editMode:   false,
      submitting: false,
      errs:       {},
      form: { sujet:'', description:'', encadrant_id:null, fichier:null },
    }
  },
  watch: {
    // Quand le parent réinitialise (reinitialiserTotal → maDemande = null),
    // on remet le composant dans son état initial
    maDemande (val) {
      if (val === null) {
        this.editMode   = false
        this.submitting = false
        this.errs       = {}
        this.form       = { sujet:'', description:'', encadrant_id:null, fichier:null }
      }
    },
  },
  methods: {
    labelStatut (s)    { return {en_attente:'En attente',acceptee:'Acceptée',rejetee:'Rejetée'}[s]||s },
    subtitleStatut (s) { return {en_attente:"En attente de réponse de votre encadrant",acceptee:'Votre demande a été acceptée',rejetee:'Votre demande a été rejetée'}[s]||'' },

    startEdit () {
      this.form = { sujet:this.maDemande.sujet||this.maDemande.titre||'', description:this.maDemande.description||'', encadrant_id:this.maDemande.encadrant_id||null, fichier:null }
      this.errs = {}; this.editMode = true
    },

    validate () {
      this.errs = {}
      if (!this.form.sujet)        this.errs.sujet       = 'Le sujet est obligatoire'
      if (!this.form.description)  this.errs.description = 'La description est obligatoire'
      if (!this.form.encadrant_id) this.errs.encadrant   = 'Choisissez un encadrant'
      return !Object.keys(this.errs).length
    },

    buildFD () {
      const fd = new FormData()
      fd.append('sujet', this.form.sujet)
      fd.append('description', this.form.description)
      fd.append('encadrant_id', String(this.form.encadrant_id))
      if (this.form.fichier instanceof File) fd.append('doc_pdf', this.form.fichier, this.form.fichier.name)
      return fd
    },

    async soumettre () {
      if (!this.validate()) return
      this.submitting = true
      try {
        let res
        if (this.editMode && this.maDemande?.id) {
          res = await api.post('/demandes-encadrement/'+this.maDemande.id+'/modifier', this.buildFD(), { headers:{'Content-Type':undefined} })
        } else {
          res = await api.post('/demandes-encadrement', this.buildFD(), { headers:{'Content-Type':undefined} })
        }
        this.$emit('demande-updated', res.data.demande || res.data)
        this.$emit('toast', { message: this.editMode ? 'Demande mise à jour !' : 'Demande soumise avec succès !', type:'ok' })
        this.editMode = false
        this.$emit('navigate', 'consulter-demande')
      } catch (e) {
        this.$emit('toast', { message: e.response?.data?.message || 'Erreur lors de la soumission.', type:'err' })
      } finally { this.submitting = false }
    },

    async annuler () {
      if (!this.maDemande?.id) return
      this.submitting = true
      try {
        await api.delete('/demandes-encadrement/'+this.maDemande.id)
        this.$emit('demande-updated', null)
        this.$emit('toast', { message:'Demande annulée.', type:'ok' })
        this.$emit('navigate', 'home')
      } catch (e) {
        this.$emit('toast', { message: e.response?.data?.message || "Impossible d'annuler.", type:'err' })
      } finally { this.submitting = false }
    },

    // Supprime la demande rejetée en DB puis ouvre le formulaire vide.
    // Un simple $emit('demande-updated', null) ne suffisait pas : au refresh
    // la demande rejetée réapparaissait car elle était toujours en base.
    async nouvelleDemandeDepuisRejet () {
      if (!this.maDemande?.id) return
      this.submitting = true
      try {
        await api.delete('/demandes-encadrement/'+this.maDemande.id+'/reset')
        this.form = { sujet:'', description:'', encadrant_id:null, fichier:null }
        this.errs = {}
        this.editMode = false
        this.$emit('demande-updated', null)
        this.$emit('toast', { message: 'Demande supprimée. Vous pouvez soumettre une nouvelle demande.', type:'ok' })
        this.$emit('navigate', 'ma-demande')
      } catch (e) {
        this.$emit('toast', { message: e.response?.data?.message || 'Impossible de réinitialiser la demande.', type:'err' })
      } finally { this.submitting = false }
    },

    handleFile (e) {
      const f = e.target.files[0]
      if (!f) return
      if (f.type !== 'application/pdf') { this.errs.fichier = 'PDF uniquement'; return }
      if (f.size > 10*1024*1024) { this.errs.fichier = 'Max 10 Mo'; return }
      this.form.fichier = f
    },
    handleDrop (e) {
      const f = e.dataTransfer?.files?.[0]
      if (!f || f.type !== 'application/pdf') { this.errs.fichier = 'PDF uniquement'; return }
      this.form.fichier = f
    },
  },
}
</script>