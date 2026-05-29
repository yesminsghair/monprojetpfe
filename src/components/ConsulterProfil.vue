<template>
  <div class="cp-root">

    <!-- Loading -->
    <div v-if="loading" class="vld-state">
      <div class="vld-spinner mx-auto mb-3"></div>
      <p>Chargement du profil...</p>
    </div>

    <template v-else>

      <!-- ══ HERO BANNER ══ -->
      <div class="cp-hero mb-4">
        <div class="cp-hero__circle cp-hero__circle--1"></div>
        <div class="cp-hero__circle cp-hero__circle--2"></div>

        <!-- Avatar -->
        <div class="cp-avatar">
          <span class="cp-avatar__initials">{{ initiales }}</span>
          <span class="cp-avatar__status"
                :class="userData.status === 'active' ? 'is-active' : 'is-pending'"
                :title="userData.status === 'active' ? 'Compte actif' : 'En attente'">
          </span>
        </div>

        <!-- Identity -->
        <div class="cp-hero__identity">
          <div class="cp-hero__name">{{ userData.prenom }} {{ userData.nom }}</div>
          <div class="cp-hero__meta">
            <span class="cp-role-pill">{{ roleLabel }}</span>
            <span class="cp-hero__email">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {{ userData.email }}
            </span>
            <span v-if="userData.telephone" class="cp-hero__phone">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 4.18 2 2 0 0 1 5.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              {{ userData.telephone }}
            </span>
            <span v-if="specialiteNom" class="cp-spec-pill">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              </svg>
              {{ specialiteNom }}
            </span>
            <span v-if="showDomaineInHero && userData.domaine_expertise" class="cp-domain-pill">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
              {{ userData.domaine_expertise }}
            </span>
          </div>
        </div>

        <!-- CTA -->
        <button class="cp-edit-btn" @click="$emit('modifier')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Modifier le profil
        </button>
      </div>

      <!-- ══ STATS ROW ══ -->
      <div class="cp-stats-row mb-4">
        <div class="cp-stat">
          <div class="cp-stat__icon cp-stat__icon--gold">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <div class="cp-stat__val">{{ userData.matricule || '—' }}</div>
            <div class="cp-stat__lbl">Matricule</div>
          </div>
        </div>
        <div class="cp-stat-divider"></div>
        <div class="cp-stat">
          <div class="cp-stat__icon cp-stat__icon--teal">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div class="cp-stat__val">{{ formatDate(userData.created_at) }}</div>
            <div class="cp-stat__lbl">Membre depuis</div>
          </div>
        </div>
        <div class="cp-stat-divider"></div>
        <div class="cp-stat">
          <div class="cp-stat__icon" :class="userData.status === 'active' ? 'cp-stat__icon--green' : 'cp-stat__icon--gold'">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div class="cp-stat__val">{{ userData.status === 'active' ? 'Actif' : 'En attente' }}</div>
            <div class="cp-stat__lbl">Statut du compte</div>
          </div>
        </div>
        <div class="cp-stat-divider"></div>
        <div class="cp-stat">
          <div class="cp-stat__icon" :class="userData.email_verified_at ? 'cp-stat__icon--green' : 'cp-stat__icon--red'">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2">
              <polyline v-if="userData.email_verified_at" points="20 6 9 17 4 12"/>
              <circle v-else cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <div>
            <div class="cp-stat__val">{{ userData.email_verified_at ? 'Vérifié' : 'Non vérifié' }}</div>
            <div class="cp-stat__lbl">Email</div>
          </div>
        </div>
        <!-- Stat téléphone si disponible -->
        <template v-if="userData.telephone">
          <div class="cp-stat-divider"></div>
          <div class="cp-stat">
            <div class="cp-stat__icon cp-stat__icon--blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 4.18 2 2 0 0 1 5.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div>
              <div class="cp-stat__val">{{ userData.telephone }}</div>
              <div class="cp-stat__lbl">Téléphone</div>
            </div>
          </div>
        </template>
      </div>

      <!-- ══ INFO CARDS ══ -->
      <div class="row g-4">

        <!-- Informations personnelles -->
        <div class="col-12 col-lg-6">
          <div class="cp-card">
            <div class="cp-card__header cp-card__header--gold">
              <div class="cp-card__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span>Informations personnelles</span>
            </div>
            <div class="cp-card__body">
              <div class="cp-row">
                <span class="cp-row__lbl">Prénom</span>
                <span class="cp-row__val">{{ userData.prenom || '—' }}</span>
              </div>
              <div class="cp-row">
                <span class="cp-row__lbl">Nom</span>
                <span class="cp-row__val">{{ userData.nom || '—' }}</span>
              </div>
              <div class="cp-row">
                <span class="cp-row__lbl">Matricule</span>
                <span class="cp-row__val">
                  <code class="cp-code">{{ userData.matricule || '—' }}</code>
                </span>
              </div>
              <div class="cp-row">
                <span class="cp-row__lbl">Établissement</span>
                <span class="cp-row__val">{{ userData.etablissement || '—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Coordonnées -->
        <div class="col-12 col-lg-6">
          <div class="cp-card">
            <div class="cp-card__header cp-card__header--blue">
              <div class="cp-card__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <span>Coordonnées</span>
            </div>
            <div class="cp-card__body">
              <div class="cp-row">
                <span class="cp-row__lbl">Email</span>
                <span class="cp-row__val cp-row__val--accent">
                  <a :href="'mailto:' + userData.email" class="cp-link">{{ userData.email || '—' }}</a>
                </span>
              </div>
              <div class="cp-row">
                <span class="cp-row__lbl">Téléphone</span>
                <span class="cp-row__val">
                  <template v-if="userData.telephone">
                    <a :href="'tel:' + userData.telephone" class="cp-link">{{ userData.telephone }}</a>
                  </template>
                  <span v-else class="cp-empty-val">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Non renseigné
                  </span>
                </span>
              </div>
              <div class="cp-row">
                <span class="cp-row__lbl">Email vérifié</span>
                <span class="cp-row__val">
                  <span class="cp-badge" :class="userData.email_verified_at ? 'cp-badge--green' : 'cp-badge--red'">
                    {{ userData.email_verified_at ? '● Vérifié' : '● Non vérifié' }}
                  </span>
                </span>
              </div>
              <div class="cp-row">
                <span class="cp-row__lbl">Membre depuis</span>
                <span class="cp-row__val">{{ formatDate(userData.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations académiques -->
        <div class="col-12 col-lg-6">
          <div class="cp-card">
            <div class="cp-card__header cp-card__header--teal">
              <div class="cp-card__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <span>Informations académiques</span>
            </div>
            <div class="cp-card__body">
              <div class="cp-row">
                <span class="cp-row__lbl">Rôle</span>
                <span class="cp-row__val">
                  <span class="cp-badge" :class="roleBadgeClass">{{ roleLabel }}</span>
                </span>
              </div>
              <div class="cp-row" v-if="specialiteNom">
                <span class="cp-row__lbl">Spécialité</span>
                <span class="cp-row__val">
                  <span class="cp-badge cp-badge--gold">{{ specialiteNom }}</span>
                </span>
              </div>

              <!-- Domaine d'expertise : visible pour encadrant, enseignant, chef, jury, directeur -->
              <div class="cp-row" v-if="showDomaineField">
                <span class="cp-row__lbl">Domaine</span>
                <span class="cp-row__val">
                  <template v-if="userData.domaine_expertise">
                    <span class="cp-domain-tag">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                      </svg>
                      {{ userData.domaine_expertise }}
                    </span>
                  </template>
                  <span v-else class="cp-empty-val">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Non renseigné
                  </span>
                </span>
              </div>

              <div class="cp-row" v-if="userData.date_affectation">
                <span class="cp-row__lbl">Affecté le</span>
                <span class="cp-row__val">{{ formatDate(userData.date_affectation) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sécurité -->
        <div class="col-12 col-lg-6">
          <div class="cp-card">
            <div class="cp-card__header cp-card__header--slate">
              <div class="cp-card__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <span>Sécurité du compte</span>
            </div>
            <div class="cp-card__body">
              <div class="cp-row">
                <span class="cp-row__lbl">Mot de passe</span>
                <span class="cp-row__val" style="letter-spacing:.25em;color:var(--vld-text-muted)">••••••••••</span>
              </div>
              <div class="cp-row">
                <span class="cp-row__lbl">Statut</span>
                <span class="cp-row__val">
                  <span class="cp-badge" :class="userData.status === 'active' ? 'cp-badge--green' : 'cp-badge--gold'">
                    {{ userData.status === 'active' ? '● Actif' : '● En attente' }}
                  </span>
                </span>
              </div>
              <div class="cp-row">
                <span class="cp-row__lbl">Email vérifié</span>
                <span class="cp-row__val">
                  <span class="cp-badge" :class="userData.email_verified_at ? 'cp-badge--green' : 'cp-badge--red'">
                    {{ userData.email_verified_at ? '● Vérifié' : '● Non vérifié' }}
                  </span>
                </span>
              </div>
              <div class="cp-row" v-if="userData.activated_at">
                <span class="cp-row__lbl">Activé le</span>
                <span class="cp-row__val">{{ formatDate(userData.activated_at) }}</span>
              </div>
            </div>
            <div class="cp-card__footer">
              <button class="cp-sec-btn" @click="$emit('modifier')">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Changer le mot de passe
              </button>
            </div>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<script>
import api from '@/services/api.js'

const ROLE_LABELS = {
  admin:      'Administrateur',
  directeur:  'Directeur de stage',
  chef:       'Chef de département',
  encadrant:  'Encadrant',
  enseignant: 'Enseignant',
  jury:       'Jury',
  etudiant:   'Étudiant',
}
const ROLE_BADGES = {
  admin:      'cp-badge--red',
  directeur:  'cp-badge--gold',
  chef:       'cp-badge--green',
  encadrant:  'cp-badge--blue',
  enseignant: 'cp-badge--teal',
  jury:       'cp-badge--slate',
  etudiant:   'cp-badge--slate',
}

// Rôles pour lesquels le domaine d'expertise est pertinent
const ROLES_EXPERTISE = ['encadrant', 'enseignant', 'chef', 'jury', 'directeur']

export default {
  name: 'ConsulterProfil',
  emits: ['modifier'],

  data () {
    return { loading: true, userData: {}, specialiteNom: '' }
  },

  computed: {
    initiales () {
      return ((this.userData.prenom?.[0] || '') + (this.userData.nom?.[0] || '')).toUpperCase() || '?'
    },
    roleLabel ()      { return ROLE_LABELS[this.userData.role] || this.userData.role || 'Utilisateur' },
    roleBadgeClass () { return ROLE_BADGES[this.userData.role]  || 'cp-badge--slate' },
    showDomaineField () {
      return ROLES_EXPERTISE.includes(this.userData.role)
    },
    showDomaineInHero () {
      return ROLES_EXPERTISE.includes(this.userData.role) && !!this.userData.domaine_expertise
    },
  },

  async mounted () { await this.chargerProfil() },

  methods: {
    async chargerProfil () {
      try {
        const res = await api.get('/me')
        this.userData = res.data
        if (this.userData.specialite_id) {
          try {
            const sp = await api.get(`/specialites/${this.userData.specialite_id}`)
            this.specialiteNom = sp.data?.nom || ''
          } catch { /* pas grave */ }
        }
      } catch (e) {
        if (e.response?.status === 401) {
          localStorage.removeItem('user')
          this.$router?.push('/login')
        }
      } finally { this.loading = false }
    },

    formatDate (d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    },
  },
}
</script>

<style scoped>
/* ── Root ────────────────────────────────────────────── */
.cp-root { padding-bottom: 32px; }

/* ── Hero ────────────────────────────────────────────── */
.cp-hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1e2e3e 0%, #2f4f6a 55%, #1a3a50 100%);
  border-radius: 20px;
  padding: 32px 36px;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  box-shadow: 0 12px 40px rgba(30,46,62,.35), 0 0 0 1px rgba(245,166,35,.15);
}

.cp-hero__circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.cp-hero__circle--1 {
  width: 260px; height: 260px;
  top: -80px; right: -60px;
  background: radial-gradient(circle, rgba(245,166,35,.18) 0%, transparent 70%);
}
.cp-hero__circle--2 {
  width: 160px; height: 160px;
  bottom: -60px; left: 20%;
  background: radial-gradient(circle, rgba(245,166,35,.10) 0%, transparent 70%);
}

/* Avatar */
.cp-avatar {
  position: relative;
  width: 80px; height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f5a623 0%, #e8920a 100%);
  box-shadow: 0 4px 20px rgba(245,166,35,.45), 0 0 0 3px rgba(245,166,35,.25);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cp-avatar__initials {
  font-family: 'Georgia', serif;
  font-size: 28px; font-weight: 700;
  color: #1e2e3e;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(255,255,255,.2);
}
.cp-avatar__status {
  position: absolute; bottom: -3px; right: -3px;
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 2px solid #1e2e3e;
}
.cp-avatar__status.is-active  { background: #27ae60; }
.cp-avatar__status.is-pending { background: #f5a623; }

/* Identity */
.cp-hero__identity  { flex: 1; min-width: 200px; }
.cp-hero__name {
  font-family: 'Georgia', serif;
  font-size: 22px; font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
  letter-spacing: .01em;
}
.cp-hero__meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.cp-hero__email,
.cp-hero__phone {
  display: flex; align-items: center; gap: 5px;
  font-size: 13px; color: rgba(255,255,255,.55);
}

/* Role pill */
.cp-role-pill {
  display: inline-flex; align-items: center;
  padding: 3px 12px;
  background: rgba(245,166,35,.2);
  border: 1px solid rgba(245,166,35,.4);
  border-radius: 20px;
  color: #f5c842;
  font-size: 12px; font-weight: 600;
  letter-spacing: .03em;
}

/* Spec pill */
.cp-spec-pill {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 20px;
  color: rgba(255,255,255,.7);
  font-size: 12px;
}

/* Domain pill (hero) */
.cp-domain-pill {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px;
  background: rgba(39,174,96,.15);
  border: 1px solid rgba(39,174,96,.3);
  border-radius: 20px;
  color: #7ee8a8;
  font-size: 12px;
}

/* Edit button */
.cp-edit-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #f5a623 0%, #e8920a 100%);
  border: none; border-radius: 12px;
  color: #1e2e3e;
  font-size: 13.5px; font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(245,166,35,.4);
  transition: transform .15s, box-shadow .15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.cp-edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245,166,35,.5);
}

/* ── Stats row ───────────────────────────────────────── */
.cp-stats-row {
  display: flex;
  align-items: stretch;
  background: var(--vld-surface, #ddd9d1);
  border: 1.5px solid var(--vld-border, #c8c4bc);
  border-radius: 16px;
  overflow: hidden;
  flex-wrap: wrap;
}
.cp-stat {
  flex: 1; min-width: 140px;
  display: flex; align-items: center; gap: 14px;
  padding: 18px 22px;
}
.cp-stat-divider {
  width: 1px;
  background: var(--vld-border, #c8c4bc);
  align-self: stretch;
}
.cp-stat__icon {
  width: 40px; height: 40px;
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cp-stat__icon--gold  { background: rgba(245,166,35,.15); color: #d98e1a; }
.cp-stat__icon--teal  { background: rgba(39,174,96,.12);  color: #27ae60; }
.cp-stat__icon--green { background: rgba(39,174,96,.12);  color: #27ae60; }
.cp-stat__icon--red   { background: rgba(231,76,60,.12);  color: #e74c3c; }
.cp-stat__icon--blue  { background: rgba(61,96,128,.12);  color: #3d6080; }
.cp-stat__val {
  font-family: 'Georgia', serif;
  font-size: 15px; font-weight: 700;
  color: var(--vld-text-strong, #1e2a35);
  margin-bottom: 2px;
}
.cp-stat__lbl { font-size: 11.5px; color: var(--vld-text-muted, #8a9aaa); }

/* ── Info cards ──────────────────────────────────────── */
.cp-card {
  border-radius: 16px;
  border: 1.5px solid var(--vld-border, #c8c4bc);
  background: var(--vld-surface, #ddd9d1);
  overflow: hidden;
  height: 100%;
  display: flex; flex-direction: column;
}
.cp-card__header {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px;
  font-size: 13px; font-weight: 700;
  border-bottom: 1.5px solid var(--vld-border, #c8c4bc);
  position: relative;
}
.cp-card__header::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 4px;
  border-radius: 0 2px 2px 0;
}
.cp-card__header--gold::before  { background: #f5a623; }
.cp-card__header--blue::before  { background: #3d6080; }
.cp-card__header--teal::before  { background: #27ae60; }
.cp-card__header--slate::before { background: #8e9eae; }

.cp-card__header--gold  { color: #b87c10; }
.cp-card__header--blue  { color: var(--vld-primary, #3d6080); }
.cp-card__header--teal  { color: #27ae60; }
.cp-card__header--slate { color: var(--vld-text-muted, #8a9aaa); }

.cp-card__icon {
  width: 32px; height: 32px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cp-card__header--gold  .cp-card__icon { background: rgba(245,166,35,.15); color: #d98e1a; }
.cp-card__header--blue  .cp-card__icon { background: rgba(61,96,128,.12);  color: #3d6080; }
.cp-card__header--teal  .cp-card__icon { background: rgba(39,174,96,.12);  color: #27ae60; }
.cp-card__header--slate .cp-card__icon { background: rgba(142,158,174,.12);color: #8e9eae; }

.cp-card__body { flex: 1; }

.cp-row {
  display: flex; align-items: center;
  padding: 11px 20px;
  border-bottom: 1px solid var(--vld-border, #c8c4bc);
}
.cp-row:last-child { border-bottom: none; }
.cp-row__lbl {
  width: 130px; flex-shrink: 0;
  font-size: 12px; font-weight: 600;
  color: var(--vld-text-muted, #8a9aaa);
  text-transform: uppercase; letter-spacing: .04em;
}
.cp-row__val {
  font-size: 13.5px;
  color: var(--vld-text-strong, #1e2a35);
  font-weight: 500;
}
.cp-row__val--accent { color: var(--vld-primary, #3d6080); font-weight: 600; }

/* Empty value hint */
.cp-empty-val {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12.5px;
  color: var(--vld-text-muted, #8a9aaa);
  font-style: italic;
}

/* Clickable links */
.cp-link {
  color: var(--vld-primary, #3d6080);
  font-weight: 600;
  text-decoration: none;
  transition: color .15s;
}
.cp-link:hover { color: #f5a623; text-decoration: underline; }

/* Domain tag inline */
.cp-domain-tag {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px;
  background: rgba(39,174,96,.10);
  border: 1px solid rgba(39,174,96,.25);
  border-radius: 20px;
  color: #1a7a40;
  font-size: 12.5px; font-weight: 600;
}

.cp-code {
  font-size: 12.5px; font-weight: 700;
  color: #b87c10;
  background: rgba(245,166,35,.12);
  border: 1px solid rgba(245,166,35,.25);
  padding: 2px 8px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
}

.cp-card__footer {
  padding: 14px 20px;
  border-top: 1.5px solid var(--vld-border, #c8c4bc);
}

/* ── Badges ──────────────────────────────────────────── */
.cp-badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px; font-weight: 600;
}
.cp-badge--gold  { background: rgba(245,166,35,.18); color: #b87c10;  border: 1px solid rgba(245,166,35,.35); }
.cp-badge--green { background: rgba(39,174,96,.12);  color: #1e8a4a;  border: 1px solid rgba(39,174,96,.25); }
.cp-badge--red   { background: rgba(231,76,60,.12);  color: #c0392b;  border: 1px solid rgba(231,76,60,.25); }
.cp-badge--blue  { background: rgba(61,96,128,.12);  color: #2a5070;  border: 1px solid rgba(61,96,128,.25); }
.cp-badge--teal  { background: rgba(39,174,96,.12);  color: #1e8a4a;  border: 1px solid rgba(39,174,96,.25); }
.cp-badge--slate { background: rgba(127,140,141,.12);color: #5d6d7e;  border: 1px solid rgba(127,140,141,.25); }

/* ── Security button ─────────────────────────────────── */
.cp-sec-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 16px;
  background: rgba(245,166,35,.12);
  border: 1.5px solid rgba(245,166,35,.35);
  border-radius: 10px;
  color: #b87c10;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: background .15s, border-color .15s;
}
.cp-sec-btn:hover {
  background: rgba(245,166,35,.22);
  border-color: rgba(245,166,35,.55);
}

/* ── Responsive ──────────────────────────────────────── */
@media (max-width: 640px) {
  .cp-hero { padding: 20px; }
  .cp-stats-row { flex-direction: column; }
  .cp-stat-divider { width: auto; height: 1px; align-self: auto; }
}
</style>