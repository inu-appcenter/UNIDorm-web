export const getMobilePlatform = (): "ios" | "android" | "other" => {
  const ua = navigator.userAgent.toLowerCase();

  // 1. iOS 디바이스 확인 (iPhone, iPad, iPod)
  const isIOS = /iphone|ipad|ipod/.test(ua);

  // 2. iOS 웹뷰 확인 로직: iOS 디바이스이면서 Safari 문자열이 없는 경우
  //    (WKWebView는 기본적으로 'Safari'를 포함하지 않음)
  const isIOSWebView = isIOS && !/safari/.test(ua);

  // 3. Android 웹뷰 확인 로직: 'android' 문자열과 'wv' 문자열이 모두 있는 경우
  const isAndroidWebView = /android/.test(ua) && /wv/.test(ua);

  // 실행 순서를 바꿔서 웹뷰 여부를 먼저 반환하도록 수정

  if (isIOSWebView) {
    return "ios"; // iOS 웹뷰
  }

  if (isAndroidWebView) {
    return "android"; // Android 웹뷰
  }

  // 위의 모든 조건에 해당하지 않는 경우 (일반 브라우저, 데스크톱, 기타 모바일)
  return "other";
};
