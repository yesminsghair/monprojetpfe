<template>
  <div><!-- single root wrapper -->
    <div>
    <div class="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-3">
      <div>
        <h2 class="vld-page-title">Composition des jurys PFE</h2>
        <p class="vld-page-sub">Attribuez les membres de jury pour chaque projet de votre département</p>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <span class="badge bg-success bg-opacity-10 text-success px-3 py-2">{{ etudiants.filter(e => e.publie).length }} jury(s) publié(s)</span>
        <span class="badge bg-warning bg-opacity-10 text-warning px-3 py-2">{{ etudiants.filter(e => !e.jury_id).length }} sans jury</span>
      </div>
    </div>

    <!-- ── Toolbar ── -->
    <div class="d-flex flex-wrap gap-2 mb-4 align-items-center">
      <div class="jry-search-wrap flex-grow-1" style="min-width:200px;max-width:340px">
        <svg class="jry-search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQuery" type="text" class="form-control form-control-sm jry-search-input" placeholder="Rechercher étudiant ou projet…" />
        <button v-if="searchQuery" class="jry-search-clear" @click="searchQuery=''" title="Effacer">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <select v-model="filterStatut" class="form-select form-select-sm" style="width:auto;min-width:170px">
        <option value="">Tous les jurys</option>
        <option value="publie">✓ Publiés</option>
        <option value="compose">✓ Composés (non publiés)</option>
        <option value="en_cours">⏳ En cours</option>
        <option value="sans_jury">⊘ Sans jury</option>
      </select>

      <button class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" @click="exporterCSV">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Exporter CSV
      </button>

      <span v-if="searchQuery || filterStatut" style="font-size:12.5px;color:var(--vld-text-muted)">
        {{ etudiantsFiltres.length }} résultat(s)
      </span>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="vld-toast-wrap">
        <div class="alert d-flex align-items-center gap-2 shadow-sm py-3 px-4 mb-0"
          :class="toast.type === 'toast-ok' ? 'alert-success' : 'alert-danger'">
          {{ toast.message }}<button class="btn-close ms-auto" @click="toast.show = false"></button>
        </div>
      </div>
    </Transition>

    <div v-if="loadingEtudiants" class="vld-state">
      <div class="vld-spinner mx-auto mb-3"></div><p>Chargement...</p>
    </div>

    <div v-else-if="!etudiants.length" class="vld-state">
      <div class="vld-state__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        </svg>
      </div>
      <p class="vld-state__title">Aucun étudiant trouvé</p>
      <p class="vld-state__sub">Les affectations doivent être finalisées avant de composer les jurys.</p>
    </div>

    <div v-else class="d-flex flex-column gap-3">
      <div v-if="etudiantsFiltres.length === 0" class="vld-state">
        <p class="vld-state__title">Aucun résultat</p>
        <button class="btn btn-sm btn-outline-secondary mt-2" @click="searchQuery=''; filterStatut=''">Réinitialiser</button>
      </div>

      <div v-for="et in etudiantsFiltres" :key="et.etudiant_id" class="card">

        <!-- Card header -->
        <div class="card-header d-flex align-items-center gap-3 flex-wrap">
          <div class="vld-av vld-av--md vld-av--gold">{{ initiales(et.etudiant_nom) }}</div>
          <div class="flex-grow-1">
            <div class="fw-bold" style="color:var(--vld-text-strong)">{{ et.etudiant_nom }}</div>
            <div style="font-size:12.5px;color:var(--vld-text-muted)">
              {{ et.projet_titre || 'Projet sans titre' }} · Encadrant : {{ et.encadrant_nom || '—' }}
            </div>
          </div>
          <div class="d-flex gap-2 align-items-center">
            <!-- Status badge -->
            <span v-if="et.publie"                class="badge bg-success">✓ Publié</span>
            <span v-else-if="juryComplet(et)"     class="badge bg-primary">✓ Jury composé — non publié</span>
            <span v-else-if="et.jury_id"          class="badge bg-info text-dark">⏳ En cours ({{ membresRemplis(et) }}/3)</span>
            <span v-else                          class="badge bg-warning text-dark">⊘ Sans jury</span>

            <!-- Publier -->
            <button
              v-if="juryComplet(et) && !et.publie"
              class="btn btn-sm btn-success d-flex align-items-center gap-1"
              :disabled="publishing[et.etudiant_id]"
              @click="publierJury(et)">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>
              {{ publishing[et.etudiant_id] ? 'Publication…' : 'Publier' }}
            </button>

            <!-- Modifier (unlock published jury) -->
            <button
              v-if="et.publie"
              class="btn btn-sm btn-warning d-flex align-items-center gap-1"
              :disabled="modifying[et.etudiant_id]"
              @click="openModifierJury(et)">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              {{ modifying[et.etudiant_id] ? 'Modification…' : 'Modifier' }}
            </button>

            <!-- Delete (unpublished only) -->
            <button v-if="et.jury_id && !et.publie" class="vld-icon-btn vld-icon-btn--del" @click="openSupprimerJury(et)">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
            </button>
          </div>
        </div>

        <!-- Card body -->
        <div class="card-body">
          <!-- Members row — encadrant fixed, then president + examinateur -->
          <div class="d-flex flex-wrap gap-2 mb-3">

            <!-- Encadrant chip — always fixed, never removable -->
            <div v-if="et.encadrant_nom"
              class="d-flex align-items-center gap-2 px-3 py-2 rounded"
              style="background:var(--vld-surface-alt);border:1.5px solid var(--vld-border);opacity:0.85">
              <span class="badge bg-primary">Enc.</span>
              <span style="font-size:13.5px;color:var(--vld-text-strong)">{{ et.encadrant_nom }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>

            <!-- President chip -->
            <div v-if="et.president_id"
              class="d-flex align-items-center gap-2 px-3 py-2 rounded"
              style="background:var(--vld-surface-alt);border:1.5px solid var(--vld-border)">
              <span class="badge bg-warning text-dark">Prés.</span>
              <span style="font-size:13.5px;color:var(--vld-text-strong)">{{ et.president_nom }}</span>
              <button v-if="!et.publie" class="btn-close btn-close-sm ms-1" style="font-size:10px" @click="openClearRole(et, 'president')"></button>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:#198754"><polyline points="20 6 9 17 4 12"/></svg>
            </div>

            <!-- Examinateur chip -->
            <div v-if="et.examinateur_id"
              class="d-flex align-items-center gap-2 px-3 py-2 rounded"
              style="background:var(--vld-surface-alt);border:1.5px solid var(--vld-border)">
              <span class="badge bg-secondary">Exam.</span>
              <span style="font-size:13.5px;color:var(--vld-text-strong)">{{ et.examinateur_nom }}</span>
              <button v-if="!et.publie" class="btn-close btn-close-sm ms-1" style="font-size:10px" @click="openClearRole(et, 'examinateur')"></button>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:#198754"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>

          <!-- Published lock notice -->
          <div v-if="et.publie" style="font-size:12.5px;color:var(--vld-text-muted);font-style:italic">
            🔔 Notifications envoyées — jury verrouillé.
          </div>

          <!-- Add member selectors — shown when not yet published and a slot is missing -->
          <div v-else-if="!juryComplet(et)" class="row g-2 align-items-end">
            <div class="col-12 col-sm-6 col-lg-5">
              <label class="form-label" style="font-size:12px">Ajouter un membre</label>
              <select v-model="selectionMembre[et.etudiant_id]" class="form-select form-select-sm">
                <option value="">— Choisir un enseignant —</option>
                <option v-for="e in enseignantsDisposPour(et)" :key="e.id" :value="e.id + '|' + e.nom_complet">
                  {{ e.nom_complet }}
                </option>
              </select>
            </div>
            <div class="col-12 col-sm-4 col-lg-3">
              <label class="form-label" style="font-size:12px">Rôle</label>
              <select v-model="selectionRole[et.etudiant_id]" class="form-select form-select-sm">
                <option value="president"   :disabled="!!et.president_id">Président{{ et.president_id ? ' (déjà assigné)' : '' }}</option>
                <option value="examinateur" :disabled="!!et.examinateur_id">Examinateur{{ et.examinateur_id ? ' (déjà assigné)' : '' }}</option>
              </select>
            </div>
            <div class="col-auto">
              <button
                class="btn btn-sm btn-primary"
                :disabled="!selectionMembre[et.etudiant_id]"
                @click="ajouterMembre(et)">
                Ajouter
              </button>
            </div>
          </div>
        </div>

      </div>
    </div><!-- /etudiantsFiltres loop -->
  </div>

  <!-- ══ MODAL : Retirer un rôle ══ -->
  <Teleport to="body">
    <Transition name="jry-modal">
      <div v-if="showClearRoleM" class="jry-overlay" @click.self="showClearRoleM=false">
        <div class="jry-modal" role="dialog">
          <div class="jry-modal__head">
            <div class="jry-modal__head-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/>
              </svg>
            </div>
            <div class="jry-modal__head-text">
              <div class="jry-modal__title">Retirer ce membre ?</div>
              <div class="jry-modal__sub">Cette action est irréversible</div>
            </div>
            <button class="jry-modal__close" @click="showClearRoleM=false">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="jry-modal__body">
            <div class="jry-warn-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>
                Retirer <strong>{{ clearRoleTarget?.role === 'president' ? clearRoleTarget?.et?.president_nom : clearRoleTarget?.et?.examinateur_nom }}</strong>
                ({{ clearRoleTarget?.role === 'president' ? 'Président' : 'Examinateur' }})
                du jury de <strong>{{ clearRoleTarget?.et?.etudiant_nom }}</strong> ?
              </span>
            </div>
          </div>
          <div class="jry-modal__foot">
            <button class="jry-btn jry-btn--ghost" @click="showClearRoleM=false">Annuler</button>
            <button class="jry-btn jry-btn--danger" @click="confirmClearRole">Retirer le membre</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══ MODAL : Supprimer le jury ══ -->
  <Teleport to="body">
    <Transition name="jry-modal">
      <div v-if="showSupprimerM" class="jry-overlay" @click.self="showSupprimerM=false">
        <div class="jry-modal" role="dialog">
          <div class="jry-modal__head">
            <div class="jry-modal__head-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </div>
            <div class="jry-modal__head-text">
              <div class="jry-modal__title">Supprimer le jury ?</div>
              <div class="jry-modal__sub">Cette action est irréversible</div>
            </div>
            <button class="jry-modal__close" @click="showSupprimerM=false">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="jry-modal__body">
            <div class="jry-warn-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Supprimer le jury de <strong>{{ supprimerTarget?.etudiant_nom }}</strong> ? Cette action ne peut pas être annulée.</span>
            </div>
          </div>
          <div class="jry-modal__foot">
            <button class="jry-btn jry-btn--ghost" @click="showSupprimerM=false">Annuler</button>
            <button class="jry-btn jry-btn--danger" @click="confirmSupprimerJury">Supprimer définitivement</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══ MODAL : Modifier le jury publié ══ -->
  <Teleport to="body">
    <Transition name="jry-modal">
      <div v-if="showModifierM" class="jry-overlay" @click.self="showModifierM=false">
        <div class="jry-modal" role="dialog">
          <div class="jry-modal__head jry-modal__head--warning">
            <div class="jry-modal__head-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div class="jry-modal__head-text">
              <div class="jry-modal__title">Modifier le jury ?</div>
              <div class="jry-modal__sub">Le jury passera en mode modifiable</div>
            </div>
            <button class="jry-modal__close" @click="showModifierM=false">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="jry-modal__body">
            <div class="jry-warn-box jry-warn-box--warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>
                Le jury de <strong>{{ modifierTarget?.etudiant_nom }}</strong> sera remis en état <strong>modifiable</strong>.
                Les membres seront renotifiés uniquement lorsque vous cliquerez sur <strong>Publier</strong> à nouveau.
              </span>
            </div>
          </div>
          <div class="jry-modal__foot">
            <button class="jry-btn jry-btn--ghost" @click="showModifierM=false">Annuler</button>
            <button class="jry-btn jry-btn--warning" @click="confirmModifierJury" :disabled="modifying[modifierTarget?.etudiant_id]">
              <span v-if="modifying[modifierTarget?.etudiant_id]" class="jry-spinner"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier le jury
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  </div><!-- /single root wrapper -->
</template>

<script>
import api from '@/services/api.js'
export default {
  name: 'GestionJury',
  emits: ['toast'],
  data () {
    return {
      loadingEtudiants: false,
      etudiants:        [],   // flat rows from /jurys-pfe/etudiants-du-chef
      enseignants:      [],   // from /jurys-pfe/enseignants-departement
      selectionMembre:  {},   // etudiant_id → "enseignant_id|nom"
      selectionRole:    {},   // etudiant_id → 'president' | 'examinateur'
      publishing:       {},
      modifying:        {},
      toast: { show: false, message: '', type: 'toast-ok' },
      // Modals
      showClearRoleM:  false,
      showSupprimerM:  false,
      showModifierM:   false,
      clearRoleTarget: null,  // { et, role }
      supprimerTarget: null,  // et
      modifierTarget:  null,  // et
      // Filters
      searchQuery:  '',
      filterStatut: '',
    }
  },
  mounted () { this.chargerEtudiants() },
  computed: {
    etudiantsFiltres () {
      let list = this.etudiants
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase()
        list = list.filter(et =>
          (et.etudiant_nom || '').toLowerCase().includes(q) ||
          (et.projet_titre || '').toLowerCase().includes(q) ||
          (et.encadrant_nom || '').toLowerCase().includes(q)
        )
      }
      if (this.filterStatut) {
        list = list.filter(et => {
          if (this.filterStatut === 'publie')    return et.publie
          if (this.filterStatut === 'compose')   return this.juryComplet(et) && !et.publie
          if (this.filterStatut === 'en_cours')  return et.jury_id && !this.juryComplet(et)
          if (this.filterStatut === 'sans_jury') return !et.jury_id
          return true
        })
      }
      return list
    },
  },
  methods: {
    showToast (message, type = 'toast-ok') {
      this.$emit('toast', { message, type })
      this.toast = { show: true, message, type }
      setTimeout(() => { this.toast.show = false }, 3500)
    },

    async chargerEtudiants () {
      this.loadingEtudiants = true
      try {
        const res = await api.get('/jurys-pfe/etudiants-du-chef')
        this.etudiants = res.data || []
        this.etudiants.forEach(et => {
          if (!(et.etudiant_id in this.selectionMembre)) this.selectionMembre[et.etudiant_id] = ''
          if (!(et.etudiant_id in this.selectionRole))   this.selectionRole[et.etudiant_id]   = 'president'
          if (!(et.etudiant_id in this.publishing))      this.publishing[et.etudiant_id]       = false
          if (!(et.etudiant_id in this.modifying))       this.modifying[et.etudiant_id]        = false
        })
        await this.chargerEnseignants()
      } catch {
        this.showToast('Impossible de charger la liste des étudiants.', 'toast-err')
      } finally {
        this.loadingEtudiants = false
      }
    },

    async chargerEnseignants () {
      try {
        const res = await api.get('/jurys-pfe/enseignants-departement')
        this.enseignants = (res.data || []).map(u => ({
          id: u.id,
          nom_complet: u.nom_complet,
          role: u.role,
        }))
      } catch { console.error('Erreur chargement enseignants') }
    },

    // Returns number of roles filled (max 3: encadrant + president + examinateur)
    membresRemplis (et) {
      return [et.encadrant_id, et.president_id, et.examinateur_id].filter(Boolean).length
    },

    // Jury is complete when all 3 roles are filled
    juryComplet (et) {
      return !!(et.encadrant_id && et.president_id && et.examinateur_id)
    },

    // Exclude already-assigned members from the picker
    enseignantsDisposPour (et) {
      const taken = new Set([et.encadrant_id, et.president_id, et.examinateur_id].filter(Boolean))
      return this.enseignants.filter(e => !taken.has(e.id))
    },

    async ajouterMembre (et) {
      const val = this.selectionMembre[et.etudiant_id]
      if (!val) return

      const enseignantId = parseInt(val.split('|')[0])
      const role = this.selectionRole[et.etudiant_id] || 'president'
      this.selectionMembre[et.etudiant_id] = ''

      // Frontend guard
      if (role === 'president' && et.president_id) {
        this.showToast('Un président est déjà assigné à ce jury.', 'toast-err'); return
      }
      if (role === 'examinateur' && et.examinateur_id) {
        this.showToast('Un examinateur est déjà assigné à ce jury.', 'toast-err'); return
      }

      // Create jury row if not yet done
      if (!et.jury_id) {
        if (!et.projet_pfe_id) {
          this.showToast("Cet étudiant n'a pas encore de projet PFE.", 'toast-err'); return
        }
        try {
          const jr = await api.post('/jurys-pfe', { projet_id: et.projet_pfe_id })
          et.jury_id       = jr.data.id
          et.encadrant_id  = jr.data.encadrant_id
          et.encadrant_nom = jr.data.encadrant_nom
        } catch (e) {
          this.showToast(e.response?.data?.message || 'Erreur création jury.', 'toast-err'); return
        }
      }

      // Call the right endpoint depending on the role
      const endpoint = role === 'president'
        ? `/jurys-pfe/${et.jury_id}/president`
        : `/jurys-pfe/${et.jury_id}/examinateur`

      try {
        const res = await api.put(endpoint, { enseignant_id: enseignantId })
        const enseignantNom = this.enseignants.find(e => e.id === enseignantId)?.nom_complet ?? ''
        if (role === 'president') {
          et.president_id  = enseignantId
          et.president_nom = enseignantNom
        } else {
          et.examinateur_id  = enseignantId
          et.examinateur_nom = enseignantNom
        }
        // Auto-switch to remaining slot
        this.selectionRole[et.etudiant_id] = role === 'president' ? 'examinateur' : 'president'
        this.showToast('Membre ajouté — jury non encore publié.')
      } catch (e) {
        this.showToast(e.response?.data?.message || "Erreur lors de l'ajout.", 'toast-err')
      }
    },

    async publierJury (et) {
      if (!et.jury_id) return
      this.publishing[et.etudiant_id] = true
      try {
        await api.post(`/jurys-pfe/${et.jury_id}/publier-jury`)
        et.publie = true
        this.showToast('Jury publié — notifications envoyées au président et à l\'examinateur.')
      } catch (e) {
        this.showToast(e.response?.data?.message || 'Erreur lors de la publication.', 'toast-err')
      } finally {
        this.publishing[et.etudiant_id] = false
      }
    },

    openClearRole (et, role) {
      this.clearRoleTarget = { et, role }
      this.showClearRoleM  = true
    },
    async confirmClearRole () {
      const { et, role } = this.clearRoleTarget
      const endpoint = `/jurys-pfe/${et.jury_id}/${role}`
      try {
        await api.delete(endpoint)
        if (role === 'president') { et.president_id = null; et.president_nom = null }
        else { et.examinateur_id = null; et.examinateur_nom = null }
        this.showClearRoleM = false
        this.showToast('Membre retiré.')
      } catch (e) {
        this.showToast(e.response?.data?.message || 'Erreur lors du retrait.', 'toast-err')
      }
    },

    openSupprimerJury (et) {
      this.supprimerTarget = et
      this.showSupprimerM  = true
    },
    async confirmSupprimerJury () {
      const et = this.supprimerTarget
      try {
        await api.delete(`/jurys-pfe/${et.jury_id}`)
        et.jury_id = null
        et.president_id = null; et.president_nom = null
        et.examinateur_id = null; et.examinateur_nom = null
        et.publie = false
        this.showSupprimerM = false
        this.showToast('Jury supprimé.')
      } catch (e) {
        this.showToast(e.response?.data?.message || 'Erreur.', 'toast-err')
      }
    },

    openModifierJury (et) {
      this.modifierTarget = et
      this.showModifierM  = true
    },
    async confirmModifierJury () {
      const et = this.modifierTarget
      this.modifying[et.etudiant_id] = true
      try {
        await api.post(`/jurys-pfe/${et.jury_id}/modifier-jury`)
        et.publie = false
        this.showModifierM = false
        this.showToast('Jury remis en modification.')
      } catch (e) {
        this.showToast(e.response?.data?.message || 'Erreur.', 'toast-err')
      } finally {
        this.modifying[et.etudiant_id] = false
      }
    },

    exporterCSV () {
      const statutLabel = (et) => {
        if (et.publie)           return 'Publié'
        if (this.juryComplet(et)) return 'Composé (non publié)'
        if (et.jury_id)          return 'En cours'
        return 'Sans jury'
      }
      const headers = ['Étudiant', 'Projet', 'Encadrant', 'Président', 'Examinateur', 'Statut']
      const rows = this.etudiantsFiltres.map(et => [
        `"${(et.etudiant_nom || '').replace(/"/g, '""')}"`,
        `"${(et.projet_titre || '').replace(/"/g, '""')}"`,
        `"${(et.encadrant_nom || '').replace(/"/g, '""')}"`,
        `"${(et.president_nom || '—').replace(/"/g, '""')}"`,
        `"${(et.examinateur_nom || '—').replace(/"/g, '""')}"`,
        `"${statutLabel(et)}"`,
      ])
      const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `jurys_pfe_${new Date().toISOString().slice(0,10)}.csv`
      a.click(); URL.revokeObjectURL(url)
    },

    initiales (n) { return (n || '?').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) },
  },
}
</script>

<style>
/* ══ Search bar ══ */
.jry-search-wrap { position: relative; display: flex; align-items: center; }
.jry-search-icon { position: absolute; left: 10px; color: var(--vld-text-muted, #999); pointer-events: none; z-index: 1; }
.jry-search-input { padding-left: 30px !important; padding-right: 28px !important; }
.jry-search-clear { position: absolute; right: 8px; background: none; border: none; cursor: pointer; color: var(--vld-text-muted, #999); display: flex; align-items: center; padding: 0; line-height: 1; }
.jry-search-clear:hover { color: #555; }

/* ══ Modals ══ */
.jry-overlay { position: fixed; inset: 0; z-index: 1050; background: rgba(10,18,28,.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.jry-modal { width: 100%; max-width: 440px; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,.06), 0 20px 60px rgba(0,0,0,.32), 0 0 0 1px rgba(0,0,0,.08); display: flex; flex-direction: column; }
.jry-modal__head { display: flex; align-items: center; gap: 14px; padding: 20px 22px; background: linear-gradient(135deg, #8b1a1a 0%, #6b0f0f 100%); }
.jry-modal__head-icon { width: 42px; height: 42px; border-radius: 10px; background: rgba(255,255,255,.15); border: 1.5px solid rgba(255,255,255,.22); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
.jry-modal__head-text { flex: 1; min-width: 0; }
.jry-modal__title { font-size: 16px; font-weight: 800; color: #fff; margin: 0 0 3px; }
.jry-modal__sub { font-size: 12px; color: rgba(255,255,255,.65); font-weight: 500; }
.jry-modal__close { width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,.14); border: none; color: rgba(255,255,255,.8); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .12s; }
.jry-modal__close:hover { background: rgba(255,255,255,.26); color: #fff; }
.jry-modal__body { padding: 22px 22px 18px; background: #fff; }
.jry-warn-box { display: flex; align-items: flex-start; gap: 13px; background: rgba(220,53,53,.07); border: 1.5px solid rgba(220,53,53,.22); border-radius: 10px; padding: 15px 16px; font-size: 14px; line-height: 1.6; color: #2d0a0a; }
.jry-warn-box svg { flex-shrink: 0; margin-top: 1px; color: #c0392b; }
.jry-modal__foot { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 16px 22px; background: #fafafa; border-top: 1px solid #eee; }
.jry-btn { display: inline-flex; align-items: center; gap: 7px; padding: 10px 20px; border-radius: 9px; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all .15s; border: none; white-space: nowrap; }
.jry-btn:disabled { opacity: .55; cursor: not-allowed; }
.jry-btn--ghost { background: #fff; border: 1.5px solid #d0ccc6; color: #444; }
.jry-btn--ghost:hover:not(:disabled) { background: #f3f0ec; border-color: #b0aba4; }
.jry-btn--danger { background: #c0392b; color: #fff; border: 1.5px solid #a93226; box-shadow: 0 2px 8px rgba(192,57,43,.35); }
.jry-btn--danger:hover:not(:disabled) { background: #a93226; box-shadow: 0 4px 14px rgba(192,57,43,.45); }
.jry-modal__head--warning { background: linear-gradient(135deg, #b06000 0%, #7a4000 100%); }
.jry-warn-box--warning { background: rgba(180,100,0,.07); border-color: rgba(180,100,0,.25); color: #3d1f00; }
.jry-warn-box--warning svg { color: #c97800; }
.jry-btn--warning { background: #c97800; color: #fff; border: 1.5px solid #a86200; box-shadow: 0 2px 8px rgba(180,100,0,.30); }
.jry-btn--warning:hover:not(:disabled) { background: #a86200; box-shadow: 0 4px 14px rgba(180,100,0,.42); }
.jry-spinner { display: inline-block; width: 13px; height: 13px; border-radius: 50%; border: 2px solid rgba(255,255,255,.35); border-top-color: #fff; animation: jry-spin .7s linear infinite; }
@keyframes jry-spin { to { transform: rotate(360deg); } }
.jry-modal-enter-active, .jry-modal-leave-active { transition: opacity .2s ease, transform .2s ease; }
.jry-modal-enter-from, .jry-modal-leave-to { opacity: 0; transform: scale(.96) translateY(8px); }
</style>