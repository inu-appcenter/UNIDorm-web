import { PlatformChannel, type ChannelOptions, type Transport } from "../channel";
import { NativeToWeb, WebToNative } from "../messages";

/**
 * 웹(UNIDorm-web)용 채널.
 *
 *  - 보냄(Web -> Native): `window.ReactNativeWebView.postMessage(raw)`
 *  - 받음(Native -> Web): `window`/`document` 의 'message' 이벤트
 *
 * 'message' 이벤트는 표준 `window.postMessage`(iframe 등)와 공유되므로 출처가
 * 섞일 수 있으나, 채널의 Zod 검증이 봉투 형태(event/v)로 자연스럽게 걸러낸다.
 */

interface ReactNativeWebView {
  postMessage(message: string): void;
}

declare global {
  interface Window {
    ReactNativeWebView?: ReactNativeWebView;
  }
}

/** 신 Expo 셸의 단일 채널이 존재하는지 확인한다. */
export function hasReactNativeWebView(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.ReactNativeWebView?.postMessage === "function"
  );
}

function createWebTransport(): Transport {
  return {
    post(raw) {
      window.ReactNativeWebView?.postMessage(raw);
    },
    setInbound(onRaw) {
      const handler = (event: MessageEvent) => {
        if (typeof event.data === "string") onRaw(event.data);
      };
      // iOS 는 window, (구) Android 는 document 로 발화될 수 있어 둘 다 구독.
      window.addEventListener("message", handler);
      document.addEventListener("message", handler as EventListener);
      return () => {
        window.removeEventListener("message", handler);
        document.removeEventListener("message", handler as EventListener);
      };
    },
  };
}

/** 웹 → 네이티브로 보내고, 네이티브 → 웹을 받는 채널. */
export type WebChannel = PlatformChannel<WebToNative, NativeToWeb>;

/**
 * 웹용 PlatformChannel 을 생성한다.
 * `ReactNativeWebView` 가 없으면(브라우저/구앱) `null` 을 반환한다.
 */
export function createWebChannel(options?: ChannelOptions): WebChannel | null {
  if (!hasReactNativeWebView()) return null;
  return new PlatformChannel(createWebTransport(), WebToNative, NativeToWeb, options);
}
