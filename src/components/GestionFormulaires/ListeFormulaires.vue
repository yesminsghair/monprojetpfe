<template>
  <div><!-- fragment root: needed so <Teleport> is a sibling of .lf-root -->
  <div class="lf-root">

    <!-- ── Page header ──────────────────────────────────────── -->
    <div class="lf-page-header">
      <div>
        <h2 class="vld-page-title">Formulaires de vœux</h2>
        <p class="vld-page-sub">Gérez et suivez vos campagnes de collecte de vœux</p>
      </div>
      <button class="lf-btn-new" @click="$emit('navigate','voeux-creer')">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nouveau formulaire
      </button>
    </div>

    <!-- ── Stats strip ──────────────────────────────────────── -->
    <div class="lf-stats-row">
      <div class="lf-stat lf-stat--total">
        <div class="lf-stat__icon-wrap lf-stat__icon-wrap--total">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div>
          <div class="lf-stat__val">{{ formulaires.length }}</div>
          <div class="lf-stat__lbl">Total</div>
        </div>
      </div>
      <div class="lf-stat lf-stat--brouillon">
        <div class="lf-stat__icon-wrap lf-stat__icon-wrap--brouillon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
        <div>
          <div class="lf-stat__val">{{ formulaires.filter(f=>f.statut==='brouillon').length }}</div>
          <div class="lf-stat__lbl">Brouillons</div>
        </div>
      </div>
      <div class="lf-stat lf-stat--publie">
        <div class="lf-stat__icon-wrap lf-stat__icon-wrap--publie">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
        </div>
        <div>
          <div class="lf-stat__val lf-stat__val--publie">{{ formulaires.filter(f=>f.statut==='publie').length }}</div>
          <div class="lf-stat__lbl">Publiés</div>
        </div>
      </div>
      <div class="lf-stat lf-stat--verrouille">
        <div class="lf-stat__icon-wrap lf-stat__icon-wrap--verrouille">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <div>
          <div class="lf-stat__val lf-stat__val--verrouille">{{ formulaires.filter(f=>f.statut==='verrouille').length }}</div>
          <div class="lf-stat__lbl">Verrouillés</div>
        </div>
      </div>
    </div>

    <!-- ── Loading ──────────────────────────────────────────── -->
    <div v-if="loading" class="vld-state">
      <div class="vld-spinner mx-auto mb-3"></div>
      <p class="vld-state__sub">Chargement des formulaires…</p>
    </div>

    <!-- ── Empty ────────────────────────────────────────────── -->
    <div v-else-if="!formulaires.length" class="vld-state">
      <div class="lf-empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
      </div>
      <p class="vld-state__title">Aucun formulaire créé</p>
      <p class="vld-state__sub">Créez votre première campagne de collecte de vœux.</p>
      <button class="lf-btn-new mt-4" @click="$emit('navigate','voeux-creer')">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Créer un formulaire
      </button>
    </div>

    <!-- ── Main layout: list + drawer ─────────────────────── -->
    <div v-else class="lf-layout" :class="{'lf-layout--split': formulaireSelectionne !== null}">

      <!-- Formulaire list -->
      <div class="lf-list">
        <div v-for="f in formulaires" :key="f.id"
             class="lf-row"
             :class="[`lf-row--${f.statut||'brouillon'}`, {'lf-row--active': formulaireSelectionne===f.id}]">

          <!-- Left accent bar -->
          <div class="lf-row__bar"></div>

          <!-- Content -->
          <div class="lf-row__content">
            <div class="lf-row__top">
              <div class="lf-row__title-group">
                <span class="lf-status-pill" :class="`lf-status-pill--${f.statut||'brouillon'}`">
                  <span class="lf-status-dot"></span>
                  {{ {brouillon:'Brouillon', publie:'Publié', verrouille:'Verrouillé'}[f.statut] || f.statut }}
                </span>
                <div v-if="isExpiringSoon(f.date_limite)" class="lf-expire-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Expire bientôt
                </div>
              </div>
              <div class="lf-row__actions" @click.stop>
                <button v-if="f.statut==='brouillon'" class="lf-act-btn lf-act-btn--edit" @click="formulaireAModifier = f; modalModifier = true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Modifier
                </button>
                <button v-if="f.statut==='brouillon'" class="lf-act-btn lf-act-btn--publish" @click="modalPublier=f">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Publier
                </button>
                <button v-if="f.statut==='publie'" class="lf-act-btn lf-act-btn--lock" @click="modalVerrouiller=f">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Verrouiller
                </button>
                <button class="lf-act-btn lf-act-btn--delete" @click="modalSupprimer=f">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            </div>

            <h3 class="lf-row__name">{{ f.titre }}</h3>

            <div class="lf-row__meta">
              <div class="lf-meta-chip">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ formatDate(f.date_limite) }}
              </div>
              <div class="lf-meta-chip lf-meta-chip--responses">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <strong>{{ f.nb_reponses||0 }}</strong> réponse{{ (f.nb_reponses||0)!==1?'s':'' }}
              </div>
              <div class="lf-meta-chip">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                {{ (f.champs||[]).length }} champ{{ (f.champs||[]).length!==1?'s':'' }}
              </div>
              <div v-if="f.publie_at" class="lf-meta-chip lf-meta-chip--publie">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Publié le {{ formatDate(f.publie_at) }}
              </div>
              <div v-if="f.verrouille_at" class="lf-meta-chip lf-meta-chip--verrouille">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Verrouillé le {{ formatDate(f.verrouille_at) }}
              </div>
              <!-- Voir les réponses button -->
              <button class="lf-voir-btn" :class="{'lf-voir-btn--active': formulaireSelectionne===f.id}"
                      @click.stop="toggleReponses(f.id)">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Voir les réponses
                <span class="lf-voir-btn__count">{{ f.nb_reponses||0 }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Responses Drawer ────────────────────────────────── -->
      <Transition name="drawer-slide">
        <div v-if="formulaireSelectionne !== null" class="lf-drawer">
          <div class="lf-drawer__head">
            <div>
              <div class="lf-drawer__label">Suivi des réponses</div>
              <div class="lf-drawer__form-name">{{ formulaireActif?.titre }}</div>
            </div>
            <button class="lf-drawer__close" @click="formulaireSelectionne=null">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Drawer stats mini -->
          <div class="lf-drawer__stats">
            <div class="lf-drawer__stat">
              <span class="lf-drawer__stat-val">{{ reponses.filter(r=>r.statut_reponse==='soumis').length }}</span>
              <span class="lf-drawer__stat-lbl">Soumis</span>
            </div>
            <div class="lf-drawer__stat-divider"></div>
            <div class="lf-drawer__stat">
              <span class="lf-drawer__stat-val">{{ reponses.filter(r=>r.statut_reponse==='brouillon').length }}</span>
              <span class="lf-drawer__stat-lbl">Brouillons</span>
            </div>
            <div class="lf-drawer__stat-divider"></div>
            <div class="lf-drawer__stat">
              <span class="lf-drawer__stat-val lf-drawer__stat-val--accent">{{ reponses.length }}</span>
              <span class="lf-drawer__stat-lbl">Total</span>
            </div>
          </div>

          <!-- Réponses reçues -->
          <div class="lf-drawer__section-title">Réponses reçues</div>

          <div v-if="loadingReponses" class="lf-drawer__loading">
            <div class="vld-spinner-sm" style="width:18px;height:18px;border-width:2px;margin:0 auto 8px"></div>
            <span>Chargement…</span>
          </div>

          <div v-else-if="!reponses.length" class="lf-drawer__empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <p>Aucune réponse pour l'instant</p>
          </div>

          <div v-else class="lf-drawer__responses">
            <div v-for="r in reponses" :key="r.id" class="lf-resp-card">
              <div class="lf-resp-card__avatar">{{ initiales(r.enseignant_nom) }}</div>
              <div class="lf-resp-card__body">
                <div class="lf-resp-card__top">
                  <span class="lf-resp-card__name">{{ r.enseignant_nom }}</span>
                  <span class="lf-resp-badge" :class="`lf-resp-badge--${r.statut_reponse||'soumis'}`">
                    {{ {soumis:'Soumis', brouillon:'Brouillon'}[r.statut_reponse] || 'Soumis' }}
                  </span>
                </div>
                <div class="lf-resp-card__meta">
                  <span class="vld-dispo-badge" :class="`vld-dispo-badge--${r.disponibilite}`">
                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    {{ r.disponibilite }}
                  </span>
                  <span v-if="r.nbre_max_pfe" class="lf-resp-card__students">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    {{ r.nbre_max_pfe }} PFE
                  </span>
                </div>
                <div v-if="r.themes || r.encadrement" class="lf-resp-card__tags">
                  <span v-if="r.encadrement" class="lf-tag lf-tag--tech">{{ r.encadrement }}</span>
                  <span v-if="r.themes" class="lf-tag">{{ r.themes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ── Modals ────────────────────────────────────────────── -->
    <Transition name="modal-fade">
      <div v-if="modalPublier" class="modal-overlay" @click.self="modalPublier=null">
        <div class="lf-modal lf-modal--publish">
          <div class="lf-pub-hero">
            <div class="lf-pub-ring">
              <div class="lf-pub-ring__inner">📢</div>
            </div>
            <h3 class="lf-pub-title">Publier le formulaire</h3>
            <p class="lf-pub-sub">Cette action enverra des notifications aux enseignants</p>
            <button class="lf-pub-close" @click="modalPublier=null">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="lf-modal__body">
            <div class="lf-pub-info-card">
              <div class="lf-pub-info-card__icon">📋</div>
              <div>
                <div class="lf-pub-info-card__name">{{ modalPublier.titre }}</div>
                <div class="lf-pub-info-card__deadline">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Date limite : <strong>{{ formatDate(modalPublier.date_limite) }}</strong>
                </div>
              </div>
            </div>
            <div class="lf-pub-banner">
              <div class="lf-pub-banner__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div class="lf-pub-banner__text">
                Les enseignants de votre spécialité recevront une notification et pourront remplir leurs vœux
                jusqu'au <strong>{{ formatDate(modalPublier.date_limite) }}</strong>.
              </div>
            </div>
            <div class="lf-pub-steps">
              <div class="lf-pub-step"><div class="lf-pub-step__num">1</div><div class="lf-pub-step__text">Formulaire publié et visible par les enseignants</div></div>
              <div class="lf-pub-connector"></div>
              <div class="lf-pub-step"><div class="lf-pub-step__num">2</div><div class="lf-pub-step__text">Notification envoyée </div></div>
              <div class="lf-pub-connector"></div>
              <div class="lf-pub-step"><div class="lf-pub-step__num">3</div><div class="lf-pub-step__text">Collecte des vœux jusqu'à la date limite</div></div>
            </div>
          </div>
          <div class="lf-modal__footer">
            <button class="lf-modal-btn lf-modal-btn--cancel" @click="modalPublier=null">Annuler</button>
            <button class="lf-modal-btn lf-modal-btn--publish" @click="publier" :disabled="savingPublier">
              <span v-if="savingPublier" class="vld-spinner-sm" style="width:12px;height:12px;border-width:2px"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              {{ savingPublier ? 'Publication…' : 'Publier maintenant' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fade">
      <div v-if="modalVerrouiller" class="modal-overlay" @click.self="modalVerrouiller=null">
        <div class="lf-modal">
          <div class="lf-modal__head lf-modal__head--lock">
            <div class="lf-modal__icon">🔒</div>
            <h3 class="lf-modal__title">Verrouiller le formulaire</h3>
          </div>
          <div class="lf-modal__body">
            <p>Verrouiller <strong>{{ modalVerrouiller.titre }}</strong> ?</p>
            <div class="vld-banner vld-banner--warning" style="margin-bottom:0">
              <div class="vld-banner__icon">⚠</div>
              <div class="vld-banner__body">Plus aucune réponse ne sera acceptée après cette action.</div>
            </div>
          </div>
          <div class="lf-modal__footer">
            <button class="lf-modal-btn lf-modal-btn--cancel" @click="modalVerrouiller=null">Annuler</button>
            <button class="lf-modal-btn lf-modal-btn--lock" @click="verrouiller" :disabled="savingVerrouiller">
              <span v-if="savingVerrouiller" class="vld-spinner-sm" style="width:12px;height:12px;border-width:2px"></span>
              <template v-else>🔒 Verrouiller</template>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fade">
      <div v-if="modalSupprimer" class="modal-overlay" @click.self="modalSupprimer=null">
        <div class="lf-modal">
          <div class="lf-modal__head lf-modal__head--delete">
            <div class="lf-modal__icon">🗑</div>
            <h3 class="lf-modal__title">Supprimer le formulaire</h3>
          </div>
          <div class="lf-modal__body">
            <p>Supprimer <strong>{{ modalSupprimer.titre }}</strong> ?</p>
            <div class="vld-banner vld-banner--danger" style="margin-bottom:0">
              <div class="vld-banner__icon">⚠</div>
              <div class="vld-banner__body">Cette action est <strong>irréversible</strong>. Toutes les réponses associées seront supprimées.</div>
            </div>
          </div>
          <div class="lf-modal__footer">
            <button class="lf-modal-btn lf-modal-btn--cancel" @click="modalSupprimer=null">Annuler</button>
            <button class="lf-modal-btn lf-modal-btn--delete" @click="supprimer" :disabled="savingSupprimer">
              <span v-if="savingSupprimer" class="vld-spinner-sm" style="width:12px;height:12px;border-width:2px"></span>
              <template v-else>Supprimer définitivement</template>
            </button>
          </div>
        </div>
      </div>
    </Transition>
    <!-- ── Modifier Modal ─────────────────────────────────── -->
  <ModifierFormulaireModal
    v-model="modalModifier"
    :formulaire="formulaireAModifier"
    @saved="onModifierSaved"
  />

</div><!-- /.lf-root -->

  <!-- Teleported outside the component tree so Vue <Transition> transforms never clip it -->
  <Teleport to="body">
    <Transition name="lf-toast-fade">
      <div v-if="toast.visible" class="lf-toast" :class="'lf-toast--' + toast.type">
        <svg v-if="toast.type === 'ok'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <svg v-else-if="toast.type === 'warn'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ toast.message }}
      </div>
    </Transition>
  </Teleport>

</div><!-- /fragment root -->
</template>

<script>
import api from '@/services/api.js'
import ModifierFormulaireModal from './ModifierFormulaireModal.vue'
import { useToast, consumePendingToast } from '@/composables/useToast.js'

export default {
  name: 'ListeFormulaires',
  components: { ModifierFormulaireModal },
  emits: ['navigate'],

  setup() {
    const { toast, showToast } = useToast(3500)
    return { toast, showToast }
  },

  data() {
    return {
      formulaires: [],
      loading: false,
      modalSupprimer: null,
      modalPublier: null,
      modalVerrouiller: null,
      formulaireSelectionne: null,
      reponses: [],
      loadingReponses: false,
      savingPublier: false,
      savingVerrouiller: false,
      savingSupprimer: false,
      modalModifier: false,
      formulaireAModifier: null,
    }
  },

  computed: {
    formulaireActif() {
      return this.formulaires.find(f => f.id === this.formulaireSelectionne) || null
    }
  },

  async mounted() {
    await this.chargerFormulaires()
    this._consumePending()
  },

  // Fires when returning to this view inside a <keep-alive> (parent keeps component alive)
  async activated() {
    await this.chargerFormulaires()
    this._consumePending()
  },

  methods: {
    _consumePending() {
      const pending = consumePendingToast()
      if (pending) {
        this.$nextTick(() => this.showToast(pending.message, pending.type))
      }
    },

    async chargerFormulaires() {
      this.loading = true
      try { const r = await api.get('/formulaires-voeux'); this.formulaires = r.data||[] }
      catch(e) { console.error(e) }
      finally { this.loading = false }
    },

    formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('fr-FR') },

    isExpiringSoon(d) {
      if (!d) return false
      const diff = (new Date(d) - new Date()) / (1000*60*60*24)
      return diff <= 5 && diff >= 0
    },

    initiales(nom) {
      if (!nom) return '?'
      return nom.split(' ').map(p => p[0]).join('').toUpperCase().slice(0,2)
    },

    async toggleReponses(id) {
      if (this.formulaireSelectionne === id) { this.formulaireSelectionne = null; return }
      this.formulaireSelectionne = id
      this.loadingReponses = true
      try { const r = await api.get(`/formulaires-voeux/${id}/reponses`); this.reponses = r.data||[] }
      catch(e) { this.reponses = [] }
      finally { this.loadingReponses = false }
    },

    async publier() {
      if (this.savingPublier) return
      this.savingPublier = true
      const titre = this.modalPublier.titre
      try {
        await api.patch(`/formulaires-voeux/${this.modalPublier.id}/publier`)
        await this.chargerFormulaires()
        this.modalPublier = null
        this.showToast(`« ${titre} » publié avec succès`, 'ok')
      } catch(e) {
        console.error('publier error:', JSON.stringify(e.response?.data, null, 2))
        this.showToast(e.response?.data?.message || e.response?.data?.exception || 'Erreur lors de la publication', 'err')
      } finally { this.savingPublier = false }
    },

    async verrouiller() {
      this.savingVerrouiller = true
      const titre = this.modalVerrouiller.titre
      try {
        await api.patch(`/formulaires-voeux/${this.modalVerrouiller.id}/verrouiller`)
        await this.chargerFormulaires()
        this.modalVerrouiller = null
        this.showToast(`« ${titre} » verrouillé — aucune nouvelle réponse ne sera acceptée`, 'warn')
      } catch(e) {
        console.error(e)
        this.showToast(e.response?.data?.message || 'Erreur lors du verrouillage', 'err')
      } finally { this.savingVerrouiller = false }
    },

    async onModifierSaved(titre) {
      await this.chargerFormulaires()
      this.showToast(`« ${titre} » modifié avec succès`, 'ok')
    },

    async supprimer() {
      this.savingSupprimer = true
      const titre = this.modalSupprimer.titre
      try {
        await api.delete(`/formulaires-voeux/${this.modalSupprimer.id}`)
        await this.chargerFormulaires()
        this.modalSupprimer = null
        this.showToast(`« ${titre} » supprimé définitivement`, 'err')
      } catch(e) {
        console.error(e)
        this.showToast(e.response?.data?.message || 'Erreur lors de la suppression', 'err')
      } finally { this.savingSupprimer = false }
    },
  },
}
</script>

<style scoped>
/* ── Root ─────────────────────────────────────────────────── */
.lf-root { display: flex; flex-direction: column; gap: 24px; }

/* ── Page header ──────────────────────────────────────────── */
.lf-page-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 16px; flex-wrap: wrap;
}

/* ── New button ───────────────────────────────────────────── */
.lf-btn-new {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--vld-primary) 0%, var(--vld-primary-dark) 100%);
  color: #fff; border: none; border-radius: var(--vld-r-lg);
  font-size: 13.5px; font-weight: 700; font-family: var(--vld-font-body);
  cursor: pointer; letter-spacing: .01em;
  box-shadow: 0 4px 14px rgba(61,96,128,.30);
  transition: all var(--vld-t-base) var(--vld-ease);
}
.lf-btn-new:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(61,96,128,.38); }
.lf-btn-new:active { transform: translateY(0); }

/* ── Stats strip ──────────────────────────────────────────── */
.lf-stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
}
@media (max-width:640px) { .lf-stats-row { grid-template-columns: repeat(2,1fr); } }

.lf-stat {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px; border-radius: var(--vld-r-xl);
  border: 1.5px solid var(--vld-border);
  box-shadow: var(--vld-shadow-card);
  background: var(--vld-surface);
  transition: all var(--vld-t-base) var(--vld-ease);
}
.lf-stat:hover { transform: translateY(-2px); box-shadow: var(--vld-shadow-card-hover); }

.lf-stat__icon-wrap {
  width: 38px; height: 38px; border-radius: var(--vld-r-lg); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.lf-stat__icon-wrap--total     { background: rgba(61,96,128,.12); color: var(--vld-primary); }
.lf-stat__icon-wrap--brouillon { background: rgba(120,120,140,.12); color: var(--vld-text-muted); }
.lf-stat__icon-wrap--publie    { background: rgba(245,166,35,.14); color: var(--vld-accent); }
.lf-stat__icon-wrap--verrouille{ background: rgba(30,158,96,.12); color: var(--vld-success); }

.lf-stat__val {
  font-family: var(--vld-font-display); font-size: 24px; font-weight: 700;
  color: var(--vld-text-strong); line-height: 1; letter-spacing: -.02em;
}
.lf-stat__val--publie    { color: var(--vld-accent); }
.lf-stat__val--verrouille{ color: var(--vld-success); }
.lf-stat__lbl  { font-size: 11.5px; color: var(--vld-text-muted); font-weight: 500; margin-top: 3px; }

.lf-stat--total     { border-left: 4px solid var(--vld-primary); }
.lf-stat--brouillon { border-left: 4px solid var(--vld-border-strong); }
.lf-stat--publie    { border-left: 4px solid var(--vld-accent); }
.lf-stat--verrouille{ border-left: 4px solid var(--vld-success); }

/* ── Main layout ──────────────────────────────────────────── */
.lf-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  transition: grid-template-columns var(--vld-t-base) var(--vld-ease);
}
.lf-layout--split {
  grid-template-columns: 1fr 340px;
}
@media (max-width: 900px) {
  .lf-layout--split { grid-template-columns: 1fr; }
}

/* ── List ─────────────────────────────────────────────────── */
.lf-list { display: flex; flex-direction: column; gap: 10px; }

/* ── Row card ─────────────────────────────────────────────── */
.lf-row {
  display: flex; align-items: stretch;
  background: var(--vld-surface);
  border: 1.5px solid var(--vld-border);
  border-radius: var(--vld-r-xl);
  overflow: hidden;
  box-shadow: var(--vld-shadow-card);
  transition: all var(--vld-t-base) var(--vld-ease);
}
.lf-row:hover {
  box-shadow: var(--vld-shadow-card-hover);
  border-color: var(--vld-border-strong);
}
.lf-row--active {
  border-color: var(--vld-primary);
  box-shadow: 0 0 0 3px rgba(61,96,128,.12), var(--vld-shadow-card-hover);
}

/* Accent bar */
.lf-row__bar {
  width: 4px; flex-shrink: 0; border-radius: 0;
}
.lf-row--brouillon .lf-row__bar  { background: var(--vld-border-strong); }
.lf-row--publie    .lf-row__bar  { background: var(--vld-accent); }
.lf-row--verrouille .lf-row__bar { background: var(--vld-success); }

.lf-row__content { flex: 1; padding: 16px 18px; min-width: 0; }

.lf-row__top {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  margin-bottom: 10px; flex-wrap: wrap;
}

.lf-row__title-group { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.lf-row__name {
  font-family: var(--vld-font-display); font-size: 15.5px; font-weight: 700;
  color: var(--vld-text-strong); margin: 0 0 10px; letter-spacing: -.01em; line-height: 1.3;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* Status pill */
.lf-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: var(--vld-r-full);
  font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
}
.lf-status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.lf-status-pill--brouillon { background: var(--vld-surface-alt); color: var(--vld-text-muted); border: 1px solid var(--vld-border); }
.lf-status-pill--publie    { background: rgba(245,166,35,.14); color: var(--vld-accent); border: 1px solid rgba(245,166,35,.28); }
.lf-status-pill--verrouille{ background: rgba(30,158,96,.12); color: var(--vld-success); border: 1px solid rgba(30,158,96,.24); }

/* Expire badge */
.lf-expire-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 9px; border-radius: var(--vld-r-full);
  background: rgba(217,64,64,.12); color: var(--vld-danger);
  border: 1px solid rgba(217,64,64,.22);
  font-size: 11px; font-weight: 700;
  animation: vld-blink-warn 2s ease-in-out infinite;
}

/* Actions */
.lf-row__actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.lf-act-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px; border: 1.5px solid transparent; border-radius: var(--vld-r-md);
  font-size: 12px; font-weight: 700; font-family: var(--vld-font-body);
  cursor: pointer; letter-spacing: .01em; white-space: nowrap;
  transition: all var(--vld-t-base) var(--vld-ease);
}
.lf-act-btn--edit    { background: var(--vld-surface-alt); color: var(--vld-text-muted); border-color: var(--vld-border); }
.lf-act-btn--edit:hover { background: var(--vld-surface-raised); color: var(--vld-text); border-color: var(--vld-border-strong); }
.lf-act-btn--publish { background: rgba(245,166,35,.10); color: var(--vld-accent); border-color: rgba(245,166,35,.28); }
.lf-act-btn--publish:hover { background: var(--vld-accent); color: #fff; border-color: var(--vld-accent); }
.lf-act-btn--lock    { background: rgba(30,158,96,.10); color: var(--vld-success); border-color: rgba(30,158,96,.26); }
.lf-act-btn--lock:hover { background: var(--vld-success); color: #fff; border-color: var(--vld-success); }
.lf-act-btn--delete  { background: rgba(217,64,64,.08); color: var(--vld-danger); border-color: rgba(217,64,64,.20); padding: 5px 9px; }
.lf-act-btn--delete:hover { background: var(--vld-danger); color: #fff; border-color: var(--vld-danger); }

/* Meta row */
.lf-row__meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.lf-meta-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: var(--vld-r-full);
  background: var(--vld-surface-alt); border: 1px solid var(--vld-border);
  font-size: 12px; font-weight: 600; color: var(--vld-text-muted);
}
.lf-meta-chip--responses { background: rgba(61,96,128,.08); color: var(--vld-primary); border-color: rgba(61,96,128,.16); }
.lf-meta-chip--responses strong { color: var(--vld-primary); }
.lf-meta-chip--publie     { background: rgba(245,166,35,.10); color: #a06800; border-color: rgba(245,166,35,.28); }
.lf-meta-chip--verrouille { background: rgba(30,158,96,.10); color: #0e6b3a; border-color: rgba(30,158,96,.24); }

/* Voir les réponses button */
.lf-voir-btn {
  display: inline-flex; align-items: center; gap: 6px; margin-left: auto;
  padding: 5px 12px 5px 10px; border-radius: var(--vld-r-full);
  border: 1.5px solid var(--vld-border);
  background: var(--vld-surface-alt);
  font-size: 12px; font-weight: 700; font-family: var(--vld-font-body);
  color: var(--vld-text-muted); cursor: pointer;
  transition: all var(--vld-t-base) var(--vld-ease);
  white-space: nowrap;
}
.lf-voir-btn:hover {
  border-color: var(--vld-primary);
  background: rgba(61,96,128,.08);
  color: var(--vld-primary);
}
.lf-voir-btn--active {
  border-color: var(--vld-primary);
  background: rgba(61,96,128,.12);
  color: var(--vld-primary);
}
.lf-voir-btn__count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: var(--vld-r-full);
  background: var(--vld-primary); color: #fff;
  font-size: 10.5px; font-weight: 800; line-height: 1;
}
.lf-voir-btn:not(.lf-voir-btn--active) .lf-voir-btn__count {
  background: var(--vld-border-strong); color: var(--vld-text-muted);
}
.lf-voir-btn:hover .lf-voir-btn__count {
  background: var(--vld-primary); color: #fff;
}

/* Empty state icon */
.lf-empty-icon {
  width: 64px; height: 64px; border-radius: var(--vld-r-xl);
  background: var(--vld-surface-alt); border: 1.5px solid var(--vld-border);
  display: flex; align-items: center; justify-content: center;
  color: var(--vld-text-faint); margin: 0 auto 16px;
}

/* ── Drawer ───────────────────────────────────────────────── */
.lf-drawer {
  background: var(--vld-surface);
  border: 1.5px solid var(--vld-border);
  border-radius: var(--vld-r-xl);
  box-shadow: var(--vld-shadow-card);
  display: flex; flex-direction: column;
  height: fit-content;
  max-height: calc(100vh - 200px);
  overflow: hidden;
  position: sticky; top: 16px;
}

.lf-drawer__head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1.5px solid var(--vld-border);
  background: var(--vld-surface);
}
.lf-drawer__label {
  font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  color: var(--vld-primary); margin-bottom: 4px;
}
.lf-drawer__form-name {
  font-family: var(--vld-font-display); font-size: 14px; font-weight: 700;
  color: var(--vld-text-strong); line-height: 1.3;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 230px;
}
.lf-drawer__close {
  width: 28px; height: 28px; border-radius: var(--vld-r-sm); border: 1.5px solid var(--vld-border);
  background: var(--vld-surface-alt); color: var(--vld-text-muted);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  transition: all var(--vld-t-base);
}
.lf-drawer__close:hover { background: var(--vld-surface-raised); color: var(--vld-text); border-color: var(--vld-border-strong); }

/* Drawer mini stats */
.lf-drawer__stats {
  display: flex; align-items: center; padding: 12px 20px;
  border-bottom: 1.5px solid var(--vld-border);
  background: var(--vld-surface-alt); gap: 0;
}
.lf-drawer__stat { flex: 1; text-align: center; }
.lf-drawer__stat-val {
  display: block; font-family: var(--vld-font-display); font-size: 20px; font-weight: 700;
  color: var(--vld-text-strong); letter-spacing: -.02em; line-height: 1;
}
.lf-drawer__stat-val--accent { color: var(--vld-primary); }
.lf-drawer__stat-lbl { font-size: 10.5px; color: var(--vld-text-faint); font-weight: 600; margin-top: 3px; text-transform: uppercase; letter-spacing: .04em; }
.lf-drawer__stat-divider { width: 1px; height: 32px; background: var(--vld-border); }

.lf-drawer__section-title {
  padding: 12px 20px 8px;
  font-size: 10.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
  color: var(--vld-text-faint);
}

.lf-drawer__loading {
  padding: 32px 20px; text-align: center;
  font-size: 13px; color: var(--vld-text-muted);
}
.lf-drawer__empty {
  padding: 36px 20px; text-align: center;
  color: var(--vld-text-faint); display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.lf-drawer__empty p { font-size: 13px; font-style: italic; margin: 0; }

.lf-drawer__responses {
  flex: 1; overflow-y: auto; padding: 0 14px 14px;
  display: flex; flex-direction: column; gap: 8px;
}

/* Response card */
.lf-resp-card {
  display: flex; align-items: flex-start; gap: 11px;
  padding: 12px 14px; border-radius: var(--vld-r-lg);
  background: var(--vld-surface-alt); border: 1.5px solid var(--vld-border);
  transition: all var(--vld-t-base) var(--vld-ease);
  animation: fadeUpCard .2s var(--vld-ease);
}
.lf-resp-card:hover { border-color: var(--vld-border-strong); background: var(--vld-surface-raised); }

.lf-resp-card__avatar {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--vld-primary), var(--vld-primary-dark));
  color: #fff; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--vld-font-display); letter-spacing: .02em;
}

.lf-resp-card__body { flex: 1; min-width: 0; }
.lf-resp-card__top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.lf-resp-card__name { font-size: 13.5px; font-weight: 700; color: var(--vld-text-strong); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Response badge */
.lf-resp-badge {
  display: inline-flex; align-items: center; padding: 2px 9px;
  border-radius: var(--vld-r-full); font-size: 10.5px; font-weight: 700; flex-shrink: 0;
  letter-spacing: .03em; text-transform: uppercase;
}
.lf-resp-badge--soumis   { background: rgba(61,96,128,.12); color: var(--vld-primary); }
.lf-resp-badge--brouillon{ background: var(--vld-surface-alt); color: var(--vld-text-muted); border: 1px solid var(--vld-border); }

.lf-resp-card__meta { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-bottom: 5px; }
.lf-resp-card__students {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11.5px; color: var(--vld-text-muted); font-weight: 600;
}
.lf-resp-card__tags { display: flex; gap: 5px; flex-wrap: wrap; }

.lf-tag {
  display: inline-block; padding: 2px 9px; border-radius: var(--vld-r-full);
  font-size: 11px; font-weight: 600;
  background: var(--vld-surface); border: 1px solid var(--vld-border);
  color: var(--vld-text-muted);
}
.lf-tag--tech { background: rgba(61,96,128,.08); color: var(--vld-primary); border-color: rgba(61,96,128,.18); }

/* ── Drawer slide transition ──────────────────────────────── */
.drawer-slide-enter-active { transition: all .28s var(--vld-ease); }
.drawer-slide-leave-active { transition: all .22s var(--vld-ease); }
.drawer-slide-enter-from   { opacity: 0; transform: translateX(24px); }
.drawer-slide-leave-to     { opacity: 0; transform: translateX(16px); }

/* ── Modal ────────────────────────────────────────────────── */
.lf-modal {
  width: 100%; max-width: 420px; border-radius: var(--vld-r-2xl);
  background: var(--vld-surface); box-shadow: var(--vld-shadow-modal); overflow: hidden;
}
.lf-modal__head {
  padding: 24px 24px 20px; display: flex; flex-direction: column; align-items: center; gap: 10px;
  text-align: center;
}
.lf-modal__head--publish  { background: linear-gradient(135deg, #5a3a08, #3d2605); }
.lf-modal__head--lock     { background: linear-gradient(135deg, #0d4a2c, #063520); }
.lf-modal__head--delete   { background: linear-gradient(135deg, #5c1010, #3d0a0a); }
.lf-modal__icon  { font-size: 36px; line-height: 1; }
.lf-modal__title { font-family: var(--vld-font-display); font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
.lf-modal__body  { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; font-size: 14px; color: var(--vld-text); }
.lf-modal__footer{ display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--vld-border); background: var(--vld-surface-alt); }
.lf-modal-btn { padding: 9px 20px; border-radius: var(--vld-r-md); border: none; font-size: 13px; font-weight: 700; font-family: var(--vld-font-body); cursor: pointer; transition: all var(--vld-t-base) var(--vld-ease); display: inline-flex; align-items: center; gap: 7px; }
.lf-modal-btn:disabled { opacity: .6; cursor: not-allowed; }
.lf-modal-btn--cancel  { background: var(--vld-surface-raised); border: 1.5px solid var(--vld-border); color: var(--vld-text-muted); }
.lf-modal-btn--cancel:hover:not(:disabled) { border-color: var(--vld-border-strong); color: var(--vld-text); }
.lf-modal-btn--publish { background: var(--vld-accent); color: #fff; box-shadow: 0 3px 10px rgba(245,166,35,.30); }
.lf-modal-btn--publish:hover:not(:disabled) { background: var(--vld-accent-dark); transform: translateY(-1px); }
.lf-modal-btn--lock    { background: var(--vld-success); color: #fff; box-shadow: 0 3px 10px rgba(30,158,96,.28); }
.lf-modal-btn--lock:hover:not(:disabled) { background: #187a4c; transform: translateY(-1px); }
.lf-modal-btn--delete  { background: var(--vld-danger); color: #fff; box-shadow: 0 3px 10px rgba(217,64,64,.28); }
.lf-modal-btn--delete:hover:not(:disabled) { background: #b43030; transform: translateY(-1px); }

/* ── Publish modal hero ───────────────────────────────────── */
.lf-modal--publish { max-width: 460px; }
.lf-pub-hero {
  position: relative; text-align: center; padding: 30px 28px 22px;
  background: linear-gradient(135deg, #5a3a08 0%, #3d2605 60%, #2a1a00 100%); overflow: hidden;
}
.lf-pub-hero::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(245,197,24,.15) 0%, transparent 65%); pointer-events: none;
}
.lf-pub-ring {
  width: 68px; height: 68px; border-radius: 50%;
  background: rgba(245,166,35,.18); border: 2px solid rgba(245,166,35,.28);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 14px; animation: lf-ring-pulse 2.5s ease-in-out infinite; position: relative;
}
@keyframes lf-ring-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(245,166,35,.25); }
  50%      { box-shadow: 0 0 0 12px rgba(245,166,35,0); }
}
.lf-pub-ring__inner { font-size: 30px; position: relative; }
.lf-pub-title { font-family: var(--vld-font-display); font-size: 19px; font-weight: 700; color: #fff; margin: 0 0 7px; position: relative; }
.lf-pub-sub { font-size: 12.5px; color: rgba(255,255,255,.55); margin: 0; position: relative; }
.lf-pub-close {
  position: absolute; top: 12px; right: 12px; width: 26px; height: 26px;
  border-radius: var(--vld-r-sm); border: none;
  background: rgba(255,255,255,.14); color: rgba(255,255,255,.7);
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all var(--vld-t-base);
}
.lf-pub-close:hover { background: rgba(255,255,255,.26); color: #fff; }
.lf-pub-info-card { display: flex; align-items: center; gap: 12px; padding: 13px 15px; border-radius: var(--vld-r-xl); background: var(--vld-surface-alt); border: 1.5px solid var(--vld-border); }
.lf-pub-info-card__icon { font-size: 22px; flex-shrink: 0; }
.lf-pub-info-card__name { font-size: 13.5px; font-weight: 700; color: var(--vld-text-strong); margin-bottom: 4px; }
.lf-pub-info-card__deadline { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--vld-text-muted); }
.lf-pub-banner { display: flex; align-items: flex-start; gap: 11px; padding: 12px 15px; border-radius: var(--vld-r-lg); background: rgba(61,96,128,.10); border: 1.5px solid rgba(61,96,128,.18); }
.lf-pub-banner__icon { width: 26px; height: 26px; border-radius: var(--vld-r-sm); flex-shrink: 0; background: rgba(61,96,128,.18); color: var(--vld-primary); display: flex; align-items: center; justify-content: center; }
.lf-pub-banner__text { font-size: 12.5px; color: var(--vld-text); line-height: 1.55; }
.lf-pub-steps { display: flex; flex-direction: column; }
.lf-pub-step  { display: flex; align-items: center; gap: 11px; padding: 8px 0; }
.lf-pub-step__num { width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, var(--vld-accent), var(--vld-accent-dark)); color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(245,166,35,.28); }
.lf-pub-step__text  { font-size: 13px; color: var(--vld-text); font-weight: 500; }
.lf-pub-connector   { width: 2px; height: 14px; background: var(--vld-border); margin-left: 11px; border-radius: var(--vld-r-full); }

@keyframes fadeUpCard { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

/* ── Modal fade transition ────────────────────────────────── */
.modal-fade-enter-active { transition: opacity .2s ease; }
.modal-fade-leave-active { transition: opacity .15s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>

<!-- Global: teleported toast lands on <body> so scoped styles can't reach it -->
<style>
.lf-toast {
  position: fixed; top: 22px; right: 22px;
  padding: 12px 20px; border-radius: 10px;
  font-size: 13.5px; font-family: 'Sora', sans-serif; font-weight: 500;
  box-shadow: 0 8px 28px rgba(0,0,0,.22); z-index: 99999;
  display: flex; align-items: center; gap: 9px; pointer-events: none;
  max-width: 380px;
}
.lf-toast--ok   { background: #3d6080; color: #fff; }
.lf-toast--warn { background: #c9a100; color: #fff; }
.lf-toast--err  { background: #d94040; color: #fff; }
.lf-toast-fade-enter-active, .lf-toast-fade-leave-active { transition: all .3s ease; }
.lf-toast-fade-enter-from, .lf-toast-fade-leave-to { opacity: 0; transform: translateY(-8px); }
</style>