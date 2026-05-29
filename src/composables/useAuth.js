// src/composables/useAuth.js
// ─────────────────────────────────────────────────────────────
// Shared auth composable used by ALL dashboards.
// Replaces the copy-pasted currentUser, initiales, logout,
// formatDate methods that existed in every dashboard file.
//
// USAGE in a component:
//   import { useAuth } from '@/composables/useAuth'
//
//   setup() {
//     const { currentUser, logout, formatDate, initiales } = useAuth()
//     return { currentUser, logout, formatDate, initiales }
//   }
// ─────────────────────────────────────────────────────────────

import { reactive } from 'vue'
import { useRouter } from 'vue-router'

export function useAuth () {
  const router = useRouter()

  // Read user from localStorage — same format your axios.js uses
  const raw         = localStorage.getItem('user')
  const storedUser  = raw ? JSON.parse(raw) : {}

  const currentUser = reactive({
    id:       storedUser.id       ?? null,
    nom:      storedUser.nom      ?? '',
    prenom:   storedUser.prenom   ?? '',
    email:    storedUser.email    ?? '',
    role:     storedUser.role     ?? '',
    token:    storedUser.token    ?? '',
    specialite_id: storedUser.specialite_id ?? null,
  })

  function logout () {
    localStorage.removeItem('user')
    router.push('/login')
  }

  // "Dupont Marie" → "DM"
  function initiales (nom, prenom) {
    const n = nom    || currentUser.nom    || ''
    const p = prenom || currentUser.prenom || ''
    return `${p[0] ?? ''}${n[0] ?? ''}`.toUpperCase() || '?'
  }

  // "2024-06-15T10:30:00" → "15/06/2024"
  function formatDate (d) {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleDateString('fr-FR')
    } catch {
      return d
    }
  }

  // "2024-06-15T10:30:00" → "15/06/2024 10:30"
  function formatDateTime (d) {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    } catch {
      return d
    }
  }

  return { currentUser, logout, initiales, formatDate, formatDateTime }
}