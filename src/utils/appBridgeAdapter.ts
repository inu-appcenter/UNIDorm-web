import { hasReactNativeWebView, isOfficialApp } from "./getMobilePlatform";
import { flushAllBroadcastSync } from "@/stores/middleware/broadcastSync";
import { withTokenExpiry } from "./jwtExpiry";

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
  if (typeof window !== "undefined" && typeof (window as any).AndroidBridge !== "undefined") {
    try {
      if (event === "requestAppUpdate" && typeof (window as any).AndroidBridge.requestAppUpdate === "function") {
        (window as any).AndroidBridge.requestAppUpdate();
        return;
      }
      if (event === "onAppReady" && typeof (window as any).AndroidBridge.onAppReady === "function") {
        (window as any).AndroidBridge.onAppReady();
        return;
      }
      if (event === "routeChange" && typeof (window as any).AndroidBridge.onRouteChange === "function") {
        (window as any).AndroidBridge.onRouteChange(String(value));
        return;
      }
    } catch (e) {
      console.error("[AndroidBridge] error:", e);
    }
  }

  // 3. 구버전 iOS WebKit 브릿지 폴백
  if (typeof window !== "undefined" && typeof (window as any).webkit?.messageHandlers !== "undefined") {
    try {
      const handler = ((window as any).webkit.messageHandlers as any)[event];
      if (handler && typeof handler.postMessage === "function") {
        handler.postMessage(value ?? null);
        return;
      }
    } catch (e) {
      console.error("[iOSBridge] error:", e);
    }
  }
}

export interface TokenRefreshResult {
  status: "ok" | "rejected" | "error";
  accessToken?: string;
  refreshToken?: string;
  role?: string;
}

const TOKEN_REFRESH_TIMEOUT_MS = 10_000;

/** 네이티브 셸이 페이지 로드 전에 광고한 기능을 지원하는지 확인합니다. */
function hasNativeFeature(feature: string): boolean {
  return (
    hasReactNativeWebView() &&
    Array.isArray(window.__unidormNativeFeatures) &&
    window.__unidormNativeFeatures.includes(feature)
  );
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
    flushAllBroadcastSync();
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
    flushAllBroadcastSync();
    postBridgeMessage("goBack");
  },

  /** 서브 웹뷰 스택을 닫고 메인 탭으로 복귀 */
  goHome(path: string): void {
    flushAllBroadcastSync();
    postBridgeMessage("goHome", { path });
  },

  /** 뒤로가기 요청 */
  requestBack(): void {
    flushAllBroadcastSync();
    postBridgeMessage("goBack");
  },

  /** 로그인 성공 알림 */
  loginSuccess(): void {
    postBridgeMessage("loginSuccess");
  },

  /** 토큰 동기화 */
  syncTokenInfo(tokenInfo: any): void {
    postBridgeMessage("syncTokenInfo", withTokenExpiry(tokenInfo));
  },

  /** 네이티브가 토큰 재발급을 대신 해줄 수 있는지 여부 (브라우저·구버전 앱은 false) */
  supportsNativeTokenRefresh(): boolean {
    return hasNativeFeature("tokenRefresh");
  },

  /**
   * 토큰 재발급을 네이티브에 맡깁니다. 네이티브는 웹뷰가 여러 개여도 같은
   * refreshToken에 대해 서버를 한 번만 호출합니다. 응답이 없으면 null.
   */
  requestTokenRefresh(refreshToken: string): Promise<TokenRefreshResult | null> {
    return new Promise((resolve) => {
      const id = `token-refresh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

      const handler = (e: MessageEvent) => {
        try {
          const raw = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
          if (raw && raw.event === "tokenRefreshResult" && raw.id === id && raw.value) {
            cleanup();
            resolve(raw.value as TokenRefreshResult);
          }
        } catch {
          // 다른 출처의 message 이벤트는 무시한다.
        }
      };
      const timer = setTimeout(() => {
        cleanup();
        resolve(null);
      }, TOKEN_REFRESH_TIMEOUT_MS);
      const cleanup = () => {
        clearTimeout(timer);
        window.removeEventListener("message", handler);
        document.removeEventListener("message", handler as EventListener);
      };

      window.addEventListener("message", handler);
      // Android WebView 일부 환경 대응
      document.addEventListener("message", handler as EventListener);

      try {
        window.ReactNativeWebView!.postMessage(
          JSON.stringify({ event: "requestTokenRefresh", value: { refreshToken }, v: 1, id })
        );
      } catch (e) {
        console.error("[Bridge] postMessage error:", e);
        cleanup();
        resolve(null);
      }
    });
  },

  /** 네이티브에서 전송되는 tokenInfoUpdated (JWT 갱신 브로드캐스트) 리스너 등록 */
  onTokenInfoUpdated(callback: (tokenInfo: any) => void): () => void {
    const handler = (e: MessageEvent) => {
      try {
        const raw = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (raw && raw.event === "tokenInfoUpdated" && raw.value) {
          callback(raw.value);
        }
      } catch {}
    };

    window.addEventListener("message", handler);
    // Android WebView 일부 환경 대응
    document.addEventListener("message" as any, handler);

    return () => {
      window.removeEventListener("message", handler);
      document.removeEventListener("message" as any, handler);
    };
  },

  /** 공식 앱 여부 확인 */
  isApp(): boolean {
    return isOfficialApp();
  },
};

