import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getStoreUrl,
  STORE_URLS,
  isLatestUnidormApp,
  isLegacyUnidormApp,
} from "../getMobilePlatform";
import { guardAppOnly } from "../guard";

describe("스토어 URL 및 앱 버전 판별 테스트", () => {
  const originalUserAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";

  beforeEach(() => {
    if (typeof globalThis.window === "undefined") {
      (globalThis as any).window = {
        open: vi.fn(),
        confirm: vi.fn(),
      };
    }
    if (typeof globalThis.navigator === "undefined") {
      (globalThis as any).navigator = { userAgent: "" };
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis.window as any).ReactNativeWebView;
    delete (globalThis.window as any).AndroidBridge;
    delete (globalThis.window as any).webkit;
    Object.defineProperty(globalThis.navigator, "userAgent", {
      value: originalUserAgent,
      configurable: true,
    });
  });

  describe("getStoreUrl", () => {
    it("iOS 환경에서는 Apple App Store URL을 반환한다", () => {
      Object.defineProperty(globalThis.navigator, "userAgent", {
        value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        configurable: true,
      });
      expect(getStoreUrl()).toBe(STORE_URLS.ios);
    });

    it("Android 환경에서는 Google Play Store URL을 반환한다", () => {
      Object.defineProperty(globalThis.navigator, "userAgent", {
        value: "Mozilla/5.0 (Linux; Android 14; SM-S928N)",
        configurable: true,
      });
      expect(getStoreUrl()).toBe(STORE_URLS.android);
    });

    it("기타/PC 환경에서도 기본으로 Android Play Store URL을 반환한다", () => {
      Object.defineProperty(globalThis.navigator, "userAgent", {
        value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        configurable: true,
      });
      expect(getStoreUrl()).toBe(STORE_URLS.android);
    });
  });

  describe("isLatestUnidormApp vs isLegacyUnidormApp", () => {
    it("ReactNativeWebView가 존재하면 최신 앱으로 판별한다", () => {
      (globalThis.window as any).ReactNativeWebView = { postMessage: vi.fn() };
      expect(isLatestUnidormApp()).toBe(true);
      expect(isLegacyUnidormApp()).toBe(false);
    });

    it("AndroidBridge만 존재하고 ReactNativeWebView가 없으면 구버전 앱으로 판별한다", () => {
      (globalThis.window as any).AndroidBridge = {};
      expect(isLatestUnidormApp()).toBe(false);
      expect(isLegacyUnidormApp()).toBe(true);
    });

    it("webkit messageHandlers만 존재하고 ReactNativeWebView가 없으면 구버전 앱으로 판별한다", () => {
      (globalThis.window as any).webkit = {
        messageHandlers: { onAppReady: { postMessage: vi.fn() } },
      };
      expect(isLatestUnidormApp()).toBe(false);
      expect(isLegacyUnidormApp()).toBe(true);
    });

    it("브릿지가 전혀 없으면 둘 다 false를 반환한다", () => {
      expect(isLatestUnidormApp()).toBe(false);
      expect(isLegacyUnidormApp()).toBe(false);
    });
  });
});

describe("guardAppOnly 가드 테스트", () => {
  const originalUserAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";

  beforeEach(() => {
    if (typeof globalThis.window === "undefined") {
      (globalThis as any).window = {
        open: vi.fn(),
        confirm: vi.fn(),
      };
    }
    if (typeof globalThis.navigator === "undefined") {
      (globalThis as any).navigator = { userAgent: "" };
    }
    vi.restoreAllMocks();
    delete (globalThis.window as any).ReactNativeWebView;
    delete (globalThis.window as any).AndroidBridge;
    delete (globalThis.window as any).webkit;
  });

  afterEach(() => {
    Object.defineProperty(globalThis.navigator, "userAgent", {
      value: originalUserAgent,
      configurable: true,
    });
  });

  it("최신 앱 환경에서는 confirm 없이 바로 true를 반환하고 통과한다", () => {
    (globalThis.window as any).ReactNativeWebView = { postMessage: vi.fn() };
    const confirmSpy = vi.spyOn(globalThis.window, "confirm");

    const result = guardAppOnly();
    expect(result).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it("구버전 앱 환경에서 confirm 확인 시 최신 버전 업데이트 스토어로 이동한다", () => {
    (globalThis.window as any).AndroidBridge = {};
    const confirmSpy = vi.spyOn(globalThis.window, "confirm").mockReturnValue(true);
    const openSpy = vi.spyOn(globalThis.window, "open").mockImplementation(() => null);

    const result = guardAppOnly();
    expect(result).toBe(false);
    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining("새로운 기능 이용을 위해 유니돔 앱 업데이트가 필요해요")
    );
    expect(openSpy).toHaveBeenCalledWith(STORE_URLS.android, "_blank");
  });

  it("구버전 앱 환경에서 confirm 취소 시 onCancelNavigateBack 옵션이 있으면 navigate(-1)이 호출된다", () => {
    (globalThis.window as any).AndroidBridge = {};
    vi.spyOn(globalThis.window, "confirm").mockReturnValue(false);
    const navigateSpy = vi.fn();

    const result = guardAppOnly({ onCancelNavigateBack: true, navigate: navigateSpy });
    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(-1);
  });

  it("모바일 브라우저(iOS 웹)에서 앱 설치 안내 confirm 후 스토어로 이동한다", () => {
    Object.defineProperty(globalThis.navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      configurable: true,
    });

    const confirmSpy = vi.spyOn(globalThis.window, "confirm").mockReturnValue(true);
    const openSpy = vi.spyOn(globalThis.window, "open").mockImplementation(() => null);

    const result = guardAppOnly();
    expect(result).toBe(false);
    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining("유니돔 앱에서 이용할 수 있는 기능이에요")
    );
    expect(openSpy).toHaveBeenCalledWith(STORE_URLS.ios, "_blank");
  });

  it("PC 브라우저 환경에서 confirm 후 스토어로 이동한다", () => {
    Object.defineProperty(globalThis.navigator, "userAgent", {
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      configurable: true,
    });

    const confirmSpy = vi.spyOn(globalThis.window, "confirm").mockReturnValue(true);
    const openSpy = vi.spyOn(globalThis.window, "open").mockImplementation(() => null);

    const result = guardAppOnly();
    expect(result).toBe(false);
    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining("유니돔 모바일 앱 전용 기능이에요")
    );
    expect(openSpy).toHaveBeenCalledWith(STORE_URLS.android, "_blank");
  });
});
