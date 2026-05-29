<template>
<div><!-- fragment root -->
  <div class="page-wrap">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header__left">
        <div class="page-header__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <div>
          <h1 class="page-title">Spécialités</h1>
          <p class="page-sub">
            <span class="count-badge">{{ specialitesFiltrees.length }}</span>
            spécialité{{ specialitesFiltrees.length !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Toast (déplacé hors page-wrap via Teleport — voir ci-dessous) -->

    <!-- Search + Filters -->
    <div class="search-row">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5" class="search-icon">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" class="search-inp" placeholder="Rechercher par nom ou code…" />
        <button v-if="search" class="search-clear" @click="search = ''">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="filter-pills">
        <button class="filter-pill" :class="{ 'filter-pill--active': filtreStatut === '' }" @click="filtreStatut = ''">Tous</button>
        <button class="filter-pill filter-pill--assigned" :class="{ 'filter-pill--active': filtreStatut === 'assigne' }" @click="filtreStatut = 'assigne'">
          <span class="fp-dot fp-dot--green"></span>Chef assigné
        </button>
        <button class="filter-pill filter-pill--vacant" :class="{ 'filter-pill--active': filtreStatut === 'vacant' }" @click="filtreStatut = 'vacant'">
          <span class="fp-dot fp-dot--orange"></span>Poste vacant
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <p class="state-text">Chargement…</p>
    </div>
    <!-- Empty -->
    <div v-else-if="!specialitesFiltrees.length" class="state-box">
      <div class="state-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      </div>
      <p class="state-text">Aucune spécialité trouvée</p>
      <p class="state-sub">{{ search || filtreStatut ? 'Modifiez vos critères de recherche' : 'Aucune spécialité enregistrée' }}</p>
    </div>

    <!-- Cards Grid -->
    <div v-else class="cards-grid">
      <div
        v-for="s in specialitesFiltrees"
        :key="s.id"
        class="spec-card"
        :style="{ '--accent': cardColor(s) }"
      >
        <div class="card-stripe"></div>

        <div class="card-body">
          <div class="card-top">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div class="card-actions">
              <button class="act-btn act-btn--edit" @click="specialiteAModifier = s" title="Modifier">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="act-btn act-btn--del" @click="specialiteASupprimer = s" title="Supprimer">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="spec-name">{{ s.nom }}</div>
          <div class="spec-code-badge">{{ s.code }}</div>
          <p class="spec-desc">{{ s.description || 'Aucune description disponible.' }}</p>

          <div class="card-divider"></div>

          <div class="card-meta">
            <!-- Chef -->
            <div class="meta-item">
              <div class="meta-icon meta-icon--blue">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <div class="meta-label">Chef de département</div>
                <div class="meta-value" :class="{ 'meta-value--empty': !s.chef_nom }">
                  {{ s.chef_nom || 'Non affecté' }}
                </div>
              </div>
            </div>

            <!-- Capacité max -->
            <div class="meta-item">
              <div class="meta-icon meta-icon--purple">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <div class="meta-label">Capacité max</div>
                <div class="meta-value">
                  {{ s.capacite_max != null ? s.capacite_max + ' étudiants' : '—' }}
                </div>
              </div>
            </div>

            <!-- Date création -->
            <div class="meta-item" v-if="s.date_creation">
              <div class="meta-icon meta-icon--green">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div>
                <div class="meta-label">Créée le</div>
                <div class="meta-value">{{ formatDate(s.date_creation) }}</div>
              </div>
            </div>
          </div>

          <div class="card-footer-row">
            <span class="status-pill" :class="s.chef_nom ? 'pill--active' : 'pill--vacant'">
              <span class="pill-dot"></span>
              {{ s.chef_nom ? 'Chef assigné' : 'Poste vacant' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Modifier -->
    <ModifierSpecialite
      v-if="specialiteAModifier"
      :specialite="specialiteAModifier"
      @modifiee="onModifiee"
      @fermer="specialiteAModifier = null"
    />

    <!-- Modal Supprimer -->
    <SupprimerSpecialite
      v-if="specialiteASupprimer"
      :specialite="specialiteASupprimer"
      @supprimee="onSupprimee"
      @fermer="specialiteASupprimer = null"
    />
  </div><!-- /.page-wrap -->

  <!-- Teleport — hors de tout ancêtre transformé par <Transition> -->
  <Teleport to="body">
    <Transition name="ls-toast-fade">
      <div v-if="toast.visible" class="ls-toast" :class="'ls-toast--' + toast.type">
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
import ModifierSpecialite from './ModifierSpecialite.vue'
import SupprimerSpecialite from './SupprimerSpecialite.vue'
import { useToast, consumePendingToast } from '@/composables/useToast.js'

const PALETTE = ['#3d6080','#2f4f6a','#5a7fa0','#c9a100','#f5a623','#3a5f7d','#243d52']

export default {
  name: 'ListeSpecialites',
  components: { ModifierSpecialite, SupprimerSpecialite },

  props: {
    pendingToast: { type: String, default: null },
  },

  setup() {
    const { toast, showToast } = useToast(3500)
    return { toast, showToast }
  },

  data() {
    return {
      specialites: [], loading: false, search: '', filtreStatut: '',
      specialiteAModifier: null,
      specialiteASupprimer: null,
    }
  },

  computed: {
    specialitesFiltrees() {
      return this.specialites.filter(s => {
        if (this.search) {
          const q = this.search.toLowerCase()
          if (!(s.nom || '').toLowerCase().includes(q) &&
              !(s.code || '').toLowerCase().includes(q)) return false
        }
        if (this.filtreStatut === 'assigne' && !s.chef_nom) return false
        if (this.filtreStatut === 'vacant'  &&  s.chef_nom) return false
        return true
      })
    },
  },

  async mounted() {
    await this.charger()
    // Pending toast from navigation (ex: après création via AjouterChef)
    const pending = consumePendingToast()
    if (pending) {
      this.$nextTick(() => this.showToast(pending.message, pending.type))
    } else if (this.pendingToast) {
      this.$nextTick(() => this.showToast(this.pendingToast, 'ok'))
    }
  },

  watch: {
    pendingToast(val) {
      if (val) this.showToast(val, 'ok')
    },
  },

  methods: {
    async onModifiee(updated) {
      const idx = this.specialites.findIndex(s => s.id === updated.id)
      if (idx !== -1) this.specialites.splice(idx, 1, updated)
      this.specialiteAModifier = null  // ferme la modal d'abord
      await this.charger()
      this.$nextTick(() => this.showToast(`Spécialité « ${updated.nom} » modifiée avec succès.`, 'ok'))
    },

    onSupprimee(id) {
      const spec = this.specialites.find(s => s.id === id)
      this.specialites = this.specialites.filter(s => s.id !== id)
      this.specialiteASupprimer = null  // ferme la modal d'abord
      this.$nextTick(() => this.showToast(`Spécialité${spec ? ' « ' + spec.nom + ' »' : ''} supprimée.`, 'ok'))
    },

    async charger() {
      this.loading = true
      try {
        const r = await api.get('/specialites')
        this.specialites = r.data || []
      } catch (e) {
        console.error(e)
        this.showToast('Erreur lors du chargement des spécialités.', 'err')
      } finally { this.loading = false }
    },

    cardColor(s) { return PALETTE[(s.id || 0) % PALETTE.length] },

    formatDate(d) {
      if (!d) return ''
      try {
        return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
      } catch { return d }
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

/* (toast styles moved to global block below) */
.page-wrap { font-family: 'Sora', sans-serif; color: #1a2332; position: relative; }

.page-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
}
.page-header__left { display: flex; align-items: center; gap: 14px; }
.page-header__icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, #3d6080, #5a7fa0);
  display: flex; align-items: center; justify-content: center;
  color: #fff; box-shadow: 0 4px 14px rgba(61,96,128,.28);
}
.page-title { font-size: 20px; font-weight: 700; color: #1a2332; letter-spacing: -0.4px; }
.page-sub { font-size: 13px; color: #6b7a8d; margin-top: 2px; display: flex; align-items: center; gap: 6px; }
.count-badge {
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(245,197,24,.18); color: #b38a00; font-size: 12px; font-weight: 600;
  padding: 1px 8px; border-radius: 20px;
}

.search-row {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 20px; flex-wrap: wrap;
}
.search-box {
  position: relative; display: flex; align-items: center;
  max-width: 360px; background: #f5f2ec; border: 1.5px solid #c8c2b8;
  border-radius: 10px; overflow: hidden;
  transition: border-color .2s, box-shadow .2s;
}
.search-box:focus-within { border-color: #3d6080; box-shadow: 0 0 0 3px rgba(61,96,128,.12); }
.search-icon { position: absolute; left: 13px; color: #8a9ab0; pointer-events: none; }
.search-inp {
  width: 100%; padding: 10px 38px 10px 36px;
  background: transparent; border: none; outline: none;
  font-size: 13.5px; font-family: 'Sora', sans-serif; color: #1a2332;
}
.search-inp::placeholder { color: #b0bcc8; }
.search-clear {
  position: absolute; right: 10px; background: none; border: none;
  color: #a0aab4; cursor: pointer; display: flex; padding: 3px;
  border-radius: 4px; transition: color .15s;
}
.search-clear:hover { color: #1a2332; }

.filter-pills { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.filter-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 20px; border: 1.5px solid #c8c2b8;
  background: #f5f2ec; color: #5a6a7a; font-size: 12.5px; font-weight: 500;
  font-family: 'Sora', sans-serif; cursor: pointer;
  transition: all .18s; white-space: nowrap;
}
.filter-pill:hover { border-color: #3d6080; color: #3d6080; background: #e8eef4; }
.filter-pill--active { border-color: transparent !important; color: #fff !important; background: #3d6080 !important; }
.filter-pill--assigned.filter-pill--active { background: #2f4f6a !important; }
.filter-pill--vacant.filter-pill--active   { background: #b38a00 !important; }
.fp-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.fp-dot--green  { background: #3d6080; }
.fp-dot--orange { background: #c9a100; }
.filter-pill--active .fp-dot { background: rgba(255,255,255,.8); }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
}
.spec-card {
  background: #faf8f4; border-radius: 16px; border: 1px solid #d6d0c8;
  box-shadow: 0 2px 14px rgba(0,0,0,.06);
  overflow: hidden; transition: box-shadow .2s, transform .2s; position: relative;
}
.spec-card:hover { box-shadow: 0 6px 28px rgba(0,0,0,.12); transform: translateY(-2px); }
.card-stripe { height: 5px; background: var(--accent, #2c5f8a); }
.card-body { padding: 18px 20px 16px; }
.card-top {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
}
.card-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: color-mix(in srgb, var(--accent, #2c5f8a) 12%, transparent);
  color: var(--accent, #2c5f8a);
  display: flex; align-items: center; justify-content: center;
}
.card-actions { display: flex; gap: 5px; }
.act-btn {
  width: 28px; height: 28px; border-radius: 7px; border: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; transition: all .15s;
}
.act-btn--edit { background: rgba(245,197,24,.15); color: #9a7700; }
.act-btn--edit:hover { background: #c9a100; color: #fff; }
.act-btn--del  { background: rgba(217,64,64,.10); color: #d94040; }
.act-btn--del:hover  { background: #d94040; color: #fff; }

.spec-name { font-size: 16px; font-weight: 700; color: #1a2332; margin-bottom: 6px; line-height: 1.3; }
.spec-code-badge {
  display: inline-block; padding: 2px 9px;
  background: color-mix(in srgb, var(--accent, #2c5f8a) 10%, transparent);
  color: var(--accent, #2c5f8a); border-radius: 5px;
  font-size: 11.5px; font-weight: 600;
  font-family: 'DM Mono', monospace; letter-spacing: .4px; margin-bottom: 10px;
}
.spec-desc {
  font-size: 13px; color: #7a8a9a; line-height: 1.55;
  min-height: 38px; margin-bottom: 14px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.card-divider { height: 1px; background: #e0dbd2; margin-bottom: 14px; }
.card-meta { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.meta-item { display: flex; align-items: flex-start; gap: 10px; }
.meta-icon {
  width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; margin-top: 1px;
}
.meta-icon--blue   { background: rgba(61,96,128,.12); color: #3d6080; }
.meta-icon--green  { background: rgba(245,197,24,.18); color: #9a7700; }
.meta-icon--purple { background: rgba(61,96,128,.08); color: #5a7fa0; }
.meta-label { font-size: 11px; color: #9aabb8; font-weight: 500; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 2px; }
.meta-value { font-size: 13.5px; font-weight: 600; color: #1a2332; }
.meta-value--empty { color: #b0bcc8; font-weight: 400; font-style: italic; }

.card-footer-row { display: flex; align-items: center; }
.status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.pill--active { background: rgba(61,96,128,.12); color: #3d6080; }
.pill--vacant { background: rgba(245,197,24,.20); color: #9a7700; }
.pill-dot { width: 6px; height: 6px; border-radius: 50%; }
.pill--active .pill-dot { background: #3d6080; }
.pill--vacant .pill-dot { background: #c9a100; }

.state-box { text-align: center; padding: 60px 20px; }
.state-icon { color: #c0c8d5; margin-bottom: 16px; }
.state-text { font-size: 15px; color: #6b7a8d; font-weight: 500; }
.state-sub { font-size: 13px; color: #a0aab4; margin-top: 6px; }
.spinner {
  width: 36px; height: 36px; border: 3px solid #e5eaf0;
  border-top-color: #3d6080; border-radius: 50%;
  animation: spin .8s linear infinite; margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>

<!-- Global : éléments téléportés sur <body> — les styles scoped ne les atteignent pas -->
<style>
.ls-toast {
  position: fixed; top: 22px; right: 22px; z-index: 99999;
  display: flex; align-items: center; gap: 9px;
  padding: 12px 20px; border-radius: 10px;
  font-size: 13.5px; font-weight: 600; font-family: 'Sora', sans-serif;
  box-shadow: 0 8px 28px rgba(0,0,0,.22); pointer-events: none;
}
.ls-toast--ok   { background: #3d6080; color: #fff; }
.ls-toast--warn { background: #c9a100; color: #fff; }
.ls-toast--err  { background: #d94040; color: #fff; }
.ls-toast-fade-enter-active, .ls-toast-fade-leave-active { transition: all .3s ease; }
.ls-toast-fade-enter-from, .ls-toast-fade-leave-to { opacity: 0; transform: translateY(-8px); }
</style>