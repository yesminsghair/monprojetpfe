<template>
  <div class="page-content">

    <!-- Toolbar : recherche seulement (bouton ajouter retiré) -->
    <div class="toolbar-row">
      <RechercherChef
        v-model:recherche="recherche"
        v-model:filtreSpecialite="filtreSpecialite"
        v-model:dateDebut="dateDebut"
        v-model:dateFin="dateFin"
        :specialites="specialites"
        @exporter="exporterCSV"
      />
    </div>

    <!-- Compteur -->
    <p class="result-count" v-if="recherche || filtreSpecialite">
      <strong>{{ chefsFiltres.length }}</strong> résultat(s)
      <button class="reset-link" @click="resetFiltres">· Réinitialiser</button>
    </p>

    <!-- Aucun chef -->
    <div v-if="chefsFiltres.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <p v-if="recherche || filtreSpecialite">Aucun chef ne correspond à votre recherche.</p>
      <p v-else>Aucun chef de département trouvé.</p>
    </div>

    <!-- Table -->
    <div v-else class="table-wrap">
      <table class="chef-table">
        <thead>
          <tr>
            <th>Chef de département</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Domaine d'expertise</th>
            <th>Spécialité affectée</th>
            <th>Date affectation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="chef in chefsPagines" :key="chef.id"
            class="table-row" @click="voirDetails(chef)">
            <td>
              <div class="chef-cell">
                <div class="chef-avatar">{{ initiales(chef) }}</div>
                <div>
                  <p class="chef-name">{{ chef.prenom }} {{ chef.nom }}</p>
                </div>
              </div>
            </td>
            <td class="td-email">{{ chef.email }}</td>
            <td>{{ chef.telephone || '—' }}</td>
            <td>
              <span v-if="chef.domaineExpertise" class="domaine-badge">{{ chef.domaineExpertise }}</span>
              <span v-else class="no-spec">Non renseigné</span>
            </td>
            <td>
              <span v-if="chef.specialiteNom" class="spec-badge">
                <span class="spec-code">{{ chef.specialiteCode }}</span>
                {{ chef.specialiteNom }}
              </span>
              <span v-else class="no-spec">Non affecté</span>
            </td>
            <td>{{ chef.dateAffectation }}</td>
            <td @click.stop class="td-actions">
              <button class="action-btn btn-affect" @click="ouvrirAffecter(chef)" title="Affecter à une spécialité">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                Affecter
              </button>
              <button class="action-btn btn-edit" @click="ouvrirModifier(chef)" title="Modifier">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Modifier
              </button>
              <button class="action-btn btn-del"
                :disabled="!chef.specialiteId"
                @click="ouvrirRetirer(chef)"
                :title="!chef.specialiteId ? 'Ce chef n\'est affecté à aucune spécialité' : 'Retirer du poste'">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                Retirer
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="page === 1" @click="page--">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button v-for="p in totalPages" :key="p"
          class="page-btn" :class="{ 'page-active': p === page }" @click="page = p">{{ p }}</button>
        <button class="page-btn" :disabled="page === totalPages" @click="page++">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <span class="page-info">Page {{ page }} / {{ totalPages }}</span>
      </div>
    </div>

    <!-- MODAL DÉTAILS -->
    <transition name="modal-fade">
    <div v-if="chefDetails" class="modal-overlay" @click.self="chefDetails = null">
      <div class="modal-box modal-details">
        <div class="modal-header">
          <h3>Détails du chef</h3>
          <button class="modal-close" @click="chefDetails = null">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-hero">
            <div class="detail-avatar">{{ initiales(chefDetails) }}</div>
            <div>
              <p class="detail-fullname">{{ chefDetails.prenom }} {{ chefDetails.nom }}</p>
              <p class="detail-email">{{ chefDetails.email }}</p>
            </div>
          </div>
          <div class="detail-row"><span class="dk">Téléphone</span><span>{{ chefDetails.telephone || '—' }}</span></div>
          <div class="detail-row">
            <span class="dk">Domaine d'expertise</span>
            <span>{{ chefDetails.domaineExpertise || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="dk">Spécialité</span>
            <span v-if="chefDetails.specialiteNom" class="spec-badge"><span class="spec-code">{{ chefDetails.specialiteCode }}</span>{{ chefDetails.specialiteNom }}</span>
            <span v-else class="no-spec">Non affecté</span>
          </div>
          <div class="detail-row"><span class="dk">Date affectation</span><span>{{ chefDetails.dateAffectation }}</span></div>

          <div v-if="chefDetails.historique && chefDetails.historique.length" class="historique-section">
            <p class="histo-title">Historique des affectations</p>
            <div v-for="(h, i) in chefDetails.historique" :key="i" class="histo-item">
              <span class="histo-date">{{ h.date }}</span>
              <span>{{ h.specialite }}</span>
              <span class="histo-motif" v-if="h.motif">· {{ h.motif }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-gold" @click="ouvrirModifier(chefDetails); chefDetails = null">Modifier</button>
          <button class="btn-outline" @click="chefDetails = null">Fermer</button>
        </div>
      </div>
    </div>
    </transition>

    <!-- MODAL AFFECTER -->
    <AffecterChef
      v-if="chefAffecter"
      :chef="chefAffecter"
      :specialites="specialites"
      :chefs="chefs"
      @fermer="chefAffecter = null"
      @affecte="onAffecte"
    />

    <!-- MODAL MODIFIER -->
    <ModifierChef
      v-if="chefModifier"
      :chef="chefModifier"
      :chefs="chefs"
      @fermer="chefModifier = null"
      @modifie="onModifie"
    />

    <!-- MODAL RETIRER -->
    <RetirerChef
      v-if="chefRetirer"
      :chef="chefRetirer"
      @fermer="chefRetirer = null"
      @retire="onRetire"
    />

  </div>
</template>

<script>
import RechercherChef from './RechercherChef.vue'
import AffecterChef   from './Affecterchef.vue'
import ModifierChef   from './Modifierchef.vue'
import RetirerChef    from './RetirerChef.vue'

const PAR_PAGE = 20

export default {
  name: 'ListeChefs',
  components: { RechercherChef, AffecterChef, ModifierChef, RetirerChef },
  props: {
    chefs:       { type: Array, default: () => [] },
    specialites: { type: Array, default: () => [] },
  },
  emits: ['chefs-maj', 'toast', 'navigate'],
  data() {
    return {
      recherche: '', filtreSpecialite: '', dateDebut: '', dateFin: '',
      page: 1,
      chefDetails: null, chefAffecter: null, chefModifier: null, chefRetirer: null,
    }
  },
  computed: {
    chefsFiltres() {
      const q = this.recherche.toLowerCase()
      return this.chefs.filter(c => {
        const matchQ  = !q || c.nom.toLowerCase().includes(q) || c.prenom.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
        const matchSp = !this.filtreSpecialite || c.specialiteId === this.filtreSpecialite
        return matchQ && matchSp
      })
    },
    totalPages() { return Math.max(1, Math.ceil(this.chefsFiltres.length / PAR_PAGE)) },
    chefsPagines() {
      const s = (this.page - 1) * PAR_PAGE
      return this.chefsFiltres.slice(s, s + PAR_PAGE)
    },
  },
  watch: {
    recherche()        { this.page = 1 },
    filtreSpecialite() { this.page = 1 },
  },
  methods: {
    initiales(c) { return ((c.prenom||'')[0] + (c.nom||'')[0]).toUpperCase() },
    resetFiltres() { this.recherche = ''; this.filtreSpecialite = ''; this.dateDebut = ''; this.dateFin = '' },
    voirDetails(c)   { this.chefDetails = { ...c } },
    ouvrirAffecter(c) { this.chefAffecter = c },
    ouvrirModifier(c) { this.chefModifier = c },
    ouvrirRetirer(c) {
      if (!c.specialiteId) { this.$emit('toast', { message: 'Ce chef n\'est affecté à aucune spécialité.', type: 'toast-err' }); return }
      this.chefRetirer = c
    },
    onAffecte({ chefId, specialiteId, specialiteNom, specialiteCode, conflitChefId }) {
      const date = new Date().toLocaleDateString('fr-FR')
      const maj = this.chefs.map(c => {
        if (c.id === conflitChefId) return { ...c, specialiteId: null, specialiteNom: '', specialiteCode: '', historique: [...(c.historique||[]), { specialite: specialiteNom, date, motif: 'Remplacé' }] }
        if (c.id === chefId)        return { ...c, specialiteId, specialiteNom, specialiteCode, dateAffectation: date, historique: [...(c.historique||[]), { specialite: specialiteNom, date, motif: 'Nouvelle affectation' }] }
        return c
      })
      this.$emit('chefs-maj', maj)
      this.$emit('toast', { message: 'Chef affecté avec succès.', type: 'toast-ok' })
      this.chefAffecter = null
    },
    onModifie({ id, nom, prenom, email, telephone, domaineExpertise }) {
      const maj = this.chefs.map(c => c.id === id ? { ...c, nom, prenom, email, telephone, domaineExpertise } : c)
      this.$emit('chefs-maj', maj)
      this.$emit('toast', { message: 'Informations modifiées avec succès.', type: 'toast-ok' })
    },
    onRetire({ chefId, motif, supprimerCompte, dateRetrait }) {
      let maj
      if (supprimerCompte) {
        maj = this.chefs.filter(c => c.id !== chefId)
        this.$emit('toast', { message: 'Chef retiré et compte supprimé.', type: 'toast-ok' })
      } else {
        maj = this.chefs.map(c => {
          if (c.id !== chefId) return c
          return { ...c, specialiteId: null, specialiteNom: '', specialiteCode: '', historique: [...(c.historique||[]), { specialite: c.specialiteNom, date: dateRetrait, motif: motif || 'Retrait du poste' }] }
        })
        this.$emit('toast', { message: 'Chef retiré avec succès.', type: 'toast-ok' })
      }
      this.$emit('chefs-maj', maj)
    },
    exporterCSV() {
      const lignes = ['Nom;Prénom;Email;Téléphone;Domaine expertise;Spécialité;Date affectation']
      this.chefsFiltres.forEach(c => {
        lignes.push(`${c.nom};${c.prenom};${c.email};${c.telephone||''};${c.domaineExpertise||''};${c.specialiteNom||''};${c.dateAffectation}`)
      })
      const blob = new Blob(['\uFEFF' + lignes.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a'); a.href = url; a.download = 'chefs_departement.csv'; a.click()
      URL.revokeObjectURL(url)
      this.$emit('toast', { message: 'Export CSV téléchargé.', type: 'toast-ok' })
    },
  },
}
</script>

<style scoped>
.page-content { flex: 1; padding: 32px; font-family: 'Source Sans 3', sans-serif; }
.result-count { font-size: 13px; color: #8a9aaa; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
.reset-link { background: none; border: none; color: #c0392b; font-size: 13px; cursor: pointer; padding: 0; font-family: 'Source Sans 3', sans-serif; text-decoration: underline; }

/* Table */
.chef-table { width: 100%; border-collapse: collapse; }
.chef-table thead tr { background: #3d6080; }
.chef-table th { padding: 13px 16px; text-align: left; font-size: 11.5px; font-weight: 600; color: rgba(255,255,255,0.85); letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; }
.chef-table tbody tr { border-bottom: 1px solid #c8c4bc; cursor: pointer; transition: background 0.15s; }
.chef-table tbody tr:last-child { border-bottom: none; }
.chef-table tbody tr:hover { background: rgba(61,96,128,0.07); }
.chef-table td { padding: 12px 16px; font-size: 13.5px; color: #1e2a35; vertical-align: middle; }
.td-email { color: #6a7a8a; font-size: 13px; }
.td-actions { white-space: nowrap; }

.domaine-badge { display: inline-block; background: rgba(142,68,173,0.10); color: #8e44ad; font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: 6px; border: 1px solid rgba(142,68,173,0.18); }

/* Action buttons */
.action-btn { display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 7px; font-size: 12px; font-family: 'Source Sans 3', sans-serif; font-weight: 500; cursor: pointer; border: 1.5px solid; transition: background 0.15s; margin-right: 5px; }
.btn-affect { border-color: #f5a623; color: #d98e1a; background: rgba(245,166,35,0.08); }
.btn-affect:hover { background: rgba(245,166,35,0.18); }
.btn-edit   { border-color: #3d6080; color: #3d6080; background: rgba(61,96,128,0.07); }
.btn-edit:hover   { background: rgba(61,96,128,0.16); }
.btn-del    { border-color: #c0392b; color: #c0392b; background: rgba(192,57,43,0.07); }
.btn-del:hover:not(:disabled) { background: rgba(192,57,43,0.15); }
.btn-del:disabled { opacity: 0.32; cursor: not-allowed; }

/* Detail modal extras */
.detail-hero { display: flex; align-items: center; gap: 14px; padding: 14px; background: rgba(61,96,128,0.08); border-radius: 10px; margin-bottom: 16px; }
.detail-avatar { width: 48px; height: 48px; border-radius: 50%; background: #3d6080; color: #fff; font-weight: 700; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.detail-fullname { font-weight: 700; color: #1e2a35; font-size: 15px; }
.detail-email    { font-size: 12.5px; color: #8a9aaa; margin-top: 2px; }
.detail-row { display: flex; align-items: flex-start; gap: 16px; padding: 10px 0; border-bottom: 1px solid rgba(200,196,188,0.5); }
.detail-row:last-of-type { border-bottom: none; }
.dk { font-size: 12px; font-weight: 600; color: #8a9aaa; text-transform: uppercase; letter-spacing: 0.05em; width: 150px; flex-shrink: 0; padding-top: 2px; }
.historique-section { margin-top: 16px; padding-top: 14px; border-top: 1px solid #c8c4bc; }
.histo-title { font-size: 11.5px; font-weight: 700; color: #8a9aaa; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
.histo-item  { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #4a5a6a; padding: 6px 0; border-bottom: 1px solid rgba(200,196,188,0.35); }
.histo-item:last-child { border-bottom: none; }
.histo-date  { color: #3d6080; font-weight: 600; min-width: 80px; font-size: 12px; flex-shrink: 0; }
.histo-motif { color: #8a9aaa; font-style: italic; font-size: 12.5px; }
</style>