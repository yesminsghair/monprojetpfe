<template>
  <div class="page-content">
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <h2>Mes réunions</h2>
          <p class="subtitle">Confirmez un créneau proposé par votre encadrant</p>
        </div>
      </div>
      <div class="role-chip">🎓 Vue Étudiant</div>
    </div>

    <transition name="slide-notif">
      <div v-if="notif.show" class="notif" :class="'notif-' + notif.type">
        <span>{{ notif.msg }}</span>
        <button @click="notif.show = false" class="notif-close">✕</button>
      </div>
    </transition>

    <div class="layout">
      <div class="col-proposals">
        <div class="section-head">
          <span class="section-icon">📬</span>
          <div>
            <div class="section-title">Propositions reçues</div>
            <div class="section-sub">de {{ encadrant }}</div>
          </div>
          <span class="badge-new" v-if="pendingCount">{{ pendingCount }} nouvelle(s)</span>
        </div>

        <div class="empty-card" v-if="!propositions.length">
          <div style="font-size:40px">📭</div>
          <p>Aucun créneau proposé pour l'instant</p>
          <span class="empty-hint">Votre encadrant vous proposera des créneaux ici</span>
        </div>

        <div v-if="pending.length" class="group-label">En attente de votre confirmation</div>
        <div v-for="p in pending" :key="p.id" class="prop-card prop-pending">
          <div class="prop-card-top">
            <div class="prop-datetime-big">
              <div class="prop-day">{{ dayName(p.date) }}</div>
              <div class="prop-date-txt">{{ fmt(p.date) }}</div>
              <div class="prop-heure">{{ p.heure }}</div>
            </div>
            <div class="prop-card-right">
              <div class="prop-encadrant">
                <span class="enc-av">{{ initials(encadrant) }}</span>
                <span class="enc-nom">{{ encadrant }}</span>
              </div>
              <div class="prop-duration">⏱ ~1h de réunion</div>
              <div class="prop-card-actions">
                <button class="btn-confirm" @click="confirmer(p)">✅ Confirmer ce créneau</button>
                <button class="btn-decline" @click="decliner(p)">Décliner</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="repondues.length" class="group-label" style="margin-top:20px">Réponses données</div>
        <div v-for="p in repondues" :key="p.id" class="prop-card" :class="p.statut === 'confirme' ? 'prop-confirmed' : 'prop-declined'">
          <div class="prop-card-mini">
            <div>
              <div class="prop-mini-date">{{ fmt(p.date) }}</div>
              <div class="prop-mini-heure">{{ p.heure }}</div>
            </div>
            <span class="chip" :class="p.statut === 'confirme' ? 'chip-green' : 'chip-gray'">
              {{ p.statut === 'confirme' ? '✅ Confirmé' : '✗ Décliné' }}
            </span>
          </div>
        </div>
      </div>

      <div class="col-agenda">
        <div class="section-head">
          <span class="section-icon">📅</span>
          <div>
            <div class="section-title">Prochaines réunions</div>
            <div class="section-sub">Confirmées</div>
          </div>
        </div>

        <div class="next-meeting" v-if="nextMeeting">
          <div class="next-badge">Prochaine réunion</div>
          <div class="next-date">{{ dayName(nextMeeting.date) }}</div>
          <div class="next-heure">{{ nextMeeting.heure }}</div>
          <div class="next-datestr">{{ fmt(nextMeeting.date) }}</div>
          <div class="next-enc">
            <span class="enc-av sm">{{ initials(encadrant) }}</span>
            <span>{{ encadrant }}</span>
          </div>
          <div class="next-countdown">{{ countdown(nextMeeting.date) }}</div>
          <button class="btn-reminder" @click="setRappel(nextMeeting)">🔔 Activer le rappel</button>
        </div>

        <div class="empty-card sm" v-else>
          <div style="font-size:32px">📭</div>
          <p>Aucune réunion confirmée</p>
        </div>

        <div class="meetings-list" v-if="confirmed.length > 1">
          <div class="ml-title">Toutes les réunions</div>
          <div v-for="m in confirmed" :key="m.id" class="meeting-row">
            <div class="mr-dot"></div>
            <div class="mr-info">
              <div class="mr-date">{{ fmt(m.date) }}</div>
              <div class="mr-heure">{{ m.heure }}</div>
            </div>
            <div class="mr-status">✅</div>
          </div>
        </div>

        <div class="reminder-card" v-if="rappelActif">
          <span style="font-size:20px">🔔</span>
          <div>
            <div class="rem-title">Rappel activé</div>
            <div class="rem-sub">Vous serez notifié 30 min avant la réunion</div>
          </div>
          <button class="mini-cancel" @click="rappelActif = false">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReunionEtudiant',
  data() {
    return {
      encadrant: 'Dr. Tarek Chaari',
      rappelActif: false,
      propositions: [
        { id: 1, date: new Date(Date.now() + 2*86400000), heure: '10:00', statut: 'attente' },
        { id: 2, date: new Date(Date.now() + 3*86400000), heure: '14:00', statut: 'attente' },
        { id: 3, date: new Date(Date.now() + 5*86400000), heure: '09:00', statut: 'attente' },
      ],
      notif: { show: false, msg: '', type: 'success' }
    }
  },
  computed: {
    pending() { return this.propositions.filter(p=>p.statut==='attente') },
    repondues() { return this.propositions.filter(p=>p.statut!=='attente') },
    confirmed() { return this.propositions.filter(p=>p.statut==='confirme').sort((a,b)=>new Date(a.date)-new Date(b.date)) },
    nextMeeting() { return this.confirmed[0]||null },
    pendingCount() { return this.pending.length }
  },
  methods: {
    initials(n) { return n.replace(/Dr\.|Prof\./gi,'').trim().split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() },
    fmt(d) { return new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}) },
    dayName(d) { return new Date(d).toLocaleDateString('fr-FR',{weekday:'long'}).replace(/^\w/,c=>c.toUpperCase()) },
    countdown(d) {
      const diff = new Date(d)-new Date()
      if(diff<0) return 'Passée'
      const days = Math.floor(diff/86400000)
      if(days===0) return "Aujourd'hui !"
      if(days===1) return 'Demain'
      return `Dans ${days} jours`
    },
    confirmer(p) {
      this.pending.filter(x=>x.id!==p.id).forEach(x=>x.statut='decline')
      p.statut='confirme'
      this.showNotif(`Réunion confirmée pour le ${this.fmt(p.date)} à ${p.heure} ✅`)
    },
    decliner(p) { p.statut='decline'; this.showNotif('Créneau décliné','warn') },
    setRappel(m) { this.rappelActif=true; this.showNotif(`Rappel activé pour le ${this.fmt(m.date)} à ${m.heure}`) },
    showNotif(msg,type='success') { this.notif={show:true,msg,type}; setTimeout(()=>this.notif.show=false,3800) }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box}
.page-content{padding:28px;background:#0F1923;min-height:100vh;font-family:'DM Sans',sans-serif;color:#E8EDF2}
.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.header-left{display:flex;align-items:center;gap:14px}
.header-icon-wrap{width:50px;height:50px;background:rgba(39,174,96,0.12);border:1px solid rgba(39,174,96,0.3);border-radius:13px;display:flex;align-items:center;justify-content:center;color:#2ecc71;flex-shrink:0}
h2{font-family:'Syne',sans-serif;font-size:21px;font-weight:700;color:#E8EDF2;margin:0}
.subtitle{font-size:13px;color:#7A8FA6;margin-top:2px}
.role-chip{background:rgba(39,174,96,0.1);border:1px solid rgba(39,174,96,0.3);color:#2ecc71;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700}
.notif{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-radius:10px;margin-bottom:16px;font-size:14px;font-weight:500;border:1px solid}
.notif-success{background:rgba(39,174,96,0.1);color:#2ecc71;border-color:rgba(39,174,96,0.3)}
.notif-warn{background:rgba(245,197,24,0.1);color:#F5C518;border-color:rgba(245,197,24,0.3)}
.notif-close{background:none;border:none;color:inherit;cursor:pointer;opacity:.7}
.slide-notif-enter-active,.slide-notif-leave-active{transition:all .3s}
.slide-notif-enter-from,.slide-notif-leave-to{transform:translateY(-8px);opacity:0}
.layout{display:grid;grid-template-columns:1fr 320px;gap:20px;align-items:start}
.section-head{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.section-icon{font-size:24px}
.section-title{font-family:'Syne',sans-serif;font-weight:700;font-size:16px;color:#E8EDF2}
.section-sub{font-size:12px;color:#7A8FA6;margin-top:1px}
.badge-new{margin-left:auto;background:rgba(245,197,24,0.2);color:#F5C518;border:1px solid rgba(245,197,24,0.3);padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
.group-label{font-size:11px;font-weight:700;color:#7A8FA6;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}
.prop-card{background:#1A2635;border-radius:14px;padding:18px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.07);transition:.2s}
.prop-pending{border-left:3px solid #F5C518;border-color:rgba(245,197,24,0.25)}
.prop-confirmed{border-left:3px solid #2ecc71;border-color:rgba(39,174,96,0.2)}
.prop-declined{border-left:3px solid #4A5568;opacity:.7}
.prop-card-top{display:grid;grid-template-columns:100px 1fr;gap:16px}
.prop-datetime-big{background:#243347;border-radius:12px;padding:14px 10px;text-align:center;border:1px solid rgba(245,197,24,0.15)}
.prop-day{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;color:#F5C518;text-transform:capitalize}
.prop-date-txt{font-size:13px;font-weight:700;color:#E8EDF2;margin:4px 0}
.prop-heure{font-size:22px;font-weight:800;color:#F5C518;font-family:'Syne',sans-serif}
.prop-encadrant{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.enc-av{width:28px;height:28px;border-radius:8px;background:#F5C518;color:#0F1923;font-weight:800;font-size:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Syne',sans-serif}
.enc-av.sm{width:24px;height:24px;font-size:10px}
.enc-nom{font-size:13px;font-weight:600;color:#E8EDF2}
.prop-duration{font-size:12px;color:#7A8FA6;margin-bottom:12px}
.prop-card-actions{display:flex;flex-direction:column;gap:8px}
.btn-confirm{background:#F5C518;color:#0F1923;border:none;padding:10px;border-radius:10px;font-weight:700;font-family:'Syne',sans-serif;cursor:pointer;font-size:13px;transition:.2s;width:100%}
.btn-confirm:hover{background:#D4A017;box-shadow:0 4px 14px rgba(245,197,24,0.4)}
.btn-decline{background:transparent;color:#7A8FA6;border:1px solid rgba(255,255,255,0.1);padding:8px;border-radius:10px;cursor:pointer;font-size:13px;transition:.2s;width:100%}
.btn-decline:hover{border-color:rgba(231,76,60,0.4);color:#e74c3c}
.prop-card-mini{display:flex;align-items:center;justify-content:space-between}
.prop-mini-date{font-size:13px;font-weight:600;color:#E8EDF2}
.prop-mini-heure{font-size:12px;color:#7A8FA6}
.chip{padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600}
.chip-green{background:rgba(39,174,96,0.15);color:#2ecc71;border:1px solid rgba(39,174,96,0.3)}
.chip-gray{background:rgba(74,85,104,0.2);color:#7A8FA6;border:1px solid rgba(74,85,104,0.3)}
.empty-card{background:#1A2635;border:2px dashed rgba(255,255,255,0.08);border-radius:14px;padding:40px 20px;text-align:center;color:#7A8FA6}
.empty-card.sm{padding:24px}
.empty-card p{margin-top:10px;font-size:14px;color:#A8BDD4}
.empty-hint{font-size:12px;color:#7A8FA6;margin-top:6px;display:block}
.next-meeting{background:linear-gradient(135deg,rgba(245,197,24,0.12),rgba(212,160,23,0.06));border:1px solid rgba(245,197,24,0.35);border-radius:16px;padding:22px;margin-bottom:16px}
.next-badge{display:inline-block;background:#F5C518;color:#0F1923;font-family:'Syne',sans-serif;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;padding:3px 10px;border-radius:20px;margin-bottom:12px}
.next-date{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#E8EDF2;text-transform:capitalize}
.next-heure{font-size:30px;font-weight:800;color:#F5C518;font-family:'Syne',sans-serif;margin:4px 0}
.next-datestr{font-size:13px;color:#7A8FA6;margin-bottom:10px}
.next-enc{display:flex;align-items:center;gap:8px;font-size:13px;color:#A8BDD4;margin-bottom:10px}
.next-countdown{font-size:13px;color:#F5C518;font-weight:600;margin-bottom:14px;background:rgba(245,197,24,0.1);border-radius:8px;padding:6px 10px;display:inline-block}
.btn-reminder{background:rgba(245,197,24,0.1);color:#F5C518;border:1px solid rgba(245,197,24,0.3);padding:8px 14px;border-radius:9px;cursor:pointer;font-size:12px;font-weight:600;transition:.2s;width:100%}
.btn-reminder:hover{background:rgba(245,197,24,0.2)}
.meetings-list{background:#1A2635;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:14px;margin-top:12px}
.ml-title{font-size:11px;font-weight:700;color:#7A8FA6;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}
.meeting-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05)}
.meeting-row:last-child{border-bottom:none}
.mr-dot{width:8px;height:8px;border-radius:50%;background:#2ecc71;flex-shrink:0}
.mr-date{font-size:13px;color:#E8EDF2;font-weight:500}
.mr-heure{font-size:12px;color:#7A8FA6}
.mr-status{margin-left:auto;font-size:16px}
.reminder-card{display:flex;align-items:center;gap:12px;background:rgba(245,197,24,0.08);border:1px solid rgba(245,197,24,0.2);border-radius:12px;padding:14px;margin-top:12px;font-size:12px}
.rem-title{font-weight:700;color:#F5C518;font-size:13px}
.rem-sub{color:#7A8FA6;margin-top:1px}
.mini-cancel{margin-left:auto;background:none;border:none;color:#7A8FA6;cursor:pointer;font-size:16px}
</style>