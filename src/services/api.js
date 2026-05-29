// src/services/api.js
import axios from 'axios' //biblio basé sur les promesses utilisé dans vue pour effectuer req http (get,post..)pour changer donn avec serveur ou api 

const API_URL = 'http://127.0.0.1:8000/api' //defini l'url de base d'api laravel

const api = axios.create({//axios personnalisé pourdire que toutes req utilisent cette url baseUrl
    baseURL: API_URL,//chq req use comme pnt départ
    headers: {
        'Content-Type': 'application/json', //le corps des req envoyés est json 
        'Accept': 'application/json',//le serveur attend une reponse json
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