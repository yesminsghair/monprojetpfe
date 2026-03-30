<template>
  <div class="page-content">

    <!-- HEADER -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <h2>Planification des réunions</h2>
          <p class="subtitle">Proposez des créneaux à vos étudiants encadrés</p>
        </div>
      </div>
      <div class="role-chip">👨‍🏫 Vue Encadrant</div>
    </div>

    <!-- NOTIF -->
    <transition name="slide-notif">
      <div v-if="notif.show" class="notif" :class="'notif-' + notif.type">
        <span>{{ notif.msg }}</span>
        <button @click="notif.show = false" class="notif-close">✕</button>
      </div>
    </transition>

    <!-- LAYOUT: 2 colonnes -->
    <div class="layout">

      <!-- COLONNE GAUCHE : Sélection + agenda -->
      <div class="col-main">

        <!-- Sélecteur étudiant -->
        <div class="selector-card">
          <label class="selector-label">Choisir un étudiant à réunir</label>
          <div class="student-options">
            <button
              v-for="e in etudiants" :key="e.id"
              class="student-btn"
              :class="{ active: selectedStudent?.id === e.id }"
              @click="selectedStudent = e; selection = []">
              <div class="s-av">{{ initials(e.nom) }}</div>
              <div class="s-info">
                <div class="s-nom">{{ e.nom }}</div>
                <div class="s-sujet">{{ e.sujet }}</div>
              </div>
              <div class="s-count" v-if="propositionsFor(e).length">
                {{ propositionsFor(e).length }}
              </div>
            </button>
          </div>
        </div>

        <!-- Navigation semaine -->
        <div class="week-nav" v-if="selectedStudent">
          <button class="nav-arrow" @click="prevWeek">‹</button>
          <div class="week-info">
            <span class="week-dates">{{ fmt(weekStart) }} — {{ fmt(weekEnd) }}</span>
            <span class="week-num">Semaine {{ weekNum }}</span>
          </div>
          <button class="nav-arrow" @click="nextWeek">›</button>
        </div>

        <!-- Agenda -->
        <div class="agenda-wrap" v-if="selectedStudent">
          <div class="agenda-legend">
            <span><span class="leg leg-sel"></span> Sélectionné</span>
            <span><span class="leg leg-sent"></span> Déjà proposé</span>
            <span><span class="leg leg-conf"></span> Confirmé</span>
          </div>

          <table class="agenda">
            <thead>
              <tr>
                <th class="th-time">Heure</th>
                <th v-for="j in days" :key="j.key">
                  <div class="th-day">{{ j.name }}</div>
                  <div class="th-date">{{ fmt(j.date) }}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in hours" :key="h">
                <td class="td-time">{{ h }}</td>
                <td v-for="j in days" :key="j.key + h"
                  @click="toggle(j.date, h)"
                  :class="['slot', slotClass(j.date, h)]">
                  <span class="slot-icon">{{ slotIcon(j.date, h) }}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- CTA -->
          <div class="agenda-footer">
            <span class="sel-count" v-if="selection.length">{{ selection.length }} créneau(x) sélectionné(s)</span>
            <span class="sel-count muted" v-else>Cliquez sur des créneaux pour les sélectionner</span>
            <button class="btn-gold"
              :disabled="!selection.length"
              @click="envoyer">
              📤 Proposer à {{ selectedStudent.nom.split(' ')[0] }}
            </button>
          </div>
        </div>

        <div class="empty-hint" v-else>
          <span style="font-size:40px">👈</span>
          <p>Sélectionnez un étudiant pour accéder au calendrier</p>
        </div>

      </div>

      <!-- COLONNE DROITE : Propositions envoyées -->
      <div class="col-side">
        <div class="side-title">
          <span>📋 Propositions envoyées</span>
          <span class="badge-count">{{ propositions.length }}</span>
        </div>

        <div v-if="!propositions.length" class="side-empty">Aucune proposition envoyée</div>

        <div v-for="p in propositions" :key="p.id" class="prop-item" :class="'prop-' + p.statut">
          <div class="prop-top">
            <div class="prop-avatar">{{ initials(p.etudiant) }}</div>
            <div class="prop-info">
              <div class="prop-etudiant">{{ p.etudiant }}</div>
              <div class="prop-datetime">{{ fmt(p.date) }} · {{ p.heure }}</div>
            </div>
            <span class="prop-status-chip" :class="'chip-' + p.statut">
              {{ statusLabel(p.statut) }}
            </span>
          </div>
          <div class="prop-actions">
            <button class="mini-btn mini-remind" @click="rappel(p)">🔔 Rappel</button>
            <button class="mini-btn mini-del" @click="supprimer(p)">✕ Supprimer</button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'ReunionEncadrant',
  data() {
    return {
      etudiants: [
        { id: 1, nom: 'Ali Ben Salem', sujet: 'Système de gestion PFE' },
        { id: 2, nom: 'Nadia Gharbi', sujet: 'Application mobile IoT' },
        { id: 3, nom: 'Karim Mbarki', sujet: 'Plateforme e-learning' },
      ],
      selectedStudent: null,
      hours: ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'],
      selection: [],       // créneaux sélectionnés par l'encadrant (pas encore envoyés)
      propositions: [],    // propositions envoyées
      weekStart: new Date(),
      notif: { show: false, msg: '', type: 'success' }
    }
  },
  computed: {
    days() {
      const d = new Date(this.weekStart)
      const day = d.getDay()
      const diff = day === 0 ? -6 : 1 - day
      d.setDate(d.getDate() + diff)
      return ['Lun','Mar','Mer','Jeu','Ven'].map((name, i) => {
        const date = new Date(d)
        date.setDate(d.getDate() + i)
        return { name, date, key: date.toDateString() }
      })
    },
    weekEnd() {
      return this.days[4].date
    },
    weekNum() {
      const d = new Date(this.weekStart)
      d.setHours(0,0,0,0)
      d.setDate(d.getDate() + 3 - (d.getDay()+6)%7)
      const w1 = new Date(d.getFullYear(),0,4)
      return 1 + Math.round(((d-w1)/86400000 - 3 + (w1.getDay()+6)%7)/7)
    }
  },
  methods: {
    initials(n) { return n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() },
    fmt(d) { return new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}) },
    propositionsFor(e) { return this.propositions.filter(p=>p.etudiant===e.nom) },
    statusLabel(s) { return {attente:'⏳ En attente',confirme:'✅ Confirmé',rappele:'🔔 Rappelé'}[s]||s },

    isSelected(date, h) {
      return this.selection.some(c=>c.date.toDateString()===date.toDateString()&&c.heure===h)
    },
    isSent(date, h) {
      return this.propositions.some(p=>
        p.etudiant===this.selectedStudent?.nom &&
        new Date(p.date).toDateString()===date.toDateString()&&p.heure===h)
    },
    isConfirmed(date, h) {
      return this.propositions.some(p=>
        new Date(p.date).toDateString()===date.toDateString()&&p.heure===h&&p.statut==='confirme')
    },
    slotClass(date, h) {
      if (this.isConfirmed(date, h)) return 'slot-confirmed'
      if (this.isSent(date, h)) return 'slot-sent'
      if (this.isSelected(date, h)) return 'slot-selected'
      return 'slot-free'
    },
    slotIcon(date, h) {
      if (this.isConfirmed(date,h)) return '✅'
      if (this.isSent(date,h)) return '📨'
      if (this.isSelected(date,h)) return '⭐'
      return ''
    },
    toggle(date, h) {
      if (this.isSent(date, h)) { this.showNotif('Créneau déjà proposé', 'warn'); return }
      const idx = this.selection.findIndex(c=>c.date.toDateString()===date.toDateString()&&c.heure===h)
      idx >= 0 ? this.selection.splice(idx,1) : this.selection.push({date:new Date(date),heure:h})
    },
    envoyer() {
      this.selection.forEach(c => {
        this.propositions.push({
          id: Date.now() + Math.random(),
          etudiant: this.selectedStudent.nom,
          date: new Date(c.date),
          heure: c.heure,
          statut: 'attente'
        })
      })
      this.showNotif(`${this.selection.length} créneau(x) proposé(s) à ${this.selectedStudent.nom}`)
      this.selection = []
    },
    rappel(p) {
      p.statut = 'rappele'
      this.showNotif(`Rappel envoyé à ${p.etudiant}`, 'warn')
    },
    supprimer(p) {
      this.propositions = this.propositions.filter(x=>x.id!==p.id)
    },
    showNotif(msg, type='success') {
      this.notif = {show:true,msg,type}
      setTimeout(()=>this.notif.show=false, 3500)
    },
    prevWeek() { const d=new Date(this.weekStart); d.setDate(d.getDate()-7); this.weekStart=d },
    nextWeek() { const d=new Date(this.weekStart); d.setDate(d.getDate()+7); this.weekStart=d },
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box}
.page-content{padding:28px;background:#0F1923;min-height:100vh;font-family:'DM Sans',sans-serif;color:#E8EDF2}

.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.header-left{display:flex;align-items:center;gap:14px}
.header-icon-wrap{width:50px;height:50px;background:rgba(245,197,24,0.12);border:1px solid rgba(245,197,24,0.3);border-radius:13px;display:flex;align-items:center;justify-content:center;color:#F5C518;flex-shrink:0}
h2{font-family:'Syne',sans-serif;font-size:21px;font-weight:700;color:#F5C518;margin:0}
.subtitle{font-size:13px;color:#7A8FA6;margin-top:2px}
.role-chip{background:rgba(245,197,24,0.1);border:1px solid rgba(245,197,24,0.3);color:#F5C518;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700}

/* NOTIF */
.notif{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-radius:10px;margin-bottom:16px;font-size:14px;font-weight:500;border:1px solid}
.notif-success{background:rgba(39,174,96,0.1);color:#2ecc71;border-color:rgba(39,174,96,0.3)}
.notif-warn{background:rgba(245,197,24,0.1);color:#F5C518;border-color:rgba(245,197,24,0.3)}
.notif-close{background:none;border:none;color:inherit;cursor:pointer;opacity:.7}
.slide-notif-enter-active,.slide-notif-leave-active{transition:all .3s}
.slide-notif-enter-from,.slide-notif-leave-to{transform:translateY(-8px);opacity:0}

/* LAYOUT */
.layout{display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start}

/* SELECTOR */
.selector-card{background:#1A2635;border:1px solid rgba(245,197,24,0.15);border-radius:14px;padding:18px;margin-bottom:16px}
.selector-label{display:block;font-size:11px;font-weight:700;color:#7A8FA6;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px}
.student-options{display:flex;flex-direction:column;gap:8px}
.student-btn{display:flex;align-items:center;gap:12px;padding:10px 14px;background:#243347;border:1px solid rgba(255,255,255,0.06);border-radius:10px;cursor:pointer;text-align:left;transition:.2s;color:#E8EDF2}
.student-btn:hover{border-color:rgba(245,197,24,0.3);background:rgba(245,197,24,0.05)}
.student-btn.active{border-color:#F5C518;background:rgba(245,197,24,0.1)}
.s-av{width:36px;height:36px;border-radius:10px;background:#F5C518;color:#0F1923;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Syne',sans-serif}
.s-nom{font-weight:600;font-size:14px}
.s-sujet{font-size:12px;color:#7A8FA6}
.s-count{margin-left:auto;background:rgba(245,197,24,0.2);color:#F5C518;border-radius:20px;font-size:11px;font-weight:700;padding:2px 9px}

/* WEEK NAV */
.week-nav{display:flex;align-items:center;justify-content:space-between;background:#1A2635;border:1px solid rgba(245,197,24,0.15);border-radius:12px;padding:12px 18px;margin-bottom:14px}
.nav-arrow{background:rgba(245,197,24,0.1);border:1px solid rgba(245,197,24,0.25);color:#F5C518;width:34px;height:34px;border-radius:8px;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;transition:.2s}
.nav-arrow:hover{background:rgba(245,197,24,0.2)}
.week-dates{font-family:'Syne',sans-serif;font-weight:700;color:#F5C518;font-size:14px;display:block;text-align:center}
.week-num{font-size:11px;color:#7A8FA6;display:block;text-align:center}

/* AGENDA */
.agenda-wrap{background:#1A2635;border:1px solid rgba(245,197,24,0.15);border-radius:14px;overflow:hidden}
.agenda-legend{display:flex;gap:18px;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;color:#7A8FA6}
.leg{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:5px;vertical-align:middle}
.leg-sel{background:rgba(245,197,24,0.5);border:1px solid #F5C518}
.leg-sent{background:rgba(41,128,185,0.4);border:1px solid #5dade2}
.leg-conf{background:rgba(39,174,96,0.4);border:1px solid #2ecc71}

.agenda{width:100%;border-collapse:collapse}
.agenda th{background:#243347;padding:10px 8px;font-family:'Syne',sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.5px;font-weight:600;border-bottom:1px solid rgba(245,197,24,0.2);text-align:center}
.agenda th.th-time{width:70px;color:#7A8FA6}
.th-day{color:#F5C518;font-size:11px}
.th-date{color:#7A8FA6;font-size:10px;font-weight:400;margin-top:2px}
.td-time{background:#1E2F42;color:#7A8FA6;font-size:12px;font-weight:600;text-align:center;padding:10px 6px;border-bottom:1px solid rgba(255,255,255,0.04)}
.slot{height:48px;cursor:pointer;text-align:center;vertical-align:middle;border-bottom:1px solid rgba(255,255,255,0.04);border-right:1px solid rgba(255,255,255,0.04);transition:.15s;font-size:14px}
.slot-free:hover{background:rgba(245,197,24,0.07)}
.slot-selected{background:rgba(245,197,24,0.18)!important;border:1px solid rgba(245,197,24,0.5)!important}
.slot-sent{background:rgba(41,128,185,0.15)!important;cursor:not-allowed}
.slot-confirmed{background:rgba(39,174,96,0.18)!important;border:1px solid rgba(39,174,96,0.4)!important}
.slot-icon{font-size:16px}

.agenda-footer{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-top:1px solid rgba(255,255,255,0.06)}
.sel-count{font-size:13px;color:#F5C518;font-weight:600}
.sel-count.muted{color:#7A8FA6;font-weight:400}

/* EMPTY HINT */
.empty-hint{background:#1A2635;border:2px dashed rgba(245,197,24,0.2);border-radius:14px;padding:50px 20px;text-align:center;color:#7A8FA6}
.empty-hint p{margin-top:10px;font-size:14px}

/* SIDE COLUMN */
.col-side{display:flex;flex-direction:column;gap:12px}
.side-title{display:flex;align-items:center;justify-content:space-between;font-family:'Syne',sans-serif;font-weight:700;font-size:15px;color:#F5C518;margin-bottom:4px}
.badge-count{background:rgba(245,197,24,0.15);color:#F5C518;border:1px solid rgba(245,197,24,0.3);padding:2px 10px;border-radius:20px;font-size:12px}
.side-empty{background:#1A2635;border:1px dashed rgba(245,197,24,0.15);border-radius:12px;padding:28px;text-align:center;color:#7A8FA6;font-size:13px}

.prop-item{background:#1A2635;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:14px;transition:.2s}
.prop-item:hover{transform:translateX(2px)}
.prop-attente{border-left:3px solid #F5C518}
.prop-confirme{border-left:3px solid #2ecc71}
.prop-rappele{border-left:3px solid #5dade2}
.prop-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.prop-avatar{width:34px;height:34px;border-radius:9px;background:#F5C518;color:#0F1923;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Syne',sans-serif}
.prop-etudiant{font-weight:600;font-size:13px}
.prop-datetime{font-size:12px;color:#7A8FA6;margin-top:1px}
.prop-status-chip{margin-left:auto;font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px}
.chip-attente{background:rgba(245,197,24,0.15);color:#F5C518}
.chip-confirme{background:rgba(39,174,96,0.15);color:#2ecc71}
.chip-rappele{background:rgba(41,128,185,0.15);color:#5dade2}

.prop-actions{display:flex;gap:8px}
.mini-btn{padding:4px 10px;border-radius:7px;font-size:11px;font-weight:600;border:none;cursor:pointer;transition:.15s}
.mini-remind{background:rgba(245,197,24,0.1);color:#F5C518;border:1px solid rgba(245,197,24,0.3)}
.mini-remind:hover{background:rgba(245,197,24,0.2)}
.mini-del{background:rgba(231,76,60,0.1);color:#e74c3c;border:1px solid rgba(231,76,60,0.3)}
.mini-del:hover{background:rgba(231,76,60,0.25)}

/* BUTTONS */
.btn-gold{background:#F5C518;color:#0F1923;border:none;padding:10px 20px;border-radius:10px;font-weight:700;font-family:'Syne',sans-serif;cursor:pointer;font-size:13px;transition:.2s}
.btn-gold:hover:not(:disabled){background:#D4A017;box-shadow:0 4px 16px rgba(245,197,24,0.4)}
.btn-gold:disabled{opacity:.35;cursor:not-allowed}
</style>