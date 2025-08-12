// src/apis/tokenInstance.ts
import axios from "axios";

const tokenInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 예: https://inu-dormitory-dev.inuappcenter.kr
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // JWT면 보통 false (쿠키 세션이면 true)
});

// 요청마다 accessToken 자동 부착
tokenInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // 로그인 시 저장해둔 토큰
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default tokenInstance;
