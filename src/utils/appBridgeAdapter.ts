import { hasReactNativeWebView, isOfficialApp } from "./getMobilePlatform";

/**
 * 단일 브릿지 어댑터.
 *
 * 신버전 Expo/React Native 셸 환경에서는 `window.ReactNativeWebView.postMessage`
 * 단일 채널을 통해 전달되고, 구버전 네이티브 앱 환경에서는 기존
 * `window.AndroidBridge.*` / `window.webkit.messageHandlers.*` 프로토콜로 폴백합니다.
 */

function postBridgeMessage(event: string, value?: any): void {
  // 1. React Native WebView 단일 채널 우선
  if (hasReactNativeWebView()) {
    try {
      window.ReactNativeWebView!.postMessage(
        JSON.stringify({ event, value, v: 1 })
      );
      return;
    } catch (e) {
      console.error("[Bridge] postMessage error:", e);
    }
  }

  // 2. 구버전 네이티브 안드로이드 브릿지 폴백
  if (typeof window.AndroidBridge !== "undefined") {
    try {
      if (event === "requestAppUpdate" && typeof window.AndroidBridge.requestAppUpdate === "function") {
        window.AndroidBridge.requestAppUpdate();
        return;
      }
      if (event === "onAppReady" && typeof window.AndroidBridge.onAppReady === "function") {
        window.AndroidBridge.onAppReady();
        return;
      }
      if (event === "routeChange" && typeof window.AndroidBridge.onRouteChange === "function") {
        window.AndroidBridge.onRouteChange(String(value));
        return;
      }
    } catch (e) {
      console.error("[AndroidBridge] error:", e);
    }
  }

  // 3. 구버전 iOS WebKit 브릿지 폴백
  if (typeof window.webkit?.messageHandlers !== "undefined") {
    try {
      const handler = (window.webkit.messageHandlers as any)[event];
      if (handler && typeof handler.postMessage === "function") {
        handler.postMessage(value ?? null);
        return;
      }
    } catch (e) {
      console.error("[iOSBridge] error:", e);
    }
  }
}

/** 신규 멀티 웹뷰 및 새로운 브릿지 기능 지원 여부를 확인합니다. */
export function supportsMultiWebView(): boolean {
  return hasReactNativeWebView();
}

export const appBridge = {
  /** 앱 화면 업데이트 및 세션 유지 캐시 삭제 요청 */
  requestAppUpdate(): void {
    postBridgeMessage("requestAppUpdate");
  },

  /** React 앱 마운트 완료 신호 (대기 중인 딥링크 플러시) */
  onAppReady(): void {
    postBridgeMessage("onAppReady");
  },

  /** 상세 화면 진입 신호 (OS 알림 센터에서 해당 알림 일괄 제거) */
  enterDetailView(detail: { type?: string; id?: string; path?: string } | string): void {
    const payload = typeof detail === "string" ? { path: detail } : detail;
    postBridgeMessage("enterDetailView", payload);
  },

  /** 경로 변경 알림 */
  routeChange(path: string): void {
    postBridgeMessage("routeChange", path);
  },

  /** 멀티 웹뷰 새 서브 페이지 스택 푸시 */
  navigateTo(pathOrUrl: string): void {
    const fullUrl = pathOrUrl.startsWith("http")
      ? pathOrUrl
      : `${window.location.origin}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
    const path = pathOrUrl.startsWith("http")
      ? new URL(pathOrUrl).pathname
      : pathOrUrl;

    postBridgeMessage("navigateTo", { path, url: fullUrl });
  },

  /** 서브 웹뷰 스택 팝 (뒤로가기) */
  goBack(): void {
    postBridgeMessage("goBack");
  },

  /** 서브 웹뷰 스택을 닫고 메인 탭으로 복귀 */
  goHome(path: string): void {
    postBridgeMessage("goHome", { path });
  },

  /** 뒤로가기 요청 */
  requestBack(): void {
    postBridgeMessage("goBack");
  },

  /** 로그인 성공 알림 */
  loginSuccess(): void {
    postBridgeMessage("loginSuccess");
  },

  /** 토큰 동기화 */
  syncTokenInfo(tokenInfo: any): void {
    postBridgeMessage("syncTokenInfo", tokenInfo);
  },

  /** 공식 앱 여부 확인 */
  isApp(): boolean {
    return isOfficialApp();
  },
};

