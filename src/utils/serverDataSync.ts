import type { QueryClient } from "@tanstack/react-query";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { appBridge } from "@/utils/appBridgeAdapter";
import {
  openMultiWebViewChannel,
  type MultiWebViewChannel,
} from "@/utils/multiWebViewChannel";

/**
 * 서버 데이터 자동 동기화.
 *
 * 화면 코드는 조회를 `useQuery`(src/queries)로 하고, 쓰기는 평소처럼 API 함수를
 * 호출하기만 하면 됩니다. 캐시 무효화는 여기서 자동으로 처리합니다.
 *
 *  1. 쓰기 감지: axios 인스턴스에서 POST/PUT/PATCH/DELETE 가 성공하면
 *     - 이 웹뷰: 화면에 떠 있는 쿼리를 무효화해 다시 조회합니다.
 *     - 다른 웹뷰: "서버 데이터 바뀜"을 알립니다 (BroadcastChannel + 네이티브 중계).
 *  2. 화면 복귀: 앱은 메인 탭이 아닌 화면마다 별도 웹뷰(별도 JS 런타임·캐시)를
 *     띄우고, 스택 아래 웹뷰는 브라우저 focus 이벤트를 받지 못합니다. 네이티브가
 *     위 웹뷰를 닫은 뒤 보내는 `pageFocus` 를 받았을 때, 그사이 다른 웹뷰에서
 *     쓰기가 있었다면 쿼리를 무효화합니다. 아무것도 안 바꿨으면 요청이 없습니다.
 *
 * 무효화는 기존 데이터를 유지한 채 교체하므로 스피너·레이아웃 이동이 없습니다.
 * 자동 재조회 범위는 쿼리 `meta.sync` 로 조정합니다 (`QuerySyncMode` 참고).
 */

/**
 * 쿼리별 자동 재조회 범위 (`useQuery({ meta: { sync } })`).
 *  - "all" (기본): 어느 웹뷰에서든 쓰기가 일어나면 다시 조회
 *  - "otherWebViews": 다른 웹뷰에서 쓰기가 있었을 때 복귀 시에만 다시 조회.
 *    조회 자체에 부수효과가 있는 API(조회할 때마다 조회수가 오르는 상세 등)용 —
 *    같은 화면의 좋아요·댓글마다 조회수가 오르지 않도록
 *  - "none": 자동으로 다시 조회하지 않음 (외부 데이터, 무작위 추천 등)
 */
export type QuerySyncMode = "all" | "otherWebViews" | "none";

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: { sync?: QuerySyncMode } & Record<string, unknown>;
  }
}

/** 서버 데이터를 바꾸지 않는 쓰기 요청 (토큰 갱신, 푸시 토큰 등록). */
const NON_DATA_WRITES = [/\/users\/refreshToken/, /\/fcm\/token/];
const WRITE_METHODS = new Set(["post", "put", "patch", "delete"]);

const DATA_CHANGED_CHANNEL = "unidorm-server-data-changed";

let queryClientRef: QueryClient | null = null;
let channel: MultiWebViewChannel | null = null;
let changedElsewhere = false;
let flushQueued = false;

function isDataWrite(config?: InternalAxiosRequestConfig): boolean {
  const method = config?.method?.toLowerCase();
  if (!method || !WRITE_METHODS.has(method)) return false;
  const url = config?.url ?? "";
  return !NON_DATA_WRITES.some((pattern) => pattern.test(url));
}

/** 이 웹뷰에서 서버 데이터를 바꾸는 요청이 성공했을 때 (한 틱에 여러 번이면 한 번만 처리). */
function onServerDataWritten(): void {
  if (flushQueued) return;
  flushQueued = true;
  queueMicrotask(() => {
    flushQueued = false;
    channel?.postMessage({ changedAt: Date.now() });
    void queryClientRef?.invalidateQueries({
      predicate: (query) => (query.meta?.sync ?? "all") === "all",
    });
  });
}

/** axios 인스턴스의 쓰기 성공을 감지합니다. API 인스턴스를 만들 때 한 번 호출합니다. */
export function trackServerWrites(instance: AxiosInstance): void {
  instance.interceptors.response.use((response) => {
    if (isDataWrite(response.config)) onServerDataWritten();
    return response;
  });
}

let installed = false;

/** 앱 시작 시 한 번 호출합니다. */
export function installServerDataSync(queryClient: QueryClient): void {
  if (installed) return;
  installed = true;
  queryClientRef = queryClient;

  channel = openMultiWebViewChannel(DATA_CHANGED_CHANNEL, () => {
    changedElsewhere = true;
  });

  appBridge.onPageFocus(() => {
    if (!changedElsewhere) return;
    changedElsewhere = false;
    void queryClient.invalidateQueries({
      predicate: (query) => (query.meta?.sync ?? "all") !== "none",
    });
  });
}
