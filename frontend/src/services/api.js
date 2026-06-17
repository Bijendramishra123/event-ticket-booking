import axios from 'axios';

// Use relative path for Vercel proxy
const API_BASE_URL = '/api';

console.log('🔗 API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000
});

// Rest of the code remains same...