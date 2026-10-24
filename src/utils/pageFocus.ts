import type { QueryClient } from "@tanstack/react-query";
import { appBridge } from "@/utils/appBridgeAdapter";
import {
  openMultiWebViewChannel,
  type MultiWebViewChannel,
} from "@/utils/multiWebViewChannel";

/**
 * 멀티 웹뷰 화면 복귀 시 재조회.
 *
 * 앱에서는 메인 탭이 아닌 화면마다 별도 웹뷰(별도 JS 런타임·QueryClient)가
 * 뜹니다. 그래서 위 웹뷰에서 글을 작성/삭제하고 돌아와도, 아래 웹뷰는 마운트된
 * 채 예전 데이터를 들고 있고 브라우저 focus 이벤트도 받지 못합니다. 네이티브가
 * 위 웹뷰를 닫은 뒤 보내는 `pageFocus` 신호로 화면 데이터를 다시 조회합니다.
 *
 *  - React Query: 화면에 떠 있는(active) 쿼리를 무효화해 재조회합니다. 기존
 *    데이터를 유지한 채 교체되므로 로딩 스피너/레이아웃 이동이 없습니다.
 *    거의 바뀌지 않는 쿼리는 `meta: { refetchOnPageFocus: false }` 로 제외합니다.
 *  - useEffect 로 직접 조회하는 화면: `usePageFocus` 로 콜백을 등록합니다.
 *    이 콜백은 로딩 상태를 켜지 않는 "조용한" 재조회여야 합니다.
 *
 * 조회 자체에 부수효과가 있는 화면(공지·공동구매 상세는 조회할 때마다 서버
 * 조회수가 오름)은 매번 재조회하면 안 됩니다. 이런 화면은 `usePageFocus` 에
 * `onlyIfChanged` 로 데이터 종류를 지정하고, 그 데이터를 바꾸는 화면은 저장 후
 * `notifyDataChanged` 를 호출합니다. 그러면 실제로 바뀐 경우에만 재조회합니다.
 */

/** `notifyDataChanged` / `onlyIfChanged` 에 쓰는 데이터 종류. */
export type DataDomain = "announcement" | "groupPurchase";

type PageFocusListener = (changed: ReadonlySet<DataDomain>) => void;

const listeners = new Set<PageFocusListener>();
/** 이 웹뷰가 가려져 있는 동안 다른 웹뷰가 알린 변경. 다음 복귀 때 소비됩니다. */
const changedDomains = new Set<DataDomain>();

const DATA_CHANGED_CHANNEL = "unidorm-data-changed";
let dataChangedChannel: MultiWebViewChannel | null = null;

/** 화면 복귀 신호를 구독합니다. 반환값으로 구독을 해제합니다. */
export function subscribePageFocus(listener: PageFocusListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 다른 웹뷰에 `domain` 데이터가 바뀌었음을 알립니다 (저장·삭제 성공 직후 호출). */
export function notifyDataChanged(domain: DataDomain): void {
  dataChangedChannel?.postMessage({ domain });
}

let installed = false;

/** 앱 시작 시 한 번 호출해 네이티브 `pageFocus` 신호를 연결합니다. */
export function installPageFocusRefresh(queryClient: QueryClient): void {
  if (installed) return;
  installed = true;

  dataChangedChannel = openMultiWebViewChannel(DATA_CHANGED_CHANNEL, (data) => {
    const domain = (data as { domain?: DataDomain } | null)?.domain;
    if (domain) changedDomains.add(domain);
  });

  appBridge.onPageFocus(() => {
    void queryClient.invalidateQueries({
      predicate: (query) => query.meta?.refetchOnPageFocus !== false,
    });
    const changed = new Set(changedDomains);
    changedDomains.clear();
    listeners.forEach((listener) => listener(changed));
  });
}
