<template>
  <div class="pfe-page">

    <!-- ══ DÉLIBÉRATION MODAL ════════════════════════════════════════════ -->
    <transition name="modal-fade">
      <div v-if="modalDlib.show" class="dlib-modal-overlay" @click.self="modalDlib.show = false">
        <div class="dlib-modal" :class="modalDlib.decision === 'ajourne' ? 'dlib-modal--ajourne' : ''">
          <!-- Modal header -->
          <div class="dlib-modal__header">
            <div class="dlib-modal__av" :class="modalDlib.decision === 'ajourne' ? 'dlib-av--ajourne' : 'dlib-av--admis'">
              {{ initiales(modalDlib.etudiant?.etudiant_nom) }}
            </div>
            <div class="dlib-modal__meta">
              <div class="dlib-modal__name">{{ modalDlib.etudiant?.etudiant_nom }}</div>
              <div class="dlib-modal__mat">{{ modalDlib.etudiant?.matricule }}</div>
              <div class="dlib-modal__sujet">{{ modalDlib.etudiant?.projet_titre || '—' }}</div>
            </div>
            <div class="dlib-modal__score">
              <div class="dlib-score-pill"
                   :class="(modalDlib.etudiant?.note_president ?? 0) >= 10 ? 'dlib-score-pill--pass' : 'dlib-score-pill--fail'">
                <span class="dlib-score-num">{{ modalDlib.etudiant?.note_president }}</span>
                <span class="dlib-score-denom">/20</span>
              </div>
              <span class="dlib-mention" :class="mentionClass(modalDlib.etudiant?.note_president)">
                {{ getMention(modalDlib.etudiant?.note_president) }}
              </span>
            </div>
            <button class="dlib-modal__close" @click="modalDlib.show = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Decision choice -->
          <div class="dlib-modal__body">
            <p class="dlib-modal__label">Décision de délibération</p>
            <div class="dlib-modal__choices">
              <button
                class="dlib-choice dlib-choice--admis"
                :class="{ 'dlib-choice--active': modalDlib.decision === 'admis' }"
                @click="modalDlib.decision = 'admis'"
              >
                <div class="dlib-choice__radio"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <div>
                  <div class="dlib-choice__title">Admis</div>
                  <div class="dlib-choice__sub">L'étudiant valide son PFE</div>
                </div>
              </button>
              <button
                class="dlib-choice dlib-choice--ajourne"
                :class="{ 'dlib-choice--active': modalDlib.decision === 'ajourne' }"
                @click="modalDlib.decision = 'ajourne'"
              >
                <div class="dlib-choice__radio"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <div>
                  <div class="dlib-choice__title">Ajourné</div>
                  <div class="dlib-choice__sub">Résultat insuffisant</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Modal footer -->
          <div class="dlib-modal__footer">
            <button class="dlib-modal__cancel" @click="modalDlib.show = false">Annuler</button>
            <button
              class="dlib-modal__confirm"
              :class="modalDlib.decision === 'ajourne' ? 'dlib-modal__confirm--ajourne' : ''"
              :disabled="deliberPendingId === modalDlib.etudiant?.jury_id"
              @click="confirmerDeliberation"
            >
              <span v-if="deliberPendingId === modalDlib.etudiant?.jury_id" class="pfe-spinner pfe-spinner--xs pfe-spinner--dark"/>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
              Confirmer la délibération
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══ HEADER ══════════════════════════════════════════════════════ -->
    <div class="pfe-header">
      <div class="pfe-header__left">
        <div class="pfe-header__icon pfe-header__icon--gold">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="12" cy="8" r="6"/>
            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
        </div>
        <div>
          <h1 class="pfe-header__title">Résultats des soutenances</h1>
          <p class="pfe-header__sub">Délibération · Publication · Bibliothèque · Archivage</p>
        </div>
      </div>
      <div class="pfe-header__actions">
        <button v-if="hasUnpublished" class="pfe-btn pfe-btn--gold"
                :disabled="loadingPublierTous" @click="publierTous">
          <span v-if="loadingPublierTous" class="pfe-spinner pfe-spinner--sm pfe-spinner--dark"/>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
          </svg>
          Publier tout
        </button>
        <button v-if="hasPublishedUnarchived" class="pfe-btn pfe-btn--outline"
                :disabled="loadingArchiver" @click="archiverTous">
          <span v-if="loadingArchiver" class="pfe-spinner pfe-spinner--sm pfe-spinner--white"/>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5"/>
            <line x1="10" y1="12" x2="14" y2="12"/>
          </svg>
          Archiver tout
        </button>
      </div>
    </div>

    <!-- ══ STATS ══════════════════════════════════════════════════════ -->
    <div v-if="!loading && (resultats.length || pretsADeliberer.length)" class="rc-stats">
      <div v-if="pretsADeliberer.length" class="rc-stat rc-stat--deliberer">
        <div class="rc-stat__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="rc-stat__body">
          <strong>{{ pretsADeliberer.length }}</strong><span>À délibérer</span>
        </div>
      </div>
      <div class="rc-stat rc-stat--blue">
        <div class="rc-stat__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="rc-stat__body">
          <strong>{{ resultats.length }}</strong><span>Total délibérés</span>
        </div>
      </div>
      <div class="rc-stat rc-stat--gold">
        <div class="rc-stat__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
          </svg>
        </div>
        <div class="rc-stat__body">
          <strong>{{ resultats.filter(r => r.publie).length }}</strong><span>Publiés</span>
        </div>
      </div>
      <div class="rc-stat rc-stat--blue-light">
        <div class="rc-stat__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="rc-stat__body">
          <strong>{{ resultats.filter(r => r.decision === 'admis').length }}</strong><span>Admis</span>
        </div>
      </div>
      <div class="rc-stat rc-stat--gold-light">
        <div class="rc-stat__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="rc-stat__body">
          <strong>{{ resultats.filter(r => r.decision === 'ajourne').length }}</strong><span>Ajournés</span>
        </div>
      </div>
      <div class="rc-stat rc-stat--blue-deep">
        <div class="rc-stat__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <div class="rc-stat__body">
          <strong>{{ resultats.filter(r => r.en_biblio).length }}</strong><span>Bibliothèque</span>
        </div>
      </div>
    </div>

    <!-- ══ PENDING DELIBERATION SECTION ═══════════════════════════════ -->
    <div v-if="!loadingPrets && pretsADeliberer.length" class="dlib-section">
      <div class="dlib-section__header">
        <div class="dlib-section__dot"></div>
        <h2 class="dlib-section__title">Soutenances prêtes à délibérer</h2>
        <span class="dlib-section__badge">{{ pretsADeliberer.length }}</span>
      </div>
      <p class="dlib-section__sub">
        Ces soutenances ont leur fiche d'évaluation finalisée. Cliquez sur Délibérer pour choisir la décision.
      </p>

      <div class="dlib-grid">
        <div v-for="p in pretsADeliberer" :key="p.jury_id" class="dlib-card">

          <!-- Left stripe: pass/fail color indicator -->
          <div class="dlib-card__stripe"
               :class="p.note_president >= 10 ? 'dlib-card__stripe--pass' : 'dlib-card__stripe--fail'">
          </div>

          <!-- Avatar -->
          <div class="dlib-card__av"
               :class="p.note_president >= 10 ? 'dlib-av--admis' : 'dlib-av--ajourne'">
            {{ initiales(p.etudiant_nom) }}
          </div>

          <!-- Info -->
          <div class="dlib-card__info">
            <div class="dlib-card__name">{{ p.etudiant_nom }}</div>
            <div class="dlib-card__mat">{{ p.matricule }}</div>
            <div class="dlib-card__sujet" :title="p.projet_titre">{{ p.projet_titre || '—' }}</div>
          </div>

          <!-- Score -->
          <div class="dlib-card__score">
            <div class="dlib-score-pill"
                 :class="p.note_president >= 10 ? 'dlib-score-pill--pass' : 'dlib-score-pill--fail'">
              <span class="dlib-score-num">{{ p.note_president }}</span>
              <span class="dlib-score-denom">/20</span>
            </div>
            <span class="dlib-mention" :class="mentionClass(p.note_president)">
              {{ getMention(p.note_president) }}
            </span>
          </div>

          <!-- Action -->
          <button class="dlib-btn" @click="ouvrirModal(p)">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="8" r="6"/>
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
            Délibérer
          </button>
        </div>
      </div>
    </div>

    <!-- ══ TOOLBAR ═════════════════════════════════════════════════════ -->
    <div v-if="resultats.length || loading" class="pfe-toolbar">
      <div class="pfe-search">
        <svg class="pfe-search__icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
             viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" class="pfe-search__input" placeholder="Nom, matricule, projet…" />
        <button v-if="search" class="pfe-search__clear" @click="search = ''">✕</button>
      </div>
      <div class="pfe-pills">
        <button v-for="f in filters" :key="f.key" class="pfe-pill"
                :class="{ 'pfe-pill--active': activeFilter === f.key }"
                @click="activeFilter = f.key">{{ f.label }}</button>
      </div>
    </div>

    <!-- ══ LOADING ═════════════════════════════════════════════════════ -->
    <div v-if="loading" class="pfe-state">
      <div class="pfe-spinner pfe-spinner--lg"></div>
      <p class="pfe-state__sub">Chargement des résultats…</p>
    </div>

    <!-- ══ EMPTY ═══════════════════════════════════════════════════════ -->
    <div v-else-if="!filtered.length && !pretsADeliberer.length" class="pfe-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24"
           fill="none" stroke="var(--vld-text-faint)" stroke-width="1.3">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
      <p class="pfe-state__title">
        {{ search || activeFilter !== 'tous' ? 'Aucun résultat correspondant' : 'Aucun résultat disponible' }}
      </p>
      <p class="pfe-state__sub">Les résultats apparaissent ici après délibération.</p>
    </div>

    <!-- ══ CARD GRID ═══════════════════════════════════════════════════ -->
    <div v-else-if="filtered.length" class="pfe-grid">
      <div
        v-for="(r, i) in filtered"
        :key="r.id"
        class="pfe-card-wrap"
        :style="{ animationDelay: (i * 0.04) + 's' }"
      >
        <div
          class="pfe-card"
          :class="{
            'pfe-card--open':        openId === r.id,
            'pfe-card--unpublished': !r.publie,
            'pfe-card--biblio':      r.en_biblio,
          }"
          @click="toggle(r.id)"
        >
          <div class="pfe-card__body">
            <div class="pfe-card__top">
              <div class="pfe-av" :class="r.publie ? 'pfe-av--blue' : 'pfe-av--gold'">
                {{ initiales(r.etudiant_nom) }}
              </div>
              <div class="pfe-card__info">
                <div class="pfe-card__name">{{ r.etudiant_nom }}</div>
                <div class="pfe-card__mat">{{ r.matricule }}</div>
                <div class="pfe-card__sujet" :title="r.projet_titre">{{ r.projet_titre || '—' }}</div>
              </div>
              <div class="pfe-card__score">
                <div class="pfe-score-pill"
                     :class="r.note_finale >= 10 ? 'pfe-score-pill--pass' : 'pfe-score-pill--fail'">
                  <span class="pfe-score-num">{{ r.note_finale ?? '—' }}</span>
                  <span class="pfe-score-denom">/20</span>
                </div>
                <span class="pfe-mention" :class="mentionClass(r.note_finale)">
                  {{ getMention(r.note_finale) }}
                </span>
              </div>
            </div>

            <div class="pfe-card__meta">
              <span class="pfe-card__enc">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {{ r.encadrant_nom || '—' }}
              </span>
              <span v-if="r.date_soutenance" class="pfe-year-tag">
                {{ formatDateShort(r.date_soutenance) }}
              </span>
            </div>
          </div>

          <div class="pfe-card__footer" @click.stop>
            <div class="pfe-card__badges">
              <span class="pfe-decision"
                    :class="r.decision === 'admis' ? 'pfe-decision--admis' : 'pfe-decision--ajourne'">
                {{ r.decision === 'admis' ? '✓ Admis' : '✗ Ajourné' }}
              </span>
              <span v-if="r.publie" class="pfe-tag pfe-tag--published">
                Publié<span v-if="r.publie_le" class="pfe-tag__date"> · {{ r.publie_le }}</span>
              </span>
              <span v-if="r.en_biblio" class="pfe-tag pfe-tag--biblio">⭐</span>
            </div>
            <div class="pfe-card__actions">
              <!-- Publier — avant publication uniquement -->
              <button v-if="!r.publie" class="pfe-action pfe-action--publish"
                      :disabled="pendingId === r.id + '-pub'" @click="publierResultat(r)">
                <span v-if="pendingId === r.id + '-pub'" class="pfe-spinner pfe-spinner--xs pfe-spinner--dark"/>
                Publier
              </button>
              <!-- Biblio — toujours après publication, si note >= 16 et pas encore ajouté -->
              <button v-if="r.publie && r.note_finale >= 16 && !r.en_biblio"
                      class="pfe-action pfe-action--biblio"
                      :disabled="pendingId === r.id + '-bib'" @click="ajouterBiblio(r)">
                <span v-if="pendingId === r.id + '-bib'" class="pfe-spinner pfe-spinner--xs pfe-spinner--white"/>
                Biblio.
              </button>
              <!-- Archiver — toujours après publication, si pas encore archivé -->
              <button v-if="r.publie && !r.archive"
                      class="pfe-action pfe-action--archive"
                      :disabled="pendingId === r.id + '-arc'" @click="archiverResultat(r)">
                <span v-if="pendingId === r.id + '-arc'" class="pfe-spinner pfe-spinner--xs"/>
                Archiver
              </button>
            </div>
          </div>

          <div class="pfe-chevron" :class="{ 'pfe-chevron--open': openId === r.id }">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        <!-- Detail panel -->
        <transition name="pfe-detail-expand">
          <div v-if="openId === r.id" class="pfe-detail" @click.stop>
            <div class="pfe-section">
              <div class="pfe-section__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Étudiant
              </div>
              <div class="pfe-detail-grid">
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Nom complet</div>
                  <div class="pfe-detail-val">{{ r.etudiant_nom }}</div>
                </div>
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Matricule</div>
                  <div class="pfe-detail-val pfe-detail-val--code">{{ r.matricule }}</div>
                </div>
                <div class="pfe-detail-block pfe-detail-block--full">
                  <div class="pfe-detail-label">Sujet du projet</div>
                  <div class="pfe-detail-val pfe-detail-val--sujet">{{ r.projet_titre || '—' }}</div>
                </div>
              </div>
            </div>

            <div class="pfe-section">
              <div class="pfe-section__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Encadrant &amp; Jury
              </div>
              <div class="pfe-detail-grid">
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Nom de l'encadrant</div>
                  <div class="pfe-detail-val">{{ r.encadrant_nom || '—' }}</div>
                </div>
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Note jury</div>
                  <div class="pfe-detail-val">
                    <span v-if="r.note_jury != null" class="pfe-note-chip pfe-note-chip--jury">{{ r.note_jury }}/20</span>
                    <span v-else class="pfe-detail-val--muted">—</span>
                  </div>
                </div>
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Note encadrant</div>
                  <div class="pfe-detail-val">
                    <span v-if="r.note_encadrant != null" class="pfe-note-chip pfe-note-chip--enc">{{ r.note_encadrant }}/20</span>
                    <span v-else class="pfe-detail-val--muted">—</span>
                  </div>
                </div>
                <div class="pfe-detail-block">
                  <div class="pfe-detail-label">Date de soutenance</div>
                  <div class="pfe-detail-val">{{ r.date_soutenance ? formatDate(r.date_soutenance) : '—' }}</div>
                </div>
              </div>
            </div>

            <div class="pfe-section">
              <div class="pfe-section__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="12" cy="8" r="6"/>
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                </svg>
                Résultat final
              </div>
              <div class="pfe-result-row">
                <div class="pfe-result-score"
                     :class="r.note_finale >= 10 ? 'pfe-result-score--pass' : 'pfe-result-score--fail'">
                  <span class="pfe-result-num">{{ r.note_finale }}</span>
                  <span class="pfe-result-denom">/20</span>
                </div>
                <div class="pfe-result-badges">
                  <span class="pfe-mention" style="font-size:.82rem;padding:.3rem 1rem"
                        :class="mentionClass(r.note_finale)">{{ getMention(r.note_finale) }}</span>
                  <span class="pfe-decision" style="font-size:.82rem;padding:.3rem 1rem"
                        :class="r.decision === 'admis' ? 'pfe-decision--admis' : 'pfe-decision--ajourne'">
                    {{ r.decision === 'admis' ? '✓ Admis' : '✗ Ajourné' }}
                  </span>
                  <span v-if="r.publie_le"  class="pfe-publie-tag">Publié le {{ r.publie_le }}</span>
                  <span v-if="r.archive_le" class="pfe-archive-tag">Archivé le {{ r.archive_le }}</span>
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
  name: 'ConsulterResultatFinal',
  emits: ['toast'],
  data () {
    return {
      resultats:          [],
      loading:            false,
      search:             '',
      activeFilter:       'tous',
      openId:             null,
      pendingId:          null,
      loadingPublierTous: false,
      loadingArchiver:    false,

      pretsADeliberer:    [],
      loadingPrets:       false,
      deliberPendingId:   null,

      // Modal state
      modalDlib: {
        show:     false,
        etudiant: null,   // the pending jury object
        decision: 'admis',
      },

      filters: [
        { key: 'tous',    label: 'Tous'         },
        { key: 'unpub',   label: 'À publier'    },
        { key: 'publie',  label: 'Publiés'      },
        { key: 'admis',   label: 'Admis'        },
        { key: 'ajourne', label: 'Ajournés'     },
        { key: 'biblio',  label: 'Bibliothèque' },
        { key: 'archive', label: 'Archivés'     },
      ],
    }
  },

  computed: {
    hasUnpublished ()         { return this.resultats.some(r => !r.publie) },
    hasPublishedUnarchived () { return this.resultats.some(r => r.publie && !r.archive) },
    filtered () {
      let list = this.resultats
      if (this.activeFilter === 'unpub')   list = list.filter(r => !r.publie)
      if (this.activeFilter === 'publie')  list = list.filter(r =>  r.publie)
      if (this.activeFilter === 'admis')   list = list.filter(r =>  r.decision === 'admis')
      if (this.activeFilter === 'ajourne') list = list.filter(r =>  r.decision === 'ajourne')
      if (this.activeFilter === 'biblio')  list = list.filter(r =>  r.en_biblio)
      if (this.activeFilter === 'archive') list = list.filter(r =>  r.archive)
      if (this.search.trim()) {
        const q = this.search.toLowerCase()
        list = list.filter(r =>
          (r.etudiant_nom || '').toLowerCase().includes(q) ||
          (r.matricule    || '').toLowerCase().includes(q) ||
          (r.projet_titre || '').toLowerCase().includes(q)
        )
      }
      return list
    },
  },

  mounted () {
    this.charger()
    this.chargerPrets()
  },

  methods: {
    async charger () {
      this.loading = true
      try {
        const { data } = await api.get('/resultats-pfe')
        this.resultats = Array.isArray(data) ? data : []
      } catch {
        this.$emit('toast', { type: 'error', message: 'Erreur lors du chargement.' })
      } finally {
        this.loading = false
      }
    },

    async chargerPrets () {
      this.loadingPrets = true
      try {
        const { data } = await api.get('/jurys-pfe/prets-a-deliberer')
        this.pretsADeliberer = Array.isArray(data) ? data : []
      } catch {
        this.$emit('toast', { type: 'error', message: 'Erreur chargement délibérations.' })
      } finally {
        this.loadingPrets = false
      }
    },

    // ── Open the deliberation modal ───────────────────────────────────
    ouvrirModal (p) {
      this.modalDlib = {
        show:     true,
        etudiant: p,
        decision: p.note_president >= 10 ? 'admis' : 'ajourne',
      }
    },

    // ── Confirm deliberation from modal ───────────────────────────────
    async confirmerDeliberation () {
      const p        = this.modalDlib.etudiant
      const decision = this.modalDlib.decision
      this.deliberPendingId = p.jury_id
      try {
        // 1. Deliberate (creates ResultatPfe with note + mention)
        await api.post(`/jurys-pfe/${p.jury_id}/deliberer`, { decision })

        // 2. If ajourné, patch the decision (deliberer sets it automatically from note,
        //    but the chef may have overridden it)
        if (decision === 'ajourne') {
          const { data: list } = await api.get('/resultats-pfe')
          const created = list.find(r =>
            r.soutenance_id === p.jury_id || r.etudiant_nom === p.etudiant_nom
          )
          if (created) {
            await api.post(`/resultats-pfe/${created.id}/decision`, { decision: 'ajourne' })
          }
        }

        this.$emit('toast', {
          type: 'ok',
          message: `Délibération enregistrée — ${decision === 'admis' ? 'Admis' : 'Ajourné'}.`,
        })
        this.modalDlib.show = false
        await Promise.all([this.charger(), this.chargerPrets()])
      } catch (e) {
        this.$emit('toast', {
          type: 'error',
          message: e.response?.data?.message || 'Erreur lors de la délibération.',
        })
      } finally {
        this.deliberPendingId = null
      }
    },

    toggle (id) { this.openId = this.openId === id ? null : id },

    async publierResultat (r) {
      this.pendingId = r.id + '-pub'
      try {
        await api.post(`/resultats-pfe/${r.id}/publier`)
        r.publie    = true
        r.publie_le = new Date().toLocaleDateString('fr-FR')
        this.$emit('toast', { type: 'ok', message: 'Résultat publié.' })
      } catch (e) {
        this.$emit('toast', { type: 'error', message: e.response?.data?.message || 'Erreur.' })
      } finally {
        this.pendingId = null
      }
    },

    async ajouterBiblio (r) {
      this.pendingId = r.id + '-bib'
      try {
        await api.post(`/resultats-pfe/${r.id}/bibliotheque`, { en_biblio: true })
        r.en_biblio = true
        this.$emit('toast', { type: 'ok', message: 'Ajouté à la bibliothèque.' })
      } catch (e) {
        this.$emit('toast', { type: 'error', message: e.response?.data?.message || 'Erreur.' })
      } finally {
        this.pendingId = null
      }
    },

    async archiverResultat (r) {
      this.pendingId = r.id + '-arc'
      try {
        await api.post(`/resultats-pfe/${r.id}/archiver`)
        r.archive    = true
        r.archive_le = new Date().toLocaleDateString('fr-FR')
        this.$emit('toast', { type: 'ok', message: 'Archivé.' })
      } catch (e) {
        this.$emit('toast', { type: 'error', message: e.response?.data?.message || 'Erreur.' })
      } finally {
        this.pendingId = null
      }
    },

    async publierTous () {
      this.loadingPublierTous = true
      try {
        const { data } = await api.post('/resultats-pfe/publier-tous')
        this.$emit('toast', { type: 'ok', message: data.message })
        await this.charger()
      } catch (e) {
        this.$emit('toast', { type: 'error', message: e.response?.data?.message || 'Erreur.' })
      } finally {
        this.loadingPublierTous = false
      }
    },

    async archiverTous () {
      this.loadingArchiver = true
      try {
        const { data } = await api.post('/resultats-pfe/archiver-tous')
        this.$emit('toast', { type: 'ok', message: data.message })
        await this.charger()
      } catch (e) {
        this.$emit('toast', { type: 'error', message: e.response?.data?.message || 'Erreur.' })
      } finally {
        this.loadingArchiver = false
      }
    },

    initiales (n) {
      return (n || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    },
    getMention (n) {
      if (n == null) return '—'
      if (n >= 16) return 'Très bien'
      if (n >= 14) return 'Bien'
      if (n >= 12) return 'Assez bien'
      if (n >= 10) return 'Passable'
      return 'Insuffisant'
    },
    mentionClass (n) {
      if (n == null) return 'pfe-mention--neutral'
      if (n >= 16) return 'pfe-mention--tb'
      if (n >= 14) return 'pfe-mention--bien'
      if (n >= 12) return 'pfe-mention--ab'
      if (n >= 10) return 'pfe-mention--pass'
      return 'pfe-mention--fail'
    },
    formatDate (d) {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    },
    formatDateShort (d) {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    },
  },
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════
   DELIBERATION SECTION  — dlib-*
   ═══════════════════════════════════════════════════════════════════════ */

.dlib-section {
  background: var(--vld-surface, #fff);
  border: 1px solid var(--vld-border, #e8e3d9);
  border-radius: 14px;
  padding: 1.5rem 1.75rem 1.75rem;
  margin-bottom: 1.5rem;
}

.dlib-section__header {
  display: flex;
  align-items: center;
  gap: .65rem;
  margin-bottom: .35rem;
}

.dlib-section__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--vld-gold, #c9a227);
  flex-shrink: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--vld-gold, #c9a227) 18%, transparent);
  animation: dlib-pulse 2s ease-in-out infinite;
}

@keyframes dlib-pulse {
  0%, 100% { box-shadow: 0 0 0 3px color-mix(in srgb, var(--vld-gold, #c9a227) 18%, transparent); }
  50%       { box-shadow: 0 0 0 6px color-mix(in srgb, var(--vld-gold, #c9a227) 8%, transparent); }
}

.dlib-section__title {
  font-size: .95rem;
  font-weight: 700;
  color: var(--vld-text, #1a1714);
  margin: 0;
}

.dlib-section__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 99px;
  background: color-mix(in srgb, var(--vld-gold, #c9a227) 15%, transparent);
  color: color-mix(in srgb, var(--vld-gold, #c9a227) 90%, #5a3e00);
  font-size: .72rem;
  font-weight: 700;
}

.dlib-section__sub {
  font-size: .8rem;
  color: var(--vld-text-muted, #7a7060);
  margin: 0 0 1.25rem;
  line-height: 1.5;
}

/* ── Card grid ─────────────────────────────────────────────────────── */
.dlib-grid {
  display: flex;
  flex-direction: column;
  gap: .65rem;
}

/* Card: horizontal row like in the screenshot */
.dlib-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--vld-bg, #faf8f4);
  border: 1.5px solid var(--vld-border, #e8e3d9);
  border-radius: 12px;
  padding: .9rem 1.1rem;
  position: relative;
  overflow: hidden;
  transition: border-color .18s, box-shadow .18s;
}

.dlib-card:hover {
  border-color: color-mix(in srgb, var(--vld-gold, #c9a227) 40%, transparent);
  box-shadow: 0 3px 14px color-mix(in srgb, var(--vld-gold, #c9a227) 10%, transparent);
}

/* Left color stripe (pass = teal-ish, fail = orange) */
.dlib-card__stripe {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 12px 0 0 12px;
}

.dlib-card__stripe--pass { background: var(--vld-blue, #3b72b8); }
.dlib-card__stripe--fail { background: #e07b3a; }

/* Avatar */
.dlib-card__av {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .82rem;
  font-weight: 700;
  flex-shrink: 0;
}

.dlib-av--admis {
  background: color-mix(in srgb, var(--vld-blue, #3b72b8) 14%, transparent);
  color: var(--vld-blue, #3b72b8);
}

.dlib-av--ajourne {
  background: color-mix(in srgb, #e07b3a 14%, transparent);
  color: #c05c1a;
}

/* Info */
.dlib-card__info {
  flex: 1;
  min-width: 0;
}

.dlib-card__name {
  font-size: .88rem;
  font-weight: 700;
  color: var(--vld-text, #1a1714);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dlib-card__mat {
  font-size: .73rem;
  color: var(--vld-text-muted, #7a7060);
  font-family: monospace;
  letter-spacing: .04em;
  margin-top: .1rem;
}

.dlib-card__sujet {
  font-size: .73rem;
  color: var(--vld-text-faint, #a8a090);
  margin-top: .15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

/* Score */
.dlib-card__score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: .3rem;
  flex-shrink: 0;
}

.dlib-score-pill {
  display: inline-flex;
  align-items: baseline;
  gap: .1rem;
  padding: .28rem .7rem;
  border-radius: 8px;
  font-weight: 800;
}

.dlib-score-pill--pass {
  background: color-mix(in srgb, var(--vld-blue, #3b72b8) 12%, transparent);
  color: var(--vld-blue, #3b72b8);
}

.dlib-score-pill--fail {
  background: color-mix(in srgb, #e07b3a 12%, transparent);
  color: #c05c1a;
}

.dlib-score-num   { font-size: 1.05rem; }
.dlib-score-denom { font-size: .7rem; opacity: .7; }

.dlib-mention {
  font-size: .68rem;
  font-weight: 600;
  padding: .16rem .55rem;
  border-radius: 99px;
  white-space: nowrap;
}
.dlib-mention.pfe-mention--tb   { background: #d4f0e0; color: #1a7a42; }
.dlib-mention.pfe-mention--bien { background: #d8eaff; color: #1a5aab; }
.dlib-mention.pfe-mention--ab   { background: #e8f4ff; color: #2a6fcf; }
.dlib-mention.pfe-mention--pass { background: #fff3cd; color: #856404; }
.dlib-mention.pfe-mention--fail { background: #ffe0d0; color: #c05c1a; }

/* Délibérer button on card */
.dlib-btn {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .42rem 1rem;
  font-size: .8rem;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: var(--vld-dark, #1a1714);
  color: #fff;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity .15s, transform .1s;
}

.dlib-btn:hover { opacity: .85; transform: translateY(-1px); }
.dlib-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

/* ═══════════════════════════════════════════════════════════════════════
   MODAL
   ═══════════════════════════════════════════════════════════════════════ */

.dlib-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.dlib-modal {
  background: var(--vld-surface, #fff);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
  overflow: hidden;
  border: 1.5px solid var(--vld-border, #e8e3d9);
  transition: border-color .2s;
}

.dlib-modal--ajourne {
  border-color: color-mix(in srgb, #e07b3a 40%, transparent);
}

/* Modal header */
.dlib-modal__header {
  display: flex;
  align-items: center;
  gap: .85rem;
  padding: 1.25rem 1.4rem 1rem;
  border-bottom: 1px solid var(--vld-border, #e8e3d9);
  position: relative;
}

.dlib-modal__av {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .85rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: background .2s, color .2s;
}

.dlib-modal__meta {
  flex: 1;
  min-width: 0;
}

.dlib-modal__name {
  font-size: .92rem;
  font-weight: 700;
  color: var(--vld-text, #1a1714);
}

.dlib-modal__mat {
  font-size: .73rem;
  color: var(--vld-text-muted, #7a7060);
  font-family: monospace;
  letter-spacing: .04em;
}

.dlib-modal__sujet {
  font-size: .73rem;
  color: var(--vld-text-faint, #a8a090);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dlib-modal__score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: .3rem;
}

.dlib-modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vld-text-muted, #7a7060);
  padding: .2rem;
  border-radius: 6px;
  display: flex;
  transition: background .15s, color .15s;
}

.dlib-modal__close:hover {
  background: var(--vld-hover, #f5f2ed);
  color: var(--vld-text, #1a1714);
}

/* Modal body */
.dlib-modal__body {
  padding: 1.25rem 1.4rem;
}

.dlib-modal__label {
  font-size: .75rem;
  font-weight: 700;
  color: var(--vld-text-muted, #7a7060);
  text-transform: uppercase;
  letter-spacing: .06em;
  margin: 0 0 .75rem;
}

.dlib-modal__choices {
  display: flex;
  flex-direction: column;
  gap: .6rem;
}

/* Choice button */
.dlib-choice {
  display: flex;
  align-items: center;
  gap: .85rem;
  padding: .9rem 1rem;
  border-radius: 10px;
  border: 2px solid var(--vld-border, #e8e3d9);
  background: var(--vld-bg, #faf8f4);
  cursor: pointer;
  text-align: left;
  transition: border-color .15s, background .15s;
  width: 100%;
}

.dlib-choice__radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--vld-border, #e8e3d9);
  flex-shrink: 0;
  transition: border-color .15s, background .15s;
}

.dlib-choice__title {
  font-size: .88rem;
  font-weight: 700;
  color: var(--vld-text, #1a1714);
}

.dlib-choice__sub {
  font-size: .75rem;
  color: var(--vld-text-muted, #7a7060);
  margin-top: .1rem;
}

/* Admis active */
.dlib-choice--admis.dlib-choice--active {
  border-color: var(--vld-blue, #3b72b8);
  background: color-mix(in srgb, var(--vld-blue, #3b72b8) 6%, var(--vld-bg, #faf8f4));
}
.dlib-choice--admis.dlib-choice--active .dlib-choice__radio {
  border-color: var(--vld-blue, #3b72b8);
  background: var(--vld-blue, #3b72b8);
  box-shadow: inset 0 0 0 3px var(--vld-bg, #faf8f4);
}
.dlib-choice--admis.dlib-choice--active svg { color: var(--vld-blue, #3b72b8); }
.dlib-choice--admis.dlib-choice--active .dlib-choice__title { color: var(--vld-blue, #3b72b8); }

/* Ajourné active */
.dlib-choice--ajourne.dlib-choice--active {
  border-color: #e07b3a;
  background: color-mix(in srgb, #e07b3a 6%, var(--vld-bg, #faf8f4));
}
.dlib-choice--ajourne.dlib-choice--active .dlib-choice__radio {
  border-color: #e07b3a;
  background: #e07b3a;
  box-shadow: inset 0 0 0 3px var(--vld-bg, #faf8f4);
}
.dlib-choice--ajourne.dlib-choice--active svg { color: #e07b3a; }
.dlib-choice--ajourne.dlib-choice--active .dlib-choice__title { color: #c05c1a; }

.dlib-choice:not(.dlib-choice--active):hover {
  border-color: color-mix(in srgb, var(--vld-gold, #c9a227) 40%, transparent);
}

/* Modal footer */
.dlib-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: .75rem;
  padding: 1rem 1.4rem 1.25rem;
  border-top: 1px solid var(--vld-border, #e8e3d9);
}

.dlib-modal__cancel {
  background: none;
  border: 1.5px solid var(--vld-border, #e8e3d9);
  border-radius: 8px;
  padding: .45rem 1.1rem;
  font-size: .83rem;
  font-weight: 600;
  color: var(--vld-text-muted, #7a7060);
  cursor: pointer;
  transition: background .15s, color .15s;
}
.dlib-modal__cancel:hover {
  background: var(--vld-hover, #f5f2ed);
  color: var(--vld-text, #1a1714);
}

.dlib-modal__confirm {
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  padding: .45rem 1.2rem;
  font-size: .83rem;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: var(--vld-dark, #1a1714);
  color: #fff;
  transition: opacity .15s, transform .1s;
}
.dlib-modal__confirm:hover:not(:disabled) { opacity: .86; transform: translateY(-1px); }
.dlib-modal__confirm:disabled { opacity: .5; cursor: not-allowed; }

.dlib-modal__confirm--ajourne {
  background: #e07b3a;
}

/* Modal transition */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity .2s; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

/* stat card */
.rc-stat--deliberer {
  background: color-mix(in srgb, var(--vld-gold, #c9a227) 10%, var(--vld-surface, #fff));
  border-color: color-mix(in srgb, var(--vld-gold, #c9a227) 35%, transparent) !important;
  color: color-mix(in srgb, var(--vld-gold, #c9a227) 85%, #3a2a00);
}
.rc-stat--deliberer .rc-stat__icon { color: var(--vld-gold, #c9a227); }
</style>