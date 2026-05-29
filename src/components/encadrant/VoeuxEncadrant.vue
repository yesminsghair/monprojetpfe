<template>
  <div class="ve-root">

    <!-- ── No formulaire ─────────────────────────────────────── -->
    <div v-if="!formulaireActif && !voeuxSoumis" class="ve-empty">
      <div class="ve-empty__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="1.4">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>
      <p class="ve-empty__title">Aucun formulaire disponible</p>
      <p class="ve-empty__sub">Le chef de département n'a pas encore publié de formulaire de vœux.</p>
    </div>

    <!-- ── Read-only view ────────────────────────────────────── -->
    <div v-else-if="voeuxData && !editMode" class="ve-center">

      <!-- ── Hero header (navy gradient like CreerFormulaire panels) -->
      <div class="ve-hero">
        <div class="ve-hero__glow"></div>
        <div class="ve-hero__left">
          <div class="ve-hero__eyebrow" :class="voeuxData?.statut === 'brouillon' ? 've-hero__eyebrow--draft' : ''">
            <svg v-if="voeuxData?.statut !== 'brouillon'" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
            </svg>
            {{ voeuxData?.statut === 'brouillon' ? "Vœux d'encadrement · Brouillon" : "Vœux d'encadrement · Soumise" }}
          </div>
          <h2 class="ve-hero__title">Ma fiche de vœux</h2>
          <p class="ve-hero__sub">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            {{ formulaireActif?.titre }}
          </p>
        </div>
        <div class="ve-hero__right">
          <div class="ve-hero__date-block">
            <div class="ve-hero__date-label">
              {{ voeuxData?.statut === 'brouillon' ? 'Dernière modification' : 'Date de soumission' }}
            </div>
            <div class="ve-hero__date-val">{{ dateAffichee }}</div>
          </div>
          <button v-if="peutModifier" class="ve-edit-btn" @click="openEdit">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Modifier ma fiche
          </button>
          <div v-else class="ve-locked-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            {{ formulaireActif?.statut === 'verrouille' ? 'Verrouillé' : 'Date dépassée' }}
          </div>
        </div>
      </div>

      <!-- ── Panels grid ──────────────────────────────────────── -->
      <div v-if="voeuxData" class="ve-panels">

        <!-- Panel : Disponibilité + Capacité (unified light card) -->
        <div v-if="(hasChamp('disponibilite') || voeuxData.disponibilite) || (hasChamp('nbEtudiants') && voeuxData.nbre_max_pfe != null)"
             class="ve-panel ve-panel--summary ve-panel--full">
          <div class="ve-panel__head ve-panel__head--light">
            <div class="ve-panel__head-icon ve-panel__head-icon--light">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div>
              <div class="ve-panel__head-title ve-panel__head-title--light">Synthèse de disponibilité</div>
              <div class="ve-panel__head-sub ve-panel__head-sub--light">Situation et capacité pour cette année</div>
            </div>
          </div>
          <div class="ve-panel__body ve-panel__body--summary">

            <!-- Disponibilité block -->
            <div v-if="hasChamp('disponibilite') || voeuxData.disponibilite" class="ve-summary-block">
              <div class="ve-summary-block__label">Disponibilité</div>
              <span :class="['ve-dispo-pill', 've-dispo-' + voeuxData.disponibilite]">
                <span class="ve-dispo-pill__dot"></span>
                {{ labelDisponibilite(voeuxData.disponibilite) }}
              </span>
            </div>

            <!-- Divider -->
            <div v-if="(hasChamp('disponibilite') || voeuxData.disponibilite) && hasChamp('nbEtudiants') && voeuxData.nbre_max_pfe != null"
                 class="ve-summary-sep"></div>

            <!-- Capacité block -->
            <div v-if="hasChamp('nbEtudiants') && voeuxData.nbre_max_pfe != null" class="ve-summary-block">
              <div class="ve-summary-block__label">PFE souhaités</div>
              <div class="ve-stat-inline">
                <span class="ve-stat-inline__num">{{ voeuxData.nbre_max_pfe ?? '—' }}</span>
                <span class="ve-stat-inline__unit">PFE</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Panel : Thèmes -->
        <div v-if="hasChamp('themes') && voeuxData.themes" class="ve-panel ve-panel--half">
          <div class="ve-panel__head ve-panel__head--purple">
            <div class="ve-panel__head-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <div>
              <div class="ve-panel__head-title">Thèmes préférés</div>
              <div class="ve-panel__head-sub">Domaines d'intérêt</div>
            </div>
          </div>
          <div class="ve-panel__body">
            <p class="ve-text-block">{{ voeuxData.themes }}</p>
          </div>
        </div>

        <!-- Panel : Mode d'encadrement -->
        <div v-if="hasChamp('encadrement') && voeuxData.encadrement" class="ve-panel ve-panel--half">
          <div class="ve-panel__head ve-panel__head--blue">
            <div class="ve-panel__head-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <div class="ve-panel__head-title">Mode d'encadrement</div>
              <div class="ve-panel__head-sub">Type de suivi proposé</div>
            </div>
          </div>
          <div class="ve-panel__body">
            <p class="ve-text-block">{{ voeuxData.encadrement }}</p>
          </div>
        </div>

        <!-- Panel : Co-tutelle -->
        <div v-if="hasChamp('cotutelle') && voeuxData.cotutelle != null" class="ve-panel">
          <div class="ve-panel__head ve-panel__head--orange">
            <div class="ve-panel__head-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <div class="ve-panel__head-title">Co-tutelle</div>
              <div class="ve-panel__head-sub">Encadrement partagé</div>
            </div>
          </div>
          <div class="ve-panel__body ve-panel__body--center">
            <span :class="['ve-bool-pill', voeuxData.cotutelle ? 've-bool-pill--yes' : 've-bool-pill--no']">
              <svg v-if="voeuxData.cotutelle" xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              {{ voeuxData.cotutelle ? 'Acceptée' : 'Refusée' }}
            </span>
          </div>
        </div>

        <!-- Panel : Commentaire -->
        <div v-if="hasChamp('commentaire') && voeuxData.commentaire" class="ve-panel ve-panel--full">
          <div class="ve-panel__head ve-panel__head--muted">
            <div class="ve-panel__head-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <div class="ve-panel__head-title">Commentaires libres</div>
              <div class="ve-panel__head-sub">Précisions et contraintes</div>
            </div>
          </div>
          <div class="ve-panel__body">
            <p class="ve-text-block ve-text-block--comment">{{ voeuxData.commentaire }}</p>
          </div>
        </div>

      </div>

      <div v-else class="ve-no-data">Aucune donnée disponible.</div>
    </div>

    <!-- ── New submission ────────────────────────────────────── -->
    <div v-else class="ve-center">
      <FicheVoeux
        :formulaire="formulaireActif"
        :mode-soumission-only="true"
        :voeux-initiaux="null"
        @soumis="onSoumis"
        @brouillon-sauvegarde="onBrouillonSauvegarde"
        @role-changed="$emit('role-changed', $event)"
      />
    </div>

    <!-- ══════════════════════════════════════════════════════════
         EDIT MODAL
    ═══════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="ve-modal">
        <div v-if="editMode" class="ve-modal-overlay" @mousedown.self="closeEdit">
          <div class="ve-modal" role="dialog" aria-modal="true" aria-label="Modifier ma fiche de vœux">

            <!-- Modal header — navy gradient matching CreerFormulaire -->
            <div class="ve-modal__header">
              <div class="ve-modal__header-left">
                <div class="ve-modal__eyebrow">Modification</div>
                <h3 class="ve-modal__title">Modifier ma fiche de vœux</h3>
              </div>
              <button class="ve-modal__close" @click="closeEdit" aria-label="Fermer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="ve-modal__body">
              <FicheVoeux
                :formulaire="formulaireActif"
                :mode-soumission-only="true"
                :voeux-initiaux="voeuxData"
                @soumis="onSoumis"
                @brouillon-sauvegarde="onBrouillonSauvegarde"
                @role-changed="$emit('role-changed', $event)"
              />
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script>
import FicheVoeux from '../GestionFormulaires/FicheVoeux.vue'

export default {
  name: 'VoeuxEncadrant',
  components: { FicheVoeux },

  emits: ['voeux-soumis', 'role-changed', 'toast'],

  props: {
    formulaireActif: { type: Object,  default: null  },
    voeuxSoumis:     { type: Boolean, default: false },
    voeuxData:       { type: Object,  default: null  },
    dateSoumission:  { type: String,  default: ''    },
  },

  data() {
    return { editMode: false }
  },

  computed: {
    dateAffichee() {
      if (this.dateSoumission) return this.dateSoumission
      if (this.voeuxData?.soumis_at) {
        const raw = this.voeuxData.soumis_at
        if (/^\d{2}\/\d{2}\/\d{4}/.test(raw)) return raw
        return new Date(raw).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      }
      return '—'
    },

    peutModifier() {
      if (!this.formulaireActif) return false
      if (this.formulaireActif.statut === 'verrouille') return false
      if (!this.formulaireActif.date_limite) return false
      return new Date(this.formulaireActif.date_limite) > new Date()
    },
  },

  methods: {
    hasChamp(c) {
      return (this.formulaireActif?.champs || []).includes(c)
    },
    openEdit() {
      this.editMode = true
      document.body.style.overflow = 'hidden'
    },
    closeEdit() {
      this.editMode = false
      document.body.style.overflow = ''
    },
    onSoumis(voeu) {
      this.closeEdit()
      this.$emit('voeux-soumis', voeu)
    },
    onBrouillonSauvegarde(voeu) {
      this.closeEdit()
      this.$emit('voeux-soumis', voeu)
    },
    labelDisponibilite(d) {
      return {
        oui:      'Disponible',
        partielle:'Partiellement disponible',
        non:      'Non disponible',
      }[d] || d || '—'
    },
  },

  beforeUnmount() {
    document.body.style.overflow = ''
  },
}
</script>

<style scoped>
/* ── Root ─────────────────────────────────────────────────── */
.ve-root {
  min-height: 100%;
  display: flex; flex-direction: column; align-items: center;
  padding: 32px 16px 64px;
}
.ve-center { width: 100%; max-width: 820px; }

/* ── Empty state ──────────────────────────────────────────── */
.ve-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center;
  padding: 80px 24px; gap: 14px;
  color: var(--vld-text-muted, #8a9aaa);
}
.ve-empty__icon {
  width: 72px; height: 72px; border-radius: 50%;
  background: var(--vld-surface-alt, #f4f5f6);
  border: 1.5px solid var(--vld-border, #e2e6ea);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 6px;
  color: var(--vld-text-faint, #aab4be);
}
.ve-empty__title { font-size: 17px; font-weight: 700; color: var(--vld-text-strong, #1e2a35); margin: 0; }
.ve-empty__sub   { font-size: 14px; margin: 0; max-width: 360px; }

/* ── Hero header ──────────────────────────────────────────── */
.ve-hero {
  position: relative; overflow: hidden;
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 20px; flex-wrap: wrap;
  padding: 26px 30px;
  border-radius: var(--vld-r-2xl, 20px);
  background: linear-gradient(135deg, #1a2d3e 0%, #243d52 55%, #1e3348 100%);
  box-shadow: 0 8px 32px rgba(20,35,50,.22);
  margin-bottom: 20px;
}
.ve-hero__glow {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(circle at 85% 15%, rgba(245,197,24,.10) 0%, transparent 50%),
    radial-gradient(circle at 10% 80%, rgba(0,160,120,.06) 0%, transparent 50%);
}
.ve-hero__left { flex: 1; min-width: 220px; }
.ve-hero__eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: 999px;
  background: rgba(30,190,130,.18); border: 1px solid rgba(30,190,130,.32);
  color: #5ee8b4; font-size: 11px; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase; margin-bottom: 12px;
}
.ve-hero__eyebrow--draft {
  background: rgba(245,166,35,.18); border-color: rgba(245,166,35,.35);
  color: #f5c842;
}
.ve-hero__title {
  font-family: var(--vld-font-display, 'Merriweather', serif);
  font-size: 24px; font-weight: 700; color: #fff; margin: 0 0 10px; line-height: 1.25;
}
.ve-hero__sub {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; color: rgba(255,255,255,.55); margin: 0;
  max-width: 380px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ve-hero__right {
  display: flex; flex-direction: column; align-items: flex-end; gap: 12px; flex-shrink: 0;
}
.ve-hero__date-block {
  text-align: right;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.13);
  border-radius: 12px; padding: 10px 16px;
}
.ve-hero__date-label {
  font-size: 10px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: rgba(255,255,255,.45); margin-bottom: 4px;
}
.ve-hero__date-val {
  font-family: var(--vld-font-display, 'Merriweather', serif);
  font-size: 15px; font-weight: 700; color: #fff;
}

/* Edit / Locked buttons */
.ve-edit-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border: none; border-radius: 10px;
  background: rgba(255,255,255,.15); color: #fff;
  font-size: 13px; font-weight: 700; cursor: pointer;
  font-family: var(--vld-font-body, sans-serif);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,.20);
  transition: background .18s, transform .15s;
}
.ve-edit-btn:hover { background: rgba(255,255,255,.26); transform: translateY(-1px); }
.ve-locked-badge {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 16px; border-radius: 10px;
  background: rgba(220,80,60,.18); border: 1px solid rgba(220,80,60,.30);
  color: #ffaa99; font-size: 12.5px; font-weight: 600;
}

/* ── Panels grid ──────────────────────────────────────────── */
.ve-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.ve-panel { border-radius: 14px; overflow: hidden; box-shadow: 0 2px 12px rgba(30,42,53,.07); }
.ve-panel--full  { grid-column: 1 / -1; }
.ve-panel--half  { grid-column: span 1; }
.ve-panel--cap   { grid-column: span 1; }

/* Panel head variants — matches CreerFormulaire pattern */
.ve-panel__head {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 18px;
}
.ve-panel__head--blue   { background: linear-gradient(135deg, #1a2d3e, #243d52); }
.ve-panel__head--gold   { background: linear-gradient(135deg, #3a2800, #5a3f00); }
.ve-panel__head--teal   { background: linear-gradient(135deg, #0a3d35, #062b25); }
.ve-panel__head--purple { background: linear-gradient(135deg, #2a1540, #1e0e30); }
.ve-panel__head--orange { background: linear-gradient(135deg, #3d1a00, #5c2800); }
.ve-panel__head--muted  { background: linear-gradient(135deg, #2a2f36, #1e2228); }
.ve-panel__head--light  {
  background: var(--vld-surface-alt, #f4f6f8);
  border-bottom: 1.5px solid var(--vld-border, #e2e6ea);
}

.ve-panel__head-icon {
  width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,.13); color: rgba(255,255,255,.9);
}
.ve-panel__head-icon--light {
  background: rgba(61,96,128,.10); color: var(--vld-primary, #3d6080);
}
.ve-panel__head-title {
  font-family: var(--vld-font-display, 'Merriweather', serif);
  font-size: 14px; font-weight: 700; color: #fff; line-height: 1.2;
}
.ve-panel__head-title--light { color: var(--vld-text-strong, #1e2a35); }
.ve-panel__head-sub {
  font-size: 11.5px; color: rgba(255,255,255,.50); margin-top: 2px;
}
.ve-panel__head-sub--light { color: var(--vld-text-muted, #8a9aaa); }

.ve-panel__body {
  padding: 18px 20px;
  background: var(--vld-surface, #fff);
  border: 1.5px solid var(--vld-border, #e2e6ea);
  border-top: none;
  border-radius: 0 0 14px 14px;
}
.ve-panel__body--center {
  display: flex; align-items: center;
}
.ve-panel__body--stats {
  display: flex; align-items: center; justify-content: space-around;
  padding: 22px 20px;
}

/* ── Summary card (dispo + capacité merged) ───────────────── */
.ve-panel--summary { border: 1.5px solid var(--vld-border, #e2e6ea); }
.ve-panel__body--summary {
  display: flex; align-items: center; gap: 0;
  padding: 0;
  background: var(--vld-surface, #fff);
  border-radius: 0 0 14px 14px;
}
.ve-summary-block {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px;
  padding: 22px 24px;
}
.ve-summary-block__label {
  font-size: 11px; font-weight: 700; letter-spacing: .06em;
  text-transform: uppercase; color: var(--vld-text-muted, #8a9aaa);
}
.ve-summary-sep {
  width: 1.5px; height: 64px; background: var(--vld-border, #e2e6ea); flex-shrink: 0;
}
.ve-stat-inline {
  display: flex; align-items: baseline; gap: 5px;
}
.ve-stat-inline__num {
  font-family: var(--vld-font-display, 'Merriweather', serif);
  font-size: 36px; font-weight: 700; line-height: 1;
  color: var(--vld-primary, #3d6080); letter-spacing: -.03em;
}
.ve-stat-inline__unit {
  font-size: 14px; font-weight: 600; color: var(--vld-text-muted, #8a9aaa);
}

/* ── Stat blocks (legacy, kept for safety) ────────────────── */
.ve-stat { text-align: center; }
.ve-stat__num {
  font-family: var(--vld-font-display, 'Merriweather', serif);
  font-size: 44px; font-weight: 700; line-height: 1; letter-spacing: -.03em;
  margin-bottom: 8px;
}
.ve-stat__num--blue { color: var(--vld-primary, #3d6080); }
.ve-stat__num--teal { color: #009f7a; }
.ve-stat__label {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12.5px; font-weight: 600; color: var(--vld-text-muted, #8a9aaa);
}
.ve-stat__sep {
  width: 1px; height: 60px; background: var(--vld-border, #e2e6ea);
}

/* ── Dispo pill ───────────────────────────────────────────── */
.ve-dispo-pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 16px; border-radius: 999px;
  font-size: 14px; font-weight: 700;
}
.ve-dispo-pill__dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.ve-dispo-oui       { background: #d4f0de; color: #1a6b32; border: 1.5px solid #a3d9b4; }
.ve-dispo-oui       .ve-dispo-pill__dot { background: #1a6b32; }
.ve-dispo-partielle { background: #fef3d7; color: #8a5a00; border: 1.5px solid #f5d88a; }
.ve-dispo-partielle .ve-dispo-pill__dot { background: #d98e1a; }
.ve-dispo-non       { background: #fde8e8; color: #922b21; border: 1.5px solid #f5c6cb; }
.ve-dispo-non       .ve-dispo-pill__dot { background: #d94040; }

/* ── Text blocks ──────────────────────────────────────────── */
.ve-text-block {
  white-space: pre-wrap; font-size: 14px;
  color: var(--vld-text, #3a4a5a); line-height: 1.65; margin: 0;
}
.ve-text-block--comment {
  background: var(--vld-surface-alt, #f7f8f9);
  border: 1.5px solid var(--vld-border, #e2e6ea);
  border-radius: 10px; padding: 14px 16px;
  font-size: 13.5px;
}

/* ── Bool pill ────────────────────────────────────────────── */
.ve-bool-pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 16px; border-radius: 999px;
  font-size: 14px; font-weight: 700;
}
.ve-bool-pill--yes { background: #d4f0de; color: #1a6b32; border: 1.5px solid #a3d9b4; }
.ve-bool-pill--no  { background: #fde8e8; color: #922b21; border: 1.5px solid #f5c6cb; }

/* ── No data ──────────────────────────────────────────────── */
.ve-no-data {
  text-align: center; color: var(--vld-text-muted, #8a9aaa);
  font-size: 14px; padding: 40px;
}

/* ══ MODAL ════════════════════════════════════════════════════ */
.ve-modal-overlay {
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(10, 18, 26, 0.60);
  backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px 16px;
  overflow-y: auto;
}
.ve-modal {
  width: 100%; max-width: 780px;
  background: var(--vld-surface, #fff);
  border-radius: 20px;
  box-shadow: 0 32px 80px rgba(0,0,0,.30), 0 4px 16px rgba(0,0,0,.14);
  overflow: hidden;
  max-height: calc(100vh - 40px);
  display: flex; flex-direction: column;
}
.ve-modal__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px;
  background: linear-gradient(135deg, #1a2d3e 0%, #243d52 100%);
  flex-shrink: 0;
  min-height: 72px;
  position: sticky; top: 0; z-index: 1;
}
.ve-modal__header-left {}
.ve-modal__eyebrow {
  font-size: 10px; font-weight: 700; letter-spacing: .10em;
  text-transform: uppercase; color: rgba(255,255,255,.45); margin-bottom: 3px;
}
.ve-modal__title {
  font-family: var(--vld-font-display, 'Merriweather', serif);
  font-size: 17px; font-weight: 700; color: #fff; margin: 0;
}
.ve-modal__close {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,.18);
  background: rgba(255,255,255,.10); color: rgba(255,255,255,.75);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  transition: background .15s, color .15s;
}
.ve-modal__close:hover { background: rgba(220,80,60,.30); border-color: rgba(220,80,60,.50); color: #ffcccc; }
.ve-modal__body {
  overflow-y: auto; padding: 28px 28px 36px;
  flex: 1;
}
.ve-modal__body :deep(.fv-root) { max-width: 100%; }
.ve-modal__body :deep(.fv-hero) { display: none; }

/* ── Modal transition ─────────────────────────────────────── */
.ve-modal-enter-active,
.ve-modal-leave-active { transition: opacity .22s ease; }
.ve-modal-enter-active .ve-modal,
.ve-modal-leave-active .ve-modal {
  transition: opacity .22s ease, transform .22s cubic-bezier(.34,1.56,.64,1);
}
.ve-modal-enter-from, .ve-modal-leave-to { opacity: 0; }
.ve-modal-enter-from .ve-modal  { transform: scale(.96) translateY(14px); opacity: 0; }
.ve-modal-leave-to  .ve-modal   { transform: scale(.96) translateY(8px); opacity: 0; }

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 600px) {
  .ve-panels { grid-template-columns: 1fr; }
  .ve-panel--full, .ve-panel--half, .ve-panel--cap { grid-column: 1; }
  .ve-hero { padding: 20px; }
  .ve-hero__right { width: 100%; flex-direction: row; align-items: center; justify-content: space-between; }
  .ve-modal__body { padding: 16px 16px 28px; }
}
</style>