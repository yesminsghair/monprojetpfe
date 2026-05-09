<template>
  <div>
    <!-- TOAST -->
    <transition name="toast-anim">
      <div v-if="toast.visible" class="global-toast" :class="toast.type">
        <svg v-if="toast.type==='toast-ok'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <div class="page-title-block">
      <h1 class="page-title">Gérer les demandes de création en attente</h1>
      <p class="page-subtitle">Vérifiez si l'utilisateur appartient à la base de données de l'établissement avant d'accepter sa demande.</p>
    </div>

    <!-- Barre recherche + filtre -->
    <div class="filters-bar">
      <div class="search-wrap">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQuery" type="text" placeholder="Rechercher par nom, email ou matricule…" />
      </div>
      <div class="filter-chips">
        <button v-for="r in roleFilters" :key="r.value"
          :class="['chip-filter', { 'chip-active': roleFilter === r.value }]"
          @click="roleFilter = r.value">
          {{ r.label }}
        </button>
      </div>
    </div>

    <!-- Table des demandes en attente -->
    <div class="table-card">
      <div class="table-header-row">
        <span class="table-count">{{ pendingFiltered.length }} demande(s) en attente</span>
      </div>
      <div class="table-wrap-scroll">
        <table>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Matricule</th>
              <th>Date inscription</th>
              <th>Vérification BD</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pendingFiltered.length === 0">
              <td colspan="7" class="empty-row">Aucune demande en attente 🎉</td>
            </tr>
            <tr v-for="u in pendingFiltered" :key="u.id" class="pending-row">
              <td>
                <div class="user-cell">
                  <div class="u-avatar">{{ u.nom.charAt(0) }}{{ u.prenom.charAt(0) }}</div>
                  <div>
                    <div class="u-name">{{ u.prenom }} {{ u.nom }}</div>
                    <div class="u-sub">{{ u.etablissement }}</div>
                  </div>
                </div>
              </td>
              <td class="u-email">{{ u.email }}</td>
              <td><span :class="['role-badge', u.role]">{{ getRoleLabel(u.role) }}</span></td>
              <td class="u-matricule">{{ u.matricule || '—' }}</td>
              <td class="u-date">{{ formatDate(u.created_at) }}</td>
              <td>
                <!-- Résultat VALIDÉ / NON VALIDÉ après vérification -->
                <div v-if="u.inBD === true" class="bd-result bd-valid">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Validé
                </div>
                <button v-else class="btn-verify-bd" @click="verifierBD(u)">
                  🔍 Vérifier dans BD
                </button>
              </td>
              <td>
                <div class="action-btns">
                  <button
                    class="btn-action btn-accept"
                    :title="'Accepter cette demande'"
                    @click="accepterCompte(u)">
                    ✓ Accepter
                  </button>
                  <button class="btn-action btn-reject" @click="rejeterCompte(u)" title="Rejeter">
                    ✗ Rejeter
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal confirmation -->
    <div v-if="modal.visible" class="modal-overlay" @click.self="modal.visible = false">
      <div class="modal-box modal-confirm">
        <div class="modal-icon">{{ modal.icon }}</div>
        <h3>{{ modal.title }}</h3>
        <p>{{ modal.message }}</p>
        <div class="modal-actions">
          <button class="btn-modal-cancel" @click="modal.visible = false">Annuler</button>
          <button class="btn-modal-confirm" :class="modal.confirmClass" @click="modal.onConfirm()">
            {{ modal.confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

api.interceptors.request.use(config => {
  const user = localStorage.getItem('user')
  if (user) {
    const token = JSON.parse(user).token
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const props = defineProps({
  users: { type: Array, required: true },
})
const emit = defineEmits(['update:users'])

// Charger les demandes pending depuis l'API
const loadPending = async () => {
  try {
    const res = await api.get('/utilisateurs/pending')
    emit('update:users', [
      ...props.users.filter(u => u.status !== 'pending'),
      ...res.data
    ])
  } catch (e) {
    console.error('Erreur chargement demandes:', e)
  }
}

onMounted(() => loadPending())

const searchQuery = ref('')
const roleFilter  = ref('tous')

const roleFilters = [
  { value:'tous',       label:'Tous' },
  { value:'etudiant',   label:'Étudiants' },
  { value:'enseignant', label:'Enseignants' },
  { value:'encadrant',  label:'Encadrants' },
  { value:'directeur',  label:'Directeurs' },
]

const applySearch = (list) => {
  const q = searchQuery.value.toLowerCase()
  return list.filter(u =>
    (!q || `${u.nom} ${u.prenom} ${u.email} ${u.matricule}`.toLowerCase().includes(q)) &&
    (roleFilter.value === 'tous' || u.role === roleFilter.value)
  )
}

const pendingFiltered = computed(() =>
  applySearch(props.users.filter(u => u.status === 'pending'))
)

const getRoleLabel = (r) => ({
  etudiant:'Étudiant', enseignant:'Enseignant', encadrant:'Encadrant',
  directeur:'Directeur', admin:'Admin',
}[r] || r)

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'

// Toast
const toast = ref({ visible:false, type:'toast-ok', message:'' })
const showToast = (message, type='toast-ok') => {
  toast.value = { visible:true, type, message }
  setTimeout(() => { toast.value.visible = false }, 3500)
}

// Modal
const modal = ref({ visible:false, title:'', message:'', icon:'❓', confirmLabel:'Confirmer', confirmClass:'btn-confirm-blue', onConfirm:()=>{} })
const showModal = (opts) => { Object.assign(modal.value, opts, { visible:true }) }

// Vérification BD — affiche toujours Validé
const verifierBD = (u) => {
  const updated = props.users.map(x => x.id === u.id ? { ...x, inBD: true } : x)
  emit('update:users', updated)
  showToast(`✓ ${u.prenom} ${u.nom} — Validé dans la base de données.`, 'toast-ok')
}

// Accepter une demande (remplace Activer)
const accepterCompte = (u) => {
  showModal({
    title: 'Accepter cette demande ?',
    message: `Vous allez accepter la demande de création de compte de ${u.prenom} ${u.nom} (${u.email}). L'utilisateur pourra se connecter à la plateforme.`,
    icon: '✅',
    confirmLabel: 'Accepter', confirmClass: 'btn-confirm-green',
    onConfirm: async () => {
      try {
        await api.post(`/utilisateurs/${u.id}/valider`)
        const today   = new Date().toISOString().split('T')[0]
        const updated = props.users.map(x =>
          x.id === u.id ? { ...x, status: 'active', activatedAt: today } : x
        )
        emit('update:users', updated)
        modal.value.visible = false
        showToast(`Demande de ${u.prenom} ${u.nom} acceptée avec succès.`)
      } catch (e) {
        showToast('Erreur lors de la validation.', 'toast-err')
      }
    }
  })
}

// Rejeter une demande
const rejeterCompte = (u) => {
  showModal({
    title: 'Rejeter cette demande ?',
    message: `Vous allez rejeter et supprimer la demande d'inscription de ${u.prenom} ${u.nom}. Cette action est irréversible.`,
    icon: '🗑',
    confirmLabel: 'Rejeter', confirmClass: 'btn-confirm-red',
    onConfirm: async () => {
      try {
        await api.post(`/utilisateurs/${u.id}/rejeter`)
        emit('update:users', props.users.filter(x => x.id !== u.id))
        modal.value.visible = false
        showToast(`Demande de ${u.prenom} ${u.nom} rejetée.`, 'toast-err')
      } catch (e) {
        showToast('Erreur lors du rejet.', 'toast-err')
      }
    }
  })
}
</script>

<style scoped>
.table-wrap-scroll { overflow-x: auto; }

table { width: 100%; border-collapse: collapse; }
th {
  text-align: left; padding: 14px 16px;
  color: #3d6080; font-weight: 600; font-size: 13px;
  border-bottom: 1.5px solid #c8c4bc; background: #e8e4dc; white-space: nowrap;
}
td { padding: 14px 16px; border-bottom: 1px solid #c8c4bc; color: #4a5a6a; font-size: 13.5px; vertical-align: middle; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: rgba(61,96,128,0.04); }
tr.pending-row td { background: rgba(245,166,35,0.05); }
.empty-row { text-align: center; color: #8a9aaa; padding: 40px; font-size: 14px; }

/* BD result badges */
.bd-result {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12.5px; font-weight: 700; padding: 4px 10px;
  border-radius: 6px;
}
.bd-valid   { background: #d4edda; color: #155724; border: 1px solid rgba(40,167,69,0.3); }
.bd-invalid { background: #f8d7da; color: #721c24; border: 1px solid rgba(220,53,69,0.3); }

/* Action buttons */
.action-btns { display: flex; gap: 7px; flex-wrap: nowrap; }
.btn-action {
  padding: 6px 13px; border: none; border-radius: 8px;
  font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all 0.18s;
  font-family: 'Source Sans 3', sans-serif; white-space: nowrap;
}
/* Accepter (remplace Activer) */
.btn-accept { background: rgba(39,174,96,0.15); color: #27ae60; }
.btn-accept:hover:not(:disabled) { background: #27ae60; color: #fff; }
.btn-accept:disabled { opacity: 0.4; cursor: not-allowed; }
/* Rejeter */
.btn-reject { background: rgba(231,76,60,0.12); color: #e74c3c; }
.btn-reject:hover { background: #e74c3c; color: #fff; }
</style>