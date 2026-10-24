import { useEffect, useRef } from "react";
import { subscribePageFocus, type DataDomain } from "@/utils/pageFocus";

interface UsePageFocusOptions {
  /**
   * 지정하면 이 웹뷰가 가려져 있는 동안 다른 웹뷰가 이 데이터의 변경을 알린
   * 경우(`notifyDataChanged`)에만 호출합니다. 조회에 부수효과(조회수 증가 등)가
   * 있는 화면용입니다.
   */
  onlyIfChanged?: DataDomain;
}

/**
 * 이 웹뷰가 다시 화면 맨 위로 올라왔을 때(위의 서브 웹뷰가 닫힘) `onFocus`를
 * 호출합니다. useEffect 로 직접 조회하는 화면의 재조회용이며, 콜백은 로딩
 * 스피너를 켜지 않고 데이터만 교체해야 합니다 (목록이 사라졌다 나타나지 않도록).
 */
export function usePageFocus(
  onFocus: () => void,
  { onlyIfChanged }: UsePageFocusOptions = {},
): void {
  const onFocusRef = useRef(onFocus);
  useEffect(() => {
    onFocusRef.current = onFocus;
  });

  useEffect(
    () =>
      subscribePageFocus((changed) => {
        if (onlyIfChanged && !changed.has(onlyIfChanged)) return;
        onFocusRef.current();
      }),
    [onlyIfChanged],
  );
}
