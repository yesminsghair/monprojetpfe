<template>
  <div class="notif-container">

    <!-- BELL TRIGGER -->
    <div class="notif-wrapper">
      <button class="notif-btn" @click="toggleNotif" :class="{ active: open }">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span v-if="unreadCount" class="notif-badge">{{ unreadCount }}</span>
      </button>
    </div>

    <!-- BACKDROP -->
    <div v-if="open" class="backdrop" @click="open = false"></div>

    <!-- DROPDOWN -->
    <transition name="notif-drop">
      <div v-if="open" class="notif-box">

        <!-- HEADER -->
        <div class="notif-header">
          <div class="notif-header-left">
            <span class="notif-title">Notifications</span>
            <span v-if="unreadCount" class="header-badge">{{ unreadCount }} non lues</span>
          </div>
          <button v-if="unreadCount" class="btn-mark-all" @click="markAllRead">Tout lire</button>
        </div>

        <!-- LIST -->
        <div class="notif-list">
          <div
            v-for="notif in notifications"
            :key="notif.id"
            :class="['notif-item', { unread: !notif.read }]"
            @click="marquerCommeLu(notif)"
          >
            <div class="notif-icon-wrap" :class="!notif.read ? 'icon-unread' : 'icon-read'">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div class="notif-content">
              <div class="notif-text">{{ notif.text }}</div>
              <div class="notif-time">{{ formatTime(notif.date) }}</div>
            </div>
            <span v-if="!notif.read" class="unread-dot"></span>
            <button class="notif-del" @click="supprimer(notif, $event)" title="Supprimer">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div v-if="notifications.length === 0" class="empty-notif">
            <span>🔕</span>
            <p>Aucune notification</p>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="notif-footer" v-if="notifications.length">
          <button class="footer-link" @click="markAllRead">✓ Tout marquer comme lu</button>
        </div>

      </div>
    </transition>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'NotificationsDropdown',

  data() {
    return {
      open: false,
      notifications: [],
      loading: false,
    }
  },

  computed: {
    unreadCount() {
      return this.notifications.filter(n => !n.lu).length
    }
  },

  mounted() {
    this.charger()
    // Poll every 30s for new notifications
    this._poll = setInterval(this.charger, 30000)
  },

  beforeUnmount() {
    clearInterval(this._poll)
  },

  methods: {
    async charger() {
      try {
        const res = await api.get('/notifications')
        this.notifications = (res.data || []).map(n => ({
          id:   n.id,
          text: n.message,
          read: !!n.lu,
          date: n.created_at,
        }))
      } catch (e) { /* silent */ }
    },

    toggleNotif() {
      this.open = !this.open
      if (this.open) this.charger()
    },

    async marquerCommeLu(notif) {
      if (notif.read) return
      notif.read = true
      try {
        await api.put(`/notifications/${notif.id}/lire`)
      } catch (e) { notif.read = false }
    },

    async markAllRead() {
      this.notifications.forEach(n => n.read = true)
      try {
        await api.put('/notifications/lire-tout')
      } catch (e) { await this.charger() }
    },

    async supprimer(notif, e) {
      e.stopPropagation()
      this.notifications = this.notifications.filter(n => n.id !== notif.id)
      try {
        await api.delete(`/notifications/${notif.id}`)
      } catch (e) { await this.charger() }
    },

    formatTime(date) {
      if (!date) return ''
      // Normalize "YYYY-MM-DD HH:MM:SS" → local time, not UTC
      const normalized = typeof date === 'string' ? date.replace(' ', 'T') : date
      const d = new Date(normalized)
      const now = new Date()
      const diffMin = Math.floor((now - d) / 60000)
      if (diffMin < 1) return "À l'instant"
      if (diffMin < 60) return `Il y a ${diffMin} min`
      if (diffMin < 1440) return `Il y a ${Math.floor(diffMin / 60)}h`
      return d.toLocaleDateString('fr-FR')
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;600;700&display=swap');
* { font-family: 'Source Sans 3', sans-serif; box-sizing: border-box; }

.notif-container { position: relative; display: flex; justify-content: flex-end; }
.notif-wrapper { display: flex; align-items: center; }

/* Bell button */
.notif-btn { position: relative; width: 38px; height: 38px; border-radius: 10px; border: 1.5px solid #c8c4bc; background: #ddd9d1; color: #4a5a6a; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.notif-btn:hover { border-color: #3d6080; color: #3d6080; background: rgba(61,96,128,0.06); }
.notif-btn.active { border-color: #f5a623; color: #f5a623; background: rgba(245,166,35,0.08); }

.notif-badge { position: absolute; top: -6px; right: -6px; background: #e05252; color: white; border-radius: 50%; font-size: 10px; min-width: 17px; height: 17px; display: flex; align-items: center; justify-content: center; font-weight: 700; border: 2px solid white; }

/* Backdrop */
.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.06); z-index: 10; }

/* Dropdown */
.notif-box { position: absolute; right: 0; top: 46px; width: 340px; background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 16px; box-shadow: 0 12px 36px rgba(0,0,0,0.14); overflow: hidden; z-index: 20; }

.notif-drop-enter-active { transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1); }
.notif-drop-leave-active { transition: all 0.15s ease; }
.notif-drop-enter-from { opacity: 0; transform: translateY(-8px) scale(0.97); }
.notif-drop-leave-to { opacity: 0; transform: translateY(-4px); }

/* Header */
.notif-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: linear-gradient(160deg, #4a7090, #2f4f6a); }
.notif-header-left { display: flex; align-items: center; gap: 8px; }
.notif-title { font-size: 14.5px; font-weight: 700; color: white; }
.header-badge { background: rgba(245,166,35,0.35); color: #f5e6c0; font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
.btn-mark-all { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: all 0.15s; }
.btn-mark-all:hover { background: rgba(255,255,255,0.2); }

/* List */
.notif-list { max-height: 320px; overflow-y: auto; }
.notif-list::-webkit-scrollbar { width: 3px; }
.notif-list::-webkit-scrollbar-thumb { background: #c8c4bc; border-radius: 3px; }

/* Item */
.notif-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #c8c4bc; cursor: pointer; transition: background 0.15s; }
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: rgba(61,96,128,0.05); }
.notif-item.unread { background: rgba(245,197,24,0.06); }

.notif-icon-wrap { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.icon-unread { background: rgba(245,166,35,0.15); color: #f5a623; }
.icon-read   { background: rgba(61,96,128,0.08);  color: #8a9aaa; }

.notif-content { flex: 1; min-width: 0; }
.notif-text { font-size: 13.5px; font-weight: 500; color: #1e2a35; line-height: 1.4; }
.notif-item.unread .notif-text { font-weight: 700; }
.notif-time { font-size: 11.5px; color: #8a9aaa; margin-top: 3px; }

.unread-dot { width: 8px; height: 8px; background: #f5a623; border-radius: 50%; flex-shrink: 0; }

/* Empty */
.empty-notif { text-align: center; padding: 32px 16px; color: #8a9aaa; }
.empty-notif span { font-size: 32px; }
.empty-notif p { font-size: 14px; color: #4a5a6a; margin: 8px 0 0; font-weight: 600; }

/* Footer */
.notif-footer { padding: 11px 16px; border-top: 1.5px solid #c8c4bc; text-align: center; }
.footer-link { font-size: 12.5px; font-weight: 700; color: #3d6080; text-decoration: none; transition: color 0.2s; }
.footer-link:hover { color: #f5a623; }

.notif-del { background: none; border: none; color: #c8c4bc; cursor: pointer; padding: 3px; border-radius: 5px; display: flex; align-items: center; flex-shrink: 0; opacity: 0; transition: opacity 0.15s, color 0.15s; }
.notif-item:hover .notif-del { opacity: 1; }
.notif-del:hover { color: #e74c3c; }
.footer-link { background: none; border: none; font-size: 12.5px; font-weight: 700; color: #3d6080; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: color 0.2s; }
.footer-link:hover { color: #f5a623; }
</style>