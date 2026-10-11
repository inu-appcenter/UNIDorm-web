import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/ErrorBoundary";
import ScrollToTop from "../components/layout/ScrollToTop";
import { useAppInit } from "@/hooks/useAppInit";
import AIChatFloatingButton from "@/components/home/AIChatFloatingButton";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { PATHS } from "@/constants/paths";
import { setScreenCapturePrevented } from "@/apis/mobileAgentBridge";

const AppInitializer = () => {
  const location = useLocation();

  // 전역 초기화 로직 실행
  useAppInit();
  useFeatureFlags();

  // 사생증 화면 이외의 페이지로 이동 시 화면 캡처 방지(FLAG_SECURE) 자동 해제 가드
  useEffect(() => {
    if (location.pathname !== PATHS.DORMITORY_CARD) {
      setScreenCapturePrevented(false);
    }
  }, [location.pathname]);

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
