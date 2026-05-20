import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reads from .env EXPO_PUBLIC_API_URL (change this when switching Wi-Fi networks)
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token to every outgoing request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 — try to refresh token automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await AsyncStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = response.data.access;
          await AsyncStorage.setItem('accessToken', newAccess);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token expired — wipe storage (navigation handled by AuthContext)
          await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
