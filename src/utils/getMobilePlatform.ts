export type MobilePlatform =
  | "ios_unidorm_app"
  | "ios_browser"
  | "android_unidorm_app"
  | "android_browser"
  | "other";

/**
 * 현재 접속한 환경이 iOS/Android 유니돔 앱인지, 일반/인앱 브라우저인지 판별합니다.
 */
export function getMobilePlatform(): MobilePlatform {
  if (typeof window === "undefined") return "other";

  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera || "";

  // ✅ iOS 판별
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  if (isIOS) {
    // 유니돔 iOS 앱 판별 (신규 ReactNativeWebView 또는 주입된 브릿지 / UserAgent 확인)
    const isUnidormIOSApp =
      userAgent.includes("UNIDormApp") ||
      Boolean(window.ReactNativeWebView) ||
      Boolean(window.webkit?.messageHandlers?.onAppReady) ||
      Boolean(window.webkit?.messageHandlers?.routeChange) ||
      Boolean(window.webkit?.messageHandlers?.requestAppUpdate);

    return isUnidormIOSApp ? "ios_unidorm_app" : "ios_browser";
  }

  // ✅ Android 판별
  const isAndroid = /Android/i.test(userAgent);
  if (isAndroid) {
    // 유니돔 Android 앱 판별 (주입된 AndroidBridge, ReactNativeWebView 또는 Custom UserAgent 확인)
    const isUnidormAndroidApp =
      Boolean((window as any).AndroidBridge) ||
      Boolean(window.ReactNativeWebView) ||
      userAgent.includes("UNIDormApp");

    return isUnidormAndroidApp ? "android_unidorm_app" : "android_browser";
  }

  // ✅ 기타 환경 (PC 등)
  return "other";
}

/** React Native WebView 단일 채널이 존재하는지 확인합니다. */
export function hasReactNativeWebView(): boolean {
  return typeof window !== "undefined" && typeof window.ReactNativeWebView?.postMessage === "function";
}

/** 공식 유니돔 앱(구버전 포함) 환경인지 확인합니다. */
export function isOfficialApp(): boolean {
  const platform = getMobilePlatform();
  return platform === "ios_unidorm_app" || platform === "android_unidorm_app";
}

/** 최신 기능을 온전히 지원하는 최신 유니돔 앱 환경(ReactNativeWebView)인지 확인합니다. */
export function isLatestUnidormApp(): boolean {
  return hasReactNativeWebView();
}

/** 이전 버전의 유니돔 앱(구 네이티브 브릿지만 존재하는 레거시 셸)인지 확인합니다. */
export function isLegacyUnidormApp(): boolean {
  if (hasReactNativeWebView()) return false;
  if (typeof window === "undefined") return false;

  const hasLegacyAndroid = Boolean((window as any).AndroidBridge);
  const hasLegacyIOS =
    Boolean(window.webkit?.messageHandlers?.onAppReady) ||
    Boolean(window.webkit?.messageHandlers?.routeChange) ||
    Boolean(window.webkit?.messageHandlers?.requestAppUpdate);

  return hasLegacyAndroid || hasLegacyIOS;
}

/** 공식 스토어 다운로드/업데이트 링크 */
export const STORE_URLS = {
  ios: "https://apps.apple.com/kr/app/%EC%9C%A0%EB%8B%88%EB%8F%94/id6751404748",
  android: "https://play.google.com/store/apps/details?id=com.hjunieee.inudormitory",
} as const;

/** 현재 사용자 환경에 적합한 스토어 URL을 반환합니다. */
export function getStoreUrl(): string {
  if (typeof window === "undefined") return STORE_URLS.android;

  const userAgent = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod|Macintosh/i.test(userAgent);

  return isIOS ? STORE_URLS.ios : STORE_URLS.android;
}

