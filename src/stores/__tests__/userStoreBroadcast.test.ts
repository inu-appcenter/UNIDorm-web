import { describe, it, expect, vi, beforeEach } from "vitest";
import { safeLocalStorage } from "../../utils/safeStorage";

describe("멀티 웹뷰 인증 세션 브로드캐스트 동기화 검증", () => {
  beforeEach(() => {
    safeLocalStorage.clear();
    vi.restoreAllMocks();
  });

  it("BroadcastChannel을 통해 tokenInfo 변경이 채널로 전송되어야 한다", async () => {
    const postMessageMock = vi.fn();
    const closeMock = vi.fn();

    class MockBroadcastChannel {
      name: string;
      onmessage: ((event: MessageEvent) => void) | null = null;
      constructor(name: string) {
        this.name = name;
      }
      postMessage = postMessageMock;
      close = closeMock;
    }

    vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);

    // 동적 import로 useUserStore 로드
    const { default: useUserStore } = await import("../useUserStore");
    const { flushAllBroadcastSync } = await import("../middleware/broadcastSync");

    const testToken = {
      accessToken: "test_access_jwt_123",
      refreshToken: "test_refresh_jwt_456",
      role: "ROLE_USER",
    };

    useUserStore.getState().setTokenInfo(testToken);
    flushAllBroadcastSync();

    expect(postMessageMock).toHaveBeenCalled();
    const sentEnvelope = postMessageMock.mock.calls[0][0];
    expect(sentEnvelope.payload).toMatchObject({
      tokenInfo: testToken,
    });
    expect(safeLocalStorage.getItem("accessToken")).toBe("test_access_jwt_123");
  });

  it("네이티브 브릿지 tokenInfoUpdated 수신 시 스토어 및 safeLocalStorage에 반영되어야 한다", async () => {
    const { default: useUserStore } = await import("../useUserStore");
    const { appBridge } = await import("../../utils/appBridgeAdapter");

    const updatedToken = {
      accessToken: "native_updated_access_token",
      refreshToken: "native_updated_refresh_token",
      role: "ROLE_ADMIN",
    };

    let registeredCallback: ((tokenInfo: any) => void) | null = null;
    vi.spyOn(appBridge, "onTokenInfoUpdated").mockImplementation((cb) => {
      registeredCallback = cb;
      return () => {};
    });

    // 콜백 직접 호출 또는 이벤트 시뮬레이션
    appBridge.onTokenInfoUpdated((token) => {
      useUserStore.getState().setTokenInfo(token, { fromNative: true });
    });

    registeredCallback!(updatedToken);

    expect(useUserStore.getState().tokenInfo).toMatchObject(updatedToken);
    expect(safeLocalStorage.getItem("accessToken")).toBe("native_updated_access_token");
    expect(safeLocalStorage.getItem("role")).toBe("ROLE_ADMIN");
  });
});
