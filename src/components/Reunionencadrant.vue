<template>
<div class="page-content">

  <!-- HEADER -->
  <div class="page-header">
    <div>
      <h2>Planification des réunions</h2>
      <p class="subtitle">Sélectionnez un étudiant puis proposez des créneaux disponibles</p>
    </div>
    <div class="legend">
      <span class="leg"><span class="leg-dot ld-sel"></span>Sélectionné</span>
      <span class="leg"><span class="leg-dot ld-prop"></span>Proposé</span>
      <span class="leg"><span class="leg-dot ld-conf"></span>Confirmé</span>
      <span class="leg"><span class="leg-dot ld-rej"></span>Rejeté</span>
    </div>
  </div>

  <!-- TOAST -->
  <transition name="toast">
    <div v-if="toast.show" class="toast" :class="'toast-'+toast.type">
      {{ toast.msg }}
      <button @click="toast.show=false" class="toast-x">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  </transition>

  <!-- BARRE CONTRÔLE -->
  <div class="control-bar">
    <!-- Sélecteur étudiant -->
    <div class="ctrl-block">
      <span class="ctrl-label">Étudiant</span>
      <div class="student-tabs">
        <button v-for="e in etudiants" :key="e.id"
          class="stab" :class="{active: selectedStudent?.id===e.id}"
          @click="selectedStudent=e; selection=[]">
          <span class="stab-av">{{ initials(e.nom) }}</span>
          <span>{{ e.nom }}</span>
          <span class="stab-cnt" v-if="propositionsPour(e).length">{{ propositionsPour(e).length }}</span>
        </button>
      </div>
    </div>

    <!-- Navigation semaine -->
    <div class="ctrl-block ctrl-week" v-if="selectedStudent">
      <button class="week-btn" @click="prevWeek">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="week-label-wrap">
        <span class="week-dates">{{ fmt(weekStart) }} — {{ fmt(weekEnd) }}</span>
        <span class="week-num">Semaine {{ weekNum }}</span>
      </div>
      <button class="week-btn" @click="nextWeek">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <!-- CTA -->
    <button class="btn-gold" v-if="selectedStudent"
      :disabled="!selection.length" @click="proposer">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      Proposer{{ selection.length ? ' ('+selection.length+')' : '' }}
    </button>
  </div>

  <!-- GRILLE AGENDA -->
  <div class="agenda-wrap" v-if="selectedStudent">
    <table class="agenda">
      <thead>
        <tr>
          <th class="th-time">Heure</th>
          <th v-for="j in jours" :key="j.key">
            <div class="th-jour">{{ j.nom }}</div>
            <div class="th-date">{{ fmt(j.date) }}</div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="h in heures" :key="h">
          <td class="td-time">{{ h }}</td>
          <td v-for="j in jours" :key="j.key+h"
            class="slot"
            :class="slotClass(j.date, h)"
            @click="toggleSlot(j.date, h)">
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="agenda-empty" v-else>
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    <p>Sélectionnez un étudiant pour afficher le planning</p>
  </div>

  <!-- PROPOSITIONS -->
  <div class="props-section" v-if="propositions.length">
    <div class="section-title">Propositions envoyées</div>
    <div class="props-grid">
      <div v-for="(p,i) in propositions" :key="i"
        class="prop-card" :class="'pc-'+p.statut">
        <div class="pc-left">
          <div class="pc-av">{{ initials(p.etudiant) }}</div>
        </div>
        <div class="pc-mid">
          <div class="pc-nom">{{ p.etudiant }}</div>
          <div class="pc-dt">{{ fmt(p.date) }} · {{ p.heure }}</div>
          <div class="pc-raison" v-if="p.raison">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {{ p.raison }}
          </div>
        </div>
        <div class="pc-right">
          <span class="pc-badge" :class="'pb-'+p.statut">{{ statLabel(p.statut) }}</span>
          <button class="pc-del" @click="propositions.splice(i,1)" title="Supprimer">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>

</div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'ReunionEncadrant',
  data() {
    return {
      etudiants: [],
      selectedStudent: null,
      jourNoms: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
      heures: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
      selection: [],
      propositions: [],
      weekStart: new Date(),
      toast: { show: false, msg: '', type: 'ok' },
      loading: false
    }
  },
  computed: {
    jours() {
      const d = new Date(this.weekStart)
      const diff = d.getDay() === 0 ? -6 : 1 - d.getDay()
      d.setDate(d.getDate() + diff)
      return this.jourNoms.map((nom, i) => {
        const date = new Date(d)
        date.setDate(d.getDate() + i)
        return { nom, date, key: date.toDateString() }
      })
    },
    weekEnd() {
      return this.jours[4]?.date || this.weekStart
    },
    weekNum() {
      const d = new Date(this.weekStart)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
      const w1 = new Date(d.getFullYear(), 0, 4)
      return 1 + Math.round(((d - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7)
    }
  },
  mounted() {
    this.chargerEtudiants()
    this.chargerReunions()
  },
  methods: {


    async chargerEtudiants() {
      try {
        const res = await api.get('/suivi/encadrant')
        this.etudiants = res.data.map(e => ({
          id: e.etudiant_id || e.id,
          nom: e.nom
        }))
      } catch (error) {
        console.error('Erreur:', error)
      }
    },

    async chargerReunions() {
      try {
        const res = await api.get('/reunions')
        this.propositions = res.data
          .filter(r => r.statut !== 'annulee')
          .map(r => {
            const normalized = typeof r.date_reunion === 'string'
              ? r.date_reunion.replace(' ', 'T')
              : r.date_reunion
            return {
              id: r.id,
              etudiant: r.etudiant_nom,
              date: new Date(normalized),
              heure: this.formatHeure(r.date_reunion),
              statut: r.statut === 'planifiee' ? 'attente'
                    : r.statut === 'confirmee' ? 'confirme'
                    : r.statut,
              raison: r.motif
            }
          })
      } catch (error) {
        console.error('Erreur:', error)
      }
    },

    formatHeure(date) {
      if (!date) return ''
      const normalized = typeof date === 'string' ? date.replace(' ', 'T') : date
      const d = new Date(normalized)
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    },

    initials(n) {
      if (!n) return '?'
      return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    },

    fmt(d) {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },

    propositionsPour(e) {
      return this.propositions.filter(p => p.etudiant === e.nom)
    },

    statLabel(s) {
      const labels = {
        attente:   'En attente',
        confirme:  'Confirmé',
        rejete:    'Rejeté',
        rappele:   'Rappelé',
        // raw API values (fallback)
        planifiee: 'En attente',
        confirmee: 'Confirmé',
        annulee:   'Rejeté',
      }
      return labels[s] || s
    },

    isSent(date, h) {
      return this.propositions.some(p =>
        p.etudiant === this.selectedStudent?.nom &&
        new Date(p.date).toDateString() === date.toDateString() &&
        p.heure === h
      )
    },

    isConfirmed(date, h) {
      return this.propositions.some(p =>
        new Date(p.date).toDateString() === date.toDateString() &&
        p.heure === h &&
        (p.statut === 'confirme' || p.statut === 'confirmee')
      )
    },

    isRejected(date, h) {
      return this.propositions.some(p =>
        new Date(p.date).toDateString() === date.toDateString() &&
        p.heure === h &&
        (p.statut === 'rejete' || p.statut === 'annulee')
      )
    },

    isSelected(date, h) {
      return this.selection.some(c => c.date.toDateString() === date.toDateString() && c.heure === h)
    },

    slotClass(date, h) {
      if (this.isConfirmed(date, h)) return 'slot-conf'
      if (this.isRejected(date, h)) return 'slot-rej'
      if (this.isSent(date, h)) return 'slot-prop'
      if (this.isSelected(date, h)) return 'slot-sel'
      return 'slot-free'
    },

    toggleSlot(date, h) {
      if (this.isSent(date, h)) {
        this.showToast('Ce créneau est déjà proposé', 'warn')
        return
      }
      const idx = this.selection.findIndex(c => c.date.toDateString() === date.toDateString() && c.heure === h)
      idx >= 0 ? this.selection.splice(idx, 1) : this.selection.push({ date: new Date(date), heure: h })
    },

    async proposer() {
      if (!this.selectedStudent) return
      
      let n = 0
      for (const c of this.selection) {
        if (!this.isSent(c.date, c.heure)) {
          try {
            await api.post('/reunions', {
              etudiant_id: this.selectedStudent.id,
              date_reunion: this.combinerDateHeure(c.date, c.heure),
              type: 'presentiel'
            })
            n++
          } catch (error) {
            console.error('Erreur:', error)
          }
        }
      }
      
      this.selection = []
      await this.chargerReunions()
      this.showToast(`${n} créneau(x) proposé(s) à ${this.selectedStudent.nom}`)
    },

    combinerDateHeure(date, heure) {
      const [hours, minutes] = heure.split(':')
      const d = new Date(date)
      d.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      // Build a local datetime string (YYYY-MM-DD HH:MM:SS) so the server
      // stores the time the encadrant actually selected, not UTC-shifted.
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`
    },

    showToast(msg, type = 'ok') {
      this.toast = { show: true, msg, type }
      setTimeout(() => (this.toast.show = false), 3200)
    },

    prevWeek() {
      const d = new Date(this.weekStart)
      d.setDate(d.getDate() - 7)
      this.weekStart = d
    },

    nextWeek() {
      const d = new Date(this.weekStart)
      d.setDate(d.getDate() + 7)
      this.weekStart = d
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.page-content{font-family:'Source Sans 3',sans-serif;color:#1e2a35}

/* HEADER */
.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:16px;flex-wrap:wrap}
h2{font-family:'Merriweather',serif;font-size:1.4rem;font-weight:700;color:#1e2a35;margin-bottom:4px}
.subtitle{font-size:0.88rem;color:#8a9aaa;font-weight:300}
.legend{display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding-top:4px}
.leg{display:flex;align-items:center;gap:6px;font-size:0.8rem;color:#8a9aaa}
.leg-dot{width:10px;height:10px;border-radius:3px;display:inline-block}
.ld-sel{background:#f5a623;border:1px solid #d98e1a}
.ld-prop{background:#3d6080;border:1px solid #2f4f6a}
.ld-conf{background:#27ae60;border:1px solid #1e8449}
.ld-rej{background:#e74c3c;border:1px solid #c0392b}

/* TOAST */
.toast{display:flex;justify-content:space-between;align-items:center;padding:11px 16px;border-radius:10px;margin-bottom:16px;font-size:0.88rem;font-weight:500;border:1.5px solid}
.toast-ok{background:#e8f5e9;color:#155724;border-color:#c3e6cb}
.toast-warn{background:#fff3cd;color:#856404;border-color:#ffc107}
.toast-err{background:#f8d7da;color:#721c24;border-color:#f5c6cb}
.toast-x{background:none;border:none;cursor:pointer;color:inherit;opacity:.6;display:flex;align-items:center;padding:2px}
.toast-enter-active,.toast-leave-active{transition:all .25s}
.toast-enter-from,.toast-leave-to{opacity:0;transform:translateY(-6px)}

/* CONTROL BAR */
.control-bar{display:flex;align-items:center;gap:16px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:14px;padding:16px 20px;margin-bottom:20px;flex-wrap:wrap}
.ctrl-block{display:flex;flex-direction:column;gap:8px}
.ctrl-label{font-size:0.72rem;font-weight:700;color:#8a9aaa;text-transform:uppercase;letter-spacing:.06em}
.student-tabs{display:flex;gap:8px;flex-wrap:wrap}
.stab{display:flex;align-items:center;gap:8px;padding:8px 14px;border:1.5px solid #c8c4bc;border-radius:22px;background:#ddd9d1;cursor:pointer;font-size:0.88rem;font-weight:500;color:#4a5a6a;font-family:'Source Sans 3',sans-serif;transition:.18s}
.stab:hover{border-color:#3d6080;color:#3d6080}
.stab.active{background:linear-gradient(160deg,#4a7090,#2f4f6a);color:#fff;border-color:transparent;font-weight:600}
.stab-av{width:22px;height:22px;border-radius:6px;background:rgba(255,255,255,0.25);font-size:0.7rem;font-weight:700;display:flex;align-items:center;justify-content:center}
.stab:not(.active) .stab-av{background:#3d6080;color:#fff}
.stab-cnt{background:#f5a623;color:#1e2a35;font-size:0.68rem;font-weight:700;padding:1px 6px;border-radius:20px}

.ctrl-week{flex-direction:row;align-items:center;gap:12px;flex:1;justify-content:center}
.week-btn{width:32px;height:32px;border:1.5px solid #c8c4bc;background:#ddd9d1;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#4a5a6a;transition:.18s}
.week-btn:hover{background:#3d6080;color:#fff;border-color:#3d6080}
.week-label-wrap{text-align:center}
.week-dates{font-size:0.88rem;font-weight:600;color:#1e2a35;display:block}
.week-num{font-size:0.75rem;color:#8a9aaa;display:block;margin-top:2px}

/* AGENDA */
.agenda-wrap{background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,.08);margin-bottom:24px}
.agenda{width:100%;border-collapse:collapse}
.agenda thead th{background:linear-gradient(160deg,#4a7090,#3d6080);color:#fff;padding:11px 8px;text-align:center;font-family:'Source Sans 3',sans-serif;font-weight:600;font-size:0.82rem}
.th-time{width:72px;background:linear-gradient(160deg,#3d6080,#2f4f6a)!important;font-size:0.7rem;text-transform:uppercase;letter-spacing:.05em}
.th-jour{font-size:0.85rem;font-weight:700}
.th-date{font-size:0.72rem;opacity:.8;margin-top:2px;font-weight:300}
.td-time{background:#ddd9d1;color:#3d6080;font-size:0.82rem;font-weight:700;text-align:center;padding:0 8px;border-bottom:1px solid #c8c4bc}
.slot{height:48px;cursor:pointer;text-align:center;vertical-align:middle;border-bottom:1px solid #c8c4bc;border-right:1px solid #c8c4bc;transition:.15s;background:#fff}
.slot-free:hover{background:#fef9ed}
.slot-sel{background:#fef3c7!important;border:2px solid #f5a623!important}
.slot-prop{background:#dbe7f0!important;cursor:not-allowed}
.slot-conf{background:#d4edda!important;border:1px solid #c3e6cb!important}
.slot-rej{background:#f8d7da!important;border:1px solid #f5c6cb!important;cursor:not-allowed}

.agenda-empty{background:#e8e4dc;border:2px dashed #c8c4bc;border-radius:14px;padding:52px 20px;text-align:center;color:#8a9aaa;margin-bottom:24px}
.agenda-empty svg{opacity:.4;margin-bottom:12px}
.agenda-empty p{font-size:0.9rem;font-weight:300}

/* PROPOSITIONS */

.section-title{font-family:'Merriweather',serif;font-size:1rem;font-weight:700;color:#1e2a35;margin-bottom:14px}
.props-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
.prop-card{background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:12px;padding:14px 16px;display:flex;gap:12px;align-items:center;transition:.18s}
.prop-card:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,.08)}
.pc-attente{border-left:4px solid #f5a623}
.pc-confirme{border-left:4px solid #27ae60}
.pc-rejete{border-left:4px solid #e74c3c}
.pc-rappele{border-left:4px solid #3d6080}
.pc-av{width:36px;height:36px;border-radius:10px;background:linear-gradient(160deg,#4a7090,#2f4f6a);color:#fff;font-weight:700;font-size:0.82rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Merriweather',serif}
.pc-mid{flex:1;min-width:0}
.pc-nom{font-size:0.9rem;font-weight:700;color:#1e2a35}
.pc-dt{font-size:0.8rem;color:#8a9aaa;margin-top:2px}
.pc-raison{font-size:0.78rem;color:#721c24;background:#f8d7da;border-radius:6px;padding:4px 8px;margin-top:6px;display:flex;align-items:center;gap:5px}
.pc-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0}
.pc-badge{font-size:0.75rem;font-weight:700;padding:3px 10px;border-radius:20px;white-space:nowrap}
.pb-attente{background:#fff3cd;color:#856404;border:1px solid #ffc107}
.pb-confirme{background:#d4edda;color:#155724;border:1px solid #c3e6cb}
.pb-rejete{background:#f8d7da;color:#721c24;border:1px solid #f5c6cb}
.pb-rappele{background:#d0e8f4;color:#2f4f6a;border:1px solid #aacfe4}
.pc-del{background:none;border:none;cursor:pointer;color:#c8c4bc;display:flex;align-items:center;transition:color .15s}
.pc-del:hover{color:#e74c3c}

/* BUTTONS */
.btn-gold{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;background:linear-gradient(160deg,#f5a623,#d98e1a);color:#1e2a35;border:none;border-radius:9px;font-size:0.88rem;font-weight:700;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.2s;box-shadow:0 3px 12px rgba(245,166,35,.3);white-space:nowrap}
.btn-gold:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 5px 18px rgba(245,166,35,.4)}
.btn-gold:disabled{opacity:.4;cursor:not-allowed;transform:none}
</style>