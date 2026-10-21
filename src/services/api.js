import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to include token in headers if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginUser = (credentials) => api.post('/login', credentials).then(res => res.data);
export const loginGuest = () => api.post('/login-guest').then(res => res.data);
export const getProfileMe = () => api.get('/auth/me').then(res => res.data);

export const getDashboardData = () => api.get('/dashboard').then(res => res.data);

export const getBalita = () => api.get('/balita').then(res => res.data);
export const getBalitaById = (id) => api.get(`/balita/${id}`).then(res => res.data);
export const createBalita = (data) => api.post('/balita', data).then(res => res.data);
export const createBalitaBulk = (data) => api.post('/balita/bulk', data).then(res => res.data);
export const updateBalita = (id, data) => api.put(`/balita/${id}`, data).then(res => res.data);
export const deleteBalita = (id) => api.delete(`/balita/${id}`).then(res => res.data);

export const getPengukuran = (params = {}) => api.get('/pengukuran', { params }).then(res => res.data);
export const getPengukuranById = (id) => api.get(`/pengukuran/${id}`).then(res => res.data);
export const getPengukuranByBalitaId = async (balitaId) => {
  try {
    const res = await api.get(`/balita/${balitaId}/pengukuran`);
    return res.data;
  } catch (err) {
    // Graceful fallback if backend server hasn't been reloaded yet
    const all = await api.get('/pengukuran');
    return (all.data || []).filter(p => Number(p.balita_id) === Number(balitaId));
  }
};
export const createPengukuran = (data) => api.post('/pengukuran', data).then(res => res.data);
export const updatePengukuran = (id, data) => api.put(`/pengukuran/${id}`, data).then(res => res.data);
export const deletePengukuran = (id) => api.delete(`/pengukuran/${id}`).then(res => res.data);

export const getPengukuranBulanIni = (params = {}) => api.get('/pengukuran/bulan-ini', { params }).then(res => res.data);
export const getWaktuPengukuranTerkini = () => api.get('/pengukuran/waktu-terkini').then(res => res.data);

export default {
  loginUser,
  loginGuest,
  getProfileMe,
  getDashboardData,
  getBalita,
  getBalitaById,
  createBalita,
  createBalitaBulk,
  updateBalita,
  deleteBalita,
  getPengukuran,
  getPengukuranById,
  getPengukuranByBalitaId,
  getPengukuranBulanIni,
  getWaktuPengukuranTerkini,
  createPengukuran,
  updatePengukuran,
  deletePengukuran,
};
