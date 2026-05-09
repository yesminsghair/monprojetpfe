<template>
  <div class="page-content">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <span class="header-icon">⚖️</span>
        <div>
          <h2>Délibération &amp; Résultats finaux</h2>
          <p class="subtitle">Calculer les notes, publier les résultats, ajouter à la bibliothèque ou archiver</p>
        </div>
      </div>
      <div class="header-actions">
        <input v-model="searchDelib" class="search-input" placeholder="Rechercher un étudiant…" />
        <button class="btn-gold" @click="publierTous" :disabled="loadingPublier || !resultatsAdmis.length">
          <svg v-if="!loadingPublier" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
          <div v-else class="spinner-sm"></div>
          Publier tous les résultats
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-bar" v-if="resultats.length">
      <div class="stat-card"><span class="stat-val">{{ resultats.length }}</span><span class="stat-label">Total</span></div>
      <div class="stat-card stat-card-ok"><span class="stat-val">{{ resultats.filter(r=>r.decision==='admis').length }}</span><span class="stat-label">Admis</span></div>
      <div class="stat-card stat-card-err"><span class="stat-val">{{ resultats.filter(r=>r.decision==='ajourne').length }}</span><span class="stat-label">Ajournés</span></div>
      <div class="stat-card stat-card-blue"><span class="stat-val">{{ resultats.filter(r=>r.publie).length }}</span><span class="stat-label">Publiés</span></div>
      <div class="stat-card stat-card-purple"><span class="stat-val">{{ resultats.filter(r=>r.en_biblio).length }}</span><span class="stat-label">En bibliothèque</span></div>
    </div>

    <!-- Loading -->
    <div v-if="loadingResultats" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement…</p>
    </div>

    <template v-else>

      <!-- ── Prêts à délibérer ────────────────────────────── -->
      <div v-if="projetsPretsADeliberer.length">
        <div class="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          En attente de délibération ({{ projetsPretsADeliberer.length }})
        </div>
        <div class="table-wrapper" style="margin-bottom:24px">
          <table class="table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Projet</th>
                <th class="th-center">Note Président</th>
                <th class="th-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in projetsPretsADeliberer" :key="p.jury_id">
                <td>
                  <div class="u-nom">{{ p.etudiant_nom }}</div>
                  <div class="u-mat">{{ p.matricule }}</div>
                </td>
                <td><span class="projet-titre-cell">{{ p.projet_titre }}</span></td>
                <td class="td-center">
                  <span class="badge-moyenne" :class="moyenneClass(p.note_president)">{{ p.note_president }}/20</span>
                </td>
                <td class="td-center">
                  <button class="btn-deliberer" @click="deliberer(p)" :disabled="p.loading">
                    <div v-if="p.loading" class="spinner-sm"></div>
                    <span v-else>⚖ Délibérer</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Résultats délibérés ──────────────────────────── -->
      <div v-if="!resultatsFiltered.length && !projetsPretsADeliberer.length" class="empty-state">
        <div class="empty-icon">⚖️</div>
        <p>Aucun résultat disponible. Les délibérations apparaîtront ici une fois que le président a soumis sa fiche d'évaluation.</p>
      </div>

      <div v-if="resultatsFiltered.length">
        <div class="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Résultats délibérés ({{ resultatsFiltered.length }})
        </div>
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Projet</th>
                <th class="th-center">Note /20</th>
                <th class="th-center">Mention</th>
                <th class="th-center">Décision</th>
                <th class="th-center">Statut</th>
                <th class="th-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in resultatsFiltered" :key="r.id"
                  :class="{'row-admis': r.decision==='admis', 'row-ajourne': r.decision==='ajourne'}">
                <td><div class="u-nom">{{ r.etudiant_nom }}</div></td>
                <td><span class="projet-titre-cell">{{ r.projet_titre }}</span></td>
                <td class="td-center">
                  <span class="badge-note-final" :class="noteClass(r.note_finale)">{{ r.note_finale }}/20</span>
                </td>
                <td class="td-center">
                  <span class="mention-chip" :class="mentionClass(r.mention)">{{ r.mention }}</span>
                </td>
                <td class="td-center">
                  <span class="decision-chip" :class="r.decision==='admis'?'chip-admis':'chip-ajourne'">
                    {{ r.decision === 'admis' ? '✓ Admis' : '✗ Ajourné' }}
                  </span>
                </td>
                <td class="td-center">
                  <span v-if="r.publie" class="badge-publie">📢 Publié</span>
                  <span v-else class="badge-non-publie">Brouillon</span>
                  <span v-if="r.en_biblio" class="badge-biblio">📚 Biblio</span>
                  <span v-if="r.archive" class="badge-archive">🗄 Archivé</span>
                </td>
                <td class="td-actions td-center">
                  <button v-if="!r.publie" class="btn-icon btn-publish" @click="publierResultat(r)" title="Publier">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                  <button v-if="r.publie && r.decision==='admis' && r.note_finale>=16 && !r.en_biblio"
                          class="btn-icon btn-biblio" @click="ajouterBiblio(r)" title="Ajouter à la bibliothèque">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  </button>
                  <button v-if="r.publie && !r.archive" class="btn-icon btn-archive" @click="archiverResultat(r)" title="Archiver">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'DeliberationResultats',
  emits: ['toast'],

  data() {
    return {
      loadingResultats: false,
      loadingPublier:   false,
      resultats:                [],
      projetsPretsADeliberer:   [],
      searchDelib:              '',
    }
  },

  computed: {
    resultatsAdmis() {
      return this.resultats.filter(r => !r.publie)
    },
    resultatsFiltered() {
      if (!this.searchDelib) return this.resultats
      const q = this.searchDelib.toLowerCase()
      return this.resultats.filter(r =>
        r.etudiant_nom.toLowerCase().includes(q) ||
        (r.projet_titre || '').toLowerCase().includes(q)
      )
    },
  },

  mounted() {
    this.chargerResultats()
  },

  methods: {

    async chargerResultats() {
      this.loadingResultats = true
      try {
        const [resRes, pretsRes] = await Promise.all([
          api.get('/resultats-pfe'),
          api.get('/jurys-pfe/prets-a-deliberer'),
        ])
        this.resultats = resRes.data || []
        this.projetsPretsADeliberer = (pretsRes.data || []).map(p => ({ ...p, loading: false }))
      } catch (e) {
        this.$emit('toast', { type: 'toast-err', message: 'Erreur chargement des résultats.' })
      } finally {
        this.loadingResultats = false
      }
    },

    async deliberer(projet) {
      projet.loading = true
      try {
        const { data } = await api.post(`/jurys-pfe/${projet.jury_id}/deliberer`)
        this.resultats.unshift({
          id:           data.id,
          jury_id:      projet.jury_id,
          etudiant_nom: projet.etudiant_nom,
          projet_titre: projet.projet_titre,
          note_finale:  data.note_finale,
          mention:      data.mention,
          decision:     data.decision,
          publie:       false,
          en_biblio:    false,
          archive:      false,
        })
        this.projetsPretsADeliberer = this.projetsPretsADeliberer.filter(p => p.jury_id !== projet.jury_id)
        this.$emit('toast', {
          type: 'toast-ok',
          message: `Délibération enregistrée — ${projet.etudiant_nom} : ${data.note_finale}/20`
        })
      } catch (e) {
        this.$emit('toast', {
          type: 'toast-err',
          message: e.response?.data?.message || 'Erreur lors de la délibération.'
        })
      } finally {
        projet.loading = false
      }
    },

    async publierResultat(r) {
      try {
        await api.post(`/jurys-pfe/${r.jury_id}/publier`)
        r.publie = true
        this.$emit('toast', { type: 'toast-ok', message: `Résultat publié — ${r.etudiant_nom} notifié.` })
      } catch (e) {
        this.$emit('toast', { type: 'toast-err', message: 'Erreur lors de la publication.' })
      }
    },

    async publierTous() {
      this.loadingPublier = true
      try {
        await api.post('/resultats-pfe/publier-tous')
        this.resultats.forEach(r => { r.publie = true })
        this.$emit('toast', { type: 'toast-ok', message: 'Tous les résultats ont été publiés.' })
      } catch (e) {
        this.$emit('toast', { type: 'toast-err', message: 'Erreur lors de la publication globale.' })
      } finally {
        this.loadingPublier = false
      }
    },

    async ajouterBiblio(r) {
      try {
        await api.post(`/resultats-pfe/${r.id}/bibliotheque`)
        r.en_biblio = true
        this.$emit('toast', { type: 'toast-ok', message: `${r.etudiant_nom} ajouté à la bibliothèque PFE.` })
      } catch (e) {
        this.$emit('toast', { type: 'toast-err', message: 'Erreur.' })
      }
    },

    async archiverResultat(r) {
      try {
        await api.post(`/resultats-pfe/${r.id}/archiver`)
        r.archive = true
        this.$emit('toast', { type: 'toast-ok', message: `Résultat de ${r.etudiant_nom} archivé.` })
      } catch (e) {
        this.$emit('toast', { type: 'toast-err', message: 'Erreur.' })
      }
    },

    // Style helpers
    moyenneClass(n) {
      if (n >= 16) return 'moy-tb'
      if (n >= 14) return 'moy-b'
      if (n >= 12) return 'moy-ab'
      if (n >= 10) return 'moy-p'
      return 'moy-aj'
    },
    noteClass(n) {
      if (n >= 14) return 'note-good'
      if (n >= 10) return 'note-ok'
      return 'note-bad'
    },
    mentionClass(m) {
      return { 'Très bien': 'mention-tb', 'Bien': 'mention-b', 'Assez bien': 'mention-ab', 'Passable': 'mention-p', 'Insuffisant': 'mention-aj' }[m] || ''
    },
  },
}
</script>

<style scoped>
.page-content { padding: 0; }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; align-items: center; gap: 12px; }
.header-icon { font-size: 22px; }
.page-header h2 { font-size: 18px; font-weight: 700; margin: 0 0 3px; color: var(--text, #2a2520); }
.subtitle { font-size: 12px; color: var(--text-muted, #8a8070); margin: 0; }
.header-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.search-input { padding: 8px 12px; border: 1px solid var(--border, #e8e4dc); border-radius: 8px; font-size: 12.5px; background: var(--bg-card, #fff); color: var(--text, #2a2520); width: 200px; }
.search-input:focus { outline: none; border-color: var(--accent, #c8a84b); }
.btn-gold { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--accent, #c8a84b); color: #fff; border: none; border-radius: 8px; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
.btn-gold:hover:not(:disabled) { opacity: 0.88; }
.btn-gold:disabled { opacity: 0.45; cursor: not-allowed; }

.stats-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.stat-card { background: var(--bg-card, #fff); border: 1px solid var(--border, #e8e4dc); border-radius: 10px; padding: 12px 16px; display: flex; flex-direction: column; align-items: center; min-width: 80px; }
.stat-val { font-size: 20px; font-weight: 800; color: var(--text, #2a2520); }
.stat-label { font-size: 10px; color: var(--text-muted, #8a8070); text-align: center; margin-top: 2px; }
.stat-card-ok  { border-color: #27ae6044; background: #27ae6008; } .stat-card-ok .stat-val { color: #27ae60; }
.stat-card-err  { border-color: #e74c3c44; background: #e74c3c08; } .stat-card-err .stat-val { color: #e74c3c; }
.stat-card-blue { border-color: #3498db44; background: #3498db08; } .stat-card-blue .stat-val { color: #3498db; }
.stat-card-purple { border-color: #9b59b644; background: #9b59b608; } .stat-card-purple .stat-val { color: #9b59b6; }

.section-title { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; color: var(--text, #2a2520); margin-bottom: 10px; }
.table-wrapper { background: var(--bg-card, #fff); border: 1px solid var(--border, #e8e4dc); border-radius: 12px; overflow: hidden; }
.table { width: 100%; border-collapse: collapse; }
.table thead th { background: var(--bg-subtle, #fdf9f2); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted, #8a8070); padding: 10px 14px; border-bottom: 1px solid var(--border, #e8e4dc); white-space: nowrap; }
.table tbody tr { transition: background 0.12s; }
.table tbody tr:hover { background: var(--bg-hover, #faf8f3); }
.table tbody td { padding: 11px 14px; font-size: 13px; color: var(--text, #2a2520); border-bottom: 1px solid var(--border, #e8e4dc); }
.table tbody tr:last-child td { border-bottom: none; }
.th-center, .td-center { text-align: center; }
.row-admis  { background: #27ae6006; }
.row-ajourne{ background: #e74c3c06; }
.u-nom { font-weight: 600; font-size: 13px; }
.u-mat { font-size: 10.5px; color: var(--text-muted, #8a8070); }
.projet-titre-cell { font-size: 12px; color: var(--text-muted, #8a8070); }

.badge-moyenne { font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 8px; }
.moy-tb { background: #9b59b622; color: #9b59b6; } .moy-b { background: #3498db22; color: #3498db; }
.moy-ab { background: #27ae6022; color: #27ae60; } .moy-p { background: #f39c1222; color: #e67e22; }
.moy-aj { background: #e74c3c22; color: #e74c3c; }

.badge-note-final { font-size: 13px; font-weight: 800; padding: 4px 10px; border-radius: 8px; }
.note-good { background: #27ae6022; color: #27ae60; } .note-ok { background: #f39c1222; color: #e67e22; } .note-bad { background: #e74c3c22; color: #e74c3c; }
.mention-chip { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 8px; }
.mention-tb { background: #9b59b622; color: #9b59b6; } .mention-b { background: #3498db22; color: #3498db; }
.mention-ab { background: #27ae6022; color: #27ae60; } .mention-p { background: #f39c1222; color: #e67e22; } .mention-aj { background: #e74c3c22; color: #e74c3c; }
.decision-chip { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 8px; }
.chip-admis { background: #27ae6022; color: #27ae60; } .chip-ajourne { background: #e74c3c22; color: #e74c3c; }
.badge-publie    { font-size: 10px; padding: 2px 7px; background: #27ae6022; color: #27ae60; border-radius: 6px; margin-right: 4px; }
.badge-non-publie{ font-size: 10px; padding: 2px 7px; background: #f0ece4; color: #8a8070; border-radius: 6px; margin-right: 4px; }
.badge-biblio    { font-size: 10px; padding: 2px 7px; background: #9b59b622; color: #9b59b6; border-radius: 6px; margin-right: 4px; }
.badge-archive   { font-size: 10px; padding: 2px 7px; background: #78909c22; color: #546e7a; border-radius: 6px; }

.td-actions { white-space: nowrap; }
.btn-icon { width: 30px; height: 30px; border-radius: 7px; border: 1px solid var(--border, #e8e4dc); background: var(--bg-card, #fff); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; margin: 0 2px; }
.btn-icon:hover { border-color: #aaa; background: #f5f2eb; }
.btn-publish { color: #27ae60; border-color: #27ae6033; } .btn-publish:hover { background: #27ae6012; }
.btn-biblio  { color: #9b59b6; border-color: #9b59b633; } .btn-biblio:hover  { background: #9b59b612; }
.btn-archive { color: #546e7a; border-color: #78909c33; } .btn-archive:hover { background: #78909c12; }

.btn-deliberer { display: flex; align-items: center; gap: 6px; padding: 6px 13px; background: var(--accent, #c8a84b); color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; white-space: nowrap; }
.btn-deliberer:hover:not(:disabled) { opacity: 0.87; }
.btn-deliberer:disabled { opacity: 0.45; cursor: not-allowed; }

.spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
.loading-state { display: flex; flex-direction: column; align-items: center; padding: 48px; color: var(--text-muted, #8a8070); }
.spinner { width: 28px; height: 28px; border: 3px solid var(--border, #e8e4dc); border-top-color: var(--accent, #c8a84b); border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 10px; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 56px 24px; color: var(--text-muted, #8a8070); }
.empty-icon { font-size: 40px; margin-bottom: 12px; }
.empty-state p { font-size: 14px; margin: 0; }
</style>