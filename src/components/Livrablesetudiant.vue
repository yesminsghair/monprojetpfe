<template>
<div class="page-content">

  <div class="page-header">
    <div>
      <h2>Mes livrables</h2>
      <p class="subtitle">Déposez vos documents — seules les phases activées par le chef sont accessibles</p>
    </div>
    <div class="kpi-row">
      <div class="kpi kpi-ok">
        <strong>{{ nValides }}</strong><span>Validé(s)</span>
      </div>
      <div class="kpi kpi-warn">
        <strong>{{ nAttente }}</strong><span>En attente</span>
      </div>
      <div class="kpi kpi-ko">
        <strong>{{ nRejetes }}</strong><span>Rejeté(s)</span>
      </div>
    </div>
  </div>

  <transition name="toast">
    <div v-if="toast.show" class="toast" :class="'toast-'+toast.type">
      {{ toast.msg }}
      <button @click="toast.show=false" class="toast-x">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  </transition>

  <!-- Loading state -->
  <div v-if="loading" class="loading-state">
    <div class="spinner"></div>
    <p>Chargement des phases...</p>
  </div>

  <!-- No active phases yet -->
  <div v-else-if="!phases.length" class="empty-state">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    <p>Aucune phase n'est encore activée par votre chef de département.</p>
    <p class="empty-sub">Vous serez notifié(e) dès qu'une phase sera ouverte.</p>
  </div>

  <!-- PHASES GRID -->
  <div class="phases-grid" v-else>
    <div v-for="phase in phases" :key="phase.id"
      class="phase-card"
      :class="{
        'pc-active': phase.active && !phase.terminee,
        'pc-done':   phase.terminee,
      }">

      <div class="pc-bar"></div>

      <div class="pc-top">
        <span class="pc-num">Phase {{ phase.ordre }}</span>
        <span class="pc-badge"
          :class="{
            'pb-active': phase.active && !phase.terminee,
            'pb-done':   phase.terminee,
          }">
          {{ phase.terminee ? 'Terminée' : 'En cours' }}
        </span>
      </div>

      <div class="pc-nom">{{ phase.nom }}</div>
      <div class="pc-dates">{{ phase.dateDebut }} — {{ phase.dateFin }}</div>

      <!-- No livrable required -->
      <div class="pc-no-lv" v-if="!phase.livrableObligatoire">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Aucun livrable requis pour cette phase
      </div>

      <!-- Livrable required -->
      <template v-if="phase.livrableObligatoire">

        <!-- Already submitted -->
        <div v-if="phase.livrable" class="lv-area">
          <div class="lv-file">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <div class="lv-info">
              <div class="lv-nom">{{ phase.livrable.fileName }}</div>
              <div class="lv-date">Déposé le {{ phase.livrable.dateDepot }}</div>
            </div>
          </div>
          <span class="lv-status"
            :class="{
              'ls-wait': phase.livrable.statut==='en_attente',
              'ls-ok':   phase.livrable.statut==='valide',
              'ls-ko':   phase.livrable.statut==='rejete',
            }">
            {{ {en_attente:'En attente',valide:'Validé',rejete:'Rejeté'}[phase.livrable.statut] || phase.livrable.statut }}
          </span>
          <!-- Rejection comment -->
          <div v-if="phase.livrable.statut==='rejete' && phase.livrable.commentaire" class="lv-comment">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {{ phase.livrable.commentaire }}
          </div>
          <!-- Replace (only if not validated and phase not terminated) -->
          <label v-if="phase.livrable.statut!=='valide' && !phase.terminee" :for="'f'+phase.id" class="btn-modifier">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Remplacer le fichier
          </label>
          <input type="file" :id="'f'+phase.id" accept="application/pdf" @change="upload($event,phase)" style="display:none"/>
        </div>

        <!-- No livrable yet -->
        <div v-else class="depot-area">
          <label v-if="!phase.terminee" :for="'f'+phase.id" class="btn-depot">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Déposer un livrable PDF
          </label>
          <div v-else class="lv-missed">⚠️ Phase terminée sans livrable déposé</div>
          <input type="file" :id="'f'+phase.id" accept="application/pdf" @change="upload($event,phase)" style="display:none"/>
        </div>

      </template>

      <!-- Done bar -->
      <div class="pc-done-bar" v-if="phase.terminee">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Phase complète
      </div>

    </div>
  </div>

</div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'LivrablesEtudiant',
  data() {
    return {
      toast: { show: false, msg: '', type: 'ok' },
      phases: [],
      loading: false
    }
  },
  computed: {
    nValides()  { return this.phases.filter(p => p.livrable?.statut === 'valide').length },
    nAttente()  { return this.phases.filter(p => p.livrable?.statut === 'en_attente').length },
    nRejetes()  { return this.phases.filter(p => p.livrable?.statut === 'rejete').length },
  },
  mounted() {
    this.chargerDonnees()
  },
  methods: {

    async chargerDonnees() {
      this.loading = true
      try {
        // GET /api/phases now returns ONLY active phases for non-chef users.
        // GET /api/livrables returns the student's own livrables.
        const [resPhases, resLivrables] = await Promise.all([
          api.get('/phases'),
          api.get('/livrables').catch(() => ({ data: [] }))
        ])

        // Build livrables map: phase_id → livrable data
        const livrablesMap = {}
        ;(resLivrables.data || []).forEach(l => {
          livrablesMap[l.phase_id] = {
            fileName:    l.fichier ? l.fichier.split('/').pop() : 'fichier.pdf',
            dateDepot:   this.formatDate(l.depose_le),
            statut:      l.statut,       // en_attente | valide | rejete
            commentaire: l.commentaire ?? null
          }
        })

        // Map phases — active=true is guaranteed by the API for non-chefs
        this.phases = (resPhases.data || []).map(p => ({
          id:                p.id,
          ordre:             p.ordre,
          nom:               p.nom,
          dateDebut:         this.formatDate(p.date_debut),
          dateFin:           this.formatDate(p.date_fin),
          active:            !!p.active,
          terminee:          !!p.terminee,
          livrableObligatoire: !!p.livrable_obligatoire,
          livrable:          livrablesMap[p.id] || null
        }))

      } catch (error) {
        console.error('Erreur livrables:', error)
        this.showToast('Erreur de chargement', 'err')
      } finally {
        this.loading = false
      }
    },

    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      if (isNaN(d)) return date
      return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
    },

    async upload(e, phase) {
      const file = e.target.files[0]
      if (!file || file.type !== 'application/pdf') {
        this.showToast('Fichier PDF uniquement', 'err')
        return
      }
      const formData = new FormData()
      formData.append('phase_id', phase.id)
      formData.append('fichier', file)

      try {
        await api.post('/livrables', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        await this.chargerDonnees()
        this.showToast(`Livrable déposé pour "${phase.nom}" ✓`)
      } catch (error) {
        this.showToast(error.response?.data?.message || 'Erreur lors du dépôt', 'err')
      }
      e.target.value = ''
    },

    showToast(msg, type = 'ok') {
      this.toast = { show: true, msg, type }
      setTimeout(() => (this.toast.show = false), 3200)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.page-content{font-family:'Source Sans 3',sans-serif;color:#1e2a35}
.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:16px;flex-wrap:wrap}
h2{font-family:'Merriweather',serif;font-size:1.4rem;font-weight:700;color:#1e2a35;margin-bottom:4px}
.subtitle{font-size:0.88rem;color:#8a9aaa;font-weight:300}
.kpi-row{display:flex;gap:12px;flex-wrap:wrap}
.kpi{display:flex;flex-direction:column;align-items:center;padding:10px 18px;border-radius:10px;border:1.5px solid;gap:2px}
.kpi strong{font-family:'Merriweather',serif;font-size:1.5rem;font-weight:700;line-height:1}
.kpi span{font-size:0.72rem;font-weight:500;text-transform:uppercase;letter-spacing:.04em}
.kpi-ok{background:#d4edda;border-color:#c3e6cb}.kpi-ok strong,.kpi-ok span{color:#155724}
.kpi-warn{background:#fff3cd;border-color:#ffc107}.kpi-warn strong,.kpi-warn span{color:#856404}
.kpi-ko{background:#f8d7da;border-color:#f5c6cb}.kpi-ko strong,.kpi-ko span{color:#721c24}
.toast{display:flex;justify-content:space-between;align-items:center;padding:11px 16px;border-radius:10px;margin-bottom:16px;font-size:0.88rem;font-weight:500;border:1.5px solid}
.toast-ok{background:#e8f5e9;color:#155724;border-color:#c3e6cb}
.toast-err{background:#f8d7da;color:#721c24;border-color:#f5c6cb}
.toast-x{background:none;border:none;cursor:pointer;color:inherit;opacity:.6;display:flex;align-items:center}
.toast-enter-active,.toast-leave-active{transition:all .25s}
.toast-enter-from,.toast-leave-to{opacity:0;transform:translateY(-6px)}
.loading-state{text-align:center;padding:60px;color:#8a9aaa}
.spinner{width:32px;height:32px;border:3px solid #c8c4bc;border-top-color:#3d6080;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-state{text-align:center;padding:60px 20px;color:#8a9aaa;background:#e8e4dc;border:2px dashed #c8c4bc;border-radius:14px}
.empty-state svg{opacity:.4;margin-bottom:16px}
.empty-state p{font-size:14px;margin-bottom:6px}
.empty-sub{font-size:12.5px;opacity:.7}
.phases-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.phase-card{background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:14px;overflow:hidden;position:relative;transition:.2s}
.phase-card:hover{box-shadow:0 6px 22px rgba(0,0,0,.1)}
.pc-bar{height:4px}
.pc-active .pc-bar{background:linear-gradient(90deg,#f5a623,#d98e1a)}
.pc-done   .pc-bar{background:linear-gradient(90deg,#27ae60,#1e8449)}
.pc-top{display:flex;justify-content:space-between;align-items:center;padding:14px 16px 0}
.pc-num{font-size:0.72rem;font-weight:700;color:#8a9aaa;text-transform:uppercase;letter-spacing:.06em}
.pc-badge{font-size:0.72rem;font-weight:700;padding:3px 10px;border-radius:20px}
.pb-active{background:#fff3cd;color:#856404;border:1px solid #ffc107}
.pb-done{background:#d4edda;color:#155724;border:1px solid #c3e6cb}
.pc-nom{font-family:'Merriweather',serif;font-size:0.9rem;font-weight:700;color:#1e2a35;padding:10px 16px 4px;line-height:1.4}
.pc-dates{font-size:0.78rem;color:#8a9aaa;font-weight:300;padding:0 16px 14px}
.pc-no-lv{display:flex;align-items:center;gap:7px;font-size:0.8rem;color:#155724;background:#d4edda;border-top:1px solid #c3e6cb;padding:10px 14px}
.depot-area{padding:0 16px 16px}
.btn-depot{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:11px;background:linear-gradient(160deg,#f5a623,#d98e1a);color:#1e2a35;border-radius:9px;font-size:0.85rem;font-weight:700;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.2s;box-shadow:0 3px 10px rgba(245,166,35,.25)}
.btn-depot:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(245,166,35,.35)}
.lv-missed{font-size:0.82rem;color:#721c24;background:#f8d7da;border:1px solid #f5c6cb;border-radius:9px;padding:10px;text-align:center}
.lv-area{padding:0 16px 14px;display:flex;flex-direction:column;gap:8px}
.lv-file{display:flex;align-items:center;gap:10px;background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:9px;padding:10px 12px}
.lv-info{flex:1;min-width:0}
.lv-nom{font-size:0.85rem;font-weight:600;color:#1e2a35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lv-date{font-size:0.75rem;color:#8a9aaa}
.lv-status{font-size:0.78rem;font-weight:700;padding:4px 12px;border-radius:20px;text-align:center}
.ls-wait{background:#fff3cd;color:#856404;border:1px solid #ffc107}
.ls-ok{background:#d4edda;color:#155724;border:1px solid #c3e6cb}
.ls-ko{background:#f8d7da;color:#721c24;border:1px solid #f5c6cb}
.lv-comment{font-size:0.8rem;color:#721c24;background:#f8d7da;border:1px solid #f5c6cb;border-radius:8px;padding:8px 10px;display:flex;align-items:flex-start;gap:6px}
.btn-modifier{display:flex;align-items:center;justify-content:center;gap:7px;padding:8px;background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:9px;font-size:0.82rem;font-weight:600;color:#4a5a6a;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.18s}
.btn-modifier:hover{border-color:#3d6080;color:#3d6080}
.pc-done-bar{display:flex;align-items:center;gap:7px;font-size:0.8rem;font-weight:700;color:#155724;background:#d4edda;border-top:1px solid #c3e6cb;padding:10px 14px}
</style>