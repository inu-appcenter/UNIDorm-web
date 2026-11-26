import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkPortalAccountLinked,
  isExtensionAgentEnvironment,
  isMobileAppEnvironment,
  isPortalAgentAvailable,
} from "../mobileAgentBridge";

type Listener = (event: unknown) => void;

interface MockExtensionRequest {
  channel?: string;
  direction?: string;
  type?: string;
  requestId?: string;
}

interface MockWindowWithWebView {
  ReactNativeWebView?: {
    postMessage: (message: string) => void;
  };
}

describe("mobileAgentBridge transport routing", () => {
  const listeners = new Map<string, Set<Listener>>();
  let postMessageSpy: ReturnType<typeof vi.fn>;
  let dataset: Record<string, string>;

  beforeEach(() => {
    listeners.clear();
    dataset = {};
    postMessageSpy = vi.fn();

    vi.stubGlobal("document", {
      documentElement: { dataset },
    });

    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });

    vi.stubGlobal("window", {
      location: { origin: "https://unidorm.inuappcenter.kr" },
      addEventListener: (type: string, fn: Listener) => {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type)!.add(fn);
      },
      removeEventListener: (type: string, fn: Listener) => {
        listeners.get(type)?.delete(fn);
      },
      postMessage: postMessageSpy,
      ReactNativeWebView: undefined,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false for all agent checks in plain browser", async () => {
    expect(isMobileAppEnvironment()).toBe(false);
    expect(isExtensionAgentEnvironment()).toBe(false);
    expect(isPortalAgentAvailable()).toBe(false);

    const status = await checkPortalAccountLinked();
    expect(status.linked).toBe(false);
  });

  it("routes requests via window.postMessage when Chrome Extension is present", async () => {
    dataset.unidormExtension = "1";

    expect(isMobileAppEnvironment()).toBe(false);
    expect(isExtensionAgentEnvironment()).toBe(true);
    expect(isPortalAgentAvailable()).toBe(true);

    postMessageSpy.mockImplementation((msg: MockExtensionRequest, targetOrigin: string) => {
      expect(targetOrigin).toBe("https://unidorm.inuappcenter.kr");
      expect(msg.channel).toBe("unidorm-portal-agent");
      expect(msg.direction).toBe("web-to-ext");
      expect(msg.type).toBe("checkPortalAccount");

      const msgListeners = listeners.get("message") || new Set();
      for (const fn of msgListeners) {
        fn({
          source: globalThis.window,
          origin: "https://unidorm.inuappcenter.kr",
          data: {
            channel: "unidorm-portal-agent",
            direction: "ext-to-web",
            type: "checkPortalAccountResult",
            requestId: msg.requestId,
            success: true,
            data: { linked: true, studentId: "202301234" },
          },
        });
      }
    });

    const status = await checkPortalAccountLinked();
    expect(status).toEqual({ linked: true, studentId: "202301234" });
  });

  it("prefers ReactNativeWebView over extension when running inside mobile app", async () => {
    dataset.unidormExtension = "1";
    const rnPostMessage = vi.fn((raw: string) => {
      const parsed = JSON.parse(raw);
      const customListeners = listeners.get("unidormAgentResult") || new Set();
      for (const fn of customListeners) {
        fn({
          detail: {
            type: "checkPortalAccountResult",
            requestId: parsed.requestId,
            success: true,
            data: { linked: true, studentId: "202499999" },
          },
        });
      }
    });
    (globalThis.window as unknown as MockWindowWithWebView).ReactNativeWebView = {
      postMessage: rnPostMessage,
    };

    expect(isMobileAppEnvironment()).toBe(true);
    const status = await checkPortalAccountLinked();
    expect(status).toEqual({ linked: true, studentId: "202499999" });
    expect(rnPostMessage).toHaveBeenCalledTimes(1);
    expect(postMessageSpy).not.toHaveBeenCalled();
  });
});
