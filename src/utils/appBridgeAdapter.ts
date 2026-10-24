import {
  createWebChannel,
  type WebChannel,
} from "@unidorm/bridge/web";
import type {
  TokenInfoPayload,
  TokenRefreshResultPayload,
  WebToNative,
} from "@unidorm/bridge";
import { isOfficialApp } from "./getMobilePlatform";
import { hasNativeFeature, recordBridgeCapabilities } from "./nativeFeatures";
import { flushAllBroadcastSync } from "@/stores/middleware/broadcastSync";
import { withTokenExpiry } from "./jwtExpiry";

/**
 * 단일 브릿지 어댑터.
 *
 * 신버전 Expo/React Native 셸 환경에서는 공유 브릿지 계약(`@unidorm/bridge`)의
 * `PlatformChannel` 로 주고받고, 구버전 네이티브 앱 환경에서는 기존
 * `window.AndroidBridge.*` / `window.webkit.messageHandlers.*` 프로토콜로 폴백합니다.
 */

let channel: WebChannel | null | undefined;

/** 웹 채널을 지연 생성합니다. ReactNativeWebView가 없으면(브라우저·구버전 앱) null. */
function getChannel(): WebChannel | null {
  if (channel === undefined) {
    channel = createWebChannel({
      onError: (error, raw) => {
        // 다른 출처의 message 이벤트는 조용히 무시하고, 브릿지 봉투인데 검증에
        // 실패한 경우만 알린다. 스키마 불일치가 소리 없이 묻히지 않도록.
        if (raw.includes('"event"')) console.warn("[Bridge] invalid message:", error, raw);
      },
    });
    channel?.on("bridgeCapabilities", recordBridgeCapabilities);
  }
  return channel;
}

type BridgeEvent = WebToNative["event"];
type ValueOf<E extends BridgeEvent> = Extract<WebToNative, { event: E }>["value"];

/** 구버전 네이티브 셸(AndroidBridge / webkit.messageHandlers)로 보냅니다. */
function postLegacyMessage(event: BridgeEvent, value?: unknown): void {
  // 1. 구버전 네이티브 안드로이드 브릿지 폴백
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

  // 2. 구버전 iOS WebKit 브릿지 폴백
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

function postBridgeMessage<E extends BridgeEvent>(event: E, value?: ValueOf<E>): void {
  const ch = getChannel();
  if (!ch) {
    postLegacyMessage(event, value);
    return;
  }
  try {
    // 채널이 계약 스키마로 검증한다. 실패하면 네이티브가 버릴 메시지이므로 크게 알린다.
    (ch.send as (event: E, value?: ValueOf<E>) => void)(event, value);
  } catch (e) {
    console.error("[Bridge] send error:", e);
  }
}

export type TokenRefreshResult = TokenRefreshResultPayload;

const TOKEN_REFRESH_TIMEOUT_MS = 10_000;

let bridgeReadySent = false;

/** 신규 멀티 웹뷰 및 새로운 브릿지 기능 지원 여부를 확인합니다. */
export function supportsMultiWebView(): boolean {
  return getChannel() !== null;
}

export const appBridge = {
  /**
   * 네이티브 → 웹 구독이 설치되었음을 알립니다. 네이티브는 이 신호를 받은 뒤에야
   * `notificationOpened` 같은 일회성 이벤트를 보내고 `bridgeCapabilities` 로 응답합니다.
   * 페이지 로드당 한 번만 보냅니다.
   */
  bridgeReady(): void {
    const ch = getChannel();
    if (!ch || bridgeReadySent) return;
    bridgeReadySent = true;
    postBridgeMessage("bridgeReady");
  },

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
  async requestTokenRefresh(refreshToken: string): Promise<TokenRefreshResult | null> {
    const ch = getChannel();
    if (!ch) return null;
    try {
      const reply = await ch.requestWithOptions(
        "requestTokenRefresh",
        { timeoutMs: TOKEN_REFRESH_TIMEOUT_MS },
        { refreshToken },
      );
      return reply.event === "tokenRefreshResult" ? reply.value : null;
    } catch (e) {
      console.warn("[Bridge] requestTokenRefresh failed:", e);
      return null;
    }
  },

  /** 네이티브에서 전송되는 tokenInfoUpdated (JWT 갱신 브로드캐스트) 리스너 등록 */
  onTokenInfoUpdated(
    callback: (tokenInfo: TokenInfoPayload & { role?: string }) => void,
  ): () => void {
    return getChannel()?.on("tokenInfoUpdated", callback) ?? (() => {});
  },

  /** 공식 앱 여부 확인 */
  isApp(): boolean {
    return isOfficialApp();
  },
};
