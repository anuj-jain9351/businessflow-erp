import axios from 'axios';

const API = axios.create({
  baseURL: 'https://businessflow-erp.onrender.com/api', // <-- Yeh Render wala live backend URL hona chahiye
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  const companyId = localStorage.getItem('companyId');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  if (companyId) req.headers['x-company-id'] = companyId;
  return req;
});

export default API;