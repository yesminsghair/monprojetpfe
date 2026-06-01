<template>
  <div class="vld-grille-root">

    <!-- ══ MAIN WIDGET CARD ══ -->
    <div class="vld-grille-card">

      <!-- Widget header -->
      <div class="vld-grille-card__head">
        <div class="vld-grille-card__head-left">
          <div class="vld-grille-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div>
            <div class="vld-grille-card__title">Grille d'évaluation PFE</div>
            <div class="vld-grille-card__sub">Définissez les catégories et critères — le total doit faire exactement 20 pts</div>
          </div>
        </div>
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <span class="vld-total-badge" :class="totalOk ? 'vld-total-badge--ok' : 'vld-total-badge--warn'">
            {{ totalNotes }} / 20 pts {{ totalOk ? '✓' : '⚠' }}
          </span>
          <button v-if="!verrouille && !publie && !actif && !ferme" class="btn btn-gold d-flex align-items-center gap-2" @click="openCat" :disabled="anyModalOpen || totalNotes >= 20">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Catégorie
          </button>
          <template v-if="!verrouille && !publie && !actif && !ferme && categories.length">
            <button class="btn btn-vis d-flex align-items-center gap-2" @click="showVisibiliteM=true" :disabled="anyModalOpen" style="font-size:13px">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Visibilité
            </button>
            <button class="btn btn-gold d-flex align-items-center gap-2" @click="publier" :disabled="!totalOk || publishing">
              <span v-if="publishing" class="vld-spinner-sm"></span><svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Soumettre au directeur
            </button>
          </template>
          <!-- After directeur validates (verrouille) → chef publishes the grille -->
          <button v-if="verrouille && !actif && !ferme" class="btn btn-publish-green d-flex align-items-center gap-2" @click="activerGrille" :disabled="publishingGrille">
            <span v-if="publishingGrille" class="vld-spinner-sm"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Publier la grille
          </button>
          <!-- After chef publishes (actif) → chef can lock permanently -->
          <button v-if="actif && !ferme" class="btn btn-lock-navy d-flex align-items-center gap-2" @click="showVerrouillerM=true" :disabled="lockingGrille">
            <span v-if="lockingGrille" class="vld-spinner-sm"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Verrouiller
          </button>
        </div>
      </div>

      <!-- Widget body -->
      <div class="vld-grille-card__body">

        <!-- Toast -->
        <Transition name="toast">
          <div v-if="toast.show" class="vld-toast-wrap">
            <div class="alert d-flex align-items-center gap-2 shadow-sm py-3 px-4 mb-0" :class="toast.type==='ok' ? 'alert-success' : 'alert-danger'">
              {{ toast.msg }}
              <button class="btn-close ms-auto" @click="toast.show=false"></button>
            </div>
          </div>
        </Transition>

        <!-- Status banners -->
        <!-- Fermée (locked permanently) -->
        <div v-if="ferme" class="vld-banner vld-banner--locked mb-4">
          <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
          <div class="vld-banner__body">
            <div class="vld-banner__title">Grille verrouillée définitivement</div>
            <div class="vld-banner__sub">Cette grille est verrouillée et n'est plus accessible aux {{ visibilite === 'jury_only' ? 'jurys' : 'encadrants et jurys' }}. Cliquez sur <strong>Réinitialiser</strong> ci-dessous pour la remettre en brouillon et la modifier.</div>
          </div>
          <span class="badge bg-secondary">Verrouillée</span>
        </div>
        <!-- Active (published by chef, accessible to jury/encadrants) -->
        <div v-else-if="actif" class="vld-banner vld-banner--active mb-4">
          <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>
          <div class="vld-banner__body">
            <div class="vld-banner__title">Grille publiée — accessible aux {{ visibilite === 'jury_only' ? 'jurys uniquement' : 'encadrants et jurys' }}</div>
            <div class="vld-banner__sub">Cliquez sur Verrouiller pour la rendre définitive et empêcher toute modification.</div>
          </div>
          <span class="badge bg-success">Publiée</span>
        </div>
        <!-- Validated by directeur, waiting for chef to publish -->
        <div v-else-if="verrouille" class="vld-banner vld-banner--success mb-4">
          <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div class="vld-banner__body">
            <div class="vld-banner__title">Grille validée par le directeur — prête à être publiée</div>
            <div class="vld-banner__sub">Cliquez sur Publier la grille pour la rendre accessible aux {{ visibilite === 'jury_only' ? 'jurys uniquement' : 'encadrants et jurys' }}.</div>
          </div>
          <span class="badge bg-success">✓ Validée</span>
        </div>
        <div v-else-if="publie" class="vld-banner vld-banner--warning mb-4">
          <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          <div class="vld-banner__body">
            <div class="vld-banner__title">Grille en attente de validation du directeur</div>
            <div class="vld-banner__sub">Vous ne pouvez plus modifier les catégories ni les critères.</div>
          </div>
          <span class="badge bg-warning text-dark">En attente</span>
        </div>
        <div v-else class="vld-banner vld-banner--info mb-4">
          <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
          <div>Grille en cours de rédaction. Total actuel : <strong>{{ totalNotes }}/20 pts</strong>. Toutes les catégories doivent totaliser exactement 20 pts avant soumission.</div>
        </div>

        <!-- Empty state -->
        <div v-if="!categories.length" class="vld-state">
          <div class="vld-state__icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
          <p class="vld-state__title">Aucune catégorie définie</p>
          <p class="vld-state__sub">Commencez par ajouter des catégories (ex: Rapport, Soutenance, Travail technique)</p>
          <button class="btn btn-primary mt-3" @click="openCat" v-if="!verrouille && !publie" :disabled="anyModalOpen">Ajouter une catégorie</button>
        </div>

        <!-- Categories -->
        <div v-else class="d-flex flex-column gap-3 mb-4">
          <div v-for="cat in categories" :key="cat.id" class="vld-cat-card">
            <div class="vld-cat-card__head">
              <div class="cat-accent-bar" :style="{ background: cat.color }"></div>
              <div class="flex-grow-1">
                <div class="fw-bold" style="font-size:15px;color:#fff">{{ cat.nom }}</div>
                <div style="font-size:12.5px;color:rgba(255,255,255,.6)">{{ cat.criteres.length }} critère(s) · {{ catSum(cat) }} / {{ cat.max }} pts</div>
              </div>
              <span class="vld-cat-badge" :style="{ background: cat.color + '30', color: '#fff', border: '1.5px solid ' + cat.color + '80' }">
                {{ cat.max }} pts max
              </span>
              <div class="d-flex gap-2" v-if="!verrouille && !publie">
                <button class="btn btn-sm vld-cat-add-btn d-flex align-items-center gap-1" @click="openCr(cat)" :disabled="anyModalOpen">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Critère
                </button>
                <button class="vld-icon-btn vld-icon-btn--edit-light" @click="editCat(cat)" :disabled="anyModalOpen">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="vld-icon-btn vld-icon-btn--del-light" @click="delCat(cat)" :disabled="anyModalOpen || deletingCatId === cat.id">
                  <span v-if="deletingCatId === cat.id" class="vld-spinner-sm" style="width:11px;height:11px"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            </div>
            <div class="vld-cat-card__body">
              <div v-if="!cat.criteres.length" class="p-3 text-center" style="font-size:13px;color:var(--vld-text-muted);font-style:italic">
                Aucun critère — cliquez sur Critère pour en ajouter
              </div>
              <div v-else>
                <div v-for="(cr, i) in cat.criteres" :key="cr.id"
                  class="vld-cr-row d-flex align-items-center gap-3 px-4 py-3"
                  :style="{ borderBottom: i < cat.criteres.length-1 ? '1px solid var(--vld-border)' : 'none' }">
                  <div class="flex-grow-1">
                    <div style="font-size:13.5px;font-weight:600;color:var(--vld-text-strong)">{{ cr.nom }}</div>
                    <div class="progress mt-1" style="height:4px;max-width:180px">
                      <div class="progress-bar" :style="{ width: (cat.max ? cr.note/cat.max*100 : 0)+'%', background: cat.color }"></div>
                    </div>
                  </div>
                  <span class="fw-bold" :style="{ color: cat.color }">{{ cr.note }} pt</span>
                  <div class="d-flex gap-1" v-if="!verrouille && !publie">
                    <button class="vld-icon-btn vld-icon-btn--edit" @click="editCr(cat, cr)" :disabled="anyModalOpen">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="vld-icon-btn vld-icon-btn--del" @click="delCr(cat, cr)" :disabled="anyModalOpen || deletingCrId === cr.id">
                      <span v-if="deletingCrId === cr.id" class="vld-spinner-sm" style="width:10px;height:10px"></span>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recap table -->
        <div v-if="categories.length" class="vld-recap-card">
          <div class="vld-recap-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity:.75"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Récapitulatif
          </div>
          <div class="table-responsive">
            <table class="table mb-0">
              <thead class="vld-recap-thead">
                <tr><th>Catégorie</th><th>Critères</th><th>Max</th></tr>
              </thead>
              <tbody>
                <tr v-for="c in categories" :key="c.id" class="vld-recap-row">
                  <td><span class="fw-semibold" :style="{ color: c.color }">{{ c.nom }}</span></td>
                  <td class="vld-recap-criteres">{{ c.criteres.map(cr=>cr.nom).join(', ') || '—' }}</td>
                  <td><span class="fw-bold" :style="{ color: c.color }">{{ c.max }} pts</span></td>
                </tr>
                <tr class="vld-total-row">
                  <td colspan="2" class="vld-total-label">TOTAL</td>
                  <td>
                    <div class="vld-score-widget" :class="totalOk ? 'vld-score-widget--ok' : 'vld-score-widget--warn'">
                      <svg v-if="totalOk" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <span class="vld-score-widget__text">{{ totalNotes }}/20</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div><!-- /vld-grille-card__body -->

      <!-- Réinitialiser button — visible on en_attente, valide, publie only (not on ferme/verrouille) -->
      <div v-if="publie || verrouille || actif || ferme" class="vld-reinit-bar">
        <button class="btn-reinit-solid" @click="showReinitM=true" :disabled="reinitialising">
          <span v-if="reinitialising" class="vld-spinner-sm"></span>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
          Réinitialiser
        </button>
      </div>

    </div><!-- /vld-grille-card -->

  <!-- ══════════════════════════════════════
       MODAL CATÉGORIE — dynamic category color
       ══════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="rm-modal">
      <div v-if="showCatM" class="rm-overlay" @click.self="showCatM=false">
        <div class="rm-modal" :style="catModalStyle">

          <div class="rm-modal__head" :style="catModalHeadStyle">
            <div class="rm-modal__head-left">
              <div class="rm-modal__icon">
                <svg v-if="editingCat" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div>
                <div class="rm-modal__title">{{ editingCat ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}</div>
                <div class="rm-modal__sub">{{ editingCat ? editingCat.nom : 'Définissez le nom, le barème et la couleur' }}</div>
              </div>
            </div>
            <button class="rm-modal__close" @click="showCatM=false">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="rm-modal__body" :style="catModalBodyStyle">
            <div class="rm-field">
              <label class="rm-field__label">Nom <span style="color:#c0392b">*</span></label>
              <input v-model="catF.nom" class="rm-field__input" :style="catInputFocusStyle" placeholder="Ex: Rapport technique, Soutenance..." />
            </div>
            <div class="rm-fields-grid">
              <div class="rm-field">
                <label class="rm-field__label">Barème max <span class="rm-optional">(pts)</span></label>
                <input type="number" v-model.number="catF.max" min="0.5" max="20" step="0.5" class="rm-field__input" :style="catInputFocusStyle" />
                <div class="rm-field__hint">Disponible : {{ Math.max(0, 20 - totalSansCat - (catF.max || 0)).toFixed(1) }} pts restants</div>
              </div>
              <div class="rm-field">
                <label class="rm-field__label">Couleur</label>
                <div class="rm-color-row">
                  <button v-for="c in colors" :key="c.value"
                    class="color-swatch"
                    :style="{ background: c.value, outline: catF.color===c.value ? '3px solid ' + c.value : 'none', outlineOffset: '2px' }"
                    :title="c.label"
                    @click="catF.color=c.value">
                    <svg v-if="catF.color===c.value" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="rm-modal__foot" :style="catModalFootStyle">
            <button class="rm-btn rm-btn--ghost" @click="showCatM=false">Annuler</button>
            <button class="rm-btn" :style="catModalSaveBtnStyle" @click="saveCat" :disabled="savingCat">
              <div v-if="savingCat" class="rm-spinner"></div>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {{ editingCat ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══════════════════════════════════════
       MODAL CRITÈRE — dynamic category color
       ══════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="rm-modal">
      <div v-if="showCrM" class="rm-overlay" @click.self="showCrM=false">
        <div class="rm-modal" :style="crModalStyle">

          <div class="rm-modal__head" :style="crModalHeadStyle">
            <div class="rm-modal__head-left">
              <div class="rm-modal__icon">
                <svg v-if="editingCr" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div>
                <div class="rm-modal__title">{{ editingCr ? 'Modifier le critère' : 'Nouveau critère' }}</div>
                <div class="rm-modal__sub" style="color:rgba(255,255,255,.7)">{{ currentCat?.nom }}</div>
              </div>
            </div>
            <button class="rm-modal__close" @click="showCrM=false">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="rm-modal__body" :style="crModalBodyStyle">
            <div class="rm-field">
              <label class="rm-field__label">Nom du critère <span style="color:#c0392b">*</span></label>
              <input v-model="crF.nom" class="rm-field__input" :style="crInputFocusStyle" placeholder="Ex: Qualité de la rédaction..." />
            </div>
            <div class="rm-field">
              <label class="rm-field__label">Barème <span class="rm-optional">(pts)</span></label>
              <input type="number" v-model.number="crF.note" min="0.25" step="0.25" class="rm-field__input" :class="crOverBudget ? 'rm-field__input--error' : ''" :style="crInputFocusStyle" />
              <div class="rm-field__hint" :class="{
                'rm-hint--error': crHintState.type === 'error',
                'rm-hint--ok':    crHintState.type === 'ok',
                'rm-hint--full':  crHintState.type === 'full',
              }">{{ crHintState.msg }}</div>
            </div>
          </div>

          <div class="rm-modal__foot" :style="crModalFootStyle">
            <button class="rm-btn rm-btn--ghost" @click="showCrM=false">Annuler</button>
            <button class="rm-btn" :style="crModalSaveBtnStyle" @click="saveCr" :disabled="savingCr || crOverBudget">
              <div v-if="savingCr" class="rm-spinner"></div>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {{ editingCr ? 'Enregistrer' : 'Ajouter' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══════════════════════════════════════
       MODAL SUPPRIMER CATÉGORIE — category color
       ══════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="rm-modal">
      <div v-if="showDelCatM" class="rm-overlay" @click.self="showDelCatM=false">
        <div class="rm-modal" :style="delCatModalStyle">

          <div class="rm-modal__head" :style="delCatModalHeadStyle">
            <div class="rm-modal__head-left">
              <div class="rm-modal__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </div>
              <div>
                <div class="rm-modal__title">Supprimer la catégorie</div>
                <div class="rm-modal__sub" style="color:rgba(255,255,255,.7)">{{ deletingCatTarget?.nom }}</div>
              </div>
            </div>
            <button class="rm-modal__close" @click="showDelCatM=false">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="rm-modal__body" :style="delCatModalBodyStyle">
            <div class="rm-del-warning">
              <div class="rm-del-warning__icon" :style="{ color: deletingCatTarget?.color || '#c0392b' }">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p class="rm-del-warning__text">
                Vous êtes sur le point de supprimer la catégorie <strong>« {{ deletingCatTarget?.nom }} »</strong> ainsi que tous ses <strong>{{ deletingCatTarget?.criteres?.length || 0 }} critère(s)</strong>. Cette action est irréversible.
              </p>
            </div>
          </div>

          <div class="rm-modal__foot" :style="delCatModalFootStyle">
            <button class="rm-btn rm-btn--ghost" @click="showDelCatM=false">Annuler</button>
            <button class="rm-btn" :style="delCatConfirmBtnStyle" @click="confirmDelCat" :disabled="deletingCatId === deletingCatTarget?.id">
              <span v-if="deletingCatId === deletingCatTarget?.id" class="rm-spinner"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
              Supprimer
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══════════════════════════════════════
       MODAL SUPPRIMER CRITÈRE — category color
       ══════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="rm-modal">
      <div v-if="showDelCrM" class="rm-overlay" @click.self="showDelCrM=false">
        <div class="rm-modal" :style="delCrModalStyle">

          <div class="rm-modal__head" :style="delCrModalHeadStyle">
            <div class="rm-modal__head-left">
              <div class="rm-modal__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </div>
              <div>
                <div class="rm-modal__title">Supprimer le critère</div>
                <div class="rm-modal__sub" style="color:rgba(255,255,255,.7)">{{ deletingCrTarget?.cat?.nom }}</div>
              </div>
            </div>
            <button class="rm-modal__close" @click="showDelCrM=false">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="rm-modal__body" :style="delCrModalBodyStyle">
            <div class="rm-del-warning">
              <div class="rm-del-warning__icon" :style="{ color: deletingCrTarget?.cat?.color || '#c0392b' }">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p class="rm-del-warning__text">
                Vous êtes sur le point de supprimer le critère <strong>« {{ deletingCrTarget?.cr?.nom }} »</strong> de la catégorie <strong>{{ deletingCrTarget?.cat?.nom }}</strong>. Cette action est irréversible.
              </p>
            </div>
          </div>

          <div class="rm-modal__foot" :style="delCrModalFootStyle">
            <button class="rm-btn rm-btn--ghost" @click="showDelCrM=false">Annuler</button>
            <button class="rm-btn" :style="delCrConfirmBtnStyle" @click="confirmDelCr" :disabled="deletingCrId === deletingCrTarget?.cr?.id">
              <span v-if="deletingCrId === deletingCrTarget?.cr?.id" class="rm-spinner"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
              Supprimer
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══════════════════════════════════════
       MODAL SOUMETTRE AU DIRECTEUR
       ══════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="rm-modal">
      <div v-if="showPublierM" class="rm-overlay" @click.self="showPublierM=false">
        <div class="rm-modal rm-modal--gold">

          <div class="rm-modal__head rm-modal__head--gold">
            <div class="rm-modal__head-left">
              <div class="rm-modal__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </div>
              <div>
                <div class="rm-modal__title">Soumettre la grille</div>
                <div class="rm-modal__sub" style="color:rgba(255,255,255,.7)">En attente de validation du directeur</div>
              </div>
            </div>
            <button class="rm-modal__close" @click="showPublierM=false">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="rm-modal__body rm-modal__body--gold">
            <div class="rm-del-warning">
              <div class="rm-del-warning__icon" style="color:#d98e1a">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p class="rm-del-warning__text">
                Une fois soumise, vous <strong>ne pourrez plus modifier</strong> les catégories ni les critères. Le directeur recevra une notification pour valider votre grille.
              </p>
            </div>
          </div>

          <div class="rm-modal__foot rm-modal__foot--gold">
            <button class="rm-btn rm-btn--ghost" @click="showPublierM=false">Annuler</button>
            <button class="rm-btn btn-gold" @click="confirmPublier" :disabled="publishing" style="border-color:transparent">
              <span v-if="publishing" class="rm-spinner"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Soumettre au directeur
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══════════════════════════════════════
       MODAL VISIBILITÉ
       ══════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="rm-modal">
      <div v-if="showVisibiliteM" class="rm-overlay" @click.self="showVisibiliteM=false">
        <div class="rm-modal rm-modal--vis">

          <div class="rm-modal__head rm-modal__head--vis">
            <div class="rm-modal__head-left">
              <div class="rm-modal__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div>
                <div class="rm-modal__title">Accès à la grille</div>
                <div class="rm-modal__sub">Définissez qui peut évaluer et qui peut consulter</div>
              </div>
            </div>
            <button class="rm-modal__close" @click="showVisibiliteM=false">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="rm-modal__body rm-vis-body">

            <!-- Option 1 : Jurys évaluent, encadrants consultent la grille complète -->
            <button
              class="rm-vis-option"
              :class="{ 'rm-vis-option--active': visibilite === 'encadrant_jury' }"
              @click="visibilite = 'encadrant_jury'">
              <div class="rm-vis-option__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div class="rm-vis-option__body">
                <div class="rm-vis-option__title">Grille complète visible par tous</div>
                <div class="rm-vis-option__perms">
                  <div class="rm-vis-perm rm-vis-perm--jury">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span><strong>Jurys</strong> — accèdent à la grille complète, évaluent les étudiants et publient leurs notes</span>
                  </div>
                  <div class="rm-vis-perm rm-vis-perm--encadrant">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span><strong>Encadrants</strong> — consultent la grille entière (catégories, critères et barèmes) en lecture seule</span>
                  </div>
                </div>
              </div>
              <div class="rm-vis-option__check">
                <svg v-if="visibilite === 'encadrant_jury'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </button>

            <!-- Option 2 : Jurys évaluent, encadrants voient seulement les notes finales -->
            <button
              class="rm-vis-option"
              :class="{ 'rm-vis-option--active': visibilite === 'jury_only' }"
              @click="visibilite = 'jury_only'">
              <div class="rm-vis-option__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div class="rm-vis-option__body">
                <div class="rm-vis-option__title">Grille restreinte pour les encadrants</div>
                <div class="rm-vis-option__perms">
                  <div class="rm-vis-perm rm-vis-perm--jury">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span><strong>Jurys</strong> — accèdent à la grille complète, évaluent les étudiants et publient leurs notes</span>
                  </div>
                  <div class="rm-vis-perm rm-vis-perm--encadrant rm-vis-perm--restricted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    <span><strong>Encadrants</strong> — voient uniquement les <em>notes finales</em> de leurs étudiants, sans accès aux critères ni au détail de la grille</span>
                  </div>
                </div>
              </div>
              <div class="rm-vis-option__check">
                <svg v-if="visibilite === 'jury_only'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </button>

          </div>

          <div class="rm-modal__foot rm-modal__foot--vis">
            <button class="rm-btn rm-btn--ghost" @click="showVisibiliteM=false">Annuler</button>
            <button class="rm-btn rm-btn--vis-confirm" @click="showVisibiliteM=false">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Confirmer
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══ MODAL: Verrouiller confirmation ══ -->
  <Teleport to="body">
    <Transition name="rm-fade">
      <div v-if="showVerrouillerM" class="rm-overlay" @click.self="showVerrouillerM=false">
        <div class="rm-modal rm-modal--danger" role="dialog">
          <div class="rm-modal__head">
            <div class="rm-modal__head-icon rm-modal__head-icon--danger">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div class="rm-modal__head-text">
              <div class="rm-modal__title">Verrouiller la grille ?</div>
              <div class="rm-modal__sub">La grille sera fermée aux jurys et encadrants</div>
            </div>
            <button class="rm-modal__close" @click="showVerrouillerM=false">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="rm-modal__body">
            <div class="rm-confirm-warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>La grille sera <strong>fermée</strong> et ne sera plus accessible aux {{ visibilite === 'jury_only' ? 'jurys' : 'encadrants et jurys' }}. Vous pourrez la rouvrir à tout moment en cliquant sur <strong>Réinitialiser</strong>.</span>
            </div>
          </div>
          <div class="rm-modal__foot">
            <button class="rm-btn rm-btn--ghost" @click="showVerrouillerM=false">Annuler</button>
            <button class="rm-btn rm-btn--danger-confirm" @click="confirmerVerrouiller" :disabled="lockingGrille">
              <span v-if="lockingGrille" class="vld-spinner-sm"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Verrouiller
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══ MODAL: Réinitialiser confirmation ══ -->
  <Teleport to="body">
    <Transition name="rm-fade">
      <div v-if="showReinitM" class="rm-overlay" @click.self="showReinitM=false">
        <div class="rm-modal rm-modal--danger" role="dialog">
          <div class="rm-modal__head">
            <div class="rm-modal__head-icon rm-modal__head-icon--danger">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
            </div>
            <div class="rm-modal__head-text">
              <div class="rm-modal__title">Réinitialiser la grille ?</div>
              <div class="rm-modal__sub">La grille reviendra en brouillon</div>
            </div>
            <button class="rm-modal__close" @click="showReinitM=false">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="rm-modal__body">
            <div class="rm-confirm-warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>La grille sera remise en <strong>brouillon</strong> et <strong>retirée de l'accès des jurys et encadrants</strong> immédiatement. Vous pourrez à nouveau la modifier et la resoumettre au directeur pour validation. Tout historique de validation et de publication sera effacé.</span>
            </div>
          </div>
          <div class="rm-modal__foot">
            <button class="rm-btn rm-btn--ghost" @click="showReinitM=false">Annuler</button>
            <button class="rm-btn rm-btn--danger-confirm" @click="confirmerReinit" :disabled="reinitialising">
              <span v-if="reinitialising" class="vld-spinner-sm"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  </div><!-- /vld-grille-root -->
</template>

<script>
import api from '@/services/api.js'
const COLORS = [
  { value:'#e74c3c', label:'Rouge'       },
  { value:'#e67e22', label:'Orange'      },
  { value:'#f1c40f', label:'Jaune'       },
  { value:'#2ecc71', label:'Vert'        },
  { value:'#1abc9c', label:'Turquoise'   },
  { value:'#3498db', label:'Bleu'        },
  { value:'#9b59b6', label:'Violet'      },
  { value:'#e91e8c', label:'Rose'        },
  { value:'#795548', label:'Marron'      },
  { value:'#607d8b', label:'Gris bleuté' },
]
export default {
  name: 'GestionGrille',
  emits: ['toast'],
  data () {
    return {
      publie:false, verrouille:false, actif:false, ferme:false, publishingGrille:false, lockingGrille:false, showCatM:false, showCrM:false,
      showDelCatM:false, showDelCrM:false, showPublierM:false, showVisibiliteM:false, showVerrouillerM:false, showReinitM:false,
      deletingCatTarget:null, deletingCrTarget:null,
      editingCat:null, editingCr:null, currentCat:null, savingCat:false, savingCr:false, deletingCatId:null, deletingCrId:null, publishing:false, reinitialising:false,
      toast:{ show:false, msg:'', type:'ok' },
      colors:COLORS, catF:{ nom:'', color:COLORS[0].value, max:2 }, crF:{ nom:'', note:1 },
      categories:[], loading:false, grilleId:null, catColorMap:{},
      visibilite: 'encadrant_jury',
    }
  },
  computed: {
    anyModalOpen ()  { return this.showCatM || this.showCrM || this.showDelCatM || this.showDelCrM || this.showPublierM || this.showVisibiliteM || this.showVerrouillerM || this.showReinitM },
    totalNotes ()   { return this.categories.reduce((s,c)=>s+c.max,0) },
    totalOk ()      { return this.totalNotes === 20 },
    totalSansCat () { if (!this.editingCat) return this.totalNotes; return this.categories.filter(c=>c.id!==this.editingCat.id).reduce((s,c)=>s+c.max,0) },
    crMaxRestant () {
      if (!this.currentCat) return 0
      const otherSum = this.currentCat.criteres
        .filter(cr => !this.editingCr || cr.id !== this.editingCr.id)
        .reduce((s, cr) => s + cr.note, 0)
      return Math.max(0, this.currentCat.max - otherSum)
    },
    crOtherSum () {
      if (!this.currentCat) return 0
      return this.currentCat.criteres
        .filter(cr => !this.editingCr || cr.id !== this.editingCr.id)
        .reduce((s, cr) => s + cr.note, 0)
    },
    crHintState () {
      const entered = parseFloat(this.crF.note) || 0
      const remaining = this.crMaxRestant
      const catMax = this.currentCat?.max || 0
      const afterEntry = this.crOtherSum + entered
      if (entered <= 0) {
        return { type: 'neutral', msg: `Max autorisé pour cette catégorie : ${catMax.toFixed(2)} pts` }
      }
      if (entered > catMax) {
        const over = (entered - catMax).toFixed(2)
        return { type: 'error', msg: `⚠ Dépasse le max de la catégorie de ${over} pts (max : ${catMax.toFixed(2)} pts)` }
      }
      if (afterEntry > catMax) {
        const over = (afterEntry - catMax).toFixed(2)
        return { type: 'error', msg: `⚠ Total des critères dépasserait le max de ${over} pts (${afterEntry.toFixed(2)} / ${catMax.toFixed(2)} pts)` }
      }
      const left = (remaining - entered).toFixed(2)
      if (parseFloat(left) === 0) {
        return { type: 'full', msg: `✓ Barème complet pour cette catégorie (${catMax.toFixed(2)} pts)` }
      }
      return { type: 'ok', msg: `Il restera ${left} pts disponibles dans cette catégorie` }
    },
    crOverBudget () {
      const entered = parseFloat(this.crF.note) || 0
      return entered > 0 && (this.crOtherSum + entered) > (this.currentCat?.max || 0)
    },
    // ── Category modal (uses the selected/editing color from catF) ──
    _catColor () { return this.catF.color || '#3d6080' },
    catModalStyle () { const c=this._catColor; return { background: this._hexToFaint(c), border: `1.5px solid ${c}33` } },
    catModalHeadStyle () { const c=this._catColor; return { background: `linear-gradient(135deg, ${c} 0%, ${this._darken(c, 0.22)} 100%)` } },
    catModalBodyStyle () { const c=this._catColor; return { background: this._hexToFaint(c) } },
    catModalFootStyle () { const c=this._catColor; return { borderTop: `1.5px solid ${c}25`, background: this._hexToFaint(c) } },
    catModalSaveBtnStyle () { const c=this._catColor; return { background: c, borderColor: this._darken(c, 0.15), color: '#fff' } },
    // ── Critère modal (uses currentCat color) ──
    _crColor () { return this.currentCat?.color || '#3d6080' },
    crModalStyle () { const c=this._crColor; return { background: this._hexToFaint(c), border: `1.5px solid ${c}33` } },
    crModalHeadStyle () { const c=this._crColor; return { background: `linear-gradient(135deg, ${c} 0%, ${this._darken(c, 0.22)} 100%)` } },
    crModalBodyStyle () { const c=this._crColor; return { background: this._hexToFaint(c) } },
    crModalFootStyle () { const c=this._crColor; return { borderTop: `1.5px solid ${c}25`, background: this._hexToFaint(c) } },
    crModalSaveBtnStyle () { const c=this._crColor; return { background: c, borderColor: this._darken(c, 0.15), color: '#fff' } },
    // ── Delete cat modal ──
    _delCatColor () { return this.deletingCatTarget?.color || '#c0392b' },
    delCatModalStyle () { const c=this._delCatColor; return { background: this._hexToFaint(c), border: `1.5px solid ${c}33` } },
    delCatModalHeadStyle () { const c=this._delCatColor; return { background: `linear-gradient(135deg, ${this._darken(c,0.1)} 0%, ${this._darken(c, 0.3)} 100%)` } },
    delCatModalBodyStyle () { const c=this._delCatColor; return { background: this._hexToFaint(c) } },
    delCatModalFootStyle () { const c=this._delCatColor; return { borderTop: `1.5px solid ${c}25`, background: this._hexToFaint(c) } },
    delCatConfirmBtnStyle () { const c=this._delCatColor; return { background: c, borderColor: this._darken(c, 0.15), color: '#fff' } },
    // ── Delete critère modal ──
    _delCrColor () { return this.deletingCrTarget?.cat?.color || '#c0392b' },
    delCrModalStyle () { const c=this._delCrColor; return { background: this._hexToFaint(c), border: `1.5px solid ${c}33` } },
    delCrModalHeadStyle () { const c=this._delCrColor; return { background: `linear-gradient(135deg, ${this._darken(c,0.1)} 0%, ${this._darken(c, 0.3)} 100%)` } },
    delCrModalBodyStyle () { const c=this._delCrColor; return { background: this._hexToFaint(c) } },
    delCrModalFootStyle () { const c=this._delCrColor; return { borderTop: `1.5px solid ${c}25`, background: this._hexToFaint(c) } },
    delCrConfirmBtnStyle () { const c=this._delCrColor; return { background: c, borderColor: this._darken(c, 0.15), color: '#fff' } },
  },
  mounted () { this.chargerGrille() },
  methods: {
    async chargerGrille () {
      this.loading=true
      try {
        const res = await api.get('/grilles')
        if (res.data.length>0) {
          const g = res.data[0]; this.grilleId=g.id; this.publie=g.statut==='en_attente'; this.verrouille=g.statut==='valide'; this.actif=g.statut==='publie'; this.ferme=g.statut==='verrouille'
          this.visibilite = g.visibilite || 'encadrant_jury'
          this.categories = g.categories.map(cat => {
            if (!this.catColorMap[cat.id]) { const n=Object.keys(this.catColorMap).length; this.catColorMap[cat.id]=COLORS[n%COLORS.length].value }
            return { id:cat.id, nom:cat.nom, color:cat.color||this.catColorMap[cat.id], max:parseFloat(cat.bareme_max), criteres:cat.criteres.map(cr=>({ id:cr.id, nom:cr.nom, note:parseFloat(cr.bareme_max) })) }
          })
        } else { const c=await api.post('/grilles',{nom:'Grille PFE'}); this.grilleId=c.data.id; this.publie=false; this.verrouille=false; this.categories=[] }
      } catch { this.showToast('Erreur de chargement','err') } finally { this.loading=false }
    },
    catSum (c) { return c.criteres.reduce((s,x)=>s+x.note,0) },
    // ── Color helpers for dynamic modal theming ──
    _hexToRgb (hex) {
      const h = hex.replace('#','')
      const n = parseInt(h.length===3 ? h.split('').map(x=>x+x).join('') : h, 16)
      return [(n>>16)&255, (n>>8)&255, n&255]
    },
    _hexToFaint (hex) {
      // Mix the color with white at 94% white = solid light pastel background
      const [r,g,b] = this._hexToRgb(hex)
      const mix = (c) => Math.round(c * 0.07 + 255 * 0.93)
      return `rgb(${mix(r)},${mix(g)},${mix(b)})`
    },
    _darken (hex, amount) {
      const [r,g,b] = this._hexToRgb(hex)
      const d = v => Math.max(0, Math.round(v*(1-amount)))
      return `#${[d(r),d(g),d(b)].map(v=>v.toString(16).padStart(2,'0')).join('')}`
    },
    showToast (msg,type='ok') { this.toast={show:true,msg,type}; setTimeout(()=>this.toast.show=false,3000) },
    openCat () {
      if (this.verrouille||this.publie||this.actif||this.ferme) { this.showToast('Grille non modifiable','err'); return }
      const remaining = 20 - this.totalNotes
      if (remaining <= 0) {
        this.showToast('Le barème total est déjà atteint (20/20 pts) — libérez des points en modifiant une catégorie existante', 'err')
        return
      }
      const incomplete = this.categories.find(c => this.catSum(c) < c.max)
      if (incomplete) {
        this.showToast('Complétez d\'abord "' + incomplete.nom + '" (' + this.catSum(incomplete).toFixed(2) + '/' + incomplete.max + ' pts)', 'err')
        return
      }
      this.editingCat=null
      const used=this.categories.map(c=>c.color)
      this.catF={ nom:'', color:COLORS.find(c=>!used.includes(c.value))?.value||COLORS[0].value, max: Math.min(2, remaining) }
      this.showCatM=true
    },
    editCat (c) {
      if (this.verrouille||this.publie||this.actif||this.ferme) { this.showToast('Grille non modifiable','err'); return }
      this.editingCat=c; this.catF={nom:c.nom,color:c.color,max:c.max}; this.showCatM=true
    },
    async saveCat () {
      if (!this.catF.nom.trim()) { this.showToast('Nom requis','err'); return }
      this.savingCat=true
      try {
        if (this.editingCat) {
          await api.put(`/grilles/${this.grilleId}/categories/${this.editingCat.id}`,{nom:this.catF.nom,bareme_max:this.catF.max,color:this.catF.color})
          const idx=this.categories.findIndex(c=>c.id===this.editingCat.id)
          if (idx!==-1) { this.categories[idx].nom=this.catF.nom; this.categories[idx].max=this.catF.max; this.categories[idx].color=this.catF.color }
          this.showToast('Catégorie modifiée ✓'); this.showCatM=false
        } else {
          const res=await api.post(`/grilles/${this.grilleId}/categories`,{nom:this.catF.nom,bareme_max:this.catF.max,color:this.catF.color})
          this.catColorMap[res.data.id]=this.catF.color
          this.categories.push({
            id:       res.data.id,
            nom:      res.data.nom,
            color:    res.data.color||this.catF.color,
            max:      parseFloat(res.data.bareme_max),
            criteres: [],
          })
          this.showToast('Catégorie créée ✓')
          this.showCatM=false
        }
      } catch { this.showToast('Erreur','err') } finally { this.savingCat=false }
    },
    delCat (cat) {
      if (this.verrouille||this.publie||this.actif||this.ferme) { this.showToast('Grille non modifiable','err'); return }
      this.deletingCatTarget = cat
      this.showDelCatM = true
    },
    async confirmDelCat () {
      const id = this.deletingCatTarget.id
      this.deletingCatId = id
      try {
        await api.delete(`/grilles/${this.grilleId}/categories/${id}`)
        this.categories = this.categories.filter(c=>c.id!==id)
        this.showToast('Catégorie supprimée ✓')
        this.showDelCatM = false
      }
      catch { this.showToast('Erreur','err') } finally { this.deletingCatId = null }
    },
    openCr (cat) {
      if (this.verrouille||this.publie||this.actif||this.ferme) { this.showToast('Grille non modifiable','err'); return }
      if (this.catSum(cat) >= cat.max) {
        this.showToast('Barème complet pour "' + cat.nom + '" (' + cat.max + ' pts atteints)', 'err')
        return
      }
      this.currentCat=cat; this.editingCr=null; this.crF={nom:'',note:0.5}; this.showCrM=true
    },
    editCr (cat,cr) {
      if (this.verrouille||this.publie||this.actif||this.ferme) { this.showToast('Grille non modifiable','err'); return }
      this.currentCat=cat; this.editingCr=cr; this.crF={nom:cr.nom,note:cr.note}; this.showCrM=true
    },
    delCr (cat, cr) {
      this.deletingCrTarget = { cat, cr }
      this.showDelCrM = true
    },
    async confirmDelCr () {
      const { cat, cr } = this.deletingCrTarget
      this.deletingCrId = cr.id
      try {
        await api.delete(`/criteres/${cr.id}`)
        cat.criteres = cat.criteres.filter(c=>c.id!==cr.id)
        this.showToast('Critère supprimé ✓')
        this.showDelCrM = false
      }
      catch { this.showToast('Erreur','err') } finally { this.deletingCrId = null }
    },
    async saveCr () {
      if (this.savingCr) return
      if (!this.crF.nom.trim()) { this.showToast('Nom requis','err'); return }
      if (!this.crF.note || this.crF.note <= 0) { this.showToast('Le barème doit être supérieur à 0','err'); return }
      const otherSum = this.currentCat.criteres
        .filter(cr => !this.editingCr || cr.id !== this.editingCr.id)
        .reduce((s, cr) => s + cr.note, 0)
      if (otherSum + parseFloat(this.crF.note) > this.currentCat.max) {
        this.showToast(
          'Total (' + (otherSum + parseFloat(this.crF.note)).toFixed(2) + ' pts) dépasserait le max de la catégorie (' + this.currentCat.max + ' pts)',
          'err'
        )
        return
      }
      this.savingCr = true
      try {
        if (this.editingCr) { await api.put('/criteres/' + this.editingCr.id, {nom:this.crF.nom,bareme_max:this.crF.note}); this.editingCr.nom=this.crF.nom; this.editingCr.note=this.crF.note; this.showToast('Critère modifié ✓') }
        else { await api.post('/grilles/' + this.grilleId + '/categories/' + this.currentCat.id + '/criteres', {nom:this.crF.nom,bareme_max:this.crF.note}); await this.chargerGrille(); this.showToast('Critère ajouté ✓') }
        this.showCrM=false
      } catch { this.showToast('Erreur','err') } finally { this.savingCr=false }
    },
    async publier () {
      if (!this.totalOk) { this.showToast('Le total doit être exactement 20 pts','err'); return }
      this.showPublierM = true
    },
    async confirmPublier () {
      this.publishing = true
      try {
        await api.put(`/grilles/${this.grilleId}`, { visibilite: this.visibilite })
        await api.post(`/grilles/${this.grilleId}/publier`)
        this.publie=true; this.verrouille=false; this.actif=false; this.ferme=false; this.showPublierM=false; this.showToast('Grille soumise — en attente de validation ✓')
      }
      catch { this.showToast('Erreur','err') } finally { this.publishing = false }
    },

    async activerGrille () {
      this.publishingGrille = true
      try {
        await api.post(`/grilles/${this.grilleId}/activer`)
        this.verrouille = false
        this.actif = true
        this.publie = false
        this.ferme = false
        this.showToast('Grille publiée — accessible aux ' + (this.visibilite === 'jury_only' ? 'jurys uniquement' : 'encadrants et jurys') + ' ✓')
      } catch { this.showToast('Erreur lors de la publication','err') } finally { this.publishingGrille = false }
    },

    async confirmerVerrouiller () {
      this.lockingGrille = true
      try {
        await api.post(`/grilles/${this.grilleId}/fermer`)
        this.actif = false
        this.ferme = true
        this.publie = false
        this.verrouille = false
        this.showVerrouillerM = false
        this.showToast('Grille verrouillée définitivement ✓')
      } catch { this.showToast('Erreur lors du verrouillage','err') } finally { this.lockingGrille = false }
    },

    async confirmerReinit () {
      this.reinitialising = true
      try {
        await api.post(`/grilles/${this.grilleId}/reinitialiser`)
        this.publie = false
        this.verrouille = false
        this.actif = false
        this.ferme = false
        this.showReinitM = false
        this.showToast('Grille réinitialisée en brouillon ✓')
      } catch { this.showToast('Erreur lors de la réinitialisation','err') } finally { this.reinitialising = false }
    },
  },
}
</script>

<style scoped>
/* ════════════════════════════════════════════════════════
   GESTION GRILLE — refined gold × deep-blue × greige
   ════════════════════════════════════════════════════════ */

/* ── Root wrapper ── */
.vld-grille-root { font-family: var(--vld-font-body); }

/* ── Main widget card ── */
.vld-grille-card {
  background: var(--vld-surface-raised);
  border: 1.5px solid var(--vld-border);
  border-radius: var(--vld-r-2xl);
  box-shadow: var(--vld-shadow-card);
  overflow: hidden;
}

/* Widget header — dark navy */
.vld-grille-card__head {
  display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  padding: 20px 26px;
  background: linear-gradient(135deg, var(--vld-primary-dark) 0%, #1a2d3e 100%);
  border-bottom: 3px solid #f5a623;
}
.vld-grille-card__head-left { display: flex; align-items: center; gap: 14px; }
.vld-grille-card__icon {
  width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0;
  background: rgba(245,166,35,.18); border: 1.5px solid rgba(245,166,35,.35);
  display: flex; align-items: center; justify-content: center;
  color: #f5a623;
  box-shadow: 0 2px 10px rgba(245,166,35,.15);
}
.vld-grille-card__title {
  font-family: var(--vld-font-display);
  font-size: 16px; font-weight: 800; color: #fff; margin: 0;
  letter-spacing: -.01em;
}
.vld-grille-card__sub { font-size: 12px; color: rgba(255,255,255,.55); margin: 3px 0 0; }

/* Total badge */
.vld-total-badge {
  padding: 6px 14px; border-radius: 999px;
  font-size: 13px; font-weight: 700; font-family: var(--vld-font-body);
}
.vld-total-badge--ok   { background: rgba(30,158,96,.22); color: #0b6e40; border: 1.5px solid rgba(30,158,96,.40); }
.vld-total-badge--warn { background: rgba(245,166,35,.22); color: #8b4500; border: 1.5px solid rgba(245,166,35,.50); }

/* Widget body */
.vld-grille-card__body { padding: 24px 26px; display: flex; flex-direction: column; gap: 0; }

/* ── Category cards — navy header ── */
.vld-cat-card {
  background: var(--vld-surface-raised);
  border: 1.5px solid var(--vld-border);
  border-radius: var(--vld-r-xl);
  box-shadow: var(--vld-shadow-card);
  overflow: hidden;
  transition: box-shadow .18s var(--vld-ease);
}
.vld-cat-card:hover { box-shadow: var(--vld-shadow-card-hover); }

.vld-cat-card__head {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px;
  background: linear-gradient(135deg, var(--vld-primary-dark) 0%, #1a2d3e 100%);
  border-bottom: 1.5px solid rgba(245,166,35,.25);
}
.vld-cat-badge {
  padding: 4px 12px; border-radius: 999px;
  font-size: 12px; font-weight: 700; white-space: nowrap;
}
.vld-cat-add-btn {
  background: rgba(245,166,35,.18) !important;
  border: 1.5px solid rgba(245,166,35,.40) !important;
  color: #f5a623 !important;
  font-weight: 700; font-size: 12.5px;
  transition: all .15s var(--vld-ease);
}
.vld-cat-add-btn:hover:not(:disabled) {
  background: rgba(245,166,35,.30) !important;
  border-color: #f5a623 !important;
  box-shadow: 0 2px 8px rgba(245,166,35,.25);
}

/* Light icon buttons for dark header */
.vld-icon-btn--edit-light {
  width: 30px; height: 30px; border-radius: 8px;
  background: rgba(255,255,255,.12); border: 1.5px solid rgba(255,255,255,.22);
  color: rgba(255,255,255,.80); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s var(--vld-ease); flex-shrink: 0;
}
.vld-icon-btn--edit-light:hover:not(:disabled) {
  background: rgba(255,255,255,.22); border-color: rgba(255,255,255,.45); color: #fff;
}
.vld-icon-btn--del-light {
  width: 30px; height: 30px; border-radius: 8px;
  background: rgba(217,64,64,.18); border: 1.5px solid rgba(217,64,64,.35);
  color: #ff9090; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s var(--vld-ease); flex-shrink: 0;
}
.vld-icon-btn--del-light:hover:not(:disabled) {
  background: rgba(217,64,64,.32); border-color: #ff6060; color: #ffc0c0;
}
.vld-icon-btn--edit-light:disabled,
.vld-icon-btn--del-light:disabled { opacity: .4; cursor: not-allowed; }

.vld-cat-card__body { background: var(--vld-surface-raised); }

/* Criteria rows */
.vld-cr-row { background: var(--vld-surface-raised); transition: background .12s; }
.vld-cr-row:hover { background: var(--vld-surface-alt); }

/* ── Status banners ── */
.vld-banner {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 20px; border-radius: var(--vld-r-xl);
  border: 1.5px solid; font-size: 13.5px; font-weight: 500;
}
.vld-banner__icon { flex-shrink: 0; display: flex; align-items: center; }
.vld-banner__body { flex: 1; }
.vld-banner__title { font-weight: 700; font-size: 13.5px; margin-bottom: 2px; }
.vld-banner__sub   { font-size: 12px; opacity: .75; }

.vld-banner--success {
  background: linear-gradient(90deg, rgba(30,158,96,.12), rgba(30,158,96,.05));
  border-color: rgba(30,158,96,.30); color: #0d5c32;
}
.vld-banner--warning {
  background: linear-gradient(90deg, rgba(245,166,35,.14), rgba(245,166,35,.05));
  border-color: rgba(245,166,35,.40); color: #6b3800;
}
.vld-banner--info {
  background: linear-gradient(90deg, rgba(61,96,128,.10), rgba(61,96,128,.04));
  border-color: rgba(61,96,128,.22); color: var(--vld-primary-dark);
}

/* ── Empty state ── */
.vld-state {
  text-align: center; padding: 60px 24px;
  background: var(--vld-surface); border-radius: var(--vld-r-2xl);
  border: 2px dashed var(--vld-border);
}
.vld-state__icon { color: var(--vld-text-faint); margin-bottom: 16px; }
.vld-state__title { font-size: 16px; font-weight: 700; color: var(--vld-text-strong); margin: 0 0 6px; }
.vld-state__sub   { font-size: 13px; color: var(--vld-text-muted); margin: 0; }

/* ── Category accent bar ── */
.cat-accent-bar { width: 5px; height: 44px; border-radius: 4px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,.22); }

/* ── Progress bar ── */
.progress {
  background: rgba(0,0,0,.08);
  border-radius: 99px;
  overflow: hidden;
}
.progress-bar { border-radius: 99px; transition: width .4s var(--vld-ease); }

/* ── Récapitulatif card ── */
.vld-recap-card {
  background: var(--vld-surface-raised);
  border: 2px solid rgba(245,166,35,.35) !important;
  box-shadow: 0 4px 20px rgba(245,166,35,.08), var(--vld-shadow-card) !important;
}

.vld-recap-header {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--vld-primary-dark) 0%, #1a2d3e 100%) !important;
  color: #fff;
  font-family: var(--vld-font-display);
  font-size: 14.5px;
  font-weight: 800;
  letter-spacing: .02em;
  padding: 16px 22px;
  border-bottom: none !important;
}

/* ── Récapitulatif table ── */
.table { color: var(--vld-text-strong); font-family: var(--vld-font-body); margin: 0; }

/* Gold column-header row */
.vld-recap-thead tr {
  background: linear-gradient(90deg, rgba(245,166,35,.18), rgba(245,166,35,.08));
}
.vld-recap-thead th {
  font-size: 11px; font-weight: 800; text-transform: uppercase;
  letter-spacing: .08em; color: #6b3d00;
  padding: 11px 20px;
  border-bottom: 2px solid rgba(245,166,35,.40);
  border-top: none; background: transparent;
}

/* Data rows */
.vld-recap-row { border-bottom: 1px solid var(--vld-border); transition: background .12s; }
.vld-recap-row:hover { background: rgba(245,166,35,.04); }
.vld-recap-row td { padding: 13px 20px; vertical-align: middle; font-size: 13.5px; border: none; background: transparent; }
.vld-recap-criteres { font-size: 13px !important; color: var(--vld-text-muted); }

/* Gold total row */
.vld-total-row {
  background: linear-gradient(90deg, rgba(245,166,35,.14), rgba(245,166,35,.06));
  border-top: 2px solid rgba(245,166,35,.35);
}
.vld-total-row td { padding: 14px 20px; border: none; background: transparent; }
.vld-total-label {
  font-weight: 800; font-size: 13px; letter-spacing: .06em;
  text-transform: uppercase; color: #6b3d00; text-align: right;
}

/* Score widget — green if 20/20, red otherwise */
.vld-score-widget {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 7px 16px; border-radius: 999px;
  font-weight: 800; font-size: 15px;
  border: 2px solid; transition: all .2s var(--vld-ease);
}
.vld-score-widget--ok {
  background: linear-gradient(135deg, rgba(30,158,96,.18), rgba(30,158,96,.08));
  border-color: rgba(30,158,96,.50);
  color: #0b6e40;
  box-shadow: 0 2px 12px rgba(30,158,96,.20);
}
.vld-score-widget--warn {
  background: linear-gradient(135deg, rgba(217,64,64,.14), rgba(217,64,64,.06));
  border-color: rgba(217,64,64,.45);
  color: #9b1c1c;
  box-shadow: 0 2px 12px rgba(217,64,64,.15);
}
.vld-score-widget__text { font-family: var(--vld-font-display); letter-spacing: -.01em; }

/* ── Gold button ── */
.btn-gold {
  background: linear-gradient(135deg, #f5a623 0%, #c97e10 100%);
  color: #fff;
  border: none;
  font-weight: 700;
  font-family: var(--vld-font-body);
  box-shadow: 0 2px 10px rgba(245,166,35,.30);
  transition: all .18s var(--vld-ease);
}
.btn-gold:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 18px rgba(245,166,35,.45);
  color: #fff;
  background: linear-gradient(135deg, #ffb84a 0%, #b86e08 100%);
}
.btn-gold:disabled { opacity: .4; cursor: not-allowed; }

/* ── Visibility button ── */
.btn-vis {
  background: linear-gradient(135deg, #2f6f9e 0%, #1a4a6e 100%);
  color: #fff;
  border: none;
  font-weight: 700;
  font-family: var(--vld-font-body);
  box-shadow: 0 2px 10px rgba(47,111,158,.30);
  transition: all .18s var(--vld-ease);
}
.btn-vis:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 18px rgba(47,111,158,.45);
  color: #fff;
  background: linear-gradient(135deg, #3d85ba 0%, #153d5e 100%);
}
.btn-vis:disabled { opacity: .4; cursor: not-allowed; }

/* ── Icon buttons ── */
.vld-icon-btn {
  width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s var(--vld-ease); flex-shrink: 0;
}
.vld-icon-btn--edit {
  background: rgba(61,96,128,.07);
  border-color: rgba(61,96,128,.18);
  color: var(--vld-primary);
}
.vld-icon-btn--edit:hover:not(:disabled) {
  background: rgba(61,96,128,.15);
  border-color: var(--vld-primary);
  box-shadow: 0 2px 8px rgba(61,96,128,.20);
}
.vld-icon-btn--del {
  background: rgba(217,64,64,.07);
  border-color: rgba(217,64,64,.18);
  color: var(--vld-danger);
}
.vld-icon-btn--del:hover:not(:disabled) {
  background: rgba(217,64,64,.15);
  border-color: var(--vld-danger);
  box-shadow: 0 2px 8px rgba(217,64,64,.20);
}
.vld-icon-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ── Spinner ── */
.vld-spinner-sm {
  display: inline-block;
  width: 13px; height: 13px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  animation: vld-spin .7s linear infinite;
}
@keyframes vld-spin { to { transform: rotate(360deg); } }

/* ── Toast ── */
.vld-toast-wrap {
  position: fixed; top: 20px; right: 20px; z-index: 9999;
  min-width: 280px; max-width: 380px;
}

/* ── Color swatch ── */
.color-swatch {
  width: 28px; height: 28px; border-radius: 50%; border: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: transform .15s, box-shadow .15s;
}
.color-swatch:hover { transform: scale(1.18); box-shadow: 0 3px 10px rgba(0,0,0,.22); }
.rm-color-row { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 4px; }

/* ══════════════════════════════════════════════════
   GRILLE MODALS — shared base (preserved from Reunion style)
   ══════════════════════════════════════════════════ */
.rm-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(10,18,28,.52);
  backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.rm-modal {
  width: 100%; max-width: 460px;
  border-radius: 18px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 4px 6px rgba(0,0,0,.08), 0 24px 64px rgba(0,0,0,.28), 0 0 0 1px rgba(255,255,255,.06);
}

/* ── Blue variant (Catégorie / Critère) ── */
.rm-modal--blue { background: #f5f8ff; border: 1.5px solid rgba(47,79,106,.2); }
.rm-modal__head--blue {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #2f4f6a 0%, #1a3248 100%);
}
.rm-modal--blue .rm-modal__body   { background: #f5f8ff; }
.rm-modal--blue .rm-modal__foot   { border-top: 1.5px solid rgba(47,79,106,.15); background: rgba(47,79,106,.04); }

/* ── Red variant (delete confirmations) ── */
.rm-modal--red { background: #fff8f7; border: 1.5px solid rgba(192,57,43,.2); }
.rm-modal__head--red {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #9b2020 0%, #6b1010 100%);
}
.rm-modal--red .rm-modal__body   { background: #fff8f7; }
.rm-modal--red .rm-modal__foot   { border-top: 1.5px solid rgba(192,57,43,.15); background: rgba(192,57,43,.04); }

/* ── Gold variant (submit confirmation) ── */
.rm-modal--gold { background: #fffdf5; border: 1.5px solid rgba(215,158,0,.25); }
.rm-modal__head--gold {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #c8820a 0%, #8a5500 100%);
}
.rm-modal__body--gold   { background: #fffdf5; }
.rm-modal__foot--gold   { border-top: 1.5px solid rgba(215,158,0,.2); background: rgba(215,158,0,.05); }

/* ── Delete warning block ── */
.rm-del-warning { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; padding: 8px 0; }
.rm-del-warning__icon { opacity: .85; }
.rm-del-warning__text { font-size: 0.85rem; color: #3a3a3a; line-height: 1.55; margin: 0; }

/* ── Base header rule (dynamic modals use :style for color, this handles layout) ── */
.rm-modal__head {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 18px 20px;
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
.rm-modal__sub   { font-size: 11.5px; color: rgba(255,255,255,.6); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px; }
.rm-modal__close {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  background: rgba(255,255,255,.14); border: none; color: rgba(255,255,255,.75);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .12s, color .12s;
}
.rm-modal__close:hover { background: rgba(255,255,255,.28); color: #fff; }

/* ── Body ── */
.rm-modal__body { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; background: #fff; }
/* ── Footer base ── */
.rm-modal__foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 22px; background: #f8f8f6; }

.rm-field { display: flex; flex-direction: column; gap: 5px; }
.rm-field__label { font-size: 0.73rem; font-weight: 700; color: #4a5a6a; text-transform: uppercase; letter-spacing: .05em; }
.rm-optional { font-size: 0.68rem; font-weight: 500; color: #8a9aaa; text-transform: none; letter-spacing: 0; }
.rm-field__input, .rm-field__textarea {
  padding: 8px 11px; border: 1.5px solid #c8c4bc; border-radius: 8px;
  font-size: 0.82rem; font-family: 'Source Sans 3', sans-serif;
  color: #1e2a35; background: #f5f3f0; outline: none;
  transition: border-color .15s, background .15s; width: 100%;
}
.rm-field__input:focus, .rm-field__textarea:focus { border-color: #2f4f6a; background: #fff; }
.rm-field__hint { font-size: 0.73rem; color: #6a7a8a; margin-top: 3px; transition: color .2s; }
.rm-hint--ok    { color: #27ae60; font-weight: 600; }
.rm-hint--full  { color: #2980b9; font-weight: 600; }
.rm-hint--error { color: #c0392b; font-weight: 700; }
.rm-field__input--error { border-color: #c0392b !important; background: #fff5f5 !important; }
.rm-fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }


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
.rm-btn--blue { background: #2f4f6a; border-color: #1a3248; color: #fff; }
.rm-btn--blue:hover:not(:disabled) { background: #1a3248; box-shadow: 0 4px 12px rgba(47,79,106,.35); }
.rm-btn--red { background: #9b2020; border-color: #7b1a1a; color: #fff; }
.rm-btn--red:hover:not(:disabled) { background: #7b1a1a; box-shadow: 0 4px 12px rgba(155,32,32,.35); }

/* ── Spinner ── */
.rm-spinner {
  width: 13px; height: 13px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,.35); border-top-color: #fff;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Visibility modal ── */
.rm-modal--vis { background: #f7f9fc; border: 1.5px solid rgba(52,152,219,.2); max-width: 520px !important; }
.rm-modal__head--vis {
  background: linear-gradient(135deg, #2471a3 0%, #154360 100%);
}
.rm-modal__foot--vis { border-top: 1.5px solid rgba(52,152,219,.15); background: rgba(52,152,219,.04); }
.rm-btn--vis-confirm { background: #2471a3; border-color: #154360; color: #fff; }
.rm-btn--vis-confirm:hover { background: #154360; box-shadow: 0 4px 12px rgba(36,113,163,.35); }

.rm-vis-body { gap: 10px !important; }
.rm-vis-option {
  display: flex; align-items: center; gap: 14px;
  width: 100%; padding: 14px 16px;
  background: #fff; border: 2px solid #dde3ea; border-radius: 12px;
  cursor: pointer; text-align: left; transition: border-color .15s, background .15s, box-shadow .15s;
}
.rm-vis-option:hover { border-color: #2471a3; background: #f0f7ff; }
.rm-vis-option--active { border-color: #2471a3; background: #eaf3fb; box-shadow: 0 0 0 3px rgba(36,113,163,.12); }
.rm-vis-option__icon {
  width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0;
  background: rgba(36,113,163,.1); color: #2471a3;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.rm-vis-option--active .rm-vis-option__icon { background: rgba(36,113,163,.18); }
.rm-vis-option__body { flex: 1; min-width: 0; }
.rm-vis-option__title { font-size: 0.88rem; font-weight: 700; color: #1e2a35; margin-bottom: 6px; }
.rm-vis-option__desc  { font-size: 0.75rem; color: #5a6a7a; line-height: 1.45; }

/* Permission rows inside vis options */
.rm-vis-option__perms { display: flex; flex-direction: column; gap: 5px; }
.rm-vis-perm {
  display: flex; align-items: flex-start; gap: 7px;
  font-size: 0.73rem; line-height: 1.5; color: #3a4a5a;
}
.rm-vis-perm svg { flex-shrink: 0; margin-top: 2px; }
.rm-vis-perm--jury svg     { color: #2471a3; }
.rm-vis-perm--encadrant svg { color: #27ae60; }
.rm-vis-perm--restricted svg { color: #c0392b; }
.rm-vis-perm--restricted { color: #6a3a3a; }
.rm-vis-option__check {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  background: #2471a3; display: flex; align-items: center; justify-content: center; color: #fff;
  opacity: 0; transition: opacity .15s;
}
.rm-vis-option--active .rm-vis-option__check { opacity: 1; }

/* ── Transitions ── */
.rm-modal-enter-active, .rm-modal-leave-active { transition: all .22s; }
.rm-modal-enter-from, .rm-modal-leave-to { opacity: 0; transform: scale(.96) translateY(6px); }

/* ── Publish (green) button ── */
.btn-publish-green {
  background: linear-gradient(135deg, #27ae60 0%, #1a8a48 100%);
  border: 1.5px solid #1a8a48;
  color: #fff;
  font-size: 13px; font-weight: 700; border-radius: 9px;
  padding: 8px 16px; cursor: pointer;
  box-shadow: 0 2px 8px rgba(39,174,96,.30);
  transition: all .15s;
}
.btn-publish-green:hover:not(:disabled) {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  box-shadow: 0 4px 14px rgba(39,174,96,.42);
}
.btn-publish-green:disabled { opacity: .6; cursor: not-allowed; }

/* ── Lock (navy) button ── */
.btn-lock-navy {
  background: linear-gradient(135deg, #2f4f6a 0%, #1a3248 100%);
  border: 1.5px solid #1a3248;
  color: #fff;
  font-size: 13px; font-weight: 700; border-radius: 9px;
  padding: 8px 16px; cursor: pointer;
  box-shadow: 0 2px 8px rgba(47,79,106,.30);
  transition: all .15s;
}
.btn-lock-navy:hover:not(:disabled) {
  background: linear-gradient(135deg, #3a6080 0%, #2f4f6a 100%);
  box-shadow: 0 4px 14px rgba(47,79,106,.42);
}
.btn-lock-navy:disabled { opacity: .6; cursor: not-allowed; }

.btn-lock-navy:disabled { opacity: .6; cursor: not-allowed; }

/* ── Réinitialiser bar + button ── */
.vld-reinit-bar {
  display: flex; justify-content: flex-end;
  padding: 12px 26px 16px;
  border-top: 1px solid rgba(192,57,43,.15);
  background: rgba(231,76,60,.04);
}
.btn-reinit-solid {
  display: inline-flex; align-items: center; gap: 7px;
  background: #c0392b;
  border: none;
  color: #fff;
  font-size: 13px; font-weight: 700; border-radius: 9px;
  padding: 8px 18px; cursor: pointer;
  box-shadow: 0 2px 8px rgba(192,57,43,.30);
  transition: all .15s;
}
.btn-reinit-solid:hover:not(:disabled) {
  background: #a93226;
  box-shadow: 0 4px 14px rgba(192,57,43,.42);
}
.btn-reinit-solid:disabled { opacity: .5; cursor: not-allowed; }

/* ── Danger modal variant ── */
.rm-modal--danger .rm-modal__head {
  background: linear-gradient(135deg, #7b1e1e 0%, #5c1414 100%);
  border-bottom: 3px solid #e74c3c;
}
.rm-modal__head-text { flex: 1; min-width: 0; }
.rm-modal__head-icon--danger {
  background: rgba(255,255,255,.15);
  border-color: rgba(255,255,255,.25);
  color: #fff;
}

/* ── Danger confirm button ── */
.rm-btn--danger-confirm {
  display: inline-flex; align-items: center; gap: 7px;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  border: none; color: #fff;
  font-size: 13px; font-weight: 700; border-radius: 9px;
  padding: 9px 20px; cursor: pointer;
  box-shadow: 0 2px 8px rgba(231,76,60,.30);
  transition: all .15s;
}
.rm-btn--danger-confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
  box-shadow: 0 4px 14px rgba(231,76,60,.42);
}
.rm-btn--danger-confirm:disabled { opacity: .6; cursor: not-allowed; }

/* ── Warning box inside modal ── */
.rm-confirm-warning {
  display: flex; align-items: flex-start; gap: 12px;
  background: rgba(231,76,60,.07);
  border: 1.5px solid rgba(231,76,60,.25);
  border-radius: 10px;
  padding: 14px 16px;
  color: #7b1e1e;
  font-size: 13.5px; line-height: 1.6;
}
.rm-confirm-warning svg { flex-shrink: 0; margin-top: 2px; color: #e74c3c; }

/* ── Active banner (green, grille published by chef) ── */
.vld-banner--active {
  background: linear-gradient(135deg, #eafaf1 0%, #d5f5e3 100%);
  border: 1.5px solid #7dcea0;
  color: #1a5c32;
}
.vld-banner--active .vld-banner__icon { color: #27ae60; }

/* ── Locked banner (grey, grille permanently closed) ── */
.vld-banner--locked {
  background: linear-gradient(135deg, #f2f3f4 0%, #e8eaed 100%);
  border: 1.5px solid #aab4be;
  color: #2a3a4a;
}
.vld-banner--locked .vld-banner__icon { color: #5a6a7a; }
</style>