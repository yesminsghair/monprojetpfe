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
      <h1 class="page-title">Consulter la liste des comptes utilisateurs</h1>
      <p class="page-subtitle">Gérez les comptes actifs et inactifs de la plateforme. Activez, désactivez ou supprimez des utilisateurs.</p>
    </div>

    <!-- Barre recherche + filtre -->
    <div class="filters-bar">
      <div class="search-wrap">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQuery" type="text" placeholder="Rechercher par nom, email ou matricule…" />
      </div>
      <div class="filter-chips-row">
        <!-- Filtre rôle -->
        <div class="filter-chips">
          <button v-for="r in roleFilters" :key="r.value"
            :class="['chip-filter', { 'chip-active': roleFilter === r.value }]"
            @click="roleFilter = r.value">
            {{ r.label }}
          </button>
        </div>
        <!-- Filtre statut -->
        <div class="filter-chips">
          <button v-for="s in statutFilters" :key="s.value"
            :class="['chip-filter', 'chip-statut', { 'chip-active': statutFilter === s.value }]"
            @click="statutFilter = s.value">
            {{ s.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Table des comptes -->
    <div class="table-card">
      <div class="table-header-row">
        <span class="table-count">{{ usersFiltered.length }} compte(s) trouvé(s)</span>
        <span class="stats-mini">
          <span class="stat-actif">● {{ activeCount }} actifs</span>
          <span class="stat-inactif">● {{ inactiveCount }} désactivés</span>
        </span>
      </div>
      <div class="table-wrap-scroll">
        <table>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Matricule</th>
              <th>Date d'inscription</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="usersFiltered.length === 0">
              <td colspan="7" class="empty-row">Aucun compte trouvé</td>
            </tr>
            <tr v-for="u in usersFiltered" :key="u.id">
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
                <span :class="['status-badge', u.status === 'active' ? 'status-active' : 'status-inactive']">
                  {{ u.status === 'active' ? 'Actif' : 'Désactivé' }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <!-- Toggle Activer (vert) / Désactiver (rouge) -->
                  <button
                    v-if="u.status === 'active'"
                    class="btn-action btn-toggle-deactivate"
                    @click="toggleStatut(u)"
                    title="Désactiver ce compte">
                    🔒 Désactiver
                  </button>
                  <button
                    v-else
                    class="btn-action btn-toggle-activate"
                    @click="toggleStatut(u)"
                    title="Activer ce compte">
                    ✓ Activer
                  </button>
                  <!-- Bouton Supprimer -->
                  <button
                    class="btn-action btn-delete"
                    @click="supprimerCompte(u)"
                    title="Supprimer ce compte">
                    🗑 Supprimer
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
//interceptor pour proteger les routes de l'administrateur et intercepter les req avant etre envoyé 
api.interceptors.request.use(config => {
  const u = localStorage.getItem('user')
  if (u) {
    const token = JSON.parse(u).token
    if (token) config.headers.Authorization = `Bearer ${token}`
  }//si l'utilisateur est connecté en extrait tous ces données et en ajoute le token à la entete
  return config
})//retourne la nvl configuration

const props = defineProps({//prop recu du parent 
  users: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:users'])

const localUsers = ref([])//un tableau reactives vide pour stocker les utilisateurs chargé

const chargerUtilisateurs = async () => {
  try {//charge la liste des utilisateurs 
    const res = await api.get('/utilisateurs')
    localUsers.value = res.data//stocke localement
    emit('update:users', res.data)//envoi l'enven au parent
  } catch (e) { console.error('Erreur chargement utilisateurs:', e) }
}
//execute la fonction quand le composant est monté
onMounted(() => { chargerUtilisateurs() })
//les filtres 
const searchQuery  = ref('')
const roleFilter   = ref('tous')
const statutFilter = ref('tous')

const roleFilters = [
  { value:'tous',       label:'Tous les rôles' },
  { value:'etudiant',   label:'Étudiants' },
  { value:'enseignant', label:'Enseignants' },
  { value:'encadrant',  label:'Encadrants' },
  { value:'directeur',  label:'Directeurs' },
]

const statutFilters = [
  { value:'tous',     label:'Tous les statuts' },
  { value:'active',   label:'Actifs' },
  { value:'inactive', label:'Désactivés' },
]

const applyFilters = (list) => {//fonction filyre une liste selon criteres
  const q = searchQuery.value.toLowerCase()
  return list.filter(u =>
    (!q || `${u.nom} ${u.prenom} ${u.email} ${u.matricule}`.toLowerCase().includes(q)) &&
    (roleFilter.value   === 'tous' || u.role   === roleFilter.value) &&
    (statutFilter.value === 'tous' || u.status === statutFilter.value)
  )
}

// Affiche tous les comptes sauf "pending"
const usersFiltered = computed(() =>
  applyFilters((localUsers.value.length ? localUsers.value : props.users).filter(u => u.status !== 'pending'))
)

const activeCount   = computed(() => usersFiltered.value.filter(u => u.status === 'active').length)
const inactiveCount = computed(() => usersFiltered.value.filter(u => u.status === 'inactive').length)

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
const modal = ref({ visible:false, title:'', message:'', icon:'❓', confirmLabel:'Confirmer', confirmClass:'btn-confirm-orange', onConfirm:()=>{} })
const showModal = (opts) => { Object.assign(modal.value, opts, { visible:true }) }

// Toggle activer / désactiver
const toggleStatut = (u) => {
  if (u.status === 'active') {
    showModal({
      title: 'Désactiver ce compte ?',
      message: `Vous allez suspendre l'accès de ${u.prenom} ${u.nom} (${u.email}). L'utilisateur ne pourra plus se connecter.`,
      icon: '🔒',
      confirmLabel: 'Désactiver', confirmClass: 'btn-confirm-orange',
      onConfirm: async () => {
        try {
          await api.post(`/utilisateurs/${u.id}/rejeter`)
          const updated = (localUsers.value.length ? localUsers.value : props.users).map(x => x.id === u.id ? { ...x, status: 'inactive' } : x)
          localUsers.value = updated
          emit('update:users', updated)
          modal.value.visible = false
          showToast(`Compte de ${u.prenom} ${u.nom} désactivé.`, 'toast-err')
        } catch (e) { showToast('Erreur lors de la désactivation.', 'toast-err') }
      }
    })
  } else {
    showModal({
      title: 'Activer ce compte ?',
      message: `Vous allez réactiver l'accès de ${u.prenom} ${u.nom} (${u.email}).`,
      icon: '✅',
      confirmLabel: 'Activer', confirmClass: 'btn-confirm-green',
      onConfirm: async () => {
        try {
          await api.post(`/utilisateurs/${u.id}/valider`)
          const today = new Date().toISOString().split('T')[0]
          const updated = (localUsers.value.length ? localUsers.value : props.users).map(x => x.id === u.id ? { ...x, status: 'active', activatedAt: today } : x)
          localUsers.value = updated
          emit('update:users', updated)
          modal.value.visible = false
          showToast(`Compte de ${u.prenom} ${u.nom} activé.`, 'toast-ok')
        } catch (e) { showToast('Erreur lors de l\'activation.', 'toast-err') }
      }
    })
  }
}

// Supprimer un compte (efface de la liste)
const supprimerCompte = (u) => {
  showModal({
    title: 'Supprimer ce compte ?',
    message: `Vous allez supprimer définitivement le compte de ${u.prenom} ${u.nom} (${u.email}). Cette action est irréversible.`,
    icon: '⚠️',
    confirmLabel: 'Supprimer', confirmClass: 'btn-confirm-red',
    onConfirm: async () => {
        try {
          await api.delete(`/utilisateurs/${u.id}`)
          const updated = (localUsers.value.length ? localUsers.value : props.users).filter(x => x.id !== u.id)
          localUsers.value = updated
          emit('update:users', updated)
          modal.value.visible = false
          showToast(`Compte de ${u.prenom} ${u.nom} supprimé.`, 'toast-err')
        } catch (e) { showToast('Erreur lors de la suppression.', 'toast-err') }
      }
  })
}
</script>