import { useEffect } from "react";
import useAIChatStore from "@/stores/useAIChatStore";

interface AIChatConfig {
  isVisible?: boolean;
  shouldAnimate?: boolean;
}

export const useSetAIChat = (config: AIChatConfig) => {
  const setChatConfig = useAIChatStore((state) => state.setChatConfig);
  const resetChatConfig = useAIChatStore((state) => state.resetChatConfig);

  useEffect(() => {
    /* 전역 스토어에 설정 주입 */
    setChatConfig(config);
  }, [config, setChatConfig]);

  useEffect(() => {
    /* 페이지 이탈 시 챗봇 정보 리셋 */
    return () => resetChatConfig();
  }, [resetChatConfig]);
};
