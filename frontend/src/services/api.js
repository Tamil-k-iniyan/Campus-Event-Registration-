import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If 401 occurs and user was logged in, log out
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?sessionExpired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Event Endpoints
export const eventAPI = {
  getEvents: (params) => api.get('/events', { params }),
  getEventById: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`)
};

// Registration Endpoints
export const registrationAPI = {
  registerForEvent: (eventId, notes = '') => api.post(`/registrations/${eventId}`, { notes }),
  cancelRegistration: (id) => api.delete(`/registrations/${id}`),
  getMyRegistrations: () => api.get('/registrations/my')
};

// Admin Endpoints
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getEventRegistrations: (eventId, params) => api.get(`/admin/events/${eventId}/registrations`, { params }),
  exportRegistrationsCsv: (eventId) =>
    api.get(`/admin/registrations/export/${eventId}`, { responseType: 'blob' })
};

export default api;
