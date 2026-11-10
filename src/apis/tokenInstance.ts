import axios, { AxiosError } from "axios";
import { refresh } from "@/apis/members";
import { appBridge } from "@/utils/appBridgeAdapter";
import { TokenInfo } from "@/types/members";
import { appendDebugLog } from "@/utils/debugLog";
import useNetworkStore from "../stores/useNetworkStore";
import useUserStore from "../stores/useUserStore";
import { trackServerWrites } from "@/utils/serverDataSync";

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

  // 리로드 직전 인증 토큰 및 유저 캐시를 동기 소거하여
  // 새 페이지의 AppInitializer(useAppInit)가 유효하지 않은 토큰으로
  // getMemberInfo() 등의 2차 API 요청을 연쇄 발송하는 것을 원천 차단
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userInfo");
  } catch {
    // 스토리지 접근 제한 예외 방어
  }

  if (window.location.pathname !== "/logout") {
    window.location.href = "/logout";
  }
};

// 서버는 재발급할 때마다 refreshToken을 교체(rotation)한다. 알림으로 앱이 콜드 스타트되면
// 루트 웹뷰와 서브 웹뷰가 같은 refreshToken으로 동시에 재발급을 요청하고, 늦은 쪽은 이미
// 폐기된 토큰을 보낸 셈이라 실패한다. 이때 먼저 성공한 웹뷰가 localStorage에 새 토큰을 쓸 때까지
// 잠시 기다렸다가 그 토큰을 채택한다.
const ROTATED_TOKEN_WAIT_MS = 3000;
const ROTATED_TOKEN_POLL_MS = 100;

const waitForRotatedTokenInfo = async (
  usedRefreshToken: string,
): Promise<TokenInfo | null> => {
  const deadline = Date.now() + ROTATED_TOKEN_WAIT_MS;

  for (;;) {
    const refreshToken = localStorage.getItem("refreshToken") ?? "";
    const accessToken = getStoredAccessToken();

    if (refreshToken && accessToken && refreshToken !== usedRefreshToken) {
      return {
        accessToken,
        refreshToken,
        role: localStorage.getItem("role") ?? "",
      };
    }

    if (Date.now() >= deadline) {
      return null;
    }

    await new Promise((resolve) => setTimeout(resolve, ROTATED_TOKEN_POLL_MS));
  }
};

// 앱 웹뷰에서는 재발급을 네이티브에 맡긴다. 네이티브는 웹뷰가 몇 개든 같은
// refreshToken으로 서버를 한 번만 호출하므로, 알림 진입처럼 웹뷰 여러 개가
// 동시에 401을 받아도 재발급 경쟁이 생기지 않는다. 브라우저·구버전 앱이거나
// 네이티브가 응답하지 못하면 직접 재발급한다.
const requestNewTokenInfo = async (): Promise<{
  tokenInfo: TokenInfo;
  fromNative: boolean;
}> => {
  const refreshToken = localStorage.getItem("refreshToken") ?? "";

  if (refreshToken && appBridge.supportsNativeTokenRefresh()) {
    const result = await appBridge.requestTokenRefresh(refreshToken);

    if (result?.status === "ok" && result.accessToken) {
      return {
        tokenInfo: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken || refreshToken,
          role: result.role ?? "",
        },
        fromNative: true,
      };
    }

    if (result?.status === "rejected") {
      throw new Error("네이티브 토큰 재발급이 거절되었습니다.");
    }

    appendDebugLog({
      category: "token-refresh",
      action: "네이티브 재발급 실패로 직접 재발급",
      details: { status: result?.status ?? "timeout" },
    });
  }

  return { tokenInfo: await refresh(), fromNative: false };
};

const refreshAccessToken = async (): Promise<TokenInfo> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const usedRefreshToken = localStorage.getItem("refreshToken") ?? "";

      let tokenInfo: TokenInfo;
      let fromNative: boolean;
      try {
        ({ tokenInfo, fromNative } = await requestNewTokenInfo());
      } catch (refreshError) {
        const rotatedTokenInfo = usedRefreshToken
          ? await waitForRotatedTokenInfo(usedRefreshToken)
          : null;

        if (!rotatedTokenInfo) {
          throw refreshError;
        }

        const mergedTokenInfo = mergeTokenInfo(rotatedTokenInfo);

        // 다른 웹뷰가 이미 네이티브와 동기화한 토큰이므로 다시 보내지 않는다.
        useUserStore
          .getState()
          .setTokenInfo(mergedTokenInfo, { fromNative: true });
        tokenInstance.defaults.headers.common["Authorization"] =
          `Bearer ${mergedTokenInfo.accessToken}`;

        appendDebugLog({
          category: "token-refresh",
          action: "다른 웹뷰가 갱신한 토큰 채택",
        });

        return mergedTokenInfo;
      }

      const mergedTokenInfo = mergeTokenInfo(tokenInfo);

      // 네이티브가 재발급했다면 이미 저장·전파까지 마쳤으므로 되돌려 보내지 않는다.
      useUserStore.getState().setTokenInfo(mergedTokenInfo, { fromNative });
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
    // 백엔드 Spring Security는 토큰 만료 시 별도 AuthenticationEntryPoint가 없을 경우
    // 익명 사용자 요청에 대해 기본 403 Forbidden을 반환하므로, 401 및 403 모두 토큰 재발급 대상에 포함합니다.
    const isAuthError = status === 401 || status === 403;

    // 비로그인 상태(보낸 액세스 토큰도 없고 저장된 리프레시 토큰도 없음)라면
    // 애초에 인증되지 않은 익명 요청이므로 재발급이나 강제 로그아웃을 시도하지 않고 즉시 에러 반환
    const sentAccessToken = originalRequest?._sentAccessToken ?? "";
    const hasRefreshToken = Boolean(localStorage.getItem("refreshToken"));
    const isAnonymousRequest = !sentAccessToken && !hasRefreshToken;

    if (isAnonymousRequest) {
      appendDebugLog({
        category: "token-refresh",
        action: "비로그인 익명 요청 인증 실패로 리프레시 건너뜀",
        details: {
          ...requestDetails,
          status,
        },
      });
      return Promise.reject(error);
    }

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

// 쓰기 성공 시 이 웹뷰·다른 웹뷰의 화면 데이터를 자동으로 다시 조회
trackServerWrites(tokenInstance);

export default tokenInstance;
