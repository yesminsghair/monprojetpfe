/**
 * Navigation guard – protects routes that require admin access.
 * Usage in router:  beforeEnter: requireAdmin
 */
export function requireAdmin(to, from, next) {
  const raw = localStorage.getItem('user')
  if (!raw) {
    // Not logged in at all → send to login
    return next('/login')
  }

  try {
    const user = JSON.parse(raw)
    if (user && user.isAdmin === true) {
      // Authorised admin
      return next()
    } else {
      // Logged in but not admin → redirect to home
      return next('/')
    }
  } catch {
    // Corrupted storage → clean up and redirect
    localStorage.removeItem('user')
    return next('/login')
  }
}