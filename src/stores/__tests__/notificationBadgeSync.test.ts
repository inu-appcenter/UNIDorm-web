import { describe, it, expect, vi, beforeEach } from "vitest";
import { safeLocalStorage } from "../../utils/safeStorage";

vi.mock("../../utils/mixpanel", () => ({
  identifyUser: vi.fn(),
  mixpanelTrack: vi.fn(),
}));

describe("알림 배지(hasUnreadNotifications) 동기화 및 해제 검증", () => {
  beforeEach(() => {
    safeLocalStorage.clear();
    vi.restoreAllMocks();
  });

  it("clearUnreadNotifications 호출 시 hasUnreadNotifications가 false로 변경되고 스토리지와 브로드캐스트에 반영되어야 한다", async () => {
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

    const { default: useUserStore } = await import("../useUserStore");
    const { flushAllBroadcastSync } = await import("../middleware/broadcastSync");

    // 초기 상태: hasUnreadNotifications = true 설정
    useUserStore.getState().setUserInfo({
      id: 1,
      name: "홍길동",
      studentNumber: "202612345",
      dormType: "기숙사1",
      college: "정보기술대학",
      reportedCount: 0,
      hasTimeTableImage: false,
      hasUnreadNotifications: true,
      termsAgreed: true,
      privacyAgreed: true,
      roommateCheckList: true,
    });
    flushAllBroadcastSync();
    postMessageMock.mockClear();

    expect(useUserStore.getState().userInfo.hasUnreadNotifications).toBe(true);

    // clearUnreadNotifications 호출
    useUserStore.getState().clearUnreadNotifications();
    flushAllBroadcastSync();

    // 상태 검증
    expect(useUserStore.getState().userInfo.hasUnreadNotifications).toBe(false);

    // safeLocalStorage 검증
    const stored = JSON.parse(safeLocalStorage.getItem("userInfo") || "{}");
    expect(stored.hasUnreadNotifications).toBe(false);

    // 브로드캐스트 검증
    expect(postMessageMock).toHaveBeenCalled();
    const sentEnvelope = postMessageMock.mock.calls[0][0];
    expect(sentEnvelope.payload.userInfo.hasUnreadNotifications).toBe(false);
  });

  it("이미 hasUnreadNotifications가 false인 경우 clearUnreadNotifications 호출 시 불필요한 브로드캐스트를 방지해야 한다", async () => {
    const postMessageMock = vi.fn();

    class MockBroadcastChannel {
      name: string;
      onmessage: ((event: MessageEvent) => void) | null = null;
      constructor(name: string) {
        this.name = name;
      }
      postMessage = postMessageMock;
      close = vi.fn();
    }

    vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);

    const { default: useUserStore } = await import("../useUserStore");
    const { flushAllBroadcastSync } = await import("../middleware/broadcastSync");

    // 이미 false 상태
    useUserStore.getState().setUserInfo({
      id: 1,
      name: "홍길동",
      studentNumber: "202612345",
      dormType: "기숙사1",
      college: "정보기술대학",
      reportedCount: 0,
      hasTimeTableImage: false,
      hasUnreadNotifications: false,
      termsAgreed: true,
      privacyAgreed: true,
      roommateCheckList: true,
    });
    flushAllBroadcastSync();
    postMessageMock.mockClear();

    // 재호출 시 상태 참조 및 전송 없음
    const prevUserInfo = useUserStore.getState().userInfo;
    useUserStore.getState().clearUnreadNotifications();
    flushAllBroadcastSync();

    expect(useUserStore.getState().userInfo).toBe(prevUserInfo);
    expect(postMessageMock).not.toHaveBeenCalled();
  });
});
