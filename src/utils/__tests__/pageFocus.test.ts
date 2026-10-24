import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/** 네이티브 → 웹 메시지를 흉내 낸다 (RN WebView는 문자열 data의 message 이벤트를 쏜다). */
let listeners: ((e: MessageEvent) => void)[] = [];
const fromNative = (message: unknown) => {
  const data = JSON.stringify(message);
  listeners.forEach((listener) => listener({ data } as MessageEvent));
};

/** `relayBroadcastSync` 로 중계된 다른 웹뷰의 메시지를 흉내 낸다. */
const relayedFromOtherWebView = (channel: string, payload: unknown) =>
  fromNative({
    event: "broadcastSyncMessage",
    value: {
      channel,
      payload: { senderId: "other-webview", updatedAt: Date.now(), payload },
    },
    v: 1,
  });

const pageFocus = () => fromNative({ event: "pageFocus", v: 1 });

describe("pageFocus (멀티 웹뷰 화면 복귀 재조회)", () => {
  let postMessage: ReturnType<typeof vi.fn>;
  const sent = () => postMessage.mock.calls.map(([raw]) => JSON.parse(raw as string));

  const load = async () => {
    const pageFocusModule = await import("../pageFocus");
    const queryClient = { invalidateQueries: vi.fn() };
    pageFocusModule.installPageFocusRefresh(queryClient as never);
    return { ...pageFocusModule, queryClient };
  };

  beforeEach(() => {
    vi.resetModules();
    listeners = [];
    postMessage = vi.fn();
    vi.stubGlobal("window", {
      location: { origin: "https://unidorm.test" },
      addEventListener: (_: string, listener: (e: MessageEvent) => void) =>
        listeners.push(listener),
      removeEventListener: (_: string, listener: (e: MessageEvent) => void) => {
        listeners = listeners.filter((l) => l !== listener);
      },
      ReactNativeWebView: { postMessage },
    });
    vi.stubGlobal("document", { addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("복귀 신호에 화면의 쿼리를 무효화하고, 제외 표시된 쿼리는 건너뛴다", async () => {
    const { queryClient } = await load();
    pageFocus();

    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
    const { predicate } = queryClient.invalidateQueries.mock.calls[0][0];
    expect(predicate({ meta: undefined })).toBe(true);
    expect(predicate({ meta: { refetchOnPageFocus: false } })).toBe(false);
  });

  it("구독자는 복귀할 때마다 호출된다", async () => {
    const { subscribePageFocus } = await load();
    const listener = vi.fn();
    const off = subscribePageFocus(listener);

    pageFocus();
    pageFocus();
    off();
    pageFocus();

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("다른 웹뷰가 알린 변경은 다음 복귀 한 번에만 전달된다", async () => {
    const { subscribePageFocus } = await load();
    const listener = vi.fn();
    subscribePageFocus(listener);

    relayedFromOtherWebView("unidorm-data-changed", { domain: "announcement" });
    pageFocus();
    pageFocus();

    expect([...listener.mock.calls[0][0]]).toEqual(["announcement"]);
    expect([...listener.mock.calls[1][0]]).toEqual([]);
  });

  it("변경 알림은 네이티브 중계로 다른 웹뷰에 보낸다", async () => {
    const { notifyDataChanged } = await load();
    notifyDataChanged("groupPurchase");

    const relay = sent().find((m) => m.event === "relayBroadcastSync");
    expect(relay?.value.channel).toBe("unidorm-data-changed");
    expect(relay?.value.payload.payload).toEqual({ domain: "groupPurchase" });
  });
});
