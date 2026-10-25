import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";

const refreshMock = vi.fn();
vi.mock("../members", () => ({ refresh: () => refreshMock() }));

const setTokenInfoMock = vi.fn();
vi.mock("../../stores/useUserStore", () => ({
  default: {
    getState: () => ({
      tokenInfo: { accessToken: "", refreshToken: "", role: "" },
      setTokenInfo: setTokenInfoMock,
    }),
  },
}));

const createMemoryStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, String(value)),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
};

// 보낸 accessToken이 VALID_ACCESS_TOKEN일 때만 200, 아니면 401을 돌려주는 어댑터
const VALID_ACCESS_TOKEN = "rotated_access";
const authAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  const authorization = String(config.headers?.Authorization ?? "");
  const response = {
    data: { ok: true },
    status: authorization === `Bearer ${VALID_ACCESS_TOKEN}` ? 200 : 401,
    statusText: "",
    headers: {},
    config,
  };
  if (response.status === 200) return response;
  const error = Object.assign(new Error("Unauthorized"), {
    config,
    response,
    isAxiosError: true,
  });
  throw error;
};

describe("다른 웹뷰가 refreshToken을 먼저 교체했을 때의 재발급 처리", () => {
  let location: { href: string };

  beforeEach(() => {
    vi.resetModules();
    refreshMock.mockReset();
    setTokenInfoMock.mockReset();
    location = { href: "" };
    vi.stubGlobal("localStorage", createMemoryStorage());
    vi.stubGlobal("window", {
      location,
      localStorage,
      dispatchEvent: vi.fn(),
    });
    localStorage.setItem("accessToken", "expired_access");
    localStorage.setItem("refreshToken", "old_refresh");
    localStorage.setItem("role", "ROLE_USER");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("재발급이 실패해도 localStorage의 refreshToken이 바뀌면 새 토큰으로 재시도한다", async () => {
    const { default: tokenInstance } = await import("../tokenInstance");
    tokenInstance.defaults.adapter = authAdapter;

    // 서버가 폐기된 refreshToken을 거절하는 동안 다른 웹뷰가 새 토큰을 저장한다.
    refreshMock.mockImplementation(async () => {
      localStorage.setItem("accessToken", VALID_ACCESS_TOKEN);
      localStorage.setItem("refreshToken", "rotated_refresh");
      throw new Error("REFRESH_TOKEN_USER_NOT_FOUND");
    });

    const response = await tokenInstance.get("/users");

    expect(response.status).toBe(200);
    expect(location.href).toBe("");
    expect(setTokenInfoMock).toHaveBeenCalledWith(
      expect.objectContaining({ refreshToken: "rotated_refresh" }),
      { fromNative: true },
    );
  });

  it("새 토큰이 뒤늦게 저장되어도 대기 시간 안이면 채택한다", async () => {
    vi.useFakeTimers();
    const { default: tokenInstance } = await import("../tokenInstance");
    tokenInstance.defaults.adapter = authAdapter;

    refreshMock.mockRejectedValue(new Error("REFRESH_TOKEN_USER_NOT_FOUND"));
    setTimeout(() => {
      localStorage.setItem("accessToken", VALID_ACCESS_TOKEN);
      localStorage.setItem("refreshToken", "rotated_refresh");
    }, 500);

    const request = tokenInstance.get("/users");
    await vi.advanceTimersByTimeAsync(1000);

    await expect(request).resolves.toMatchObject({ status: 200 });
    expect(location.href).toBe("");
  });

  it("refreshToken이 그대로면 대기 후 로그아웃으로 이동한다", async () => {
    vi.useFakeTimers();
    const { default: tokenInstance } = await import("../tokenInstance");
    tokenInstance.defaults.adapter = authAdapter;

    refreshMock.mockRejectedValue(new Error("REFRESH_TOKEN_USER_NOT_FOUND"));

    const request = tokenInstance.get("/users");
    const assertion = expect(request).rejects.toMatchObject({
      isRefreshError: true,
    });
    await vi.advanceTimersByTimeAsync(3500);

    await assertion;
    expect(location.href).toBe("/logout");
    // 로그아웃 리다이렉트 전 로컬스토리지 토큰이 동기 소거되었는지 검증
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });

  it("403 Forbidden 에러 발생 시 토큰 리프레시를 시도하지 않고 즉시 에러를 반환한다", async () => {
    const { default: tokenInstance } = await import("../tokenInstance");
    tokenInstance.defaults.adapter = async (config) => {
      const error = Object.assign(new Error("Forbidden"), {
        config,
        response: { status: 403, data: { message: "권한이 없습니다." } },
        isAxiosError: true,
      });
      throw error;
    };

    await expect(tokenInstance.get("/users")).rejects.toMatchObject({
      response: { status: 403 },
    });
    // 403은 인가 에러이므로 리프레시를 시도하지 않아야 한다
    expect(refreshMock).not.toHaveBeenCalled();
    expect(location.href).toBe("");
  });
});

describe("앱 웹뷰에서 네이티브에 재발급을 맡기는 처리", () => {
  let location: { href: string };
  let listeners: Array<(e: MessageEvent) => void>;
  let postMessage: ReturnType<typeof vi.fn>;

  // 네이티브가 requestTokenRefresh에 같은 id로 응답하는 것을 흉내 낸다.
  const replyFromNative = (value: unknown) => {
    const request = JSON.parse(postMessage.mock.calls[0][0]);
    const data = JSON.stringify({ event: "tokenRefreshResult", value, v: 1, id: request.id });
    listeners.forEach((listener) => listener({ data } as MessageEvent));
  };

  beforeEach(() => {
    vi.resetModules();
    refreshMock.mockReset();
    setTokenInfoMock.mockReset();
    // 실제 스토어처럼 localStorage에도 쓴다. 재시도 요청은 요청 인터셉터가 여기서 토큰을 읽는다.
    setTokenInfoMock.mockImplementation((tokenInfo: { accessToken: string; refreshToken: string }) => {
      localStorage.setItem("accessToken", tokenInfo.accessToken);
      localStorage.setItem("refreshToken", tokenInfo.refreshToken);
    });
    location = { href: "" };
    listeners = [];
    postMessage = vi.fn();
    vi.stubGlobal("localStorage", createMemoryStorage());
    vi.stubGlobal("window", {
      location,
      localStorage,
      dispatchEvent: vi.fn(),
      ReactNativeWebView: { postMessage },
      __unidormNativeFeatures: ["share", "tokenRefresh"],
      addEventListener: (_: string, listener: (e: MessageEvent) => void) =>
        listeners.push(listener),
      removeEventListener: (_: string, listener: (e: MessageEvent) => void) => {
        listeners = listeners.filter((l) => l !== listener);
      },
    });
    vi.stubGlobal("document", { addEventListener: vi.fn(), removeEventListener: vi.fn() });
    localStorage.setItem("accessToken", "expired_access");
    localStorage.setItem("refreshToken", "old_refresh");
    localStorage.setItem("role", "ROLE_USER");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("네이티브가 재발급한 토큰으로 재시도하고 직접 재발급하지 않는다", async () => {
    const { default: tokenInstance } = await import("../tokenInstance");
    tokenInstance.defaults.adapter = authAdapter;
    postMessage.mockImplementation(() =>
      queueMicrotask(() =>
        replyFromNative({
          status: "ok",
          accessToken: VALID_ACCESS_TOKEN,
          refreshToken: "rotated_refresh",
          role: "ROLE_USER",
        }),
      ),
    );

    const response = await tokenInstance.get("/users");

    expect(response.status).toBe(200);
    expect(refreshMock).not.toHaveBeenCalled();
    expect(JSON.parse(postMessage.mock.calls[0][0])).toMatchObject({
      event: "requestTokenRefresh",
      value: { refreshToken: "old_refresh" },
    });
    expect(setTokenInfoMock).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: VALID_ACCESS_TOKEN }),
      { fromNative: true },
    );
  });

  it("네이티브가 응답하지 않으면 직접 재발급한다", async () => {
    vi.useFakeTimers();
    const { default: tokenInstance } = await import("../tokenInstance");
    tokenInstance.defaults.adapter = authAdapter;
    refreshMock.mockResolvedValue({
      accessToken: VALID_ACCESS_TOKEN,
      refreshToken: "rotated_refresh",
      role: "ROLE_USER",
    });

    const request = tokenInstance.get("/users");
    await vi.advanceTimersByTimeAsync(10_500);

    await expect(request).resolves.toMatchObject({ status: 200 });
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("tokenRefresh 기능이 없는 셸(구버전 앱)에서는 바로 직접 재발급한다", async () => {
    (window as unknown as { __unidormNativeFeatures: string[] }).__unidormNativeFeatures = ["share"];
    const { default: tokenInstance } = await import("../tokenInstance");
    tokenInstance.defaults.adapter = authAdapter;
    refreshMock.mockResolvedValue({
      accessToken: VALID_ACCESS_TOKEN,
      refreshToken: "rotated_refresh",
      role: "ROLE_USER",
    });

    await expect(tokenInstance.get("/users")).resolves.toMatchObject({ status: 200 });
    expect(postMessage).not.toHaveBeenCalledWith(
      expect.stringContaining("requestTokenRefresh"),
    );
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
