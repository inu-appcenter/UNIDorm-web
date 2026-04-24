import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/utils/mixpanel";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 경로 변경 시 스크롤 초기화
    window.scrollTo(0, 0);
    // 경로 변경 시 페이지 뷰 추적
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
