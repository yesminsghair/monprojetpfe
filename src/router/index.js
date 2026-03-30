import { createRouter, createWebHistory } from 'vue-router'

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
  { path: '/',            component: Accueil },
  { path: '/login',       component: Login },
  { path: '/inscription', component: Inscription },

  {
    path: '/reset-password/:token?',
    component: () => import('../components/Resetpassword.vue'),
  },
  {
    path: '/verify-email/:token',
    component: () => import('../components/VerifyEmail.vue'),
  },

  { path: '/dashboard/directeur',  component: DashboardDirecteur,  meta: { requiresAuth: true, role: 'directeur'  } },
  { path: '/dashboard/chef',       component: DashboardChef,       meta: { requiresAuth: true, role: 'chef'       } },
  { path: '/dashboard/encadrant',  component: DashboardEncadrant,  meta: { requiresAuth: true, role: 'encadrant'  } },
  { path: '/dashboard/enseignant', component: DashboardEnseignant, meta: { requiresAuth: true, role: 'enseignant' } },
  { path: '/dashboard/etudiant',   component: DashboardEtudiant,   meta: { requiresAuth: true, role: 'etudiant'   } },
  { path: '/dashboard/jury',       component: DashboardJury,       meta: { requiresAuth: true, role: 'jury'       } },

  { path: '/admin', component: Admin, beforeEnter: requireAdmin },

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