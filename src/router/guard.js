/**
 * Navigation guard – protects routes that require admin access.
 * Usage in router:  beforeEnter: requireAdmin
 */
export function requireAdmin(to, from, next) {
  const raw = localStorage.getItem('user')
  if (!raw) {
    
    return next('/login')

  }

  try {
    const user = JSON.parse(raw)
    if (user && user.isAdmin === true) {
      
      return next()
    } else {
    
      return next('/')
    }

  } catch {

    localStorage.removeItem('user')
    return next('/login')
  }
}