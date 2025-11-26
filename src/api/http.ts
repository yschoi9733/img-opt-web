// src/api/http.ts
import axios from 'axios';

export const wasInstance = axios.create({
  baseURL: '/api', // 개발(dev) 프록시 및 프로덕션 리버스 프록시 공통 경로
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
