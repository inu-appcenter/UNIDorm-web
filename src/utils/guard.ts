import i18n from "@/i18n";
import { PATHS } from "@/constants/paths";
import { isPortalAgentAvailable } from "@/apis/mobileAgentBridge";
import {
  getMobilePlatform,
  getStoreUrl,
  isLatestUnidormApp,
  isLegacyUnidormApp,
} from "@/utils/getMobilePlatform";

export const guardLogin = (
  isLoggedIn: boolean,
  navigate: (path: string) => void,
): boolean => {
  if (!isLoggedIn) {
    if (window.confirm(i18n.t("common:guard.loginRequiredConfirm")))
      navigate(PATHS.LOGIN);
    return false;
  }
  return true;
};

export interface GuardAppOnlyOptions {
  /** 취소 시 이전 페이지로 이동할지 여부 */
  onCancelNavigateBack?: boolean;
  navigate?: (path: any) => void;
  /** 사용자 정의 알림 메시지 */
  customMessage?: string;
}

/**
 * 최신 유니돔 앱 전용 기능 가드.
 * - 최신 앱(ReactNativeWebView 지원)인 경우 통과
 * - 구버전 앱(레거시 브릿지)인 경우 confirm을 통해 스토어 업데이트 유도
 * - 모바일 브라우저 또는 PC 환경인 경우 confirm을 통해 스토어 설치 화면으로 이동
 */
export const guardAppOnly = (options?: GuardAppOnlyOptions): boolean => {
  if (typeof window === "undefined") return false;

  // 1. 최신 앱 환경 (ReactNativeWebView 브릿지 지원)인 경우 통과
  if (isLatestUnidormApp()) {
    return true;
  }

  const storeUrl = getStoreUrl();

  // 2. 이전 버전의 유니돔 앱을 사용 중인 경우 -> 업데이트 안내
  if (isLegacyUnidormApp()) {
    const message =
      options?.customMessage || i18n.t("common:guard.appUpdateConfirm");

    const shouldUpdate = window.confirm(message);
    if (shouldUpdate) {
      window.open(storeUrl, "_blank");
    } else if (options?.onCancelNavigateBack && options?.navigate) {
      options.navigate(-1);
    }
    return false;
  }

  // 3. 모바일 브라우저(iOS / Android 웹)인 경우 -> 앱 설치 안내
  const platform = getMobilePlatform();
  if (platform === "ios_browser" || platform === "android_browser") {
    const message =
      options?.customMessage || i18n.t("common:guard.appInstallConfirm");

    const shouldInstall = window.confirm(message);
    if (shouldInstall) {
      window.open(storeUrl, "_blank");
    } else if (options?.onCancelNavigateBack && options?.navigate) {
      options.navigate(-1);
    }
    return false;
  }

  // 4. PC 및 기타 브라우저 환경인 경우 -> 스토어 페이지 이동 안내
  const pcMessage =
    options?.customMessage || i18n.t("common:guard.pcAppOnlyConfirm");

  const shouldOpenStore = window.confirm(pcMessage);
  if (shouldOpenStore) {
    window.open(storeUrl, "_blank");
  } else if (options?.onCancelNavigateBack && options?.navigate) {
    options.navigate(-1);
  }
  return false;
};

/**
 * 로컬 포털 에이전트(모바일 앱 웹뷰 또는 PC Chrome 확장) 전용 기능 가드.
 * - 최신 유니돔 앱 또는 UNIDorm 크롬 확장이 활성화되어 있으면 통과
 * - 미설치 환경에서는 기존 guardAppOnly 안내로 폴백
 */
export const guardPortalAgent = (options?: GuardAppOnlyOptions): boolean => {
  if (typeof window === "undefined") return false;
  if (isPortalAgentAvailable()) {
    return true;
  }
  if (isLegacyUnidormApp()) {
    return guardAppOnly(options);
  }
  return guardAppOnly({
    ...options,
    customMessage:
      options?.customMessage || i18n.t("common:guard.portalAgentConfirm"),
  });
};
