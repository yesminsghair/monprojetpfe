<template>
  <div class="page-wrapper">

    <!-- Toast -->
    <transition name="toast-anim">
      <div v-if="toast.visible" class="global-toast" :class="toast.type">
        <svg v-if="toast.type==='toast-ok'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <!-- POPUP FICHE CHEF -->
    <transition name="popup-fade">
      <div v-if="ficheChef.visible" class="chef-popup-overlay" @click.self="fermerFiche">
        <div class="chef-popup-card">

          <div class="popup-header">
            <div class="popup-avatar">{{ ficheChef.initiales }}</div>
            <div class="popup-header-info">
              <p class="popup-fullname">{{ ficheChef.prenom }} {{ ficheChef.nom }}</p>
              <p class="popup-role">Chef de département</p>
            </div>
            <button class="popup-close" @click="fermerFiche" title="Fermer">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="popup-body">
            <div class="popup-row">
              <span class="popup-label">Matricule</span>
              <span class="popup-value popup-mono">{{ ficheChef.matricule || '—' }}</span>
            </div>
            <div class="popup-row" v-if="ficheChef.email">
              <span class="popup-label">Email</span>
              <span class="popup-value popup-link">{{ ficheChef.email }}</span>
            </div>
            <div class="popup-row" v-if="ficheChef.telephone">
              <span class="popup-label">Téléphone</span>
              <span class="popup-value">{{ ficheChef.telephone }}</span>
            </div>
            <div class="popup-row" v-if="ficheChef.domaineExpertise">
              <span class="popup-label">Domaine</span>
              <span class="popup-value popup-domaine">{{ ficheChef.domaineExpertise }}</span>
            </div>
            <div class="popup-row">
              <span class="popup-label">Spécialité</span>
              <span class="popup-value">
                <span v-if="ficheChef.specialiteNom" class="popup-spec">
                  <span class="popup-spec-code">{{ ficheChef.specialiteCode }}</span>
                  {{ ficheChef.specialiteNom }}
                </span>
                <span v-else class="popup-no-spec">Non affecté</span>
              </span>
            </div>
            <div class="popup-row" v-if="ficheChef.dateAffectation">
              <span class="popup-label">Affecté le</span>
              <span class="popup-value">{{ ficheChef.dateAffectation }}</span>
            </div>
          </div>

          <div class="popup-footer">
            <button class="popup-btn-close" @click="fermerFiche">Fermer</button>
          </div>

        </div>
      </div>
    </transition>

    <!-- Modal Supprimer -->
    <SupprimerSpecialite
      :visible="deleteModal.visible"
      :specialite="deleteModal.specialite"
      @confirmed="onDeleteConfirmed"
      @cancelled="deleteModal.visible = false"
    />

    <!-- Modal Modifier -->
    <transition name="modal-fade">
      <div v-if="editModal.visible" class="modal-overlay" @click.self="closeEdit">
        <div class="edit-modal-card">
          <button class="modal-close" @click="closeEdit">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <ModifierSpecialite
            :specialite="editModal.specialite"
            :specialitesExistantes="specialites"
            @updated="onUpdated"
            @cancelled="closeEdit"
          />
        </div>
      </div>
    </transition>

    <!-- CONTENU PRINCIPAL -->
    <div class="list-wrapper">

      <div class="list-header">
        <div class="list-header-left">
          <h1 class="list-title">Liste des spécialités</h1>
          <p class="list-sub">{{ filteredSpecialites.length }} résultat{{ filteredSpecialites.length !== 1 ? 's' : '' }}</p>
        </div>
        <button class="btn-export" @click="exporterCSV">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exporter en CSV
        </button>
      </div>

      <div class="toolbar">
        <div class="search-wrap">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="recherche" type="text" placeholder="Rechercher par nom ou code..." class="search-input"/>
          <button v-if="recherche" class="clear-search" @click="recherche = ''">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div v-if="filteredSpecialites.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </div>
        <p class="empty-title">Aucune spécialité trouvée</p>
        <p class="empty-sub" v-if="recherche">Essayez d'autres critères de recherche.</p>
        <p class="empty-sub" v-else>Aucune spécialité n'a encore été créée.</p>
      </div>

      <div v-else class="table-wrap">
        <table class="spec-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Nom</th>
              <th>Description</th>
              <th>Date de création</th>
              <th>Chef(s) affecté(s)</th>
              <th class="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="spec in filteredSpecialites" :key="spec.id" class="table-row">
              <td><span class="code-tag">{{ spec.code }}</span></td>
              <td><div class="spec-name">{{ spec.nom }}</div></td>
              <td><div class="desc-cell" :title="spec.description">{{ spec.description }}</div></td>
              <td><span class="date-cell">{{ spec.dateCreation }}</span></td>
              <td>
                <div v-if="spec.chefs && spec.chefs.length > 0" class="chefs-list">
                  <button
                    v-for="(chef, i) in spec.chefs"
                    :key="i"
                    class="chef-tag"
                    @click.stop="ouvrirFiche(chef)"
                    title="Voir la fiche de ce chef"
                  >
                    <svg class="chef-tag-icon" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span class="chef-tag-name">{{ chef.prenom }} {{ chef.nom }}</span>
                    <span class="chef-tag-matricule">{{ chef.matricule }}</span>
                  </button>
                </div>
                <span v-else class="no-chef">Aucun chef affecté</span>
              </td>
              <td class="td-actions">
                <button class="action-btn action-edit" @click="ouvrirModification(spec)" title="Modifier">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Modifier
                </button>
                <button class="action-btn action-delete" @click="ouvrirSuppression(spec)" title="Supprimer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script>
import SupprimerSpecialite from './SupprimerSpecialite.vue'
import ModifierSpecialite  from './ModifierSpecialite.vue'

export default {
  name: 'ListeSpecialites',
  components: { SupprimerSpecialite, ModifierSpecialite },
  props: {
    specialites: { type: Array, default: () => [] },
  },
  emits: ['update-specialite', 'delete-specialite'],
  data() {
    return {
      recherche:   '',
      deleteModal: { visible: false, specialite: null },
      editModal:   { visible: false, specialite: null },
      toast:       { visible: false, type: 'toast-ok', message: '' },
      ficheChef: {
        visible: false,
        nom: '', prenom: '', matricule: '', initiales: '',
        email: '', telephone: '', domaineExpertise: '',
        specialiteNom: '', specialiteCode: '', dateAffectation: '',
      },
    }
  },
  computed: {
    filteredSpecialites() {
      if (!this.recherche.trim()) return [...this.specialites]
      const q = this.recherche.trim().toLowerCase()
      return this.specialites.filter(s =>
        s.nom.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
      )
    },
  },
  methods: {
    ouvrirFiche(chef) {
      const p = (chef.prenom || '').trim()
      const n = (chef.nom    || '').trim()
      this.ficheChef = {
        visible:          true,
        nom:              n,
        prenom:           p,
        matricule:        chef.matricule        || '',
        initiales:        ((p[0] || '') + (n[0] || '')).toUpperCase(),
        email:            chef.email            || '',
        telephone:        chef.telephone        || '',
        domaineExpertise: chef.domaineExpertise || '',
        specialiteNom:    chef.specialiteNom    || '',
        specialiteCode:   chef.specialiteCode   || '',
        dateAffectation:  chef.dateAffectation  || '',
      }
    },
    fermerFiche() { this.ficheChef.visible = false },
    ouvrirSuppression(spec) { this.deleteModal = { visible: true, specialite: spec } },
    ouvrirModification(spec){ this.editModal   = { visible: true, specialite: { ...spec } } },
    closeEdit()              { this.editModal.visible = false },
    onDeleteConfirmed(spec) {
      this.$emit('delete-specialite', spec.id)
      this.deleteModal.visible = false
      this.afficherToast('toast-ok', 'Spécialité supprimée avec succès.')
    },
    onUpdated(updated) {
      this.$emit('update-specialite', updated)
      this.editModal.visible = false
      this.afficherToast('toast-ok', 'Spécialité modifiée avec succès.')
    },
    exporterCSV() {
      const header = ['Code', 'Nom', 'Description', 'Date de création', 'Chefs (Nom Matricule)']
      const lignes = this.filteredSpecialites.map(s => {
        const chefs = s.chefs && s.chefs.length
          ? s.chefs.map(c => c.prenom + ' ' + c.nom + ' (' + c.matricule + ')').join(' | ')
          : 'Aucun'
        return [s.code, s.nom, '"' + s.description + '"', s.dateCreation, '"' + chefs + '"'].join(';')
      })
      const csv  = [header.join(';'), ...lignes].join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = 'specialites.csv'; a.click()
      URL.revokeObjectURL(url)
      this.afficherToast('toast-ok', 'Export CSV téléchargé avec succès.')
    },
    afficherToast(type, message) {
      this.toast = { visible: true, type, message }
      setTimeout(() => { this.toast.visible = false }, 3500)
    },
  },
}
</script>

<style scoped>
.page-wrapper { min-height: 100%; padding: 32px 16px; position: relative; }

/* POPUP FICHE CHEF */
.chef-popup-overlay {
  position: fixed; inset: 0;
  background: rgba(13, 25, 40, 0.50);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 20px;
  backdrop-filter: blur(4px);
}
.chef-popup-card {
  background: #ddd9d1;
  border-radius: 18px;
  width: 100%; max-width: 360px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.30);
  border: 1.5px solid #c8c4bc;
  overflow: hidden;
  animation: popIn 0.28s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.90) translateY(20px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}
.popup-header {
  display: flex; align-items: center; gap: 14px;
  padding: 20px 20px 18px;
  background: linear-gradient(135deg, #3d6080 0%, #2f4f6a 100%);
  position: relative;
}
.popup-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,0.18);
  border: 2px solid rgba(255,255,255,0.35);
  color: #fff; font-weight: 700; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.popup-header-info { flex: 1; min-width: 0; }
.popup-fullname {
  font-family: 'Merriweather', serif; font-size: 15px;
  font-weight: 700; color: #fff;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.popup-role { font-size: 12px; color: rgba(255,255,255,0.60); margin-top: 3px; }
.popup-close {
  position: absolute; top: 14px; right: 14px;
  background: rgba(255,255,255,0.12); border: none;
  border-radius: 8px; width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.70); cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.popup-close:hover { background: rgba(255,255,255,0.24); color: #fff; }

.popup-body { padding: 12px 20px; }
.popup-row {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(200,196,188,0.55);
}
.popup-row:last-child { border-bottom: none; }
.popup-label {
  font-size: 11px; font-weight: 700; color: #8a9aaa;
  text-transform: uppercase; letter-spacing: 0.07em;
  min-width: 88px; flex-shrink: 0; padding-top: 2px;
}
.popup-value   { font-size: 13.5px; color: #1e2a35; font-weight: 500; word-break: break-word; }
.popup-mono    { font-family: monospace; font-size: 13px; color: #3d6080; font-weight: 700; }
.popup-link    { color: #3d6080; }
.popup-domaine {
  display: inline-block;
  background: rgba(142,68,173,0.10); color: #7d3c8c;
  font-size: 12.5px; font-weight: 600;
  padding: 2px 10px; border-radius: 6px;
  border: 1px solid rgba(142,68,173,0.20);
}
.popup-spec {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(61,96,128,0.10); color: #2f4f6a;
  font-size: 12.5px; font-weight: 500;
  padding: 3px 10px; border-radius: 6px;
}
.popup-spec-code {
  font-size: 11px; font-weight: 700; color: #fff;
  background: #3d6080; padding: 1px 7px; border-radius: 4px;
}
.popup-no-spec { font-size: 12.5px; color: #aaa49c; font-style: italic; }

.popup-footer {
  padding: 12px 20px 16px;
  border-top: 1px solid #c8c4bc;
  display: flex; justify-content: flex-end;
}
.popup-btn-close {
  padding: 9px 24px; border: 1.5px solid #c8c4bc; border-radius: 9px;
  background: #e8e4dc; color: #4a5a6a;
  font-size: 13.5px; font-weight: 600;
  font-family: 'Source Sans 3', sans-serif;
  cursor: pointer; transition: all 0.18s;
}
.popup-btn-close:hover { border-color: #3d6080; color: #3d6080; }

/* TRANSITIONS */
.popup-fade-enter-active { transition: opacity 0.22s ease; }
.popup-fade-leave-active { transition: opacity 0.18s ease; }
.popup-fade-enter-from, .popup-fade-leave-to { opacity: 0; }
.modal-fade-enter-active { transition: opacity 0.22s ease; }
.modal-fade-leave-active { transition: opacity 0.18s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* MODAL MODIFIER */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px; backdrop-filter: blur(3px);
}
.edit-modal-card {
  background: #ddd9d1; border-radius: 20px; width: 100%; max-width: 660px;
  max-height: 90vh; overflow-y: auto; position: relative;
  box-shadow: 0 24px 60px rgba(0,0,0,0.22); border: 1.5px solid #c8c4bc;
  animation: popIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
}
.modal-close {
  position: absolute; top: 16px; right: 16px; z-index: 10;
  background: rgba(0,0,0,0.06); border: none; border-radius: 8px;
  width: 30px; height: 30px; display: flex; align-items: center;
  justify-content: center; cursor: pointer; color: #4a5a6a; transition: all 0.15s;
}
.modal-close:hover { background: rgba(0,0,0,0.12); color: #1e2a35; }

/* EXPORT BTN */
.btn-export {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 18px; border: 1.5px solid #3d6080; border-radius: 10px;
  background: rgba(61,96,128,0.08); color: #3d6080;
  font-size: 13.5px; font-weight: 600; font-family: 'Source Sans 3', sans-serif;
  cursor: pointer; transition: all 0.18s; white-space: nowrap;
}
.btn-export:hover { background: #3d6080; color: #fff; }

/* TABLE ROW */
.table-row {
  border-bottom: 1px solid #c8c4bc; transition: background 0.15s;
  animation: rowIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes rowIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: #d4d0c8; }
.th-actions { text-align: right; }

/* CHEF TAGS */
.chefs-list { display: flex; flex-direction: column; gap: 5px; }
.chef-tag {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(61,96,128,0.09);
  border: 1px solid rgba(61,96,128,0.18);
  border-radius: 7px; padding: 4px 9px;
  width: fit-content; cursor: pointer;
  transition: background 0.18s, border-color 0.18s, transform 0.15s;
  font-family: 'Source Sans 3', sans-serif;
}
.chef-tag:hover {
  background: rgba(61,96,128,0.20);
  border-color: #3d6080;
  transform: translateY(-1px);
}
.chef-tag-icon     { color: #3d6080; flex-shrink: 0; }
.chef-tag-name     { font-size: 12.5px; font-weight: 600; color: #1e2a35; }
.chef-tag-matricule {
  font-size: 11px; font-weight: 700; color: #fff;
  background: #3d6080; padding: 1px 7px; border-radius: 4px;
  font-family: monospace;
}
.no-chef { font-size: 12.5px; color: #8a9aaa; font-style: italic; }

/* EMPTY STATE */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 64px 20px; text-align: center; }
.empty-icon  { width: 72px; height: 72px; border-radius: 18px; background: #e8e4dc; display: flex; align-items: center; justify-content: center; color: #8a9aaa; }
.empty-title { font-family: 'Merriweather', serif; font-size: 18px; font-weight: 700; color: #1e2a35; }
.empty-sub   { font-size: 14px; color: #8a9aaa; }
</style>