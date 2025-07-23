// src/utils/getMobilePlatform.ts
export const getMobilePlatform = (): "ios" | "android" | "other" => {
  const ua = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
};
