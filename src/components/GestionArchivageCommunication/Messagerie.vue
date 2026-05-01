<template>
  <div class="page-content">

    <!-- LAYOUT: sidebar de conversations + zone de chat -->
    <div class="msg-layout">

      <!-- ── SIDEBAR CONVERSATIONS ─────────────────────── -->
      <div class="conv-sidebar">
        <div class="conv-header">
          <h2 class="conv-title">Messagerie</h2>
          <button class="btn-new-conv" @click="showNewConv = true" title="Nouvelle conversation">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        <div class="conv-search">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a9aaa" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchConv" class="conv-search-input" placeholder="Rechercher..." />
        </div>

        <div v-if="loadingConvs" class="conv-loading">Chargement...</div>
        <div v-else-if="!convsFiltrees.length" class="conv-empty">Aucune conversation</div>
        <div v-else class="conv-list">
          <button
            v-for="conv in convsFiltrees"
            :key="conv.id"
            class="conv-item"
            :class="{ active: selectedConv?.id === conv.id, unread: conv.non_lu > 0 }"
            @click="selectConv(conv)"
          >
            <div class="conv-av">{{ initiales(conv.interlocuteur_nom) }}</div>
            <div class="conv-info">
              <div class="conv-nom">{{ conv.interlocuteur_nom }}</div>
              <div class="conv-last">{{ conv.dernier_message || 'Aucun message' }}</div>
            </div>
            <div class="conv-meta">
              <div class="conv-time">{{ formatTime(conv.updated_at) }}</div>
              <span v-if="conv.non_lu > 0" class="conv-badge">{{ conv.non_lu }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- ── ZONE DE CHAT ───────────────────────────────── -->
      <div class="chat-zone">

        <!-- No conversation selected -->
        <div v-if="!selectedConv" class="chat-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" stroke-width="1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p>Sélectionnez une conversation ou démarrez-en une nouvelle</p>
          <button class="btn-new-msg" @click="showNewConv = true">Nouvelle conversation</button>
        </div>

        <template v-else>
          <!-- Chat header -->
          <div class="chat-header">
            <div class="chat-av">{{ initiales(selectedConv.interlocuteur_nom) }}</div>
            <div class="chat-header-info">
              <div class="chat-nom">{{ selectedConv.interlocuteur_nom }}</div>
              <div class="chat-role">{{ selectedConv.interlocuteur_role || '' }}</div>
            </div>
          </div>

          <!-- Messages -->
          <div class="chat-messages" ref="messagesContainer">
            <div v-if="loadingMessages" class="msg-loading">Chargement des messages...</div>
            <div v-else-if="!messages.length" class="msg-empty">Démarrez la conversation</div>
            <template v-else>
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="msg-row"
                :class="msg.expediteur_id === currentUserId ? 'msg-mine' : 'msg-other'"
              >
                <div class="msg-bubble">
                  <div class="msg-text">{{ msg.contenu }}</div>
                  <div class="msg-time">{{ formatTime(msg.created_at) }}</div>
                </div>
              </div>
            </template>
          </div>

          <!-- Input -->
          <div class="chat-input-wrap">
            <textarea
              v-model="newMessage"
              class="chat-input"
              placeholder="Écrivez votre message..."
              rows="1"
              @keydown.enter.prevent="envoyerMessage"
              @input="autoResize"
              ref="inputRef"
            ></textarea>
            <button class="btn-send" @click="envoyerMessage" :disabled="!newMessage.trim() || sending">
              <svg v-if="!sending" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              <span v-else class="msg-spinner"></span>
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- MODAL nouvelle conversation -->
    <transition name="modal-fade">
      <div v-if="showNewConv" class="modal-ov" @click.self="showNewConv = false">
        <div class="modal">
          <div class="modal-hdr">
            <h3>Nouvelle conversation</h3>
            <button class="mclose" @click="showNewConv = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="fg">
              <label>Rechercher un utilisateur</label>
              <input v-model="searchUser" class="fi" placeholder="Nom, prénom..." @input="rechercherUtilisateurs" />
            </div>
            <div v-if="usersRecherche.length" class="user-results">
              <button
                v-for="u in usersRecherche"
                :key="u.id"
                class="user-result-item"
                @click="demarrerConversation(u)"
              >
                <div class="ur-av">{{ initiales(u.prenom + ' ' + u.nom) }}</div>
                <div>
                  <div class="ur-nom">{{ u.prenom }} {{ u.nom }}</div>
                  <div class="ur-role">{{ labelRole(u.role) }}</div>
                </div>
              </button>
            </div>
            <div v-else-if="searchUser.length > 1" class="user-empty">Aucun utilisateur trouvé</div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'Messagerie',

  data() {
    return {
      conversations: [],
      selectedConv: null,
      messages: [],
      newMessage: '',
      searchConv: '',
      searchUser: '',
      usersRecherche: [],
      showNewConv: false,
      loadingConvs: false,
      loadingMessages: false,
      sending: false,
      currentUserId: JSON.parse(localStorage.getItem('user') || '{}').id,
      _pollMessages: null,
    }
  },

  computed: {
    convsFiltrees() {
      if (!this.searchConv) return this.conversations
      const q = this.searchConv.toLowerCase()
      return this.conversations.filter(c =>
        c.interlocuteur_nom.toLowerCase().includes(q)
      )
    }
  },

  async mounted() {
    await this.chargerConversations()
  },

  beforeUnmount() {
    clearInterval(this._pollMessages)
  },

  methods: {
    initiales(nom) {
      if (!nom) return '?'
      return nom.split(' ').map(p => p[0] || '').join('').toUpperCase().slice(0, 2)
    },

    labelRole(role) {
      return { chef: 'Chef de département', encadrant: 'Encadrant', etudiant: 'Étudiant', jury: 'Jury', directeur: 'Directeur' }[role] || role
    },

    formatTime(date) {
      if (!date) return ''
      const d = new Date(date), now = new Date()
      const diffMin = Math.floor((now - d) / 60000)
      if (diffMin < 1) return "À l'instant"
      if (diffMin < 60) return `${diffMin} min`
      if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h`
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    },

    async chargerConversations() {
      this.loadingConvs = true
      try {
        const res = await api.get('/conversations')
        this.conversations = res.data || []
      } catch (e) {
        console.error('Erreur chargement conversations:', e)
      } finally {
        this.loadingConvs = false
      }
    },

    async selectConv(conv) {
      this.selectedConv = conv
      clearInterval(this._pollMessages)
      await this.chargerMessages(conv.id)
      // Poll for new messages every 5s
      this._pollMessages = setInterval(() => this.chargerMessages(conv.id), 5000)
    },

    async chargerMessages(convId) {
      this.loadingMessages = !this.messages.length
      try {
        const res = await api.get(`/conversations/${convId}/messages`)
        const newMsgs = res.data || []
        if (newMsgs.length !== this.messages.length) {
          this.messages = newMsgs
          this.$nextTick(() => this.scrollBottom())
        }
        // Mark as read
        await api.put(`/conversations/${convId}/lire`).catch(() => {})
        // Update unread count in sidebar
        const conv = this.conversations.find(c => c.id === convId)
        if (conv) conv.non_lu = 0
      } catch (e) {
        console.error('Erreur chargement messages:', e)
      } finally {
        this.loadingMessages = false
      }
    },

    async envoyerMessage() {
      const contenu = this.newMessage.trim()
      if (!contenu || !this.selectedConv) return
      this.sending = true
      try {
        const res = await api.post(`/conversations/${this.selectedConv.id}/messages`, { contenu })
        this.messages.push(res.data)
        this.newMessage = ''
        this.$nextTick(() => {
          this.scrollBottom()
          if (this.$refs.inputRef) this.$refs.inputRef.style.height = 'auto'
        })
        // Update last message in sidebar
        const conv = this.conversations.find(c => c.id === this.selectedConv.id)
        if (conv) { conv.dernier_message = contenu; conv.updated_at = new Date().toISOString() }
      } catch (e) {
        console.error('Erreur envoi:', e)
      } finally {
        this.sending = false
      }
    },

    scrollBottom() {
      const el = this.$refs.messagesContainer
      if (el) el.scrollTop = el.scrollHeight
    },

    autoResize(e) {
      const el = e.target
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    },

    async rechercherUtilisateurs() {
      if (this.searchUser.length < 2) { this.usersRecherche = []; return }
      try {
        const res = await api.get('/utilisateurs?search=' + encodeURIComponent(this.searchUser))
        this.usersRecherche = (res.data || []).filter(u => u.id !== this.currentUserId).slice(0, 8)
      } catch (e) { this.usersRecherche = [] }
    },

    async demarrerConversation(user) {
      try {
        const res = await api.post('/conversations', { destinataire_id: user.id })
        const conv = res.data
        const exists = this.conversations.find(c => c.id === conv.id)
        if (!exists) this.conversations.unshift(conv)
        this.showNewConv = false
        this.searchUser = ''
        this.usersRecherche = []
        await this.selectConv(conv)
      } catch (e) {
        console.error('Erreur création conversation:', e)
      }
    },
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.page-content{font-family:'Source Sans 3',sans-serif;height:calc(100vh - 60px);display:flex;flex-direction:column}

/* LAYOUT */
.msg-layout{display:flex;flex:1;overflow:hidden;border-radius:14px;border:1.5px solid #c8c4bc;background:#e8e4dc;margin:0}

/* SIDEBAR */
.conv-sidebar{width:300px;flex-shrink:0;display:flex;flex-direction:column;border-right:1.5px solid #c8c4bc;background:#ddd9d1}
.conv-header{display:flex;align-items:center;justify-content:space-between;padding:18px 16px 12px;border-bottom:1.5px solid #c8c4bc}
.conv-title{font-family:'Merriweather',serif;font-size:16px;color:#1e2a35}
.btn-new-conv{width:30px;height:30px;border-radius:8px;border:1.5px solid #c8c4bc;background:#e8e4dc;color:#4a5a6a;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s}
.btn-new-conv:hover{border-color:#3d6080;color:#3d6080;background:#ddd9d1}
.conv-search{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #c8c4bc;background:#e8e4dc}
.conv-search-input{flex:1;border:none;background:transparent;font-size:13px;color:#1e2a35;font-family:'Source Sans 3',sans-serif;outline:none}
.conv-loading,.conv-empty{padding:24px;text-align:center;font-size:13px;color:#8a9aaa}
.conv-list{flex:1;overflow-y:auto}
.conv-item{width:100%;display:flex;align-items:center;gap:10px;padding:12px 14px;border:none;border-bottom:1px solid #c8c4bc;background:transparent;cursor:pointer;text-align:left;transition:background .15s}
.conv-item:hover{background:rgba(61,96,128,0.05)}
.conv-item.active{background:rgba(61,96,128,0.1)}
.conv-item.unread .conv-nom{font-weight:700;color:#1e2a35}
.conv-av{width:38px;height:38px;border-radius:10px;background:rgba(61,96,128,0.15);color:#3d6080;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.conv-info{flex:1;min-width:0}
.conv-nom{font-size:13.5px;font-weight:600;color:#1e2a35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.conv-last{font-size:12px;color:#8a9aaa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
.conv-meta{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}
.conv-time{font-size:11px;color:#8a9aaa}
.conv-badge{background:#e74c3c;color:#fff;border-radius:10px;font-size:10px;font-weight:700;padding:1px 6px;min-width:16px;text-align:center}

/* CHAT ZONE */
.chat-zone{flex:1;display:flex;flex-direction:column;min-width:0}
.chat-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#8a9aaa;padding:40px}
.chat-empty p{font-size:14px;text-align:center}
.btn-new-msg{padding:10px 20px;background:rgba(61,96,128,0.1);border:1.5px solid rgba(61,96,128,0.2);border-radius:9px;font-size:13.5px;font-weight:600;color:#3d6080;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .18s}
.btn-new-msg:hover{background:rgba(61,96,128,0.2)}
.chat-header{display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1.5px solid #c8c4bc;background:#ddd9d1;flex-shrink:0}
.chat-av{width:40px;height:40px;border-radius:10px;background:rgba(61,96,128,0.15);color:#3d6080;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.chat-header-info{flex:1}
.chat-nom{font-size:15px;font-weight:700;color:#1e2a35}
.chat-role{font-size:12px;color:#8a9aaa;margin-top:1px}
.chat-messages{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:10px}
.chat-messages::-webkit-scrollbar{width:4px}
.chat-messages::-webkit-scrollbar-thumb{background:#c8c4bc;border-radius:4px}
.msg-loading,.msg-empty{text-align:center;font-size:13px;color:#8a9aaa;padding:20px}
.msg-row{display:flex}
.msg-mine{justify-content:flex-end}
.msg-other{justify-content:flex-start}
.msg-bubble{max-width:70%;padding:10px 14px;border-radius:14px;position:relative}
.msg-mine .msg-bubble{background:rgba(61,96,128,0.85);color:#fff;border-bottom-right-radius:4px}
.msg-other .msg-bubble{background:#ddd9d1;color:#1e2a35;border:1.5px solid #c8c4bc;border-bottom-left-radius:4px}
.msg-text{font-size:13.5px;line-height:1.5;word-break:break-word}
.msg-time{font-size:10.5px;margin-top:4px;opacity:.65;text-align:right}
.chat-input-wrap{display:flex;align-items:flex-end;gap:10px;padding:14px 20px;border-top:1.5px solid #c8c4bc;background:#ddd9d1;flex-shrink:0}
.chat-input{flex:1;padding:10px 14px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:12px;font-size:13.5px;color:#1e2a35;font-family:'Source Sans 3',sans-serif;resize:none;outline:none;transition:border-color .18s;min-height:42px;max-height:120px;line-height:1.5}
.chat-input:focus{border-color:#3d6080}
.btn-send{width:42px;height:42px;border-radius:10px;background:rgba(61,96,128,0.85);color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .18s}
.btn-send:hover:not(:disabled){background:#2f4f6a}
.btn-send:disabled{opacity:.4;cursor:not-allowed}
.msg-spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}

/* MODAL */
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:#ddd9d1;border-radius:16px;width:100%;max-width:420px;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.25)}
.modal-hdr{display:flex;align-items:center;justify-content:space-between;padding:20px 24px 0}
.modal-hdr h3{font-family:'Merriweather',serif;font-size:1rem;color:#1e2a35}
.mclose{background:none;border:none;cursor:pointer;color:#8a9aaa;display:flex;align-items:center;transition:color .15s}
.mclose:hover{color:#1e2a35}
.modal-body{padding:20px 24px;display:flex;flex-direction:column;gap:14px}
.fg{display:flex;flex-direction:column;gap:6px}
.fg label{font-size:13px;font-weight:600;color:#2f4f6a}
.fi{padding:10px 12px;border:1.5px solid #c8c4bc;border-radius:9px;background:#e8e4dc;font-size:13.5px;color:#1e2a35;font-family:'Source Sans 3',sans-serif;outline:none;transition:border-color .18s}
.fi:focus{border-color:#3d6080}
.user-results{display:flex;flex-direction:column;gap:4px;max-height:240px;overflow-y:auto}
.user-result-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border:1.5px solid #c8c4bc;border-radius:10px;background:#e8e4dc;cursor:pointer;text-align:left;transition:all .15s}
.user-result-item:hover{border-color:#3d6080;background:#ddd9d1}
.ur-av{width:36px;height:36px;border-radius:9px;background:rgba(61,96,128,0.15);color:#3d6080;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ur-nom{font-size:13.5px;font-weight:600;color:#1e2a35}
.ur-role{font-size:12px;color:#8a9aaa;margin-top:1px}
.user-empty{text-align:center;font-size:13px;color:#8a9aaa;padding:12px}
.modal-fade-enter-active,.modal-fade-leave-active{transition:opacity .2s,transform .2s}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0;transform:scale(.97)}
@media(max-width:768px){.conv-sidebar{width:100%;border-right:none;border-bottom:1.5px solid #c8c4bc}.msg-layout{flex-direction:column}}
</style>