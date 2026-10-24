import { safeLocalStorage } from "./safeStorage";

const V3_PREFIX = "enc:v3:";
// v1·v2 암호문은 이전 키로 만들어져 더 이상 풀 수 없다. 내용이 모두 포털에서 다시
// 받아올 수 있는 캐시라서, 만나면 지우고 캐시 미스로 처리한다.
const STALE_PREFIXES = ["enc:v1:", "enc:v2:"];
const ALGORITHM = "AES-GCM";
const DEVICE_SALT_STORAGE_KEY = "unidorm_device_entropy_salt";

export const DEFAULT_PORTAL_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24시간

export interface CacheEnvelope<T = any> {
  __isEnvelope: true;
  version: 2;
  savedAt: number;
  expireAt: number;
  data: T;
  meta?: Record<string, any>;
}

let cachedKeyPromise: Promise<CryptoKey> | null = null;

const isEncrypted = (stored: string) =>
  stored.startsWith(V3_PREFIX) || STALE_PREFIXES.some((prefix) => stored.startsWith(prefix));

function getCryptoSubtle(): SubtleCrypto | null {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  return null;
}

function getRandomValues(array: Uint8Array): Uint8Array {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    return window.crypto.getRandomValues(array);
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(array);
  }
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * 기기별 고유 엔트로피 솔트를 조회하거나 최초 1회 생성하여 보관합니다.
 * 이 솔트는 외부 기기나 브라우저에서 절대 공유되지 않으므로 기기 간 복호화를 차단합니다.
 */
function getOrCreateDeviceSalt(): string {
  let salt = safeLocalStorage.getItem(DEVICE_SALT_STORAGE_KEY);
  if (!salt || salt.length < 32) {
    const randomBytes = getRandomValues(new Uint8Array(32));
    salt = bufferToHex(randomBytes.buffer);
    safeLocalStorage.setItem(DEVICE_SALT_STORAGE_KEY, salt);
  }
  return salt;
}

/**
 * 기기 고유 솔트 기반 암호화 키 파생
 */
async function getDeviceEncryptionKey(): Promise<CryptoKey | null> {
  const subtle = getCryptoSubtle();
  if (!subtle) return null;

  if (cachedKeyPromise) return cachedKeyPromise;

  cachedKeyPromise = (async () => {
    const salt = getOrCreateDeviceSalt();
    const encoder = new TextEncoder();
    const rawKeyMaterial = `unidorm_vault_${salt}_isolated_key_material`;
    const keyData = await subtle.digest("SHA-256", encoder.encode(rawKeyMaterial));
    return subtle.importKey(
      "raw",
      keyData,
      { name: ALGORITHM },
      false,
      ["encrypt", "decrypt"]
    );
  })();

  return cachedKeyPromise;
}

const memoryCache = new Map<string, any>();

/**
 * Web Crypto API (AES-GCM-256) 기반 온디바이스 보안 저장소.
 * - 기기별 고유 엔트로피 솔트를 활용한 암호화 키 파생 (하드코딩 키 제거)
 * - 평문 레거시 데이터는 읽을 때 암호화해 다시 저장, 이전 키의 암호문(v1·v2)은 캐시 미스로 정리
 * - 캐시 유효기간(TTL) 관리 및 포털 캐시 일괄 소거 기능 제공
 */
export const secureStorage = {
  getItemSync<T = any>(key: string): T | null {
    if (memoryCache.has(key)) {
      return memoryCache.get(key) as T;
    }
    const stored = safeLocalStorage.getItem(key);
    if (!stored) return null;
    if (!isEncrypted(stored)) {
      try {
        const parsed = JSON.parse(stored) as T;
        memoryCache.set(key, parsed);
        return parsed;
      } catch {
        return stored as unknown as T;
      }
    }
    return null;
  },

  async setItem(key: string, value: any): Promise<void> {
    memoryCache.set(key, value);
    try {
      const subtle = getCryptoSubtle();
      const stringValue = typeof value === "string" ? value : JSON.stringify(value);

      if (!subtle) {
        safeLocalStorage.setItem(key, stringValue);
        return;
      }

      const keyObj = await getDeviceEncryptionKey();
      if (!keyObj) {
        safeLocalStorage.setItem(key, stringValue);
        return;
      }

      const iv = getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(stringValue);

      const cipherBuffer = await subtle.encrypt(
        { name: ALGORITHM, iv },
        keyObj,
        encoded
      );

      const encryptedPayload = `${V3_PREFIX}${bufferToHex(iv.buffer)}:${bufferToHex(cipherBuffer)}`;
      safeLocalStorage.setItem(key, encryptedPayload);
    } catch (e) {
      console.warn(`[secureStorage] Failed to encrypt item "${key}":`, e);
      safeLocalStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  },

  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const stored = safeLocalStorage.getItem(key);
      if (!stored) {
        memoryCache.delete(key);
        return null;
      }

      // 1. 평문 레거시 데이터 마이그레이션
      if (!isEncrypted(stored)) {
        try {
          const parsed = JSON.parse(stored) as T;
          memoryCache.set(key, parsed);
          void this.setItem(key, parsed);
          return parsed;
        } catch {
          return stored as unknown as T;
        }
      }

      // 2. 이전 키의 암호문은 풀 수 없으므로 지우고 캐시 미스로 처리
      if (!stored.startsWith(V3_PREFIX)) {
        this.removeItem(key);
        return null;
      }

      const subtle = getCryptoSubtle();
      if (!subtle) return null;

      // 3. 기기 고유키 암호문 복호화
      const parts = stored.slice(V3_PREFIX.length).split(":");
      if (parts.length !== 2) return null;

      const [ivHex, cipherHex] = parts;
      const iv = hexToBuffer(ivHex);
      const cipherBytes = hexToBuffer(cipherHex);
      const keyObj = await getDeviceEncryptionKey();
      if (!keyObj) return null;

      const decryptedBuffer = await subtle.decrypt(
        { name: ALGORITHM, iv: iv as unknown as BufferSource },
        keyObj,
        cipherBytes as unknown as BufferSource
      );

      const decryptedText = new TextDecoder().decode(decryptedBuffer);
      try {
        const parsed = JSON.parse(decryptedText) as T;
        memoryCache.set(key, parsed);
        return parsed;
      } catch {
        const str = decryptedText as unknown as T;
        memoryCache.set(key, str);
        return str;
      }
    } catch (e) {
      console.warn(`[secureStorage] Failed to decrypt item "${key}":`, e);
      return null;
    }
  },

  removeItem(key: string): void {
    memoryCache.delete(key);
    safeLocalStorage.removeItem(key);
  },

  /**
   * TTL(유효기간) 메타데이터를 포함하여 캐시를 저장합니다.
   */
  async setCacheWithTtl<T = any>(
    key: string,
    data: T,
    ttlMs: number = DEFAULT_PORTAL_CACHE_TTL_MS,
    meta?: Record<string, any>
  ): Promise<void> {
    const now = Date.now();
    const envelope: CacheEnvelope<T> = {
      __isEnvelope: true,
      version: 2,
      savedAt: now,
      expireAt: now + ttlMs,
      data,
      ...(meta ? { meta } : {}),
    };
    await this.setItem(key, envelope);
  },

  /**
   * TTL 메타데이터가 포함된 캐시를 조회합니다.
   * 레거시 비-Envelope 데이터의 경우 savedAt을 0, isExpired: true로 반환하여
   * 호출 측에서 즉시 표출하되 백그라운드 갱신을 유도할 수 있도록 합니다.
   */
  async getCacheWithTtl<T = any>(
    key: string
  ): Promise<{ data: T; isExpired: boolean; savedAt: number; expireAt: number; meta?: any } | null> {
    const stored = await this.getItem<any>(key);
    if (!stored) return null;

    const now = Date.now();
    if (stored && typeof stored === "object" && stored.__isEnvelope === true && "expireAt" in stored) {
      const isExpired = now >= Number(stored.expireAt || 0);
      return {
        data: stored.data as T,
        isExpired,
        savedAt: Number(stored.savedAt || 0),
        expireAt: Number(stored.expireAt || 0),
        meta: stored.meta,
      };
    }

    // 레거시 형식은 데이터 자체를 반환하되, 만료 플래그를 true로 주어 갱신 권장
    return {
      data: stored as T,
      isExpired: true,
      savedAt: 0,
      expireAt: 0,
    };
  },

  /**
   * 포털 관련 모든 로컬 캐시를 일괄 소거합니다. (계정 연동 해제 시 호출)
   */
  clearAllPortalCaches(): void {
    const portalKeys = [
      "portal_dormitory_student_info",
      "portal_dormitory_student_info_sanitized",
      "portal_student_info",
      "portal_dormitory_last_updated",
      "portal_info_last_updated",
      "portal_student_id",
      "portal_terms_agreed",
    ];
    portalKeys.forEach((key) => {
      this.removeItem(key);
      safeLocalStorage.removeItem(key);
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch {}
    });
  },
};


