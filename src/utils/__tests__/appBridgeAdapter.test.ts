import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/** 네이티브 → 웹 메시지를 흉내 낸다 (RN WebView는 문자열 data의 message 이벤트를 쏜다). */
let listeners: ((e: MessageEvent) => void)[] = [];
const fromNative = (message: unknown) => {
  const data = JSON.stringify(message);
  listeners.forEach((listener) => listener({ data } as MessageEvent));
};

const TOKEN_INFO = {
  accessToken: "a",
  accessTokenExpiredTime: "2026-10-24T20:00:00",
  refreshToken: "r",
  refreshTokenExpiredTime: "2026-11-24T20:00:00",
};

const stubWindow = (extra: Record<string, unknown>) => {
  vi.stubGlobal("window", {
    location: { origin: "https://unidorm.test" },
    addEventListener: (_: string, listener: (e: MessageEvent) => void) => listeners.push(listener),
    removeEventListener: (_: string, listener: (e: MessageEvent) => void) => {
      listeners = listeners.filter((l) => l !== listener);
    },
    ...extra,
  });
  vi.stubGlobal("document", { addEventListener: vi.fn(), removeEventListener: vi.fn() });
};

const loadAdapter = async () => (await import("../appBridgeAdapter")).appBridge;

describe("appBridge (React Native 셸)", () => {
  let postMessage: ReturnType<typeof vi.fn>;
  const sent = () => postMessage.mock.calls.map(([raw]) => JSON.parse(raw as string));

  beforeEach(() => {
    vi.resetModules();
    listeners = [];
    postMessage = vi.fn();
    stubWindow({ ReactNativeWebView: { postMessage }, __unidormNativeFeatures: ["tokenRefresh"] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("계약 스키마에 맞는 봉투로 보낸다", async () => {
    const appBridge = await loadAdapter();
    appBridge.navigateTo("/chat/1");

    expect(sent()).toEqual([
      { event: "navigateTo", value: { path: "/chat/1", url: "https://unidorm.test/chat/1" }, v: 1 },
    ]);
  });

  it("스키마에 맞지 않는 메시지는 보내지 않고 에러로 알린다", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const appBridge = await loadAdapter();

    expect(() => appBridge.enterDetailView({ id: 1 as unknown as string })).not.toThrow();
    expect(postMessage).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalled();
  });

  it("bridgeReady는 페이지 로드당 한 번만 보낸다", async () => {
    const appBridge = await loadAdapter();
    appBridge.bridgeReady();
    appBridge.bridgeReady();

    expect(sent().filter((m) => m.event === "bridgeReady")).toHaveLength(1);
  });

  it("bridgeCapabilities를 받으면 주입된 기능 목록보다 우선한다", async () => {
    const appBridge = await loadAdapter();
    expect(appBridge.supportsNativeTokenRefresh()).toBe(true);

    appBridge.bridgeReady();
    fromNative({ event: "bridgeCapabilities", value: { protocol: 1, features: ["share"] }, v: 1 });

    expect(appBridge.supportsNativeTokenRefresh()).toBe(false);
  });

  it("tokenRefreshResult를 같은 id의 요청에 돌려준다", async () => {
    const appBridge = await loadAdapter();
    postMessage.mockImplementation((raw: string) => {
      const { id } = JSON.parse(raw);
      queueMicrotask(() =>
        fromNative({ event: "tokenRefreshResult", value: { status: "rejected" }, v: 1, id }),
      );
    });

    await expect(appBridge.requestTokenRefresh("r")).resolves.toEqual({ status: "rejected" });
  });

  it("tokenInfoUpdated를 구독자에게 전달하고, 해제 후에는 전달하지 않는다", async () => {
    const appBridge = await loadAdapter();
    const callback = vi.fn();
    const off = appBridge.onTokenInfoUpdated(callback);

    fromNative({ event: "tokenInfoUpdated", value: TOKEN_INFO, v: 1 });
    off();
    fromNative({ event: "tokenInfoUpdated", value: TOKEN_INFO, v: 1 });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(TOKEN_INFO, expect.anything());
  });

  it("만료 시각이 빠진 tokenInfoUpdated는 버리고 경고한다", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const appBridge = await loadAdapter();
    const callback = vi.fn();
    appBridge.onTokenInfoUpdated(callback);

    fromNative({ event: "tokenInfoUpdated", value: { accessToken: "a", refreshToken: "r" }, v: 1 });

    expect(callback).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });
});

describe("appBridge (구버전 셸·브라우저)", () => {
  beforeEach(() => {
    vi.resetModules();
    listeners = [];
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ReactNativeWebView가 없으면 AndroidBridge로 폴백한다", async () => {
    const onRouteChange = vi.fn();
    stubWindow({ AndroidBridge: { onRouteChange }, __unidormNativeFeatures: ["tokenRefresh"] });
    const appBridge = await loadAdapter();

    appBridge.routeChange("/home");
    appBridge.bridgeReady();

    expect(onRouteChange).toHaveBeenCalledWith("/home");
    expect(appBridge.supportsNativeTokenRefresh()).toBe(false);
  });

  it("브라우저에서는 토큰 재발급 위임이 즉시 null이다", async () => {
    stubWindow({});
    const appBridge = await loadAdapter();

    await expect(appBridge.requestTokenRefresh("r")).resolves.toBeNull();
  });
});
