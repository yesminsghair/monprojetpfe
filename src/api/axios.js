import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
})

// Ajoute automatiquement le token à chaque requête
api.interceptors.request.use(config => {
  const user = localStorage.getItem('user')
  if (user) {
    const token = JSON.parse(user).token
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Gère les erreurs 401 (token expiré)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api