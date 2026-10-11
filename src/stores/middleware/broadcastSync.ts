import type { StateCreator, StoreApi } from "zustand";
import { openMultiWebViewChannel } from "@/utils/multiWebViewChannel";

interface BroadcastSyncOptions<T> {
  /** 채널 이름. 스토어별로 고유해야 함. */
  name: string;
  /** 다른 웹뷰로 전송할 직렬화 가능한 필드만 선택 (액션 함수 제외) */
  partialize: (state: T) => Partial<T>;
  /** 원격 업데이트를 반영한 직후 실행할 부수 효과 (예: localStorage 갱신 등) */
  onReceive?: (partial: Partial<T>, state: T) => void;
}

const pendingFlushers = new Map<string, () => void>();

/**
 * 특정 채널의 대기 중인 브로드캐스트를 즉시 내보냄
 */
export function flushBroadcastSync(name: string): void {
  pendingFlushers.get(name)?.();
}

/**
 * broadcastSync를 쓰는 모든 스토어의 대기 중인 브로드캐스트를 한 번에 내보냄.
 * 화면을 떠나기 전(navigateTo / goBack / goHome) 호출하여 유실 방지.
 */
export function flushAllBroadcastSync(): void {
  pendingFlushers.forEach((flush) => flush());
}

/**
 * 같은 오리진의 다른 웹뷰/탭과 Zustand 스토어 상태를 실시간 동기화하는 미들웨어
 */
export function broadcastSync<T extends object>(options: BroadcastSyncOptions<T>) {
  return (creator: StateCreator<T, [], []>): StateCreator<T, [], []> =>
    (set, get, api: StoreApi<T>) => {
      const channel = openMultiWebViewChannel(options.name, (incomingData) => {
        const partial = incomingData as Partial<T>;
        const currentPartial = options.partialize(get());

        // Inbound Reconciliation Guard: 이미 동일한 상태면 리렌더링 방지
        if (JSON.stringify(currentPartial) === JSON.stringify(partial)) {
          return;
        }

        api.setState(partial);
        options.onReceive?.(partial, get());
      });

      let pendingBroadcastTimer: Promise<void> | null = null;
      let lastBroadcastSerialized: string | null = null;

      const sendNow = () => {
        const nextPartial = options.partialize(get());
        const serialized = JSON.stringify(nextPartial);

        if (serialized !== lastBroadcastSerialized) {
          lastBroadcastSerialized = serialized;
          channel.postMessage(nextPartial);
        }
      };

      // 화면 이탈 전 즉시 전송용 flusher 등록
      pendingFlushers.set(options.name, () => {
        pendingBroadcastTimer = null;
        sendNow();
      });

      const broadcastingSet: typeof set = (...args) => {
        (set as any)(...args);

        // Microtask 병합: 한 틱에 연속된 set() 호출을 1회의 브로드캐스트로 병합
        if (!pendingBroadcastTimer) {
          pendingBroadcastTimer = Promise.resolve().then(() => {
            if (!pendingBroadcastTimer) return;
            pendingBroadcastTimer = null;
            sendNow();
          });
        }
      };

      return creator(broadcastingSet, get, api);
    };
}
