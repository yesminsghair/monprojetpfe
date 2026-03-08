<template>
  <div class="profil-page">

    <!-- ══ HEADER ══ -->
    <div class="profil-header">
      <div class="profil-avatar-wrap">
        <div class="profil-avatar">{{ initiales }}</div>
        <div class="profil-avatar-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>
      <div class="profil-header-info">
        <h1 class="profil-name">{{ user.prenom }} {{ user.nom }}</h1>
        <span class="profil-role-badge" :class="roleBadgeClass">{{ roleLabel }}</span>
        <p class="profil-email-sub">{{ user.email }}</p>
      </div>
      <button class="btn-edit-profil" @click="$emit('modifier')">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Modifier le profil
      </button>
    </div>

    <!-- ══ CARDS D'INFOS ══ -->
    <div class="profil-grid">

      <!-- Informations personnelles -->
      <div class="info-card">
        <div class="card-header">
          <div class="card-icon card-icon-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h2 class="card-title">Informations personnelles</h2>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">Prénom</span>
            <span class="info-value">{{ user.prenom || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Nom</span>
            <span class="info-value">{{ user.nom || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date de naissance</span>
            <span class="info-value">{{ user.dateNaissance || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Sexe</span>
            <span class="info-value">{{ user.sexe || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Coordonnées -->
      <div class="info-card">
        <div class="card-header">
          <div class="card-icon card-icon-gold">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <h2 class="card-title">Coordonnées</h2>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value info-link">{{ user.email || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Téléphone</span>
            <span class="info-value">{{ user.telephone || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Adresse</span>
            <span class="info-value">{{ user.adresse || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Informations académiques -->
      <div class="info-card">
        <div class="card-header">
          <div class="card-icon card-icon-green">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <h2 class="card-title">Informations académiques</h2>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">Matricule</span>
            <span class="info-value info-mono">{{ user.matricule || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Rôle</span>
            <span class="info-value">
              <span class="role-pill" :class="roleBadgeClass">{{ roleLabel }}</span>
            </span>
          </div>
          <div class="info-row" v-if="user.specialite">
            <span class="info-label">Spécialité</span>
            <span class="info-value">
              <span class="spec-tag">{{ user.specialite }}</span>
            </span>
          </div>
          <div class="info-row" v-if="user.domaineExpertise">
            <span class="info-label">Domaine</span>
            <span class="info-value">{{ user.domaineExpertise }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Membre depuis</span>
            <span class="info-value">{{ user.dateInscription || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Sécurité -->
      <div class="info-card">
        <div class="card-header">
          <div class="card-icon card-icon-slate">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 class="card-title">Sécurité du compte</h2>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">Mot de passe</span>
            <span class="info-value">••••••••••</span>
          </div>
          <div class="info-row">
            <span class="info-label">Statut du compte</span>
            <span class="info-value">
              <span class="status-badge status-active">
                <span class="status-dot"></span>
                Actif
              </span>
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Dernière connexion</span>
            <span class="info-value">{{ user.derniereConnexion || 'Aujourd\'hui' }}</span>
          </div>
        </div>
        <div class="card-footer-action">
          <button class="btn-change-pw" @click="$emit('modifier')">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Modifier le mot de passe
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'ConsulterProfil',
  emits: ['modifier'],
  props: {
    user: {
      type: Object,
      default: () => ({
        prenom: '', nom: '', email: '', telephone: '', adresse: '',
        dateNaissance: '', sexe: '', matricule: '', role: '',
        specialite: '', domaineExpertise: '', dateInscription: '',
        derniereConnexion: '',
      })
    }
  },
  computed: {
    initiales() {
      const p = (this.user.prenom || '')[0] || ''
      const n = (this.user.nom    || '')[0] || ''
      return (p + n).toUpperCase() || '??'
    },
    roleLabel() {
      const map = {
        admin:      'Administrateur',
        directeur:  'Directeur de stage',
        enseignant: 'Enseignant',
        etudiant:   'Étudiant',
      }
      return map[this.user.role] || this.user.role || 'Utilisateur'
    },
    roleBadgeClass() {
      const map = {
        admin:      'badge-admin',
        directeur:  'badge-directeur',
        enseignant: 'badge-enseignant',
        etudiant:   'badge-etudiant',
      }
      return map[this.user.role] || 'badge-default'
    },
  },
}
</script>

<style scoped>
.profil-page { padding: 0; animation: fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

/* ── HEADER ── */
.profil-header {
  background: linear-gradient(135deg, #3d6080 0%, #2f4f6a 100%);
  border-radius: 18px;
  padding: 30px 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(47,79,106,0.20);
  position: relative;
  overflow: hidden;
}
.profil-header::before {
  content: '';
  position: absolute; top: -40px; right: -40px;
  width: 200px; height: 200px;
  background: rgba(255,255,255,0.04);
  border-radius: 50%;
}

.profil-avatar-wrap { position: relative; flex-shrink: 0; }
.profil-avatar {
  width: 70px; height: 70px; border-radius: 20px;
  background: rgba(255,255,255,0.15);
  border: 2.5px solid rgba(255,255,255,0.30);
  color: #fff; font-size: 22px; font-weight: 700;
  font-family: 'Merriweather', serif;
  display: flex; align-items: center; justify-content: center;
}
.profil-avatar-badge {
  position: absolute; bottom: -4px; right: -4px;
  width: 20px; height: 20px; border-radius: 50%;
  background: #27ae60; color: #fff;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #3d6080;
}

.profil-header-info { flex: 1; min-width: 0; }
.profil-name {
  font-family: 'Merriweather', serif;
  font-size: 22px; font-weight: 700;
  color: #fff; margin-bottom: 8px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.profil-email-sub {
  font-size: 13px; color: rgba(255,255,255,0.55);
  margin-top: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.profil-role-badge {
  display: inline-block;
  font-size: 11.5px; font-weight: 700;
  padding: 3px 12px; border-radius: 20px;
  letter-spacing: 0.05em; text-transform: uppercase;
}
.badge-admin      { background: rgba(231,76,60,0.22);   color: #ff8a7a; border: 1px solid rgba(231,76,60,0.30); }
.badge-directeur  { background: rgba(245,166,35,0.22);  color: #f5c842; border: 1px solid rgba(245,166,35,0.30); }
.badge-enseignant { background: rgba(39,174,96,0.22);   color: #6dde9a; border: 1px solid rgba(39,174,96,0.30); }
.badge-etudiant   { background: rgba(142,68,173,0.22);  color: #c77dff; border: 1px solid rgba(142,68,173,0.30); }
.badge-default    { background: rgba(255,255,255,0.14); color: rgba(255,255,255,0.75); border: 1px solid rgba(255,255,255,0.20); }

.btn-edit-profil {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 20px;
  background: rgba(255,255,255,0.13);
  border: 1.5px solid rgba(255,255,255,0.25);
  border-radius: 11px;
  color: #fff; font-size: 13.5px; font-weight: 600;
  font-family: 'Source Sans 3', sans-serif;
  cursor: pointer; transition: all 0.18s;
  white-space: nowrap; flex-shrink: 0;
}
.btn-edit-profil:hover { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.40); }

/* ── GRID ── */
.profil-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* ── CARDS ── */
.info-card {
  background: #ddd9d1;
  border-radius: 16px;
  border: 1.5px solid #c8c4bc;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.card-header {
  display: flex; align-items: center; gap: 12px;
  padding: 18px 22px 14px;
  border-bottom: 1px solid #c8c4bc;
}
.card-icon {
  width: 34px; height: 34px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.card-icon-blue  { background: rgba(61,96,128,0.12);  color: #3d6080; }
.card-icon-gold  { background: rgba(245,166,35,0.12);  color: #d98e1a; }
.card-icon-green { background: rgba(39,174,96,0.12);   color: #27ae60; }
.card-icon-slate { background: rgba(74,90,106,0.10);   color: #4a5a6a; }
.card-title {
  font-family: 'Merriweather', serif;
  font-size: 14px; font-weight: 700; color: #1e2a35;
}

.card-body { padding: 8px 22px 16px; }

.info-row {
  display: flex; align-items: flex-start;
  gap: 12px; padding: 10px 0;
  border-bottom: 1px solid rgba(200,196,188,0.45);
}
.info-row:last-child { border-bottom: none; }

.info-label {
  font-size: 12px; font-weight: 700;
  color: #8a9aaa; text-transform: uppercase; letter-spacing: 0.06em;
  min-width: 120px; flex-shrink: 0; padding-top: 1px;
}
.info-value {
  font-size: 13.5px; color: #1e2a35; font-weight: 500;
  word-break: break-word;
}
.info-mono  { font-family: monospace; color: #3d6080; font-weight: 700; font-size: 13px; }
.info-link  { color: #3d6080; }

.role-pill {
  display: inline-block; font-size: 11.5px; font-weight: 700;
  padding: 2px 10px; border-radius: 20px;
}
/* reuse badge classes (darker variant for light bg) */
.role-pill.badge-admin      { background: rgba(231,76,60,0.12);   color: #c0392b; }
.role-pill.badge-directeur  { background: rgba(245,166,35,0.14);  color: #b7770d; }
.role-pill.badge-enseignant { background: rgba(39,174,96,0.12);   color: #1e8449; }
.role-pill.badge-etudiant   { background: rgba(142,68,173,0.12);  color: #7d3c8c; }
.role-pill.badge-default    { background: rgba(74,90,106,0.10);   color: #4a5a6a; }

.spec-tag {
  display: inline-block;
  background: rgba(61,96,128,0.10);
  color: #2f4f6a; font-size: 12.5px; font-weight: 600;
  padding: 2px 10px; border-radius: 6px;
  border: 1px solid rgba(61,96,128,0.18);
}

.status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12.5px; font-weight: 600;
  padding: 3px 10px; border-radius: 20px;
}
.status-active { background: rgba(39,174,96,0.12); color: #1e8449; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

.card-footer-action {
  padding: 12px 22px 16px;
  border-top: 1px solid rgba(200,196,188,0.50);
}
.btn-change-pw {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 16px;
  background: rgba(61,96,128,0.07);
  border: 1.5px solid rgba(61,96,128,0.18);
  border-radius: 9px;
  color: #3d6080; font-size: 13px; font-weight: 600;
  font-family: 'Source Sans 3', sans-serif;
  cursor: pointer; transition: all 0.18s;
}
.btn-change-pw:hover { background: #3d6080; color: #fff; border-color: #3d6080; }

@media (max-width: 900px) {
  .profil-grid { grid-template-columns: 1fr; }
  .profil-header { flex-direction: column; align-items: flex-start; }
  .btn-edit-profil { align-self: stretch; justify-content: center; }
}
</style>