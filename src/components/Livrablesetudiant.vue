<template>
  <div class="lv-root">

    <!-- TOAST -->
    <Transition name="toast">
      <div v-if="toast.show" class="lv-toast" :class="toast.type === 'ok' ? 'lv-toast--ok' : 'lv-toast--err'">
        <svg v-if="toast.type === 'ok'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        {{ toast.msg }}
        <button class="lv-toast__x" @click="toast.show = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════════════════
         MAIN WIDGET — one big card that holds everything
         ══════════════════════════════════════════════════════ -->
    <div class="lv-widget">

      <!-- ── WIDGET HEADER ──────────────────────────────── -->
      <div class="lv-widget__header">
        <div class="lv-widget__header-left">
          <div class="lv-widget__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div>
            <h2 class="lv-widget__title">Mes livrables</h2>
            <p class="lv-widget__sub">Déposez vos documents — seules les phases activées par le chef sont accessibles</p>
          </div>
        </div>
        <div class="lv-kpi-strip">
          <div class="lv-kpi lv-kpi--ok">
            <strong>{{ nValides }}</strong><span>Validé(s)</span>
          </div>
          <div class="lv-kpi lv-kpi--warn">
            <strong>{{ nAttente }}</strong><span>En attente</span>
          </div>
          <div class="lv-kpi lv-kpi--ko">
            <strong>{{ nRejetes }}</strong><span>Rejeté(s)</span>
          </div>
        </div>
      </div>

      <!-- ── LOADING ──────────────────────────────────────── -->
      <div v-if="loading" class="lv-loading">
        <div class="lv-spinner"></div>
        <p>Chargement des données...</p>
      </div>

      <template v-else>

        <!-- ── PHASE 0 / SUJET BAND ──────────────────────── -->
        <div class="lv-sujet-band">
          <div class="lv-sujet-band__label">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Phase 0 — Sujet de projet
          </div>

          <div v-if="isManuel || (projet && projet.valide)" class="lv-sujet-ok">
            <div class="lv-sujet-ok__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span class="lv-sujet-ok__title">{{ isManuel ? (affectation?.titre_projet || 'Sujet convenu avec l\'encadrant') : projet.titre }}</span>
            <span class="lv-sujet-badge lv-sujet-badge--ok">{{ isManuel ? 'Accord mutuel' : 'Validé' }}</span>
          </div>

          <div v-else-if="projet && !projet.valide && !sujetFormOpen" class="lv-sujet-ok lv-sujet-ok--pending">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span class="lv-sujet-ok__title">{{ projet.titre }}</span>
            <span class="lv-sujet-badge lv-sujet-badge--wait">En attente</span>
            <button class="lv-sujet-edit" @click="openSujetForm">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier
            </button>
          </div>

          <div v-else class="lv-sujet-form">
            <div v-if="affectation && affectation.mode === 'semi'" class="lv-sujet-form__hint">
              Proposez votre sujet — il sera validé par votre encadrant.
            </div>
            <div class="lv-sujet-form__row">
              <div class="lv-sujet-form__field">
                <label>Titre <span class="req">*</span></label>
                <input v-model="sujetForm.titre" placeholder="Titre du projet..." />
              </div>
              <div class="lv-sujet-form__field lv-sujet-form__field--wide">
                <label>Description <span class="req">*</span></label>
                <textarea v-model="sujetForm.description" rows="2" placeholder="Objectifs, méthodologie, livrables..."></textarea>
              </div>
              <div class="lv-sujet-form__actions">
                <button v-if="sujetFormOpen" class="lv-btn lv-btn--ghost" @click="sujetFormOpen = false">Annuler</button>
                <button class="lv-btn lv-btn--gold" :disabled="sujetSaving" @click="soumettreProjet">
                  <div v-if="sujetSaving" class="lv-spinner lv-spinner--sm"></div>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ projet ? 'Enregistrer' : 'Confirmer le sujet' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ── PHASES SECTION LABEL ──────────────────────── -->
        <div class="lv-phases-label">
          <span>Phases du projet</span>
          <span class="lv-phases-count">{{ phases.length }} phase{{ phases.length !== 1 ? 's' : '' }}</span>
        </div>

        <!-- ── DEADLINE WARNING BANNERS ──────────────────── -->
        <template v-for="phase in deadlineWarnings" :key="'dw-'+phase.id">
          <div class="lv-deadline-banner"
            :class="phase.joursRestants < 0 ? 'lv-deadline-banner--expired'
                   : phase.joursRestants === 0 ? 'lv-deadline-banner--today'
                   : 'lv-deadline-banner--soon'">
            <div class="lv-deadline-banner__icon">
              <svg v-if="phase.joursRestants < 0" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div class="lv-deadline-banner__body">
              <span class="lv-deadline-banner__title">
                <strong>{{ phase.nom }}</strong> —
                <template v-if="phase.joursRestants < 0">
                  Phase expirée depuis {{ Math.abs(phase.joursRestants) }} jour(s). Déposez votre livrable dès que possible.
                </template>
                <template v-else-if="phase.joursRestants === 0">
                  Date limite aujourd'hui ! Déposez votre livrable avant la clôture.
                </template>
                <template v-else>
                  Plus que <strong>{{ phase.joursRestants }} jour(s)</strong> pour déposer votre livrable (échéance : {{ phase.dateFin }}).
                </template>
              </span>
              <span v-if="!phase.livrable" class="lv-deadline-banner__chip">Livrable non déposé</span>
              <span v-else-if="phase.livrable.statut === 'rejete'" class="lv-deadline-banner__chip lv-deadline-banner__chip--ko">Livrable rejeté</span>
            </div>
          </div>
        </template>

        <!-- ── EMPTY ─────────────────────────────────────── -->
        <div v-if="!phases.length" class="lv-empty">
          <div class="lv-empty__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <p class="lv-empty__title">Aucune phase activée pour le moment</p>
          <p class="lv-empty__sub">Vous serez notifié(e) dès qu'une phase sera ouverte.</p>
        </div>

        <!-- ── PHASES GRID ───────────────────────────────── -->
        <div v-else class="lv-phases">
          <template v-for="(phase, idx) in phases" :key="phase.id">
            <!-- Arrow between consecutive cards -->
            <div v-if="idx > 0" class="lv-phase-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          <div
            class="lv-phase-card"
            :class="{
              'lv-phase-card--active':   phase.active && !phase.terminee,
              'lv-phase-card--done':     phase.terminee,
              'lv-phase-card--locked':   !phase.active && !phase.terminee,
            }">

            <!-- Lock overlay -->
            <div v-if="!phase.active && !phase.terminee" class="lv-phase-lock">
              <div class="lv-phase-lock__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <span>Non activée</span>
            </div>

            <!-- Main card body -->
            <div class="lv-pc-body">

              <!-- Phase header row -->
              <div class="lv-pc-header">
                <div class="lv-pc-phase-num">Phase {{ phase.ordre }}</div>
                <div class="lv-pc-status"
                  :class="phase.terminee ? 'lv-pc-status--done' : phase.active ? 'lv-pc-status--active' : 'lv-pc-status--locked'">
                  <svg v-if="phase.terminee" xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  <svg v-else-if="phase.active" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="7"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  {{ phase.terminee ? 'Terminée' : phase.active ? 'En cours' : 'Inactive' }}
                </div>
              </div>

              <!-- Phase name -->
              <div class="lv-pc-nom">{{ phase.nom }}</div>

              <!-- Dates -->
              <div class="lv-pc-dates">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ phase.dateDebut }} — {{ phase.dateFin }}
              </div>

              <!-- Divider -->
              <div class="lv-pc-divider"></div>

              <!-- No livrable required -->
              <div v-if="!phase.livrableObligatoire" class="lv-pc-no-lv">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Aucun livrable requis
              </div>

              <template v-if="phase.livrableObligatoire">
                <!-- Has livrable -->
                <div v-if="phase.livrable" class="lv-pc-livrable">
                  <div class="lv-pc-file">
                    <div class="lv-pc-file-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div class="lv-pc-file-info">
                      <div class="lv-pc-file-name">{{ phase.livrable.fileName }}</div>
                      <div class="lv-pc-file-date">
                        {{ phase.livrable.dateDepot }}
                        <span v-if="phase.livrable.version > 1" class="lv-version-chip">v{{ phase.livrable.version }}</span>
                      </div>
                    </div>
                    <span class="lv-status-badge"
                      :class="{
                        'lv-status-badge--wait': phase.livrable.statut === 'en_attente',
                        'lv-status-badge--ok':   phase.livrable.statut === 'valide',
                        'lv-status-badge--ko':   phase.livrable.statut === 'rejete',
                      }">
                      {{ { en_attente: 'En attente', valide: 'Validé', rejete: 'Rejeté' }[phase.livrable.statut] || phase.livrable.statut }}
                    </span>
                  </div>
                  <div v-if="phase.livrable.statut === 'rejete' && phase.livrable.commentaire" class="lv-pc-comment">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {{ phase.livrable.commentaire }}
                  </div>
                  <div class="lv-pc-actions">
                    <label
                      v-if="phase.livrable.statut !== 'valide' && !phase.terminee"
                      :for="'f' + phase.id"
                      class="lv-btn lv-btn--replace">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.85"/></svg>
                      Remplacer
                    </label>
                    <button
                      v-if="phase.livrable.statut === 'en_attente' && !phase.livrable.verrouille && !phase.terminee"
                      class="lv-btn lv-btn--danger"
                      @click="retirerLivrable(phase)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      Retirer
                    </button>
                    <input type="file" :id="'f' + phase.id" accept="application/pdf" @change="uploadReplace($event, phase)" style="display:none" />
                  </div>
                </div>

                <!-- Upload zone -->
                <div v-else class="lv-pc-depot">
                  <label v-if="!phase.terminee" :for="'fnew' + phase.id" class="lv-btn lv-btn--depot">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Déposer un PDF
                  </label>
                  <div v-else class="lv-pc-missed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Phase terminée sans livrable
                  </div>
                  <input type="file" :id="'fnew' + phase.id" accept="application/pdf" @change="upload($event, phase)" style="display:none" />
                </div>
              </template>

              <!-- Historique button — only for phases that require a livrable -->
              <button
                v-if="phase.livrableObligatoire"
                class="lv-hist-btn"
                @click.stop="toggleHist(phase.id)"
                title="Voir l'historique des dépôts">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.85"/></svg>
                Historique
                <span v-if="phaseHistory(phase.id).length" class="lv-hist-btn__count">{{ phaseHistory(phase.id).length }}</span>
              </button>

            </div><!-- /lv-pc-body -->

          </div><!-- /lv-phase-card -->
          </template>
        </div><!-- /lv-phases -->

        <!-- ── HISTORIQUE POPUP MODAL ───────────────────── -->
        <Teleport to="body">
          <Transition name="lv-modal">
            <div v-if="histOpenPhase !== null" class="lv-root" style="all:unset;display:contents">
            <div class="lv-hist-overlay" @click.self="histOpenPhase = null">
              <div class="lv-hist-modal">

                <!-- ── Header — dark blue gradient like mfm ── -->
                <div class="lv-hist-modal__head">
                  <div class="lv-hist-modal__head-left">
                    <div class="lv-hist-modal__icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.85"/></svg>
                    </div>
                    <div>
                      <div class="lv-hist-modal__title">Historique des dépôts</div>
                      <div class="lv-hist-modal__phase-name">{{ phases.find(p => p.id === histOpenPhase)?.nom }}</div>
                    </div>
                  </div>
                  <button class="lv-hist-modal__close" @click="histOpenPhase = null">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                <!-- ── Stats bar ───────────────────────────── -->
                <div v-if="phaseHistory(histOpenPhase).length" class="lv-hist-modal__stats">
                  <div class="lv-hist-stat lv-hist-stat--total">
                    <span class="lv-hist-stat__num">{{ phaseHistory(histOpenPhase).length }}</span>
                    <span class="lv-hist-stat__lbl">Total</span>
                  </div>
                  <div class="lv-hist-stat lv-hist-stat--ok">
                    <span class="lv-hist-stat__num">{{ phaseHistory(histOpenPhase).filter(e => e.statut === 'valide').length }}</span>
                    <span class="lv-hist-stat__lbl">Validé(s)</span>
                  </div>
                  <div class="lv-hist-stat lv-hist-stat--wait">
                    <span class="lv-hist-stat__num">{{ phaseHistory(histOpenPhase).filter(e => e.statut === 'en_attente').length }}</span>
                    <span class="lv-hist-stat__lbl">En attente</span>
                  </div>
                  <div class="lv-hist-stat lv-hist-stat--ko">
                    <span class="lv-hist-stat__num">{{ phaseHistory(histOpenPhase).filter(e => e.statut === 'rejete').length }}</span>
                    <span class="lv-hist-stat__lbl">Rejeté(s)</span>
                  </div>
                  <div v-if="phaseHistory(histOpenPhase).some(e => e.statut === 'retire' || e.statut === 'remplace')" class="lv-hist-stat lv-hist-stat--muted">
                    <span class="lv-hist-stat__num">{{ phaseHistory(histOpenPhase).filter(e => e.statut === 'retire' || e.statut === 'remplace').length }}</span>
                    <span class="lv-hist-stat__lbl">Archivé(s)</span>
                  </div>
                </div>

                <!-- ── Body ───────────────────────────────── -->
                <div class="lv-hist-modal__body">
                  <div v-if="!phaseHistory(histOpenPhase).length" class="lv-hist-empty">
                    <div class="lv-hist-empty__icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <p class="lv-hist-empty__title">Aucun dépôt pour cette phase</p>
                    <p class="lv-hist-empty__sub">Les dépôts apparaîtront ici dès qu'un fichier sera soumis.</p>
                  </div>

                  <div v-else class="lv-hist-timeline">
                    <div
                      v-for="(entry, idx) in phaseHistory(histOpenPhase)"
                      :key="entry.id"
                      class="lv-hist-entry"
                      :class="{
                        'lv-hist-entry--ok':   entry.statut === 'valide',
                        'lv-hist-entry--ko':   entry.statut === 'rejete',
                        'lv-hist-entry--wait': entry.statut === 'en_attente',
                      }">
                      <div class="lv-hist-entry__track">
                        <div class="lv-hist-entry__dot"></div>
                        <div v-if="idx < phaseHistory(histOpenPhase).length - 1" class="lv-hist-entry__line"></div>
                      </div>
                      <div class="lv-hist-entry__content">
                        <div class="lv-hist-entry__card">
                          <!-- File icon + name row -->
                          <div class="lv-hist-entry__file-row">
                            <div class="lv-hist-entry__file-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            </div>
                            <div class="lv-hist-entry__file-info">
                              <div class="lv-hist-entry__top">
                                <span class="lv-hist-fname">{{ entry.fileName }}</span>
                                <span v-if="entry.version > 1" class="lv-version-chip">v{{ entry.version }}</span>
                              </div>
                              <div class="lv-hist-entry__meta">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                Déposé le {{ entry.dateDepot }}
                              </div>
                            </div>
                          </div>
                          <!-- Status + open button -->
                          <div class="lv-hist-entry__row">
                            <span class="lv-status-badge lv-status-badge--sm"
                              :class="{
                                'lv-status-badge--ok':      entry.statut === 'valide',
                                'lv-status-badge--ko':      entry.statut === 'rejete',
                                'lv-status-badge--wait':    entry.statut === 'en_attente',
                                'lv-status-badge--retire':  entry.statut === 'retire',
                                'lv-status-badge--remplace': entry.statut === 'remplace',
                              }">
                              {{ { en_attente: 'En attente', valide: 'Validé', rejete: 'Rejeté', retire: 'Retiré', remplace: 'Remplacé' }[entry.statut] || entry.statut }}
                            </span>
                            <a v-if="entry.fichier_url && entry.statut !== 'retire'" :href="entry.fichier_url" target="_blank" class="lv-hist-entry__open">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                              Ouvrir le fichier
                            </a>
                          </div>
                          <!-- Rejection comment -->
                          <div v-if="entry.commentaire" class="lv-hist-entry__comment">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            {{ entry.commentaire }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ── Footer ─────────────────────────────── -->
                <div class="lv-hist-modal__foot">
                  <button class="lv-btn lv-btn--ghost" @click="histOpenPhase = null">Fermer</button>
                </div>

              </div>
            </div>
            </div><!-- /lv-root wrapper -->
          </Transition>
        </Teleport>

      </template>
    </div><!-- /lv-widget -->

    <!-- ── CONFIRM RETIRER MODAL ──────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="lv-modal">
        <div v-if="modalRetirer" class="lv-root" style="all:unset;display:contents">
        <div class="lv-hist-overlay" @click.self="modalRetirer = false">
          <div class="lv-retirer-modal">

            <!-- Header — red gradient -->
            <div class="lv-retirer-modal__head">
              <div class="lv-retirer-modal__head-left">
                <div class="lv-retirer-modal__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </div>
                <div>
                  <div class="lv-retirer-modal__title">Retirer le livrable</div>
                  <div class="lv-retirer-modal__sub">{{ phaseARetirer?.nom }}</div>
                </div>
              </div>
              <button class="lv-retirer-modal__close" @click="modalRetirer = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Body -->
            <div class="lv-retirer-modal__body">
              <!-- File preview chip -->
              <div class="lv-retirer-modal__file-chip">
                <div class="lv-retirer-modal__file-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <span class="lv-retirer-modal__file-name">{{ phaseARetirer?.livrable?.fileName }}</span>
              </div>
              <!-- Warning message -->
              <div class="lv-retirer-modal__warn">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>Ce fichier sera supprimé définitivement. Cette action est irréversible.</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="lv-retirer-modal__foot">
              <button class="lv-btn lv-btn--ghost" @click="modalRetirer = false">Annuler</button>
              <button class="lv-btn lv-btn--danger" :disabled="retirerLoading" @click="confirmerRetirer">
                <div v-if="retirerLoading" class="lv-spinner lv-spinner--sm"></div>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                Supprimer
              </button>
            </div>

          </div>
        </div>
        </div><!-- /lv-root wrapper -->
      </Transition>
    </Teleport>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'LivrablesEtudiant',
  data() {
    return {
      toast:         { show: false, msg: '', type: 'ok' },
      phases:        [],
      histLivrables: [],
      loading:       false,
      affectation:   null,
      projet:        null,
      sujetFormOpen: false,
      sujetSaving:   false,
      sujetForm:     { titre: '', description: '' },
      histOpenPhase:   null,
      // Confirm-retirer modal
      modalRetirer:    false,
      phaseARetirer:   null,
      retirerLoading:  false,
    }
  },
  computed: {
    nValides()  { return this.phases.filter(p => p.livrable?.statut === 'valide').length },
    nAttente()  { return this.phases.filter(p => p.livrable?.statut === 'en_attente').length },
    nRejetes()  { return this.phases.filter(p => p.livrable?.statut === 'rejete').length },
    isManuel()  { return this.affectation?.mode === 'manuel' },
    /**
     * Active phases where:
     *  - livrable is required AND
     *  - (deadline is within 3 days OR has passed) AND
     *  - no validated livrable yet
     */
    deadlineWarnings() {
      const today = new Date(); today.setHours(0,0,0,0)
      return this.phases.filter(phase => {
        if (!phase.active || phase.terminee) return false
        if (!phase.livrableObligatoire) return false
        if (phase.livrable?.statut === 'valide') return false
        if (!phase.dateFin_raw) return false
        const fin = new Date(phase.dateFin_raw); fin.setHours(0,0,0,0)
        const diff = Math.round((fin - today) / 86400000) // days
        return diff <= 3
      }).map(phase => {
        const today = new Date(); today.setHours(0,0,0,0)
        const fin = new Date(phase.dateFin_raw); fin.setHours(0,0,0,0)
        return { ...phase, joursRestants: Math.round((fin - today) / 86400000) }
      })
    },
  },
  mounted() { this.chargerDonnees() },
  methods: {
    phaseHistory(phaseId) {
      return this.histLivrables.filter(h => h.phase_id === phaseId)
    },
    toggleHist(phaseId) {
      this.histOpenPhase = this.histOpenPhase === phaseId ? null : phaseId
    },

    async chargerDonnees() {
      this.loading = true
      try {
        const [resPhases, resLivrables, resAff, resProjet, resHist] = await Promise.all([
          api.get('/phases'),
          api.get('/livrables').catch(() => ({ data: [] })),
          api.get('/affectations/mon-affectation').catch(() => ({ data: null })),
          api.get('/projets/mon-projet').catch(() => ({ data: null })),
          api.get('/livrables/historique').catch(() => ({ data: [] })),
        ])

        this.affectation = resAff.data || null
        const p = resProjet.data
        this.projet = (p && p.id) ? p : null
        if (this.projet) {
          this.sujetForm.titre       = this.projet.titre       || ''
          this.sujetForm.description = this.projet.description || ''
        }

        const livrablesMap = {}
        ;(resLivrables.data || []).forEach(l => {
          if (livrablesMap[l.phase_id]) return  // already have the newest — skip older ones
          livrablesMap[l.phase_id] = {
            id:          l.id,
            fileName:    l.file_name || (l.fichier ? l.fichier.split('/').pop() : 'fichier.pdf'),
            fichier_url: l.fichier_url || null,
            dateDepot:   this.formatDate(l.depose_le),
            statut:      l.statut,
            commentaire: l.commentaire ?? null,
            verrouille:  l.verrouille ?? false,
            version:     l.version ?? 1,
          }
        })

        this.phases = (resPhases.data || [])
          .filter(p => p.type !== 'sujet')
          .map(p => ({
            id:                  p.id,
            ordre:               p.ordre,
            nom:                 p.nom,
            dateDebut:           this.formatDate(p.date_debut),
            dateFin:             this.formatDate(p.date_fin),
            dateFin_raw:         p.date_fin || null,
            active:              !!p.active,
            terminee:            !!p.terminee,
            livrableObligatoire: !!p.livrable_obligatoire,
            livrable:            livrablesMap[p.id] || null,
          }))

        const histRaw = resHist.data?.length ? resHist.data : resLivrables.data || []
        const phaseNames = {}
        this.phases.forEach(ph => { phaseNames[ph.id] = ph.nom })

        this.histLivrables = histRaw
          .map(l => ({
            id:               l.id,
            phase_id:         l.phase_id,
            phase_nom:        l.phase_nom || phaseNames[l.phase_id] || `Phase ${l.phase_id}`,
            fileName:         l.file_name || (l.fichier ? l.fichier.split('/').pop() : 'fichier.pdf'),
            fichier_url:      l.fichier_url || null,
            depose_le_raw:    l.depose_le || null,
            dateDepot:        this.formatDate(l.depose_le),
            dateRemplacement: l.remplace_le ? this.formatDate(l.remplace_le) : null,
            statut:           l.statut,
            commentaire:      l.commentaire ?? null,
            version:          l.version ?? 1,
          }))
          .sort((a, b) => new Date(b.depose_le_raw) - new Date(a.depose_le_raw))

      } catch (error) {
        console.error('Erreur livrables:', error)
        this.showToast('Erreur de chargement', 'err')
      } finally {
        this.loading = false
      }
    },

    openSujetForm() {
      if (this.projet) {
        this.sujetForm.titre       = this.projet.titre       || ''
        this.sujetForm.description = this.projet.description || ''
      }
      this.sujetFormOpen = true
    },

    async soumettreProjet() {
      if (!this.sujetForm.titre.trim() || !this.sujetForm.description.trim()) {
        this.showToast('Veuillez remplir le titre et la description.', 'err'); return
      }
      this.sujetSaving = true
      try {
        if (this.projet && this.projet.id) {
          const res = await api.put(`/projets/${this.projet.id}`, { titre: this.sujetForm.titre, description: this.sujetForm.description })
          this.projet = res.data
          this.showToast('Sujet mis à jour ✓')
        } else {
          const res = await api.post('/projets', { titre: this.sujetForm.titre, description: this.sujetForm.description })
          this.projet = res.data
          this.showToast('Sujet soumis — en attente de validation ✓')
        }
        this.sujetFormOpen = false
      } catch (error) {
        this.showToast(error.response?.data?.message || 'Erreur lors de la soumission', 'err')
      } finally {
        this.sujetSaving = false
      }
    },

    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      if (isNaN(d)) return date
      return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
    },

    retirerLivrable(phase) {
      this.phaseARetirer = phase
      this.modalRetirer  = true
    },

    async confirmerRetirer() {
      if (!this.phaseARetirer) return
      this.retirerLoading = true
      const phase      = this.phaseARetirer
      const livrableId = phase.livrable.id  // capture before any mutation
      try {
        await api.delete(`/livrables/${livrableId}`)
        // Clear active livrable immediately in local state
        const idx = this.phases.findIndex(p => p.id === phase.id)
        if (idx !== -1) this.phases[idx].livrable = null
        this.modalRetirer  = false
        this.phaseARetirer = null
        this.showToast('Livrable retiré ✓')
        this.chargerDonnees()
      } catch (error) {
        this.showToast(error.response?.data?.message || 'Impossible de retirer le livrable', 'err')
      } finally {
        this.retirerLoading = false
      }
    },

    async upload(e, phase) {
      await this._doUpload(e, phase, false)
    },

    async uploadReplace(e, phase) {
      await this._doUpload(e, phase, true)
    },

    async _doUpload(e, phase, isReplace) {
      const file = e.target.files[0]
      if (!file || file.type !== 'application/pdf') { this.showToast('Fichier PDF uniquement', 'err'); return }
      const formData = new FormData()
      formData.append('phase_id', phase.id)
      formData.append('fichier', file)
      try {
        const res = await api.post('/livrables', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        const l   = res.data
        const idx = this.phases.findIndex(p => p.id === phase.id)
        if (idx !== -1) {
          this.phases[idx].livrable = {
            id:          l.id,
            fileName:    l.file_name || file.name,
            fichier_url: l.fichier_url || null,
            dateDepot:   this.formatDate(l.depose_le),
            statut:      l.statut || 'en_attente',
            commentaire: null,
            verrouille:  false,
            version:     l.version ?? 1,
          }
        }
        this.showToast(isReplace ? `Livrable remplacé pour "${phase.nom}" ✓` : `Livrable déposé pour "${phase.nom}" ✓`)
        this.chargerDonnees()
      } catch (error) {
        this.showToast(error.response?.data?.message || (isReplace ? 'Erreur lors du remplacement' : 'Erreur lors du dépôt'), 'err')
      }
      e.target.value = ''
    },

    showToast(msg, type = 'ok') {
      this.toast = { show: true, msg, type }
      setTimeout(() => (this.toast.show = false), 3200)
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

/* ════════════════════════════════════════════════════════════
   LIVRABLES ÉTUDIANT — Design-token aligned, light warm theme
   Gold × Steel Blue on warm beige/grey
   ════════════════════════════════════════════════════════════ */

/* ── Root tokens (aligned to design-tokens.css) ─────────── */
.lv-root {
  /* Core brand */
  --lv-blue:           #3d6080;
  --lv-blue-dark:      #2f4f6a;
  --lv-blue-light:     #5a7fa0;
  --lv-blue-muted:     rgba(61, 96, 128, .12);
  --lv-blue-border:    rgba(61, 96, 128, .22);
  --lv-gold:           #F5C518;
  --lv-gold-dark:      #c9a100;
  --lv-gold-muted:     rgba(245, 197, 24, .18);
  --lv-gold-border:    rgba(245, 197, 24, .32);

  /* Surfaces — warm neutral */
  --lv-bg:             #c4c0b8;
  --lv-surface:        #dedbd4;
  --lv-surface-alt:    #e9e6df;
  --lv-surface-raised: #f0ede7;
  --lv-surface-card:   #f4f1ec;
  --lv-border:         #c0bbb3;
  --lv-border-strong:  #aaa59d;

  /* Text */
  --lv-text-strong:    #18232e;
  --lv-text:           #3d4f5e;
  --lv-text-muted:     #6e8499;
  --lv-text-faint:     #8fa3b4;

  /* Feedback */
  --lv-ok:             #1e9e60;
  --lv-ok-bg:          rgba(30, 158, 96, .10);
  --lv-ok-border:      rgba(30, 158, 96, .25);
  --lv-ko:             #d94040;
  --lv-ko-bg:          rgba(217, 64, 64, .10);
  --lv-ko-border:      rgba(217, 64, 64, .25);
  --lv-wait:           #e09020;
  --lv-wait-bg:        rgba(224, 144, 32, .12);
  --lv-wait-border:    rgba(224, 144, 32, .28);

  /* Sidebar (history panel) — matches vld-sb tokens */
  --lv-sb-bg:          #2f4f6a;
  --lv-sb-mid:         #243d52;
  --lv-sb-border:      rgba(255, 255, 255, .08);
  --lv-sb-text:        rgba(255, 255, 255, .65);
  --lv-sb-text-strong: #ffffff;
  --lv-sb-hover:       rgba(255, 255, 255, .07);
  --lv-sb-active:      rgba(245, 197, 24, .14);
  --lv-sb-gold:        #F5C518;

  /* Motion */
  --lv-ease:           cubic-bezier(.22, 1, .36, 1);
  --lv-t-base:         .18s;
  --lv-t-fast:         .12s;

  /* Radius */
  --lv-r-sm:  8px;
  --lv-r-md:  12px;
  --lv-r-lg:  16px;
  --lv-r-xl:  20px;
  --lv-r-2xl: 24px;

  font-family: 'DM Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  letter-spacing: -0.01em;
}

/* ── Toast ───────────────────────────────────────────────── */
.lv-toast {
  position: fixed;
  top: 20px; right: 20px; z-index: 9999;
  display: flex; align-items: center; gap: 9px;
  padding: 11px 16px;
  border-radius: var(--lv-r-md);
  font-size: 13.5px; font-weight: 600;
  box-shadow: 0 8px 28px rgba(0,0,0,.18);
  backdrop-filter: blur(12px);
}
.lv-toast--ok  { background: #fff; border: 1.5px solid var(--lv-ok); color: var(--lv-ok); box-shadow: 0 4px 18px rgba(30,158,96,.14); }
.lv-toast--err { background: #fff; border: 1.5px solid var(--lv-ko); color: var(--lv-ko); box-shadow: 0 4px 18px rgba(217,64,64,.14); }
.lv-toast__x {
  background: none; border: none; cursor: pointer; opacity: .5;
  color: inherit; padding: 0; margin-left: 4px; display: flex; align-items: center;
  transition: opacity var(--lv-t-fast);
}
.lv-toast__x:hover { opacity: 1; }
.toast-enter-from { opacity: 0; transform: translateY(-10px) scale(.96); }
.toast-enter-active { transition: all .22s var(--lv-ease); }
.toast-leave-to { opacity: 0; transform: translateY(-6px) scale(.98); }
.toast-leave-active { transition: all .16s ease; }

/* ══════════════════════════════════════════════════════════
   WIDGET SHELL — the big outer card
   ══════════════════════════════════════════════════════════ */
.lv-widget {
  background: var(--lv-surface);
  border: 1px solid var(--lv-border);
  border-radius: var(--lv-r-2xl);
  overflow: hidden;
  box-shadow:
    0 1px 3px rgba(0,0,0,.06),
    0 4px 16px rgba(0,0,0,.08),
    0 16px 48px rgba(0,0,0,.07);
}

/* ── Widget header ───────────────────────────────────────── */
.lv-widget__header {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
  padding: 22px 28px 18px;
  background: linear-gradient(90deg, var(--lv-blue) 0%, var(--lv-blue-dark) 100%);
  border-bottom: 1px solid rgba(0,0,0,.08);
}
.lv-widget__header-left { display: flex; align-items: center; gap: 14px; }
.lv-widget__icon {
  width: 48px; height: 48px; border-radius: var(--lv-r-md); flex-shrink: 0;
  background: linear-gradient(135deg, var(--lv-gold) 0%, var(--lv-gold-dark) 100%);
  display: flex; align-items: center; justify-content: center;
  color: var(--lv-blue-dark);
  box-shadow: 0 4px 16px rgba(245,197,24,.45), 0 1px 3px rgba(0,0,0,.15);
}
.lv-widget__title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 18px; font-weight: 800; color: #fff;
  margin: 0 0 3px; letter-spacing: -.01em;
}
.lv-widget__sub { font-size: 12.5px; color: rgba(255,255,255,.55); margin: 0; }

/* ── KPI strip ───────────────────────────────────────────── */
.lv-kpi-strip { display: flex; gap: 8px; flex-wrap: wrap; }
.lv-kpi {
  display: flex; flex-direction: column; align-items: center;
  padding: 9px 18px;
  border-radius: var(--lv-r-lg); border: 1px solid;
  min-width: 76px; backdrop-filter: blur(8px);
  transition: transform var(--lv-t-fast), box-shadow var(--lv-t-fast);
}
.lv-kpi:hover { transform: translateY(-1px); }
.lv-kpi strong { font-size: 22px; font-weight: 800; line-height: 1.1; letter-spacing: -0.03em; }
.lv-kpi span   { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; margin-top: 2px; opacity: .85; }
.lv-kpi--ok   { border-color: rgba(30,158,96,.35);  background: rgba(30,158,96,.15);  color: #6eeab4; box-shadow: 0 2px 12px rgba(30,158,96,.18); }
.lv-kpi--warn { border-color: rgba(224,144,32,.35); background: rgba(224,144,32,.15); color: #ffd07a; box-shadow: 0 2px 12px rgba(224,144,32,.18); }
.lv-kpi--ko   { border-color: rgba(217,64,64,.35);  background: rgba(217,64,64,.15);  color: #ffaaaa; box-shadow: 0 2px 12px rgba(217,64,64,.18); }

/* ── Loading ─────────────────────────────────────────────── */
.lv-loading {
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  padding: 64px 28px; color: var(--lv-text-muted); font-size: 13.5px;
}

/* ── Sujet band ──────────────────────────────────────────── */
.lv-sujet-band {
  padding: 16px 28px;
  background: linear-gradient(100deg, rgba(245,197,24,.09) 0%, rgba(245,197,24,.03) 50%, transparent 100%);
  border-bottom: 1px solid var(--lv-border);
  display: flex; align-items: center; flex-wrap: wrap; gap: 14px;
  position: relative; overflow: hidden;
}
.lv-sujet-band::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--lv-gold) 0%, var(--lv-gold-dark) 100%);
  border-radius: 0 2px 2px 0;
}
.lv-sujet-band__label {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em;
  color: var(--lv-gold-dark);
  padding: 5px 13px;
  background: rgba(245,197,24,.12);
  border: 1px solid var(--lv-gold-border);
  border-radius: 999px;
  white-space: nowrap; flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(245,197,24,.12);
}
.lv-sujet-ok {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap; flex: 1;
}
.lv-sujet-ok__icon {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--lv-ok-bg) 0%, rgba(30,158,96,.2) 100%);
  border: 1.5px solid var(--lv-ok-border);
  display: flex; align-items: center; justify-content: center;
  color: var(--lv-ok);
  box-shadow: 0 1px 6px rgba(30,158,96,.18);
}
.lv-sujet-ok svg { color: var(--lv-ok); flex-shrink: 0; }
.lv-sujet-ok__title { font-size: 14px; font-weight: 600; color: var(--lv-text-strong); }
.lv-sujet-badge {
  font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; letter-spacing: .04em;
}
.lv-sujet-badge--ok   { background: var(--lv-ok-bg);   color: var(--lv-ok);   border: 1px solid var(--lv-ok-border); }
.lv-sujet-badge--wait { background: var(--lv-wait-bg); color: var(--lv-wait); border: 1px solid var(--lv-wait-border); }
.lv-sujet-edit {
  background: rgba(245,197,24,.10); border: 1px solid var(--lv-gold-border);
  color: var(--lv-gold-dark); font-size: 11.5px; font-weight: 600;
  padding: 4px 11px; border-radius: var(--lv-r-sm); cursor: pointer;
  display: inline-flex; align-items: center; gap: 5px;
  transition: all var(--lv-t-fast);
}
.lv-sujet-edit:hover { background: rgba(245,197,24,.2); }
.lv-sujet-form { flex: 1; }
.lv-sujet-form__hint {
  font-size: 12px; color: var(--lv-text-muted);
  background: rgba(245,197,24,.07); border: 1px solid var(--lv-gold-border);
  padding: 7px 12px; border-radius: var(--lv-r-sm); margin-bottom: 10px;
}
.lv-sujet-form__row { display: flex; align-items: flex-start; gap: 10px; flex-wrap: wrap; }
.lv-sujet-form__field { display: flex; flex-direction: column; gap: 4px; min-width: 180px; flex: 1; }
.lv-sujet-form__field--wide { flex: 2; min-width: 220px; }
.lv-sujet-form__field label {
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
  color: var(--lv-text-muted);
}
.req { color: var(--lv-ko); }
.lv-sujet-form__field input,
.lv-sujet-form__field textarea {
  background: var(--lv-surface-raised); border: 1.5px solid var(--lv-border);
  border-radius: var(--lv-r-sm); color: var(--lv-text-strong); font-size: 13.5px;
  padding: 8px 12px; outline: none; font-family: inherit; resize: none;
  transition: border-color var(--lv-t-fast), box-shadow var(--lv-t-fast);
}
.lv-sujet-form__field input::placeholder,
.lv-sujet-form__field textarea::placeholder { color: var(--lv-text-faint); }
.lv-sujet-form__field input:focus,
.lv-sujet-form__field textarea:focus {
  border-color: var(--lv-blue); box-shadow: 0 0 0 3px rgba(61,96,128,.14);
}
.lv-sujet-form__actions { display: flex; gap: 8px; align-items: flex-end; padding-top: 18px; flex-shrink: 0; }

/* ── Deadline warning banners ─────────────────────────────── */
.lv-deadline-banner {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 11px 20px 11px 16px;
  border-left: 3px solid transparent;
  font-size: 13px; font-weight: 500;
}
.lv-deadline-banner--soon    { background: rgba(224,144,32,.10); border-left-color: var(--lv-wait); color: #7a5000; }
.lv-deadline-banner--today   { background: rgba(217,64,64,.10);  border-left-color: var(--lv-ko);   color: #7a1010; }
.lv-deadline-banner--expired { background: rgba(217,64,64,.13);  border-left-color: var(--lv-ko);   color: #7a1010; }
.lv-deadline-banner__icon { flex-shrink: 0; margin-top: 1px; }
.lv-deadline-banner--soon    .lv-deadline-banner__icon { color: var(--lv-wait); }
.lv-deadline-banner--today   .lv-deadline-banner__icon,
.lv-deadline-banner--expired .lv-deadline-banner__icon { color: var(--lv-ko); }
.lv-deadline-banner__body { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; flex: 1; }
.lv-deadline-banner__title { line-height: 1.4; }
.lv-deadline-banner__chip {
  font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 999px;
  background: rgba(224,144,32,.18); color: #7a5000; border: 1px solid rgba(224,144,32,.3);
}
.lv-deadline-banner__chip--ko {
  background: rgba(217,64,64,.14); color: #7a1010; border-color: rgba(217,64,64,.3);
}

/* ── Phases section label ────────────────────────────────── */
.lv-phases-label {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 28px 10px;
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
  color: var(--lv-text-muted);
  background: var(--lv-surface-alt);
  border-bottom: 1px solid var(--lv-border);
}
.lv-phases-count {
  font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 999px;
  background: var(--lv-blue-muted); border: 1px solid var(--lv-blue-border);
  color: var(--lv-blue);
}

/* ── Empty state ─────────────────────────────────────────── */
.lv-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 64px 28px; color: var(--lv-text-muted); text-align: center;
}
.lv-empty__icon { color: var(--lv-border-strong); margin-bottom: 4px; }
.lv-empty__title { font-size: 15px; font-weight: 700; color: var(--lv-text); margin: 0; }
.lv-empty__sub { font-size: 13px; margin: 0; }

/* ── Phases grid ─────────────────────────────────────────── */
.lv-phases {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 0;
  padding: 24px 28px;
  background: var(--lv-surface-alt);
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--lv-border) transparent;
}
.lv-phases::-webkit-scrollbar { height: 5px; }
.lv-phases::-webkit-scrollbar-thumb { background: var(--lv-border); border-radius: 999px; }

/* Wrapper to add arrows between cards — applied via template v-for index */
.lv-phase-arrow {
  display: flex; align-items: center; justify-content: center;
  width: 32px; flex-shrink: 0;
  color: var(--lv-border-strong);
}

/* ══════════════════════════════════════════════════════════
   PHASE CARD
   ══════════════════════════════════════════════════════════ */
.lv-phase-card {
  position: relative;
  background: var(--lv-surface-card);
  border: 1.5px solid var(--lv-border);
  border-radius: var(--lv-r-lg);
  display: flex;
  overflow: hidden;
  min-height: 200px;
  width: 300px;
  flex-shrink: 0;
  transition: background var(--lv-t-base), box-shadow var(--lv-t-base), border-color var(--lv-t-base);
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}
.lv-phase-card:hover {
  background: var(--lv-surface-raised);
  box-shadow: 0 4px 18px rgba(0,0,0,.10);
}

/* Active card — gold accent bar on top */
.lv-phase-card--active {
  background: var(--lv-surface-raised);
  border-color: var(--lv-gold-border);
  box-shadow: 0 4px 18px rgba(245,197,24,.12);
}
.lv-phase-card--active::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--lv-gold), var(--lv-gold-dark));
}

/* Done card — blue-green accent */
.lv-phase-card--done::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--lv-ok), rgba(30,158,96,.3));
}

/* Locked card — dimmed */
.lv-phase-card--locked {
  background: var(--lv-surface);
  border-color: var(--lv-border);
  opacity: 0.7;
}

/* Lock overlay */
.lv-phase-lock {
  position: absolute; inset: 0; z-index: 4;
  background: rgba(196,192,184,.82); backdrop-filter: blur(3px);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
  color: var(--lv-text-muted); font-size: 12px; font-weight: 700;
  letter-spacing: .04em; text-transform: uppercase;
}
.lv-phase-lock__icon {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--lv-surface); border: 1.5px solid var(--lv-border);
  display: flex; align-items: center; justify-content: center;
  color: var(--lv-border-strong);
  box-shadow: 0 3px 12px rgba(0,0,0,.10);
}

/* Card body — the main content area */
.lv-pc-body {
  flex: 1; padding: 18px 18px 16px;
  display: flex; flex-direction: column; gap: 7px;
  min-width: 0;
}

/* Header row */
.lv-pc-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.lv-pc-phase-num {
  font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em;
  color: var(--lv-blue); padding: 2px 8px;
  background: var(--lv-blue-muted); border-radius: 999px;
  border: 1px solid var(--lv-blue-border);
}
.lv-pc-status {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 10.5px; font-weight: 700; padding: 3px 9px;
  border-radius: 999px; letter-spacing: .04em; white-space: nowrap;
}
.lv-pc-status--active { background: rgba(245,197,24,.14); color: var(--lv-gold-dark); border: 1px solid var(--lv-gold-border); }
.lv-pc-status--done   { background: var(--lv-ok-bg); color: var(--lv-ok); border: 1px solid var(--lv-ok-border); }
.lv-pc-status--locked { background: rgba(0,0,0,.04); color: var(--lv-text-faint); border: 1px solid var(--lv-border); }

.lv-pc-nom   { font-size: 14.5px; font-weight: 700; color: var(--lv-text-strong); line-height: 1.3; }
.lv-pc-dates {
  font-size: 11.5px; color: var(--lv-text-muted);
  display: flex; align-items: center; gap: 5px;
}
.lv-pc-dates svg { color: var(--lv-blue-light); flex-shrink: 0; }

.lv-pc-divider {
  height: 1px; background: var(--lv-border); margin: 4px 0;
}

.lv-pc-no-lv {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11.5px; color: var(--lv-ok); font-weight: 600;
  padding: 5px 10px; background: var(--lv-ok-bg);
  border-radius: var(--lv-r-sm); border: 1px solid var(--lv-ok-border);
  align-self: flex-start;
}

/* Livrable area */
.lv-pc-livrable { display: flex; flex-direction: column; gap: 8px; }
.lv-pc-file {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fef3e2; border-radius: var(--lv-r-sm);
  padding: 9px 11px; border: 1px solid #fac775;
}
.lv-pc-file-icon {
  width: 34px; height: 34px; border-radius: var(--lv-r-md); flex-shrink: 0;
  background: linear-gradient(135deg, rgba(245,197,24,.22) 0%, rgba(201,161,0,.14) 100%);
  border: 1.5px solid rgba(245,197,24,.45);
  display: flex; align-items: center; justify-content: center;
  color: var(--lv-gold-dark);
  box-shadow: 0 2px 8px rgba(245,197,24,.20);
}
.lv-pc-file-info { flex: 1; min-width: 0; }
.lv-pc-file-name { font-size: 13px; font-weight: 700; color: var(--lv-text-strong); word-break: break-all; line-height: 1.35; letter-spacing: -0.01em; }
.lv-pc-file-date { font-size: 11px; color: var(--lv-text-muted); margin-top: 3px; display: flex; align-items: center; gap: 5px; font-weight: 500; }
.lv-pc-file .lv-status-badge { flex-shrink: 0; align-self: flex-start; margin-top: 2px; }

.lv-pc-comment {
  display: flex; align-items: flex-start; gap: 6px;
  font-size: 11.5px; color: var(--lv-ko); font-style: italic;
  background: var(--lv-ko-bg); padding: 7px 10px;
  border-radius: var(--lv-r-sm); border: 1px solid var(--lv-ko-border);
}

.lv-pc-depot { margin-top: 4px; }
.lv-pc-missed {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11.5px; color: var(--lv-ko); font-weight: 600;
  padding: 5px 10px; background: var(--lv-ko-bg);
  border-radius: var(--lv-r-sm); border: 1px solid var(--lv-ko-border);
}

.lv-pc-actions { display: flex; gap: 7px; flex-wrap: wrap; }

/* ── Historique button inside card ───────────────────────── */
.lv-hist-btn {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 6px;
  font-size: 11.5px; font-weight: 700;
  padding: 6px 13px; border-radius: var(--lv-r-md);
  border: 1.5px solid var(--lv-blue-border);
  background: var(--lv-blue-muted);
  color: var(--lv-blue);
  cursor: pointer; font-family: inherit;
  transition: all var(--lv-t-fast) var(--lv-ease);
  align-self: flex-start;
  box-shadow: 0 1px 4px rgba(61,96,128,.10);
}
.lv-hist-btn:hover {
  background: rgba(61,96,128,.2);
  border-color: var(--lv-blue);
  box-shadow: 0 3px 10px rgba(61,96,128,.18);
  transform: translateY(-1px);
}
.lv-hist-btn__count {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--lv-blue); color: #fff;
  font-size: 9.5px; font-weight: 800;
  box-shadow: 0 1px 4px rgba(61,96,128,.30);
}

/* ══════════════════════════════════════════════════════════
   HISTORIQUE POPUP MODAL — mfm-style blue/gold design
   ══════════════════════════════════════════════════════════ */
.lv-hist-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(6, 20, 40, 0.55);
  backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}

.lv-hist-modal {
  background: var(--lv-surface);
  border: 1.5px solid var(--lv-border);
  border-radius: var(--lv-r-2xl);
  width: 100%; max-width: 500px;
  max-height: 85vh;
  display: flex; flex-direction: column;
  box-shadow:
    0 4px 6px rgba(0,0,0,.07),
    0 20px 60px rgba(6, 20, 40, .32),
    0 0 0 1px rgba(255,255,255,.04);
  overflow: hidden;
}

/* ── Header — warm amber gradient matching screenshot style */
.lv-hist-modal__head {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 20px 22px;
  background: linear-gradient(135deg, #7c4f0f 0%, #5a3508 100%);
  flex-shrink: 0;
}
.lv-hist-modal__head-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }

/* Amber icon badge */
.lv-hist-modal__icon {
  width: 46px; height: 46px; border-radius: var(--lv-r-md); flex-shrink: 0;
  background: rgba(255,255,255,0.18);
  border: 1.5px solid rgba(255,255,255,0.30);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,.15);
}
.lv-hist-modal__title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 15px; font-weight: 800; color: #fff;
  letter-spacing: -.01em; margin-bottom: 3px;
}
.lv-hist-modal__phase-name {
  font-size: 12px; color: rgba(255,255,255,.52); font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px;
}
.lv-hist-modal__close {
  width: 30px; height: 30px; border-radius: var(--lv-r-sm); flex-shrink: 0;
  background: rgba(255,255,255,.14); border: none;
  color: rgba(255,255,255,.75); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background var(--lv-t-fast), color var(--lv-t-fast);
}
.lv-hist-modal__close:hover { background: rgba(255,255,255,.26); color: #fff; }

/* ── Stats bar — 4 cells with color-coded numbers */
.lv-hist-modal__stats {
  display: flex; align-items: stretch;
  background: #fef3e2;
  border-bottom: 1.5px solid #fac775;
  flex-shrink: 0;
}
.lv-hist-stat {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 13px 8px; gap: 3px;
  border-right: 1px solid rgba(250,199,117,.45);
}
.lv-hist-stat:last-child { border-right: none; }
.lv-hist-stat__num {
  font-size: 22px; font-weight: 800; line-height: 1; letter-spacing: -0.03em;
}
.lv-hist-stat__lbl {
  font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
  opacity: .75;
}
.lv-hist-stat--total .lv-hist-stat__num { color: var(--lv-blue); }
.lv-hist-stat--total .lv-hist-stat__lbl { color: var(--lv-blue); }
.lv-hist-stat--ok   .lv-hist-stat__num { color: var(--lv-ok);   }
.lv-hist-stat--ok   .lv-hist-stat__lbl { color: var(--lv-ok);   }
.lv-hist-stat--wait .lv-hist-stat__num { color: var(--lv-wait); }
.lv-hist-stat--wait .lv-hist-stat__lbl { color: var(--lv-wait); }
.lv-hist-stat--ko    .lv-hist-stat__num { color: var(--lv-ko);   }
.lv-hist-stat--ko    .lv-hist-stat__lbl { color: var(--lv-ko);   }
.lv-hist-stat--muted .lv-hist-stat__num { color: #777; }
.lv-hist-stat--muted .lv-hist-stat__lbl { color: #999; }

/* ── Body — scrollable timeline */
.lv-hist-modal__body {
  flex: 1; overflow-y: auto; padding: 20px 22px;
  background: #fef3e2;
  scrollbar-width: thin; scrollbar-color: #fac775 transparent;
}
.lv-hist-modal__body::-webkit-scrollbar { width: 4px; }
.lv-hist-modal__body::-webkit-scrollbar-thumb { background: var(--lv-border); border-radius: 999px; }

/* ── Footer */
.lv-hist-modal__foot {
  padding: 14px 22px;
  border-top: 1px solid #fac775;
  background: #fef3e2;
  display: flex; justify-content: flex-end;
  flex-shrink: 0;
}

/* ── Timeline entries */
.lv-hist-timeline { display: flex; flex-direction: column; gap: 10px; }
.lv-hist-entry {
  display: flex; align-items: flex-start; gap: 0;
}
.lv-hist-entry__track {
  display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
  width: 36px; padding-top: 14px;
}
.lv-hist-entry__dot {
  width: 13px; height: 13px; border-radius: 50%; flex-shrink: 0;
  border: 2.5px solid;
}
.lv-hist-entry--ok   .lv-hist-entry__dot { border-color: var(--lv-ok);   background: var(--lv-ok);    box-shadow: 0 0 0 3px rgba(30,158,96,.18), 0 2px 6px rgba(30,158,96,.25); }
.lv-hist-entry--ko   .lv-hist-entry__dot { border-color: var(--lv-ko);   background: var(--lv-ko);    box-shadow: 0 0 0 3px rgba(217,64,64,.18), 0 2px 6px rgba(217,64,64,.25); }
.lv-hist-entry--wait .lv-hist-entry__dot { border-color: var(--lv-wait); background: var(--lv-wait);  box-shadow: 0 0 0 3px rgba(224,144,32,.18), 0 2px 6px rgba(224,144,32,.25); }
.lv-hist-entry__line {
  width: 2px; flex: 1; min-height: 18px;
  background: linear-gradient(180deg, rgba(180,165,140,.55), transparent);
  margin: 5px 0 0; border-radius: 999px;
}

/* Entry content */
.lv-hist-entry__content {
  flex: 1; min-width: 0; padding: 0 0 0;
}
.lv-hist-entry__card {
  border-radius: var(--lv-r-lg);
  padding: 12px 14px;
  display: flex; flex-direction: column; gap: 8px;
  transition: box-shadow var(--lv-t-fast), transform var(--lv-t-fast);
  border-left: 4px solid transparent;
  border-top: 1.5px solid transparent;
  border-right: 1.5px solid transparent;
  border-bottom: 1.5px solid transparent;
}
.lv-hist-entry--ok   .lv-hist-entry__card {
  background: linear-gradient(135deg, rgba(30,158,96,.10) 0%, rgba(30,158,96,.04) 100%);
  border-color: rgba(30,158,96,.28); border-left-color: var(--lv-ok);
  box-shadow: 0 2px 10px rgba(30,158,96,.08);
}
.lv-hist-entry--ko   .lv-hist-entry__card {
  background: linear-gradient(135deg, rgba(217,64,64,.09) 0%, rgba(217,64,64,.03) 100%);
  border-color: rgba(217,64,64,.28); border-left-color: var(--lv-ko);
  box-shadow: 0 2px 10px rgba(217,64,64,.08);
}
.lv-hist-entry--wait .lv-hist-entry__card {
  background: linear-gradient(135deg, rgba(224,144,32,.10) 0%, rgba(224,144,32,.04) 100%);
  border-color: rgba(224,144,32,.30); border-left-color: var(--lv-wait);
  box-shadow: 0 2px 10px rgba(224,144,32,.08);
}
.lv-hist-entry__card:hover { box-shadow: 0 4px 16px rgba(61,96,128,.14); transform: translateY(-1px); }

/* File header row inside card */
.lv-hist-entry__file-row {
  display: flex; align-items: center; gap: 10px;
}
.lv-hist-entry__file-icon {
  width: 36px; height: 36px; border-radius: var(--lv-r-sm); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.lv-hist-entry--ok   .lv-hist-entry__file-icon { background: rgba(30,158,96,.14);  color: var(--lv-ok);   border: 1.5px solid rgba(30,158,96,.25);  }
.lv-hist-entry--ko   .lv-hist-entry__file-icon { background: rgba(217,64,64,.12);  color: var(--lv-ko);   border: 1.5px solid rgba(217,64,64,.25);  }
.lv-hist-entry--wait .lv-hist-entry__file-icon { background: rgba(224,144,32,.12); color: var(--lv-wait); border: 1.5px solid rgba(224,144,32,.25); }
.lv-hist-entry__file-info { flex: 1; min-width: 0; }

.lv-hist-entry__top { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.lv-hist-fname {
  font-size: 13px; font-weight: 700; color: var(--lv-text-strong);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  max-width: 200px; flex: 1;
}
.lv-hist-entry__meta {
  font-size: 11px; color: var(--lv-text-muted);
  display: flex; align-items: center; gap: 5px; margin-top: 2px;
}
.lv-hist-entry__row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.lv-hist-entry__comment {
  display: flex; align-items: flex-start; gap: 6px;
  font-size: 11.5px; color: var(--lv-ko); font-style: italic; line-height: 1.4;
  background: var(--lv-ko-bg); padding: 7px 10px;
  border-radius: var(--lv-r-sm); border: 1px solid var(--lv-ko-border);
}
.lv-hist-entry__open {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700;
  color: var(--lv-blue); text-decoration: none;
  padding: 4px 10px; border-radius: var(--lv-r-md);
  border: 1.5px solid var(--lv-blue-border);
  background: var(--lv-blue-muted);
  transition: all var(--lv-t-fast);
  box-shadow: 0 1px 4px rgba(61,96,128,.08);
}
.lv-hist-entry__open:hover {
  background: rgba(61,96,128,.18);
  border-color: var(--lv-blue);
  box-shadow: 0 2px 8px rgba(61,96,128,.16);
  transform: translateY(-1px);
}

/* ── Empty state */
.lv-hist-empty {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 48px 16px; color: var(--lv-text-muted);
  font-size: 13px; text-align: center;
}
.lv-hist-empty__icon {
  width: 60px; height: 60px; border-radius: 50%;
  background: var(--lv-blue-muted); border: 1.5px solid var(--lv-blue-border);
  display: flex; align-items: center; justify-content: center;
  color: var(--lv-blue);
  box-shadow: 0 4px 16px rgba(61,96,128,.12);
}
.lv-hist-empty p { margin: 0; }
.lv-hist-empty__title { font-weight: 700; color: var(--lv-text); font-size: 14.5px; }
.lv-hist-empty__sub { font-size: 12.5px; color: var(--lv-text-muted); }

/* Modal transition */
.lv-modal-enter-from { opacity: 0; }
.lv-modal-enter-from .lv-hist-modal { transform: scale(.95) translateY(12px); }
.lv-modal-enter-active { transition: opacity .22s var(--lv-ease); }
.lv-modal-enter-active .lv-hist-modal { transition: transform .22s var(--lv-ease); }
.lv-modal-leave-to { opacity: 0; }
.lv-modal-leave-to .lv-hist-modal { transform: scale(.96) translateY(6px); }
.lv-modal-leave-active { transition: opacity .16s ease; }
.lv-modal-leave-active .lv-hist-modal { transition: transform .16s ease; }

/* ── Buttons ─────────────────────────────────────────────── */
.lv-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12.5px; font-weight: 700; padding: 8px 15px;
  border-radius: var(--lv-r-md); cursor: pointer;
  border: 1.5px solid transparent;
  transition: all var(--lv-t-fast) var(--lv-ease);
  white-space: nowrap; font-family: inherit;
  letter-spacing: 0.01em;
  position: relative; overflow: hidden;
}
.lv-btn::after {
  content: ''; position: absolute; inset: 0;
  background: rgba(255,255,255,0);
  transition: background var(--lv-t-fast);
}
.lv-btn:hover::after { background: rgba(255,255,255,.08); }
.lv-btn--gold {
  background: linear-gradient(135deg, var(--lv-gold) 0%, #d4a700 100%);
  color: #1a2d3e; border-color: transparent;
  box-shadow: 0 3px 12px rgba(245,197,24,.35), 0 1px 3px rgba(0,0,0,.12);
}
.lv-btn--gold:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(245,197,24,.45), 0 2px 6px rgba(0,0,0,.14);
  transform: translateY(-1px);
}
.lv-btn--gold:active:not(:disabled) { transform: translateY(0); }
.lv-btn--gold:disabled { opacity: .45; cursor: not-allowed; }
.lv-btn--ghost {
  background: var(--lv-surface-alt); border-color: var(--lv-border); color: var(--lv-text-muted);
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
.lv-btn--ghost:hover { background: var(--lv-surface-raised); color: var(--lv-text); border-color: var(--lv-border-strong); }
.lv-btn--replace {
  background: rgba(245,197,24,.12); border-color: rgba(245,197,24,.40); color: var(--lv-gold-dark);
  box-shadow: 0 1px 4px rgba(245,197,24,.15);
}
.lv-btn--replace:hover { background: rgba(245,197,24,.22); box-shadow: 0 2px 8px rgba(245,197,24,.25); }
.lv-btn--danger {
  background: var(--lv-ko-bg); border-color: var(--lv-ko-border); color: var(--lv-ko);
  box-shadow: 0 1px 4px rgba(217,64,64,.10);
}
.lv-btn--danger:hover { background: rgba(217,64,64,.18); box-shadow: 0 2px 8px rgba(217,64,64,.18); }
.lv-btn--depot {
  background: rgba(245,197,24,.08); border: 2px dashed rgba(245,197,24,.45);
  color: var(--lv-gold-dark); padding: 9px 14px;
  box-shadow: none;
}
.lv-btn--depot:hover { background: rgba(245,197,24,.16); border-style: solid; box-shadow: 0 2px 8px rgba(245,197,24,.18); }

/* ── Status badges ───────────────────────────────────────── */
.lv-status-badge {
  display: inline-flex; align-items: center;
  font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px;
  letter-spacing: .04em; white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}
.lv-status-badge--sm { font-size: 10px; padding: 2px 8px; box-shadow: none; }
.lv-status-badge--ok   { background: var(--lv-ok-bg);   color: var(--lv-ok);   border: 1.5px solid var(--lv-ok-border);   box-shadow: 0 1px 6px rgba(30,158,96,.14); }
.lv-status-badge--ko   { background: var(--lv-ko-bg);   color: var(--lv-ko);   border: 1.5px solid var(--lv-ko-border);   box-shadow: 0 1px 6px rgba(217,64,64,.14); }
.lv-status-badge--wait { background: var(--lv-wait-bg); color: var(--lv-wait); border: 1.5px solid var(--lv-wait-border); box-shadow: 0 1px 6px rgba(224,144,32,.14); }
.lv-status-badge--retire   { background: rgba(110,110,120,.10); color: #7a7a8a; border: 1.5px solid rgba(110,110,120,.22); }
.lv-status-badge--remplace { background: rgba(61,96,128,.10);   color: var(--lv-blue); border: 1.5px solid var(--lv-blue-border); }

/* ── Version chip ────────────────────────────────────────── */
.lv-version-chip {
  display: inline-block; font-size: 10px; font-weight: 700;
  padding: 1px 6px; border-radius: 999px;
  background: rgba(245,197,24,.14); color: var(--lv-gold-dark);
  border: 1px solid var(--lv-gold-border);
}

/* ── Spinner ─────────────────────────────────────────────── */
.lv-spinner {
  width: 32px; height: 32px; border-radius: 50%;
  border: 3px solid var(--lv-blue-muted);
  border-top-color: var(--lv-blue);
  animation: lv-spin .7s linear infinite;
}
.lv-spinner--sm { width: 13px; height: 13px; border-width: 2px; }
@keyframes lv-spin { to { transform: rotate(360deg); } }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 640px) {
  .lv-widget__header { padding: 16px 18px 14px; }
  .lv-sujet-band { padding: 12px 18px; }
  .lv-phases-label { padding: 10px 18px 8px; }
  .lv-phases { padding: 16px 18px; gap: 0; }
  .lv-phase-card { width: 260px; min-width: 260px; }
  .lv-hist-modal { max-width: 100%; }
  .lv-kpi-strip { gap: 6px; }
  .lv-kpi { min-width: 60px; padding: 6px 10px; }
}

/* ══════════════════════════════════════════════════════════
   RETIRER MODAL — danger red theme
   ══════════════════════════════════════════════════════════ */
.lv-retirer-modal {
  background: #fff8f7;
  border: 1.5px solid rgba(217,64,64,.22);
  border-radius: 20px;
  width: 100%; max-width: 400px;
  display: flex; flex-direction: column;
  overflow: hidden;
  box-shadow:
    0 4px 6px rgba(0,0,0,.07),
    0 20px 60px rgba(80,10,10,.22),
    0 0 0 1px rgba(255,255,255,.05);
}
.lv-retirer-modal__head {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #9b2020 0%, #6b1010 100%);
  flex-shrink: 0;
}
.lv-retirer-modal__head-left { display: flex; align-items: center; gap: 13px; flex: 1; min-width: 0; }
.lv-retirer-modal__icon {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: rgba(255,255,255,.18);
  border: 1.5px solid rgba(255,255,255,.28);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
}
.lv-retirer-modal__title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 2px;
}
.lv-retirer-modal__sub {
  font-size: 11.5px; color: rgba(255,255,255,.55); font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px;
}
.lv-retirer-modal__close {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  background: rgba(255,255,255,.14); border: none;
  color: rgba(255,255,255,.75); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .12s, color .12s;
}
.lv-retirer-modal__close:hover { background: rgba(255,255,255,.26); color: #fff; }

.lv-retirer-modal__body {
  padding: 20px 22px; display: flex; flex-direction: column; gap: 12px;
  background: #fff8f7;
}
.lv-retirer-modal__file-chip {
  display: flex; align-items: center; gap: 10px;
  background: rgba(217,64,64,.07);
  border: 1.5px solid rgba(217,64,64,.22);
  border-radius: 10px; padding: 10px 13px;
}
.lv-retirer-modal__file-icon {
  width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
  background: rgba(217,64,64,.12); color: #d94040;
  border: 1.5px solid rgba(217,64,64,.25);
  display: flex; align-items: center; justify-content: center;
}
.lv-retirer-modal__file-name {
  font-size: 13px; font-weight: 700; color: #3d1010;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
}
.lv-retirer-modal__warn {
  display: flex; align-items: flex-start; gap: 9px;
  background: rgba(217,64,64,.08); border: 1.5px solid rgba(217,64,64,.20);
  border-radius: 10px; padding: 11px 13px;
  font-size: 13px; color: #9b2020; font-weight: 500; line-height: 1.45;
}
.lv-retirer-modal__warn svg { flex-shrink: 0; margin-top: 1px; }
.lv-retirer-modal__foot {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 22px;
  border-top: 1.5px solid rgba(217,64,64,.15);
  background: rgba(217,64,64,.04);
}

</style>