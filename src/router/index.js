import { createRouter, createWebHistory } from 'vue-router'

import Accueil            from '../components/Accueil.vue'
import Login              from '../components/Login.vue'
import ResetPassword      from '../components/Resetpassword.vue'
import Inscription        from '../components/Inscription.vue'
import DashboardDirecteur from '../components/Dashboarddirecteur.vue'
import Admin              from '../components/Admin.vue'

import { requireAdmin } from './guard'

const routes = [
  { path: '/',               component: Accueil },
  { path: '/login',          component: Login },
  { path: '/reset-password', component: ResetPassword },
  { path: '/inscription',    component: Inscription },
  { path: '/dashboard',      component: DashboardDirecteur },
  {
    path: '/admin',
    component: Admin,
    beforeEnter: requireAdmin  // Protection : seulement pour admin
  },
  // Redirection pour toute route inconnue
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})