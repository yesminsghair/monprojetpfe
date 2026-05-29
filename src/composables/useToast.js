// composables/useToast.js
import { reactive } from 'vue'

// ─── Module-level pending toast ───────────────────────────────────────────────
// Une seule variable partagée entre toutes les instances du composable.
// Permet de planifier un toast pour le prochain composant qui se monte
// (ex : après navigation depuis AjouterChef → ListeChefs).
let _pending = null

export function schedulePendingToast(message, type = 'ok') {
  _pending = { message, type }
}

export function consumePendingToast() {
  const p = _pending
  _pending = null
  return p
}
// ─────────────────────────────────────────────────────────────────────────────

export function useToast(ms = 3400) {
  const toast = reactive({ visible: false, type: 'ok', message: '', _t: null })

  function showToast(message, type = 'ok') {
    if (toast._t) clearTimeout(toast._t)
    toast.message = message
    toast.type    = type
    toast.visible = true
    toast._t = setTimeout(() => { toast.visible = false }, ms)
  }

  // Compatibilité avec l'ancien format { message, type: 'toast-ok'|'toast-err' }
  function onToastEvent({ message, type }) {
    showToast(message, type === 'toast-ok' ? 'ok' : 'err')
  }

  return { toast, showToast, onToastEvent }
}