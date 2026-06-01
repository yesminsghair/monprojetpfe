<template>
  <div>
  <div class="page-content">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h2>Planifier des réunions</h2>
        <p class="subtitle">Proposez des créneaux à vos étudiants</p>
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

    <!-- TOAST -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="'toast-'+toast.type">
        <div class="toast-icon">
          <svg v-if="toast.type==='ok'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
        {{ toast.msg }}
        <button @click="toast.show=false" class="toast-x">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </transition>

    <!-- STUDENT FILTER TABS -->
    <div class="student-filter-section">
      <div class="student-filter-label">
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        ÉTUDIANT
      </div>
      <div class="student-tabs">
        <button
          class="stab"
          :class="{ 'stab-active': selectedStudent === null }"
          @click="selectStudent(null)"
        >
          <span class="stab-av stab-av-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </span>
          <span class="stab-name">Tous</span>
          <span v-if="propositions.length" class="stab-count">{{ propositions.length }}</span>
        </button>
        <button
          v-for="e in etudiants"
          :key="e.id"
          class="stab"
          :class="{ 'stab-active': selectedStudent === e.id }"
          @click="selectStudent(e.id)"
        >
          <span class="stab-av" :style="avatarStyle(e.nomComplet)">{{ initiales(e.nomComplet) }}</span>
          <span class="stab-name">{{ e.nomComplet }}</span>
          <span v-if="countFor(e.id)" class="stab-count">{{ countFor(e.id) }}</span>
        </button>
      </div>
    </div>

    <!-- CALENDAR SECTION TITLE -->
    <div class="section-title">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
      Calendrier hebdomadaire
    </div>

    <!-- CALENDAR -->
    <div class="calendar-card">
      <div class="cal-scroll">
        <table class="cal-table">
          <thead>
            <tr>
              <th class="cal-th-time"></th>
              <th v-for="j in jours" :key="j.key" class="cal-th-day" :class="{ 'is-today': isToday(j.date) }">
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
                :class="isSelected(j,heure)                                    ? 'cal-selected'
                      : isBooked(j,heure) && bookedStatut(j,heure)==='confirmee' ? 'cal-booked-confirmed'
                      : isBooked(j,heure)                                        ? 'cal-booked-proposed'
                      : isPastSlot(j,heure)                                      ? 'cal-past'
                      : 'cal-empty'"
                @click="toggleSlot(j,heure)"
              >
                <div v-if="isBooked(j,heure)" class="booked-pip">
                  <span class="booked-initials">{{ bookedLabel(j,heure) }}</span>
                </div>
                <div v-else-if="isPastSlot(j,heure)" class="past-pip">–</div>
                <div v-else-if="isSelected(j,heure)" class="selected-pip">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1e2a35" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="cal-legend">
        <span class="leg-item"><span class="leg-dot ld-gold"></span>Sélectionné</span>
        <span class="leg-item"><span class="leg-dot ld-green"></span>Confirmé</span>
        <span class="leg-item"><span class="leg-dot ld-yellow"></span>En attente</span>
        <span class="leg-item"><span class="leg-dot ld-past"></span>Passé</span>
        <span class="leg-item leg-hint">Cliquez sur un créneau libre pour le sélectionner</span>
      </div>
    </div>

    <!-- SELECTION CARD -->
    <transition name="slide-down">
      <div v-if="selection.length" class="selection-card">
        <div class="selection-header">
          <div class="sel-header-left">
            <span class="sel-count">{{ selection.length }}</span>
            <span class="sel-label">créneau{{ selection.length > 1 ? 'x' : '' }} sélectionné{{ selection.length > 1 ? 's' : '' }}</span>
          </div>
          <button class="btn-clear-all" @click="selection = []">Tout effacer</button>
        </div>
        <div class="selection-chips">
          <span v-for="(s,i) in selection" :key="i" class="chip">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {{ s.date.toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short'}) }} {{ s.heure }}
            <button class="chip-remove" @click="selection.splice(i,1)">
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </span>
        </div>

        <!-- Custom time slot adder -->
        <div class="custom-slot-row">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span class="custom-slot-label">Ajouter un horaire libre :</span>
          <input
            v-model="heurePersonnalisee"
            type="time"
            step="300"
            class="custom-slot-time"
            title="Heure personnalisée (ex: 09:30)"
          />
          <button class="custom-slot-btn" @click="ajouterCreneauPersonnalise" :disabled="!heurePersonnalisee">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Ajouter
          </button>
        </div>
        <div class="selection-form">
          <div class="form-group">
            <label class="field-label">Proposer à</label>
            <div class="select-wrap">
              <select v-model="selectedStudent" class="field-select" @change="chargerReunions">
                <option :value="null">— Choisir un étudiant —</option>
                <option v-for="e in etudiants" :key="e.id" :value="e.id">{{ e.nomComplet }}</option>
              </select>
              <svg class="select-arrow" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          <div class="form-group">
            <label class="field-label">Type de réunion</label>
            <div class="select-wrap">
              <select v-model="typeReunion" class="field-select">
                <option value="presentiel">Présentiel</option>
                <option value="distanciel">Distanciel</option>
                <option value="mixte">Mixte</option>
              </select>
              <svg class="select-arrow" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          <div class="form-group form-group-grow">
            <label class="field-label">Lieu (optionnel)</label>
            <input v-model="lieu" type="text" class="field-input" placeholder="Ex : Salle B12, Zoom…" />
          </div>
          <div class="form-group form-group-action">
            <label class="field-label" style="opacity:0">.</label>
            <button class="btn-envoyer" @click="proposer" :disabled="loading || !selectedStudent">
              <div v-if="loading" class="spinner-sm"></div>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- REUNIONS LIST -->
    <div class="section-title" style="margin-top:22px">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      Réunions proposées
      <span v-if="propositionsFiltrees.length" class="title-count">{{ propositionsFiltrees.length }}</span>
    </div>

    <!-- STATUS FILTER PILLS -->
    <div v-if="propositions.length" class="status-filters">
      <button
        v-for="f in statutFilters"
        :key="f.val"
        class="sfil"
        :class="{ 'sfil-active': statutFilter === f.val, ['sfil-'+f.val]: true }"
        @click="statutFilter = statutFilter === f.val ? '' : f.val"
      >
        <span class="sfil-dot" :class="'sd-'+f.val"></span>
        {{ f.label }}
        <span class="sfil-n">{{ countByStatut(f.val) }}</span>
      </button>
    </div>

    <div v-if="!reunionsFiltrees.length" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
      <p>Aucune réunion à afficher</p>
    </div>

    <!-- REUNION CARDS GRID -->
    <div v-else class="reunions-grid">
      <div v-for="r in reunionsFiltrees" :key="r.id" class="rcard" :class="'rcard-'+r.statut">
        <div class="rcard-border"></div>
        <div class="rcard-inner">
          <div class="rcard-av" :style="avatarStyle(r.etudiant)">{{ initiales(r.etudiant) }}</div>
          <div class="rcard-body">
            <div class="rcard-nom">{{ r.etudiant }}</div>
            <div class="rcard-date">
              {{ r.date?.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}) }} · {{ r.heure }}
              <span v-if="r.lieu" class="rcard-lieu"> · {{ r.lieu }}</span>
            </div>
            <div v-if="r.motif && r.statut==='annulee'" class="rcard-motif">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {{ r.motif }}
            </div>
          </div>
          <div class="rcard-right">
            <span class="rcard-badge" :class="'badge-'+r.statut">{{ statutLabel(r.statut) }}</span>
            <div class="rcard-actions">
              <!-- Modifier — only for active reunions -->
              <button
                v-if="r.statut==='planifiee' || r.statut==='confirmee'"
                class="rcard-btn rcard-btn--edit"
                @click="ouvrirModifier(r)"
                title="Modifier"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <!-- Annuler — only for active reunions -->
              <button
                v-if="r.statut==='planifiee' || r.statut==='confirmee'"
                class="rcard-btn rcard-btn--cancel"
                @click="ouvrirAnnuler(r)"
                title="Annuler"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <!-- Supprimer — only for annulée -->
              <button
                v-if="r.statut==='annulee'"
                class="rcard-btn rcard-btn--delete"
                @click="ouvrirSupprimer(r)"
                title="Supprimer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div><!-- end page-content -->

  <!-- ══════════════════════════════════════
       MODAL ANNULER — red theme
       ══════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="rm-modal">
      <div v-if="modalAnnuler" class="rm-overlay" @click.self="modalAnnuler = false">
        <div class="rm-modal rm-modal--red">

          <div class="rm-modal__head rm-modal__head--red">
            <div class="rm-modal__head-left">
              <div class="rm-modal__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <div>
                <div class="rm-modal__title">Annuler la réunion</div>
                <div class="rm-modal__sub">{{ reunionCible?.etudiant }} · {{ reunionCible?.date?.toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) }} {{ reunionCible?.heure }}</div>
              </div>
            </div>
            <button class="rm-modal__close" @click="modalAnnuler = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="rm-modal__body">
            <div class="rm-modal__warn">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>L'étudiant sera notifié de l'annulation. Cette action est irréversible.</span>
            </div>
            <div class="rm-field">
              <label class="rm-field__label">Motif de l'annulation <span class="rm-optional">(optionnel)</span></label>
              <textarea
                v-model="annulerMotif"
                class="rm-field__textarea"
                rows="3"
                placeholder="Ex : Indisponibilité, report de séance, contrainte imprévue…"
              ></textarea>
            </div>
          </div>

          <div class="rm-modal__foot">
            <button class="rm-btn rm-btn--ghost" @click="modalAnnuler = false">Fermer</button>
            <button class="rm-btn rm-btn--red" :disabled="modalLoading" @click="confirmerAnnuler">
              <div v-if="modalLoading" class="rm-spinner"></div>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Confirmer l'annulation
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══════════════════════════════════════
       MODAL MODIFIER — amber theme
       ══════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="rm-modal">
      <div v-if="modalModifier" class="rm-overlay" @click.self="modalModifier = false">
        <div class="rm-modal rm-modal--amber">

          <div class="rm-modal__head rm-modal__head--amber">
            <div class="rm-modal__head-left">
              <div class="rm-modal__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <div>
                <div class="rm-modal__title">Modifier la réunion</div>
                <div class="rm-modal__sub">{{ reunionCible?.etudiant }}</div>
              </div>
            </div>
            <button class="rm-modal__close rm-modal__close--amber" @click="modalModifier = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="rm-modal__body">
            <div class="rm-fields-grid">
              <div class="rm-field">
                <label class="rm-field__label">Date</label>
                <input v-model="modifierForm.date" type="date" class="rm-field__input" />
              </div>
              <div class="rm-field">
                <label class="rm-field__label">Heure</label>
                <input v-model="modifierForm.heure" type="time" class="rm-field__input" />
              </div>
              <div class="rm-field">
                <label class="rm-field__label">Type</label>
                <div class="rm-select-wrap">
                  <select v-model="modifierForm.type" class="rm-field__select">
                    <option value="presentiel">Présentiel</option>
                    <option value="distanciel">Distanciel</option>
                    <option value="mixte">Mixte</option>
                  </select>
                  <svg class="rm-select-arrow" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
              <div class="rm-field rm-field--wide">
                <label class="rm-field__label">Lieu <span class="rm-optional">(optionnel)</span></label>
                <input v-model="modifierForm.lieu" type="text" class="rm-field__input" placeholder="Ex : Salle B12, Zoom, Teams…" />
              </div>
            </div>
          </div>

          <div class="rm-modal__foot">
            <button class="rm-btn rm-btn--ghost" @click="modalModifier = false">Annuler</button>
            <button class="rm-btn rm-btn--amber" :disabled="modalLoading" @click="confirmerModifier">
              <div v-if="modalLoading" class="rm-spinner"></div>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Enregistrer
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>


  <!-- ══════════════════════════════════════
       MODAL SUPPRIMER — confirm delete
       ══════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="rm-modal">
      <div v-if="modalSupprimer" class="rm-overlay" @click.self="modalSupprimer = false">
        <div class="rm-modal rm-modal--red">

          <div class="rm-modal__head rm-modal__head--red">
            <div class="rm-modal__head-left">
              <div class="rm-modal__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              </div>
              <div>
                <div class="rm-modal__title">Supprimer la réunion</div>
                <div class="rm-modal__sub" v-if="reunionCible">
                  {{ reunionCible.etudiant }} · {{ fmtDay(reunionCible.date) }} à {{ reunionCible.heure }}
                </div>
              </div>
            </div>
            <button class="rm-modal__close" @click="modalSupprimer = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="rm-modal__body">
            <div class="rm-modal__warn">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Cette action est irréversible. La réunion annulée sera définitivement supprimée.</span>
            </div>
          </div>

          <div class="rm-modal__foot">
            <button class="rm-btn rm-btn--ghost" @click="modalSupprimer = false">Annuler</button>
            <button
              class="rm-btn rm-btn--red"
              :disabled="supprimerLoading"
              @click="confirmerSupprimer"
            >
              <div v-if="supprimerLoading" class="rm-spinner"></div>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              Supprimer définitivement
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

  </div><!-- end outer root -->
</template>

<script>
import api from '@/services/api.js'

const MOIS_COURTS = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc']

// Deterministic color from name string
const AVATAR_COLORS = [
  { bg: '#2f4f6a', text: '#fff' },
  { bg: '#3d6e8a', text: '#fff' },
  { bg: '#1e6b5e', text: '#fff' },
  { bg: '#5a4a8a', text: '#fff' },
  { bg: '#7a3d5a', text: '#fff' },
  { bg: '#3d6b3d', text: '#fff' },
  { bg: '#7a5a2a', text: '#fff' },
  { bg: '#2a5a7a', text: '#fff' },
]

function nameToColor(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default {
  name: 'ReunionEncadrant',
  emits: ['toast'],

  data () {
    return {
      etudiants:       [],
      selectedStudent: null,
      statutFilter:    '',
      statutFilters: [
        { val: 'planifiee', label: 'En attente' },
        { val: 'confirmee', label: 'Confirmée' },
        { val: 'annulee',   label: 'Annulée' },
      ],
      jourNoms:  ['Lun','Mar','Mer','Jeu','Ven'],
      heures:    ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'],
      selection:    [],
      propositions: [],
      weekStart: new Date(),
      typeReunion: 'presentiel',
      lieu: '',
      heurePersonnalisee: '',   // free-text time for custom slots
      toast:   { show: false, msg: '', type: 'ok' },
      loading: false,
      // ── Modals ──────────────────────────────────────────────────────
      reunionCible:  null,   // reunion currently being acted on
      modalLoading:  false,
      // Annuler modal
      modalAnnuler:  false,
      annulerMotif:  '',
      // Modifier modal
      modalModifier: false,
      modifierForm:  { date: '', heure: '', type: 'presentiel', lieu: '' },
      // Supprimer modal
      modalSupprimer:  false,
      supprimerLoading: false,
    }
  },

  computed: {
    jours () {
      const d = new Date(this.weekStart)
      const diff = d.getDay() === 0 ? -6 : 1 - d.getDay()
      d.setDate(d.getDate() + diff)
      return this.jourNoms.map((nom, i) => {
        const date = new Date(d)
        date.setDate(d.getDate() + i)
        return { nom, date, key: date.toDateString() }
      })
    },

    weekNum () {
      const d = new Date(this.weekStart)
      d.setHours(0,0,0,0)
      d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
      const w1 = new Date(d.getFullYear(), 0, 4)
      return 1 + Math.round(((d - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7)
    },

    weekRangeLabel () {
      if (!this.jours.length) return ''
      const debut = this.jours[0].date
      const fin   = this.jours[this.jours.length - 1].date
      const dDay  = debut.getDate()
      const fDay  = fin.getDate()
      const dMois = MOIS_COURTS[debut.getMonth()]
      const fMois = MOIS_COURTS[fin.getMonth()]
      return debut.getMonth() === fin.getMonth()
        ? `${dDay} – ${fDay} ${fMois}`
        : `${dDay} ${dMois} – ${fDay} ${fMois}`
    },

    propositionsFiltrees () {
      if (!this.selectedStudent) return this.propositions
      return this.propositions.filter(p => p.etudiant_id === this.selectedStudent)
    },

    propositionsCalendrier () {
      if (!this.selectedStudent) return this.propositions
      return this.propositions.filter(p => p.etudiant_id === this.selectedStudent)
    },

    reunionsFiltrees () {
      let list = this.propositionsFiltrees
      if (this.statutFilter) list = list.filter(r => r.statut === this.statutFilter)
      return list
    },
  },

  mounted () {
    this.chargerEtudiants()
    this.chargerReunions()
  },

  methods: {
    // ── Data loaders ────────────────────────────────────────────────
    async chargerEtudiants () {
      try {
        const r = await api.get('/affectations/mes-etudiants')
        this.etudiants = r.data
      } catch (e) {
        console.error('chargerEtudiants:', e)
        this.etudiants = []
      }
    },

    async chargerReunions () {
      try {
        const params = {}
        if (this.selectedStudent) params.etudiant_id = this.selectedStudent
        const r = await api.get('/reunions', { params })
        this.propositions = r.data.map(r => ({
          id:          r.id,
          etudiant_id: r.etudiant_id,
          etudiant:    r.etudiant_nom,
          date:        new Date((r.date_reunion || '').replace(' ', 'T')),
          heure:       this.formatHeure(r.date_reunion),
          statut:      r.statut,
          motif:       r.motif,
          lieu:        r.lieu,
          type:        r.type,
        }))
      } catch (e) {
        console.error('chargerReunions:', e)
      }
    },

    async proposer () {
      if (!this.selectedStudent) { this.showToast('Sélectionnez un étudiant', 'err'); return }
      if (!this.selection.length) { this.showToast('Sélectionnez au moins un créneau', 'err'); return }
      if (this.loading) return

      this.loading = true
      const slots = [...this.selection]
      this.selection = []
      const errors = []
      let sent = 0

      try {
        for (const s of slots) {
          const dt = new Date(s.date)
          const [h, m] = s.heure.split(':').map(Number)
          dt.setHours(h, m, 0, 0)
          try {
            const pad = n => String(n).padStart(2, '0')
            const dateStr = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:00`
            await api.post('/reunions', {
              etudiant_id:  this.selectedStudent,
              date_reunion: dateStr,
              type:         this.typeReunion,
              lieu:         this.lieu || null,
            })
            sent++
          } catch (slotErr) {
            errors.push(slotErr.response?.data?.message || `Erreur créneau ${s.heure}`)
          }
        }
        if (sent > 0) {
          this.lieu = ''
          await this.chargerReunions()
          const suffix = errors.length ? ` — ${errors.length} créneau(x) rejeté(s)` : ''
          this.showToast(`${sent} réunion(s) proposée(s) ✓${suffix}`, errors.length ? 'warn' : 'ok')
          if (errors.length) {
            // Show each rejection reason one by one
            errors.forEach((msg, i) => setTimeout(() => this.showToast(msg, 'err'), (i + 1) * 800))
          }
        } else {
          this.selection = slots
          this.showToast(errors[0] || 'Aucune réunion créée', 'err')
        }
      } catch (e) {
        this.selection = slots
        this.showToast(e.response?.data?.message || 'Erreur', 'err')
      } finally {
        this.loading = false
      }
    },

    // ── Custom time slot ─────────────────────────────────────────────
    ajouterCreneauPersonnalise () {
      if (!this.heurePersonnalisee) return
      // Determine which day to attach to: use the first selected day, else today's Monday
      const baseDate = this.jours[0]?.date || new Date()
      // If there's already a selected slot, add on the same day as the last one
      const refDate = this.selection.length
        ? this.selection[this.selection.length - 1].date
        : baseDate
      const heure = this.heurePersonnalisee  // e.g. "09:30"
      const [h, m] = heure.split(':').map(Number)
      const dt = new Date(refDate)
      dt.setHours(h, m, 0, 0)
      if (dt < new Date()) {
        this.showToast('Ce créneau est déjà passé.', 'err')
        return
      }
      const alreadySelected = this.selection.some(
        s => s.date.toDateString() === dt.toDateString() && s.heure === heure
      )
      if (alreadySelected) {
        this.showToast('Ce créneau est déjà sélectionné.', 'err')
        return
      }
      this.selection.push({ date: dt, heure })
      this.heurePersonnalisee = ''
    },

    // ── Modal: Annuler ───────────────────────────────────────────────
    ouvrirAnnuler (reunion) {
      this.reunionCible = reunion
      this.annulerMotif = ''
      this.modalAnnuler = true
    },

    async confirmerAnnuler () {
      if (this.modalLoading) return
      this.modalLoading = true
      try {
        await api.post(`/reunions/${this.reunionCible.id}/annuler`, {
          motif: this.annulerMotif || null,
        })
        await this.chargerReunions()
        this.showToast('Réunion annulée. L\'étudiant a été notifié.')
        this.modalAnnuler = false
      } catch (e) {
        this.showToast(e.response?.data?.message || "Erreur lors de l'annulation", 'err')
      } finally {
        this.modalLoading = false
      }
    },

    // ── Modal: Modifier ──────────────────────────────────────────────
    ouvrirModifier (reunion) {
      this.reunionCible = reunion
      // Pre-fill the form with current values
      const d = reunion.date
      const pad = n => String(n).padStart(2, '0')
      this.modifierForm = {
        date:  d ? `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` : '',
        heure: reunion.heure || '',
        type:  reunion.type  || 'presentiel',
        lieu:  reunion.lieu  || '',
      }
      this.modalModifier = true
    },

    async confirmerModifier () {
      if (this.modalLoading) return
      const { date, heure, type, lieu } = this.modifierForm
      if (!date || !heure) {
        this.showToast('La date et l\'heure sont obligatoires.', 'err')
        return
      }
      this.modalLoading = true
      try {
        await api.put(`/reunions/${this.reunionCible.id}`, {
          date_reunion: `${date} ${heure}:00`,
          type,
          lieu: lieu || null,
        })
        await this.chargerReunions()
        this.showToast('Réunion modifiée avec succès.')
        this.modalModifier = false
      } catch (e) {
        this.showToast(e.response?.data?.message || 'Erreur lors de la modification.', 'err')
      } finally {
        this.modalLoading = false
      }
    },

    // ── Supprimer réunion annulée ────────────────────────────────────
    ouvrirSupprimer (reunion) {
      this.reunionCible    = reunion
      this.modalSupprimer  = true
    },

    async confirmerSupprimer () {
      this.supprimerLoading = true
      try {
        await api.delete(`/reunions/${this.reunionCible.id}`)
        await this.chargerReunions()
        this.showToast('Réunion supprimée.')
        this.modalSupprimer = false
      } catch (e) {
        this.showToast(e.response?.data?.message || 'Erreur lors de la suppression.', 'err')
      } finally {
        this.supprimerLoading = false
      }
    },

    showToast (msg, type = 'ok') {
      this.toast = { show: true, msg, type }
      setTimeout(() => this.toast.show = false, 3500)
    },

    initiales (n) {
      return (n || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    },

    avatarStyle (name) {
      const c = nameToColor(name)
      return { background: c.bg, color: c.text }
    },

    countFor (etudiantId) {
      return this.propositions.filter(p => p.etudiant_id === etudiantId).length
    },

    countByStatut (statut) {
      return this.propositionsFiltrees.filter(r => r.statut === statut).length
    },

    selectStudent (id) {
      this.selectedStudent = id
      this.statutFilter = ''
      this.chargerReunions()
    },

    isToday (date) {
      const t = new Date()
      return date.getDate() === t.getDate()
          && date.getMonth() === t.getMonth()
          && date.getFullYear() === t.getFullYear()
    },

    semainePrecedente () {
      const d = new Date(this.weekStart); d.setDate(d.getDate() - 7); this.weekStart = d
    },
    semaineSuivante () {
      const d = new Date(this.weekStart); d.setDate(d.getDate() + 7); this.weekStart = d
    },

    // ── Slot state helpers ───────────────────────────────────────────
    isSelected (j, h) {
      return this.selection.some(s => s.date.toDateString() === j.key && s.heure === h)
    },
    isBooked (j, h) {
      return this.propositionsCalendrier.some(p => p.date?.toDateString() === j.key && p.heure === h && p.statut !== 'annulee')
    },
    bookedStatut (j, h) {
      const p = this.propositionsCalendrier.find(p => p.date?.toDateString() === j.key && p.heure === h)
      if (!p) return null
      const s = (p.statut || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (s === 'confirmee' || s === 'confirmed' || s === 'confirme') return 'confirmee'
      return p.statut
    },
    bookedLabel (j, h) {
      const p = this.propositionsCalendrier.find(p => p.date?.toDateString() === j.key && p.heure === h)
      return p ? p.etudiant.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : ''
    },

    isPastSlot (j, h) {
      const dt = new Date(j.date)
      const [hour, min] = h.split(':').map(Number)
      dt.setHours(hour, min, 0, 0)
      return dt < new Date()
    },

    toggleSlot (j, h) {
      if (this.isBooked(j, h)) return
      if (this.isPastSlot(j, h)) {
        this.showToast('Ce créneau est déjà passé.', 'err')
        return
      }
      const idx = this.selection.findIndex(s => s.date.toDateString() === j.key && s.heure === h)
      if (idx >= 0) this.selection.splice(idx, 1)
      else this.selection.push({ date: j.date, heure: h })
    },

    fmtDay (d) {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    },

    formatHeure (d) {
      if (!d) return ''
      const norm = typeof d === 'string' ? d.replace(' ', 'T') : d
      return new Date(norm).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    },

    statutLabel (statut) {
      return { planifiee: 'En attente', confirmee: 'Confirmé', annulee: 'Annulée', effectuee: 'Effectuée' }[statut] || statut
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
.week-switcher { display: flex; align-items: center; gap: 0; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 12px; overflow: hidden; }
.wsw-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 52px; background: none; border: none; cursor: pointer; color: #2f4f6a; transition: background .15s, color .15s; flex-shrink: 0; }
.wsw-btn:hover { background: #f5a623; color: #1e2a35; }
.wsw-label { display: flex; flex-direction: column; align-items: center; padding: 6px 20px; border-left: 1px solid #c8c4bc; border-right: 1px solid #c8c4bc; min-width: 138px; }
.wsw-sem { font-size: 0.63rem; font-weight: 700; color: #f5a623; text-transform: uppercase; letter-spacing: .1em; }
.wsw-range { font-family: 'Merriweather', serif; font-size: 0.84rem; font-weight: 700; color: #1e2a35; margin-top: 2px; white-space: nowrap; }

/* ── TOAST ── */
.toast { display: flex; align-items: center; gap: 9px; padding: 10px 14px; border-radius: 10px; margin-bottom: 16px; font-size: 0.85rem; font-weight: 500; border: 1.5px solid; }
.toast-ok  { background: #e8f5e9; color: #155724; border-color: #c3e6cb; }
.toast-err { background: #f8d7da; color: #721c24; border-color: #f5c6cb; }
.toast-icon { display: flex; align-items: center; flex-shrink: 0; }
.toast-x { background: none; border: none; cursor: pointer; color: inherit; opacity: .5; display: flex; align-items: center; margin-left: auto; padding: 0; }
.toast-x:hover { opacity: 1; }
.toast-enter-active, .toast-leave-active { transition: all .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-6px); }

/* ── STUDENT FILTER TABS ── */
.student-filter-section { margin-bottom: 22px; }
.student-filter-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.67rem; font-weight: 700; color: #8a9aaa;
  text-transform: uppercase; letter-spacing: .1em;
  margin-bottom: 8px;
}
.student-tabs { display: flex; flex-wrap: wrap; gap: 8px; }

.stab {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 14px 6px 6px;
  background: #e8e4dc;
  border: 1.5px solid #c8c4bc;
  border-radius: 50px;
  cursor: pointer;
  font-family: 'Source Sans 3', sans-serif;
  font-size: 0.82rem; font-weight: 600;
  color: #4a5a6a;
  transition: all .18s;
  white-space: nowrap;
}
.stab:hover { border-color: #4a7090; color: #2f4f6a; background: #ddd9d1; }
.stab-active { background: #2f4f6a !important; border-color: #2f4f6a !important; color: #fff !important; }
.stab-active .stab-av { background: rgba(255,255,255,.18) !important; color: #fff !important; }

.stab-av {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: 700;
  letter-spacing: .02em; flex-shrink: 0;
}
.stab-av-all { background: #ddd9d1; color: #4a5a6a; }
.stab-name { line-height: 1; }
.stab-count {
  background: #f5a623; color: #1e2a35;
  font-size: 0.68rem; font-weight: 700;
  padding: 1px 7px; border-radius: 20px;
  min-width: 20px; text-align: center;
}
.stab-active .stab-count { background: #f5a623; color: #1e2a35; }

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
.cal-cell { height: 40px; width: 80px; text-align: center; vertical-align: middle; border: 1px solid #d4d0c8; cursor: pointer; transition: background .12s; }
.cal-empty:hover { background: rgba(245,166,35,.15); }
.cal-selected { background: #f5a623 !important; }
.cal-booked-confirmed { background: rgba(39,174,96,.18); cursor: default; }
.cal-booked-proposed  { background: rgba(245,198,35,.25); cursor: default; }
.cal-past     { background: repeating-linear-gradient(135deg, #e8e4dc, #e8e4dc 4px, #d4d0c8 4px, #d4d0c8 8px); cursor: not-allowed; opacity: .6; }
.past-pip     { font-size: 0.7rem; color: #b0b8c4; font-weight: 700; line-height: 1; }
.selected-pip { width: 22px; height: 22px; border-radius: 50%; background: rgba(0,0,0,.12); display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.booked-pip { display: flex; align-items: center; justify-content: center; }
.cal-booked-confirmed .booked-initials { font-size: 0.62rem; font-weight: 700; color: #1e8449; background: rgba(39,174,96,.25); padding: 2px 5px; border-radius: 6px; }
.cal-booked-proposed  .booked-initials { font-size: 0.62rem; font-weight: 700; color: #7a5500; background: rgba(245,198,35,.45); padding: 2px 5px; border-radius: 6px; }
.cal-legend { display: flex; align-items: center; gap: 16px; padding: 8px 14px; border-top: 1px solid #c8c4bc; background: #ddd9d1; flex-wrap: wrap; }
.leg-item { display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: #8a9aaa; }
.leg-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.ld-gold   { background: #f5a623; }
.ld-green  { background: rgba(39,174,96,.5); border: 1px solid rgba(39,174,96,.6); }
.ld-yellow { background: rgba(245,198,35,.6); border: 1px solid rgba(200,160,20,.5); }
.ld-past   { background: repeating-linear-gradient(135deg, #c8c4bc, #c8c4bc 3px, #e8e4dc 3px, #e8e4dc 6px); border: 1px solid #b0b8c4; }
.leg-hint { font-size: 0.71rem; color: #a0a8b0; font-style: italic; margin-left: auto; }

/* ── SELECTION CARD ── */
.selection-card { background: #e8e4dc; border: 2px solid #f5a623; border-radius: 14px; margin-bottom: 16px; overflow: hidden; }
.slide-down-enter-active, .slide-down-leave-active { transition: all .25s; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
.selection-header { display: flex; align-items: center; justify-content: space-between; padding: 11px 16px; background: rgba(245,166,35,.1); border-bottom: 1px solid rgba(245,166,35,.28); }
.sel-header-left { display: flex; align-items: center; gap: 8px; }
.sel-count { background: #f5a623; color: #1e2a35; font-family: 'Merriweather', serif; font-size: 0.95rem; font-weight: 700; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.sel-label { font-size: 0.82rem; font-weight: 600; color: #2f4f6a; }
.btn-clear-all { font-size: 0.73rem; color: #8a9aaa; background: none; border: 1px solid #c8c4bc; border-radius: 7px; padding: 4px 10px; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: .15s; }
.btn-clear-all:hover { color: #721c24; border-color: #f5c6cb; background: #fff0f0; }
.selection-chips { display: flex; flex-wrap: wrap; gap: 7px; padding: 11px 16px; }
.chip { display: flex; align-items: center; gap: 5px; padding: 5px 8px 5px 10px; background: #f5a623; color: #1e2a35; border-radius: 20px; font-size: 0.76rem; font-weight: 600; }
.chip-remove { background: rgba(0,0,0,.1); border: none; cursor: pointer; color: #1e2a35; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; padding: 0; transition: background .15s; }
.chip-remove:hover { background: rgba(0,0,0,.22); }
.selection-form { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; padding: 10px 16px 16px; border-top: 1px solid rgba(245,166,35,.22); }
.form-group { display: flex; flex-direction: column; }
.form-group-grow { flex: 1; min-width: 150px; }
.form-group-action { flex-shrink: 0; }
.field-label { font-size: 0.73rem; font-weight: 600; color: #4a5a6a; margin-bottom: 4px; display: block; }
.field-input { width: 100%; padding: 8px 11px; background: #f5f3f0; border: 1.5px solid #c8c4bc; border-radius: 8px; font-size: 0.8rem; font-family: 'Source Sans 3', sans-serif; color: #1e2a35; outline: none; transition: .2s; }
.field-input:focus { border-color: #f5a623; background: #fff; }
.select-wrap { position: relative; }
.field-select { appearance: none; padding: 8px 30px 8px 11px; background: #f5f3f0; border: 1.5px solid #c8c4bc; border-radius: 8px; font-size: 0.8rem; font-family: 'Source Sans 3', sans-serif; color: #1e2a35; outline: none; cursor: pointer; transition: .2s; min-width: 180px; }
.field-select:focus { border-color: #f5a623; background: #fff; }
.select-arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #8a9aaa; }
.btn-envoyer { display: flex; align-items: center; gap: 7px; padding: 8px 20px; background: #f5a623; color: #1e2a35; border: none; border-radius: 8px; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: .2s; white-space: nowrap; }
.btn-envoyer:hover:not(:disabled) { background: #d98e1a; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(245,166,35,.35); }
.btn-envoyer:disabled { opacity: .5; cursor: not-allowed; }
.spinner-sm { width: 13px; height: 13px; border: 2px solid rgba(30,42,53,.3); border-top-color: #1e2a35; border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── STATUS FILTER PILLS ── */
.status-filters { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 14px; }
.sfil { display: flex; align-items: center; gap: 6px; padding: 5px 12px; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 20px; font-size: 0.76rem; font-weight: 600; color: #4a5a6a; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: all .15s; }
.sfil:hover { border-color: #4a7090; color: #2f4f6a; }
.sfil-active { background: #2f4f6a; border-color: #2f4f6a; color: #fff; }
.sfil-active .sfil-dot { opacity: 1; }
.sfil-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sd-planifiee { background: #f5a623; }
.sd-confirmee { background: #27ae60; }
.sd-annulee   { background: #c0392b; }
.sd-effectuee { background: #2980b9; }
.sfil-n { background: rgba(0,0,0,.08); border-radius: 20px; padding: 0 6px; font-size: 0.68rem; min-width: 18px; text-align: center; }
.sfil-active .sfil-n { background: rgba(255,255,255,.18); }

/* ── EMPTY STATE ── */
.empty-state { text-align: center; padding: 36px 20px; color: #8a9aaa; background: #e8e4dc; border: 2px dashed #c8c4bc; border-radius: 12px; }
.empty-state svg { opacity: .35; margin-bottom: 10px; }
.empty-state p { font-size: 0.86rem; }

/* ── REUNION CARDS GRID ── */
.reunions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px; }

.rcard {
  background: #e8e4dc;
  border: 1.5px solid #c8c4bc;
  border-radius: 14px;
  overflow: hidden;
  transition: box-shadow .2s, transform .15s;
  cursor: default;
  display: flex;
}
.rcard:hover { box-shadow: 0 5px 20px rgba(0,0,0,.1); transform: translateY(-2px); }

/* Left colored border bar — matches reference screenshots */
.rcard-border { width: 5px; flex-shrink: 0; }
.rcard-confirmee .rcard-border { background: #27ae60; }
.rcard-planifiee .rcard-border { background: #f5a623; }
.rcard-annulee   .rcard-border { background: #c0392b; }
.rcard-effectuee .rcard-border { background: #2980b9; }

.rcard-inner { display: flex; align-items: center; gap: 12px; padding: 13px 13px 13px 12px; flex: 1; min-width: 0; }

.rcard-av {
  flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px;
  font-size: 0.7rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  letter-spacing: .03em;
}
.rcard-body { flex: 1; min-width: 0; }
.rcard-nom  { font-weight: 700; font-size: 0.86rem; color: #1e2a35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
.rcard-date { font-size: 0.76rem; color: #8a9aaa; display: flex; align-items: center; flex-wrap: wrap; gap: 0; }
.rcard-lieu { color: #4a7090; }
.rcard-motif { font-size: 0.73rem; color: #721c24; font-style: italic; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.rcard-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }

.rcard-actions { display: flex; gap: 5px; align-items: center; }

.rcard-btn {
  width: 28px; height: 28px; border-radius: 7px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s, color .15s, transform .1s;
  padding: 0;
}
.rcard-btn:hover { transform: translateY(-1px); }
.rcard-btn--edit   { background: rgba(245,166,35,.12); color: #8a5e00; }
.rcard-btn--edit:hover { background: rgba(245,166,35,.28); color: #5a3e00; }
.rcard-btn--cancel { background: rgba(192,57,43,.10); color: #c0392b; }
.rcard-btn--cancel:hover { background: rgba(192,57,43,.22); color: #7b241c; }
.rcard-btn--delete { background: rgba(192,57,43,.10); color: #c0392b; }
.rcard-btn--delete:hover { background: rgba(192,57,43,.22); color: #7b241c; }

.rcard-badge { font-size: 0.69rem; font-weight: 700; padding: 3px 11px; border-radius: 20px; white-space: nowrap; }
.badge-planifiee { background: rgba(245,166,35,.18); color: #8a5e00; border: 1px solid rgba(245,166,35,.45); }
.badge-confirmee { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.badge-annulee   { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
.badge-effectuee { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }

/* ── CUSTOM SLOT ROW ── */
.custom-slot-row {
  display: flex; align-items: center; gap: 9px;
  padding: 8px 16px 4px;
  flex-wrap: wrap;
  color: #4a5a6a;
}
.custom-slot-label { font-size: 0.76rem; font-weight: 600; color: #4a5a6a; }
.custom-slot-time {
  padding: 5px 9px; border: 1.5px solid #c8c4bc; border-radius: 7px;
  font-size: 0.8rem; font-family: 'Source Sans 3', sans-serif;
  color: #1e2a35; background: #f5f3f0; outline: none;
  transition: border-color .15s;
}
.custom-slot-time:focus { border-color: #f5a623; background: #fff; }
.custom-slot-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 13px; background: #2f4f6a; color: #fff;
  border: none; border-radius: 7px; font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: background .15s;
}
.custom-slot-btn:hover:not(:disabled) { background: #1e3a52; }
.custom-slot-btn:disabled { opacity: .45; cursor: not-allowed; }

/* ══════════════════════════════════════════════════
   REUNION MODALS — shared base
   ══════════════════════════════════════════════════ */
.rm-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(10,18,28,.52);
  backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.rm-modal {
  width: 100%; max-width: 420px;
  border-radius: 18px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 4px 6px rgba(0,0,0,.08), 0 24px 64px rgba(0,0,0,.28), 0 0 0 1px rgba(255,255,255,.06);
}

/* ── Red variant (Annuler) ── */
.rm-modal--red { background: #fff8f7; border: 1.5px solid rgba(192,57,43,.2); }
.rm-modal__head--red {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #9b2020 0%, #6b1010 100%);
}

/* ── Amber variant (Modifier) ── */
.rm-modal--amber { background: #fffcf5; border: 1.5px solid rgba(245,166,35,.25); }
.rm-modal__head--amber {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #b07010 0%, #7a4a05 100%);
}

/* ── Shared header parts ── */
.rm-modal__head-left { display: flex; align-items: center; gap: 13px; flex: 1; min-width: 0; }
.rm-modal__icon {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: rgba(255,255,255,.18); border: 1.5px solid rgba(255,255,255,.28);
  display: flex; align-items: center; justify-content: center; color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
}
.rm-modal__title { font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 2px; font-family: 'Merriweather', serif; }
.rm-modal__sub   { font-size: 11.5px; color: rgba(255,255,255,.6); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px; }
.rm-modal__close {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  background: rgba(255,255,255,.14); border: none; color: rgba(255,255,255,.75);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .12s, color .12s;
}
.rm-modal__close:hover { background: rgba(255,255,255,.28); color: #fff; }

/* ── Body ── */
.rm-modal__body { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; }
.rm-modal--red .rm-modal__body   { background: #fff8f7; }
.rm-modal--amber .rm-modal__body { background: #fffcf5; }

.rm-modal__warn {
  display: flex; align-items: flex-start; gap: 10px;
  background: rgba(192,57,43,.08); border: 1.5px solid rgba(192,57,43,.2);
  border-radius: 10px; padding: 12px 14px;
  font-size: 13px; color: #7b241c; font-weight: 500; line-height: 1.45;
}
.rm-modal__warn svg { flex-shrink: 0; margin-top: 1px; color: #c0392b; }

.rm-field { display: flex; flex-direction: column; gap: 5px; }
.rm-field--wide { grid-column: 1 / -1; }
.rm-field__label { font-size: 0.73rem; font-weight: 700; color: #4a5a6a; text-transform: uppercase; letter-spacing: .05em; }
.rm-optional { font-size: 0.68rem; font-weight: 500; color: #8a9aaa; text-transform: none; letter-spacing: 0; }
.rm-field__input, .rm-field__textarea, .rm-field__select {
  padding: 8px 11px; border: 1.5px solid #c8c4bc; border-radius: 8px;
  font-size: 0.82rem; font-family: 'Source Sans 3', sans-serif;
  color: #1e2a35; background: #f5f3f0; outline: none; transition: border-color .15s, background .15s;
  width: 100%;
}
.rm-field__input:focus, .rm-field__textarea:focus, .rm-field__select:focus { border-color: #f5a623; background: #fff; }
.rm-field__textarea { resize: vertical; min-height: 80px; }
.rm-select-wrap { position: relative; }
.rm-field__select { appearance: none; padding-right: 28px; cursor: pointer; }
.rm-select-arrow { position: absolute; right: 9px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #8a9aaa; }
.rm-fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* ── Footer ── */
.rm-modal__foot {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 22px;
}
.rm-modal--red .rm-modal__foot   { border-top: 1.5px solid rgba(192,57,43,.15); background: rgba(192,57,43,.04); }
.rm-modal--amber .rm-modal__foot { border-top: 1.5px solid rgba(245,166,35,.18); background: rgba(245,166,35,.04); }

/* ── Buttons ── */
.rm-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 18px; border-radius: 8px; border: 1.5px solid;
  font-size: 0.82rem; font-weight: 700; cursor: pointer;
  font-family: 'Source Sans 3', sans-serif; transition: .15s;
}
.rm-btn:disabled { opacity: .5; cursor: not-allowed; }
.rm-btn--ghost { background: #f5f3f0; border-color: #c8c4bc; color: #4a5a6a; }
.rm-btn--ghost:hover { background: #e8e4dc; color: #1e2a35; }
.rm-btn--red { background: #9b2020; border-color: #7b1a1a; color: #fff; }
.rm-btn--red:hover:not(:disabled) { background: #7b1a1a; box-shadow: 0 4px 12px rgba(155,32,32,.35); }
.rm-btn--amber { background: #b07010; border-color: #8a5a0a; color: #fff; }
.rm-btn--amber:hover:not(:disabled) { background: #8a5a0a; box-shadow: 0 4px 12px rgba(176,112,16,.35); }

/* ── Spinner ── */
.rm-spinner {
  width: 13px; height: 13px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,.35); border-top-color: #fff;
  animation: spin .7s linear infinite;
}

/* ── Transitions ── */
.rm-modal-enter-active, .rm-modal-leave-active { transition: all .22s; }
.rm-modal-enter-from, .rm-modal-leave-to { opacity: 0; transform: scale(.96) translateY(6px); }
</style>