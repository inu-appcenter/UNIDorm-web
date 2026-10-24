import { useEffect, useRef } from "react";

/**
 * 쿼리 데이터를 폼 상태로 **처음 한 번만** 옮깁니다 (수정 폼 초기값 채우기).
 *
 * 쿼리는 다른 화면에서의 쓰기 후 자동으로 다시 조회될 수 있으므로, 데이터가 바뀔
 * 때마다 폼에 복사하면 사용자가 입력 중인 내용이 덮어써집니다. `key` 가 바뀌면
 * (다른 글을 수정하게 되면) 다시 한 번 옮깁니다.
 */
export function useInitFromQuery<T>(
  data: T | undefined,
  apply: (data: T) => void,
  key: unknown = null,
): void {
  const appliedKeyRef = useRef<{ key: unknown } | null>(null);
  const applyRef = useRef(apply);
  useEffect(() => {
    applyRef.current = apply;
  });

  useEffect(() => {
    if (data === undefined) return;
    if (appliedKeyRef.current && Object.is(appliedKeyRef.current.key, key)) return;
    appliedKeyRef.current = { key };
    applyRef.current(data);
  }, [data, key]);
}
