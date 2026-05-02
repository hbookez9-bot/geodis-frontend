import axios from 'axios';

// En dev, Vite proxie /api vers Flask (voir vite.config.js)
// En prod, on utilise VITE_API_URL
const API_URL = import.meta.env.PROD
    ? (import.meta.env.VITE_API_URL || 'http://localhost:5000')
    : '';

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000
});

// Intercepteur : ajoute le JWT à toutes les requêtes
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('geodis_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepteur : si 401, on déconnecte
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('geodis_token');
            localStorage.removeItem('geodis_user');
            // Redirection vers login si on n'y est pas déjà
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
