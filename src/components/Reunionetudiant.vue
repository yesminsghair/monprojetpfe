<template>
  <div class="page-content">

    <!-- HEADER -->
    <div class="page-header">
      <div class="ph-left">
        <div class="ph-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <h2>Mes réunions</h2>
          <p class="subtitle">Confirmez ou refusez les créneaux proposés par votre encadrant</p>
        </div>
      </div>
      <div class="ph-right">
        <div class="enc-pill" v-if="encadrant">
          <div class="enc-pill-av">{{ initials(encadrant) }}</div>
          <span>{{ encadrant }}</span>
        </div>
        <span class="role-tag">Étudiant</span>
      </div>
    </div>

    <!-- TOAST -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="'toast-'+toast.type">
        <div class="toast-icon">
          <svg v-if="toast.type==='ok'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else-if="toast.type==='warn'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
        {{ toast.msg }}
        <button @click="toast.show=false" class="toast-x">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </transition>

    <!-- STATS STRIP -->
    <div class="stats-strip">
      <div class="stat-pill stat-pill--amber">
        <div class="stat-pill__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="stat-pill__num">{{ pending.length }}</div>
        <div class="stat-pill__lbl">En attente</div>
      </div>
      <div class="stat-pill stat-pill--green">
        <div class="stat-pill__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="stat-pill__num">{{ confirmed.length }}</div>
        <div class="stat-pill__lbl">Confirmées</div>
      </div>
      <div class="stat-pill stat-pill--red">
        <div class="stat-pill__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
        <div class="stat-pill__num">{{ annulees.length }}</div>
        <div class="stat-pill__lbl">Annulées</div>
      </div>
      <div class="stat-pill stat-pill--blue" v-if="nextMeeting">
        <div class="stat-pill__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="stat-pill__num">{{ countdown(nextMeeting.date) }}</div>
        <div class="stat-pill__lbl">Prochaine</div>
      </div>
    </div>

    <!-- ══ SECTION 1 : RÉPONSES DONNÉES (top, full width) ══ -->
    <template v-if="repondues.length">
      <div class="section-head">
        <div class="section-head__left">
          <span class="sh-dot sh-dot--grey"></span>
          Réponses données
          <span class="sh-count">{{ repondues.length }}</span>
        </div>
      </div>
      <div class="repondues-grid">
        <div v-for="p in repondues" :key="p.id" class="rcard" :class="'rcard--'+p.statut">
          <div class="rcard-stripe"></div>
          <div class="rcard-inner">
            <div class="rcard-datecol">
              <div class="rcard-day">{{ dayName(p.date).slice(0,3) }}</div>
              <div class="rcard-datenum">{{ fmtDay(p.date) }}</div>
              <div class="rcard-heure">{{ p.heure }}</div>
            </div>
            <div class="rcard-body">
              <div class="rcard-enc">
                <div class="rcard-enc-av">{{ initials(encadrant) }}</div>
                {{ encadrant }}
              </div>
              <div class="rcard-lieu" v-if="p.lieu">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ p.lieu }}
              </div>
              <div class="rcard-motif" v-if="p.motif && p.statut==='annulee'">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {{ p.motif }}
              </div>
            </div>
            <span class="rcard-badge" :class="'badge-'+p.statut">{{ statutLabel(p.statut) }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- ══ SECTION 2 : EN ATTENTE ══ -->
    <template v-if="pending.length || !propositions.length">
      <div class="section-head" :style="repondues.length ? 'margin-top:28px' : ''">
        <div class="section-head__left">
          <span class="sh-dot sh-dot--amber"></span>
          En attente de votre réponse
        </div>
        <span class="sh-badge" v-if="pending.length">{{ pending.length }}</span>
      </div>

      <div class="empty-state" v-if="!propositions.length">
        <div class="es-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <p class="es-title">Aucun créneau proposé</p>
        <p class="es-sub">Votre encadrant n'a pas encore proposé de réunion.</p>
      </div>

      <div v-for="p in pending" :key="p.id" class="prop-card">
        <div class="pc-left">
          <div class="pc-day">{{ dayName(p.date).slice(0,3) }}</div>
          <div class="pc-datenum">{{ fmtDay(p.date) }}</div>
          <div class="pc-heure">{{ p.heure }}</div>
          <div class="pc-type-badge" v-if="p.type">{{ p.type }}</div>
        </div>
        <div class="pc-body">
          <div class="pc-enc-row">
            <div class="pc-enc-av">{{ initials(encadrant) }}</div>
            <div class="pc-enc-info">
              <div class="pc-enc-nom">{{ encadrant }}</div>
              <div class="pc-enc-sub">{{ p.lieu || 'Lieu non précisé' }}</div>
            </div>
            <span class="pc-statut-dot"></span>
          </div>
          <div class="pc-actions">
            <button class="pc-btn pc-btn--confirm" @click="confirmer(p)" :disabled="loading">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Confirmer
            </button>
            <button class="pc-btn pc-btn--decline" @click="ouvrirRejeter(p)">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Décliner
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ══ SECTION 3 : CONFIRMÉES + RAPPEL SIDE-BY-SIDE ══ -->
    <template v-if="confirmed.length">
      <div class="section-head" style="margin-top:28px">
        <div class="section-head__left">
          <span class="sh-dot sh-dot--green"></span>
          Réunions confirmées
          <span class="sh-count sh-count--green">{{ confirmed.length }}</span>
        </div>
        <span class="sh-hint">Cliquez une ligne pour configurer le rappel</span>
      </div>

      <div class="confirmed-rappel-layout">

        <!-- LEFT: confirmed list -->
        <div class="confirmed-list">
          <div
            v-for="m in confirmed"
            :key="m.id"
            class="cl-row"
            :class="{
              'cl-row--next':     m.id === nextMeeting?.id,
              'cl-row--selected': m.id === selectedReunion?.id
            }"
            @click="selectReunion(m)"
          >
            <div class="cl-left">
              <div class="cl-datebox">
                <div class="cl-day">{{ dayName(m.date).slice(0,3) }}</div>
                <div class="cl-datenum">{{ fmtDay(m.date) }}</div>
              </div>
              <div class="cl-info">
                <div class="cl-heure">{{ m.heure }}</div>
                <div class="cl-meta">
                  <span v-if="m.lieu" class="cl-lieu">
                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {{ m.lieu }}
                  </span>
                  <span v-if="m.type" class="cl-type">{{ m.type }}</span>
                </div>
              </div>
            </div>
            <div class="cl-right">
              <span class="cl-next-badge" v-if="m.id === nextMeeting?.id">Prochaine</span>
              <span class="cl-bell" v-if="rappelMap[m.id]" title="Rappel activé">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </span>
              <div class="cl-check">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: rappel panel -->
        <div class="rappel-panel">
          <template v-if="selectedReunion">
            <!-- Selected reunion mini-card -->
            <div class="rp-reunion-card">
              <div class="rp-rc-top">
                <div class="rp-rc-datebox">
                  <div class="rp-rc-day">{{ dayName(selectedReunion.date).slice(0,3) }}</div>
                  <div class="rp-rc-datenum">{{ fmtDay(selectedReunion.date) }}</div>
                </div>
                <div class="rp-rc-info">
                  <div class="rp-rc-heure">{{ selectedReunion.heure }}</div>
                  <div class="rp-rc-enc">{{ encadrant }}</div>
                  <div class="rp-rc-countdown">{{ countdown(selectedReunion.date) }}</div>
                </div>
              </div>
            </div>

            <!-- Active rappel status -->
            <transition name="fade">
              <div class="rp-active-banner" v-if="rappelMap[selectedReunion.id]">
                <div class="rp-ab-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  <span>
                    Rappel <strong>{{ rappelMap[selectedReunion.id].delai === '0' ? 'le jour même' : rappelMap[selectedReunion.id].delai === '1' ? 'J‑1' : 'J‑2' }}</strong>
                    à <strong>{{ rappelMap[selectedReunion.id].heure }}</strong>
                  </span>
                </div>
                <button class="rp-ab-cancel" @click="annulerRappel" title="Annuler">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </transition>

            <!-- Rappel CTA button -->
            <button
              class="btn-rappel"
              :class="{ active: rappelMap[selectedReunion.id] }"
              @click="ouvrirRappel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {{ rappelMap[selectedReunion.id] ? 'Modifier le rappel' : 'Activer le rappel' }}
            </button>
          </template>

          <div class="rp-empty" v-else>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <p>Sélectionnez une réunion pour activer un rappel</p>
          </div>
        </div>

      </div>
    </template>

  <!-- ══════════════════════════════════════
       MODAL RAPPEL
       ══════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="rm-modal">
      <div v-if="modalRappel" class="rm-overlay" @click.self="modalRappel = false">
        <div class="rm-modal rm-modal--amber">

          <div class="rm-modal__head rm-modal__head--amber">
            <div class="rm-modal__head-left">
              <div class="rm-modal__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <div>
                <div class="rm-modal__title">Configurer le rappel</div>
                <div class="rm-modal__sub" v-if="selectedReunion">
                  {{ dayName(selectedReunion.date) }} {{ fmtDay(selectedReunion.date) }} · {{ selectedReunion.heure }}
                </div>
              </div>
            </div>
            <button class="rm-modal__close" @click="modalRappel = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="rm-modal__body">

            <!-- Info banner -->
            <div class="rappel-modal-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Une notification sera envoyée à <strong>vous</strong> et à <strong>votre encadrant</strong> au moment choisi.</span>
            </div>

            <!-- Délai -->
            <div class="rm-field">
              <label class="rm-field__label">Quand envoyer le rappel ?</label>
              <div class="rappel-delai-grid">
                <button
                  v-for="opt in delaiOptions"
                  :key="opt.val"
                  class="rappel-delai-btn"
                  :class="{ active: rappelForm.delai === opt.val }"
                  @click="rappelForm.delai = opt.val"
                >
                  <span class="rdl-main">{{ opt.label }}</span>
                  <span class="rdl-sub">{{ opt.sub }}</span>
                </button>
              </div>
            </div>

            <!-- Heure -->
            <div class="rm-field">
              <label class="rm-field__label">À quelle heure ?</label>
              <input
                v-model="rappelForm.heure"
                type="time"
                class="rappel-heure-input"
                step="300"
              />
            </div>

            <!-- Preview -->
            <div class="rappel-preview" v-if="selectedReunion">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Notification prévue le <strong>{{ rappelPreviewDate }}</strong> à <strong>{{ rappelForm.heure }}</strong>
            </div>

          </div>

          <div class="rm-modal__foot">
            <button class="rm-btn rm-btn--ghost" @click="modalRappel = false">Annuler</button>
            <button
              class="rm-btn rm-btn--amber"
              :disabled="rappelLoading"
              @click="confirmerRappel"
            >
              <div v-if="rappelLoading" class="rm-spinner"></div>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              Activer le rappel
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══════════════════════════════════════
       MODAL DÉCLINER — red theme
       ══════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="rm-modal">
      <div v-if="modalRejeter" class="rm-overlay" @click.self="modalRejeter = false">
        <div class="rm-modal rm-modal--red">

          <div class="rm-modal__head rm-modal__head--red">
            <div class="rm-modal__head-left">
              <div class="rm-modal__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <div>
                <div class="rm-modal__title">Décliner le créneau</div>
                <div class="rm-modal__sub" v-if="reunionCible">
                  {{ dayName(reunionCible.date) }} {{ fmtDay(reunionCible.date) }} · {{ reunionCible.heure }}
                </div>
              </div>
            </div>
            <button class="rm-modal__close" @click="modalRejeter = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="rm-modal__body">
            <div class="rm-modal__warn">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Votre encadrant sera notifié du refus avec votre raison.</span>
            </div>
            <div class="rm-field">
              <label class="rm-field__label">
                Raison du refus
                <span style="color:#c0392b;margin-left:3px">*</span>
              </label>
              <textarea
                v-model="rejeterRaison"
                class="rm-field__textarea"
                rows="3"
                placeholder="Ex : Indisponibilité, contrainte de cours, examen prévu…"
              ></textarea>
            </div>
          </div>

          <div class="rm-modal__foot">
            <button class="rm-btn rm-btn--ghost" @click="modalRejeter = false">Annuler</button>
            <button
              class="rm-btn rm-btn--red"
              :disabled="modalLoading || !rejeterRaison.trim()"
              @click="confirmerRejeter"
            >
              <div v-if="modalLoading" class="rm-spinner"></div>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Confirmer le refus
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

</div><!-- /.page-content -->
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'ReunionEtudiant',
  emits: ['toast'],
  data () {
    return {
      encadrant:      '',
      selectedReunion: null,   // the currently selected confirmed reunion
      rappelMap:      {},      // { [reunionId]: { delai, heure, scheduledAt } | null }
      modalRappel:    false,
      rappelForm:     { delai: '1', heure: '08:00' },
      rappelLoading:  false,
      propositions:   [],
      toast:   { show: false, msg: '', type: 'ok' },
      loading: false,
      // ── Modal Décliner ──
      reunionCible:  null,
      modalRejeter:  false,
      rejeterRaison: '',
      modalLoading:  false,
    }
  },
  computed: {
    pending () {
      return this.propositions.filter(p => p.statut === 'planifiee')
    },
    confirmed () {
      return this.propositions
        .filter(p => p.statut === 'confirmee')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    },
    annulees () {
      return this.propositions.filter(p => p.statut === 'annulee')
    },
    repondues () {
      return this.propositions.filter(p => p.statut === 'confirmee' || p.statut === 'annulee')
    },
    nextMeeting () {
      const now = new Date()
      return this.confirmed.find(m => new Date(m.date) >= now) || this.confirmed[0] || null
    },

    delaiOptions () {
      return [
        { val: '0', label: 'Le jour même',  sub: 'Jour J' },
        { val: '1', label: '1 jour avant',  sub: 'J-1' },
        { val: '2', label: '2 jours avant', sub: 'J-2' },
      ]
    },

    rappelPreviewDate () {
      if (!this.selectedReunion) return ''
      const d = new Date(this.selectedReunion.date)
      d.setDate(d.getDate() - parseInt(this.rappelForm.delai))
      return d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })
    },
  },
  mounted () {
    this.chargerReunions()
    this.chargerEncadrant()
  },
  methods: {
    // ── Data ──────────────────────────────────────────────────────────
    async chargerReunions () {
      try {
        const res = await api.get('/reunions')
        this.propositions = res.data.map(r => ({
          id:                  r.id,
          date:                new Date((r.date_reunion || '').replace(' ', 'T')),
          heure:               this.formatHeure(r.date_reunion),
          statut:              r.statut,
          motif:               r.motif,
          lieu:                r.lieu,
          type:                r.type,
          rappelScheduledAt:   r.rappel_scheduled_at || null,
          rappelFired:         r.rappel_fired || false,
        }))

        // Build per-reunion rappel map from server data
        const newMap = {}
        this.propositions.forEach(p => {
          if (p.rappelScheduledAt && !p.rappelFired && p.statut === 'confirmee') {
            newMap[p.id] = {
              scheduledAt: p.rappelScheduledAt,
              delai: this.rappelMap[p.id]?.delai || '1',
              heure: this.rappelMap[p.id]?.heure || (p.rappelScheduledAt?.slice(11, 16) || '08:00'),
            }
          }
        })
        this.rappelMap = newMap

        // Auto-select: keep current selection if still valid, else pick nextMeeting
        const stillValid = this.selectedReunion && this.propositions.find(p => p.id === this.selectedReunion.id && p.statut === 'confirmee')
        if (!stillValid) {
          this.selectedReunion = this.nextMeeting || this.confirmed[0] || null
        } else {
          // Refresh the selected reunion object with fresh data
          this.selectedReunion = this.propositions.find(p => p.id === this.selectedReunion.id) || null
        }
      } catch (e) {
        console.error('chargerReunions:', e)
      }
    },

    async chargerEncadrant () {
      try {
        const res = await api.get('/suivi/etudiant')
        this.encadrant = res.data.encadrant_nom || 'Encadrant'
      } catch {
        this.encadrant = 'Encadrant'
      }
    },

    // ── Actions ───────────────────────────────────────────────────────
    async confirmer (p) {
      this.loading = true
      try {
        await api.post(`/reunions/${p.id}/confirmer`)
        await this.chargerReunions()
        this.showToast(`Réunion confirmée — ${this.fmt(p.date)} à ${p.heure}`)
      } catch (e) {
        this.showToast(e.response?.data?.message || 'Erreur lors de la confirmation', 'err')
      } finally {
        this.loading = false
      }
    },

    ouvrirRejeter (p) {
      this.reunionCible  = p
      this.rejeterRaison = ''
      this.modalRejeter  = true
    },

    async confirmerRejeter () {
      if (!this.rejeterRaison.trim()) {
        this.showToast('Veuillez indiquer une raison', 'err')
        return
      }
      this.modalLoading = true
      try {
        await api.post(`/reunions/${this.reunionCible.id}/annuler`, { motif: this.rejeterRaison })
        await this.chargerReunions()
        this.showToast('Créneau décliné — votre encadrant a été notifié.', 'warn')
        this.modalRejeter = false
      } catch (e) {
        this.showToast(e.response?.data?.message || 'Erreur lors du déclin', 'err')
      } finally {
        this.modalLoading = false
      }
    },

    // ── Helpers ───────────────────────────────────────────────────────
    formatHeure (date) {
      if (!date) return ''
      const d = new Date(typeof date === 'string' ? date.replace(' ', 'T') : date)
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    },

    initials (n) {
      if (!n) return '?'
      return n.replace(/Dr\.|Prof\./gi, '').trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    },

    fmt (d) {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },

    fmtDay (d) {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    },

    dayName (d) {
      return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long' }).replace(/^\w/, c => c.toUpperCase())
    },

    countdown (d) {
      const diff = new Date(d) - new Date()
      if (diff < 0) return 'Passée'
      const days = Math.floor(diff / 86400000)
      if (days === 0) return "Aujourd'hui"
      if (days === 1) return 'Demain'
      return `Dans ${days} jours`
    },

    statutLabel (s) {
      return { planifiee: 'En attente', confirmee: 'Confirmée', annulee: 'Annulée', effectuee: 'Effectuée' }[s] || s
    },

    // ── Rappel ────────────────────────────────────────────────────────
    selectReunion (m) {
      this.selectedReunion = m
    },

    ouvrirRappel () {
      if (!this.selectedReunion) return
      const existing = this.rappelMap[this.selectedReunion.id]
      if (existing) {
        this.rappelForm.delai = existing.delai
        this.rappelForm.heure = existing.heure
      } else {
        this.rappelForm.delai = '1'
        this.rappelForm.heure = '08:00'
      }
      this.modalRappel = true
    },

    async confirmerRappel () {
      if (!this.selectedReunion) return
      this.rappelLoading = true

      const d = new Date(this.selectedReunion.date)
      d.setDate(d.getDate() - parseInt(this.rappelForm.delai))
      const [h, m] = this.rappelForm.heure.split(':').map(Number)
      d.setHours(h, m, 0, 0)

      const pad = n => String(n).padStart(2, '0')
      const scheduledAt = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`

      try {
        await api.post(`/reunions/${this.selectedReunion.id}/rappel`, {
          scheduled_at: scheduledAt,
          delai_jours:  parseInt(this.rappelForm.delai),
          heure:        this.rappelForm.heure,
        })
        this.rappelMap = {
          ...this.rappelMap,
          [this.selectedReunion.id]: { delai: this.rappelForm.delai, heure: this.rappelForm.heure, scheduledAt }
        }
        this.modalRappel = false
        const label = this.rappelForm.delai === '0' ? 'le jour même' : `J-${this.rappelForm.delai}`
        this.showToast(`Rappel activé pour le ${this.fmt(this.selectedReunion.date)} — ${label} à ${this.rappelForm.heure}`)
      } catch (e) {
        this.showToast(e.response?.data?.message || 'Erreur lors de la configuration du rappel.', 'err')
      } finally {
        this.rappelLoading = false
      }
    },

    async annulerRappel () {
      if (!this.selectedReunion) return
      try { await api.post(`/reunions/${this.selectedReunion.id}/rappel/annuler`) } catch { /* ignore */ }
      const newMap = { ...this.rappelMap }
      delete newMap[this.selectedReunion.id]
      this.rappelMap = newMap
      this.showToast('Rappel désactivé.', 'warn')
    },

    showToast (msg, type = 'ok') {
      this.toast = { show: true, msg, type }
      setTimeout(() => (this.toast.show = false), 3500)
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,700;1,700&family=Source+Sans+3:wght@300;400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.page-content { font-family: 'Source Sans 3', sans-serif; color: #1e2a35; }

/* ── HEADER ── */
.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px; gap: 16px; flex-wrap: wrap;
}
.ph-left { display: flex; align-items: center; gap: 14px; }
.ph-icon {
  width: 50px; height: 50px; border-radius: 15px; flex-shrink: 0;
  background: linear-gradient(145deg, #3d6b8a 0%, #1e3a52 100%);
  display: flex; align-items: center; justify-content: center; color: #f5a623;
  box-shadow: 0 4px 18px rgba(30,51,71,.28), 0 0 0 1px rgba(255,255,255,.06);
}
h2 { font-family: 'Merriweather', serif; font-size: 1.4rem; font-weight: 700; color: #1e2a35; margin-bottom: 3px; }
.subtitle { font-size: 0.84rem; color: #8a9aaa; font-weight: 300; }
.ph-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.enc-pill {
  display: flex; align-items: center; gap: 8px;
  background: #fff; border: 1.5px solid #dde3ea; border-radius: 22px;
  padding: 5px 14px 5px 5px; font-size: 0.82rem; font-weight: 600; color: #1e2a35;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.enc-pill-av {
  width: 26px; height: 26px; border-radius: 8px;
  background: linear-gradient(145deg, #3d6b8a, #1e3a52);
  color: #fff; font-size: 0.68rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.role-tag {
  background: linear-gradient(135deg, #3d6b8a, #1e3a52);
  color: #f5a623; padding: 6px 16px; border-radius: 22px;
  font-size: 0.76rem; font-weight: 700; letter-spacing: .05em;
}

/* ── TOAST ── */
.toast {
  display: flex; align-items: center; gap: 10px; padding: 12px 16px;
  border-radius: 12px; margin-bottom: 20px; font-size: 0.88rem; font-weight: 500;
  border: 1.5px solid; box-shadow: 0 6px 20px rgba(0,0,0,.1);
}
.toast-icon { display: flex; align-items: center; }
.toast-ok   { background: #eafaf1; color: #155724; border-color: #a8d5b5; }
.toast-warn { background: #fffbea; color: #7a5500; border-color: #f0d060; }
.toast-err  { background: #fff5f5; color: #721c24; border-color: #f0b8bc; }
.toast-x {
  margin-left: auto; background: none; border: none; cursor: pointer;
  color: inherit; opacity: .5; display: flex; align-items: center; transition: opacity .15s;
}
.toast-x:hover { opacity: 1; }
.toast-enter-active, .toast-leave-active { transition: all .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-8px); }

/* ── STATS STRIP ── */
.stats-strip {
  display: flex; gap: 10px; margin-bottom: 28px; flex-wrap: wrap;
}
.stat-pill {
  display: flex; flex-direction: column; align-items: center;
  padding: 12px 18px; border-radius: 14px; border: 1.5px solid;
  min-width: 86px; flex: 1; gap: 2px; transition: transform .15s, box-shadow .15s;
}
.stat-pill:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,.08); }
.stat-pill__icon { opacity: .7; margin-bottom: 2px; display: flex; }
.stat-pill__num  { font-size: 1.55rem; font-weight: 800; font-family: 'Merriweather', serif; line-height: 1; }
.stat-pill__lbl  { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; opacity: .72; }
.stat-pill--amber { background: rgba(245,166,35,.08); border-color: rgba(245,166,35,.32); color: #8a5e00; }
.stat-pill--green { background: rgba(39,174,96,.07); border-color: rgba(39,174,96,.28); color: #155724; }
.stat-pill--red   { background: rgba(192,57,43,.06); border-color: rgba(192,57,43,.22); color: #7b241c; }
.stat-pill--blue  { background: rgba(47,79,106,.07); border-color: rgba(47,79,106,.22); color: #2f4f6a; }

/* ── SECTION HEADS ── */
.section-head {
  display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;
}
.section-head__left {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .07em; color: #4a5a6a;
}
.sh-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sh-dot--amber { background: #f5a623; box-shadow: 0 0 0 3px rgba(245,166,35,.22); }
.sh-dot--grey  { background: #b0b8c4; }
.sh-dot--green { background: #27ae60; box-shadow: 0 0 0 3px rgba(39,174,96,.2); }
.sh-count {
  font-size: 0.7rem; font-weight: 800; padding: 1px 7px; border-radius: 10px;
  background: #e8e4dc; color: #4a5a6a;
}
.sh-count--green { background: #d4edda; color: #155724; }
.sh-badge {
  background: #f5a623; color: #1e2a35; font-size: 0.7rem; font-weight: 800;
  padding: 2px 9px; border-radius: 20px;
}
.sh-hint {
  font-size: 0.72rem; color: #8a9aaa; font-weight: 400; font-style: italic; margin-left: auto;
}

/* ── EMPTY STATE ── */
.empty-state {
  background: #f8f7f4; border: 2px dashed #d0ccc4; border-radius: 14px;
  padding: 44px 20px; text-align: center; color: #8a9aaa; margin-bottom: 20px;
}
.es-icon { margin-bottom: 12px; opacity: .35; }
.es-title { font-size: 0.97rem; font-weight: 700; color: #4a5a6a; margin-bottom: 5px; }
.es-sub   { font-size: 0.82rem; font-weight: 300; }

/* ── RÉPONSES DONNÉES GRID ── */
.repondues-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px; margin-bottom: 8px;
}
.rcard {
  border-radius: 13px; overflow: hidden;
  border: 1.5px solid #dde3ea;
  display: flex; background: #fff;
  box-shadow: 0 1px 6px rgba(0,0,0,.05);
  transition: box-shadow .18s, transform .18s;
}
.rcard:hover { box-shadow: 0 4px 18px rgba(0,0,0,.1); transform: translateY(-1px); }
.rcard-stripe { width: 4px; flex-shrink: 0; }
.rcard--confirmee .rcard-stripe { background: linear-gradient(180deg, #27ae60, #1e8449); }
.rcard--annulee   .rcard-stripe { background: linear-gradient(180deg, #e74c3c, #c0392b); }
.rcard--effectuee .rcard-stripe { background: linear-gradient(180deg, #2980b9, #1a6a9a); }
.rcard-inner {
  flex: 1; display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
}
.rcard-datecol { text-align: center; min-width: 46px; flex-shrink: 0; }
.rcard-day     { font-size: 0.65rem; font-weight: 700; color: #8a9aaa; text-transform: uppercase; letter-spacing: .04em; }
.rcard-datenum { font-size: 0.75rem; font-weight: 600; color: #4a5a6a; }
.rcard-heure   { font-size: 1rem; font-weight: 800; color: #1e2a35; font-family: 'Merriweather', serif; }
.rcard-body    { flex: 1; min-width: 0; }
.rcard-enc {
  font-size: 0.84rem; font-weight: 700; color: #1e2a35; margin-bottom: 4px;
  display: flex; align-items: center; gap: 6px;
}
.rcard-enc-av {
  width: 20px; height: 20px; border-radius: 5px; flex-shrink: 0;
  background: linear-gradient(145deg, #3d6b8a, #1e3a52);
  color: #fff; font-size: 0.6rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.rcard-lieu, .rcard-motif {
  display: flex; align-items: center; gap: 4px;
  font-size: 0.73rem; color: #8a9aaa; margin-top: 2px;
}
.rcard-motif { color: #7b241c; }
.rcard-badge {
  font-size: 0.67rem; font-weight: 700; padding: 3px 10px; border-radius: 20px;
  white-space: nowrap; flex-shrink: 0; align-self: flex-start;
}
.badge-planifiee { background: rgba(245,166,35,.15); color: #8a5e00; border: 1px solid rgba(245,166,35,.3); }
.badge-confirmee { background: #d4edda; color: #155724; border: 1px solid #b8ddc6; }
.badge-annulee   { background: #fde8e8; color: #721c24; border: 1px solid #f0baba; }
.badge-effectuee { background: #d1ecf1; color: #0c5460; border: 1px solid #a8d8e0; }

/* ── PENDING PROP CARD ── */
.prop-card {
  display: flex; margin-bottom: 12px;
  background: #fff; border: 1.5px solid #dde3ea; border-radius: 15px;
  overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.06);
  transition: box-shadow .18s, transform .18s;
}
.prop-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,.11); transform: translateY(-1px); }
.pc-left {
  width: 82px; flex-shrink: 0;
  background: linear-gradient(155deg, #3d6b8a 0%, #1e3a52 100%);
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 2px; padding: 18px 8px;
}
.pc-day      { font-size: 0.68rem; font-weight: 700; color: rgba(255,255,255,.65); text-transform: uppercase; letter-spacing: .05em; }
.pc-datenum  { font-size: 0.78rem; font-weight: 600; color: rgba(255,255,255,.8); }
.pc-heure    { font-family: 'Merriweather', serif; font-size: 1.5rem; font-weight: 700; color: #f5a623; line-height: 1; margin: 5px 0; }
.pc-type-badge {
  font-size: 0.6rem; font-weight: 700; text-transform: capitalize;
  background: rgba(245,166,35,.28); color: #f5a623; border-radius: 6px; padding: 2px 7px;
  letter-spacing: .03em;
}
.pc-body { flex: 1; padding: 14px 18px; display: flex; flex-direction: column; gap: 12px; }
.pc-enc-row  { display: flex; align-items: center; gap: 10px; }
.pc-enc-av {
  width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(145deg, #3d6b8a, #1e3a52);
  color: #fff; font-size: 0.75rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.pc-enc-info { flex: 1; }
.pc-enc-nom  { font-size: 0.9rem; font-weight: 700; color: #1e2a35; }
.pc-enc-sub  { font-size: 0.75rem; color: #8a9aaa; margin-top: 1px; }
.pc-statut-dot {
  width: 9px; height: 9px; border-radius: 50%;
  background: #f5a623; box-shadow: 0 0 0 3px rgba(245,166,35,.25); flex-shrink: 0;
}
.pc-actions { display: flex; gap: 8px; }
.pc-btn {
  flex: 1; padding: 9px 12px; border-radius: 10px; border: 1.5px solid;
  font-size: 0.82rem; font-weight: 700; cursor: pointer;
  font-family: 'Source Sans 3', sans-serif; transition: all .15s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.pc-btn:disabled { opacity: .45; cursor: not-allowed; }
.pc-btn--confirm {
  background: linear-gradient(135deg, #f5a623, #d98e1a);
  border-color: #c8800e; color: #1e2a35;
}
.pc-btn--confirm:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(245,166,35,.38); }
.pc-btn--decline { background: #f8f7f4; border-color: #d0ccc4; color: #4a5a6a; }
.pc-btn--decline:hover { border-color: #e74c3c; color: #c0392b; background: rgba(231,76,60,.05); }

/* ══ CONFIRMED + RAPPEL side-by-side ══ */
.confirmed-rappel-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 16px;
  align-items: start;
}
@media (max-width: 720px) {
  .confirmed-rappel-layout { grid-template-columns: 1fr; }
  .repondues-grid { grid-template-columns: 1fr; }
}

/* ── CONFIRMED LIST ── */
.confirmed-list {
  background: #fff;
  border: 1.5px solid #dde3ea;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,.05);
}
.cl-row {
  display: flex; align-items: center; gap: 0;
  padding: 12px 16px;
  border-bottom: 1px solid #f0eee9;
  cursor: pointer;
  transition: background .15s;
  position: relative;
}
.cl-row:last-child { border-bottom: none; }
.cl-row:hover { background: #f8f7f4; }
.cl-row--selected { background: rgba(61,107,138,.07); }
.cl-row--selected::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px; background: #3d6b8a; border-radius: 0 2px 2px 0;
}
.cl-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
.cl-datebox {
  width: 44px; flex-shrink: 0; text-align: center;
  background: #f0eee9; border-radius: 9px; padding: 6px 4px;
}
.cl-row--selected .cl-datebox { background: rgba(61,107,138,.14); }
.cl-row--next .cl-datebox     { background: rgba(245,166,35,.15); }
.cl-day     { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; color: #8a9aaa; letter-spacing: .05em; }
.cl-datenum { font-size: 0.78rem; font-weight: 700; color: #1e2a35; margin-top: 1px; }
.cl-info { flex: 1; min-width: 0; }
.cl-heure { font-size: 0.95rem; font-weight: 700; color: #1e2a35; font-family: 'Merriweather', serif; }
.cl-meta  { display: flex; align-items: center; gap: 8px; margin-top: 2px; flex-wrap: wrap; }
.cl-lieu  { display: flex; align-items: center; gap: 4px; font-size: 0.72rem; color: #8a9aaa; }
.cl-type  { font-size: 0.68rem; font-weight: 700; color: #4a5a6a; background: #f0eee9; border-radius: 5px; padding: 1px 6px; text-transform: capitalize; }
.cl-right { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
.cl-next-badge {
  font-size: 0.63rem; font-weight: 700; padding: 2px 7px; border-radius: 8px;
  background: rgba(245,166,35,.18); color: #8a5e00; border: 1px solid rgba(245,166,35,.3);
  text-transform: uppercase; letter-spacing: .04em;
}
.cl-bell { color: #b07d10; display: flex; }
.cl-check { color: #27ae60; display: flex; }

/* ── RAPPEL PANEL ── */
.rappel-panel {
  background: linear-gradient(155deg, #2b4a62 0%, #1a3347 100%);
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 8px 28px rgba(26,51,71,.3), 0 0 0 1px rgba(255,255,255,.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* reunion mini-card inside rappel panel */
.rp-reunion-card {
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 12px;
  padding: 12px 14px;
}
.rp-rc-top { display: flex; align-items: flex-start; gap: 12px; }
.rp-rc-datebox {
  width: 46px; height: 46px; border-radius: 10px; flex-shrink: 0;
  background: rgba(245,166,35,.2); border: 1px solid rgba(245,166,35,.35);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
}
.rp-rc-day     { font-size: 0.6rem; font-weight: 700; color: #f5a623; text-transform: uppercase; letter-spacing: .04em; }
.rp-rc-datenum { font-size: 0.78rem; font-weight: 700; color: #f5a623; }
.rp-rc-info    { flex: 1; }
.rp-rc-heure   { font-family: 'Merriweather', serif; font-size: 1.5rem; font-weight: 700; color: #f5a623; line-height: 1; }
.rp-rc-enc     { font-size: 0.8rem; color: rgba(255,255,255,.7); margin-top: 3px; font-weight: 500; }
.rp-rc-countdown {
  display: inline-flex; align-items: center;
  font-size: 0.72rem; font-weight: 600; color: rgba(255,255,255,.5);
  margin-top: 4px;
}

/* active banner */
.rp-active-banner {
  display: flex; align-items: center; gap: 8px;
  background: rgba(39,174,96,.18); border: 1px solid rgba(39,174,96,.35);
  border-radius: 10px; padding: 9px 12px;
  font-size: 0.8rem; color: #a8e6c0; font-weight: 500;
}
.rp-ab-left { display: flex; align-items: center; gap: 8px; flex: 1; }
.rp-ab-left strong { color: #eafaf1; }
.rp-ab-cancel {
  width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
  background: rgba(231,76,60,.2); border: 1px solid rgba(231,76,60,.3);
  color: #f1948a; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: .15s;
}
.rp-ab-cancel:hover { background: rgba(231,76,60,.4); color: #fff; }

/* rappel button */
.btn-rappel {
  width: 100%; padding: 11px; background: rgba(255,255,255,.1);
  border: 1.5px solid rgba(255,255,255,.2); border-radius: 11px;
  color: rgba(255,255,255,.8); font-size: 0.84rem; font-weight: 700; cursor: pointer;
  font-family: 'Source Sans 3', sans-serif; transition: all .18s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-rappel:hover {
  background: rgba(245,166,35,.22); border-color: rgba(245,166,35,.6);
  color: #f5a623; transform: translateY(-1px);
}
.btn-rappel.active {
  background: rgba(245,166,35,.22); border-color: #f5a623; color: #f5a623;
}

.rp-empty {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 20px; text-align: center; color: rgba(255,255,255,.35);
}
.rp-empty p { font-size: 0.8rem; line-height: 1.5; }

.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ══════════════════════════════════════════════════
   MODALS
   ══════════════════════════════════════════════════ */
.rm-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(10,18,28,.55); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.rm-modal {
  width: 100%; max-width: 430px; border-radius: 20px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 4px 6px rgba(0,0,0,.08), 0 28px 72px rgba(0,0,0,.32), 0 0 0 1px rgba(255,255,255,.07);
}
.rm-modal--red   { background: #fff8f7; border: 1.5px solid rgba(192,57,43,.18); }
.rm-modal--amber { background: #fffdf7; border: 1.5px solid rgba(245,166,35,.22); }

.rm-modal__head--red {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 20px 22px; background: linear-gradient(135deg, #9b2020 0%, #5e0e0e 100%);
}
.rm-modal__head--amber {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 20px 22px; background: linear-gradient(135deg, #b07d10 0%, #6a4c00 100%);
}
.rm-modal__head-left { display: flex; align-items: center; gap: 13px; flex: 1; min-width: 0; }
.rm-modal__icon {
  width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0;
  background: rgba(255,255,255,.16); border: 1.5px solid rgba(255,255,255,.26);
  display: flex; align-items: center; justify-content: center; color: #fff;
}
.rm-modal__title { font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 2px; font-family: 'Merriweather', serif; }
.rm-modal__sub   { font-size: 11.5px; color: rgba(255,255,255,.58); font-weight: 500; }
.rm-modal__close {
  width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
  background: rgba(255,255,255,.12); border: none; color: rgba(255,255,255,.72);
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: .14s;
}
.rm-modal__close:hover { background: rgba(255,255,255,.26); color: #fff; }

.rm-modal__body { padding: 22px 24px; display: flex; flex-direction: column; gap: 16px; }
.rm-modal--red   .rm-modal__body { background: #fff8f7; }
.rm-modal--amber .rm-modal__body { background: #fffdf7; }

.rm-modal__warn {
  display: flex; align-items: flex-start; gap: 10px;
  background: rgba(192,57,43,.07); border: 1.5px solid rgba(192,57,43,.18);
  border-radius: 11px; padding: 12px 14px;
  font-size: 13px; color: #7b241c; font-weight: 500; line-height: 1.5;
}
.rm-modal__warn svg { flex-shrink: 0; margin-top: 1px; color: #c0392b; }

.rm-field { display: flex; flex-direction: column; gap: 6px; }
.rm-field__label {
  font-size: 0.72rem; font-weight: 700; color: #4a5a6a;
  text-transform: uppercase; letter-spacing: .06em;
}
.rm-field__textarea {
  padding: 10px 12px; border: 1.5px solid #d0ccc4; border-radius: 10px;
  font-size: 0.84rem; font-family: 'Source Sans 3', sans-serif;
  color: #1e2a35; background: #f8f7f4; outline: none; resize: vertical; min-height: 84px;
  width: 100%; transition: border-color .15s, background .15s;
}
.rm-field__textarea:focus { border-color: #c0392b; background: #fff; }

.rm-modal__foot {
  display: flex; justify-content: flex-end; gap: 8px; padding: 15px 24px;
  border-top: 1.5px solid; 
}
.rm-modal--red   .rm-modal__foot { border-color: rgba(192,57,43,.14); background: rgba(192,57,43,.03); }
.rm-modal--amber .rm-modal__foot { border-color: rgba(245,166,35,.18); background: rgba(245,166,35,.04); }

.rm-btn {
  display: flex; align-items: center; gap: 7px; padding: 9px 20px;
  border-radius: 10px; border: 1.5px solid; font-size: 0.83rem; font-weight: 700;
  cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: all .15s;
}
.rm-btn:disabled { opacity: .5; cursor: not-allowed; }
.rm-btn--ghost { background: #f8f7f4; border-color: #d0ccc4; color: #4a5a6a; }
.rm-btn--ghost:hover { background: #eceae4; color: #1e2a35; }
.rm-btn--red   { background: #9b2020; border-color: #7b1a1a; color: #fff; }
.rm-btn--red:hover:not(:disabled) { background: #7b1a1a; box-shadow: 0 5px 14px rgba(155,32,32,.32); }
.rm-btn--amber { background: #b07d10; border-color: #7a5500; color: #fff; }
.rm-btn--amber:hover:not(:disabled) { background: #7a5500; box-shadow: 0 5px 14px rgba(176,125,16,.32); }

.rm-spinner {
  width: 13px; height: 13px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,.32); border-top-color: #fff;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.rm-modal-enter-active, .rm-modal-leave-active { transition: all .22s cubic-bezier(.4,0,.2,1); }
.rm-modal-enter-from, .rm-modal-leave-to { opacity: 0; transform: scale(.95) translateY(8px); }

/* ── RAPPEL MODAL INTERNALS ── */
.rappel-modal-info {
  display: flex; align-items: flex-start; gap: 10px;
  background: rgba(245,166,35,.09); border: 1.5px solid rgba(245,166,35,.28);
  border-radius: 11px; padding: 12px 14px;
  font-size: 13px; color: #7a5500; line-height: 1.5;
}
.rappel-modal-info svg { flex-shrink: 0; margin-top: 1px; color: #b07d10; }

.rappel-delai-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 4px;
}
.rappel-delai-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 11px 6px; border-radius: 11px; border: 1.5px solid #d0ccc4;
  background: #f8f7f4; cursor: pointer; transition: all .15s; gap: 3px;
  font-family: 'Source Sans 3', sans-serif;
}
.rappel-delai-btn:hover { border-color: #b07d10; background: rgba(245,166,35,.08); }
.rappel-delai-btn.active {
  border-color: #b07d10; background: rgba(245,166,35,.14); box-shadow: 0 0 0 3px rgba(245,166,35,.12);
}
.rdl-main { font-size: 0.82rem; font-weight: 700; color: #1e2a35; }
.rdl-sub  { font-size: 0.68rem; color: #8a9aaa; }
.rappel-delai-btn.active .rdl-main,
.rappel-delai-btn.active .rdl-sub { color: #7a5500; }

.rappel-heure-input {
  width: 100%; padding: 9px 12px; margin-top: 4px;
  border: 1.5px solid #d0ccc4; border-radius: 10px;
  font-size: 0.92rem; font-weight: 600; color: #1e2a35;
  background: #f8f7f4; font-family: 'Source Sans 3', sans-serif;
  outline: none; transition: border-color .15s, background .15s;
}
.rappel-heure-input:focus { border-color: #b07d10; background: #fff; }

.rappel-preview {
  display: flex; align-items: center; gap: 9px;
  background: #eafaf1; border: 1.5px solid #b8ddc6;
  border-radius: 10px; padding: 10px 14px;
  font-size: 0.83rem; color: #155724;
}
.rappel-preview svg { color: #27ae60; flex-shrink: 0; }
</style>