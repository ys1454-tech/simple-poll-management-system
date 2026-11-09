import axios from 'axios';

// Uses VITE_API_BASE_URL if provided (e.g. Codespaces forwarded port), otherwise defaults to '/api' (proxied by Vite)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
