import { useEffect } from "react";
import useHeaderStore from "@/stores/useHeaderStore";
import { HeaderConfig } from "@/types/header";

export const useSetHeader = (config: HeaderConfig) => {
  const setHeader = useHeaderStore((state) => state.setHeader);
  const resetHeader = useHeaderStore((state) => state.resetHeader);

  useEffect(() => {
    /* 전역 스토어에 설정 주입 */
    setHeader(config);
  }, [config, setHeader]);

  useEffect(() => {
    /* 페이지 이탈 시 헤더 정보 리셋 */
    return () => resetHeader();
  }, [resetHeader]);
};
