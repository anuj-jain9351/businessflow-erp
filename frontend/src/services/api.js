import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request Interceptor: Automatic Token aur Company ID attach karne ke liye
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const companyId = localStorage.getItem('companyId');

  if (token && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (companyId && companyId !== 'undefined' && companyId !== 'null') {
    config.headers['x-company-id'] = companyId;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;