<template>
  <div class="accueil-page">

    <!-- ══════════════ HEADER ══════════════ -->
    <header class="header">
      <div class="header-container">
        <router-link to="/" class="logo">
          <div class="logo-icon">VD</div>
          <span class="logo-white">Vers le</span><span class="logo-gold">Diplôme</span>
        </router-link>

        <nav class="nav-desktop">
          <ul class="nav-links">
            <li><a href="#features">Fonctionnalités</a></li>
            <li><a href="#roles">Utilisateurs</a></li>
            <li><a href="#contact">Contact</a></li>
            <li>
              <router-link to="/inscription" class="btn-nav-outline">S'inscrire</router-link>
            </li>
            <li>
              <router-link to="/login" class="btn-nav-solid">Se connecter</router-link>
            </li>
          </ul>
        </nav>

        <button class="mobile-menu-btn" @click="mobileOpen = !mobileOpen">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <div v-if="mobileOpen" class="mobile-menu">
        <a href="#features" @click="mobileOpen=false">Fonctionnalités</a>
        <a href="#roles"    @click="mobileOpen=false">Utilisateurs</a>
        <a href="#contact"  @click="mobileOpen=false">Contact</a>
        <router-link to="/inscription" @click="mobileOpen=false">S'inscrire</router-link>
        <router-link to="/login"       @click="mobileOpen=false">Se connecter</router-link>
      </div>
    </header>

    <!-- ══════════════ HERO ══════════════ -->
    <section class="hero">
      <svg class="hero-geo" viewBox="0 0 1400 700" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="1200" cy="100"  r="220" fill="rgba(255,255,255,0.04)"/>
        <circle cx="100"  cy="600" r="280" fill="rgba(255,255,255,0.03)"/>
        <circle cx="1350" cy="500" r="140" fill="rgba(255,255,255,0.03)"/>
        <line x1="0" y1="680" x2="1400" y2="50" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </svg>

      <div class="hero-inner">
        <div class="hero-content">
          <span class="hero-badge">🎓 Plateforme académique PFE</span>
          <h1>
            Gérez vos <em>Projets de Fin</em><br>
            d'Études en toute simplicité
          </h1>
          <p>
            Une solution complète pour la gestion, le suivi et l'évaluation des PFE.
            Simplifiez la collaboration entre étudiants, encadrants et administration.
          </p>
          <div class="hero-buttons">
            <router-link to="/inscription" class="btn-gold-solid">
              Commencer gratuitement →
            </router-link>
            <router-link to="/login" class="btn-white-outline">
              Se connecter
            </router-link>
          </div>

          <div class="hero-stats">
            <div class="stat">
              <strong>127</strong>
              <span>Projets actifs</span>
            </div>
            <div class="stat-div"></div>
            <div class="stat">
              <strong>48</strong>
              <span>Soutenances</span>
            </div>
            <div class="stat-div"></div>
            <div class="stat">
              <strong>6</strong>
              <span>Rôles supportés</span>
            </div>
          </div>
        </div>

        <!-- Dashboard preview card -->
        <div class="hero-preview">
          <div class="preview-card-wrap">
            <!-- Topbar -->
            <div class="preview-topbar">
              <div class="preview-dots">
                <span class="dot-red"></span>
                <span class="dot-yellow"></span>
                <span class="dot-green"></span>
              </div>
              <span class="preview-label">Tableau de bord — Directeur</span>
            </div>

            <!-- Sidebar mini -->
            <div class="preview-body">
              <div class="preview-sidebar">
                <div class="ps-logo">VD</div>
                <div class="ps-item ps-active"></div>
                <div class="ps-item"></div>
                <div class="ps-item"></div>
                <div class="ps-item"></div>
                <div class="ps-avatar"></div>
              </div>

              <!-- Content -->
              <div class="preview-content">
                <div class="pc-kpis">
                  <div class="pc-kpi pc-blue">
                    <div class="kpi-bar"></div>
                    <strong>127</strong>
                    <span>Projets</span>
                  </div>
                  <div class="pc-kpi pc-gold">
                    <div class="kpi-bar"></div>
                    <strong>48</strong>
                    <span>Soutenances</span>
                  </div>
                  <div class="pc-kpi pc-green">
                    <div class="kpi-bar"></div>
                    <strong>12</strong>
                    <span>Spécialités</span>
                  </div>
                </div>
                <div class="pc-chart">
                  <div class="pc-bar" v-for="h in [55,80,40,95,65,75,50]" :key="h" :style="{height: h+'%'}"></div>
                </div>
                <div class="pc-list">
                  <div class="pc-row" v-for="i in 3" :key="i">
                    <div class="pc-avatar"></div>
                    <div class="pc-lines">
                      <div class="pc-line long"></div>
                      <div class="pc-line short"></div>
                    </div>
                    <div class="pc-badge"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════ FEATURES ══════════════ -->
    <section class="features-section" id="features">
      <div class="container">
        <div class="section-header">
          <span class="section-badge">FONCTIONNALITÉS</span>
          <h2>Tout ce dont vous avez besoin</h2>
          <p>Une solution complète qui accompagne chaque étape du cycle de vie d'un PFE</p>
        </div>
        <div class="features-grid">
          <div class="feature-card" v-for="f in features" :key="f.title">
            <div class="feature-icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════ ROLES ══════════════ -->
    <section class="roles-section" id="roles">
      <div class="container">
        <div class="section-header light">
          <h2>Conçu pour tous les acteurs</h2>
          <p>Une interface adaptée aux besoins spécifiques de chaque utilisateur</p>
        </div>
        <div class="roles-grid">
          <div class="role-card" v-for="r in roles" :key="r.title">
            <div class="role-icon">{{ r.icon }}</div>
            <h3>{{ r.title }}</h3>
            <p class="role-desc">{{ r.desc }}</p>
            <ul class="role-features">
              <li v-for="item in r.features" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════ CTA ══════════════ -->
    <section class="cta-section">
      <div class="cta-inner">
        <div class="cta-text">
          <h2>Prêt à simplifier la gestion de vos PFE ?</h2>
          <p>Rejoignez les établissements qui font confiance à notre plateforme.</p>
        </div>
        <div class="cta-actions">
          <router-link to="/inscription" class="btn-gold-solid">Créer un compte</router-link>
          <router-link to="/login"       class="btn-white-outline">Se connecter</router-link>
        </div>
      </div>
    </section>

    <!-- ══════════════ FOOTER ══════════════ -->
    <footer class="footer" id="contact">
      <div class="footer-grid">
        <div class="footer-about">
          <div class="footer-logo">
            <div class="fl-icon">VD</div>
            <div>
              <span class="logo-white">Vers le</span>
              <span class="logo-gold"> Diplôme</span>
            </div>
          </div>
          <p>La plateforme de référence pour la gestion complète des projets de fin d'études. Simplifiez vos processus académiques.</p>
        </div>
        <div class="footer-col">
          <h4>Plateforme</h4>
          <ul>
            <li><a href="#features">Fonctionnalités</a></li>
            <li><router-link to="/inscription">S'inscrire</router-link></li>
            <li><router-link to="/login">Se connecter</router-link></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Centre d'aide</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Tutoriels</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><a href="#">contact@verslediplome.dz</a></li>
            <li><a href="#">À propos</a></li>
            <li><a href="#">Conditions</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 Vers le Diplôme · Tous droits réservés · Plateforme de gestion des PFE</p>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref } from 'vue'
const mobileOpen = ref(false)

const features = [
  { icon: '🎓', title: 'Gestion des utilisateurs',    desc: "Inscription, authentification et gestion des profils pour tous les acteurs : étudiants, encadrants, chefs de département et administration." },
  { icon: '📝', title: 'Soumission de sujets',         desc: "Les étudiants soumettent leurs sujets de PFE et suivent l'état de validation en temps réel par leurs encadrants." },
  { icon: '👥', title: 'Affectation intelligente',     desc: "Système d'affectation des encadrants avec options manuelle, aléatoire ou semi-aléatoire selon vos besoins." },
  { icon: '📊', title: 'Suivi de progression',         desc: "Gestion des rapports d'avancement, planification des réunions et suivi des phases du projet." },
  { icon: '📅', title: 'Organisation des soutenances', desc: "Composition automatique des jurys, planification des dates et attribution des salles de soutenance." },
  { icon: '⭐', title: 'Évaluation & Notation',        desc: "Grilles d'évaluation personnalisables, notes détaillées et mentions pour chaque phase du projet." },
  { icon: '📁', title: 'Gestion des livrables',        desc: "Dépôt, consultation et validation des livrables finaux avec respect des délais établis." },
  { icon: '🔔', title: 'Notifications & Messagerie',   desc: "Système de notifications en temps réel et messagerie intégrée pour faciliter la communication." },
  { icon: '📈', title: 'Tableaux de bord',             desc: "Visualisation des statistiques, indicateurs de performance et rapports pour l'administration." },
]

const roles = [
  {
    icon: '👨‍🎓', title: 'Étudiants', desc: 'Gérez votre PFE du début à la fin',
    features: ['Soumettre et modifier votre sujet', "Suivre l'état de validation", "Gérer vos rapports d'avancement", 'Déposer vos livrables', 'Consulter vos notes'],
  },
  {
    icon: '👨‍🏫', title: 'Encadrants', desc: 'Accompagnez efficacement vos étudiants',
    features: ['Consulter vos étudiants affectés', 'Valider ou rejeter les sujets', 'Planifier les réunions de suivi', 'Évaluer les livrables', 'Gérer les phases du projet'],
  },
  {
    icon: '👔', title: 'Chef de département', desc: "Pilotez l'ensemble des projets",
    features: ['Définir les spécialités', 'Affecter les encadrants', "Créer les grilles d'évaluation", 'Composer les jurys', 'Planifier les soutenances'],
  },
  {
    icon: '⚖️', title: 'Jury & Administration', desc: 'Évaluez et supervisez',
    features: ['Consulter les projets à évaluer', 'Accéder aux livrables finaux', 'Saisir les évaluations', 'Générer des rapports', 'Archiver les projets'],
  },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,700;1,700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

/* ─── Variables ─────────────────────────────── */
/* PRIMARY : steel blue  #3d6080 / dark #2f4f6a */
/* ACCENT  : gold        #f5a623               */
/* BG      : warm grey   #c8c4bc / #ddd9d1     */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes fadeUp  { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
@keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
@keyframes growUp  { from { height:0; } }
@keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }

.accueil-page {
  font-family: 'Source Sans 3', sans-serif;
  color: #1e2a35;
  overflow-x: hidden;
}
.container { max-width: 1280px; margin: 0 auto; padding: 0 2rem; }

.logo-white { color: #fff; }
.logo-gold  { color: #f5a623; }

/* ─── HEADER ─────────────────────────────────── */
.header {
  background: rgba(255,255,255,0.97);
  backdrop-filter: blur(12px);
  padding: 0.85rem 0;
  position: sticky; top: 0; z-index: 200;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  animation: fadeUp 0.5s ease-out;
}
.header-container {
  max-width: 1280px; margin: 0 auto; padding: 0 2rem;
  display: flex; justify-content: space-between; align-items: center;
}
.logo {
  display: flex; align-items: center; gap: 0.55rem;
  text-decoration: none;
  font-family: 'Merriweather', serif;
  font-size: 1.3rem; font-weight: 700;
}
.logo-icon {
  width: 38px; height: 38px;
  background: linear-gradient(160deg, #4a7090, #2f4f6a);
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  color: #f5a623; font-weight: 900; font-size: 0.85rem;
  letter-spacing: -0.5px;
}
.logo .logo-white { color: #2f4f6a; }
.logo .logo-gold  { color: #f5a623; }

.nav-links { display: flex; gap: 1.6rem; list-style: none; align-items: center; }
.nav-links a {
  color: #334155; text-decoration: none; font-weight: 500; font-size: 0.93rem;
  transition: color 0.2s; position: relative;
}
.nav-links a::after {
  content:''; position:absolute; bottom:-4px; left:0;
  width:0; height:2px; background:#f5a623; transition:width 0.3s;
}
.nav-links a:hover { color: #3d6080; }
.nav-links a:hover::after { width:100%; }

.btn-nav-outline {
  padding: 0.5rem 1.2rem;
  border: 2px solid #3d6080; border-radius: 8px;
  color: #3d6080 !important; font-weight: 600;
  transition: all 0.2s; text-decoration: none !important;
}
.btn-nav-outline:hover { background: #eef4f8; }
.btn-nav-outline::after { display:none !important; }

.btn-nav-solid {
  padding: 0.5rem 1.2rem;
  background: linear-gradient(160deg, #4a7090, #2f4f6a);
  color: white !important; border-radius: 8px; font-weight: 600;
  transition: all 0.2s; text-decoration: none !important;
  box-shadow: 0 3px 12px rgba(61,96,128,0.3);
}
.btn-nav-solid:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(61,96,128,0.4); }
.btn-nav-solid::after { display:none !important; }

.mobile-menu-btn {
  display: none; background: none; border: none;
  color: #3d6080; cursor: pointer; padding: 4px;
}
.mobile-menu {
  display: flex; flex-direction: column;
  padding: 1rem 2rem; background: white;
  border-top: 1px solid #e2e8f0; gap: 0.5rem;
}
.mobile-menu a {
  color: #334155; text-decoration: none; font-weight: 500;
  padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9;
}

/* ─── HERO ───────────────────────────────────── */
.hero {
  background: linear-gradient(160deg, #4a7090 0%, #3d6080 30%, #2f4f6a 65%, #243d52 100%);
  min-height: 100vh;
  display: flex; align-items: center;
  position: relative; overflow: hidden;
  padding: 2rem 0;
}
.hero-geo {
  position: absolute; inset: 0; width:100%; height:100%; pointer-events:none;
}
.hero-inner {
  max-width: 1280px; margin: 0 auto; padding: 0 2rem;
  display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;
  width: 100%;
  animation: fadeUp 0.8s ease-out 0.2s backwards;
  position: relative; z-index: 1;
}

.hero-badge {
  display: inline-block;
  background: rgba(245,166,35,0.18);
  color: #f5a623;
  border: 1px solid rgba(245,166,35,0.35);
  padding: 0.4rem 1rem; border-radius: 50px;
  font-size: 0.88rem; font-weight: 600;
  margin-bottom: 1.25rem; letter-spacing: 0.3px;
}
.hero-content h1 {
  font-family: 'Merriweather', serif;
  font-size: 3rem; font-weight: 700;
  color: white; line-height: 1.2; margin-bottom: 1.2rem;
}
.hero-content h1 em {
  font-style: italic; color: #f5a623;
}
.hero-content p {
  font-size: 1.1rem; color: rgba(255,255,255,0.82);
  line-height: 1.75; margin-bottom: 2rem; font-weight: 300;
}

.hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2.5rem; }
.btn-gold-solid {
  padding: 0.85rem 2rem;
  background: #f5a623; color: #1e2a35;
  border-radius: 10px; font-weight: 700; font-size: 0.97rem;
  text-decoration: none; transition: all 0.2s;
  box-shadow: 0 5px 18px rgba(245,166,35,0.4);
  display: inline-block;
}
.btn-gold-solid:hover { background: #d98e1a; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,166,35,0.5); }
.btn-white-outline {
  padding: 0.85rem 2rem;
  background: rgba(255,255,255,0.1); color: white;
  border-radius: 10px; font-weight: 600; font-size: 0.97rem;
  text-decoration: none; border: 2px solid rgba(255,255,255,0.3);
  transition: all 0.2s; backdrop-filter: blur(8px);
  display: inline-block;
}
.btn-white-outline:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); }

.hero-stats { display: flex; align-items: center; gap: 1.5rem; }
.stat { text-align: center; }
.stat strong { display: block; font-size: 1.9rem; font-weight: 800; color: #f5a623; line-height:1; font-family:'Merriweather',serif; }
.stat span   { font-size: 0.8rem; color: rgba(255,255,255,0.65); font-weight: 300; }
.stat-div { width: 1px; height: 38px; background: rgba(255,255,255,0.2); }

/* ─── Dashboard Preview ──────────────────────── */
.hero-preview { animation: float 6s ease-in-out infinite; }
.preview-card-wrap {
  background: #ddd9d1;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0,0,0,0.3);
}
.preview-topbar {
  background: #c8c4bc; padding: 0.65rem 1rem;
  display: flex; align-items: center; gap: 8px;
}
.preview-dots { display: flex; gap: 5px; }
.dot-red    { width:9px; height:9px; border-radius:50%; background:#ef4444; display:block; }
.dot-yellow { width:9px; height:9px; border-radius:50%; background:#f5a623; display:block; }
.dot-green  { width:9px; height:9px; border-radius:50%; background:#22c55e; display:block; }
.preview-label { font-size: 0.72rem; color: #8a9aaa; font-weight: 600; margin-left: 6px; }

.preview-body { display: flex; }

/* Sidebar mini */
.preview-sidebar {
  width: 44px; background: linear-gradient(160deg, #4a7090, #243d52);
  display: flex; flex-direction: column; align-items: center;
  padding: 10px 0; gap: 8px;
}
.ps-logo {
  width: 28px; height: 28px; border-radius: 7px;
  background: #f5a623; color: #1e2a35;
  font-size: 0.6rem; font-weight: 900;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 6px;
}
.ps-item {
  width: 28px; height: 6px; border-radius: 3px;
  background: rgba(255,255,255,0.2);
}
.ps-active { background: rgba(245,166,35,0.6); }
.ps-avatar {
  width: 26px; height: 26px; border-radius: 7px;
  background: #f5a623; margin-top: auto; margin-bottom: 4px;
}

/* Content area */
.preview-content { flex: 1; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }

.pc-kpis { display: flex; gap: 0.5rem; }
.pc-kpi {
  flex: 1; border-radius: 8px; padding: 0.6rem;
  display: flex; flex-direction: column; gap: 2px;
}
.pc-blue  { background: #e8f0f5; border-left: 3px solid #3d6080; }
.pc-gold  { background: #fef9ed; border-left: 3px solid #f5a623; }
.pc-green { background: #edfaf2; border-left: 3px solid #27ae60; }
.kpi-bar { height: 3px; border-radius: 2px; background: currentColor; opacity: 0.3; width: 60%; margin-bottom: 4px; }
.pc-blue .kpi-bar  { color: #3d6080; }
.pc-gold .kpi-bar  { color: #f5a623; }
.pc-green .kpi-bar { color: #27ae60; }
.pc-kpi strong { font-size: 1.1rem; font-weight: 800; color: #1e2a35; line-height:1; }
.pc-kpi span   { font-size: 0.6rem; color: #8a9aaa; text-transform: uppercase; letter-spacing: 0.3px; }

.pc-chart {
  background: #c8c4bc; border-radius: 8px; padding: 0.6rem;
  height: 70px; display: flex; align-items: flex-end;
  gap: 3px; justify-content: space-around;
}
.pc-bar {
  flex: 1;
  background: linear-gradient(180deg, #3d6080, #f5a623);
  border-radius: 3px 3px 0 0;
  animation: growUp 1s ease-out backwards;
}
.pc-bar:nth-child(1){animation-delay:.1s}
.pc-bar:nth-child(2){animation-delay:.2s}
.pc-bar:nth-child(3){animation-delay:.3s}
.pc-bar:nth-child(4){animation-delay:.4s}
.pc-bar:nth-child(5){animation-delay:.5s}
.pc-bar:nth-child(6){animation-delay:.6s}
.pc-bar:nth-child(7){animation-delay:.7s}

.pc-list { display: flex; flex-direction: column; gap: 5px; }
.pc-row  { display: flex; align-items: center; gap: 6px; }
.pc-avatar { width:22px; height:22px; border-radius:50%; background:linear-gradient(135deg,#3d6080,#f5a623); flex-shrink:0; }
.pc-lines  { flex:1; display:flex; flex-direction:column; gap:3px; }
.pc-line   { height:5px; border-radius:2px; background:#c8c4bc; }
.pc-line.long  { width:75%; }
.pc-line.short { width:45%; }
.pc-badge { width:32px; height:14px; border-radius:10px; background:#e8f0f5; }

/* ─── FEATURES ───────────────────────────────── */
.features-section {
  background: #ddd9d1;
  padding: 6rem 0;
}
.section-header { text-align: center; margin-bottom: 3.5rem; }
.section-badge {
  display: inline-block; padding: 0.4rem 1.1rem;
  background: rgba(61,96,128,0.1);
  color: #3d6080; border-radius: 50px; font-weight: 700;
  font-size: 0.82rem; margin-bottom: 1rem; letter-spacing: 0.8px;
}
.section-header h2 {
  font-family: 'Merriweather', serif;
  font-size: 2.4rem; font-weight: 700; color: #1e2a35; margin-bottom: 0.8rem;
}
.section-header p { font-size: 1.05rem; color: #8a9aaa; max-width: 620px; margin: 0 auto; line-height: 1.7; font-weight: 300; }
.section-header.light h2 { color: white; }
.section-header.light p  { color: rgba(255,255,255,0.75); }

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 1.5rem;
}
.feature-card {
  background: #e8e4dc; padding: 2rem;
  border-radius: 16px;
  border: 1.5px solid #c8c4bc;
  position: relative; overflow: hidden;
  transition: all 0.35s ease;
  cursor: default;
}
.feature-card::before {
  content:''; position:absolute; inset:0;
  background: linear-gradient(160deg, #4a7090, #2f4f6a);
  opacity:0; transition: opacity 0.35s; z-index:0;
}
.feature-card > * { position:relative; z-index:1; }
.feature-card:hover { transform: translateY(-6px); box-shadow: 0 14px 32px rgba(0,0,0,0.12); border-color: #3d6080; }
.feature-card:hover::before { opacity: 1; }
.feature-card:hover h3, .feature-card:hover p { color: white; }
.feature-card:hover .feature-icon { background: rgba(255,255,255,0.15); }

.feature-icon {
  width: 52px; height: 52px;
  background: rgba(61,96,128,0.1);
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem; margin-bottom: 1rem; transition: all 0.35s;
}
.feature-card h3 { font-size: 1.05rem; font-weight: 700; color: #1e2a35; margin-bottom: 0.5rem; transition: color 0.35s; }
.feature-card p  { font-size: 0.93rem; color: #8a9aaa; line-height: 1.65; transition: color 0.35s; font-weight: 300; }

/* ─── ROLES ──────────────────────────────────── */
.roles-section {
  background: linear-gradient(160deg, #2f4f6a 0%, #1e2a35 100%);
  padding: 6rem 0;
  position: relative; overflow: hidden;
}
.roles-section::before {
  content:''; position:absolute; inset:0;
  background:
    radial-gradient(circle at 15% 50%, rgba(245,166,35,0.07) 0%, transparent 50%),
    radial-gradient(circle at 85% 80%, rgba(61,96,128,0.12) 0%, transparent 50%);
}
.roles-section .container { position:relative; z-index:1; }

.roles-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 1.5rem;
}
.role-card {
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(255,255,255,0.08);
  border-radius: 18px; padding: 2rem; text-align: center;
  transition: all 0.35s; backdrop-filter: blur(8px);
}
.role-card:hover {
  transform: translateY(-6px);
  border-color: #f5a623;
  background: rgba(255,255,255,0.08);
  box-shadow: 0 18px 40px rgba(0,0,0,0.3);
}
.role-icon {
  width: 72px; height: 72px; margin: 0 auto 1.2rem;
  background: linear-gradient(160deg, #4a7090, #f5a623);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 2rem; transition: transform 0.35s;
}
.role-card:hover .role-icon { transform: scale(1.1) rotate(5deg); }
.role-card h3 { font-family:'Merriweather',serif; font-size: 1.2rem; color: white; font-weight: 700; margin-bottom: 0.4rem; }
.role-desc    { color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-bottom: 1.1rem; font-weight: 300; }
.role-features { list-style: none; text-align: left; }
.role-features li {
  color: rgba(255,255,255,0.78); font-size: 0.88rem;
  padding: 0.4rem 0 0.4rem 1.5rem; position: relative;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.role-features li:last-child { border-bottom: none; }
.role-features li::before { content:'✓'; position:absolute; left:0; color:#f5a623; font-weight:700; }

/* ─── CTA ────────────────────────────────────── */
.cta-section {
  background: #ddd9d1;
  padding: 4rem 2rem;
  position: relative; overflow: hidden;
}
.cta-section::before {
  content:''; position:absolute;
  top:-50%; right:-5%; width:400px; height:400px;
  background: rgba(61,96,128,0.06); border-radius:50%;
  animation: pulse 5s ease-in-out infinite;
}
.cta-inner {
  max-width: 960px; margin: 0 auto; position: relative; z-index:1;
  display: flex; align-items: center; justify-content: space-between;
  gap: 2rem; flex-wrap: wrap;
  background: linear-gradient(160deg, #4a7090, #2f4f6a);
  border-radius: 20px; padding: 3rem;
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}
.cta-text h2 { font-family:'Merriweather',serif; font-size: 1.9rem; color: white; font-weight: 700; margin-bottom: 0.6rem; }
.cta-text p  { font-size: 1rem; color: rgba(255,255,255,0.8); line-height: 1.6; font-weight: 300; }
.cta-actions { display: flex; gap: 1rem; flex-wrap: wrap; flex-shrink: 0; }

/* ─── FOOTER ─────────────────────────────────── */
.footer { background: #1e2a35; padding: 3rem 2rem 1.5rem; color: rgba(255,255,255,0.6); }
.footer-grid {
  max-width: 1280px; margin: 0 auto;
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2.5rem; margin-bottom: 2rem;
}

.footer-logo {
  display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem;
}
.fl-icon {
  width: 34px; height: 34px;
  background: linear-gradient(160deg, #4a7090, #2f4f6a);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #f5a623; font-weight: 900; font-size: 0.75rem;
}
.footer-logo .logo-white { color: white; font-family:'Merriweather',serif; font-size:1.1rem; font-weight:700; }
.footer-logo .logo-gold  { color: #f5a623; font-family:'Merriweather',serif; font-size:1.1rem; font-weight:700; }
.footer-about p { font-size: 0.88rem; line-height: 1.7; font-weight: 300; }
.footer-col h4  { color: white; font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem; }
.footer-col ul  { list-style: none; }
.footer-col li  { margin-bottom: 0.6rem; }
.footer-col a   { color: rgba(255,255,255,0.55); text-decoration: none; font-size: 0.88rem; transition: color 0.2s; }
.footer-col a:hover { color: #f5a623; }
.footer-bottom {
  max-width: 1280px; margin: 0 auto;
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 1.5rem; text-align: center; font-size: 0.82rem;
}

/* ─── RESPONSIVE ─────────────────────────────── */
@media (max-width: 1024px) {
  .hero-inner { grid-template-columns: 1fr; }
  .hero-content h1 { font-size: 2.4rem; }
  .cta-inner { flex-direction: column; text-align: center; }
  .cta-actions { justify-content: center; }
  .footer-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .nav-desktop { display: none; }
  .mobile-menu-btn { display: block; }
  .hero-content h1 { font-size: 2rem; }
  .section-header h2 { font-size: 1.9rem; }
  .features-grid, .roles-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr; }
  .hero-stats { gap: 1rem; }
  .stat strong { font-size: 1.5rem; }
  .cta-inner { padding: 2rem; }
  .cta-text h2 { font-size: 1.5rem; }
}
</style>