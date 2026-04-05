import axios, { AxiosError } from "axios";
import { refresh } from "@/apis/members";
import { appendDebugLog } from "@/utils/debugLog";
import useNetworkStore from "../stores/useNetworkStore";
import useUserStore from "../stores/useUserStore";

const BASE_URL = `https://${import.meta.env.VITE_API_SUBDOMAIN}.inuappcenter.kr/`;

const tokenInstance = axios.create({
  baseURL: BASE_URL,
});

const getRequestDetails = (config?: {
  method?: string;
  url?: string;
}) => ({
  method: config?.method?.toUpperCase() ?? "UNKNOWN",
  url: config?.url ?? "",
});

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

tokenInstance.interceptors.response.use(
  (response) => {
    if (response.data?.msg) console.log(response.data.msg);
    useNetworkStore.getState().setNetworkError(false);

    if ((response.config as { _retry?: boolean })._retry) {
      appendDebugLog({
        category: "token-refresh",
        action: "리프레시 후 재요청 성공",
        details: getRequestDetails(response.config),
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config as (typeof error.config & {
      _retry?: boolean;
    }) | null;
    const { setNetworkError } = useNetworkStore.getState();
    const requestDetails = getRequestDetails(originalRequest ?? undefined);

    if (error.response && error.response.status === 502) {
      setNetworkError(true);
      appendDebugLog({
        category: "network",
        action: "502 응답 수신",
        details: {
          ...requestDetails,
          status: error.response.status,
        },
      });
      return Promise.reject(error);
    }

    if (!error.response) {
      setNetworkError(true);
      appendDebugLog({
        category: "network",
        action: "응답 없는 네트워크 오류",
        details: {
          ...requestDetails,
          message: error.message,
        },
      });
      return Promise.reject(error);
    }

    if (error.response.status === 403 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      appendDebugLog({
        category: "token-refresh",
        action: "403 응답으로 리프레시 시작",
        details: {
          ...requestDetails,
          status: error.response.status,
        },
      });

      try {
        console.log("리프레시 발급 시도");
        const { data } = await refresh();
        const newAccessToken = data.accessToken;

        const { setTokenInfo } = useUserStore.getState();
        setTokenInfo(data);

        appendDebugLog({
          category: "token-refresh",
          action: "새 액세스 토큰 저장 완료",
          details: {
            ...requestDetails,
            hasAccessToken: Boolean(data.accessToken),
            hasRefreshToken: Boolean(data.refreshToken),
          },
        });

        tokenInstance.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        appendDebugLog({
          category: "token-refresh",
          action: "원래 요청 재시도",
          details: requestDetails,
        });

        return tokenInstance(originalRequest);
      } catch (refreshError) {
        const axiosRefreshError = refreshError as AxiosError & {
          isRefreshError?: boolean;
        };

        appendDebugLog({
          category: "token-refresh",
          action: "리프레시 실패로 로그아웃 이동",
          details: {
            ...requestDetails,
            status: axiosRefreshError.response?.status ?? null,
            message: axiosRefreshError.message,
          },
        });

        window.location.href = "/logout";
        axiosRefreshError.isRefreshError = true;
        return Promise.reject(axiosRefreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default tokenInstance;
