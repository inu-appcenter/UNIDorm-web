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
    // 유니돔 iOS 앱 판별 (WKWebView에 등록된 messageHandlers 브릿지 확인)
    const isUnidormIOSApp =
      Boolean(window.webkit?.messageHandlers?.onAppReady) ||
      Boolean(window.webkit?.messageHandlers?.routeChange) ||
      Boolean(window.webkit?.messageHandlers?.requestAppUpdate);

    return isUnidormIOSApp ? "ios_unidorm_app" : "ios_browser";
  }

  // ✅ Android 판별
  const isAndroid = /Android/i.test(userAgent);
  if (isAndroid) {
    // 유니돔 Android 앱 판별 (주입된 AndroidBridge 또는 Custom UserAgent 확인)
    const isUnidormAndroidApp =
      Boolean((window as any).AndroidBridge) ||
      userAgent.includes("UNIDormApp");

    return isUnidormAndroidApp ? "android_unidorm_app" : "android_browser";
  }

  // ✅ 기타 환경 (PC 등)
  return "other";
}

