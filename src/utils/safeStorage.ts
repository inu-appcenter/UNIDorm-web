/**
 * 카카오톡, 인스타그램 등 일부 인앱 브라우저나 개인정보 보안 설정이 강화된 웹뷰 환경에서
 * localStorage 접근 시 SecurityError (DOMException)가 발생할 수 있습니다.
 * 이에 대비해 안전하게 localStorage에 읽기/쓰기/삭제를 수행하는 헬퍼 함수입니다.
 */

const memoryFallback = new Map<string, string>();

function getStorage(): Storage | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== "undefined" && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
  } catch {
    // SecurityError / blocked storage
  }
  return null;
}

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      const storage = getStorage();
      if (storage) {
        return storage.getItem(key);
      }
      return memoryFallback.get(key) ?? null;
    } catch (e) {
      console.warn(`[safeLocalStorage] Failed to get item "${key}":`, e);
      return memoryFallback.get(key) ?? null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      const storage = getStorage();
      if (storage) {
        storage.setItem(key, value);
        return;
      }
      memoryFallback.set(key, value);
    } catch (e) {
      console.warn(`[safeLocalStorage] Failed to set item "${key}":`, e);
      memoryFallback.set(key, value);
    }
  },

  removeItem(key: string): void {
    try {
      memoryFallback.delete(key);
      const storage = getStorage();
      if (storage) {
        storage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[safeLocalStorage] Failed to remove item "${key}":`, e);
    }
  },

  clear(): void {
    try {
      memoryFallback.clear();
      const storage = getStorage();
      if (storage) {
        storage.clear();
      }
    } catch (e) {
      console.warn("[safeLocalStorage] Failed to clear localStorage:", e);
    }
  },
};
