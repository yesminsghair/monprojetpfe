<template>
<div class="page-content">

  <div class="page-header">
    <div>
      <h2>Mes réunions</h2>
      <p class="subtitle">Confirmez ou refusez les créneaux proposés par votre encadrant</p>
    </div>
    <span class="role-tag">Vue Étudiant</span>
  </div>

  <transition name="toast">
    <div v-if="toast.show" class="toast" :class="'toast-'+toast.type">
      {{ toast.msg }}
      <button @click="toast.show=false" class="toast-x">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  </transition>

  <div class="layout">
    <!-- GAUCHE: propositions reçues -->
    <div class="col-left">

      <div class="col-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.83 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        Propositions reçues
        <span class="enc-name">de {{ encadrant }}</span>
        <span class="badge-new" v-if="pending.length">{{ pending.length }}</span>
      </div>

      <div class="empty-props" v-if="!propositions.length">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <p>Aucun créneau proposé pour l'instant</p>
      </div>

      <!-- FIX: was filtering by 'proposee' but API returns 'planifiee' -->
      <div class="group-lbl" v-if="pending.length">En attente de votre réponse</div>

      <div v-for="p in pending" :key="p.id" class="prop-card">
        <div class="pc-date-block">
          <div class="pc-jour">{{ dayName(p.date) }}</div>
          <div class="pc-date-num">{{ fmtDay(p.date) }}</div>
          <div class="pc-heure">{{ p.heure }}</div>
        </div>

        <div class="pc-body">
          <div class="pc-enc-row">
            <div class="pc-enc-av">{{ initials(encadrant) }}</div>
            <span class="pc-enc-nom">{{ encadrant }}</span>
            <span class="pc-duree">~1h de réunion</span>
          </div>

          <button class="btn-confirm" @click="confirmer(p)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Confirmer ce créneau
          </button>

          <button class="btn-decline-toggle" @click="p._showRejet=!p._showRejet">
            Décliner
          </button>

          <transition name="expand">
            <div v-if="p._showRejet" class="rejet-zone">
              <label class="rejet-lbl">Raison du refus <span class="req">*</span></label>
              <textarea v-model="p._raison"
                class="rejet-ta"
                placeholder="Indiquez pourquoi vous ne pouvez pas à ce créneau..."
                rows="3"></textarea>
              <div class="rejet-btns">
                <button class="btn-cancel-sm" @click="p._showRejet=false; p._raison=''">Annuler</button>
                <button class="btn-reject-sm"
                  :disabled="!p._raison?.trim()"
                  @click="rejeter(p)">
                  Confirmer le refus
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <template v-if="repondues.length">
        <div class="group-lbl" style="margin-top:20px">Réponses données</div>
        <div v-for="p in repondues" :key="p.id"
          class="prop-mini" :class="'pm-'+(p.statut==='confirmee'?'confirme':'rejete')">
          <div class="pm-info">
            <span class="pm-date">{{ fmt(p.date) }}</span>
            <span class="pm-h">{{ p.heure }}</span>
          </div>
          <!-- FIX: was checking 'confirme' (frontend alias) but API gives 'confirmee' -->
          <span class="pm-badge" :class="p.statut==='confirmee'?'pb-confirme':'pb-rejete'">
            {{ p.statut==='confirmee' ? 'Confirmé' : 'Décliné' }}
          </span>
        </div>
      </template>
    </div>

    <!-- DROITE: prochaine réunion -->
    <div class="col-right">
      <div class="col-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Prochaines réunions
        <span class="enc-name">Confirmées</span>
      </div>

      <div class="next-card" v-if="nextMeeting">
        <div class="nc-label">Prochaine réunion</div>
        <div class="nc-jour">{{ dayName(nextMeeting.date) }}</div>
        <div class="nc-date">{{ fmt(nextMeeting.date) }}</div>
        <div class="nc-heure">{{ nextMeeting.heure }}</div>
        <div class="nc-enc">
          <div class="nc-av">{{ initials(encadrant) }}</div>
          {{ encadrant }}
        </div>
        <div class="nc-cd">{{ countdown(nextMeeting.date) }}</div>
        <button class="btn-rappel" :class="{active: rappelActif}" @click="rappelActif=!rappelActif">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          {{ rappelActif ? 'Rappel activé' : 'Activer le rappel' }}
        </button>
      </div>

      <div class="next-empty" v-else>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <p>Aucune réunion confirmée</p>
      </div>

      <div class="confirmed-list" v-if="confirmed.length>1">
        <div class="cl-title">Toutes les réunions</div>
        <div v-for="m in confirmed" :key="m.id" class="cl-row">
          <div class="cl-dot"></div>
          <div class="cl-info">
            <span class="cl-date">{{ fmt(m.date) }}</span>
            <span class="cl-heure">{{ m.heure }}</span>
          </div>
          <span class="cl-ok">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
        </div>
      </div>

      <div class="rappel-info" v-if="rappelActif">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        Rappel 30 min avant
      </div>
    </div>
  </div>
</div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'ReunionEtudiant',
  data() {
    return {
      encadrant: '',
      rappelActif: false,
      propositions: [],
      toast: { show: false, msg: '', type: 'ok' },
      loading: false
    }
  },
  computed: {
    // FIX: API returns statut='planifiee' (not 'proposee')
    pending() {
      return this.propositions.filter(p => p.statut === 'planifiee')
    },
    // FIX: 'repondues' means confirmee OR annulee (not != 'proposee')
    repondues() {
      return this.propositions.filter(p => p.statut === 'confirmee' || p.statut === 'annulee')
    },
    // FIX: API returns 'confirmee' (not 'confirme')
    confirmed() {
      return this.propositions
        .filter(p => p.statut === 'confirmee')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    },
    nextMeeting() {
      const now = new Date()
      return this.confirmed.find(m => new Date(m.date) >= now) || this.confirmed[0] || null
    }
  },
  mounted() {
    this.chargerReunions()
    this.chargerEncadrant()
  },
  methods: {

    async chargerReunions() {
      try {
        const res = await api.get('/reunions')
        this.propositions = res.data.map(r => ({
          id: r.id,
          date: new Date(r.date_reunion),
          heure: this.formatHeure(r.date_reunion),
          // Keep raw API statut names: planifiee / confirmee / annulee / effectuee
          statut: r.statut,
          _showRejet: false,
          _raison: ''
        }))
      } catch (error) {
        console.error('Erreur:', error)
      }
    },

    async chargerEncadrant() {
      try {
        // FIX: SuiviController.parEtudiant() returns encadrant_nom
        const res = await api.get('/suivi/etudiant')
        this.encadrant = res.data.encadrant_nom || 'Encadrant'
      } catch (error) {
        this.encadrant = 'Encadrant'
      }
    },

    formatHeure(date) {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    },

    initials(n) {
      if (!n) return '?'
      return n.replace(/Dr\.|Prof\./gi, '').trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    },

    fmt(d) {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },

    fmtDay(d) {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    },

    dayName(d) {
      return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long' }).replace(/^\w/, c => c.toUpperCase())
    },

    countdown(d) {
      const diff = new Date(d) - new Date()
      if (diff < 0) return 'Passée'
      const days = Math.floor(diff / 86400000)
      if (days === 0) return "Aujourd'hui"
      if (days === 1) return 'Demain'
      return `Dans ${days} jours`
    },

    async confirmer(p) {
      try {
        await api.post(`/reunions/${p.id}/confirmer`)
        await this.chargerReunions()
        this.showToast(`Réunion confirmée — ${this.fmt(p.date)} à ${p.heure}`)
      } catch (error) {
        this.showToast('Erreur lors de la confirmation', 'err')
      }
    },

    async rejeter(p) {
      if (!p._raison?.trim()) {
        this.showToast('Veuillez indiquer une raison', 'err')
        return
      }
      try {
        await api.post(`/reunions/${p.id}/annuler`, { motif: p._raison })
        await this.chargerReunions()
        this.showToast('Créneau décliné — raison envoyée', 'warn')
      } catch (error) {
        this.showToast('Erreur lors du déclin', 'err')
      }
    },

    showToast(msg, type = 'ok') {
      this.toast = { show: true, msg, type }
      setTimeout(() => (this.toast.show = false), 3500)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,700;1,700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.page-content{font-family:'Source Sans 3',sans-serif;color:#1e2a35}
.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:16px;flex-wrap:wrap}
h2{font-family:'Merriweather',serif;font-size:1.4rem;font-weight:700;color:#1e2a35;margin-bottom:4px}
.subtitle{font-size:0.88rem;color:#8a9aaa;font-weight:300}
.role-tag{background:#ddd9d1;border:1.5px solid #c8c4bc;color:#4a5a6a;padding:5px 14px;border-radius:20px;font-size:0.8rem;font-weight:600;white-space:nowrap}
.toast{display:flex;justify-content:space-between;align-items:center;padding:11px 16px;border-radius:10px;margin-bottom:16px;font-size:0.88rem;font-weight:500;border:1.5px solid}
.toast-ok{background:#e8f5e9;color:#155724;border-color:#c3e6cb}
.toast-warn{background:#fff3cd;color:#856404;border-color:#ffc107}
.toast-err{background:#f8d7da;color:#721c24;border-color:#f5c6cb}
.toast-x{background:none;border:none;cursor:pointer;color:inherit;opacity:.6;display:flex;align-items:center}
.toast-enter-active,.toast-leave-active{transition:all .25s}
.toast-enter-from,.toast-leave-to{opacity:0;transform:translateY(-6px)}
.layout{display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start}
@media(max-width:720px){.layout{grid-template-columns:1fr}}
.col-title{display:flex;align-items:center;gap:8px;font-family:'Merriweather',serif;font-size:0.95rem;font-weight:700;color:#1e2a35;margin-bottom:14px}
.enc-name{font-family:'Source Sans 3',sans-serif;font-size:0.82rem;color:#8a9aaa;font-weight:300;margin-left:2px}
.badge-new{background:#f5a623;color:#1e2a35;width:20px;height:20px;border-radius:50%;font-size:0.72rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin-left:auto}
.group-lbl{font-size:0.75rem;font-weight:700;color:#8a9aaa;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px}
.empty-props{background:#e8e4dc;border:2px dashed #c8c4bc;border-radius:12px;padding:36px 20px;text-align:center;color:#8a9aaa;margin-bottom:14px}
.empty-props svg{opacity:.4;margin-bottom:10px}
.empty-props p{font-size:0.88rem;font-weight:300}
.prop-card{background:#e8e4dc;border:1.5px solid #c8c4bc;border-left:4px solid #f5a623;border-radius:12px;padding:16px;margin-bottom:12px;display:grid;grid-template-columns:90px 1fr;gap:14px;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.pc-date-block{background:linear-gradient(160deg,#4a7090,#2f4f6a);border-radius:10px;padding:12px 10px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.pc-jour{font-size:0.75rem;font-weight:700;color:rgba(255,255,255,.75);text-transform:capitalize}
.pc-date-num{font-size:0.85rem;font-weight:600;color:#fff}
.pc-heure{font-size:1.5rem;font-weight:800;color:#f5a623;font-family:'Merriweather',serif;line-height:1}
.pc-enc-row{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.pc-enc-av{width:26px;height:26px;border-radius:7px;background:linear-gradient(160deg,#4a7090,#2f4f6a);color:#fff;font-size:0.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pc-enc-nom{font-size:0.88rem;font-weight:600;color:#1e2a35;flex:1}
.pc-duree{font-size:0.78rem;color:#8a9aaa}
.btn-confirm{width:100%;padding:9px;background:linear-gradient(160deg,#f5a623,#d98e1a);color:#1e2a35;border:none;border-radius:9px;font-weight:700;font-size:0.85rem;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.18s;display:flex;align-items:center;justify-content:center;gap:7px;margin-bottom:7px}
.btn-confirm:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(245,166,35,.35)}
.btn-decline-toggle{width:100%;padding:8px;background:transparent;border:1.5px solid #c8c4bc;border-radius:9px;color:#4a5a6a;font-size:0.85rem;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.18s}
.btn-decline-toggle:hover{border-color:#e74c3c;color:#e74c3c}
.rejet-zone{background:#f8d7da;border:1.5px solid #f5c6cb;border-radius:10px;padding:12px;margin-top:8px}
.rejet-lbl{display:block;font-size:0.8rem;font-weight:700;color:#721c24;margin-bottom:6px}
.req{color:#e74c3c}
.rejet-ta{width:100%;border:1.5px solid #f5c6cb;border-radius:8px;padding:9px 11px;font-size:0.85rem;font-family:'Source Sans 3',sans-serif;color:#1e2a35;background:#fff;resize:vertical;transition:.18s}
.rejet-ta:focus{outline:none;border-color:#c0392b}
.rejet-btns{display:flex;gap:8px;margin-top:8px;justify-content:flex-end}
.btn-cancel-sm{padding:6px 14px;border:1.5px solid #c8c4bc;border-radius:8px;background:#fff;color:#4a5a6a;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif}
.btn-reject-sm{padding:6px 14px;background:#e74c3c;border:none;border-radius:8px;color:#fff;font-size:0.82rem;font-weight:700;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.18s}
.btn-reject-sm:hover:not(:disabled){background:#c0392b}
.btn-reject-sm:disabled{opacity:.4;cursor:not-allowed}
.expand-enter-active,.expand-leave-active{transition:all .25s}
.expand-enter-from,.expand-leave-to{opacity:0;transform:translateY(-6px)}
.prop-mini{display:flex;align-items:center;gap:10px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:10px;padding:10px 14px;margin-bottom:8px}
.pm-confirme{border-left:3px solid #27ae60}
.pm-rejete{border-left:3px solid #e74c3c}
.pm-info{flex:1;display:flex;gap:10px;align-items:center}
.pm-date{font-size:0.85rem;font-weight:600;color:#1e2a35}
.pm-h{font-size:0.82rem;color:#8a9aaa}
.pm-badge{font-size:0.75rem;font-weight:700;padding:3px 10px;border-radius:20px}
.pb-confirme{background:#d4edda;color:#155724;border:1px solid #c3e6cb}
.pb-rejete{background:#f8d7da;color:#721c24;border:1px solid #f5c6cb}
.next-card{background:linear-gradient(160deg,#4a7090,#2f4f6a);border-radius:14px;padding:20px;margin-bottom:14px;color:#fff}
.nc-label{display:inline-block;background:rgba(245,166,35,.25);color:#f5a623;border:1px solid rgba(245,166,35,.4);font-size:0.72rem;font-weight:700;padding:3px 10px;border-radius:20px;margin-bottom:12px;letter-spacing:.3px}
.nc-jour{font-size:0.88rem;font-weight:300;color:rgba(255,255,255,.8);text-transform:capitalize}
.nc-date{font-size:0.88rem;color:rgba(255,255,255,.65);margin-bottom:4px}
.nc-heure{font-family:'Merriweather',serif;font-size:2rem;font-weight:700;color:#f5a623;line-height:1;margin-bottom:12px}
.nc-enc{display:flex;align-items:center;gap:8px;font-size:0.85rem;color:rgba(255,255,255,.8);margin-bottom:10px}
.nc-av{width:24px;height:24px;border-radius:6px;background:#f5a623;color:#1e2a35;font-size:0.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.nc-cd{display:inline-block;background:rgba(245,166,35,.15);color:#f5a623;font-size:0.82rem;font-weight:600;padding:5px 12px;border-radius:8px;margin-bottom:14px}
.btn-rappel{width:100%;padding:9px;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.25);border-radius:9px;color:#fff;font-size:0.85rem;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.18s;display:flex;align-items:center;justify-content:center;gap:7px}
.btn-rappel:hover,.btn-rappel.active{background:rgba(245,166,35,.2);border-color:#f5a623;color:#f5a623}
.next-empty{background:#e8e4dc;border:2px dashed #c8c4bc;border-radius:12px;padding:30px 16px;text-align:center;color:#8a9aaa;margin-bottom:14px}
.next-empty svg{opacity:.4;margin-bottom:8px}
.next-empty p{font-size:0.85rem;font-weight:300}
.confirmed-list{background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:12px;padding:14px;margin-bottom:10px}
.cl-title{font-size:0.75rem;font-weight:700;color:#8a9aaa;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px}
.cl-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #c8c4bc}
.cl-row:last-child{border-bottom:none}
.cl-dot{width:7px;height:7px;border-radius:50%;background:#27ae60;flex-shrink:0}
.cl-info{flex:1;display:flex;gap:10px;align-items:center}
.cl-date{font-size:0.85rem;font-weight:600;color:#1e2a35}
.cl-heure{font-size:0.8rem;color:#8a9aaa}
.cl-ok{color:#27ae60}
.rappel-info{background:#d4edda;border:1px solid #c3e6cb;border-radius:9px;padding:10px 14px;font-size:0.82rem;color:#155724;font-weight:500;display:flex;align-items:center;gap:8px}
</style>