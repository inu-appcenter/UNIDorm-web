import { createSafeBroadcastChannel } from "@/utils/broadcastChannel";
import { appBridge } from "@/utils/appBridgeAdapter";

export interface MultiWebViewChannel {
  postMessage: (data: unknown) => void;
  close: () => void;
}

/** 윈도우(JS 런타임/웹뷰) 고유 식별자 — 셀프 에코 및 브릿지 순환 차단용 */
const WINDOW_CONTEXT_ID =
  typeof window !== "undefined"
    ? `${Math.random().toString(36).substring(2, 9)}-${Date.now().toString(36)}`
    : "ssr";

export interface SyncMessageEnvelope {
  senderId: string;
  updatedAt: number;
  payload: unknown;
}

/**
 * 같은 오리진의 다른 웹뷰/탭에 상태 스냅샷을 전달하는 채널.
 *
 * 두 경로로 동시에 보냅니다:
 *  - BroadcastChannel: 브라우저 탭, Android WebView
 *  - 네이티브 중계(relayBroadcastSync): 앱의 다른 웹뷰. WKWebView 는 iOS 15.4
 *    미만에서 BroadcastChannel 이 없고, 그 이상에서도 웹뷰 간 전달이 불안정함
 * 같은 메시지가 두 경로로 모두 도착할 수 있으므로 아래 가드로 한 번만 처리합니다:
 *  - Self-Echo Guard: 발신 웹뷰 식별자(senderId) 검증으로 자가 수신 원천 차단
 *  - Stale State Drop: 단조 증가 타임스탬프(updatedAt) 비교로 역전된 메시지 수신 무시
 */
export function openMultiWebViewChannel(
  name: string,
  onMessage: (data: unknown) => void,
): MultiWebViewChannel {
  let lastUpdatedAt = 0;
  let lastSenderId: string | undefined;

  const handleIncomingMessage = (raw: unknown) => {
    if (!raw || typeof raw !== "object") return;
    const env = raw as Partial<SyncMessageEnvelope>;

    // 1. Self-Echo Guard: 자기 자신에게 반사된 메시지 무시
    if (env.senderId && env.senderId === WINDOW_CONTEXT_ID) {
      return;
    }

    // 2. Stale State Drop: 타임스탬프 순서 역전 메시지 무시
    //    (같은 발신자·같은 시각이면 다른 경로로 중복 도착한 같은 메시지)
    if (typeof env.updatedAt === "number") {
      if (env.updatedAt < lastUpdatedAt) return;
      if (env.updatedAt === lastUpdatedAt && env.senderId === lastSenderId)
        return;
      lastUpdatedAt = env.updatedAt;
      lastSenderId = env.senderId;
    }

    const payload = "payload" in env ? env.payload : raw;
    onMessage(payload);
  };

  const broadcastChannel = createSafeBroadcastChannel(name);
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event: MessageEvent) =>
      handleIncomingMessage(event.data);
  }
  const offRelay = appBridge.onBroadcastSyncMessage((message) => {
    if (message.channel === name) handleIncomingMessage(message.payload);
  });

  return {
    postMessage: (data) => {
      const envelope: SyncMessageEnvelope = {
        senderId: WINDOW_CONTEXT_ID,
        updatedAt: Date.now(),
        payload: data,
      };
      broadcastChannel?.postMessage(envelope);
      appBridge.relayBroadcastSync(name, envelope);
    },
    close: () => {
      broadcastChannel?.close();
      offRelay();
    },
  };
}
