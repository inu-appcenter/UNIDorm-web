import { useMatches } from "react-router-dom";
import { PageBgType, RouteHandle } from "@/types/layout";

/**
 * 현재 활성화된 라우트 매칭에서 가장 하위의 handle.bg를 반환하는 훅입니다.
 * 지정되지 않은 경우 기본값으로 "gray"를 반환합니다.
 */
export const useCurrentRouteBg = (): PageBgType => {
  const matches = useMatches();
  const currentMatch = [...matches]
    .reverse()
    .find((m) => (m.handle as RouteHandle | undefined)?.bg);

  return (currentMatch?.handle as RouteHandle | undefined)?.bg ?? "gray";
};

export default useCurrentRouteBg;
