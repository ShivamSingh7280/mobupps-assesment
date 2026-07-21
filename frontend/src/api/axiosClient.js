import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const axiosClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

// Separate, interceptor-free instance so the refresh call itself can never
// recursively trigger the 401 handler below.
const refreshClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

function normalizeError(error) {
  if (error.response?.data) {
    return {
      message: error.response.data.message || 'Something went wrong. Please try again.',
      errors: error.response.data.errors || [],
      status: error.response.status,
    };
  }
  if (error.request) {
    return { message: 'Network error. Please check your connection.', errors: [], status: null };
  }
  return { message: error.message || 'Unexpected error', errors: [], status: null };
}

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

export async function silentRefresh() {
  const { data } = await refreshClient.post('/auth/refresh');
  const token = data?.data?.accessToken;
  setAccessToken(token);
  return token;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthEndpoint = /\/auth\/(login|register|refresh)$/.test(originalRequest?.url || '');

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = silentRefresh().finally(() => {
            refreshPromise = null;
          });
        }
        const newAccessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(normalizeError(refreshError));
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

export default axiosClient;
