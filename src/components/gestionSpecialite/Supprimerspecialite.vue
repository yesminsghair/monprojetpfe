<template>
  <transition name="modal-fade">
    <div v-if="visible" class="modal-overlay" @click.self="annuler">

      <div class="modal-card" :class="{ 'modal-blocked': estBloquee }">

        <!-- Icône -->
        <div class="modal-icon-wrap" :class="estBloquee ? 'icon-warn' : 'icon-danger'">
          <!-- Bloquée : alerte -->
          <svg v-if="estBloquee" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8"  x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <!-- Normale : corbeille -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </div>

        <!-- Badge statut -->
        <span class="modal-badge" :class="estBloquee ? 'badge-warn' : 'badge-danger'">
          {{ estBloquee ? 'Suppression impossible' : 'Confirmation requise' }}
        </span>

        <!-- Titre -->
        <h3 class="modal-title">
          {{ estBloquee ? 'Des chefs sont affectés' : 'Supprimer la spécialité ?' }}
        </h3>

        <!-- Corps -->
        <div class="modal-body">
          <!-- Cas bloqué : chefs affectés -->
          <template v-if="estBloquee">
            <p>
              La spécialité <strong>{{ specialite?.nom }}</strong>
              <span class="code-tag">{{ specialite?.code }}</span>
              ne peut pas être supprimée.
            </p>
            <div class="blocked-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              <span>
                <strong>{{ specialite?.chefs?.length }}</strong>
                chef{{ specialite?.chefs?.length > 1 ? 's' : '' }} de département y {{ specialite?.chefs?.length > 1 ? 'sont affectés' : 'est affecté' }}.
                Désaffectez-{{ specialite?.chefs?.length > 1 ? 'les' : 'le' }} avant de supprimer.
              </span>
            </div>
          </template>

          <!-- Cas normal -->
          <template v-else>
            <p>
              Vous êtes sur le point de supprimer définitivement la spécialité
              <strong>{{ specialite?.nom }}</strong>
              <span class="code-tag">{{ specialite?.code }}</span>.
            </p>
            <div class="warning-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>Cette action est <strong>irréversible</strong>. La spécialité sera définitivement retirée du système.</span>
            </div>
          </template>
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button class="btn-cancel" @click="annuler">
            {{ estBloquee ? 'Fermer' : 'Annuler' }}
          </button>
          <button v-if="!estBloquee" class="btn-delete" @click="confirmer">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
            Supprimer définitivement
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'SupprimerSpecialite',

  props: {
    // Afficher ou non le modal
    visible: {
      type: Boolean,
      default: false,
    },
    // La spécialité à supprimer (objet complet avec champ chefs:[])
    specialite: {
      type: Object,
      default: null,
    },
  },

  emits: ['confirmed', 'cancelled'],

  computed: {
    // US 11 – 4.a : bloqué si des chefs sont affectés
    estBloquee() {
      return this.specialite?.chefs?.length > 0
    },
  },

  methods: {
    confirmer() {
      if (this.estBloquee) return
      this.$emit('confirmed', this.specialite)
    },

    annuler() {
      this.$emit('cancelled')
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,700;1,700&family=Source+Sans+3:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ══ OVERLAY ══ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 42, 53, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  font-family: 'Source Sans 3', sans-serif;
}

/* ══ CARD ══ */
.modal-card {
  background: #ddd9d1;
  border-radius: 20px;
  padding: 40px 36px 32px;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.22);
  border: 1.5px solid #c8c4bc;
  animation: popIn 0.32s cubic-bezier(0.22,1,0.36,1) both;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* ══ ICON ══ */
.modal-icon-wrap {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.icon-danger { background: rgba(192,57,43,0.12); color: #c0392b; }
.icon-warn   { background: rgba(245,166,35,0.13); color: #d98e1a; }

/* ══ BADGE ══ */
.modal-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.badge-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid rgba(220,53,69,0.3);
}

.badge-warn {
  background: #fff3cd;
  color: #856404;
  border: 1px solid rgba(255,193,7,0.4);
}

/* ══ TITLE ══ */
.modal-title {
  font-family: 'Merriweather', serif;
  font-size: 20px;
  font-weight: 700;
  color: #1e2a35;
}

/* ══ BODY ══ */
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.modal-body p {
  font-size: 14px;
  color: #4a5a6a;
  line-height: 1.7;
}

.modal-body p strong { color: #1e2a35; }

.code-tag {
  display: inline-block;
  background: #e8e4dc;
  border: 1px solid #c8c4bc;
  color: #3d6080;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 6px;
  margin-left: 6px;
  font-family: monospace;
  letter-spacing: 0.04em;
}

.warning-info,
.blocked-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
  text-align: left;
}

.warning-info {
  background: rgba(192,57,43,0.07);
  border: 1px solid rgba(192,57,43,0.18);
  color: #7d2d22;
}

.blocked-info {
  background: rgba(245,166,35,0.09);
  border: 1px solid rgba(245,166,35,0.25);
  color: #7a5a10;
}

.warning-info svg, .blocked-info svg { flex-shrink: 0; margin-top: 1px; }

/* ══ ACTIONS ══ */
.modal-actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 8px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  border: 1.5px solid #c8c4bc;
  border-radius: 10px;
  background: transparent;
  color: #4a5a6a;
  font-size: 14px;
  font-family: 'Source Sans 3', sans-serif;
  font-weight: 400;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s;
}

.btn-cancel:hover { background: rgba(0,0,0,0.05); border-color: #b0ab9f; }

.btn-delete {
  flex: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #c0392b;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Source Sans 3', sans-serif;
  cursor: pointer;
  transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
  box-shadow: 0 2px 12px rgba(192,57,43,0.28);
}

.btn-delete:hover {
  background: #a93226;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(192,57,43,0.36);
}

/* ══ TRANSITIONS ══ */
.modal-fade-enter-active { transition: opacity 0.22s ease; }
.modal-fade-leave-active { transition: opacity 0.18s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>