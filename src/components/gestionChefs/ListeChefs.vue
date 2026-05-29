<template>
<div><!-- fragment root: needed so <Teleport> is a sibling of .page-wrap -->
  <div class="page-wrap">
    <!-- Page header -->
    <div class="page-header">
      <div class="page-header__left">
        <div class="page-header__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div>
          <h1 class="page-title">Chefs de département</h1>
          <p class="page-sub">
            <span class="count-badge">{{ chefsFiltres.length }}</span>
            chef{{ chefsFiltres.length !== 1 ? 's' : '' }} trouvé{{ chefsFiltres.length !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>
      <div class="page-header__actions">
        <button class="btn-export" @click="exporterCSV" title="Exporter en CSV">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exporter CSV
        </button>
      </div>
    </div>

    <!-- Search + filters bar -->
    <RechercherChef
      v-model:recherche="search"
      v-model:filtreSpecialite="filtreSpecialite"
      v-model:dateDebut="dateDebut"
      v-model:dateFin="dateFin"
      :specialites="specialites"
      @exporter="exporterCSV"
    />

    <!-- States -->
    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <p class="state-text">Chargement des données…</p>
    </div>
    <div v-else-if="erreur" class="alert-err">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ erreur }}
    </div>
    <div v-else-if="!chefsFiltres.length" class="state-box">
      <div class="state-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <p class="state-text">Aucun chef trouvé</p>
      <p class="state-sub">Modifiez les critères de recherche</p>
    </div>

    <!-- Table -->
    <div v-else class="table-card">
      <table class="chef-table">
        <thead>
          <tr>
            <th style="width:48px"></th>
            <th>Chef de département</th>
            <th>Contact</th>
            <th>Spécialité</th>
            <th>Domaine d'expertise</th>
            <th>Affectation</th>
            <th style="width:110px;text-align:center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in chefsFiltres" :key="c.id" class="chef-row">
            <td>
              <div class="avatar" :style="{ background: avatarColor(c) }">
                {{ initiales(c) }}
              </div>
            </td>
            <td>
              <div class="chef-name">{{ c.prenom }} {{ c.nom }}</div>
              <div class="chef-matricule" v-if="c.matricule">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8l-2 4h12z"/>
                </svg>
                {{ c.matricule }}
              </div>
            </td>
            <td>
              <div class="chef-email">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {{ c.email }}
              </div>
              <div class="chef-tel" v-if="c.telephone">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.71 2.81a2 2 0 0 1-.45 2.11L7.91 8.85a16 16 0 0 0 6.08 6.08l.97-.97a2 2 0 0 1 2.11-.45c.91.35 1.85.58 2.81.71A2 2 0 0 1 21.78 17z"/>
                </svg>
                {{ c.telephone }}
              </div>
            </td>
            <td>
              <div v-if="c.specialiteNom" class="spec-badge">
                <span class="spec-dot"></span>
                <div>
                  <div class="spec-name">{{ c.specialiteNom }}</div>
                  <div class="spec-code">{{ c.specialiteCode }}</div>
                </div>
              </div>
              <span v-else class="no-value">Non affecté</span>
            </td>
            <td>
              <div v-if="c.domaineExpertise" class="domaine-tag">{{ c.domaineExpertise }}</div>
              <span v-else class="no-value">—</span>
            </td>
            <td>
              <div v-if="c.dateAffectation" class="date-cell">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {{ c.dateAffectation }}
              </div>
              <span v-else class="no-value">—</span>
            </td>
            <td>
              <div class="actions-cell">
                <button class="act-btn act-btn--affecter" @click="chefAAfecter = c" title="Affecter à une spécialité">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  Affecter
                </button>
                <button class="act-btn act-btn--edit" @click="startEdit(c)" title="Modifier">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="act-btn act-btn--del" @click="modalRetrait = c" title="Retirer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/><line x1="22" y1="11" x2="16" y2="11"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Modifier inline -->
    <Transition name="modal-fade">
      <div v-if="editId" class="modal-overlay" @click.self="editId = null">
        <div class="modal-box">
          <div class="modal-hd">
            <div class="modal-hd__left">
              <div class="modal-hd-icon icon-blue">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <span class="modal-title">Modifier le chef</span>
            </div>
            <button class="modal-close" @click="editId = null">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-bd">
            <div class="grid-2">
              <div class="field">
                <label class="lbl">Prénom <span class="req">*</span></label>
                <input v-model="editForm.prenom" class="inp" placeholder="Prénom" />
              </div>
              <div class="field">
                <label class="lbl">Nom <span class="req">*</span></label>
                <input v-model="editForm.nom" class="inp" placeholder="Nom" />
              </div>
            </div>
            <div class="field">
              <label class="lbl">Email <span class="req">*</span></label>
              <input v-model="editForm.email" class="inp" type="email" placeholder="email@univ.dz" />
            </div>
            <div class="field">
              <label class="lbl">Téléphone</label>
              <input v-model="editForm.telephone" class="inp" placeholder="Ex : 0555 12 34 56" />
            </div>
            <div class="field">
              <label class="lbl">Domaine d'expertise</label>
              <input v-model="editForm.domaineExpertise" class="inp" placeholder="Ex : Génie Logiciel…" />
            </div>
          </div>
          <div class="modal-ft">
            <button class="btn-primary-m" :disabled="editSaving" @click="sauvegarder">
              <div v-if="editSaving" class="spin-sm"></div>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Enregistrer
            </button>
            <button class="btn-ghost-m" @click="editId = null">Annuler</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal Retirer -->
    <Transition name="modal-fade">
      <div v-if="modalRetrait" class="modal-overlay" @click.self="modalRetrait = null">
        <div class="modal-box modal-box--sm">
          <div class="modal-hd">
            <div class="modal-hd__left">
              <div class="modal-hd-icon icon-red">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/><line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
              </div>
              <span class="modal-title">Retirer du poste</span>
            </div>
            <button class="modal-close" @click="modalRetrait = null">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-bd">
            <div class="warn-banner">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                fill="none" stroke="#c0392b" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p class="confirm-txt">
              Retirer <strong>{{ modalRetrait.prenom }} {{ modalRetrait.nom }}</strong>
              de son poste de chef de département ?
            </p>
            <p v-if="modalRetrait.specialiteNom" class="confirm-sub">
              Spécialité concernée : <strong>{{ modalRetrait.specialiteNom }}</strong>
            </p>
            <p class="confirm-sub">Son compte restera actif avec le rôle d'encadrant.</p>
          </div>
          <div class="modal-ft">
            <button class="btn-danger-m" :disabled="retraitSaving" @click="retirerChef">
              <div v-if="retraitSaving" class="spin-sm"></div>
              Confirmer le retrait
            </button>
            <button class="btn-ghost-m" @click="modalRetrait = null">Annuler</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal Affecter -->
    <AffecterChef
      v-if="chefAAfecter"
      :chef="chefAAfecter"
      :specialites="specialites"
      :chefs="chefs"
      @affecte="onAffecte"
      @fermer="chefAAfecter = null"
    />

  </div><!-- /.page-wrap -->

  <!-- Teleported outside the component tree so Vue <Transition> transforms never clip it -->
  <Teleport to="body">
    <Transition name="lc-toast-fade">
      <div v-if="toast.visible" class="lc-toast" :class="'lc-toast--' + toast.type">
        <svg v-if="toast.type === 'ok'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <svg v-else-if="toast.type === 'warn'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ toast.message }}
      </div>
    </Transition>
  </Teleport>

</div><!-- /fragment root -->
</template>

<script>
import api from '@/services/api.js'
import RechercherChef from './RechercherChef.vue'
import AffecterChef from './AffecterChef.vue'
import { useToast, consumePendingToast } from '@/composables/useToast.js'

const COLORS = ['#3d6080','#2f4f6a','#5a7fa0','#c9a100','#f5a623','#3a5f7d','#243d52']

export default {
  name: 'ListeChefs',
  components: { RechercherChef, AffecterChef },
  emits: ['navigate'],

  setup() {
    const { toast, showToast, onToastEvent } = useToast(3500)
    return { toast, showToast, onToastEvent }
  },

  data() {
    return {
      chefs: [], specialites: [], loading: false, erreur: '',
      search: '', filtreSpecialite: '', dateDebut: '', dateFin: '',
      editId: null, editForm: {}, editSaving: false,
      modalRetrait: null, retraitSaving: false,
      chefAAfecter: null,
    }
  },

  computed: {
    chefsFiltres() {
      return this.chefs.filter(c => {
        if (this.search) {
          const q = this.search.toLowerCase()
          if (!`${c.prenom} ${c.nom} ${c.email} ${c.matricule || ''}`.toLowerCase().includes(q)) return false
        }
        if (this.filtreSpecialite !== '' && this.filtreSpecialite !== null) {
          if (c.specialiteId !== Number(this.filtreSpecialite)) return false
        }
        if (this.dateDebut || this.dateFin) {
          if (!c.dateAffectation) return false
          const [j, m, a] = c.dateAffectation.split('/')
          const ts = new Date(`${a}-${m}-${j}`).getTime()
          if (this.dateDebut && ts < new Date(this.dateDebut).getTime()) return false
          if (this.dateFin   && ts > new Date(this.dateFin).getTime())   return false
        }
        return true
      })
    },
  },

  mounted() {
    this.charger()
    const pending = consumePendingToast()
    if (pending) {
      this.$nextTick(() => this.showToast(pending.message, pending.type))
    }
  },

  methods: {
    async charger() {
      this.loading = true; this.erreur = ''
      try {
        const [resChefs, resSpecs] = await Promise.all([api.get('/chefs'), api.get('/specialites')])
        this.chefs       = resChefs.data || []
        this.specialites = resSpecs.data || []
      } catch (e) {
        this.erreur = e.response?.data?.message || 'Erreur lors du chargement des données.'
      } finally { this.loading = false }
    },

    initiales(c) {
      return ((c.prenom?.[0] ?? '') + (c.nom?.[0] ?? '')).toUpperCase() || '?'
    },

    avatarColor(c) {
      const idx = (c.id || 0) % COLORS.length
      return COLORS[idx]
    },

    startEdit(c) {
      this.editId = c.id
      this.editForm = {
        nom: c.nom, prenom: c.prenom, email: c.email,
        telephone: c.telephone || '', domaineExpertise: c.domaineExpertise || '',
      }
    },

    async sauvegarder() {
      this.editSaving = true
      try {
        const r = await api.put(`/chefs/${this.editId}/modifier`, {
          nom: this.editForm.nom, prenom: this.editForm.prenom,
          email: this.editForm.email,
          telephone: this.editForm.telephone || null,
          domaineExpertise: this.editForm.domaineExpertise || null,
        })
        const idx = this.chefs.findIndex(c => c.id === this.editId)
        if (idx !== -1) this.chefs.splice(idx, 1, r.data)
        this.editId = null
        this.showToast('Informations mises à jour avec succès', 'ok')
      } catch (e) {
        console.error(e)
        this.showToast(e.response?.data?.message || 'Erreur lors de la modification', 'err')
      } finally { this.editSaving = false }
    },

    async retirerChef() {
      this.retraitSaving = true
      try {
        await api.post(`/chefs/${this.modalRetrait.id}/retirer`, { supprimerCompte: false, motif: '' })
        this.chefs = this.chefs.filter(c => c.id !== this.modalRetrait.id)
        this.showToast(`${this.modalRetrait.prenom} ${this.modalRetrait.nom} retiré du poste`, 'warn')
        this.modalRetrait = null
      } catch (e) {
        console.error(e)
        this.showToast(e.response?.data?.message || 'Erreur lors du retrait', 'err')
      } finally { this.retraitSaving = false }
    },

    onAffecte(updatedChef) {
      const idx = this.chefs.findIndex(c => c.id === updatedChef.id)
      if (idx !== -1) this.chefs.splice(idx, 1, updatedChef)
      this.chefAAfecter = null
      this.showToast(`${updatedChef.prenom} ${updatedChef.nom} affecté avec succès`, 'ok')
    },

    // showToast is provided by useToast composable via setup()

    exporterCSV() {
      const headers = ['Prénom','Nom','Email','Téléphone','Matricule','Spécialité','Code','Domaine','Date affectation']
      const rows = this.chefsFiltres.map(c => [
        c.prenom||'', c.nom||'', c.email||'', c.telephone||'', c.matricule||'',
        c.specialiteNom||'', c.specialiteCode||'', c.domaineExpertise||'', c.dateAffectation||'',
      ])
      const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `chefs_${new Date().toISOString().slice(0,10)}.csv`; a.click()
      URL.revokeObjectURL(url)
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.page-wrap { font-family: 'Sora', sans-serif; color: #1a2332; }

/* ── Header ── */
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
}
.page-header__left { display: flex; align-items: center; gap: 14px; }
.page-header__icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, #3d6080 0%, #5a7fa0 100%);
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(61,96,128,.28);
}
.page-title { font-size: 20px; font-weight: 700; color: #1a2332; letter-spacing: -0.4px; }
.page-sub { font-size: 13px; color: #6b7a8d; margin-top: 2px; display: flex; align-items: center; gap: 6px; }
.count-badge {
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(245,197,24,.18); color: #b38a00; font-size: 12px; font-weight: 600;
  padding: 1px 8px; border-radius: 20px;
}
.btn-export {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 16px; border: 1.5px solid #c8c2b8; border-radius: 10px;
  background: #f5f2ec; color: #4a6278; font-size: 13px; font-weight: 500;
  font-family: 'Sora', sans-serif; cursor: pointer;
  transition: all 0.18s;
}
.btn-export:hover { background: #eae6de; border-color: #3d6080; color: #3d6080; }

/* ── Table ── */
.table-card {
  background: #faf8f4; border-radius: 14px;
  border: 1px solid #d6d0c8;
  box-shadow: 0 2px 16px rgba(0,0,0,.06);
  overflow: hidden; margin-top: 16px;
}
.chef-table { width: 100%; border-collapse: collapse; }
.chef-table thead tr {
  background: #eee9e0; border-bottom: 1.5px solid #d6d0c8;
}
.chef-table th {
  padding: 12px 14px; font-size: 11.5px; font-weight: 600;
  color: #7a8a9a; text-transform: uppercase; letter-spacing: .6px; text-align: left;
}
.chef-row { border-bottom: 1px solid #e0dbd2; transition: background 0.15s; }
.chef-row:last-child { border-bottom: none; }
.chef-row:hover { background: #eee9e0; }
.chef-table td { padding: 13px 14px; vertical-align: middle; }

/* Avatar */
.avatar {
  width: 36px; height: 36px; border-radius: 50%;
  color: #fff; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; letter-spacing: .5px;
}
.chef-name { font-size: 14px; font-weight: 600; color: #1a2332; }
.chef-matricule {
  display: flex; align-items: center; gap: 4px;
  font-size: 11.5px; color: #8a9ab0; margin-top: 3px;
  font-family: 'DM Mono', monospace;
}
.chef-email {
  display: flex; align-items: center; gap: 5px;
  font-size: 12.5px; color: #5a6878;
}
.chef-tel {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; color: #8a9ab0; margin-top: 3px;
}
.spec-badge {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 10px; background: rgba(61,96,128,.10);
  border-radius: 8px; width: fit-content;
}
.spec-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #3d6080; flex-shrink: 0;
}
.spec-name { font-size: 13px; font-weight: 600; color: #1a2332; }
.spec-code { font-size: 11px; color: #7a8fa0; font-family: 'DM Mono', monospace; }
.domaine-tag {
  display: inline-block; padding: 3px 10px;
  background: rgba(245,197,24,.18); color: #9a7700; border-radius: 6px;
  font-size: 12px; font-weight: 500; max-width: 180px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.date-cell {
  display: flex; align-items: center; gap: 5px;
  font-size: 12.5px; color: #5a6878; font-family: 'DM Mono', monospace;
}
.no-value { font-size: 13px; color: #b0bbc8; }

/* Actions */
.actions-cell { display: flex; gap: 5px; justify-content: center; align-items: center; }
.act-btn {
  height: 30px; border-radius: 8px; border: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.act-btn--affecter {
  padding: 0 10px; gap: 5px;
  background: rgba(61,96,128,.10); color: #3d6080;
  font-size: 12px; font-weight: 600; font-family: 'Sora', sans-serif;
  white-space: nowrap;
}
.act-btn--affecter:hover { background: #3d6080; color: #fff; }
.act-btn--edit { width: 30px; background: rgba(245,197,24,.15); color: #9a7700; }
.act-btn--edit:hover { background: #c9a100; color: #fff; }
.act-btn--del  { width: 30px; background: rgba(217,64,64,.10); color: #d94040; }
.act-btn--del:hover  { background: #d94040; color: #fff; }

/* State boxes */
.state-box { text-align: center; padding: 60px 20px; }
.state-icon { color: #c0c8d5; margin-bottom: 16px; }
.state-text { font-size: 15px; color: #6b7a8d; font-weight: 500; }
.state-sub { font-size: 13px; color: #a0aab4; margin-top: 6px; }
.spinner {
  width: 36px; height: 36px; border: 3px solid #e5eaf0;
  border-top-color: #3d6080; border-radius: 50%;
  animation: spin .8s linear infinite; margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.alert-err {
  display: flex; align-items: center; gap: 8px;
  background: rgba(217,64,64,.08); border: 1px solid rgba(217,64,64,.22); border-radius: 10px;
  padding: 12px 16px; font-size: 13.5px; color: #d94040; margin-top: 16px;
}

/* ── Modals ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(10,20,35,.5);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
  padding: 24px; backdrop-filter: blur(4px);
}
.modal-box {
  background: #f5f2ec; border-radius: 18px; width: 100%; max-width: 500px;
  box-shadow: 0 32px 80px rgba(0,0,0,.22);
  animation: modalIn .28s cubic-bezier(.22,1,.36,1) both; overflow: hidden;
  font-family: 'Sora', sans-serif;
}
.modal-box--sm { max-width: 420px; }
@keyframes modalIn { from { opacity:0; transform:scale(.94) translateY(16px); } to { opacity:1; transform:none; } }

.modal-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px; background: #eae6de; border-bottom: 1px solid #d6d0c8;
}
.modal-hd__left { display: flex; align-items: center; gap: 10px; }
.modal-hd-icon {
  width: 34px; height: 34px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
}
.icon-blue { background: rgba(61,96,128,.12); color: #3d6080; }
.icon-red  { background: rgba(217,64,64,.10); color: #d94040; }
.modal-title { font-size: 15px; font-weight: 700; color: #1a2332; }
.modal-close {
  background: none; border: none; color: #8a9ab0; cursor: pointer;
  display: flex; padding: 4px; border-radius: 6px; transition: color .15s;
}
.modal-close:hover { color: #1a2332; }

.modal-bd { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; }
.modal-ft {
  display: flex; gap: 10px; padding: 16px 22px 20px;
  border-top: 1px solid #d6d0c8;
}

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.lbl { font-size: 12.5px; font-weight: 600; color: #3a4a5a; }
.req { color: #e0882a; }
.inp {
  width: 100%; padding: 9px 13px;
  background: #faf8f4; border: 1.5px solid #c8c2b8;
  border-radius: 9px; font-size: 13.5px;
  font-family: 'Sora', sans-serif; color: #1a2332;
  outline: none; transition: border-color .2s, box-shadow .2s;
}
.inp:focus { border-color: #3d6080; box-shadow: 0 0 0 3px rgba(61,96,128,.12); }
.inp::placeholder { color: #b0bcc8; }

.warn-banner { text-align: center; margin-bottom: 8px; }
.confirm-txt { font-size: 14.5px; color: #1a2332; text-align: center; line-height: 1.6; }
.confirm-sub { font-size: 12.5px; color: #7a8a9a; text-align: center; margin-top: 5px; }

.btn-primary-m {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #3d6080, #5a7fa0);
  color: #fff; font-size: 13.5px; font-weight: 600;
  font-family: 'Sora', sans-serif; cursor: pointer;
  box-shadow: 0 3px 12px rgba(61,96,128,.28); transition: all .18s;
}
.btn-primary-m:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(61,96,128,.38); }
.btn-primary-m:disabled { opacity: .6; cursor: not-allowed; }

.btn-danger-m {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px; border: none; border-radius: 10px;
  background: #d94040; color: #fff; font-size: 13.5px; font-weight: 600;
  font-family: 'Sora', sans-serif; cursor: pointer;
  box-shadow: 0 3px 12px rgba(217,64,64,.22); transition: all .18s;
}
.btn-danger-m:hover:not(:disabled) { background: #b43030; transform: translateY(-1px); }
.btn-danger-m:disabled { opacity: .6; cursor: not-allowed; }

.btn-ghost-m {
  padding: 10px 18px; border: 1.5px solid #c8c2b8; border-radius: 10px;
  background: transparent; color: #5a6a7a; font-size: 13.5px;
  font-family: 'Sora', sans-serif; cursor: pointer; transition: background .18s;
}
.btn-ghost-m:hover { background: #eae6de; }

.spin-sm {
  width: 13px; height: 13px; border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite;
}

/* Toast — scoped block intentionally has no toast rules; see global block below */
.modal-fade-enter-active { transition: opacity .2s ease; }
.modal-fade-leave-active { transition: opacity .15s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>

<!-- Global: teleported elements land on <body> so scoped styles can't reach them -->
<style>
.lc-toast {
  position: fixed; top: 22px; right: 22px;
  padding: 12px 20px; border-radius: 10px;
  font-size: 13.5px; font-family: 'Sora', sans-serif; font-weight: 500;
  box-shadow: 0 8px 28px rgba(0,0,0,.22); z-index: 99999;
  display: flex; align-items: center; gap: 9px; pointer-events: none;
}
.lc-toast--ok   { background: #3d6080; color: #fff; }
.lc-toast--warn { background: #c9a100; color: #fff; }
.lc-toast--err  { background: #d94040; color: #fff; }
.lc-toast-fade-enter-active, .lc-toast-fade-leave-active { transition: all .3s ease; }
.lc-toast-fade-enter-from, .lc-toast-fade-leave-to { opacity: 0; transform: translateY(-8px); }
</style>