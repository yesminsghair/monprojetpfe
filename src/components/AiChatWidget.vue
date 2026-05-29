<template>
  <div>

    <!-- Bouton flottant (visible seulement sur pages autorisées) -->
    <button
      v-if="isAllowedPage"
      class="chat-button"
      :class="{ 'chat-button--open': open }"
      @click="toggleChat"
      :title="open ? 'Fermer le chat' : 'Ouvrir l\'assistant IA'"
    >
      <span class="chat-button__icon chat-button__icon--chat">💬</span>
      <span class="chat-button__icon chat-button__icon--close">✕</span>
    </button>

    <!-- Chat container -->
    <Transition name="chat-slide">
      <div v-if="open && isAllowedPage" class="chat-container">

        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header__left">
            <div class="chat-header__avatar">IA</div>
            <div>
              <div class="chat-header__title">Assistant IA</div>
              <div class="chat-header__subtitle">PFE · ISIMM</div>
            </div>
          </div>
          <div class="chat-header__actions">
            <!-- Nouvelle conversation -->
            <button
              class="header-btn"
              @click="confirmNewConv"
              title="Nouvelle conversation"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <!-- Fermer -->
            <button
              class="header-btn header-btn--close"
              @click="toggleChat"
              title="Fermer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Confirm new conv banner -->
        <Transition name="fade">
          <div v-if="showNewConvConfirm" class="confirm-banner">
            <span>Effacer la conversation ?</span>
            <div class="confirm-banner__btns">
              <button @click="startNewConv" class="confirm-btn confirm-btn--yes">Oui</button>
              <button @click="showNewConvConfirm = false" class="confirm-btn confirm-btn--no">Non</button>
            </div>
          </div>
        </Transition>

        <!-- Messages -->
        <div class="chat-messages" ref="messagesContainer">

          <!-- Message de bienvenue stylisé -->
          <div v-if="messages.length === 1" class="welcome-card">
            <div class="welcome-card__emoji">🎓</div>
            <p>Je suis prêt à vous aider pour votre PFE — sujets, rédaction, méthodologie.</p>
          </div>

          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message', msg.role === 'user' ? 'message--user' : 'message--ai']"
          >
            <!-- Avatar IA -->
            <div v-if="msg.role !== 'user'" class="message__avatar">IA</div>
            <div class="message__bubble">
              {{ msg.content }}
              <div class="message__time">{{ msg.time }}</div>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="loading" class="message message--ai">
            <div class="message__avatar">IA</div>
            <div class="message__bubble message__bubble--typing">
              <span></span><span></span><span></span>
            </div>
          </div>

        </div>

        <!-- Suggestions -->
        <div class="suggestions">
          <button
            v-for="s in suggestions"
            :key="s.label"
            class="suggestion-chip"
            @click="quickPrompt(s.text)"
          >
            {{ s.label }}
          </button>
        </div>

        <!-- Input -->
        <div class="chat-input">
          <input
            v-model="input"
            @keyup.enter="sendMessage"
            placeholder="Posez votre question..."
            :disabled="loading"
            ref="inputField"
          />
          <button
            @click="sendMessage"
            :disabled="loading || !input.trim()"
            class="send-btn"
            title="Envoyer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

      </div>
    </Transition>

  </div>
</template>

<script>
import api from "../api/axios.js";

export default {
  name: "AiChatWidget",

  data() {
    return {
      open: false,
      input: "",
      loading: false,
      showNewConvConfirm: false,
      currentUserId: null,

      // suggestions rapides
      suggestions: [
        { label: "💡 Sujet PFE",    text: "Donne moi une idée de sujet PFE en Intelligence Artificielle" },
        { label: "✍️ Corriger",      text: "Corrige ce texte académiquement" },
        { label: "📄 Abstract",      text: "Génère un abstract professionnel pour mon PFE" },
        { label: "📚 Méthodologie",  text: "Explique les étapes d'une méthodologie de recherche PFE" },
      ],

      messages: [
        {
          role: "assistant",
          content: "Bonjour 👋 Je suis votre assistant IA académique.",
          time: this.getCurrentTime()
        }
      ]
    };
  },

  computed: {

    // cacher widget sur pages auth
    isAllowedPage() {
      const path = this.$route.path.toLowerCase();

      // cacher sur page accueil
      if (path === '/') return false;

      const blockedPatterns = [
        '/login',
        '/inscription',
        '/verify-email',
        '/forgot-password',
        '/reset-password'
      ];

      return !blockedPatterns.some(p => path.includes(p));
    }

  },

  mounted() {
    this.initializeUser();
  },

  watch: {

    // surveille changement route
    '$route'() {
      this.checkUserChange();
    },

    // focus input quand chat s'ouvre
    open(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.inputField?.focus();
        });
      }
    }

  },

  methods: {

    getCurrentTime() {
      return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    },

    // utilisateur actuel
    getCurrentUserId() {
      const user = localStorage.getItem('user');
      if (!user) return null;
      try {
        return JSON.parse(user).id;
      } catch {
        return null;
      }
    },

    // init user
    initializeUser() {
      this.currentUserId = this.getCurrentUserId();
      this.resetChat();
    },

    // détecte changement user
    checkUserChange() {
      const newUserId = this.getCurrentUserId();
      if (newUserId !== this.currentUserId) {
        this.currentUserId = newUserId;
        this.resetChat();
      }
    },

    // reset messages
    resetChat() {
      this.messages = [
        {
          role: "assistant",
          content: "Bonjour 👋 Je suis votre assistant IA académique.",
          time: this.getCurrentTime()
        }
      ];
      this.open = false;
      this.input = "";
      this.loading = false;
      this.showNewConvConfirm = false;
    },

    // demande confirmation avant nouvelle conv
    confirmNewConv() {
      // si seulement le message d'accueil → pas besoin de confirmer
      if (this.messages.length <= 1) return;
      this.showNewConvConfirm = true;
    },

    // démarre une nouvelle conversation
    startNewConv() {
      this.messages = [
        {
          role: "assistant",
          content: "Nouvelle conversation démarrée. Comment puis-je vous aider ? 😊",
          time: this.getCurrentTime()
        }
      ];
      this.input = "";
      this.loading = false;
      this.showNewConvConfirm = false;
      this.$nextTick(() => this.$refs.inputField?.focus());
    },

    toggleChat() {
      this.open = !this.open;
      this.showNewConvConfirm = false;
    },

    quickPrompt(text) {
      this.input = text;
      this.$nextTick(() => this.$refs.inputField?.focus());
    },

    async sendMessage() {
      if (!this.input.trim() || this.loading) return;

      const userMessage = this.input;

      this.messages.push({
        role: "user",
        content: userMessage,
        time: this.getCurrentTime()
      });

      this.input = "";
      this.loading = true;
      this.scrollBottom();

      try {
        const response = await api.post("/ai-chat", {
          message: userMessage
        });

        const aiReply =
          response.data?.choices?.[0]?.message?.content ||
          response.data?.error ||
          "Réponse indisponible";

        this.messages.push({
          role: "assistant",
          content: aiReply,
          time: this.getCurrentTime()
        });

      } catch (error) {
        console.error("AI ERROR:", error);
        this.messages.push({
          role: "assistant",
          content: "❌ Erreur de communication avec l'IA. Veuillez réessayer.",
          time: this.getCurrentTime()
        });
      } finally {
        this.loading = false;
        this.scrollBottom();
      }
    },

    scrollBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }

  }
};
</script>

<style scoped>
/*
  PALETTE — inspirée de l'image
  --navy      : #1e3a5f   bleu marine foncé (sidebar, header, avatars)
  --navy-dark : #162d4a   navy plus profond
  --amber     : #e8a020   ambre/or (boutons, accents)
  --amber-deep: #c8880a   ambre foncé
  --beige     : #f0ebe0   fond beige principal
  --beige-2   : #e8e2d6   beige secondaire (surfaces)
  --beige-3   : #ddd6c8   bordures beige
  --text-dark : #1e2d40   texte principal
  --text-mid  : #5a6b7a   texte secondaire
*/

* { box-sizing: border-box; }

/* ===== BOUTON FLOTTANT ===== */
.chat-button {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #1e3a5f;
  border: none;
  color: white;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(30, 58, 95, 0.45), 0 2px 8px rgba(0,0,0,0.2);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  overflow: hidden;
}

.chat-button:hover {
  background: #162d4a;
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(30, 58, 95, 0.55);
}

.chat-button:active { transform: translateY(0); }

/* Transition icône 💬 ↔ ✕ */
.chat-button__icon {
  position: absolute;
  transition: opacity 0.22s ease, transform 0.25s ease;
}

.chat-button__icon--close {
  font-style: normal;
  font-size: 17px;
  font-weight: 700;
  opacity: 0;
  transform: rotate(-90deg) scale(0.7);
  color: white;
}

.chat-button--open .chat-button__icon--chat {
  opacity: 0;
  transform: rotate(90deg) scale(0.7);
}

.chat-button--open .chat-button__icon--close {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

/* ===== CONTENEUR CHAT ===== */
.chat-container {
  position: fixed;
  bottom: 98px;
  right: 28px;
  width: 390px;
  height: 565px;
  background: #f0ebe0;
  border-radius: 20px;
  border: 1px solid #ddd6c8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(30, 58, 95, 0.22), 0 4px 16px rgba(0,0,0,0.1);
  font-family: 'DM Sans', sans-serif;
  z-index: 9998;
}

/* ===== ANIMATION SLIDE ===== */
.chat-slide-enter-active {
  animation: slideUp 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chat-slide-leave-active {
  animation: slideDown 0.22s ease-in;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes slideDown {
  from { opacity: 1; transform: translateY(0)    scale(1); }
  to   { opacity: 0; transform: translateY(16px) scale(0.97); }
}

/* ===== HEADER ===== */
.chat-header {
  background: #1e3a5f;
  padding: 13px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.chat-header__left {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Avatar carré ambre — comme dans l'image */
.chat-header__avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #e8a020;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: white;
}

.chat-header__title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.2;
}

.chat-header__subtitle {
  font-size: 11px;
  color: #e8a020;
  margin-top: 1px;
}

.chat-header__actions {
  display: flex;
  gap: 6px;
}

.header-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;
}

.header-btn:hover {
  background: rgba(232,160,32,0.25);
  color: #e8a020;
  border-color: rgba(232,160,32,0.4);
}

.header-btn--close:hover {
  background: rgba(220, 60, 60, 0.3);
  color: #ff8080;
  border-color: rgba(220,60,60,0.4);
}

/* ===== CONFIRM BANNER ===== */
.confirm-banner {
  background: #fdf3dc;
  border-bottom: 1px solid #e8d5a0;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12.5px;
  color: #7a5a10;
  flex-shrink: 0;
}

.confirm-banner__btns {
  display: flex;
  gap: 6px;
}

.confirm-btn {
  padding: 4px 12px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.confirm-btn--yes {
  background: #dc2626;
  color: white;
}

.confirm-btn--no {
  background: #ddd6c8;
  color: #5a6b7a;
}

.confirm-btn:hover { opacity: 0.82; }

/* ===== FADE ===== */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ===== MESSAGES ===== */
.chat-messages {
  flex: 1;
  padding: 16px 14px;
  overflow-y: auto;
  background: #f0ebe0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scroll-behavior: smooth;
}

.chat-messages::-webkit-scrollbar { width: 3px; }
.chat-messages::-webkit-scrollbar-track { background: transparent; }
.chat-messages::-webkit-scrollbar-thumb { background: #c8c0b0; border-radius: 4px; }

/* Carte de bienvenue */
.welcome-card {
  text-align: center;
  padding: 16px 12px 8px;
  color: #7a8a96;
  font-size: 13px;
  line-height: 1.55;
}

.welcome-card__emoji {
  font-size: 28px;
  margin-bottom: 8px;
}

/* Bulles */
.message {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 88%;
  animation: msgIn 0.2s ease;
}

@keyframes msgIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.message--user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message--ai {
  align-self: flex-start;
}

/* Avatar IA — carré ambre comme dans l'image */
.message__avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #e8a020;
  color: white;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}

.message__bubble {
  padding: 10px 13px;
  border-radius: 14px;
  font-size: 13.5px;
  line-height: 1.55;
  position: relative;
}

/* Bulle user — navy */
.message--user .message__bubble {
  background: #1e3a5f;
  color: #ffffff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 10px rgba(30,58,95,0.2);
}

/* Bulle IA — beige blanc */
.message--ai .message__bubble {
  background: #ffffff;
  color: #1e2d40;
  border: 1px solid #ddd6c8;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.message__time {
  font-size: 10px;
  opacity: 0.5;
  margin-top: 4px;
  text-align: right;
}

.message--ai .message__time {
  text-align: left;
  color: #8898aa;
}

.message--user .message__time {
  color: rgba(255,255,255,0.7);
}

/* Typing dots */
.message__bubble--typing {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 12px 16px;
}

.message__bubble--typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #e8a020;
  animation: typingDot 1.2s infinite ease-in-out;
}

.message__bubble--typing span:nth-child(2) { animation-delay: 0.2s; }
.message__bubble--typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingDot {
  0%, 60%, 100% { transform: translateY(0);   opacity: 0.3; }
  30%            { transform: translateY(-5px); opacity: 1;  }
}

/* ===== SUGGESTIONS ===== */
.suggestions {
  display: flex;
  gap: 6px;
  padding: 8px 12px;
  background: #e8e2d6;
  border-top: 1px solid #ddd6c8;
  overflow-x: auto;
  flex-shrink: 0;
}

.suggestions::-webkit-scrollbar { display: none; }

.suggestion-chip {
  white-space: nowrap;
  font-size: 11.5px;
  font-family: 'DM Sans', sans-serif;
  padding: 5px 11px;
  border: 1.5px solid rgba(30,58,95,0.2);
  border-radius: 20px;
  background: white;
  color: #1e3a5f;
  cursor: pointer;
  font-weight: 500;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.suggestion-chip:hover {
  background: #e8a020;
  border-color: #e8a020;
  color: white;
}

/* ===== INPUT ===== */
.chat-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #ddd6c8;
  background: #f8f4ed;
  flex-shrink: 0;
}

.chat-input input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid #ddd6c8;
  border-radius: 12px;
  outline: none;
  font-size: 13.5px;
  font-family: 'DM Sans', sans-serif;
  color: #1e2d40;
  background: #ffffff;
  transition: border-color 0.15s ease;
}

.chat-input input:focus {
  border-color: #1e3a5f;
}

.chat-input input::placeholder {
  color: #a0a8b0;
}

.chat-input input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Bouton envoyer — ambre */
.send-btn {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  border: none;
  background: #e8a020;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.15s ease, transform 0.15s ease, background 0.15s ease;
  box-shadow: 0 2px 8px rgba(232,160,32,0.35);
}

.send-btn:hover:not(:disabled) {
  background: #c8880a;
  transform: scale(1.06);
  box-shadow: 0 4px 14px rgba(232,160,32,0.5);
}

.send-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>