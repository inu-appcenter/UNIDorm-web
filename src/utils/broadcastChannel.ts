/**
 * BroadcastChannel 미지원 환경(구형 WebView 등)에서도 안전하게 no-op(null)로
 * 폴백하는 팩토리 함수.
 */
export function createSafeBroadcastChannel(name: string): BroadcastChannel | null {
  const globalObj = typeof window !== "undefined" ? window : globalThis;
  if (!globalObj || !("BroadcastChannel" in globalObj)) {
    return null;
  }
  try {
    return new (globalObj as any).BroadcastChannel(name);
  } catch (error) {
    console.warn(`[broadcastChannel] BroadcastChannel(${name}) 생성 실패:`, error);
    return null;
  }
}
