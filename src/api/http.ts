// src/api/http.ts
import axios from 'axios';

export const wasInstance = axios.create({
  // baseURL: '/api', // Nginx Proxy 경로
  baseURL: 'http://localhost:3000/api', // 개발용 백엔드 서버 경로
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 (에러 처리 공통화)
wasInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  },
);
