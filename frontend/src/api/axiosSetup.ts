import axios from 'axios';

// 1. Updated baseURL to your computer's IP
const api = axios.create({
    baseURL: 'http://localhost:8000/api/', 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach access token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 responses to refresh the token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');
            
            if (refreshToken) {
                try {
                    // 2. Updated the token refresh URL to your computer's IP
                    const response = await axios.post('http://localhost:8000/api/token/refresh/', {
                        refresh: refreshToken
                    });
                    localStorage.setItem('access_token', response.data.access);
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh token is invalid/expired. Force logout.
                    localStorage.clear();
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;