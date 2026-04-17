import axios, { AxiosError } from "axios";
import { refresh } from "@/apis/members";
import { TokenInfo } from "@/types/members";
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

type RetryableRequestConfig = NonNullable<AxiosError["config"]> & {
  _retry?: boolean;
  _sentAccessToken?: string;
};

let refreshPromise: Promise<TokenInfo> | null = null;
let isLogoutRedirectPending = false;

const getStoredAccessToken = () => localStorage.getItem("accessToken") ?? "";

const setAuthorizationHeader = (
  config: RetryableRequestConfig,
  accessToken: string,
) => {
  if (!config.headers) {
    config.headers = {} as RetryableRequestConfig["headers"];
  }

  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
    return;
  }

  delete config.headers["Authorization"];
};

const mergeTokenInfo = (nextTokenInfo: TokenInfo): TokenInfo => {
  const currentTokenInfo = useUserStore.getState().tokenInfo;

  return {
    ...currentTokenInfo,
    ...nextTokenInfo,
    accessToken: nextTokenInfo.accessToken,
    refreshToken: nextTokenInfo.refreshToken || currentTokenInfo.refreshToken,
    role: nextTokenInfo.role || currentTokenInfo.role,
  };
};

const redirectToLogoutOnce = () => {
  if (isLogoutRedirectPending) {
    return;
  }

  isLogoutRedirectPending = true;
  delete tokenInstance.defaults.headers.common["Authorization"];
  window.location.href = "/logout";
};

const refreshAccessToken = async (): Promise<TokenInfo> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const tokenInfo = await refresh();
      const mergedTokenInfo = mergeTokenInfo(tokenInfo);

      useUserStore.getState().setTokenInfo(mergedTokenInfo);
      tokenInstance.defaults.headers.common["Authorization"] =
        `Bearer ${mergedTokenInfo.accessToken}`;

      appendDebugLog({
        category: "token-refresh",
        action: "리프레시 완료",
        details: {
          hasAccessToken: Boolean(mergedTokenInfo.accessToken),
          hasRefreshToken: Boolean(mergedTokenInfo.refreshToken),
          hasRole: Boolean(mergedTokenInfo.role),
        },
      });

      return mergedTokenInfo;
    })().finally(() => {
      refreshPromise = null;
    });
  } else {
    appendDebugLog({
      category: "token-refresh",
      action: "진행 중인 리프레시 재사용",
    });
  }

  return refreshPromise;
};

tokenInstance.interceptors.request.use(
  (config) => {
    const retryableConfig = config as RetryableRequestConfig;
    const accessToken = getStoredAccessToken();

    setAuthorizationHeader(retryableConfig, accessToken);
    retryableConfig._sentAccessToken = accessToken;

    return retryableConfig;
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
    const originalRequest = error.config as RetryableRequestConfig | null;
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

    const status = error.response.status;
    const isAuthError = status === 401 || status === 403;

    if (isAuthError && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      appendDebugLog({
        category: "token-refresh",
        action: "인증 오류 응답으로 리프레시 시작",
        details: {
          ...requestDetails,
          status,
        },
      });

      try {
        const latestAccessToken = getStoredAccessToken();
        const sentAccessToken = originalRequest._sentAccessToken ?? "";

        if (latestAccessToken && latestAccessToken !== sentAccessToken) {
          appendDebugLog({
            category: "token-refresh",
            action: "이미 갱신된 최신 토큰으로 재시도",
            details: requestDetails,
          });

          setAuthorizationHeader(originalRequest, latestAccessToken);
          return tokenInstance(originalRequest);
        }

        const tokenInfo = await refreshAccessToken();

        appendDebugLog({
          category: "token-refresh",
          action: "새 토큰 저장 완료",
          details: {
            ...requestDetails,
            hasAccessToken: Boolean(tokenInfo.accessToken),
            hasRefreshToken: Boolean(tokenInfo.refreshToken),
            hasRole: Boolean(tokenInfo.role),
          },
        });

        setAuthorizationHeader(originalRequest, tokenInfo.accessToken);

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

        redirectToLogoutOnce();
        axiosRefreshError.isRefreshError = true;
        return Promise.reject(axiosRefreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default tokenInstance;
