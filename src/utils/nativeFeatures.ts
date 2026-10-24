import { hasReactNativeWebView } from "@unidorm/bridge/web";
import type { BridgeCapabilitiesPayload } from "@unidorm/bridge";

/**
 * 네이티브 셸 기능 판별의 단일 진입점.
 *
 * 판별 근거는 세 가지이며, 뒤로 갈수록 신뢰도가 높습니다.
 *  1. UserAgent 접미사 `UNIDormApp/<버전>` — 유니돔 앱(구버전 포함)인지 여부
 *  2. `window.__unidormNativeFeatures` — 페이지 로드 전에 주입되는 기능 목록.
 *     첫 API 요청처럼 `bridgeCapabilities` 가 오기 전에도 동기적으로 읽을 수 있습니다.
 *  3. `bridgeCapabilities` — `bridgeReady` 직후 네이티브가 보내는 기능 광고.
 *     수신하면 2번보다 우선합니다.
 */

let advertised: BridgeCapabilitiesPayload | null = null;

/** UserAgent 접미사로 유니돔 앱(구버전 포함)인지 확인합니다. */
export function hasUnidormAppUserAgent(): boolean {
  return typeof navigator !== "undefined" && (navigator.userAgent || "").includes("UNIDormApp");
}

/** 네이티브가 `bridgeCapabilities` 로 광고한 기능을 기록합니다. */
export function recordBridgeCapabilities(capabilities: BridgeCapabilitiesPayload): void {
  advertised = capabilities;
}

/** 네이티브 셸이 해당 기능을 지원하는지 확인합니다. 브라우저·구버전 앱은 false. */
export function hasNativeFeature(feature: string): boolean {
  if (!hasReactNativeWebView()) return false;
  if (advertised) return advertised.features.includes(feature);
  const injected = window.__unidormNativeFeatures;
  return Array.isArray(injected) && injected.includes(feature);
}
