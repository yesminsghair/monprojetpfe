<template>
  <div class="messagerie-wrap">

    <div class="vld-page-header">
      <div>
        <h2 class="vld-page-title">Messagerie</h2>
        <p class="vld-page-sub">Vos conversations en temps réel</p>
      </div>
    </div>

    <div class="messagerie-card">

      <!-- ════════════════════════════════════════════════════
           LEFT — Conversation sidebar
           ════════════════════════════════════════════════════ -->
      <div class="conv-sidebar">

        <div class="conv-sidebar__header">
          <svg class="conv-sidebar__header-icon" xmlns="http://www.w3.org/2000/svg"
            width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="conv-sidebar__header-title">Conversations</span>
          <span v-if="totalNonLus" class="conv-badge" style="margin-left:auto">{{ totalNonLus }}</span>
        </div>

        <div class="conv-search-wrap">
          <svg class="conv-search-icon" xmlns="http://www.w3.org/2000/svg"
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchConv" class="conv-search" placeholder="Rechercher…"/>
        </div>

        <div class="conv-list">
          <div v-if="loadingConvs" class="chat-state">
            <div class="vld-spinner" style="width:22px;height:22px;margin:0 auto"></div>
          </div>
          <div v-else-if="!convsFiltrees.length" class="chat-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--vld-text-faint)">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Aucune conversation</span>
          </div>
          <div
            v-for="c in convsFiltrees" :key="c.id"
            class="conv-item"
            :class="{ 'conv-item--active': selectedConvId === c.id }"
            @click="ouvrirConversation(c)"
          >
            <div class="vld-av vld-av--sm vld-av--blue flex-shrink-0">{{ initiales(c.interlocuteur_nom) }}</div>
            <div class="conv-item__body">
              <div class="conv-item__name">{{ c.interlocuteur_nom }}</div>
              <div class="conv-item__preview">{{ c.dernier_message || 'Aucun message' }}</div>
            </div>
            <div class="conv-item__right">
              <span v-if="c.non_lu > 0" class="conv-badge">{{ c.non_lu }}</span>
              <span class="conv-item__time">{{ relativeTime(c.updated_at) }}</span>
            </div>
          </div>
        </div>

        <div class="conv-sidebar__footer">
          <button class="btn-new-msg" @click="showModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouveau message
          </button>
        </div>

      </div>

      <!-- ════════════════════════════════════════════════════
           RIGHT — Chat area
           ════════════════════════════════════════════════════ -->
      <div class="chat-area">

        <!-- Empty state -->
        <div v-if="!selectedConvId" class="chat-state chat-state--center">
          <div class="chat-empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p class="chat-state__title">Sélectionnez une conversation</p>
          <p class="chat-state__sub">Choisissez un contact pour commencer à échanger</p>
        </div>

        <template v-else>

          <!-- Chat header -->
          <div class="chat-header">
            <div class="vld-av vld-av--sm vld-av--gold flex-shrink-0">
              {{ initiales(selectedConv?.interlocuteur_nom) }}
            </div>
            <div class="chat-header__info">
              <div class="chat-header__name">{{ selectedConv?.interlocuteur_nom }}</div>
              <div class="chat-header__role" v-if="selectedConv?.interlocuteur_role">
                {{ selectedConv.interlocuteur_role }}
              </div>
            </div>
          </div>

          <div ref="msgArea" class="chat-messages" @scroll="onScroll">

            <!-- Loading state (first open) -->
            <div v-if="loadingMessages" class="chat-messages__loader">
              <div class="vld-spinner" style="width:22px;height:22px"></div>
            </div>

            <template v-else>

              <!-- Load-older spinner at the very top -->
              <div v-if="loadingMore" class="chat-load-more-spinner">
                <div class="vld-spinner" style="width:14px;height:14px"></div>
                <span>Chargement…</span>
              </div>
              <div v-else-if="!hasMore && messages.length" class="chat-history-end">
                Début de la conversation
              </div>

              <!-- Normal ascending order: oldest at top, newest at bottom -->
              <div
                v-for="m in messages"
                :key="m.id"
                class="msg-row"
                :class="m.moi ? 'msg-row--mine' : 'msg-row--theirs'"
              >
                <div v-if="!m.moi" class="vld-av vld-av--xs vld-av--blue flex-shrink-0">
                  {{ initiales(selectedConv?.interlocuteur_nom) }}
                </div>
                <div class="msg-bubble" :class="m.moi ? 'msg-bubble--mine' : 'msg-bubble--theirs'">
                  <div class="msg-text">{{ m.contenu }}</div>
                  <div class="msg-time">
                    {{ m.heure }}
                    <svg v-if="m.moi && m.lu" xmlns="http://www.w3.org/2000/svg"
                      width="10" height="10" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:3px">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
              </div>

            </template>
          </div>

          <!-- FAB: scroll back to bottom (newest messages) -->
          <Transition name="fab-pop">
            <button v-if="showScrollBtn" class="chat-scroll-fab" @click="goToBottom">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <span v-if="newWhileScrolled > 0" class="chat-scroll-fab__badge">
                {{ newWhileScrolled }}
              </span>
            </button>
          </Transition>

          <!-- Input bar -->
          <div class="chat-input-bar">
            <textarea
              ref="inputArea"
              v-model="newMsg"
              class="chat-input"
              placeholder="Écrire un message…"
              rows="1"
              @keydown.enter.exact.prevent="envoyerMessage"
              @input="autoGrow"
            ></textarea>
            <button class="chat-send-btn" :disabled="!newMsg.trim()" @click="envoyerMessage">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="22 2 11 13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

        </template>
      </div>

    </div>

    <!-- ════════════════════════════════════════════════════════
         New conversation modal
         ════════════════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">

          <div class="modal-card__header">
            <span class="modal-card__title">Nouveau message</span>
            <button class="modal-card__close" @click="closeModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-card__body">
            <div>
              <span class="modal-label">Destinataire</span>
              <div class="modal-search-wrap">
                <svg class="conv-search-icon" xmlns="http://www.w3.org/2000/svg"
                  width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input v-model="searchDest" class="conv-search" placeholder="Rechercher un contact…"/>
              </div>
              <div class="dest-list">
                <div
                  v-for="u in destFiltres" :key="u.id"
                  class="dest-item"
                  :class="{ 'dest-item--selected': newDest?.id === u.id }"
                  @click="newDest = u"
                >
                  <div class="vld-av vld-av--sm vld-av--blue flex-shrink-0">{{ initiales(u.nom) }}</div>
                  <div class="dest-item__info">
                    <div class="dest-item__name">{{ u.nom }}</div>
                    <div class="dest-item__role">{{ u.role }}</div>
                  </div>
                  <span v-if="newDest?.id === u.id" class="dest-check">✓</span>
                </div>
                <div v-if="!destFiltres.length"
                  style="padding:12px;text-align:center;font-size:13px;color:var(--vld-text-muted)">
                  Aucun contact trouvé
                </div>
              </div>
            </div>

            <div>
              <span class="modal-label">Message</span>
              <div class="modal-composer">
                <textarea
                  v-model="newMsgModal"
                  class="modal-composer__textarea"
                  placeholder="Rédigez votre message ici…"
                  rows="4"
                ></textarea>
                <div class="modal-composer__footer">
                  <span class="modal-composer__hint">{{ newMsgModal.length }}/2000 caractères</span>
                  <span v-if="newDest" style="font-size:11px;color:var(--vld-gold-dark);font-weight:600">
                    → {{ newDest.nom }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-card__footer">
            <button class="btn-cancel" @click="closeModal">Annuler</button>
            <button class="btn-send" :disabled="!newDest || !newMsgModal.trim()" @click="creerConversation">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="22 2 11 13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Envoyer
            </button>
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>

<script>
import api from '@/services/api.js'

// Distance from bottom (px) — within this = considered "at bottom"
const BOTTOM_THRESHOLD = 80
// Distance from top (px) — triggers loading older messages
const TOP_THRESHOLD    = 80

export default {
  name: 'Messagerie',

  data() {
    return {
      conversations:   [],
      messages:        [],        // ascending: oldest → newest
      utilisateurs:    [],
      selectedConvId:  null,
      hasMore:         false,
      oldestMsgId:     null,
      loadingMore:     false,
      userScrolledUp:  false,     // true when user manually scrolled up (pauses auto-scroll)
      showScrollBtn:   false,
      newWhileScrolled: 0,
      newMsg:          '',
      searchConv:      '',
      searchDest:      '',
      showModal:       false,
      newDest:         null,
      newMsgModal:     '',
      loadingConvs:    false,
      loadingMessages: false,
      echoChannel:     null,
      _programmaticScroll: false,
    }
  },

  computed: {
    convsFiltrees() {
      if (!this.searchConv) return this.conversations
      const q = this.searchConv.toLowerCase()
      return this.conversations.filter(c =>
        (c.interlocuteur_nom || '').toLowerCase().includes(q)
      )
    },
    selectedConv() {
      return this.conversations.find(c => c.id === this.selectedConvId) || null
    },
    destFiltres() {
      const q = this.searchDest.toLowerCase()
      return q ? this.utilisateurs.filter(u => (u.nom || '').toLowerCase().includes(q))
               : this.utilisateurs
    },
    totalNonLus() {
      return this.conversations.reduce((s, c) => s + (c.non_lu || 0), 0)
    },
  },

  mounted() {
    this.chargerConversations()
    this.chargerUtilisateurs()
    this.initWebSocket()
  },

  beforeUnmount() {
    this.leaveChannel()
  },

  methods: {

    // ── Tiny helpers ──────────────────────────────────────────
    initiales(n) {
      return (n || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    },
    relativeTime(d) {
      if (!d) return ''
      const diff = Date.now() - new Date(d).getTime()
      const min  = Math.floor(diff / 60000)
      if (min < 1)  return "À l'instant"
      if (min < 60) return `${min}m`
      const h = Math.floor(min / 60)
      if (h < 24)   return `${h}h`
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    },
    myId() {
      try { return JSON.parse(localStorage.getItem('user') || '{}').id } catch { return null }
    },
    mapMsg(m) {
      return {
        id:      m.id,
        contenu: m.contenu,
        moi:     m.expediteur_id === this.myId(),
        lu:      !!m.lu,
        heure:   m.created_at
          ? new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          : '',
      }
    },
    autoGrow(e) {
      const el = e.target
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    },

    // ── Scroll helpers ────────────────────────────────────────
    //
    // Standard chat scroll (no column-reverse):
    //   scrollTop = 0                        → top of history (oldest)
    //   scrollTop = scrollHeight-clientHeight → bottom (newest messages)
    //
    // "At bottom" = scrolled within BOTTOM_THRESHOLD px of the very bottom.
    // When at bottom, auto-scroll is active. When the user scrolls up,
    // auto-scroll pauses until they return to the bottom or click the FAB.
    //
    //
    // Standard chat scroll:
    //   scrollTop = 0                          → top (oldest messages)
    //   scrollTop = scrollHeight - clientHeight → bottom (newest messages)
    //
    isAtBottom() {
      const el = this.$refs.msgArea
      if (!el) return true
      return el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD
    },

    // Programmatic scroll to bottom — sets a guard so onScroll
    // doesn't mistake it for a user scroll-up action
    scrollToBottom(smooth = false) {
      this._programmaticScroll = true
      this.$nextTick(() => {
        const el = this.$refs.msgArea
        if (!el) { this._programmaticScroll = false; return }
        el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' })
        // Clear guard after scroll settles
        setTimeout(() => { this._programmaticScroll = false }, 100)
      })
    },

    // FAB click — smooth scroll back to newest, resume auto-scroll
    goToBottom() {
      this.userScrolledUp   = false
      this.showScrollBtn    = false
      this.newWhileScrolled = 0
      this.scrollToBottom(true)
    },

    onScroll() {
      // Ignore scroll events triggered by our own programmatic scrolls
      if (this._programmaticScroll) return

      const el = this.$refs.msgArea
      if (!el) return

      if (this.isAtBottom()) {
        // User scrolled back to the bottom → resume auto-scroll
        this.userScrolledUp   = false
        this.showScrollBtn    = false
        this.newWhileScrolled = 0
      } else {
        // User scrolled up → pause auto-scroll, show FAB
        this.userScrolledUp = true
        this.showScrollBtn  = true
      }

      // Near the top → load older messages
      if (
        el.scrollTop < TOP_THRESHOLD &&
        this.hasMore &&
        !this.loadingMore &&
        !this.loadingMessages
      ) {
        this.chargerPlus()
      }
    },

    // ── API calls ─────────────────────────────────────────────
    async chargerConversations() {
      this.loadingConvs = true
      try {
        const { data } = await api.get('/conversations')
        this.conversations = data || []
      } catch (e) { console.error('[Msg] conversations:', e) }
      finally     { this.loadingConvs = false }
    },

    async chargerUtilisateurs() {
      try {
        const { data } = await api.get('/utilisateurs')
        this.utilisateurs = (data || []).map(u => ({
          id:   u.id,
          nom:  `${u.prenom || ''} ${u.nom || ''}`.trim(),
          role: u.role,
        }))
      } catch (e) { console.error('[Msg] utilisateurs:', e) }
    },

    async ouvrirConversation(c) {
      this.selectedConvId   = c.id
      this.messages         = []
      this.hasMore          = false
      this.oldestMsgId      = null
      this.loadingMessages  = true
      this.userScrolledUp   = false
      this.showScrollBtn    = false
      this.newWhileScrolled = 0

      try {
        const { data } = await api.get(`/conversations/${c.id}/messages`, { params: { limit: 50 } })
        const list       = data.data ?? data
        this.messages    = list.map(m => this.mapMsg(m))
        this.hasMore     = !!data.has_more
        this.oldestMsgId = data.oldest_id ?? null

        await api.put(`/conversations/${c.id}/lire`).catch(() => {})
        c.non_lu = 0
      } catch (e) { console.error('[Msg] messages:', e) }
      finally {
        this.loadingMessages = false
        // Wait for Vue to render the messages into the DOM, then jump to bottom
        await this.$nextTick()
        const el = this.$refs.msgArea
        if (el) el.scrollTop = el.scrollHeight
      }
    },

    async chargerPlus() {
      if (!this.selectedConvId || !this.oldestMsgId || this.loadingMore) return
      this.loadingMore = true

      // Save scroll position before DOM changes so viewport doesn't jump
      const el = this.$refs.msgArea
      const scrollBottom = el ? el.scrollHeight - el.scrollTop : 0

      try {
        const { data } = await api.get(`/conversations/${this.selectedConvId}/messages`, {
          params: { limit: 50, before_id: this.oldestMsgId },
        })
        const list       = data.data ?? data
        this.messages    = [...list.map(m => this.mapMsg(m)), ...this.messages]
        this.hasMore     = !!data.has_more
        this.oldestMsgId = data.oldest_id ?? null

        // Restore scroll position: keep the user at the same message after prepend
        await this.$nextTick()
        if (el) el.scrollTop = el.scrollHeight - scrollBottom
      } catch (e) { console.error('[Msg] chargerPlus:', e) }
      finally     { this.loadingMore = false }
    },

    async envoyerMessage() {
      const txt = this.newMsg.trim()
      if (!txt || !this.selectedConvId) return
      this.newMsg = ''
      if (this.$refs.inputArea) this.$refs.inputArea.style.height = 'auto'
      try {
        const { data } = await api.post(`/conversations/${this.selectedConvId}/messages`, { contenu: txt })
        this.messages.push(this.mapMsg(data))
        const conv = this.conversations.find(c => c.id === this.selectedConvId)
        if (conv) { conv.dernier_message = txt; conv.updated_at = new Date().toISOString() }
        // Always snap to bottom when YOU send a message
        this.userScrolledUp   = false
        this.showScrollBtn    = false
        this.newWhileScrolled = 0
        this.scrollToBottom(false)
      } catch (e) { this.newMsg = txt; console.error('[Msg] envoyerMessage:', e) }
    },

    async creerConversation() {
      if (!this.newDest || !this.newMsgModal.trim()) return
      const dest = this.newDest, msg = this.newMsgModal
      try {
        const { data } = await api.post('/conversations', { destinataire_id: dest.id })
        await api.post(`/conversations/${data.id}/messages`, { contenu: msg })
        if (!this.conversations.find(c => c.id === data.id)) {
          this.conversations.unshift({
            id: data.id, interlocuteur_id: dest.id,
            interlocuteur_nom: dest.nom, interlocuteur_role: dest.role,
            dernier_message: msg, non_lu: 0, updated_at: new Date().toISOString(),
          })
        }
        this.closeModal()
        await this.ouvrirConversation({ id: data.id })
      } catch (e) { console.error('[Msg] creerConversation:', e) }
    },

    closeModal() {
      this.showModal = false; this.newDest = null
      this.newMsgModal = ''; this.searchDest = ''
    },

    // ── WebSocket — raw window.Echo, no composable wrapper ───
    //
    // Your MessageController does:
    //   broadcast(new MessageSent($msg))->toOthers();
    //   broadcast(new NotificationCreated($notif));
    //
    // MessageSent must implement ShouldBroadcast and define:
    //   public function broadcastOn() {
    //     return new PrivateChannel('conversation.' . $this->message->conversation_id);
    //   }
    //   public function broadcastAs() { return 'MessageSent'; }   // optional
    //
    // routes/channels.php must have:
    //   Broadcast::channel('conversation.{id}', function ($user, $id) {
    //     return \App\Models\Conversation::where('id', $id)
    //       ->where(fn($q) => $q->where('user1_id', $user->id)->orWhere('user2_id', $user->id))
    //       ->exists();
    //   });
    //
    // config/broadcasting.php → default: 'reverb'
    // .env → BROADCAST_DRIVER=reverb (or BROADCAST_CONNECTION=reverb in newer Laravel)
    //
    initWebSocket() {
      if (typeof window.Echo === 'undefined') {
        console.warn('[Msg] window.Echo not found — check bootstrap.js / echo setup')
        return
      }
      const userId = this.myId()
      if (!userId) return

      // Subscribe to the user's private channel for incoming notifications
      // (NotificationCreated is also broadcast here)
      try {
        this.echoChannel = window.Echo
          .private(`App.Models.Utilisateur.${userId}`)
          .listen('MessageSent', payload => {
            // Laravel strips the namespace: event class = 'MessageSent'
            this.onIncomingMessage(payload)
          })
          .listen('NotificationCreated', () => {
            // Optionally emit an event so the Notifications component refreshes
            this.$emit('notification-received')
          })
      } catch (e) {
        console.error('[Msg] Echo channel error:', e)
      }
    },

    leaveChannel() {
      if (typeof window.Echo !== 'undefined' && this.echoChannel) {
        window.Echo.leave(`App.Models.Utilisateur.${this.myId()}`)
        this.echoChannel = null
      }
    },

    onIncomingMessage(payload) {
      const msg = payload.message ?? payload

      if (msg.conversation_id === this.selectedConvId) {
        if (!this.messages.find(m => m.id === msg.id)) {
          this.messages.push(this.mapMsg(msg))

          if (!this.userScrolledUp) {
            // User is at the bottom — auto-scroll to reveal the new message
            this.scrollToBottom(true)
          } else {
            // User is reading history — don't interrupt, just count the new message
            this.newWhileScrolled++
          }
        }
      }

      // Update sidebar for other conversations
      const conv = this.conversations.find(c => c.id === msg.conversation_id)
      if (conv && msg.conversation_id !== this.selectedConvId) {
        conv.non_lu          = (conv.non_lu || 0) + 1
        conv.dernier_message = msg.contenu
        conv.updated_at      = msg.created_at || new Date().toISOString()
      }
    },
  },
}
</script>
<!-- All styles live in design-tokens.css → "MESSAGERIE COMPONENT" section -->