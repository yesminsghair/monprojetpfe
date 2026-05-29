<template>
  <div class="ed-wrapper">

    <!-- ── Header ──────────────────────────────────────────────────────── -->
    <div class="ed-header">
      <div class="ed-header__left">
        <div class="ed-header__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div>
          <h2 class="ed-page-title">Encadrants disponibles</h2>
          <p class="ed-page-sub">
            <span class="ed-badge-count">{{ nbDisponibles }}</span>
            disponible{{ nbDisponibles !== 1 ? 's' : '' }}
            <span v-if="nbComplets" class="ed-badge-count ed-badge-count--full">
              {{ nbComplets }} complet{{ nbComplets !== 1 ? 's' : '' }}
            </span>
          </p>
        </div>
      </div>

      <!-- Barre de recherche -->
      <div class="ed-search">
        <svg class="ed-search__icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" class="ed-search__input" placeholder="Nom, domaine, thème…" />
        <button v-if="search" class="ed-search__clear" @click="search=''">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ── Locked state ─────────────────────────────────────────────────── -->
    <div v-if="maDemande && (maDemande.statut==='en_attente' || maDemande.statut==='acceptee')" class="ed-locked">
      <div class="ed-locked__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <p class="ed-locked__title">{{ maDemande.statut==='en_attente' ? 'Demande en attente' : 'Encadrant assigné' }}</p>
      <p class="ed-locked__sub">{{ maDemande.statut==='en_attente' ? 'Attendez la réponse de votre encadrant avant d\'en choisir un autre.' : 'Votre demande a été acceptée — vous avez un encadrant.' }}</p>
      <button class="ed-btn ed-btn--outline mt-3" @click="$emit('navigate','consulter-demande')">Voir ma demande →</button>
    </div>

    <template v-else>

      <!-- ── Empty state ────────────────────────────────────────────────── -->
      <div v-if="!encadrantsFiltres.length" class="ed-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p>Aucun encadrant ne correspond à votre recherche.</p>
        <button v-if="search" class="ed-btn ed-btn--ghost" @click="search=''">Effacer la recherche</button>
      </div>

      <!-- ── Grid ───────────────────────────────────────────────────────── -->
      <div v-else class="ed-grid">
        <div v-for="e in encadrantsFiltres" :key="e.id" class="ed-card" :class="{ 'ed-card--full': !e.disponible, 'ed-card--available': e.disponible }">

          <!-- Ribbon dispo -->
          <div class="ed-card__ribbon" :class="e.disponible ? 'ed-ribbon--available' : 'ed-ribbon--full'">
            <span v-if="e.disponible">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
              Disponible
            </span>
            <span v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
              Complet
            </span>
          </div>

          <!-- Identité -->
          <div class="ed-card__top">
            <div class="ed-av" :class="e.disponible ? 'ed-av--gold' : 'ed-av--grey'">
              {{ initiales(e.prenom, e.nom) }}
            </div>
            <div class="ed-card__identity">
              <div class="ed-card__name">{{ e.prenom }} {{ e.nom }}</div>
              <div class="ed-card__domaine">{{ e.domaine || 'Encadrant' }}</div>
            </div>
          </div>

          <!-- Jauge capacité -->
          <div class="ed-capacity">
            <div class="ed-capacity__labels">
              <span class="ed-capacity__lbl">Capacité</span>
              <span class="ed-capacity__val">
                <strong>{{ e.nb_affectes || 0 }}</strong> / {{ e.capacite || 5 }}
              </span>
            </div>
            <div class="ed-capacity__track">
              <div
                class="ed-capacity__fill"
                :class="capaciteClass(e)"
                :style="{ width: capacitePct(e) + '%' }"
              ></div>
            </div>
          </div>

          <!-- Tags thèmes (si disponibles) -->
          <div v-if="e.themes" class="ed-tags">
            <span v-for="t in splitThemes(e.themes)" :key="t" class="ed-tag">{{ t }}</span>
          </div>

          <!-- Infos complémentaires -->
          <div class="ed-card__meta">
            <span v-if="e.encadrement" class="ed-meta-chip">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              {{ e.encadrement }}
            </span>
            <span v-if="e.cotutelle === 'oui'" class="ed-meta-chip ed-meta-chip--gold">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Cotutelle
            </span>
          </div>

          <!-- Actions -->
          <div class="ed-card__actions">
            <button class="ed-btn ed-btn--ghost ed-btn--sm" @click="fiche=e">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              Voir la fiche
            </button>
            <button
              v-if="accordMutuelActif"
              class="ed-btn ed-btn--primary ed-btn--sm"
              :disabled="!e.disponible"
              @click="choisir(e)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Choisir
            </button>
          </div>
        </div>
      </div>

    </template>

    <!-- ── Modal fiche ────────────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="ed-modal">
        <div v-if="fiche" class="ed-modal-backdrop" @click.self="fiche=null">
          <div class="ed-modal-dialog">

            <!-- Header modal -->
            <div class="ed-modal-header" :class="fiche.disponible ? 'ed-mh--gold' : 'ed-mh--grey'">
              <div class="ed-modal-av">{{ initiales(fiche.prenom, fiche.nom) }}</div>
              <div class="ed-modal-identity">
                <h5 class="ed-modal-name">{{ fiche.prenom }} {{ fiche.nom }}</h5>
                <span class="ed-modal-role">Encadrant PFE</span>
              </div>
              <div class="ed-modal-status-pill" :class="fiche.disponible ? 'ed-pill--available' : 'ed-pill--full'">
                {{ fiche.disponible ? 'Disponible' : 'Complet' }}
              </div>
              <button class="ed-modal-close" @click="fiche=null">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- Body modal -->
            <div class="ed-modal-body">

              <!-- Capacité (highlight) -->
              <div class="ed-modal-capacity-block" :class="fiche.disponible ? 'ed-cap--ok' : 'ed-cap--full'">
                <div class="ed-cap-row">
                  <span class="ed-cap-label">Étudiants encadrés</span>
                  <span class="ed-cap-value">{{ fiche.nb_affectes || 0 }} / {{ fiche.capacite || 5 }}</span>
                </div>
                <div class="ed-cap-track">
                  <div
                    class="ed-cap-fill"
                    :class="capaciteClass(fiche)"
                    :style="{ width: capacitePct(fiche) + '%' }"
                  ></div>
                </div>
                <div class="ed-cap-sub">{{ (fiche.capacite || 5) - (fiche.nb_affectes || 0) }} place{{ ((fiche.capacite||5)-(fiche.nb_affectes||0)) > 1 ? 's' : '' }} disponible{{ ((fiche.capacite||5)-(fiche.nb_affectes||0)) > 1 ? 's' : '' }}</div>
              </div>

              <!-- Grille infos -->
              <div class="ed-modal-grid">
                <div class="ed-mf">
                  <span class="ed-mf__lbl">Domaine d'expertise</span>
                  <span class="ed-mf__val">{{ fiche.domaine || '—' }}</span>
                </div>
                <div class="ed-mf">
                  <span class="ed-mf__lbl">Spécialité</span>
                  <span class="ed-mf__val">{{ fiche.specialite || '—' }}</span>
                </div>
                <div class="ed-mf">
                  <span class="ed-mf__lbl">Adresse e-mail</span>
                  <span class="ed-mf__val">{{ fiche.email || '—' }}</span>
                </div>
                <div class="ed-mf">
                  <span class="ed-mf__lbl">Téléphone</span>
                  <span class="ed-mf__val">{{ fiche.telephone || '—' }}</span>
                </div>
                <div v-if="fiche.encadrement" class="ed-mf">
                  <span class="ed-mf__lbl">Type d'encadrement</span>
                  <span class="ed-mf__val">{{ fiche.encadrement }}</span>
                </div>
                <div v-if="fiche.cotutelle" class="ed-mf">
                  <span class="ed-mf__lbl">Cotutelle</span>
                  <span class="ed-mf__val">{{ fiche.cotutelle === 'oui' ? 'Acceptée' : 'Non' }}</span>
                </div>
              </div>

              <!-- Thèmes -->
              <div v-if="fiche.themes" class="ed-modal-section">
                <span class="ed-section-title">Thèmes de recherche</span>
                <div class="ed-tags ed-tags--modal">
                  <span v-for="t in splitThemes(fiche.themes)" :key="t" class="ed-tag ed-tag--lg">{{ t }}</span>
                </div>
              </div>

              <!-- Commentaire voeu -->
              <div v-if="fiche.commentaire" class="ed-modal-section">
                <span class="ed-section-title">Commentaire de l'encadrant</span>
                <div class="ed-commentaire">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:2px">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span style="white-space:pre-line">{{ fiche.commentaire }}</span>
                </div>
              </div>

            </div>

            <!-- Footer modal -->
            <div class="ed-modal-footer">
              <button class="ed-btn ed-btn--ghost" @click="fiche=null">Fermer</button>
              <button
                v-if="accordMutuelActif"
                class="ed-btn ed-btn--primary"
                :disabled="!fiche.disponible"
                @click="choisir(fiche); fiche=null"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Choisir comme encadrant
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script>
export default {
  name: 'EncadrantsDisponibles',
  emits: ['choisir', 'navigate'],
  props: {
    encadrants:        { type: Array,   default: () => [] },
    maDemande:         { type: Object,  default: null     },
    accordMutuelActif: { type: Boolean, default: false    },
    // contraintes supprimées : le backend les applique déjà (exclure_encadrant,
    // cap_override). Re-filtrer ici créait une logique dupliquée et désynchronisée.
  },
  data () { return { search: '', fiche: null } },
  computed: {
    // Le backend a déjà :
    //  • exclu les encadrants via exclure_encadrant
    //  • recalculé la capacité via cap_override
    //  • positionné e.disponible = true/false
    // Ce composant ne fait que la recherche texte côté client.
    encadrantsFiltres () {
      if (!this.search) return this.encadrants
      const q = this.search.toLowerCase()
      return this.encadrants.filter(e =>
        (`${e.nom} ${e.prenom}`).toLowerCase().includes(q) ||
        (e.domaine || '').toLowerCase().includes(q) ||
        (e.themes  || '').toLowerCase().includes(q)
      )
    },
    nbDisponibles () {
      return this.encadrantsFiltres.filter(e => e.disponible).length
    },
    nbComplets () {
      return this.encadrantsFiltres.filter(e => !e.disponible).length
    },
  },
  methods: {
    initiales (prenom = '', nom = '') {
      return `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase() || '?'
    },
    choisir (e) { this.$emit('choisir', e) },
    capacitePct (e) {
      const max = e.capacite || 5
      return Math.min(100, Math.round(((e.nb_affectes || 0) / max) * 100))
    },
    capaciteClass (e) {
      const pct = this.capacitePct(e)
      if (pct >= 100) return 'fill--full'
      if (pct >= 70)  return 'fill--warn'
      return 'fill--ok'
    },
    splitThemes (themes) {
      if (!themes) return []
      return themes.split(/[,;|\n]/).map(t => t.trim()).filter(Boolean).slice(0, 5)
    },
  },
}
</script>

<style scoped>
/* ── Wrapper ─────────────────────────────────────────────────────────── */
.ed-wrapper { container-type: inline-size; }

/* ── Tokens ──────────────────────────────────────────────────────────── */
:root, .ed-wrapper {
  --ed-gold:        #f5a623;
  --ed-gold-light:  #fff4d6;
  --ed-gold-mid:    #ffd98a;
  --ed-gold-dark:   #c4820f;
  --ed-gold-text:   #7a4800;
  --ed-green:       #10b981;
  --ed-green-light: #d1fae5;
  --ed-red:         #ef4444;
  --ed-red-light:   #fee2e2;
  --ed-grey:        #64748b;
  --ed-grey-light:  #f1f5f9;
  --ed-border:      var(--vld-border, #e2e8f0);
  --ed-surface:     var(--vld-surface, #fff);
  --ed-r:           14px;
}

/* ── Header ──────────────────────────────────────────────────────────── */
.ed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.ed-header__left { display: flex; align-items: center; gap: 14px; }
.ed-header__icon {
  width: 46px; height: 46px;
  border-radius: 12px;
  background: var(--ed-gold-light);
  color: var(--ed-gold-dark);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.ed-page-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--vld-text-strong, #1e293b);
  margin: 0;
}
.ed-page-sub {
  font-size: 13px;
  color: var(--vld-text-muted, #64748b);
  margin: 2px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ed-badge-count {
  background: var(--ed-gold-light);
  color: var(--ed-gold-dark);
  font-weight: 700;
  font-size: 12px;
  padding: 1px 7px;
  border-radius: 20px;
  border: 1px solid var(--ed-gold-mid);
}
.ed-badge-count--full {
  background: var(--ed-grey-light);
  color: var(--ed-grey);
  border-color: #cbd5e1;
}

/* ── Search ──────────────────────────────────────────────────────────── */
.ed-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--ed-surface);
  border: 1.5px solid var(--ed-border);
  border-radius: 10px;
  padding: 8px 12px;
  width: 260px;
  transition: border-color .15s, box-shadow .15s;
}
.ed-search:focus-within {
  border-color: var(--ed-gold);
  box-shadow: 0 0 0 3px rgba(245,166,35,.15);
}
.ed-search__icon { color: var(--vld-text-muted, #94a3b8); flex-shrink: 0; }
.ed-search__input {
  border: none; outline: none; background: transparent;
  font-size: 13.5px; color: var(--vld-text-strong, #1e293b); width: 100%;
}
.ed-search__input::placeholder { color: var(--vld-text-muted, #94a3b8); }
.ed-search__clear {
  background: none; border: none; padding: 2px; cursor: pointer;
  color: var(--vld-text-muted, #94a3b8); line-height: 1; flex-shrink: 0;
}
.ed-search__clear:hover { color: var(--ed-red); }

/* ── Locked state ────────────────────────────────────────────────────── */
.ed-locked {
  text-align: center;
  padding: 48px 24px;
  background: var(--ed-gold-light);
  border: 2px dashed var(--ed-gold-mid);
  border-radius: var(--ed-r);
}
.ed-locked__icon {
  width: 72px; height: 72px;
  background: var(--ed-gold-mid);
  color: var(--ed-gold-dark);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.ed-locked__title { font-size: 1.05rem; font-weight: 700; color: var(--ed-gold-text); margin: 0 0 6px; }
.ed-locked__sub { font-size: 13.5px; color: var(--ed-gold-dark); margin: 0 0 8px; }

/* ── Empty ───────────────────────────────────────────────────────────── */
.ed-empty {
  text-align: center;
  padding: 56px 24px;
  color: var(--vld-text-muted, #94a3b8);
}
.ed-empty svg { margin-bottom: 12px; opacity: .4; }
.ed-empty p { font-size: 14px; margin-bottom: 12px; }

/* ── Grid ────────────────────────────────────────────────────────────── */
.ed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* ── Card ────────────────────────────────────────────────────────────── */
.ed-card {
  background: var(--ed-surface);
  border-radius: var(--ed-r);
  border: 1.5px solid var(--ed-border);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow .18s, border-color .18s, transform .18s;
  position: relative;
  overflow: hidden;
}
.ed-card--available {
  border-color: var(--ed-gold-mid);
}
.ed-card--available:hover {
  box-shadow: 0 6px 24px rgba(245,166,35,.16);
  border-color: var(--ed-gold);
  transform: translateY(-2px);
}
.ed-card--full {
  opacity: .72;
}
.ed-card--full:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,.07);
}

/* Accent stripe top */
.ed-card--available::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--ed-gold), var(--ed-gold-dark));
  border-radius: var(--ed-r) var(--ed-r) 0 0;
}

/* ── Ribbon ──────────────────────────────────────────────────────────── */
.ed-card__ribbon {
  position: absolute;
  top: 14px; right: 14px;
  font-size: 10.5px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  display: flex; align-items: center; gap: 4px;
}
.ed-ribbon--available {
  background: var(--ed-gold-light);
  color: var(--ed-gold-dark);
  border: 1px solid var(--ed-gold-mid);
}
.ed-ribbon--full {
  background: var(--ed-grey-light);
  color: var(--ed-grey);
  border: 1px solid #cbd5e1;
}

/* ── Card top ────────────────────────────────────────────────────────── */
.ed-card__top { display: flex; align-items: center; gap: 12px; padding-right: 80px; }
.ed-card__identity { flex: 1; min-width: 0; }
.ed-card__name {
  font-size: 15px; font-weight: 700;
  color: var(--vld-text-strong, #1e293b);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ed-card__domaine {
  font-size: 12px;
  color: var(--vld-text-muted, #64748b);
  margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 100%;
}

/* ── Avatar ──────────────────────────────────────────────────────────── */
.ed-av {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 700;
  flex-shrink: 0;
}
.ed-av--gold {
  background: var(--ed-gold-light);
  color: var(--ed-gold-dark);
  border: 2px solid var(--ed-gold-mid);
}
.ed-av--grey {
  background: var(--ed-grey-light);
  color: var(--ed-grey);
  border: 2px solid #cbd5e1;
}

/* ── Capacity ────────────────────────────────────────────────────────── */
.ed-capacity { display: flex; flex-direction: column; gap: 5px; }
.ed-capacity__labels {
  display: flex; justify-content: space-between; align-items: center;
}
.ed-capacity__lbl { font-size: 11px; color: var(--vld-text-muted, #94a3b8); text-transform: uppercase; letter-spacing: .05em; font-weight: 600; }
.ed-capacity__val { font-size: 12.5px; font-weight: 700; color: var(--vld-text-strong, #1e293b); }
.ed-capacity__track {
  height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden;
}
.ed-capacity__fill {
  height: 100%; border-radius: 10px;
  transition: width .4s ease;
}
.fill--ok   { background: linear-gradient(90deg, var(--ed-gold), var(--ed-gold-dark)); }
.fill--warn { background: linear-gradient(90deg, #fb923c, #ea580c); }
.fill--full { background: linear-gradient(90deg, var(--ed-red), #b91c1c); }

/* ── Tags ────────────────────────────────────────────────────────────── */
.ed-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.ed-tag {
  font-size: 11px; font-weight: 500;
  background: var(--ed-gold-light);
  color: var(--ed-gold-dark);
  border: 1px solid var(--ed-gold-mid);
  border-radius: 20px;
  padding: 2px 9px;
}

/* ── Meta chips ──────────────────────────────────────────────────────── */
.ed-card__meta { display: flex; flex-wrap: wrap; gap: 5px; }
.ed-meta-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 500;
  background: #f8fafc; border: 1px solid #e2e8f0;
  color: var(--ed-grey); border-radius: 6px; padding: 2px 8px;
}
.ed-meta-chip--gold {
  background: var(--ed-gold-light);
  border-color: var(--ed-gold-mid);
  color: var(--ed-gold-dark);
}

/* ── Card actions ────────────────────────────────────────────────────── */
.ed-card__actions { display: flex; gap: 8px; margin-top: auto; }

/* ── Buttons ─────────────────────────────────────────────────────────── */
.ed-btn {
  display: inline-flex; align-items: center; gap: 6px;
  border: none; border-radius: 9px; cursor: pointer;
  font-size: 13.5px; font-weight: 600; padding: 8px 14px;
  transition: all .15s; text-decoration: none;
}
.ed-btn:disabled { opacity: .45; cursor: not-allowed; }
.ed-btn--sm { font-size: 12.5px; padding: 7px 12px; flex: 1; justify-content: center; }

/* Primary → bleu */
.ed-btn--primary {
  background: linear-gradient(135deg, #3d6080, #3d6080);
  color: #fff;
  box-shadow: 0 2px 8px rgba(61,96,128,.28);
}
.ed-btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #3d6080, #2f4f6a);
  box-shadow: 0 4px 14px rgba(61,96,128,.38);
  transform: translateY(-1px);
}

/* Outline → bleu léger */
.ed-btn--outline {
  background: transparent;
  border: 1.5px solid #3d6080;
  color: #3d6080;
}
.ed-btn--outline:hover { background: #eef3f7; }

/* Ghost → neutre */
.ed-btn--ghost {
  background: #f8fafc;
  border: 1.5px solid var(--ed-border);
  color: var(--vld-text-muted, #64748b);
}
.ed-btn--ghost:hover { background: #f1f5f9; color: var(--vld-text-strong, #1e293b); }

/* ════════════════════════════════════════════════════════════════════════
   MODAL — design beige + bleu
════════════════════════════════════════════════════════════════════════ */

/* ── Backdrop ─────────────────────────────────────────────────────────── */
.ed-modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(10, 20, 40, .60);
  backdrop-filter: blur(6px);
  z-index: 1055;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}

/* ── Dialog shell ─────────────────────────────────────────────────────── */
.ed-modal-dialog {
  background: #fdf7f0;          /* beige chaud */
  border-radius: 20px;
  width: 100%; max-width: 500px;
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(10,20,40,.30), 0 0 0 1px rgba(0,0,0,.06);
}

/* ── Header ───────────────────────────────────────────────────────────── */
.ed-modal-header {
  display: flex; align-items: center; gap: 14px;
  padding: 22px 24px 20px;
  position: relative;
}
/* Disponible → bleu profond */
.ed-mh--gold {
  background: linear-gradient(135deg, #2f4f6a 0%, #3d6080 60%, #4a7a9b 100%);
}
/* Complet → gris ardoise */
.ed-mh--grey {
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
}

.ed-modal-av {
  width: 54px; height: 54px; border-radius: 14px;
  background: rgba(255,255,255,.18);
  border: 2px solid rgba(255,255,255,.38);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem; font-weight: 800; color: #fff;
  letter-spacing: .03em; flex-shrink: 0;
}
.ed-modal-identity { flex: 1; min-width: 0; }
.ed-modal-name  { color: #fff; font-size: 1.05rem; font-weight: 700; margin: 0 0 3px; }
.ed-modal-role  { color: rgba(255,255,255,.70); font-size: 12px; font-weight: 500; }

.ed-modal-status-pill {
  font-size: 11.5px; font-weight: 700;
  padding: 5px 12px; border-radius: 20px; flex-shrink: 0;
  letter-spacing: .02em;
}
.ed-pill--available { background: rgba(255,255,255,.22); color: #fff; border: 1px solid rgba(255,255,255,.30); }
.ed-pill--full      { background: rgba(0,0,0,.20);        color: rgba(255,255,255,.85); }

.ed-modal-close {
  background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.20);
  border-radius: 8px; width: 32px; height: 32px; color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: background .15s, border-color .15s;
}
.ed-modal-close:hover { background: rgba(255,255,255,.28); border-color: rgba(255,255,255,.40); }

/* ── Body ─────────────────────────────────────────────────────────────── */
.ed-modal-body { padding: 22px 24px 10px; background: #fdf7f0; }

/* ── Bloc capacité ────────────────────────────────────────────────────── */
.ed-modal-capacity-block {
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 20px;
}
.ed-cap--ok   {
  background: #eef3f7;            /* bleu très clair */
  border: 1px solid #c5d4e0;
}
.ed-cap--full {
  background: #fff1f2;
  border: 1px solid #fecdd3;
}

.ed-cap-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }

.ed-cap-label {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .07em; color: #3d6080;
}
.ed-cap--full .ed-cap-label { color: #be123c; }

.ed-cap-value { font-size: 1.25rem; font-weight: 800; color: #2f4f6a; }
.ed-cap--full .ed-cap-value { color: #9f1239; }

.ed-cap-track {
  height: 8px; background: rgba(255,255,255,.75);
  border-radius: 10px; overflow: hidden; margin-bottom: 6px;
}
.ed-cap-fill {
  height: 100%; border-radius: 10px; transition: width .45s ease;
  background: linear-gradient(90deg, #3d6080, #3d6080);
}
.ed-cap--full .ed-cap-fill { background: linear-gradient(90deg, #f43f5e, #be123c); }

.ed-cap-sub { font-size: 11.5px; color: #3d6080; font-weight: 500; }
.ed-cap--full .ed-cap-sub { color: #be123c; }

/* ── Grille infos ─────────────────────────────────────────────────────── */
.ed-modal-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  margin-bottom: 18px;
}
.ed-mf {
  display: flex; flex-direction: column; gap: 3px;
  background: #fff;
  border: 1px solid #e5d8c8;
  border-radius: 10px;
  padding: 10px 13px;
}
.ed-mf__lbl {
  font-size: 10px; text-transform: uppercase; letter-spacing: .08em;
  color: #9ca3af; font-weight: 700;
}
.ed-mf__val {
  font-size: 13.5px; color: #1e293b; font-weight: 600;
  word-break: break-word; margin-top: 1px;
}

/* ── Sections (thèmes, commentaire) ──────────────────────────────────── */
.ed-modal-section { margin-bottom: 16px; }

.ed-section-title {
  display: flex; align-items: center; gap: 6px;
  font-size: 10.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: .09em;
  color: #3d6080; margin-bottom: 8px;
}
.ed-section-title::before {
  content: '';
  display: inline-block; width: 3px; height: 13px;
  background: #3d6080; border-radius: 2px; flex-shrink: 0;
}

.ed-tags--modal { gap: 6px; }
.ed-tag--lg { font-size: 12px; padding: 4px 12px; }

/* Tags dans la modal → bleu léger */
.ed-tags--modal .ed-tag {
  background: #eef3f7;
  color: #3d6080;
  border-color: #c5d4e0;
}

/* ── Commentaire ──────────────────────────────────────────────────────── */
.ed-commentaire {
  display: flex; gap: 10px; align-items: flex-start;
  background: #fff;
  border: 1px solid #d6e4ed;
  border-left: 3px solid #3d6080;
  border-radius: 10px;
  padding: 12px 15px;
  font-size: 13px; color: #1e293b;
  line-height: 1.6;
}
.ed-commentaire svg { color: #3d6080; }

/* ── Footer ───────────────────────────────────────────────────────────── */
.ed-modal-footer {
  padding: 14px 24px 22px;
  display: flex; justify-content: flex-end; gap: 10px;
  background: #fdf7f0;
  border-top: 1px solid #e8d9c5;
}

/* ── Boutons dans la modal (bleu) ─────────────────────────────────────── */
/* "Fermer" → outline neutre */
.ed-modal-footer .ed-btn--ghost {
  background: #fff;
  border: 1.5px solid #d1c8bb;
  color: #64748b;
  border-radius: 10px;
}
.ed-modal-footer .ed-btn--ghost:hover {
  background: #f3ede4;
  color: #1e293b;
  border-color: #b8a899;
}
/* "Choisir" → bleu plein */
.ed-modal-footer .ed-btn--primary {
  background: linear-gradient(135deg, #3d6080, #3d6080);
  color: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 12px rgba(61,96,128,.32);
  border: none;
}
.ed-modal-footer .ed-btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #3d6080, #2f4f6a);
  box-shadow: 0 5px 18px rgba(61,96,128,.42);
  transform: translateY(-1px);
}
.ed-modal-footer .ed-btn--primary:disabled {
  opacity: .40; cursor: not-allowed; transform: none;
}

/* ── Transitions ─────────────────────────────────────────────────────── */
.ed-modal-enter-active, .ed-modal-leave-active { transition: opacity .2s ease, transform .22s ease; }
.ed-modal-enter-from, .ed-modal-leave-to { opacity: 0; transform: scale(.95) translateY(8px); }

/* ── Responsive ──────────────────────────────────────────────────────── */
@container (max-width: 500px) {
  .ed-header { flex-direction: column; align-items: flex-start; }
  .ed-search { width: 100%; }
  .ed-modal-grid { grid-template-columns: 1fr; }
}
</style>