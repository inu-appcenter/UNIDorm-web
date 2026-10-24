import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import type { QueryClient } from "@tanstack/react-query";
import { appBridge } from "../appBridgeAdapter";
import * as multiWebViewChannel from "../multiWebViewChannel";
import {
  installServerDataSync,
  trackServerWrites,
  _resetServerDataSyncForTest,
} from "../serverDataSync";

describe("serverDataSync", () => {
  let mockQueryClient: {
    invalidateQueries: ReturnType<typeof vi.fn>;
  };
  let pageFocusHandler: (() => void) | null = null;
  let broadcastHandler: ((data: unknown) => void) | null = null;
  let postMessageMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    _resetServerDataSyncForTest();
    pageFocusHandler = null;
    broadcastHandler = null;
    postMessageMock = vi.fn();

    mockQueryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(appBridge, "onPageFocus").mockImplementation((cb: () => void) => {
      pageFocusHandler = cb;
      return () => {
        pageFocusHandler = null;
      };
    });

    vi.spyOn(multiWebViewChannel, "openMultiWebViewChannel").mockImplementation(
      (_name: string, cb: (data: unknown) => void) => {
        broadcastHandler = cb;
        return {
          postMessage: postMessageMock,
          close: vi.fn(),
        };
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const flushTasks = () => new Promise((resolve) => setTimeout(resolve, 10));

  describe("trackServerWrites", () => {
    it("POST 성공 시 sync: 'all' 쿼리를 무효화하고 채널에 변경을 브로드캐스트한다", async () => {
      const instance = axios.create();

      installServerDataSync(mockQueryClient as unknown as QueryClient);
      trackServerWrites(instance);

      const responseInterceptor = (instance.interceptors.response as any).handlers[0].fulfilled;
      responseInterceptor({
        config: { method: "post", url: "/roommates/rules" },
        data: {},
        status: 200,
      });

      await flushTasks();

      expect(postMessageMock).toHaveBeenCalledTimes(1);
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(1);

      const predicate = mockQueryClient.invalidateQueries.mock.calls[0][0].predicate;
      expect(predicate({ meta: { sync: "all" } })).toBe(true);
      expect(predicate({ meta: {} })).toBe(true);
      expect(predicate({ meta: { sync: "otherWebViews" } })).toBe(false);
      expect(predicate({ meta: { sync: "none" } })).toBe(false);
    });

    it("PUT / PATCH / DELETE 요청 성공 시에도 무효화한다", async () => {
      const instance = axios.create();

      installServerDataSync(mockQueryClient as unknown as QueryClient);
      trackServerWrites(instance);

      const responseInterceptor = (instance.interceptors.response as any).handlers[0].fulfilled;

      responseInterceptor({
        config: { method: "delete", url: "/roommates/1" },
        data: {},
        status: 200,
      });

      await flushTasks();
      expect(postMessageMock).toHaveBeenCalledTimes(1);
    });

    it("GET 요청 성공 시에는 무효화하지 않는다", async () => {
      const instance = axios.create();

      installServerDataSync(mockQueryClient as unknown as QueryClient);
      trackServerWrites(instance);

      const responseInterceptor = (instance.interceptors.response as any).handlers[0].fulfilled;
      responseInterceptor({
        config: { method: "get", url: "/roommates" },
        data: [],
        status: 200,
      });

      await flushTasks();
      expect(postMessageMock).not.toHaveBeenCalled();
      expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled();
    });

    it("토큰 갱신 및 FCM 토큰 등 비데이터 쓰기 요청은 무효화하지 않는다", async () => {
      const instance = axios.create();

      installServerDataSync(mockQueryClient as unknown as QueryClient);
      trackServerWrites(instance);

      const responseInterceptor = (instance.interceptors.response as any).handlers[0].fulfilled;

      responseInterceptor({
        config: { method: "post", url: "/users/refreshToken" },
        data: {},
        status: 200,
      });

      responseInterceptor({
        config: { method: "post", url: "/fcm/token" },
        data: {},
        status: 200,
      });

      await flushTasks();
      expect(postMessageMock).not.toHaveBeenCalled();
      expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled();
    });

    it("한 틱(microtask)에 여러 쓰기가 발생해도 1회만 디바운스하여 무효화한다", async () => {
      const instance = axios.create();

      installServerDataSync(mockQueryClient as unknown as QueryClient);
      trackServerWrites(instance);

      const responseInterceptor = (instance.interceptors.response as any).handlers[0].fulfilled;

      responseInterceptor({
        config: { method: "post", url: "/roommates" },
        data: {},
      });
      responseInterceptor({
        config: { method: "put", url: "/roommates/1" },
        data: {},
      });
      responseInterceptor({
        config: { method: "patch", url: "/roommates/2" },
        data: {},
      });

      await flushTasks();

      expect(postMessageMock).toHaveBeenCalledTimes(1);
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(1);
    });
  });

  describe("화면 복귀 (pageFocus) 및 다른 웹뷰 변경 감지", () => {
    it("다른 웹뷰에서 쓰기가 없었을 때는 pageFocus 시 아무 쿼리도 무효화하지 않는다", async () => {
      installServerDataSync(mockQueryClient as unknown as QueryClient);

      expect(pageFocusHandler).not.toBeNull();
      pageFocusHandler!();

      expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled();
    });

    it("다른 웹뷰에서 쓰기가 발생한 후 pageFocus 시 sync !== 'none'인 쿼리를 모두 무효화한다", async () => {
      installServerDataSync(mockQueryClient as unknown as QueryClient);

      expect(broadcastHandler).not.toBeNull();
      broadcastHandler!({ changedAt: Date.now() });

      expect(pageFocusHandler).not.toBeNull();
      pageFocusHandler!();

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(1);
      const predicate = mockQueryClient.invalidateQueries.mock.calls[0][0].predicate;

      expect(predicate({ meta: { sync: "all" } })).toBe(true);
      expect(predicate({ meta: { sync: "otherWebViews" } })).toBe(true);
      expect(predicate({ meta: {} })).toBe(true);
      expect(predicate({ meta: { sync: "none" } })).toBe(false);

      mockQueryClient.invalidateQueries.mockClear();
      pageFocusHandler!();
      expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled();
    });
  });
});
