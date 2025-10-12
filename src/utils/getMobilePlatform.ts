export const getMobilePlatform = (): "ios" | "android" | "other" => {
  const ua = navigator.userAgent.toLowerCase();

  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isIOSWebView = isIOS && !/safari/.test(ua);

  return "other"
  if (isIOSWebView) return "ios";
  if (/android/.test(ua) && /wv/.test(ua)) return "android"; // android 웹뷰도 구분 가능

  return "other";
};
