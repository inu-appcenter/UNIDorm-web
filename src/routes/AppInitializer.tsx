import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "@/ErrorBoundary";
import ScrollToTop from "../components/layout/ScrollToTop";
import { useAppInit } from "@/hooks/useAppInit"; // 이전에 만든 인증/FCM 훅
import AIChatFloatingButton from "@/components/home/AIChatFloatingButton";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

const AppInitializer = () => {
  // 전역 초기화 로직 실행
  useAppInit();
  useFeatureFlags();

  return (
    <ErrorBoundary>
      {/* 1. 스크롤 최상단 이동 보장 */}
      <ScrollToTop />
      {/* 2. 하위 레이아웃/페이지 렌더링 */}
      <Outlet />
      {/* 3. 전역 AI 챗봇 버튼 */}
      <AIChatFloatingButton />
    </ErrorBoundary>
  );
};

export default AppInitializer;
