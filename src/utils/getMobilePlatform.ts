export type MobilePlatform =
  | "ios_webview"
  | "ios_browser"
  | "android_webview"
  | "android_browser"
  | "other";

/**
 * 현재 접속한 환경이 iOS/Android WebView 또는 일반 브라우저인지 판별합니다.
 */
export function getMobilePlatform(): MobilePlatform {
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;

  // ✅ iOS 판별
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent);
  const isWKWebView =
    /(Version\/[\d.]+).*Mobile.*Safari/.test(userAgent) === false;

  if (isIOS) {
    // WebView는 Safari가 없거나, WKWebView의 패턴을 가질 때
    if (!isSafari || isWKWebView) {
      return "ios_webview";
    }
    return "ios_browser";
  }

  // ✅ Android 판별
  const isAndroid = /Android/i.test(userAgent);
  const isWebView = /wv/i.test(userAgent) || /Version\/[\d.]+/i.test(userAgent);

  if (isAndroid) {
    if (isWebView) {
      return "android_webview";
    }
    return "android_browser";
  }

  // ✅ 기타 환경
  return "other";
}
