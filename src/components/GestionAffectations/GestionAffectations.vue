<template>
  <div class="page-content">

    <div class="page-header-block">
      <div>
        <h2 class="page-title">Affectation des encadrants</h2>
        <p class="page-sub">Définissez les règles et procédez à l'affectation des encadrants aux étudiants</p>
      </div>
      <button class="btn-export" @click="exporterListe" v-if="affectations.length && etape === 'validation'">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Exporter CSV
      </button>
    </div>

    <!-- Étapes -->
    <div class="etapes-nav">
      <div v-for="(e, i) in etapes" :key="e.key" class="etape-item"
        :class="{ 'etape-active': etape === e.key, 'etape-done': etapeIndex > i }">
        <div class="etape-num">
          <svg v-if="etapeIndex > i" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span v-else>{{ i + 1 }}</span>
        </div>
        <div class="etape-lbl">{{ e.label }}</div>
        <div class="etape-line" v-if="i < etapes.length - 1"></div>
      </div>
    </div>

    <!-- ═══ ÉTAPE 1 : Mode ═══ -->
    <div v-if="etape === 'mode'" class="step-card">
      <div class="step-title">Choisir le mode d'affectation</div>

      <div class="mode-grid">
        <div v-for="m in modes" :key="m.key" class="mode-card"
          :class="{ 'mode-selected': modeChoisi === m.key }"
          @click="modeChoisi = m.key">
          <div class="mode-icon">{{ m.icon }}</div>
          <div class="mode-nom">{{ m.nom }}</div>
          <div class="mode-desc">{{ m.desc }}</div>
          <div class="mode-check" v-if="modeChoisi === m.key">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
      </div>

      <div class="mode-note" v-if="modeChoisi === 'manuel'">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Dans ce mode, les étudiants enverront eux-mêmes leurs demandes aux encadrants disponibles. L'affectation finale sera automatisée à partir des demandes acceptées.
      </div>

      <div class="step-footer">
        <button class="btn-primary" @click="confirmerMode" :disabled="!modeChoisi">
          Confirmer le mode <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- ═══ ÉTAPE 2 : Contraintes ═══ -->
    <div v-if="etape === 'contraintes'" class="step-card">
      <div class="step-title">Définir les contraintes d'affectation</div>
      <p class="step-sub">Ces règles seront respectées lors du processus d'affectation</p>

      <div class="contraintes-list" v-if="contraintes.length">
        <div v-for="(c, i) in contraintes" :key="i" class="contrainte-item">
          <div class="contrainte-badge" :class="'badge-' + c.type">{{ c.type }}</div>
          <div class="contrainte-val">{{ c.valeur }}</div>
          <button class="icon-btn-sm" @click="modifierContrainte(i)">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn-sm danger" @click="supprimerContrainte(i)">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
          </button>
        </div>
      </div>

      <button class="btn-add-contrainte" @click="showContrainteForm = true">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ajouter une contrainte
      </button>

      <div class="contrainte-form" v-if="showContrainteForm">
        <div class="row-2">
          <div class="field-block">
            <label class="field-label">Type</label>
            <select v-model="nouvelleContrainte.type" class="field-input">
              <option value="specialite">Spécialité</option>
              <option value="capacite">Capacité max</option>
              <option value="exclusion">Exclusion</option>
            </select>
          </div>
          <div class="field-block">
            <label class="field-label">Valeur</label>
            <input v-model="nouvelleContrainte.valeur" class="field-input" placeholder="Ex: Génie Logiciel, 3..."/>
          </div>
        </div>
        <div class="contrainte-actions">
          <button class="btn-outline-sm" @click="showContrainteForm=false">Annuler</button>
          <button class="btn-sm-primary" @click="ajouterContrainte">Enregistrer</button>
        </div>
      </div>

      <div class="step-footer">
        <button class="btn-outline" @click="etape='mode'">Retour</button>
        <button class="btn-primary" @click="allerAffectation">
          Passer à l'affectation <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- ═══ ÉTAPE 3 : Affectation ═══ -->
    <div v-if="etape === 'affectation'" class="step-card">
      <div class="step-header-row">
        <div class="step-title">{{ modeLabel }} — Tableau des affectations</div>
        <div class="mode-tag">{{ modeIcon }} {{ modeLabel }}</div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des données...</p>
      </div>

      <!-- Mode accord mutuel -->
      <div v-else-if="modeChoisi === 'manuel'" class="accord-info">
        <div class="accord-banner">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>
            <strong>Mode : Accord mutuel entre enseignant et étudiant</strong>
            <p>Les étudiants envoient leurs demandes aux encadrants de leur choix. Une fois qu'un encadrant accepte, l'affectation est confirmée. Diffusez pour rendre les résultats visibles.</p>
          </div>
        </div>

        <div v-if="affectations.length" class="aff-table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Spécialité</th>
                <th>Encadrant (demande acceptée)</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="aff in affectations" :key="aff.etudiant_id">
                <td>
                  <div class="etud-nom">{{ aff.etudiant }}</div>
                  <div class="etud-mat">{{ aff.matricule }}</div>
                </td>
                <td><span class="sp-badge">{{ aff.specialite || '—' }}</span></td>
                <td>{{ aff.encadrant || '—' }}</td>
                <td>
                  <span class="aff-status" :class="aff.encadrant_id ? 'status-ok' : 'status-pending'">
                    {{ aff.encadrant_id ? 'Affecté' : 'En attente' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-aff">
          <p>Aucune demande acceptée pour le moment. Les étudiants doivent d'abord soumettre leurs demandes et attendre l'acceptation d'un encadrant.</p>
        </div>
      </div>

      <!-- Mode aléatoire -->
      <div v-else-if="modeChoisi === 'aleatoire'">
        <div class="auto-launch" v-if="!affectations.length">
          <div class="auto-desc">L'algorithme distribue les étudiants aux encadrants en respectant les vœux et les contraintes définies.</div>
          <button class="btn-primary" @click="lancerAffectation" :disabled="loading">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
            Lancer l'affectation automatique
          </button>
        </div>
        <div v-if="affectations.length" class="aff-table-wrap">
          <table class="table">
            <thead><tr><th>Étudiant</th><th>Spécialité</th><th>Encadrant assigné</th><th>Statut</th><th>Modifier</th></tr></thead>
            <tbody>
              <tr v-for="(aff, i) in affectations" :key="aff.etudiant_id">
                <td><div class="etud-nom">{{ aff.etudiant }}</div><div class="etud-mat">{{ aff.matricule }}</div></td>
                <td><span class="sp-badge">{{ aff.specialite || '—' }}</span></td>
                <td>
                  <select v-model="aff.encadrant_id" @change="updateEncadrantNom(aff)" class="field-input-sm">
                    <option value="">— Non affecté —</option>
                    <option v-for="enc in encadrants" :key="enc.id" :value="enc.id">{{ enc.nom_complet }}</option>
                  </select>
                </td>
                <td><span class="aff-status" :class="aff.encadrant_id ? 'status-ok' : 'status-pending'">{{ aff.encadrant_id ? 'Affecté' : 'En attente' }}</span></td>
                <td>
                  <button class="icon-btn-sm danger" @click="retirerAffectation(i)" title="Retirer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mode semi-aléatoire -->
      <div v-else-if="modeChoisi === 'semi'">
        <div class="semi-config">
          <label class="field-label">Nombre d'étudiants à affecter automatiquement</label>
          <div class="number-input">
            <button type="button" @click="nbPreFill > 1 && nbPreFill--" class="num-btn">−</button>
            <input type="number" v-model="nbPreFill" class="field-input num-field" min="1"/>
            <button type="button" @click="nbPreFill++" class="num-btn">+</button>
          </div>
          <button class="btn-sm-primary mt-8" @click="lancerAffectation" :disabled="loading">Lancer le pré-remplissage</button>
        </div>

        <div v-if="affectations.length" class="aff-table-wrap">
          <table class="table">
            <thead><tr><th>Étudiant</th><th>Spécialité</th><th>Encadrant assigné</th><th>Statut</th><th>Modifier</th></tr></thead>
            <tbody>
              <tr v-for="(aff, i) in affectations" :key="i">
                <td><div class="etud-nom">{{ aff.etudiant }}</div><div class="etud-mat">{{ aff.matricule }}</div></td>
                <td><span class="sp-badge">{{ aff.specialite || '—' }}</span></td>
                <td>
                  <select v-model="aff.encadrant_id" @change="updateEncadrantNom(aff)" class="field-input-sm">
                    <option value="">— Non affecté —</option>
                    <option v-for="enc in encadrants" :key="enc.id" :value="enc.id">{{ enc.nom_complet }}</option>
                  </select>
                </td>
                <td><span class="aff-status" :class="aff.encadrant_id ? 'status-ok' : 'status-pending'">{{ aff.encadrant_id ? 'Affecté' : 'En attente' }}</span></td>
                <td>
                  <button class="icon-btn-sm danger" @click="retirerAffectation(i)" title="Retirer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="step-footer">
        <button class="btn-outline" @click="etape='contraintes'">Retour</button>
        <button class="btn-outline" @click="reinitialiser" v-if="affectations.length && modeChoisi !== 'manuel'">Réinitialiser</button>
        <button class="btn-primary" @click="etape='validation'" :disabled="!affectations.length && modeChoisi !== 'manuel'">
          Valider les affectations <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- ═══ ÉTAPE 4 : Validation & Diffusion ═══ -->
    <div v-if="etape === 'validation'" class="step-card">
      <div class="step-title">Récapitulatif & Diffusion</div>

      <div class="recap-stats">
        <div class="rstat green">
          <div class="rstat-val">{{ affectations.filter(a=>a.encadrant_id).length }}</div>
          <div class="rstat-lbl">Affectés</div>
        </div>
        <div class="rstat orange">
          <div class="rstat-val">{{ affectations.filter(a=>!a.encadrant_id).length }}</div>
          <div class="rstat-lbl">Non affectés</div>
        </div>
        <div class="rstat blue">
          <div class="rstat-val">{{ new Set(affectations.map(a=>a.encadrant_id).filter(Boolean)).size }}</div>
          <div class="rstat-lbl">Encadrants</div>
        </div>
      </div>

      <div class="aff-table-wrap">
        <table class="table">
          <thead><tr><th>Étudiant</th><th>Matricule</th><th>Spécialité</th><th>Encadrant</th></tr></thead>
          <tbody>
            <tr v-for="aff in affectations" :key="aff.etudiant_id">
              <td>{{ aff.etudiant }}</td>
              <td class="td-mat">{{ aff.matricule }}</td>
              <td><span class="sp-badge">{{ aff.specialite || '—' }}</span></td>
              <td>{{ aff.encadrant || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="step-footer">
        <button class="btn-danger" @click="confirmerReinit" v-if="diffuse || affectations.length">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.85"/></svg>
          Réinitialiser
        </button>
        <button class="btn-outline" @click="etape='affectation'">
          {{ diffuse ? '✏️ Modifier les affectations' : 'Retour' }}
        </button>
        <button class="btn-success" @click="diffuser" :disabled="saving">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          {{ saving ? 'Diffusion...' : diffuse ? 'Re-diffuser la liste' : 'Diffuser la liste finale' }}
        </button>
      </div>

      <div class="diffusion-ok" v-if="diffuse">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Liste diffusée. Encadrants et étudiants voient les résultats. Vous pouvez modifier et re-diffuser.
      </div>

      <!-- Modal confirmation réinitialisation -->
      <transition name="modal-fade">
        <div class="overlay" v-if="showReinitModal" @click.self="showReinitModal=false">
          <div class="modal">
            <h4 style="color:#e74c3c;margin-bottom:12px">⚠️ Réinitialiser les affectations</h4>
            <p style="font-size:14px;color:#4a5a6a;line-height:1.6;margin-bottom:20px">
              Cette action va <strong>supprimer toutes les affectations</strong> de votre département et annuler la diffusion.<br>
              Les étudiants et encadrants ne verront plus les résultats.
            </p>
            <div style="display:flex;gap:10px;justify-content:flex-end">
              <button class="btn-outline" @click="showReinitModal=false">Annuler</button>
              <button class="btn-danger" @click="reinitialiserTotal" :disabled="reinitEnCours">
                {{ reinitEnCours ? 'Suppression...' : 'Oui, réinitialiser' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>

  </div>
</template>
<script>
import api from '@/services/api.js'

export default {
  name: 'GestionAffectations',

  data() {
    return {
      etape: 'mode',

      etapes: [
        { key: 'mode', label: 'Mode' },
        { key: 'contraintes', label: 'Contraintes' },
        { key: 'affectation', label: 'Affectation' },
        { key: 'validation', label: 'Validation' },
      ],

      modeChoisi: '',

      modes: [
        {
          key: 'manuel',
          icon: '🤝',
          nom: 'Accord mutuel enseignant / étudiant',
          desc: "L'étudiant choisit son encadrant parmi les disponibles et envoie une demande.",
        },
        {
          key: 'aleatoire',
          icon: '🎲',
          nom: 'Affectation automatique',
          desc: "Distribution automatique selon contraintes.",
        },
        {
          key: 'semi',
          icon: '⚡',
          nom: 'Semi-automatique',
          desc: "Pré-remplissage + ajustement manuel.",
        },
      ],

      contraintes: [],
      showContrainteForm: false,
      nouvelleContrainte: { type: 'specialite', valeur: '' },

      // ✅ FIX ADDED
      editingContrainteIndex: null,

      affectations: [],
      encadrants: [],

      nbPreFill: 3,
      loading: false,
      saving: false,
      diffuse: false,

      showReinitModal: false,
      reinitEnCours: false,
    }
  },

  computed: {
    etapeIndex() {
      return this.etapes.findIndex(e => e.key === this.etape)
    },
    modeLabel() {
      return this.modes.find(m => m.key === this.modeChoisi)?.nom || ''
    },
    modeIcon() {
      return this.modes.find(m => m.key === this.modeChoisi)?.icon || ''
    },
  },

  async created() {
    await this.initData()
  },

  methods: {

    async initData() {
      await this.loadEncadrants()
      await this.loadAffectations()
    },

    async loadEncadrants() {
      try {
        const res = await api.get('/affectations/encadrants-disponibles')

        this.encadrants = (res.data || []).map(e => ({
          id: e.id,
          nom_complet: e.nom_complet,
          nb_affectes: e.nb_affectes,
        }))

      } catch (e) {
        console.error('Erreur encadrants:', e)
      }
    },

    async loadAffectations() {
      try {
        // Load the saved mode first (from chef_mode_settings)
        const modeRes = await api.get('/affectations/mode').catch(() => ({ data: { mode: null } }))
        const savedMode = modeRes.data?.mode
        if (savedMode) {
          this.modeChoisi = savedMode
        }

        const res = await api.get('/affectations')
        const data = Array.isArray(res.data) ? res.data : []

        if (data.length) {
          this.affectations = data.map(a => ({
            id: a.id,
            etudiant_id: a.etudiant_id,
            etudiant: a.etudiant,
            matricule: a.matricule || '',
            specialite: a.specialite || '',
            encadrant_id: a.encadrant_id,
            encadrant: a.encadrant || '',
          }))

          if (!this.modeChoisi) this.modeChoisi = data[0]?.mode || ''

          if (data[0]?.statut === 'diffusee') {
            this.diffuse = true
            this.etape = 'validation'
          }
        }

        // If mode already saved but no affectations yet (accord mutuel in progress),
        // skip to the right step so the chef sees the status
        if (savedMode && !data.length) {
          this.etape = 'contraintes'
        }

      } catch (e) {
        console.error('Erreur affectations:', e)
      }
    },

    async confirmerMode() {
      // Persist the chosen mode to the backend immediately
      // so students can read it from GET /affectations/mode
      try {
        await api.post('/affectations/save-mode', { mode: this.modeChoisi })
      } catch (e) {
        console.error('Erreur save-mode:', e)
        // proceed anyway – mode will be stored on diffusion at the latest
      }
      this.etape = 'contraintes'
    },

    async allerAffectation() {
      this.etape = 'affectation'

      if (this.modeChoisi === 'manuel') {
        // Always reload accepted demandes to show latest status
        await this.chargerDemandesAcceptees()
      }
    },

    async chargerDemandesAcceptees() {
      this.loading = true
      try {
        const res = await api.get('/demandes-encadrement')

        const toutes = Array.isArray(res.data) ? res.data : []
        const acceptees = toutes.filter(d => d.statut === 'acceptee')

        this.affectations = acceptees.map(d => ({
          etudiant_id: d.etudiant_id,
          etudiant: d.etudiant,
          matricule: d.matricule || '',
          specialite: d.specialite || '',
          encadrant_id: d.encadrant_id,
          encadrant: d.encadrant || '',
        }))

      } catch (e) {
        console.error('Erreur demandes:', e)
      } finally {
        this.loading = false
      }
    },

    ajouterContrainte() {
      if (!this.nouvelleContrainte.valeur) return

      const contrainte = { ...this.nouvelleContrainte }

      if (this.editingContrainteIndex !== null) {
        this.contraintes.splice(this.editingContrainteIndex, 1, contrainte)
        this.editingContrainteIndex = null
      } else {
        this.contraintes.push(contrainte)
      }

      this.nouvelleContrainte = { type: 'specialite', valeur: '' }
      this.showContrainteForm = false
    },

    modifierContrainte(i) {
      this.nouvelleContrainte = { ...this.contraintes[i] }
      this.editingContrainteIndex = i
      this.showContrainteForm = true
    },

    supprimerContrainte(i) {
      this.contraintes.splice(i, 1)
    },

    annulerContrainte() {
      this.showContrainteForm = false
      this.nouvelleContrainte = { type: 'specialite', valeur: '' }
      this.editingContrainteIndex = null
    },

    async lancerAffectation() {
      this.loading = true

      try {
        const res = await api.get('/affectations/etudiants-de-ma-specialite')
        const etudiants = res.data || []

        const limit = this.modeChoisi === 'semi'
          ? this.nbPreFill
          : etudiants.length

        this.affectations = etudiants.map((e, i) => ({
          etudiant_id: e.id,
          etudiant: e.prenom + ' ' + e.nom,
          matricule: e.matricule || '',
          specialite: e.specialite || '',
          encadrant_id:
            i < limit ? (this.encadrants[i % this.encadrants.length]?.id || null) : null,
          encadrant:
            i < limit ? (this.encadrants[i % this.encadrants.length]?.nom_complet || '') : '',
        }))

      } catch (e) {
        console.error('Erreur chargement:', e)
      } finally {
        this.loading = false
      }
    },

    retirerAffectation(i) {
      this.affectations[i].encadrant = ''
      this.affectations[i].encadrant_id = null
    },

    updateEncadrantNom(aff) {
      const enc = this.encadrants.find(e => e.id === aff.encadrant_id)
      aff.encadrant = enc ? enc.nom_complet : ''
    },

    reinitialiser() {
      this.affectations = []
    },

    confirmerReinit() {
      this.showReinitModal = true
    },

    async reinitialiserTotal() {
      this.reinitEnCours = true

      try {
        await api.delete('/affectations/reinitialiser')

        this.affectations = []
        this.diffuse = false
        this.modeChoisi = ''
        this.contraintes = []
        this.etape = 'mode'
        this.showReinitModal = false

      } catch (e) {
        console.error('Erreur réinitialisation:', e)
      } finally {
        this.reinitEnCours = false
      }
    },

    async diffuser() {
      this.saving = true

      try {
        if (this.affectations.length) {
          await api.post('/affectations/batch', {
            mode: this.modeChoisi,
            affectations: this.affectations.map(a => ({
              etudiant_id: a.etudiant_id,
              encadrant_id: a.encadrant_id || null,
            })),
            contraintes: this.contraintes,
          })
        }

        await api.post('/affectations/diffuser', { mode: this.modeChoisi })

        this.diffuse = true

        // In accord-mutuel mode, reload so the table reflects what the backend built
        if (this.modeChoisi === 'manuel') {
          await this.chargerDemandesAcceptees()
        }

      } catch (e) {
        console.error('Erreur diffusion:', e)
      } finally {
        this.saving = false
      }
    },

    exporterListe() {
      const csv = [
        'Étudiant,Matricule,Spécialité,Encadrant',
        ...this.affectations.map(a =>
          `${a.etudiant},${a.matricule},${a.specialite},${a.encadrant || '-'}`
        )
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = 'affectations.csv'
      a.click()
    },
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600&family=Merriweather:wght@700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.page-content { padding: 32px; font-family: 'Source Sans 3', sans-serif; }
.page-header-block { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.page-title { font-family: 'Merriweather', serif; font-size: 20px; color: #1e2a35; margin-bottom: 4px; }
.page-sub { font-size: 13.5px; color: #8a9aaa; }
.btn-export { display: flex; align-items: center; gap: 7px; padding: 9px 16px; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 9px; font-size: 13px; color: #4a5a6a; cursor: pointer; font-family: inherit; font-weight: 600; transition: all 0.18s; }
.btn-export:hover { border-color: #3d6080; color: #3d6080; }
.etapes-nav { display: flex; align-items: center; margin-bottom: 28px; }
.etape-item { display: flex; align-items: center; }
.etape-num { width: 30px; height: 30px; border-radius: 50%; background: #e8e4dc; border: 2px solid #c8c4bc; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #8a9aaa; flex-shrink: 0; }
.etape-active .etape-num { background: #3d6080; border-color: #3d6080; color: #fff; }
.etape-done .etape-num { background: #27ae60; border-color: #27ae60; color: #fff; }
.etape-lbl { margin-left: 8px; font-size: 13px; font-weight: 600; color: #8a9aaa; white-space: nowrap; }
.etape-active .etape-lbl { color: #3d6080; }
.etape-done .etape-lbl { color: #27ae60; }
.etape-line { width: 40px; height: 2px; background: #c8c4bc; margin: 0 8px; }
.step-card { background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 14px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.step-title { font-family: 'Merriweather', serif; font-size: 17px; color: #1e2a35; margin-bottom: 6px; }
.step-sub { font-size: 13.5px; color: #8a9aaa; margin-bottom: 20px; }
.step-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.mode-tag { display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: rgba(61,96,128,0.1); border: 1.5px solid rgba(61,96,128,0.2); border-radius: 20px; font-size: 13px; font-weight: 600; color: #3d6080; }
.mode-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
@media (max-width: 900px) { .mode-grid { grid-template-columns: 1fr; } }
.mode-card { position: relative; padding: 20px; background: #e8e4dc; border: 2px solid #c8c4bc; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
.mode-card:hover { border-color: #3d6080; }
.mode-selected { border-color: #3d6080; background: rgba(61,96,128,0.07); }
.mode-icon { font-size: 28px; margin-bottom: 10px; }
.mode-nom { font-size: 14px; font-weight: 700; color: #1e2a35; margin-bottom: 6px; }
.mode-desc { font-size: 12.5px; color: #4a5a6a; line-height: 1.5; }
.mode-check { position: absolute; top: 12px; right: 12px; }
.mode-note { display: flex; align-items: flex-start; gap: 10px; padding: 14px 16px; background: rgba(245,166,35,0.1); border: 1.5px solid rgba(245,166,35,0.3); border-radius: 10px; font-size: 13px; color: #7a5c00; margin-bottom: 16px; line-height: 1.5; }
.accord-banner { display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: rgba(61,96,128,0.08); border: 1.5px solid rgba(61,96,128,0.2); border-radius: 10px; font-size: 13.5px; color: #1e2a35; margin-bottom: 20px; line-height: 1.6; }
.accord-banner strong { display: block; margin-bottom: 4px; }
.accord-banner p { color: #4a5a6a; font-size: 13px; margin: 0; }
.empty-aff { text-align: center; padding: 40px; color: #8a9aaa; font-size: 14px; }
.contraintes-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.contrainte-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 9px; }
.contrainte-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.badge-specialite { background: rgba(61,96,128,0.15); color: #3d6080; }
.badge-capacite { background: rgba(245,166,35,0.15); color: #d98e1a; }
.badge-exclusion { background: rgba(192,57,43,0.12); color: #922b21; }
.contrainte-val { flex: 1; font-size: 13.5px; color: #1e2a35; }
.btn-add-contrainte { display: flex; align-items: center; gap: 7px; padding: 10px 16px; background: transparent; border: 1.5px dashed #c8c4bc; border-radius: 9px; font-size: 13.5px; color: #4a5a6a; cursor: pointer; font-family: inherit; transition: all 0.18s; margin-bottom: 16px; }
.btn-add-contrainte:hover { border-color: #3d6080; color: #3d6080; }
.contrainte-form { background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field-block { margin-bottom: 0; }
.field-label { display: block; font-size: 13px; font-weight: 600; color: #1e2a35; margin-bottom: 6px; }
.field-input { width: 100%; padding: 9px 12px; background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 8px; font-size: 13px; color: #1e2a35; font-family: inherit; }
.field-input:focus { outline: none; border-color: #3d6080; }
.contrainte-actions { display: flex; gap: 8px; margin-top: 12px; justify-content: flex-end; }
.semi-config { background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
.number-input { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.num-btn { width: 34px; height: 34px; border-radius: 7px; border: 1.5px solid #c8c4bc; background: #ddd9d1; color: #3d6080; font-size: 17px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.num-btn:hover { background: #3d6080; color: #fff; }
.num-field { width: 60px; text-align: center; }
.mt-8 { margin-top: 12px; }
.auto-launch { text-align: center; padding: 40px; }
.auto-desc { font-size: 14px; color: #4a5a6a; margin-bottom: 20px; line-height: 1.6; }
.aff-table-wrap { border: 1.5px solid #c8c4bc; border-radius: 10px; overflow: hidden; margin-bottom: 20px; margin-top: 16px; }
.table { width: 100%; border-collapse: collapse; background: #e8e4dc; }
.table th { background: #c8c4bc; padding: 10px 14px; font-size: 11.5px; font-weight: 700; color: #4a5a6a; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; }
.table td { padding: 12px 14px; border-top: 1px solid #c8c4bc; font-size: 13.5px; }
.etud-nom { font-weight: 600; color: #1e2a35; }
.etud-mat { font-size: 12px; color: #8a9aaa; }
.td-mat { font-size: 12.5px; color: #8a9aaa; }
.sp-badge { padding: 3px 10px; background: rgba(61,96,128,0.1); color: #3d6080; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.aff-status { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.status-ok { background: #d4edda; color: #1e7e34; }
.status-pending { background: #fef9e7; color: #d98e1a; }
.field-input-sm { padding: 6px 10px; background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 7px; font-size: 12.5px; color: #1e2a35; font-family: inherit; width: 100%; }
.recap-stats { display: flex; gap: 16px; margin-bottom: 20px; }
.rstat { flex: 1; text-align: center; padding: 14px; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 10px; }
.rstat-val { font-family: 'Merriweather', serif; font-size: 28px; font-weight: 700; }
.rstat-lbl { font-size: 12px; color: #8a9aaa; margin-top: 3px; }
.rstat.green .rstat-val { color: #27ae60; }
.rstat.orange .rstat-val { color: #d98e1a; }
.rstat.blue .rstat-val { color: #3d6080; }
.step-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; padding-top: 20px; border-top: 1.5px solid #c8c4bc; }
.btn-primary { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #3d6080; color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.18s; }
.btn-primary:hover { background: #2f4f6a; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-outline { padding: 10px 18px; background: transparent; border: 1.5px solid #c8c4bc; border-radius: 10px; font-size: 13.5px; color: #4a5a6a; cursor: pointer; font-family: inherit; transition: all 0.18s; }
.btn-outline:hover { border-color: #3d6080; color: #3d6080; }
.btn-success { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #27ae60; color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.18s; }
.btn-success:hover { background: #1e8449; }
.btn-danger { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #e74c3c; color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.18s; }
.btn-danger:hover:not(:disabled) { background: #c0392b; }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-success:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-sm-primary { padding: 7px 14px; background: #3d6080; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
.btn-outline-sm { padding: 7px 14px; background: transparent; border: 1.5px solid #c8c4bc; border-radius: 8px; font-size: 13px; color: #4a5a6a; cursor: pointer; font-family: inherit; }
.icon-btn-sm { width: 28px; height: 28px; border-radius: 7px; border: 1.5px solid #c8c4bc; background: #ddd9d1; color: #4a5a6a; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.18s; }
.icon-btn-sm:hover { border-color: #3d6080; color: #3d6080; }
.icon-btn-sm.danger:hover { border-color: #c0392b; color: #c0392b; }
.diffusion-ok { display: flex; align-items: center; gap: 10px; padding: 16px; background: rgba(39,174,96,0.1); border: 1.5px solid rgba(39,174,96,0.3); border-radius: 10px; font-size: 14px; color: #1a6b3a; font-weight: 600; margin-top: 16px; }
.loading-state { text-align: center; padding: 40px; color: #8a9aaa; }
.spinner { width: 32px; height: 32px; border: 3px solid #c8c4bc; border-top-color: #3d6080; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal { background: #ddd9d1; border-radius: 14px; padding: 28px; max-width: 480px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-fade-enter-active { transition: opacity 0.25s ease; }
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>