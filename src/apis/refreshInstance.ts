import axios from "axios";

const refreshInstance = axios.create({
  baseURL: "https://inu-dormitory-dev.inuappcenter.kr/",
});

// 요청 인터셉터 - 토큰 설정
refreshInstance.interceptors.request.use(
  (config) => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      config.headers["Authorization"] = `Bearer ${refreshToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터
refreshInstance.interceptors.response.use((response) => {
  // 모든 응답의 response.data.msg 콘솔 출력
  if (response.data && response.data.msg) {
    console.log("리프레시응답");
    console.log(response.data.msg);
  }
  return response;
});

export default refreshInstance;
