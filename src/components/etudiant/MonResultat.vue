<template>
  <div class="mr-wrapper">

    <!-- Loading -->
    <div v-if="loading" class="mr-loading">
      <div class="mr-spinner"></div>
      <p>Chargement de votre résultat…</p>
    </div>

    <!-- Result -->
    <div v-else-if="resultat" class="mr-card">

      <!-- Congrats banner -->
      <div class="mr-congrats" :class="resultat.note_finale >= 10 ? 'mr-congrats--success' : 'mr-congrats--fail'">
        <span class="mr-congrats__icon">{{ resultat.note_finale >= 10 ? '🎓' : '📋' }}</span>
        <div>
          <div class="mr-congrats__title">
            {{ resultat.note_finale >= 10
              ? 'Félicitations, ' + (currentUser.prenom || 'étudiant(e)') + ' !'
              : 'Résultat de délibération' }}
          </div>
          <div class="mr-congrats__sub">
            {{ resultat.note_finale >= 10
              ? 'Vous avez validé votre projet de fin d\'études avec succès.'
              : 'Votre dossier a été examiné par le jury. Bon courage pour la suite.' }}
          </div>
        </div>
      </div>

      <!-- Project title -->
      <div class="mr-project">
        <span class="mr-project__label">Projet</span>
        <span class="mr-project__title">{{ resultat.projet_titre || '—' }}</span>
      </div>

      <!-- Score block -->
      <div class="mr-score-block">
        <div class="mr-score">
          <span class="mr-score__value">{{ resultat.note_finale }}</span>
          <span class="mr-score__denom">/20</span>
        </div>
        <div class="mr-badges">
          <span class="mr-mention" :class="mentionClass(resultat.note_finale)">
            {{ mention(resultat.note_finale) }}
          </span>
          <span class="mr-decision" :class="resultat.note_finale >= 10 ? 'mr-decision--ok' : 'mr-decision--nok'">
            {{ resultat.note_finale >= 10 ? '✓ Admis(e)' : '✗ Ajourné(e)' }}
          </span>
        </div>
      </div>

      <!-- Comments -->
      <div v-if="resultat.commentaire_jury || resultat.commentaire_encadrant" class="mr-comments">
        <div class="mr-comments__title">Commentaires</div>
        <div v-if="resultat.commentaire_jury" class="mr-comment">
          <span class="mr-comment__who">Jury</span>
          <p class="mr-comment__text">{{ resultat.commentaire_jury }}</p>
        </div>
        <div v-if="resultat.commentaire_encadrant" class="mr-comment">
          <span class="mr-comment__who">Encadrant</span>
          <p class="mr-comment__text">{{ resultat.commentaire_encadrant }}</p>
        </div>
      </div>

    </div>

    <!-- Empty -->
    <div v-else class="mr-empty">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <p class="mr-empty__title">Résultats non encore disponibles</p>
      <p class="mr-empty__sub">
        La délibération est en cours ou n'a pas encore eu lieu.
        Vous serez notifié(e) dès que le chef de département publie vos résultats.
      </p>
    </div>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'MonResultat',
  props: {
    currentUser: { type: Object, required: true },
  },
  data() { return { resultat: null, loading: false, notFound: false } },
  async mounted() { await this.charger() },
  methods: {
    async charger() {
      this.loading = true
      try {
        const res = await api.get('/deliberation-pfe/mon-resultat')
        // Only show if we got a real result with a note
        this.resultat = (res.data && res.data.note_finale != null) ? res.data : null
      } catch (e) {
        // 404 = not published yet, any other error = same fallback
        this.resultat = null
        this.notFound = e.response?.status === 404
      } finally {
        this.loading = false
      }
    },
    mention(n) {
      if (n >= 16) return 'Très bien'
      if (n >= 14) return 'Bien'
      if (n >= 12) return 'Assez bien'
      if (n >= 10) return 'Passable'
      return 'Insuffisant'
    },
    mentionClass(n) {
      if (n >= 16) return 'mention-tb'
      if (n >= 14) return 'mention-b'
      if (n >= 12) return 'mention-ab'
      if (n >= 10) return 'mention-p'
      return 'mention-ins'
    },
  },
}
</script>

<style scoped>
.mr-wrapper {
  max-width: 560px;
  margin: 0 auto;
  padding: 8px 0 32px;
}

/* ── Loading ── */
.mr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--vld-text-muted, #888);
  font-size: 14px;
}
.mr-spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--vld-border, #e0ddd8);
  border-top-color: var(--vld-primary, #2563eb);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Card ── */
.mr-card {
  background: var(--vld-surface, #fff);
  border: 1px solid var(--vld-border, #e0ddd8);
  border-radius: 14px;
  overflow: hidden;
}

/* ── Congrats banner ── */
.mr-congrats {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 24px;
}
.mr-congrats--success {
  background: linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%);
  border-bottom: 1px solid #a7f3d0;
}
.mr-congrats--fail {
  background: linear-gradient(135deg, #fee2e2 0%, #fff5f5 100%);
  border-bottom: 1px solid #fca5a5;
}
.mr-congrats__icon { font-size: 28px; line-height: 1; flex-shrink: 0; margin-top: 2px; }
.mr-congrats__title {
  font-weight: 700;
  font-size: 15.5px;
  color: var(--vld-text-strong, #1a1714);
  margin-bottom: 3px;
}
.mr-congrats__sub {
  font-size: 13px;
  color: var(--vld-text-muted, #6b7280);
  line-height: 1.45;
}

/* ── Project ── */
.mr-project {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--vld-border, #e0ddd8);
}
.mr-project__label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--vld-text-muted, #888);
  flex-shrink: 0;
}
.mr-project__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vld-text-strong, #1a1714);
}

/* ── Score block ── */
.mr-score-block {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 28px 24px;
  border-bottom: 1px solid var(--vld-border, #e0ddd8);
}
.mr-score {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
}
.mr-score__value {
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
  color: var(--vld-text-strong, #1a1714);
  font-variant-numeric: tabular-nums;
}
.mr-score__denom {
  font-size: 22px;
  font-weight: 500;
  color: var(--vld-text-muted, #888);
}
.mr-badges {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mr-mention, .mr-decision {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  width: fit-content;
}

/* Mention colors */
.mention-tb  { background: #dcfce7; color: #15803d; }
.mention-b   { background: #dbeafe; color: #1d4ed8; }
.mention-ab  { background: #e0f2fe; color: #0369a1; }
.mention-p   { background: #fef9c3; color: #854d0e; }
.mention-ins { background: #fee2e2; color: #b91c1c; }

/* Decision colors */
.mr-decision--ok  { background: #dcfce7; color: #15803d; }
.mr-decision--nok { background: #fee2e2; color: #b91c1c; }

/* ── Comments ── */
.mr-comments {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.mr-comments__title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--vld-text-muted, #888);
  margin-bottom: 2px;
}
.mr-comment {
  background: var(--vld-surface-alt, #f9f8f6);
  border: 1px solid var(--vld-border, #e0ddd8);
  border-radius: 8px;
  padding: 12px 14px;
}
.mr-comment__who {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--vld-primary, #2563eb);
  display: block;
  margin-bottom: 5px;
}
.mr-comment__text {
  font-size: 13.5px;
  color: var(--vld-text, #3d3a36);
  line-height: 1.55;
  margin: 0;
}

/* ── Empty ── */
.mr-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 64px 24px;
  color: var(--vld-text-muted, #999);
  text-align: center;
}
.mr-empty svg { opacity: .35; margin-bottom: 4px; }
.mr-empty__title { font-size: 15px; font-weight: 600; color: var(--vld-text, #3d3a36); margin: 0; }
.mr-empty__sub   { font-size: 13px; margin: 0; max-width: 320px; line-height: 1.5; }
</style>