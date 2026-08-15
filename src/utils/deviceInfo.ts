import { getMobilePlatform } from "@/utils/getMobilePlatform";

// SettingsPage.tsx의 APP_VERSION과 동일하게 유지 (package.json version)
export const APP_VERSION = "1.8.0";

export const getOsHeaderValue = (): "ios" | "android" | "web" => {
  const platform = getMobilePlatform();
  if (platform.startsWith("ios")) return "ios";
  if (platform.startsWith("android")) return "android";
  return "web";
};
