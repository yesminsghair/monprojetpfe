<template>
  <div class="pp-root">

    <!-- ══ MAIN WIDGET CARD ══ -->
    <div class="vld-grille-card">

      <!-- Widget header -->
      <div class="vld-grille-card__head">
        <div class="vld-grille-card__head-left">
          <div>
            <div class="vld-grille-card__title">Plans de soutenance</div>
            <div class="vld-grille-card__sub">Soumettez des propositions de créneaux au chef de département</div>
          </div>
        </div>
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <span class="vld-total-badge vld-total-badge--info">
            {{ mesPlans.length }} plan{{ mesPlans.length !== 1 ? 's' : '' }} soumis
          </span>
          <button
            class="btn btn-gold d-flex align-items-center gap-2"
            @click="showFormModal = true"
            :disabled="loading || !jurysDisponibles.length"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Proposer un créneau
          </button>
        </div>
      </div>

      <!-- Widget body -->
      <div class="vld-grille-card__body">

        <Transition name="toast">
          <div v-if="toast.show" class="vld-toast-wrap">
            <div class="alert d-flex align-items-center gap-2 shadow-sm py-3 px-4 mb-0"
              :class="toast.type === 'ok' ? 'alert-success' : 'alert-danger'">
              {{ toast.msg }}
              <button class="btn-close ms-auto" @click="toast.show = false"></button>
            </div>
          </div>
        </Transition>

        <div v-if="loading" class="vld-state">
          <span class="vld-spinner-sm me-2"></span>
          <span style="color:var(--vld-text-muted);font-size:14px">Chargement…</span>
        </div>

        <div v-else>
          <!-- Empty: no jurys available AND no plans yet -->
          <div v-if="!jurysDisponibles.length && !mesPlans.length" class="vld-state">
            <div class="vld-state__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <p class="vld-state__title">Aucune soutenance disponible</p>
            <p class="vld-state__sub">Vous n'êtes associé à aucun jury publié pour lequel proposer un plan.</p>
          </div>

          <!-- Info banner: no plans yet but jurys exist -->
          <div v-else-if="!mesPlans.length" class="vld-banner vld-banner--info mb-4">
            <div class="vld-banner__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div>Aucun plan soumis pour l'instant. Cliquez sur <strong>Proposer un créneau</strong> pour commencer.</div>
          </div>

          <!-- Plans table -->
          <div v-if="mesPlans.length" class="vld-cat-card mb-4">
            <div class="vld-cat-card__head">
              <div class="cat-accent-bar" style="background:#f5a623"></div>
              <div class="flex-grow-1">
                <div class="fw-bold" style="font-size:15px;color:#fff">Plans soumis</div>
                <div style="font-size:12.5px;color:rgba(255,255,255,.6)">{{ mesPlans.length }} créneau{{ mesPlans.length !== 1 ? 'x' : '' }} proposé{{ mesPlans.length !== 1 ? 's' : '' }}</div>
              </div>
            </div>
            <div class="vld-cat-card__body">
              <div v-for="plan in mesPlans" :key="plan.id"
                class="vld-cr-row"
                :class="plan.statut === 'approuve' ? 'vld-cr-row--approved' : ''"
                style="border-bottom:1px solid var(--vld-border)">

                <!-- Main row -->
                <div class="d-flex align-items-center gap-3 px-4 py-3">
                  <div class="pp-plan-icon" :class="plan.statut === 'approuve' ? 'pp-plan-icon--approved' : ''">
                    <svg v-if="plan.statut === 'approuve'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>

                  <div class="flex-grow-1">
                    <div style="font-size:13.5px;font-weight:600;color:var(--vld-text-strong)">
                      {{ plan.date }}
                      <span v-if="plan.heure_debut" style="font-weight:400;color:var(--vld-text-muted)">
                        · {{ plan.heure_debut }}<span v-if="plan.heure_fin"> – {{ plan.heure_fin }}</span>
                      </span>
                      <span v-if="plan.duree" class="pp-duree-badge">{{ plan.duree }}</span>
                    </div>
                    <div v-if="plan.salle" style="font-size:12px;color:var(--vld-text-muted);margin-top:2px">
                      Salle {{ plan.salle }}
                      <span v-if="plan.projet_titre"> · {{ plan.projet_titre }}</span>
                    </div>
                  </div>

                  <div class="d-flex flex-column align-items-end gap-1">
                    <span class="vld-cat-badge" :style="statutStyle(plan.statut)">{{ statutLabel(plan.statut) }}</span>
                    <span v-if="plan.date_traitement && plan.statut !== 'en_attente'"
                      style="font-size:11px;color:var(--vld-text-muted);white-space:nowrap">
                      {{ new Date(plan.date_traitement).toLocaleDateString('fr-FR') }}
                    </span>
                  </div>

                  <button v-if="plan.statut === 'rejete'"
                    class="vld-icon-btn vld-icon-btn--del-light"
                    @click="confirmDelete(plan)"
                    :disabled="deletingId === plan.id">
                    <span v-if="deletingId === plan.id" class="vld-spinner-sm" style="width:11px;height:11px"></span>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  </button>
                </div>

                <!-- Approved: confirmed slot banner (shows chef's final heure_debut / salle) -->
                <div v-if="plan.statut === 'approuve'" class="pp-approved-slot">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>
                    <strong>Créneau confirmé :</strong>
                    {{ plan.date }}
                    <span v-if="plan.heure_debut">de {{ plan.heure_debut }}<span v-if="plan.heure_fin"> à {{ plan.heure_fin }}</span></span>
                    <span v-if="plan.salle">&nbsp;· Salle <strong>{{ plan.salle }}</strong></span>
                  </span>
                </div>

                <!-- Rejected: motif -->
                <div v-if="plan.statut === 'rejete'" class="pp-motif-rejet">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span v-if="plan.motif_rejet"><strong>Motif :</strong> {{ plan.motif_rejet }}</span>
                  <span v-else style="font-style:italic;opacity:.75">Aucun motif fourni.</span>
                </div>
              </div>

              <div v-if="mesPlans.some(p => p.statut === 'en_attente')"
                class="d-flex align-items-center gap-2 px-4 py-3"
                style="font-size:12px;color:var(--vld-text-muted)">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Les plans en attente seront traités par le chef de département.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ══ PROPOSER CRÉNEAU MODAL ══ -->
    <Teleport to="body">
    <Transition name="rm-modal">
      <div v-if="showFormModal" class="rm-overlay" @click.self="showFormModal = false">
        <div class="rm-modal rm-modal--blue" style="max-width:560px">

          <div class="rm-modal__head rm-modal__head--blue">
            <div class="rm-modal__head-left">
              <div class="rm-modal__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div class="rm-modal__head-text">
                <div class="rm-modal__title">Proposer des créneaux</div>
                <div class="rm-modal__sub">Ajoutez un ou plusieurs créneaux à soumettre</div>
              </div>
            </div>
            <button class="rm-modal__close" @click="showFormModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="rm-modal__body" style="gap:18px;max-height:60vh;overflow-y:auto">
            <div v-for="(slot, i) in slots" :key="i" class="pp-slot-block" :class="{ 'pp-slot-block--sep': i < slots.length - 1 }">

              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="pp-slot-label">Créneau {{ i + 1 }}</span>
                <button v-if="slots.length > 1" class="vld-icon-btn vld-icon-btn--del" @click="slots.splice(i, 1)" style="width:24px;height:24px;border-radius:6px">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <!-- Jury / étudiant picker -->
              <div class="rm-field mb-2">
                <label class="rm-field__label">Étudiant / Jury</label>
                <select v-model="slot.jury_id" class="rm-field__input">
                  <option value="">— Choisir un jury —</option>
                  <option v-for="j in jurysDisponibles" :key="j.id" :value="j.id">
                    {{ j.etudiantNom }}
                  </option>
                </select>
              </div>

              <!-- Date + Heure début + Heure fin -->
              <div class="rm-fields-grid mb-2" style="grid-template-columns:1fr 1fr 1fr">
                <div class="rm-field">
                  <label class="rm-field__label">Date</label>
                  <input type="date" v-model="slot.date" class="rm-field__input"
                    :class="{ 'rm-field__input--error': slot.date && isWeekend(slot.date) }" />
                  <div v-if="slot.date && isWeekend(slot.date)" class="rm-field__hint rm-hint--error">Pas le week-end</div>
                </div>
                <div class="rm-field">
                  <label class="rm-field__label">Heure de début</label>
                  <input type="time" v-model="slot.heure" class="rm-field__input" />
                </div>
                <div class="rm-field">
                  <label class="rm-field__label">
                    Heure de fin
                    <span v-if="slot.heure && slot.heure_fin" class="rm-optional"> · {{ dureeSlot(slot) }}</span>
                  </label>
                  <input type="time" v-model="slot.heure_fin" class="rm-field__input"
                    :class="{ 'rm-field__input--error': slot.heure && slot.heure_fin && slot.heure_fin <= slot.heure }" />
                  <div v-if="slot.heure && slot.heure_fin && slot.heure_fin <= slot.heure" class="rm-field__hint rm-hint--error">Doit être après le début</div>
                </div>
              </div>

              <!-- Salle -->
              <div class="rm-field">
                <label class="rm-field__label">
                  Salle
                  <span class="rm-optional">ex: A13, B24</span>
                  <span v-if="slot.loadingSalles" class="rm-optional"> · Vérification…</span>
                </label>
                <input v-model="slot.salle" type="text" class="rm-field__input"
                  :class="{
                    'rm-field__input--error': slot.salle && (!salleValide(slot.salle) || !!(slot.sallesOccupeesGlobal||[]).find(x => x.salle === slot.salle)),
                    'rm-field__input--ok':    slot.salle && salleValide(slot.salle) && !(slot.sallesOccupeesGlobal||[]).find(x => x.salle === slot.salle) && !slot.loadingSalles,
                  }"
                  placeholder="ex: B13" maxlength="3"
                  @input="slot.salle = slot.salle.toUpperCase()"
                  style="max-width:130px;font-weight:700;letter-spacing:.05em"
                />
                <div v-if="slot.salle && !salleValide(slot.salle)" class="rm-field__hint rm-hint--error">Format invalide — Bloc A–D + étage 0–2 + numéro 1–4</div>
                <div v-else-if="slot.salle && (slot.sallesOccupeesGlobal||[]).find(x => x.salle === slot.salle)" class="rm-field__hint rm-hint--error">🔒 Salle déjà réservée</div>
                <div v-else-if="slot.salle && salleValide(slot.salle) && !slot.loadingSalles" class="rm-field__hint rm-hint--ok">✓ Salle disponible</div>
              </div>

            </div>
          </div>

          <div class="rm-modal__foot rm-modal__foot--blue">
            <button class="rm-btn rm-btn--ghost" @click="showFormModal = false">Annuler</button>
            <button class="rm-btn rm-btn--blue d-flex align-items-center gap-2" @click="soumettre" :disabled="saving">
              <span v-if="saving" class="rm-spinner"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              {{ saving ? 'Envoi…' : 'Soumettre le plan' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
    </Teleport>

    <!-- ══ DELETE CONFIRM MODAL ══ -->
    <Teleport to="body">
    <Transition name="rm-modal">
      <div v-if="showDeleteModal" class="rm-overlay" @click.self="showDeleteModal = false">
        <div class="rm-modal rm-modal--red" style="max-width:420px">
          <div class="rm-modal__head rm-modal__head--red">
            <div class="rm-modal__head-left">
              <div class="rm-modal__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              </div>
              <div class="rm-modal__head-text">
                <div class="rm-modal__title">Supprimer le plan</div>
                <div class="rm-modal__sub">Cette action est irréversible</div>
              </div>
            </div>
            <button class="rm-modal__close" @click="showDeleteModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="rm-modal__body">
            <div class="rm-del-warning">
              <div class="rm-del-warning__icon"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
              <p class="rm-del-warning__text">Supprimer ce plan rejeté ?<br><strong>{{ planToDelete?.date }}</strong><span v-if="planToDelete?.salle"> · Salle {{ planToDelete?.salle }}</span></p>
            </div>
          </div>
          <div class="rm-modal__foot">
            <button class="rm-btn rm-btn--ghost" @click="showDeleteModal = false">Annuler</button>
            <button class="rm-btn rm-btn--red d-flex align-items-center gap-2" @click="executerDelete" :disabled="deletingId !== null">
              <span v-if="deletingId !== null" class="rm-spinner"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>

  </div>
</template>

<script>
import api from '@/services/api.js'

const emptySlot = () => ({
  jury_id: '',
  date: '',
  heure: '',
  heure_fin: '',
  salle: '',
  sallesOccupeesGlobal: [],
  loadingSalles: false,
  _checkTimer: null,
})

export default {
  name: 'ProposerPlan',
  emits: ['toast', 'plan-deleted', 'plan-submitted', 'plan-approved'],
  props: {
    currentUser: { type: Object, required: true },
  },
  data () {
    return {
      loading:    true,
      saving:     false,
      deletingId: null,

      slots:            [emptySlot()],
      mesPlans:         [],
      jurysDisponibles: [],  // { id, etudiantNom, fonction }

      showFormModal:   false,
      showDeleteModal: false,
      planToDelete:    null,

      toast: { show: false, msg: '', type: 'ok' },
    }
  },
  async mounted () {
    await Promise.all([this.chargerJurys(), this.chargerPlans()])
    this.loading = false
    // Re-fetch whenever the browser tab regains focus so the proposant
    // immediately sees their plan updated after the chef validates it.
    this._visibilityHandler = () => { if (!document.hidden) this.refresh() }
    document.addEventListener('visibilitychange', this._visibilityHandler)
  },

  beforeUnmount () {
    document.removeEventListener('visibilitychange', this._visibilityHandler)
  },
  watch: {
    slots: {
      deep: true,
      handler (newSlots) {
        newSlots.forEach(slot => {
          if (slot.date && slot.heure && slot.heure_fin && !slot.loadingSalles) {
            this.chargerSallesOccupeesSlot(slot)
          }
        })
      },
    },
  },
  methods: {

    showToast (msg, type = 'ok') {
      this.toast = { show: true, msg, type }
      setTimeout(() => { this.toast.show = false }, 3500)
    },

    /**
     * Public method — call from a parent via $refs or event bus after the chef
     * validates a plan so this view instantly reflects the approved slot.
     */
    async refresh () {
      await Promise.all([this.chargerJurys(), this.chargerPlans()])
      // If any plan just became approved, surface a local toast so the user notices.
      const justApproved = this.mesPlans.find(p => p.statut === 'approuve' && !p._notified)
      if (justApproved) {
        justApproved._notified = true
        this.showToast(`Votre plan a été approuvé — ${justApproved.date}${justApproved.heure_debut ? ' à ' + justApproved.heure_debut : ''}`, 'ok')
        this.$emit('plan-approved', justApproved)
      }
    },

    statutLabel (s) {
      return s === 'approuve' ? 'Approuvé' : s === 'rejete' ? 'Rejeté' : 'En attente'
    },
    statutStyle (s) {
      if (s === 'approuve') return { background: 'rgba(30,158,96,.18)', color: '#0b6e40', border: '1.5px solid rgba(30,158,96,.40)' }
      if (s === 'rejete')   return { background: 'rgba(217,64,64,.14)', color: '#9b1c1c', border: '1.5px solid rgba(217,64,64,.40)' }
      return { background: 'rgba(245,166,35,.18)', color: '#8b4500', border: '1.5px solid rgba(245,166,35,.45)' }
    },

    confirmDelete (plan) { this.planToDelete = plan; this.showDeleteModal = true },
    async executerDelete () {
      if (!this.planToDelete) return
      this.deletingId = this.planToDelete.id
      try {
        await api.delete(`/plans-soutenance/${this.planToDelete.id}`)
        this.mesPlans     = this.mesPlans.filter(p => p.id !== this.planToDelete.id)
        this.showDeleteModal = false; this.planToDelete = null
        this.showToast('Plan supprimé.')
        this.$emit('plan-deleted')
      } catch { this.showToast('Erreur lors de la suppression.', 'err') }
      finally  { this.deletingId = null }
    },

    /**
     * Load the jurys where the current user is a published member.
     * The backend /jurys-pfe already filters by publie=true for non-chef users
     * and returns flat fields (encadrant_id, president_id, examinateur_id).
     */
    async chargerJurys () {
      try {
        const res  = await api.get('/jurys-pfe')
        const list = res.data?.data ?? res.data ?? []
        const uid  = this.currentUser.id

        this.jurysDisponibles = list
          .filter(j => j.publie)  // backend should already filter, but belt+suspenders
          .filter(j =>
            j.encadrant_id === uid ||
            j.president_id === uid ||
            j.examinateur_id === uid
          )
          // Only exclude if the soutenance is already published (calendrier_publie).
          // A validated-but-not-yet-published soutenance can still be superseded,
          // so the member should still be allowed to propose an alternative slot.
          .filter(j => !j.calendrier_publie)
          .map(j => {
            let fonction = 'encadrant'
            if      (j.president_id   === uid) fonction = 'president'
            else if (j.examinateur_id === uid) fonction = 'examinateur'
            return {
              id:          j.id,
              etudiantNom: j.etudiant_nom || `Jury #${j.id}`,
              fonction,
            }
          })
      } catch (e) {
        console.error('[ProposerPlan] chargerJurys error:', e)
      }
    },

    async chargerPlans () {
      try {
        const res = await api.get('/plans-soutenance')
        const uid = this.currentUser.id
        this.mesPlans = (res.data || [])
          .filter(p => p && p.proposant_id === uid)
          .map(p => {
            const debut = p.heure_debut ? p.heure_debut.slice(0, 5) : null
            const fin   = p.heure_fin   ? p.heure_fin.slice(0, 5)   : null
            return {
              id:              p.id,
              jury_id:         p.jury_id ?? null,
              date:            p.date ? new Date(p.date).toLocaleDateString('fr-FR') : '—',
              heure_debut:     debut,
              heure_fin:       fin,
              duree:           debut && fin ? this.calcDuree(debut, fin) : null,
              salle:           p.salle ?? null,
              projet_titre:    p.projet_titre ?? null,
              statut:          p.statut || 'en_attente',
              motif_rejet:     p.motif_rejet     ?? null,
              date_traitement: p.date_traitement ?? null,
            }
          })

        // Remove jurys for which THIS user already has an approved plan —
        // their slot was accepted so there is nothing left to propose.
        // Jurys with only en_attente or rejete plans stay in the picker so
        // the member can propose alternative slots.
        const myApprovedJuryIds = new Set(
          this.mesPlans
            .filter(p => p.statut === 'approuve' && p.jury_id)
            .map(p => p.jury_id)
        )
        this.jurysDisponibles = this.jurysDisponibles
          .filter(j => !myApprovedJuryIds.has(j.id))
      } catch { /* ignore */ }
    },

    calcDuree (debut, fin) {
      const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
      const diff  = toMin(fin) - toMin(debut)
      if (diff <= 0) return null
      const h = Math.floor(diff / 60)
      const m = diff % 60
      return (h ? h + 'h' : '') + (m ? String(m).padStart(2, '0') + 'min' : '')
    },

    isWeekend (dateStr) {
      if (!dateStr) return false
      const day = new Date(dateStr).getUTCDay()
      return day === 0 || day === 6
    },

    dureeSlot (slot) {
      if (!slot.heure || !slot.heure_fin || slot.heure_fin <= slot.heure) return ''
      return this.calcDuree(slot.heure, slot.heure_fin) || ''
    },

    salleValide (val) {
      if (!val || val.length !== 3) return false
      return /^[A-D]$/.test(val[0]) && ['0','1','2'].includes(val[1]) && ['1','2','3','4'].includes(val[2])
    },

    chargerSallesOccupeesSlot (slot) {
      if (slot._checkTimer) clearTimeout(slot._checkTimer)
      slot._checkTimer = setTimeout(async () => {
        if (!slot.date || !slot.heure || !slot.heure_fin) return
        if (slot.heure_fin <= slot.heure) return
        slot.loadingSalles = true
        try {
          const r = await api.get('/soutenances/salles-occupees', {
            params: { date: slot.date, heure_debut: slot.heure, heure_fin: slot.heure_fin },
          })
          slot.sallesOccupeesGlobal = r.data || []
          if (slot.salle && (slot.sallesOccupeesGlobal || []).find(x => x.salle === slot.salle)) {
            slot.salle = ''
          }
        } catch { slot.sallesOccupeesGlobal = [] }
        finally  { slot.loadingSalles = false }
      }, 400)
    },

    async soumettre () {
      // All slots must have date, hours, salle, and jury
      if (!this.slots.every(s => s.date && s.heure && s.heure_fin && s.heure_fin > s.heure && s.salle && this.salleValide(s.salle))) {
        this.showToast('Veuillez remplir tous les champs obligatoires (date, heure, salle valide).', 'err'); return
      }
      if (this.slots.some(s => this.isWeekend(s.date))) {
        this.showToast('Les soutenances ne peuvent pas avoir lieu le week-end.', 'err'); return
      }
      const validSlots = this.slots.filter(s => s.jury_id)
      if (!validSlots.length) {
        this.showToast('Sélectionnez au moins un jury.', 'err'); return
      }
      for (const s of validSlots) {
        if ((s.sallesOccupeesGlobal || []).find(x => x.salle === s.salle)) {
          this.showToast(`La salle ${s.salle} est réservée à ce créneau.`, 'err'); return
        }
      }

      this.saving = true
      try {
        const responses = await Promise.all(validSlots.map(s => {
          const jury = this.jurysDisponibles.find(j => j.id === Number(s.jury_id))
          return api.post('/plans-soutenance', {
            proposant_id: this.currentUser.id,
            jury_id:      Number(s.jury_id),
            fonction:     jury?.fonction ?? 'encadrant',
            date:         s.date,
            heure_debut:  s.heure,
            heure_fin:    s.heure_fin,
            salle:        s.salle,
          })
        }))

        responses.forEach((r, idx) => {
          const p  = r.data
          const s  = validSlots[idx]
          const hd = p.heure_debut ? p.heure_debut.slice(0, 5) : s?.heure
          const hf = p.heure_fin   ? p.heure_fin.slice(0, 5)   : s?.heure_fin
          this.mesPlans.unshift({
            id:              p.id,
            jury_id:         p.jury_id ?? Number(s?.jury_id) ?? null,
            date:            p.date ? new Date(p.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
            heure_debut:     hd,
            heure_fin:       hf,
            duree:           hd && hf ? this.calcDuree(hd, hf) : null,
            salle:           p.salle ?? s?.salle,
            projet_titre:    p.projet_titre ?? null,
            statut:          'en_attente',
            motif_rejet:     null,
            date_traitement: null,
          })
        })

        this.slots         = [emptySlot()]
        this.showFormModal = false
        this.showToast('Plan soumis avec succès.')
        this.$emit('plan-submitted')
      } catch (e) {
        this.showToast(e?.response?.data?.message || 'Erreur lors de la soumission.', 'err')
      } finally { this.saving = false }
    },
  },
}
</script>

<style scoped>
.pp-root { font-family: var(--vld-font-body); }

/* Widget card */
.vld-grille-card { background: var(--vld-surface-raised); border: 1.5px solid var(--vld-border); border-radius: var(--vld-r-2xl); box-shadow: var(--vld-shadow-card); overflow: hidden; }
.vld-grille-card__head { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 20px 26px; background: linear-gradient(135deg, var(--vld-primary-dark) 0%, #1a2d3e 100%); border-bottom: 3px solid #f5a623; }
.vld-grille-card__head-left { display: flex; align-items: center; gap: 14px; }
.vld-grille-card__title { font-family: var(--vld-font-display); font-size: 16px; font-weight: 800; color: #fff; margin: 0; }
.vld-grille-card__sub   { font-size: 12px; color: rgba(255,255,255,.55); margin: 3px 0 0; }
.vld-total-badge { padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; }
.vld-total-badge--info { background: rgba(61,96,128,.22); color: #fff; border: 1.5px solid rgba(61,96,128,.45); }
.vld-grille-card__body { padding: 24px 26px; display: flex; flex-direction: column; gap: 0; }

/* Category card */
.vld-cat-card { background: var(--vld-surface-raised); border: 1.5px solid var(--vld-border); border-radius: var(--vld-r-xl); box-shadow: var(--vld-shadow-card); overflow: hidden; }
.vld-cat-card__head { display: flex; align-items: center; gap: 14px; padding: 14px 18px; background: linear-gradient(135deg, var(--vld-primary-dark) 0%, #1a2d3e 100%); border-bottom: 1.5px solid rgba(245,166,35,.25); }
.vld-cat-card__body { background: var(--vld-surface-raised); }
.cat-accent-bar { width: 5px; height: 44px; border-radius: 4px; flex-shrink: 0; }

.vld-cr-row { background: var(--vld-surface-raised); transition: background .12s; }
.vld-cr-row:hover { background: var(--vld-surface-alt); }

.pp-plan-icon { width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0; background: rgba(61,96,128,.10); border: 1.5px solid rgba(61,96,128,.20); display: flex; align-items: center; justify-content: center; color: var(--vld-primary); }
.vld-cat-badge { padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.pp-duree-badge { margin-left: 6px; font-size: 11.5px; font-weight: 700; background: rgba(61,96,128,.12); color: #2f4f6a; border: 1px solid rgba(61,96,128,.22); border-radius: 6px; padding: 1px 7px; vertical-align: middle; }

.vld-icon-btn--del-light { width: 30px; height: 30px; border-radius: 8px; background: rgba(217,64,64,.10); border: 1.5px solid rgba(217,64,64,.28); color: #c0392b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; flex-shrink: 0; }
.vld-icon-btn--del-light:hover:not(:disabled) { background: rgba(217,64,64,.20); border-color: #c0392b; }
.vld-icon-btn--del-light:disabled { opacity: .4; cursor: not-allowed; }

.vld-cr-row--approved { background: rgba(30,158,96,.05); }
.vld-cr-row--approved:hover { background: rgba(30,158,96,.09); }
.pp-plan-icon--approved { background: rgba(30,158,96,.15); border-color: rgba(30,158,96,.35); color: #0b6e40; }

.pp-approved-slot {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 16px 9px 20px;
  background: rgba(30,158,96,.09);
  border-top: 1px solid rgba(30,158,96,.20);
  font-size: 12.5px; color: #0b5c36; line-height: 1.45;
}
.pp-approved-slot svg { color: #1e9e60; }

.pp-motif-rejet { display: flex; align-items: flex-start; gap: 8px; padding: 9px 16px 9px 20px; background: rgba(192,57,43,.07); border-top: 1px solid rgba(192,57,43,.15); font-size: 12.5px; color: #7a2020; line-height: 1.45; }
.vld-icon-btn--del { background: rgba(217,64,64,.07); border: 1.5px solid rgba(217,64,64,.22); color: var(--vld-danger); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
.vld-icon-btn--del:hover { background: rgba(217,64,64,.15); border-color: var(--vld-danger); }

.vld-banner { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-radius: var(--vld-r-xl); border: 1.5px solid; font-size: 13.5px; font-weight: 500; }
.vld-banner__icon { flex-shrink: 0; display: flex; align-items: center; }
.vld-banner--info { background: linear-gradient(90deg, rgba(61,96,128,.10), rgba(61,96,128,.04)); border-color: rgba(61,96,128,.22); color: var(--vld-primary-dark); }

.vld-state { text-align: center; padding: 60px 24px; background: var(--vld-surface); border-radius: var(--vld-r-2xl); border: 2px dashed var(--vld-border); display: flex; flex-direction: column; align-items: center; }
.vld-state__icon  { color: var(--vld-text-faint); margin-bottom: 16px; }
.vld-state__title { font-size: 16px; font-weight: 700; color: var(--vld-text-strong); margin: 0 0 6px; }
.vld-state__sub   { font-size: 13px; color: var(--vld-text-muted); margin: 0; }

.btn-gold { background: linear-gradient(135deg, #f5a623 0%, #c97e10 100%); color: #fff; border: none; font-weight: 700; box-shadow: 0 2px 10px rgba(245,166,35,.30); transition: all .18s; padding: 8px 16px; border-radius: 9px; font-size: 13px; cursor: pointer; }
.btn-gold:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(245,166,35,.45); color: #fff; }
.btn-gold:disabled { opacity: .4; cursor: not-allowed; }

.vld-spinner-sm { display: inline-block; width: 13px; height: 13px; border-radius: 50%; border: 2px solid rgba(245,166,35,.25); border-top-color: #f5a623; animation: vld-spin .7s linear infinite; }
@keyframes vld-spin { to { transform: rotate(360deg); } }

.vld-toast-wrap { position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 280px; max-width: 380px; }

/* Modals */
.rm-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(10,18,28,.52); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.rm-modal { width: 100%; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 6px rgba(0,0,0,.08), 0 24px 64px rgba(0,0,0,.28), 0 0 0 1px rgba(255,255,255,.06); }
.rm-modal--blue { background: #f0ece3; border: 1.5px solid rgba(47,79,106,.2); }
.rm-modal--red  { background: #f5eeec; border: 1.5px solid rgba(192,57,43,.2); }
.rm-modal__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 20px; }
.rm-modal__head--blue { background: linear-gradient(135deg, #2f4f6a 0%, #1a3248 100%); }
.rm-modal__head--red  { background: linear-gradient(135deg, #9b2020 0%, #6b1010 100%); }
.rm-modal__head-left { display: flex; align-items: center; gap: 13px; flex: 1; min-width: 0; }
.rm-modal__head-text { flex: 1; min-width: 0; }
.rm-modal__icon { width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; background: rgba(255,255,255,.18); border: 1.5px solid rgba(255,255,255,.28); display: flex; align-items: center; justify-content: center; color: #fff; }
.rm-modal__title { font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 2px; }
.rm-modal__sub   { font-size: 11.5px; color: rgba(255,255,255,.6); font-weight: 500; }
.rm-modal__close { width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0; background: rgba(255,255,255,.14); border: none; color: rgba(255,255,255,.75); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .12s, color .12s; }
.rm-modal__close:hover { background: rgba(255,255,255,.28); color: #fff; }
.rm-modal__body { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; background: #f5f2ed; }
.rm-modal__foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 22px; background: #ede9e2; }
.rm-modal--blue .rm-modal__foot { border-top: 1.5px solid rgba(47,79,106,.15); }
.rm-modal--red  .rm-modal__foot { border-top: 1.5px solid rgba(192,57,43,.15); }

.rm-field { display: flex; flex-direction: column; gap: 5px; }
.rm-field__label { font-size: 0.73rem; font-weight: 700; color: #4a5a6a; text-transform: uppercase; letter-spacing: .05em; }
.rm-optional { font-size: 0.68rem; font-weight: 500; color: #8a9aaa; text-transform: none; letter-spacing: 0; }
.rm-field__input { padding: 8px 11px; border: 1.5px solid #c8c4bc; border-radius: 8px; font-size: 0.82rem; color: #1e2a35; background: #ede9e2; outline: none; transition: border-color .15s, background .15s; width: 100%; }
.rm-field__input:focus { border-color: #2f4f6a; background: #f5f2ed; }
.rm-field__input--error { border-color: #c0392b !important; background: #fff5f5 !important; }
.rm-field__input--ok    { border-color: #27ae60 !important; background: #f5fff8 !important; }
.rm-field__hint  { font-size: 0.73rem; color: #6a7a8a; margin-top: 3px; }
.rm-hint--ok     { color: #27ae60; font-weight: 600; }
.rm-hint--error  { color: #c0392b; font-weight: 700; }
.rm-fields-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.rm-btn { display: flex; align-items: center; gap: 7px; padding: 8px 18px; border-radius: 8px; border: 1.5px solid; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: .15s; }
.rm-btn:disabled { opacity: .5; cursor: not-allowed; }
.rm-btn--ghost { background: #ede9e2; border-color: #c8c4bc; color: #4a5a6a; }
.rm-btn--ghost:hover { background: #e8e4dc; color: #1e2a35; }
.rm-btn--blue { background: #2f4f6a; border-color: #1a3248; color: #fff; }
.rm-btn--blue:hover:not(:disabled) { background: #1a3248; box-shadow: 0 4px 12px rgba(47,79,106,.35); }
.rm-btn--red  { background: #9b2020; border-color: #7b1a1a; color: #fff; }
.rm-btn--red:hover:not(:disabled)  { background: #7b1a1a; box-shadow: 0 4px 12px rgba(155,32,32,.35); }
.rm-spinner { width: 13px; height: 13px; border-radius: 50%; border: 2px solid rgba(255,255,255,.35); border-top-color: #fff; animation: vld-spin .7s linear infinite; }

.rm-del-warning { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; padding: 8px 0; }
.rm-del-warning__icon { opacity: .85; }
.rm-del-warning__text { font-size: 0.85rem; color: #3a3a3a; line-height: 1.55; margin: 0; }

.pp-slot-block { display: flex; flex-direction: column; gap: 10px; }
.pp-slot-block--sep { border-bottom: 1.5px solid rgba(47,79,106,.12); padding-bottom: 16px; margin-bottom: 4px; }
.pp-slot-label { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: #2f4f6a; }

.rm-modal-enter-active, .rm-modal-leave-active { transition: all .22s; }
.rm-modal-enter-from, .rm-modal-leave-to { opacity: 0; transform: scale(.96) translateY(6px); }
.toast-enter-active, .toast-leave-active { transition: all .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(16px); }
</style>