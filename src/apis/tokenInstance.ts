import axios, { AxiosError } from "axios";
import useUserStore from "../stores/useUserStore";
import useNetworkStore from "../stores/useNetworkStore";
import { refresh } from "@/apis/members";

const BASE_URL = `https://${import.meta.env.VITE_API_SUBDOMAIN}.inuappcenter.kr/`;

const tokenInstance = axios.create({
  baseURL: BASE_URL,
});

// 요청 인터셉터
tokenInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터
tokenInstance.interceptors.response.use(
  (response) => {
    if (response.data?.msg) console.log(response.data.msg);
    // 정상 응답 시 네트워크 오류 플래그 해제
    useNetworkStore.getState().setNetworkError(false);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const { setNetworkError } = useNetworkStore.getState();

    // 🌐 네트워크 불량 또는 서버 다운 시
    if (error.response && error.response.status === 502) {
      setNetworkError(true);
      // alert("네트워크 연결이 불안정하거나, 서버 점검 중입니다.");
      return Promise.reject(error);
    }

    // ❌ 네트워크 자체 장애 (response 없음)
    if (!error.response) {
      setNetworkError(true);
      // alert("인터넷 연결을 확인해주세요.");
      return Promise.reject(error);
    }

    // 🔁 403 에러 → 토큰 재발급 시도
    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log("리프레시 발급 시도");
        const { data } = await refresh();
        const newTokenInfo = data.accessToken;

        const { tokenInfo, setTokenInfo } = useUserStore.getState();
        setTokenInfo({ ...tokenInfo, accessToken: newTokenInfo });

        tokenInstance.defaults.headers.common["Authorization"] =
          `Bearer ${newTokenInfo}`;
        originalRequest.headers["Authorization"] = `Bearer ${newTokenInfo}`;

        // 재요청 시도
        return tokenInstance(originalRequest);
      } catch (refreshError) {
        window.location.href = "/logout";
        (
          refreshError as AxiosError & { isRefreshError?: boolean }
        ).isRefreshError = true;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default tokenInstance;
