import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://inu-dormitory-dev.inuappcenter.kr/",
});

// 응답 인터셉터
axiosInstance.interceptors.response.use((response) => {
  // 모든 응답의 response.data.msg 콘솔 출력
  if (response.data && response.data.msg) {
    console.log(response.data.msg);
  }
  return response;
});

// 요청 인터셉터: Authorization 헤더 자동 추가
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;


