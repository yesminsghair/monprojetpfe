<template>
  <div class="page-content">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h2>Calendrier de soutenance</h2>
        <p class="subtitle">Vos sessions planifiées</p>
      </div>
      <div class="week-switcher">
        <button class="wsw-btn" @click="semainePrecedente" title="Semaine précédente">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="wsw-label">
          <span class="wsw-sem">Sem. {{ weekNum }}</span>
          <span class="wsw-range">{{ weekRangeLabel }}</span>
        </div>
        <button class="wsw-btn" @click="semaineSuivante" title="Semaine suivante">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="empty-state">
      <div class="spinner-sm" style="margin:0 auto 10px;width:28px;height:28px;border-width:3px;"></div>
      <p>Chargement…</p>
    </div>

    <template v-else>

      <!-- SECTION TITLE -->
      <div class="section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
        Calendrier hebdomadaire
        <span v-if="sessionsInWeek.length" class="title-count">{{ sessionsInWeek.length }}</span>
      </div>

      <!-- CALENDAR -->
      <div class="calendar-card">
        <div class="cal-scroll">
          <table class="cal-table">
            <thead>
              <tr>
                <th class="cal-th-time"></th>
                <th
                  v-for="j in jours"
                  :key="j.key"
                  class="cal-th-day"
                  :class="{ 'is-today': isToday(j.date) }"
                >
                  <div class="cal-day-name">{{ j.nom }}</div>
                  <div class="cal-day-num" :class="{ 'today-num': isToday(j.date) }">{{ j.date.getDate() }}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="heure in heures" :key="heure">
                <td class="cal-time-cell">{{ heure }}</td>
                <td
                  v-for="j in jours"
                  :key="j.key"
                  class="cal-cell"
                  :class="cellClass(j, heure)"
                >
                  <div v-if="getSession(j, heure)" class="booked-pip">
                    <span class="booked-initials" :class="sessionBadgeClass(getSession(j, heure))">
                      {{ sessionInitials(getSession(j, heure)) }}
                    </span>
                  </div>
                  <div v-else-if="isPast(j, heure)" class="past-pip">–</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="cal-legend">
          <span class="leg-item"><span class="leg-dot ld-blue"></span>Encadrant</span>
          <span class="leg-item"><span class="leg-dot ld-purple"></span>Président</span>
          <span class="leg-item"><span class="leg-dot ld-grey"></span>Examinateur</span>
          <span class="leg-item"><span class="leg-dot ld-yellow"></span>Plan en attente</span>
          <span class="leg-item"><span class="leg-dot ld-green"></span>Plan approuvé</span>
          <!-- Plan rejeté no longer shown in calendar (hidden after rejection) -->
          <span class="leg-item"><span class="leg-dot ld-past"></span>Passé</span>
        </div>
      </div>

      <!-- SESSIONS LIST below calendar -->
      <div class="section-title" style="margin-top:22px">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        Soutenances de la semaine
        <span v-if="sessionsInWeek.length" class="title-count">{{ sessionsInWeek.length }}</span>
      </div>

      <div v-if="!sessionsInWeek.length" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
        <p>Aucune soutenance cette semaine</p>
      </div>

      <div v-else class="reunions-grid">
        <div
          v-for="s in sessionsInWeek"
          :key="s.id"
          class="rcard"
          :class="s.type === 'plan' ? 'rcard-plan rcard-plan--' + s.statut : 'rcard-' + s.role"
        >
          <div class="rcard-border"></div>
          <div class="rcard-inner">
            <div class="rcard-av" :style="dateBlockStyle(s.date)">
              <div class="rcard-av-day">{{ formatDay(s.date) }}</div>
              <div class="rcard-av-mon">{{ formatMonth(s.date) }}</div>
            </div>
            <div class="rcard-body">
              <div class="rcard-nom">{{ s.projet }}</div>
              <div class="rcard-date">
                {{ s.heure_debut }}<span v-if="s.heure_fin"> – {{ s.heure_fin }}</span>
                <span v-if="s.salle" class="rcard-lieu"> · Salle {{ s.salle }}</span>
              </div>
              <div v-if="s.etudiant" class="rcard-etudiant">{{ s.etudiant }}</div>
              <div v-if="s.type === 'plan'" class="rcard-plan-hint">Proposition de créneau</div>
            </div>
            <div class="rcard-right">
              <!-- Confirmed session: show role + évalué badges -->
              <template v-if="s.type !== 'plan'">
                <span class="rcard-badge" :class="roleBadgeClass(s.role)">{{ roleLabel(s.role) }}</span>
                <span class="rcard-badge" :class="s.evalue ? 'badge-evalue' : 'badge-aevaluer'">
                  {{ s.evalue ? 'Évalué' : 'À évaluer' }}
                </span>
              </template>
              <!-- Plan: show statut badge (yellow / green / red) -->
              <template v-else>
                <span class="rcard-badge" :class="planStatutBadgeClass(s.statut)">
                  {{ planStatutLabel(s.statut) }}
                </span>
              </template>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script>
import api from '@/services/api.js'

const ROLE_LABELS = { encadrant: 'Encadrant', president: 'Président', examinateur: 'Examinateur' }

const DATE_COLORS = [
  { bg: '#2f4f6a', text: '#fff' },
  { bg: '#1e6b5e', text: '#fff' },
  { bg: '#5a4a8a', text: '#fff' },
  { bg: '#7a3d5a', text: '#fff' },
  { bg: '#3d6b3d', text: '#fff' },
  { bg: '#7a5a2a', text: '#fff' },
  { bg: '#2a5a7a', text: '#fff' },
]

function dateColor(dateStr) {
  const d = new Date(dateStr)
  return DATE_COLORS[isNaN(d) ? 0 : d.getDate() % DATE_COLORS.length]
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
}

export default {
  name: 'CalendrierSoutenance',
  emits: ['toast'],

  props: {
    currentUser: { type: Object, required: true },
  },

  data() {
    const today = new Date()
    // Start week on Monday
    const day = today.getDay() || 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - day + 1)
    monday.setHours(0, 0, 0, 0)
    return {
      sessions:  [],
      loading:   false,
      weekStart: monday,
      jourNoms:  ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],  // Lundi–Vendredi uniquement
      heures:    ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'],
    }
  },

  computed: {
    jours() {
      return this.jourNoms.map((nom, i) => {
        const d = new Date(this.weekStart)
        d.setDate(this.weekStart.getDate() + i)
        return { nom, date: d, key: d.toDateString() }
      })
    },

    weekNum() {
      return getWeekNumber(this.weekStart)
    },

    weekRangeLabel() {
      const end = new Date(this.weekStart)
      end.setDate(end.getDate() + 4)  // Mon + 4 = Fri
      const fmt = d => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
      return `${fmt(this.weekStart)} – ${fmt(end)}`
    },

    sessionsInWeek() {
      const keys = new Set(this.jours.map(j => j.key))
      return this.sessions.filter(s => keys.has(new Date(s.date).toDateString()))
    },
  },

  async mounted() {
    await this.charger()
  },

  methods: {
    async charger() {
      this.loading = true
      try {
        const userId   = this.currentUser.id
        const userRole = (this.currentUser.role || '').toLowerCase()

        // ── 1. Confirmed soutenances the user is involved in ──────────
        const juryRes = await api.get('/jurys-pfe')
        const sessions = []

        for (const j of (juryRes.data || [])) {
          if (!j.date_soutenance) continue

          // Student: only their own soutenance
          if (userRole === 'etudiant') {
            const etudiantId = j.projet?.etudiant_id ?? j.etudiant_id
            if (etudiantId === userId) {
              sessions.push(this.buildSession(j, 'etudiant'))
            }
            continue
          }

          // Teacher: check encadrant (on projet or direct field) then jury members
          // Backend returns encadrant_id either at j.encadrant_id or j.projet.encadrant_id
          const encadrantId = j.projet?.encadrant_id ?? j.encadrant_id
          if (encadrantId === userId) {
            sessions.push(this.buildSession(j, 'encadrant')); continue
          }
          // membre.fonction is the correct field (not membre.role)
          const membre = (j.membres || []).find(m =>
            m.enseignant_id === userId || m.id === userId || m.utilisateur_id === userId
          )
          if (membre) {
            // Use membre.fonction (president|examinateur|encadrant); fall back to examinateur
            sessions.push(this.buildSession(j, membre.fonction || membre.role || 'examinateur'))
          }
        }

        // ── 2. Proposed plans (own plans) ─────────────────────────────
        // Only show en_attente and approuve — exclude rejete (and skip deleted ones)
        try {
          const planRes  = await api.get('/plans-soutenance')
          const rawPlans = (planRes.data || []).filter(p =>
            p.proposant_id === userId && p.statut !== 'rejete'
          )
          for (const p of rawPlans) {
            const rawDate = p.date
              ? (p.date.includes('T') ? p.date.substring(0, 10) : p.date)
              : null
            if (!rawDate) continue
            // Skip if there is already a confirmed session for the same soutenance
            if (p.soutenance_id && sessions.some(s => s.id === p.soutenance_id)) continue
            sessions.push({
              id:          'plan-' + p.id,
              planId:      p.id,
              type:        'plan',
              statut:      p.statut || 'en_attente',
              date:        rawDate,
              heure_debut: (p.heure_debut || '').substring(0, 5),
              heure_fin:   (p.heure_fin   || '').substring(0, 5),
              salle:       p.salle || '',
              projet:      p.projet_titre || '—',
              etudiant:    '',
              evalue:      false,
              role:        'plan',
            })
          }
        } catch { /* plans endpoint failure is non-fatal */ }

        sessions.sort((a, b) => new Date(a.date) - new Date(b.date))
        this.sessions = sessions
      } catch {
        this.sessions = []
      } finally {
        this.loading = false
      }
    },

    buildSession(j, role) {
      return {
        id:          j.id,
        date:        j.date_soutenance,
        heure_debut: (j.heure_debut || '').substring(0, 5),
        heure_fin:   (j.heure_fin   || '').substring(0, 5),
        salle:       j.salle        || '',
        projet:      j.projet_titre || '—',
        etudiant:    j.etudiant_nom || '—',
        evalue:      false,
        role,
      }
    },

    getSession(j, heure) {
      return this.sessions.find(s => {
        if (new Date(s.date).toDateString() !== j.key) return false
        return s.heure_debut === heure || (s.heure_debut < heure && s.heure_fin > heure)
      }) || null
    },

    cellClass(j, heure) {
      const s = this.getSession(j, heure)
      if (s) {
        if (s.type === 'plan') return 'cal-session-plan-' + s.statut
        return 'cal-session-' + s.role
      }
      if (this.isPast(j, heure)) return 'cal-past'
      return 'cal-empty'
    },

    sessionBadgeClass(s) {
      if (s?.type === 'plan') return 'initials-plan-' + s.statut
      return 'initials-' + (s?.role || 'examinateur')
    },

    sessionInitials(s) {
      if (!s) return ''
      return (s.etudiant || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    },

    isPast(j, heure) {
      const dt = new Date(j.date)
      const [h, m] = heure.split(':').map(Number)
      dt.setHours(h, m, 0, 0)
      return dt < new Date()
    },

    isToday(date) {
      const t = new Date()
      return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear()
    },

    semainePrecedente() {
      const d = new Date(this.weekStart); d.setDate(d.getDate() - 7); this.weekStart = d
    },
    semaineSuivante() {
      const d = new Date(this.weekStart); d.setDate(d.getDate() + 7); this.weekStart = d
    },

    roleLabel(role)      { return ROLE_LABELS[role] || role || '—' },
    planStatutLabel(s) {
      return s === 'approuve' ? 'Approuvé' : s === 'rejete' ? 'Rejeté' : 'En attente'
    },
    planStatutBadgeClass(s) {
      return s === 'approuve' ? 'badge-plan-approuve' : s === 'rejete' ? 'badge-plan-rejete' : 'badge-plan-attente'
    },
    dateBlockStyle(dateStr) {
      const c = dateColor(dateStr)
      return { background: c.bg, color: c.text }
    },
    formatDay(d)   { return d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric' }) : '—' },
    formatMonth(d) { return d ? new Date(d).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase() : '' },

    roleBadgeClass(role) {
      return { encadrant: 'badge-encadrant', president: 'badge-president', examinateur: 'badge-examinateur' }[role] || 'badge-examinateur'
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }
.page-content { font-family: 'Source Sans 3', sans-serif; color: #1e2a35; }

/* ── HEADER ── */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; gap: 16px; flex-wrap: wrap; }
h2 { font-family: 'Merriweather', serif; font-size: 1.4rem; font-weight: 700; color: #1e2a35; margin-bottom: 3px; }
.subtitle { font-size: 0.87rem; color: #8a9aaa; font-weight: 300; }

/* ── WEEK SWITCHER ── */
.week-switcher { display: flex; align-items: center; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 12px; overflow: hidden; }
.wsw-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 52px; background: none; border: none; cursor: pointer; color: #2f4f6a; transition: background .15s, color .15s; flex-shrink: 0; }
.wsw-btn:hover { background: #f5a623; color: #1e2a35; }
.wsw-label { display: flex; flex-direction: column; align-items: center; padding: 6px 20px; border-left: 1px solid #c8c4bc; border-right: 1px solid #c8c4bc; min-width: 138px; }
.wsw-sem { font-size: 0.63rem; font-weight: 700; color: #f5a623; text-transform: uppercase; letter-spacing: .1em; }
.wsw-range { font-family: 'Merriweather', serif; font-size: 0.84rem; font-weight: 700; color: #1e2a35; margin-top: 2px; white-space: nowrap; }

/* ── SECTION TITLE ── */
.section-title { display: flex; align-items: center; gap: 7px; font-size: 0.71rem; font-weight: 700; color: #2f4f6a; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 10px; padding-bottom: 7px; border-bottom: 1.5px solid #c8c4bc; }
.title-count { margin-left: auto; background: #f5a623; color: #1e2a35; font-size: 0.68rem; font-weight: 700; padding: 1px 8px; border-radius: 20px; }

/* ── CALENDAR ── */
.calendar-card { background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 14px; overflow: hidden; margin-bottom: 16px; }
.cal-scroll { overflow-x: auto; }
.cal-table { width: 100%; border-collapse: collapse; min-width: 500px; }
.cal-th-time { width: 58px; background: #2f4f6a; }
.cal-th-day { padding: 12px 6px 10px; text-align: center; background: #2f4f6a; border-left: 1px solid rgba(255,255,255,.08); }
.cal-th-day.is-today { background: #4a7090; }
.cal-day-name { font-size: 0.65rem; font-weight: 700; color: rgba(255,255,255,.55); text-transform: uppercase; letter-spacing: .08em; }
.cal-day-num { font-family: 'Merriweather', serif; font-size: 1rem; font-weight: 700; color: #fff; margin-top: 3px; line-height: 1; }
.today-num { display: inline-flex; align-items: center; justify-content: center; background: #f5a623; color: #1e2a35; width: 28px; height: 28px; border-radius: 50%; font-size: 0.85rem; }
.cal-time-cell { font-size: 0.68rem; font-weight: 700; color: #8a9aaa; text-align: right; padding: 0 10px; background: #ddd9d1; border-right: 1.5px solid #c8c4bc; width: 58px; white-space: nowrap; }
.cal-cell { height: 40px; width: 80px; text-align: center; vertical-align: middle; border: 1px solid #d4d0c8; cursor: default; transition: background .12s; }

/* Session colors by role */
.cal-session-encadrant   { background: rgba(47,79,106,.22); cursor: default; }
.cal-session-president   { background: rgba(90,74,138,.22); cursor: default; }
.cal-session-examinateur { background: rgba(138,154,170,.25); cursor: default; }

.cal-empty { cursor: default; }
.cal-past { background: repeating-linear-gradient(135deg, #e8e4dc, #e8e4dc 4px, #d4d0c8 4px, #d4d0c8 8px); opacity: .6; }
.past-pip { font-size: 0.7rem; color: #b0b8c4; font-weight: 700; line-height: 1; }

.booked-pip { display: flex; align-items: center; justify-content: center; }
.booked-initials { font-size: 0.62rem; font-weight: 700; padding: 2px 5px; border-radius: 6px; }
.initials-encadrant   { color: #1e3a52; background: rgba(47,79,106,.3); }
.initials-president   { color: #3a2a70; background: rgba(90,74,138,.3); }
.initials-examinateur { color: #4a5a6a; background: rgba(138,154,170,.4); }

.cal-legend { display: flex; align-items: center; gap: 16px; padding: 8px 14px; border-top: 1px solid #c8c4bc; background: #ddd9d1; flex-wrap: wrap; }
.leg-item { display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: #8a9aaa; }
.leg-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.ld-blue   { background: rgba(47,79,106,.5);  border: 1px solid rgba(47,79,106,.6); }
.ld-purple { background: rgba(90,74,138,.5);  border: 1px solid rgba(90,74,138,.6); }
.ld-grey   { background: rgba(138,154,170,.5); border: 1px solid rgba(138,154,170,.7); }
.ld-past   { background: repeating-linear-gradient(135deg, #c8c4bc, #c8c4bc 3px, #e8e4dc 3px, #e8e4dc 6px); border: 1px solid #b0b8c4; }

/* ── EMPTY / LOADING STATE ── */
.empty-state { text-align: center; padding: 36px 20px; color: #8a9aaa; background: #e8e4dc; border: 2px dashed #c8c4bc; border-radius: 12px; }
.empty-state svg { opacity: .35; margin-bottom: 10px; }
.empty-state p { font-size: 0.86rem; }
.spinner-sm { border: 2px solid rgba(30,42,53,.3); border-top-color: #1e2a35; border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── SESSION CARDS GRID ── */
.reunions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px; }
.rcard { background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 14px; overflow: hidden; transition: box-shadow .2s, transform .15s; display: flex; }
.rcard:hover { box-shadow: 0 5px 20px rgba(0,0,0,.1); transform: translateY(-2px); }

.rcard-border { width: 5px; flex-shrink: 0; }
.rcard-encadrant   .rcard-border { background: #2f4f6a; }
.rcard-president   .rcard-border { background: #5a4a8a; }
.rcard-examinateur .rcard-border { background: #8a9aaa; }

.rcard-inner { display: flex; align-items: center; gap: 12px; padding: 13px 13px 13px 12px; flex: 1; min-width: 0; }

.rcard-av { flex-shrink: 0; width: 44px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 7px 4px; }
.rcard-av-day { font-family: 'Merriweather', serif; font-size: 1.1rem; font-weight: 700; line-height: 1; }
.rcard-av-mon { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; margin-top: 2px; opacity: .8; }

.rcard-body { flex: 1; min-width: 0; }
.rcard-nom      { font-weight: 700; font-size: 0.86rem; color: #1e2a35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
.rcard-date     { font-size: 0.76rem; color: #8a9aaa; margin-bottom: 2px; }
.rcard-lieu     { color: #4a7090; }
.rcard-etudiant { font-size: 0.74rem; color: #4a5a6a; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.rcard-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
.rcard-badge { font-size: 0.69rem; font-weight: 700; padding: 3px 11px; border-radius: 20px; white-space: nowrap; }

.badge-encadrant   { background: rgba(47,79,106,.14);  color: #1e3a52;  border: 1px solid rgba(47,79,106,.35); }
.badge-president   { background: rgba(90,74,138,.14);  color: #3a2a70;  border: 1px solid rgba(90,74,138,.35); }
.badge-examinateur { background: rgba(138,154,170,.2); color: #4a5a6a;  border: 1px solid rgba(138,154,170,.5); }
/* Plan statut cell colors */
.cal-session-plan-en_attente { background: rgba(245,166,35,.22); cursor: default; }
.cal-session-plan-approuve   { background: rgba(30,158,96,.22);  cursor: default; }
.cal-session-plan-rejete     { background: rgba(217,64,64,.18);  cursor: default; }

/* Plan statut initials bubble */
.initials-plan-en_attente { color: #7a4a00; background: rgba(245,166,35,.35); }
.initials-plan-approuve   { color: #0b5e30; background: rgba(30,158,96,.30);  }
.initials-plan-rejete     { color: #7a1c1c; background: rgba(217,64,64,.28);  }

/* Plan statut legend dots */
.ld-yellow { background: rgba(245,166,35,.6);  border: 1px solid rgba(245,166,35,.8); }
.ld-green  { background: rgba(30,158,96,.55);  border: 1px solid rgba(30,158,96,.7);  }
.ld-red    { background: rgba(217,64,64,.45);  border: 1px solid rgba(217,64,64,.6);  }

/* Plan statut badges on cards */
.badge-plan-attente  { background: rgba(245,166,35,.18); color: #8b4500;  border: 1px solid rgba(245,166,35,.45); }
.badge-plan-approuve { background: rgba(30,158,96,.18);  color: #0b6e40;  border: 1px solid rgba(30,158,96,.40);  }
.badge-plan-rejete   { background: rgba(217,64,64,.14);  color: #9b1c1c;  border: 1px solid rgba(217,64,64,.40);  }

/* Plan card border colors */
.rcard-plan--en_attente .rcard-border { background: #f5a623; }
.rcard-plan--approuve   .rcard-border { background: #1e9e60; }
.rcard-plan--rejete     .rcard-border { background: #d94040; }

/* Plan hint text */
.rcard-plan-hint { font-size: 0.72rem; color: #8a9aaa; font-style: italic; margin-top: 2px; }
</style>