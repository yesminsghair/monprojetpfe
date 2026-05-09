<template>
  <div class="page-content">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <span class="header-icon">📋</span>
        <div>
          <h2>Fiches d'évaluation</h2>
          <p class="subtitle">Suivi des évaluations soumises par le président de jury pour chaque étudiant</p>
        </div>
      </div>
      <div class="header-actions">
        <input v-model="searchFiche" class="search-input" placeholder="Rechercher un étudiant…" />
        <button class="btn-refresh" @click="chargerFiches" :disabled="loadingFiches">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Actualiser
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-bar" v-if="ficheStats.total > 0">
      <div class="stat-card">
        <span class="stat-val">{{ ficheStats.total }}</span>
        <span class="stat-label">Étudiants</span>
      </div>
      <div class="stat-card stat-card-ok">
        <span class="stat-val">{{ ficheStats.complets }}</span>
        <span class="stat-label">Fiche reçue</span>
      </div>
      <div class="stat-card stat-card-warn">
        <span class="stat-val">{{ ficheStats.partiels }}</span>
        <span class="stat-label">Incomplets</span>
      </div>
      <div class="stat-card stat-card-err">
        <span class="stat-val">{{ ficheStats.aucun }}</span>
        <span class="stat-label">Sans fiche</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loadingFiches" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement…</p>
    </div>

    <!-- Empty -->
    <div v-else-if="!ficheGroupes.length" class="empty-state">
      <div class="empty-icon">📋</div>
      <p>Aucune fiche d'évaluation soumise pour le moment.</p>
    </div>

    <!-- Accordion list -->
    <div v-else>
      <div v-for="groupe in fichesFiltered" :key="groupe.jury_id" class="fiche-groupe">

        <!-- Group header -->
        <div class="fiche-groupe-header" @click="toggleGroupe(groupe.jury_id)">
          <div class="fg-left">
            <div class="av-gold">{{ initiales(groupe.etudiant_nom) }}</div>
            <div class="fg-info">
              <div class="fg-nom">{{ groupe.etudiant_nom }}</div>
              <div class="fg-projet">{{ groupe.projet_titre }}</div>
            </div>
          </div>
          <div class="fg-right">
            <!-- President slot -->
            <div class="jury-slots">
              <div class="jury-slot"
                   :class="presidentFiche(groupe) ? 'slot-filled' : 'slot-empty'">
                <span class="slot-num">Prés.</span>
                <span v-if="presidentFiche(groupe)" class="slot-note">{{ presidentFiche(groupe).note_totale }}/20</span>
                <span v-else class="slot-pending">—</span>
              </div>
            </div>
            <!-- Progress badge -->
            <span class="progress-badge"
                  :class="presidentFiche(groupe) ? 'badge-complet' : 'badge-none'">
              {{ presidentFiche(groupe) ? '✓ Reçue' : 'En attente' }}
            </span>
            <span v-if="presidentFiche(groupe) && !groupe.resultat" class="badge-ready">Prêt pour délibération</span>
            <span v-if="groupe.resultat" class="badge-delibere">✓ Délibéré</span>
            <!-- Chevron -->
            <svg class="chevron" :class="{rotated: openGroupes.includes(groupe.jury_id)}"
                 xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <!-- Expandable body -->
        <transition name="expand">
          <div v-if="openGroupes.includes(groupe.jury_id)" class="fiche-groupe-body">
            <div v-if="!groupe.fiches.length" class="no-fiches">
              Aucune fiche soumise pour cet étudiant.
            </div>
            <div v-for="(fiche, idx) in groupe.fiches" :key="fiche.id" class="fiche-card">
              <div class="fiche-card-header">
                <div class="fiche-jury-info">
                  <span class="jury-badge">Jury {{ idx + 1 }}</span>
                  <span class="fiche-jury-nom">{{ fiche.membre_jury }}</span>
                  <span class="fiche-role-chip">{{ roleLabel(fiche.fonction) }}</span>
                </div>
                <div class="fiche-meta">
                  <span class="fiche-date">{{ fiche.date }}</span>
                  <span class="badge-note-lg">{{ fiche.note_totale }}/20</span>
                </div>
              </div>
              <!-- Criteria per category -->
              <div v-if="fiche.categories && fiche.categories.length" class="fiche-categories">
                <div v-for="cat in fiche.categories" :key="cat.id" class="fiche-cat">
                  <div class="cat-header">
                    <span class="cat-nom">{{ cat.nom }}</span>
                    <span class="cat-score">{{ cat.note }}/{{ cat.bareme }}</span>
                  </div>
                  <div v-for="c in cat.criteres" :key="c.id" class="critere-row">
                    <span class="critere-label">{{ c.nom }}</span>
                    <div class="critere-bar-wrap">
                      <div class="critere-bar" :style="{width: (c.note/c.bareme*100)+'%'}"></div>
                    </div>
                    <span class="critere-note">{{ c.note }}/{{ c.bareme }}</span>
                  </div>
                </div>
              </div>
              <!-- Flat criteria fallback -->
              <div v-else-if="fiche.criteres && fiche.criteres.length" class="fiche-categories">
                <div class="critere-row" v-for="c in fiche.criteres" :key="c.id">
                  <span class="critere-label">{{ c.nom }}</span>
                  <div class="critere-bar-wrap">
                    <div class="critere-bar" :style="{width: (c.note/c.bareme*100)+'%'}"></div>
                  </div>
                  <span class="critere-note">{{ c.note }}/{{ c.bareme }}</span>
                </div>
              </div>
              <div v-if="fiche.commentaire" class="fiche-comment">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {{ fiche.commentaire }}
              </div>
            </div>

            <!-- Pending slot if no president fiche yet -->
            <div v-if="!presidentFiche(groupe)" class="fiche-card fiche-card-missing">
              <div class="fiche-card-header">
                <div class="fiche-jury-info">
                  <span class="jury-badge jury-badge-grey">Président</span>
                  <span class="fiche-jury-nom fiche-jury-pending">En attente de soumission…</span>
                </div>
                <div class="fiche-meta">
                  <span class="badge-pending">Non soumis</span>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'FichesEvaluation',
  emits: ['toast'],

  data() {
    return {
      loadingFiches: false,
      ficheGroupes:  [],
      openGroupes:   [],
      searchFiche:   '',
    }
  },

  computed: {
    ficheStats() {
      const total    = this.ficheGroupes.length
      const complets = this.ficheGroupes.filter(g => this.presidentFiche(g)).length
      const partiels = this.ficheGroupes.filter(g => g.fiches.length > 0 && !this.presidentFiche(g)).length
      const aucun    = this.ficheGroupes.filter(g => g.fiches.length === 0).length
      return { total, complets, partiels, aucun }
    },
    fichesFiltered() {
      if (!this.searchFiche) return this.ficheGroupes
      const q = this.searchFiche.toLowerCase()
      return this.ficheGroupes.filter(g =>
        g.etudiant_nom.toLowerCase().includes(q) ||
        (g.projet_titre || '').toLowerCase().includes(q)
      )
    },
  },

  mounted() {
    this.chargerFiches()
  },

  methods: {
    initiales(nom) {
      if (!nom) return '?'
      return nom.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    },
    roleLabel(r) {
      return { president: 'Président', encadrant: 'Encadrant', examinateur: 'Examinateur' }[r] || r
    },
    toggleGroupe(id) {
      const idx = this.openGroupes.indexOf(id)
      if (idx >= 0) this.openGroupes.splice(idx, 1)
      else this.openGroupes.push(id)
    },
    presidentFiche(groupe) {
      return (groupe.fiches || []).find(f => f.fonction === 'president' && f.finalise)
    },

    async chargerFiches() {
      this.loadingFiches = true
      try {
        const { data } = await api.get('/fiches-evaluation')
        this.ficheGroupes = data
      } catch (e) {
        this.$emit('toast', { type: 'toast-err', message: 'Erreur chargement des fiches.' })
      } finally {
        this.loadingFiches = false
      }
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
.btn-refresh { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1px solid var(--border, #e8e4dc); background: var(--bg-card, #fff); color: var(--text-muted, #8a8070); border-radius: 8px; font-size: 12.5px; cursor: pointer; transition: all 0.15s; }
.btn-refresh:hover:not(:disabled) { border-color: #aaa; color: var(--text, #2a2520); }
.btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

.stats-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.stat-card { background: var(--bg-card, #fff); border: 1px solid var(--border, #e8e4dc); border-radius: 10px; padding: 12px 16px; display: flex; flex-direction: column; align-items: center; min-width: 80px; }
.stat-val { font-size: 20px; font-weight: 800; color: var(--text, #2a2520); }
.stat-label { font-size: 10px; color: var(--text-muted, #8a8070); text-align: center; margin-top: 2px; }
.stat-card-ok  { border-color: #27ae6044; background: #27ae6008; } .stat-card-ok .stat-val  { color: #27ae60; }
.stat-card-warn { border-color: #f39c1244; background: #f39c1208; } .stat-card-warn .stat-val { color: #f39c12; }
.stat-card-err  { border-color: #e74c3c44; background: #e74c3c08; } .stat-card-err .stat-val  { color: #e74c3c; }

.fiche-groupe { background: var(--bg-card, #fff); border: 1px solid var(--border, #e8e4dc); border-radius: 12px; margin-bottom: 10px; overflow: hidden; }
.fiche-groupe-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; cursor: pointer; transition: background 0.15s; gap: 12px; }
.fiche-groupe-header:hover { background: var(--bg-hover, #faf8f3); }
.fg-left { display: flex; align-items: center; gap: 10px; }
.av-gold { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #c8a84b, #e8c86e); color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.fg-nom { font-size: 13.5px; font-weight: 700; color: var(--text, #2a2520); }
.fg-projet { font-size: 11px; color: var(--text-muted, #8a8070); margin-top: 2px; }
.fg-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }

.jury-slots { display: flex; gap: 6px; }
.jury-slot { display: flex; flex-direction: column; align-items: center; padding: 4px 10px; border-radius: 6px; border: 1.5px solid var(--border, #e8e4dc); min-width: 54px; }
.slot-filled { border-color: #27ae60; background: #27ae6010; }
.slot-empty  { border-color: var(--border, #e8e4dc); background: #fafafa; }
.slot-num  { font-size: 9px; font-weight: 700; color: var(--text-muted, #8a8070); }
.slot-note { font-size: 11px; font-weight: 700; color: #27ae60; }
.slot-pending { font-size: 11px; color: #ccc; }

.progress-badge { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 10px; }
.badge-complet { background: #27ae6022; color: #27ae60; border: 1px solid #27ae6033; }
.badge-none    { background: #e8e4dc; color: #8a8070; border: 1px solid #d4d0c8; }
.badge-ready   { font-size: 11px; font-weight: 600; color: #3498db; background: #3498db15; padding: 3px 8px; border-radius: 8px; border: 1px solid #3498db33; }
.badge-delibere{ font-size: 11px; font-weight: 600; color: #9b59b6; background: #9b59b615; padding: 3px 8px; border-radius: 8px; border: 1px solid #9b59b633; }
.chevron { transition: transform 0.2s; flex-shrink: 0; color: var(--text-muted, #8a8070); }
.chevron.rotated { transform: rotate(180deg); }

.expand-enter-active, .expand-leave-active { transition: all 0.25s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; }
.expand-enter-to, .expand-leave-from { max-height: 2000px; opacity: 1; }

.fiche-groupe-body { border-top: 1px solid var(--border, #e8e4dc); padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; background: var(--bg-subtle, #fdf9f2); }
.no-fiches { font-size: 12px; color: var(--text-muted, #8a8070); padding: 8px 0; }
.fiche-card { background: var(--bg-card, #fff); border: 1px solid var(--border, #e8e4dc); border-radius: 10px; padding: 14px 16px; }
.fiche-card-missing { border-style: dashed; background: #fafafa; opacity: 0.6; }
.fiche-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.fiche-jury-info { display: flex; align-items: center; gap: 8px; }
.jury-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; background: var(--accent, #c8a84b); color: #fff; border-radius: 6px; }
.jury-badge-grey { background: #aaa; }
.fiche-jury-nom { font-size: 13px; font-weight: 600; color: var(--text, #2a2520); }
.fiche-jury-pending { color: var(--text-muted, #8a8070); font-style: italic; font-weight: 400; }
.fiche-role-chip { font-size: 10px; padding: 2px 7px; border-radius: 6px; background: #f0ece4; color: #6a6050; }
.fiche-meta { display: flex; align-items: center; gap: 8px; }
.fiche-date { font-size: 11px; color: var(--text-muted, #8a8070); }
.badge-note-lg { font-size: 13px; font-weight: 800; background: var(--accent, #c8a84b); color: #fff; padding: 3px 10px; border-radius: 8px; }
.badge-pending { font-size: 11px; color: #aaa; background: #f0f0f0; padding: 3px 9px; border-radius: 8px; }

.fiche-categories { display: flex; flex-direction: column; gap: 10px; }
.cat-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
.cat-nom { font-size: 12px; font-weight: 700; color: var(--text, #2a2520); }
.cat-score { font-size: 12px; font-weight: 700; color: var(--accent, #c8a84b); }
.critere-row { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; }
.critere-label { font-size: 11.5px; color: var(--text, #2a2520); min-width: 130px; flex-shrink: 0; }
.critere-bar-wrap { flex: 1; background: #f0ece4; border-radius: 4px; height: 6px; overflow: hidden; }
.critere-bar { height: 100%; background: linear-gradient(90deg, #c8a84b, #e8c86e); border-radius: 4px; transition: width 0.4s; }
.critere-note { font-size: 11px; font-weight: 700; color: var(--text-muted, #8a8070); min-width: 40px; text-align: right; }
.fiche-comment { display: flex; align-items: flex-start; gap: 6px; font-size: 11.5px; color: var(--text-muted, #8a8070); background: #f5f2eb; border-radius: 6px; padding: 8px 10px; margin-top: 10px; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 48px; color: var(--text-muted, #8a8070); }
.spinner { width: 28px; height: 28px; border: 3px solid var(--border, #e8e4dc); border-top-color: var(--accent, #c8a84b); border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 10px; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 56px 24px; color: var(--text-muted, #8a8070); }
.empty-icon { font-size: 40px; margin-bottom: 12px; }
.empty-state p { font-size: 14px; margin: 0; }
</style>