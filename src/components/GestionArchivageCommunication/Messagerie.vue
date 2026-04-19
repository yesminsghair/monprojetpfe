<template>
  <div class="page-content">

    <!-- HEADER -->
    <div class="ptb">
      <p class="pt">Messagerie</p>
      <p class="ps">Communication entre utilisateurs de la plateforme</p>
    </div>

    <!-- MAIN CONTAINER -->
    <div class="messagerie-container">

      <!-- SIDEBAR -->
      <div class="msg-sidebar">
        <div class="sidebar-search">
          <svg class="s-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="sidebar-search-input" placeholder="Rechercher..." />
        </div>

        <div class="categorie" v-for="cat in categories" :key="cat.nom">
          <div class="categorie-title" @click="toggleCategorie(cat)">
            <span>{{ cat.nom }}</span>
            <svg :style="{ transform: cat.open ? 'rotate(180deg)' : 'none' }" class="cat-chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <ul v-if="cat.open" class="user-list">
            <li
              v-for="user in cat.utilisateurs"
              :key="cat.nom + '-' + user.id"
              :class="['user-item', { active: utilisateurActif && user.id === utilisateurActif.id }]"
              @click="selectionnerUtilisateur(user)"
            >
              <div class="user-av">{{ user.nom.charAt(0) }}</div>
              <div class="user-info">
                <div class="user-line">
                  <span class="user-name">{{ user.nom }}</span>
                  <span class="unread-badge" v-if="getUnreadCount(user)">{{ getUnreadCount(user) }}</span>
                </div>
                <div class="last-msg" v-if="getLastMessage(user)">{{ getLastMessage(user).text }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- CHAT ZONE -->
      <div class="chat-zone" v-if="utilisateurActif">

        <!-- Chat header -->
        <div class="chat-header">
          <div class="chat-header-av">{{ utilisateurActif.nom.charAt(0) }}</div>
          <div>
            <div class="chat-header-name">{{ utilisateurActif.nom }}</div>
            <div class="chat-header-status">En ligne</div>
          </div>
        </div>

        <!-- Messages -->
        <div class="messages" ref="messagesEl">
          <div v-for="(msg, index) in messagesFiltres" :key="msg.id">

            <div v-if="isNewDay(msg, index)" class="date-separator">
              <span>{{ formatDate(msg.date) }}</span>
            </div>

            <div :class="['message', msg.from === currentUser ? 'sent' : 'received']">
              <div :class="['bubble', msg.from === currentUser ? 'bubble-sent' : 'bubble-received']">
                <div class="msg-text">{{ msg.text }}</div>
                <div class="msg-meta">
                  {{ formatTime(msg.date) }}
                  <span v-if="msg.from === currentUser" class="tick" :class="{ 'tick-read': msg.status === 'read' }">
                    <span v-if="msg.status === 'sent'">✔</span>
                    <span v-else>✔✔</span>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Input -->
        <div class="chat-input">
          <input
            v-model="nouveauMessage"
            @keyup.enter="envoyerMessage"
            class="msg-input"
            placeholder="Écrire un message..."
          />
          <button class="btn-send" @click="envoyerMessage">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>

      </div>

      <!-- Empty state -->
      <div class="empty-chat" v-else>
        <div class="empty-chat-icon">💬</div>
        <p>Sélectionnez un contact</p>
        <span>Choisissez une conversation dans la liste de gauche</span>
      </div>

    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      currentUser: "Moi",
      categories: [
        { nom: "Enseignants", open: true,  utilisateurs: [{ id: 1, nom: "Prof. Ali" }, { id: 2, nom: "Dr. Nadia" }] },
        { nom: "Étudiants",   open: false, utilisateurs: [{ id: 3, nom: "Etudiant 1" }] }
      ],
      messages: [
        { id: 1, from: "Prof. Ali", to: "Moi",      text: "Bonjour",     date: new Date(), status: "read",      read: true  },
        { id: 2, from: "Moi",      to: "Prof. Ali", text: "Bonjour !",   date: new Date(), status: "delivered", read: true  },
        { id: 3, from: "Prof. Ali", to: "Moi",      text: "Tu es dispo ?", date: new Date(), status: "sent",   read: false }
      ],
      utilisateurActif: null,
      nouveauMessage: ""
    }
  },
  computed: {
    messagesFiltres() {
      if (!this.utilisateurActif) return []
      return this.messages.filter(m =>
        (m.from === this.currentUser && m.to === this.utilisateurActif.nom) ||
        (m.to === this.currentUser && m.from === this.utilisateurActif.nom)
      )
    }
  },
  methods: {
    toggleCategorie(cat) { cat.open = !cat.open },
    selectionnerUtilisateur(user) {
      this.utilisateurActif = user
      this.messages.forEach(m => { if (m.from === user.nom && m.to === this.currentUser) { m.read = true; m.status = "read" } })
    },
    envoyerMessage() {
      if (!this.nouveauMessage.trim()) return
      this.messages.push({ id: Date.now(), from: this.currentUser, to: this.utilisateurActif.nom, text: this.nouveauMessage, date: new Date(), status: "sent", read: true })
      this.nouveauMessage = ""
    },
    formatTime(date) { return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    formatDate(date) {
      const d = new Date(date), today = new Date()
      if (d.toDateString() === today.toDateString()) return "Aujourd'hui"
      const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
      if (d.toDateString() === yesterday.toDateString()) return "Hier"
      return d.toLocaleDateString('fr-FR')
    },
    isNewDay(msg, index) {
      if (index === 0) return true
      return new Date(msg.date).toDateString() !== new Date(this.messagesFiltres[index - 1].date).toDateString()
    },
    getLastMessage(user) {
      const msgs = this.messages.filter(m => m.from === user.nom || m.to === user.nom)
      return msgs[msgs.length - 1]
    },
    getUnreadCount(user) {
      return this.messages.filter(m => m.from === user.nom && m.to === this.currentUser && !m.read).length
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;600;700&display=swap');
* { font-family: 'Source Sans 3', sans-serif; box-sizing: border-box; }

.page-content { padding: 0; }
.ptb { margin-bottom: 24px; }
.pt { font-family: 'Merriweather', serif; font-size: 24px; font-weight: 700; color: #1e2a35; margin: 0 0 5px; }
.ps { font-size: 14px; color: #7A8FA6; margin: 0; }

/* Container */
.messagerie-container { display: flex; height: 560px; background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.07); }

/* SIDEBAR */
.msg-sidebar { width: 270px; flex-shrink: 0; background: #e8e4dc; border-right: 1.5px solid #c8c4bc; display: flex; flex-direction: column; }

.sidebar-search { position: relative; padding: 14px 12px 10px; border-bottom: 1px solid #c8c4bc; }
.s-icon { position: absolute; left: 22px; top: 50%; transform: translateY(-60%); color: #8a9aaa; }
.sidebar-search-input { width: 100%; padding: 7px 10px 7px 30px; background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 8px; font-size: 13px; color: #1e2a35; outline: none; font-family: 'Source Sans 3', sans-serif; }
.sidebar-search-input:focus { border-color: #3d6080; }
.sidebar-search-input::placeholder { color: #8a9aaa; }

.categorie { border-bottom: 1px solid #c8c4bc; }
.categorie-title { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; font-size: 11px; font-weight: 700; color: #7A8FA6; text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer; transition: color 0.15s; }
.categorie-title:hover { color: #3d6080; }
.cat-chevron { transition: transform 0.2s; }

.user-list { list-style: none; padding: 4px 0; margin: 0; }
.user-item { display: flex; align-items: center; gap: 10px; padding: 8px 14px; cursor: pointer; transition: background 0.15s; }
.user-item:hover { background: rgba(61,96,128,0.06); }
.user-item.active { background: rgba(61,96,128,0.1); border-left: 3px solid #3d6080; }

.user-av { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #4a7090, #f5a623); color: white; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-info { flex: 1; min-width: 0; }
.user-line { display: flex; justify-content: space-between; align-items: center; }
.user-name { font-size: 13.5px; font-weight: 600; color: #1e2a35; }
.unread-badge { background: #e05252; color: white; border-radius: 50%; font-size: 10px; min-width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.last-msg { font-size: 12px; color: #8a9aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }

/* CHAT ZONE */
.chat-zone { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.chat-header { display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: linear-gradient(160deg, #4a7090, #2f4f6a); border-bottom: 1px solid rgba(255,255,255,0.1); }
.chat-header-av { width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,0.15); color: #f5a623; font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.chat-header-name { font-size: 15px; font-weight: 700; color: white; }
.chat-header-status { font-size: 12px; color: rgba(255,255,255,0.6); }

.messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 4px; }
.messages::-webkit-scrollbar { width: 4px; }
.messages::-webkit-scrollbar-track { background: transparent; }
.messages::-webkit-scrollbar-thumb { background: #c8c4bc; border-radius: 4px; }

.date-separator { text-align: center; margin: 12px 0; }
.date-separator span { font-size: 11.5px; color: #8a9aaa; background: #e8e4dc; padding: 3px 12px; border-radius: 20px; }

.message { display: flex; margin-bottom: 4px; }
.sent { justify-content: flex-end; }
.received { justify-content: flex-start; }

.bubble { padding: 9px 13px; border-radius: 14px; max-width: 68%; }
.bubble-sent { background: linear-gradient(135deg, #f5a623, #d98e1a); color: white; border-bottom-right-radius: 4px; }
.bubble-received { background: #e8e4dc; border: 1.5px solid #c8c4bc; color: #1e2a35; border-bottom-left-radius: 4px; }

.msg-text { font-size: 13.5px; line-height: 1.45; }
.msg-meta { font-size: 10px; color: rgba(255,255,255,0.65); margin-top: 3px; display: flex; justify-content: flex-end; align-items: center; gap: 3px; }
.bubble-received .msg-meta { color: #8a9aaa; }
.tick { font-size: 10px; }
.tick-read { color: #aaddff; }

.chat-input { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-top: 1.5px solid #c8c4bc; background: #e8e4dc; }
.msg-input { flex: 1; padding: 9px 14px; background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 20px; font-size: 13.5px; color: #1e2a35; outline: none; font-family: 'Source Sans 3', sans-serif; transition: border-color 0.2s; }
.msg-input:focus { border-color: #3d6080; }
.msg-input::placeholder { color: #8a9aaa; }
.btn-send { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #f5a623, #d98e1a); border: none; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s; box-shadow: 0 2px 8px rgba(245,166,35,0.3); }
.btn-send:hover { transform: scale(1.07); box-shadow: 0 3px 12px rgba(245,166,35,0.4); }

/* Empty state */
.empty-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #8a9aaa; gap: 8px; }
.empty-chat-icon { font-size: 48px; }
.empty-chat p { font-size: 16px; font-weight: 700; color: #4a5a6a; margin: 0; }
.empty-chat span { font-size: 13px; text-align: center; }
</style>