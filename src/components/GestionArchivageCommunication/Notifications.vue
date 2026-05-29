<template>
  <div class="notif-wrap position-relative">

    <!-- ── Bell button ────────────────────────────────────── -->
    <button
      ref="bell"
      class="notif-bell-btn"
      :class="{ 'has-unread': nonLues > 0 }"
      @click="togglePanel"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <Transition name="badge-pop">
        <span v-if="nonLues > 0" class="notif-badge">
          {{ nonLues > 9 ? '9+' : nonLues }}
        </span>
      </Transition>
    </button>

    <!-- ── Dropdown panel ─────────────────────────────────── -->
    <Transition name="panel-slide">
      <div v-if="panelOpen" ref="panel" class="notif-panel">

        <!-- Header -->
        <div class="notif-header">
          <div class="notif-header__left">
            <span class="notif-header__title">Notifications</span>
            <span v-if="nonLues" class="notif-count-badge">
              {{ nonLues }} non lue{{ nonLues > 1 ? 's' : '' }}
            </span>
          </div>
          <button v-if="notifications.length" class="notif-mark-all-btn" @click="marquerToutesLues">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Tout lire
          </button>
        </div>

        <!-- List -->
        <div class="notif-list">

          <div v-if="loading" class="notif-empty">
            <div class="vld-spinner" style="width:22px;height:22px;margin:0 auto"></div>
          </div>

          <div v-else-if="!notifications.length" class="notif-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="1.5"
              style="color:var(--vld-text-faint);margin-bottom:8px">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span>Aucune notification</span>
          </div>

          <div
            v-for="(n, idx) in notifications"
            :key="n.id"
            class="notif-item"
            :class="{ 'notif-item--unread': !n.lu }"
            @click="marquerLue(idx)"
          >
            <div class="notif-item__icon" :class="iconClass(n)">
              <svg v-if="typeIcon(n) === 'msg'" xmlns="http://www.w3.org/2000/svg"
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <svg v-else-if="typeIcon(n) === 'check'" xmlns="http://www.w3.org/2000/svg"
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <svg v-else-if="typeIcon(n) === 'alert'" xmlns="http://www.w3.org/2000/svg"
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg"
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>

            <div class="notif-item__body">
              <div class="notif-item__title">{{ n.titre }}</div>
              <div class="notif-item__msg">{{ n.message }}</div>
              <div class="notif-item__meta">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {{ n.heure }}
              </div>
            </div>

            <div v-if="!n.lu" class="notif-item__dot"></div>

            <!-- × Delete button, visible on hover -->
            <button class="notif-del-btn" @click.stop="supprimer(idx)" title="Supprimer">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

        </div>

        <!-- Footer -->
        <div class="notif-footer">
          <button v-if="nonLues" class="notif-footer__btn" @click="marquerToutesLues">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Tout marquer comme lu
          </button>
          <span v-else class="notif-footer__all-done">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Tout est à jour
          </span>
        </div>

      </div>
    </Transition>
  </div>
</template>

<script>
import api from '@/services/api.js'
import { useEcho } from '@/composables/useEcho'

export default {
  name: 'NotificationsDropdown',

  data() {
    return {
      notifications: [],
      panelOpen:     false,
      loading:       false,
    }
  },

  computed: {
    // Re-computes every time the notifications array reference changes
    nonLues() {
      return this.notifications.filter(n => !n.lu).length
    },
  },

  mounted() {
    this.charger()
    this.initWebSocket()
    document.addEventListener('click', this.onClickOutside)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.onClickOutside)
  },

  methods: {

    // ── Load ──────────────────────────────────────────────────
    async charger() {
      this.loading = true
      try {
        const { data } = await api.get('/notifications')
        this.notifications = (data || []).map(n => this.mapNotif(n))
      } catch (e) {
        console.error('[Notif] charger:', e)
      } finally {
        this.loading = false
      }
    },

    mapNotif(n) {
      return {
        id:      n.id,
        titre:   n.data?.titre   || n.titre   || n.type?.split('\\').pop() || 'Notification',
        message: n.data?.message || n.message || '',
        heure:   n.created_at
          ? new Date(n.created_at).toLocaleString('fr-FR', {
              day: '2-digit', month: 'short',
              hour: '2-digit', minute: '2-digit',
            })
          : '',
        lu:   n.read_at != null ? true : !!n.lu,
        type: n.type || n.data?.type || '',
      }
    },

    // ── WebSocket ─────────────────────────────────────────────
    // Laravel broadcasts NotificationCreated on the private model channel:
    //   "App.Models.Utilisateur.{id}"
    // Ensure routes/channels.php has:
    //   Broadcast::channel('App.Models.Utilisateur.{id}',
    //     fn($user, $id) => (int)$user->id === (int)$id);
    // config/broadcasting.php → 'default' => 'reverb'
    // The event name on the client is ".NotificationCreated" (leading dot = class name).
    initWebSocket() {
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id
      if (!userId) return
      try {
        const { listen } = useEcho(`App.Models.Utilisateur.${userId}`)
        listen('.NotificationCreated', data => this.onPush(data))
      } catch {
        try {
          // Fallback: simpler channel name from MessageController
          const { listen } = useEcho(`notifications.${userId}`)
          listen('.NotificationCreated', data => this.onPush(data))
        } catch (e) {
          console.error('[Notif] WebSocket init failed:', e)
        }
      }
    },

    onPush(data) {
      // Array replacement → computed nonLues re-evaluates → badge appears
      this.notifications = [
        {
          id:      data.id,
          titre:   data.titre   || 'Nouvelle notification',
          message: data.message || '',
          heure:   "À l'instant",
          lu:      false,
          type:    data.type    || '',
        },
        ...this.notifications,
      ]
    },

    // ── Panel toggle ──────────────────────────────────────────
    togglePanel() {
      if (this.panelOpen) {
        this.closePanel()
      } else {
        this.panelOpen = true
      }
    },

    closePanel() {
      if (this.nonLues > 0) {
        this.marquerToutesLues()
      }
      this.panelOpen = false
    },

    onClickOutside(e) {
      if (
        this.$refs.panel && !this.$refs.panel.contains(e.target) &&
        this.$refs.bell  && !this.$refs.bell.contains(e.target)
      ) {
        this.closePanel()
      }
    },

    // ── Mark one read ─────────────────────────────────────────
    async marquerLue(idx) {
      const n = this.notifications[idx]
      if (!n || n.lu) return
      this.notifications.splice(idx, 1, { ...n, lu: true })
      try {
        await api.put(`/notifications/${n.id}/lire`)
      } catch (e) {
        this.notifications.splice(idx, 1, { ...n, lu: false })
        console.error('[Notif] marquerLue:', e)
      }
    },

    // ── Mark all read — full array replacement ─────────────────
    async marquerToutesLues() {
      // Optimistic: replace array → nonLues = 0 → badge disappears
      this.notifications = this.notifications.map(n => ({ ...n, lu: true }))
      try {
        await api.put('/notifications/lire-tout')
      } catch (e) {
        console.error('[Notif] marquerToutesLues:', e)
      }
    },

    // ── Delete one notification ───────────────────────────────
    async supprimer(idx) {
      const n = this.notifications[idx]
      if (!n) return
      this.notifications.splice(idx, 1)
      try {
        await api.delete(`/notifications/${n.id}`)
      } catch (e) {
        this.notifications.splice(idx, 0, n)
        console.error('[Notif] supprimer:', e)
      }
    },

    // ── Icon helpers ──────────────────────────────────────────
    typeIcon(n) {
      const t = ((n.type || '') + (n.titre || '') + (n.message || '')).toLowerCase()
      if (t.includes('message'))                                               return 'msg'
      if (t.includes('valid') || t.includes('approv') || t.includes('accept')) return 'check'
      if (t.includes('alert') || t.includes('refus')  || t.includes('reject')) return 'alert'
      return 'bell'
    },
    iconClass(n) {
      const t = this.typeIcon(n)
      if (t === 'msg')   return 'notif-item__icon--blue'
      if (t === 'check') return 'notif-item__icon--green'
      if (t === 'alert') return 'notif-item__icon--red'
      return 'notif-item__icon--gold'
    },
  },
}
</script>
<!-- All styles live in design-tokens.css → "NOTIFICATIONS COMPONENT" section -->