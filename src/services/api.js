// src/services/api.js
import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000/api'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

// ✅ Intercepteur : injecte le token Bearer à chaque requête
api.interceptors.request.use(
    (config) => {
        // Compatible avec les deux formats de stockage du token
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const token = user.token || localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// ✅ Intercepteur : redirige vers /login si 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
        
    }

)



export default api 