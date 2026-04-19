import { createRouter, createWebHistory } from 'vue-router'

// Composants existants (Sprints 1 & 2)
import Accueil             from '../components/Accueil.vue'
import Login               from '../components/Login.vue'
import Inscription         from '../components/Inscription.vue'
import DashboardDirecteur  from '../components/Dashboarddirecteur.vue'
import DashboardChef       from '../components/DashboardChef.vue'
import DashboardEncadrant  from '../components/DashboardEncadrant.vue'
import DashboardEnseignant from '../components/DashboardEnseignant.vue'
import DashboardEtudiant   from '../components/DashboardEtudiant.vue'
import DashboardJury       from '../components/Dashboardjury.vue'
import Admin               from '../components/Admin.vue'

// Composants Sprint 3
import GestionPhases       from '../components/Gestionphases.vue'
import GestionGrille       from '../components/Gestiongrille.vue'
import GestionJury         from '../components/Gestionjury.vue'
import GestionSoutenance   from '../components/Gestionsoutenance.vue'
import LivrablesEtudiant   from '../components/Livrablesetudiant.vue'
import ReunionEncadrant    from '../components/Reunionencadrant.vue'
import ReunionEtudiant     from '../components/Reunionetudiant.vue'
import SuiviEncadrant      from '../components/Suiviencadrant.vue'

// Composants Sprint 4 - GestionArchivageCommunication
import Archives            from '../components/GestionArchivageCommunication/Archives.vue'
import BiblioPFE           from '../components/GestionArchivageCommunication/Bibliopfe.vue'
import ConsulterResultat   from '../components/GestionArchivageCommunication/Consulterresultatfinal.vue'
import Messagerie          from '../components/GestionArchivageCommunication/Messagerie.vue'
import Notifications       from '../components/GestionArchivageCommunication/Notifications.vue'

import { requireAdmin } from './guard'

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
}

const roleRoutes = {
  admin:      '/admin',
  directeur:  '/dashboard/directeur',
  chef:       '/dashboard/chef',
  encadrant:  '/dashboard/encadrant',
  enseignant: '/dashboard/enseignant',
  etudiant:   '/dashboard/etudiant',
  jury:       '/dashboard/jury',
}

const routes = [
  // Routes publiques
  { path: '/',            component: Accueil },
  { path: '/login',       component: Login },
  { path: '/inscription', component: Inscription },
  { path: '/reset-password/:token?', component: () => import('../components/Resetpassword.vue') },
  { path: '/verify-email/:token',    component: () => import('../components/VerifyEmail.vue') },

  // Dashboards (Sprints 1 & 2)
  { path: '/dashboard/directeur',  component: DashboardDirecteur,  meta: { requiresAuth: true, role: 'directeur'  } },
  { path: '/dashboard/chef',       component: DashboardChef,       meta: { requiresAuth: true, role: 'chef'       } },
  { path: '/dashboard/encadrant',  component: DashboardEncadrant,  meta: { requiresAuth: true, role: 'encadrant'  } },
  { path: '/dashboard/enseignant', component: DashboardEnseignant, meta: { requiresAuth: true, role: 'enseignant' } },
  { path: '/dashboard/etudiant',   component: DashboardEtudiant,   meta: { requiresAuth: true, role: 'etudiant'   } },
  { path: '/dashboard/jury',       component: DashboardJury,       meta: { requiresAuth: true, role: 'jury'       } },

  // Routes Sprint 3 - Chef
  { path: '/phases',      component: GestionPhases,     meta: { requiresAuth: true, role: 'chef' } },
  { path: '/grille',      component: GestionGrille,     meta: { requiresAuth: true, role: 'chef' } },
  { path: '/jurys',       component: GestionJury,       meta: { requiresAuth: true, role: 'chef' } },
  { path: '/soutenances', component: GestionSoutenance, meta: { requiresAuth: true, role: 'chef' } },

  // Routes Sprint 3 - Encadrant
  { path: '/suivi',              component: SuiviEncadrant,   meta: { requiresAuth: true, role: 'encadrant' } },
  { path: '/reunions-encadrant', component: ReunionEncadrant, meta: { requiresAuth: true, role: 'encadrant' } },

  // Routes Sprint 3 - Étudiant
  { path: '/livrables',         component: LivrablesEtudiant, meta: { requiresAuth: true, role: 'etudiant' } },
  { path: '/reunions-etudiant', component: ReunionEtudiant,   meta: { requiresAuth: true, role: 'etudiant' } },

  // Routes Sprint 4 - Archives & Communication (chef + directeur)
  { path: '/archives',      component: Archives,          meta: { requiresAuth: true } },
  { path: '/biblio-pfe',    component: BiblioPFE,         meta: { requiresAuth: true } },
  { path: '/resultats',     component: ConsulterResultat, meta: { requiresAuth: true } },
  { path: '/messagerie',    component: Messagerie,        meta: { requiresAuth: true } },
  { path: '/notifications', component: Notifications,     meta: { requiresAuth: true } },

  // Admin
  { path: '/admin', component: Admin, beforeEnter: requireAdmin },

  // Redirection 404
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const user = getUser()

  if (to.meta.requiresAuth && !user) {
    return next('/login')
  }

  if (to.meta.requiresAuth && to.meta.role && user?.role !== to.meta.role) {
    return next(roleRoutes[user.role] ?? '/login')
  }

  next()
})

export default router