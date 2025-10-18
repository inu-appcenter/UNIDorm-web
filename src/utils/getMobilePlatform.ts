export type MobilePlatform = "ios" | "android" | "other";

/**
 * 현재 접속한 브라우저가 iOS WebView, Android WebView, 혹은 기타 환경인지 판별합니다.
 */
export function getMobilePlatform(): MobilePlatform {
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;

  // ✅ iOS WebView 판별
  // iPhone|iPad|iPod 가 포함되어 있고, Safari 문자열이 없으면 WebView로 간주
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent);
  if (isIOS && !isSafari) {
    return "ios";
  }

  // ✅ Android WebView 판별
  // Android가 포함되어 있고, 'wv' 또는 'Version/' 문자열이 있으면 WebView로 간주
  if (
    /Android/i.test(userAgent) &&
    (/wv/i.test(userAgent) || /Version\/[\d.]+/i.test(userAgent))
  ) {
    return "android";
  }

  // ✅ 기타 (일반 브라우저 등)
  return "other";
}
