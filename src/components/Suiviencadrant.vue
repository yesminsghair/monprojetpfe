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

    <!-- MAIN WIDGET -->
    <div class="lv-widget">

      <!-- WIDGET HEADER -->
      <div class="lv-widget__header">
        <div class="lv-widget__header-left">
          <div class="lv-widget__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <h2 class="lv-widget__title">Suivi des étudiants</h2>
            <p class="lv-widget__sub">Avancement par phase — validez ou rejetez le travail de chaque étudiant</p>
          </div>
        </div>
        <div class="lv-kpi-strip">
          <div class="lv-kpi lv-kpi--ok">
            <strong>{{ nTermines }}</strong><span>Terminé(s)</span>
          </div>
          <div class="lv-kpi lv-kpi--warn">
            <strong>{{ nActifs }}</strong><span>En cours</span>
          </div>
          <div class="lv-kpi lv-kpi--ko">
            <strong>{{ nAttente }}</strong><span>En attente</span>
          </div>
        </div>
      </div>

      <!-- FILTER BAR -->
      <div class="lv-filter-bar">
        <button
          v-for="f in filtres" :key="f.val"
          class="lv-filter-btn" :class="{ 'lv-filter-btn--active': filtreActif === f.val }"
          @click="filtreActif = f.val">
          {{ f.label }}
        </button>
      </div>

      <!-- DEADLINE WARNING BANNERS — active phases expiring soon or expired -->
      <template v-if="!loading">
        <template v-for="warn in deadlineWarnings" :key="'dw-'+warn.phase_id">
          <div class="lv-deadline-banner"
            :class="warn.joursRestants < 0 ? 'lv-deadline-banner--expired'
                   : warn.joursRestants === 0 ? 'lv-deadline-banner--today'
                   : 'lv-deadline-banner--soon'">
            <div class="lv-deadline-banner__icon">
              <svg v-if="warn.joursRestants < 0" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div class="lv-deadline-banner__body">
              <span class="lv-deadline-banner__title">
                <strong>{{ warn.nom }}</strong> —
                <template v-if="warn.joursRestants < 0">
                  Phase expirée depuis {{ Math.abs(warn.joursRestants) }} jour(s).
                  <span class="lv-deadline-banner__chip lv-deadline-banner__chip--ko">
                    {{ warn.nNonValides }} étudiant(s) sans validation
                  </span>
                </template>
                <template v-else-if="warn.joursRestants === 0">
                  Date limite <strong>aujourd'hui</strong> !
                  <span class="lv-deadline-banner__chip">
                    {{ warn.nNonValides }} étudiant(s) en attente
                  </span>
                </template>
                <template v-else>
                  Plus que <strong>{{ warn.joursRestants }} jour(s)</strong> (échéance : {{ warn.dateFin }}).
                  <span class="lv-deadline-banner__chip">
                    {{ warn.nNonValides }} étudiant(s) en attente
                  </span>
                </template>
              </span>
            </div>
          </div>
        </template>
      </template>

      <!-- LOADING -->
      <div v-if="loading" class="lv-loading">
        <div class="lv-spinner"></div>
        <p>Chargement des données...</p>
      </div>

      <template v-else>

        <!-- EMPTY -->
        <div v-if="!etudiantsFiltres.length" class="lv-empty">
          <div class="lv-empty__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <p class="lv-empty__title">Aucun étudiant dans cette catégorie</p>
          <p class="lv-empty__sub">Essayez un autre filtre.</p>
        </div>

        <!-- STUDENT CARDS -->
        <div v-else class="lv-phases lv-phases--students">
          <template v-for="(e, idx) in etudiantsFiltres" :key="e.id">
            <div v-if="idx > 0" class="lv-phase-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            <div class="lv-phase-card lv-phase-card--student"
              :class="{
                'lv-phase-card--active': e.phaseActive && !e.termineTotal,
                'lv-phase-card--done':   e.termineTotal,
              }">
              <div class="lv-pc-body">

                <!-- Student header -->
                <div class="lv-pc-header">
                  <div class="lv-sc-av" :style="{ background: e.color }">{{ initials(e.nom) }}</div>
                  <div class="lv-sc-nom">{{ e.nom }}</div>
                  <div class="lv-sc-ring" :title="e.progress + '% accompli'">
                    <svg width="44" height="44" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="17" fill="none" stroke="var(--lv-border)" stroke-width="3.5"/>
                      <circle cx="22" cy="22" r="17" fill="none" :stroke="e.color" stroke-width="3.5"
                        stroke-linecap="round" stroke-dasharray="107"
                        :stroke-dashoffset="107 - (e.progress / 100 * 107)"
                        transform="rotate(-90 22 22)"/>
                    </svg>
                    <span class="lv-sc-pct">{{ e.progress }}%</span>
                  </div>
                </div>

                <!-- Subject -->
                <div class="lv-pc-nom" :class="{ 'lv-pc-nom--empty': !e.sujet }">
                  {{ e.sujet || 'Sujet non défini' }}
                </div>

                <!-- Email & Matricule -->
                <div class="lv-sc-meta-row">
                  <span v-if="e.matricule" class="lv-sc-meta-chip lv-sc-meta-chip--mat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/></svg>
                    {{ e.matricule }}
                  </span>
                  <span v-if="e.email" class="lv-sc-meta-chip lv-sc-meta-chip--mail">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    {{ e.email }}
                  </span>
                </div>

                <!-- Current phase -->
                <div class="lv-pc-dates">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Phase actuelle :&nbsp;<strong style="color:var(--lv-text)">
                    <template v-if="activePhaseOf(e)">
                      Phase {{ activePhaseOf(e).ordre }} — {{ activePhaseOf(e).nom }}
                    </template>
                    <template v-else>—</template>
                  </strong>
                </div>

                <!-- Progress bar -->
                <div class="lv-sc-bar"><div class="lv-sc-bar__fill" :style="{ width: e.progress + '%', background: e.color }"></div></div>

                <!-- Per-student deadline chip for their active phase -->
                <template v-if="activePhaseDeadline(e) !== null">
                  <div class="lv-sc-deadline-chip"
                    :class="activePhaseDeadline(e) < 0 ? 'lv-sc-deadline-chip--expired'
                           : activePhaseDeadline(e) === 0 ? 'lv-sc-deadline-chip--today'
                           : 'lv-sc-deadline-chip--soon'">
                    <svg v-if="activePhaseDeadline(e) < 0" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <span v-if="activePhaseDeadline(e) < 0">Phase expirée depuis {{ Math.abs(activePhaseDeadline(e)) }} j</span>
                    <span v-else-if="activePhaseDeadline(e) === 0">Échéance aujourd'hui !</span>
                    <span v-else>{{ activePhaseDeadline(e) }} jour(s) restant(s)</span>
                  </div>
                </template>
                <div class="lv-sc-dots">
                  <span v-for="(ph, pi) in e.phases" :key="pi" class="lv-pdot"
                    :class="{
                      'lv-pdot--done':     ph.statut === 'validee',
                      'lv-pdot--active':   ph.statut === 'en_cours',
                      'lv-pdot--rejected': ph.statut === 'rejetee',
                      'lv-pdot--future':   ph.statut === 'en_attente',
                    }"
                    :title="'Phase ' + ph.ordre + ' — ' + ph.nom + ' (' + ph.statut + ')'">
                    <span class="lv-pdot-num">{{ ph.ordre }}</span>
                  </span>
                </div>

                <div class="lv-pc-divider"></div>

                <!-- Phases without livrable: valider / rejeter buttons -->
                <template v-for="ph in phasesWithoutLivrable(e)" :key="ph.phase_id">
                  <div v-if="ph.active && ph.statut !== 'validee' && ph.statut !== 'rejetee'" class="lv-nolv-row">
                    <div class="lv-nolv-info">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>{{ ph.nom }} <em class="lv-nolv-hint">(sans livrable)</em></span>
                    </div>
                    <div class="lv-nolv-actions">
                      <button class="lv-btn lv-btn--ok-sm" @click="validerPhase(e, ph)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                        Valider
                      </button>
                      <button class="lv-btn lv-btn--ko-sm" @click="openRejetPhase(e, ph)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Rejeter
                      </button>
                    </div>
                  </div>
                </template>

                <!-- Livrables section -->
                <div v-if="livrablesDe(e).length" class="lv-enc-livrables">
                  <div class="lv-sep">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Livrables déposés
                    <span class="lv-sep-count">{{ livrablesDe(e).length }}</span>
                  </div>

                  <div v-for="lv in livrablesDe(e)" :key="lv.id" class="lv-enc-row">
                    <div class="lv-pc-file-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div class="lv-enc-row-info">
                      <div class="lv-pc-file-name">
                        {{ lv.file_name || '—' }}
                        <span v-if="lv.version > 1" class="lv-version-chip">v{{ lv.version }}</span>
                      </div>
                      <div class="lv-pc-file-date">
                        {{ lv.depose_le ? new Date(lv.depose_le).toLocaleDateString('fr-FR') : '' }}
                        <span v-if="lv.remplace_le" class="lv-enc-replace"> · màj {{ new Date(lv.remplace_le).toLocaleDateString('fr-FR') }}</span>
                      </div>
                      <!-- Actions row below file info -->
                      <div class="lv-enc-row-actions">
                        <span class="lv-status-badge lv-status-badge--sm"
                          :class="{
                            'lv-status-badge--wait': lv.statut === 'en_attente',
                            'lv-status-badge--ok':   lv.statut === 'valide',
                            'lv-status-badge--ko':   lv.statut === 'rejete',
                          }">
                          {{ { en_attente: 'En attente', valide: 'Validé', rejete: 'Rejeté' }[lv.statut] || lv.statut }}
                        </span>
                        <a v-if="lv.fichier_url" :href="lv.fichier_url" target="_blank" class="lv-icon-btn lv-icon-btn--view" title="Ouvrir le fichier">
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </a>
                        <button v-else class="lv-icon-btn lv-icon-btn--view" title="Aucun fichier" disabled style="opacity:.35;cursor:not-allowed;">
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button v-if="lv.statut === 'en_attente'" class="lv-icon-btn lv-icon-btn--ok" title="Valider" @click="validerLivrable(lv)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                        <button v-if="lv.statut === 'en_attente'" class="lv-icon-btn lv-icon-btn--ko" title="Rejeter" @click="openRejetLv(lv)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Historique button -->
                <button class="lv-hist-btn" @click="voirHistorique(e)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.85"/></svg>
                  Historique
                </button>

              </div>
            </div>
          </template>
        </div>

      </template>
    </div>

    <!-- ═══ MODALS ═══ -->
    <Teleport to="body">

      <!-- Modal: Rejeter livrable — red theme like lv-retirer-modal -->
      <Transition name="lv-modal">
        <div v-if="modalRejetLv" class="lv-root" style="all:unset;display:contents">
        <div class="lv-hist-overlay" @click.self="modalRejetLv = false">
          <div class="lv-retirer-modal">

            <!-- Header — red gradient -->
            <div class="lv-retirer-modal__head">
              <div class="lv-retirer-modal__head-left">
                <div class="lv-retirer-modal__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
                <div>
                  <div class="lv-retirer-modal__title">Rejeter le livrable</div>
                  <div class="lv-retirer-modal__sub">{{ currentLv?.phase_nom }} — {{ currentLv?.file_name }}</div>
                </div>
              </div>
              <button class="lv-retirer-modal__close" @click="modalRejetLv = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Body -->
            <div class="lv-retirer-modal__body">
              <!-- File chip -->
              <div class="lv-retirer-modal__file-chip">
                <div class="lv-retirer-modal__file-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <span class="lv-retirer-modal__file-name">{{ currentLv?.file_name }}</span>
              </div>
              <!-- Comment textarea -->
              <div class="lv-form-field">
                <label class="lv-form-label">Motif du rejet <span class="lv-req">*</span></label>
                <textarea v-model="commentaireRejetLv" class="lv-form-ta" rows="4" placeholder="Expliquez les corrections nécessaires..."></textarea>
              </div>
            </div>

            <!-- Footer -->
            <div class="lv-retirer-modal__foot">
              <button class="lv-btn lv-btn--ghost" @click="modalRejetLv = false">Annuler</button>
              <button class="lv-btn lv-btn--danger" :disabled="!commentaireRejetLv.trim()" @click="confirmerRejetLv">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Rejeter
              </button>
            </div>

          </div>
        </div>
        </div>
      </Transition>

      <!-- Modal: Rejeter phase (sans livrable) — red theme like lv-retirer-modal -->
      <Transition name="lv-modal">
        <div v-if="modalRejetPhase" class="lv-root" style="all:unset;display:contents">
        <div class="lv-hist-overlay" @click.self="modalRejetPhase = false">
          <div class="lv-retirer-modal">

            <!-- Header — red gradient -->
            <div class="lv-retirer-modal__head">
              <div class="lv-retirer-modal__head-left">
                <div class="lv-retirer-modal__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
                <div>
                  <div class="lv-retirer-modal__title">Rejeter la phase</div>
                  <div class="lv-retirer-modal__sub">{{ currentPhaseRejet?.nom }} — {{ currentEtPhaseRejet?.nom }}</div>
                </div>
              </div>
              <button class="lv-retirer-modal__close" @click="modalRejetPhase = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Body -->
            <div class="lv-retirer-modal__body">
              <!-- Warning -->
              <div class="lv-retirer-modal__warn">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>Cette phase sera marquée comme rejetée et l'étudiant devra la refaire.</span>
              </div>
              <!-- Comment textarea -->
              <div class="lv-form-field">
                <label class="lv-form-label">Motif du rejet <span class="lv-req">*</span></label>
                <textarea v-model="commentaireRejetPhase" class="lv-form-ta" rows="4" placeholder="Expliquez les corrections nécessaires..."></textarea>
              </div>
            </div>

            <!-- Footer -->
            <div class="lv-retirer-modal__foot">
              <button class="lv-btn lv-btn--ghost" @click="modalRejetPhase = false">Annuler</button>
              <button class="lv-btn lv-btn--danger" :disabled="!commentaireRejetPhase.trim()" @click="confirmerRejetPhase">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Rejeter la phase
              </button>
            </div>

          </div>
        </div>
        </div>
      </Transition>

      <!-- Modal: Historique -->
      <Transition name="lv-modal">
        <div v-if="modalHist" class="lv-root" style="all:unset;display:contents">
        <div class="lv-hist-overlay" @click.self="modalHist = false">
          <div class="lv-hist-modal lv-hist-modal--lg">
            <div class="lv-hist-modal__head">
              <div class="lv-hist-modal__head-left">
                <div class="lv-hist-modal__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.85"/></svg>
                </div>
                <div>
                  <div class="lv-hist-modal__title">Historique des dépôts</div>
                  <div class="lv-hist-modal__phase-name">{{ currentEt?.nom }}</div>
                </div>
              </div>
              <button class="lv-hist-modal__close" @click="modalHist = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div v-if="historique.length" class="lv-hist-modal__stats">
              <div class="lv-hist-stat lv-hist-stat--total">
                <span class="lv-hist-stat__num">{{ historique.length }}</span>
                <span class="lv-hist-stat__lbl">Total</span>
              </div>
              <div class="lv-hist-stat lv-hist-stat--ok">
                <span class="lv-hist-stat__num">{{ historique.filter(h => h.statut === 'validee').length }}</span>
                <span class="lv-hist-stat__lbl">Validé(s)</span>
              </div>
              <div class="lv-hist-stat lv-hist-stat--wait">
                <span class="lv-hist-stat__num">{{ historique.filter(h => h.statut === 'en_cours').length }}</span>
                <span class="lv-hist-stat__lbl">En cours</span>
              </div>
              <div class="lv-hist-stat lv-hist-stat--ko">
                <span class="lv-hist-stat__num">{{ historique.filter(h => h.statut === 'rejetee').length }}</span>
                <span class="lv-hist-stat__lbl">Rejeté(s)</span>
              </div>
            </div>

            <!-- ── Historique body: depot-style cards ── -->
            <div class="lv-hist-modal__body lv-hist-modal__body--beige">
              <div v-if="!historique.length" class="lv-hist-empty">
                <div class="lv-hist-empty__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.85"/></svg>
                </div>
                <p class="lv-hist-empty__title">Aucun historique disponible</p>
                <p class="lv-hist-empty__sub">Aucune phase traitée pour cet étudiant.</p>
              </div>

              <div v-else class="lv-depot-list">
                <div v-for="(h, i) in historique" :key="i" class="lv-depot-entry">

                  <!-- Phase header -->
                  <div class="lv-depot-phase-head">
                    <span class="lv-hist-phase-num">Phase {{ h.ordre }}</span>
                    <span class="lv-depot-phase-name">{{ h.phase }}</span>
                    <span class="lv-status-badge lv-status-badge--sm"
                      :class="{ 'lv-status-badge--ok': h.statut === 'validee', 'lv-status-badge--ko': h.statut === 'rejetee', 'lv-status-badge--wait': h.statut === 'en_cours' }">
                      {{ { validee: 'Validée', rejetee: 'Rejetée', en_cours: 'En cours' }[h.statut] || h.statut }}
                    </span>
                    <span class="lv-depot-date">
                      <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {{ h.date }}
                    </span>
                  </div>

                  <!-- Comment if rejected -->
                  <div v-if="h.commentaire" class="lv-hist-entry__comment">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {{ h.commentaire }}
                  </div>

                  <!-- Livrable cards — depot style -->
                  <template v-if="h.livrables && h.livrables.length">
                    <div v-for="lv in h.livrables" :key="lv.id" class="lv-depot-card">
                      <div class="lv-depot-card__dot"
                        :class="{ 'lv-depot-card__dot--ok': lv.statut === 'valide', 'lv-depot-card__dot--ko': lv.statut === 'rejete', 'lv-depot-card__dot--wait': lv.statut === 'en_attente', 'lv-depot-card__dot--muted': lv.statut === 'retire' || lv.statut === 'remplace' }">
                      </div>
                      <div class="lv-depot-card__body">
                        <div class="lv-depot-card__filename">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          {{ lv.file_name || 'Livrable' }}
                          <span v-if="lv.version > 1" class="lv-version-chip">v{{ lv.version }}</span>
                        </div>
                        <div class="lv-depot-card__meta">
                          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          Déposé le {{ lv.depose_le ? new Date(lv.depose_le).toLocaleDateString('fr-FR') : '—' }}
                        </div>
                        <div class="lv-depot-card__actions">
                          <span class="lv-status-badge lv-status-badge--sm"
                            :class="{ 'lv-status-badge--ok': lv.statut === 'valide', 'lv-status-badge--ko': lv.statut === 'rejete', 'lv-status-badge--wait': lv.statut === 'en_attente', 'lv-status-badge--retire': lv.statut === 'retire', 'lv-status-badge--remplace': lv.statut === 'remplace' }">
                            {{ { en_attente: 'En attente', valide: 'Validé', rejete: 'Rejeté', retire: 'Retiré', remplace: 'Remplacé' }[lv.statut] || lv.statut }}
                          </span>
                          <a v-if="lv.fichier_url && lv.statut !== 'retire'" :href="lv.fichier_url" target="_blank" class="lv-depot-open-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            Ouvrir le fichier
                          </a>
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- No livrable for this phase -->
                  <div v-else class="lv-depot-no-lv">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Aucun livrable déposé pour cette phase
                  </div>

                </div>
              </div>
            </div>

            <div class="lv-hist-modal__foot">
              <button class="lv-btn lv-btn--ghost" @click="modalHist = false">Fermer</button>
            </div>
          </div>
        </div>
        </div>
      </Transition>

    </Teleport>
  </div>
</template>

<script>
import api from '@/services/api.js'

const COLORS = ['#3d6080','#27ae60','#d35400','#8e44ad','#2980b9','#c0392b']

export default {
  name: 'SuiviEncadrant',
  data() {
    return {
      filtreActif: 'tous',
      filtres: [
        { val: 'tous',    label: 'Tous' },
        { val: 'actif',   label: 'En cours' },
        { val: 'valide',  label: 'Terminés' },
        { val: 'attente', label: 'En attente' },
      ],
      etudiants: [],
      livrables: [],
      // Reject livrable
      modalRejetLv:       false,
      commentaireRejetLv: '',
      currentLv:          null,
      // Reject phase (no livrable)
      modalRejetPhase:       false,
      commentaireRejetPhase: '',
      currentPhaseRejet:     null,
      currentEtPhaseRejet:   null,
      // Historique
      modalHist:  false,
      historique: [],
      currentEt:  null,
      // Misc
      toast:   { show: false, msg: '', type: 'ok' },
      loading: false,
    }
  },
  computed: {
    etudiantsFiltres() {
      if (this.filtreActif === 'actif')   return this.etudiants.filter(e => e.phaseActive && !e.termineTotal && !this.aLivrableEnAttente(e))
      if (this.filtreActif === 'valide')  return this.etudiants.filter(e => e.termineTotal)
      if (this.filtreActif === 'attente') return this.etudiants.filter(e => this.aLivrableEnAttente(e) && !e.termineTotal)
      return this.etudiants
    },
    nTermines() { return this.etudiants.filter(e => e.termineTotal).length },
    nActifs()   { return this.etudiants.filter(e => e.phaseActive && !e.termineTotal && !this.aLivrableEnAttente(e)).length },
    nAttente()  { return this.etudiants.filter(e => this.aLivrableEnAttente(e) && !e.termineTotal).length },

    /**
     * For each ACTIVE phase (across all students), if deadline ≤ 3 days or past,
     * emit one banner entry — deduped by phase_id.
     */
    deadlineWarnings() {
      const today = new Date(); today.setHours(0,0,0,0)
      const seen = {}
      const warnings = []

      for (const e of this.etudiants) {
        for (const ph of (e.phases || [])) {
          if (!ph.active || ph.terminee) continue
          if (seen[ph.phase_id]) continue
          if (!ph.date_fin) continue

          const fin = new Date(ph.date_fin); fin.setHours(0,0,0,0)
          const diff = Math.round((fin - today) / 86400000)
          if (diff > 3) continue

          // Count students on this phase who have no validated suivi
          const nNonValides = this.etudiants.filter(et =>
            (et.phases || []).some(p => p.phase_id === ph.phase_id && p.active && p.statut !== 'validee')
          ).length

          seen[ph.phase_id] = true
          warnings.push({
            phase_id:     ph.phase_id,
            nom:          ph.nom,
            dateFin:      new Date(ph.date_fin).toLocaleDateString('fr-FR'),
            joursRestants: diff,
            nNonValides,
          })
        }
      }
      return warnings
    },
  },
  mounted() { this.chargerSuivi() },
  methods: {
    aLivrableEnAttente(e) {
      return this.livrablesDe(e).some(l => l.statut === 'en_attente')
    },
    showToast(msg, type = 'ok') {
      this.toast = { show: true, msg, type }
      setTimeout(() => this.toast.show = false, 3500)
    },
    initials(n) {
      if (!n) return '?'
      return n.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    },
    colorFor(id) { return COLORS[id % COLORS.length] },
    livrablesDe(e) {
      return (this.livrables || []).filter(l => l.etudiant_id === e.etudiant_id)
    },
    phasesWithoutLivrable(e) {
      return (e.phases || []).filter(ph => ph.livrable_obligatoire === false || ph.livrable_obligatoire === 0)
    },
    activePhaseOf(e) {
      const phases = e.phases || []
      // Priority: suivi en_cours > phase.active=true > first non-terminee
      return phases.find(p => p.statut === 'en_cours')
        ?? phases.find(p => p.active && !p.terminee)
        ?? phases.find(p => !p.terminee)
        ?? null
    },
    /**
     * Returns days remaining for the active phase of a student,
     * or null if no active phase / no deadline / > 3 days remaining.
     */
    activePhaseDeadline(e) {
      const ph = this.activePhaseOf(e)
      if (!ph || !ph.date_fin || ph.statut === 'validee') return null
      const today = new Date(); today.setHours(0,0,0,0)
      const fin   = new Date(ph.date_fin); fin.setHours(0,0,0,0)
      const diff  = Math.round((fin - today) / 86400000)
      return diff <= 3 ? diff : null
    },
    // ── Load data ─────────────────────────────────────────────
    async chargerSuivi() {
      this.loading = true
      try {
        const r = await api.get('/suivi/encadrant')
        this.etudiants = r.data.map(e => ({
          id:            e.id,
          etudiant_id:   e.etudiant_id,
          nom:           e.nom,
          email:         e.email || null,
          matricule:     e.matricule || null,
          sujet:         e.sujet,
          phases:        e.phases || [],
          phaseActuelle: e.phaseActuelle,
          phaseActive:   e.phaseActive,
          progress:      e.progress,
          color:         this.colorFor(e.id),
          termineTotal:  e.termineTotal,
        }))
      } catch { this.showToast('Erreur chargement suivi', 'err') }

      try {
        const r = await api.get('/livrables/encadrant')
        this.livrables = (r.data || []).map(l => ({
          ...l,
          version:     l.version     ?? 1,
          remplace_le: l.remplace_le ?? null,
        }))
      } catch { this.livrables = [] }

      this.loading = false
    },

    // ── Livrable actions ──────────────────────────────────────
    openRejetLv(lv) {
      this.currentLv = lv
      this.commentaireRejetLv = ''
      this.modalRejetLv = true
    },
    async validerLivrable(lv) {
      try {
        await api.put(`/livrables/${lv.id}/valider`)
        lv.statut = 'valide'
        await this.chargerSuivi()
        this.showToast('Livrable validé ✓')
      } catch (err) { this.showToast(err.response?.data?.message || 'Erreur', 'err') }
    },
    async confirmerRejetLv() {
      if (!this.commentaireRejetLv.trim()) { this.showToast('Commentaire requis', 'err'); return }
      try {
        await api.put(`/livrables/${this.currentLv.id}/rejeter`, { commentaire: this.commentaireRejetLv })
        this.currentLv.statut = 'rejete'
        this.currentLv.commentaire = this.commentaireRejetLv
        this.modalRejetLv = false
        await this.chargerSuivi()
        this.showToast('Livrable rejeté')
      } catch (err) { this.showToast(err.response?.data?.message || 'Erreur', 'err') }
    },

    // ── Phase actions (no livrable required) ──────────────────
    async validerPhase(e, ph) {
      try {
        await api.post('/suivi/valider', { affectation_id: e.id, phase_id: ph.phase_id })
        await this.chargerSuivi()
        this.showToast(`Phase "${ph.nom}" validée ✓`)
      } catch (err) { this.showToast(err.response?.data?.message || 'Erreur', 'err') }
    },
    openRejetPhase(e, ph) {
      this.currentEtPhaseRejet   = e
      this.currentPhaseRejet     = ph
      this.commentaireRejetPhase = ''
      this.modalRejetPhase       = true
    },
    async confirmerRejetPhase() {
      if (!this.commentaireRejetPhase.trim()) { this.showToast('Commentaire requis', 'err'); return }
      try {
        await api.post('/suivi/rejeter', {
          affectation_id:        this.currentEtPhaseRejet.id,
          phase_id:              this.currentPhaseRejet.phase_id,
          commentaire_encadrant: this.commentaireRejetPhase,
        })
        this.modalRejetPhase = false
        await this.chargerSuivi()
        this.showToast(`Phase "${this.currentPhaseRejet.nom}" rejetée`)
      } catch (err) { this.showToast(err.response?.data?.message || 'Erreur', 'err') }
    },

    // ── Historique (phases + livrables with eye link) ─────────
    async voirHistorique(e) {
      this.currentEt  = e
      this.historique = []
      this.modalHist  = true
      try {
        const [rSuivi, rLv] = await Promise.all([
          api.get(`/suivi/historique/${e.id}`),
          api.get('/livrables/encadrant'),
        ])
        const lvs = (rLv.data || []).filter(l => l.etudiant_id === e.etudiant_id)
        this.historique = (rSuivi.data || []).map(h => ({
          ...h,
          livrables: lvs.filter(l => {
            if (h.phase_id) return l.phase_id === h.phase_id
            return l.phase_nom === h.phase
          }).filter(l => l.fichier_url),
        }))
      } catch { this.historique = [] }
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

/* ════════════════════════════════════════════════════════════
   SUIVI ENCADRANT — same design tokens as Livrablesetudiant
   ════════════════════════════════════════════════════════════ */

.lv-root {
  --lv-blue:           #3d6080;
  --lv-blue-dark:      #2f4f6a;
  --lv-blue-light:     #5a7fa0;
  --lv-blue-muted:     rgba(61,96,128,.12);
  --lv-blue-border:    rgba(61,96,128,.22);
  --lv-gold:           #F5C518;
  --lv-gold-dark:      #c9a100;
  --lv-gold-muted:     rgba(245,197,24,.18);
  --lv-gold-border:    rgba(245,197,24,.32);

  --lv-bg:             #c4c0b8;
  --lv-surface:        #dedbd4;
  --lv-surface-alt:    #e9e6df;
  --lv-surface-raised: #f0ede7;
  --lv-surface-card:   #f4f1ec;
  --lv-border:         #c0bbb3;
  --lv-border-strong:  #a8a39b;
  --lv-shadow-sm:      0 2px 8px rgba(0,0,0,.07);
  --lv-shadow-md:      0 4px 18px rgba(0,0,0,.10);
  --lv-shadow-lg:      0 8px 32px rgba(0,0,0,.13);

  --lv-text:           #1e2c3a;
  --lv-text-muted:     #5a6a7a;
  --lv-text-light:     #8a9aa8;

  --lv-ok:             #1e9e60;
  --lv-ok-bg:          rgba(30,158,96,.10);
  --lv-ok-border:      rgba(30,158,96,.25);
  --lv-ko:             #d94040;
  --lv-ko-bg:          rgba(217,64,64,.08);
  --lv-ko-border:      rgba(217,64,64,.22);
  --lv-wait:           #e09020;
  --lv-wait-bg:        rgba(224,144,32,.10);
  --lv-wait-border:    rgba(224,144,32,.28);

  --lv-r-sm: 6px; --lv-r-md: 10px; --lv-r-lg: 16px;
  --lv-t-fast: .16s;
  --lv-ease: cubic-bezier(.4,0,.2,1);

  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 14px; color: var(--lv-text);
  background: var(--lv-bg); min-height: 100vh;
  padding: 24px; box-sizing: border-box;
}

/* ── Toast ────────────────────────────────────────────── */
.lv-toast {
  position: fixed; top: 20px; right: 20px; z-index: 9999;
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: var(--lv-r-md);
  font-size: 13px; font-weight: 600;
  box-shadow: var(--lv-shadow-md); min-width: 220px; max-width: 380px;
}
.lv-toast--ok  { background: var(--lv-ok-bg);  color: var(--lv-ok);  border: 1.5px solid var(--lv-ok-border); }
.lv-toast--err { background: var(--lv-ko-bg);  color: var(--lv-ko);  border: 1.5px solid var(--lv-ko-border); }
.lv-toast__x   { margin-left:auto; background:none; border:none; cursor:pointer; color:inherit; padding:2px; display:flex; }
.toast-enter-active { transition: all .2s var(--lv-ease); }
.toast-leave-active { transition: all .16s ease; }
.toast-enter-from   { opacity:0; transform:translateY(-8px); }
.toast-leave-to     { opacity:0; transform:translateY(-4px); }

/* ── Widget ───────────────────────────────────────────── */
.lv-widget {
  background: var(--lv-surface); border-radius: var(--lv-r-lg);
  border: 1px solid var(--lv-border); box-shadow: var(--lv-shadow-md); overflow: hidden;
}
.lv-widget__header {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  padding: 22px 26px 18px;
  background: linear-gradient(135deg, var(--lv-blue-dark) 0%, var(--lv-blue) 100%);
  border-bottom: 3px solid var(--lv-gold);
}
.lv-widget__header-left { display: flex; align-items: center; gap: 14px; }
.lv-widget__icon {
  width: 42px; height: 42px; border-radius: var(--lv-r-md);
  background: rgba(255,255,255,.12); border: 1.5px solid rgba(255,255,255,.18);
  display: flex; align-items: center; justify-content: center; color: var(--lv-gold); flex-shrink: 0;
}
.lv-widget__title { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 2px; }
.lv-widget__sub   { font-size: 12px; color: rgba(255,255,255,.65); margin: 0; }

/* ── KPI strip ────────────────────────────────────────── */
.lv-kpi-strip { display: flex; gap: 8px; flex-wrap: wrap; }
.lv-kpi { display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 7px 14px; border-radius: var(--lv-r-md); min-width: 66px; text-align: center; border: 1.5px solid transparent; }
.lv-kpi strong { font-size: 18px; font-weight: 800; line-height: 1; }
.lv-kpi span   { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; opacity: .85; }
.lv-kpi--ok   { background: var(--lv-ok-bg);   border-color: var(--lv-ok-border);   color: var(--lv-ok); }
.lv-kpi--warn { background: var(--lv-wait-bg); border-color: var(--lv-wait-border); color: var(--lv-wait); }
.lv-kpi--ko   { background: var(--lv-ko-bg);   border-color: var(--lv-ko-border);   color: var(--lv-ko); }

/* ── Filter bar — gold active state ───────────────────── */
.lv-filter-bar {
  display: flex; gap: 6px; flex-wrap: wrap; padding: 14px 24px 10px;
  border-bottom: 1px solid var(--lv-border); background: var(--lv-surface-alt);
}
.lv-filter-btn {
  font-size: 12px; font-weight: 600; padding: 5px 14px; border-radius: 999px;
  border: 1.5px solid var(--lv-border); background: var(--lv-surface-raised); color: var(--lv-text-muted);
  cursor: pointer; transition: all var(--lv-t-fast);
}
.lv-filter-btn:hover { background: var(--lv-surface-card); color: var(--lv-text); border-color: var(--lv-gold-border); }
.lv-filter-btn--active {
  background: linear-gradient(135deg, var(--lv-gold) 0%, #d4a700 100%);
  border-color: transparent; color: #1a2d3e;
  box-shadow: 0 2px 8px rgba(245,197,24,.35);
}

/* ── Loading / Empty ──────────────────────────────────── */
.lv-loading { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 60px 16px; color: var(--lv-text-muted); font-size: 13px; }
.lv-empty   { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 16px; color: var(--lv-text-muted); font-size: 13px; text-align: center; }
.lv-empty__icon { width: 72px; height: 72px; border-radius: 50%; background: var(--lv-blue-muted); border: 1.5px solid var(--lv-blue-border); display: flex; align-items: center; justify-content: center; color: var(--lv-blue); }
.lv-empty p { margin: 0; }
.lv-empty__title { font-weight: 700; color: var(--lv-text); font-size: 15px; }
.lv-empty__sub   { font-size: 12.5px; }

/* ── Phases grid (students mode) ──────────────────────── */
.lv-phases          { display: flex; gap: 0; padding: 24px 24px 28px; overflow-x: auto; }
.lv-phases--students { flex-wrap: wrap; gap: 18px; }
.lv-phase-arrow     { display: flex; align-items: center; padding: 0 6px; color: var(--lv-text-muted); flex-shrink: 0; align-self: flex-start; margin-top: 60px; }

/* ── Card ─────────────────────────────────────────────── */
.lv-phase-card {
  background: var(--lv-surface-card); border: 1.5px solid var(--lv-border);
  border-radius: var(--lv-r-lg); box-shadow: var(--lv-shadow-sm);
  position: relative; overflow: hidden;
  transition: box-shadow var(--lv-t-fast), transform var(--lv-t-fast);
}
.lv-phase-card--student { min-width: 320px; width: 340px; flex-shrink: 0; }
.lv-phase-card--active  { border-color: rgba(245,197,24,.55); box-shadow: 0 0 0 2.5px rgba(245,197,24,.18), var(--lv-shadow-md); }
.lv-phase-card--done    { border-color: var(--lv-ok-border); box-shadow: 0 0 0 2px var(--lv-ok-bg), var(--lv-shadow-sm); }
.lv-phase-card:hover    { transform: translateY(-2px); box-shadow: var(--lv-shadow-md); }

.lv-pc-body    { padding: 18px 18px 16px; display: flex; flex-direction: column; gap: 10px; }
.lv-pc-header  { display: flex; align-items: center; gap: 10px; }
.lv-pc-nom         { font-size: 12.5px; font-weight: 500; color: var(--lv-text-muted); font-style: italic; }
.lv-pc-nom--empty  { color: var(--lv-text-light); font-size: 11.5px; }
.lv-pc-dates   { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--lv-text-muted); }
.lv-pc-divider { height: 1px; background: var(--lv-border); margin: 2px 0; }
.lv-pc-file-icon { width: 28px; height: 28px; flex-shrink: 0; align-self: flex-start; display: flex; align-items: center; justify-content: center; background: var(--lv-blue-muted); border: 1px solid var(--lv-blue-border); border-radius: var(--lv-r-sm); color: var(--lv-blue); }
.lv-pc-file-name { font-size: 12px; font-weight: 600; color: var(--lv-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 5px; }
.lv-pc-file-date { font-size: 10.5px; color: var(--lv-text-muted); margin-top: 1px; }

/* ── Student header ───────────────────────────────────── */
.lv-sc-av  { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.18); }
.lv-sc-nom { flex: 1; font-size: 14px; font-weight: 700; color: var(--lv-text); }
.lv-sc-ring { position: relative; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.lv-sc-pct  { position: absolute; font-size: 9.5px; font-weight: 800; color: var(--lv-text); pointer-events: none; }

/* Progress bar */
.lv-sc-bar        { height: 5px; border-radius: 999px; background: var(--lv-border); overflow: hidden; }
.lv-sc-bar__fill  { height: 100%; border-radius: 999px; transition: width .4s var(--lv-ease); }

/* Phase dots */
.lv-sc-dots { display: flex; gap: 5px; flex-wrap: wrap; }
.lv-pdot { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--lv-border); cursor: default; transition: all var(--lv-t-fast); display: inline-flex; align-items: center; justify-content: center; }
.lv-pdot--done     { background: var(--lv-ok);   border-color: var(--lv-ok-border); }
.lv-pdot--active   { background: var(--lv-gold); border-color: var(--lv-gold-border); box-shadow: 0 0 0 2.5px var(--lv-gold-muted); }
.lv-pdot--rejected { background: var(--lv-ko);   border-color: var(--lv-ko-border); }
.lv-pdot--future   { background: var(--lv-surface-alt); border-color: var(--lv-border); }

/* ── Phases without livrable — gold tinted ────────────── */
.lv-nolv-row {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 7px 10px; border-radius: var(--lv-r-sm);
  background: rgba(245,197,24,.08); border: 1px solid rgba(245,197,24,.30);
}
.lv-nolv-info { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--lv-text); }
.lv-nolv-hint { font-style: italic; font-weight: 400; color: var(--lv-text-muted); font-size: 11px; }
.lv-nolv-actions { display: flex; gap: 6px; }

/* ── Livrables section ────────────────────────────────── */
.lv-enc-livrables { display: flex; flex-direction: column; gap: 6px; }
.lv-sep { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--lv-text-muted); padding: 2px 0; }
.lv-sep-count { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: var(--lv-blue-muted); color: var(--lv-blue); font-size: 10px; font-weight: 800; border: 1px solid var(--lv-blue-border); }
.lv-enc-row { display: flex; align-items: flex-start; gap: 8px; padding: 8px 10px; border-radius: var(--lv-r-sm); background: var(--lv-surface-alt); border: 1px solid var(--lv-border); transition: background var(--lv-t-fast); }
.lv-enc-row:hover { background: var(--lv-surface-raised); }
.lv-enc-row-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.lv-enc-row-actions { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin-top: 4px; }
.lv-enc-replace { color: var(--lv-gold-dark); font-size: 10px; }

/* ── Icon buttons ─────────────────────────────────────── */
.lv-icon-btn { width: 28px; height: 28px; border-radius: var(--lv-r-sm); display: flex; align-items: center; justify-content: center; border: 1.5px solid transparent; cursor: pointer; flex-shrink: 0; transition: all var(--lv-t-fast); }
.lv-icon-btn--view { background: var(--lv-blue-muted); border-color: var(--lv-blue-border); color: var(--lv-blue); }
.lv-icon-btn--view:hover { background: rgba(61,96,128,.22); }
.lv-icon-btn--ok   { background: var(--lv-ok-bg); border-color: var(--lv-ok-border); color: var(--lv-ok); }
.lv-icon-btn--ok:hover { background: rgba(30,158,96,.18); }
.lv-icon-btn--ko   { background: var(--lv-ko-bg); border-color: var(--lv-ko-border); color: var(--lv-ko); }
.lv-icon-btn--ko:hover { background: rgba(217,64,64,.18); }

/* ── Hist btn — gold accent ───────────────────────────── */
.lv-hist-btn {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; font-weight: 700;
  color: var(--lv-gold-dark);
  background: rgba(245,197,24,.12); border: 1.5px solid rgba(245,197,24,.40);
  border-radius: var(--lv-r-sm); padding: 6px 12px; cursor: pointer;
  transition: all var(--lv-t-fast); font-family: inherit; align-self: flex-start;
}
.lv-hist-btn:hover {
  background: rgba(245,197,24,.22); border-color: var(--lv-gold);
  box-shadow: 0 2px 8px rgba(245,197,24,.25);
}

/* ── Buttons ──────────────────────────────────────────── */
.lv-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; padding: 8px 15px; border-radius: var(--lv-r-md); cursor: pointer; border: 1.5px solid transparent; transition: all var(--lv-t-fast) var(--lv-ease); white-space: nowrap; font-family: inherit; }
.lv-btn--ghost    { background: var(--lv-surface-alt); border-color: var(--lv-border); color: var(--lv-text-muted); }
.lv-btn--ghost:hover { background: var(--lv-surface-raised); color: var(--lv-text); }
.lv-btn--danger   { background: var(--lv-ko-bg); border-color: var(--lv-ko-border); color: var(--lv-ko); }
.lv-btn--danger:hover { background: rgba(217,64,64,.18); }
.lv-btn--danger:disabled { opacity: .4; cursor: not-allowed; }
.lv-btn--validate { background: var(--lv-ok-bg); border-color: var(--lv-ok-border); color: var(--lv-ok); }
.lv-btn--validate:hover { background: rgba(30,158,96,.18); }
.lv-btn--ok-sm { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: var(--lv-r-sm); cursor: pointer; font-family: inherit; background: var(--lv-ok-bg); border: 1.5px solid var(--lv-ok-border); color: var(--lv-ok); transition: all var(--lv-t-fast); white-space: nowrap; }
.lv-btn--ok-sm:hover { background: rgba(30,158,96,.18); }
.lv-btn--ko-sm { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: var(--lv-r-sm); cursor: pointer; font-family: inherit; background: var(--lv-ko-bg); border: 1.5px solid var(--lv-ko-border); color: var(--lv-ko); transition: all var(--lv-t-fast); white-space: nowrap; }
.lv-btn--ko-sm:hover { background: rgba(217,64,64,.18); }

/* ── Status badges ────────────────────────────────────── */
.lv-status-badge { display: inline-flex; align-items: center; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; letter-spacing: .04em; white-space: nowrap; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
.lv-status-badge--sm   { font-size: 10px; padding: 2px 8px; box-shadow: none; }
.lv-status-badge--ok   { background: var(--lv-ok-bg);   color: var(--lv-ok);   border: 1.5px solid var(--lv-ok-border); }
.lv-status-badge--ko   { background: var(--lv-ko-bg);   color: var(--lv-ko);   border: 1.5px solid var(--lv-ko-border); }
.lv-status-badge--wait    { background: var(--lv-wait-bg); color: var(--lv-wait); border: 1.5px solid var(--lv-wait-border); }
.lv-status-badge--retire  { background: rgba(100,100,100,.10); color: #666; border: 1.5px solid rgba(100,100,100,.22); }
.lv-status-badge--remplace { background: rgba(61,96,128,.10); color: var(--lv-blue); border: 1.5px solid var(--lv-blue-border); }

/* ── Version chip ─────────────────────────────────────── */
.lv-version-chip { display: inline-block; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 999px; background: rgba(245,197,24,.14); color: var(--lv-gold-dark); border: 1px solid var(--lv-gold-border); }

/* ── Student meta row: email + matricule ──────────────── */
.lv-sc-meta-row { display: flex; flex-wrap: wrap; gap: 5px; margin: 2px 0 4px; }
.lv-sc-meta-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10.5px; font-weight: 500; color: var(--lv-text-muted);
  background: var(--lv-surface-raised); border: 1px solid var(--lv-border);
  border-radius: 100px; padding: 2px 8px; white-space: nowrap;
  max-width: 220px; overflow: hidden; text-overflow: ellipsis;
}
.lv-sc-meta-chip--mat { color: var(--lv-gold-dark); border-color: var(--lv-gold-border); background: rgba(245,197,24,.08); }
.lv-sc-meta-chip--mail { color: var(--lv-blue); border-color: var(--lv-blue-border); }

/* ── Phase dot with number ────────────────────────────── */
.lv-pdot { position: relative; display: inline-flex; align-items: center; justify-content: center; }
.lv-pdot-num { font-size: 8px; font-weight: 700; color: inherit; line-height: 1; pointer-events: none; }
.lv-pdot--done .lv-pdot-num    { color: #fff; }
.lv-pdot--active .lv-pdot-num  { color: #1a2d3e; }
.lv-pdot--rejected .lv-pdot-num{ color: #fff; }
.lv-pdot--future .lv-pdot-num  { color: var(--lv-text-muted); }

/* ── Phase number label in historique ────────────────── */
.lv-hist-phase-num {
  display: inline-block; font-size: 10px; font-weight: 700;
  color: var(--lv-gold-dark); background: rgba(245,197,24,.12);
  border: 1px solid var(--lv-gold-border); border-radius: 4px;
  padding: 1px 5px; margin-right: 4px;
}

/* ── Spinner ──────────────────────────────────────────── */
.lv-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid var(--lv-blue-muted); border-top-color: var(--lv-gold); animation: lv-spin .7s linear infinite; }
@keyframes lv-spin { to { transform: rotate(360deg); } }

/* ═══ DEPOT-STYLE HISTORIQUE ════════════════════════════ */
.lv-depot-list { display: flex; flex-direction: column; gap: 20px; }

.lv-depot-entry { display: flex; flex-direction: column; gap: 8px; }

.lv-depot-phase-head {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  font-size: 13px; font-weight: 700; color: var(--lv-text);
  padding-bottom: 6px; border-bottom: 1px solid var(--lv-border);
}
.lv-depot-phase-name { flex: 1; min-width: 0; }
.lv-depot-date {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 400; color: var(--lv-text-muted);
}

/* ── Individual livrable card (depot style) ────────────── */
.lv-depot-card {
  display: flex; align-items: flex-start; gap: 12px;
  background: #fff; border: 1px solid var(--lv-border);
  border-radius: var(--lv-r-md); padding: 12px 14px;
  box-shadow: var(--lv-shadow-sm);
}
.lv-depot-card__dot {
  width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0;
  margin-top: 3px; border: 2px solid var(--lv-border);
  background: var(--lv-surface-alt);
}
.lv-depot-card__dot--ok    { background: var(--lv-ok);   border-color: var(--lv-ok-border); }
.lv-depot-card__dot--muted { background: #bbb; border-color: #aaa; }
.lv-depot-card__dot--ko   { background: var(--lv-ko);   border-color: var(--lv-ko-border); }
.lv-depot-card__dot--wait { background: var(--lv-wait); border-color: var(--lv-wait-border); }

.lv-depot-card__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.lv-depot-card__filename {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600; color: var(--lv-text);
}
.lv-depot-card__meta {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; color: var(--lv-text-muted);
}
.lv-depot-card__actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 2px; }

.lv-depot-open-btn {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; font-weight: 600; color: var(--lv-blue);
  background: var(--lv-blue-muted); border: 1.5px solid var(--lv-blue-border);
  border-radius: var(--lv-r-sm); padding: 3px 10px;
  text-decoration: none; white-space: nowrap;
  transition: all var(--lv-t-fast);
}
.lv-depot-open-btn:hover { background: rgba(61,96,128,.22); border-color: var(--lv-blue); }

.lv-depot-no-lv {
  display: flex; align-items: center; gap: 6px;
  font-size: 11.5px; color: var(--lv-text-muted); font-style: italic;
  padding: 8px 12px; background: var(--lv-surface-raised);
  border: 1px dashed var(--lv-border); border-radius: var(--lv-r-sm);
}

/* ═══ MODAL SYSTEM ══════════════════════════════════════ */
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
.lv-hist-modal--lg { max-width: 660px; }

/* ── Header — warm amber gradient (matches Livrablesetudiant) */
.lv-hist-modal__head {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 20px 22px;
  background: linear-gradient(135deg, #7c4f0f 0%, #5a3508 100%);
  flex-shrink: 0;
}
.lv-hist-modal__head-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }

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

/* ── Stats bar — beige amber */
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
.lv-hist-stat__num { font-size: 22px; font-weight: 800; line-height: 1; letter-spacing: -0.03em; }
.lv-hist-stat__lbl { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; opacity: .75; }
.lv-hist-stat--total .lv-hist-stat__num { color: var(--lv-blue); }
.lv-hist-stat--total .lv-hist-stat__lbl { color: var(--lv-blue); }
.lv-hist-stat--ok   .lv-hist-stat__num { color: var(--lv-ok);   }
.lv-hist-stat--ok   .lv-hist-stat__lbl { color: var(--lv-ok);   }
.lv-hist-stat--wait .lv-hist-stat__num { color: var(--lv-wait); }
.lv-hist-stat--wait .lv-hist-stat__lbl { color: var(--lv-wait); }
.lv-hist-stat--ko   .lv-hist-stat__num { color: var(--lv-ko);   }
.lv-hist-stat--ko   .lv-hist-stat__lbl { color: var(--lv-ko);   }

/* ── Modal body: beige background */
.lv-hist-modal__body { flex: 1; overflow-y: auto; padding: 16px 20px; background: var(--lv-surface-card); }
.lv-hist-modal__body--beige { background: #fef3e2; scrollbar-color: #fac775 transparent; }
.lv-hist-modal__body--beige::-webkit-scrollbar { width: 4px; }
.lv-hist-modal__body--beige::-webkit-scrollbar-thumb { background: #fac775; border-radius: 999px; }

/* ── Footer: beige */
.lv-hist-modal__foot {
  padding: 14px 22px;
  border-top: 1px solid #fac775;
  background: #fef3e2;
  display: flex; justify-content: flex-end;
  flex-shrink: 0;
}
.lv-hist-modal__footer { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 14px 20px; border-top: 1px solid var(--lv-border); background: var(--lv-surface-alt); flex-shrink: 0; }

/* Historique list */
.lv-hist-list    { display: flex; flex-direction: column; gap: 16px; }
.lv-hist-entry   { display: flex; gap: 14px; }
.lv-hist-entry__dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; border: 2px solid var(--lv-border); }
.lv-hist-entry__dot--ok   { background: var(--lv-ok);   border-color: var(--lv-ok-border); }
.lv-hist-entry__dot--ko   { background: var(--lv-ko);   border-color: var(--lv-ko-border); }
.lv-hist-entry__dot--wait { background: var(--lv-gold); border-color: var(--lv-gold-border); }
.lv-hist-entry__content { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.lv-hist-entry__phase   { font-size: 13px; font-weight: 700; color: var(--lv-text); }
.lv-hist-entry__row     { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.lv-hist-entry__meta    { font-size: 11px; color: var(--lv-text-muted); display: flex; align-items: center; gap: 5px; }
.lv-hist-entry__comment { display: flex; align-items: flex-start; gap: 6px; font-size: 11.5px; color: var(--lv-ko); font-style: italic; line-height: 1.4; background: var(--lv-ko-bg); padding: 7px 10px; border-radius: var(--lv-r-sm); border: 1px solid var(--lv-ko-border); }

/* ── Livrable row inside historique ───────────────────── */
.lv-hist-lv-row {
  display: flex; align-items: center; gap: 8px; flex-wrap: nowrap;
  padding: 7px 10px; border-radius: var(--lv-r-sm);
  background: var(--lv-surface-raised); border: 1px solid var(--lv-border);
}
.lv-hist-lv-icon {
  width: 24px; height: 24px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: var(--lv-blue-muted); border: 1px solid var(--lv-blue-border);
  border-radius: var(--lv-r-sm); color: var(--lv-blue);
}
.lv-hist-lv-name {
  flex: 1; min-width: 0; font-size: 12px; font-weight: 600; color: var(--lv-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── Eye "Ouvrir" anchor in livrable rows ─────────────── */
.lv-hist-eye-btn {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; font-weight: 700; padding: 5px 12px;
  border-radius: var(--lv-r-sm); text-decoration: none;
  background: linear-gradient(135deg, var(--lv-gold) 0%, #d4a700 100%);
  color: #1a2d3e; border: none; flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(245,197,24,.30);
  transition: all var(--lv-t-fast); white-space: nowrap;
}
.lv-hist-eye-btn:hover { box-shadow: 0 4px 14px rgba(245,197,24,.45); transform: translateY(-1px); }

/* ── Open link in historique ───────────────────────────── */
.lv-hist-entry__open { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: var(--lv-blue); text-decoration: none; padding: 3px 9px; border-radius: var(--lv-r-sm); border: 1.5px solid var(--lv-blue-border); background: var(--lv-blue-muted); transition: all var(--lv-t-fast); white-space: nowrap; }
.lv-hist-entry__open:hover { background: rgba(61,96,128,.18); border-color: var(--lv-blue); }

/* ── Open link in historique (depot) ─────────────────────── */
.lv-depot-open-btn { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: var(--lv-blue); text-decoration: none; padding: 3px 9px; border-radius: var(--lv-r-sm); border: 1.5px solid var(--lv-blue-border); background: var(--lv-blue-muted); transition: all var(--lv-t-fast); white-space: nowrap; }
.lv-depot-open-btn:hover { background: rgba(61,96,128,.18); border-color: var(--lv-blue); }

/* Historique empty */
.lv-hist-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 16px; color: var(--lv-text-muted); font-size: 13px; text-align: center; }
.lv-hist-empty__icon { width: 60px; height: 60px; border-radius: 50%; background: var(--lv-blue-muted); border: 1.5px solid var(--lv-blue-border); display: flex; align-items: center; justify-content: center; color: var(--lv-blue); }
.lv-hist-empty p { margin: 0; }
.lv-hist-empty__title { font-weight: 700; color: var(--lv-text); font-size: 14.5px; }
.lv-hist-empty__sub   { font-size: 12.5px; }

/* Form in modal */
.lv-form-field { display: flex; flex-direction: column; gap: 5px; }
.lv-form-label { font-size: 12.5px; font-weight: 600; color: var(--lv-text); }
.lv-req        { color: var(--lv-ko); }
.lv-form-ta    { width: 100%; padding: 8px 12px; font-size: 13px; font-family: inherit; background: var(--lv-surface-raised); border: 1.5px solid var(--lv-border); border-radius: var(--lv-r-md); color: var(--lv-text); outline: none; transition: border-color var(--lv-t-fast); resize: vertical; box-sizing: border-box; }
.lv-form-ta:focus { border-color: var(--lv-gold); box-shadow: 0 0 0 3px var(--lv-gold-muted); }

/* Modal transition */
.lv-modal-enter-from { opacity: 0; }
.lv-modal-enter-from .lv-hist-modal,
.lv-modal-enter-from .lv-retirer-modal { transform: scale(.95) translateY(12px); }
.lv-modal-enter-active { transition: opacity .22s var(--lv-ease); }
.lv-modal-enter-active .lv-hist-modal,
.lv-modal-enter-active .lv-retirer-modal { transition: transform .22s var(--lv-ease); }
.lv-modal-leave-to { opacity: 0; }
.lv-modal-leave-to .lv-hist-modal,
.lv-modal-leave-to .lv-retirer-modal { transform: scale(.96) translateY(6px); }
.lv-modal-leave-active { transition: opacity .16s ease; }
.lv-modal-leave-active .lv-hist-modal,
.lv-modal-leave-active .lv-retirer-modal { transition: transform .16s ease; }

/* ══════════════════════════════════════════════════════════
   RETIRER / REJETER MODAL — danger red theme
   (matches lv-retirer-modal in Livrablesetudiant)
   ══════════════════════════════════════════════════════════ */
.lv-retirer-modal {
  background: #fff8f7;
  border: 1.5px solid rgba(217,64,64,.22);
  border-radius: var(--lv-r-2xl);
  width: 100%; max-width: 420px;
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

/* ══════════════════════════════════════════════════════════
   DEADLINE WARNING BANNERS — same as Livrablesetudiant
   ══════════════════════════════════════════════════════════ */
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

/* ── Per-student deadline chip on card ────────────────── */
.lv-sc-deadline-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700;
  padding: 4px 10px; border-radius: 999px;
  margin-top: 4px; width: fit-content;
}
.lv-sc-deadline-chip--soon    { background: rgba(224,144,32,.14); color: #7a5000; border: 1px solid rgba(224,144,32,.30); }
.lv-sc-deadline-chip--today   { background: rgba(217,64,64,.12);  color: #7a1010; border: 1px solid rgba(217,64,64,.28); }
.lv-sc-deadline-chip--expired { background: rgba(217,64,64,.14);  color: #7a1010; border: 1px solid rgba(217,64,64,.30); }

/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 640px) {
  .lv-root { padding: 12px; }
  .lv-widget__header { padding: 14px 16px 12px; }
  .lv-filter-bar { padding: 10px 14px 8px; }
  .lv-phases { padding: 14px 14px 20px; }
  .lv-phase-card--student { min-width: 280px; width: 100%; }
  .lv-hist-modal { max-width: 100%; }
  .lv-kpi-strip { gap: 5px; }
  .lv-kpi { min-width: 58px; padding: 5px 8px; }
}
</style>