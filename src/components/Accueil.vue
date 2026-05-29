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
          <h1>
            Gérez vos <em>Projets de Fin</em><br>
            d'Études en toute simplicité
          </h1>
          <p>
            Une solution complète pour centraliser, suivre et coordonner vos PFE.
            Collaboration en temps réel entre étudiants, encadrants et administration.
          </p>
          <div class="hero-buttons">
            <router-link to="/inscription" class="btn-gold-solid">
              Commencer maintenant →
            </router-link>
            <router-link to="/login" class="btn-white-outline">
              Se connecter
            </router-link>
          </div>
        </div>

        <!-- Dashboard preview card -->
        <div class="hero-preview">
          <div class="preview-card-wrap">
            <div class="preview-topbar">
              <div class="preview-dots">
                <span class="dot-red"></span>
                <span class="dot-yellow"></span>
                <span class="dot-green"></span>
              </div>
              <span class="preview-label">Tableau de bord — Directeur de stage</span>
            </div>
            <div class="preview-body">
              <div class="preview-sidebar">
                <div class="ps-logo">VD</div>
                <div class="ps-item ps-active"></div>
                <div class="ps-item"></div>
                <div class="ps-item"></div>
                <div class="ps-item"></div>
                <div class="ps-avatar"></div>
              </div>
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
          <p>Une solution complète qui accompagne chaque étape du cycle de vie d'un PFE, de la soumission du sujet jusqu'à l'archivage final</p>
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
          <p>Une interface adaptée aux besoins spécifiques de chaque utilisateur du processus académique</p>
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
          <p>Rejoignez la plateforme qui digitalise et centralise l'ensemble du processus de gestion des PFE.</p>
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
          <p>La plateforme dédiée à la gestion complète des projets de fin d'études. Centralisation, suivi structuré et collaboration entre tous les acteurs académiques.</p>
        </div>
        <div class="footer-col">
          <h4>Plateforme</h4>
          <ul>
            <li><a href="#features">Fonctionnalités</a></li>
            <li><a href="#roles">Utilisateurs</a></li>
            <li><router-link to="/inscription">S'inscrire</router-link></li>
            <li><router-link to="/login">Se connecter</router-link></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="#" @click.prevent="openModal('aide')">Centre d'aide</a></li>
            <li><a href="#" @click.prevent="openModal('faq')">FAQ</a></li>
            <li><a href="#" @click.prevent="openModal('tutoriels')">Tutoriels</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Informations</h4>
          <ul>
            <li><a href="#" @click.prevent="openModal('contact')">Nous contacter</a></li>
            <li><a href="#" @click.prevent="openModal('apropos')">À propos</a></li>
            <li><a href="#" @click.prevent="openModal('conditions')">Conditions d'utilisation</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 Vers le Diplôme · Tous droits réservés · Plateforme de gestion des PFE</p>
      </div>
    </footer>

    <!-- ══════════════ MODALS ══════════════ -->
    <transition name="modal-fade">
      <div v-if="activeModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box" role="dialog" aria-modal="true">
          <!-- Header -->
          <div class="modal-header">
            <div class="modal-title-row">
              <span class="modal-icon">{{ modalContent[activeModal].icon }}</span>
              <h3>{{ modalContent[activeModal].title }}</h3>
            </div>
            <button class="modal-close" @click="closeModal" aria-label="Fermer">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <!-- Body -->
          <div class="modal-body" v-html="modalContent[activeModal].body"></div>
          <!-- Footer -->
          <div class="modal-footer">
            <button class="modal-btn-close" @click="closeModal">Fermer</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const mobileOpen = ref(false)
const activeModal = ref(null)

function openModal(key) { activeModal.value = key }
function closeModal()   { activeModal.value = null }

// ── Close on ESC ──
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal()
  })
}

// ─────────────────────────────────────────────
//  MODAL CONTENT
// ─────────────────────────────────────────────
const modalContent = {

  // ── CENTRE D'AIDE ──────────────────────────
  aide: {
    icon: '🆘',
    title: 'Centre d\'aide',
    body: `
      <div class="mc-section">
        <p class="mc-intro">Bienvenue dans le centre d'aide de <strong>Vers le Diplôme</strong>. Retrouvez ici les réponses aux questions les plus courantes selon votre profil.</p>
      </div>

      <div class="mc-section">
        <h4>👨‍🎓 Pour les étudiants</h4>
        <div class="mc-cards">
          <div class="mc-card">
            <span class="mc-card-icon">📝</span>
            <div>
              <strong>Comment soumettre mon sujet de PFE ?</strong>
              <p>Connectez-vous, accédez à « Ma demande » dans la barre de navigation, choisissez un encadrant disponible et remplissez le formulaire de demande d'encadrement avec les détails de votre sujet.</p>
            </div>
          </div>
          <div class="mc-card">
            <span class="mc-card-icon">📁</span>
            <div>
              <strong>Comment déposer un livrable ?</strong>
              <p>Depuis votre espace « Gérer projet PFE », sélectionnez la phase active et cliquez sur « Déposer un livrable » pour téléverser votre fichier PDF.</p>
            </div>
          </div>
          <div class="mc-card">
            <span class="mc-card-icon">📊</span>
            <div>
              <strong>Comment consulter mes résultats ?</strong>
              <p>Une fois la délibération publiée par le chef de département, vos résultats (note, mention, décision) seront visibles dans votre espace personnel.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mc-section">
        <h4>👨‍🏫 Pour les encadrants</h4>
        <div class="mc-cards">
          <div class="mc-card">
            <span class="mc-card-icon">✅</span>
            <div>
              <strong>Comment valider un livrable ?</strong>
              <p>Accédez à « Gérer demandes » ou au suivi de progression d'un étudiant, consultez le livrable déposé et cliquez sur « Valider » ou « Rejeter avec commentaire ».</p>
            </div>
          </div>
          <div class="mc-card">
            <span class="mc-card-icon">📅</span>
            <div>
              <strong>Comment planifier une réunion ?</strong>
              <p>Dans votre agenda, cliquez sur « Proposer un créneau », sélectionnez l'étudiant concerné, choisissez une date/heure et envoyez la proposition.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mc-section">
        <h4>👔 Pour les chefs de département</h4>
        <div class="mc-cards">
          <div class="mc-card">
            <span class="mc-card-icon">⚙️</span>
            <div>
              <strong>Comment lancer l'affectation des encadrants ?</strong>
              <p>Après publication du formulaire de vœux et collecte des réponses, accédez à « Gestion des affectations », choisissez le mode (automatique, semi-automatique ou accord mutuel) et lancez le processus.</p>
            </div>
          </div>
          <div class="mc-card">
            <span class="mc-card-icon">📋</span>
            <div>
              <strong>Comment créer une phase d'évaluation ?</strong>
              <p>Dans « Évaluation PFE > Phases d'évaluation », cliquez sur « Nouvelle phase », remplissez les informations (nom, dates, coefficient) et enregistrez. Activez-la quand vous êtes prêt.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mc-contact-hint">
        <span>💬</span>
        <span>Vous ne trouvez pas votre réponse ? Utilisez la <strong>messagerie intégrée</strong> depuis votre espace personnel pour contacter l'administration.</span>
      </div>
    `,
  },

  // ── FAQ ────────────────────────────────────
  faq: {
    icon: '❓',
    title: 'Foire Aux Questions',
    body: `
      <div class="mc-section">
        <p class="mc-intro">Retrouvez les réponses aux questions les plus fréquentes sur la plateforme <strong>Vers le Diplôme</strong>.</p>
      </div>

      <div class="faq-list">
        <details class="faq-item">
          <summary>Qui peut s'inscrire sur la plateforme ?</summary>
          <p>La plateforme est ouverte à tous les acteurs du processus PFE : étudiants, enseignants, encadrants, chefs de département, directeurs de stage et membres du jury. L'administrateur valide chaque demande d'inscription après vérification dans la base de données de l'établissement.</p>
        </details>
        <details class="faq-item">
          <summary>Comment mon compte est-il activé ?</summary>
          <p>Après inscription, vous recevez un email de confirmation. En cliquant sur le lien, votre adresse email est vérifiée. L'administrateur valide ensuite votre compte manuellement. Vous recevrez une notification une fois votre compte actif.</p>
        </details>
        <details class="faq-item">
          <summary>Quels sont les modes d'affectation des encadrants disponibles ?</summary>
          <p>Trois modes sont disponibles : (1) <strong>Automatique</strong> — affectation aléatoire selon les contraintes définies ; (2) <strong>Semi-automatique</strong> — le chef intervient manuellement après une première suggestion automatique ; (3) <strong>Accord mutuel</strong> — l'étudiant envoie une demande à un encadrant qui peut l'accepter ou la refuser.</p>
        </details>
        <details class="faq-item">
          <summary>Comment fonctionne le suivi de progression par phases ?</summary>
          <p>Le chef de département définit des phases d'évaluation ordonnées (ex. : Rapport d'avancement 1, Rapport final…). Chaque phase est activée séquentiellement. Les étudiants déposent leurs livrables, les encadrants les valident ou les rejettent avec commentaire.</p>
        </details>
        <details class="faq-item">
          <summary>Comment sont composés les jurys de soutenance ?</summary>
          <p>Le chef de département compose les groupes jurys en attribuant un rôle à chaque membre (président, examinateur). Les membres du jury peuvent également proposer des créneaux de soutenance. Le calendrier est publié et notifié à tous les participants.</p>
        </details>
        <details class="faq-item">
          <summary>Les tableaux de bord sont-ils accessibles à tous les utilisateurs ?</summary>
          <p>Non, chaque tableau de bord est personnalisé selon le rôle : le directeur de stage dispose d'une vue globale, le chef de département suit la charge de sa spécialité, l'encadrant suit ses étudiants, et le membre du jury accède à ses évaluations. Chaque tableau est filtrable et téléchargeable.</p>
        </details>
        <details class="faq-item">
          <summary>Puis-je accéder à d'anciens projets PFE ?</summary>
          <p>Oui. Une bibliothèque des projets archivés est accessible à tous les utilisateurs connectés. Elle contient les projets finalisés ayant obtenu une mention « Très Bien » et ceux mis en bibliothèque par le chef de département. Vous pouvez y rechercher, filtrer et télécharger les rapports.</p>
        </details>
        <details class="faq-item">
          <summary>La plateforme est-elle accessible sur mobile ?</summary>
          <p>Oui, toutes les interfaces sont responsives et accessibles depuis n'importe quel appareil (ordinateur, tablette, smartphone). L'expérience est optimisée pour les navigateurs modernes.</p>
        </details>
      </div>
    `,
  },

  // ── TUTORIELS ──────────────────────────────
  tutoriels: {
    icon: '📚',
    title: 'Tutoriels',
    body: `
      <div class="mc-section">
        <p class="mc-intro">Guides étape par étape pour prendre en main <strong>Vers le Diplôme</strong> selon votre rôle.</p>
      </div>

      <div class="mc-section">
        <h4>🚀 Premiers pas sur la plateforme</h4>
        <ol class="mc-steps">
          <li><span class="step-num">1</span><div><strong>Inscription</strong> — Accédez à la page d'inscription, sélectionnez votre rôle, remplissez vos informations et validez votre adresse email via le lien envoyé.</div></li>
          <li><span class="step-num">2</span><div><strong>Activation du compte</strong> — L'administrateur vérifie votre identité et active votre compte. Vous recevrez une notification par email.</div></li>
          <li><span class="step-num">3</span><div><strong>Première connexion</strong> — Connectez-vous avec votre email et votre mot de passe. Vous arrivez automatiquement sur votre tableau de bord personnalisé.</div></li>
          <li><span class="step-num">4</span><div><strong>Compléter votre profil</strong> — Accédez à votre profil via l'icône en haut à droite et complétez vos informations (téléphone, établissement, domaine d'expertise).</div></li>
        </ol>
      </div>

      <div class="mc-section">
        <h4>👨‍🎓 Guide étudiant : soumettre un PFE</h4>
        <ol class="mc-steps">
          <li><span class="step-num">1</span><div>Accédez à <strong>« Encadrants disponibles »</strong> dans la barre de navigation pour consulter la liste des encadrants.</div></li>
          <li><span class="step-num">2</span><div>Consultez la fiche d'un encadrant (disponibilité, domaine, nombre de places restantes) et cliquez sur <strong>« Choisir »</strong>.</div></li>
          <li><span class="step-num">3</span><div>Remplissez le formulaire de demande : titre du sujet, description, et joignez un document PDF si nécessaire.</div></li>
          <li><span class="step-num">4</span><div>Suivez l'état de votre demande depuis <strong>« Ma demande »</strong> (En attente → Acceptée / Rejetée).</div></li>
          <li><span class="step-num">5</span><div>Une fois affecté, déposez vos livrables pour chaque phase active depuis <strong>« Gérer projet PFE »</strong>.</div></li>
        </ol>
      </div>

      <div class="mc-section">
        <h4>👨‍🏫 Guide encadrant : suivre ses étudiants</h4>
        <ol class="mc-steps">
          <li><span class="step-num">1</span><div>Remplissez votre <strong>fiche de vœux</strong> dès sa publication par le chef de département (nombre max d'étudiants, disponibilité, thématiques).</div></li>
          <li><span class="step-num">2</span><div>Consultez et gérez les <strong>demandes d'encadrement</strong> reçues (accepter / rejeter avec motif).</div></li>
          <li><span class="step-num">3</span><div>Suivez la progression de vos étudiants : validez ou rejetez leurs livrables de chaque phase avec un commentaire.</div></li>
          <li><span class="step-num">4</span><div>Planifiez des <strong>réunions de suivi</strong> en proposant des créneaux directement depuis votre agenda.</div></li>
          <li><span class="step-num">5</span><div>Proposez un <strong>plan de soutenance</strong> depuis l'interface dédiée lorsque votre étudiant est prêt.</div></li>
        </ol>
      </div>

      <div class="mc-section">
        <h4>👔 Guide chef de département</h4>
        <ol class="mc-steps">
          <li><span class="step-num">1</span><div>Créez les <strong>phases d'évaluation</strong> et la <strong>grille de critères</strong> avant le lancement de l'année.</div></li>
          <li><span class="step-num">2</span><div>Créez et publiez le <strong>formulaire de vœux</strong> pour recueillir les préférences des enseignants.</div></li>
          <li><span class="step-num">3</span><div>Lancez l'<strong>affectation des encadrants</strong> selon le mode choisi (automatique / semi-automatique / accord mutuel).</div></li>
          <li><span class="step-num">4</span><div>Composez les <strong>jurys de soutenance</strong> et planifiez le calendrier des soutenances.</div></li>
          <li><span class="step-num">5</span><div>Lancez la <strong>délibération</strong>, publiez les résultats et archivez les projets de l'année.</div></li>
        </ol>
      </div>
    `,
  },

  // ── CONTACT ────────────────────────────────
  contact: {
    icon: '✉️',
    title: 'Nous contacter',
    body: `
      <div class="mc-section">
        <p class="mc-intro">Pour toute question, suggestion ou signalement, plusieurs canaux sont à votre disposition.</p>
      </div>

      <div class="contact-cards">
        <div class="contact-card">
          <div class="contact-card-icon">🏫</div>
          <h4>Établissement</h4>
          <p>Département Informatique de Gestion<br>Spécialité Business Intelligence<br>Année universitaire 2025/2026</p>
        </div>
        <div class="contact-card">
          <div class="contact-card-icon">👩‍💻</div>
          <h4>Équipe de développement</h4>
          <p>Sarra Allègue &amp; Yesmin Besghaier<br>Licence Informatique de Gestion<br>Spécialité Business Intelligence — 2025/2026</p>
        </div>
        <div class="contact-card">
          <div class="contact-card-icon">🏢</div>
          <h4>Organisme d'accueil</h4>
          <p>Elyos Digital<br>Agence web &amp; transition numérique<br>Encadrante : Mme Asma Ben Ali</p>
        </div>
        <div class="contact-card">
          <div class="contact-card-icon">👩‍🏫</div>
          <h4>Encadrement académique</h4>
          <p>Dr. Sirine Zaouali<br>Encadrante académique</p>
        </div>
      </div>

      <div class="mc-section" style="margin-top:1.5rem">
        <h4>📬 Contact via la plateforme</h4>
        <p style="color:#4a5a6a;font-size:0.93rem;line-height:1.7">Une fois connecté(e), utilisez la <strong>messagerie intégrée</strong> pour contacter directement l'administrateur de la plateforme, votre encadrant ou le chef de département de votre spécialité.</p>
      </div>

      <div class="mc-contact-hint">
        <span>⚠️</span>
        <span>Cette plateforme est un projet académique. Elle n'est pas un service commercial.</span>
      </div>
    `,
  },

  // ── À PROPOS ───────────────────────────────
  apropos: {
    icon: '🎓',
    title: 'À propos de Vers le Diplôme',
    body: `
      <div class="mc-section">
        <p class="mc-intro"><strong>Vers le Diplôme</strong> est une application web de gestion des Projets de Fin d'Études (PFE), développée dans le cadre d'un projet de licence en Informatique de Gestion, spécialité Business Intelligence — année universitaire 2025/2026.</p>
      </div>

      <div class="mc-section">
        <h4>🎯 Objectif du projet</h4>
        <p>Digitaliser et centraliser l'ensemble du processus de gestion des PFE sur une plateforme unique et accessible à tous les acteurs académiques : étudiants, encadrants, chefs de département, directeurs de stage, membres du jury et administrateurs.</p>
      </div>

      <div class="mc-section">
        <h4>🔍 Problématique résolue</h4>
        <div class="mc-cards">
          <div class="mc-card">
            <span class="mc-card-icon">❌</span>
            <div>
              <strong>Avant la plateforme</strong>
              <p>Gestion fragmentée par emails, fichiers Excel et documents papier. Absence de traçabilité, communication inefficace, risques de perte de documents et manque d'automatisation.</p>
            </div>
          </div>
          <div class="mc-card">
            <span class="mc-card-icon">✅</span>
            <div>
              <strong>Avec Vers le Diplôme</strong>
              <p>Centralisation complète, suivi structuré par phases, affectation intelligente des encadrants, organisation automatisée des soutenances et tableaux de bord décisionnels.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mc-section">
        <h4>🛠️ Stack technique</h4>
        <div class="tech-grid">
          <span class="tech-tag">Vue.js 3</span>
          <span class="tech-tag">Laravel</span>
          <span class="tech-tag">MySQL</span>
          <span class="tech-tag">PHP</span>
          <span class="tech-tag">Vite</span>
          <span class="tech-tag">Node.js</span>
          <span class="tech-tag">Bootstrap</span>
          <span class="tech-tag">Chart.js</span>
          <span class="tech-tag">GitHub</span>
          <span class="tech-tag">Trello</span>
        </div>
      </div>

      <div class="mc-section">
        <h4>⚙️ Méthodologie</h4>
        <p>Le projet a été réalisé en suivant la méthodologie <strong>Scrum</strong> (5 sprints de 17 jours chacun) et la méthode <strong>GIMSI</strong> pour la conception des tableaux de bord Business Intelligence.</p>
      </div>

      <div class="mc-section">
        <h4>👩‍💻 L'équipe</h4>
        <div class="team-row">
          <div class="team-member">
            <div class="team-avatar">SA</div>
            <strong>Sarra Allègue</strong>
            <span>Développeuse</span>
          </div>
          <div class="team-member">
            <div class="team-avatar">YB</div>
            <strong>Yesmin Besghaier</strong>
            <span>Développeuse</span>
          </div>
        </div>
        <p style="text-align:center;color:#8a9aaa;font-size:0.85rem;margin-top:0.8rem">Sous la direction de Dr. Sirine Zaouali (académique) et Mme Asma Ben Ali (professionnelle, Elyos Digital)</p>
      </div>
    `,
  },

  // ── CONDITIONS D'UTILISATION ───────────────
  conditions: {
    icon: '📄',
    title: 'Conditions d\'utilisation',
    body: `
      <div class="mc-section">
        <p class="mc-intro">En utilisant la plateforme <strong>Vers le Diplôme</strong>, vous acceptez les présentes conditions. Veuillez les lire attentivement.</p>
        <p class="mc-date">Dernière mise à jour : Janvier 2026</p>
      </div>

      <div class="mc-section">
        <h4>1. Objet et accès</h4>
        <p>La plateforme <strong>Vers le Diplôme</strong> est un outil académique interne réservé aux membres de l'établissement impliqués dans le processus de gestion des Projets de Fin d'Études. L'accès est conditionné à la validation de votre compte par un administrateur de la plateforme.</p>
      </div>

      <div class="mc-section">
        <h4>2. Comptes utilisateurs</h4>
        <ul class="mc-list">
          <li>Chaque utilisateur ne peut posséder qu'un seul compte sur la plateforme.</li>
          <li>Vous êtes responsable de la confidentialité de vos identifiants de connexion.</li>
          <li>Toute activité réalisée depuis votre compte engage votre responsabilité.</li>
          <li>En cas de perte ou de compromission de votre mot de passe, utilisez immédiatement la fonction « Réinitialiser mot de passe ».</li>
          <li>L'administrateur se réserve le droit de désactiver tout compte non conforme aux présentes conditions.</li>
        </ul>
      </div>

      <div class="mc-section">
        <h4>3. Utilisation acceptable</h4>
        <ul class="mc-list">
          <li>La plateforme est strictement réservée à un usage académique lié aux PFE et aux stages.</li>
          <li>Il est interdit de publier, soumettre ou partager des contenus illicites, trompeurs ou irrespectueux.</li>
          <li>Les livrables et documents soumis doivent être des productions originales. Toute forme de plagiat est prohibée.</li>
          <li>La messagerie intégrée est réservée aux communications académiques entre les acteurs du processus PFE.</li>
          <li>Il est interdit d'utiliser la plateforme pour accéder aux données d'autres utilisateurs sans autorisation.</li>
        </ul>
      </div>

      <div class="mc-section">
        <h4>4. Données personnelles</h4>
        <p>Les données collectées (nom, prénom, email, matricule, rôle, spécialité) sont utilisées exclusivement dans le cadre de la gestion des PFE. Elles ne sont ni vendues ni transmises à des tiers. Les mots de passe sont stockés sous forme chiffrée. Conformément à la réglementation sur la protection des données, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.</p>
      </div>

      <div class="mc-section">
        <h4>5. Propriété intellectuelle</h4>
        <p>Les livrables et rapports déposés sur la plateforme demeurent la propriété intellectuelle de leurs auteurs. En les soumettant, vous accordez à l'établissement le droit de les consulter à des fins d'évaluation académique et d'archivage. Les projets sélectionnés pour la bibliothèque PFE sont accessibles en lecture à tous les utilisateurs de la plateforme.</p>
      </div>

      <div class="mc-section">
        <h4>6. Disponibilité et maintenance</h4>
        <p>La plateforme s'engage à assurer une disponibilité maximale. Des interruptions ponctuelles peuvent survenir pour des opérations de maintenance. Les utilisateurs seront informés autant que possible à l'avance. La plateforme n'est pas responsable des pertes de données résultant d'une utilisation incorrecte ou de pannes matérielles imprévisibles.</p>
      </div>

      <div class="mc-section">
        <h4>7. Modifications des conditions</h4>
        <p>Ces conditions peuvent être mises à jour à tout moment. Les utilisateurs seront notifiés des modifications significatives via la messagerie de la plateforme. La poursuite de l'utilisation de la plateforme après notification vaut acceptation des nouvelles conditions.</p>
      </div>

      <div class="mc-section">
        <h4>8. Contact</h4>
        <p>Pour toute question relative aux présentes conditions, contactez l'administration via la messagerie intégrée de la plateforme.</p>
      </div>

      <div class="mc-contact-hint" style="background:rgba(61,96,128,0.08);border-color:rgba(61,96,128,0.2)">
        <span>ℹ️</span>
        <span>En cochant « J'accepte les conditions d'utilisation » lors de votre inscription, vous confirmez avoir lu et accepté l'intégralité de ces conditions.</span>
      </div>
    `,
  },
}

// ── DATA ──────────────────────────────────────
const features = [
  { icon: '🔐', title: 'Authentification sécurisée',   desc: "Inscription avec vérification par email, connexion sécurisée, réinitialisation du mot de passe et gestion des comptes par l'administrateur." },
  { icon: '📝', title: 'Soumission & validation',       desc: "Les étudiants soumettent leurs demandes d'encadrement. Les encadrants consultent, acceptent ou rejettent les demandes avec motif." },
  { icon: '👥', title: 'Affectation intelligente',      desc: "Trois modes d'affectation : automatique, semi-automatique ou par accord mutuel entre étudiant et encadrant, avec gestion des contraintes." },
  { icon: '📊', title: 'Suivi de progression',          desc: "Phases d'évaluation séquentielles définies par le chef de département. Dépôt de livrables, validation par l'encadrant et gestion des réunions." },
  { icon: '📅', title: 'Organisation des soutenances',  desc: "Composition des jurys par permutation, planification des créneaux, propositions des membres et publication du calendrier officiel." },
  { icon: '⭐', title: 'Évaluation & Notation',         desc: "Grilles d'évaluation personnalisables par catégories et critères, saisie des notes par le jury, délibération et publication des résultats." },
  { icon: '📁', title: 'Archivage & Bibliothèque',      desc: "Archivage automatique des projets finalisés en fin d'année. Bibliothèque des meilleurs PFE accessible à tous les utilisateurs." },
  { icon: '🔔', title: 'Notifications & Messagerie',    desc: "Système de notifications en temps réel pour toutes les actions clés et messagerie intégrée entre tous les acteurs de la plateforme." },
  { icon: '📈', title: 'Tableaux de bord BI',           desc: "Indicateurs de performance personnalisés par rôle (directeur, chef de département, encadrant, jury). Filtrable et téléchargeable." },
]

const roles = [
  {
    icon: '👨‍🎓', title: 'Étudiant', desc: 'Gérez votre PFE du début à la fin',
    features: ['Soumettre une demande d\'encadrement', 'Suivre l\'état de validation', 'Déposer vos livrables par phase', 'Planifier des réunions avec votre encadrant', 'Consulter vos notes et résultats'],
  },
  {
    icon: '👨‍🏫', title: 'Encadrant', desc: 'Accompagnez efficacement vos étudiants',
    features: ['Remplir votre fiche de vœux', 'Consulter vos étudiants affectés', 'Valider ou rejeter les livrables', 'Proposer des créneaux de réunion', 'Proposer un plan de soutenance'],
  },
  {
    icon: '👔', title: 'Chef de département', desc: "Pilotez l'ensemble des projets",
    features: ['Gérer les affectations d\'encadrants', 'Définir les phases et grilles d\'évaluation', 'Composer les jurys de soutenance', 'Planifier et publier les soutenances', 'Publier les résultats et archiver'],
  },
  {
    icon: '⚖️', title: 'Jury & Administration', desc: 'Évaluez et supervisez',
    features: ['Consulter les livrables finaux', 'Saisir les évaluations par critère', 'Proposer des plans de soutenance', 'Accéder aux tableaux de bord', 'Gérer les comptes utilisateurs'],
  },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,700;1,700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

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
.hero-content h1 {
  font-family: 'Merriweather', serif;
  font-size: 3rem; font-weight: 700;
  color: white; line-height: 1.2; margin-bottom: 1.2rem;
}
.hero-content h1 em { font-style: italic; color: #f5a623; }
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

/* ─── Dashboard Preview ──────────────────────── */
.hero-preview { animation: float 6s ease-in-out infinite; }
.preview-card-wrap {
  background: #ddd9d1; border-radius: 16px; overflow: hidden;
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
.ps-item { width: 28px; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.2); }
.ps-active { background: rgba(245,166,35,0.6); }
.ps-avatar { width: 26px; height: 26px; border-radius: 7px; background: #f5a623; margin-top: auto; margin-bottom: 4px; }
.preview-content { flex: 1; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
.pc-kpis { display: flex; gap: 0.5rem; }
.pc-kpi { flex: 1; border-radius: 8px; padding: 0.6rem; display: flex; flex-direction: column; gap: 2px; }
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
  flex: 1; background: linear-gradient(180deg, #3d6080, #f5a623);
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
.features-section { background: #ddd9d1; padding: 6rem 0; }
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
  border-radius: 16px; border: 1.5px solid #c8c4bc;
  position: relative; overflow: hidden;
  transition: all 0.35s ease; cursor: default;
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
  padding: 6rem 0; position: relative; overflow: hidden;
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
  transform: translateY(-6px); border-color: #f5a623;
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
  background: #ddd9d1; padding: 4rem 2rem;
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
.footer-logo { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; }
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
.footer-col a   { color: rgba(255,255,255,0.55); text-decoration: none; font-size: 0.88rem; transition: color 0.2s; cursor: pointer; }
.footer-col a:hover { color: #f5a623; }
.footer-bottom {
  max-width: 1280px; margin: 0 auto;
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 1.5rem; text-align: center; font-size: 0.82rem;
}

/* ─── MODAL ──────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(15, 25, 35, 0.72);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 1.5rem;
}
.modal-box {
  background: #f0ece4;
  border-radius: 20px;
  width: 100%; max-width: 680px;
  max-height: 82vh;
  display: flex; flex-direction: column;
  box-shadow: 0 32px 80px rgba(0,0,0,0.35);
  overflow: hidden;
  animation: modalIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.4rem 1.8rem;
  background: linear-gradient(160deg, #4a7090, #2f4f6a);
  flex-shrink: 0;
}
.modal-title-row { display: flex; align-items: center; gap: 0.75rem; }
.modal-icon { font-size: 1.5rem; }
.modal-header h3 {
  font-family: 'Merriweather', serif;
  font-size: 1.2rem; font-weight: 700; color: white; margin: 0;
}
.modal-close {
  background: rgba(255,255,255,0.1); border: none;
  width: 34px; height: 34px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: white; cursor: pointer; transition: background 0.2s; flex-shrink: 0;
}
.modal-close:hover { background: rgba(255,255,255,0.2); }

.modal-body {
  flex: 1; overflow-y: auto; padding: 1.8rem;
  font-family: 'Source Sans 3', sans-serif;
  font-size: 0.93rem; line-height: 1.7; color: #2a3a48;
  scroll-behavior: smooth;
}

/* Scrollbar */
.modal-body::-webkit-scrollbar { width: 5px; }
.modal-body::-webkit-scrollbar-track { background: #ddd9d1; }
.modal-body::-webkit-scrollbar-thumb { background: #a0b4c4; border-radius: 3px; }

.modal-footer {
  padding: 1rem 1.8rem;
  border-top: 1px solid #c8c4bc;
  display: flex; justify-content: flex-end;
  flex-shrink: 0; background: #e8e4dc;
}
.modal-btn-close {
  padding: 0.6rem 1.8rem;
  background: linear-gradient(160deg, #4a7090, #2f4f6a);
  color: white; border: none; border-radius: 8px;
  font-family: 'Source Sans 3', sans-serif;
  font-size: 0.9rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 3px 10px rgba(61,96,128,0.3);
}
.modal-btn-close:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(61,96,128,0.4); }

/* ─── Modal body inner styles (applied via v-html) ─── */
.modal-body :deep(.mc-section) { margin-bottom: 1.6rem; }
.modal-body :deep(.mc-intro) {
  font-size: 0.97rem; color: #3a4a58; line-height: 1.75;
  background: rgba(61,96,128,0.07); border-left: 3px solid #3d6080;
  padding: 0.85rem 1rem; border-radius: 0 8px 8px 0; margin-bottom: 0;
}
.modal-body :deep(.mc-date) {
  font-size: 0.8rem; color: #8a9aaa; margin-top: 0.5rem; font-style: italic;
}
.modal-body :deep(h4) {
  font-family: 'Merriweather', serif;
  font-size: 1rem; font-weight: 700; color: #2f4f6a;
  margin-bottom: 0.9rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid rgba(61,96,128,0.15);
}
.modal-body :deep(p) { color: #4a5a6a; font-size: 0.93rem; line-height: 1.7; }

/* mc-cards */
.modal-body :deep(.mc-cards) { display: flex; flex-direction: column; gap: 0.8rem; }
.modal-body :deep(.mc-card) {
  display: flex; gap: 0.9rem; align-items: flex-start;
  background: #e8e4dc; border: 1px solid #c8c4bc;
  border-radius: 10px; padding: 0.9rem 1rem;
}
.modal-body :deep(.mc-card-icon) { font-size: 1.4rem; flex-shrink: 0; margin-top: 1px; }
.modal-body :deep(.mc-card) strong { display: block; color: #1e2a35; font-size: 0.93rem; margin-bottom: 0.3rem; }
.modal-body :deep(.mc-card) p { color: #6a7a8a; font-size: 0.88rem; line-height: 1.6; margin: 0; }

/* mc-list */
.modal-body :deep(.mc-list) { padding-left: 1.2rem; }
.modal-body :deep(.mc-list li) {
  color: #4a5a6a; font-size: 0.93rem; line-height: 1.7;
  margin-bottom: 0.5rem; padding-left: 0.3rem;
}

/* mc-steps */
.modal-body :deep(.mc-steps) { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.modal-body :deep(.mc-steps li) {
  display: flex; align-items: flex-start; gap: 0.9rem;
  background: #e8e4dc; border: 1px solid #c8c4bc;
  border-radius: 10px; padding: 0.85rem 1rem;
}
.modal-body :deep(.step-num) {
  width: 26px; height: 26px; border-radius: 50%;
  background: linear-gradient(160deg, #4a7090, #2f4f6a);
  color: white; font-size: 0.78rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}
.modal-body :deep(.mc-steps li) strong { color: #1e2a35; font-size: 0.92rem; display: block; margin-bottom: 0.15rem; }
.modal-body :deep(.mc-steps li) p { color: #6a7a8a; font-size: 0.88rem; margin: 0; }
.modal-body :deep(.mc-steps li div) { flex: 1; }

/* contact-cards */
.modal-body :deep(.contact-cards) {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
}
.modal-body :deep(.contact-card) {
  background: #e8e4dc; border: 1px solid #c8c4bc;
  border-radius: 12px; padding: 1.1rem;
  text-align: center;
}
.modal-body :deep(.contact-card-icon) { font-size: 1.8rem; margin-bottom: 0.6rem; }
.modal-body :deep(.contact-card h4) {
  font-family: 'Merriweather', serif; font-size: 0.95rem; color: #2f4f6a;
  margin-bottom: 0.5rem; border-bottom: none; padding-bottom: 0;
}
.modal-body :deep(.contact-card p) { font-size: 0.85rem; color: #6a7a8a; line-height: 1.6; margin: 0; }

/* faq */
.modal-body :deep(.faq-list) { display: flex; flex-direction: column; gap: 0.6rem; }
.modal-body :deep(.faq-item) {
  background: #e8e4dc; border: 1px solid #c8c4bc;
  border-radius: 10px; overflow: hidden;
}
.modal-body :deep(.faq-item summary) {
  padding: 0.9rem 1.1rem;
  font-weight: 600; color: #2f4f6a; font-size: 0.93rem;
  cursor: pointer; user-select: none;
  list-style: none;
  display: flex; justify-content: space-between; align-items: center;
}
.modal-body :deep(.faq-item summary::-webkit-details-marker) { display: none; }
.modal-body :deep(.faq-item summary::after) {
  content: '＋'; color: #f5a623; font-size: 1.1rem; flex-shrink: 0;
}
.modal-body :deep(.faq-item[open] summary::after) { content: '－'; }
.modal-body :deep(.faq-item[open] summary) {
  border-bottom: 1px solid #c8c4bc;
  background: rgba(61,96,128,0.06);
}
.modal-body :deep(.faq-item p) {
  padding: 0.9rem 1.1rem; margin: 0;
  color: #4a5a6a; font-size: 0.9rem; line-height: 1.7;
}

/* tech-grid */
.modal-body :deep(.tech-grid) {
  display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;
}
.modal-body :deep(.tech-tag) {
  background: rgba(61,96,128,0.1); color: #3d6080;
  border: 1px solid rgba(61,96,128,0.2);
  padding: 0.3rem 0.85rem; border-radius: 20px;
  font-size: 0.85rem; font-weight: 600;
}

/* team */
.modal-body :deep(.team-row) {
  display: flex; justify-content: center; gap: 2rem; margin-top: 0.8rem;
}
.modal-body :deep(.team-member) {
  display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
}
.modal-body :deep(.team-avatar) {
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(160deg, #4a7090, #f5a623);
  color: white; font-weight: 800; font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
}
.modal-body :deep(.team-member strong) { color: #1e2a35; font-size: 0.95rem; }
.modal-body :deep(.team-member span)   { color: #8a9aaa; font-size: 0.82rem; }

/* contact hint */
.modal-body :deep(.mc-contact-hint) {
  display: flex; align-items: flex-start; gap: 0.7rem;
  background: rgba(245,166,35,0.08); border: 1px solid rgba(245,166,35,0.25);
  border-radius: 10px; padding: 0.9rem 1rem;
  font-size: 0.88rem; color: #5a4a2a; line-height: 1.6;
  margin-top: 1rem;
}
.modal-body :deep(.mc-contact-hint span:first-child) { font-size: 1.2rem; flex-shrink: 0; margin-top: 1px; }

/* ─── MODAL TRANSITION ───────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

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
  .modal-box { max-height: 90vh; }
  .modal-body :deep(.contact-cards) { grid-template-columns: 1fr; }
}
</style>