<template>
  <div>
    <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
      <div>
        <h2 class="vld-page-title">Délibération & Résultats</h2>
        <p class="vld-page-sub">Calculez et publiez les résultats finaux des étudiants</p>
      </div>
      <button v-if="resultats.some(r=>!r.publie)" class="btn btn-success d-flex align-items-center gap-2" @click="publierTous" :disabled="loadingPublier">
        <span v-if="loadingPublier" class="vld-spinner-sm"></span>
        Publier tous les résultats
      </button>
    </div>

    <div class="input-group mb-4" style="max-width:380px">
      <span class="input-group-text" style="background:var(--vld-surface-alt);border-color:var(--vld-border)">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--vld-text-muted)" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </span>
      <input v-model="searchDelib" class="form-control" placeholder="Rechercher..." />
    </div>

    <!-- Projets prêts à délibérer -->
    <div v-if="projetsPretsADeliberer.length" class="mb-4">
      <div class="vld-section-label">
        Prêts à délibérer
        <span class="badge bg-primary ms-2">{{ projetsPretsADeliberer.length }}</span>
      </div>
      <div class="d-flex flex-column gap-2">
        <div
          v-for="p in projetsPretsADeliberer"
          :key="p.jury_id"
          class="card"
          style="border-left:4px solid var(--vld-accent)"
        >
          <div class="card-body d-flex align-items-center gap-3 flex-wrap">
            <div class="flex-grow-1">
              <div class="fw-bold" style="color:var(--vld-text-strong)">{{ p.etudiant_nom }}</div>
              <div style="font-size:13px;color:var(--vld-text-muted)">
                {{ p.projet_titre || '—' }}
                <template v-if="p.matricule && p.matricule !== '--'"> · <span class="text-muted">{{ p.matricule }}</span></template>
              </div>
              <!-- Note du président visible directement -->
              <div v-if="p.note_president !== null && p.note_president !== undefined" style="font-size:13px;margin-top:4px">
                <span class="badge" :class="p.note_president >= 10 ? 'bg-success' : 'bg-danger'">
                  Note président : {{ parseFloat(p.note_president).toFixed(2) }} / 20
                </span>
              </div>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2" @click="deliberer(p)" :disabled="p.loading">
              <span v-if="p.loading" class="vld-spinner-sm"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Délibérer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Résultats -->
    <div v-if="loadingResultats" class="vld-state"><div class="vld-spinner mx-auto mb-3"></div><p>Chargement...</p></div>

    <div v-else-if="!resultatsFiltered.length" class="vld-state">
      <div class="vld-state__icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></div>
      <p class="vld-state__title">Aucun résultat disponible</p>
    </div>

    <div v-else class="table-responsive card">
      <table class="table table-hover mb-0">
        <thead><tr><th>Étudiant</th><th>Projet</th><th>Note finale</th><th>Mention</th><th>Décision</th><th class="text-center">Actions</th></tr></thead>
        <tbody>
          <tr v-for="r in resultatsFiltered" :key="r.id">
            <td>
              <div class="d-flex align-items-center gap-2">
                <div class="vld-av vld-av--sm vld-av--blue">{{ initiales(r.etudiant_nom) }}</div>
                <span class="fw-semibold" style="color:var(--vld-text-strong)">{{ r.etudiant_nom }}</span>
              </div>
            </td>
            <td style="font-size:13px;color:var(--vld-text-muted);max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ r.projet_titre||'—' }}</td>
            <td>
              <span class="fw-bold" style="font-family:var(--vld-font-display);font-size:17px" :class="r.note_finale>=10 ? 'text-success' : 'text-danger'">
                {{ r.note_finale }}<span style="font-size:12px;font-family:var(--vld-font-body);font-weight:400;color:var(--vld-text-muted)">/20</span>
              </span>
            </td>
            <td>
              <span class="badge px-3 py-2" :class="mentionClass(r.mention)">{{ r.mention||'—' }}</span>
            </td>
            <td>
              <!-- Si publié : badge figé, non modifiable -->
              <span v-if="r.publie" class="badge px-3 py-2" :class="r.decision==='admis' ? 'bg-success' : 'bg-danger'">
                {{ r.decision==='admis' ? '✓ Admis(e)' : '✗ Ajourné(e)' }}
              </span>
              <!-- Si non publié : deux boutons bascule -->
              <div v-else class="d-flex gap-1 align-items-center">
                <span v-if="r._loadingDecision" class="vld-spinner-sm" style="border-color:rgba(0,0,0,.15);border-top-color:#555;width:14px;height:14px"></span>
                <template v-else>
                  <button
                    class="btn btn-sm"
                    :class="r.decision==='admis' ? 'btn-success' : 'btn-outline-success'"
                    @click="changerDecision(r, 'admis')"
                    title="Marquer Admis(e)"
                  >✓ Admis</button>
                  <button
                    class="btn btn-sm"
                    :class="r.decision==='ajourne' ? 'btn-danger' : 'btn-outline-danger'"
                    @click="changerDecision(r, 'ajourne')"
                    title="Marquer Ajourné(e)"
                  >✗ Ajourné</button>
                </template>
              </div>
            </td>
            <td class="text-center">
              <div class="d-flex gap-1 justify-content-center flex-wrap">
                <button v-if="!r.publie" class="btn btn-success btn-sm" @click="publierResultat(r)">Publier</button>
                <span v-else class="badge bg-success">✓ Publié</span>
                <button v-if="r.publie && !r.en_biblio" class="btn btn-outline-primary btn-sm" @click="ajouterBiblio(r)">+ Biblio</button>
                <button v-if="!r.archive" class="btn btn-outline-secondary btn-sm" @click="archiverResultat(r)">Archiver</button>
                <span v-else class="badge bg-secondary">Archivé</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'
export default {
  name: 'DeliberationResultats',
  emits: ['toast'],
  data () {
    return {
      loadingResultats: false,
      loadingPublier:   false,
      resultats:        [],
      projetsPretsADeliberer: [],
      searchDelib: '',
    }
  },
  computed: {
    resultatsFiltered () {
      if (!this.searchDelib) return this.resultats
      const q = this.searchDelib.toLowerCase()
      return this.resultats.filter(r =>
        r.etudiant_nom.toLowerCase().includes(q) ||
        (r.projet_titre || '').toLowerCase().includes(q)
      )
    },
  },
  mounted () { this.chargerResultats() },
  methods: {
    initiales (n) { return (n || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() },
    mentionClass (m) {
      return {
        'Très bien':  'bg-success',
        'Bien':       'bg-primary',
        'Assez bien': 'bg-info text-dark',
        'Passable':   'bg-warning text-dark',
        'Insuffisant':'bg-danger',
      }[m] || 'bg-secondary'
    },

    async chargerResultats () {
      this.loadingResultats = true
      try {
        const [r, p] = await Promise.all([
          api.get('/resultats-pfe'),
          api.get('/jurys-pfe/prets-a-deliberer'),
        ])
        this.resultats = (r.data || []).map(x => ({ ...x, _loadingDecision: false }))
        // jury_id from backend = soutenance_id (used for POST /jurys-pfe/{id}/deliberer)
        this.projetsPretsADeliberer = (p.data || []).map(x => ({ ...x, loading: false }))
      } catch {
        this.$emit('toast', { type: 'toast-err', message: 'Erreur chargement des résultats.' })
      } finally {
        this.loadingResultats = false
      }
    },

    async deliberer (p) {
      p.loading = true
      try {
        // jury_id = soutenance_id (backend route: Soutenance $juryPfe)
        const { data } = await api.post(`/jurys-pfe/${p.jury_id}/deliberer`)
        this.resultats.unshift({
          id:             data.id,
          jury_id:        p.jury_id,
          etudiant_nom:   p.etudiant_nom,
          projet_titre:   p.projet_titre,
          note_finale:    data.note_finale,
          mention:        data.mention,
          decision:       data.decision,
          publie:         false,
          en_biblio:      false,
          archive:        false,
          _loadingDecision: false,
        })
        this.projetsPretsADeliberer = this.projetsPretsADeliberer.filter(x => x.jury_id !== p.jury_id)
        this.$emit('toast', { type: 'toast-ok', message: `Délibération enregistrée — ${p.etudiant_nom} : ${data.note_finale}/20` })
      } catch (e) {
        this.$emit('toast', { type: 'toast-err', message: e.response?.data?.message || 'Erreur lors de la délibération.' })
      } finally {
        p.loading = false
      }
    },

    async changerDecision (r, decision) {
      if (r.decision === decision) return
      r._loadingDecision = true
      try {
        await api.post(`/resultats-pfe/${r.id}/decision`, { decision })
        r.decision = decision
        this.$emit('toast', { type: 'toast-ok', message: `Décision mise à jour : ${decision === 'admis' ? 'Admis(e)' : 'Ajourné(e)'} — ${r.etudiant_nom}` })
      } catch (e) {
        this.$emit('toast', { type: 'toast-err', message: e.response?.data?.message || 'Erreur lors du changement de décision.' })
      } finally {
        r._loadingDecision = false
      }
    },

    async publierResultat (r) {
      try {
        await api.post(`/jurys-pfe/${r.jury_id}/publier`)
        r.publie = true
        this.$emit('toast', { type: 'toast-ok', message: `Résultat publié — ${r.etudiant_nom} notifié.` })
      } catch {
        this.$emit('toast', { type: 'toast-err', message: 'Erreur.' })
      }
    },

    async publierTous () {
      this.loadingPublier = true
      try {
        await api.post('/resultats-pfe/publier-tous')
        this.resultats.forEach(r => r.publie = true)
        this.$emit('toast', { type: 'toast-ok', message: 'Tous les résultats ont été publiés.' })
      } catch {
        this.$emit('toast', { type: 'toast-err', message: 'Erreur.' })
      } finally {
        this.loadingPublier = false
      }
    },

    async ajouterBiblio (r) {
      try {
        await api.post(`/resultats-pfe/${r.id}/bibliotheque`)
        r.en_biblio = true
        this.$emit('toast', { type: 'toast-ok', message: `${r.etudiant_nom} ajouté à la bibliothèque PFE.` })
      } catch {
        this.$emit('toast', { type: 'toast-err', message: 'Erreur.' })
      }
    },

    async archiverResultat (r) {
      try {
        await api.post(`/resultats-pfe/${r.id}/archiver`)
        r.archive = true
        this.$emit('toast', { type: 'toast-ok', message: `${r.etudiant_nom} archivé.` })
      } catch {
        this.$emit('toast', { type: 'toast-err', message: 'Erreur.' })
      }
    },
  },
}
</script>