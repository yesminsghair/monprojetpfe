<template>
  <div class="gs-root">
    <div class="gs-page-card">

      <!-- ── Header ── -->
      <div class="gs-header">
        <div class="gs-header__left">
          <div class="gs-header__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <div class="gs-title">Planification des soutenances</div>
            <div class="gs-subtitle">Gérez les sessions, salles et plans proposés par les jurys</div>
          </div>
        </div>
        <div class="gs-header__actions">
          <span v-if="conflitDetecte" class="gs-badge gs-badge--danger">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Conflits détectés
          </span>
          <span class="gs-badge gs-badge--info">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {{ sessions.length }} session(s)
          </span>
          <button
            class="gs-btn gs-btn--publish"
            :disabled="!sessionsNonPubliees.length || publishing"
            @click="askPublierCalendrier"
            :title="sessionsNonPubliees.length ? `Publier ${sessionsNonPubliees.length} session(s) non publiée(s)` : 'Aucune session à publier'"
          >
            <span v-if="publishing" class="gs-spinner-sm"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Publier
            <span v-if="sessionsNonPubliees.length" class="gs-publish-count">{{ sessionsNonPubliees.length }}</span>
          </button>
          <button class="gs-btn gs-btn--primary" @click="openModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Planifier une session
          </button>
        </div>
      </div>

      <!-- ── Tabs ── -->
      <div class="gs-tabs-wrapper">
        <div class="gs-tabs">
          <button v-for="tab in tabs" :key="tab.key"
            class="gs-tab"
            :class="{ 'gs-tab--active': onglet === tab.key }"
            @click="onglet = tab.key">
            {{ tab.label }}
            <span v-if="tab.count" class="gs-tab__count" :class="{ 'gs-tab__count--active': onglet === tab.key }">{{ tab.count }}</span>
          </button>
        </div>

        <div class="gs-tab-content">

          <!-- ══ SESSIONS LIST ══ -->
          <template v-if="onglet === 'liste'">
            <div v-if="loadingSessions" class="gs-state">
              <div class="gs-spinner"></div>
              <p>Chargement en cours…</p>
            </div>
            <div v-else-if="!sessions.length" class="gs-state gs-state--empty">
              <div class="gs-state__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <p class="gs-state__title">Aucune session planifiée</p>
              <p class="gs-state__sub">Commencez par planifier votre première soutenance</p>
              <button class="gs-btn gs-btn--primary" style="margin-top:16px" @click="openModal()">Planifier la première session</button>
            </div>
            <div v-else class="gs-table-wrapper">
              <table class="gs-table">
                <thead>
                  <tr>
                    <th>Date &amp; Heure</th>
                    <th>Projet</th>
                    <th>Étudiant</th>
                    <th>Salle</th>
                    <th>Jury</th>
                    <th>Statut</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in sessions" :key="s.id" :class="s.conflit ? 'gs-table__row--conflict' : ''">
                    <td>
                      <div class="gs-date-cell">
                        <div class="gs-date-cell__day">{{ formatDate(s.date) }}</div>
                        <div class="gs-date-cell__time">{{ s.heure_debut }} – {{ s.heure_fin }}</div>
                      </div>
                    </td>
                    <td><span class="gs-project-name">{{ s.projet || '—' }}</span></td>
                    <td class="gs-muted">{{ s.etudiant || '—' }}</td>
                    <td>
                      <span class="gs-room-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                        {{ s.salle || '—' }}
                      </span>
                    </td>
                    <td class="gs-muted gs-small">
                      <div v-if="s.encadrant_nom" class="gs-jury-mini"><span class="gs-jury-mini__role">Enc.</span> {{ s.encadrant_nom }}</div>
                      <div v-if="s.president_nom" class="gs-jury-mini"><span class="gs-jury-mini__role gs-jury-mini__role--president">Prés.</span> {{ s.president_nom }}</div>
                      <div v-if="s.examinateur_nom" class="gs-jury-mini"><span class="gs-jury-mini__role gs-jury-mini__role--exam">Exam.</span> {{ s.examinateur_nom }}</div>
                      <span v-if="!s.encadrant_nom && !s.president_nom && !s.examinateur_nom">{{ s.jury_membres?.join(', ') || '—' }}</span>
                    </td>
                    <td>
                      <span class="gs-statut-badge" :class="statutClass(s.statut)">{{ statutLabel(s.statut) }}</span>
                    </td>
                    <td class="text-center">
                      <span v-if="s.calendrier_publie" class="gs-published-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Publié
                      </span>
                      <!-- Plan-originated sessions: read-only (validated by a jury member's plan) -->
                      <span v-else-if="s.from_plan" class="gs-validated-plan-badge" title="Session issue d'un plan validé — non modifiable ici">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        Issu d'un plan
                      </span>
                      <!-- Manually created sessions: full edit + delete -->
                      <div v-else class="gs-actions">
                        <button class="gs-icon-btn gs-icon-btn--edit" title="Modifier" @click="openModal(s)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="gs-icon-btn gs-icon-btn--del" title="Supprimer" @click="askDeleteSession(s)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <!-- ══ CALENDAR ══ -->
          <template v-if="onglet === 'calendrier'">
            <div v-if="!joursAvecSessions.length" class="gs-state gs-state--empty">
              <div class="gs-state__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <p class="gs-state__title">Aucune session publiée à afficher</p>
            </div>
            <div v-else class="gs-calendar">
              <div v-for="(jour, di) in joursAvecSessions" :key="jour.date" class="gs-day-group">
                <div class="gs-day-label">
                  <span class="gs-day-label__dot"></span>
                  {{ jour.dateLabel }}
                </div>
                <div class="gs-cards-grid">
                  <div v-for="(s, si) in jour.sessions" :key="s.id"
                    class="gs-session-card"
                    :class="[s.conflit ? 'gs-session-card--conflict' : `gs-session-card--color-${(di * 3 + si) % 6}`]">
                    <div class="gs-session-card__top">
                      <div class="gs-session-card__time">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {{ s.heure_debut }} – {{ s.heure_fin }}
                      </div>
                      <div v-if="s.conflit" class="gs-session-card__conflict-badge">⚠ Conflit</div>
                    </div>
                    <div class="gs-session-card__title">{{ s.projet || '—' }}</div>
                    <div class="gs-session-card__meta">
                      <span class="gs-session-card__student">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {{ s.etudiant || '—' }}
                      </span>
                      <span class="gs-session-card__room">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                        {{ s.salle || '—' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ══ PROPOSED PLANS ══ -->
          <template v-if="onglet === 'plans'">
            <div v-if="!plans.length" class="gs-state gs-state--empty">
              <div class="gs-state__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <p class="gs-state__title">Aucun plan proposé</p>
            </div>
            <div v-else class="gs-plans-list">
              <div v-for="p in plans" :key="p.id"
                class="gs-plan-card"
                :class="`gs-plan-card--${p.statut === 'approuve' ? 'validated' : p.statut === 'rejete' ? 'rejected' : 'pending'}`">
                <div class="gs-plan-card__header">
                  <div class="gs-plan-card__who">
                    <div class="gs-plan-card__avatar">{{ (p.proposant_nom || '?')[0].toUpperCase() }}</div>
                    <div>
                      <div class="gs-plan-card__name">
                        {{ p.proposant_nom }}
                        <span class="gs-role-badge"
                          :class="`gs-role-badge--${p.fonction === 'encadrant' ? 'encadrant' : 'jury'}`">
                          {{ fonctionLabel(p.fonction) }}
                        </span>
                      </div>
                      <div class="gs-plan-card__date">{{ p.projet_titre || '—' }} · Proposé le {{ p.date_proposition }}</div>
                    </div>
                  </div>
                  <span class="gs-status-badge"
                    :class="p.statut === 'approuve' ? 'gs-status-badge--success' : p.statut === 'rejete' ? 'gs-status-badge--danger' : 'gs-status-badge--warning'">
                    <span class="gs-status-badge__dot"></span>
                    {{ statutPlanLabel(p.statut) }}
                  </span>
                </div>

                <div class="gs-plan-card__table-wrap">
                  <table class="gs-inner-table">
                    <thead><tr><th>Date</th><th>Heure début</th><th>Heure fin</th><th>Durée</th><th>Salle</th></tr></thead>
                    <tbody>
                      <tr>
                        <td>{{ formatDateISO(p.date) }}</td>
                        <td>{{ formatTime(p.heure_debut) }}</td>
                        <td>{{ formatTime(p.heure_fin) }}</td>
                        <td>
                          <span v-if="p.duree" class="gs-duree-badge">{{ p.duree }}</span>
                          <span v-else class="gs-muted">—</span>
                        </td>
                        <td>{{ p.salle || '—' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div v-if="p.motif_rejet" class="gs-plan-card__motif">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>Motif : {{ p.motif_rejet }}</span>
                </div>

                <div v-if="p.statut === 'en_attente' || p.statut === 'rejete'" class="gs-plan-card__actions">
                  <template v-if="p.statut === 'en_attente'">
                    <button class="gs-btn gs-btn--success" @click="openValiderPlanModal(p)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Valider
                    </button>
                    <button class="gs-btn gs-btn--danger" @click="askRejeterPlan(p)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Rejeter
                    </button>
                  </template>
                  <template v-else-if="p.statut === 'rejete'">
                    <button class="gs-btn gs-btn--delete-plan" @click="askDeletePlan(p)" :disabled="deletingPlanIds.includes(p.id)">
                      <span v-if="deletingPlanIds.includes(p.id)" class="gs-spinner-sm"></span>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      Supprimer
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </template>

        </div><!-- /gs-tab-content -->
      </div><!-- /gs-tabs-wrapper -->
    </div><!-- /gs-page-card -->

    <!-- ══ CREATE / EDIT SESSION MODAL ══ -->
    <Transition name="modal-fade">
      <div v-if="showModal" class="gs-modal-overlay" @click.self="showModal = false">
        <div class="gs-modal">
          <div class="gs-modal__header">
            <div class="gs-modal__header-content">
              <div class="gs-modal__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <span class="gs-modal__title">{{ editSession ? 'Modifier la session' : 'Planifier une session' }}</span>
            </div>
            <button class="gs-modal__close" @click="showModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="gs-modal__body">
            <!-- Jury / Projet selector -->
            <div class="gs-field">
              <label class="gs-label">Jury / Projet <span class="gs-required">*</span></label>
              <!-- EDIT MODE: project + student locked -->
              <div v-if="editSession" class="gs-locked-session">
                <div class="gs-locked-session__row">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span class="gs-locked-session__project">{{ editSession.projet || '—' }}</span>
                </div>
                <div class="gs-locked-session__row gs-locked-session__row--sub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>{{ editSession.etudiant || '—' }}</span>
                </div>
              </div>
              <!-- CREATE MODE: jury dropdown -->
              <select v-else v-model="form.jury_id" class="gs-select" @change="onJuryChange">
                <option value="">— Sélectionner un jury —</option>
                <option v-for="j in jurysDisponibles" :key="j.id" :value="j.id">{{ j.titre }} · {{ j.etudiant }}</option>
              </select>
            </div>

            <!-- Date & Time -->
            <div class="gs-row">
              <div class="gs-field gs-field--grow2">
                <label class="gs-label">
                  Date <span class="gs-required">*</span>
                  <span v-if="editSession" class="gs-locked-badge" style="margin-left:6px">Fixée</span>
                </label>
                <div v-if="editSession" class="gs-input gs-input--locked">{{ formatDate(form.date) }}</div>
                <input v-else type="date" v-model="form.date" class="gs-input" />
              </div>
              <div class="gs-field">
                <label class="gs-label">
                  Début
                  <span v-if="editSession" class="gs-locked-badge">Fixé</span>
                </label>
                <div v-if="editSession" class="gs-input gs-input--locked">{{ form.heure_debut }}</div>
                <input v-else type="time" v-model="form.heure_debut" class="gs-input" />
              </div>
              <div class="gs-field">
                <label class="gs-label">
                  Fin
                  <span v-if="editSession" class="gs-locked-badge">Fixée</span>
                </label>
                <div v-if="editSession" class="gs-input gs-input--locked">{{ form.heure_fin }}</div>
                <input v-else type="time" v-model="form.heure_fin" class="gs-input" />
              </div>
            </div>

            <!-- Edit mode banner -->
            <div v-if="editSession" class="gs-edit-info-banner">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>La <strong>date</strong> et la <strong>durée</strong> sont fixées par le plan validé. Seule la <strong>salle</strong> peut être modifiée.</span>
            </div>

            <!-- Salle — text input with live conflict feedback -->
            <div class="gs-field">
              <label class="gs-label">
                Salle
                <span class="gs-salle-hint">ex: A13, B24, D01</span>
                <span v-if="loadingSalles" class="gs-salle-loading">Vérification…</span>
              </label>
              <input
                v-model="form.salle"
                type="text"
                class="gs-input gs-salle-input"
                :class="salleInputClass"
                placeholder="ex: B13"
                maxlength="3"
                @input="form.salle = form.salle.toUpperCase()"
              />
              <div v-if="form.salle && !salleValide(form.salle)" class="gs-salle-feedback gs-salle-feedback--invalid">
                Format invalide — Bloc A–D + étage 0–2 + numéro 1–4 (ex: B13, C24, A01)
              </div>
              <div v-else-if="salleDisabled && salleDisabledSameDept" class="gs-salle-feedback gs-salle-feedback--occupied">
                ⚠ Cette salle est déjà réservée pour une autre soutenance de votre département à ce créneau.
              </div>
              <div v-else-if="salleDisabled" class="gs-salle-feedback gs-salle-feedback--disabled">
                🔒 Cette salle est réservée par un autre département à ce créneau.
              </div>
              <div v-else-if="salleOccupee" class="gs-salle-feedback gs-salle-feedback--occupied">
                ⚠ Conflit dans votre département à ce créneau. Vous pouvez quand même enregistrer.
              </div>
              <div v-else-if="form.salle && salleValide(form.salle) && !loadingSalles" class="gs-salle-feedback gs-salle-feedback--free">
                ✓ Salle disponible
              </div>
            </div>

            <!-- Teacher conflicts — hard block (create mode only) -->
            <div v-if="!editSession && conflitsMembresJury.length" class="gs-conflict-block">
              <div class="gs-conflict-block__header">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>Conflits d'horaire détectés — impossible de planifier</span>
              </div>
              <ul class="gs-conflict-list">
                <li v-for="c in conflitsMembresJury" :key="c.id" class="gs-conflict-item">
                  <div class="gs-conflict-item__who">
                    <span class="gs-conflict-role-badge"
                      :class="{
                        'gs-conflict-role-badge--president':   c.role === 'president',
                        'gs-conflict-role-badge--encadrant':   c.role === 'encadrant',
                        'gs-conflict-role-badge--examinateur': c.role === 'examinateur',
                        'gs-conflict-role-badge--membre':      !['president','encadrant','examinateur'].includes(c.role),
                      }">
                      {{ c.role === 'president' ? 'Président' : c.role === 'encadrant' ? 'Encadrant' : c.role === 'examinateur' ? 'Examinateur' : 'Membre' }}
                    </span>
                    <strong>{{ c.nom }}</strong>
                  </div>
                  <div class="gs-conflict-item__detail">
                    occupe <em>{{ c.context }}</em> de <strong>{{ c.heure }}</strong>
                  </div>
                </li>
              </ul>
              <div class="gs-conflict-block__footer">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Modifiez le créneau ou choisissez un autre jury pour débloquer la planification.
              </div>
            </div>
            <div v-else-if="!editSession && loadingEnseignants && form.date && form.heure_debut && form.heure_fin" class="gs-checking-teachers">
              <span class="gs-spinner-sm"></span> Vérification des disponibilités des enseignants…
            </div>

            <!-- Jury preview chips (create mode) -->
            <div v-if="!editSession && selectedJuryPreview" class="gs-field">
              <label class="gs-label">Membres du jury</label>
              <div class="gs-jury-members">
                <span v-for="m in selectedJuryPreview.membres" :key="m.enseignant_id"
                  class="gs-jury-chip"
                  :class="m.fonction === 'president' ? 'gs-jury-chip--president' : m.fonction === 'encadrant' ? 'gs-jury-chip--encadrant' : 'gs-jury-chip--member'">
                  {{ m.nom }} <span class="gs-jury-chip__role">{{ m.fonction }}</span>
                </span>
              </div>
            </div>
          </div>
          <div class="gs-modal__footer">
            <button class="gs-btn gs-btn--ghost" @click="showModal = false">Annuler</button>
            <button class="gs-btn gs-btn--primary" @click="sauvegarder"
              :disabled="saving || (!editSession && conflitsMembresJury.length > 0) || (editSession && salleDisabled)">
              <span v-if="saving" class="gs-spinner-sm"></span>
              {{ editSession ? 'Enregistrer les modifications' : 'Planifier la session' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══ VALIDER PLAN MODAL (review + optional heure/salle override per slot) ══ -->
    <Transition name="modal-fade">
      <div v-if="showValiderPlanModal" class="gs-modal-overlay" @click.self="showValiderPlanModal = false">
        <div class="gs-modal gs-modal--wide">
          <div class="gs-modal__header">
            <div class="gs-modal__header-content">
              <div class="gs-modal__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span class="gs-modal__title">Valider le plan</span>
            </div>
            <button class="gs-modal__close" @click="showValiderPlanModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="gs-modal__body" v-if="validerPlanData">
            <!-- Proposant strip -->
            <div class="gs-vp-proposant">
              <div class="gs-vp-proposant__avatar">{{ (validerPlanData.proposant_nom || '?')[0].toUpperCase() }}</div>
              <div class="gs-vp-proposant__info">
                <div class="gs-vp-proposant__name">{{ validerPlanData.proposant_nom }}</div>
                <div class="gs-vp-proposant__sub">{{ validerPlanData.projet_titre || '—' }}</div>
              </div>
              <span class="gs-vp-proposant__role">{{ fonctionLabel(validerPlanData.fonction) }}</span>
            </div>

            <div class="gs-edit-plan-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>La date et la durée proposées sont <strong>fixées</strong>. Ajustez l'heure de début si besoin — l'heure de fin se recalcule automatiquement. Modifiez la salle si nécessaire.</span>
            </div>

            <!-- One editable slot -->
            <div class="gs-edit-slot">
              <div class="gs-edit-slot__header">
                <div class="gs-edit-slot__datestrip">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {{ formatDateISO(validerPlanData.date) }}
                </div>
                <div v-if="validerPlanData.duree" class="gs-duree-badge">{{ validerPlanData.duree }}</div>
              </div>
              <div class="gs-edit-slot__fields">
                <div class="gs-row">
                  <div class="gs-field">
                    <label class="gs-label">
                      Début <span class="gs-optional-badge">Optionnel</span>
                    </label>
                    <input type="time" v-model="vpForm.heure_debut" class="gs-input" @change="onVpDebutChange" />
                  </div>
                  <div class="gs-field">
                    <label class="gs-label">
                      Fin
                      <span v-if="validerPlanData.dureeMin" class="gs-locked-badge">Auto</span>
                      <span v-else class="gs-optional-badge">Optionnel</span>
                    </label>
                    <input type="time" v-model="vpForm.heure_fin" class="gs-input"
                      :readonly="!!validerPlanData.dureeMin"
                      :style="validerPlanData.dureeMin ? 'background:#e8e4dc;color:#6a7a8a;cursor:not-allowed' : ''" />
                  </div>
                </div>
                <div class="gs-field">
                  <label class="gs-label">
                    Salle <span class="gs-optional-badge">Optionnel</span>
                    <span class="gs-salle-hint">ex: A13, B24, D01</span>
                    <span v-if="vpLoadingSalles" class="gs-salle-loading">Vérification…</span>
                  </label>
                  <input
                    v-model="vpForm.salle"
                    type="text"
                    class="gs-input gs-salle-input"
                    :class="vpSalleInputClass"
                    placeholder="ex: B13"
                    maxlength="3"
                    @input="vpForm.salle = vpForm.salle.toUpperCase(); chargerVpSalles()"
                  />
                  <div v-if="vpForm.salle && !salleValide(vpForm.salle)" class="gs-salle-feedback gs-salle-feedback--invalid">Format invalide</div>
                  <div v-else-if="vpSalleBlocked" class="gs-salle-feedback gs-salle-feedback--disabled">🔒 Salle réservée à ce créneau.</div>
                  <div v-else-if="vpForm.salle && salleValide(vpForm.salle) && !vpLoadingSalles" class="gs-salle-feedback gs-salle-feedback--free">✓ Salle disponible</div>
                </div>
              </div>
            </div>
          </div>
          <div class="gs-modal__footer">
            <button class="gs-btn gs-btn--ghost" @click="showValiderPlanModal = false">Annuler</button>
            <button class="gs-btn gs-btn--success" @click="confirmerValidation" :disabled="savingEditPlan || vpSalleBlocked">
              <span v-if="savingEditPlan" class="gs-spinner-sm"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Valider
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══ CONFIRM DELETE SESSION ══ -->
    <Teleport to="body">
      <Transition name="rm-modal">
        <div v-if="showDeleteSessionM" class="rm-overlay" @click.self="showDeleteSessionM = false">
          <div class="rm-modal rm-modal--red" style="max-width:480px">
            <div class="rm-modal__head rm-modal__head--red">
              <div class="rm-modal__head-left">
                <div class="rm-modal__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </div>
                <div>
                  <div class="rm-modal__title">Supprimer la session</div>
                  <div class="rm-modal__sub">Cette action est irréversible</div>
                </div>
              </div>
              <button class="rm-modal__close" @click="showDeleteSessionM = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="rm-modal__body">
              <div class="rm-del-warning">
                <div class="rm-del-warning__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </div>
                <p class="rm-del-warning__text">
                  Supprimer la session du <strong>{{ deleteSessionTarget ? formatDate(deleteSessionTarget.date) : '—' }}</strong>
                  pour le projet <strong>{{ deleteSessionTarget?.projet || '—' }}</strong> ?<br>
                  Cette action est définitive.
                </p>
              </div>
            </div>
            <div class="rm-modal__foot rm-modal__foot--red">
              <button class="rm-btn rm-btn--ghost" @click="showDeleteSessionM = false">Annuler</button>
              <button class="rm-btn rm-btn--red" @click="confirmDeleteSession" :disabled="deletingSessionId === deleteSessionTarget?.id">
                <span v-if="deletingSessionId === deleteSessionTarget?.id" class="rm-spinner"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ CONFIRM REJETER PLAN ══ -->
    <Teleport to="body">
      <Transition name="rm-modal">
        <div v-if="showRejeterPlanM" class="rm-overlay" @click.self="showRejeterPlanM = false">
          <div class="rm-modal rm-modal--red" style="max-width:420px">
            <div class="rm-modal__head rm-modal__head--red">
              <div class="rm-modal__head-left">
                <div class="rm-modal__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
                <div>
                  <div class="rm-modal__title">Rejeter le plan</div>
                  <div class="rm-modal__sub">Le proposant sera notifié du rejet</div>
                </div>
              </div>
              <button class="rm-modal__close" @click="showRejeterPlanM = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="rm-modal__body" style="gap:16px">
              <div class="rm-del-warning" style="padding-bottom:0">
                <p class="rm-del-warning__text">
                  Rejeter le plan proposé par <strong>{{ rejeterPlanTarget?.proposant_nom }}</strong> ?
                </p>
              </div>
              <div class="rm-field">
                <label class="rm-field__label">Motif du rejet <span class="rm-optional">facultatif</span></label>
                <textarea v-model="motifRejet" class="rm-field__input" rows="3" placeholder="Ex : Créneau déjà occupé, salle indisponible…" style="resize:vertical;min-height:72px;font-family:inherit"></textarea>
              </div>
            </div>
            <div class="rm-modal__foot rm-modal__foot--red">
              <button class="rm-btn rm-btn--ghost" @click="showRejeterPlanM = false">Annuler</button>
              <button class="rm-btn rm-btn--red" @click="confirmRejeterPlan" :disabled="rejectingPlan">
                <span v-if="rejectingPlan" class="rm-spinner"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Rejeter
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ CONFIRM DELETE REJECTED PLAN ══ -->
    <Teleport to="body">
      <Transition name="rm-modal">
        <div v-if="showDeletePlanM" class="rm-overlay" @click.self="showDeletePlanM = false">
          <div class="rm-modal rm-modal--red" style="max-width:440px">
            <div class="rm-modal__head rm-modal__head--red">
              <div class="rm-modal__head-left">
                <div class="rm-modal__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </div>
                <div>
                  <div class="rm-modal__title">Supprimer le plan rejeté</div>
                  <div class="rm-modal__sub">Cette action est irréversible</div>
                </div>
              </div>
              <button class="rm-modal__close" @click="showDeletePlanM = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="rm-modal__body">
              <div class="rm-del-warning">
                <p class="rm-del-warning__text">
                  Supprimer le plan rejeté de <strong>{{ deletePlanTarget?.proposant_nom }}</strong> ?
                  Cette action est définitive et ne peut pas être annulée.
                </p>
              </div>
            </div>
            <div class="rm-modal__foot rm-modal__foot--red">
              <button class="rm-btn rm-btn--ghost" @click="showDeletePlanM = false">Annuler</button>
              <button class="rm-btn rm-btn--red" @click="confirmDeletePlan" :disabled="deletingPlanIds.includes(deletePlanTarget?.id)">
                <span v-if="deletingPlanIds.includes(deletePlanTarget?.id)" class="rm-spinner"></span>
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ CONFIRM PUBLIER CALENDRIER ══ -->
    <Teleport to="body">
      <Transition name="rm-modal">
        <div v-if="showPublierCalendrierM" class="rm-overlay" @click.self="showPublierCalendrierM = false">
          <div class="rm-modal rm-modal--teal" style="max-width:440px">
            <div class="rm-modal__head rm-modal__head--teal">
              <div class="rm-modal__head-left">
                <div class="rm-modal__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </div>
                <div>
                  <div class="rm-modal__title">Publier le calendrier</div>
                  <div class="rm-modal__sub">{{ sessionsNonPubliees.length }} session(s) seront publiées</div>
                </div>
              </div>
              <button class="rm-modal__close" @click="showPublierCalendrierM = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="rm-modal__body">
              <div class="rm-del-warning">
                <p class="rm-del-warning__text">
                  Publier <strong>{{ sessionsNonPubliees.length }} session(s)</strong> ?
                  Une fois publiées, les sessions ne pourront plus être modifiées ni supprimées.
                </p>
              </div>
            </div>
            <div class="rm-modal__foot rm-modal__foot--teal">
              <button class="rm-btn rm-btn--ghost" @click="showPublierCalendrierM = false">Annuler</button>
              <button class="rm-btn rm-btn--teal" @click="confirmPublierCalendrier" :disabled="publishing">
                <span v-if="publishing" class="rm-spinner"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Confirmer la publication
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'GestionSoutenance',
  emits: ['toast'],

  data () {
    return {
      onglet: 'liste',
      loadingSessions: false,
      saving: false,
      publishing: false,
      conflitDetecte: false,

      sessions: [],
      plans: [],
      jurysDisponibles: [],
      selectedJuryPreview: null,

      // Modal (create & edit)
      showModal: false,
      editSession: null,
      form: { date: '', salle: '', heure_debut: '', heure_fin: '', jury_id: '' },

      // Rooms & teachers conflict data
      sallesOccupeesGlobal: [],
      loadingSalles: false,
      enseignantsOccupesGlobal: [],
      loadingEnseignants: false,

      // Validate plan modal
      showValiderPlanModal: false,
      validerPlanData: null,
      vpForm: { heure_debut: '', heure_fin: '', salle: '' },
      vpSallesOccupees: [],
      vpLoadingSalles: false,
      savingEditPlan: false,

      // Delete session
      showDeleteSessionM: false,
      deleteSessionTarget: null,
      deletingSessionId: null,

      // Reject plan
      showRejeterPlanM: false,
      rejeterPlanTarget: null,
      motifRejet: '',
      rejectingPlan: false,

      // Delete rejected plan
      showDeletePlanM: false,
      deletePlanTarget: null,
      deletingPlanIds: [],

      // Publish calendar
      showPublierCalendrierM: false,
    }
  },

  computed: {
    tabs () {
      return [
        { key: 'liste',      label: 'Sessions',       count: this.sessions.length },
        { key: 'calendrier', label: 'Calendrier' },
        { key: 'plans',      label: 'Plans proposés', count: this.plans.filter(p => p.statut === 'en_attente').length },
      ]
    },

    sessionsNonPubliees () {
      return this.sessions.filter(s => s.statut === 'en_attente')
    },

    joursAvecSessions () {
      const map = {}
      this.sessions.filter(s => s.calendrier_publie).forEach(s => {
        if (!map[s.date]) map[s.date] = { date: s.date, dateLabel: this.formatDate(s.date), sessions: [] }
        map[s.date].sessions.push(s)
      })
      return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
    },

    _overlap () {
      return (d1, h1, f1, d2, h2, f2) => {
        if (!d1 || !h1 || !f1 || !d2 || !h2 || !f2) return false
        if (d1 !== d2) return false
        const m = t => { const [h, mn] = t.split(':').map(Number); return h * 60 + mn }
        return m(h1) < m(f2) && m(h2) < m(f1)
      }
    },

    salleValide () {
      return (val) => {
        if (!val || val.length !== 3) return false
        return /^[A-D]$/.test(val[0]) && ['0', '1', '2'].includes(val[1]) && ['1', '2', '3', '4'].includes(val[2])
      }
    },

    salleDisabled () {
      if (!this.salleValide(this.form.salle)) return false
      if (this.editSession?.salle === this.form.salle) return false
      return !!this.sallesOccupeesGlobal.find(x => x.salle === this.form.salle)
    },

    salleDisabledSameDept () {
      if (!this.salleDisabled) return false
      return !!this.sallesOccupeesGlobal.find(x => x.salle === this.form.salle)?.same_dept
    },

    salleOccupee () {
      if (!this.salleValide(this.form.salle) || this.salleDisabled) return false
      const { date, heure_debut, heure_fin, salle } = this.form
      return this.sessions.some(s => {
        if (!s.salle || s.salle !== salle) return false
        if (this.editSession && s.id === this.editSession.id) return false
        return this._overlap(date, heure_debut, heure_fin, s.date, s.heure_debut, s.heure_fin)
      })
    },

    salleInputClass () {
      if (!this.form.salle) return ''
      if (!this.salleValide(this.form.salle)) return 'gs-input--invalid'
      if (this.salleDisabled) return 'gs-input--invalid'
      if (this.salleOccupee) return 'gs-input--warn'
      if (!this.loadingSalles) return 'gs-input--valid'
      return ''
    },

    // Validate plan modal salle
    vpSalleBlocked () {
      if (!this.vpForm.salle || !this.salleValide(this.vpForm.salle)) return false
      return !!this.vpSallesOccupees.find(x => x.salle === this.vpForm.salle)
    },

    vpSalleInputClass () {
      if (!this.vpForm.salle) return ''
      if (!this.salleValide(this.vpForm.salle)) return 'gs-input--invalid'
      if (this.vpSalleBlocked) return 'gs-input--invalid'
      if (!this.vpLoadingSalles) return 'gs-input--valid'
      return ''
    },

    /**
     * Hard-block conflicts: jury members already assigned to another soutenance
     * at the selected slot, either cross-dept (from backend) or own-dept (local).
     */
    conflitsMembresJury () {
      const { date, heure_debut, heure_fin } = this.form
      if (!date || !heure_debut || !heure_fin || !this.selectedJuryPreview) return []
      const membres = this.selectedJuryPreview.membres || []
      if (!membres.length) return []
      const conflicts = []
      const seen = new Set()

      // Cross-dept (from backend)
      membres.forEach(m => {
        const id = m.enseignant_id
        if (!id || seen.has(id)) return
        const hit = this.enseignantsOccupesGlobal.find(e => e.enseignant_id === id)
        if (hit) {
          seen.add(id)
          const context = hit.etudiant_nom
            ? `la soutenance de l'étudiant ${hit.etudiant_nom}`
            : hit.projet_titre ? `le projet « ${hit.projet_titre} »` : `la soutenance #${hit.soutenance_id}`
          conflicts.push({ id, nom: `${hit.prenom || ''} ${hit.nom || ''}`.trim() || m.nom || ('Ens. #' + id), role: m.fonction || 'membre', context, heure: `${hit.heure_debut}–${hit.heure_fin}` })
        }
      })

      // Own-dept (local sessions)
      membres.forEach(m => {
        const id = m.enseignant_id
        if (!id || seen.has(id)) return
        this.sessions.forEach(s => {
          if (seen.has(id)) return
          if (this.editSession && s.id === this.editSession.id) return
          if (!(s.jury_membres_ids || []).includes(id)) return
          if (!this._overlap(date, heure_debut, heure_fin, s.date, s.heure_debut, s.heure_fin)) return
          seen.add(id)
          const context = s.etudiant ? `la soutenance de l'étudiant ${s.etudiant}` : s.projet ? `le projet « ${s.projet} »` : `la soutenance #${s.id}`
          conflicts.push({ id, nom: m.nom || ('Ens. #' + id), role: m.fonction || 'membre', context, heure: `${s.heure_debut}–${s.heure_fin}` })
        })
      })
      return conflicts
    },
  },

  watch: {
    'form.date' ()       { this.chargerSallesOccupees(); this.chargerEnseignantsOccupes() },
    'form.heure_debut' (){ this.chargerSallesOccupees(); this.chargerEnseignantsOccupes() },
    'form.heure_fin' ()  { this.chargerSallesOccupees(); this.chargerEnseignantsOccupes() },
    'form.salle' ()      { this.chargerSallesOccupees() },
  },

  mounted () {
    Promise.all([this.chargerSessions(), this.chargerJurys(), this.chargerPlans()])
  },

  methods: {
    // ── Loaders ──────────────────────────────────────────────────────

    async chargerJurys () {
      try {
        const r = await api.get('/jurys-pfe')
        const etudiantsDejaPlannifies = new Set(this.sessions.map(s => s.etudiant).filter(Boolean))
        this.jurysDisponibles = (r.data || [])
          .filter(j => {
            if (j.statut === 'termine' || j.statut === 'annule') return false
            if (j.date_soutenance) return false
            const nom = j.etudiant_nom || ''
            if (nom && etudiantsDejaPlannifies.has(nom)) return false
            return true
          })
          .map(j => ({
            id:       j.id,
            titre:    j.projet_titre || 'Projet #' + j.id,
            etudiant: j.etudiant_nom || '—',
            // Flat roles — no membres[] array in new schema
            membres: [
              j.encadrant_id   ? { enseignant_id: j.encadrant_id,   nom: j.encadrant_nom   || '', fonction: 'encadrant'   } : null,
              j.president_id   ? { enseignant_id: j.president_id,   nom: j.president_nom   || '', fonction: 'president'   } : null,
              j.examinateur_id ? { enseignant_id: j.examinateur_id, nom: j.examinateur_nom || '', fonction: 'examinateur' } : null,
            ].filter(Boolean),
          }))
      } catch { this.jurysDisponibles = [] }
    },

    async chargerSessions () {
      this.loadingSessions = true
      try {
        const [juryRes, planRes] = await Promise.all([
          api.get('/jurys-pfe'),
          api.get('/plans-soutenance').catch(() => ({ data: [] })),
        ])

        // Build the set of jury_ids that have an approved plan — these sessions
        // were created by plan validation and must not be editable/deletable by the chef.
        const approvedJuryIds = new Set(
          (planRes.data || [])
            .filter(p => p.statut === 'approuve' && p.jury_id)
            .map(p => p.jury_id)
        )

        this.sessions = (juryRes.data || [])
          .filter(j => j.date_soutenance)
          .map(j => this.mapSession(j, approvedJuryIds))
        this.detecterConflits()
      } catch {
        this.$emit('toast', { message: 'Erreur chargement sessions', type: 'toast-err' })
        this.sessions = []
      } finally { this.loadingSessions = false }
    },

    /**
     * Map a jury group record from /jurys-pfe to a session display object.
     * Supports both old flat format (encadrant_nom / president_nom / examinateur_nom)
     * and the new membres[] array format.
     */
    mapSession (j, approvedJuryIds = new Set()) {
      // j is a jury_membres_pfe record with soutenance fields embedded via format()
      return {
        id:               j.soutenance_id || j.id,
        jury_id:          j.id,
        date:             j.date_soutenance || '',
        heure_debut:      (j.heure_debut || '').substring(0, 5),
        heure_fin:        (j.heure_fin   || '').substring(0, 5),
        salle:            j.salle || '',
        projet:           j.projet_titre || null,
        etudiant:         j.etudiant_nom  || null,
        encadrant_nom:    j.encadrant_nom   || null,
        president_nom:    j.president_nom   || null,
        examinateur_nom:  j.examinateur_nom || null,
        jury_membres_ids: [j.encadrant_id, j.president_id, j.examinateur_id].filter(Boolean),
        jury_membres:     [j.encadrant_nom, j.president_nom, j.examinateur_nom].filter(Boolean),
        statut:           j.statut || 'en_attente',
        calendrier_publie: !!j.calendrier_publie,
        // true  → session was created by a validated jury plan → chef cannot edit/delete
        // false → session was created manually by the chef → full edit/delete access
        from_plan:        approvedJuryIds.has(j.id),
        conflit:          false,
      }
    },

    async chargerPlans () {
      try {
        const r = await api.get('/plans-soutenance')
        const raw = r.data || []
        // Each plan is one row — filter out approved (already sessions)
        this.plans = raw
          .filter(p => p.statut !== 'approuve')
          .map(p => {
            const debut = (p.heure_debut || '').substring(0, 5)
            const fin   = (p.heure_fin   || '').substring(0, 5)
            const toMin = t => { const [h, m] = (t || '00:00').split(':').map(Number); return h * 60 + m }
            const diff  = debut && fin ? toMin(fin) - toMin(debut) : 0
            const duree = diff > 0
              ? (Math.floor(diff / 60) ? Math.floor(diff / 60) + 'h' : '') + (diff % 60 ? String(diff % 60).padStart(2, '0') + 'min' : '')
              : null
            return {
              id:             p.id,
              jury_id:        p.jury_id,
              proposant_id:   p.proposant_id,
              proposant_nom:  p.proposant_nom || ('Proposant #' + p.proposant_id),
              fonction:       p.fonction,
              statut:         p.statut,
              date:           p.date,
              heure_debut:    debut,
              heure_fin:      fin,
              duree,
              dureeMin:       diff > 0 ? diff : null,
              salle:          p.salle || null,
              motif_rejet:    p.motif_rejet || null,
              projet_titre:   p.projet_titre || null,
              date_proposition: p.created_at
                ? new Date(p.created_at).toLocaleDateString('fr-FR')
                : '—',
            }
          })

        // Build the set of jury_ids that have an approved plan.
        // Sessions whose jury_id is in this set were created via plan validation
        // (not manually by the chef) and must not be deletable by the chef.
        // NOTE: from_plan is now set atomically inside chargerSessions/mapSession,
        // so no further annotation is needed here.
      } catch { this.plans = [] }
    },

    async chargerSallesOccupees () {
      const { date, heure_debut, heure_fin } = this.form
      if (!date || !heure_debut || !heure_fin) { this.sallesOccupeesGlobal = []; return }
      this.loadingSalles = true
      try {
        const params = { date, heure_debut, heure_fin }
        if (this.editSession) params.exclude_id = this.editSession.id
        const r = await api.get('/soutenances/salles-occupees', { params })
        this.sallesOccupeesGlobal = r.data || []
      } catch { this.sallesOccupeesGlobal = [] }
      finally { this.loadingSalles = false }
    },

    async chargerEnseignantsOccupes () {
      const { date, heure_debut, heure_fin } = this.form
      if (!date || !heure_debut || !heure_fin) { this.enseignantsOccupesGlobal = []; return }
      this.loadingEnseignants = true
      try {
        const params = { date, heure_debut, heure_fin }
        if (this.editSession) params.exclude_id = this.editSession.id
        const r = await api.get('/soutenances/enseignants-occupes', { params })
        this.enseignantsOccupesGlobal = r.data || []
      } catch { this.enseignantsOccupesGlobal = [] }
      finally { this.loadingEnseignants = false }
    },

    async chargerVpSalles () {
      const date = this.validerPlanData?.date
      const hd   = this.vpForm.heure_debut || this.validerPlanData?.heure_debut
      const hf   = this.vpForm.heure_fin   || this.validerPlanData?.heure_fin
      if (!date || !hd || !hf || !this.salleValide(this.vpForm.salle)) { this.vpSallesOccupees = []; return }
      this.vpLoadingSalles = true
      try {
        const r = await api.get('/soutenances/salles-occupees', { params: { date, heure_debut: hd, heure_fin: hf } })
        this.vpSallesOccupees = r.data || []
      } catch { this.vpSallesOccupees = [] }
      finally { this.vpLoadingSalles = false }
    },

    detecterConflits () {
      const toMin = t => { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m }
      this.conflitDetecte = false
      const salleMap = {}
      this.sessions.forEach(s => {
        if (!s.salle || !s.date) return
        const key = s.salle + '|' + s.date
        if (!salleMap[key]) salleMap[key] = []
        salleMap[key].push(s)
      })
      this.sessions.forEach(s => { s.conflit = false })
      Object.values(salleMap).forEach(group => {
        for (let i = 0; i < group.length; i++)
          for (let j = i + 1; j < group.length; j++) {
            const a = group[i], b = group[j]
            if (toMin(a.heure_debut) < toMin(b.heure_fin) && toMin(b.heure_debut) < toMin(a.heure_fin)) {
              a.conflit = true; b.conflit = true; this.conflitDetecte = true
            }
          }
      })
    },

    // ── Modal ──────────────────────────────────────────────────────

    openModal (s = null) {
      if (s) {
        this.editSession = s
        this.form = { date: s.date, salle: s.salle, heure_debut: s.heure_debut, heure_fin: s.heure_fin, jury_id: s.jury_id || s.id }
        this.selectedJuryPreview = null
      } else {
        this.editSession = null
        this.form = { date: '', salle: '', heure_debut: '', heure_fin: '', jury_id: '' }
        this.selectedJuryPreview = null
      }
      this.sallesOccupeesGlobal = []
      this.enseignantsOccupesGlobal = []
      this.showModal = true
    },

    onJuryChange () {
      this.selectedJuryPreview = this.jurysDisponibles.find(j => j.id === this.form.jury_id) || null
    },

    async sauvegarder () {
      if (!this.editSession && (!this.form.jury_id || !this.form.date)) {
        this.$emit('toast', { message: 'Jury et date requis.', type: 'toast-err' }); return
      }
      if (this.form.salle && !this.salleValide(this.form.salle)) {
        this.$emit('toast', { message: 'Format de salle invalide (ex: B13).', type: 'toast-err' }); return
      }
      if (this.salleDisabled) {
        this.$emit('toast', {
          message: this.salleDisabledSameDept
            ? 'Cette salle est déjà réservée pour une autre soutenance de votre département à ce créneau.'
            : 'Cette salle est réservée par un autre département à ce créneau.',
          type: 'toast-err'
        }); return
      }
      if (!this.editSession && this.conflitsMembresJury.length) {
        const noms = this.conflitsMembresJury.map(c => c.nom).join(', ')
        this.$emit('toast', { message: `Conflit d'horaire : ${noms} ${this.conflitsMembresJury.length > 1 ? 'sont déjà occupés' : 'est déjà occupé(e)'} à ce créneau.`, type: 'toast-err' }); return
      }
      this.saving = true
      try {
        // When editing an existing session only salle is updatable (date+heure locked).
        // When creating manually all scheduling fields are sent.
        const pl = this.editSession
          ? { salle: this.form.salle }
          : {
              date_soutenance: this.form.date,
              heure_debut:     this.form.heure_debut,
              heure_fin:       this.form.heure_fin,
              salle:           this.form.salle,
            }
        const targetId = this.editSession ? this.editSession.jury_id : this.form.jury_id
        await api.put(`/jurys-pfe/${targetId}`, pl)
        this.$emit('toast', { message: this.editSession ? 'Session modifiée ✓' : 'Session planifiée ✓', type: 'toast-ok' })
        await this.chargerSessions()
        this.showModal = false
      } catch (e) {
        this.$emit('toast', { message: e.response?.data?.message || 'Erreur', type: 'toast-err' })
      } finally { this.saving = false }
    },

    // ── Publish ────────────────────────────────────────────────────

    askPublierCalendrier () { this.showPublierCalendrierM = true },

    async confirmPublierCalendrier () {
      this.publishing = true
      try {
        await api.post('/jurys-pfe/publier-calendrier')
        await this.chargerSessions()
        this.$emit('toast', { message: 'Calendrier publié ✓', type: 'toast-ok' })
        this.showPublierCalendrierM = false
      } catch (e) {
        this.$emit('toast', { message: e.response?.data?.message || 'Erreur', type: 'toast-err' })
      } finally { this.publishing = false }
    },

    // ── Delete session ─────────────────────────────────────────────

    askDeleteSession (session) { this.deleteSessionTarget = session; this.showDeleteSessionM = true },

    async confirmDeleteSession () {
      if (!this.deleteSessionTarget) return
      this.deletingSessionId = this.deleteSessionTarget.id
      try {
        await api.put(`/jurys-pfe/${this.deleteSessionTarget.id}`, {
          statut: 'en_attente', date_soutenance: null, salle: null, heure_debut: null, heure_fin: null
        })
        await this.chargerSessions()
        this.$emit('toast', { message: 'Session annulée.', type: 'toast-ok' })
        this.showDeleteSessionM = false
        this.deleteSessionTarget = null
      } catch {
        this.$emit('toast', { message: 'Erreur', type: 'toast-err' })
      } finally { this.deletingSessionId = null }
    },

    // ── Validate plan ──────────────────────────────────────────────

    openValiderPlanModal (plan) {
      this.validerPlanData = plan
      this.vpForm = {
        heure_debut: (plan.heure_debut || '').substring(0, 5),
        heure_fin:   (plan.heure_fin   || '').substring(0, 5),
        salle:       plan.salle || '',
      }
      this.vpSallesOccupees = []
      this.showValiderPlanModal = true
    },

    onVpDebutChange () {
      if (this.validerPlanData?.dureeMin && this.vpForm.heure_debut) {
        const [h, m] = this.vpForm.heure_debut.split(':').map(Number)
        const totalMin = h * 60 + m + this.validerPlanData.dureeMin
        this.vpForm.heure_fin = `${String(Math.floor(totalMin / 60) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`
      }
      this.chargerVpSalles()
    },

    async confirmerValidation () {
      if (this.vpForm.salle && !this.salleValide(this.vpForm.salle)) {
        this.$emit('toast', { message: `Format de salle invalide : ${this.vpForm.salle}`, type: 'toast-err' }); return
      }
      if (this.vpSalleBlocked) {
        this.$emit('toast', { message: `La salle ${this.vpForm.salle} est réservée à ce créneau.`, type: 'toast-err' }); return
      }
      this.savingEditPlan = true
      try {
        const body = {}
        if (this.vpForm.heure_debut) body.heure_debut = this.vpForm.heure_debut
        if (this.vpForm.heure_fin)   body.heure_fin   = this.vpForm.heure_fin
        if (this.vpForm.salle)       body.salle        = this.vpForm.salle
        await api.put(`/plans-soutenance/${this.validerPlanData.id}/valider`, body)
        await Promise.all([this.chargerSessions(), this.chargerPlans(), this.chargerJurys()])
        this.$emit('toast', { message: 'Plan validé. Session créée ✓', type: 'toast-ok' })
        this.showValiderPlanModal = false
      } catch (e) {
        this.$emit('toast', { message: e.response?.data?.message || 'Erreur', type: 'toast-err' })
      } finally { this.savingEditPlan = false }
    },

    // ── Reject plan ────────────────────────────────────────────────

    askRejeterPlan (plan) { this.rejeterPlanTarget = plan; this.motifRejet = ''; this.showRejeterPlanM = true },

    async confirmRejeterPlan () {
      if (!this.rejeterPlanTarget) return
      this.rejectingPlan = true
      try {
        await api.put(`/plans-soutenance/${this.rejeterPlanTarget.id}/rejeter`, {
          motif: this.motifRejet.trim() || null
        })
        await this.chargerPlans()
        this.$emit('toast', { message: 'Plan rejeté.', type: 'toast-ok' })
        this.showRejeterPlanM = false
        this.rejeterPlanTarget = null
        this.motifRejet = ''
      } finally { this.rejectingPlan = false }
    },

    // ── Delete rejected plan ───────────────────────────────────────

    askDeletePlan (plan) { this.deletePlanTarget = plan; this.showDeletePlanM = true },

    async confirmDeletePlan () {
      if (!this.deletePlanTarget) return
      this.deletingPlanIds = [...this.deletingPlanIds, this.deletePlanTarget.id]
      try {
        await api.delete(`/plans-soutenance/${this.deletePlanTarget.id}/chef`)
        this.plans = this.plans.filter(p => p.id !== this.deletePlanTarget.id)
        this.$emit('toast', { message: 'Plan supprimé.', type: 'toast-ok' })
        this.showDeletePlanM = false
        this.deletePlanTarget = null
      } catch (e) {
        this.$emit('toast', { message: e.response?.data?.message || 'Erreur', type: 'toast-err' })
      } finally {
        this.deletingPlanIds = this.deletingPlanIds.filter(id => id !== this.deletePlanTarget?.id)
      }
    },

    // ── Formatters ─────────────────────────────────────────────────

    formatDate (d) {
      if (!d) return '—'
      const p = d.split('-')
      return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d
    },

    formatDateISO (d) {
      if (!d) return '—'
      const str = d.includes('T') ? d.substring(0, 10) : d
      const p = str.split('-')
      return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d
    },

    formatTime (t) {
      if (!t) return '—'
      return t.substring(0, 5)
    },

    fonctionLabel (f) {
      return f === 'president' ? 'Président' : f === 'encadrant' ? 'Encadrant' : f === 'examinateur' ? 'Examinateur' : f || '—'
    },

    statutPlanLabel (s) {
      return s === 'approuve' ? 'Validé' : s === 'rejete' ? 'Rejeté' : 'En attente'
    },

    statutLabel (s) {
      return s === 'publie' ? 'Publié' : s === 'termine' ? 'Terminé' : 'Planifié'
    },

    statutClass (s) {
      return s === 'publie' ? 'gs-statut-badge--publie' : s === 'termine' ? 'gs-statut-badge--termine' : 'gs-statut-badge--en-attente'
    },
  },
}
</script>

<style scoped>
.gs-root {
  --gs-primary:       #4f46e5;
  --gs-primary-light: #ede9fe;
  --gs-primary-dark:  #3730a3;
  --gs-success:       #16a34a;
  --gs-success-light: #dcfce7;
  --gs-success-dark:  #14532d;
  --gs-danger:        #dc2626;
  --gs-danger-light:  #fee2e2;
  --gs-warning:       #d97706;
  --gs-warning-light: #fef3c7;
  --gs-warning-dark:  #78350f;
  --gs-info:          #0284c7;
  --gs-info-light:    #e0f2fe;
  --gs-surface:       #f5f2ed;
  --gs-bg:            #ede9e2;
  --gs-border:        #e2e8f0;
  --gs-muted:         #64748b;
  --gs-text:          #0f172a;
  --gs-radius:        12px;
  --gs-radius-sm:     8px;
  --gs-shadow:        0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.06);
  --gs-shadow-md:     0 4px 16px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06);
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: var(--gs-text);
}

/* ─── Page Card ─── */
.gs-page-card { background:#f5f2ed; border:1.5px solid var(--gs-border); border-radius:20px; box-shadow:0 1px 3px rgba(0,0,0,.06),0 8px 28px rgba(0,0,0,.08); overflow:hidden; }

/* ─── Header ─── */
.gs-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; padding:20px 26px; background:linear-gradient(135deg,#1e2d3e 0%,#1a2d3e 100%); border-bottom:3px solid #f5a623; }
.gs-header__left { display:flex; align-items:center; gap:14px; }
.gs-header__icon { width:46px; height:46px; border-radius:13px; flex-shrink:0; background:rgba(245,166,35,.18); border:1.5px solid rgba(245,166,35,.35); display:flex; align-items:center; justify-content:center; color:#f5a623; }
.gs-title { font-size:16px; font-weight:800; color:#fff; letter-spacing:-.01em; }
.gs-subtitle { font-size:12px; color:rgba(255,255,255,.55); margin-top:3px; }
.gs-header__actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }

/* ─── Badges ─── */
.gs-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:100px; font-size:12.5px; font-weight:600; }
.gs-badge--danger { background:rgba(220,38,38,.25); color:#fca5a5; border:1px solid rgba(220,38,38,.35); }
.gs-badge--info   { background:rgba(245,166,35,.22); color:#f5a623; border:1px solid rgba(245,166,35,.35); }

/* ─── Tabs ─── */
.gs-tabs-wrapper { padding:20px 26px 0; }
.gs-tab-content  { padding:0 26px 26px; }
.gs-tabs { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:20px; background:var(--gs-bg); padding:5px; border-radius:var(--gs-radius); width:fit-content; border:1px solid var(--gs-border); }
.gs-tab { padding:7px 18px; border-radius:8px; border:none; background:transparent; font-size:13.5px; font-weight:500; color:var(--gs-muted); cursor:pointer; transition:all .18s; display:flex; align-items:center; gap:7px; }
.gs-tab:hover { color:var(--gs-text); background:rgba(0,0,0,.04); }
.gs-tab--active { background:var(--gs-surface); color:#c97e10; font-weight:700; box-shadow:var(--gs-shadow); }
.gs-tab__count { background:rgba(245,166,35,.18); color:#8b4500; border-radius:100px; padding:1px 8px; font-size:11px; font-weight:700; }
.gs-tab__count--active { background:#f5a623; color:#fff; }

/* ─── Buttons ─── */
.gs-btn { display:inline-flex; align-items:center; gap:7px; padding:8px 18px; border-radius:var(--gs-radius-sm); font-size:13.5px; font-weight:700; border:none; cursor:pointer; transition:all .18s; white-space:nowrap; }
.gs-btn:disabled { opacity:.45; cursor:not-allowed; }
.gs-btn--primary { background:linear-gradient(135deg,#f5a623 0%,#c97e10 100%); color:#fff; box-shadow:0 2px 10px rgba(245,166,35,.30); }
.gs-btn--primary:hover:not(:disabled) { background:linear-gradient(135deg,#ffb84a 0%,#b86e08 100%); transform:translateY(-1px); }
.gs-btn--success { background:#1a8a48; color:#fff; border:1.5px solid #0d6e38; }
.gs-btn--success:hover:not(:disabled) { background:#0d6e38; transform:translateY(-1px); }
.gs-btn--danger  { background:#9b2020; color:#fff; border:1.5px solid #7b1a1a; }
.gs-btn--danger:hover:not(:disabled)  { background:#7b1a1a; transform:translateY(-1px); }
.gs-btn--delete-plan { background:#ede9e2; color:#9b2020; border:1.5px solid #f5c6c6; }
.gs-btn--delete-plan:hover:not(:disabled) { background:#fee2e2; border-color:#dc2626; }
.gs-btn--ghost { background:#ede9e2; color:#4a5a6a; border:1.5px solid #c8c4bc; }
.gs-btn--ghost:hover { background:#e8e4dc; color:#1e2a35; }
.gs-btn--publish { background:#0f766e; color:#fff; border:1.5px solid #0d9488; }
.gs-btn--publish:hover:not(:disabled) { background:#0d9488; box-shadow:0 3px 10px rgba(15,118,110,.35); }
.gs-btn--publish:disabled { opacity:.45; cursor:not-allowed; }
.gs-publish-count { background:rgba(255,255,255,.25); border-radius:20px; padding:0 7px; font-size:11px; font-weight:700; }

/* ─── States ─── */
.gs-state { text-align:center; padding:64px 24px; color:var(--gs-muted); background:var(--gs-surface); border:1.5px dashed var(--gs-border); border-radius:var(--gs-radius); }
.gs-state__icon { width:72px; height:72px; border-radius:50%; background:var(--gs-primary-light); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:var(--gs-primary); }
.gs-state__title { font-size:16px; font-weight:600; color:var(--gs-text); margin:0 0 6px; }
.gs-state__sub   { font-size:13.5px; margin:0; }
.gs-spinner { width:36px; height:36px; border:3px solid var(--gs-primary-light); border-top-color:var(--gs-primary); border-radius:50%; animation:gs-spin .7s linear infinite; margin:0 auto 16px; }
.gs-spinner-sm { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:gs-spin .7s linear infinite; }
@keyframes gs-spin { to { transform:rotate(360deg); } }

/* ─── Table ─── */
.gs-table-wrapper { background:var(--gs-surface); border-radius:var(--gs-radius); border:1px solid var(--gs-border); overflow:hidden; }
.gs-table { width:100%; border-collapse:collapse; font-size:13.5px; }
.gs-table thead tr { background:linear-gradient(90deg,rgba(245,166,35,.18),rgba(245,166,35,.08)); border-bottom:2px solid rgba(245,166,35,.35); }
.gs-table th { padding:12px 16px; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.7px; color:#6b3d00; text-align:left; }
.gs-table th:last-child { text-align:center; }
.gs-table td { padding:13px 16px; border-bottom:1px solid var(--gs-border); vertical-align:middle; }
.gs-table tbody tr:last-child td { border-bottom:none; }
.gs-table tbody tr { transition:background .12s; }
.gs-table tbody tr:hover { background:#ede9e2; }
.gs-table__row--conflict { background:var(--gs-danger-light) !important; }
.gs-date-cell__day  { font-weight:600; }
.gs-date-cell__time { font-size:11.5px; color:var(--gs-muted); margin-top:2px; }
.gs-project-name    { font-weight:500; }
.gs-muted           { color:var(--gs-muted); }
.gs-small           { font-size:12px; }
.gs-room-badge { display:inline-flex; align-items:center; gap:5px; background:#ede9e2; color:#4a5a6a; border-radius:6px; padding:3px 10px; font-size:12px; border:1px solid #c8c4bc; }

/* Jury mini rows in table */
.gs-jury-mini { display:flex; align-items:center; gap:5px; font-size:11.5px; margin-bottom:2px; }
.gs-jury-mini__role { font-size:10px; font-weight:700; background:#ede9e2; color:#4a5a6a; border:1px solid #c8c4bc; border-radius:4px; padding:1px 5px; }
.gs-jury-mini__role--president { background:#fef9c3; color:#854d0e; border-color:#fde047; }
.gs-jury-mini__role--exam { background:#f3e8ff; color:#581c87; border-color:#e9d5ff; }

/* Statut badge in table */
.gs-statut-badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:100px; font-size:11.5px; font-weight:600; }
.gs-statut-badge--planifie { background:#fef3c7; color:#78350f; border:1px solid #fde68a; }
.gs-statut-badge--publie   { background:#dcfce7; color:#14532d; border:1px solid #a7f3d0; }
.gs-statut-badge--termine  { background:#e0f2fe; color:#0c4a6e; border:1px solid #bae6fd; }

.gs-actions { display:flex; gap:6px; justify-content:center; }
.gs-icon-btn { width:30px; height:30px; border:1.5px solid; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s; }
.gs-icon-btn--edit { background:rgba(61,96,128,.07); border-color:rgba(61,96,128,.18); color:#2f4f6a; }
.gs-icon-btn--edit:hover { background:rgba(61,96,128,.15); border-color:#2f4f6a; }
.gs-icon-btn--del  { background:rgba(155,32,32,.07); border-color:rgba(155,32,32,.18); color:#9b2020; }
.gs-icon-btn--del:hover  { background:rgba(155,32,32,.15); border-color:#9b2020; }
.gs-published-badge { display:inline-flex; align-items:center; gap:4px; font-size:11.5px; font-weight:700; color:#0d9488; background:#edf5f4; border:1px solid #99f6e4; border-radius:20px; padding:3px 10px; }
.gs-validated-plan-badge { display:inline-flex; align-items:center; gap:4px; font-size:11.5px; font-weight:700; color:#1a5c9a; background:#e8f1fb; border:1px solid #b3d0f0; border-radius:20px; padding:3px 10px; }
.text-center { text-align:center; }

/* ─── Calendar ─── */
.gs-calendar { display:flex; flex-direction:column; gap:28px; }
.gs-day-label { display:flex; align-items:center; gap:10px; font-size:14px; font-weight:700; color:var(--gs-primary); margin-bottom:12px; }
.gs-day-label__dot { width:10px; height:10px; border-radius:50%; background:var(--gs-primary); }
.gs-cards-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; }
.gs-session-card { border-radius:var(--gs-radius); padding:16px 18px; box-shadow:var(--gs-shadow); transition:transform .2s,box-shadow .2s; position:relative; overflow:hidden; }
.gs-session-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:var(--gs-radius) var(--gs-radius) 0 0; }
.gs-session-card:hover { transform:translateY(-3px); box-shadow:var(--gs-shadow-md); }
.gs-session-card--color-0 { background:#eef2ff; border:1px solid #c7d2fe; } .gs-session-card--color-0::before { background:#6366f1; } .gs-session-card--color-0 .gs-session-card__time { color:#4338ca; }
.gs-session-card--color-1 { background:#ecfdf5; border:1px solid #a7f3d0; } .gs-session-card--color-1::before { background:#10b981; } .gs-session-card--color-1 .gs-session-card__time { color:#065f46; }
.gs-session-card--color-2 { background:#f5f3ff; border:1px solid #ddd6fe; } .gs-session-card--color-2::before { background:#8b5cf6; } .gs-session-card--color-2 .gs-session-card__time { color:#6d28d9; }
.gs-session-card--color-3 { background:#ecfeff; border:1px solid #a5f3fc; } .gs-session-card--color-3::before { background:#06b6d4; } .gs-session-card--color-3 .gs-session-card__time { color:#0e7490; }
.gs-session-card--color-4 { background:#fffbeb; border:1px solid #fde68a; } .gs-session-card--color-4::before { background:#f59e0b; } .gs-session-card--color-4 .gs-session-card__time { color:#b45309; }
.gs-session-card--color-5 { background:#fff1f2; border:1px solid #fecdd3; } .gs-session-card--color-5::before { background:#f43f5e; } .gs-session-card--color-5 .gs-session-card__time { color:#be123c; }
.gs-session-card--conflict { background:var(--gs-danger-light)!important; border-color:#fca5a5!important; }
.gs-session-card--conflict::before { background:var(--gs-danger)!important; }
.gs-session-card__top { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.gs-session-card__time { font-size:11.5px; font-weight:600; display:flex; align-items:center; gap:5px; }
.gs-session-card__conflict-badge { font-size:11px; font-weight:700; color:var(--gs-danger); background:#ede9e2; border:1px solid #fca5a5; border-radius:6px; padding:2px 8px; }
.gs-session-card__title { font-size:14.5px; font-weight:700; color:#0f172a; margin-bottom:10px; line-height:1.35; }
.gs-session-card__meta { display:flex; flex-wrap:wrap; gap:10px; }
.gs-session-card__student,.gs-session-card__room { display:flex; align-items:center; gap:4px; font-size:12px; color:var(--gs-muted); }

/* ─── Plans ─── */
.gs-plans-list { display:flex; flex-direction:column; gap:14px; }
.gs-plan-card { border-radius:var(--gs-radius); border:1.5px solid var(--gs-border); background:#ede9e2; overflow:hidden; }
.gs-plan-card--validated { border-left:5px solid var(--gs-success); }
.gs-plan-card--rejected  { border-left:5px solid var(--gs-danger); }
.gs-plan-card--pending   { border-left:5px solid var(--gs-warning); }
.gs-plan-card__header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding:16px 20px; border-bottom:1px solid var(--gs-border); background:linear-gradient(135deg,#1e2d3e 0%,#1a3248 100%); }
.gs-plan-card__who { display:flex; align-items:center; gap:12px; }
.gs-plan-card__avatar { width:38px; height:38px; border-radius:50%; background:rgba(245,166,35,.25); border:1.5px solid rgba(245,166,35,.40); color:#f5a623; font-weight:700; font-size:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.gs-plan-card__name { font-weight:600; font-size:14px; color:#fff; }
.gs-plan-card__date { font-size:12px; color:rgba(255,255,255,.55); margin-top:2px; }
.gs-plan-card__table-wrap { padding:0; overflow-x:auto; }
.gs-plan-card__motif { display:flex; align-items:center; gap:8px; padding:10px 20px; font-size:12.5px; color:#7f1d1d; background:#fee2e2; border-top:1px solid #fca5a5; }
.gs-plan-card__actions { display:flex; gap:10px; justify-content:flex-end; padding:14px 20px; border-top:1px solid var(--gs-border); background:#ede9e2; }

.gs-status-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 13px; border-radius:100px; font-size:12.5px; font-weight:600; }
.gs-status-badge__dot { width:7px; height:7px; border-radius:50%; background:currentColor; }
.gs-status-badge--success { background:var(--gs-success-light); color:var(--gs-success); }
.gs-status-badge--danger  { background:var(--gs-danger-light);  color:var(--gs-danger); }
.gs-status-badge--warning { background:var(--gs-warning-light); color:var(--gs-warning); }

.gs-role-badge { display:inline-block; font-size:11px; font-weight:600; padding:2px 8px; border-radius:100px; margin-left:8px; vertical-align:middle; }
.gs-role-badge--encadrant { background:var(--gs-primary-light); color:var(--gs-primary); border:1px solid #c7d2fe; }
.gs-role-badge--jury      { background:#fef9c3; color:#854d0e; border:1px solid #fde047; }

.gs-duree-badge { display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:100px; background:rgba(47,79,106,.10); color:#2f4f6a; border:1px solid rgba(47,79,106,.22); }

.gs-inner-table { width:100%; border-collapse:collapse; font-size:13px; }
.gs-inner-table thead tr { background:linear-gradient(90deg,rgba(245,166,35,.14),rgba(245,166,35,.06)); border-bottom:1.5px solid rgba(245,166,35,.30); }
.gs-inner-table th { padding:10px 16px; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.6px; color:#6b3d00; text-align:left; }
.gs-inner-table td { padding:10px 16px; border-bottom:1px solid var(--gs-border); color:var(--gs-text); }
.gs-inner-table tbody tr:last-child td { border-bottom:none; }

/* ─── Modal ─── */
.gs-modal-overlay { position:fixed; inset:0; background:rgba(10,18,28,.52); backdrop-filter:blur(3px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; }
.gs-modal { width:100%; max-width:560px; max-height:92vh; overflow-y:auto; background:#f5f2ed; border-radius:18px; box-shadow:0 4px 6px rgba(0,0,0,.08),0 24px 64px rgba(0,0,0,.28); display:flex; flex-direction:column; border:1.5px solid rgba(30,45,62,.15); }
.gs-modal--wide { max-width:640px; }
.gs-modal__header { display:flex; justify-content:space-between; align-items:center; padding:18px 22px; background:linear-gradient(135deg,#1e2d3e 0%,#1a3248 100%); border-radius:17px 17px 0 0; }
.gs-modal__header-content { display:flex; align-items:center; gap:12px; }
.gs-modal__icon { width:42px; height:42px; background:rgba(245,166,35,.18); color:#f5a623; border:1.5px solid rgba(245,166,35,.35); border-radius:11px; display:flex; align-items:center; justify-content:center; }
.gs-modal__title { font-weight:800; font-size:15px; color:#fff; }
.gs-modal__close { width:28px; height:28px; border:none; background:rgba(255,255,255,.14); color:rgba(255,255,255,.75); border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.gs-modal__close:hover { background:rgba(255,255,255,.28); color:#fff; }
.gs-modal__body { display:flex; flex-direction:column; gap:18px; padding:22px; background:#f5f2ed; }
.gs-modal__footer { display:flex; justify-content:flex-end; gap:10px; padding:14px 22px; border-top:1.5px solid rgba(30,45,62,.12); background:#ede9e2; border-radius:0 0 17px 17px; }

/* Form elements */
.gs-field { display:flex; flex-direction:column; gap:6px; flex:1; }
.gs-field--grow2 { flex:2; }
.gs-row { display:flex; gap:12px; }
@media (max-width:500px) { .gs-row { flex-wrap:wrap; } }
.gs-label { font-size:13px; font-weight:600; color:#374151; }
.gs-required { color:var(--gs-danger); }
.gs-input, .gs-select { padding:9px 13px; border:1.5px solid var(--gs-border); border-radius:var(--gs-radius-sm); font-size:13.5px; color:var(--gs-text); background:#ede9e2; outline:none; transition:border-color .18s,box-shadow .18s; width:100%; box-sizing:border-box; }
.gs-input:focus, .gs-select:focus { border-color:var(--gs-primary); box-shadow:0 0 0 3px rgba(79,70,229,.12); }
.gs-input--locked { background:#e8e4dc; color:#6a7a8a; cursor:not-allowed; font-weight:600; min-height:38px; display:flex; align-items:center; padding:9px 13px; }
.gs-input--valid   { border-color:var(--gs-success)!important; }
.gs-input--invalid { border-color:var(--gs-danger)!important; }
.gs-input--warn    { border-color:var(--gs-warning)!important; }
.gs-salle-input { max-width:130px; font-weight:600; letter-spacing:.04em; }
.gs-salle-hint    { font-size:11px; font-weight:400; color:var(--gs-muted); margin-left:6px; }
.gs-salle-loading { font-size:11px; color:var(--gs-muted); margin-left:6px; }
.gs-salle-feedback { font-size:12.5px; margin-top:5px; padding:6px 10px; border-radius:var(--gs-radius-sm); font-weight:500; }
.gs-salle-feedback--invalid  { background:var(--gs-danger-light);  color:var(--gs-danger); }
.gs-salle-feedback--disabled { background:#fef3c7; color:#92400e; border:1px solid #fde68a; }
.gs-salle-feedback--occupied { background:var(--gs-warning-light); color:var(--gs-warning-dark); border:1px solid #fde68a; }
.gs-salle-feedback--free     { background:var(--gs-success-light); color:var(--gs-success-dark); }

.gs-locked-session { border:1.5px solid #c8c4bc; border-radius:var(--gs-radius-sm); background:#e8e4dc; overflow:hidden; }
.gs-locked-session__row { display:flex; align-items:center; gap:8px; padding:9px 13px; font-size:13.5px; color:#2a3540; border-bottom:1px solid #c8c4bc; }
.gs-locked-session__row:last-child { border-bottom:none; }
.gs-locked-session__row--sub { font-size:12.5px; color:var(--gs-muted); }
.gs-locked-session__project { font-weight:600; }
.gs-locked-badge { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#fff; background:#4a7090; border-radius:4px; padding:1px 5px; margin-left:6px; vertical-align:middle; }
.gs-optional-badge { font-size:10px; font-weight:600; text-transform:uppercase; color:#8a9aaa; background:rgba(138,154,170,.15); border:1px solid rgba(138,154,170,.3); border-radius:4px; padding:1px 5px; margin-left:5px; vertical-align:middle; }
.gs-edit-info-banner { display:flex; align-items:flex-start; gap:10px; padding:10px 14px; background:rgba(47,79,106,.07); border:1px solid rgba(47,79,106,.20); border-radius:8px; font-size:12.5px; color:#2f4f6a; line-height:1.5; }

/* Teacher conflict block */
.gs-conflict-block { border:1.5px solid #fca5a5; border-radius:var(--gs-radius-sm); background:#fff1f1; overflow:hidden; }
.gs-conflict-block__header { display:flex; align-items:center; gap:8px; padding:10px 14px; background:#fee2e2; color:#991b1b; font-size:13px; font-weight:700; border-bottom:1px solid #fca5a5; }
.gs-conflict-list { list-style:none; margin:0; padding:0; }
.gs-conflict-item { padding:9px 14px; border-bottom:1px solid #ffe4e4; display:flex; flex-direction:column; gap:3px; }
.gs-conflict-item:last-child { border-bottom:none; }
.gs-conflict-item__who { display:flex; align-items:center; gap:7px; flex-wrap:wrap; }
.gs-conflict-item__detail { font-size:12px; color:#6b2929; }
.gs-conflict-item__detail em { font-style:normal; font-weight:600; color:#1a1a2e; }
.gs-conflict-role-badge { font-size:10.5px; font-weight:800; padding:2px 7px; border-radius:20px; text-transform:uppercase; letter-spacing:.04em; flex-shrink:0; }
.gs-conflict-role-badge--president   { background:#fef9c3; color:#713f12; border:1px solid #fde68a; }
.gs-conflict-role-badge--encadrant   { background:#dbeafe; color:#1e3a8a; border:1px solid #bfdbfe; }
.gs-conflict-role-badge--examinateur { background:#f3e8ff; color:#581c87; border:1px solid #e9d5ff; }
.gs-conflict-role-badge--membre      { background:#ede9e2; color:#334155; border:1px solid #c8c4bc; }
.gs-conflict-block__footer { display:flex; align-items:center; gap:6px; padding:8px 14px; font-size:11.5px; color:#7f1d1d; background:#fee2e2; border-top:1px solid #fca5a5; }
.gs-checking-teachers { display:flex; align-items:center; gap:8px; font-size:12.5px; color:var(--gs-muted); padding:6px 2px; }

/* Jury preview chips */
.gs-jury-members { display:flex; flex-wrap:wrap; gap:8px; }
.gs-jury-chip { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:100px; font-size:12.5px; font-weight:500; }
.gs-jury-chip--president { background:#fef9c3; color:#854d0e; border:1px solid #fde047; }
.gs-jury-chip--encadrant { background:var(--gs-primary-light); color:var(--gs-primary); border:1px solid #c7d2fe; }
.gs-jury-chip--member    { background:#ede9e2; color:#4a5a6a; border:1px solid var(--gs-border); }
.gs-jury-chip__role { font-size:11px; opacity:.75; }

/* Validate plan modal */
.gs-edit-plan-info { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--gs-info); background:var(--gs-info-light); border:1px solid #bae6fd; border-radius:var(--gs-radius-sm); padding:10px 14px; }
.gs-edit-slot { border:1.5px solid var(--gs-border); border-radius:var(--gs-radius-sm); overflow:hidden; background:#eeeae3; }
.gs-edit-slot__header { display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:10px 16px; background:linear-gradient(90deg,rgba(245,166,35,.14),rgba(245,166,35,.06)); border-bottom:1.5px solid rgba(245,166,35,.25); }
.gs-edit-slot__datestrip { display:flex; align-items:center; gap:5px; font-size:12px; font-weight:500; color:#5a6a7a; background:#e8e4dc; border:1px solid #c8c4bc; border-radius:6px; padding:3px 9px; }
.gs-edit-slot__fields { padding:14px 16px; display:flex; flex-direction:column; gap:14px; }
.gs-vp-proposant { display:flex; align-items:center; gap:12px; padding:12px 16px; background:linear-gradient(135deg,#1e2d3e 0%,#1a3248 100%); border-radius:10px; border:1.5px solid rgba(245,166,35,.25); }
.gs-vp-proposant__avatar { width:40px; height:40px; border-radius:50%; background:rgba(245,166,35,.25); border:1.5px solid rgba(245,166,35,.4); color:#f5a623; font-weight:700; font-size:17px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.gs-vp-proposant__info { flex:1; min-width:0; }
.gs-vp-proposant__name { font-weight:700; font-size:14px; color:#fff; }
.gs-vp-proposant__sub  { font-size:11.5px; color:rgba(255,255,255,.55); margin-top:2px; }
.gs-vp-proposant__role { font-size:11px; font-weight:700; padding:3px 10px; border-radius:100px; background:rgba(245,166,35,.22); color:#f5a623; border:1px solid rgba(245,166,35,.35); white-space:nowrap; }

/* Modal transition */
.modal-fade-enter-active { transition:all .22s cubic-bezier(.34,1.56,.64,1); }
.modal-fade-leave-active { transition:all .16s ease; }
.modal-fade-enter-from   { opacity:0; transform:scale(.94); }
.modal-fade-leave-to     { opacity:0; transform:scale(.96); }

/* ─── rm-modal system ─── */
.rm-overlay { position:fixed; inset:0; z-index:2000; background:rgba(10,18,28,.52); backdrop-filter:blur(3px); display:flex; align-items:center; justify-content:center; padding:20px; }
.rm-modal { width:100%; border-radius:18px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 4px 6px rgba(0,0,0,.08),0 24px 64px rgba(0,0,0,.28); }
.rm-modal--red   { background:#f5eeec; border:1.5px solid rgba(192,57,43,.2); }
.rm-modal--green { background:#edf5ef; border:1.5px solid rgba(39,174,96,.2); }
.rm-modal--teal  { background:#eaf3f2; border:1.5px solid rgba(15,118,110,.2); }
.rm-modal__head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; }
.rm-modal__head--red   { background:linear-gradient(135deg,#9b2020 0%,#6b1010 100%); }
.rm-modal__head--green { background:linear-gradient(135deg,#1a8a48 0%,#0d6e38 100%); }
.rm-modal__head--teal  { background:linear-gradient(135deg,#0f766e 0%,#0d5c57 100%); }
.rm-modal__head-left { display:flex; align-items:center; gap:13px; flex:1; min-width:0; }
.rm-modal__icon { width:44px; height:44px; border-radius:12px; flex-shrink:0; background:rgba(255,255,255,.18); border:1.5px solid rgba(255,255,255,.28); display:flex; align-items:center; justify-content:center; color:#fff; }
.rm-modal__title { font-size:15px; font-weight:800; color:#fff; margin-bottom:2px; }
.rm-modal__sub   { font-size:11.5px; color:rgba(255,255,255,.65); font-weight:500; }
.rm-modal__close { width:28px; height:28px; border-radius:8px; flex-shrink:0; background:rgba(255,255,255,.14); border:none; color:rgba(255,255,255,.75); cursor:pointer; display:flex; align-items:center; justify-content:center; }
.rm-modal__close:hover { background:rgba(255,255,255,.28); color:#fff; }
.rm-modal__body { padding:20px 22px; display:flex; flex-direction:column; gap:14px; background:#f5f2ed; }
.rm-modal__foot { display:flex; justify-content:flex-end; gap:8px; padding:14px 22px; background:#ede9e2; }
.rm-modal__foot--red   { border-top:1.5px solid rgba(192,57,43,.15); }
.rm-modal__foot--green { border-top:1.5px solid rgba(39,174,96,.15); }
.rm-modal__foot--teal  { border-top:1.5px solid rgba(15,118,110,.15); }
.rm-btn { display:flex; align-items:center; gap:7px; padding:8px 18px; border-radius:8px; border:1.5px solid; font-size:.82rem; font-weight:700; cursor:pointer; transition:.15s; }
.rm-btn:disabled { opacity:.5; cursor:not-allowed; }
.rm-btn--ghost { background:#ede9e2; border-color:#c8c4bc; color:#4a5a6a; }
.rm-btn--ghost:hover { background:#e8e4dc; color:#1e2a35; }
.rm-btn--red   { background:#9b2020; border-color:#7b1a1a; color:#fff; }
.rm-btn--red:hover:not(:disabled)   { background:#7b1a1a; }
.rm-btn--green { background:#1a8a48; border-color:#0d6e38; color:#fff; }
.rm-btn--green:hover:not(:disabled) { background:#0d6e38; }
.rm-btn--teal  { background:#0f766e; border-color:#0d5c57; color:#fff; }
.rm-btn--teal:hover:not(:disabled)  { background:#0d5c57; }
.rm-spinner { width:13px; height:13px; border-radius:50%; border:2px solid rgba(255,255,255,.35); border-top-color:#fff; animation:gs-spin .7s linear infinite; display:inline-block; }
.rm-del-warning { display:flex; flex-direction:column; align-items:center; gap:10px; text-align:center; padding:8px 0; }
.rm-del-warning__icon { opacity:.85; }
.rm-del-warning__text { font-size:.85rem; color:#3a3a3a; line-height:1.55; margin:0; }
.rm-field { display:flex; flex-direction:column; gap:5px; }
.rm-field__label { font-size:.73rem; font-weight:700; color:#4a5a6a; text-transform:uppercase; letter-spacing:.05em; }
.rm-optional { font-size:.68rem; font-weight:500; color:#8a9aaa; text-transform:none; letter-spacing:0; margin-left:4px; }
.rm-field__input { padding:9px 12px; border:1.5px solid #c8c4bc; border-radius:8px; font-size:.83rem; color:#1e2a35; background:#ede9e2; outline:none; transition:border-color .15s; width:100%; box-sizing:border-box; font-family:inherit; }
.rm-field__input:focus { border-color:#2f4f6a; background:#f5f2ed; box-shadow:0 0 0 3px rgba(47,79,106,.10); }
.rm-modal-enter-active, .rm-modal-leave-active { transition:all .22s; }
.rm-modal-enter-from, .rm-modal-leave-to { opacity:0; transform:scale(.96) translateY(6px); }
</style>