import axios from "axios";

const refreshInstance = axios.create({
  baseURL: "https://unidorm-server.inuappcenter.kr/",
});

// 요청 인터셉터 - 리프레시 토큰을 POST 바디에 자동 삽입
refreshInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    console.log("엑세스토큰", accessToken);
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터
refreshInstance.interceptors.response.use((response) => {
  if (response.data && response.data.msg) {
    console.log("리프레시응답");
    console.log(response.data.msg);
  }
  return response;
});

export default refreshInstance;
