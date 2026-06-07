import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from '../../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: anexa token automaticamente ─────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const selectedCourseId = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_COURSE_ID);
    if (selectedCourseId) {
      config.headers['x-course-id'] = selectedCourseId;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor: tratamento global de erros ────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
      // TODO: redirecionar para Login via NavigationService
    }
    return Promise.reject(error);
  },
);

export default api;
